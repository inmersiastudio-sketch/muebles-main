"use client";

import { useEffect } from "react";

type Props = {
  anchorId: string;
  active: boolean;
};

export function AutoScrollToResults({ anchorId, active }: Props) {
  useEffect(() => {
    if (!active) return;
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [anchorId, active]);

  return null;
}
