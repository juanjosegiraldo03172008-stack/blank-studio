import type { Metadata } from "next";
import { PRODUCTS } from "@/data/products";

export const metadata: Metadata = {
  title: "Guía de tallas",
  description:
    "Tabla de medidas oficial de VALENCIANO para Essentials y Oversize, en centímetros.",
};

export default function GuiaDeTallasPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      <p className="label text-ink/40">Ayuda</p>
      <h1 className="font-display mt-3 text-4xl sm:text-5xl">Guía de tallas</h1>
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink/65">
        Todas las medidas están en centímetros y se toman con la prenda
        extendida sobre una superficie plana. Pueden variar entre 1 y 2 cm de
        una unidad a otra.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 border border-line-soft bg-black/[0.02] p-6 sm:grid-cols-2">
        <div>
          <p className="label text-ink/50">Ancho de pecho</p>
          <p className="mt-2 text-sm text-ink/65">
            Mide de axila a axila, en línea recta, con la prenda extendida.
          </p>
        </div>
        <div>
          <p className="label text-ink/50">Largo</p>
          <p className="mt-2 text-sm text-ink/65">
            Mide desde el punto más alto del hombro hasta el borde inferior de
            la prenda.
          </p>
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-16">
        {PRODUCTS.map((product) => (
          <div key={product.slug}>
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-2xl">{product.name}</h2>
              <span className="label text-ink/40">
                {product.fit === "essential" ? "Horma normal" : "Horma oversize"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="label py-3 pr-4 font-medium text-ink/50">
                      Talla
                    </th>
                    {product.sizeChart.map((row) => (
                      <th
                        key={row.size}
                        className="label py-3 pr-4 text-center font-medium text-ink/50"
                      >
                        {row.size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line-soft">
                    <td className="py-3 pr-4 text-ink/60">Ancho pecho (cm)</td>
                    {product.sizeChart.map((row) => (
                      <td key={row.size} className="py-3 pr-4 text-center">
                        {row.chestCm}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-ink/60">Largo (cm)</td>
                    {product.sizeChart.map((row) => (
                      <td key={row.size} className="py-3 pr-4 text-center">
                        {row.lengthCm}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-16 text-xs text-ink/40">
        La talla 2XL de Essentials 200 y Oversize 200 está disponible
        únicamente en Negro y Blanco.
      </p>
    </div>
  );
}
