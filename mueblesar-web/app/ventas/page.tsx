"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cuboid,
  Globe,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Store,
  Zap,
} from "lucide-react";

/* ─────────────────────────── Datos ─────────────────────────── */

const features = [
  {
    icon: Cuboid,
    title: "Modelos 3D desde una foto",
    description:
      "Subí una imagen y nuestra IA genera un modelo 3D interactivo en minutos. Tus clientes lo giran, amplían y exploran desde cualquier dispositivo.",
  },
  {
    icon: Smartphone,
    title: "Realidad Aumentada",
    description:
      "Tus clientes proyectan el mueble en su living antes de consultar. Funciona directo desde el navegador, sin instalar ninguna app.",
  },
  {
    icon: MessageCircle,
    title: "Consultas por WhatsApp",
    description:
      "Sin carrito, sin comisiones. Cada consulta llega directo a tu WhatsApp con la variante, el precio y el link al producto.",
  },
  {
    icon: Store,
    title: "Tu perfil de mueblería",
    description:
      "Página propia con tu logo, descripción, productos y datos de contacto. Un mini-sitio profesional sin necesidad de programar.",
  },
  {
    icon: BarChart3,
    title: "Panel de gestión",
    description:
      "Administrá productos, stock, variantes de color y precios desde un panel diseñado para mueblerías. Todo en un solo lugar.",
  },
  {
    icon: Globe,
    title: "Visibilidad en el catálogo",
    description:
      "Tus productos aparecen en el catálogo público de Amobly. Más personas descubren tu mueblería sin que pagues publicidad.",
  },
];

const steps = [
  {
    step: "01",
    title: "Registrá tu mueblería",
    description: "Creá tu cuenta en 2 minutos con tu email y datos básicos del negocio.",
  },
  {
    step: "02",
    title: "Cargá tu catálogo",
    description: "Agregá productos con fotos, precios, variantes de color y dimensiones.",
  },
  {
    step: "03",
    title: "Activá el 3D",
    description: "Subí una foto del mueble y nuestra IA genera el modelo 3D automáticamente.",
  },
  {
    step: "04",
    title: "Recibí consultas",
    description: "Tus clientes te contactan directamente por WhatsApp para cerrar la venta.",
  },
];

const faqs = [
  {
    question: "¿Tiene costo?",
    answer:
      "El registro y publicación de productos es gratuito. La generación de modelos 3D utiliza créditos incluidos en tu plan. El plan inicial incluye créditos de prueba sin cargo.",
  },
  {
    question: "¿Necesito conocimientos técnicos?",
    answer:
      "No. El panel está diseñado para que cualquier persona pueda subir productos, gestionar stock y activar los modelos 3D sin escribir una línea de código.",
  },
  {
    question: "¿Cobran comisión por venta?",
    answer:
      "No. Amobly no interviene en la transacción. El cliente te contacta directo por WhatsApp y vos cerrás la venta como siempre lo hacés.",
  },
  {
    question: "¿La realidad aumentada funciona en cualquier celular?",
    answer:
      "Sí. Funciona en iPhone (Safari) y en la mayoría de los Android (Chrome) sin necesidad de instalar ninguna app. El cliente apunta la cámara y ve el mueble en su espacio.",
  },
  {
    question: "¿Puedo importar productos desde un Excel?",
    answer:
      "Sí. Podés preparar un archivo CSV con tus productos y cargarlo desde el panel de administración. El sistema detecta duplicados y te permite previsualizar antes de confirmar.",
  },
];

/* ─────────────────────────── Componentes ─────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold tracking-[0.18em] text-[#e7a86e]">
      {children}
    </p>
  );
}

/* ─────────────────────────── Página ─────────────────────────── */

