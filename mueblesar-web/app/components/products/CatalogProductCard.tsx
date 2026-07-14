"use client";

import Link from "next/link";
import { Cuboid } from "lucide-react";
import { AddToCartButton } from "../cart/AddToCartButton";
import { FavoriteButton } from "../favorites/FavoriteButton";
import type { CatalogProduct } from "@/app/lib/api";

interface Props {
  product: CatalogProduct;
  storeSlug: string;
  storeName: string;
}

function getPrice(value: unknown): number | null {
  if (typeof value === "string" && value.trim() === "") return null;

  const price = typeof value === "number" ? value : Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function formatPrice(price: number, currency?: string | null): string {
  const numberFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
  const currencyCode = currency?.trim().toUpperCase();

  if (!currencyCode || !/^[A-Z]{3}$/.test(currencyCode)) return numberFormat.format(price);

  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return numberFormat.format(price);
  }
}

export function CatalogProductCard({ product, storeSlug, storeName }: Props) {
  const image = product.images?.[0]?.url ?? product.imageUrl;
  const secondaryImage = product.images?.[1]?.url;
  const price = getPrice(product.price);
  const hasAR = Boolean(product.glbUrl || product.usdzUrl || product.arUrl);
  const canAddToCart = price !== null && Boolean(storeName.trim() && storeSlug.trim());

  const track = (name: string, props?: Record<string, unknown>) => {
    try {
      window.dispatchEvent(new CustomEvent("ar-event", { detail: { name, props } }));
    } catch {
      // Analytics must never prevent product navigation.
    }
  };

  return (
    <article className="group relative flex min-w-[280px] w-full max-w-[360px] snap-start flex-col">
      <Link
        href={`/catalog/${storeSlug}/${product.slug}`}
        onClick={() => track("catalog_card_click", { slug: product.slug, hasAr: hasAR, store: storeSlug })}
        className="relative block aspect-[4/5] w-full overflow-hidden rounded-md bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label={`Ver ${product.name}`}
      >
        {image ? (
          <>
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-all duration-500 ease-out ${secondaryImage ? "group-hover:opacity-0" : "group-hover:scale-105"}`}
            />
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Imagen no disponible</div>
        )}

        <div className="absolute left-0 top-0 flex flex-col gap-2">
          {product.featured && (
            <span className="bg-[#ffe815] px-3 py-1 text-[11px] font-bold tracking-wide text-slate-900">Destacado</span>
          )}
          {hasAR && (
            <span className="ml-3 mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
              <Cuboid size={13} className="text-emerald-600" aria-hidden="true" />
              Ver en 3D
            </span>
          )}
          {product.inStock === false && (
            <span className="ml-3 mt-3 inline-flex items-center rounded-full bg-slate-800/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
              Agotado
            </span>
          )}
        </div>
      </Link>

      <div className="mt-5 flex flex-col gap-1 px-1">
        <div className="mb-1.5 flex flex-col">
          <Link
            href={`/catalog/${storeSlug}/${product.slug}`}
            className="line-clamp-2 text-base font-bold uppercase leading-snug tracking-tight text-slate-900 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {product.name}
          </Link>
          {product.category?.trim() && (
            <p className="mt-0.5 line-clamp-1 text-[13px] font-medium text-slate-500">{product.category}</p>
          )}
        </div>

        {price !== null ? (
          <p className="mt-1 text-[26px] font-black tracking-tight text-[#002f5e]">{formatPrice(price, product.currency)}</p>
        ) : (
          <p className="mt-1 text-sm font-medium text-slate-600">A confirmar con la tienda</p>
        )}

        {price !== null && (
          <div className="mt-4 flex items-center gap-3">
            {canAddToCart && (
              <AddToCartButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price,
                  imageUrl: image ?? null,
                  storeName,
                  storeSlug,
                  storeWhatsapp: null,
                }}
                variant="compact"
                className="!h-10 !w-10 !border-0 !bg-[#0058a3] !text-white shadow-sm transition-all hover:!bg-[#004f93] hover:scale-105 focus:ring-2 focus:ring-[#0058a3] focus:ring-offset-2"
              />
            )}
            <FavoriteButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price,
                imageUrl: image,
                category: product.category,
                room: product.room,
                style: product.style,
                description: product.description,
                storeName,
                storeSlug,
              }}
              size="md"
              className="!border-transparent !bg-slate-100 !text-slate-600 shadow-sm hover:!bg-slate-200 hover:!text-slate-800"
            />
          </div>
        )}
      </div>
    </article>
  );
}
