"use client";

import { Button } from "../ui/Button";
import { ARPreview } from "./ARPreview";
import { AddToCartButton } from "../cart/AddToCartButton";
import { WhatsappInquiryButton } from "../inquiry/WhatsappInquiryButton";
import type { ProductVariant } from "@/types";

type Props = {
  productId: number;
  storeId?: number | null;
  productName: string;
  productSlug: string;
  productPrice: number;
  productImage?: string | null;
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
  selectedVariant?: ProductVariant | null;
};

export function PDPCTA({
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
  selectedVariant,
}: Props) {
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
    <div className="space-y-4 pt-2">
      {storeId ? (
        <WhatsappInquiryButton
          productId={productId}
          storeId={storeId}
          productName={productName}
          productPrice={productPrice}
          selectedVariant={selectedVariant ?? null}
          storeWhatsapp={storeWhatsapp}
          disabled={disabled}
          imageUrl={productImage}
          glbUrl={glbLink}
          usdzUrl={usdzLink}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 font-extrabold text-white shadow-md transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        />
      ) : (
        <AddToCartButton
          product={product}
          className="h-14 w-full rounded-full font-extrabold shadow-md"
          disabled={disabled}
        />
      )}

      {arLink || glbLink ? (
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
      ) : (
        <Button
          variant="ghost"
          size="lg"
          disabled
          title="Este producto aun no tiene modelo AR disponible"
          className="h-14 w-full rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-500"
        >
          AR no disponible
        </Button>
      )}
    </div>
  );
}
