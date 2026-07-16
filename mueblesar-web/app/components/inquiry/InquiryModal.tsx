"use client";

import { useState } from "react";
import { X, Phone, User, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import type { ProductVariant } from "@/types";
import { InquiryProductPreview } from "./InquiryProductPreview";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  storeId: number;
  productName: string;
  productPrice: number;
  variant?: ProductVariant;
  storeWhatsApp?: string;
  imageUrl?: string | null;
  glbUrl?: string | null;
  usdzUrl?: string | null;
}

export function InquiryModal({
  isOpen,
  onClose,
  productId,
  storeId,
  productName,
  productPrice,
  variant,
  storeWhatsApp,
  imageUrl,
  glbUrl,
  usdzUrl,
}: InquiryModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExtraFields, setShowExtraFields] = useState(false);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

      // Guardar la consulta en el sistema
      const response = await fetch(`${API_BASE}/api/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          storeId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail || null,
          variantId: variant?.id || null,
          message: formData.message || null,
          productName,
          productPrice,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar la consulta");
      }

      // Éxito - mostrar mensaje para que el usuario abra WhatsApp con un clic
      setIsSuccess(true);
    } catch (err) {
      setError("No pudimos guardar tu consulta. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    const variantText = variant
      ? ` (${variant.attributes.color || ""} ${variant.attributes.size || ""})`.trim()
      : "";

    const whatsappMessage = `Hola! Me interesa el ${productName}${variantText} que vi en Amobly.\n\nPrecio: $${productPrice.toLocaleString("es-AR")}\n\nMi nombre es ${formData.customerName}.${formData.message ? `\n\nComentario: ${formData.message}` : ""}`;
    const cleanPhone = storeWhatsApp ? storeWhatsApp.replace(/\D/g, "") : "";
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">¡Consulta guardada!</h3>
          <p className="text-slate-500 text-xs mb-5">
            La consulta fue registrada en el sistema. Presioná el botón de abajo para enviar el mensaje por WhatsApp a la mueblería.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              onClose();
              setIsSuccess(false);
              setFormData({ customerName: "", customerPhone: "", customerEmail: "", message: "" });
              setShowExtraFields(false);
            }}
            className="inline-flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all text-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
            Abrir WhatsApp
          </a >
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)]">
          <div>
            <h3 className="text-base font-bold text-white">Consultar producto</h3>
            <p className="text-white/80 text-xs truncate max-w-[280px]">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1 scrollbar-thin">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <InquiryProductPreview
            productName={productName}
            imageUrl={imageUrl}
            glbUrl={glbUrl}
            usdzUrl={usdzUrl}
          />

          {/* Product Info */}
          {variant && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Variante seleccionada</p>
                <p className="font-semibold text-slate-700">{variant.name}</p>
              </div>
              <p className="font-bold text-[var(--primary-600)]">
                ${variant.pricing.salePrice.toLocaleString("es-AR")}
              </p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              <User size={12} className="inline mr-1" />
              Tu nombre *
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[var(--primary-600)] focus:ring-2 focus:ring-[var(--primary-600)]/20 outline-none transition-all"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              <Phone size={12} className="inline mr-1" />
              Tu WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[var(--primary-600)] focus:ring-2 focus:ring-[var(--primary-600)]/20 outline-none transition-all"
              placeholder="Ej: +54 9 351 234-5678"
            />
          </div>

          {/* Toggle Extra Fields */}
          {!showExtraFields ? (
            <button
              type="button"
              onClick={() => setShowExtraFields(true)}
              className="text-xs text-[var(--primary-600)] font-semibold hover:underline flex items-center gap-1 py-1"
            >
              + Agregar email o comentario
            </button>
          ) : (
            <div className="space-y-3.5 pt-1 border-t border-dashed border-slate-200 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[var(--primary-600)] focus:ring-2 focus:ring-[var(--primary-600)]/20 outline-none transition-all"
                  placeholder="juan@email.com"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  <MessageSquare size={12} className="inline mr-1" />
                  Comentario <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[var(--primary-600)] focus:ring-2 focus:ring-[var(--primary-600)]/20 outline-none transition-all resize-none"
                  placeholder="¿Tenés alguna duda o detalle para aclarar?"
                />
              </div>
            </div>
          )}

          {/* Privacy note */}
          <p className="text-[10px] text-slate-400 text-center">
            Tus datos solo se compartirán con la mueblería para procesar la consulta.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-white font-semibold shadow-lg shadow-[var(--primary-600)]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Phone size={16} />
                Confirmar Consulta
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InquiryModal;
