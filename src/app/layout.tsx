import type { Metadata } from "next";
import { Bodoni_Moda, Italiana } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Tipografía general del sitio (títulos, cuerpo, botones, nav).
const bodoniModa = Bodoni_Moda({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Tipografía exclusiva para el wordmark "VALENCIANO" — igual al logo real.
const italiana = Italiana({
  variable: "--font-logo",
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
      className={`${bodoniModa.variable} ${italiana.variable} h-full antialiased`}
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
