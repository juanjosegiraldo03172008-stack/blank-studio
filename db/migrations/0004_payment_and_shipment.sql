-- P0-B4a: verificación manual del pago y despacho.
--
-- payment_reported = el cliente AFIRMA haber transferido.
-- paid             = VALENCIANO verificó el ingreso real en su cuenta
--                    (solo con `npm run admin:paid`; ningún botón público).
-- admin:paid deja order_status = 'preparing'; admin:ship lo pasa a 'shipped'.
--
-- Solo agrega columnas y restricciones. No toca el valor de envío cotizado ni
-- aceptado (P0-B3): la transportadora y la guía del despacho van en columnas
-- propias.
--
-- Compatibilidad: los pedidos históricos marcados 'paid' sin paid_at siguen
-- siendo válidos (ninguna regla exige paid_at en 'paid'; admin:paid siempre
-- escribe ambos juntos). Si existiera en la base un pedido 'shipped' puesto a
-- mano sin datos de despacho, esta migración falla completa sin cambiar nada
-- (ver consulta previa en el README).

ALTER TABLE orders
  ADD COLUMN paid_at TIMESTAMPTZ,
  ADD COLUMN payment_verification_note TEXT
    CHECK (payment_verification_note IS NULL
           OR char_length(payment_verification_note) BETWEEN 1 AND 200),
  ADD COLUMN shipped_at TIMESTAMPTZ,
  ADD COLUMN shipping_carrier_final TEXT
    CHECK (shipping_carrier_final IS NULL
           OR char_length(shipping_carrier_final) BETWEEN 1 AND 60),
  -- Nullable: una modalidad legítima sin guía se registra con NULL + nota,
  -- nunca con "N/A", "sin guía", "0000" u otro relleno.
  ADD COLUMN tracking_number TEXT
    CHECK (tracking_number IS NULL OR (
      char_length(tracking_number) BETWEEN 3 AND 60
      AND tracking_number ~ '[1-9A-Za-z]'
      AND lower(btrim(tracking_number)) NOT IN
        ('n/a', 'na', 'sin guia', 'sin guía', 'ninguna', 'ninguno', 'no aplica', 'pendiente')
    )),
  ADD COLUMN shipment_note TEXT
    CHECK (shipment_note IS NULL OR char_length(shipment_note) BETWEEN 1 AND 300);

-- A) paid_at solo con un pago confirmado. (Sin reembolsos en B4a: si llegan,
--    una migración posterior ampliará la regla conscientemente.)
ALTER TABLE orders ADD CONSTRAINT orders_paid_at_consistent
  CHECK (paid_at IS NULL OR payment_status = 'paid');

-- E) La nota de verificación solo existe junto con paid_at.
ALTER TABLE orders ADD CONSTRAINT orders_verification_note_needs_paid_at
  CHECK (payment_verification_note IS NULL OR paid_at IS NOT NULL);

-- B) + C) Despacho, bidireccional y null-safe (CASE: order_status es NOT NULL).
--   shipped      => fecha y transportadora obligatorias, pago confirmado.
--   no shipped   => ningún dato de despacho parcial.
ALTER TABLE orders ADD CONSTRAINT orders_shipment_consistent CHECK (
  CASE
    WHEN order_status = 'shipped' THEN
      shipped_at IS NOT NULL
      AND shipping_carrier_final IS NOT NULL
      AND payment_status = 'paid'
    ELSE
      shipped_at IS NULL
      AND shipping_carrier_final IS NULL
      AND tracking_number IS NULL
      AND shipment_note IS NULL
  END
);

-- D) Nunca se despacha antes de la verificación del pago.
ALTER TABLE orders ADD CONSTRAINT orders_shipped_after_paid
  CHECK (shipped_at IS NULL OR paid_at IS NULL OR shipped_at >= paid_at);

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);
