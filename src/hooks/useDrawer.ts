"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento estándar de drawer/overlay: bloquea el scroll del body,
 * atrapa el foco con Tab/Shift+Tab, cierra con Escape y devuelve el foco
 * al elemento que abrió el drawer al cerrarse.
 */
export function useDrawer(
  isOpen: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>
) {
  const triggerRef = useRef<Element | null>(null);

  // Cerrado: el panel sigue en el DOM (solo desplazado fuera de pantalla con
  // CSS), así que sin esto Tab/lectores de pantalla igual entran a sus
  // enlaces y botones invisibles. `inert` lo saca por completo de la
  // navegación/accesibilidad mientras está cerrado, sin tocar el layout.
  useEffect(() => {
    const container = containerRef.current;
    if (container) container.inert = !isOpen;
  }, [isOpen, containerRef]);

  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const container = containerRef.current;
    container?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !container) return;
      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [isOpen, onClose, containerRef]);
}
