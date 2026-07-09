"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { ARPreview } from "./ARPreview";
import { AddToCartButton } from "../cart/AddToCartButton";
import { InquiryModal } from "../inquiry/InquiryModal";
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
  disabled?: boolean;           // disable actions when product is out of stock
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
  waLink,
  arLink,
  glbLink,
  usdzLink,
  widthCm,
  depthCm,
  heightCm,
  disabled = false,
  selectedVariant,
}: Props) {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const track = (name: string, props?: Record<string, unknown>) => {
    try {
      window.dispatchEvent(new CustomEvent("ar-event", { detail: { name, props } }));
    } catch (e) {
      // ignore
    }
    console.info("[analytics]", name, props ?? {});
  };

  const handleWhatsAppClick = () => {
    track("wa_click", { product: productName, variant: selectedVariant?.id });
    setIsInquiryOpen(true);
  };

  return (
    <div className="space-y-4 pt-2">
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
        className="w-full !bg-[#0058a3] hover:!bg-[#004f93] !rounded-full !h-14 !font-bold shadow-md transition-transform active:scale-[0.98] touch-manipulation"
        disabled={disabled}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        {storeWhatsapp ? (
          <Button 
            variant="whatsapp" 
            size="lg" 
            className="flex-1 rounded-full h-14 sm:h-12 font-bold shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 touch-manipulation"
            onClick={handleWhatsAppClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
            Consultar WhatsApp
          </Button>
        ) : (
          <Button variant="secondary" size="lg" disabled className="flex-1 rounded-full h-14 sm:h-12 font-bold touch-manipulation">
            WhatsApp no disponible
          </Button>
        )}

        <InquiryModal
          isOpen={isInquiryOpen}
          onClose={() => setIsInquiryOpen(false)}
          productId={productId}
          storeId={storeId || 0}
          productName={productName}
          productPrice={selectedVariant?.pricing.salePrice || productPrice}
          variant={selectedVariant || undefined}
          storeWhatsApp={storeWhatsapp || undefined}
        />

        {arLink || glbLink ? (
          <div className="flex-1">
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
        ) : (
          <Button variant="ghost" size="lg" disabled title="Este producto aún no tiene modelo AR disponible" className="flex-1 rounded-full h-14 sm:h-12 font-bold bg-slate-100 text-slate-500 border border-slate-200 touch-manipulation">
            AR no disponible
          </Button>
        )}
      </div>
    </div>
  );
}
