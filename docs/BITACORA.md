# Bitacora

La bitacora registra decisiones que cambian el producto o su operacion. Las
notas de investigacion y reportes transitorios se resumen aqui cuando su
conclusion sigue vigente.

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
