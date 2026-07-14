"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useAdmin } from "../layout";
import type { SubscriptionPlan, SubscriptionStatus } from "@/app/lib/admin.types";

type PlansResponse = {
  plans: Record<string, Omit<SubscriptionPlan, "id">>;
};

function getErrorMessage(response: Response, fallback: string) {
  if (response.status === 401) return "Tu sesion vencio. Volve a iniciar sesion.";
  if (response.status === 403) return "No tenes permisos para administrar la facturacion de esta tienda.";
  return response
    .json()
    .then((data: { error?: string; message?: string }) => data.error || data.message || fallback)
    .catch(() => fallback);
}

function statusPresentation(status: string) {
  const presentations: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Activa", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    TRIAL: { label: "Prueba", className: "border-amber-200 bg-amber-50 text-amber-700" },
    PAST_DUE: { label: "Pendiente de pago", className: "border-red-200 bg-red-50 text-red-700" },
    CANCELED: { label: "Cancelada", className: "border-slate-200 bg-slate-100 text-slate-700" },
    INACTIVE: { label: "Sin plan activo", className: "border-slate-200 bg-slate-50 text-slate-700" },
  };
  return presentations[status] || { label: status || "Sin estado", className: "border-slate-200 bg-slate-50 text-slate-700" };
}

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export default function BillingPage() {
  const { user, apiBase } = useAdmin();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadBilling = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const plansResponse = await fetch(`${apiBase}/api/subscriptions/plans`, { credentials: "include" });
      if (!plansResponse.ok) throw new Error(await getErrorMessage(plansResponse, "No se pudieron cargar los planes publicados."));
      const plansPayload = (await plansResponse.json()) as PlansResponse;
      const receivedPlans = Object.entries(plansPayload.plans || {}).map(([id, plan]) => ({ id, ...plan }));
      setPlans(receivedPlans);

      if (!user.storeId) {
        setSubscription(null);
        return;
      }

      const statusResponse = await fetch(`${apiBase}/api/subscriptions/status/${user.storeId}`, { credentials: "include" });
      if (!statusResponse.ok) throw new Error(await getErrorMessage(statusResponse, "No se pudo cargar el estado de facturacion."));
      setSubscription((await statusResponse.json()) as SubscriptionStatus);
    } catch (loadError) {
      setPlans([]);
      setSubscription(null);
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la facturacion.");
    } finally {
      setLoading(false);
    }
  }, [apiBase, user]);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  const startCheckout = async (plan: SubscriptionPlan) => {
    if (!user?.storeId || !user.email) return;
    setSubscribing(plan.id);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/api/subscriptions/create-checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planType: plan.id, storeId: user.storeId, payerEmail: user.email }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response, "No se pudo iniciar el checkout de suscripcion."));
      const payload = (await response.json()) as { checkoutUrl?: string };
      if (!payload.checkoutUrl) throw new Error("La API no devolvio una URL de checkout valida.");
      window.location.assign(payload.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "No se pudo iniciar el checkout de suscripcion.");
      setSubscribing(null);
    }
  };

  const cancelSubscription = async () => {
    if (!user?.storeId || !window.confirm("Queres cancelar la suscripcion activa?")) return;
    setCancelling(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/api/subscriptions/cancel`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storeId: user.storeId }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response, "No se pudo cancelar la suscripcion."));
      await loadBilling();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "No se pudo cancelar la suscripcion.");
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Necesitas una sesion activa para consultar la facturacion.</div>;
  }

  const planName = subscription?.planType ? plans.find((plan) => plan.id === subscription.planType)?.name || subscription.planType : "Sin plan";
  const status = statusPresentation(subscription?.status || "INACTIVE");
  const usage = subscription ? Math.min(100, (subscription.creditsUsed / Math.max(1, subscription.creditsLimit)) * 100) : 0;
  const purchasablePlans = plans.filter((plan) => plan.amount > 0);
  const canCheckout = Boolean(user.storeId && user.email);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Facturacion</h1><p className="mt-0.5 text-sm text-slate-500">Estado de suscripcion y creditos informados por la API.</p></div>
        <button type="button" onClick={loadBilling} disabled={loading || subscribing !== null || cancelling} className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:self-auto"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar</button>
      </div>

      {error && <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"><span>{error}</span><button type="button" onClick={loadBilling} className="underline underline-offset-2">Reintentar</button></div>}

      {!user.storeId && !loading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><div className="flex items-start gap-2"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p>No hay una tienda asignada a tu sesion. Podes consultar los planes publicados, pero no iniciar ni administrar una suscripcion.</p></div></div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-500"><Loader2 size={18} className="animate-spin" /> Cargando facturacion...</div>
      ) : (
        <>
          {subscription && (
            <section className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suscripcion actual</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">{planName}</h2></div><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${status.className}`}>{subscription.status === "ACTIVE" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}{status.label}</span></div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Creditos mensuales</p><div className="mt-2 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${usage >= 90 ? "bg-red-500" : usage >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${usage}%` }} /></div><span className="text-sm font-bold text-slate-900">{subscription.creditsUsed} / {subscription.creditsLimit}</span></div></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Proximo cobro</p><p className="mt-2 text-sm font-bold text-slate-900">{subscription.nextPaymentDate ? new Date(subscription.nextPaymentDate).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" }) : "No informado"}</p></div></div>
                {subscription.status === "ACTIVE" && <button type="button" onClick={cancelSubscription} disabled={cancelling} className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{cancelling && <Loader2 size={14} className="animate-spin" />} Cancelar suscripcion</button>}
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Creditos 3D prepagos</p><p className="mt-2 text-3xl font-extrabold text-slate-900">{subscription.ai3dCredits}</p><p className="mt-1 text-sm text-slate-500">Saldo disponible</p><div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">Modelos procesados</p><p className="mt-1 text-sm font-bold text-slate-900">{subscription.ai3dUsed}</p></div></div>
            </section>
          )}

          <section>
            <div className="mb-4"><h2 className="text-lg font-bold text-slate-900">Planes publicados</h2><p className="mt-0.5 text-sm text-slate-500">Disponibilidad y precios recibidos directamente del servidor.</p></div>
            {purchasablePlans.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-8 text-center"><CreditCard size={28} className="mx-auto mb-3 text-slate-300" /><h3 className="font-bold text-slate-900">No hay planes para contratar</h3><p className="mt-1 text-sm text-slate-500">La API no publico planes pagos disponibles.</p></div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {purchasablePlans.map((plan) => {
                  const active = subscription?.planType === plan.id;
                  return <article key={plan.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-5"><div><h3 className="text-lg font-bold text-slate-900">{plan.name}</h3><p className="mt-1 text-2xl font-extrabold text-slate-900">{formatPrice(plan.amount, plan.currency)}<span className="ml-1 text-sm font-medium text-slate-500">/mes</span></p><p className="mt-4 text-sm text-slate-600">{plan.credits} creditos 3D mensuales y hasta {plan.maxProducts} productos.</p><ul className="mt-4 space-y-2">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-slate-600"><Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />{feature}</li>)}</ul></div><button type="button" onClick={() => startCheckout(plan)} disabled={!canCheckout || active || subscribing !== null} className={`mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${active ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-[#0058a3] text-white hover:bg-[#004f93]"}`}>{subscribing === plan.id ? <><Loader2 size={15} className="animate-spin" /> Procesando</> : active ? <><CheckCircle2 size={15} /> Plan actual</> : !canCheckout ? "Tienda o email no disponible" : <><CreditCard size={15} /> Contratar</>}</button></article>;
                })}
              </div>
            )}
          </section>

          {!subscription && !error && user.storeId && <div className="rounded-lg border border-slate-200 bg-white p-8 text-center"><XCircle size={28} className="mx-auto mb-3 text-slate-300" /><h2 className="font-bold text-slate-900">No hay estado de suscripcion disponible</h2><p className="mt-1 text-sm text-slate-500">La API no devolvio datos de facturacion para esta tienda.</p></div>}
        </>
      )}
    </div>
  );
}
