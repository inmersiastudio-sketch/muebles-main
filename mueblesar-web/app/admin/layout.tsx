"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import { Sidebar, type AdminRole } from "../components/admin/Sidebar";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";

type SessionUser = {
    id: number;
    email: string;
    name?: string | null;
    role: AdminRole;
    storeId?: number | null;
};

type AdminContextType = {
    user: SessionUser | null;
    apiBase: string;
};

const AdminContext = createContext<AdminContextType>({ user: null, apiBase: "" });
export const useAdmin = () => useContext(AdminContext);

const breadcrumbMap: Record<string, string> = {
    "/admin": "Inicio",
    "/admin/inventory": "Productos",
    "/admin/inquiries": "Consultas",
    "/admin/orders": "Resultados de consultas",
    "/admin/media": "Media y modelos 3D",
    "/admin/settings": "Mi tienda",
    "/admin/analytics": "Rendimiento",
    "/admin/stores": "Tiendas",
    "/admin/users": "Usuarios",
    "/admin/billing": "Plan y créditos",
    "/admin/ai-history": "Historial de modelos 3D",
};

const roleLabel: Record<AdminRole, string> = {
    SUPER_ADMIN: "Super administrador",
    STORE_OWNER: "Dueño de tienda",
    MANAGER: "Gestor de tienda",
};

function breadcrumbLabel(path: string, part: string) {
    if (breadcrumbMap[path]) return breadcrumbMap[path];
    if (part === "new") return "Nuevo producto";
    if (part === "edit") return "Editar producto";
    return "Detalle";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const apiBase = useMemo(
        () => process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001",
        []
    );

    useEffect(() => {
        const fetchSession = async () => {
            setAuthLoading(true);
            try {
                const res = await fetch(`${apiBase}/api/auth/me`, { credentials: "include" });
                if (!res.ok) {
                    setUser(null);
                    return;
                }
                const data = await res.json();
                const nextUser = (data as { user?: SessionUser }).user ?? (data as SessionUser | null);
                setUser(nextUser);
            } catch {
                setUser(null);
            } finally {
                setAuthLoading(false);
            }
        };

        fetchSession();
    }, [apiBase]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [authLoading, user, router]);

    const handleLogout = async () => {
        try {
            await fetch(`${apiBase}/api/auth/logout`, { method: "POST", credentials: "include" });
        } catch {
            // The local session is still cleared if the remote request fails.
        }
        setUser(null);
        router.push("/login");
    };

    const breadcrumbs = useMemo(() => {
        const parts = pathname.split("/").filter(Boolean);
        let path = "";
        return parts.map((part) => {
            path += `/${part}`;
            return { label: breadcrumbLabel(path, part), href: path };
        });
    }, [pathname]);

    if (authLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0058a3] animate-pulse">
                    <span className="text-xl font-black text-white">A</span>
                </div>
                <Loader2 className="h-5 w-5 animate-spin text-[#0058a3]" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <AdminContext.Provider value={{ user, apiBase }}>
            <a
                href="#admin-content"
                className="fixed left-3 top-3 z-[60] -translate-y-16 rounded-lg bg-[#0058a3] px-3 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
            >
                Ir al contenido
            </a>
            <div className="flex min-h-screen bg-slate-100">
                <Sidebar storeName={user.name || user.email} userRole={user.role} onLogout={handleLogout} />
                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 lg:px-6">
                        <div className="flex h-14 items-center justify-between gap-4">
                            <nav className="min-w-0 overflow-x-auto whitespace-nowrap pl-12 text-sm lg:pl-0" aria-label="Migas de pan">
                                <ol className="flex items-center gap-1">
                                    {breadcrumbs.map((crumb, index) => (
                                        <li key={crumb.href} className="flex items-center gap-1">
                                            {index > 0 && <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden="true" />}
                                            {index === breadcrumbs.length - 1 ? (
                                                <span className="font-semibold text-slate-900" aria-current="page">{crumb.label}</span>
                                            ) : (
                                                <Link href={crumb.href} className="text-slate-500 transition-colors hover:text-slate-800">
                                                    {crumb.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </nav>

                            <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0058a3] text-xs font-bold text-white" aria-hidden="true">
                                    {(user.name || user.email || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden text-right sm:block">
                                    <p className="max-w-36 truncate text-xs font-semibold leading-none text-slate-900">
                                        {user.name || user.email?.split("@")[0] || "Usuario"}
                                    </p>
                                    <p className="mt-1 text-[10px] leading-none text-slate-500">{roleLabel[user.role]}</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main id="admin-content" className="flex-1 p-4 lg:p-6" tabIndex={-1}>
                        <ErrorBoundary>{children}</ErrorBoundary>
                    </main>
                </div>
            </div>
        </AdminContext.Provider>
    );
}
