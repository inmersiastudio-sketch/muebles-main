"use client";

import { useCallback, useEffect, useRef, useState, type ElementType } from "react";
import { useAdmin } from "../layout";
import { useToast } from "../../context/ToastContext";
import { CreditPackages } from "../../components/dashboard/CreditPackages";
import {
    CreditCard,
    Check,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Zap,
    Crown,
    Building2,
    Sparkles,
    ArrowRight,
    Coins
} from "lucide-react";

type SubscriptionStatus = {
    status: "ACTIVE" | "INACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELED";
    plan: string;
    creditsUsed: number;
    creditsLimit: number;
    nextBillingDate?: string;
    amount?: number;
    ai3dCredits: number;
    ai3dUsed: number;
};

type Plan = {
    id: string;
    name: string;
    price: number;
    credits: number;
    features: string[];
    popular?: boolean;
    icon: ElementType;
};

const plans: Plan[] = [
    {
        id: "basic",
        name: "Mueblería Básica",
        price: 20000,
        credits: 10,
        features: [
            "10 Créditos 3D/mes",
            "Soporte básico por email",
            "Máximo 100 productos en BD",
            "Modelos GLB/USDZ",
            "Visualización AR básica"
        ],
        icon: Building2
    },
    {
        id: "pro",
        name: "Mueblería Pro",
        price: 50000,
        credits: 30,
        popular: true,
        features: [
            "30 Créditos 3D/mes",
            "Carga por CSV masiva",
            "Estadísticas de vistas AR",
            "Soporte prioritario",
            "Productos ilimitados",
            "Badge \"Pro\" en tu tienda"
        ],
        icon: Crown
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: 120000,
        credits: 100,
        features: [
            "100 Créditos 3D/mes",
            "Bot de WhatsApp propio",
            "Integración Tiendanube",
            "API keys personalizadas",
            "Gerente de cuenta dedicado",
            "Análisis personalizado"
        ],
        icon: Zap
    }
];

