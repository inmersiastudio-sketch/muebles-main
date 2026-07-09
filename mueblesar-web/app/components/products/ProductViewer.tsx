"use client";

import { useState, useEffect, useMemo } from "react";
import { Cuboid, ImageIcon, Maximize2, X, Box, Ruler, Package } from "lucide-react";

interface ProductViewerProps {
  images: string[];
  alt: string;
  arUrl?: string;
  glbUrl?: string;
  usdzUrl?: string;
  productDimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
}

export function ProductViewer({
  images,
  alt,
  arUrl,
  glbUrl: propGlbUrl,
  usdzUrl: propUsdzUrl,
  productDimensions,
}: ProductViewerProps) {
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Advanced AR states
  const [showRuler, setShowRuler] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [modelDims, setModelDims] = useState<{ x: number; y: number; z: number } | null>(null);

  const hasAr = !!(propGlbUrl || propUsdzUrl || arUrl);

  // Load model-viewer script
  useEffect(() => {
    if (viewMode !== "3d" || !hasAr) return;
    const existing = document.querySelector<HTMLScriptElement>("script[data-model-viewer]");
    if (existing) {
      setIsLoading(false);
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js";
    script.dataset.modelViewer = "true";
    script.onload = () => setIsLoading(false);
    document.head.appendChild(script);
  }, [viewMode, hasAr]);

  // Parse URLs
  const { glbUrl, iosUrl } = useMemo(() => {
    let parsedGlb = propGlbUrl || arUrl || "";
    let parsedUsdz = propUsdzUrl;

    if (!propGlbUrl && arUrl) {
      try {
        const obj = JSON.parse(arUrl);
        if (typeof obj === "object" && obj !== null && obj.glb) {
          parsedGlb = obj.glb;
          if (obj.usdz) parsedUsdz = obj.usdz;
        }
      } catch {
        // Standard string
      }
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
    const lower = parsedGlb.toLowerCase();
    const glb = lower.includes(".glb") ? parsedGlb : undefined;
    const isMeshy = glb?.includes("meshy.ai");
    const proxiedGlb = glb && isMeshy
      ? `${apiBase}/api/proxy/glb?url=${encodeURIComponent(glb)}`
      : glb;

    let iosCandidate = parsedUsdz;
    if (!iosCandidate && glb) {
      iosCandidate = parsedGlb.replace(/\.glb(\?.*)?$/, ".usdz$1");
    }

    return {
      glbUrl: proxiedGlb ?? parsedGlb,
      iosUrl: iosCandidate,
    };
  }, [arUrl, propGlbUrl, propUsdzUrl]);

  const safeImages = images.length > 0 ? images : [];

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Handle Model Loaded event
  const handleModelLoad = (event: any) => {
    setIsLoading(false);
    const mv = event.target;
    if (mv) {
      try {
        const dims = mv.getDimensions(); // returns {x, y, z} in meters
        setModelDims(dims);
      } catch (err) {
        console.error("Failed to read GLB model dimensions:", err);
      }
    }
  };

  // Autocalculated or API fallback dimensions
  const finalDimensions = useMemo(() => {
    if (modelDims) {
      return {
        width: Math.round(modelDims.x * 100),
        height: Math.round(modelDims.y * 100),
        depth: Math.round(modelDims.z * 100),
      };
    }
    return {
      width: productDimensions?.width || 0,
      height: productDimensions?.height || 0,
      depth: productDimensions?.depth || 0,
    };
  }, [modelDims, productDimensions]);

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* View Mode Toggle - Floating */}
      {hasAr && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-[var(--gray-200)] p-1">
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                viewMode === "3d"
                  ? "bg-[var(--primary-600)] text-white shadow-md"
                  : "text-[var(--gray-600)] hover:text-[var(--gray-900)]"
              }`}
            >
              <Box className="w-4 h-4" />
              3D
            </button>
            <button
              type="button"
              onClick={() => setViewMode("2d")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                viewMode === "2d"
                  ? "bg-[var(--primary-600)] text-white shadow-md"
                  : "text-[var(--gray-600)] hover:text-[var(--gray-900)]"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Fotos
            </button>
          </div>
        </div>
      )}

      {/* Main Viewer */}
      <div className="flex-1 relative bg-gradient-to-b from-[var(--gray-50)] to-white rounded-2xl overflow-hidden">
        {viewMode === "3d" && glbUrl ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--gray-50)] z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-[var(--primary-200)] border-t-[var(--primary-600)] rounded-full animate-spin" />
                  <span className="text-sm text-[var(--gray-500)]">Cargando modelo 3D...</span>
                </div>
              </div>
            )}
            
            {/* CSS Styling for virtual ruler cotas and bounding box corners */}
            <style>{`
              .dim-label {
                background: rgba(0, 29, 61, 0.95);
                color: #ffffff;
                border-radius: 6px;
                padding: 4px 10px;
                font-family: Inter, sans-serif;
                font-size: 11px;
                font-weight: 700;
                border: 1.5px solid #0058a3;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                pointer-events: none;
                white-space: nowrap;
                transform: translate(-50%, -50%);
              }
              .box-corner {
                width: 14px;
                height: 14px;
                border-color: rgba(239, 68, 68, 0.85);
                background-color: rgba(239, 68, 68, 0.2);
                pointer-events: none;
                transform: translate(-50%, -50%);
              }
            `}</style>

            {/* @ts-expect-error model-viewer is a custom element */}
            <model-viewer
              src={glbUrl}
              ios-src={iosUrl}
              alt={`Modelo 3D de ${alt}`}
              camera-controls
              auto-rotate={!showRuler && !showBox} // disable autorotate during measurements for accuracy
              ar
              ar-modes="webxr scene-viewer quick-look"
              shadow-intensity="1"
              environment-image="neutral"
              exposure="1"
              interaction-prompt="auto"
              interaction-prompt-threshold="500"
              camera-orbit="0deg 75deg 105%"
              min-camera-orbit="auto auto 50%"
              max-camera-orbit="auto auto 150%"
              style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
              on-load={handleModelLoad}
            >
              {/* Virtual Ruler Hotspots (Axis Labels) */}
              {showRuler && modelDims && (
                <>
                  {/* Width Hotspot (Front-Bottom Center) */}
                  <div
                    slot={`hotspot-dim-width`}
                    className="dim-label"
                    data-position={`0 0 ${modelDims.z / 2}`}
                    data-normal="0 0 1"
                  >
                    Ancho: {finalDimensions.width} cm
                  </div>

                  {/* Height Hotspot (Right-Center-Front Corner) */}
                  <div
                    slot={`hotspot-dim-height`}
                    className="dim-label"
                    data-position={`${modelDims.x / 2} ${modelDims.y / 2} ${modelDims.z / 2}`}
                    data-normal="1 0 0"
                  >
                    Alto: {finalDimensions.height} cm
                  </div>

                  {/* Depth Hotspot (Bottom-Right Center) */}
                  <div
                    slot={`hotspot-dim-depth`}
                    className="dim-label"
                    data-position={`${modelDims.x / 2} 0 0`}
                    data-normal="1 0 0"
                  >
                    Profundidad: {finalDimensions.depth} cm
                  </div>
                </>
              )}

              {/* Bounding Box Corner Hotspots (8 Vertices representation) */}
              {showBox && modelDims && (
                <>
                  {/* Bottom Corners */}
                  <div slot="hotspot-b1" className="box-corner border-b-2 border-l-2 absolute" data-position={`${-modelDims.x / 2} 0 ${modelDims.z / 2}`} />
                  <div slot="hotspot-b2" className="box-corner border-b-2 border-r-2 absolute" data-position={`${modelDims.x / 2} 0 ${modelDims.z / 2}`} />
                  <div slot="hotspot-b3" className="box-corner border-t-2 border-r-2 absolute" data-position={`${modelDims.x / 2} 0 ${-modelDims.z / 2}`} />
                  <div slot="hotspot-b4" className="box-corner border-t-2 border-l-2 absolute" data-position={`${-modelDims.x / 2} 0 ${-modelDims.z / 2}`} />

                  {/* Top Corners */}
                  <div slot="hotspot-b5" className="box-corner border-t-2 border-l-2 absolute" data-position={`${-modelDims.x / 2} ${modelDims.y} ${modelDims.z / 2}`} />
                  <div slot="hotspot-b6" className="box-corner border-t-2 border-r-2 absolute" data-position={`${modelDims.x / 2} ${modelDims.y} ${modelDims.z / 2}`} />
                  <div slot="hotspot-b7" className="box-corner border-b-2 border-r-2 absolute" data-position={`${modelDims.x / 2} ${modelDims.y} ${-modelDims.z / 2}`} />
                  <div slot="hotspot-b8" className="box-corner border-b-2 border-l-2 absolute" data-position={`${-modelDims.x / 2} ${modelDims.y} ${-modelDims.z / 2}`} />
                </>
              )}
            </model-viewer>

            {/* 3D Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
              <div className="pointer-events-auto flex flex-wrap items-center gap-2">
                {/* AR Button */}
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white/95 backdrop-blur-sm text-[var(--gray-900)] px-4 py-2.5 rounded-full shadow-lg border border-[var(--gray-200)] text-sm font-semibold hover:bg-white transition-all active:scale-95"
                  onClick={() => {
                    const mv = document.querySelector("model-viewer") as { activateAR?: () => void } | null;
                    if (mv?.activateAR) mv.activateAR();
                  }}
                >
                  <Box className="w-4 h-4 text-[var(--primary-600)]" />
                  Ver en tu espacio (AR)
                </button>

                {/* Virtual Ruler Toggle */}
                <button
                  type="button"
                  onClick={() => setShowRuler(!showRuler)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border text-sm font-semibold transition-all active:scale-95 ${
                    showRuler
                      ? "bg-[#0058a3] text-white border-[#0058a3]"
                      : "bg-white/95 backdrop-blur-sm text-[var(--gray-700)] border-[var(--gray-200)] hover:bg-white"
                  }`}
                >
                  <Ruler className="w-4 h-4" />
                  Regla Virtual {showRuler ? "ON" : "OFF"}
                </button>

                {/* Bounding Box Toggle */}
                <button
                  type="button"
                  onClick={() => setShowBox(!showBox)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border text-sm font-semibold transition-all active:scale-95 ${
                    showBox
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white/95 backdrop-blur-sm text-[var(--gray-700)] border-[var(--gray-200)] hover:bg-white"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Caja de Envío {showBox ? "ON" : "OFF"}
                </button>
              </div>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="pointer-events-auto p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-[var(--gray-200)] text-[var(--gray-600)] hover:text-[var(--gray-900)] transition-colors active:scale-95"
                aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Dimensions Badge */}
            {(finalDimensions.width > 0 || finalDimensions.height > 0 || finalDimensions.depth > 0) && (
              <div className="absolute top-4 right-4 bg-[#001d3d] text-white px-4 py-2 rounded-xl shadow-md border border-[#003566] text-xs font-bold flex items-center gap-2">
                <Cuboid className="w-3.5 h-3.5 text-[#0058a3]" />
                {finalDimensions.width > 0 && `${finalDimensions.width}cm`}
                {finalDimensions.width > 0 && finalDimensions.depth > 0 && " × "}
                {finalDimensions.depth > 0 && `${finalDimensions.depth}cm`}
                {(finalDimensions.width > 0 || finalDimensions.depth > 0) && finalDimensions.height > 0 && " × "}
                {finalDimensions.height > 0 && `${finalDimensions.height}cm`}
              </div>
            )}
          </>
        ) : (
          <div className="relative h-full">
            <img
              src={safeImages[imageIndex]}
              alt={alt}
              className="w-full h-full object-contain p-8"
            />

            {/* Image Navigation */}
            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setImageIndex((i) => (i - 1 + safeImages.length) % safeImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-lg border border-[var(--gray-200)] text-[var(--gray-700)] hover:bg-white transition-colors"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setImageIndex((i) => (i + 1) % safeImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-lg border border-[var(--gray-200)] text-[var(--gray-700)] hover:bg-white transition-colors"
                >
                  →
                </button>

                {/* Thumbnails */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {safeImages.map((img, i) => (
                    <button
                      key={img + i}
                      type="button"
                      onClick={() => setImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        imageIndex === i
                          ? "bg-[var(--primary-600)] w-6"
                          : "bg-[var(--gray-300)] hover:bg-[var(--gray-400)]"
                      }`}
                      aria-label={`Ver imagen ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
