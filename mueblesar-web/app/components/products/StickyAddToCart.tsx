"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Box, ChevronUp } from "lucide-react";
import { AddToCartButton } from "@/app/components/cart/AddToCartButton";
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

export function StickyAddToCart({ product, arData, disabled = false }: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showArModal, setShowArModal] = useState(false);

  useEffect(() => {
    // Show sticky bar after scrolling past the main add-to-cart button
    const handleScroll = () => {
      const mainActions = document.getElementById("product-main-actions");
      if (mainActions) {
        const rect = mainActions.getBoundingClientRect();
        // Show when main actions are scrolled out of view
        setIsVisible(rect.bottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close expanded state when clicking outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-sticky-bar]")) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isExpanded]);

  if (!isVisible) return null;

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString("es-AR")}`;
  };

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsExpanded(false)} />
      )}

      {/* Sticky Bar */}
      <div
        data-sticky-bar
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--gray-200)] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 md:hidden ${
          isExpanded ? "translate-y-0" : ""
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pt-4 pb-2 border-b border-[var(--gray-100)]">
            {/* Product Info */}
            <div className="flex items-center gap-3 mb-4">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-14 h-14 rounded-lg object-cover border border-[var(--gray-200)]"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--gray-900)] truncate">
                  {product.name}
                </p>
                <p className="text-lg font-bold text-[var(--gray-900)]">
                  {formatPrice(product.price)}
                </p>
                {product.storeName && (
                  <p className="text-xs text-[var(--gray-500)]">
                    {product.storeName}
                  </p>
                )}
              </div>
            </div>

            {/* AR Button (if available) */}
            {arData && (arData.arUrl || arData.glbUrl) && (
              <div className="mb-3">
                <ARPreview
                  arUrl={arData.arUrl}
                  glbUrl={arData.glbUrl}
                  usdzUrl={arData.usdzUrl}
                  productId={product.id}
                  productName={product.name}
                  widthCm={arData.widthCm}
                  depthCm={arData.depthCm}
                  heightCm={arData.heightCm}
                />
              </div>
            )}
          </div>
        )}

        {/* Collapsed / Always Visible Bar */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Price (collapsed) */}
          {!isExpanded && (
            <div className="flex-shrink-0">
              <p className="text-lg font-bold text-[var(--gray-900)]">
                {formatPrice(product.price)}
              </p>
            </div>
          )}

          {/* Expand Button (if AR available) */}
          {arData && (arData.arUrl || arData.glbUrl) && !isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 p-2 rounded-lg bg-[var(--gray-100)] text-[var(--gray-600)] hover:bg-[var(--gray-200)] transition-colors"
              aria-label="Ver más opciones"
            >
              <ChevronUp className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Add to Cart Button */}
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl ?? null,
              storeName: product.storeName ?? "Sin tienda",
              storeSlug: product.storeSlug ?? "",
              storeWhatsapp: product.storeWhatsapp ?? null,
            }}
            className="!h-11 !px-6 !rounded-xl !bg-[var(--gray-900)] !font-semibold text-white shadow-sm transition-all hover:!bg-[var(--gray-800)] active:scale-[0.98]"
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
}
