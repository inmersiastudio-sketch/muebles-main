"use client";

import type { Inquiry, InquiryFilters, InquiriesResponse, InquiryStats } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * Obtiene las consultas de una tienda con filtros opcionales
 */
export async function getInquiries(
  filters: InquiryFilters = {}
): Promise<InquiriesResponse> {
  const params = new URLSearchParams();
  
  if (filters.storeId) params.append("storeId", String(filters.storeId));
  if (filters.status) params.append("status", filters.status);
  if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.append("dateTo", filters.dateTo);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));

  const response = await fetch(`${API_BASE}/api/inquiries?${params.toString()}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener consultas");
  }

  return response.json();
}

/**
 * Obtiene una consulta específica por ID
 */
export async function getInquiry(id: number): Promise<Inquiry> {
  const response = await fetch(`${API_BASE}/api/inquiries/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener la consulta");
  }

  return response.json();
}

/**
 * Actualiza el estado de una consulta
 */
export async function updateInquiryStatus(
  id: number,
  status: "pending" | "converted" | "lost",
  notes?: string
): Promise<Inquiry> {
  const response = await fetch(`${API_BASE}/api/inquiries/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ status, notes }),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el estado");
  }

  return response.json();
}

/**
 * Cierra una consulta con resultado (vendido o perdido)
 */
export async function closeInquiry(
  id: number,
  outcome: "converted" | "lost",
  finalAmount?: number,
  lossReason?: string,
  notes?: string
): Promise<Inquiry> {
  const response = await fetch(`${API_BASE}/api/inquiries/${id}/close`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      outcome,
      finalAmount,
      lossReason,
      notes,
    }),
  });

  if (!response.ok) {
    throw new Error("Error al cerrar la consulta");
  }

  return response.json();
}

/**
 * Elimina una consulta (soft delete)
 */
export async function deleteInquiry(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/api/inquiries/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar la consulta");
  }
}

/**
 * Obtiene estadísticas de consultas
 */
export async function getInquiryStats(storeId?: number): Promise<InquiryStats> {
  const params = storeId ? `?storeId=${storeId}` : "";
  const response = await fetch(`${API_BASE}/api/inquiries/stats${params}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener estadísticas");
  }

  return response.json();
}
