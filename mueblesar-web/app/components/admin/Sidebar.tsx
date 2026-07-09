"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Box,
    Settings,
    LogOut,
    Users,
    Store,
    BarChart3,
    Bell,
    ChevronLeft,
    Menu,
    X,
    CreditCard,
    MessageSquare,
} from "lucide-react";
import { useState } from "react";

type SidebarProps = {
    storeName?: string;
    userRole?: "ADMIN" | "STORE";
    onLogout: () => void;
};

type NavItem = {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
    section?: string;
};

const adminOnlyLinks: NavItem[] = [
    { name: "Tiendas", href: "/admin/stores", icon: Store, section: "admin" },
    { name: "Usuarios", href: "/admin/users", icon: Users, section: "admin" },
];

const mainLinks: NavItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Consultas", href: "/admin/inquiries", icon: MessageSquare },
    { name: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
    { name: "Inventario", href: "/admin/inventory", icon: Package },
    { name: "Modelos AR", href: "/admin/media", icon: Box },
    { name: "Facturación", href: "/admin/billing", icon: CreditCard },
];

const bottomLinks: NavItem[] = [
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Configuración", href: "/admin/settings", icon: Settings },
];

export function Sidebar({ storeName, userRole = "STORE", onLogout }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) =>
        pathname === href || (href !== "/admin" && pathname.startsWith(href));

    const renderLink = (link: NavItem) => {
        const Icon = link.icon;
        const active = isActive(link.href);
        return (
            <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? link.name : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                    ? "bg-[#0058a3] text-white shadow-md shadow-[#0058a3]/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`}
            >
                <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                        }`}
                />
                {!collapsed && (
                    <span className="flex-1 truncate">{link.name}</span>
                )}
                {!collapsed && link.badge && link.badge > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {link.badge > 99 ? "99+" : link.badge}
                    </span>
                )}
            </Link>
        );
    };

    const sidebarContent = (
        <div className={`flex flex-col h-full ${collapsed ? "w-[72px]" : "w-[260px]"} transition-all duration-300`}>
            {/* Logo */}
            <div className={`flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-5"} py-5 border-b border-slate-800/50`}>
                {!collapsed ? (
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#0058a3] flex items-center justify-center">
                            <span className="text-white font-black text-sm">A</span>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white tracking-tight leading-none">Amobly</h2>
                            <p className="text-[10px] text-[#0058a3] font-bold uppercase tracking-widest">B2B Portal</p>
                        </div>
                    </Link>
                ) : (
                    <Link href="/admin" className="w-8 h-8 rounded-lg bg-[#0058a3] flex items-center justify-center">
                        <span className="text-white font-black text-sm">A</span>
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors ${collapsed ? "mt-2" : ""}`}
                    title={collapsed ? "Expandir" : "Colapsar"}
                >
                    <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
                </button>
            </div>

            {/* Store Info */}
            {!collapsed && (
                <div className="px-5 py-3 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                            <Store size={16} className="text-slate-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{storeName || "Mi Tienda"}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase">{userRole === "ADMIN" ? "Super Admin" : "Tienda"}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                {/* Main section */}
                {!collapsed && (
                    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">Principal</p>
                )}
                {mainLinks.map(renderLink)}

                {/* Admin section */}
                {userRole === "ADMIN" && (
                    <>
                        {!collapsed && (
                            <p className="px-3 mt-5 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">Administración</p>
                        )}
                        {collapsed && <div className="my-3 border-t border-slate-800/50" />}
                        {adminOnlyLinks.map(renderLink)}
                    </>
                )}

                {/* Tools section */}
                {!collapsed && (
                    <p className="px-3 mt-5 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">Herramientas</p>
                )}
                {collapsed && <div className="my-3 border-t border-slate-800/50" />}
                {bottomLinks.map(renderLink)}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800/50">
                <button
                    onClick={onLogout}
                    title={collapsed ? "Cerrar sesión" : undefined}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors ${collapsed ? "justify-center" : ""}`}
                >
                    <LogOut size={18} className="shrink-0" />
                    {!collapsed && "Cerrar sesión"}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg"
                aria-label="Abrir menú"
            >
                <Menu size={20} />
            </button>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex bg-slate-900 border-r border-slate-800/50 h-screen sticky top-0 shrink-0">
                {sidebarContent}
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-200">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                            aria-label="Cerrar menú"
                        >
                            <X size={16} />
                        </button>
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}
