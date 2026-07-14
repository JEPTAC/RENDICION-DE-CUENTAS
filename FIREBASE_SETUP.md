# Activación de Firebase — Rendición de Cuentas V7

## 1. Reemplazar y agregar archivos

Suba todos los archivos de este paquete a la raíz del repositorio de GitHub.

## 2. Activar Authentication

En Firebase Console:

1. Authentication.
2. Sign-in method.
3. Active **Correo electrónico/contraseña**.
4. Opcional: active **Google**.
5. En Settings → Authorized domains agregue el dominio de GitHub Pages.

## 3. Crear el primer administrador

1. Authentication → Users → Add user.
2. Copie el UID del usuario creado.
3. Firestore Database → Data.
4. Cree la colección `users`.
5. Cree un documento cuyo ID sea exactamente el UID.
6. Agregue los campos:

```json
{
  "displayName": "Administrador principal",
  "email": "correo-del-administrador",
  "role": "super_admin",
  "active": true
}
```

## 4. Publicar reglas

Reemplace las reglas actuales de Firestore por el contenido de `firestore.rules`.

En Storage, publique el contenido de `storage.rules`.

También puede desplegarlas con Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use rendicion-de-cuentas-6aceb
firebase deploy --only firestore:rules,storage
```

## 5. Cargar la información inicial

1. Abra el portal publicado.
2. Inicie sesión con el usuario Firebase autorizado.
3. Active la edición directa.
4. Pulse el botón **Firebase** de la barra administrativa.
5. Confirme el mensaje de sincronización.

Esto crea `portal/main`, `ideas/*` y `auditLogs/*`.

## Estructura inicial

- `portal/main`: vigencias, recursos, dashboards, compromisos, solicitudes, apariencia y contenido.
- `ideas/{ideaId}`: ideas ciudadanas.
- `users/{uid}`: roles y estado de usuarios.
- `auditLogs/{id}`: registro de sincronizaciones administrativas.
- Storage `public/images/`: banners, logos e imágenes.
- Storage `public/documents/`: PDF, hojas de cálculo, presentaciones y evidencias.

## Nota de seguridad

La configuración pública de Firebase identifica el proyecto, pero no concede permisos por sí sola. El control real está en Authentication y Security Rules. No publique contraseñas ni cuentas administrativas dentro del código.
