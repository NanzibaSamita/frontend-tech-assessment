import type { CartItem } from "../types/cart";

const CART_KEY = "ecommerce_cart";

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as CartItem;

  return (
    typeof item.quantity === "number" &&
    item.quantity > 0 &&
    Boolean(item.product) &&
    typeof item.product._id === "string" &&
    typeof item.product.name === "string" &&
    typeof item.product.price === "number" &&
    typeof item.product.quantity === "number"
  );
}

export const cartStorage = {
  load(): CartItem[] {
    const rawValue = localStorage.getItem(CART_KEY);

    if (!rawValue) return [];

    try {
      const parsed = JSON.parse(rawValue) as unknown;

      if (!Array.isArray(parsed)) {
        localStorage.removeItem(CART_KEY);
        return [];
      }

      return parsed.filter(isCartItem).map((item) => ({
        ...item,
        quantity: Math.min(item.quantity, Math.max(item.product.quantity, 1)),
      }));
    } catch {
      localStorage.removeItem(CART_KEY);
      return [];
    }
  },

  save(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  clear(): void {
    localStorage.removeItem(CART_KEY);
  },
};
