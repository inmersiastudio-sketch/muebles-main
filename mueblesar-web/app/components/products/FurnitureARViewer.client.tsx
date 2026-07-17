"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Vector3 = { x: number; y: number; z: number };
type Point2D = { x: number; y: number };
type BoxPointKey = "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7" | "v8";
type BoxPoints = Partial<Record<BoxPointKey, Point2D>>;

type ModelViewerElement = HTMLElement & {
  getDimensions: () => Vector3;
  getBoundingBoxCenter: () => Vector3;
  updateHotspot: (config: { name: string; position?: string }) => void;
  queryHotspot: (name: string) => { canvasPosition: Point2D } | null;
  activateAR?: () => void;
};

type Props = {
  src: string;
  alt?: string;
  showPackageBox?: boolean;
  packagePadding?: number;
  className?: string;
};

const MODEL_VIEWER_SCRIPT_SRC = "https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js";
const VERTEX_KEYS = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8"] as const;
const BOX_EDGES = [
  ["v1", "v2"],
  ["v2", "v3"],
  ["v3", "v4"],
  ["v4", "v1"],
  ["v5", "v6"],
  ["v6", "v7"],
  ["v7", "v8"],
  ["v8", "v5"],
  ["v1", "v5"],
  ["v2", "v6"],
  ["v3", "v7"],
  ["v4", "v8"],
] as const;

function loadModelViewerScript() {
  const existing = document.querySelector<HTMLScriptElement>("script[data-model-viewer]");

  if (existing) {
    return new Promise<void>((resolve, reject) => {
      if (customElements.get("model-viewer")) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("No se pudo cargar model-viewer.")), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = MODEL_VIEWER_SCRIPT_SRC;
    script.dataset.modelViewer = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("No se pudo cargar model-viewer.")), { once: true });
    document.head.appendChild(script);
  });
}

function formatPackageCm(valueInMeters: number) {
  return `${Math.round(valueInMeters * 100)} cm`;
}

