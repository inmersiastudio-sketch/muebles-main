"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Eye,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
  Box,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface StatsData {
  totalSales: number;
  totalOrders: number;
  avgOrder: number;
  last30Sales: number;
  arTotal: number;
  arLast30: number;
  topProducts: Array<{ productId: number; name: string; storeName: string; totalSold: number; units: number }>;
  topArProducts: Array<{ productId: number; name: string; storeName: string; views: number }>;
  lowStock: Array<{ productId: number; name: string; stockQty: number; storeName: string }>;
}

interface InquiryStats {
  total: number;
  byStatus: Record<string, number>;
  byResult: Record<string, number>;
  conversionRate: number;
  soldInquiries?: number;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "blue",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "green" | "amber" | "violet";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [inquiryStats, setInquiryStats] = useState<InquiryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, inquiryRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/admin/stats`, { credentials: "include" }),
        fetch(`${API_BASE}/api/admin/inquiries/stats`, { credentials: "include" }),
      ]);

      if (statsRes.status === "fulfilled") {
        if (statsRes.value.status === 401) {
          router.push("/login");
          return;
        }
        if (statsRes.value.ok) {
          const data = await statsRes.value.json();
          setStats(data);
        }
      }

      if (inquiryRes.status === "fulfilled" && inquiryRes.value.ok) {
        const data = await inquiryRes.value.json();
        setInquiryStats(data);
      }
    } catch {
      setError("No se pudieron cargar las métricas. Verificá que el backend esté activo.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#0058a3]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button onClick={loadData} className="mt-3 text-xs text-red-600 underline">Reintentar</button>
      </div>
    );
  }

  const resultLabels: Record<string, string> = {
    SOLD: "Vendido",
    LOST_PRICE: "Perdido (precio)",
    LOST_STOCK: "Perdido (stock)",
    LOST_NO_REPLY: "Sin respuesta",
    LOST_OTHER: "Perdido (otro)",
    PENDING: "Pendiente",
  };

  const statusLabels: Record<string, string> = {
    NEW: "Nuevas",
    VIEWED: "Vistas",
    CONTACTED: "Contactadas",
    CLOSED: "Cerradas",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Métricas de rendimiento y conversión</p>
        </div>
        <button onClick={loadData} className="text-xs font-medium text-[#0058a3] hover:underline">
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={MessageSquare}
          label="Consultas Totales"
          value={inquiryStats?.total ?? 0}
          sub="Desde el inicio"
          color="blue"
        />
        <KpiCard
          icon={CheckCircle}
          label="Tasa de Conversión"
          value={`${((inquiryStats?.conversionRate ?? 0) * 100).toFixed(1)}%`}
          sub="Consultas → Venta"
          color="green"
        />
        <KpiCard
          icon={Eye}
          label="Vistas AR"
          value={stats?.arLast30 ?? 0}
          sub="Últimos 30 días"
          color="amber"
        />
        <KpiCard
          icon={Box}
          label="Interacciones 3D"
          value={stats?.arTotal ?? 0}
          sub="Total histórico"
          color="violet"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top AR Products */}
        {stats?.topArProducts && stats.topArProducts.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Box size={16} className="text-amber-500" />
              Productos más vistos en 3D/AR
            </h3>
            <div className="space-y-3">
              {stats.topArProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.storeName}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{p.views} vistas</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inquiry Status */}
        {inquiryStats?.byStatus && Object.keys(inquiryStats.byStatus).length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" />
              Estado de consultas
            </h3>
            <div className="space-y-3">
              {Object.entries(inquiryStats.byStatus).map(([key, count]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{statusLabels[key] || key}</span>
                      <span className="text-xs font-bold text-slate-900">{count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-[#0058a3]"
                        style={{ width: `${inquiryStats.total > 0 ? (count / inquiryStats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result breakdown */}
        {inquiryStats?.byResult && Object.keys(inquiryStats.byResult).length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              Resultado de consultas cerradas
            </h3>
            <div className="space-y-3">
              {Object.entries(inquiryStats.byResult).map(([key, count]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{resultLabels[key] || key}</span>
                  <span className="text-sm font-bold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low stock */}
        {stats?.lowStock && stats.lowStock.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-sm font-bold text-amber-900 mb-4 flex items-center gap-2">
              <XCircle size={16} className="text-amber-600" />
              Stock bajo (≤3 unidades)
            </h3>
            <div className="space-y-2">
              {stats.lowStock.map((p) => (
                <div key={p.productId} className="flex items-center justify-between">
                  <p className="text-sm text-amber-800 truncate max-w-[200px]">{p.name}</p>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    {p.stockQty} und.
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!stats && !inquiryStats && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 size={40} className="text-slate-300 mb-4" />
          <p className="text-sm text-slate-500">Aún no hay datos suficientes para mostrar métricas.</p>
          <p className="text-xs text-slate-400 mt-1">Las métricas aparecerán a medida que se generen consultas e interacciones.</p>
        </div>
      )}
    </div>
  );
}
