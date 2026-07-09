"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../../context/ToastContext";

interface AI3DGeneratorProps {
  productId: number;
  productName: string;
  currentImageUrl?: string | null;
  currentArUrl?: string | null;
  currentGlbUrl?: string | null;
  currentUsdzUrl?: string | null;
  onSuccess?: (glbUrl: string, usdzUrl?: string) => void;
}
interface GenerationJob {
  id: number;
  productId: number;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  progress?: number;
  glbUrl?: string;
  metadata?: {
    usdzUrl?: string; // added to capture the apple format from the backend
    [key: string]: any;
  };
  error?: string;
}

export function AI3DGenerator({ productId, productName, currentImageUrl, currentArUrl, currentGlbUrl, currentUsdzUrl, onSuccess }: AI3DGeneratorProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(currentImageUrl ? [currentImageUrl] : []);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();


  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3001";

  const isNetworkError = (err: unknown) => {
    if (err instanceof TypeError && err.message === "Failed to fetch") return true;
    if (err instanceof Error && /fetch|network|connection|reset|refused/i.test(err.message)) return true;
    return false;
  };

  const connectionErrorMessage =
    "No se pudo conectar con el servidor. Comprueba que el backend esté en ejecución (puerto 3001) y recarga la página.";

  // Poll job status when in progress
  useEffect(() => {
    if (!job || job.status === "SUCCEEDED" || job.status === "FAILED") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiBase}/api/admin/ai-3d/jobs/${job.id}/status`, {
          credentials: "include",
        });

        if (!res.ok) {
          let message = "Error al verificar el estado";
          try {
            const errData = await res.json();
            if (errData.error && typeof errData.error === "string") message = errData.error;
          } catch {
            // ignore
          }
          clearInterval(interval);
          setJob((prev) => (prev ? { ...prev, status: "FAILED", error: message } : null));
          setError(message);
          return;
        }

        const data = await res.json();
        setJob(data);

        if (data.status === "SUCCEEDED") {
          clearInterval(interval);
          success("¡Modelo 3D generado correctamente!");
          if (onSuccess && data.glbUrl) {
            // Check if backend provided the usdz URL within metadata
            const usdzUrl = data.metadata?.usdzUrl;
            // Pass both URLs separately instead of JSON string
            onSuccess(data.glbUrl, usdzUrl);
          }
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          const errorMsg = data.error || "La generación falló";
          setError(errorMsg);
          showError(errorMsg);
        }
      } catch (err) {
        console.error("Status check error:", err);
        clearInterval(interval);
        if (isNetworkError(err)) {
          setError(connectionErrorMessage);
          showError(connectionErrorMessage);
          setJob(null);
        } else {
          const message = err instanceof Error ? err.message : "Error al verificar el estado";
          setError(message);
          showError(message);
          setJob((prev) => (prev ? { ...prev, status: "FAILED", error: message } : null));
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [job, apiBase, onSuccess]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imageUrls.length >= 3) {
      setError("Solo se permiten hasta 3 imágenes.");
      showError("Solo se permiten hasta 3 imágenes.");
      return;
    }

    setUploadingImage(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${apiBase}/api/upload/image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await res.json();
      if (data.url) {
        setImageUrls(prev => [...prev, data.url]);
        success("Imagen subida correctamente");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido al subir archivo";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setUploadingImage(false);
      // Reset input value to allow selecting the same file again if needed
      if (e.target) e.target.value = '';
    }
  };

  const handleGenerate = async () => {
    const validUrls = imageUrls.filter(url => url.trim() !== "");
    if (validUrls.length === 0) {
      setError("Indica al menos una URL de imagen");
      showError("Indica al menos una imagen");
      return;
    }

    setLoading(true);
    setError(null);
    setJob(null);

    try {
      // By-pass temporal del procesador de imágenes mediante Query Parameter
      const res = await fetch(`${apiBase}/api/admin/ai-3d/generate?skipProcessing=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId,
          provider: "meshy",
          imageUrls: validUrls,
        }),
      });

      if (!res.ok) {
        let msg = "Error al iniciar la generación";
        try {
          const errorData = await res.json();
          if (errorData.error && typeof errorData.error === "string") msg = errorData.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const data = await res.json();
      setJob({
        id: data.jobId,
        productId,
        status: "IN_PROGRESS",
        progress: 0,
      });
      if (data.backgroundRemoved) {
        success("¡Fondos recortados! Generando malla 3D. Esto tomará 1-3 minutos.");
      } else {
        success("Generación de modelo 3D iniciada. Esto puede tomar 1-3 minutos.");
      }
    } catch (err) {
      if (isNetworkError(err)) {
        setError(connectionErrorMessage);
        showError(connectionErrorMessage);
      } else {
        const errorMsg = err instanceof Error ? err.message : "Error desconocido";
        setError(errorMsg);
        showError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => {
    if (!job) return null;

    switch (job.status) {
      case "PENDING":
      case "IN_PROGRESS":
        return (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span className="font-medium text-blue-900">Generating 3D model...</span>
            </div>
            <p className="text-sm text-blue-700">Progress: {job.progress || 0}%</p>
            <p className="mt-1 text-xs text-blue-600">This may take 1-3 minutes. You can leave this page.</p>
          </div>
        );

      case "SUCCEEDED":
        return (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-green-900">3D model generated!</span>
            </div>
            {job.glbUrl && (
              <div className="mt-2">
                <p className="text-sm text-green-700">GLB URL:</p>
                <a
                  href={job.glbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-xs text-green-600 underline hover:text-green-800"
                >
                  {job.glbUrl}
                </a>
              </div>
            )}
          </div>
        );

      case "FAILED":
        return (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-red-900">Generación fallida</span>
            </div>
            {job.error && <p className="text-sm text-red-700">{job.error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div>
        <h3 className="mb-1 font-semibold text-slate-900">🤖 AI 3D Model Generation</h3>
        <p className="text-sm text-slate-600">Generate a 3D model from a product image using AI</p>
      </div>

      {currentGlbUrl && (
        <div className="rounded border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-800">
            ✅ This product already has a 3D model:
          </p>
          <div className="mt-2 space-y-1">
            {currentGlbUrl && (
              <div>
                <span className="text-xs text-green-700">GLB: </span>
                <a href={currentGlbUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 underline hover:text-green-800 break-all">
                  {currentGlbUrl}
                </a>
              </div>
            )}
            {currentUsdzUrl && (
              <div>
                <span className="text-xs text-green-700">USDZ: </span>
                <a href={currentUsdzUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 underline hover:text-green-800 break-all">
                  {currentUsdzUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      {currentArUrl && !currentGlbUrl && (
        <div className="rounded border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-800">
            ✅ This product already has a 3D model:{" "}
            <a href={currentArUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline">
              View GLB
            </a>
          </p>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Fotos del producto (Multi-view)</label>

        {/* Lista de fotos ya subidas */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group overflow-hidden rounded-md border border-slate-200 aspect-square">
              <img src={url} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                disabled={loading || (job?.status === "IN_PROGRESS" || job?.status === "PENDING")}
              >
                X
              </button>
              <div className="absolute w-full bottom-0 bg-black bg-opacity-50 text-white text-[10px] text-center p-0.5">
                {index === 0 ? "Frente" : index === 1 ? "Costado" : "Atrás"}
              </div>
            </div>
          ))}
        </div>

        {/* Botones para subir */}
        {imageUrls.length < 3 && (
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                disabled={uploadingImage || loading || (job?.status === "IN_PROGRESS" || job?.status === "PENDING")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="camera-upload"
              />
              <Button
                variant="secondary"
                disabled={uploadingImage || loading || (job?.status === "IN_PROGRESS" || job?.status === "PENDING")}
                className="w-full border-dashed"
                asChild
              >
                <label htmlFor="camera-upload" className="w-full flex justify-center cursor-pointer pointer-events-none">
                  {uploadingImage ? "Subiendo..." : "📸 Tomar Foto / Galería"}
                </label>
              </Button>
            </div>
          </div>
        )}

        <p className="mt-2 text-xs text-slate-500">
          Recomendado subir 3 fotos claras con fondo liso: frente, costado y parte de atrás.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {renderStatus()}

      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={loading || imageUrls.every(url => url.trim() === "") || job?.status === "IN_PROGRESS" || job?.status === "PENDING"}
          className="flex-1 transition-all duration-300"
        >
          {loading ? "✨ Analizando y recortando fondos..." : job?.status === "IN_PROGRESS" || job?.status === "PENDING" ? "🪄 Generando malla 3D..." : "🪄 Generar Modelo 3D (IA)"}
        </Button>

        {job && job.status === "SUCCEEDED" && (
          <Button
            variant="secondary"
            onClick={() => {
              setJob(null);
              setError(null);
            }}
          >
            Generate Again
          </Button>
        )}
      </div>

      <div className="rounded border border-blue-100 bg-blue-50 p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Generation typically takes 1-3 minutes and costs ~$0.30-2 per model. The product will be automatically updated when completed.
        </p>
      </div>
    </div>
  );
}
