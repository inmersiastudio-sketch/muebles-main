# Documento de Producto MueblesAR (Córdoba)

## Visión
Portal que conecta mueblerías de Córdoba con clientes finales: catálogo web rápido, búsqueda y filtros claros, contacto directo (WhatsApp), y experiencias 3D/AR para visualizar muebles en el hogar. Escalable para incorporar más tiendas, más tráfico y nuevos formatos.

## Públicos
- **Clientes**: buscan inspiración, comparan precios/dimensiones, consultan por WhatsApp y prueban en AR/3D.
- **Mueblerías**: quieren publicar catálogo fácil, sincronizar stock/precios, generar modelos 3D desde fotos y recibir leads medibles.

## Experiencia Cliente
- **Home**: destacados, categorías por ambiente y tipo, entrada rápida a búsqueda y mueblerías.
- **Catálogo (PLP)**: filtros persistentes (categoría, ambiente, estilo, precio, tienda), orden y paginación; conteo de resultados en vivo.
- **Búsqueda**: texto + sinónimos (sillon≈sofa), resultados mixtos (productos + mueblerías), sugerencias.
- **PDP**: galería con carrusel, specs (dimensiones, material, color), badges de estilo/tienda, CTA WhatsApp prellenado, favoritos, productos relacionados.
- **AR/3D**: visor `<model-viewer>` con fallback 3D; botón “Ver en tu casa”.
- **Rendimiento/Accesibilidad**: LCP<2.5s, imágenes AVIF/WebP, lazy-load, contraste AA, focus visible.

## Onboarding de Mueblerías
- **Registro y tienda**: logo, dirección, WhatsApp, horarios.
- **Alta de productos**: formulario guiado (nombre, slug, precio, stock, dimensiones, estilo, categoría, imágenes múltiples).
- **Importación**: CSV/Excel con validación previa; mapping de campos; previsualización.
- **API keys**: clave por tienda para sincronizar vía REST (productos, stock, precios); webhooks para recibir confirmación.
- **Soporte asistido**: opción “cargamos por vos” con checklist y plantillas de fotos.

## AR/3D desde fotos
- **Flujo**: subir 3-5 fotos fondo neutro → enviar a proveedor de generación 3D → recibir GLB/USDZ → validación (escala/ejes) → publicar.
- **Proveedor**: evaluar LeiaPix/Polycam/Kaedim/Tripo AI; elegir por calidad/costo/SLAs. Se acepta pago si mejora calidad.
- **Visor**: `<model-viewer>` con AR Quick Look (iOS) y Scene Viewer (Android); compresión Draco/Basis y LOD para performance; CDN dedicada para modelos.

## Backend/API
- **Endpoints**: productos (filtros, paginación, orden), búsqueda texto, mueblerías, auth (JWT para dashboard, API keys para tiendas), webhooks.
- **Filtros/orden**: `page`, `pageSize`, `sort=price|createdAt`, `direction=asc|desc`, `category`, `room`, `style`, `store`, rango de precio, texto `q`.
- **Validaciones**: Zod/Prisma (precio>=0, stock>=0, slug único por tienda).
- **Seguridad**: rate limiting, CORS restringido, Helmet, claves rotables, logs de acceso API.
- **Storage**: imágenes en S3/Cloudinary; modelos 3D en bucket separado con CDN y URLs firmadas opcionales.
- **Observabilidad**: pino + OpenTelemetry; métricas Prometheus; health/readiness checks.

## Frontend (Next.js)
- **Data fetching**: `cache: 'no-store'` cuando hay filtros/búsqueda; ISR para home/destacados; error/retry UI.
- **Estado**: URL como fuente de verdad de filtros; favoritos persistentes (localStorage + backend si hay sesión).
- **UI**: cards con badges (estilo, tienda), skeletons, toasts; carrusel PDP; slider de precio; paginación en PLP.
- **Analytics**: eventos de búsqueda, filtro aplicado, clic en AR/WhatsApp, scroll de galería.

## Datos y taxonomía
- Categorías cerradas (sofas, mesas, sillas, almacenamiento, etc.), estilos (moderno, clasico, industrial, escandinavo, minimalista, rustico), ambientes (living, comedor, dormitorio, cocina, oficina, exterior).
- Atributos mínimos: precio, stock, dimensiones (ancho/alto/profundidad), material, color, peso, disponibilidad, garantía, tiempos de entrega.

