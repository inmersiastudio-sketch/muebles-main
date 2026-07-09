"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  Phone,
  Mail,
  User,
  Calendar,
  Package,
  Store,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { InquiryModal } from "@/app/components/inquiry/InquiryCloseModal";
import type { Inquiry, InquiryStats } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

type InquiryStatus = "pending" | "converted" | "lost" | "all";

export default function InquiriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: number; storeId?: number; role: string } | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<InquiryStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check auth
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user) {
          router.push("/login");
          return;
        }
        setCurrentUser(data.user);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Load inquiries
  useEffect(() => {
    if (!currentUser) return;
    
    loadInquiries();
    loadStats();
  }, [currentUser, statusFilter, page]);

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentUser?.storeId) {
        params.append("storeId", String(currentUser.storeId));
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      params.append("page", String(page));
      params.append("limit", "20");

      const response = await fetch(`${API_BASE}/api/inquiries?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Error loading inquiries");
      
      const data = await response.json();
      setInquiries(data.inquiries || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error loading inquiries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params = currentUser?.storeId ? `?storeId=${currentUser.storeId}` : "";
      const response = await fetch(`${API_BASE}/api/inquiries/stats${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Error loading stats");
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleStatusUpdate = async (inquiryId: number, status: "pending" | "converted" | "lost") => {
    try {
      const response = await fetch(`${API_BASE}/api/inquiries/${inquiryId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error("Error updating status");
      
      loadInquiries();
      loadStats();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCloseInquiry = async (data: { outcome: "converted" | "lost"; finalAmount?: number; lossReason?: string; notes?: string }) => {
    if (!selectedInquiry) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/inquiries/${selectedInquiry.id}/close`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error("Error closing inquiry");
      
      loadInquiries();
      loadStats();
      setIsCloseModalOpen(false);
      setSelectedInquiry(null);
    } catch (error) {
      console.error("Error closing inquiry:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} />
            Pendiente
          </span>
        );
      case "converted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} />
            Convertido
          </span>
        );
      case "lost":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle size={12} />
            Perdido
          </span>
        );
      default:
        return null;
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      inquiry.customerName.toLowerCase().includes(query) ||
      inquiry.customerPhone.toLowerCase().includes(query) ||
      inquiry.product?.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--gray-200)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--gray-900)]">Consultas</h1>
              <p className="text-sm text-[var(--gray-500)] mt-1">
                Gestiona las consultas de clientes interesados en tus productos
              </p>
            </div>
            <Button variant="primary" onClick={() => { setSelectedInquiry(null); setIsCloseModalOpen(true); }}>
              + Registrar Consulta
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-[var(--gray-200)] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--gray-500)]">Total Consultas</p>
                  <p className="text-2xl font-bold text-[var(--gray-900)] mt-1">{stats.totalInquiries}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[var(--primary-50)] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[var(--primary-600)]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[var(--gray-200)] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--gray-500)]">Tasa de Conversión</p>
                  <p className="text-2xl font-bold text-[var(--gray-900)] mt-1">{stats.conversionRate.toFixed(1)}%</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[var(--gray-200)] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--gray-500)]">Ingresos por Consultas</p>
                  <p className="text-2xl font-bold text-[var(--gray-900)] mt-1">
                    ${stats.totalRevenue.toLocaleString("es-AR")}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[var(--gray-200)] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--gray-500)]">Pendientes</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingInquiries}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-xl border border-[var(--gray-200)] p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--gray-400)]" />
              <input
                type="text"
                placeholder="Buscar por cliente, teléfono o producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--gray-200)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-100)] outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InquiryStatus)}
                className="px-4 py-2 rounded-lg border border-[var(--gray-200)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-100)] outline-none bg-white"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="converted">Convertidos</option>
                <option value="lost">Perdidos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl border border-[var(--gray-200)] overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-[var(--gray-500)] mt-3">Cargando consultas...</p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-[var(--gray-300)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--gray-700)]">No hay consultas</h3>
              <p className="text-sm text-[var(--gray-500)] mt-1">
                {searchQuery
                  ? "No se encontraron consultas que coincidan con tu búsqueda"
                  : "Aún no has recibido consultas de clientes"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--gray-50)] border-b border-[var(--gray-200)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider">
                        Resultado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--gray-100)]">
                    {filteredInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="hover:bg-[var(--gray-50)] transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[var(--primary-100)] flex items-center justify-center">
                              <User className="w-4 h-4 text-[var(--primary-600)]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[var(--gray-900)]">
                                {inquiry.customerName}
                              </p>
                              <p className="text-xs text-[var(--gray-500)] flex items-center gap-1">
                                <Phone size={10} />
                                {inquiry.customerPhone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {inquiry.product?.media?.images?.[0]?.url && (
                              <img
                                src={inquiry.product.media.images[0].url}
                                alt={inquiry.product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-[var(--gray-900)] line-clamp-1 max-w-[200px]">
                                {inquiry.product?.name || "Producto no disponible"}
                              </p>
                              {inquiry.variant && (
                                <p className="text-xs text-[var(--gray-500)]">
                                  {inquiry.variant.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-[var(--gray-700)]">
                            {new Date(inquiry.createdAt).toLocaleDateString("es-AR")}
                          </p>
                          <p className="text-xs text-[var(--gray-500)]">
                            {new Date(inquiry.createdAt).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(inquiry.status)}</td>
                        <td className="px-4 py-4">
                          {inquiry.status === "converted" && inquiry.finalAmount ? (
                            <span className="text-sm font-medium text-emerald-600">
                              ${inquiry.finalAmount.toLocaleString("es-AR")}
                            </span>
                          ) : inquiry.status === "lost" ? (
                            <span className="text-sm text-red-600">
                              {inquiry.lossReason || "Perdido"}
                            </span>
                          ) : (
                            <span className="text-sm text-[var(--gray-400)]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {inquiry.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedInquiry(inquiry);
                                    setIsCloseModalOpen(true);
                                  }}
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 !py-1.5 !px-2"
                                >
                                  <CheckCircle size={16} className="mr-1" />
                                  Vendido
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedInquiry(inquiry);
                                    setIsCloseModalOpen(true);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 !py-1.5 !px-2"
                                >
                                  <XCircle size={16} className="mr-1" />
                                  Perdido
                                </Button>
                              </>
                            )}
                            <a
                              href={`https://wa.me/${inquiry.customerPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-[var(--gray-100)] text-[var(--gray-600)] transition-colors"
                              title="Contactar por WhatsApp"
                            >
                              <Phone size={16} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-[var(--gray-200)] flex items-center justify-between">
                  <p className="text-sm text-[var(--gray-500)]">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg hover:bg-[var(--gray-100)] disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg hover:bg-[var(--gray-100)] disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Close Inquiry Modal */}
      {isCloseModalOpen && (
        <InquiryModal
          isOpen={isCloseModalOpen}
          onClose={() => {
            setIsCloseModalOpen(false);
            setSelectedInquiry(null);
          }}
          inquiry={selectedInquiry}
          onSubmit={handleCloseInquiry}
        />
      )}
    </div>
  );
}
