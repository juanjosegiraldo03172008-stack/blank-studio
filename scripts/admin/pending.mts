// npm run admin:pending — todo lo pendiente del lado de VALENCIANO:
//   1. Por cotizar (P0-B3)
//   2. Pagos reportados por verificar (P0-B4a)
//   3. Pagados / en preparación por despachar (P0-B4a)
// Muestra los datos del cliente necesarios para operar SOLO en esta
// terminal administrativa. Nunca imprime DATABASE_URL.

import {
  DEFAULT_CARRIER,
  DELIVERY_MODE_LABELS,
  QUOTE_RESPONSE_TIME_COPY,
  formatDateTimeCO,
  type DeliveryMode,
} from "../../src/data/shipping.ts";
import {
  createPool,
  describeError,
  formatCOP,
  hoursSince,
  loadEnv,
} from "./shared.mts";

loadEnv();
const pool = createPool();

interface OrderRow {
  id: string;
  order_number: string;
  created_at: Date;
  updated_at: Date;
  quote_version: number;
  city: string;
  delivery_mode: DeliveryMode | null;
  address: string | null;
  address_line2: string | null;
  pickup_office_preference: string | null;
  carrier_preference: string | null;
  shipping_quote_carrier: string | null;
  accepted_shipping_amount: number | null;
  subtotal: number;
  payment_method: string | null;
  payment_reported_at: Date | null;
  paid_at: Date | null;
  order_status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

const SELECT = `
  SELECT id, order_number, created_at, updated_at, quote_version, city,
         delivery_mode, address, address_line2, pickup_office_preference,
         carrier_preference, shipping_quote_carrier, accepted_shipping_amount,
         subtotal, payment_method, payment_reported_at, paid_at, order_status,
         customer_name, customer_phone, customer_email
  FROM orders`;

const METHOD_LABELS: Record<string, string> = {
  nequi: "Nequi",
  bancolombia: "Bancolombia",
};

type ItemRow = {
  order_id: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
};

function printItems(items: ItemRow[], orderId: string) {
  for (const it of items.filter((i) => i.order_id === orderId)) {
    console.log(`    · ${it.quantity} × ${it.product_name} — ${it.color}, talla ${it.size}`);
  }
}

function printDestination(r: OrderRow) {
  if (r.delivery_mode) console.log(`  Modalidad:  ${DELIVERY_MODE_LABELS[r.delivery_mode]}`);
  console.log(`  Ciudad:     ${r.city}`);
  if (r.delivery_mode === "oficina") {
    console.log(`  Oficina:    ${r.pickup_office_preference ?? "sin preferencia"}`);
  } else {
    console.log(`  Dirección:  ${r.address ?? "—"}${r.address_line2 ? `, ${r.address_line2}` : ""}`);
  }
}

function printContact(r: OrderRow) {
  console.log(`  Cliente:    ${r.customer_name} · ${r.customer_phone} · ${r.customer_email}`);
}

try {
  const quotes = await pool.query<OrderRow>(
    `${SELECT} WHERE quote_status = 'pending' AND order_status <> 'cancelled'
     ORDER BY updated_at ASC`,
  );
  const reported = await pool.query<OrderRow>(
    `${SELECT} WHERE payment_status = 'payment_reported' AND order_status <> 'cancelled'
     ORDER BY payment_reported_at ASC NULLS LAST`,
  );
  const toShip = await pool.query<OrderRow>(
    `${SELECT} WHERE payment_status = 'paid' AND order_status IN ('preparing', 'received')
     ORDER BY paid_at ASC NULLS FIRST`,
  );
  const ids = [...quotes.rows, ...reported.rows, ...toShip.rows].map((r) => r.id);
  const items =
    ids.length > 0
      ? (
          await pool.query<ItemRow>(
            `SELECT order_id, product_name, color, size, quantity
             FROM order_items WHERE order_id = ANY($1) ORDER BY id`,
            [ids],
          )
        ).rows
      : [];

  // ---------- 1. Por cotizar ----------
  console.log("═══ 1. POR COTIZAR ═══");
  if (quotes.rows.length === 0) {
    console.log("No hay solicitudes pendientes de cotización.\n");
  } else {
    console.log(
      `${quotes.rows.length} solicitud(es) pendiente(s) de cotización. Recuerda: "${QUOTE_RESPONSE_TIME_COPY}"\n`,
    );
    for (const r of quotes.rows) {
      console.log(`■ ${r.order_number}  —  en espera hace ${hoursSince(r.updated_at)} h`);
      console.log(
        `  Solicitada: ${formatDateTimeCO(r.created_at)}${
          r.quote_version > 0
            ? `  (pidió otra opción; cotizaciones previas: ${r.quote_version})`
            : ""
        }`,
      );
      printDestination(r);
      console.log(
        `  Transport.: ${r.carrier_preference ?? `sin preferencia (habitual: ${DEFAULT_CARRIER})`}`,
      );
      printItems(items, r.id);
      console.log(`  Prendas:    ${formatCOP(r.subtotal)}`);
      printContact(r);
      console.log(
        `  Cotizar:    npm run admin:quote -- ${r.order_number} --valor <COP> --transportadora "<nombre>" [--nota "<texto>"]\n`,
      );
    }
  }

  // ---------- 2. Pagos reportados por verificar ----------
  console.log("═══ 2. PAGOS REPORTADOS POR VERIFICAR ═══");
  if (reported.rows.length === 0) {
    console.log("No hay pagos reportados pendientes de verificación.\n");
  } else {
    console.log(
      `${reported.rows.length} pago(s) reportado(s). El reporte del cliente NO confirma el ingreso: verifica tu cuenta bancaria.\n`,
    );
    for (const r of reported.rows) {
      const when = r.payment_reported_at;
      console.log(`■ ${r.order_number}${when ? `  —  reportado hace ${hoursSince(when)} h` : ""}`);
      console.log(`  Reportado:  ${when ? formatDateTimeCO(when) : "—"}`);
      console.log(
        `  Método declarado: ${r.payment_method ? METHOD_LABELS[r.payment_method] ?? r.payment_method : "—"}`,
      );
      console.log(`  VALOR A VERIFICAR: ${formatCOP(r.subtotal)} (solo prendas)`);
      console.log(`  Referencia (ayuda, puede no aparecer en el banco): ${r.order_number}`);
      printContact(r);
      console.log(`  Verificar:  npm run admin:paid -- ${r.order_number} [--nota "<texto>"]\n`);
    }
  }

  // ---------- 3. Pagados / en preparación por despachar ----------
  console.log("═══ 3. PAGADOS / EN PREPARACIÓN POR DESPACHAR ═══");
  if (toShip.rows.length === 0) {
    console.log("No hay pedidos pagados pendientes de despacho.");
  } else {
    console.log(`${toShip.rows.length} pedido(s) por despachar.\n`);
    for (const r of toShip.rows) {
      console.log(
        `■ ${r.order_number}${r.order_status === "received" ? "  (pagado histórico, antes de B4a)" : ""}`,
      );
      console.log(`  Pago verificado: ${r.paid_at ? formatDateTimeCO(r.paid_at) : "sin fecha registrada"}`);
      printDestination(r);
      console.log(`  Transportadora aceptada: ${r.shipping_quote_carrier ?? "— (pedido sin cotización)"}`);
      if (r.accepted_shipping_amount !== null) {
        console.log(`  Envío aceptado: ${formatCOP(r.accepted_shipping_amount)} (se paga al recibir)`);
      }
      printItems(items, r.id);
      printContact(r);
      console.log(
        `  Despachar:  npm run admin:ship -- ${r.order_number} --transportadora "<nombre>" --guia "<número>" [--nota "<texto>"]\n`,
      );
    }
  }
} catch (err) {
  console.error(`No se pudo consultar la base de datos: ${describeError(err)}.`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
