"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Inbox,
  Loader2,
  MessageSquare,
  PhoneCall,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAdmin } from "../layout";
import type {
  AdminInquiry,
  InquiryLifecycleStatus,
  InquiryListResponse,
  InquiryResult,
  InquiryStatsResponse,
} from "@/app/lib/admin.types";

const statusLabels: Record<InquiryLifecycleStatus, string> = {
  NEW: "Nueva",
  VIEWED: "Vista",
  CONTACTED: "Contactada",
  CLOSED: "Cerrada",
};

const statusStyles: Record<InquiryLifecycleStatus, string> = {
  NEW: "border-blue-200 bg-blue-50 text-blue-700",
  VIEWED: "border-slate-200 bg-slate-50 text-slate-700",
  CONTACTED: "border-amber-200 bg-amber-50 text-amber-700",
  CLOSED: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const resultLabels: Record<InquiryResult, string> = {
  SOLD: "Venta registrada",
  LOST_PRICE: "Perdida por precio",
  LOST_STOCK: "Perdida por stock",
  LOST_NO_REPLY: "Sin respuesta",
  LOST_OTHER: "Otro motivo",
  PENDING: "Pendiente",
};

const closeOptions: Array<{ value: InquiryResult; label: string }> = [
  { value: "SOLD", label: "Venta registrada" },
  { value: "LOST_PRICE", label: "Perdida por precio" },
  { value: "LOST_STOCK", label: "Perdida por falta de stock" },
  { value: "LOST_NO_REPLY", label: "Sin respuesta del cliente" },
  { value: "LOST_OTHER", label: "Otro motivo" },
  { value: "PENDING", label: "Seguimiento pendiente" },
];

function messageFromResponse(response: Response, fallback: string) {
  if (response.status === 401) return "Tu sesión venció. Volvé a iniciar sesión.";
  if (response.status === 403) return "No tenes permisos para consultar los datos de esta tienda.";
  return response
    .json()
    .then((data: { error?: string; message?: string }) => data.error || data.message || fallback)
    .catch(() => fallback);
}

function formatAmount(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount)
    : "Sin monto";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: InquiryLifecycleStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles[status]}`}>
      {status === "CLOSED" ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
      {statusLabels[status]}
    </span>
  );
}

export default function InquiriesPage() {
  const { user, apiBase } = useAdmin();
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [stats, setStats] = useState<InquiryStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"ALL" | InquiryLifecycleStatus>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [closingInquiry, setClosingInquiry] = useState<AdminInquiry | null>(null);
  const [result, setResult] = useState<InquiryResult>("SOLD");
  const [finalAmount, setFinalAmount] = useState("");
  const [resultNote, setResultNote] = useState("");

  const loadInquiries = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status !== "ALL") params.set("status", status);

    try {
      const [listResponse, statsResponse] = await Promise.all([
        fetch(`${apiBase}/api/inquiries?${params.toString()}`, { credentials: "include" }),
        fetch(`${apiBase}/api/inquiries/stats`, { credentials: "include" }),
      ]);

      if (!listResponse.ok) throw new Error(await messageFromResponse(listResponse, "No se pudieron cargar las consultas."));
      const listData = (await listResponse.json()) as InquiryListResponse;
      setInquiries(Array.isArray(listData.inquiries) ? listData.inquiries : []);
      setTotalPages(Math.max(1, listData.pagination?.totalPages || 1));

      if (statsResponse.ok) {
        setStats((await statsResponse.json()) as InquiryStatsResponse);
      } else {
        setStats(null);
      }
    } catch (loadError) {
      setInquiries([]);
      setStats(null);
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las consultas.");
    } finally {
      setLoading(false);
    }
  }, [apiBase, page, status, user]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const filteredInquiries = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-AR");
    if (!term) return inquiries;
    return inquiries.filter((inquiry) =>
      [inquiry.customerName, inquiry.customerPhone, inquiry.customerEmail, inquiry.product?.name]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase("es-AR").includes(term)),
    );
  }, [inquiries, search]);

  const updateInquiry = async (inquiry: AdminInquiry, data: Partial<{ status: InquiryLifecycleStatus; result: InquiryResult; finalAmount: number; resultNote: string }>) => {
    setUpdatingId(inquiry.id);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/api/inquiries/${inquiry.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await messageFromResponse(response, "No se pudo actualizar la consulta."));
      setClosingInquiry(null);
      await loadInquiries();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "No se pudo actualizar la consulta.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openCloseDialog = (inquiry: AdminInquiry) => {
    setClosingInquiry(inquiry);
    setResult("SOLD");
    setFinalAmount(inquiry.finalAmount == null ? "" : String(inquiry.finalAmount));
    setResultNote(inquiry.resultNote || "");
  };

  const submitClose = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!closingInquiry) return;
    const parsedAmount = Number(finalAmount);
    if (result === "SOLD" && (!finalAmount || !Number.isFinite(parsedAmount) || parsedAmount < 0)) {
      setError("Indica un monto valido para registrar la venta.");
      return;
    }
    await updateInquiry(closingInquiry, {
      status: "CLOSED",
      result,
      resultNote: resultNote.trim() || undefined,
      finalAmount: result === "SOLD" ? parsedAmount : undefined,
    });
  };

  if (!user) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Necesitás una sesión activa para administrar las consultas.
      </div>
    );
  }

  const pending = (stats?.byStatus.NEW || 0) + (stats?.byStatus.VIEWED || 0);
  const shownCount = filteredInquiries.length;
  const summaryCards: Array<{ label: string; value: number; icon: LucideIcon; iconClass: string }> = stats
    ? [
        { label: "Total", value: stats.total, icon: Inbox, iconClass: "bg-slate-100 text-slate-600" },
        { label: "Sin responder", value: pending, icon: Clock3, iconClass: "bg-amber-50 text-amber-700" },
        { label: "En seguimiento", value: stats.byStatus.CONTACTED || 0, icon: PhoneCall, iconClass: "bg-blue-50 text-blue-700" },
        { label: "Ventas registradas", value: stats.sales.count, icon: CheckCircle2, iconClass: "bg-emerald-50 text-emerald-700" },
      ]
    : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operación</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Consultas</h1>
          <p className="mt-1 text-sm text-slate-500">Priorizá y registrá el seguimiento de cada contacto recibido.</p>
        </div>
        <button
          type="button"
          onClick={loadInquiries}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          <span>{error}</span>
          <button type="button" onClick={loadInquiries} className="shrink-0 font-semibold underline underline-offset-2">Reintentar</button>
        </div>
      )}

      {!loading && stats && (
        <section aria-label="Resumen de consultas" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ label, value, icon: Icon, iconClass }) => (
            <div key={label} className="flex min-h-24 items-start justify-between rounded-lg border border-slate-200 bg-white p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass as string}`}>
                <Icon size={17} aria-hidden="true" />
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Cola de trabajo</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {loading ? "Actualizando consultas..." : `${shownCount} ${shownCount === 1 ? "consulta visible" : "consultas visibles"} en esta pagina`}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative min-w-0 sm:w-72">
              <span className="sr-only">Buscar consultas</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cliente, telefono o producto"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/10"
              />
            </label>
            <label className="sr-only" htmlFor="inquiry-status-filter">Filtrar por estado</label>
            <select
              id="inquiry-status-filter"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "ALL" | InquiryLifecycleStatus);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/10"
            >
              <option value="ALL">Todos los estados</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" /> Cargando consultas...
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <MessageSquare size={30} className="mb-3 text-slate-300" />
            <h2 className="font-bold text-slate-900">{search ? "No hay coincidencias" : "Todavia no hay consultas"}</h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              {search ? "Proba con otro termino de busqueda." : "Las consultas enviadas desde el catalogo apareceran aca."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(170px,1fr)_minmax(240px,1.35fr)_140px_128px] gap-5 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 lg:grid">
              <span>Cliente</span><span>Consulta</span><span>Estado</span><span className="text-right">Acciones</span>
            </div>
            {filteredInquiries.map((inquiry) => {
              const imageUrl = inquiry.product?.media?.[0]?.url;
              const isOpen = inquiry.status !== "CLOSED";
              const canMarkAsContacted = isOpen && inquiry.status !== "CONTACTED";
              return (
                <article key={inquiry.id} className="grid gap-4 border-b border-slate-100 px-4 py-4 transition-colors last:border-0 hover:bg-slate-50/70 lg:grid-cols-[minmax(170px,1fr)_minmax(240px,1.35fr)_140px_128px] lg:items-center lg:gap-5 lg:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><UserRound size={16} aria-hidden="true" /></div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{inquiry.customerName}</p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500"><Phone size={11} aria-hidden="true" />{inquiry.customerPhone}</p>
                      {inquiry.customerEmail && <p className="truncate text-xs text-slate-500">{inquiry.customerEmail}</p>}
                    </div>
                  </div>
                  <div className="flex min-w-0 items-start gap-3">
                    {imageUrl ? <img src={imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100" />}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{inquiry.product?.name || "Producto no disponible"}</p>
                      {inquiry.message ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{inquiry.message}</p>
                      ) : inquiry.result ? (
                        <p className="mt-0.5 truncate text-xs text-slate-500">{resultLabels[inquiry.result]}</p>
                      ) : (
                        <p className="mt-0.5 text-xs text-slate-500">Recibida el {formatDate(inquiry.createdAt)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:flex-col lg:items-start lg:gap-1">
                    <StatusBadge status={inquiry.status} />
                    <span className="text-xs text-slate-500">{formatDate(inquiry.createdAt)}</span>
                    {inquiry.result === "SOLD" && <span className="text-xs font-bold text-emerald-700">{formatAmount(inquiry.finalAmount)}</span>}
                  </div>
                  <div className="flex items-center gap-2 lg:justify-end">
                    {canMarkAsContacted && (
                      <button
                        type="button"
                        disabled={updatingId === inquiry.id}
                        onClick={() => updateInquiry(inquiry, { status: "CONTACTED" })}
                        title="Marcar como contactada"
                        aria-label={`Marcar la consulta de ${inquiry.customerName} como contactada`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === inquiry.id ? <Loader2 size={16} className="animate-spin" /> : <PhoneCall size={16} />}
                      </button>
                    )}
                    {isOpen && (
                      <button
                        type="button"
                        onClick={() => openCloseDialog(inquiry)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0058a3] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#004f93]"
                      >
                        <CheckCircle2 size={16} aria-hidden="true" />
                        Cerrar
                      </button>
                    )}
                    {!isOpen && <span className="text-xs font-medium text-slate-400">Finalizada</span>}
                  </div>
                </article>
              );
            })}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
                <span>Página {page} de {totalPages}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setPage((current) => current - 1)} disabled={page === 1} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Página anterior" title="Página anterior"><ChevronLeft size={16} /></button>
                  <button type="button" onClick={() => setPage((current) => current + 1)} disabled={page === totalPages} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Página siguiente" title="Página siguiente"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {closingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="close-inquiry-title">
          <form onSubmit={submitClose} className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div><h2 id="close-inquiry-title" className="font-bold text-slate-900">Cerrar consulta</h2><p className="mt-0.5 text-sm text-slate-500">{closingInquiry.customerName}</p></div>
              <button type="button" onClick={() => setClosingInquiry(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Cerrar dialogo" title="Cerrar"><X size={18} /></button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <label className="block text-sm font-semibold text-slate-700">Resultado
                <select value={result} onChange={(event) => setResult(event.target.value as InquiryResult)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-[#0058a3]">
                  {closeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              {result === "SOLD" && <label className="block text-sm font-semibold text-slate-700">Monto final (ARS)
                <input type="number" min="0" step="1" required value={finalAmount} onChange={(event) => setFinalAmount(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-[#0058a3]" />
              </label>}
              <label className="block text-sm font-semibold text-slate-700">Nota interna
                <textarea value={resultNote} onChange={(event) => setResultNote(event.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm font-normal outline-none focus:border-[#0058a3]" />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button type="button" onClick={() => setClosingInquiry(null)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={updatingId === closingInquiry.id} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0058a3] px-3 text-sm font-bold text-white hover:bg-[#004f93] disabled:cursor-not-allowed disabled:opacity-50">
                {updatingId === closingInquiry.id && <Loader2 size={15} className="animate-spin" />} Guardar cierre
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
