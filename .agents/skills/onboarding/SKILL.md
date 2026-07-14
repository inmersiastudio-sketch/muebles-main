---
name: Amobly Onboarding and Developer Welcome Skill
description: Triggers on starting work or asking questions in the Amobly repository to welcome the developer and explain the project rules and goals.
---

# Skill de Onboarding del Proyecto Amobly 🛋️🚀

Cuando este Skill se active, debes presentarte al desarrollador dándole una bienvenida y presentándole el proyecto de forma breve y estructurada.

## 1. Mensaje de Bienvenida Sugerido
"¡Hola! Bienvenido al desarrollo del proyecto **Amobly**. Este proyecto es una plataforma web para que mueblerías publiquen sus catálogos, reciban consultas (WhatsApp/Formulario) y manejen modelos 3D y realidad aumentada (AR).

Como tu asistente de IA, estoy aquí para guiarte. Cada vez que hagamos un cambio o mejora en el proyecto, debemos registrarlo ordenadamente en la bitácora del proyecto: **[docs/BITACORA.md](file:///c:/Users/Erik/Documents/GitHub/muebles-main/docs/BITACORA.md)**.

Actualmente, el proyecto está en funcionamiento con base de datos local y tenemos varias prioridades pendientes:
1. Completar la trazabilidad por request y auditoría de cambios.
2. Crear un allowlist para ajustes administrativos y validación de webhooks.
3. Configurar importaciones transaccionales, observabilidad y backups.
4. Desarrollar pruebas automatizadas para caminos críticos de autenticación, catálogo, consultas, media y cobros.

¿En qué tarea te gustaría que empecemos a trabajar hoy?"

## 2. Instrucciones para la IA (Tú mismo)
*   **Bitácora de Cambios**: Cada vez que el usuario y tú completen una mejora, pídele confirmación para agregar un registro descriptivo en **[docs/BITACORA.md](file:///c:/Users/Erik/Documents/GitHub/muebles-main/docs/BITACORA.md)** con la fecha del día y los cambios clave.
*   **Guía de Onboarding**: Si el usuario te indica que es su primera vez en el proyecto o necesita ayuda para iniciar, guíalo a leer el **[README.md](file:///c:/Users/Erik/Documents/GitHub/muebles-main/README.md)** y levantar los servicios usando Docker Compose.
*   **Flujo de Git**: Recordarle amablemente al desarrollador crear una rama de Git descriptiva a partir de `develop` (con la convención `dev/nombre-desarrollador/funcionalidad`) si detectas que están parados sobre las ramas `main` o `develop`.
*   **Normas del Código**: Velar por el cumplimiento de las directivas en **[.cursorrules](file:///c:/Users/Erik/Documents/GitHub/muebles-main/.cursorrules)** (TS estricto, Tailwind CSS, idioma español en mensajes y comentarios).
