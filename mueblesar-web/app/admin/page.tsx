"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  CheckCircle2,
  Eye,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useAdmin } from "./layout";
import type { AdminInquiry, InquiryListResponse, InquiryLifecycleStatus } from "@/app/lib/admin.types";

type StatsSummary = {
  arTotal: number;
  arLast30: number;
  topArProducts: { productId: number; name: string; storeName: string; views: number }[];
  lowStock: { productId: number; name: string; stockQty: number; storeName: string }[];
};

type InquirySummary = {
  total: number;
  today: number;
  thisWeek: number;
  byStatus: Partial<Record<InquiryLifecycleStatus, number>>;
  sales: { count: number; totalAmount: number | string };
};

const statusLabels: Record<InquiryLifecycleStatus, string> = {
  NEW: "Nueva",
  VIEWED: "Vista",
  CONTACTED: "En seguimiento",
  CLOSED: "Cerrada",
};

const statusStyles: Record<InquiryLifecycleStatus, string> = {
  NEW: "border-blue-200 bg-blue-50 text-blue-700",
  VIEWED: "border-slate-200 bg-slate-50 text-slate-700",
  CONTACTED: "border-amber-200 bg-amber-50 text-amber-800",
  CLOSED: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function formatPrice(value: number | string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Sin monto";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function messageFromResponse(response: Response, fallback: string) {
  if (response.status === 401) return "Tu sesión venció. Volvé a iniciar sesión.";
  if (response.status === 403) return "No tenés permisos para ver este inicio.";

  return response
    .json()
    .then((data: { error?: string; message?: string }) => data.error || data.message || fallback)
    .catch(() => fallback);
}

function MetricSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-lg border border-slate-200 bg-white p-4">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="mt-3 h-8 w-16 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="h-4 w-36 rounded bg-slate-200" />
      </div>
      <div className="space-y-3 px-5 py-4">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="h-10 rounded bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
  tone: "blue" | "amber" | "emerald" | "slate";
}) {
  const tones = {
    blue: "bg-blue-50 text-[#0058a3]",
    amber: "bg-amber-50 text-amber-800",
    emerald: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={17} aria-hidden="true" />
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-5 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
        <Icon size={19} aria-hidden="true" />
      </div>
      <h2 className="mt-3 text-sm font-bold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm leading-5 text-slate-500">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#0058a3] px-3 text-sm font-bold text-white hover:bg-[#004f93]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, apiBase } = useAdmin();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [inquiries, setInquiries] = useState<InquirySummary | null>(null);
  const [workQueue, setWorkQueue] = useState<AdminInquiry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setStats(null);
    setInquiries(null);
    setWorkQueue(null);

    const [statsResult, inquiryStatsResult, queueResult] = await Promise.allSettled([
      fetch(`${apiBase}/api/admin/stats`, { credentials: "include" }),
      fetch(`${apiBase}/api/inquiries/stats`, { credentials: "include" }),
      fetch(`${apiBase}/api/inquiries?page=1&limit=5&status=pending`, { credentials: "include" }),
    ]);

    const failures: string[] = [];

    if (statsResult.status === "fulfilled") {
      if (statsResult.value.ok) {
        setStats((await statsResult.value.json()) as StatsSummary);
      } else {
        failures.push(await messageFromResponse(statsResult.value, "No se pudo cargar la salud del catálogo."));
      }
    } else {
      failures.push("No se pudo cargar la salud del catálogo.");
    }

    if (inquiryStatsResult.status === "fulfilled") {
      if (inquiryStatsResult.value.ok) {
        setInquiries((await inquiryStatsResult.value.json()) as InquirySummary);
      } else {
        failures.push(await messageFromResponse(inquiryStatsResult.value, "No se pudieron cargar las metricas de consultas."));
      }
    } else {
      failures.push("No se pudieron cargar las metricas de consultas.");
    }

    if (queueResult.status === "fulfilled") {
      if (queueResult.value.ok) {
        const queueData = (await queueResult.value.json()) as InquiryListResponse;
        setWorkQueue(Array.isArray(queueData.inquiries) ? queueData.inquiries : []);
      } else {
        failures.push(await messageFromResponse(queueResult.value, "No se pudo cargar la cola de consultas."));
      }
    } else {
      failures.push("No se pudo cargar la cola de consultas.");
    }

    setError(failures[0] || null);
    setLoading(false);
  }, [apiBase, user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const openInquiries = useMemo(() => {
    if (!inquiries) return 0;

    return (inquiries.byStatus.NEW || 0) + (inquiries.byStatus.VIEWED || 0) + (inquiries.byStatus.CONTACTED || 0);
  }, [inquiries]);

  const newInquiries = inquiries?.byStatus.NEW || 0;
  const lowStock = stats?.lowStock || [];
  const topArProducts = stats?.topArProducts || [];

  if (!user && !loading) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Necesitás una sesión activa para administrar tu tienda.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Inicio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Consultas que necesitan atención y estado actual de tu catálogo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Actualizar inicio"
            title="Actualizar inicio"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" />
          </button>
          <Link
            href="/admin/inventory"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0058a3] px-3 text-sm font-bold text-white hover:bg-[#004f93]"
          >
            <Plus size={16} aria-hidden="true" />
            Nuevo producto
          </Link>
        </div>
      </header>

      {error && (
        <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button type="button" onClick={loadDashboard} className="h-10 self-start rounded-lg px-3 text-sm font-bold underline underline-offset-2 hover:bg-red-100 sm:self-auto">
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <MetricSkeleton />
      ) : inquiries && stats ? (
        <section aria-label="Resumen operativo" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Consultas nuevas"
            value={newInquiries}
            description={newInquiries === 1 ? "Requiere primer contacto." : "Requieren primer contacto."}
            icon={MessageSquare}
            tone="blue"
          />
          <MetricCard
            label="Consultas abiertas"
            value={openInquiries}
            description={openInquiries === 1 ? "En proceso de seguimiento." : "En proceso de seguimiento."}
            icon={UserRound}
            tone="amber"
          />
          <MetricCard
            label="Alertas de stock"
            value={lowStock.length}
            description={lowStock.length === 0 ? "No hay productos con stock bajo." : "Productos para revisar antes de publicar."}
            icon={AlertTriangle}
            tone="amber"
          />
          <MetricCard
            label="Ventas registradas"
            value={inquiries?.sales.count || 0}
            description={inquiries?.sales.count ? `${formatPrice(inquiries.sales.totalAmount)} confirmado en consultas.` : "Todavía no hay cierres registrados."}
            icon={CheckCircle2}
            tone="emerald"
          />
        </section>
      ) : null}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><PanelSkeleton rows={4} /></div>
          <PanelSkeleton rows={3} />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white lg:col-span-2" aria-labelledby="work-queue-title">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 id="work-queue-title" className="text-sm font-bold text-slate-900">Para atender</h2>
                <p className="mt-0.5 text-xs text-slate-500">Consultas abiertas ordenadas por fecha.</p>
              </div>
              <Link href="/admin/inquiries" className="inline-flex h-10 items-center gap-1 px-1 text-sm font-bold text-[#0058a3] hover:text-[#004f93]">
                Ver todas <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {workQueue === null ? (
              <EmptyPanel
                icon={AlertTriangle}
                title="No se pudo cargar la cola"
                description="Actualiza el inicio para volver a consultar las consultas abiertas."
              />
            ) : workQueue.length === 0 ? (
              <EmptyPanel
                icon={MessageSquare}
                title="No hay consultas abiertas"
                description="Las nuevas consultas de clientes van a aparecer aca para que puedas darles seguimiento."
                actionLabel="Ver consultas"
                actionHref="/admin/inquiries"
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {workQueue.map((inquiry) => (
                  <li key={inquiry.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <UserRound size={16} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{inquiry.customerName}</p>
                        <p className="truncate text-xs text-slate-500">{inquiry.product?.name || "Producto no disponible"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className="text-right">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold ${statusStyles[inquiry.status]}`}>
                          {statusLabels[inquiry.status]}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(inquiry.createdAt)}</p>
                      </div>
                      <Link
                        href="/admin/inquiries"
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Gestionar
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white" aria-labelledby="catalog-health-title">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 id="catalog-health-title" className="text-sm font-bold text-slate-900">Salud del catálogo</h2>
                <p className="mt-0.5 text-xs text-slate-500">Alertas que conviene resolver.</p>
              </div>
              <Link href="/admin/inventory" className="inline-flex h-10 items-center gap-1 px-1 text-sm font-bold text-[#0058a3] hover:text-[#004f93]">
                Catálogo <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {!stats ? (
              <EmptyPanel
                icon={AlertTriangle}
                title="No se pudo evaluar el catálogo"
                description="Actualizá el inicio para volver a consultar las alertas de stock."
              />
            ) : lowStock.length === 0 ? (
              <EmptyPanel
                icon={Package}
                title="Sin alertas de stock"
                description="No hay productos con el nivel de stock bajo configurado."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {lowStock.slice(0, 5).map((product) => (
                  <li key={product.productId}>
                    <Link
                      href={`/admin/inventory?edit=${product.productId}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-[#0058a3] transition-colors">
                          {product.name}
                        </p>
                        {product.storeName && <p className="truncate text-xs text-slate-500">{product.storeName}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                          {product.stockQty} uds.
                        </span>
                        <span className="text-xs font-bold text-[#0058a3] opacity-0 group-hover:opacity-100 transition-opacity">
                          Editar →
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {!loading && stats && (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white" aria-labelledby="ar-performance-title">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="ar-performance-title" className="text-sm font-bold text-slate-900">Interes en productos con AR</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {stats.arLast30} vistas en los últimos 30 días y {stats.arTotal} en total.
              </p>
            </div>
            <Eye size={18} className="text-slate-400" aria-hidden="true" />
          </div>

          {topArProducts.length === 0 ? (
            <EmptyPanel
              icon={Box}
              title="Todavía no hay vistas AR"
              description="Cuando los clientes usen la vista AR, los productos más explorados aparecerán acá."
            />
          ) : (
            <ul className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">
              {topArProducts.slice(0, 4).map((product) => (
                <li key={product.productId} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                    {product.storeName && <p className="truncate text-xs text-slate-500">{product.storeName}</p>}
                  </div>
                  <span className="shrink-0 text-sm font-bold text-slate-700">{product.views} vistas</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
