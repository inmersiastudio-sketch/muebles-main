# 📊 ANÁLISIS COMPLETO: AMOBLY

**Fecha:** 2 de Marzo, 2026  
**Versión:** 1.0  
**Estado:** Pre-lanzamiento

---

## ✅ LO QUE YA TIENE (Funcionalidades Core)

| Área | Estado | Detalles |
|------|--------|----------|
| **Frontend** | ✅ | Next.js 16 App Router, Tailwind 4, SSR |
| **Backend** | ✅ | Express + Prisma + PostgreSQL |
| **Auth** | ✅ | Login, registro, reset password con JWT |
| **Catálogo** | ✅ | Búsqueda texto, filtros, paginación, ordenamiento |
| **AR/3D** | ✅ | model-viewer, Quick Look iOS, Scene Viewer Android |
| **Carrito** | ⚠️ | Funciona pero solo localStorage (sin backend) |
| **Favoritos** | ✅ | LocalStorage persistente |
| **Admin Panel** | ✅ | CRUD productos, estadísticas, gestión stock |
| **Multi-tienda** | ✅ | Cada mueblería tiene su panel |
| **WhatsApp** | ✅ | Mensajes prellenados, tracking |
| **AI 3D** | ✅ | Integración Meshy para generar modelos |
| **Cloudinary** | ✅ | Almacenamiento de imágenes |
| **E2E Tests** | ✅ | Playwright configurado |
| **Deploy** | ✅ | Guías Railway + Vercel listas |

---

## 🔴 CRÍTICO PARA LANZAR (Bloquea el lanzamiento)

### 1. Sin Menú Móvil
El Header actual oculta la navegación en móvil (`sm:hidden`) pero **no hay hamburger menu**.

**Archivo afectado:** `mueblesar-web/app/components/layout/Header.tsx`

```tsx
// Código actual - problema:
<nav className="hidden items-center gap-6 ... sm:flex">  // Desaparece en móvil sin alternativa
```

**Solución:** Crear menú hamburger con slide-out drawer.

---

### 2. Páginas Legales Ausentes
Obligatorias por ley argentina y para app stores:

| Página | Ruta | Estado |
|--------|------|--------|
| Términos y condiciones | `/terminos` | ❌ No existe |
| Política de privacidad | `/privacidad` | ❌ No existe |
| Contacto | `/contacto` | ❌ No existe |

---

### 3. Favicon y Branding
- ❌ Favicon es el default de Next.js
- ❌ No hay logo SVG/PNG en el Header (solo texto "Amobly")
- ❌ No hay Open Graph images para compartir en redes sociales

**Archivos afectados:**
- `mueblesar-web/app/favicon.ico` (reemplazar)
- `mueblesar-web/app/layout.tsx` (agregar metadata OG)
- `mueblesar-web/public/` (agregar og-image.jpg, logo.svg)

---

### 4. Imágenes de Categorías Vacías
El filtro visual (`VisualCategoryFilter`) espera imágenes en `public/categories/` pero la carpeta está vacía.

**Archivos necesarios:**
- `public/categories/sofas.png`
- `public/categories/sillas.png`
- `public/categories/mesas.png`
- `public/categories/camas.png`
- `public/categories/armarios.png`
- `public/categories/iluminacion.png`

---

## 🟡 IMPORTANTE PARA UX PROFESIONAL

### 1. Navegación y Usabilidad

| Problema | Impacto | Solución | Archivo |
|----------|---------|----------|---------|
| Sin breadcrumbs en PLP | Usuario se pierde | Agregar ruta de navegación | `productos/page.tsx` |
| Sin "volver arriba" | Scroll molesto en móvil | Botón flotante | Crear componente |
| Carrito sin contador visible | No sabe cuántos items tiene | Badge numérico en header | `Header.tsx` |
| Sin confirmaciones visuales | Usuario no sabe si funcionó | Toast/snackbar system | Crear componente |

---

### 2. Estados de Carga

- ❌ Faltan skeletons en la mayoría de listas
- ❌ Sin estado de error amigable cuando falla la API
- ❌ Botones sin estado de "cargando..." (spinner)

**Componentes afectados:**
- `ProductCard.tsx`
- `Button.tsx`
- Páginas con fetch de datos

---

### 3. Footer Incompleto

**Actual:** Solo 3 links básicos

**Profesional necesita:**
- Logo
- Links a redes sociales (Instagram, Facebook)
- Email de contacto
- Dirección física (si aplica)
- Links legales (términos, privacidad)
- Año copyright

**Archivo:** `mueblesar-web/app/components/layout/Footer.tsx`

---

### 4. Búsqueda Móvil

