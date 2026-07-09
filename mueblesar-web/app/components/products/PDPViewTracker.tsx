"use client";

import { useEffect } from "react";

type Props = {
  slug: string;
  store?: string;
  hasAr?: boolean;
  hasUsdz?: boolean;
};

export function PDPViewTracker({ slug, store, hasAr, hasUsdz }: Props) {
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent("ar-event", { detail: { name: "pdp_view", props: { slug, store, hasAr, hasUsdz } } }));
    } catch (e) {
      // ignore
    }
    console.info("[analytics]", "pdp_view", { slug, store, hasAr, hasUsdz });
  }, [slug, store, hasAr, hasUsdz]);

  return null;
}
