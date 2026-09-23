// npm run admin:pending — solicitudes que esperan cotización de envío (P0-B3),
// de la más antigua a la más reciente. Muestra los datos del cliente
// necesarios para cotizar y contactarlo SOLO en esta terminal administrativa.

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

interface PendingRow {
  id: string;
  order_number: string;
  created_at: Date;
  updated_at: Date;
  quote_version: number;
  city: string;
  delivery_mode: DeliveryMode;
  address: string | null;
  address_line2: string | null;
  pickup_office_preference: string | null;
  carrier_preference: string | null;
  subtotal: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

try {
  const { rows } = await pool.query<PendingRow>(
    `SELECT id, order_number, created_at, updated_at, quote_version, city,
            delivery_mode, address, address_line2, pickup_office_preference,
            carrier_preference, subtotal, customer_name, customer_phone,
            customer_email
     FROM orders
     WHERE quote_status = 'pending' AND order_status <> 'cancelled'
     ORDER BY updated_at ASC`,
  );

  if (rows.length === 0) {
    console.log("No hay solicitudes pendientes de cotización.");
  } else {
    const items = await pool.query<{
      order_id: string;
      product_name: string;
      color: string;
      size: string;
      quantity: number;
    }>(
      `SELECT order_id, product_name, color, size, quantity
       FROM order_items WHERE order_id = ANY($1) ORDER BY id`,
      [rows.map((r) => r.id)],
    );

    console.log(
      `${rows.length} solicitud(es) pendiente(s) de cotización. Recuerda: "${QUOTE_RESPONSE_TIME_COPY}"\n`,
    );
    for (const r of rows) {
      const waiting = hoursSince(r.updated_at);
      console.log(`■ ${r.order_number}  —  en espera hace ${waiting} h`);
      console.log(
        `  Solicitada: ${formatDateTimeCO(r.created_at)}${
          r.quote_version > 0
            ? `  (pidió otra opción; cotizaciones previas: ${r.quote_version})`
            : ""
        }`,
      );
      console.log(`  Modalidad:  ${DELIVERY_MODE_LABELS[r.delivery_mode]}`);
      console.log(`  Ciudad:     ${r.city}`);
      if (r.delivery_mode === "domicilio") {
        console.log(
          `  Dirección:  ${r.address ?? "—"}${r.address_line2 ? `, ${r.address_line2}` : ""}`,
        );
      } else {
        console.log(`  Oficina:    ${r.pickup_office_preference ?? "sin preferencia"}`);
      }
      console.log(
        `  Transport.: ${r.carrier_preference ?? `sin preferencia (habitual: ${DEFAULT_CARRIER})`}`,
      );
      for (const it of items.rows.filter((i) => i.order_id === r.id)) {
        console.log(
          `    · ${it.quantity} × ${it.product_name} — ${it.color}, talla ${it.size}`,
        );
      }
      console.log(`  Prendas:    ${formatCOP(r.subtotal)}`);
      console.log(
        `  Cliente:    ${r.customer_name} · ${r.customer_phone} · ${r.customer_email}`,
      );
      console.log(
        `  Cotizar:    npm run admin:quote -- ${r.order_number} --valor <COP> --transportadora "<nombre>" [--nota "<texto>"]\n`,
      );
    }
  }
} catch (err) {
  console.error(`No se pudo consultar la base de datos: ${describeError(err)}.`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
