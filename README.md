# Portal Histórico de Rendición de Cuentas — Versión 2

Landing page estática, responsive y preparada para GitHub Pages.

## Principales mejoras

- Tipografía Century Gothic y alternativas compatibles.
- Diseño editorial tipo periódico digital.
- Portada animada.
- Ventana de bienvenida.
- Buscador general con resultados.
- Pop-ups de vigencias, indicadores, historias y recursos.
- Comparador entre dos vigencias.
- Creación de nuevas vigencias.
- Registro de nuevos recursos documentales.
- Filtros por año, formato, estado y palabra clave.
- Seguimiento de compromisos.
- Preguntas frecuentes.
- Herramientas de accesibilidad.
- Exportación de configuración en JSON.
- Diseño adaptable a celulares, tabletas y computadores.

## Publicación en GitHub Pages

Suba a la raíz del repositorio:

- `index.html`
- `styles.css`
- `script.js`
- `README.md`

Después configure:

`Settings → Pages → Deploy from a branch → main → / (root)`

## Importante sobre la administración

GitHub Pages publica archivos estáticos. En esta versión:

- Las vigencias y recursos creados desde “Gestionar portal” se guardan mediante `localStorage`.
- Los cambios solo aparecen en el navegador donde fueron realizados.
- No modifican automáticamente los archivos del repositorio.
- No son visibles para otros usuarios.

Para convertir el portal en un sistema administrable real y multiusuario, debe conectarse a una base de datos como Supabase. La estructura recomendada incluye:

- `rendicion_years`
- `rendicion_resources`
- `rendicion_news`
- `rendicion_commitments`
- `rendicion_questions`
- `rendicion_settings`

También se recomienda autenticación y roles:

- `super_admin`
- `admin`
- `editor`
- `visitor`

## Personalización pendiente

- Reemplazar el nombre genérico de la entidad.
- Agregar logo oficial.
- Actualizar datos de contacto.
- Cargar cifras reales.
- Reemplazar enlaces `#` por documentos reales.
- Conectar formularios y panel administrativo.
