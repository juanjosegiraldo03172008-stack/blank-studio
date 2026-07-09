import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blankstudio.co"),
  title: {
    default: "BLANK STUDIO — Ropa esencial en algodón peruano",
    template: "%s — BLANK STUDIO",
  },
  description:
    "BLANK STUDIO diseña camisetas esenciales en 100% algodón peruano. Essentials y Oversize, horma limpia, materiales premium, sin ruido visual.",
  keywords: [
    "BLANK STUDIO",
    "camisetas algodón peruano",
    "essentials",
    "oversize",
    "ropa minimalista Colombia",
    "quiet luxury",
  ],
  openGraph: {
    title: "BLANK STUDIO — Ropa esencial en algodón peruano",
    description:
      "Essentials y Oversize en 100% algodón peruano. Diseño limpio, atemporal, premium.",
    siteName: "BLANK STUDIO",
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
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
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
