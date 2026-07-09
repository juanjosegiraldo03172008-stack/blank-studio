"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Para fotografía editorial/lifestyle (hero, lookbook, texturas de tela).
 * Cae a un fondo de estudio en degradado si el archivo real aún no existe
 * en /public — se reemplaza solo en cuanto sueltes la foto ahí.
 */
export default function EditorialImage({
  src,
  alt,
  className = "",
  gradient = "from-[#d9d2c2] via-[#c9c2b0] to-[#b6ae9c]",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  gradient?: string;
  priority?: boolean;
}) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        className={`relative flex items-end overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply [background-image:radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:4px_4px]" />
        <span className="label relative m-5 text-ink/40">Vista previa</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="100vw"
      className={`object-cover ${className}`}
      onError={() => setBroken(true)}
    />
  );
}
