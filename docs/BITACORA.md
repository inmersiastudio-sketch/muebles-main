# Bitacora

La bitacora registra decisiones que cambian el producto o su operacion. Las
notas de investigacion y reportes transitorios se resumen aqui cuando su
conclusion sigue vigente.

## 2026-07-17 - Bienvenida 3D y busqueda de sillones

- La portada incorpora un selector compacto `3D / Imagen` junto al mensaje de
  bienvenida. Por defecto muestra un modelo manipulable, sin convertir la
  home en una ficha de producto ni habilitar AR de escala no verificada.
- Se genero una referencia original de una butaca bouclé sin logos, texto ni
  marcas, sobre fondo blanco uniforme. El archivo fuente se versiona dentro
  del proyecto para permitir futuros cambios de color o recorte de fondo.
- Meshy genero una nueva version del modelo desde esa referencia y el backend
  la comprimio, reescala y asocio a `Butaca Aura Bouclé`. La salida GLB es
  valida y mide aproximadamente 95 x 85 x 86 cm; se conserva
  `arVerified=false` hasta una validacion de dimensiones fisicas reales.
- Se retiraron del bucket los modelos previos que contenian geometria derivada
  de una referencia comercial y que ya no estaban asociados al producto.
- Las tarjetas publicas dejaron de mostrar cuotas fijas. El filtro 3D/AR
  reinicia correctamente el rango de precios y el slider controla rangos
  vacios, iguales o fuera de limite sin deformar el catalogo.
- La busqueda visual incluye `Sillones`. El filtro y el texto `sillon/sillón`
  encuentran productos por categoria, nombre, descripcion o etiquetas,
  independientemente de la tilde.

## 2026-07-17 - Catalogo piloto integral para pruebas del MVP

- Se incorporo una semilla independiente, idempotente y no destructiva que
  crea o actualiza `Estudio Nativo - Piloto Amobly` y el producto completo
  `Sofa Nativo Boucle - 3 cuerpos`, sin limpiar tiendas ni productos reales.
- El piloto incluye ficha comercial, imagen coherente, materiales, garantia,
  logistica, financiacion, variante, inventario, medidas fisicas y medidas de
  embalaje. Las URLs publicas se parametrizan con `SITE_URL` y `API_BASE_URL`.
- El sofa utiliza un GLB procedural deterministico servido por la API, por lo
  que no consume creditos ni depende de Meshy, Tripo o almacenamiento externo.
  Su bounding box fue verificado en 2,00 x 0,90 x 0,80 metros.
- El embalaje declarado mide 2,05 x 0,95 x 0,85 metros y reutiliza el generador
  de cajas AR. Esto permite probar en dispositivos reales tanto el mueble a
  escala fija como el paso del bulto por puertas, ventanas y ascensores.
- El comando `npm run db:seed:pilot` puede ejecutarse en local o produccion.
  El acceso del propietario solo se habilita si se proporciona
  `PILOT_STORE_PASSWORD`; telefono, WhatsApp e imagen tambien son configurables.
- La semilla paso la comprobacion aislada de TypeScript y el backend completo
  compila con Prisma. No se ejecuto automaticamente contra una base existente
  para evitar seleccionar por error un entorno de datos incorrecto.

## 2026-07-17 - Comprobacion de embalaje en 3D y AR

- El editor de productos permite indicar explicitamente si el mueble se
  entrega en caja y registrar ancho, alto, profundidad, peso y cantidad de
  bultos. Las tres medidas son obligatorias cuando se activa el embalaje y se
  pueden retirar correctamente al desactivar la opcion.
- El backend genera bajo demanda un GLB liviano y deterministico con forma de
  caja, construido directamente en metros, centrado en X/Z y apoyado sobre
  Y=0. El endpoint publico solo responde para productos y tiendas activos con
  dimensiones completas.
- Las dos fichas publicas ofrecen `Comprobar embalaje en AR`, con QR propio,
  escala fija y una advertencia para considerar marcos, curvas, ascensores y
  espacio de maniobra. No se usan IA, USDZ persistente ni almacenamiento
  adicional para esta geometria.
- La prueba automatizada aislada genero una caja de 120 x 80 x 45 cm en un GLB
  de aproximadamente 1,7 KB y verifico un bounding box de 1,20 x 0,80 x 0,45
  metros. Backend y frontend compilan sin errores.
- La primera version representa varios bultos como cajas de igual tamano. Para
  embalajes diferentes queda pendiente modelar una lista de bultos con medidas
  independientes.

## 2026-07-17 - Auditoria transversal de catalogo, consultas y AR

- Los filtros de productos con modelo 3D o AR quedaron disponibles en el
  catalogo general, la busqueda y el catalogo de cada muebleria, conservando
  su estado en la URL cuando corresponde. Tambien se corrigieron los ordenes
  por precio y nombre y la comparacion de categorias, ambientes y estilos.
