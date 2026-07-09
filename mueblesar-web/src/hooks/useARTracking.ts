"use client";

import { useCallback, useRef } from "react";

/**
 * Hook for AR event tracking
 * Dispatches custom events for analytics
 */

export type AREventName =
  | "ar_click"
  | "ar_modal_load"
  | "ar_launch"
  | "ar_compare_view"
  | "ar_measure_start"
  | "ar_measure_point"
  | "ar_measure_result"
  | "ar_measure_fail";

interface UseARTrackingOptions {
  productId: number;
  storeId?: number | null;
  productName: string;
}

export function useARTracking({ productId, storeId, productName }: UseARTrackingOptions) {
  const track = useCallback(
    (name: AREventName, props?: Record<string, unknown>) => {
      const detailProps = {
        productId,
        storeId,
        product: productName,
        ...(props ?? {}),
      };

      console.info("[ar-event]", name, detailProps);

      try {
        window.dispatchEvent(
          new CustomEvent("ar-event", { detail: { name, props: detailProps } })
        );
      } catch {
        // Ignore tracking errors
      }
    },
    [productId, storeId, productName]
  );

  return { track };
}

/**
 * Hook for tracking AR view (API call)
 */
export function useARViewTracker(apiBase: string) {
  const sentRef = useRef(false);

  const trackARView = useCallback(
    async (params: {
      productId: number;
      storeId?: number | null;
      isIOS: boolean;
      isMobile: boolean;
    }) => {
      if (sentRef.current) return;
      sentRef.current = true;

      const source = params.isIOS ? "IOS" : params.isMobile ? "ANDROID" : "WEB";

      try {
        await fetch(`${apiBase}/api/events/ar-view`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          keepalive: true,
          body: JSON.stringify({
            productId: params.productId,
            storeId: params.storeId,
            source,
          }),
        });
      } catch {
        // Ignore tracking errors
      }
    },
    [apiBase]
  );

  const resetTracking = useCallback(() => {
    sentRef.current = false;
  }, []);

  return { trackARView, resetTracking };
}
