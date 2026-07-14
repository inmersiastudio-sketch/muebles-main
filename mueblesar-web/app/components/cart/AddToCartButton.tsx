"use client";

import { MessageCircle, Send } from "lucide-react";
import { getInquiryDestination, type InquiryProduct } from "../../lib/cart";

type InquiryActionProps = {
  product: InquiryProduct;
  variant?: "default" | "compact";
  className?: string;
  disabled?: boolean;
  showIconOnly?: boolean;
};

// Kept at this path while catalog cards migrate away from the former cart action.
export function AddToCartButton({
  product,
  variant = "default",
  className = "",
  disabled = false,
  showIconOnly = false,
}: InquiryActionProps) {
  const destination = getInquiryDestination(product);
  const label = destination.isWhatsApp ? "Consultar por WhatsApp" : "Enviar consulta";
  const Icon = destination.isWhatsApp ? MessageCircle : Send;

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={`flex items-center justify-center gap-2 rounded-lg bg-slate-200 px-6 py-3 font-medium text-slate-500 ${className}`}
        aria-label="Producto no disponible"
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        {variant !== "compact" && !showIconOnly && "Producto no disponible"}
      </button>
    );
  }

  const baseClassName =
    variant === "compact"
      ? "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90"
      : "flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90";

  return (
    <a
      href={destination.href}
      target={destination.isWhatsApp ? "_blank" : undefined}
      rel={destination.isWhatsApp ? "noopener noreferrer" : undefined}
      onClick={(event) => event.stopPropagation()}
      className={`${baseClassName} ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {variant !== "compact" && !showIconOnly && label}
    </a>
  );
}
