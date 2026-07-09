# Amobly - Strategic Analysis & Roadmap

## Executive Summary

Amobly es un SaaS B2B con una propuesta de valor sólida: digitalizar inventario de mueblerías con AR. El MVP está completo, pero para escalar y convertirlo en un producto irresistible, necesitamos enfocarnos en features que generen *network effects* y *stickiness*.

---

## 1. Roadmap: Próximas 3 Funcionalidades Killer

### 🎯 Feature #1: "Catálogo Compartible" (URLs Personalizadas)

**Qué es:** Cada tienda genera una URL única (ej: `amobly.com/tu-muebleria`) con su catálogo público.

**Por qué es killer:**
- El cliente de la mueblería puede compartir el link en WhatsApp/Instagram
- No necesita desarrollar su propio e-commerce
- Viral orgánico: el cliente comparte, no la tienda

**Revenue impact:** Convierte el producto de "herramienta interna" a "presencia web"

**MVP scope:**
- [ ] Generador de URLs amigables por tienda
- [ ] Catálogo público minimalista (solo productos, sin checkout)
- [ ] Botón WhatsApp directo en cada producto
- [ ] QR code para imprimir en tienda física

---

### 🎯 Feature #2: "AR Instant" (Generación On-Demand)

**Qué es:** En lugar de crédito por generación, el cliente puede subir una foto y en <10 segundos tener el modelo 3D.

**Por qué es killer:**
- Reduce la fricción de usar el pipeline de IA
- El usuario ve resultados inmediatos = mayor conversión a pago
- Modelo de monetización híbrido: freemium para probar, créditos para uso intensivo

**Revenue impact:** Aumento en conversión de trials a paid + upsell de créditos

**MVP scope:**
- [ ] API de Meshy/Tripo optimizada para latency
- [ ] Cola de procesamiento priorizada (Free vs Paid)
- [ ] Preview en tiempo real de la generación
- [ ] Editor básico de fondo (background removal)

---

### 🎯 Feature #3: "Analytics Dashboard" (ROI Visual)

**Qué es:** Dashboard que muestra cuánto dinero ahorró la tienda en devoluciones y cuánto aumentó en ventas gracias a AR.

**Por qué es killer:**
- Justifica el costo del SaaS con datos concretos
- El argumento de venta se vuelve: "Pagás $50k/mes y ahorrás $200k en devoluciones"
- Retención: el cliente ve valor constantemente

**Revenue impact:** Reduce churn drásticamente, facilita ventas consultivas a tiendas grandes

**MVP scope:**
- [ ] Tracking de visualizaciones AR por producto
- [ ] Correlación con conversiones (tracked via WhatsApp clicks)
- [ ] Comparativa pre/post AR (A/B testing básico)
- [ ] Reporte mensual automático por email

---

## 2. Mejoras UX/UI Estratégicas

### Prioridad Alta (Corto Plazo)

| Feature | Impacto | Esfuerzo |
|---------|---------|-----------|
| **WhatsApp Business Integration** | 🔴 Alto | Medio |
| **Plantillas de mensaje** automáticas en el catálogo público | | |
| | | |
| **One-tap AR** | 🔴 Alto | Bajo |
| QR code grande en móvil que abre cámara directo | | |
| | | |
| **Onboarding guiado** | 🟡 Medio | Alto |
| Wizard de 3 pasos para primera tienda | | |

### Prioridad Media (Mediano Plazo)

| Feature | Impacto | Esfuerzo |
|---------|---------|-----------|
| **Tienda Nube / Mercado Shops** | 🔴 Alto | Alto |
| Sincronización bidireccional de productos | | |
| | | |
| **Multi-idioma** | 🟡 Medio | Medio |
| Español + Portugués (BR) inicial | | |
| | | |
| **Modo Offline** | 🟡 Medio | Alto |
| Ver modelos 3D sin internet (PWA) | | |

---

## 3. Optimización Técnica & Reducción de Costos

### Riesgos de Escalabilidad Identificados

#### 🔴 Crítico: Pipeline de IA

**Problema actual:**
```
Costo por modelo 3D ≈ $0.50-2.00 (Meshy/Tripo)
Si tienes 1000 tiendas × 50 productos × 10% AR = $50,000/mes solo en API
```

**Soluciones:**

1. **Caching Inteligente**
   - Hash de imagen de entrada → si ya se procesó, devolver modelo cacheado
   - Redis para metadatos, S3 para modelos generados
   - *Ahorro estimado: 40-60%*

2. **Cola de Procesamiento Diferido**
   - Jobs asíncronos con worker pool
   - Planes gratuitos: hasta 24hs de delay
   - Planes paid: prioridad inmediata
   - *Mejora UX + reduce costos peak*

3. **Modelos Pre-entrenados por Categoría**
   - Sofá genérico → ajustar con foto específica
   - Reducción de tokens API ~70%

4. **Tiering de Calidad**
   - Thumbnail: 256x256, 50KB
   - Web AR: 512x512, 200KB
   - Alta calidad: original, solo bajo demanda