## DevOps/Infra
- Contenedores: Docker para frontend/backend; docker-compose con Postgres y MinIO (mock S3) en dev/stage.
- CI/CD: lint, test, build; migraciones automáticas; despliegue a staging/prod.
- Configuración: `.env` por ambiente; secretos en store seguro; backups de DB; CDN para assets/modelos.

## Calidad
- Pruebas unitarias e integración (servicios, Prisma); mocks de API externa 3D.
- E2E (Playwright): búsqueda, filtros, PDP, WhatsApp CTA, AR fallback.
- Performance budget: Lighthouse en CI con umbrales de LCP/CLS; error budget de uptime.

## Métricas clave
- Clientes: conversión a WhatsApp, uso de AR/3D, favoritos guardados, repetición de sesiones.
- Mueblerías: tiempo de alta, número de productos publicados, generación de modelos 3D, tasa de lead por tienda.
- Técnica: LCP/CLS, errores 5xx/4xx, p95 latencia API, costo por modelo 3D.

## KAPI (Key Actionable Performance Indicators)
- Descubrimiento: CTR en home → PLP; tasa de uso de búsqueda; tasa de uso de filtros.
- Consideración: tiempo en PDP; interacción con carrusel; uso de especificaciones; apertura de visor 3D/AR; agregados a favoritos.
- Conversión: clic en WhatsApp (lead), ratio lead/visitas PDP, ratio lead tras usar AR, tasa de retorno con favoritos.
- Catálogo sano: % productos con fotos múltiples, % con 3D, error rate en importaciones, tiempo medio de publicación tras carga.
- Rendimiento: p95 TTFB y p95 LCP en PLP/PDP; uptime; p95 latencia `/api/products` con filtros.
- Operación tienda: tiempo de alta de tienda, tiempo de carga de 10 primeros productos, SLA de generación 3D.

## Roadmap 90 días
- **Backend**: paginación/orden en `/api/products`, búsqueda combinada, rate limit, API keys, webhooks básicos.
- **Frontend**: paginación en /productos, slider de precio, carrusel de imágenes en PDP, visor 3D/AR MVP, favoritos persistentes.
- **Integración 3D**: prueba de 2-3 proveedores con muestras reales; elegir uno y automatizar flujo de subida/aprobación.
- **DevOps**: docker-compose local, CI con lint/test/build, healthchecks y despliegue a staging.
- **Onboarding mueblerías**: dashboard mínimo, importación CSV, guías de fotos y kit de arranque.

## Checklist de salida a producción
- SSL, CORS restringido, rate limiting y Helmet activos.
- Variables de entorno separadas y probadas; migraciones aplicadas.
- Monitoreo y alertas básicas; backups configurados.
- Flujos críticos cubiertos por E2E; performance budget cumplido.

## Arquitectura propuesta
- Frontend: Next.js App Router (SSR/ISR), Tailwind v4, `<model-viewer>` para 3D/AR, analytics ligero.
- Backend: Node/Express + Prisma/PostgreSQL; storage S3/Cloudinary; colas (BullMQ/Redis) para trabajos 3D; pino + OpenTelemetry.
- CDN: imágenes y modelos 3D con cache-control y firma opcional.
- Auth: JWT para dashboard; API keys rotables por tienda; rate limit per-key.
- Infra: Docker; staging/prod separados; health/readiness; backups automáticos de DB.

## Flujos clave (cliente)
- Búsqueda/filtros: URL refleja estado; paginación; orden precio/recientes; fallback sin resultados con CTA.
- PDP: galería, specs, CTA WhatsApp (mensaje prellenado), visor 3D/AR, relacionados por estilo/ambiente.
- AR: si el dispositivo soporta Quick Look/Scene Viewer lanza AR; si no, visor 3D con controles y aviso de tamaño real.

## Journey cliente: comprar un mueble
1. Llega a home y usa búsqueda o categorías → KAPI: CTR home→PLP, uso de búsqueda.
2. En PLP aplica filtros (estilo, ambiente, precio) y pagina → KAPI: tasa de uso de filtros, p95 latencia filtrada.
3. Abre PDP, revisa fotos, specs y tienda → KAPI: tiempo en PDP, scroll depth, vistas de specs.
4. Lanza visor 3D/AR para comprobar escala → KAPI: ratio AR launch, tiempo en visor.
5. Guarda en favoritos o clic en WhatsApp con mensaje prellenado → KAPI: favoritos creados, clics WhatsApp, lead rate tras AR.
6. Recibe respuesta de la mueblería (fuera de la app) → se puede medir con webhooks de click/lead y confirmación opcional.

