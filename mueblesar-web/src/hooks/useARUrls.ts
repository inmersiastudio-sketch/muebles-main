"use client";

import { useMemo } from "react";

/**
 * Hook for computing AR URLs for different platforms
 * Consolidates glbUrl (Android/Web) and usdzUrl (iOS) handling
 * Removes legacy JSON.parse(arUrl) logic
 */

export interface ARUrls {
  /** GLB URL for model-viewer (proxied if needed for CORS) */
  glbUrl: string | undefined;
  /** Original GLB URL for mobile/Qr codes (direct URL) */
  glbUrlOriginal: string | undefined;
  /** USDZ URL for iOS Quick Look */
  iosUrl: string | undefined;
  /** Android Intent URL for Scene Viewer */
  androidIntent: string | undefined;
  /** HTTPS URL for Scene Viewer */
  sceneViewerHttps: string | undefined;
  /** Whether the GLB URL is from Meshy (needs proxy) */
  isMeshy: boolean;
}

interface UseARUrlsOptions {
  /** GLB model URL - preferred field */
  glbUrl?: string | null;
  /** USDZ model URL - preferred for iOS */
  usdzUrl?: string | null;
  /** @deprecated Legacy field - kept for backward compatibility during migration */
  arUrl?: string | null;
  productName: string;
  apiBase: string;
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

export function useARUrls({
  glbUrl: propGlbUrl,
  usdzUrl: propUsdzUrl,
  arUrl,
  productName,
  apiBase,
}: UseARUrlsOptions): ARUrls {
  return useMemo(() => {
    // Use new separate fields first, fallback to arUrl for backward compatibility
    // Note: arUrl is now treated as a simple string URL, NOT a JSON object
    const rawGlb = propGlbUrl || arUrl || "";
    const parsedGlb = replaceLocalhost(rawGlb);
    let parsedUsdz = replaceLocalhost(propUsdzUrl);

    // If no explicit USDZ, try to derive from GLB
    if (!parsedUsdz && parsedGlb) {
      parsedUsdz = parsedGlb.replace(/\.glb(\?.*)?$/, ".usdz$1");
    }

    const lower = parsedGlb.toLowerCase();
    const glb = lower.includes(".glb") ? parsedGlb : undefined;

    // Proxy Meshy URLs through backend to avoid CORS
    const isMeshy = glb?.includes("meshy.ai") ?? false;
    const proxiedGlb = glb && isMeshy
      ? `${apiBase}/api/proxy/glb?url=${encodeURIComponent(glb)}`
      : glb;

    // Build mobile URLs
    const urlForMobile = glb ?? parsedGlb;
    const intent = glb
      ? `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(urlForMobile)}&mode=ar_preferred&title=${encodeURIComponent(productName)}#Intent;scheme=https;package=com.google.ar.core;end;`
      : undefined;
    const httpsViewer = glb
      ? `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(urlForMobile)}&mode=ar_preferred&title=${encodeURIComponent(productName)}`
      : undefined;

    return {
      glbUrl: proxiedGlb ?? parsedGlb,
      glbUrlOriginal: urlForMobile,
      iosUrl: parsedUsdz || undefined,
      androidIntent: intent ?? parsedGlb,
      sceneViewerHttps: httpsViewer ?? parsedGlb,
      isMeshy,
    };
  }, [arUrl, propGlbUrl, propUsdzUrl, productName, apiBase]);
}
