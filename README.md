# Portal de Rendición de Cuentas San Pedro — V4 Multipágina

## Concepto visual

La portada toma como referencia la organización de portales modernos de turismo:

- Hero amplio y visual.
- Buscador superpuesto.
- Tarjetas de navegación con imágenes ilustradas.
- Bloques de destacados.
- Franja de confianza.
- Testimonios / propuestas ciudadanas.
- Newsletter.
- Footer compacto.

Se combina con un tratamiento editorial tipo periódico digital mediante:

- Rótulos de edición.
- Historias destacadas.
- Portadas por vigencia.
- Indicadores explicados.
- Documentos vinculados a la narrativa.

## Arquitectura de navegación

La información ya no se acumula en una sola página.

- `index.html`: portada general.
- `vigencias.html`: archivo histórico.
- `rendicion-2025.html`: edición exclusiva 2025.
- `rendicion-2026.html`: edición exclusiva 2026.
- `rendicion-2027.html`: edición exclusiva 2027.
- `rendicion.html?year=2028`: plantilla dinámica para vigencias futuras creadas localmente.
- `recursos.html`: biblioteca general.
- `ideas.html`: Laboratorio de Ideas Ciudadanas.

## Administración demostrativa

Usuario: `admin`

Contraseña: `SanPedro2026*`

Funciones:

- Elegir tema visual.
- Cambiar colores.
- Ajustar escala y redondeado.
- Crear vigencias futuras.
- Agregar y eliminar recursos.
- Gestionar estado y respuesta de ideas.
- Exportar respaldo JSON.
- Restablecer demostración.

## Limitación estática

La administración utiliza `localStorage`.

- Los cambios solo aparecen en el navegador donde se realizan.
- No son visibles para todos los visitantes.
- No modifican automáticamente GitHub.
- Las vigencias futuras utilizan `rendicion.html?year=AÑO`.

La fase con Firebase debe implementar autenticación real, Firestore y Storage.

## GitHub Pages

Suba todos los archivos y la carpeta `assets` a la raíz del repositorio.

Después:

`Settings → Pages → Deploy from a branch → main → / (root)`


## Mejoras V5

- Encabezado completo fijo durante el desplazamiento.
- Logo multicolor suministrado por el usuario al lado del nombre del portal.
- Alineación y alturas uniformes en tarjetas, botones y formularios.
- Eliminación de giros y movimientos que generaban apariencia desordenada.
- Animaciones cortas y fluidas.
- Mejoras responsive para computadores, tabletas y celulares.
- Enlace para saltar directamente al contenido.
- Texto alternativo descriptivo en imágenes institucionales.
- Controles con nombres accesibles y estados ARIA.
- Narrador de texto con:
  - lectura de página completa;
  - lectura por secciones;
  - control de velocidad;
  - pausa, continuación y detención;
  - preferencia por voces en español de Colombia.
- Respeto por la configuración de movimiento reducido del dispositivo.


## Narrador V5.2 — Español latino

El narrador ahora:

- prioriza `es-CO` para Colombia;
- después busca México, español latino de Estados Unidos, Argentina, Chile, Perú y otras regiones latinoamericanas;
- permite elegir manualmente la voz;
- recuerda la voz elegida en el navegador;
- deja el español de España únicamente como alternativa cuando el dispositivo no ofrece voces latinoamericanas.

La disponibilidad y calidad concreta de las voces depende del navegador y de las voces instaladas en el dispositivo.