export default function BillingPage() {
    const { user, apiBase } = useAdmin();
    const { success, error: showError } = useToast();

    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState<string | null>(null);
    const [creditsReturnStatus, setCreditsReturnStatus] = useState<string | null>(null);
    const handledReturnStatusRef = useRef<string | null>(null);

    const fetchSubscriptionStatus = useCallback(async () => {
        if (!user?.storeId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/api/subscriptions/status/${user.storeId}`, {
                credentials: "include"
            });

            if (res.ok) {
                const data = await res.json();

                // Map API "planType" to frontend plan label
                let displayName = "Ninguno";
                if (data.planType === "BASIC") displayName = "Mueblería Básica";
                if (data.planType === "PREMIUM") displayName = "Mueblería Pro";
                if (data.planType === "ENTERPRISE") displayName = "Enterprise";

                setSubscription({
                    status: data.status as SubscriptionStatus['status'] || "INACTIVE",
                    plan: displayName,
                    creditsUsed: data.creditsUsed || 0,
                    creditsLimit: data.creditsLimit || 5, // fallback 5
                    nextBillingDate: data.nextPaymentDate || undefined,
                    amount: undefined, // not returned from our DB
                    ai3dCredits: data.ai3dCredits || 0,
                    ai3dUsed: data.ai3dUsed || 0
                });
            } else {
                // If no subscription, set default
                setSubscription({
                    status: "INACTIVE",
                    plan: "Ninguno",
                    creditsUsed: 0,
                    creditsLimit: 0,
                    ai3dCredits: 0,
                    ai3dUsed: 0
                });
            }
        } catch (err) {
            console.error("Failed to fetch subscription:", err);
            setSubscription({
                status: "INACTIVE",
                plan: "Ninguno",
                creditsUsed: 0,
                creditsLimit: 0,
                ai3dCredits: 0,
                ai3dUsed: 0
            });
        } finally {
            setLoading(false);
        }
    }, [apiBase, user?.storeId]);

    useEffect(() => {
        if (!user) return; // Wait until user is strictly determined

        if (user.storeId) {
            fetchSubscriptionStatus();
        } else {
            // Super admins or users without a store shouldn't load forever
            setSubscription({
                status: "INACTIVE",
                plan: "Ninguno",
                creditsUsed: 0,
                creditsLimit: 5,
                ai3dCredits: 0,
                ai3dUsed: 0
            });
            setLoading(false);
        }
    }, [fetchSubscriptionStatus, user]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setCreditsReturnStatus(params.get("credits") ?? params.get("status"));
    }, []);

    useEffect(() => {
        if (!creditsReturnStatus) return;
        if (handledReturnStatusRef.current === creditsReturnStatus) return;

        handledReturnStatusRef.current = creditsReturnStatus;

        if (creditsReturnStatus === "success") {
            success("Pago recibido. Tus créditos se van a acreditar cuando Mercado Pago confirme el webhook.");
            fetchSubscriptionStatus();
            return;
        }

        if (creditsReturnStatus === "pending") {
            success("Tu pago está pendiente. Actualizaremos los créditos cuando Mercado Pago lo confirme.");
            fetchSubscriptionStatus();
            return;
        }

        if (creditsReturnStatus === "failure" || creditsReturnStatus === "error") {
            showError("Mercado Pago no pudo completar la compra de créditos.");
        }
    }, [creditsReturnStatus, fetchSubscriptionStatus, showError, success]);

    const handleSubscribe = async (planId: string) => {
        setSubscribing(planId);

        let mappedPlanType = "BASIC";
        if (planId === "pro") mappedPlanType = "PREMIUM";
        if (planId === "enterprise") mappedPlanType = "ENTERPRISE";

        try {
            const validEmail = (user?.email && user.email.includes('@'))
                ? user.email
                : "test@amobly.com";

            const res = await fetch(`${apiBase}/api/subscriptions/create-checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    planType: mappedPlanType,
                    storeId: user?.storeId ? Number(user.storeId) : 1, // Fallback si eres admin sin storeId
                    payerEmail: validEmail
                })
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Backend validation error data:", data);
                const errorMsg = data.details ? JSON.stringify(data.details) : data.message || data.error || "Error al procesar la suscripción";
                showError("Rechazado por Backend: " + errorMsg);
                return;
            }

            if (data.checkoutUrl) {
                success("Redirigiendo a MercadoPago...");
                window.location.href = data.checkoutUrl;
            } else {
                showError("No se recibió URL de pago");
            }
        } catch (err) {
            console.error("Subscription error:", err);
            showError("Error de conexión. Intentá nuevamente.");
        } finally {
            setSubscribing(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE": return "text-emerald-600 bg-emerald-50 border-emerald-200";
            case "TRIAL": return "text-amber-600 bg-amber-50 border-amber-200";
            case "PAST_DUE": return "text-red-600 bg-red-50 border-red-200";
            case "CANCELED": return "text-red-600 bg-red-50 border-red-200";
            default: return "text-slate-600 bg-slate-50 border-slate-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ACTIVE": return <CheckCircle2 size={16} />;
            case "TRIAL": return <Sparkles size={16} />;
            case "PAST_DUE": return <AlertCircle size={16} />;
            case "CANCELED": return <XCircle size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "ACTIVE": return "Activa";
            case "TRIAL": return "Prueba";
            case "PAST_DUE": return "Impaga";
            case "CANCELED": return "Cancelada";
            default: return "Sin plan";
        }
    };

    const creditsPercentage = subscription
        ? Math.min(100, (subscription.creditsUsed / Math.max(1, subscription.creditsLimit)) * 100)
        : 0;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Facturación</h1>
                <p className="text-sm text-slate-500 mt-0.5">Gestioná tu suscripción mensual y recargá créditos para generación 3D</p>
            </div>

            {/* Status Grid (Subscription + Credit Balance) */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Current Subscription Card */}
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="bg-gradient-to-r from-[#001d3d] via-[#003566] to-[#0058a3] px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                                    <CreditCard size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-base">Suscripción Mensual</h2>
                                    <p className="text-white/70 text-xs">Plan y pool de créditos mensuales</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 size={24} className="animate-spin text-slate-400" />
                                </div>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-3">
                                    {/* Status */}
                                    <div className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estado</p>
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold w-fit ${getStatusColor(subscription?.status || "INACTIVE")}`}>
                                            {getStatusIcon(subscription?.status || "INACTIVE")}
                                            {getStatusLabel(subscription?.status || "INACTIVE")}
                                        </div>
                                    </div>

                                    {/* Plan Name */}
                                    <div className="p-4 rounded-xl border border-slate-200">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Plan</p>
                                        <p className="text-lg font-extrabold text-slate-900">{subscription?.plan || "Sin plan"}</p>
                                        {subscription?.nextBillingDate && (
                                            <p className="text-[10px] text-slate-500 mt-1">
                                                Próximo cobro: {new Date(subscription.nextBillingDate).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                                            </p>
                                        )}
                                    </div>

                                    {/* Monthly Credits Balance */}
                                    <div className="p-4 rounded-xl border border-slate-200">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Créditos del Plan</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${creditsPercentage > 90 ? "bg-red-500" :
                                                            creditsPercentage > 70 ? "bg-amber-500" : "bg-emerald-500"
                                                            }`}
                                                        style={{ width: `${creditsPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 shrink-0">
                                                {subscription?.creditsUsed || 0} / {subscription?.creditsLimit || 0}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-slate-500 mt-1">Se resetean cada mes de facturación</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pre-paid Credit Balance Card (Pay-per-use) */}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="bg-gradient-to-r from-emerald-950 to-emerald-800 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                                    <Coins size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-base">Créditos Prepagos</h2>
                                    <p className="text-white/70 text-xs">Saldo de recargas ad-hoc</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 size={24} className="animate-spin text-slate-400" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <span className="text-xs font-bold text-emerald-800">Saldo Disponible</span>
                                        <span className="text-2xl font-extrabold text-emerald-950">
                                            {subscription?.ai3dCredits || 0} <span className="text-xs font-medium text-emerald-700">créditos</span>
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                                        <span>Consumidos históricamente:</span>
                                        <span className="font-bold text-slate-700">{subscription?.ai3dUsed || 0} modelos</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6 pt-0">
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Los créditos prepagos no vencen al final del mes y se usan automáticamente cuando consumís tu cupo de suscripción.
                        </p>
                    </div>
                </div>
            </div>

            <CreditPackages currentCredits={subscription?.ai3dCredits || 0} apiBase={apiBase} />

            {/* Plans */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Planes de Suscripción Mensual</h2>

                <div className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const isPopular = plan.popular;
                        const isSubscribing = subscribing === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl border overflow-hidden bg-white transition-all hover:shadow-xl ${isPopular
                                    ? "border-[#0058a3] shadow-lg shadow-[#0058a3]/10"
                                    : "border-slate-200 shadow-sm hover:border-slate-300"
                                    }`}
                            >
                                {/* Popular Badge */}
                                {isPopular && (
                                    <div className="absolute top-0 left-0 right-0">
                                        <div className="bg-gradient-to-r from-[#0058a3] to-[#0070d6] text-white text-center py-1.5 text-xs font-bold">
                                            MÁS POPULAR
                                        </div>
                                    </div>
                                )}

                                <div className={`p-6 ${isPopular ? "pt-12" : ""}`}>
                                    {/* Plan Icon */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isPopular
                                        ? "bg-gradient-to-br from-[#0058a3] to-[#0070d6] text-white"
                                        : "bg-slate-100 text-slate-600"
                                        }`}>
                                        <Icon size={24} />
                                    </div>

                                    {/* Plan Name */}
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-extrabold text-slate-900">
                                            {formatPrice(plan.price)}
                                        </span>
                                        <span className="text-sm text-slate-500">/mes</span>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                                <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Subscribe Button */}
                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={isSubscribing || subscription?.plan === plan.name}
                                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${isSubscribing
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : subscription?.plan === plan.name
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                                                : isPopular
                                                    ? "bg-gradient-to-r from-[#0058a3] to-[#0070d6] text-white hover:from-[#004f93] hover:to-[#0058a3] shadow-lg shadow-[#0058a3]/25 active:scale-[0.98]"
                                                    : "bg-white text-[#0058a3] border-2 border-[#0058a3] hover:bg-[#0058a3]/5"
                                            }`}
                                    >
                                        {isSubscribing ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Procesando...
                                            </>
                                        ) : subscription?.plan === plan.name ? (
                                            <>
                                                <CheckCircle2 size={16} />
                                                Plan Actual
                                            </>
                                        ) : (
                                            <>
                                                Suscribirme
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Payment Methods Note */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                    <CreditCard size={16} className="text-slate-600" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-700">Pagos procesados y protegidos por MercadoPago</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Tus datos de pago están 100% protegidos. Aceptamos tarjetas de crédito, débito, dinero en Mercado Pago y transferencias.
                        La acreditación de créditos y planes es instantánea una vez aprobado el pago.
                    </p>
                </div>
            </div>
        </div>
    );
}
