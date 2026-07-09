"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAdmin } from "./layout";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Eye,
  AlertTriangle,
  Box,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type StatsSummary = {
  totalSales: number;
  totalOrders: number;
  avgOrder: number;
  last30Sales: number;
  topProducts: { productId: number; name: string; storeName: string; totalSold: number; units: number }[];
  arTotal: number;
  arLast30: number;
  topArProducts: { productId: number; name: string; storeName: string; views: number }[];
  lowStock: { productId: number; name: string; stockQty: number; storeName: string }[];
};

// Skeleton for loading state
function KPISkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
          <div className="h-3 w-20 bg-slate-200 rounded mb-3" />
          <div className="h-8 w-32 bg-slate-200 rounded mb-2" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
      <div className="h-4 w-28 bg-slate-200 rounded mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between py-3 border-t border-slate-100">
          <div className="h-3 w-40 bg-slate-100 rounded" />
          <div className="h-3 w-16 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

// Empty state component
function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={24} className="text-slate-400" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-[240px] mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0058a3] hover:text-[#004f93] bg-[#0058a3]/5 hover:bg-[#0058a3]/10 px-4 py-2 rounded-full transition-colors"
        >
          <Plus size={14} /> {actionLabel}
        </Link>
      )}
    </div>
  );
}

// KPI Card
function KPICard({ label, value, trend, trendLabel, icon: Icon, color }: {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
      {trend && trendLabel && (
        <div className="flex items-center gap-1 mt-2">
          {trend === "up" ? (
            <TrendingUp size={14} className="text-emerald-600" />
          ) : trend === "down" ? (
            <TrendingDown size={14} className="text-red-500" />
          ) : null}
          <span className={`text-xs font-semibold ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-slate-500"}`}>
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, apiBase } = useAdmin();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/admin/stats`, { credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string })?.error || `Error ${res.status}`);
        return;
      }
      const data = await res.json();
      setStats(data as StatsSummary);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, apiBase]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatPrice = (v: number) => `$${v.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Bienvenido, <span className="font-semibold text-slate-700">{user?.name || user?.email?.split("@")[0]}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Actualizar
          </button>
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0058a3] text-white text-sm font-bold hover:bg-[#004f93] transition-colors shadow-sm"
          >
            <Plus size={14} /> Nuevo producto
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <KPISkeleton />
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Ventas totales"
            value={formatPrice(stats.totalSales)}
            icon={DollarSign}
            color="bg-emerald-500"
            trend={stats.last30Sales > 0 ? "up" : "neutral"}
            trendLabel={stats.last30Sales > 0 ? `${formatPrice(stats.last30Sales)} últimos 30 días` : "Sin ventas recientes"}
          />
          <KPICard
            label="Pedidos"
            value={String(stats.totalOrders)}
            icon={ShoppingCart}
            color="bg-[#0058a3]"
            trend="neutral"
            trendLabel="Todos los períodos"
          />
          <KPICard
            label="Ticket promedio"
            value={formatPrice(stats.avgOrder)}
            icon={Package}
            color="bg-violet-500"
          />
          <KPICard
            label="Vistas AR"
            value={String(stats.arTotal)}
            icon={Eye}
            color="bg-amber-500"
            trend={stats.arLast30 > 0 ? "up" : "neutral"}
            trendLabel={stats.arLast30 > 0 ? `${stats.arLast30} últimos 30 días` : "Sin datos recientes"}
          />
        </div>
      ) : null}

      {/* Content Grid */}
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <TableSkeleton />
          <TableSkeleton />
          <TableSkeleton />
        </div>
      ) : stats ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Top Products */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Top Productos</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                {stats.topProducts.length} items
              </span>
            </div>
            {stats.topProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Sin ventas todavía"
                description="Cuando realices tu primera venta, acá vas a ver tus productos más vendidos."
                actionLabel="Agregar productos"
                actionHref="/admin/inventory"
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.topProducts.slice(0, 5).map((p) => (
                  <li key={p.productId} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.storeName}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-slate-900">{formatPrice(p.totalSold)}</p>
                      <p className="text-[11px] text-slate-500">{p.units} uds</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* AR Views */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Vistas AR</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {stats.arLast30} últimos 30d
                </span>
              </div>
            </div>
            {stats.topArProducts.length === 0 ? (
              <EmptyState
                icon={Box}
                title="Sin vistas AR"
                description="Subí modelos 3D a tus productos para empezar a trackear las experiencias AR de tus clientes."
                actionLabel="Subir modelo 3D"
                actionHref="/admin/media"
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.topArProducts.slice(0, 5).map((p) => (
                  <li key={p.productId} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.storeName}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0 ml-3">
                      {p.views} vistas
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Low Stock */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Stock bajo</h3>
              {stats.lowStock.length > 0 && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle size={10} /> {stats.lowStock.length} alertas
                </span>
              )}
            </div>
            {stats.lowStock.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="Todo en orden"
                description="No hay productos con stock bajo. ¡Excelente gestión de inventario!"
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.lowStock.slice(0, 5).map((p) => (
                  <li key={p.productId} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.storeName}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full shrink-0 ml-3">
                      {p.stockQty} uds
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {/* Quick actions */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/orders"
            className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#0058a3]/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0058a3]/10 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-[#0058a3]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ver Pedidos</h3>
                  <p className="text-xs text-slate-500">Gestioná tus órdenes actuales</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#0058a3] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          <Link
            href="/admin/inventory"
            className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#0058a3]/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Package size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Inventario</h3>
                  <p className="text-xs text-slate-500">Administrá productos y stock</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          <Link
            href="/admin/media"
            className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#0058a3]/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Box size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Modelos AR</h3>
                  <p className="text-xs text-slate-500">Cargá modelos 3D a tus muebles</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}