- Las rutas publicas ya no publican tiendas, productos ni relacionados
  inactivos. El perfil de muebleria devuelve productos normalizados para las
  tarjetas del catalogo.
- Las consultas funcionan como formulario aun cuando la tienda no tiene
  WhatsApp. El estado de envio gratis se conserva al editar y las alertas de
  stock respetan el umbral configurado por producto.
- El inventario carga el catalogo completo de la tienda para que la paginacion
  y los enlaces `?edit=` puedan localizar cualquier producto. Se corrigio
  tambien el alcance de Super Administrador y la propagacion de SKU y estado
  destacado durante la creacion.
- La validacion de escala recibe solo `productId`, comprueba permisos y usa el
  GLB registrado desde almacenamiento autorizado, con limites de descarga.
- Los visores 3D dejaron de utilizar el USDZ original o de inventar una URL
  USDZ desde el GLB. Solo los modelos con `arVerified=true` habilitan QR,
  Quick Look, Scene Viewer o medicion AR, siempre con `ar-scale="fixed"`.
- Backend y frontend compilan sin errores. Siguen pendientes la paginacion
  publica completamente server-side, reemplazar el formulario de contacto
  simulado, ampliar pruebas automatizadas y validar AR en dispositivos reales.

## 2026-07-16 - Escala fisica y experiencia AR unificada

- Los modelos GLB generados pueden reescalarse de forma uniforme contra las
  dimensiones declaradas, centrarse en X/Z y apoyarse sobre Y=0 sin acumular
  nodos de escala entre ejecuciones.
- La generacion 3D y el panel de inventario registran si el resultado cumple
  la tolerancia dimensional. Un resultado no verificado se presenta como vista
  orientativa y no promete escala real.
- El reescalado administrativo valida propiedad de tienda, formato GLB, origen
  de almacenamiento, tiempo y tamano de descarga. Cada salida usa una URL
  versionada; si falla la actualizacion de base se elimina el archivo nuevo y
  se conserva la version anterior para rollback.
- Los accesos AR y codigos QR convergen en la landing `/ar`. Android usa WebXR
  o Scene Viewer e iOS genera Quick Look desde el GLB vigente, sin depender del
  USDZ original sin escalar del proveedor.
- Los fixtures cubren centrado, tolerancias, jerarquias rotadas, idempotencia y
  documentos invalidos. Backend y frontend compilan; antes de publicar queda
  pendiente validar escala, materiales y activacion AR en dispositivos iPhone
  y Android reales.

## 2026-07-14 - Limpieza documental

- Se retiraron auditorias, planes, guias de despliegue y notas de
  implementacion que repetian o contradician el estado actual.
- La documentacion canonica queda reducida a README, Operacion, Producto y esta
  bitacora, con readmes breves junto al backend y frontend.
- Las futuras decisiones deben actualizar estos documentos; no se deben crear
  reportes fechados en la raiz salvo que haya una necesidad puntual y temporal.

## 2026-07-14 - Operacion y experiencia

- El modelo comercial activo es catalogo mas consulta. El carrito y checkout
  dejaron de formar parte del desarrollo.
- El panel se reorganizo alrededor de operacion diaria, catalogo y consultas.
  Las rutas sin una funcion real no se exponen como modulos operativos.
- Login y registro comparten una estructura visual sobria. Se preservaron
  cookies, verificacion de correo, validaciones y redireccionamientos.
- PostgreSQL debe estar disponible para que el registro de una muebleria se
  complete; una ausencia local de base no es un error del formulario.

## 2026-07-14 - Criterio para 3D

- Una imagen unica puede generar una vista atractiva, pero no valida geometria,
  textura ni dimensiones fisicas.
- Solo los modelos capturados con varias fotos, medidas y control de calidad
  pueden llegar a AR como Modelo 3D verificado.
- Las salidas IA de una foto se muestran, si se habilitan, como Vista 3D
  generada y no como referencia de tamano.

## 2026-07-14 - Verificacion de email

- Se detecto que RESEND_API_KEY no estaba configurada. El backend anterior
  registraba esa ausencia en logs y respondia como si el email se hubiera
  enviado, por lo que ninguna cuenta podia completar la verificacion.
- Registro, reenvio y recuperacion ahora responden de forma clara cuando el
  proveedor de correo no esta disponible. Las nuevas altas se bloquean antes de
  crear una cuenta sin posibilidad de verificar.
- Para habilitar correo real se necesita una clave de Resend y un EMAIL_FROM
  sobre un dominio verificado. El backend debe reiniciarse despues de cargar
  ambas variables.

## Pendientes tecnicos que siguen vigentes

- Trazabilidad por request y auditoria de cambios sensibles, incluidos
  creditos 3D.
- Allowlist para ajustes administrativos y webhooks validados.
- Importaciones transaccionales, observabilidad, backups con restauracion
  probada y una forma de error consistente.
- Pruebas automatizadas para los caminos criticos de autenticacion, catalogo,
  consultas, media y cobros.
