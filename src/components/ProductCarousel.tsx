"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import TShirtSilhouette from "./TShirtSilhouette";
import type { Fit } from "@/data/products";

export interface CarouselImage {
  src: string;
  alt: string;
}

/**
 * Carrusel de producto — usado en el grid (hover + drag en desktop, swipe
 * nativo en mobile) y reutilizable en la PDP. Con 0 o 1 imagen se degrada a
 * una imagen simple sin controles. `touch-action: pan-y` deja que el
 * navegador maneje el scroll vertical de la página mientras el drag
 * horizontal lo controla este componente — así nunca se pelean entre sí.
 */
export default function ProductCarousel({
  images,
  fit,
  hex,
  fallbackSrc,
  priority = false,
  bgClassName = "bg-[#efece4]",
  onDragStateChange,
  index: controlledIndex,
  onIndexChange,
  aspectClassName = "aspect-[4/5]",
  showControls = true,
}: {
  images: CarouselImage[];
  fit: Fit;
  hex: string;
  fallbackSrc?: string;
  priority?: boolean;
  bgClassName?: string;
  onDragStateChange?: (dragging: boolean) => void;
  /** Pásalo junto con onIndexChange para controlar el índice desde afuera (ej. thumbnails en la PDP). */
  index?: number;
  onIndexChange?: (i: number) => void;
  aspectClassName?: string;
  /** Oculta flechas/dots (útil cuando el control externo, ej. thumbnails, ya cumple esa función). */
  showControls?: boolean;
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const index = controlledIndex ?? internalIndex;
  const [interacted, setInteracted] = useState(controlledIndex !== undefined);
  const [broken, setBroken] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const dragState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    axisLocked: null as "x" | "y" | null,
    moved: false,
  });
  const trackRef = useRef<HTMLDivElement>(null);

  const count = images.length;
  const hasMultiple = count > 1 && !broken;

  function markInteracted() {
    if (!interacted) setInteracted(true);
  }

  function goTo(i: number) {
    const clamped = Math.max(0, Math.min(count - 1, i));
    if (onIndexChange) onIndexChange(clamped);
    else setInternalIndex(clamped);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!hasMultiple) return;
    dragState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      axisLocked: null,
      moved: false,
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!hasMultiple || !dragState.current.active) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;

    if (!dragState.current.axisLocked) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      dragState.current.axisLocked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (dragState.current.axisLocked === "x") {
        markInteracted();
        setDragging(true);
        onDragStateChange?.(true);
      }
    }

    if (dragState.current.axisLocked === "x") {
      dragState.current.moved = true;
      const width = trackRef.current?.clientWidth || 1;
      setDragOffset((dx / width) * 100);
    }
  }

  function endDrag() {
    if (!dragState.current.active) return;
    const wasXDrag = dragState.current.axisLocked === "x" && dragState.current.moved;
    dragState.current.active = false;

    if (wasXDrag) {
      const threshold = 12; // % of card width
      if (dragOffset < -threshold) goTo(index + 1);
      else if (dragOffset > threshold) goTo(index - 1);
      setDragging(false);
      setDragOffset(0);
      // clear onDragStateChange on next tick so the click-suppression on
      // the parent <Link> still sees "was dragging" for this click event
      requestAnimationFrame(() => onDragStateChange?.(false));
    }
    dragState.current.axisLocked = null;
    dragState.current.moved = false;
  }

  function handleArrow(e: React.MouseEvent, dir: -1 | 1) {
    e.preventDefault();
    e.stopPropagation();
    markInteracted();
    goTo(index + dir);
  }

  const activeSrc = broken && fallbackSrc ? fallbackSrc : images[0]?.src;

  if (broken || count === 0) {
    return (
      <div className={`relative ${aspectClassName} w-full overflow-hidden ${bgClassName}`}>
        {activeSrc ? (
          <Image
            src={activeSrc}
            alt={images[0]?.alt ?? ""}
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-10">
            <div className="h-full w-full max-w-[220px]">
              <TShirtSilhouette fit={fit} hex={hex} />
            </div>
            <span className="label absolute bottom-4 left-4 text-ink/35">Vista previa</span>
          </div>
        )}
      </div>
    );
  }

  const translatePct = -index * 100 + dragOffset;

  return (
    <div
      className={`group/carousel relative ${aspectClassName} w-full overflow-hidden select-none ${bgClassName}`}
      style={{ touchAction: hasMultiple ? "pan-y" : undefined }}
      onPointerEnter={hasMultiple ? markInteracted : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
      role={hasMultiple ? "group" : undefined}
      aria-roledescription={hasMultiple ? "carrusel" : undefined}
    >
      <div
        ref={trackRef}
        className="flex h-full"
        style={{
          transform: `translateX(${translatePct}%)`,
          transition: dragging ? "none" : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {images.map((img, i) => {
          const shouldLoad = i === 0 || interacted;
          return (
            <div key={img.src} className="relative h-full w-full flex-shrink-0">
              {shouldLoad ? (
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  unoptimized
                  draggable={false}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  priority={priority && i === 0}
                  loading={priority && i === 0 ? undefined : "lazy"}
                  className="object-cover pointer-events-none"
                  onError={() => setBroken(true)}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {hasMultiple && showControls && (
        <>
          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={(e) => handleArrow(e, -1)}
            disabled={index === 0}
            className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-paper/80 text-ink opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover/carousel:opacity-100 disabled:pointer-events-none disabled:opacity-0 focus-visible:opacity-100"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={(e) => handleArrow(e, 1)}
            disabled={index === count - 1}
            className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-paper/80 text-ink opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover/carousel:opacity-100 disabled:pointer-events-none disabled:opacity-0 focus-visible:opacity-100"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="pointer-events-none absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {images.map((img, i) => (
              <span
                key={img.src}
                className={`h-1 rounded-full transition-all duration-200 ${
                  i === index ? "w-3 bg-paper" : "w-1 bg-paper/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
