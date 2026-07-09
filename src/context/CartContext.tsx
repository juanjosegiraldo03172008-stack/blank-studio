"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getUnitPrice, type ColorId, type ProductLine, type Size } from "@/data/products";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  line: ProductLine;
  color: ColorId;
  size: Size;
  quantity: number;
}

export interface CartItemWithPrice extends CartItem {
  unitPrice: number | null;
  lineTotal: number | null;
}

interface CartContextValue {
  items: CartItem[];
  itemsWithPrice: CartItemWithPrice[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number | null;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "blank-studio-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage on mount (client-only, can't
    // read it during SSR render, so this must run in an effect).
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = (item) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.slug === item.slug && i.color === item.color && i.size === item.size
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + item.quantity,
        };
        return next;
      }
      return [...prev, { ...item, id: `${item.slug}-${item.color}-${item.size}-${Date.now()}` }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: string, quantity: number) =>
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0)
    );

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  /**
   * La escala de precio (Mayorista/Emprendedor/Pionero/Visionario/Detal) se
   * calcula sobre el TOTAL de unidades del pedido completo — mezclando
   * referencias, colores y tallas S-XL. La 2XL cuenta para ese total pero
   * usa su propia tabla de precio (más alta).
   */
  const itemsWithPrice = useMemo<CartItemWithPrice[]>(
    () =>
      items.map((item) => {
        const unitPrice = getUnitPrice(item.line, item.size, totalItems);
        return {
          ...item,
          unitPrice,
          lineTotal: unitPrice === null ? null : unitPrice * item.quantity,
        };
      }),
    [items, totalItems]
  );

  const totalPrice = useMemo(() => {
    if (itemsWithPrice.some((i) => i.unitPrice === null)) return null;
    return itemsWithPrice.reduce((sum, i) => sum + (i.lineTotal ?? 0), 0);
  }, [itemsWithPrice]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemsWithPrice,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
