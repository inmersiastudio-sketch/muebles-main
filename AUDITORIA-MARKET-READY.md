# AUDITORÍA EJECUTIVA: ESTADO MARKET-READY DE AMOBLY

**Fecha:** Marzo 2025  
**Auditor:** Análisis de código y flujos de usuario  
**Estado General:** ⚠️ NO LISTO PARA PRODUCCIÓN - Requiere correcciones críticas

---

## 🚫 PROBLEMAS CRÍTICOS (Bloqueantes para venta)

### 1. LINKS ROTOS Y RUTAS INCORRECTAS

| Ubicación | Problema | Impacto |
|-----------|----------|---------|
| `carrito/page.tsx:74` | Link a `/producto/${item.slug}` → Debería ser `/productos/${item.slug}` | ❌ Usuario ve 404 al clickear producto en carrito |
| `carrito/page.tsx:85` | Link a `/producto/${item.slug}` → Mismo problema | ❌ Doble fallo de navegación |
| `carrito/page.tsx:90` | Link a `/muebleria/${item.storeSlug}` → Debería ser `/mueblerias/${item.storeSlug}` o `/catalog/${item.storeSlug}` | ❌ 404 al intentar ver tienda |
| `Header.tsx:11` | Link a `/productos?ofertas=true` → No hay filtro implementado para "ofertas" | ❌ Página vacía o sin resultados |

### 2. FLUJO DE CHECKOUT INCOMPLETO

**Problema:** El "carrito" no tiene funcionalidad de checkout real.

- ✅ Agregar productos al carrito
- ✅ Ver carrito  
- ✅ Modificar cantidades
- ❌ **NO** hay proceso de pago
- ❌ **NO** hay integración con MercadoPago/Stripe
- ❌ **NO** hay gestión de envíos
- ❌ **NO** hay confirmación de orden

**Impacto:** La plataforma es un "showroom" pero no una tienda. Los usuarios no pueden comprar.

### 3. SISTEMA DE ÓRDENES NO FUNCIONAL

En `backend/src/routes/adminOrders.ts` hay endpoints pero:
- No hay flujo de creación de órdenes desde el frontend
- No hay notificaciones por email/SMS
- No hay tracking de estado de pedidos
- No hay historial de compras para el cliente

### 4. PÁGINAS DE ADMIN SIN IMPLEMENTAR

| Página | Estado | Problema |
|--------|--------|----------|
| `/admin/analytics` | ⚠️ Stub | Muestra datos mock, no conecta a backend real |
| `/admin/billing` | ⚠️ Stub | Sin funcionalidad de facturación |
| `/admin/orders` | ⚠️ Parcial | Lista órdenes pero sin gestión completa |
| `/admin/media` | ❌ Roto | No carga correctamente las imágenes |
| `/admin/settings` | ⚠️ Básico | Sin configuración de pagos/envíos |

---

## ⚠️ PROBLEMAS MEDIOS (Degradan experiencia)

### 5. EXPERIENCIA MÓVIL DEFICIENTE

- **BottomNav.tsx:** No se oculta en páginas de producto (debería ocultarse en PDP)
- **Header:** En móvil, el buscador tapa contenido (spacer de 88px fijo)
- **Carrito:** No es responsive - tabla se corta en pantallas < 400px

### 6. FLUJO DE FAVORITOS INCOMPLETO

- ✅ Guardar favoritos (localStorage)
- ❌ **NO** persisten entre dispositivos (no hay sync con backend)
- ❌ **NO** hay notificación cuando un favorito baja de precio
- ❌ **NO** se puede compartir lista de favoritos

### 7. BÚSQUEDA Y FILTROS LIMITADOS

- **Buscador:** Solo busca por nombre, no por SKU ni descripción
- **Filtros:** No hay filtros por rango de precio en tiempo real
- **Ordenamiento:** No funciona correctamente con precios (ordena por string, no por número)

### 8. SEO Y METADATAS

```
⚠️ /admin/analytics - Unsupported metadata viewport
⚠️ /admin/inventory - Unsupported metadata viewport
⚠️ /admin/* - Múltiples páginas con metadatas mal configuradas
```

**Impacto:** Google no indexará correctamente las páginas.

---

## 📊 ANÁLISIS DE CONVERSIÓN (Funnel)

```
Homepage (100%)
    ↓
PLP / Productos (40% estimado) ← Baja tasa por filtros limitados
    ↓
PDP / Producto (15% estimado) ← Sin "productos similares" dinámicos
    ↓
Carrito (5% estimado) ← Alto abandono por falta de urgencia
    ↓
Checkout/Pago (0%) ← ❌ NO EXISTE
    ↓
Confirmación (0%) ← ❌ NO EXISTE
```

