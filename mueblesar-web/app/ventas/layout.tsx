import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Amobly para Mueblerías — Vendé más con 3D y Realidad Aumentada",
  description:
    "Publicá tu catálogo de muebles con tecnología 3D y realidad aumentada. Recibí consultas directas por WhatsApp. Sin comisiones, sin carrito. Empezá gratis.",
  openGraph: {
    title: "Amobly para Mueblerías — Vendé más con 3D y Realidad Aumentada",
    description:
      "Publicá tu catálogo con tecnología 3D y AR. Recibí consultas directas por WhatsApp.",
    url: "/ventas",
  },
};

export default function VentasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
