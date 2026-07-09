"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdmin } from "../layout";
import { useToast } from "../../context/ToastContext";
import {
    Sparkles,
    Loader2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    Image as ImageIcon,
    RefreshCw
} from "lucide-react";

type JobStatus = "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";

interface AI3DJob {
  id: string;
  productId: number;
  variantId?: string | null;
  status: JobStatus;
  provider: string;
  imageUrl: string;
  glbUrl?: string | null;
  creditsUsed: number;
  errorMessage?: string | null;
  createdAt: string;
  product?: {
    name: string;
  } | null;
  variant?: {
    name: string;
  } | null;
}

export default function AIHistoryPage() {
  const { user, apiBase } = useAdmin();
  const { error: showError } = useToast();

  const [jobs, setJobs] = useState<AI3DJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchJobs = useCallback(async (silent = false) => {
    if (!user?.storeId) {
      setIsLoading(false);
      return;
    }

    if (!silent) {
      setIsRefreshing(true);
    }

    try {
      const res = await fetch(`${apiBase}/api/admin/ai-3d/jobs`, {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        const fetchedJobs = (data.jobs || []) as AI3DJob[];
        setJobs(fetchedJobs);

        // Turn on polling if there's any active background job
        const hasActiveJobs = fetchedJobs.some(
          job => job.status === "PENDING" || job.status === "IN_PROGRESS"
        );
        setIsPolling(hasActiveJobs);
      } else {
        const errData = await res.json().catch(() => ({}));
        showError(errData.error || "No se pudo cargar el historial de IA");
      }
    } catch (error) {
      console.error("Error fetching AI jobs history:", error);
      showError("Error de conexión al cargar el historial");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, apiBase, showError]);

  // Initial load
  useEffect(() => {
    if (user?.storeId) {
      fetchJobs();
    }
  }, [user, fetchJobs]);

  // Optimized Polling
  useEffect(() => {
    if (!isPolling) return;

    const intervalId = setInterval(() => {
      console.log("Polling: Verificando estado de los modelos 3D...");
      fetchJobs(true); // silent update
    }, 10000); // Poll safely every 10 seconds

    return () => clearInterval(intervalId); // Auto-cleanup
  }, [isPolling, fetchJobs]);

  const getStatusBadge = (status: JobStatus) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider";
    switch (status) {
      case "SUCCEEDED":
        return (
          <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border border-emerald-200`}>
            <CheckCircle2 size={12} />
            Listo
          </span>
        );
      case "FAILED":
        return (
          <span className={`${baseClasses} bg-red-50 text-red-700 border border-red-200`}>
            <XCircle size={12} />
            Fallido
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className={`${baseClasses} bg-blue-50 text-blue-700 border border-blue-200 animate-pulse`}>
            <Loader2 size={12} className="animate-spin" />
            Procesando
          </span>
        );
      case "PENDING":
        return (
          <span className={`${baseClasses} bg-amber-50 text-amber-700 border border-amber-200 animate-pulse`}>
            <Clock size={12} />
            En Cola
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={32} className="animate-spin text-[#0058a3]" />
        <p className="text-sm text-slate-500 font-medium">Cargando historial de modelos 3D...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Historial de IA 3D</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitoreá la conversión de fotos de tus productos a modelos de Realidad Aumentada</p>
        </div>
        <button
          type="button"
          onClick={() => fetchJobs()}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* Alert banner if polling is active */}
      {isPolling && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-[#0058a3]/5 border border-blue-200/50 flex items-start gap-3 shadow-sm">
          <div className="p-2 rounded-xl bg-blue-100/50 text-[#0058a3] mt-0.5 animate-pulse">
            <Loader2 size={18} className="animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Generación de modelos 3D en progreso</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Esto suele tomar entre 1 y 3 minutos por modelo. Esta página se actualizará automáticamente apenas finalicen los trabajos.
            </p>
          </div>
        </div>
      )}

      {/* History table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 pl-6 font-semibold">Imagen Origen</th>
                <th className="p-4 font-semibold">Producto / Variante</th>
                <th className="p-4 font-semibold">Proveedor / ID Trabajo</th>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Créditos</th>
                <th className="p-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/20 transition-colors">
                  {/* Image preview */}
                  <td className="p-4 pl-6">
                    <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                      {job.imageUrl ? (
                        <img
                          src={job.imageUrl}
                          alt={job.product?.name || "Vista técnica"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={18} className="text-slate-400" />
                      )}
                    </div>
                  </td>

                  {/* Product detail */}
                  <td className="p-4">
                    <div className="font-bold text-slate-900">
                      {job.product?.name || `Producto #${job.productId}`}
                    </div>
                    {job.variant?.name && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        Variante: {job.variant.name}
                      </div>
                    )}
                  </td>

                  {/* Provider & Job UID */}
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                      {job.provider}
                    </span>
                    <div className="font-mono text-[10px] text-slate-400 mt-1 select-all">
                      {job.id}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="p-4 text-slate-500">
                    {new Date(job.createdAt).toLocaleString("es-AR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>

                  {/* Credits */}
                  <td className="p-4 font-bold text-slate-950">
                    -{job.creditsUsed} cr.
                  </td>

                  {/* Status Badge & Errors */}
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                      {getStatusBadge(job.status)}
                      {job.status === "FAILED" && job.errorMessage && (
                        <span className="text-[10px] text-red-500 max-w-[200px] truncate" title={job.errorMessage}>
                          Error: {job.errorMessage}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">No hay conversiones iniciadas</p>
                        <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                          Una vez que uses la Inteligencia Artificial al editar tus productos, verás el progreso de renderizado en esta lista.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
