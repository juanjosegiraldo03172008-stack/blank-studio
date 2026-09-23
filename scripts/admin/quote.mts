// npm run admin:quote -- VAL-1051 --valor 18500 --transportadora "Inter Rapidísimo" [--nota "..."]
//
// Registra la cotización de envío de una solicitud (P0-B3). Solo cotiza
// después de revisar una tarifa real con la transportadora — el sistema no
// tiene tarifas.
//
// FASE A (sin transacción): lee el pedido, muestra los datos actuales y la
//   cotización a guardar, y pide confirmación. Nunca se mantiene un bloqueo
//   mientras se espera la respuesta humana.
// FASE B (solo si se confirma): transacción corta con SELECT ... FOR UPDATE.
//   Si el pedido cambió desde la lectura de la fase A (estado, versión,
//   cancelación o datos de envío), ROLLBACK y hay que volver a ejecutar.

import { parseArgs } from "node:util";
import { createInterface } from "node:readline/promises";
import {
  DEFAULT_CARRIER,
  DELIVERY_MODE_LABELS,
  MAX_QUOTE_NOTE_LENGTH,
  QUOTE_VALIDITY_HOURS,
  formatDateTimeCO,
  type DeliveryMode,
} from "../../src/data/shipping.ts";
import { createPool, describeError, formatCOP, loadEnv } from "./shared.mts";

const MAX_CARRIER_LENGTH = 60;
const MAX_INT = 2_147_483_647;

function exitWith(message: string): never {
  console.error(message);
  process.exit(1);
}

// ---------- Argumentos ----------
function readArgs() {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        valor: { type: "string" },
        transportadora: { type: "string" },
        nota: { type: "string" },
      },
    });
  } catch (err) {
    return exitWith(
      `Argumentos inválidos (${err instanceof Error ? err.message : "error"}).\n` +
        'Uso: npm run admin:quote -- VAL-XXXX --valor 18500 --transportadora "Inter Rapidísimo" [--nota "..."]',
    );
  }
}
const parsed = readArgs();

const orderNumber = (parsed.positionals[0] ?? "").trim().toUpperCase();
if (!/^VAL-\d+$/.test(orderNumber)) {
  exitWith("Indica el número del pedido, p. ej. VAL-1051.");
}

// Entero en pesos: "18500" o "18.500". Se rechazan 0, negativos, decimales
// ("18500,50", "18.5") y cualquier otro formato.
const rawValue = (parsed.values.valor ?? "").trim();
if (!/^(\d{1,3}(\.\d{3})+|\d+)$/.test(rawValue)) {
  exitWith(
    "--valor debe ser un entero en pesos, sin decimales ni signos (p. ej. 18500 o 18.500).",
  );
}
const amount = Number(rawValue.replace(/\./g, ""));
if (!Number.isSafeInteger(amount) || amount <= 0 || amount > MAX_INT) {
  exitWith("--valor debe ser mayor que 0. Nunca se cotiza un envío en $0.");
}

const carrier = (parsed.values.transportadora ?? "").trim().replace(/\s+/g, " ");
if (carrier.length < 1 || carrier.length > MAX_CARRIER_LENGTH) {
  exitWith(
    `--transportadora es obligatoria (1 a ${MAX_CARRIER_LENGTH} caracteres), p. ej. "${DEFAULT_CARRIER}".`,
  );
}

const noteRaw = (parsed.values.nota ?? "").trim().replace(/\s+/g, " ");
const note = noteRaw === "" ? null : noteRaw;
if (note && note.length > MAX_QUOTE_NOTE_LENGTH) {
  exitWith(`--nota admite máximo ${MAX_QUOTE_NOTE_LENGTH} caracteres.`);
}

// ---------- Base de datos ----------
loadEnv();
const pool = createPool();

