"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle, DollarSign, MessageSquare } from "lucide-react";
import { Button } from "../ui/Button";
import type { Inquiry } from "@/types";

interface InquiryCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onSubmit: (data: {
    outcome: "converted" | "lost";
    finalAmount?: number;
    lossReason?: string;
    notes?: string;
  }) => void;
}

export function InquiryModal({ isOpen, onClose, inquiry, onSubmit }: InquiryCloseModalProps) {
  const [outcome, setOutcome] = useState<"converted" | "lost" | null>(null);
  const [finalAmount, setFinalAmount] = useState("");
  const [lossReason, setLossReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        outcome,
        finalAmount: outcome === "converted" ? parseFloat(finalAmount) : undefined,
        lossReason: outcome === "lost" ? lossReason : undefined,
        notes: notes || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOutcome(null);
    setFinalAmount("");
    setLossReason("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#0058a3] to-[#0070d6]">
          <div>
            <h3 className="text-lg font-bold text-white">
              {inquiry ? "Cerrar Consulta" : "Registrar Resultado"}
            </h3>
            {inquiry && (
              <p className="text-white/80 text-sm">
                {inquiry.customerName} - {inquiry.product?.name}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Outcome Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              ¿Cuál fue el resultado?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOutcome("converted")}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  outcome === "converted"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >
                <CheckCircle
                  className={`w-8 h-8 mx-auto mb-2 ${
                    outcome === "converted" ? "text-emerald-600" : "text-slate-400"
                  }`}
                />
                <span className="font-semibold">Venta Exitosa</span>
              </button>
              <button
                type="button"
                onClick={() => setOutcome("lost")}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  outcome === "lost"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-slate-200 hover:border-red-300 hover:bg-red-50/50"
                }`}
              >
                <XCircle
                  className={`w-8 h-8 mx-auto mb-2 ${
                    outcome === "lost" ? "text-red-600" : "text-slate-400"
                  }`}
                />
                <span className="font-semibold">Venta Perdida</span>
              </button>
            </div>
          </div>

          {/* Converted Fields */}
          {outcome === "converted" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <DollarSign size={14} className="inline mr-1" />
                  Monto final de la venta *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(e.target.value)}
                    placeholder="Ej: 125000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/20 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Este monto se usará para actualizar el stock y las estadísticas
                </p>
              </div>

              {inquiry && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">Precio consultado</p>
                  <p className="text-sm font-medium text-slate-900">
                    ${inquiry.productPriceAtInquiry.toLocaleString("es-AR")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Lost Fields */}
          {outcome === "lost" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <XCircle size={14} className="inline mr-1" />
                Motivo de la pérdida *
              </label>
              <select
                required
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/20 outline-none transition-all bg-white"
              >
                <option value="">Seleccionar motivo...</option>
                <option value="too_expensive">Muy caro</option>
                <option value="no_stock">Sin stock</option>
                <option value="bought_elsewhere">Compró en otro lado</option>
                <option value="changed_mind">Cambió de opinión</option>
                <option value="no_response">No respondió</option>
                <option value="other">Otro</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <MessageSquare size={14} className="inline mr-1" />
              Notas adicionales <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/20 outline-none transition-all resize-none"
              placeholder="Detalles adicionales sobre la venta o interacción con el cliente..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className={`flex-1 ${
                outcome === "converted"
                  ? "!bg-emerald-600 hover:!bg-emerald-700"
                  : outcome === "lost"
                  ? "!bg-red-600 hover:!bg-red-700"
                  : ""
              }`}
              disabled={!outcome || isSubmitting}
            >
              {isSubmitting ? (
                "Guardando..."
              ) : outcome === "converted" ? (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Registrar Venta
                </>
              ) : outcome === "lost" ? (
                <>
                  <XCircle size={18} className="mr-2" />
                  Registrar Pérdida
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InquiryModal;