#### 🟡 Medio: Hosting y CDN

**Optimizaciones:**

| Área | Actual | Optimización | Ahorro |
|------|--------|--------------|--------|
| Imágenes | Cloudinary | AVIF/WebP automatic | 30% |
| Modelos 3D | S3 + CloudFront | CloudFront + gzip | 20% |
| Base de datos | RDS single | Read replicas solo lectura | 25% |
| API | Express | Next.js API routes | 15% |

### Arquitectura Recomendada

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  (Vercel - Auto scaling, Edge caching)                 │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   API Gateway (Next.js)                  │
│  - Rate limiting                                       │
│  - Auth JWT                                            │
│  - Caching layer                                       │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │  Jobs   │   │  Core    │   │ Webhooks │
   │ (Queue) │   │   API    │   │  (MP)    │
   └────┬────┘   └────┬─────┘   └──────────┘
        │              │
   ┌────▼────┐   ┌────▼─────┐
   │Worker   │   │ Prisma   │
   │Pool     │   │(Postgres)│
   └────┬────┘   └──────────┘
        │
   ┌────▼────────────────────────────┐
   │  AI Processing                 │
   │  ┌──────┐  ┌──────┐          │
   │  │Meshy │  │Tripo │          │
   │  └──────┘  └──────┘          │
   │  ┌─────────────────────┐       │
   │  │ S3 (Modelos cache) │       │
   │  └─────────────────────┘       │
   └────────────────────────────────┘
```

---

## 4. Análisis Competitivo

### Puntuación: **6.5/10**

| Dimensión | Score | Justificación |
|-----------|-------|---------------|
| **Core AR** | 8/10 | Visor funciona bien, soportan GLB/USDZ |
| **UX/UI** | 6/10 | Funcional pero no encantador |
| **Onboarding** | 4/10 | No hay wizard, el usuario se pierde |
| **Integraciones** | 3/10 | Solo WhatsApp manual |
| **Monetización** | 7/10 | MercadoPago funciona, modelo claro |
| **Escalabilidad** | 5/10 | Costos de IA son riesgo |
| **Producto mínimo** | 8/10 | MVP completo y funcional |
| **Soporte** | 4/10 | Solo email, no chat in-app |

### Fortalezas Competitivas

1. ✅ **Primero en LATAM** en AR para muebles específico
2. ✅ **Pipeline de IA completo** (fondo + 3D)
3. ✅ **Modelo de negocio validado** con MercadoPago
4. ✅ **Precio accesible** vs competidores globales

### Gap Crítico para Liderazgo

| Lo que falta | Impacto | Competidor que lo tiene |
|--------------|---------|------------------------|
| Catálogo compartible | 🔴 Alto | Shopify, Tiendanube |
| ROI visual/dashboard | 🔴 Alto | — (ninguno) |
| Integración e-commerce | 🟡 Medio | Mercado Shops |
| App móvil nativa | 🟡 Medio | — (ninguno) |
| Social proof (casos de éxito) | 🟡 Medio | — |

### Recomendación para Liderazgo LATAM

**Para ser líder indiscutido, el siguiente paso debe ser:**

1. **Lanzar catálogos compartibles** (Feature #1)
   - Convierte el producto en "presencia web" para tiendas pequeñas
   - Reduce dependencia de que la tienda tenga su propio e-commerce

2. **Invertir en analytics de ROI** (Feature #3)
   - El argumento de venta se vuelve incontrarrastable
   - Facilita venta consultiva a cuentas enterprise

3. **Conseguir 3 casos de éxito** con números concretos
   - "Muebles Córdoba: +60% conversiones, -40% devoluciones"
   - Testimonios en video = confianza instantánea

---

## 5. Roadmap Sugerido (12 meses)

```
Q1 2026 (Actual)
├── ✅ MVP completo
├── 🔄 Catálogos compartibles (EN DESARROLLO)
└── 📋 Analytics Dashboard

Q2 2026
├── 🎯 AR Instant (generación <10s)
├── 📱 Onboarding guiado
└── 📊 Dashboard de ROI

Q3 2026
├── 🛒 Integración Tiendanube
├── 🌎 Multi-idioma (PT-BR)
└── 📱 PWA / App nativa

Q4 2026
├── 🤖 AI mejorada (modelos por categoría)
├── 👥 Multi-usuario por tienda
└── 📈 Reportes automáticos
```

---

## Resumen Ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| **¿Qué funcionalidad agregar ahora?** | Catálogos compartibles (URLs públicas) |
| **¿Qué integración prioritaria?** | WhatsApp Business + ROI Analytics |
| **¿Cómo reducir costos de IA?** | Caching + cola asíncrona + modelos pre-entrenados |
| **¿Score actual del producto?** | 6.5/10 |
| **¿Qué falta para líder LATAM?** | Catálogos + Analytics + Casos de éxito |

---

*Documento preparado para revisión estratégica del equipo Amobly*
