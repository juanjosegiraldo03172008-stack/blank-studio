import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirma tu pedido",
  // P3-04: es el carrito/checkout, no contenido para buscadores.
  robots: { index: false, follow: false },
};

export default function PedidoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
