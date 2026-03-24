# Estructura de Base de Datos en Notion

Sigue estos pasos para configurar tus bases de datos en Notion y conectar tu portafolio.

---

## 1. Obtener el Token de Integración de Notion
1. Ve a [Notion Developer Integrations](https://www.notion.so/my-integrations).
2. Crea una **New integration**.
3. Ponle un nombre (ej. "Portfolio API") y asóciala a tu Workspace.
4. **Copia el "Internal Integration Secret"**. Este será tu `NOTION_TOKEN`.

---

## 2. Base de Datos: Proyectos (Projects)
Crea una nueva base de datos **Full page** (tabla) en Notion. *¡Importante! Debes darle clic en los 3 puntitos de arriba a la derecha en la base de datos, ir a "Connections" y "Connect to" / tu integración "Portfolio API".*

Luego copia el ID de la base de datos desde la URL:
`https://www.notion.so/myworkspace/{NOTION_PROJECTS_DB_ID}?v=...`

Crea las siguientes propiedades (columnas) con exactamente este nombre y tipo:
- **Title**: *Tipo: Title (A)* (Es la columna por defecto que viene, úsala para el nombre del proyecto como "Proyecto DUCAP")
- **Description**: *Tipo: Text / Rich text* (Para la descripción que aparecerá en la carta del proyecto)
- **Link**: *Tipo: URL* (El enlace externo de la página productiva del proyecto)
- **GitHub**: *Tipo: URL* (El enlace al repositorio del código, si lo tienes)
- **Image**: *Tipo: Files & media* (Sube aquí un screenshot o imagen del proyecto para que se vea dentro de la computadora)

---

## 3. Base de Datos: Contacto (Contact)
Crea otra base de datos **Full page** (tabla) para los mensajes de contacto. Al igual que con proyectos, **recuerda conectarla a tu integración** en los ajustes superiores de Notion.

Extrae el ID de la URL y ese será tu `NOTION_CONTACT_DB_ID`.

Asegúrate de configurar las siguientes columnas:
- **Name**: *Tipo: Title (A)* (Nombre de la persona)
- **Email**: *Tipo: Email* (Correo de la persona)
- **Subject**: *Tipo: Text / Rich text* (Asunto del mensaje)
- **Message**: *Tipo: Text / Rich text* (Cuerpo del mensaje)
- **Date**: *Tipo: Date* (Fecha en la que te contactaron)

---

## 4. Configurar tu Vercel y tu Ambiente Local
Pega todos estos tokens dentro de tu archivo `.env.local` en tu máquina, o como Environment Variables en tu proyecto de Vercel para que todo funcione de manera autónoma.

Archivo `.env.local` (crea este archivo en la raíz de tu proyecto):
```env
NOTION_TOKEN="secret_tUtokenaQui..."
NOTION_PROJECTS_DB_ID="tuIDdeBDaca"
NOTION_CONTACT_DB_ID="tuOtroIDdeBDaca"
```
