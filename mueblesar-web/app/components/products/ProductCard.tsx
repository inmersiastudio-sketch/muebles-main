"use client";

import Link from "next/link";
import { Heart, Box, Truck, Cuboid } from "lucide-react";
import { FavoriteButton } from "../favorites/FavoriteButton";
import type { ProductListItem } from "@/types";

type Props = {
  product: ProductListItem;
};

export function ProductCard({ product }: Props) {
  const hasDiscount = product.hasDiscount && product.discountPercentage && product.discountPercentage > 0;
  const hasAR = product.hasAr || Boolean(product.glbUrl || product.usdzUrl);

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

        {/* Badge 3D/AR */}
        {hasAR && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[#001d3d] px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm border border-[#e8e0d4]">
              <Cuboid className="w-3 h-3" />
              3D
            </span>
          </div>
        )}

        {/* Badge de descuento (solo si no tiene AR, o se superpone) */}
        {hasDiscount && !hasAR && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-[var(--error-500)] text-white px-2 py-1 rounded-lg text-[10px] font-bold">
              -{product.discountPercentage}%
            </span>
          </div>
        )}

        {/* Descuento cuando también tiene AR (se pone abajo a la izq) */}
        {hasDiscount && hasAR && (
          <div className="absolute top-12 left-3 z-10">
            <span className="bg-[var(--error-500)] text-white px-2 py-1 rounded-lg text-[10px] font-bold">
              -{product.discountPercentage}%
            </span>
          </div>
        )}

        {/* Badge de consulta de envío */}
        {product.price > 50000 && (
          <div className="absolute top-3 right-12">
            <span className="inline-flex items-center gap-1 bg-[var(--success-600)] text-white px-2 py-1 rounded-lg text-[10px] font-semibold">
              <Truck className="w-3 h-3" />
              Envío
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
      <div className="flex flex-col flex-1 p-4">
        {/* Store */}
        {product.store?.name && (
          <p className="text-[10px] text-[#0b6e5e] font-semibold uppercase tracking-wider mb-1.5 truncate">
            {product.store.name}
          </p>
        )}

        {/* Title */}
        <Link href={`/productos/${product.slug}`} className="block group/title">
          <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#1c2421] leading-snug line-clamp-2 mb-1.5 group-hover/title:text-[#0b6e5e] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Category */}
        <p className="text-[11px] text-[#61706a] mb-3">{product.category}</p>

        {/* Price Section */}
        <div className="mt-auto pt-2 border-t border-[#e1e6e3]/60 flex items-center justify-between gap-2">
          <div>
            {/* Precio original tachado */}
            {hasDiscount && product.originalPrice && (
              <p className="text-[10px] text-[#8a9690] line-through">
                ${product.originalPrice.toLocaleString("es-AR")}
              </p>
            )}

            {/* Precio actual */}
            <span className="text-base sm:text-lg font-bold text-[#1c2421]">
              ${product.price.toLocaleString("es-AR")}
            </span>
          </div>

          {/* Action indicator link */}
          <span className="text-[11px] font-semibold text-[#0b6e5e] group-hover:underline flex items-center gap-0.5">
            Ver detalle
          </span>
        </div>
      </div>
    </article>
  );
}
