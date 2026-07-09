"use client";

import { useState } from "react";
import { X, Phone, User, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import type { ProductVariant } from "@/types";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  storeId: number;
  productName: string;
  productPrice: number;
  variant?: ProductVariant;
  storeWhatsApp?: string;
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

  if (!isOpen) return null;

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

      // Éxito - mostrar mensaje y abrir WhatsApp
      setIsSuccess(true);

      // Preparar mensaje de WhatsApp
      const variantText = variant
        ? ` (${variant.attributes.color || ""} ${variant.attributes.size || ""})`.trim()
        : "";

      const whatsappMessage = `Hola! Me interesa el ${productName}${variantText} que vi en Amobly.\n\nPrecio: $${productPrice.toLocaleString("es-AR")}\n\nMi nombre es ${formData.customerName}.${formData.message ? `\n\nComentario: ${formData.message}` : ""}`;

      // Abrir WhatsApp después de 1 segundo (para que vea el éxito)
      setTimeout(() => {
        if (storeWhatsApp) {
          const cleanPhone = storeWhatsApp.replace(/\D/g, "");
          const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
          window.open(url, "_blank");
        }
        onClose();
        setIsSuccess(false);
        setFormData({ customerName: "", customerPhone: "", customerEmail: "", message: "" });
      }, 1500);
    } catch (err) {
      setError("No pudimos guardar tu consulta. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">¡Consulta enviada!</h3>
          <p className="text-slate-600">
            Se abrirá WhatsApp para que completes tu consulta con la mueblería.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#0058a3] to-[#0070d6]">
          <div>
            <h3 className="text-lg font-bold text-white">Consultar producto</h3>
            <p className="text-white/80 text-sm truncate max-w-[280px]">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Product Info */}
          {variant && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Variante seleccionada</p>
              <p className="text-sm font-medium text-slate-900">
                {variant.name}
              </p>
              <p className="text-sm text-[#0058a3] font-semibold">
                ${variant.pricing.salePrice.toLocaleString("es-AR")}
              </p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <User size={14} className="inline mr-1.5" />
              Tu nombre *
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/20 outline-none transition-all"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Phone size={14} className="inline mr-1.5" />
              Tu WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/20 outline-none transition-all"
              placeholder="Ej: +54 9 351 234-5678"
            />
            <p className="text-xs text-slate-500 mt-1">
              La mueblería se comunicará con vos por este número
            </p>
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/20 outline-none transition-all"
              placeholder="juan@email.com"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <MessageSquare size={14} className="inline mr-1.5" />
              Comentario <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/20 outline-none transition-all resize-none"
              placeholder="¿Tenés alguna pregunta específica? ¿Necesitás entrega urgente?"
            />
          </div>

          {/* Privacy note */}
          <p className="text-xs text-slate-500 text-center">
            Tus datos solo se compartirán con la mueblería para responder tu consulta.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Phone size={18} />
                Consultar por WhatsApp
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InquiryModal;