interface Snapshot {
  id: string;
  order_number: string;
  quote_status: string | null;
  quote_version: number;
  order_status: string;
  payment_status: string;
  delivery_mode: DeliveryMode | null;
  city: string;
  address: string | null;
  address_line2: string | null;
  pickup_office_preference: string | null;
  carrier_preference: string | null;
  subtotal: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

const SNAPSHOT_SQL = `
  SELECT id, order_number, quote_status, quote_version, order_status,
         payment_status, delivery_mode, city, address, address_line2,
         pickup_office_preference, carrier_preference, subtotal,
         customer_name, customer_phone, customer_email
  FROM orders`;

/** Campos que, si cambian entre la fase A y la B, invalidan la confirmación. */
const GUARDED_FIELDS: (keyof Snapshot)[] = [
  "quote_status",
  "quote_version",
  "order_status",
  "payment_status",
  "delivery_mode",
  "city",
  "address",
  "address_line2",
  "pickup_office_preference",
  "carrier_preference",
];

function siteOrigin(): { origin: string | null; warning: string | null } {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) {
    return {
      origin: null,
      warning:
        "SITE_URL no está configurada: se muestra solo la ruta. Configúrala con el origen público del sitio (p. ej. https://tu-dominio).",
    };
  }
  try {
    const u = new URL(raw);
    const okProtocol = u.protocol === "https:" || u.protocol === "http:";
    const bare = u.pathname === "/" && !u.search && !u.hash && !u.username && !u.password;
    if (okProtocol && bare) return { origin: u.origin, warning: null };
  } catch {
    // cae al aviso de abajo
  }
  return {
    origin: null,
    warning:
      "SITE_URL no es un origen http(s) válido (solo protocolo y dominio, sin ruta): se muestra solo la ruta.",
  };
}

