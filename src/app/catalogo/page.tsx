import { Suspense } from "react";
import CatalogClient from "./CatalogClient";

export default function CatalogoPage() {
  return (
    <Suspense fallback={null}>
      <CatalogClient />
    </Suspense>
  );
}
