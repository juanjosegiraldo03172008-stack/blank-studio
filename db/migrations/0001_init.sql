-- Infraestructura de pedidos reales (FASE 4A) — sin pasarela todavía.
-- products.ts sigue siendo la fuente de verdad de catálogo/precio; esta base
-- de datos solo guarda pedidos, sus items (snapshot) e inventario básico.

-- Numeración legible para el cliente (VAL-1000, VAL-1001, ...). Una
-- secuencia de Postgres es atómica bajo concurrencia por diseño — dos
-- pedidos creados al mismo tiempo nunca pueden recibir el mismo número.
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1000 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT ('VAL-' || nextval('order_number_seq')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,

  city TEXT NOT NULL,
  address TEXT NOT NULL,
  address_line2 TEXT,

  -- COP, entero (sin decimales) — igual que retailPrice en products.ts.
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),

  -- Regla comercial: el envío se paga contraentrega, nunca online.
  -- 'cash_on_delivery' es hoy el único valor real; el campo existe como
  -- texto (no enum rígido) para poder agregar otro método el día que
  -- exista uno real, sin una migración de tipo.
  shipping_payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery',

  payment_status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (payment_status IN ('pending_payment', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'received'
    CHECK (order_status IN ('received', 'preparing', 'shipped', 'cancelled')),

  -- Evita pedidos duplicados por doble click / reintento de red — ver
  -- estrategia de idempotencia en src/lib/orders/createOrder.ts.
  idempotency_key TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Referencia al catálogo (para trazabilidad), pero el resto de esta fila
  -- es un SNAPSHOT: si el producto cambia de precio o nombre después, este
  -- pedido histórico no se ve afectado.
  product_slug TEXT NOT NULL,
  product_line TEXT NOT NULL,
  product_name TEXT NOT NULL,
  fit TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),

  unit_price_at_purchase INTEGER NOT NULL CHECK (unit_price_at_purchase >= 0),
  line_total INTEGER NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- Inventario básico por producto + color + talla. Todavía NO se descuenta
-- en esta fase (no hay pasarela ni webhook que confirme pago) — ver el
-- comentario en src/lib/orders/createOrder.ts. Una fila ausente para una
-- combinación significa "sin control de stock todavía", no "agotado".
CREATE TABLE IF NOT EXISTS inventory (
  product_slug TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_slug, color, size)
);
