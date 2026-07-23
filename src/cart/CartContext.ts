import { createContext } from "react";
import type { CartItem } from "../types/cart";
import type { Product } from "../types/product";

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | undefined>(
  undefined,
);
