"use client";

import Link from "next/link";
import { Heart, Box, Truck } from "lucide-react";
import { FavoriteButton } from "../favorites/FavoriteButton";
import { AddToCartButton } from "../cart/AddToCartButton";
import type { ProductListItem } from "@/types";

type Props = {
  product: ProductListItem;
};

export function ProductCard({ product }: Props) {
  const hasDiscount = product.hasDiscount && product.discountPercentage && product.discountPercentage > 0;

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl border border-[var(--gray-200)] overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-[var(--gray-50)] to-white overflow-hidden">
        <Link href={`/productos/${product.slug}`} className="block w-full h-full">
          {product.imageUrl ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[var(--gray-100)] flex items-center justify-center">
                <Box className="w-8 h-8 text-[var(--gray-300)]" />
              </div>
            </div>
          )}
        </Link>

        {/* Badge de descuento */}
        {hasDiscount && (
          <div className="absolute top-3 left-3">
            <span className="bg-[var(--error-500)] text-white px-2 py-1 rounded-lg text-[10px] font-bold">
              -{product.discountPercentage}%
            </span>
          </div>
        )}

        {/* Badge de envío gratis */}
        {product.price > 50000 && (
          <div className="absolute top-3 right-12">
            <span className="inline-flex items-center gap-1 bg-[var(--success-600)] text-white px-2 py-1 rounded-lg text-[10px] font-semibold">
              <Truck className="w-3 h-3" />
              Gratis
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <FavoriteButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
            }}
            size="sm"
            className="!bg-white/95 !backdrop-blur-sm !shadow-md hover:!scale-110 transition-transform"
          />
        </div>

        {/* Out of Stock */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-[var(--gray-800)] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        {/* Store */}
        {product.store?.name && (
          <p className="text-[10px] sm:text-[11px] text-[var(--gray-400)] uppercase tracking-wide mb-1 truncate">
            {product.store.name}
          </p>
        )}

        {/* Title */}
        <Link href={`/productos/${product.slug}`}>
          <h3 className="text-sm sm:text-[15px] font-medium text-[var(--gray-900)] leading-snug line-clamp-2 mb-2 group-hover:text-[var(--primary-600)] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Category */}
        <p className="text-[10px] text-[var(--gray-400)] mb-2">{product.category}</p>

        {/* Price Section */}
        <div className="mt-auto pt-2">
          {/* Precio original tachado */}
          {hasDiscount && product.originalPrice && (
            <p className="text-[11px] text-[var(--gray-400)] line-through">
              ${product.originalPrice.toLocaleString("es-AR")}
            </p>
          )}

          {/* Precio actual */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-lg sm:text-xl font-bold text-[var(--gray-900)]">
              ${product.price.toLocaleString("es-AR")}
            </span>
            {product.price > 50000 && (
              <span className="text-[10px] text-[var(--success-600)] font-medium">
                Envío gratis
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl || null,
              storeName: product.store?.name || "Sin tienda",
              storeSlug: product.store?.slug || "",
              storeWhatsapp: null,
            }}
            className="w-full !h-8 !rounded-lg !bg-[var(--primary-600)] !text-white !text-xs !font-medium hover:!bg-[var(--primary-700)] active:!scale-[0.98] transition-all"
          />
        </div>
      </div>
    </article>
  );
}
