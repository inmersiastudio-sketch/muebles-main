"use client";

import Link from "next/link";
import { Box, Cuboid } from "lucide-react";
import { FavoriteButton } from "../favorites/FavoriteButton";
import type { ProductListItem } from "@/types";
import { ImageWithFallback } from "../ui/ImageWithFallback";

type Props = {
  product: ProductListItem;
};

export function ProductCard({ product }: Props) {
  const hasDiscount = product.hasDiscount && product.discountPercentage && product.discountPercentage > 0;
  const hasAR = product.hasAr || Boolean(product.glbUrl || product.usdzUrl);

  return (
    <article className="group relative flex flex-col bg-transparent overflow-hidden transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-[#f5f5f5] overflow-hidden">
        <Link href={`/productos/${product.slug}`} className="block w-full h-full">
          {product.imageUrl ? (
            <>
              <ImageWithFallback
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Box className="w-8 h-8 text-[var(--gray-300)]" />
            </div>
          )}
        </Link>
        
        {/* Badge 3D/AR */}
        {hasAR && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[#1c2421] px-2 py-0.5 rounded-none text-[9px] font-bold tracking-wider shadow-sm border border-[#e1e6e3]">
              <Cuboid className="w-2.5 h-2.5 text-[#0b6e5e]" />
              3D
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <FavoriteButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
            }}
            size="sm"
            className="!bg-white/95 !backdrop-blur-sm !shadow-md !rounded-none hover:!scale-105 transition-transform"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col items-center pt-4 pb-3">
        {/* Store */}
        {product.store?.name && (
          <p className="text-[9px] text-[#0b6e5e] font-bold uppercase tracking-[0.15em] mb-1 truncate">
            {product.store.name}
          </p>
        )}

        {/* Title */}
        <Link href={`/productos/${product.slug}`} className="block group/title max-w-full">
          <h3 className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-[#1c2421] text-center leading-snug line-clamp-1 group-hover/title:text-[#0b6e5e] transition-colors px-2">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-1 flex flex-col items-center">
          {hasDiscount && product.originalPrice && (
            <p className="text-[10px] text-[#8a9690] line-through">
              ${product.originalPrice.toLocaleString("es-AR")}
            </p>
          )}
          <span className="text-[14px] sm:text-[15px] font-black text-[#1c2421] tracking-tight">
            ${product.price.toLocaleString("es-AR")}
          </span>
        </div>

      </div>
    </article>
  );
}
