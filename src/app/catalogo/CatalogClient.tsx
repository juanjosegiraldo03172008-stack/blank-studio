"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { allColorsFor, COLORS, PRODUCTS, type ColorId, type Fit } from "@/data/products";

const FIT_OPTIONS: { value: Fit | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "essential", label: "Essentials" },
  { value: "oversize", label: "Oversize" },
];

const GSM_OPTIONS: { value: 200 | 300 | "all"; label: string }[] = [
  { value: "all", label: "Todos los gramajes" },
  { value: 200, label: "200 GSM" },
  { value: 300, label: "300 GSM" },
];

export default function CatalogClient() {
  const params = useSearchParams();
  const initialFit = (params.get("fit") as Fit | null) ?? "all";

  const [fit, setFit] = useState<Fit | "all">(initialFit);
  const [gsm, setGsm] = useState<200 | 300 | "all">("all");
  const [color, setColor] = useState<ColorId | "all">("all");

  const allColors = useMemo(() => {
    const set = new Set<ColorId>();
    PRODUCTS.forEach((p) => allColorsFor(p).forEach((c) => set.add(c)));
    return Array.from(set);
  }, []);

  const filtered = PRODUCTS.filter((p) => {
    if (fit !== "all" && p.fit !== fit) return false;
    if (gsm !== "all" && p.gsm !== gsm) return false;
    if (color !== "all" && !allColorsFor(p).includes(color)) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8">
      <div className="mb-14">
        <p className="label text-ink/40">Catálogo</p>
        <h1 className="font-display mt-3 text-4xl sm:text-5xl">
          Essentials &amp; Oversize
        </h1>
        <p className="mt-4 max-w-lg text-sm text-ink/60">
          Cuatro siluetas, dos gramajes, un mismo algodón peruano. Filtra por
          horma, gramaje o color para encontrar tu prenda.
        </p>
      </div>

      <div className="mb-12 flex flex-col gap-6 border-y border-line py-6">
        <div className="flex flex-wrap gap-2">
          {FIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFit(opt.value)}
              className={`label px-4 py-2 transition ${
                fit === opt.value
                  ? "bg-ink text-paper"
                  : "border border-line text-ink/60 hover:border-ink hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="mx-1 hidden w-px bg-line sm:block" />
          {GSM_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setGsm(opt.value)}
              className={`label px-4 py-2 transition ${
                gsm === opt.value
                  ? "bg-ink text-paper"
                  : "border border-line text-ink/60 hover:border-ink hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-1 text-ink/40">Color</span>
          <button
            onClick={() => setColor("all")}
            className={`label rounded-full px-3 py-1 transition ${
              color === "all"
                ? "bg-ink text-paper"
                : "border border-line text-ink/60 hover:border-ink"
            }`}
          >
            Todos
          </button>
          {allColors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              title={COLORS[c].name}
              className={`h-6 w-6 rounded-full ring-1 ring-inset ring-black/10 transition ${
                color === c ? "ring-2 ring-ink scale-110" : "hover:scale-105"
              }`}
              style={{ backgroundColor: COLORS[c].hex }}
              aria-label={COLORS[c].name}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-sm text-ink/50">
          No hay prendas con esa combinación de filtros.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
