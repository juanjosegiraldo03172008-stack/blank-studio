import ProductCard from "./ProductCard";
import type { Product } from "@/data/products";

/**
 * Grilla de producto que se adapta al número de referencias disponibles —
 * con pocas piezas (cápsulas como Origin o Legacy hoy) evita el vacío de un
 * grid de 4 columnas medio lleno, sin tocar el grid de 4 columnas ya
 * correcto cuando sí hay suficientes referencias.
 */
const LAYOUT_BY_COUNT: Record<number, string> = {
  1: "grid-cols-1 max-w-xs mx-auto",
  2: "grid-cols-2 max-w-xl mx-auto",
  3: "grid-cols-2 sm:grid-cols-3 max-w-3xl mx-auto",
};

export default function ProductGrid({ products }: { products: Product[] }) {
  const layout = LAYOUT_BY_COUNT[products.length] ?? "grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-x-6 gap-y-14 ${layout}`}>
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
