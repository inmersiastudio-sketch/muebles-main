"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import type { CartItem } from "../../lib/cart";

type AddToCartButtonProps = {
  product: Omit<CartItem, "quantity">;
  variant?: "default" | "compact";
  className?: string;
  disabled?: boolean;
  showIconOnly?: boolean;
};

export function AddToCartButton({ product, variant = "default", className = "", disabled = false, showIconOnly = false }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { success } = useToast();
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    addItem(product);
    setJustAdded(true);
    success(`${product.name} agregado al carrito`);
    setTimeout(() => setJustAdded(false), 2000);
  };


  if (variant === "compact") {
    return (
      <button
        onClick={handleAdd}
        disabled={disabled}
        className={`flex h-9 w-9 items-center justify-center rounded-full ${disabled
          ? "bg-slate-300 cursor-not-allowed"
          : justAdded
            ? "bg-green-500"
            : "bg-primary hover:bg-primary/90"
          } text-white transition-all ${className}`}
        aria-label={disabled ? "Agotado" : "Agregar al carrito"}
        title={disabled ? "Agotado" : "Agregar al carrito"}
      >
        {justAdded ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-all ${disabled
        ? "bg-slate-300 text-slate-600 cursor-not-allowed"
        : justAdded
          ? "bg-green-500 text-white"
          : "bg-primary text-white hover:bg-primary/90"
        } ${className}`}
    >
      {justAdded ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {!showIconOnly && "Agregado"}
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
          {!showIconOnly && "Agregar al carrito"}
        </>
      )}
    </button>
  );
}
