"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clipboard, Loader2, RefreshCw, Save, Sparkles, Store } from "lucide-react";
import { useAdmin } from "../layout";
import type { StoreSettings } from "@/app/lib/admin.types";

type StoreSettingsResponse = { success: boolean; data: StoreSettings };

function responseMessage(response: Response, fallback: string) {
  if (response.status === 401) return "Tu sesion vencio. Volve a iniciar sesion.";
  if (response.status === 403) return "No tenes permisos para configurar esta tienda.";
  return response
    .json()
    .then((data: { error?: string; message?: string }) => data.error || data.message || fallback)
    .catch(() => fallback);
}

const textFields: Array<{ key: keyof StoreSettings; label: string; type?: string; placeholder?: string }> = [
  { key: "name", label: "Nombre comercial" },
  { key: "logoUrl", label: "URL del logo", type: "url" },
  { key: "whatsapp", label: "WhatsApp", type: "tel" },
  { key: "phone", label: "Telefono", type: "tel" },
  { key: "email", label: "Email de contacto", type: "email" },
  { key: "website", label: "Sitio web", type: "url" },
  { key: "address", label: "Direccion" },
  { key: "city", label: "Ciudad" },
  { key: "province", label: "Provincia" },
  { key: "country", label: "Pais" },
  { key: "socialInstagram", label: "Instagram" },
  { key: "socialFacebook", label: "Facebook" },
];

export default function SettingsPage() {
  const { user, apiBase } = useAdmin();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingSlug, setGeneratingSlug] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user?.storeId) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/api/stores/${user.storeId}/settings`, { credentials: "include" });
      if (!response.ok) throw new Error(await responseMessage(response, "No se pudo cargar la configuracion de la tienda."));
      const payload = (await response.json()) as StoreSettingsResponse;
      if (!payload.data) throw new Error("La API no devolvio una configuracion de tienda.");
      setSettings(payload.data);
    } catch (loadError) {
      setSettings(null);
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la configuracion de la tienda.");
    } finally {
      setLoading(false);
    }
  }, [apiBase, user?.storeId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateField = (key: keyof StoreSettings, value: string) => {
    setSettings((current) => current ? { ...current, [key]: value } : current);
    setNotice(null);
  };

  const saveSettings = async () => {
    if (!settings || !user?.storeId) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`${apiBase}/api/stores/${user.storeId}/settings`, {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: settings.slug,
          name: settings.name,
          description: settings.description || "",
          logoUrl: settings.logoUrl || "",
          whatsapp: settings.whatsapp || "",
          phone: settings.phone || "",
          email: settings.email || "",
          website: settings.website || "",
          address: settings.address || "",
          city: settings.city || "",
          province: settings.province || "",
          country: settings.country || "",
          socialInstagram: settings.socialInstagram || "",
          socialFacebook: settings.socialFacebook || "",
        }),
      });
      if (!response.ok) throw new Error(await responseMessage(response, "No se pudo guardar la configuracion."));
      const payload = (await response.json()) as { data?: StoreSettings };
      if (payload.data) setSettings(payload.data);
      setNotice("Configuracion guardada.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar la configuracion.");
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = async () => {
    if (!user?.storeId) return;
    setGeneratingSlug(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/api/stores/${user.storeId}/generate-slug`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error(await responseMessage(response, "No se pudo generar la URL."));
      const payload = (await response.json()) as { data?: { generatedSlug?: string } };
      if (!payload.data?.generatedSlug) throw new Error("La API no devolvio una URL valida.");
      updateField("slug", payload.data.generatedSlug);
    } catch (slugError) {
      setError(slugError instanceof Error ? slugError.message : "No se pudo generar la URL.");
    } finally {
      setGeneratingSlug(false);
    }
  };

  const copyCatalogUrl = async () => {
    if (!settings?.slug) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/catalog/${settings.slug}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("No se pudo copiar el enlace.");
    }
  };

  if (!user) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Necesitas una sesion activa para configurar una tienda.</div>;
  }

  if (!user.storeId) {
    return (
      <div className="space-y-4">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Configuracion</h1><p className="mt-0.5 text-sm text-slate-500">Ajustes operativos de la tienda.</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center"><Store size={30} className="mx-auto mb-3 text-slate-300" /><h2 className="font-bold text-slate-900">No hay una tienda asignada</h2><p className="mt-1 text-sm text-slate-500">La API necesita una tienda asociada a tu sesion para cargar y guardar estos ajustes.</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Configuracion de tienda</h1><p className="mt-0.5 text-sm text-slate-500">Datos publicos y canales de contacto del catalogo.</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={loadSettings} disabled={loading || saving} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar</button>
          <button type="button" onClick={saveSettings} disabled={!settings || loading || saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0058a3] px-3 text-sm font-bold text-white hover:bg-[#004f93] disabled:opacity-50">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Guardar</button>
        </div>
      </div>

      {error && <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"><span>{error}</span><button type="button" onClick={loadSettings} className="underline underline-offset-2">Reintentar</button></div>}
      {notice && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"><Check size={16} />{notice}</div>}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-500"><Loader2 size={18} className="animate-spin" /> Cargando configuracion...</div>
      ) : settings ? (
        <>
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-slate-900">Identidad y catalogo</h2><p className="mt-0.5 text-sm text-slate-500">La URL se publica al guardar los cambios.</p></div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Nombre comercial<input value={settings.name || ""} onChange={(event) => updateField("name", event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-[#0058a3]" /></label>
              <label className="block text-sm font-semibold text-slate-700">URL del catalogo<div className="mt-1.5 flex gap-2"><input value={settings.slug || ""} onChange={(event) => updateField("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-[#0058a3]" /><button type="button" onClick={generateSlug} disabled={generatingSlug} className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{generatingSlug ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Generar</button></div></label>
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Descripcion<textarea value={settings.description || ""} onChange={(event) => updateField("description", event.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm font-normal outline-none focus:border-[#0058a3]" /></label>
              {settings.slug && <div className="md:col-span-2"><p className="text-sm font-semibold text-slate-700">Enlace publico</p><div className="mt-1.5 flex gap-2"><input readOnly value={`${typeof window === "undefined" ? "" : window.location.origin}/catalog/${settings.slug}`} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600" /><button type="button" onClick={copyCatalogUrl} className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? "Copiado" : "Copiar"}</button></div></div>}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-slate-900">Contacto y presencia</h2><p className="mt-0.5 text-sm text-slate-500">Completa solo los datos que quieras publicar.</p></div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              {textFields.map((field) => <label key={field.key} className="block text-sm font-semibold text-slate-700">{field.label}<input type={field.type || "text"} value={String(settings[field.key] || "")} onChange={(event) => updateField(field.key, event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-[#0058a3]" /></label>)}
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center"><Store size={30} className="mx-auto mb-3 text-slate-300" /><h2 className="font-bold text-slate-900">No hay configuracion disponible</h2><p className="mt-1 text-sm text-slate-500">No se recibieron datos de la tienda para editar.</p></div>
      )}
    </div>
  );
}
