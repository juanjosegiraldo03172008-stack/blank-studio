import { Suspense } from "react";
import CatalogClient from "./CatalogClient";

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
