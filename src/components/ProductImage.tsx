"use client";

import { useState } from "react";
import Image from "next/image";
import TShirtSilhouette from "./TShirtSilhouette";
import type { Fit } from "@/data/products";

export default function ProductImage({
  src,
  fallbackSrc,
  alt,
  fit,
  hex,
  variant = 0,
  priority = false,
  bgClassName = "bg-[#efece4]",
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  fit: Fit;
  hex: string;
  variant?: number;
  priority?: boolean;
  bgClassName?: string;
}) {
  const [stage, setStage] = useState<"primary" | "fallback" | "placeholder">(
    "primary"
  );

  const activeSrc = stage === "fallback" && fallbackSrc ? fallbackSrc : src;

  return (
    <div className={`relative aspect-[4/5] w-full overflow-hidden ${bgClassName}`}>
      {stage !== "placeholder" && (
        <Image
          key={activeSrc}
          src={activeSrc}
          alt={alt}
          fill
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="object-cover"
          onError={() =>
            setStage((s) =>
              s === "primary" && fallbackSrc ? "fallback" : "placeholder"
            )
          }
        />
      )}
      {stage === "placeholder" && (
        <div className="flex h-full w-full items-center justify-center p-10">
          <div className="h-full w-full max-w-[220px]">
            <TShirtSilhouette fit={fit} hex={hex} variant={variant} />
          </div>
          <span className="label absolute bottom-4 left-4 text-ink/35">
            Vista previa
          </span>
        </div>
      )}
    </div>
  );
}
