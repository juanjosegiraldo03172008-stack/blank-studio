-- P0-B3: envío cotizado manualmente + aceptación expresa del total antes de
-- pagar (Ley 1480, art. 50 lit. d). Sin tarifas, sin integración con
-- transportadoras, sin pasarela.
--
-- Compatibilidad: los pedidos anteriores a B3 quedan con delivery_mode y
-- quote_status en NULL y conservan su flujo original. quote_status NO tiene
-- DEFAULT a propósito: el código B3 escribe 'pending' explícitamente; si la
-- migración corre antes del despliegue, el código anterior sigue creando
-- pedidos del flujo original (NULL) en vez de solicitudes a medio procesar.
--
-- Único cambio no aditivo: address deja de ser NOT NULL, porque la recogida
-- en oficina no usa dirección domiciliaria y no se guardan placeholders. La
-- restricción orders_address_by_delivery_mode mantiene la integridad.

ALTER TABLE orders ALTER COLUMN address DROP NOT NULL;

ALTER TABLE orders
  ADD COLUMN delivery_mode TEXT
    CHECK (delivery_mode IS NULL OR delivery_mode IN ('domicilio', 'oficina')),
  ADD COLUMN pickup_office_preference TEXT
    CHECK (pickup_office_preference IS NULL OR char_length(pickup_office_preference) BETWEEN 1 AND 120),
  ADD COLUMN carrier_preference TEXT
    CHECK (carrier_preference IS NULL OR char_length(carrier_preference) BETWEEN 1 AND 60),
  ADD COLUMN quote_status TEXT
    CHECK (quote_status IS NULL OR quote_status IN ('pending', 'quoted', 'accepted', 'rejected')),
  -- Sube con cada cotización: una aceptación/rechazo sobre una versión vieja
  -- se rechaza.
  ADD COLUMN quote_version INTEGER NOT NULL DEFAULT 0 CHECK (quote_version >= 0),
  -- COP entero. Nunca $0: un envío sin valor real no se puede cotizar.
  ADD COLUMN shipping_quote_amount INTEGER
    CHECK (shipping_quote_amount IS NULL OR shipping_quote_amount > 0),
  ADD COLUMN shipping_quote_carrier TEXT
    CHECK (shipping_quote_carrier IS NULL OR char_length(shipping_quote_carrier) BETWEEN 1 AND 60),
  ADD COLUMN shipping_quote_note TEXT
    CHECK (shipping_quote_note IS NULL OR char_length(shipping_quote_note) BETWEEN 1 AND 300),
  ADD COLUMN shipping_quoted_at TIMESTAMPTZ,
  -- Se guarda explícito (shipping_quoted_at + 48 h al cotizar) para que un
  -- cambio futuro de política no altere cotizaciones ya emitidas.
  ADD COLUMN shipping_quote_expires_at TIMESTAMPTZ,
  ADD COLUMN accepted_at TIMESTAMPTZ,
  ADD COLUMN accepted_quote_version INTEGER,
  -- Copia fija del valor de envío aceptado (evidencia; no se recotiza después
  -- de aceptar).
  ADD COLUMN accepted_shipping_amount INTEGER
    CHECK (accepted_shipping_amount IS NULL OR accepted_shipping_amount > 0);

-- Pedido anterior a B3 <=> sin modalidad ni estado de cotización.
ALTER TABLE orders ADD CONSTRAINT orders_b3_fields_consistent
  CHECK ((quote_status IS NULL) = (delivery_mode IS NULL));

-- Dirección según modalidad: nunca una dirección de relleno para oficina.
-- CASE (no una cadena de OR) para que un NULL nunca haga pasar la regla: en
-- SQL, "NULL = 'domicilio'" es NULL y un CHECK con resultado NULL se acepta.
ALTER TABLE orders ADD CONSTRAINT orders_address_by_delivery_mode CHECK (
  CASE
    WHEN delivery_mode IS NULL THEN address IS NOT NULL
    WHEN delivery_mode = 'domicilio' THEN address IS NOT NULL
      AND btrim(address) <> '' AND pickup_office_preference IS NULL
    WHEN delivery_mode = 'oficina' THEN address IS NULL AND address_line2 IS NULL
    ELSE false
  END
);

-- Una cotización vigente o aceptada siempre está completa.
ALTER TABLE orders ADD CONSTRAINT orders_quote_complete CHECK (
  quote_status IS NULL
  OR quote_status NOT IN ('quoted', 'accepted')
  OR (shipping_quote_amount IS NOT NULL AND shipping_quote_carrier IS NOT NULL
      AND shipping_quoted_at IS NOT NULL AND shipping_quote_expires_at IS NOT NULL)
);

-- Una aceptación siempre deja su evidencia completa.
ALTER TABLE orders ADD CONSTRAINT orders_acceptance_complete CHECK (
  quote_status IS DISTINCT FROM 'accepted'
  OR (accepted_at IS NOT NULL AND accepted_quote_version IS NOT NULL
      AND accepted_shipping_amount IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_orders_quote_status ON orders (quote_status);
