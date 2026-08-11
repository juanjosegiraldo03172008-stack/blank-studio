import type { Metadata } from "next";
import { Suspense } from "react";
import CatalogClient from "./CatalogClient";

export const metadata: Metadata = {
  title: "Iconic — Essentials & Oversize",
  description:
    "Essentials y Oversize en 100% algodón peruano, 200 y 300 GSM. Horma limpia, colores sólidos, diseño atemporal.",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ fit?: string }>;
}) {
  const { fit } = await searchParams;
  return (
    <Suspense fallback={null}>
      {/* Remount when ?fit= changes so the filter state (initialized once
          from the URL) always starts fresh instead of going stale when
          navigating between /catalogo?fit=essential and ?fit=oversize. */}
      <CatalogClient key={fit ?? "all"} />
    </Suspense>
  );
}
