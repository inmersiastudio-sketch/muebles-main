# Producto

## Proposito

Amobly ayuda a mueblerias a mostrar su catalogo y convertir interes en una
consulta ordenada. El producto no intenta reemplazar su venta asistida: la
consulta por WhatsApp o formulario es el cierre comercial actual.

## Alcance activo

### Catalogo publico

- Listado de productos y mueblerias.
- Busqueda y filtros.
- Ficha de producto con medios, datos y una sola llamada principal a consulta.
- Contacto por WhatsApp cuando la tienda lo configura; formulario como
  alternativa.

### Panel de muebleria

- Registro, verificacion de correo, login y recuperacion de contrasena.
- Gestion de catalogo, medios y disponibilidad.
- Cola de consultas y seguimiento operativo.
- Estadisticas y ajustes segun el rol autorizado.

## Fuera de alcance actual

- Carrito de compras, checkout y pedidos como flujo comercial principal.
- Publicar una vista 3D generada desde una sola foto como referencia de medida
  o como AR.
- Automatizar stock, descuentos o ventas hasta que variantes, atributos y
  taxonomia esten completos.

## Futuros

- Modo lupa al pasar el mouse sobre la imagen principal del producto para
  ampliar detalles sin abrir un modal.

## Modelos 3D

Hay dos resultados que deben mantenerse separados:

| Resultado | Entrada | Uso permitido |
| --- | --- | --- |
| Modelo 3D verificado | Captura guiada de varias fotos y medidas declaradas | Visor, AR y referencia dimensional tras QA. |
| Vista 3D generada | Una foto o pocas fotos con IA | Presentacion ilustrativa; sin AR ni promesa de escala. |

Para un modelo verificado se recomienda una vuelta completa de 24 a 40 fotos,
con iluminacion uniforme, fondo simple y alto/ancho/profundidad declarados. El
GLB se debe comparar contra esas medidas, validar UV, materiales y texturas, y
pasar control de peso antes de habilitar AR. Nunca se debe deformar en forma no
uniforme para forzar las dimensiones.

La base actual ya tiene carga, generacion y visor, pero antes de abrir el flujo
a mueblerias faltan: unificar ProductMedia para carga manual y generada, usar
todas las vistas, procesar los trabajos en una cola, validar escala contra el
producto y corregir formatos/texturas de salida.

Si se comercializan creditos 3D, deben ser un servicio B2B con precio,
acreditacion y webhook validados por el servidor. No se fijan precios ni planes
en esta documentacion.

Fuentes para la evaluacion tecnica: [KIRI](https://docs.kiriengine.app/photo-scan/image-upload),
[Meshy](https://docs.meshy.ai/en/api/image-to-3d),
[Tripo](https://developers.tripo3d.ai/en/docs/quick-start) y
[Khronos glTF Asset Auditor](https://www.khronos.org/gltf/gltf-asset-auditor/).

## Prioridades

1. Mantener catalogo, consulta y panel confiables con datos reales.
2. Completar variantes, taxonomia y atributos del editor de producto.
3. Completar el ciclo de cuenta con una experiencia visual coherente.
4. Resolver el contrato de medios y el QA antes de ampliar 3D/AR.
5. Mejorar trazabilidad, auditoria, importaciones transaccionales, observabilidad
   y pruebas criticas del backend.
