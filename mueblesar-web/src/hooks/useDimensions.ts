"use client";

import { useMemo } from "react";

/**
 * Hook for computing model-viewer dimensions string
 * Converts cm to meters for model-viewer attribute
 */

interface UseDimensionsOptions {
  widthCm?: number | null;
  heightCm?: number | null;
  depthCm?: number | null;
}

export function useDimensions({ widthCm, heightCm, depthCm }: UseDimensionsOptions): string | undefined {
  return useMemo(() => {
    if (!widthCm && !heightCm && !depthCm) return undefined;
    
    // model-viewer expects dimensions in meters, in order: width, height, depth
    const w = (widthCm ?? 0) / 100;
    const h = (heightCm ?? 0) / 100;
    const d = (depthCm ?? 0) / 100;
    
    return `${w}m ${h}m ${d}m`;
  }, [widthCm, heightCm, depthCm]);
}

/**
 * Format dimensions for display (cm)
 */
export function useFormattedDimensions({ widthCm, heightCm, depthCm }: UseDimensionsOptions): string {
  return useMemo(() => {
    const parts: string[] = [];
    if (widthCm) parts.push(`${widthCm} cm (ancho)`);
    if (depthCm) parts.push(`${depthCm} cm (prof.)`);
    if (heightCm) parts.push(`${heightCm} cm (alto)`);
    return parts.join(" × ") || "Dimensiones no especificadas";
  }, [widthCm, heightCm, depthCm]);
}
