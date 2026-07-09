"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdmin } from "../layout";
import {
    ShoppingCart,
    Search,
    ChevronDown,
    MessageCircle,
    Loader2,
    Package,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    CreditCard,
    ArrowUpDown,
} from "lucide-react";
import Link from "next/link";

type OrderItem = {
    id: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product?: { name: string; slug: string; imageUrl?: string | null };
};

type Order = {
    id: number;
    storeId: number;
    status: string;
    total: number;
    customer: string | null;
    customerPhone: string | null;
    customerEmail: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    store?: { name: string };
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; bg: string }> = {
    PENDING: { label: "Pendiente", color: "text-amber-700", icon: Clock, bg: "bg-amber-50 border-amber-200" },
    CONFIRMED: { label: "Confirmado", color: "text-blue-700", icon: CheckCircle2, bg: "bg-blue-50 border-blue-200" },
    PAID: { label: "Pagado", color: "text-emerald-700", icon: CreditCard, bg: "bg-emerald-50 border-emerald-200" },
    SHIPPED: { label: "Enviado", color: "text-violet-700", icon: Truck, bg: "bg-violet-50 border-violet-200" },
    DELIVERED: { label: "Entregado", color: "text-green-700", icon: CheckCircle2, bg: "bg-green-50 border-green-200" },
    CANCELED: { label: "Cancelado", color: "text-red-700", icon: XCircle, bg: "bg-red-50 border-red-200" },
};

const allStatuses = ["PENDING", "CONFIRMED", "PAID", "SHIPPED", "DELIVERED", "CANCELED"];

function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.color}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
}

function EmptyOrders() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingCart size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Sin pedidos todavía</h3>
            <p className="text-sm text-slate-500 max-w-[300px]">
                Cuando tus clientes realicen su primer pedido, vas a poder gestionarlo desde acá.
            </p>
        </div>
    );
}

