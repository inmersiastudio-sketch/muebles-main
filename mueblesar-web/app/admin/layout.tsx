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
    const [login, setLogin] = useState({ email: "", password: "" });
    const [authError, setAuthError] = useState<string | null>(null);
    const [loginLoading, setLoginLoading] = useState(false);
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

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setAuthError(null);
        setLoginLoading(true);
        try {
            const res = await fetch(`${apiBase}/api/auth/login`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify(login),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setAuthError((data as { error?: string }).error || "Credenciales incorrectas");
                return;
            }
            const nextUser = (data as { user?: SessionUser }).user ?? (data as SessionUser | null);
            setUser(nextUser);
            setLogin({ email: "", password: "" });
        } catch (error) {
            setAuthError((error as Error).message);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${apiBase}/api/auth/logout`, { method: "POST", credentials: "include" });
        } catch {
            // The local session is still cleared if the remote request fails.
        }
        setUser(null);
        router.push("/admin");
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
                <p className="text-sm font-medium text-slate-500">Cargando portal...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-[#002f5e] p-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-[#0058a3] shadow-lg shadow-[#0058a3]/30">
                            <span className="text-2xl font-black text-white">A</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white">Portal de Mueblerias</h1>
                        <p className="mt-2 text-sm text-slate-400">Iniciá sesión para gestionar productos y consultas.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5 rounded-lg border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                        {authError && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
                                {authError}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Email</label>
                            <input
                                type="email"
                                value={login.email}
                                onChange={(event) => setLogin((previous) => ({ ...previous, email: event.target.value }))}
                                placeholder="tu@muebleria.com"
                                required
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-[#0058a3] focus:outline-none focus:ring-2 focus:ring-[#0058a3]/20"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Contrasena</label>
                            <input
                                type="password"
                                value={login.password}
                                onChange={(event) => setLogin((previous) => ({ ...previous, password: event.target.value }))}
                                placeholder="********"
                                required
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-[#0058a3] focus:outline-none focus:ring-2 focus:ring-[#0058a3]/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loginLoading || !login.email || !login.password}
                            className="w-full rounded-lg bg-[#0058a3] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0058a3]/30 transition-colors hover:bg-[#004f93] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loginLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Ingresando...
                                </span>
                            ) : "Iniciar sesión"}
                        </button>

                        <div className="flex items-center justify-between pt-2 text-sm">
                            <Link href="/recuperar-contrasena" className="font-medium text-slate-400 transition-colors hover:text-white">
                                Olvidaste tu contrasena?
                            </Link>
                            <Link href="/registrar" className="font-bold text-[#3b8fd4] transition-colors hover:text-white">
                                Registrar muebleria
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        );
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
                                        {user.name || user.email.split("@")[0] || "Usuario"}
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
