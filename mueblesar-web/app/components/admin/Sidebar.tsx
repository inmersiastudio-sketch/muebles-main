"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    ChevronLeft,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquare,
    Package,
    Settings,
    Store,
    Users,
    X,
} from "lucide-react";
import { useEffect, useState, type ElementType } from "react";

export type AdminRole = "SUPER_ADMIN" | "STORE_OWNER" | "MANAGER";

type SidebarProps = {
    storeName?: string;
    userRole?: AdminRole;
    onLogout: () => void;
};

type NavItem = {
    name: string;
    href: string;
    icon: ElementType;
};

type NavGroup = {
    label: string;
    items: NavItem[];
};

const navigationGroups: NavGroup[] = [
    {
        label: "Operación",
        items: [
            { name: "Inicio", href: "/admin", icon: LayoutDashboard },
            { name: "Consultas", href: "/admin/inquiries", icon: MessageSquare },
        ],
    },
    {
        label: "Catálogo",
        items: [{ name: "Productos", href: "/admin/inventory", icon: Package }],
    },
    {
        label: "Crecimiento",
        items: [{ name: "Rendimiento", href: "/admin/analytics", icon: BarChart3 }],
    },
    {
        label: "Cuenta",
        items: [
            { name: "Mi tienda", href: "/admin/settings", icon: Settings },
            { name: "Plan y créditos", href: "/admin/billing", icon: CreditCard },
        ],
    },
];

const superAdminGroup: NavGroup = {
    label: "Administración",
    items: [
        { name: "Tiendas", href: "/admin/stores", icon: Store },
        { name: "Usuarios", href: "/admin/users", icon: Users },
    ],
};

const roleLabel: Record<AdminRole, string> = {
    SUPER_ADMIN: "Super administrador",
    STORE_OWNER: "Dueño de tienda",
    MANAGER: "Gestor de tienda",
};

export function Sidebar({ storeName, userRole = "STORE_OWNER", onLogout }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!mobileOpen) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setMobileOpen(false);
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [mobileOpen]);

    const isActive = (href: string) =>
        pathname === href || (href !== "/admin" && pathname.startsWith(href));

    const groups = userRole === "SUPER_ADMIN"
        ? [...navigationGroups, superAdminGroup]
        : navigationGroups;

    const renderLink = (link: NavItem) => {
        const Icon = link.icon;
        const active = isActive(link.href);

        return (
            <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? link.name : undefined}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active
                    ? "bg-[#0058a3] text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    } ${collapsed ? "justify-center px-2" : ""}`}
            >
                <Icon
                    size={19}
                    strokeWidth={active ? 2.2 : 1.9}
                    className={`shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}
                />
                {!collapsed && <span className="min-w-0 flex-1 truncate">{link.name}</span>}
            </Link>
        );
    };

    const sidebarContent = (
        <div className={`flex h-full flex-col transition-[width] duration-200 ${collapsed ? "w-[72px]" : "w-[248px]"}`}>
            <div className={`flex items-center border-b border-slate-800 px-4 py-4 ${collapsed ? "justify-center" : "justify-between"}`}>
                <Link href="/admin" className="flex min-w-0 items-center gap-2" aria-label="Ir al inicio de Amobly">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0058a3]">
                        <span className="text-sm font-black text-white">A</span>
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <h2 className="truncate text-base font-bold leading-none text-white">Amobly</h2>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Portal de tiendas</p>
                        </div>
                    )}
                </Link>
                {!collapsed && (
                    <button
                        type="button"
                        onClick={() => setCollapsed(true)}
                        className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:flex"
                        aria-label="Contraer menú"
                        title="Contraer menú"
                    >
                        <ChevronLeft size={17} />
                    </button>
                )}
            </div>

            {!collapsed && (
                <div className="border-b border-slate-800 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                            <Store size={17} className="text-slate-300" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-white">{storeName || "Mi tienda"}</p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500">{roleLabel[userRole]}</p>
                        </div>
                    </div>
                </div>
            )}

            <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Navegación principal">
                {groups.map((group, index) => (
                    <div key={group.label} className={index > 0 ? "mt-5 border-t border-slate-800 pt-4" : ""}>
                        {!collapsed && (
                            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-1">{group.items.map(renderLink)}</div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-slate-800 p-3">
                {collapsed && (
                    <button
                        type="button"
                        onClick={() => setCollapsed(false)}
                        className="mb-2 flex h-10 w-full items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                        aria-label="Expandir menú"
                        title="Expandir menú"
                    >
                        <ChevronLeft size={18} className="rotate-180" />
                    </button>
                )}
                <button
                    type="button"
                    onClick={onLogout}
                    title={collapsed ? "Cerrar sesión" : undefined}
                    className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-300 ${collapsed ? "justify-center px-2" : ""}`}
                >
                    <LogOut size={18} className="shrink-0" />
                    {!collapsed && "Cerrar sesión"}
                </button>
            </div>
        </div>
    );

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setCollapsed(false);
                    setMobileOpen(true);
                }}
                className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-lg lg:hidden"
                aria-label="Abrir menú"
                aria-expanded={mobileOpen}
            >
                <Menu size={20} />
            </button>

            <aside className="sticky top-0 hidden h-screen shrink-0 border-r border-slate-800 bg-slate-900 lg:flex">
                {sidebarContent}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú de navegación">
                    <button
                        type="button"
                        className="absolute inset-0 h-full w-full cursor-default bg-black/60"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Cerrar menú"
                    />
                    <aside className="relative h-full bg-slate-900 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:text-white"
                            aria-label="Cerrar menú"
                        >
                            <X size={17} />
                        </button>
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}
