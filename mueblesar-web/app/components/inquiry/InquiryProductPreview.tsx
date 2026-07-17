"use client";

import { useEffect, useState } from "react";
import { Loader2, Box } from "lucide-react";
import { useARUrls } from "@/hooks";

interface InquiryProductPreviewProps {
  productName: string;
  imageUrl?: string | null;
  glbUrl?: string | null;
  usdzUrl?: string | null;
}

export function InquiryProductPreview({
  productName,
  imageUrl,
  glbUrl: propGlbUrl,
  usdzUrl: propUsdzUrl,
}: InquiryProductPreviewProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  
  const arUrls = useARUrls({
    glbUrl: propGlbUrl,
    usdzUrl: propUsdzUrl,
    productName,
    apiBase,
  });

  const glbUrl = arUrls.glbUrl;

  // Carga del script singleton de model-viewer
  useEffect(() => {
    if (!glbUrl) return;

    // Verificar si ya existe el tag script o si el custom element está registrado
    if (typeof window !== "undefined") {
      if (window.customElements && window.customElements.get("model-viewer")) {
        setScriptLoaded(true);
        return;
      }
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-model-viewer]");
    if (existing) {
      // El script ya se está cargando, esperar a que termine de cargarse
      const handleLoad = () => setScriptLoaded(true);
      existing.addEventListener("load", handleLoad);
      return () => {
        existing.removeEventListener("load", handleLoad);
      };
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js";
    script.dataset.modelViewer = "true";
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setHasError(true);
      setModelLoading(false);
    };
    document.head.appendChild(script);
  }, [glbUrl]);

  // Si no hay GLB o ocurrió un error irrecuperable, usar imagen fallback
  if (!glbUrl || hasError) {
    return (
      <div className="relative w-full h-[180px] md:h-[200px] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Box size={32} />
            <span className="text-xs">Sin vista 3D</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-[180px] md:h-[200px] bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200 flex flex-col items-center justify-center">
      {/* Overlay de Carga */}
      {modelLoading && (
        <div className="absolute inset-0 bg-slate-50/80 flex flex-col items-center justify-center gap-2 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-[#0058a3]" />
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Cargando Vista 3D...
          </span>
        </div>
      )}

      {/* Titulo Indicador de 3D */}
      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-slate-900/60 backdrop-blur-sm text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
        <Box size={10} />
        Vista 3D
      </div>

      {scriptLoaded && (
        <model-viewer
          src={glbUrl}
          alt={`Vista 3D de ${productName}`}
          camera-controls
          ar-scale="fixed"
          touch-action="pan-y"
          className="w-full h-full"
          style={{ background: "transparent" }}
          onLoad={() => setModelLoading(false)}
          onError={() => {
            setHasError(true);
            setModelLoading(false);
          }}
        />
      )}
    </div>
  );
}
