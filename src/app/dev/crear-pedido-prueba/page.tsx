import { notFound } from "next/navigation";
import TestOrderForm from "./TestOrderForm";

/**
 * Herramienta de prueba SOLO para verificar CREATE ORDER de punta a punta
 * (FASE 4A) — no es el checkout real, no está enlazada desde ninguna
 * navegación, y no funciona en producción (404 si NODE_ENV=production).
 * No reemplaza ni modifica /pedido (Instagram sigue siendo el flujo real).
 */
export default function DevCreateOrderTestPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <TestOrderForm />;
}
