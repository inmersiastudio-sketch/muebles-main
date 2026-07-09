"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, getCart, addToCart as addToCartUtil, removeFromCart as removeFromCartUtil, updateQuantity as updateQuantityUtil, clearCart as clearCartUtil } from "../lib/cart";

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: number) => void;
  updateItemQuantity: (productId: number, quantity: number) => void;
  clearItems: () => void;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getCart());
    setMounted(true);
  }, []);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    const newCart = addToCartUtil(item);
    setItems(newCart);
  };

  const removeItem = (productId: number) => {
    const newCart = removeFromCartUtil(productId);
    setItems(newCart);
  };

  const updateItemQuantity = (productId: number, quantity: number) => {
    const newCart = updateQuantityUtil(productId, quantity);
    setItems(newCart);
  };

  const clearItems = () => {
    clearCartUtil();
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItemQuantity, clearItems, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
