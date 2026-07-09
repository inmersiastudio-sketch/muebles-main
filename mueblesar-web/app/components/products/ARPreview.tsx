"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QrCode, Ruler, Smartphone, X, Box } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { useARUrls, useDimensions, useDevice, useARTracking, useARViewTracker } from "@/hooks";


interface ARPreviewProps {
  /** @deprecated Use glbUrl instead */
  arUrl?: string | null;
  /** GLB model URL for Android/Web */
  glbUrl?: string | null;
  /** USDZ model URL for iOS */
  usdzUrl?: string | null;
  productId: number;
  storeId?: number | null;
  productName: string;
  widthCm?: number | null;
  depthCm?: number | null;
  heightCm?: number | null;
}

type Vec3 = { x: number; y: number; z: number };

export function ARPreview({
  arUrl,
  glbUrl: propGlbUrl,
  usdzUrl: propUsdzUrl,
  productId,
  storeId,
  productName,
  widthCm,
  depthCm,
  heightCm,
}: ARPreviewProps) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<string>("");
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ a?: Vec3; b?: Vec3 }>({});
  const [measureDistance, setMeasureDistance] = useState<number | null>(null);
  const [measureMessage, setMeasureMessage] = useState<string | null>(null);
  const [measureError, setMeasureError] = useState<string | null>(null);
  const [arSessionActive, setArSessionActive] = useState(false);

  const modelRef = useRef<HTMLElement & { xrSession?: unknown; activateAR?: () => Promise<void> }>(null);
  const hitTestSourceRef = useRef<{ cancel?: () => void } | null>(null);
  const viewerSpaceRef = useRef<unknown>(null);
  const localSpaceRef = useRef<unknown>(null);
  const xrSessionRef = useRef<{
    end?: () => void;
    addEventListener?: (type: string, handler: (e: unknown) => void) => void;
    removeEventListener?: (type: string, handler: (e: unknown) => void) => void;
    requestReferenceSpace?: (type: string) => Promise<unknown>;
    requestHitTestSource?: (options: { space: unknown }) => Promise<{ cancel?: () => void }>;
  } | null>(null);
  const pendingMeasureRef = useRef(false);
  const selectHandlerRef = useRef<((event: unknown) => void) | null>(null);

  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001",
    []
  );

  // New hooks
  const { glbUrl, glbUrlOriginal, iosUrl, androidIntent, sceneViewerHttps } = useARUrls({
    arUrl,
    glbUrl: propGlbUrl,
    usdzUrl: propUsdzUrl,
    productName,
    apiBase,
  });
  const dimensionsStr = useDimensions({ widthCm, heightCm, depthCm });
  const { isMobile, isIOS, canMeasure } = useDevice();
  const { track } = useARTracking({ productId, storeId, productName });
  const { trackARView, resetTracking } = useARViewTracker(apiBase);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const siteBase = useMemo(() => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (envUrl) return envUrl;
    if (origin) return origin;
    return "";
  }, [origin]);

  const redirectUrl = useMemo(() => {
    if (!siteBase) return "";
    try {
      const url = new URL(siteBase);
      url.pathname = "/ar";
      url.searchParams.set("glb", glbUrlOriginal || "");
      url.searchParams.set("title", productName);
      if (iosUrl) url.searchParams.set("usdz", iosUrl);
      return url.toString();
    } catch {
      return "";
    }
  }, [siteBase, glbUrlOriginal, iosUrl, productName]);

  const qrUnified = useMemo(() => {
    const isLocalhost =
      String(siteBase).includes("localhost") || String(apiBase).includes("localhost");

    if (isLocalhost) {
      const target = iosUrl || sceneViewerHttps || glbUrlOriginal;
      return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(target || "")}`;
    }

    if (productId && apiBase) {
      const shortUrl = `${apiBase}/api/short/ar/${productId}`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(shortUrl)}`;
    }

    const target = redirectUrl ? redirectUrl : iosUrl || sceneViewerHttps || glbUrlOriginal;
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(target || "")}`;
  }, [productId, apiBase, siteBase, redirectUrl, iosUrl, sceneViewerHttps, glbUrlOriginal]);

  // Load model-viewer script
  useEffect(() => {
    if (!open) return;
    const existing = document.querySelector<HTMLScriptElement>("script[data-model-viewer]");
    if (existing) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js";
    script.dataset.modelViewer = "true";
    document.head.appendChild(script);
  }, [open]);

  // Track AR compare view when dimensions available
  useEffect(() => {
    if (!open) return;
    if (widthCm || depthCm || heightCm) {
      track("ar_compare_view", { widthCm, depthCm, heightCm });
    }
  }, [open, widthCm, depthCm, heightCm, track]);

  // Track AR view
  useEffect(() => {
    if (!open || !productId) return;

    trackARView({ productId, storeId, isIOS, isMobile });
  }, [open, productId, storeId, isIOS, isMobile, trackARView]);

  // Reset tracking when modal closes
  useEffect(() => {
    if (open) return;
    resetTracking();
  }, [open, resetTracking]);

  // Cleanup on close
  useEffect(() => {
    if (open) return;

    if (xrSessionRef.current) {
      xrSessionRef.current.end?.();
    }
    cleanupXRSession();
    resetMeasure();
  }, [open]);

  function resetMeasure() {
    setMeasurePoints({});
    setMeasureDistance(null);
    setMeasureMessage(null);
    setMeasureError(null);
    pendingMeasureRef.current = false;
  }

  function cleanupXRSession() {
    if (xrSessionRef.current && selectHandlerRef.current) {
      xrSessionRef.current.removeEventListener?.("select", selectHandlerRef.current);
    }
    if (xrSessionRef.current) {
      xrSessionRef.current.removeEventListener?.("end", cleanupXRSession);
    }
    try {
      hitTestSourceRef.current?.cancel?.();
    } catch {
      // ignore
    }
    hitTestSourceRef.current = null;
    viewerSpaceRef.current = null;
    localSpaceRef.current = null;
    xrSessionRef.current = null;
    selectHandlerRef.current = null;
    setArSessionActive(false);
    setIsMeasuring(false);
  }

  async function setupHitTest(session: NonNullable<typeof xrSessionRef.current>) {
    if (!session?.requestReferenceSpace || !session?.requestHitTestSource) {
      setMeasureError("Este dispositivo no soporta medición AR");
      track("ar_measure_fail", { reason: "no-hit-test" });
      setIsMeasuring(false);
      return;
    }

    try {
      const viewerSpace = await session.requestReferenceSpace("viewer");
      const localSpace = await session.requestReferenceSpace("local");
      const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

      viewerSpaceRef.current = viewerSpace;
      localSpaceRef.current = localSpace;
      hitTestSourceRef.current = hitTestSource;
      xrSessionRef.current = session;

      const selectHandler = (event: unknown) => {
        if (!hitTestSourceRef.current || !localSpaceRef.current) return;

        const frame = (event as { frame?: { getHitTestResults?: (source: unknown) => unknown[] } }).frame;
        const results = (frame?.getHitTestResults?.(hitTestSourceRef.current) ?? []) as Array<{ getPose?: (space: unknown) => { transform?: { position?: DOMPointReadOnly } } | null }>;

        if (!results.length) {
          setMeasureError("No se detecta plano, mueve el dispositivo");
          track("ar_measure_fail", { reason: "no-plane" });
          return;
        }

        const pose = results[0].getPose?.(localSpaceRef.current);
        if (!pose?.transform?.position) return;

        const p = pose.transform.position;
        const nextPoint: Vec3 = { x: p.x, y: p.y, z: p.z };

        setMeasurePoints((prev) => {
          if (!prev.a) {
            track("ar_measure_point", { index: 1 });
            setMeasureMessage("Primer punto listo, toca el segundo punto");
            return { a: nextPoint };
          }

          const a = prev.a;
          const dx = nextPoint.x - a.x;
          const dy = nextPoint.y - a.y;
          const dz = nextPoint.z - a.z;
          const meters = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const cm = Math.round(meters * 1000) / 10;

          setMeasureDistance(cm);
          setMeasureMessage("Medición completa. Reinicia para medir otra vez");
          track("ar_measure_point", { index: 2 });
          track("ar_measure_result", { cm });
          return { a, b: nextPoint };
        });
      };

      selectHandlerRef.current = selectHandler;
      session.addEventListener?.("select", selectHandler);
      session.addEventListener?.("end", cleanupXRSession);
    } catch {
      setMeasureError("No se pudo iniciar medición");
      track("ar_measure_fail", { reason: "setup-error" });
      setIsMeasuring(false);
    }
  }

  const handleMeasureStart = async () => {
    resetMeasure();
    setIsMeasuring(true);
    setMeasureMessage("Apunta al piso y toca dos puntos");
    track("ar_measure_start", {});

    const mv = modelRef.current;
    if (!mv) {
      setMeasureError("No se encontró visor AR");
      setIsMeasuring(false);
      track("ar_measure_fail", { reason: "no-viewer" });
      return;
    }

    pendingMeasureRef.current = true;

    if (mv.xrSession) {
      await setupHitTest(mv.xrSession as NonNullable<typeof xrSessionRef.current>);
      return;
    }

    if (mv.activateAR) {
      try {
        await mv.activateAR();
      } catch {
        setMeasureError("No se pudo abrir AR");
        setIsMeasuring(false);
        track("ar_measure_fail", { reason: "activate-error" });
      }
    } else {
      setMeasureError("Este dispositivo no soporta WebXR");
      setIsMeasuring(false);
      track("ar_measure_fail", { reason: "no-activate" });
    }
  };

  const handleArStatus = async (event: Event) => {
    const status = (event as CustomEvent<{ status: string }>)?.detail?.status;
    if (status === "session-started") {
      setArSessionActive(true);
      if (pendingMeasureRef.current && modelRef.current?.xrSession) {
        await setupHitTest(modelRef.current.xrSession as NonNullable<typeof xrSessionRef.current>);
        pendingMeasureRef.current = false;
      }
    }
    if (status === "not-presenting") {
      setArSessionActive(false);
      pendingMeasureRef.current = false;
      cleanupXRSession();
    }
  };

  return (
    <>
      <button
        className="h-12 w-full rounded-xl font-bold bg-[#1d4ed8] hover:bg-[#1e40af] text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
        onClick={() => {
          track("ar_click", { hasIos: Boolean(iosUrl) });
          setOpen(true);
        }}
      >
        <Box className="w-5 h-5" />
        Ver en mi casa (AR)
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 md:p-4">
          <div className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              aria-label="Cerrar"
              className="absolute right-2 top-2 md:right-3 md:top-3 z-10 inline-flex h-12 w-12 md:h-9 md:w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-lg hover:bg-white active:scale-95 transition-transform touch-manipulation"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>

            <div className="grid gap-3 p-3 md:grid-cols-[1.7fr_1fr] md:p-6">
              <div className="flex min-h-[280px] md:min-h-[320px] items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
                {/* @ts-expect-error model-viewer is a custom element */}
                <model-viewer
                  ref={modelRef}
                  src={glbUrl}
                  alt={productName}
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  ar-hit-test
                  ios-src={iosUrl}
                  camera-controls
                  auto-rotate
                  style={{ width: "100%", height: "100%" }}
                  poster=""
                  exposure="1"
                  shadow-intensity="1"
                  show-dimensions={!!dimensionsStr}
                  data-dimensions={dimensionsStr}
                  onLoad={() => track("ar_modal_load", {})}
                  onArStatus={handleArStatus}
                />
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 md:p-4 text-center">
                  <div className="mb-2 md:mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <QrCode size={16} /> Escaneá para abrir AR
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={qrUnified}
                      alt="QR experiencia AR"
                      className="h-32 w-32 md:h-44 md:w-44 rounded-lg border border-slate-200 bg-white p-2"
                    />
                  </div>
                  <p className="pt-2 md:pt-3 text-xs text-slate-600">
                    Detecta el dispositivo: iPhone abre Quick Look (USDZ si existe), Android abre Scene Viewer
                    (GLB).
                  </p>
                </div>

                <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-3 md:p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Smartphone size={16} /> Abrir en este dispositivo
                  </div>
                  <Button
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1d4ed8] font-bold text-white shadow-sm transition-all hover:bg-[#1e40af] active:scale-[0.98]"
                    onClick={() => track("ar_launch", { target: redirectUrl || androidIntent })}
                  >
                    <a href={redirectUrl || androidIntent} target="_blank" rel="noreferrer">
                      Abrir experiencia AR
                    </a>
                  </Button>
                  <p className="text-xs text-slate-600">
                    Si estás en iPhone y el modelo no tiene USDZ, Quick Look no funcionará y verás
                    descarga/errores.
                  </p>
                </div>

                {isMobile && (
                  <div className="space-y-2 rounded-xl border border-amber-100 bg-amber-50 p-3 md:p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                      <Ruler size={16} /> Medir en AR (beta)
                    </div>

                    <Button
                      className="w-full h-12 md:h-10"
                      disabled={isIOS || !canMeasure || isMeasuring}
                      onClick={handleMeasureStart}
                    >
                      {isIOS
                        ? "No disponible en iPhone"
                        : isMeasuring
                          ? "Iniciando medición..."
                          : "Medir espacio"}
                    </Button>

                    <div className="rounded-lg bg-white/70 px-3 py-2 text-xs text-amber-800">
                      <p>
                        Funciona en Android con WebXR. En iPhone/Quick Look no se puede medir; usa la app Regla del
                        dispositivo y compara las dimensiones.
                      </p>
                      {measureMessage && <p className="pt-1 font-semibold">{measureMessage}</p>}
                    </div>

                    {measureDistance !== null && (
                      <div className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-900">
                        Distancia: {measureDistance.toFixed(1)} cm
                      </div>
                    )}

                    {measureError && <p className="text-xs font-semibold text-red-600">{measureError}</p>}

                    {(measurePoints.a || measurePoints.b || measureDistance !== null) && (
                      <div className="flex gap-2">
                        <Button variant="secondary" className="w-full" onClick={resetMeasure}>
                          Reiniciar medición
                        </Button>
                        {arSessionActive && (
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                              xrSessionRef.current?.end?.();
                              cleanupXRSession();
                            }}
                          >
                            Cerrar AR
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {(widthCm || depthCm || heightCm) && (
                  <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-800">Comparar dimensiones</div>
                    <div className="text-sm text-slate-700">
                      {widthCm ? `${widthCm} cm` : "?"} (ancho) × {depthCm ? `${depthCm} cm` : "?"} (prof.) ×{" "}
                      {heightCm ? `${heightCm} cm` : "?"} (alto)
                    </div>
                    <p className="text-xs text-slate-600">
                      En iPhone, mide tu espacio con la app Regla y compáralo con estas dimensiones. En Android, podés
                      usar el modo Medir para ubicar dos puntos en el plano. El modelo está a escala real según estas
                      medidas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
