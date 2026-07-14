# Portal de Rendición de Cuentas — San Pedro V3

Versión estática avanzada para publicar en GitHub Pages.

## Credenciales administrativas de demostración

- Usuario: `admin`
- Contraseña: `SanPedro2026*`

Estas credenciales están incluidas únicamente para probar el diseño. Al tratarse de una página estática, **no proporcionan seguridad real**.

## Funciones incluidas

- Identidad visual de San Pedro con los tres logos suministrados.
- Tres temas configurables:
  - Municipal.
  - San Pedro vivo.
  - Institucional morado.
- Cambio de colores mediante selectores.
- Cambio de fuente, escala general y redondeado.
- Visibilidad y reordenamiento de módulos.
- Creación y eliminación de módulos personalizados.
- Creación de vigencias futuras.
- Registro de recursos.
- Repositorio por formatos con ventanas emergentes.
- Laboratorio de Ideas Ciudadanas.
- Estados de ideas:
  - Recibida.
  - En análisis.
  - Se tendrá en cuenta.
  - Resuelta.
- Respuesta institucional administrable.
- Apoyo ciudadano a propuestas.
- Seguimiento de compromisos.
- Buscador general.
- Accesibilidad.
- Respaldo JSON.
- Diseño responsive.

## Publicación en GitHub Pages

Suba a la raíz del repositorio:

- `index.html`
- `styles.css`
- `app.js`
- `README.md`
- `FIREBASE_FUTURE.md`
- la carpeta `assets`

Configure GitHub Pages:

`Settings → Pages → Deploy from a branch → main → / (root)`

## Limitación de la versión estática

Todos los cambios administrativos se guardan en `localStorage`.

Por tanto:

- Permanecen en el navegador donde se realizaron.
- No se comparten con otros visitantes.
- No modifican los archivos del repositorio.
- Pueden borrarse al limpiar los datos del navegador.
- El inicio de sesión puede inspeccionarse desde el código fuente.

La siguiente fase debe reemplazar esta administración local por Firebase.
