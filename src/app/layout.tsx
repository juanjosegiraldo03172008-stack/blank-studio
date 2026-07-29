import type { Metadata } from "next";
import { Italiana } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Único tipo de letra en todo el sitio, a pedido — igual al del logo.
const italiana = Italiana({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://valenciano.co"),
  title: {
    default: "VALENCIANO — Ropa esencial en algodón peruano",
    template: "%s — VALENCIANO",
  },
  description:
    "VALENCIANO diseña ropa esencial en 100% algodón peruano con una estética elegante e italiana. Essentials y Oversize, horma limpia, materiales premium.",
  keywords: [
    "VALENCIANO",
    "camisetas algodón peruano",
    "essentials",
    "oversize",
    "ropa elegante Colombia",
    "moda italiana",
  ],
  openGraph: {
    title: "VALENCIANO — Ropa esencial en algodón peruano",
    description:
      "Essentials y Oversize en 100% algodón peruano. Diseño elegante, atemporal, premium.",
    siteName: "VALENCIANO",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${italiana.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
