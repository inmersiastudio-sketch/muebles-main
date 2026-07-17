"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Loader, Info } from "lucide-react";

export default function ARRedirectPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-center">Cargando…</div>}>
      <ARRedirectContent />
    </Suspense>
  );
}

function replaceLocalhost(url: string | null | undefined): string {
  if (!url) return "";
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return url
      .replace(/localhost:3001/g, `${window.location.hostname}:3001`)
      .replace(/127\.0\.0\.1:3001/g, `${window.location.hostname}:3001`)
      .replace(/localhost:3000/g, `${window.location.hostname}:3000`)
      .replace(/127\.0\.0\.1:3000/g, `${window.location.hostname}:3000`);
  }
  return url;
}

function ARRedirectContent() {
  const params = useSearchParams();
  const rawGlb = params.get("glb") ?? "";
  const glb = replaceLocalhost(rawGlb);
  const title = params.get("title") ?? "Modelo 3D";
  const isVerified = params.get("verified") === "true";

  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);
  const [viewerError, setViewerError] = useState<string | null>(null);

  // Load model-viewer script dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.customElements && window.customElements.get("model-viewer")) {
      setModelViewerLoaded(true);
      return;
    }

    const markReady = () => {
      window.customElements.whenDefined("model-viewer")
        .then(() => setModelViewerLoaded(true))
        .catch(() => setViewerError("No se pudo inicializar el visor 3D."));
    };

    const existing = document.querySelector<HTMLScriptElement>("script[data-model-viewer]");
    if (existing) {
      markReady();
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js";
    script.dataset.modelViewer = "true";
    script.addEventListener("load", markReady, { once: true });
    script.addEventListener("error", () => {
      setViewerError("No se pudo cargar el visor 3D. Revisá tu conexión e intentá nuevamente.");
      setLoadingModel(false);
    }, { once: true });
    document.head.appendChild(script);
  }, []);

  if (!glb) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-center">
        <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-xl">
          <Info className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="text-xl font-bold text-slate-900">Modelo no disponible</h1>
          <p className="text-sm text-slate-500">
            No se especificó la dirección del archivo GLB. Por favor, verificá el enlace o el código QR.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-6 md:py-10 text-center">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-6 md:p-8 shadow-xl border border-slate-100">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500">Visualización 3D y Realidad Aumentada</p>
        </div>

        {/* 3D Viewer Container */}
        <div className="relative flex h-[350px] w-full items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden">
          {!modelViewerLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 z-10">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-xs text-slate-500 font-semibold">Cargando visor 3D…</span>
            </div>
          )}

          {viewerError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-amber-50 p-6 text-amber-900">
              <Info className="h-8 w-8" />
              <span className="text-sm font-semibold">{viewerError}</span>
            </div>
          )}

          {modelViewerLoaded && (
            <model-viewer
              src={glb}
              alt={title}
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="fixed"
              camera-controls
              auto-rotate
              shadow-intensity="1.5"
              exposure="1.2"
              style={{ width: "100%", height: "100%" }}
              onLoad={() => setLoadingModel(false)}
            >
              {/* Custom AR Button inside model-viewer using slot="ar-button" */}
              <button
                slot="ar-button"
                id="ar-button"
                className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 z-20 cursor-pointer"
              >
                <Box size={18} /> {isVerified ? "Proyectar en AR (escala verificada)" : "Proyectar en AR"}
              </button>
            </model-viewer>
          )}

          {modelViewerLoaded && loadingModel && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50/30 backdrop-blur-[2px] z-10">
              <Loader className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-xs text-slate-400 font-semibold">Cargando objeto 3D…</span>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-left border border-slate-100">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Info size={14} className="text-blue-600" /> Instrucciones de uso
          </h2>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Arrastrá con un dedo para rotar el modelo en 3D en pantalla.</li>
            <li>Pellizcá con dos dedos para acercar o alejar el zoom.</li>
            <li>Presioná <strong>Proyectar en AR</strong> para ubicar el modelo en tu ambiente.</li>
          </ul>
          {!isVerified && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Vista orientativa: la escala física de este modelo todavía no fue verificada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
