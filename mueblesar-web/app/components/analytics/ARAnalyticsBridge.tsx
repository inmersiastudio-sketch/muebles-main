"use client";

import { useEffect } from "react";

export function ARAnalyticsBridge() {
  const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
  const SEGMENT_KEY = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY;

  useEffect(() => {
    // Load GA4 if configured
    if (GA4_ID && typeof window !== "undefined" && !(window as any).gtag) {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).gtag = function gtag() {
        (window as any).dataLayer.push(arguments);
      };
      (window as any).gtag("js", new Date());
      (window as any).gtag("config", GA4_ID);

      const gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
      document.head.appendChild(gaScript);
    }

    // Load Segment if configured
    if (SEGMENT_KEY && typeof window !== "undefined" && !(window as any).analytics) {
      (() => {
        const analytics = (window as any).analytics || [];
        if (analytics.initialize) return;
        if (analytics.invoked) {
          if (window.console && console.error) console.error("Segment snippet included twice.");
          return;
        }

        analytics.invoked = true;
        analytics.methods = [
          "trackSubmit",
          "trackClick",
          "trackLink",
          "trackForm",
          "pageview",
          "identify",
          "reset",
          "group",
          "track",
          "ready",
          "alias",
          "debug",
          "page",
          "once",
          "off",
          "on",
          "addSourceMiddleware",
          "addIntegrationMiddleware",
          "setAnonymousId",
          "addDestinationMiddleware",
        ];
        analytics.factory = function (t: string) {
          return function () {
            const e = Array.prototype.slice.call(arguments);
            e.unshift(t);
            analytics.push(e);
            return analytics;
          };
        };
        for (let t = 0; t < analytics.methods.length; t++) {
          const e = analytics.methods[t];
          analytics[e] = analytics.factory(e);
        }
        analytics.load = function (key: string) {
          const t = document.createElement("script");
          t.type = "text/javascript";
          t.async = true;
          t.src = "https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";
          const n = document.getElementsByTagName("script")[0];
          n.parentNode?.insertBefore(t, n);
        };
        analytics.SNIPPET_VERSION = "4.15.3";
        analytics.load(SEGMENT_KEY);
        (window as any).analytics = analytics;
      })();
    }

    const handler = (evt: Event) => {
      const detail = (evt as CustomEvent).detail as { name: string; props?: Record<string, unknown> };
      if (!detail?.name) return;
      console.info("[analytics]", detail.name, detail.props ?? {});

      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", detail.name, detail.props ?? {});
      }

      if (typeof window !== "undefined" && (window as any).analytics?.track) {
        (window as any).analytics.track(detail.name, detail.props ?? {});
      }

      // forward to backend when available and meaningful
      if (detail.name === "ar_click" || detail.name === "ar_launch" || detail.name === "ar_compare_view") {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE;
        if (apiBase && detail.props?.productId) {
          fetch(`${apiBase}/api/events/ar-view`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "include",
            keepalive: true,
            body: JSON.stringify({
              productId: detail.props.productId,
              storeId: detail.props.storeId,
              source: detail.name === "ar_launch" ? "WEB" : undefined,
            }),
          }).catch(() => {
            // ignore
          });
        }
      }
    };

    window.addEventListener("ar-event", handler);
    const url = typeof window !== "undefined" ? window.location.href : "";
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const title = typeof document !== "undefined" ? document.title : undefined;

    // Pageview
    console.info("[analytics] pageview", { url, path, title });
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "page_view", { page_location: url, page_path: path, page_title: title });
    }
    if (typeof window !== "undefined" && (window as any).analytics?.page) {
      (window as any).analytics.page({ url, path, title });
    }

    return () => window.removeEventListener("ar-event", handler);
  }, []);

  return null;
}
