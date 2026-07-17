"use client";

import { useEffect, useMemo, useState } from "react";
import { Cuboid, ImageIcon } from "lucide-react";
import { FurnitureARViewer } from "../products/FurnitureARViewer";

type Props = {
  images: string[];
  alt: string;
  arUrl?: string;
  glbUrl?: string;
  usdzUrl?: string;
  hideThumbnails?: boolean;
};

export function ImageCarousel({ images, alt, arUrl, glbUrl: propGlbUrl, usdzUrl: propUsdzUrl, hideThumbnails = false }: Props) {
  const safeImages = useMemo(() => (images.length > 0 ? images : []), [images]);
  const hasArAsset = !!(propGlbUrl || propUsdzUrl || arUrl);

  // Derived URLs for model viewer
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001", []);
  const { glbUrl } = useMemo(() => {
    // Use new separate fields first, fallback to arUrl for backward compatibility
    let parsedGlb = propGlbUrl || arUrl || "";

    // Check if arUrl (legacy) is still in the old dual-format JSON string from the backend
    if (!propGlbUrl && arUrl) {
      try {
        const obj = JSON.parse(arUrl);
        if (typeof obj === "object" && obj !== null && obj.glb) {
          parsedGlb = obj.glb;
        }
      } catch {
        // It's a standard string, proceed normally
      }
    }

    const lower = parsedGlb.toLowerCase();
    const glb = lower.includes(".glb") ? parsedGlb : undefined;
    const isMeshy = glb?.includes("meshy.ai");
    const proxiedGlb = glb && isMeshy
      ? `${apiBase}/api/proxy/glb?url=${encodeURIComponent(glb)}`
      : glb;

    return {
      glbUrl: proxiedGlb ?? parsedGlb,
    };
  }, [arUrl, propGlbUrl, apiBase]);

  const hasStrictAr = Boolean(glbUrl);
  const hasAr = hasArAsset && hasStrictAr;
  const [index, setIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"2d" | "3d">(hasAr ? "3d" : "2d");

  useEffect(() => {
    setViewMode(hasAr ? "3d" : "2d");
  }, [hasAr, glbUrl]);

  if (safeImages.length === 0 && !hasAr) {
    return <div className="flex h-full items-center justify-center bg-slate-50 text-sm text-slate-500">Sin imagen</div>;
  }

  const prev = () => setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  const next = () => setIndex((i) => (i + 1) % safeImages.length);

  return (
    <div className="flex h-full flex-col space-y-3">
      {hasAr && (
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-[#dbe3ef] bg-[#f8fafc] p-1">
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${viewMode === "3d" ? "bg-white text-[#1d4ed8] shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <Cuboid size={14} /> 3D Interactivo
            </button>
            <button
              type="button"
              onClick={() => setViewMode("2d")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${viewMode === "2d" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <ImageIcon size={14} /> Fotos
            </button>
          </div>
        </div>
      )}

      <div className="relative min-h-[240px] flex-1 overflow-hidden rounded-xl border border-[#dbe3ef] bg-[#f8fafc] shadow-sm">
        {viewMode === "3d" && glbUrl ? (
          <div className="h-full w-full cursor-move">
            <FurnitureARViewer
              src={glbUrl}
              alt={`Modelo 3D de ${alt}`}
              className="rounded-none border-0"
            />
          </div>
        ) : safeImages.length > 0 ? (
          <>
            <img src={safeImages[index]} alt={alt} className="h-full w-full object-contain p-5" />
            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-white"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-white"
                >
                  →
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Sin imagen</div>
        )}
      </div>

      {!hideThumbnails && safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {safeImages.slice(0, 8).map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => {
                setIndex(i);
                setViewMode("2d");
              }}
              className={`aspect-[4/3] overflow-hidden rounded-lg border ${index === i && viewMode === "2d" ? "border-primary" : "border-transparent"}`}
            >
              <img src={img} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
