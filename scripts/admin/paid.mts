// npm run admin:paid -- VAL-1051 [--nota "Verificado en app Nequi"]
// npm run admin:paid -- VAL-1051 --sin-reporte --metodo nequi|bancolombia [--nota "..."]
//
// P0-B4a. ÚNICA forma de marcar un pedido como pagado. payment_reported solo
// significa que el cliente AFIRMA haber transferido; paid significa que
// VALENCIANO verificó personalmente el ingreso real en su cuenta.
//
// Deja atómicamente: payment_status = 'paid', paid_at = now(),
// order_status = 'preparing' (+ nota opcional).
//
// FASE A (sin transacción): muestra el pedido y pide escribir VAL-XXXX.
// FASE B (solo tras confirmar): transacción corta con FOR UPDATE; si el
//   pedido cambió desde la fase A, ROLLBACK y hay que volver a ejecutar.

import { parseArgs } from "node:util";
import { formatDateTimeCO } from "../../src/data/shipping.ts";
import {
  cleanText,
  confirmByTyping,
  createPool,
  describeError,
  exitWith,
  formatCOP,
  loadEnv,
  looksLikeAccountNumber,
} from "./shared.mts";

const MAX_NOTE = 200;
const NO_REPORT_PREFIX = "Verificado sin reporte del cliente.";
const METHOD_LABELS = { nequi: "Nequi", bancolombia: "Bancolombia" } as const;
type Method = keyof typeof METHOD_LABELS;

function readArgs() {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        nota: { type: "string" },
        "sin-reporte": { type: "boolean" },
        metodo: { type: "string" },
      },
    });
  } catch (err) {
    return exitWith(
      `Argumentos inválidos (${err instanceof Error ? err.message : "error"}).\n` +
        "Uso: npm run admin:paid -- VAL-XXXX [--nota \"...\"]\n" +
        "     npm run admin:paid -- VAL-XXXX --sin-reporte --metodo nequi|bancolombia [--nota \"...\"]",
    );
  }
}
const args = readArgs();

const orderNumber = (args.positionals[0] ?? "").trim().toUpperCase();
if (!/^VAL-\d+$/.test(orderNumber)) exitWith("Indica el número del pedido, p. ej. VAL-1051.");

const withoutReport = args.values["sin-reporte"] === true;
const methodRaw = cleanText(args.values.metodo)?.toLowerCase() ?? null;
if (withoutReport && !methodRaw) {
  exitWith("--sin-reporte exige --metodo nequi|bancolombia (el cliente no declaró método).");
}
if (!withoutReport && methodRaw) {
  exitWith("--metodo solo se usa junto con --sin-reporte.");
}
if (methodRaw && !(methodRaw in METHOD_LABELS)) {
  exitWith("--metodo debe ser nequi o bancolombia.");
}
const method = methodRaw as Method | null;

const userNote = cleanText(args.values.nota);
if (userNote && looksLikeAccountNumber(userNote)) {
  exitWith(
    "La nota parece contener un número de cuenta o tarjeta. No guardes datos bancarios: describe la verificación sin números completos.",
  );
}
const note = withoutReport
  ? userNote
    ? `${NO_REPORT_PREFIX} ${userNote}`
    : NO_REPORT_PREFIX
  : userNote;
if (note && note.length > MAX_NOTE) {
  exitWith(`La nota admite máximo ${MAX_NOTE} caracteres (incluido el prefijo automático).`);
}

loadEnv();
const pool = createPool();