## Qué debe soportar el sistema para este journey
- Rendimiento: PLP paginada y cache-control corto; respuestas API <700ms p95 con filtros.
- Estado compartible: filtros en la URL, deep links a PDP y a vistas AR (intent iOS/Android).
- Medios: imágenes optimizadas, múltiples vistas; modelos GLB/USDZ <15MB con thumbnails.
- Resiliencia AR: fallback a visor 3D si no hay soporte; manejo de errores de carga con mensaje claro.
- Tracking: eventos de búsqueda, filtros, AR launch, clic WhatsApp, favoritos; atributos de tienda para atribución de lead.
- Seguridad: rate limit en búsqueda y productos; CORS/HTTPS; validación de inputs para evitar inyección.
- Disponibilidad: health checks, monitoreo y alertas; CDN para assets/3D.

## Flujos clave (mueblería)
- Onboarding: crear cuenta → completar tienda → alta 10 productos (CSV o manual) → probar 3D en 2 productos → publicar.
- Importación CSV: mapping columnas (nombre, descripcion, precio, stock, categoria, estilo, dimensiones, color, material, imagenURL); preview y validación.
- API: POST/PUT productos, PATCH stock/precio, listados paginados, webhooks de confirmación.

## Evaluación de proveedores 3D (desde fotos)
- Criterios: calidad (malla limpia, PBR), tiempo de entrega, costo por modelo, soporte batch/API, formatos GLB/USDZ, control de escala.
- Candidatos a probar: LeiaPix, Polycam, Kaedim, Tripo AI. Ejecutar prueba con 3 muebles (sofa tela, mesa madera, silla metal) y medir.
- Pipeline: subida fotos fondo neutro → envío API → validación malla (normales, escala, eje Y-up) → compresión Draco → publicar.

## Datos y esquema (alto nivel)
- store: id, name, slug, logoUrl, whatsapp, address, description, createdAt.
- product: id, storeId, name, slug, price, stock, category, room, style, widthCm, heightCm, depthCm, material, color, featured, inStock, createdAt.
- productImage: id, productId, url, altText, position, type.
- model3d: id, productId, glbUrl, usdzUrl, thumbUrl, status (pending/ready/failed), provider, scale, createdAt.
- apiKey: id, storeId, keyHash, createdAt, revokedAt.
- user: id, email, passwordHash, role, storeId (nullable para admin global).

## Requisitos no funcionales
- Rendimiento: LCP<2.5s (p95), TTFB<500ms (p95) en páginas críticas; payload API paginado <300KB.
- Escalabilidad: 50 tiendas y 10k productos con p95<700ms en búsquedas filtradas.
- Disponibilidad: SLA 99.5%; RPO<=24h, RTO<=4h; backups diarios probados.
- Seguridad: OWASP top 10 mitigado, rate limit, HTTPS, logging de accesos y cambios.
- Accesibilidad: WCAG AA, focus visible, alt en imágenes, navegación teclado.

## Seguridad y cumplimiento
- CORS restringido a dominios propios; HSTS; Helmet.
- Rate limit por IP y por API key; logs de acceso; bloqueo de payloads grandes.
- Uploads: validar MIME/ext, límite de tamaño, limpiar EXIF; antivirus opcional.
- Datos personales: solo WhatsApp/link, registrar consentimiento; no almacenar mensajes.
- Secretos en store seguro; backups cifrados.

## SEO y marketing
- Meta y OpenGraph por producto; schema.org Product con precio/stock.
- Sitemaps (productos, tiendas); robots.txt; canonical URLs; redirects 301 si cambia slug.
- Landing por categoría/ambiente; blog/tutorial de mediciones y AR.

## Observabilidad
- Logs estructurados (req/res, userId/storeId, traceId).
- Trazas OTel para API y colas 3D.
- Métricas Prometheus: latencia p95/p99, tasa de errores, hits de rate limit, cola 3D, uso de CDN.
- Alertas: 5xx>1%, p95>1s, cola 3D>10 pendientes, bucket>80% uso.

