-- FASE 4B: pago manual por transferencia directa (Nequi/Bancolombia).
-- Ninguna pasarela — el dinero se verifica humanamente antes de pasar a
-- 'paid'. No modifica destructivamente nada de 0001_init.sql, solo agrega.

-- payment_reported: el cliente reportó que transfirió, TODAVÍA no
-- verificado. paid solo se asigna manualmente tras confirmar el dinero.
ALTER TABLE orders DROP CONSTRAINT orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending_payment', 'payment_reported', 'paid', 'failed', 'refunded'));

-- Nunca tarjetas/CVV/tokens — no existen (no hay pasarela). Solo el canal
-- que el cliente dice haber usado para transferir.
ALTER TABLE orders ADD COLUMN payment_method TEXT
  CHECK (payment_method IS NULL OR payment_method IN ('nequi', 'bancolombia'));

ALTER TABLE orders ADD COLUMN payment_reported_at TIMESTAMPTZ;
