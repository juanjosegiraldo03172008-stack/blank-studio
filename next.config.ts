import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // P3-03: no anunciar el framework en cada respuesta.
  poweredByHeader: false,

  // H-12: cabeceras de seguridad que no cambian ningún comportamiento
  // funcional del sitio (no hay scripts de terceros, iframes propios ni
  // integraciones que dependan de permisos de cámara/micrófono/ubicación).
  // La CSP va en modo report-only primero — solo registra en la consola del
  // navegador lo que violaría la política, sin bloquear nada todavía —
  // hasta confirmar que no rompe ningún recurso real antes de aplicarla en
  // modo forzado.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
