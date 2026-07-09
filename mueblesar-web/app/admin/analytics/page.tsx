"use client";

import { BarChart3, Box, Eye, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Analytics</h1>
                <p className="text-sm text-slate-500 mt-0.5">Métricas de rendimiento y conversión AR</p>
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0058a3]/10 to-violet-500/10 flex items-center justify-center mb-6">
                    <BarChart3 size={36} className="text-[#0058a3]" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Sección en Desarrollo</h2>
                <p className="text-sm text-slate-500 max-w-md mb-8">
                    Estamos trabajando en nuevos reportes de analytics. Muy pronto podrás ver métricas detalladas de conversión AR y rendimiento de tus productos.
                </p>
                {/* Preview cards - disabled look */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg opacity-50 pointer-events-none">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                        <Eye size={20} className="text-amber-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">Conversión AR</p>
                        <p className="text-[10px] text-slate-500 mt-1">AR views → compras</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                        <TrendingUp size={20} className="text-emerald-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">Tendencias</p>
                        <p className="text-[10px] text-slate-500 mt-1">Evolución temporal</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                        <Box size={20} className="text-violet-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">Reportes PDF</p>
                        <p className="text-[10px] text-slate-500 mt-1">Exportá y compartí</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