- ❌ Sin historial de búsquedas recientes
- ❌ Sin sugerencias de productos populares
- ❌ La barra de búsqueda no es visible en móvil (está en el header que se oculta)

**Archivo:** `mueblesar-web/app/components/ui/SearchBar.tsx`

---

## 🟢 NICE TO HAVE (Post-lanzamiento)

| Feature | Prioridad | Esfuerzo | Descripción |
|---------|-----------|----------|-------------|
| Reseñas de productos | Media | Alto | Permitir calificaciones y comentarios |
| Notificaciones email | Baja | Medio | Alertas de nuevos productos, descuentos |
| Comparador de productos | Baja | Alto | Comparar specs lado a lado |
| Checkout con Mercado Pago | Media | Alto | Pagos online integrados |
| Cuentas de usuario (no tiendas) | Media | Medio | Login para clientes finales |
| Blog/contenido | Baja | Bajo | Tips de decoración, SEO |
| PWA instalable | Baja | Bajo | Agregar manifest.json |
| Notificaciones push | Baja | Medio | Alertas en dispositivo |

---

## 📝 PLAN DE TAREAS PARA LANZAR

### Semana 1 - Crítico (Bloqueadores)

- [ ] **T1.1** Crear menú hamburger para móvil
- [ ] **T1.2** Agregar página `/terminos`
- [ ] **T1.3** Agregar página `/privacidad`
- [ ] **T1.4** Subir imágenes de categorías a `public/categories/`
- [ ] **T1.5** Crear/subir logo SVG
- [ ] **T1.6** Crear favicon profesional
- [ ] **T1.7** Agregar Open Graph meta tags

### Semana 2 - Pulido UX

- [ ] **T2.1** Sistema de toasts/notificaciones
- [ ] **T2.2** Loading states en botones (spinner)
- [ ] **T2.3** Footer completo con todos los links
- [ ] **T2.4** Barra de búsqueda visible en móvil
- [ ] **T2.5** Contador de carrito en header
- [ ] **T2.6** Botón "volver arriba" flotante
- [ ] **T2.7** Skeletons en listados de productos

### Semana 3 - SEO y Legal

- [ ] **T3.1** Generar `sitemap.xml`
- [ ] **T3.2** Configurar `robots.txt`
- [ ] **T3.3** Agregar JSON-LD structured data para productos
- [ ] **T3.4** Crear página `/contacto`
- [ ] **T3.5** Verificar en Google Search Console
- [ ] **T3.6** Probar con Lighthouse (score > 90)

---

## 🔧 ARQUITECTURA ACTUAL

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│                    Next.js 16 + Tailwind 4               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │  Home   │  │ Catálogo│  │   PDP   │  │  Admin  │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
┌────────────────────────┴────────────────────────────────┐
│                    BACKEND (Railway)                     │
│                    Express + Prisma                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │Products │  │  Auth   │  │  AR/3D  │  │ Upload  │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
    │PostgreSQL│    │Cloudinary│    │ Meshy  │
    │(Railway) │    │(Images)  │    │(AI 3D) │
    └──────────┘    └──────────┘    └─────────┘
```

---

## 🎯 RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| **Estado actual** | 75% listo para producción |
| **Bloqueadores principales** | Menú móvil, páginas legales, branding |
| **Tiempo estimado MVP** | 1-2 semanas |
| **Riesgo técnico** | Bajo (stack estable) |

### Lo que funciona bien:
- Backend sólido con todas las APIs necesarias
- AR/3D completamente funcional
- Sistema de autenticación robusto
- Panel de admin completo

### Lo que necesita trabajo:
- UX móvil (menú, búsqueda)
- Polish visual (loading states, toasts)
- Requisitos legales (términos, privacidad)
- Branding (logo, favicon, OG images)

---

## 📁 ESTRUCTURA DE ARCHIVOS RELEVANTES

```
mueblesar-web/
├── app/
│   ├── layout.tsx          # Metadata OG - MODIFICAR
│   ├── page.tsx             # Home - OK
│   ├── not-found.tsx        # 404 - OK
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx   # AGREGAR menú móvil
│   │   │   └── Footer.tsx   # MEJORAR
│   │   └── ui/
│   │       ├── Button.tsx   # AGREGAR loading state
│   │       └── SearchBar.tsx # OK
│   ├── terminos/            # CREAR
│   │   └── page.tsx
│   ├── privacidad/          # CREAR
│   │   └── page.tsx
│   └── contacto/            # CREAR
│       └── page.tsx
├── public/
│   ├── categories/          # AGREGAR imágenes
│   ├── logo.svg             # CREAR
│   ├── og-image.jpg         # CREAR
│   └── favicon.ico          # REEMPLAZAR
```

---

**Documento generado automáticamente por análisis de código.**
