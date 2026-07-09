"use client";

import { Heart } from "lucide-react";
import { FavoriteItem, useFavorites } from "../../lib/favorites";
import { useToast } from "../../context/ToastContext";

type Props = {
  product: FavoriteItem;
  size?: "sm" | "md";
  className?: string;
};

export function FavoriteButton({ product, size = "md", className = "" }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { success, info } = useToast();
  const active = isFavorite(product.slug);

  const baseClasses =
    "inline-flex items-center justify-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const sizeClasses = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const colorClasses = active
    ? "bg-white shadow-sm text-red-500"
    : "bg-white/90 shadow-sm text-[#999999] hover:text-[#666666]";

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`${baseClasses} ${sizeClasses} ${colorClasses} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product);
        if (active) {
          info(`${product.name} eliminado de favoritos`);
        } else {
          success(`${product.name} agregado a favoritos`);
        }
      }}
    >
      <Heart className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"} ${active ? "fill-current" : ""}`} />
    </button>
  );
}
