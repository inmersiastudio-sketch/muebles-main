"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

const uaIsIOS = (ua: string) => /iphone|ipad|ipod/.test(ua.toLowerCase());

export default function ARRedirectPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-center">Redirigiendo…</div>}>
      <ARRedirectContent />
    </Suspense>
  );
}

function ARRedirectContent() {
  const params = useSearchParams();
  const glb = params.get("glb") ?? "";
  const usdz = params.get("usdz") ?? "";
  const title = params.get("title") ?? "Modelo AR";

  const track = (name: string, props?: Record<string, unknown>) => {
    console.info("[ar-event]", name, props ?? {});
    try {
      window.dispatchEvent(new CustomEvent("ar-event", { detail: { name, props } }));
    } catch (e) {
      // ignore
    }
  };

  const sceneViewerHttps = useMemo(() => {
    if (!glb) {
      console.log("[AR Page] No GLB URL provided");
      return "";
    }
    const url = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glb)}&mode=ar_preferred&title=${encodeURIComponent(title)}`;
    console.log("[AR Page] GLB URL:", glb);
    console.log("[AR Page] Scene Viewer URL:", url);
    return url;
  }, [glb, title]);

  useEffect(() => {
    console.log("[AR Page] Params:", { glb, usdz, title });
    track("ar_qr_open", { glb, usdz: Boolean(usdz) });
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isIOS = uaIsIOS(ua);
    if (isIOS && usdz) {
      // DO NOT auto-redirect iOS USDZ via window.location.
      // Apple's Safari requires a user gesture on an anchor tag with rel="ar" to trigger Quick Look.
      // Auto-redirects just trigger a plain file download instead.
      return;
    }
    if (isIOS && !usdz) {
      track("ar_qr_fail", { reason: "missing_usdz", glb: Boolean(glb) });
    }
    if (sceneViewerHttps) {
      track("ar_qr_success", { target: "android_scene_viewer", url: sceneViewerHttps });
      track("ar_launch", { target: "android_scene_viewer", url: sceneViewerHttps });
      window.location.replace(sceneViewerHttps);
      return;
    }
    if (glb) {
      track("ar_qr_success", { target: "fallback_glb", url: glb });
      track("ar_launch", { target: "fallback_glb", url: glb });
      window.location.replace(glb);
    }
  }, [glb, sceneViewerHttps, usdz]);

  const fallbackAndroid = sceneViewerHttps || glb;
  const fallbackIOS = usdz || "";

  // If we are on iOS, show a big "Open AR" button. 
  // Apple strictly requires a click on <a rel="ar"> to trigger AR Quick Look.
  if (typeof navigator !== "undefined" && uaIsIOS(navigator.userAgent) && fallbackIOS) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-center">
        <div className="w-full max-w-sm space-y-6 rounded-3xl bg-white p-8 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mueble 3D listo</h1>
            <p className="text-sm text-slate-500">
              Toca el botón debajo para proyectar este modelo en tu espacio usando AR Quick Look.
            </p>
          </div>
          <a
            rel="ar"
            href={fallbackIOS}
            onClick={() => {
              track("ar_qr_success", { target: "ios_usdz", url: fallbackIOS });
              track("ar_launch", { target: "ios_usdz", url: fallbackIOS });
            }}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
          >
            Abrir en Realidad Aumentada
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-center">
      <div className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow">
        <h1 className="text-lg font-semibold text-slate-900">Abriendo experiencia AR…</h1>
        <p className="text-sm text-slate-600">
          Detectamos tu dispositivo y te redirigimos al visor nativo. Si no pasa nada en unos segundos, usa los botones de abajo.
        </p>

        {/* Debug info */}
        <div className="rounded-lg bg-slate-100 p-3 text-left text-xs">
          <div className="font-semibold text-slate-700 mb-1">Debug Info:</div>
          <div className="text-slate-600 break-all">
            <div><strong>GLB:</strong> {glb || "No GLB"}</div>
            <div><strong>USDZ:</strong> {usdz || "No USDZ"}</div>
            <div><strong>Scene Viewer URL:</strong> {sceneViewerHttps || "No URL"}</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={fallbackAndroid || "#"}
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-primary shadow-sm hover:border-primary"
          >
            Abrir en Android (Scene Viewer)
          </a>
          <a
            rel="ar"
            href={fallbackIOS || "#"}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm ${fallbackIOS ? "border-slate-200 text-primary hover:border-primary" : "border-slate-100 text-slate-400 cursor-not-allowed"}`}
          >
            Abrir en iPhone (Quick Look)
          </a>
        </div>
        <p className="text-xs text-slate-500">
          iPhone necesita USDZ para AR; Android usa GLB con Scene Viewer. Si ves descarga en iPhone, el modelo no tiene USDZ.
        </p>
      </div>
    </div>
  );
}
