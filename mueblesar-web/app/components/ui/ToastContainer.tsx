"use client";

import type { ReactElement } from "react";
import { useToast, ToastType } from "../../context/ToastContext";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const icons: Record<ToastType, ReactElement> = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const styles: Record<ToastType, string> = {
  success: "bg-[#f0fdf4] border-[#86efac] text-[#166534]",
  error: "bg-[#fef2f2] border-[#fca5a5] text-[#991b1b]",
  warning: "bg-[#fffbeb] border-[#fcd34d] text-[#92400e]",
  info: "bg-[#eff6ff] border-[#93c5fd] text-[#1e40af]",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-[var(--success-600)]",
  error: "text-[var(--error-500)]",
  warning: "text-[var(--warning-500)]",
  info: "text-[var(--primary-600)]",
};

const progressBarColors: Record<ToastType, string> = {
  success: "bg-[var(--success-600)]",
  error: "bg-[var(--error-500)]",
  warning: "bg-[var(--warning-500)]",
  info: "bg-[var(--primary-600)]",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-md sm:top-auto sm:bottom-4 sm:left-auto sm:right-4 sm:translate-x-0 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
  };
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const duration = toast.duration || 4000;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-lg animate-in slide-in-from-top-2 fade-in duration-300 ${styles[toast.type]}`}
      role="alert"
    >
      <span className={`flex-shrink-0 mt-0.5 ${iconStyles[toast.type]}`}>
        {icons[toast.type]}
      </span>
      <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity p-0.5 -mr-1 rounded-lg hover:bg-black/5"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>
      
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 rounded-b-xl overflow-hidden">
          <div
            className={`h-full ${progressBarColors[toast.type]} animate-[shrink_${duration}ms_linear_forwards]`}
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}
