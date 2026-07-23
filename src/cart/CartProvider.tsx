import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";
import type { CartItem } from "../types/cart";
import type { Product } from "../types/product";
import { cartStorage } from "../utils/cartStorage";
import { CartContext } from "./CartContext";

type CartAction =
  | { type: "add"; product: Product }
  | { type: "update"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "add": {
      if (action.product.quantity <= 0) return items;

      const existingItem = items.find(
        (item) => item.product._id === action.product._id,
      );

      if (!existingItem) {
        return [...items, { product: action.product, quantity: 1 }];
      }

      return items.map((item) =>
        item.product._id === action.product._id
          ? {
              ...item,
              product: action.product,
              quantity: Math.min(item.quantity + 1, action.product.quantity),
            }
          : item,
      );
    }

    case "update":
      if (action.quantity <= 0) {
        return items.filter((item) => item.product._id !== action.productId);
      }

      return items.map((item) =>
        item.product._id === action.productId
          ? {
              ...item,
              quantity: Math.min(
                Math.max(1, Math.floor(action.quantity)),
                Math.max(1, item.product.quantity),
              ),
            }
          : item,
      );

    case "remove":
      return items.filter((item) => item.product._id !== action.productId);

    case "clear":
      return [];

    default:
      return items;
  }
}

export function CartProvider({ children }: PropsWithChildren) {
  const [items, dispatch] = useReducer(cartReducer, undefined, cartStorage.load);

  useEffect(() => {
    cartStorage.save(items);
  }, [items]);

  const addItem = useCallback((product: Product) => {
    dispatch({ type: "add", product });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "update", productId, quantity });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "remove", productId });
  }, []);

  const clearCart = useCallback(() => {
    cartStorage.clear();
    dispatch({ type: "clear" });
  }, []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
