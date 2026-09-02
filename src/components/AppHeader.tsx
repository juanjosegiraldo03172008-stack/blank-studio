"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import CheckoutHeader from "@/components/CheckoutHeader";

/** Elige el header global o la variante de checkout según la ruta — no modifica SiteHeader.tsx. */
export default function AppHeader() {
  const pathname = usePathname();
  return pathname === "/pedido" ? <CheckoutHeader /> : <SiteHeader />;
}
