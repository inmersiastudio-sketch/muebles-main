"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdmin } from "../layout";
import { Settings, Save, Loader2, Store, Sliders, Globe, Link as LinkIcon, Copy, Check } from "lucide-react";

export default function SettingsPage() {
    const { user, apiBase } = useAdmin();
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/api/admin/settings`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch { }
        finally { setLoading(false); }
    }, [apiBase]);

    useEffect(() => { loadSettings(); }, [loadSettings]);

    const saveSetting = async (key: string, value: string) => {
        setSaving(key);
        try {
            await fetch(`${apiBase}/api/admin/settings`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ key, value }),
            });
            setSettings((prev) => ({ ...prev, [key]: value }));
        } catch { }
        finally { setSaving(null); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Configuración</h1>
                <p className="text-sm text-slate-500 mt-0.5">Ajustes generales de la plataforma y tu tienda</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse">
                            <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
                            <div className="h-10 w-full bg-slate-100 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* AR Tolerance */}
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#0058a3]/10 flex items-center justify-center">
                                <Sliders size={18} className="text-[#0058a3]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Validación de modelos AR</h3>
                                <p className="text-xs text-slate-500">Tolerancia de escala para la validación automática</p>
                            </div>
                        </div>
                        <div className="px-6 py-4">
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Tolerancia (0–1)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        value={settings.tolerance ?? "0.05"}
                                        onChange={(e) => setSettings((s) => ({ ...s, tolerance: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/10 transition-all"
                                    />
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Valores más altos permiten mayor diferencia entre las dimensiones del producto y el modelo 3D.
                                    </p>
                                </div>
                                <button
                                    onClick={() => saveSetting("tolerance", settings.tolerance ?? "0.05")}
                                    disabled={saving === "tolerance"}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0058a3] text-white text-sm font-bold hover:bg-[#004f93] transition-colors disabled:opacity-50"
                                >
                                    {saving === "tolerance" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Catálogo Compartible */}
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <LinkIcon size={18} className="text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Catálogo Compartible</h3>
                                <p className="text-xs text-slate-500">Configura tu catálogo público personalizado</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            {/* Custom Slug */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    URL personalizada
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500 bg-slate-50 px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200">
                                        amobly.com/catalog/
                                    </span>
                                    <input
                                        type="text"
                                        value={settings.storeSlug || ""}
                                        onChange={(e) => setSettings((s) => ({ ...s, storeSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                                        placeholder="tu-tienda"
                                        className="flex-1 px-4 py-2.5 rounded-r-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/10 transition-all"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Solo letras minúsculas, números y guiones
                                </p>
                            </div>

                            {/* WhatsApp */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    value={settings.storeWhatsapp || ""}
                                    onChange={(e) => setSettings((s) => ({ ...s, storeWhatsapp: e.target.value }))}
                                    placeholder="5491123456789"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/10 transition-all"
                                />
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Número con código de país, sin espacios ni símbolos
                                </p>
                            </div>

                            {/* Preview Link */}
                            {(settings.storeSlug || settings.storeWhatsapp) && (
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                    <p className="text-xs font-bold text-emerald-800 mb-2">Vista previa de tu catálogo:</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${typeof window !== "undefined" ? window.location.origin : ""}/catalog/${settings.storeSlug || "tu-tienda"}`}
                                            className="flex-1 px-3 py-2 rounded-lg border border-emerald-200 bg-white text-sm text-emerald-900"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}/catalog/${settings.storeSlug || "tu-tienda"}`);
                                            }}
                                            className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                            title="Copiar enlace"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <a
                                            href={`/catalog/${settings.storeSlug || "tu-tienda"}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                            title="Ver catálogo"
                                        >
                                            <Check size={16} />
                                        </a>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    saveSetting("storeSlug", settings.storeSlug || "");
                                    saveSetting("storeWhatsapp", settings.storeWhatsapp || "");
                                }}
                                disabled={saving === "storeSlug" || saving === "storeWhatsapp"}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0058a3] text-white text-sm font-bold hover:bg-[#004f93] transition-colors disabled:opacity-50"
                            >
                                {saving === "storeSlug" || saving === "storeWhatsapp" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Guardar
                            </button>
                        </div>
                    </div>

                    {/* Integrations — placeholder */}
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                <Globe size={18} className="text-violet-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Integraciones</h3>
                                <p className="text-xs text-slate-500">WhatsApp Business, Google Analytics, API Keys</p>
                            </div>
                        </div>
                        <div className="px-6 py-8 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 opacity-50">
                                <Globe size={24} className="text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 mb-1">En Desarrollo</p>
                            <p className="text-xs text-slate-500 max-w-xs">
                                Conectá tu mueblería con WhatsApp Business, Google Analytics y generá API Keys propias.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
