# Página de administración de productos

Este documento enumera las funcionalidades actuales de la página `app/admin/page.tsx` y propone mejoras y nuevas características para hacerla lo más completa posible. El objetivo es ir implementando cada ítem uno por uno.

## Funcionalidades existentes

- **Inicio de sesión** (ADMIN/STORE) con gestión de sesión.
- **Resumen de estadísticas** (ventas totales, pedidos, ticket promedio, últimos 30 días) y listas de top productos, vistas AR y stock bajo.
- **Listado de productos** cargados desde la API con botón de actualizar.
- **Validación de escala AR** por producto (llamado al endpoint `/api/ar/validate-scale`).
- **Formulario de creación/edición** con campos:
  - tienda, nombre, slug, descripción, precio, categoría, habitación, estilo, color, dimensiones, AR URL, imagen principal y galería, stock y cantidad.
  - validación de campos y verificación de escala.
- **Generador AI 3D** integrado para crear GLB desde la interfaz.
- **Creación/actualización** de productos vía API.
- **Manejo de errores** y estados de carga.

## Propuestas de mejoras y nuevas funciones

1. **Eliminar productos** con confirmación para limpiar el catálogo. ✅ ya implementado (botón "Borrar" en cada fila).
1.a **Selección múltiple** con casillas y barras de acciones.
2. **Barra de búsqueda y filtros** en el listado (por nombre, store, categoría, etc.). ✅ búsqueda implementada; los filtros básicos se pueden agregar después.
3. **Paginación y ordenamiento** del listado de productos. ✅ control básico de paginado y sort por nombre/precio implementado.
4. **Miniaturas en la tabla** para la imagen principal. ✅ agregado al render de la columna media.
5. **Acciones rápidas** en la fila: editar, validar, borrar, alternar "featured" y "inStock". ✅ toggles implementadas junto al resto de botones.
5.a **Actualizar cantidad de stock** directamente desde la fila. ✅ botón con prompt implementado.
5.b **Modal de vista previa de imagen** al clicar la miniatura. ✅ añadido overlay con imagen grande.
6. **Exportar CSV** del listado filtrado. ✅ botón "Exportar CSV" añadido encima de la tabla; además se puede importar un CSV con productos.
6. **Auto-generar slug** al escribir el nombre. ✅ implementado.
7. **Previsualización** de imagen y/o modelo AR en modal. ✅ ahora hay botón "Ver en AR" cuando existe arUrl (se usa <ARPreview />).
8. **Carga/exportación masiva** (CSV/Excel) de productos.
9. **Gestión de categorías, habitaciones y estilos** desde esta interfaz. ✅ se agregaron paneles para ver, agregar y eliminar valores (limpiando productos asociados al borrar); los campos del formulario usan `datalist` para sugerir entradas.
10. **Panel de ajustes globales** para parámetros como tolerancia de escala AR. ✅ sección con input y guardado dinámico a base de datos; este valor se inyecta en las llamadas de validación y creación/actualización de productos.
10. **Mejoras en la validación AR**: mostrar claramente el resultado (ok/error) con iconos y mensajes. ✅ ya se agregaron iconos y colores en la tabla.
11. **Historial de cambios** o log de versiones por producto (opcional). ✅ tabla `ProductLog` + botón "Historial" en cada fila, con modal que muestra acciones, actor y filtros por fecha/acción.
12. **Soporte para estados de disponibilidad** (pre‑venta, descontinuado).
13. **Panel de ajustes** para configure opciones globales (por ej. factor de escala por defecto).

## Notas adicionales

- Estas mejoras deben coordinarse con los endpoints de la API; algunos podrían necesitar ampliaciones.
- Se pueden priorizar según impacto: comenzar por eliminar, búsqueda y paginación, luego acciones rápidas.

---

A continuación se implementarán los puntos uno por uno, empezando por el primero: **eliminar productos**.