export default function OrdersPage() {
    const { user, apiBase } = useAdmin();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const loadOrders = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${apiBase}/api/admin/orders`, { credentials: "include" });
            if (!res.ok) {
                setError(`Error ${res.status}`);
                setOrders([]);
                return;
            }
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : data.items || []);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [user, apiBase]);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const res = await fetch(`${apiBase}/api/admin/orders/${orderId}`, {
                method: "PUT",
                headers: { "content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setOrders((prev) =>
                    prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
                );
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
                }
            }
        } catch { } finally {
            setUpdatingId(null);
        }
    };

    const formatPrice = (v: number) => `$${Number(v).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
    const formatDate = (d: string) => new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

    const filtered = orders.filter((o) => {
        if (statusFilter && o.status !== statusFilter) return false;
        if (search) {
            const s = search.toLowerCase();
            return (
                String(o.id).includes(s) ||
                (o.customer && o.customer.toLowerCase().includes(s)) ||
                (o.customerEmail && o.customerEmail.toLowerCase().includes(s))
            );
        }
        return true;
    });

    const composeWAMessage = (order: Order) => {
        const items = order.items.map((i) => `- ${i.product?.name || `Producto #${i.productId}`} x${i.quantity} (${formatPrice(Number(i.subtotal))})`).join("\n");
        const msg = `Hola! Tu pedido #${order.id} en Amobly:\n\n${items}\n\nTotal: ${formatPrice(Number(order.total))}\n\nEstado: ${statusConfig[order.status]?.label || order.status}`;
        return `https://wa.me/${order.customerPhone?.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Pedidos</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{orders.length} pedidos en total</p>
                </div>
                <button
                    onClick={loadOrders}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    Actualizar
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por ID, cliente o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/10 transition-all"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-[#0058a3] cursor-pointer"
                    >
                        <option value="">Todos los estados</option>
                        {allStatuses.map((s) => (
                            <option key={s} value={s}>{statusConfig[s]?.label || s}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">{error}</div>
            )}

            {/* Orders Table */}
            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden animate-pulse">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
                            <div className="h-4 w-16 bg-slate-200 rounded" />
                            <div className="h-4 w-32 bg-slate-200 rounded flex-1" />
                            <div className="h-6 w-24 bg-slate-100 rounded-full" />
                            <div className="h-4 w-20 bg-slate-200 rounded" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white">
                    <EmptyOrders />
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    {/* Table header */}
                    <div className="hidden sm:grid grid-cols-[80px_1fr_140px_120px_100px_80px] gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <span># ID</span>
                        <span>Cliente</span>
                        <span>Estado</span>
                        <span>Total</span>
                        <span>Fecha</span>
                        <span>Acción</span>
                    </div>

                    {/* Rows */}
                    {filtered.map((order) => (
                        <div
                            key={order.id}
                            className="grid grid-cols-1 sm:grid-cols-[80px_1fr_140px_120px_100px_80px] gap-3 px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors items-center cursor-pointer"
                            onClick={() => setSelectedOrder(order)}
                        >
                            <span className="text-sm font-bold text-slate-900">#{order.id}</span>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{order.customer || "Sin nombre"}</p>
                                {order.customerEmail && <p className="text-[11px] text-slate-500 truncate">{order.customerEmail}</p>}
                            </div>
                            <div>
                                <StatusBadge status={order.status} />
                            </div>
                            <span className="text-sm font-bold text-slate-900">{formatPrice(Number(order.total))}</span>
                            <span className="text-xs text-slate-500 font-medium">{formatDate(order.createdAt)}</span>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {/* Quick status change */}
                                <div className="relative">
                                    <select
                                        value={order.status}
                                        disabled={updatingId === order.id}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        className="appearance-none w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-center cursor-pointer text-transparent text-[0px] focus:outline-none disabled:opacity-50"
                                        title="Cambiar estado"
                                    >
                                        {allStatuses.map((s) => (
                                            <option key={s} value={s}>{statusConfig[s]?.label || s}</option>
                                        ))}
                                    </select>
                                    <ArrowUpDown size={14} className="absolute inset-0 m-auto text-slate-500 pointer-events-none" />
                                </div>
                                {/* WhatsApp */}
                                {order.customerPhone && (
                                    <a
                                        href={composeWAMessage(order)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition-colors"
                                        title="Enviar por WhatsApp"
                                    >
                                        <MessageCircle size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedOrder(null)}>
                    <div
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Pedido #{selectedOrder.id}</h2>
                                <p className="text-xs text-slate-500">{formatDate(selectedOrder.createdAt)}</p>
                            </div>
                            <StatusBadge status={selectedOrder.status} />
                        </div>

                        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Customer info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Cliente</p>
                                    <p className="text-sm font-semibold text-slate-900">{selectedOrder.customer || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Teléfono</p>
                                    <p className="text-sm font-semibold text-slate-900">{selectedOrder.customerPhone || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Email</p>
                                    <p className="text-sm font-semibold text-slate-900">{selectedOrder.customerEmail || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total</p>
                                    <p className="text-lg font-extrabold text-[#002f5e]">{formatPrice(Number(selectedOrder.total))}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Productos</p>
                                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between px-4 py-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{item.product?.name || `Producto #${item.productId}`}</p>
                                                <p className="text-xs text-slate-500">x{item.quantity} · {formatPrice(Number(item.unitPrice))} c/u</p>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">{formatPrice(Number(item.subtotal))}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Notas internas</p>
                                    <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">{selectedOrder.notes}</p>
                                </div>
                            )}

                            {/* Status change */}
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Cambiar estado</p>
                                <div className="flex flex-wrap gap-2">
                                    {allStatuses.map((s) => {
                                        const cfg = statusConfig[s];
                                        const active = selectedOrder.status === s;
                                        return (
                                            <button
                                                key={s}
                                                disabled={active || updatingId === selectedOrder.id}
                                                onClick={() => updateOrderStatus(selectedOrder.id, s)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${active
                                                    ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1`
                                                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                                    } disabled:opacity-50`}
                                            >
                                                <cfg.icon size={12} />
                                                {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            {selectedOrder.customerPhone && (
                                <a
                                    href={composeWAMessage(selectedOrder)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                                >
                                    <MessageCircle size={14} /> Enviar por WhatsApp
                                </a>
                            )}
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
