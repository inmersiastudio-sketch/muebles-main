"use client";

import { AddToCartButton } from "@/app/components/cart/AddToCartButton";
import { WhatsappInquiryButton } from "@/app/components/inquiry/WhatsappInquiryButton";
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
  arLink,
  glbLink,
  usdzLink,
  widthCm,
  depthCm,
  heightCm,
  disabled = false,
}: ProductActionsProps) {
  const product = {
    id: productId,
    slug: productSlug,
    name: productName,
    price: productPrice,
    imageUrl: productImage ?? null,
    storeName: storeName ?? "Muebleria",
    storeSlug: storeSlug ?? "",
    storeWhatsapp: storeWhatsapp ?? null,
  };

  return (
    <div className="space-y-3">
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

      {storeId ? (
        <WhatsappInquiryButton
          productId={productId}
          storeId={storeId}
          productName={productName}
          productPrice={productPrice}
          selectedVariant={null}
          storeWhatsapp={storeWhatsapp}
          disabled={disabled}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        />
      ) : (
        <AddToCartButton
          product={product}
          className="h-12 w-full rounded-xl bg-[#0f172a] font-bold text-white shadow-sm hover:bg-[#1e293b]"
          disabled={disabled}
        />
      )}
    </div>
  );
}
