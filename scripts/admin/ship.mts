// npm run admin:ship -- VAL-1051 --transportadora "Inter Rapidísimo" --guia "<número>" [--nota "..."]
// npm run admin:ship -- VAL-1051 --transportadora "..." --sin-guia --nota "motivo real, sin guía"
// npm run admin:ship -- VAL-1051 --transportadora "Otra" --guia "..." --cambio-transportadora-autorizado --nota "coordinado con el cliente..."
// npm run admin:ship -- VAL-1051 --corregir-guia "240012345679"
//
// P0-B4a. Registra el despacho de un pedido PAGADO: order_status = 'shipped',
// shipped_at = now(), transportadora final, guía (si existe) y nota.
// NUNCA toca el valor de envío cotizado/aceptado (shipping_quote_*,
// accepted_shipping_amount, quote_version, accepted_at).
//
// FASE A (sin transacción): muestra el pedido y pide escribir VAL-XXXX.
// FASE B (solo tras confirmar): transacción corta con FOR UPDATE; si el
//   pedido cambió desde la fase A, ROLLBACK y hay que volver a ejecutar.

import { parseArgs } from "node:util";
import {
  DELIVERY_MODE_LABELS,
  formatDateTimeCO,
  type DeliveryMode,
} from "../../src/data/shipping.ts";
import {
  cleanText,
  confirmByTyping,
  createPool,
  describeError,
  exitWith,
  foldText,
  formatCOP,
  loadEnv,
  siteOrigin,
} from "./shared.mts";

const MAX_CARRIER = 60;
const MAX_NOTE = 300;
const TRACKING_PLACEHOLDERS = [
  "n/a",
  "na",
  "sin guia",
  "ninguna",
  "ninguno",
  "no aplica",
  "pendiente",
];

function readArgs() {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        transportadora: { type: "string" },
        guia: { type: "string" },
        "sin-guia": { type: "boolean" },
        nota: { type: "string" },
        "cambio-transportadora-autorizado": { type: "boolean" },
        "corregir-guia": { type: "string" },
      },
    });
  } catch (err) {
    return exitWith(
      `Argumentos inválidos (${err instanceof Error ? err.message : "error"}).\n` +
        'Uso: npm run admin:ship -- VAL-XXXX --transportadora "…" --guia "…" [--nota "…"]',
    );
  }
}
const args = readArgs();

const orderNumber = (args.positionals[0] ?? "").trim().toUpperCase();
if (!/^VAL-\d+$/.test(orderNumber)) exitWith("Indica el número del pedido, p. ej. VAL-1051.");

/** Guía real: 3–60 caracteres, con algún dígito 1-9 o letra, sin rellenos. */
function validTracking(raw: string | undefined, flag: string): string {
  const t = cleanText(raw);
  if (!t) exitWith(`${flag} no puede estar vacía.`);
  const folded = foldText(t);
  if (
    t.length < 3 ||
    t.length > 60 ||
    !/[1-9A-Za-z]/.test(t) ||
    TRACKING_PLACEHOLDERS.includes(folded)
  ) {
    exitWith(
      `${flag} no parece una guía real (3 a 60 caracteres, no "N/A", "sin guía", "0000"…). Si no hay guía, usa --sin-guia con --nota.`,
    );
  }
  return t;
}

const correction = args.values["corregir-guia"];
const isCorrection = correction !== undefined;
if (isCorrection) {
  const others = ["transportadora", "guia", "sin-guia", "nota", "cambio-transportadora-autorizado"] as const;
  if (others.some((k) => args.values[k] !== undefined)) {
    exitWith("--corregir-guia se usa solo, sin otras opciones: cambia únicamente la guía.");
  }
}

const correctedTracking = isCorrection ? validTracking(correction, "--corregir-guia") : null;
const carrier = isCorrection ? null : cleanText(args.values.transportadora);
const withoutTracking = args.values["sin-guia"] === true;
const note = isCorrection ? null : cleanText(args.values.nota);
const carrierChangeAuthorized = args.values["cambio-transportadora-autorizado"] === true;
let tracking: string | null = null;

if (!isCorrection) {
  if (!carrier || carrier.length > MAX_CARRIER) {
    exitWith(`--transportadora es obligatoria (1 a ${MAX_CARRIER} caracteres).`);
  }
  if (withoutTracking && args.values.guia !== undefined) {
    exitWith("Usa --guia o --sin-guia, no ambos.");
  }
  if (!withoutTracking) {
    if (args.values.guia === undefined) {
      exitWith('Falta --guia "…". Si esta entrega legítimamente no tiene guía, usa --sin-guia con --nota.');
    }
    tracking = validTracking(args.values.guia, "--guia");
  } else if (!note) {
    exitWith("--sin-guia exige --nota explicando la entrega (p. ej. cómo y dónde se entrega).");
  }
  if (note && note.length > MAX_NOTE) exitWith(`--nota admite máximo ${MAX_NOTE} caracteres.`);
  if (carrierChangeAuthorized && !note) {
    exitWith("--cambio-transportadora-autorizado exige --nota indicando cómo se coordinó/autorizó con el cliente.");
  }
}

