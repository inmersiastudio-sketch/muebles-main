"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FavoriteButton } from "../favorites/FavoriteButton";
import { AddToCartButton } from "../cart/AddToCartButton";
import { Cuboid } from "lucide-react";
import type { CatalogProduct } from "@/app/lib/api";

interface Props {
  product: CatalogProduct;
  storeSlug: string;
  storeName: string;
}

export function CatalogProductCard({ product, storeSlug, storeName }: Props) {
  const image = product.images?.[0]?.url ?? product.imageUrl;
  const secondaryImage = product.images?.[1]?.url;
  const price = typeof product.price === "string" ? Number(product.price) : product.price;

  const hasAR = Boolean(product.glbUrl || product.usdzUrl);

  const track = (name: string, props?: Record<string, unknown>) => {
    try {
      window.dispatchEvent(new CustomEvent("ar-event", { detail: { name, props } }));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="group relative flex flex-col min-w-[280px] w-full max-w-[360px] snap-start">
      {/* Image Container */}
      <Link
        href={`/catalog/${storeSlug}/${product.slug}`}
        onClick={() => track("catalog_card_click", { slug: product.slug, hasAr: hasAR, store: storeSlug })}
        className="relative block w-full overflow-hidden rounded-md bg-stone-50 aspect-[4/5]"
      >
        {image ? (
          <>
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-all duration-500 ease-out group-hover:scale-105 ${secondaryImage ? 'group-hover:opacity-0' : ''}`}
            />
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} vista alternativa`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-105"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">Sin imagen</div>
        )}

        {/* Badges Overlay */}
        <div className="absolute left-0 top-0 flex flex-col gap-2">
          {product.featured && (
            <div className="bg-[#ffe815] px-3 py-1 text-[11px] font-bold text-slate-900 tracking-wide">
              Más vendido
            </div>
          )}
          {hasAR && (
            <div className="ml-3 mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
              <Cuboid size={13} className="text-emerald-600" />
              Ver en 3D
            </div>
          )}
          {product.inStock === false && (
            <div className="ml-3 mt-3 inline-flex items-center rounded-full bg-slate-800/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
              Agotado
            </div>
          )}
        </div>
      </Link>

      <div className="mt-5 flex flex-col gap-1 px-1">
        {/* Status/Category */}
        <div className="text-[13px] font-bold text-[#d24c00]">
          Novedad
        </div>

        {/* Title & Description */}
        <div className="flex flex-col mb-1.5">
          <Link
            href={`/catalog/${storeSlug}/${product.slug}`}
            className="text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-primary transition-colors tracking-tight uppercase"
          >
            {product.name}
          </Link>
          <div className="text-[13px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
            {product.category}
          </div>
        </div>

        {/* Price */}
        <div className="text-[26px] font-black tracking-tight text-[#002f5e] flex items-start mt-1">
          {Math.floor(price ?? 0)}
          <span className="text-sm font-bold mt-1.5 ml-[1px]">
            ,{(price ?? 0) % 1 === 0 ? "00" : String(price?.toFixed(2)).split('.')[1]}
          </span>
        </div>

        {/* Rating (Placeholder to match the design) */}
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex text-[#002f5e]">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <svg className="w-3.5 h-3.5 fill-current text-slate-300" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          </div>
          <span className="text-sm font-medium text-slate-500">(42)</span>
        </div>

        {/* Persistent Action Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: price ?? 0,
              imageUrl: image ?? null,
              storeName: storeName,
              storeSlug: storeSlug,
              storeWhatsapp: null,
            }}
            variant="compact"
            className="!h-10 !w-10 !bg-[#0058a3] !text-white hover:!bg-[#004f93] hover:scale-105 transition-all shadow-sm focus:ring-2 focus:ring-[#0058a3] focus:ring-offset-2 !border-0"
          />
          <FavoriteButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: price ?? 0,
              imageUrl: image,
              category: product.category,
              room: product.room,
              style: product.style,
              description: product.description,
              storeName: storeName,
              storeSlug: storeSlug,
            }}
            size="md"
            className="!bg-slate-100 !text-slate-600 !border-transparent hover:!bg-slate-200 hover:!text-slate-800 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
