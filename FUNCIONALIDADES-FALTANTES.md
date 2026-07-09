# FUNCIONALIDADES FALTANTES - AUDITORÍA COMPLETA

## Resumen Ejecutivo
El schema de base de datos es **avanzado**, pero el **frontend del admin es básico**. Hay un desfasaje grande entre lo que la BD permite y lo que el usuario puede gestionar.

---

## 🔴 CRÍTICO: Gestión de Variantes

### Estado Actual
```
Formulario Admin:
├── Nombre
├── Precio (único) ❌
├── Color (texto libre) ❌
├── Stock (único) ❌
└── Imágenes (unas pocas) ❌
```

### Lo que debería ser
```
Formulario Admin:
├── Nombre
├── Variantes:
│   ├── Variante 1: "Sofá 3 cuerpos - Rojo"
│   │   ├── Color: Rojo (selector con muestra)
│   │   ├── Precio: $850.000
│   │   ├── Stock: 15 unidades
│   │   └── Imágenes: [foto1-rojo.jpg, foto2-rojo.jpg]
│   ├── Variante 2: "Sofá 3 cuerpos - Azul"
│   │   ├── Color: Azul
│   │   ├── Precio: $875.000 (diferente)
│   │   ├── Stock: 8 unidades
│   │   └── Imágenes: [foto1-azul.jpg, foto2-azul.jpg]
│   └── Variante 3: "Sofá 2 cuerpos - Rojo"
│       ├── Tamaño: 2 cuerpos
│       ├── Color: Rojo
│       ├── Precio: $650.000
│       └── Stock: 0 unidades (agotado)
```

### Funcionalidades Faltantes

#### 1. Selector de Atributos de Variante
- [ ] **Color**: Selector visual con muestras (hex), no texto libre
- [ ] **Tamaño**: Dropdown configurable (1 cuerpo, 2 cuerpos, 3 cuerpos / King, Queen, Single)
- [ ] **Material**: Selector (Cuero, Tela, Lino, Gamuza)
- [ ] **Acabado**: Selector (Mate, Brillante, Texturizado)
- [ ] **Personalizado**: Permitir agregar atributos custom (ej: "Patas": Madera/Metal)

#### 2. Galería por Variante
- [ ] Subir imágenes específicas para cada variante
- [ ] Preview de imágenes cargadas
- [ ] Ordenar imágenes (drag & drop)
- [ ] Eliminar/reemplazar imágenes
- [ ] Marcar imagen principal por variante

#### 3. Precios por Variante
- [ ] Precio de lista por variante
- [ ] Precio de venta por variante
- [ ] Descuento por variante
- [ ] Costo (para cálculo de margen) - oculto para clientes

#### 4. Stock por Variante
- [ ] Stock disponible por cada variante
- [ ] Alerta de stock bajo por variante
- [ ] Reserva de stock (cuando está en carrito)
- [ ] Histórico de movimientos por variante

#### 5. SKU por Variante
- [ ] Generación automática de SKU: `PRODUCTO-COLOR-TAMAÑO`
- [ ] Ej: `SOFA-NOR-RJO-3C` (Sofá Nórdico Rojo 3 Cuerpos)
- [ ] Permitir edición manual de SKU

---

## 🟠 MUY IMPORTANTE: Categorización

### Estado Actual
- Categoría: Texto libre
- Subcategoría: No existe en formulario
- Room: Texto libre

### Lo que falta

#### 1. Árbol de Categorías
```
Muebles (root)
├── Living
│   ├── Sofás
│   ├── Sillones
│   ├── Mesas de centro
│   └── Estanterías
├── Dormitorio
│   ├── Camas
│   ├── Mesas de luz
│   └── Cómodas
└── Comedor
    ├── Mesas
    └── Sillas
```

- [ ] Selector jerárquico de categorías
- [ ] Crear/editar categorías desde admin
- [ ] Iconos por categoría
- [ ] Orden de categorías

#### 2. Filtros y Atributos
- [ ] Definir atributos por categoría
  - Sofás: Material, Cantidad de cuerpos, Tipo de tela
  - Mesas: Material, Forma (redonda/cuadrada), Extensible (sí/no)
  - Camas: Tamaño (1pl/2pl/Queen/King), Con cajones (sí/no)
- [ ] Filtros dinámicos en PLP según atributos

#### 3. Tags/Labels
- [ ] Tags libres: "Nuevo", "Más vendido", "Edición limitada"
- [ ] Tags automáticos: "En oferta" (cuando hay descuento)
- [ ] Filtrar por tags

---

## 🟡 IMPORTANTE: SEO y Metadatos

### Estado Actual
- No hay campos de SEO en el formulario de producto

### Lo que falta

#### 1. SEO por Producto
- [ ] Meta título personalizado (con preview de cómo se ve en Google)
- [ ] Meta descripción (con contador de caracteres)
- [ ] URL slug editable
- [ ] Keywords/tags SEO
- [ ] Canonical URL

#### 2. Open Graph (Redes Sociales)
- [ ] Título para compartir
- [ ] Descripción para compartir
- [ ] Imagen OG específica (si no, usar imagen principal)

