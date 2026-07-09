import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Amobly",
  description: "Catálogo de mueblerías de Córdoba con realidad aumentada",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Amobly",
  },
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
