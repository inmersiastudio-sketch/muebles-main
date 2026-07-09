import Link from "next/link";
import { Sofa, Instagram, Mail, MapPin } from "lucide-react";
import { Container } from "./Container";

const currentYear = new Date().getFullYear();

const footerLinks = [
  { href: "/productos", label: "Catálogo" },
  { href: "/mueblerias", label: "Mueblerías" },
  { href: "/contacto", label: "Contacto" },
  { href: "/terminos", label: "Términos" },
  { href: "/privacidad", label: "Privacidad" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-[var(--gray-200)]">
      <Container>
        {/* Main Footer - Minimal */}
        <div className="py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Logo & Tagline */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-600)] text-white">
                  <Sofa className="h-4 w-4" />
                </span>
                <span className="text-lg font-bold text-[var(--gray-900)]">AMOBLY</span>
              </Link>
              <span className="hidden sm:inline text-sm text-[var(--gray-400)]">
                Muebles en realidad aumentada
              </span>
            </div>

            {/* Links - Horizontal */}
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--gray-500)] hover:text-[var(--gray-900)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Social */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/amobly.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gray-100)] text-[var(--gray-500)] transition-colors hover:bg-[var(--primary-600)] hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="mailto:hola@amobly.com"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gray-100)] text-[var(--gray-500)] transition-colors hover:bg-[var(--primary-600)] hover:text-white"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--gray-100)] py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[var(--gray-400)]">
            <p>© {currentYear} Amobly. Todos los derechos reservados.</p>
            <p className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Córdoba, Argentina
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
