"use client";

import { useEffect } from "react";

export function PLPAnalytics() {
  useEffect(() => {
    const track = (name: string, props?: Record<string, unknown>) => {
      try {
        window.dispatchEvent(new CustomEvent("ar-event", { detail: { name, props } }));
      } catch (e) {
        // ignore
      }
      console.info("[analytics]", name, props ?? {});
    };

    const form = document.getElementById("plp-filters") as HTMLFormElement | null;
    const onSubmit = (e: Event) => {
      const data = new FormData(form || undefined);
      const filters: Record<string, unknown> = {};
      data.forEach((value, key) => {
        if (value === "" || value === null) return;
        filters[key] = value;
      });
      track("filter_apply", filters);
    };

    form?.addEventListener("submit", onSubmit);

    const clickHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target?.closest("a[data-page]") as HTMLAnchorElement | null;
      if (!link) return;
      const page = link.dataset.page;
      track("page_change", { page });
    };

    document.addEventListener("click", clickHandler);

    return () => {
      form?.removeEventListener("submit", onSubmit);
      document.removeEventListener("click", clickHandler);
    };
  }, []);

  return null;
}
