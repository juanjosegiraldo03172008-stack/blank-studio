"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { createOrderAction } from "@/app/actions/orders";
import type { CreateOrderResult } from "@/lib/orders/types";

/**
 * Herramienta de prueba interna — NO es el checkout real. Llama al mismo
 * Server Action que usará el checkout real más adelante, contra el carrito
 * real (useCart), para comprobar de punta a punta que CREATE ORDER
 * funciona: validación server-side, precios recalculados, inventario,
 * idempotencia y persistencia en base de datos. No hay pago involucrado.
 */
export default function TestOrderForm() {
  const { items } = useCart();
  // crypto.randomUUID() en el initializer de useState rompería la
  // hidratación (valor distinto en servidor vs. cliente) — se genera en un
  // efecto, solo en el cliente, después del primer render.
  const [idempotencyKey, setIdempotencyKey] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdempotencyKey(crypto.randomUUID());
  }, []);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    addressLine2: "",
  });
  const [result, setResult] = useState<CreateOrderResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const res = await createOrderAction({
      customer,
      items: items.map((i) => ({
        slug: i.slug,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
      })),
      idempotencyKey,
    });
    setResult(res);
    setSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 font-mono text-sm">
      <div className="border-2 border-dashed border-red-600 bg-red-50 p-4 text-red-800">
        <p className="font-bold">HERRAMIENTA DE PRUEBA INTERNA — FASE 4A</p>
        <p className="mt-1">
          No es el checkout real. No procesa pagos. No reemplaza /pedido ni
          Instagram. Solo visible en desarrollo (404 en producción).
        </p>
      </div>

      <h1 className="mt-8 text-lg font-bold">
        Carrito actual ({items.length} items)
      </h1>
      <pre className="mt-2 overflow-x-auto bg-black/5 p-3 text-xs">
        {JSON.stringify(items, null, 2)}
      </pre>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
        <h2 className="font-bold">Datos de contacto (prueba)</h2>
        {(
          [
            ["name", "Nombre completo"],
            ["email", "Email"],
            ["phone", "Teléfono"],
            ["city", "Ciudad"],
            ["address", "Dirección"],
            ["addressLine2", "Apto/interior (opcional)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1">
            <span>{label}</span>
            <input
              className="border border-black/20 px-3 py-2"
              value={customer[key]}
              onChange={(e) =>
                setCustomer((c) => ({ ...c, [key]: e.target.value }))
              }
            />
          </label>
        ))}

        <p className="mt-2 text-xs text-black/50">
          idempotencyKey (fijo para esta carga de página): {idempotencyKey}
        </p>

        <button
          type="submit"
          disabled={submitting || !idempotencyKey}
          className="mt-3 w-fit bg-black px-6 py-3 text-white disabled:opacity-50"
        >
          {submitting ? "Creando…" : "Crear pedido de prueba (sin pago)"}
        </button>
      </form>

      {result && (
        <div className="mt-8">
          <h2 className="font-bold">Resultado</h2>
          <pre
            id="result"
            className="mt-2 overflow-x-auto bg-black/5 p-3 text-xs"
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <RawPayloadTester />
    </div>
  );
}

/**
 * Envía un payload JSON arbitrario directo al Server Action — sin pasar por
 * useCart. Existe solo para probar cómo responde la validación server-side
 * ante payloads manipulados (slug/color/talla inexistentes, cantidades
 * inválidas, precio/total inyectados, etc.), simulando una request
 * modificada a mano fuera del navegador.
 */
function RawPayloadTester() {
  const [raw, setRaw] = useState(
    JSON.stringify(
      {
        customer: {
          name: "Prueba Seguridad",
          email: "prueba@example.com",
          phone: "3009999999",
          city: "Medellín",
          address: "Cra 1 # 2-3",
        },
        items: [
          {
            slug: "essentials-200",
            color: "blanco",
            size: "M",
            quantity: 1,
            price: 1,
          },
        ],
        idempotencyKey: "",
      },
      null,
      2,
    ),
  );
  const [result, setResult] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  async function send() {
    setSubmitting(true);
    setResult(null);
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.idempotencyKey) parsed.idempotencyKey = crypto.randomUUID();
      const res = await createOrderAction(parsed);
      setResult(res);
    } catch (e) {
      setResult({ ok: false, error: `JSON inválido: ${(e as Error).message}` });
    }
    setSubmitting(false);
  }

  return (
    <div className="mt-16 border-t border-black/20 pt-8">
      <h2 className="font-bold">
        Payload crudo (prueba de seguridad/validación)
      </h2>
      <p className="mt-1 text-xs text-black/50">
        Edita el JSON libremente (slug/color/size/quantity inválidos, price
        inyectado, campos vacíos, etc.) y envíalo directo al Server Action.
      </p>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={14}
        className="mt-3 w-full border border-black/20 p-3 text-xs"
      />
      <button
        onClick={send}
        disabled={submitting}
        className="mt-3 w-fit border border-black px-6 py-3 disabled:opacity-50"
      >
        {submitting ? "Enviando…" : "Enviar payload crudo"}
      </button>
      {result !== null && (
        <pre
          id="raw-result"
          className="mt-4 overflow-x-auto bg-black/5 p-3 text-xs"
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
