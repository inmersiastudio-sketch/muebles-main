# Documentación de Integración: Logística, Importación CSV y Login Unificado

Este archivo detalla el estado del proyecto para continuar el trabajo desde otra computadora.

## 1. Cambios Recientes Implementados (Completados y Compilados)

### A. Logística y Embalaje
* **Frontend:** Se extendió el estado del formulario del producto y se rediseñó el Drawer del producto en `page.tsx` para agregar campos avanzados (Peso del producto, Dimensiones de la caja/embalaje, Tiempos mínimos/máximos de entrega, Dificultad y costo de armado, bultos y cuidado especial).
* **Fusión al Editar:** Al guardar modificaciones, el frontend ahora realiza un `merge` con los datos previos del producto (`originalProduct`) evitando borrar datos del backend no expuestos en el formulario (como `manualUrl` y `shippingZones`).
* **Backend:** El endpoint `GET /api/admin/products` ahora mapea las dimensiones anidadas del JSON para que se muestren correctamente en la tabla del panel administrativo.

### B. Importador y Exportador CSV
* **Validación Rigurosa:** El endpoint `/bulk` ahora valida cada fila contra un esquema estricto de Zod (`BulkItemSchema`), arrojando errores específicos por fila en lugar de forzar ceros o fallar silenciosamente.
* **Modelos 3D en Importación:** Se implementó la persistencia de las URLs de modelos 3D (`glbUrl`, `usdzUrl`, `arUrl`) en la tabla relacional `ProductMedia` al importar y exportar en lote.
* **Control de Límites:** El importador masivo ahora valida que el catálogo final no exceda el límite del plan (`maxProducts`) de la mueblería.
* **Filtros de Stock:** Se inyectó la propiedad `inStock` lógica basada en inventario (`availableStock > 0`), resolviendo fallos en los filtros de stock del administrador.
* **Selector de Tiendas para Superadmin:** Si un Superadmin importa un archivo que no contiene `storeId` en sus filas, el modal de previsualización le permite elegir a qué tienda asociar los productos antes de enviarlos.
* **Parser de CSV con Salto de Línea:** Reemplazamos el splitter simple por un parser secuencial que permite descripciones multilínea (con saltos de línea `\n` internos) entrecomilladas sin corromper las filas del CSV.
* **Exportación de Todo el Catálogo:** Modificamos el exportador de CSV para ignorar el límite de paginación de la UI (`limit=all`), obteniendo un respaldo exacto de la base de datos.

### C. Unificación del Login
* Se eliminó el formulario de login duplicado e incrustado del layout de administración.
* Si el usuario cierra sesión o entra a una ruta restringida sin credenciales, es redirigido automáticamente a la página de login oficial unificada en `/login`.

---

## 2. Próximos Pasos (Cómo Continuar)

### Paso 1: Levantar el Entorno Local
Asegúrate de iniciar los servidores en tu otra máquina:
1. **Backend:**
   ```bash
   cd backend
   npm run dev
   ```
2. **Frontend:**
   ```bash
   cd mueblesar-web
   npm run dev
   ```

### Paso 2: Probar la Importación del CSV
1. Ingresá al administrador e importá el archivo `productos_importar.csv` que se encuentra en la raíz del proyecto.
2. Comprobá que:
   * Los productos se cargan correctamente.
   * Si hay productos sin stock (`stockQty: 0` o `inStock: false`), estos permanezcan activos en el listado y no desaparezcan.
   * La previsualización de las imágenes de Unsplash se rendericen de forma correcta en la tabla.

### Paso 3: Configurar y Probar el Generador 3D (IA)
Para activar y probar la generación automática de modelos 3D desde imágenes:
1. Registrate y obtené una clave de API en [Meshy.ai](https://meshy.ai) o [Tripo3d.ai](https://www.tripo3d.ai/).
2. Abrí el archivo `backend/.env` y configurala:
   ```env
   MESHY_API_KEY=tu_api_key_aqui
   ```
3. Abrí el panel del producto en el administrador y hacé clic en **"Generar Modelo 3D"** para probar la integración de punta a punta.