## QA y testing
- Unit: validaciones Zod, servicios, formateos.
- Integration: rutas Express con supertest; Prisma con DB de prueba.
- E2E: Playwright (home, PLP, filtros, PDP, WhatsApp CTA, búsqueda, onboarding tienda, import CSV).
- AR smoke: `<model-viewer>` carga GLB/USDZ <15MB con escala correcta.
- Performance: Lighthouse CI; k6 en `/api/products` con filtros.

## Contenido y medios
- Guía de fotos: fondo neutro, luz uniforme, 3-5 ángulos, sin recortes; resolución mínima 1600px.
- Compresión: AVIF/WebP, máximo 300KB en cards, 1-2MB en PDP zoom.
- Moderación: revisión de fotos y textos antes de publicar; flag manual.

## SEO y sharing
- Schema.org Product, OG tags en PDP/PLP.
- Sitemaps diarios y canonical; redirects 301 en cambios de slug.
- Contenidos de apoyo: guías AR, mediciones, estilos.

## Operaciones y soporte
- Status page; comunicación de incidentes.
- SLAs: alta de producto <5 min, modelo 3D objetivo <24h, respuesta soporte <1 día hábil.
- Playbooks: falla proveedor 3D (cambiar a backup, pausar cola), caída CDN (servir desde origen), DB cerca de cuota (archivar/escala vertical temporal).

## Métricas ampliadas
- Engagement: CTR en resultados, uso de filtros, scroll en PDP.
- Conversión: clic en WhatsApp, conversión AR→contacto, favoritos→contacto.
- Catálogo: % productos con 3D, tiempo medio de generación, fallos por proveedor.
- Operativo: duración import CSV, errores de validación, tiempo de onboarding tienda.

## Plan de adopción mueblerías (detallado)
- Semana 1: alta tienda, cargar 10 productos, configurar WhatsApp.
- Semana 2: generar 3D en 2 productos, publicar y probar AR.
- Semana 3: conectar API/CSV para stock/precios; añadir logos y banners.
- Semana 4: revisar métricas y ajustar fotos/3D; sumarse a destacados.

## Plan de precios (borrador)
- Free: hasta 10 productos, sin 3D, sin API.
- Starter: hasta 100 productos, 5 modelos 3D/mes, API key, soporte básico.
- Pro: catálogo ilimitado, 20 modelos 3D/mes, soporte prioritario; modelos extra a costo unitario.

## Roadmap técnico detallado
1) Paginación/orden backend + PLP; slider de precio; badges tienda/estilo; cards con primera imagen real.
2) API keys y rate limit; webhooks de confirmación; logging/metrics base.
3) Import CSV en dashboard (UI simple + validación); CRUD de tienda/producto.
4) Prototipo 3D: integrar 2 proveedores, medir calidad/costo/tiempo; elegir uno; pipeline en cola.
5) Visor 3D/AR en PDP con fallback; control de peso y escala; thumbnails.
6) CI/CD con lint/test/build; docker-compose local; healthchecks; despliegue staging.

## Release y migraciones
- Prisma migrations versionadas; `prisma migrate deploy` en deploy.
- Semver para API; breaking changes versionadas.
- Canary en staging; smoke tests post-deploy; rollback plan.

## Roles y responsabilidades (breve)
- Producto: prioriza backlog, define taxonomías y KPIs.
- Tech lead: arquitectura, seguridad, performance, revisiones.
- Frontend: UI/UX, accesibilidad, SSR/ISR, visor AR.
- Backend: API, DB, colas 3D, webhooks, auth.
- DevOps: CI/CD, infra, observabilidad, backups, seguridad operativa.

## Riesgos y mitigaciones
- Generación 3D de baja calidad: prueba A/B y QA manual antes de publicar.
- Costos de modelo altos: cupo mensual por tienda, pricing escalonado, cache de modelos aprobados.
- Performance AR: limitar peso GLB/USDZ, LOD/streaming; fallback 2D/3D sin AR.
- Datos inconsistentes: validación estricta en import/API; reglas de negocio en backend.

## Próximos pasos inmediatos
- Agregar paginación/orden a `/api/products` y al PLP.
- Slider de precio y badge de tienda/estilo en cards; carrusel en PDP.
- Implementar API keys + rate limit y webhooks de confirmación.
- Probar 2 proveedores de 3D con 3 muestras y documentar resultados.
