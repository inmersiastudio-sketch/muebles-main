"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { InquiryModal } from "./InquiryModal";
import type { ProductVariant } from "@/types";

interface WhatsappInquiryButtonProps {
  productId: number;
  storeId: number;
  productName: string;
  productPrice: number;
  selectedVariant: ProductVariant | null;
  storeWhatsapp?: string | null;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  imageUrl?: string | null;
  glbUrl?: string | null;
  usdzUrl?: string | null;
}

export function WhatsappInquiryButton({
  productId,
  storeId,
  productName,
  productPrice,
  selectedVariant,
  storeWhatsapp,
  className,
  children,
  disabled = false,
  imageUrl,
  glbUrl,
  usdzUrl,
}: WhatsappInquiryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasWhatsApp = Boolean(storeWhatsapp?.replace(/\D/g, ""));
  const label = hasWhatsApp ? "Consultar por WhatsApp" : "Enviar consulta";
  const Icon = hasWhatsApp ? MessageCircle : Send;

  const handleClick = () => {
    if (disabled) return;

    try {
      window.dispatchEvent(new CustomEvent("ar-event", {
        detail: { name: "inquiry_click", props: { product: productName, variant: selectedVariant?.id } },
      }));
    } catch {
      // Analytics must not prevent a customer from sending a consultation.
    }

    setIsOpen(true);
  };

  return (
    <>
      <button type="button" onClick={handleClick} className={className} disabled={disabled}>
        {children || (
          <>
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </>
        )}
      </button>

      <InquiryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productId={productId}
        storeId={storeId}
        productName={productName}
        productPrice={selectedVariant?.pricing.salePrice || productPrice}
        variant={selectedVariant || undefined}
        storeWhatsApp={storeWhatsapp || undefined}
        imageUrl={imageUrl}
        glbUrl={glbUrl}
        usdzUrl={usdzUrl}
      />
    </>
  );
}