#### 3. Sitemap y Robots
- [ ] Sitemap.xml dinámico
- [ ] Control de indexación por producto
- [ ] URLs alternativas (si hay versiones de idioma)

---

## 🟠 MUY IMPORTANTE: Multimedia

### Estado Actual
- Campo de URL de imagen (texto)
- Campo AR (texto)

### Lo que falta

#### 1. Gestión de Imágenes Mejorada
- [ ] Upload directo a Cloudinary/S3 (no pegar URLs)
- [ ] Compresión automática de imágenes
- [ ] Generación de thumbnails
- [ ] WebP automático
- [ ] Lazy loading en frontend
- [ ] Galería con zoom en PDP

#### 2. Modelos 3D/AR
- [ ] Upload de archivos .glb y .usd
- [ ] Preview del modelo 3D antes de guardar
- [ ] Validación de escala del modelo
- [ ] Editor de escala (si el modelo viene mal dimensionado)
- [ ] Posición por defecto del modelo

#### 3. Videos
- [ ] Upload de videos de producto
- [ ] Embed de YouTube/Vimeo
- [ ] Video como thumbnail principal (autoplay mute)

---

## 🟡 IMPORTANTE: Precios y Promociones

### Estado Actual
- Un solo campo "Precio"

### Lo que falta

#### 1. Estructura de Precios Completa
- [ ] Precio de costo (para margen)
- [ ] Precio de lista (tachado en oferta)
- [ ] Precio de venta
- [ ] Precio por mayor (cantidad > X)

#### 2. Promociones
- [ ] Descuento por porcentaje o monto fijo
- [ ] Fechas de vigencia de promoción
- [ ] Código de cupón
- [ ] Descuento por cantidad (2x1, 3 cuotas sin interés)

#### 3. Financiación
- [ ] Cuotas sin interés (configurable)
- [ ] Texto de financiación: "3 cuotas de $XX.XXX"

---

## 🟡 IMPORTANTE: Inventario Avanzado

### Estado Actual
- Campo "Stock" numérico simple

### Lo que falta

#### 1. Gestión de Stock
- [ ] Stock por depósito/sucursal
- [ ] Stock mínimo (alerta de reorden)
- [ ] Stock reservado (en carritos)
- [ ] Stock en tránsito
- [ ] Histórico de movimientos

#### 2. Logística
- [ ] Peso y dimensiones para cálculo de envío
- [ ] Costo de envío estimado
- [ ] Zonas de envío disponibles
- [ ] Tiempo estimado de entrega

---

## 🟢 OPCIONAL: Features Avanzados

### 1. Productos Relacionados
- [ ] Upsells (productos más caros/mejores)
- [ ] Cross-sells (complementos)
- [ ] Relacionados automáticos (misma categoría)
- [ ] Bundle de productos (comprar juntos con descuento)

### 2. Personalización
- [ ] Campos personalizados por cliente (ej: grabado de nombre)
- [ ] Opciones con costo adicional
- [ ] Preview de personalización

### 3. Suscripciones
- [ ] Productos con reposición automática
- [ ] Descuento por suscripción

### 4. Import/Export Avanzado
- [ ] Importar desde Excel con variantes
- [ ] Exportar catálogo completo
- [ ] Sincronización con ERP

---

## 📊 TABLA DE PRIORIDADES

| Funcionalidad | Impacto Ventas | Esfuerzo Dev | Prioridad |
|---------------|----------------|--------------|-----------|
| Gestión de Variantes | 🔴 Alto | Medio | **P0 - CRÍTICO** |
| Galería por Variante | 🔴 Alto | Medio | **P0 - CRÍTICO** |
| Selector de Color Visual | 🟡 Medio | Bajo | **P1 - Alto** |
| Categorías Jerárquicas | 🟡 Medio | Medio | **P1 - Alto** |
| SEO por Producto | 🟡 Medio | Bajo | **P1 - Alto** |
| Upload de Imágenes | 🟡 Medio | Medio | **P1 - Alto** |
| Stock por Variante | 🟡 Medio | Medio | **P1 - Alto** |
| Precios por Variante | 🟡 Medio | Bajo | **P1 - Alto** |
| Promociones | 🟢 Bajo | Alto | **P2 - Medio** |
| Inventario Multi-depósito | 🟢 Bajo | Alto | **P2 - Medio** |
| Productos Relacionados | 🟢 Bajo | Bajo | **P2 - Medio** |

---

## 💰 ESTIMADO DE DESARROLLO

### MVP Comercial (P0 + P1): 4-6 semanas
- Gestión de variantes completa
- Galería por variante
- Categorías jerárquicas
- SEO básico
- Upload de imágenes

### Producto Completo: 2-3 meses
- Todo lo anterior
- Promociones avanzadas
- Inventario multi-depósito
- Import/Export
- Integraciones

---

## 🎯 RECOMENDACIÓN ESTRATÉGICA

**No intentes implementar todo de una.** 

El orden recomendado es:

1. **Semana 1-2**: Variantes básicas (color + imágenes por variante)
2. **Semana 3**: Categorías jerárquicas
3. **Semana 4**: SEO y mejoras de UX
4. **Luego**: Promociones y features avanzadas

¿Por dónde querés empezar?
