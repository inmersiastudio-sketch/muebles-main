# Revisión backend — brechas y próximos pasos

Fecha: 2026-02-26

## Estado general

El backend está funcional y tiene buena base para MVP/productivo temprano:

- Autenticación por cookie + JWT.
- Roles (`ADMIN`, `STORE`) y chequeos por tienda en endpoints admin.
- Rate limiting básico.
- Prisma + migraciones.
- Validación con Zod en rutas críticas.
- Integración de auditoría básica (ProductLog) para crear/editar/eliminar productos.

## Hallazgos y brechas detectadas

## 1) Crítico (producción)

1. **Secrets inseguros por defecto en `env.ts`** ✅ RESUELTO
   - `JWT_SECRET` y `ADMIN_API_KEY` tienen defaults de desarrollo.
   - Riesgo: despliegue con secreto débil por omisión.
   - Recomendación:
     - En `production`, fallar startup si no hay valores fuertes.
     - Añadir validación estricta en `envSchema`.

2. **Rate limiter en memoria de proceso**
   - `rateLimit.ts` originalmente usaba un `Map` local.
   - Riesgo: en múltiples instancias no limita de forma global.
   - Implementación actual:
     - Nuevo cliente Redis (`lib/redis.ts`) usa `REDIS_URL`.
     - `rateLimit.ts` ahora cuenta usando Redis keys, con in-memory fallback.
   - Status: ✅ RESUELTO (requiere Redis en producción, advertencia si falta).

3. **Fallback a datos mock en `products.ts` ante error DB** ✅ RESUELTO PARCIAL
   - Riesgo: respuestas inconsistentes en producción y ocultación de fallas reales.
   - Estado actual:
     - En producción ya no devuelve mock: responde `503 Service temporarily unavailable`.
   - Pendiente:
     - Alerting/observabilidad para detectar este evento automáticamente.

## 2) Alta prioridad

4. **Logs de producto con tipos “any” en Prisma client**
   - Se está usando `(prisma as any).productLog` por desincronía de tipos.
   - Riesgo: pérdida de seguridad de tipos y bugs silenciosos.
   - Recomendación:
     - Alinear versión/cliente Prisma y TS server para usar `prisma.productLog` tipado.

5. **No hay trazabilidad completa por request (request-id/correlation-id)**
   - Hay `pino-http`, pero falta propagar ID y contexto consistente.
   - Recomendación:
     - Inyectar `x-request-id` si no existe.
     - Registrar usuario/route/status en formato estructurado en todos los handlers críticos.

6. **Auditoría parcial**
   - Sólo cubre producto (create/update/delete).
   - Recomendación:
     - Extender auditoría a auth sensible (reset password), settings admin y créditos AI3D.

## 3) Media prioridad

7. **Hardening de endpoints admin/settings**
   - Actualmente guarda `key/value` libre.
   - Recomendación:
     - Definir allowlist de keys válidas.
     - Validar formatos por clave (`tolerance` en rango 0..1, etc).

8. **Validaciones de importación CSV en frontend sin endpoint dedicado**
   - El import hace múltiples requests directos desde el cliente.
   - Recomendación:
     - Endpoint bulk con validación transaccional y reporte por fila.

9. **Observabilidad operativa incompleta**
   - Falta integrar métricas/alertas (latencia, error-rate, DB, colas).
   - Recomendación:
     - Prometheus/OpenTelemetry + dashboard + alertas de SLO.

10. **Backups y restore verificado**
   - README lo marca como pendiente.
   - Recomendación:
     - Política de backups + prueba periódica de restauración.

## 4) Baja prioridad / técnica

11. **Normalización de respuestas de error**
   - Estructura de errores no siempre uniforme entre rutas.
   - Recomendación:
     - Middleware central de error con shape estándar.

12. **Cobertura de tests backend**
   - No se ve suite robusta para rutas críticas.
   - Recomendación:
     - Tests de auth, permisos por store, product CRUD, y logs.

## Plan sugerido (orden)

1. Forzar secrets en prod + quitar fallback mock en prod.
2. Limiter distribuido + request-id.
3. Endpoint bulk import backend + validación por lote.
4. Tipado completo de `productLog` sin `any`.
5. Observabilidad + backups con restore test.

---

Documento generado tras revisión de:
- `backend/src/config/env.ts`
- `backend/src/middleware/rateLimit.ts`
- `backend/src/routes/auth.ts`
- `backend/src/routes/products.ts`
- `backend/src/routes/adminProducts.ts`
- `backend/README.md`
