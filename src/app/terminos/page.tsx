import type { Metadata } from "next";
import { INSTAGRAM_HANDLE } from "@/lib/instagramOrder";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de compra de BLANK STUDIO: envíos, métodos de pago, cambios por defecto de fábrica y cambios por talla.",
};

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="label text-ink/40">Legal</p>
      <h1 className="font-display mt-3 text-4xl sm:text-5xl">
        Términos y condiciones
      </h1>
      <p className="mt-5 text-sm leading-relaxed text-ink/60">
        Al hacer un pedido con BLANK STUDIO aceptas las condiciones descritas
        en esta página.
      </p>

      <div className="mt-14 flex flex-col gap-12">
        <section>
          <h2 className="font-display text-2xl">Pedidos y precios</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">
            Los precios mostrados en el sitio son estimados y se calculan
            según la cantidad total de tu pedido. El precio final, la
            disponibilidad de color/talla y los detalles de envío se
            confirman por Instagram (
            <span className="font-medium">@{INSTAGRAM_HANDLE}</span>) antes
            de despachar el pedido.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl">Envíos</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-ink/70">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-ink/40" />
              Dentro de la ciudad: el mismo día; si no es posible, se
              despacha al día siguiente.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-ink/40" />
              A nivel nacional: entre 3 y 6 días hábiles.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl">Métodos de pago</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">
            Aceptamos Nequi, Daviplata, Bancolombia y transferencia bancaria.
            El método de pago se confirma junto con tu pedido por Instagram.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl">
            Cambios por defecto de fábrica
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">
            Si tu prenda llega con un defecto de fábrica, sigue estos pasos:
          </p>
          <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-ink/70">
            <li>
              1. Toma una foto clara del defecto apenas la recibas.
            </li>
            <li>
              2. Envíanos la foto por Instagram a{" "}
              <span className="font-medium">@{INSTAGRAM_HANDLE}</span>.
            </li>
            <li>
              3. Nosotros nos contactamos contigo para coordinar el cambio de
              la prenda.
            </li>
          </ol>
          <ul className="mt-6 flex flex-col gap-2 border-t border-line-soft pt-6 text-sm text-ink/70">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-ink/40" />
              El cambio de la prenda es completamente gratis.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-ink/40" />
              El envío de la prenda de vuelta a nosotros corre por cuenta del
              cliente.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl">Cambios por talla</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">
            Si la prenda no tiene ningún defecto pero la talla no te quedó
            bien, tienes hasta{" "}
            <span className="font-medium">15 días</span> desde que la
            recibes para solicitar el cambio, escribiéndonos por Instagram a{" "}
            <span className="font-medium">@{INSTAGRAM_HANDLE}</span>.
          </p>
          <ul className="mt-6 flex flex-col gap-2 border-t border-line-soft pt-6 text-sm text-ink/70">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-ink/40" />
              El cliente cubre el envío de la prenda de vuelta a nosotros y
              el envío de la nueva talla de vuelta al cliente.
            </li>
          </ul>
        </section>
      </div>

      <p className="mt-16 text-xs text-ink/40">
        ¿Tienes dudas sobre tu pedido? Escríbenos por Instagram a @
        {INSTAGRAM_HANDLE}.
      </p>
    </div>
  );
}
