"use client";

import { useEffect, useState, useMemo, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "../components/admin/Sidebar";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { Loader2, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

type SessionUser = {
    id: number;
    email: string;
    name?: string | null;
    role: "ADMIN" | "STORE";
    storeId?: number | null;
};

type AdminContextType = {
    user: SessionUser | null;
    apiBase: string;
};

const AdminContext = createContext<AdminContextType>({ user: null, apiBase: "" });
export const useAdmin = () => useContext(AdminContext);

const breadcrumbMap: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/inventory": "Inventario",
    "/admin/inquiries": "Consultas",
    "/admin/orders": "Pedidos",
    "/admin/media": "Modelos AR",
    "/admin/settings": "Configuración",
    "/admin/analytics": "Analytics",
    "/admin/stores": "Tiendas",
    "/admin/users": "Usuarios",
    "/admin/billing": "Facturación",
    "/admin/ai-history": "Historial de IA",
};

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
                if (!res.ok) { setUser(null); return; }
                const data = await res.json();
                const nextUser = (data as { user?: SessionUser })?.user ?? (data as SessionUser | null);
                setUser(nextUser);
            } catch { setUser(null); }
            finally { setAuthLoading(false); }
        };
        fetchSession();
    }, [apiBase]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
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
                setAuthError((data as { error?: string })?.error || "Credenciales incorrectas");
                return;
            }
            const nextUser = (data as { user?: SessionUser })?.user ?? (data as SessionUser | null);
            setUser(nextUser);
            setLogin({ email: "", password: "" });
        } catch (err) {
            setAuthError((err as Error).message);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${apiBase}/api/auth/logout`, { method: "POST", credentials: "include" });
        } catch { }
        setUser(null);
        router.push("/admin");
    };

    // Breadcrumbs
    const breadcrumbs = useMemo(() => {
        const parts = pathname.split("/").filter(Boolean);
        const crumbs: { label: string; href: string }[] = [];
        let path = "";
        for (const part of parts) {
            path += `/${part}`;
            crumbs.push({ label: breadcrumbMap[path] || part, href: path });
        }
        return crumbs;
    }, [pathname]);

    // Loading state
    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
                {/* Skeleton pulse */}
                <div className="w-12 h-12 rounded-xl bg-[#0058a3] flex items-center justify-center animate-pulse">
                    <span className="text-white font-black text-xl">A</span>
                </div>
                <Loader2 className="w-5 h-5 animate-spin text-[#0058a3]" />
                <p className="text-sm text-slate-500 font-medium">Cargando portal...</p>
            </div>
        );
    }

    // Login screen
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#002f5e] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex w-16 h-16 rounded-2xl bg-[#0058a3] items-center justify-center shadow-lg shadow-[#0058a3]/30 mb-4">
                            <span className="text-white font-black text-2xl">A</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white">Portal de Mueblerías</h1>
                        <p className="text-slate-400 text-sm mt-2">Iniciá sesión para gestionar tus productos y catálogo 3D</p>
                    </div>

                    {/* Login Card */}
                    <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-5 shadow-2xl">
                        {authError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300 font-medium">
                                {authError}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Email</label>
                            <input
                                type="email"
                                value={login.email}
                                onChange={(e) => setLogin((prev) => ({ ...prev, email: e.target.value }))}
                                placeholder="tu@muebleria.com"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/20 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Contraseña</label>
                            <input
                                type="password"
                                value={login.password}
                                onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value }))}
                                placeholder="••••••••"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/20 transition-all text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loginLoading || !login.email || !login.password}
                            className="w-full bg-[#0058a3] hover:bg-[#004f93] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#0058a3]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-[0.98]"
                        >
                            {loginLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Ingresando...
                                </span>
                            ) : (
                                "Iniciar sesión"
                            )}
                        </button>

                        <div className="flex items-center justify-between text-sm pt-2">
                            <Link href="/recuperar-contrasena" className="text-slate-400 hover:text-white transition-colors font-medium">
                                ¿Olvidaste tu contraseña?
                            </Link>
                            <Link href="/registrar" className="text-[#0058a3] hover:text-[#3b8fd4] transition-colors font-bold">
                                Registrar mueblería
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Authenticated layout
    return (
        <AdminContext.Provider value={{ user, apiBase }}>
            <div className="flex min-h-screen bg-slate-100">
                <Sidebar
                    storeName={user.name || user.email}
                    userRole={user.role}
                    onLogout={handleLogout}
                />
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top header bar */}
                    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 lg:px-8">
                        <div className="flex items-center justify-between h-14">
                            {/* Breadcrumbs */}
                            <nav className="flex items-center gap-1 text-sm pl-12 lg:pl-0">
                                {breadcrumbs.map((crumb, i) => (
                                    <span key={crumb.href} className="flex items-center gap-1">
                                        {i > 0 && <ChevronRight size={14} className="text-slate-400" />}
                                        {i === breadcrumbs.length - 1 ? (
                                            <span className="font-semibold text-slate-900">{crumb.label}</span>
                                        ) : (
                                            <Link href={crumb.href} className="text-slate-500 hover:text-slate-700 transition-colors">
                                                {crumb.label}
                                            </Link>
                                        )}
                                    </span>
                                ))}
                            </nav>

                            {/* Right actions */}
                            <div className="flex items-center gap-2">
                                {/* Notification bell */}
                                <button
                                    className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                    title="Notificaciones"
                                >
                                    <Bell size={18} />
                                    {/* Dot indicator — replace with real notification count later */}
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                                </button>

                                {/* User pill */}
                                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
                                    <div className="w-8 h-8 rounded-full bg-[#0058a3] flex items-center justify-center text-white text-xs font-bold">
                                        {(user.name || user.email || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-900 leading-none">{user.name || user.email?.split("@")[0] || "Usuario"}</p>
                                        <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                                            {user.role === "ADMIN" ? "Super Admin" : "Tienda"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main content */}
                    <main className="flex-1 p-4 lg:p-8">
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </main>
                </div>
            </div>
        </AdminContext.Provider>
    );
}