export function FurnitureARViewer({
  src,
  alt = "Modelo 3D Amobly",
  showPackageBox = true,
  packagePadding = 0.05,
  className = "",
}: Props) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const initialLoadRafRef = useRef<number[]>([]);

  const [isScriptReady, setIsScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<Vector3 | null>(null);
  const [boxPoints, setBoxPoints] = useState<BoxPoints>({});

  useEffect(() => {
    let cancelled = false;

    loadModelViewerScript()
      .then(() => {
        if (!cancelled) setIsScriptReady(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) setScriptError(error instanceof Error ? error.message : "No se pudo cargar el visor 3D.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const packageDimensions = useMemo(() => {
    if (!dimensions) return null;

    return {
      x: dimensions.x + packagePadding * 2,
      y: dimensions.y + packagePadding * 2,
      z: dimensions.z + packagePadding * 2,
    };
  }, [dimensions, packagePadding]);

  const hasValidBox = showPackageBox && VERTEX_KEYS.every((key) => Boolean(boxPoints[key]));

  const updateSceneOverlays = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    try {
      const size = viewer.getDimensions();
      const center = viewer.getBoundingBoxCenter();

      if (!Number.isFinite(size.x) || !Number.isFinite(size.y) || !Number.isFinite(size.z)) {
        return;
      }

      setDimensions(size);

      const min = {
        x: center.x - size.x / 2 - packagePadding,
        y: center.y - size.y / 2 - packagePadding,
        z: center.z - size.z / 2 - packagePadding,
      };
      const max = {
        x: center.x + size.x / 2 + packagePadding,
        y: center.y + size.y / 2 + packagePadding,
        z: center.z + size.z / 2 + packagePadding,
      };

      const vertices: Record<BoxPointKey, string> = {
        v1: `${min.x}m ${min.y}m ${min.z}m`,
        v2: `${max.x}m ${min.y}m ${min.z}m`,
        v3: `${max.x}m ${min.y}m ${max.z}m`,
        v4: `${min.x}m ${min.y}m ${max.z}m`,
        v5: `${min.x}m ${max.y}m ${min.z}m`,
        v6: `${max.x}m ${max.y}m ${min.z}m`,
        v7: `${max.x}m ${max.y}m ${max.z}m`,
        v8: `${min.x}m ${max.y}m ${max.z}m`,
      };

      VERTEX_KEYS.forEach((name) => {
        viewer.updateHotspot({ name, position: vertices[name] });
      });

      const projectedPoints: BoxPoints = {};

      for (const key of VERTEX_KEYS) {
        const point = viewer.queryHotspot(key)?.canvasPosition;
        if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
        projectedPoints[key] = point;
      }

      setBoxPoints(projectedPoints);
    } catch (error) {
      console.warn("Error al proyectar el Bounding Box de embalaje:", error);
    }
  }, [packagePadding]);

  const scheduleSceneUpdate = useCallback(() => {
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateSceneOverlays();
    });
  }, [updateSceneOverlays]);

  useEffect(() => {
    setDimensions(null);
    setBoxPoints({});
  }, [src]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !isScriptReady) return;

    const onLoad = () => {
      const firstFrame = requestAnimationFrame(() => {
        const secondFrame = requestAnimationFrame(updateSceneOverlays);
        initialLoadRafRef.current.push(secondFrame);
      });
      initialLoadRafRef.current.push(firstFrame);
    };

    viewer.addEventListener("load", onLoad);
    viewer.addEventListener("camera-change", scheduleSceneUpdate);

    return () => {
      viewer.removeEventListener("load", onLoad);
      viewer.removeEventListener("camera-change", scheduleSceneUpdate);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      initialLoadRafRef.current.forEach((frameId) => cancelAnimationFrame(frameId));
      initialLoadRafRef.current = [];
    };
  }, [isScriptReady, scheduleSceneUpdate, updateSceneOverlays]);

  const renderEdge = (from: BoxPointKey, to: BoxPointKey) => {
    const a = boxPoints[from];
    const b = boxPoints[to];
    if (!a || !b) return null;

    return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
  };

  if (scriptError) {
    return (
      <div className={`flex h-full min-h-[320px] items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900 ${className}`}>
        {scriptError}
      </div>
    );
  }

  return (
    <div className={`relative h-full min-h-[320px] w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 ${className}`}>
      {!isScriptReady && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
            <span className="text-sm text-neutral-500">Cargando modelo 3D...</span>
          </div>
        </div>
      )}

      <model-viewer
        ref={(node: any) => {
          viewerRef.current = node as ModelViewerElement | null;
        }}
        src={src}
        alt={alt}
        camera-controls
        touch-action="pan-y"
        auto-rotate
        ar-scale="fixed"
        shadow-intensity="1.5"
        shadow-softness="1"
        environment-image="neutral"
        exposure="1"
        interaction-prompt="auto"
        className="h-full w-full"
      >
        {VERTEX_KEYS.map((key) => (
          <div key={key} slot={`hotspot-${key}`} />
        ))}
      </model-viewer>

      {hasValidBox && (
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
          <g className="stroke-amber-500/80 stroke-2 [stroke-dasharray:6_4]">
            {BOX_EDGES.map(([from, to]) => renderEdge(from, to))}
          </g>
        </svg>
      )}

      {packageDimensions && showPackageBox && (
        <div className="absolute bottom-4 left-4 z-20 flex max-w-[calc(100%-2rem)] flex-col gap-1.5 rounded-lg border border-neutral-200 bg-white/90 p-4 font-mono text-xs text-neutral-800 shadow-md backdrop-blur-md">
          <span className="mb-1 block border-b border-neutral-200 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900">
            Caja de embalaje estimada
          </span>
          <div className="flex justify-between gap-6">
            <span className="text-neutral-500">Ancho (X):</span>
            <span className="font-semibold text-neutral-900">{formatPackageCm(packageDimensions.x)}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-neutral-500">Alto (Y):</span>
            <span className="font-semibold text-neutral-900">{formatPackageCm(packageDimensions.y)}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-neutral-500">Profundidad (Z):</span>
            <span className="font-semibold text-neutral-900">{formatPackageCm(packageDimensions.z)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
