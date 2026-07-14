"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { useAdmin } from "../layout";
import type { InquiryStatsResponse } from "@/app/lib/admin.types";

function errorMessage(response: Response) {
  if (response.status === 401) return "Tu sesion vencio. Volve a iniciar sesion.";
  if (response.status === 403) return "Tu cuenta no tiene acceso a las consultas de una tienda.";
  return "No se pudo consultar el estado de las consultas.";
}

export default function OrdersPage() {
  const { user, apiBase } = useAdmin();
  const [stats, setStats] = useState<InquiryStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/api/inquiries/stats`, { credentials: "include" });
      if (!response.ok) throw new Error(errorMessage(response));
      setStats((await response.json()) as InquiryStatsResponse);
    } catch (loadError) {
      setStats(null);
      setError(loadError instanceof Error ? loadError.message : "No se pudo consultar el estado de las consultas.");
    } finally {
      setLoading(false);
    }
  }, [apiBase, user]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  if (!user) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Necesitas una sesion activa para consultar este estado.</div>;
  }

  const received = stats?.total ?? 0;
  const open = (stats?.byStatus.NEW || 0) + (stats?.byStatus.VIEWED || 0) + (stats?.byStatus.CONTACTED || 0);
  const closed = stats?.byStatus.CLOSED || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Estado de consultas</h1>
          <p className="mt-0.5 text-sm text-slate-500">Este producto no tiene checkout ni genera pedidos.</p>
        </div>
        <button type="button" onClick={loadStatus} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:self-auto">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          <span>{error}</span><button type="button" onClick={loadStatus} className="underline underline-offset-2">Reintentar</button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-56 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-500"><Loader2 size={18} className="animate-spin" /> Cargando estado...</div>
      ) : stats ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {[["Consultas recibidas", received], ["En seguimiento", open], ["Cerradas", closed]].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3"><MessageSquare className="mt-0.5 text-[#0058a3]" size={20} /><div><h2 className="font-bold text-slate-900">Gestiona los contactos en Consultas</h2><p className="mt-1 text-sm text-slate-500">Ahi podes marcar seguimiento y registrar el resultado real de cada contacto.</p></div></div>
            <Link href="/admin/inquiries" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0058a3] px-3 text-sm font-bold text-white hover:bg-[#004f93]">Ir a consultas <ArrowRight size={15} /></Link>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center"><MessageSquare size={28} className="mx-auto mb-3 text-slate-300" /><h2 className="font-bold text-slate-900">No hay datos de consultas disponibles</h2><p className="mt-1 text-sm text-slate-500">El estado aparecera cuando la API pueda devolver datos de la tienda.</p></div>
      )}
    </div>
  );
}
