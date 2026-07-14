"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { AddToCartButton } from "@/app/components/cart/AddToCartButton";
import { WhatsappInquiryButton } from "@/app/components/inquiry/WhatsappInquiryButton";
import { ARPreview } from "@/app/components/products/ARPreview";

interface StickyAddToCartProps {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    imageUrl?: string;
    storeName?: string;
    storeSlug?: string;
    storeWhatsapp?: string | null;
    storeId?: number;
  };
  arData?: {
    arUrl?: string;
    glbUrl?: string;
    usdzUrl?: string;
    widthCm?: number;
    depthCm?: number;
    heightCm?: number;
  };
  disabled?: boolean;
}

// Export name remains stable for catalog pages while the action is now inquiry-only.
export function StickyAddToCart({ product, arData, disabled = false }: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasAr = Boolean(arData?.arUrl || arData?.glbUrl);

  useEffect(() => {
    const handleScroll = () => {
      const mainActions = document.getElementById("product-main-actions");
      if (mainActions) {
        setIsVisible(mainActions.getBoundingClientRect().bottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-sticky-inquiry]")) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isExpanded]);

  if (!isVisible) return null;

  const inquiryProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl ?? null,
    storeName: product.storeName ?? "Muebleria",
    storeSlug: product.storeSlug ?? "",
    storeWhatsapp: product.storeWhatsapp ?? null,
  };

  return (
    <>
      {isExpanded && (
        <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setIsExpanded(false)} />
      )}

      <div
        data-sticky-inquiry
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--gray-200)] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {isExpanded && hasAr && arData && (
          <div className="border-b border-[var(--gray-100)] px-4 pt-4 pb-2">
            <div className="mb-4 flex items-center gap-3">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-14 w-14 border border-[var(--gray-200)] object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--gray-900)]">{product.name}</p>
                {product.storeName && (
                  <p className="text-xs text-[var(--gray-500)]">{product.storeName}</p>
                )}
              </div>
            </div>
            <ARPreview
              arUrl={arData.arUrl}
              glbUrl={arData.glbUrl}
              usdzUrl={arData.usdzUrl}
              productId={product.id}
              storeId={product.storeId}
              productName={product.name}
              widthCm={arData.widthCm}
              depthCm={arData.depthCm}
              heightCm={arData.heightCm}
            />
          </div>
        )}

        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--gray-900)]">{product.name}</p>
            {product.storeName && <p className="truncate text-xs text-[var(--gray-500)]">{product.storeName}</p>}
          </div>

          {hasAr && (
            <button
              type="button"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--gray-100)] text-[var(--gray-600)] transition-colors hover:bg-[var(--gray-200)]"
              aria-label="Ver opciones de realidad aumentada"
            >
              <ChevronUp className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>
          )}

          {product.storeId ? (
            <WhatsappInquiryButton
              productId={product.id}
              storeId={product.storeId}
              productName={product.name}
              productPrice={product.price}
              selectedVariant={null}
              storeWhatsapp={product.storeWhatsapp}
              disabled={disabled}
              className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            />
          ) : (
            <AddToCartButton
              product={inquiryProduct}
              className="h-11 shrink-0 rounded-xl px-5 text-sm font-semibold"
              disabled={disabled}
            />
          )}
        </div>
      </div>
    </>
  );
}
