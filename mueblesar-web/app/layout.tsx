import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { ClientProviders } from "./components/providers/ClientProviders";
import { PublicWrapper } from "./components/layout/PublicWrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://amobly.ar";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Amobly — Mueblerías de Córdoba con Realidad Aumentada",
    template: "%s | Amobly",
  },
  description:
    "Descubrí muebles de alta gama de mueblerías de Córdoba. Visualizá cómo quedan en tu casa con Realidad Aumentada antes de comprar. Catálogo con 3D interactivo.",
  keywords: [
    "muebles córdoba",
    "mueblerías córdoba",
    "muebles realidad aumentada",
    "catálogo de muebles",
    "sofás córdoba",
    "dormitorios córdoba",
    "muebles 3D",
    "amobly",
  ],
  authors: [{ name: "Amobly" }],
  creator: "Amobly",
  publisher: "Amobly",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "Amobly",
    title: "Amobly — Mueblerías de Córdoba con Realidad Aumentada",
    description:
      "Descubrí muebles de alta gama de mueblerías de Córdoba. Visualizá cómo quedan en tu casa con Realidad Aumentada.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Amobly — Muebles con Realidad Aumentada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amobly — Mueblerías de Córdoba con Realidad Aumentada",
    description:
      "Descubrí muebles de alta gama de mueblerías de Córdoba con vista 3D y Realidad Aumentada.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Amobly",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        <ClientProviders>
          <PublicWrapper>{children}</PublicWrapper>
        </ClientProviders>
      </body>
    </html>
  );
}