async function main() {
  // ---------- FASE A: leer y confirmar (sin transacción ni bloqueo) ----------
  const { rows } = await pool.query<Snapshot>(
    `${SNAPSHOT_SQL} WHERE order_number = $1`,
    [orderNumber],
  );
  const before = rows[0];
  if (!before) exitWith(`No existe el pedido ${orderNumber}.`);
  if (before.quote_status === null) {
    exitWith(`${orderNumber} es un pedido anterior a P0-B3: no usa cotización de envío.`);
  }
  if (before.order_status === "cancelled") {
    exitWith(`${orderNumber} está cancelado: no se cotiza.`);
  }
  if (before.quote_status === "accepted") {
    exitWith(
      `${orderNumber} ya fue aceptado por el cliente: no se recotiza después de aceptar.`,
    );
  }
  if (before.quote_status === "rejected") {
    exitWith(
      `${orderNumber}: el cliente no aceptó la cotización. Espera a que solicite otra opción de envío (volverá a aparecer en admin:pending).`,
    );
  }

  const mode = before.delivery_mode as DeliveryMode;
  console.log(`\nPedido ${before.order_number}`);
  console.log(`  Estado actual:  ${before.quote_status} (versión ${before.quote_version})`);
  if (before.quote_status === "quoted") {
    console.log(
      "  ATENCIÓN: ya tiene una cotización. La nueva la reemplaza e invalida la anterior.",
    );
  }
  console.log(`  Modalidad:      ${DELIVERY_MODE_LABELS[mode]}`);
  console.log(`  Ciudad:         ${before.city}`);
  if (mode === "domicilio") {
    console.log(
      `  Dirección:      ${before.address ?? "—"}${before.address_line2 ? `, ${before.address_line2}` : ""}`,
    );
  } else {
    console.log(`  Oficina:        ${before.pickup_office_preference ?? "sin preferencia"}`);
  }
  console.log(
    `  Transp. pedida: ${before.carrier_preference ?? `sin preferencia (habitual: ${DEFAULT_CARRIER})`}`,
  );
  console.log(`  Prendas:        ${formatCOP(before.subtotal)}`);
  console.log("\nCotización a guardar:");
  console.log(`  Envío:          ${formatCOP(amount)} (se paga al recibir)`);
  console.log(`  Transportadora: ${carrier}`);
  console.log(`  Nota al cliente:${note ? ` ${note}` : " (sin nota)"}`);
  console.log(`  Vigencia:       ${QUOTE_VALIDITY_HOURS} horas desde que confirmes`);
  console.log(
    `  Total informativo para el cliente: ${formatCOP(before.subtotal + amount)} (prendas + envío)`,
  );

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (
    await rl.question("\n¿Guardar esta cotización? (s/n): ").catch(() => "")
  )
    .trim()
    .toLowerCase();
  rl.close();
  if (!["s", "si", "sí"].includes(answer)) {
    console.log("Cancelado: no se guardó nada.");
    return;
  }

  // ---------- FASE B: transacción corta con bloqueo ----------
  const client = await pool.connect();
  let committed:
    | { quote_version: number; shipping_quote_expires_at: Date }
    | null = null;
  try {
    await client.query("BEGIN");
    const lockRes = await client.query<Snapshot>(
      `${SNAPSHOT_SQL} WHERE id = $1 FOR UPDATE`,
      [before.id],
    );
    const now = lockRes.rows[0];
    const changed =
      !now || GUARDED_FIELDS.some((f) => now[f] !== before[f]);
    if (changed) {
      await client.query("ROLLBACK");
      exitWith("\nEl pedido cambió mientras lo revisabas. Ejecuta admin:quote nuevamente.");
    }
    const upd = await client.query<{
      quote_version: number;
      shipping_quote_expires_at: Date;
    }>(
      `UPDATE orders
       SET quote_status = 'quoted',
           quote_version = quote_version + 1,
           shipping_quote_amount = $2,
           shipping_quote_carrier = $3,
           shipping_quote_note = $4,
           shipping_quoted_at = now(),
           shipping_quote_expires_at = now() + make_interval(hours => $5),
           updated_at = now()
       WHERE id = $1
       RETURNING quote_version, shipping_quote_expires_at`,
      [before.id, amount, carrier, note, QUOTE_VALIDITY_HOURS],
    );
    await client.query("COMMIT");
    committed = upd.rows[0];
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  if (!committed) return;

  // ---------- Resultado para contactar al cliente manualmente ----------
  const path = `/pedido/${before.id}`;
  const { origin, warning } = siteOrigin();
  const link = origin ? `${origin}${path}` : path;
  const expiresLabel = formatDateTimeCO(committed.shipping_quote_expires_at);
  const firstName = before.customer_name.trim().split(/\s+/)[0];

  console.log(`\n✓ Cotización guardada: ${before.order_number}, versión ${committed.quote_version}.`);
  console.log(`  Vence: ${expiresLabel} (hora de Colombia).`);
  console.log(`  Enlace del pedido: ${link}`);
  if (warning) console.log(`  Aviso: ${warning}`);
  console.log("\nMensaje listo para copiar y enviar al cliente:");
  console.log("----------------------------------------------------------------");
  console.log(
    `Hola ${firstName}, ya cotizamos el envío de tu pedido ${before.order_number}.\n` +
      `Envío con ${carrier} (${DELIVERY_MODE_LABELS[mode].toLowerCase()}): ${formatCOP(amount)}, se paga al recibir.\n` +
      `Revisa el total y acéptalo aquí: ${link}\n` +
      `La cotización es válida hasta el ${expiresLabel} (hora de Colombia).`,
  );
  console.log("----------------------------------------------------------------");
  console.log("Datos de contacto (solo para esta terminal):");
  console.log(`  Nombre:   ${before.customer_name}`);
  console.log(`  Teléfono: ${before.customer_phone}`);
  console.log(`  Email:    ${before.customer_email}`);
}

try {
  await main();
} catch (err) {
  console.error(`No se pudo guardar la cotización: ${describeError(err)}.`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
