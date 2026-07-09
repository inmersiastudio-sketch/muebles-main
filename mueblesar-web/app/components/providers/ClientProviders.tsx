"use client";

import { ReactNode } from "react";
import { CartProvider } from "../../context/CartContext";
import { ToastProvider } from "../../context/ToastContext";
import { ToastContainer } from "../ui/ToastContainer";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        {children}
        <ToastContainer />
      </CartProvider>
    </ToastProvider>
  );
}