**Tasa de conversión estimada:** 0% (no se puede comprar)

---

## 🎯 RECOMENDACIONES PRIORITARIAS

### FASE 1: CRÍTICO (1-2 semanas)

1. **Arreglar links rotos:**
   ```typescript
   // En carrito/page.tsx
   href={`/productos/${item.slug}`}  // ✅ Correcto
   href={`/catalog/${item.storeSlug}`} // ✅ Correcto
   ```

2. **Implementar checkout básico:**
   - Formulario de datos de envío
   - Selección de método de pago (efectivo/transferencia para MVP)
   - Confirmación vía WhatsApp con resumen
   - Guardar orden en base de datos

3. **Página de "Mis Órdenes" para clientes:**
   - Historial de compras
   - Estado de pedidos
   - Recomprar

### FASE 2: IMPORTANTE (2-4 semanas)

4. **Mejorar SEO:**
   - Arreglar metadatas en todas las páginas
   - Agregar sitemap.xml
   - Implementar structured data (JSON-LD) para productos

5. **Favoritos persistentes:**
   - Guardar en base de datos (tabla `WishlistItem` ya existe)
   - Sync entre dispositivos

6. **Notificaciones:**
   - Email de confirmación de orden
   - Email de bienvenida
   - Alerta de precio bajo en favoritos

### FASE 3: OPTIMIZACIÓN (1-2 meses)

7. **Pasarela de pagos:**
   - Integración MercadoPago
   - Pagos con tarjeta
   - Cuotas

8. **Dashboard de Analytics real:**
   - Conectar a base de datos
   - Métricas reales de conversión
   - Reportes de ventas

---

## ✅ QUÉ FUNCIONA CORRECTAMENTE

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Registro de mueblerías | ✅ | Flujo completo con verificación email |
| Login/Auth | ✅ | JWT con refresh token |
| Creación de productos | ✅ | Admin funcional con imágenes y 3D |
| Visualización AR | ✅ | WebXR funciona en móviles compatibles |
| Catálogo público | ✅ | `/catalog/[slug]` funciona bien |
| Búsqueda básica | ✅ | Funciona pero es limitada |
| Carrito (guardado) | ✅ | LocalStorage persiste |
| Responsive design | ⚠️ | 80% funciona, necesita pulido |

---

## 📈 ESTIMADO PARA ESTAR LISTO

### MVP Comercial Básico (Vender online)
**Tiempo estimado:** 3-4 semanas  
**Costo estimado:** $$ (desarrollo interno)

Requisitos:
- [ ] Checkout funcional con WhatsApp
- [ ] Links arreglados
- [ ] Página de órdenes para clientes
- [ ] Email de confirmación

### Producto Completo (Competitivo)
**Tiempo estimado:** 2-3 meses  
**Costo estimado:** $$$ (con pasarela de pagos)

Requisitos:
- [ ] Todo lo anterior
- [ ] MercadoPago integrado
- [ ] Analytics real
- [ ] App móvil (PWA)
- [ ] Sistema de reviews

---

## 🎯 VEREDICTO FINAL

**¿Está lista para el mercado?** 

🔴 **NO** - En estado actual, no es vendible como plataforma de e-commerce.

**¿Qué tan cerca está?**

🟡 A 3-4 semanas de un MVP funcional que permita recibir pedidos reales.

**Recomendación:**

1. **Corto plazo:** Implementar checkout básico con WhatsApp (Quick win)
2. **Mediano plazo:** Agregar pasarela de pagos
3. **Largo plazo:** App móvil nativa y sistema completo de gestión

---

## 📋 CHECKLIST PARA LANZAMIENTO

```
CRÍTICO:
□ Arreglar todos los links rotos
□ Implementar checkout básico
□ Página de confirmación de compra
□ Email de confirmación
□ Panel de "Mis Órdenes" para clientes

IMPORTANTE:
□ SEO básico (metadatas, sitemap)
□ Favoritos persistentes en BD
□ Notificaciones por email
□ Filtros avanzados de productos

NICE TO HAVE:
□ Pasarela de pagos
□ Analytics real
□ App móvil PWA
□ Sistema de reviews
```

---

**Documento generado:** Auditoría automatizada del código fuente  
**Próxima revisión recomendada:** Después de FASE 1 (3 semanas)