loadEnv();
const pool = createPool();

interface Snapshot {
  id: string;
  order_number: string;
  payment_status: string;
  order_status: string;
  quote_status: string | null;
  paid_at: Date | null;
  shipped_at: Date | null;
  shipping_carrier_final: string | null;
  tracking_number: string | null;
  shipping_quote_carrier: string | null;
  accepted_shipping_amount: number | null;
  delivery_mode: DeliveryMode | null;
  city: string;
  address: string | null;
  address_line2: string | null;
  pickup_office_preference: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

const SNAPSHOT_SQL = `
  SELECT id, order_number, payment_status, order_status, quote_status, paid_at,
         shipped_at, shipping_carrier_final, tracking_number,
         shipping_quote_carrier, accepted_shipping_amount, delivery_mode, city,
         address, address_line2, pickup_office_preference, customer_name,
         customer_phone, customer_email
  FROM orders`;

const GUARDED: (keyof Snapshot)[] = [
  "payment_status",
  "order_status",
  "paid_at",
  "shipped_at",
  "shipping_carrier_final",
  "tracking_number",
  "shipping_quote_carrier",
  "delivery_mode",
  "city",
  "address",
  "address_line2",
  "pickup_office_preference",
];
const same = (a: unknown, b: unknown) =>
  a instanceof Date && b instanceof Date ? +a === +b : a === b;

async function lockAndCheck(
  client: import("pg").PoolClient,
  before: Snapshot,
): Promise<void> {
  const lock = await client.query<Snapshot>(`${SNAPSHOT_SQL} WHERE id = $1 FOR UPDATE`, [before.id]);
  const now = lock.rows[0];
  if (!now || GUARDED.some((f) => !same(now[f], before[f]))) {
    await client.query("ROLLBACK");
    exitWith("\nEl pedido cambió mientras lo revisabas. Ejecuta admin:ship nuevamente.");
  }
}

async function runCorrection(before: Snapshot) {
  if (before.order_status !== "shipped") {
    exitWith(`${before.order_number} no está despachado: --corregir-guia solo aplica a pedidos despachados.`);
  }
  console.log(`\nPedido ${before.order_number} — corrección de guía`);
  console.log(`  Transportadora:  ${before.shipping_carrier_final} (no cambia)`);
  console.log(`  Despachado:      ${formatDateTimeCO(before.shipped_at!)} (no cambia)`);
  console.log(`  Guía actual:     ${before.tracking_number ?? "— (sin guía)"}`);
  console.log(`  Guía nueva:      ${correctedTracking}`);
  const ok = await confirmByTyping(before.order_number, "¿Corregir SOLO el número de guía?");
  if (!ok) {
    console.log("Confirmación incorrecta: no se guardó nada.");
    return;
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await lockAndCheck(client, before);
    await client.query(
      `UPDATE orders SET tracking_number = $2, updated_at = now()
       WHERE id = $1 AND order_status = 'shipped'`,
      [before.id, correctedTracking],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
  console.log(`\n✓ ${before.order_number}: guía corregida a ${correctedTracking}. Nada más cambió.`);
}

async function runShipment(before: Snapshot) {
  if (before.order_status === "shipped") {
    exitWith(`${before.order_number} ya está despachado. Para corregir la guía usa --corregir-guia.`);
  }
  if (before.payment_status !== "paid") {
    exitWith(`${before.order_number}: el pago no está verificado (estado ${before.payment_status}). Solo se despachan pedidos pagados.`);
  }
  // 'preparing' = pagado con admin:paid; 'received' = pagado histórico (antes de B4a).
  if (before.order_status !== "preparing" && before.order_status !== "received") {
    exitWith(`${before.order_number}: estado de pedido inesperado (${before.order_status}). Revísalo manualmente.`);
  }

  const accepted = before.shipping_quote_carrier;
  const carrierDiffers = accepted !== null && foldText(accepted) !== foldText(carrier!);
  if (carrierDiffers && !carrierChangeAuthorized) {
    exitWith(
      `\nLa transportadora final es distinta de la aceptada por el cliente.\n` +
        `  Aceptada: ${accepted}\n  Final:    ${carrier}\n` +
        "Solo si el cambio fue coordinado y autorizado con el cliente, repite con --cambio-transportadora-autorizado y --nota explicándolo. El valor de envío aceptado no cambia.",
    );
  }

  const mode = before.delivery_mode;
  console.log(`\nPedido ${before.order_number} — despacho`);
  console.log(
    `  Pago verificado:  ${before.paid_at ? formatDateTimeCO(before.paid_at) : "sí (histórico, sin fecha registrada)"}`,
  );
  if (mode) console.log(`  Modalidad:        ${DELIVERY_MODE_LABELS[mode]}`);
  console.log(`  Ciudad:           ${before.city}`);
  if (mode === "oficina") {
    console.log(`  Oficina pedida:   ${before.pickup_office_preference ?? "sin preferencia"}`);
  } else {
    console.log(`  Dirección:        ${before.address ?? "—"}${before.address_line2 ? `, ${before.address_line2}` : ""}`);
  }
  console.log(`  Transp. aceptada: ${accepted ?? "— (pedido histórico sin cotización)"}`);
  console.log(`  Transp. final:    ${carrier}${carrierDiffers ? "  ⚠ DISTINTA — cambio declarado como autorizado" : ""}`);
  console.log(`  Guía:             ${tracking ?? "— SIN GUÍA"}`);
  console.log(`  Nota:             ${note ?? "(sin nota)"}`);
  if (before.accepted_shipping_amount !== null) {
    console.log(`  Envío aceptado:   ${formatCOP(before.accepted_shipping_amount)} (no cambia; se paga al recibir)`);
  }

  const prompt = withoutTracking
    ? "Vas a registrar el despacho SIN número de guía. ¿Confirmas que esta entrega legítimamente no genera guía?"
    : "¿Registrar el despacho con estos datos?";
  const ok = await confirmByTyping(before.order_number, prompt);
  if (!ok) {
    console.log("Confirmación incorrecta: no se guardó nada.");
    return;
  }

  const client = await pool.connect();
  let shippedAt: Date | null = null;
  try {
    await client.query("BEGIN");
    await lockAndCheck(client, before);
    const upd = await client.query<{ shipped_at: Date }>(
      `UPDATE orders
       SET order_status = 'shipped',
           shipped_at = now(),
           shipping_carrier_final = $2,
           tracking_number = $3,
           shipment_note = $4,
           updated_at = now()
       WHERE id = $1
         AND payment_status = 'paid'
         AND order_status IN ('preparing', 'received')
       RETURNING shipped_at`,
      [before.id, carrier, tracking, note],
    );
    if (upd.rowCount !== 1) {
      await client.query("ROLLBACK");
      exitWith("\nEl pedido cambió mientras lo revisabas. Ejecuta admin:ship nuevamente.");
    }
    await client.query("COMMIT");
    shippedAt = upd.rows[0].shipped_at;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  const { origin, warning } = siteOrigin();
  const path = `/pedido/${before.id}`;
  const link = origin ? `${origin}${path}` : path;
  const firstName = before.customer_name.trim().split(/\s+/)[0];

  console.log(`\n✓ ${before.order_number}: despachado el ${formatDateTimeCO(shippedAt!)}.`);
  console.log(`  Enlace del pedido: ${link}`);
  if (warning) console.log(`  Aviso: ${warning}`);
  console.log("\nMensaje listo para copiar y enviar al cliente:");
  console.log("----------------------------------------------------------------");
  const lines = [
    `Hola ${firstName}, despachamos tu pedido ${before.order_number} con ${carrier}.`,
    tracking ? `Número de guía: ${tracking}.` : null,
    note ? note : null,
    before.accepted_shipping_amount !== null
      ? `El envío (${formatCOP(before.accepted_shipping_amount)}) se paga a la transportadora al recibir.`
      : "El envío se paga a la transportadora al recibir.",
    `Puedes ver el estado aquí: ${link}`,
  ].filter(Boolean);
  console.log(lines.join("\n"));
  console.log("----------------------------------------------------------------");
  console.log("Datos de contacto (solo para esta terminal):");
  console.log(`  Nombre:   ${before.customer_name}`);
  console.log(`  Teléfono: ${before.customer_phone}`);
  console.log(`  Email:    ${before.customer_email}`);
}

async function main() {
  const { rows } = await pool.query<Snapshot>(`${SNAPSHOT_SQL} WHERE order_number = $1`, [orderNumber]);
  const before = rows[0];
  if (!before) exitWith(`No existe el pedido ${orderNumber}.`);
  if (before.order_status === "cancelled") exitWith(`${before.order_number} está cancelado: no se despacha.`);
  if (isCorrection) await runCorrection(before);
  else await runShipment(before);
}

try {
  await main();
} catch (err) {
  console.error(`No se pudo registrar el despacho: ${describeError(err)}.`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
