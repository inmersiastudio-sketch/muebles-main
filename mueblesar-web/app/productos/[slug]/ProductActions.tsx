"use client";

import { Box, ShoppingCart, Smartphone } from "lucide-react";
import { AddToCartButton } from "@/app/components/cart/AddToCartButton";
import { ARPreview } from "@/app/components/products/ARPreview";

interface ProductActionsProps {
  productId: number;
  storeId: number | null;
  productName: string;
  productSlug: string;
  productPrice: number;
  productImage?: string;
  storeName?: string;
  storeSlug?: string;
  storeWhatsapp?: string | null;
  waLink?: string;
  arLink?: string;
  glbLink?: string;
  usdzLink?: string;
  widthCm?: number;
  depthCm?: number;
  heightCm?: number;
  disabled?: boolean;
}

export function ProductActions({
  productId,
  storeId,
  productName,
  productSlug,
  productPrice,
  productImage,
  storeName,
  storeSlug,
  storeWhatsapp,
  waLink,
  arLink,
  glbLink,
  usdzLink,
  widthCm,
  depthCm,
  heightCm,
  disabled = false,
}: ProductActionsProps) {
  return (
    <div className="space-y-3">
      {/* AR Button - Orange accent */}
      {(arLink || glbLink) && (
        <div className="w-full">
          <ARPreview
            arUrl={arLink}
            glbUrl={glbLink}
            usdzUrl={usdzLink}
            productId={productId}
            storeId={storeId}
            productName={productName}
            widthCm={widthCm}
            depthCm={depthCm}
            heightCm={heightCm}
          />
        </div>
      )}

      {/* Add to Cart Button - Dark */}
      <AddToCartButton
        product={{
          id: productId,
          slug: productSlug,
          name: productName,
          price: productPrice,
          imageUrl: productImage ?? null,
          storeName: storeName ?? "Sin tienda",
          storeSlug: storeSlug ?? "",
          storeWhatsapp: storeWhatsapp ?? null,
        }}
        className="w-full !h-12 !rounded-xl !bg-[#0f172a] !font-bold text-white shadow-sm transition-all hover:!bg-[#1e293b] active:scale-[0.98]"
        disabled={disabled}
      />
    </div>
  );
}