export default function VentasPage() {
  return (
    <div className="min-h-screen bg-white text-[#1c2421]">
      {/* ━━━ Navbar ━━━ */}
      <nav className="sticky top-0 z-50 border-b border-[#e1e6e3] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-semibold tracking-[0.08em] text-[#1c2421]"
          >
            <span className="flex h-8 w-8 items-center justify-center bg-[#0b6e5e] text-sm font-bold text-white">
              A
            </span>
            AMOBLY
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#funcionalidades" className="text-sm font-medium text-[#61706a] transition-colors hover:text-[#1c2421]">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="text-sm font-medium text-[#61706a] transition-colors hover:text-[#1c2421]">
              Cómo funciona
            </a>
            <a href="#preguntas" className="text-sm font-medium text-[#61706a] transition-colors hover:text-[#1c2421]">
              Preguntas
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-[#0b6e5e] transition-colors hover:text-[#075247] sm:block"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registrar"
              className="flex h-10 items-center gap-2 bg-[#0b6e5e] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#075247]"
            >
              Empezar gratis
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ━━━ Hero ━━━ */}
      <section className="relative overflow-hidden bg-[#1c2925]">
        {/* Gradiente decorativo */}
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #0b6e5e 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #e7a86e 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-28">
          {/* Texto */}
          <div className="order-2 lg:order-1">
            <SectionLabel>PARA MUEBLERÍAS</SectionLabel>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.15] text-white sm:text-5xl xl:text-[3.4rem]">
              Vendé más con{" "}
              <span className="text-[#e7a86e]">3D</span> y{" "}
              <span className="text-[#e7a86e]">Realidad Aumentada</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-white/70">
              Publicá tu catálogo de muebles con tecnología 3D interactiva. Tus
              clientes ven el mueble en su casa antes de contactarte. Sin
              comisiones, sin carrito — solo consultas directas.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/registrar"
                className="inline-flex h-13 items-center justify-center gap-2 bg-[#e7a86e] px-7 text-sm font-semibold text-[#1c2421] transition-all hover:bg-[#d4944f] active:scale-[0.98]"
              >
                Registrar mi mueblería
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex h-13 items-center justify-center gap-2 border border-white/20 bg-white/5 px-7 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Cómo funciona
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-8">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <CheckCircle2 className="h-4 w-4 text-[#0b6e5e]" aria-hidden="true" />
                Sin comisiones
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <CheckCircle2 className="h-4 w-4 text-[#0b6e5e]" aria-hidden="true" />
                Registro gratuito
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <CheckCircle2 className="h-4 w-4 text-[#0b6e5e]" aria-hidden="true" />
                3D automático con IA
              </div>
            </div>
          </div>

          {/* Imagen hero */}
          <div className="order-1 flex items-center justify-center lg:order-2">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl shadow-black/40 lg:max-w-lg">
              <Image
                src="/images/landing-hero.png"
                alt="Living moderno con sofá verde esmeralda y decoración cálida"
                width={800}
                height={800}
                priority
                className="h-auto w-full object-cover"
              />
              {/* Badge flotante */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
                <Cuboid className="h-5 w-5 text-[#0b6e5e]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-[#1c2421]">Vista 3D disponible</p>
                  <p className="text-[11px] text-[#61706a]">Girá · Ampliá · Probá en AR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Logos / Métricas ━━━ */}
      <section className="border-b border-[#e1e6e3] bg-[#f5f7f6]">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-14 gap-y-6 px-5 py-10 sm:px-8">
          <div className="text-center">
            <p className="text-3xl font-semibold text-[#0b6e5e]">3D</p>
            <p className="mt-1 text-xs font-medium tracking-wider text-[#61706a]">INTERACTIVO</p>
          </div>
          <div className="h-8 w-px bg-[#cbd4cf]" aria-hidden="true" />
          <div className="text-center">
            <p className="text-3xl font-semibold text-[#0b6e5e]">AR</p>
            <p className="mt-1 text-xs font-medium tracking-wider text-[#61706a]">REALIDAD AUMENTADA</p>
          </div>
          <div className="h-8 w-px bg-[#cbd4cf]" aria-hidden="true" />
          <div className="text-center">
            <p className="text-3xl font-semibold text-[#1c2421]">0%</p>
            <p className="mt-1 text-xs font-medium tracking-wider text-[#61706a]">COMISIÓN</p>
          </div>
          <div className="h-8 w-px bg-[#cbd4cf]" aria-hidden="true" />
          <div className="text-center">
            <p className="text-3xl font-semibold text-[#1c2421]">CBA</p>
            <p className="mt-1 text-xs font-medium tracking-wider text-[#61706a]">CÓRDOBA, ARGENTINA</p>
          </div>
        </div>
      </section>

      {/* ━━━ Funcionalidades ━━━ */}
      <section id="funcionalidades" className="scroll-mt-20 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>FUNCIONALIDADES</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold text-[#1c2421] sm:text-4xl">
              Todo lo que necesitás para vender online
            </h2>
            <p className="mt-4 text-base leading-7 text-[#61706a]">
              Herramientas diseñadas específicamente para mueblerías argentinas.
              Sin complicaciones técnicas.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-[#e1e6e3] bg-[#f5f7f6] p-7 transition-all hover:border-[#0b6e5e]/30 hover:shadow-lg hover:shadow-[#0b6e5e]/5"
              >
                <div className="flex h-11 w-11 items-center justify-center bg-[#0b6e5e]/10 transition-colors group-hover:bg-[#0b6e5e]/20">
                  <feature.icon className="h-5 w-5 text-[#0b6e5e]" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#1c2421]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#61706a]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Cómo funciona ━━━ */}
      <section id="como-funciona" className="scroll-mt-20 bg-[#1c2925] py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>CÓMO FUNCIONA</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Empezá en 4 pasos simples
            </h2>
            <p className="mt-4 text-base leading-7 text-white/60">
              Desde el registro hasta tu primera consulta en menos de un día.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.step}
                className="relative rounded-xl border border-white/10 bg-white/5 p-7"
              >
                <span className="text-3xl font-bold text-[#e7a86e]/40">
                  {s.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA intermedio ━━━ */}
      <section className="relative overflow-hidden bg-[#0b6e5e] py-16 lg:py-20">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #e7a86e 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <Zap className="mx-auto h-10 w-10 text-[#e7a86e]" aria-hidden="true" />
          <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
            ¿Listo para modernizar tu mueblería?
          </h2>
          <p className="mt-4 text-base leading-7 text-white/80">
            Unite a las mueblerías de Córdoba que ya usan tecnología 3D para
            diferenciarse y vender más.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/registrar"
              className="inline-flex h-13 items-center gap-2 bg-[#e7a86e] px-7 text-sm font-semibold text-[#1c2421] transition-all hover:bg-[#d4944f] active:scale-[0.98]"
            >
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-13 items-center gap-2 border border-white/30 px-7 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ Seguridad y confianza ━━━ */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>SEGURIDAD Y CONFIANZA</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold text-[#1c2421] sm:text-4xl">
              Tu negocio está protegido
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center rounded-xl border border-[#e1e6e3] p-8 text-center">
              <ShieldCheck className="h-8 w-8 text-[#0b6e5e]" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold text-[#1c2421]">Datos aislados</h3>
              <p className="mt-2 text-sm leading-6 text-[#61706a]">
                Cada mueblería accede solo a sus propios productos, consultas y estadísticas. Sin cruces entre cuentas.
              </p>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-[#e1e6e3] p-8 text-center">
              <ShieldCheck className="h-8 w-8 text-[#0b6e5e]" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold text-[#1c2421]">Sin intermediarios</h3>
              <p className="mt-2 text-sm leading-6 text-[#61706a]">
                Amobly no maneja tu dinero ni se interpone en tus ventas. El cliente habla directo con vos.
              </p>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-[#e1e6e3] p-8 text-center">
              <ShieldCheck className="h-8 w-8 text-[#0b6e5e]" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold text-[#1c2421]">Verificación de email</h3>
              <p className="mt-2 text-sm leading-6 text-[#61706a]">
                Cada cuenta se valida antes de publicar. Solo mueblerías verificadas aparecen en el catálogo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Preguntas Frecuentes ━━━ */}
      <section id="preguntas" className="scroll-mt-20 bg-[#f5f7f6] py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="text-center">
            <SectionLabel>PREGUNTAS FRECUENTES</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold text-[#1c2421] sm:text-4xl">
              Dudas comunes
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-[#e1e6e3] bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-base font-semibold text-[#1c2421] transition-colors hover:text-[#0b6e5e] [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center text-xl text-[#0b6e5e] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="border-t border-[#e1e6e3] px-6 py-5 text-sm leading-7 text-[#61706a]">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA final ━━━ */}
      <section className="bg-[#1c2925] py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <SectionLabel>EMPEZÁ HOY</SectionLabel>
          <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            Tu mueblería, con la tecnología del futuro
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-white/60">
            El registro es gratuito y no requiere tarjeta. En menos de 5 minutos
            ya podés tener tu primer producto publicado con vista 3D.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/registrar"
              className="inline-flex h-14 items-center gap-2 bg-[#e7a86e] px-8 text-base font-semibold text-[#1c2421] transition-all hover:bg-[#d4944f] active:scale-[0.98]"
            >
              Registrar mi mueblería
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/40">
            Sin tarjeta · Sin comisiones · Cancelá cuando quieras
          </p>
        </div>
      </section>

      {/* ━━━ Footer mínimo ━━━ */}
      <footer className="border-t border-[#e1e6e3] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-[0.08em] text-[#1c2421]">
            <span className="flex h-6 w-6 items-center justify-center bg-[#0b6e5e] text-xs font-bold text-white">
              A
            </span>
            AMOBLY
          </div>
          <div className="flex gap-6 text-sm text-[#61706a]">
            <Link href="/terminos" className="transition-colors hover:text-[#1c2421]">Términos</Link>
            <Link href="/privacidad" className="transition-colors hover:text-[#1c2421]">Privacidad</Link>
            <Link href="/contacto" className="transition-colors hover:text-[#1c2421]">Contacto</Link>
          </div>
          <p className="text-xs text-[#8a9690]">© {new Date().getFullYear()} Amobly</p>
        </div>
      </footer>
    </div>
  );
}