interface Snapshot {
  id: string;
  order_number: string;
  payment_status: string;
  order_status: string;
  quote_status: string | null;
  payment_method: string | null;
  payment_reported_at: Date | null;
  paid_at: Date | null;
  subtotal: number;
  accepted_shipping_amount: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

const SNAPSHOT_SQL = `
  SELECT id, order_number, payment_status, order_status, quote_status,
         payment_method, payment_reported_at, paid_at, subtotal,
         accepted_shipping_amount, customer_name, customer_phone, customer_email
  FROM orders`;

/** Si alguno cambia entre la fase A y la B, la confirmación ya no vale. */
const GUARDED: (keyof Snapshot)[] = [
  "payment_status",
  "order_status",
  "quote_status",
  "payment_method",
  "paid_at",
];
const same = (a: unknown, b: unknown) =>
  a instanceof Date && b instanceof Date ? +a === +b : a === b;

function refuseIfNotEligible(o: Snapshot): void {
  if (o.order_status === "cancelled") exitWith(`${o.order_number} está cancelado: no se marca como pagado.`);
  if (o.payment_status === "paid") {
    exitWith(
      `${o.order_number} ya está pagado${o.paid_at ? ` (verificado el ${formatDateTimeCO(o.paid_at)})` : ""}. No se cambia paid_at.`,
    );
  }
  if (o.quote_status !== null && o.quote_status !== "accepted") {
    exitWith(`${o.order_number}: el cliente todavía no aceptó el total (cotización ${o.quote_status}). No se marca como pagado.`);
  }
  if (o.order_status !== "received") {
    exitWith(`${o.order_number}: estado de pedido inesperado (${o.order_status}). Revísalo manualmente.`);
  }
  if (!withoutReport) {
    if (o.payment_status === "pending_payment") {
      exitWith(
        `${o.order_number}: el cliente NO ha reportado el pago. Si viste el ingreso en tu cuenta, usa --sin-reporte --metodo nequi|bancolombia.`,
      );
    }
    if (o.payment_status !== "payment_reported") {
      exitWith(`${o.order_number}: estado de pago ${o.payment_status}; no se marca como pagado.`);
    }
  } else {
    if (o.payment_status === "payment_reported") {
      exitWith(`${o.order_number}: el cliente sí reportó el pago. Usa admin:paid sin --sin-reporte.`);
    }
    if (o.payment_status !== "pending_payment") {
      exitWith(`${o.order_number}: estado de pago ${o.payment_status}; no se marca como pagado.`);
    }
  }
}

async function main() {
  // ---------- FASE A ----------
  const { rows } = await pool.query<Snapshot>(`${SNAPSHOT_SQL} WHERE order_number = $1`, [orderNumber]);
  const before = rows[0];
  if (!before) exitWith(`No existe el pedido ${orderNumber}.`);
  refuseIfNotEligible(before);

  console.log(`\nPedido ${before.order_number}`);
  console.log(`  Estado del pago:     ${before.payment_status}${withoutReport ? "  (SIN reporte del cliente)" : ""}`);
  console.log(
    `  Método declarado:    ${
      before.payment_method
        ? METHOD_LABELS[before.payment_method as Method] ?? before.payment_method
        : "— (no declarado)"
    }${withoutReport && method ? `  → se registrará: ${METHOD_LABELS[method]}` : ""}`,
  );
  console.log(
    `  Reportado:           ${before.payment_reported_at ? formatDateTimeCO(before.payment_reported_at) : "— (sin reporte)"}`,
  );
  console.log(`  VALOR A VERIFICAR:   ${formatCOP(before.subtotal)}  (solo prendas; el envío no se transfiere)`);
  console.log(`  Referencia del pedido: ${before.order_number}`);
  console.log(`  Nota a guardar:      ${note ?? "(sin nota)"}`);
  console.log("\n  El reporte del cliente NO confirma el ingreso. Verifica tu cuenta bancaria.");
  console.log(
    `  La referencia ${before.order_number} es una ayuda: puede no aparecer en el movimiento.` +
      " Verifica el ingreso real: valor, movimiento, fecha, método y demás datos disponibles.",
  );

  const confirmed = await confirmByTyping(
    before.order_number,
    `¿Verificaste personalmente que ingresaron ${formatCOP(before.subtotal)} a tu cuenta por este pedido?`,
  );
  if (!confirmed) {
    console.log("Confirmación incorrecta: no se guardó nada.");
    return;
  }

  // ---------- FASE B ----------
  const client = await pool.connect();
  let paidAt: Date | null = null;
  try {
    await client.query("BEGIN");
    const lock = await client.query<Snapshot>(`${SNAPSHOT_SQL} WHERE id = $1 FOR UPDATE`, [before.id]);
    const now = lock.rows[0];
    if (!now || GUARDED.some((f) => !same(now[f], before[f]))) {
      await client.query("ROLLBACK");
      exitWith("\nEl pedido cambió mientras lo revisabas. Ejecuta admin:paid nuevamente.");
    }
    const upd = await client.query<{ paid_at: Date }>(
      `UPDATE orders
       SET payment_status = 'paid',
           paid_at = now(),
           order_status = 'preparing',
           payment_verification_note = $2,
           payment_method = COALESCE(payment_method, $3),
           updated_at = now()
       WHERE id = $1
         AND order_status = 'received'
         AND payment_status = $4
       RETURNING paid_at`,
      [before.id, note, method, withoutReport ? "pending_payment" : "payment_reported"],
    );
    if (upd.rowCount !== 1) {
      await client.query("ROLLBACK");
      exitWith("\nEl pedido cambió mientras lo revisabas. Ejecuta admin:paid nuevamente.");
    }
    await client.query("COMMIT");
    paidAt = upd.rows[0].paid_at;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  console.log(`\n✓ ${before.order_number}: pago verificado el ${formatDateTimeCO(paidAt!)}. Estado: en preparación.`);
  console.log("  Siguiente paso: npm run admin:ship -- " + before.order_number + ' --transportadora "…" --guia "…"');
}

try {
  await main();
} catch (err) {
  console.error(`No se pudo registrar el pago: ${describeError(err)}.`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
