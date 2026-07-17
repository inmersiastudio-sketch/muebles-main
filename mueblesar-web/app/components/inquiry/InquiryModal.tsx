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
    const hasWhatsApp = cleanPhone.length > 0;

    const resetAndClose = () => {
      onClose();
      setIsSuccess(false);
      setFormData({ customerName: "", customerPhone: "", customerEmail: "", message: "" });
      setShowExtraFields(false);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">¡Consulta guardada!</h3>
          <p className="text-slate-500 text-xs mb-5">
            {hasWhatsApp
              ? "La consulta fue registrada. Presioná el botón para enviar también el mensaje por WhatsApp a la mueblería."
              : "La consulta fue registrada y la mueblería podrá contactarte con los datos que ingresaste."}
          </p>

          {hasWhatsApp ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={resetAndClose}
              className="inline-flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all text-sm cursor-pointer"
            >
              Abrir WhatsApp
            </a>
          ) : (
            <button
              type="button"
              onClick={resetAndClose}
              className="inline-flex w-full items-center justify-center py-3 rounded-xl bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-white font-semibold transition-colors text-sm"
            >
              Finalizar
            </button>
          )}
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
