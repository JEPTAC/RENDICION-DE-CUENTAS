(() => {
  const FIREBASE_VERSION = "12.15.0";
  const firebaseConfig = {
    apiKey: "AIzaSyD02YaIMxLO2IPAJYZdPY2cWUvpkZDRo2U",
    authDomain: "rendicion-de-cuentas-6aceb.firebaseapp.com",
    projectId: "rendicion-de-cuentas-6aceb",
    storageBucket: "rendicion-de-cuentas-6aceb.firebasestorage.app",
    messagingSenderId: "509564686428",
    appId: "1:509564686428:web:4e1257b5305dd8b4c51699",
    measurementId: "G-BQ6DLM4ENY"
  };

  const runtime = {
    initialized:false,
    ready:false,
    connected:navigator.onLine,
    user:null,
    profile:null,
    profileSource:"",
    profileError:null,
    role:null,
    canWrite:false,
    isSuperAdmin:false,
    syncing:false,
    lastError:null,
    app:null,
    auth:null,
    db:null,
    modules:null,
    syncTimer:null,
    syncPending:false,
    ideasFingerprint:"",
    initPromise:null,
    authFirstReady:null
  };

  const EDITOR_ROLES = new Set(["super_admin","admin","editor"]);
  const emit = (name, detail = {}) => window.dispatchEvent(new CustomEvent(name, {detail}));
  const portal = () => window.Portal;

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  }

  function normalizeRole(value) {
    const role = normalizeText(value);
    const aliases = {
      superadmin:"super_admin",
      super_administrador:"super_admin",
      superadministrador:"super_admin",
      administrador_principal:"super_admin",
      super_admin:"super_admin",
      admin:"admin",
      administrador:"admin",
      editor:"editor",
      invitado:"guest",
      visitante:"guest",
      viewer:"guest",
      guest:"guest",
      usuario:"guest"
    };
    return aliases[role] || "guest";
  }

  function roleLabel(role) {
    return {
      super_admin:"Superadministrador",
      admin:"Administrador",
      editor:"Editor",
      guest:"Invitado"
    }[normalizeRole(role)] || "Invitado";
  }

  function friendlyError(error) {
    const code = error?.code || "";
    const messages = {
      "auth/invalid-credential":"Correo o contraseña incorrectos.",
      "auth/user-not-found":"No existe un usuario con ese correo.",
      "auth/wrong-password":"La contraseña no es correcta.",
      "auth/email-already-in-use":"Ya existe una cuenta con ese correo.",
      "auth/invalid-email":"El correo electrónico no es válido.",
      "auth/weak-password":"La contraseña debe tener al menos 8 caracteres.",
      "auth/too-many-requests":"Se realizaron demasiados intentos. Espere unos minutos.",
      "auth/network-request-failed":"No fue posible conectarse con Firebase.",
      "auth/popup-closed-by-user":"La ventana de acceso se cerró antes de completar el proceso.",
      "auth/unauthorized-domain":"Debe autorizar el dominio de GitHub Pages en Firebase Authentication.",
      "permission-denied":"Las reglas de Firestore no permiten esta operación. Publique las reglas incluidas en el paquete.",
      "failed-precondition":"Firestore todavía no se encuentra configurado correctamente.",
      "firebase/invalid-payload":"Los datos del portal contienen una estructura que Firestore no puede guardar.",
      "firebase/document-too-large":"El contenido supera el tamaño máximo permitido para un documento de Firestore.",
      "firebase/partial-sync":"El contenido principal se guardó, pero una colección secundaria no pudo sincronizarse.",
      "firebase/cdn-load-failed":"No fue posible cargar el SDK oficial de Firebase. Recargue sin caché y revise que la red permita www.gstatic.com."
    };
    return messages[code] || error?.message || "Ocurrió un error al comunicarse con Firebase.";
  }

  async function loadModules() {
    /*
     * Firebase documenta actualmente la distribución ESM de navegador
     * mediante el CDN de gstatic. Se mantienen URLs literales para que
     * GitHub Pages y el navegador resuelvan correctamente los módulos.
     */
    try {
      const [app, auth, firestore] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js")
      ]);
      return {app,auth,firestore};
    } catch (error) {
      const wrapped = new Error(
        "No fue posible cargar Firebase desde el CDN oficial. " +
        "Recargue la página sin caché y verifique que el navegador o la red no bloqueen gstatic.com."
      );
      wrapped.code = "firebase/cdn-load-failed";
      wrapped.cause = error;
      throw wrapped;
    }
  }

  function authDetail(extra = {}) {
    return {
      user:runtime.user,
      profile:runtime.profile,
      profileSource:runtime.profileSource,
      profileError:runtime.profileError ? friendlyError(runtime.profileError) : "",
      role:runtime.role,
      roleLabel:roleLabel(runtime.role),
      canWrite:runtime.canWrite,
      isSuperAdmin:runtime.isSuperAdmin,
      emailVerified:Boolean(runtime.user?.emailVerified),
      ...extra
    };
  }

  async function init() {
    if (runtime.ready) return runtime;
    if (runtime.initPromise) return runtime.initPromise;

    runtime.initialized = true;
    runtime.initPromise = (async () => {
      try {
        runtime.modules = await loadModules();
        runtime.app = runtime.modules.app.initializeApp(firebaseConfig);
        runtime.auth = runtime.modules.auth.getAuth(runtime.app);

        /*
         * Algunas redes, antivirus y proxies reinician los canales
         * WebChannel de Firestore. Se fuerza únicamente long polling.
         * No se combina con experimentalAutoDetectLongPolling.
         */
        runtime.db = runtime.modules.firestore.initializeFirestore(
          runtime.app,
          {
            experimentalForceLongPolling:true,
            experimentalLongPollingOptions:{
              timeoutSeconds:20
            },
            ignoreUndefinedProperties:true
          }
        );

        runtime.transport = "forced-long-polling";
        runtime.auth.languageCode = "es";

        await runtime.modules.auth.setPersistence(
          runtime.auth,
          runtime.modules.auth.browserLocalPersistence
        );

        runtime.authFirstReady = new Promise(resolve => {
          let first = true;
          runtime.modules.auth.onAuthStateChanged(
            runtime.auth,
            async user => {
              await handleAuthState(user, {reason:first ? "initial" : "change"});
              if (first) {
                first = false;
                resolve();
              }
            },
            error => {
              runtime.lastError = error;
              runtime.profileError = error;
              emit("firebase:auth", authDetail({reason:"observer_error"}));
              if (first) {
                first = false;
                resolve();
              }
            }
          );
        });

        await runtime.authFirstReady;
        await hydrateFromCloud();

        runtime.ready = true;
        emit("firebase:ready", {
          connected:runtime.connected,
          projectId:firebaseConfig.projectId
        });
      } catch (error) {
        runtime.lastError = error;
        runtime.ready = false;
        emit("firebase:ready", {
          connected:false,
          error:friendlyError(error)
        });
        console.warn("[Firebase] No fue posible inicializar.", error);
      }
      return runtime;
    })();

    return runtime.initPromise;
  }

  async function readProfile(user) {
    const {doc,getDoc} = runtime.modules.firestore;
    const uidReference = doc(runtime.db,"users",user.uid);
    const uidSnapshot = await getDoc(uidReference);

    if (uidSnapshot.exists()) {
      return {
        data:uidSnapshot.data(),
        docId:user.uid,
        source:"uid"
      };
    }

    if (user.email) {
      const emailReference = doc(runtime.db,"users",user.email);
      const emailSnapshot = await getDoc(emailReference);
      if (emailSnapshot.exists()) {
        return {
          data:emailSnapshot.data(),
          docId:user.email,
          source:"email_legacy"
        };
      }
    }

    return null;
  }

  function buildGuestProfile(user, values = {}) {
    return {
      uid:user.uid,
      displayName:String(values.displayName || user.displayName || "").slice(0,120),
      email:String(user.email || values.email || "").toLowerCase(),
      role:"guest",
      active:true,
      emailVerified:Boolean(user.emailVerified),
      phone:String(values.phone || "").slice(0,40),
      neighborhood:String(values.neighborhood || "").slice(0,120),
      createdAt:runtime.modules.firestore.serverTimestamp(),
      updatedAt:runtime.modules.firestore.serverTimestamp(),
      lastLoginAt:runtime.modules.firestore.serverTimestamp()
    };
  }

  async function createGuestProfile(user, values = {}) {
    const {doc,setDoc} = runtime.modules.firestore;
    const data = buildGuestProfile(user, values);
    await setDoc(doc(runtime.db,"users",user.uid),data,{merge:true});
    return {
      data:{...data, createdAt:null, updatedAt:null, lastLoginAt:null},
      docId:user.uid,
      source:"created_guest"
    };
  }

  async function migrateLegacyProfile(user, profile, normalizedRole) {
    const {doc,setDoc,serverTimestamp} = runtime.modules.firestore;
    const data = profile.data || {};
    const canonical = {
      ...data,
      uid:user.uid,
      email:String(user.email || data.email || "").toLowerCase(),
      displayName:data.displayName || data.name || data.nombre || user.displayName || "",
      role:normalizedRole,
      active:data.active !== false,
      emailVerified:Boolean(user.emailVerified),
      migratedFrom:profile.docId,
      migratedAt:serverTimestamp(),
      updatedAt:serverTimestamp(),
      lastLoginAt:serverTimestamp()
    };
    await setDoc(doc(runtime.db,"users",user.uid),canonical,{merge:true});
    return {
      data:canonical,
      docId:user.uid,
      source:"migrated_to_uid"
    };
  }

  async function handleAuthState(user, options = {}) {
    runtime.user = user || null;
    runtime.profile = null;
    runtime.profileSource = "";
    runtime.profileError = null;
    runtime.role = null;
    runtime.canWrite = false;
    runtime.isSuperAdmin = false;

    if (!user) {
      emit("firebase:auth", authDetail(options));
      return;
    }

    try {
      let profile = await readProfile(user);

      if (!profile) {
        profile = await createGuestProfile(user);
      }

      const rawRole =
        profile.data?.role
        ?? profile.data?.rol
        ?? profile.data?.tipoUsuario
        ?? profile.data?.userRole
        ?? "guest";

      const normalizedRole = normalizeRole(rawRole);

      if (
        profile.source === "email_legacy"
        || normalizeText(rawRole) !== normalizedRole
        || !profile.data?.uid
      ) {
        try {
          profile = await migrateLegacyProfile(user,profile,normalizedRole);
        } catch (migrationError) {
          console.warn("[Firebase] El perfil se leyó, pero no fue posible normalizarlo.",migrationError);
        }
      } else {
        const {doc,setDoc,serverTimestamp} = runtime.modules.firestore;
        await setDoc(
          doc(runtime.db,"users",user.uid),
          {
            emailVerified:Boolean(user.emailVerified),
            lastLoginAt:serverTimestamp(),
            updatedAt:serverTimestamp()
          },
          {merge:true}
        ).catch(() => {});
      }

      runtime.profile = {
        ...profile.data,
        uid:user.uid,
        docId:profile.docId,
        email:user.email || profile.data?.email || "",
        displayName:profile.data?.displayName || profile.data?.name || profile.data?.nombre || user.displayName || "",
        role:normalizedRole,
        active:profile.data?.active !== false
      };
      runtime.profileSource = profile.source;
      runtime.role = normalizedRole;
      runtime.canWrite = runtime.profile.active && EDITOR_ROLES.has(normalizedRole);
      runtime.isSuperAdmin = runtime.profile.active && normalizedRole === "super_admin";
    } catch (error) {
      runtime.lastError = error;
      runtime.profileError = error;
      console.warn("[Firebase] No fue posible leer el perfil del usuario.",error);
    }

    emit("firebase:auth", authDetail(options));
  }

  async function signInEmail(email,password) {
    if (!runtime.ready) await init();
    const credential = await runtime.modules.auth.signInWithEmailAndPassword(
      runtime.auth,
      String(email || "").trim(),
      String(password || "")
    );
    await handleAuthState(credential.user,{reason:"email_login"});
    return credential;
  }

  async function signInGoogle() {
    if (!runtime.ready) await init();
    const provider = new runtime.modules.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    const credential = await runtime.modules.auth.signInWithPopup(runtime.auth,provider);
    await handleAuthState(credential.user,{reason:"google_login"});
    return credential;
  }

  async function registerEmail(values = {}) {
    if (!runtime.ready) await init();

    const displayName = String(values.displayName || "").trim();
    const email = String(values.email || "").trim().toLowerCase();
    const password = String(values.password || "");

    if (displayName.length < 3) {
      throw new Error("Escriba su nombre completo.");
    }
    if (password.length < 8) {
      const error = new Error("La contraseña debe tener al menos 8 caracteres.");
      error.code = "auth/weak-password";
      throw error;
    }

    const credential = await runtime.modules.auth.createUserWithEmailAndPassword(
      runtime.auth,
      email,
      password
    );

    await runtime.modules.auth.updateProfile(credential.user,{displayName});
    await createGuestProfile(credential.user,{
      displayName,
      phone:values.phone || "",
      neighborhood:values.neighborhood || ""
    });

    try {
      await runtime.modules.auth.sendEmailVerification(credential.user);
    } catch (verificationError) {
      console.warn("[Firebase] La cuenta se creó, pero no se envió la verificación.",verificationError);
    }

    await credential.user.reload().catch(() => {});
    await handleAuthState(runtime.auth.currentUser || credential.user,{reason:"registration"});
    return credential;
  }

  async function resendVerification() {
    if (!runtime.auth?.currentUser) throw new Error("Debe iniciar sesión.");
    await runtime.modules.auth.sendEmailVerification(runtime.auth.currentUser);
  }

  async function sendPasswordReset(email) {
    if (!runtime.ready) await init();
    const value = String(email || "").trim();
    if (!value) throw new Error("Escriba el correo de la cuenta.");
    await runtime.modules.auth.sendPasswordResetEmail(runtime.auth,value);
  }

  async function updateOwnProfile(values = {}) {
    if (!runtime.auth?.currentUser) throw new Error("Debe iniciar sesión.");

    const user = runtime.auth.currentUser;
    const displayName = String(values.displayName || "").trim().slice(0,120);
    if (displayName) {
      await runtime.modules.auth.updateProfile(user,{displayName});
    }

    const {doc,setDoc,serverTimestamp} = runtime.modules.firestore;
    await setDoc(
      doc(runtime.db,"users",user.uid),
      {
        displayName:displayName || user.displayName || "",
        phone:String(values.phone || "").slice(0,40),
        neighborhood:String(values.neighborhood || "").slice(0,120),
        updatedAt:serverTimestamp()
      },
      {merge:true}
    );

    await handleAuthState(user,{reason:"profile_update"});
  }

  async function signOutUser() {
    if (!runtime.auth) return;
    await runtime.modules.auth.signOut(runtime.auth);
  }

  async function listUserProfiles() {
    if (!runtime.ready) await init();
    if (!runtime.isSuperAdmin) {
      throw Object.assign(
        new Error("Solo el superadministrador puede consultar y gestionar usuarios."),
        {code:"permission-denied"}
      );
    }

    const {collection,getDocs} = runtime.modules.firestore;
    const snapshot = await getDocs(collection(runtime.db,"users"));
    const profiles = snapshot.docs.map(item => {
      const data = item.data();
      const rawRole =
        data.role
        ?? data.rol
        ?? data.tipoUsuario
        ?? data.userRole
        ?? "guest";

      return {
        docId:item.id,
        uid:data.uid || (item.id.includes("@") ? "" : item.id),
        displayName:data.displayName || data.name || data.nombre || "Usuario sin nombre",
        email:data.email || (item.id.includes("@") ? item.id : ""),
        role:normalizeRole(rawRole),
        roleLabel:roleLabel(rawRole),
        active:data.active !== false,
        emailVerified:Boolean(data.emailVerified),
        createdAt:data.createdAt?.toDate?.()?.toISOString?.() || "",
        lastLoginAt:data.lastLoginAt?.toDate?.()?.toISOString?.() || "",
        legacy:item.id.includes("@")
      };
    });

    const deduplicated = new Map();
    profiles.forEach(profile => {
      const key = profile.email || profile.uid || profile.docId;
      const current = deduplicated.get(key);
      if (!current || (current.legacy && !profile.legacy)) {
        deduplicated.set(key,profile);
      }
    });

    return [...deduplicated.values()].sort((a,b) => {
      const roleOrder = {super_admin:0,admin:1,editor:2,guest:3};
      return (roleOrder[a.role] - roleOrder[b.role])
        || a.displayName.localeCompare(b.displayName,"es");
    });
  }

  async function updateUserAccess(profile, values = {}) {
    if (!runtime.ready) await init();
    if (!runtime.isSuperAdmin) {
      throw Object.assign(
        new Error("Solo el superadministrador puede cambiar roles."),
        {code:"permission-denied"}
      );
    }

    const target = typeof profile === "string" ? {docId:profile} : profile;
    const role = normalizeRole(values.role);
    const active = values.active !== false;

    const isCurrent =
      target.uid === runtime.user?.uid
      || (target.email && target.email === runtime.user?.email)
      || target.docId === runtime.user?.uid
      || target.docId === runtime.user?.email;

    if (isCurrent && (role !== "super_admin" || !active)) {
      throw new Error("No puede quitarse a sí mismo el rol de superadministrador ni desactivar su propia cuenta.");
    }

    const {doc,writeBatch,serverTimestamp} = runtime.modules.firestore;
    const batch = writeBatch(runtime.db);
    const targets = new Set(
      [target.uid,target.docId]
        .filter(Boolean)
    );

    targets.forEach(id => {
      batch.set(
        doc(runtime.db,"users",id),
        {
          uid:target.uid || (id.includes("@") ? "" : id),
          email:target.email || (id.includes("@") ? id : ""),
          displayName:target.displayName || "",
          role,
          active,
          updatedAt:serverTimestamp(),
          updatedBy:runtime.user.uid
        },
        {merge:true}
      );
    });

    await batch.commit();

    const {addDoc,collection} = runtime.modules.firestore;
    await addDoc(collection(runtime.db,"auditLogs"),{
      action:"user_access_update",
      targetUserId:target.uid || target.docId,
      targetEmail:target.email || "",
      role,
      active,
      userId:runtime.user.uid,
      email:runtime.user.email || "",
      createdAt:serverTimestamp(),
      page:location.pathname
    });

    if (isCurrent) {
      await handleAuthState(runtime.auth.currentUser,{reason:"access_update"});
    }

    emit("firebase:users",{action:"updated",profile:{...target,role,active}});
    return {...target,role,active};
  }


  const ENCODED_NODE_TYPE = "spEncodedType";
  const ENCODED_NODE_ITEMS = "spEncodedItems";
  const ENCODED_NODE_ENTRIES = "spEncodedEntries";
  const ENCODED_ARRAY_V2 = "array-v2";
  const ENCODED_MAP_V2 = "map-v2";
  const LEGACY_ARRAY_MARKER = "__sp_firestore_array_v1__";
  const RESERVED_FIELD_PATTERN = /^__.*__$/;
  const FIRESTORE_DOCUMENT_SAFE_BYTES = 900 * 1024;
  const FIRESTORE_MAX_DEPTH = 20;

  function isPlainRecord(value) {
    if (!value || typeof value !== "object") return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function isFirestoreNativeValue(value) {
    if (!value || typeof value !== "object") return false;

    const constructorName = String(value?.constructor?.name || "");
    if (
      constructorName === "Timestamp"
      && typeof value.toDate === "function"
      && typeof value.toMillis === "function"
      && Number.isFinite(value.seconds)
      && Number.isFinite(value.nanoseconds)
    ) return true;

    if (
      constructorName === "GeoPoint"
      && Number.isFinite(value.latitude)
      && Number.isFinite(value.longitude)
    ) return true;

    if (
      constructorName === "Bytes"
      && typeof value.toBase64 === "function"
      && typeof value.toUint8Array === "function"
    ) return true;

    if (
      constructorName === "DocumentReference"
      && typeof value.path === "string"
      && value.firestore
    ) return true;

    return false;
  }

  function firestorePayloadError(message,path,code = "firebase/invalid-payload") {
    const error = new Error(path ? `${message} Ruta: ${path}.` : message);
    error.code = code;
    error.path = path || "";
    return error;
  }

  function normalizeSectorEntry(entry,index = 0) {
    const source = Array.isArray(entry)
      ? {name:entry[0],value:entry[1]}
      : (isPlainRecord(entry) ? entry : {});
    const rawName = source.name ?? source.label ?? source.title ?? "";
    const rawValue = source.value ?? source.progress ?? source.percentage ?? 0;
    const numeric = Number(rawValue);
    return {
      name:String(rawName || `Línea ${index + 1}`).trim().slice(0,120),
      value:Number.isFinite(numeric) ? Math.max(0,Math.min(100,numeric)) : 0
    };
  }

  function normalizeYearsForFirestore(values) {
    if (!Array.isArray(values)) return [];
    return values.map(year => {
      const normalized = isPlainRecord(year) ? {...year} : {};
      normalized.sectors = (Array.isArray(normalized.sectors) ? normalized.sectors : [])
        .map((entry,index) => normalizeSectorEntry(entry,index))
        .filter(entry => entry.name);
      return normalized;
    });
  }

  /*
   * Firestore no acepta un arreglo directamente dentro de otro arreglo y
   * reserva nombres de campo con la forma __...__. La estructura funcional
   * del portal se normaliza primero (sectors usa objetos) y, como defensa para
   * módulos futuros o datos locales antiguos, cualquier arreglo anidado se
   * encapsula en un mapa con nombres de campo válidos. La operación es
   * reversible al leer el documento.
   */
  function encodeFirestoreValue(value,context = {}) {
    const {
      path = "$",
      directArrayItem = false,
      depth = 0,
      ancestors = new WeakSet()
    } = context;

    if (depth > FIRESTORE_MAX_DEPTH - 2) {
      throw firestorePayloadError(
        `La estructura supera la profundidad segura de ${FIRESTORE_MAX_DEPTH - 2} niveles`,
        path
      );
    }

    if (value === null || typeof value === "string" || typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    if (value === undefined || typeof value === "function" || typeof value === "symbol") {
      return directArrayItem ? null : undefined;
    }

    if (value instanceof Date || isFirestoreNativeValue(value)) {
      return value;
    }

    if (Array.isArray(value)) {
      if (ancestors.has(value)) {
        throw firestorePayloadError("Se detectó una referencia circular",path);
      }
      ancestors.add(value);
      const items = value.map((item,index) => encodeFirestoreValue(item,{
        path:`${path}[${index}]`,
        directArrayItem:true,
        depth:depth + 1,
        ancestors
      }));
      ancestors.delete(value);
      return directArrayItem
        ? {[ENCODED_NODE_TYPE]:ENCODED_ARRAY_V2,[ENCODED_NODE_ITEMS]:items}
        : items;
    }

    if (isPlainRecord(value)) {
      if (ancestors.has(value)) {
        throw firestorePayloadError("Se detectó una referencia circular",path);
      }
      ancestors.add(value);
      const entries = [];
      let needsMapWrapper = false;

      Object.entries(value).forEach(([key,item]) => {
        if (RESERVED_FIELD_PATTERN.test(key)) needsMapWrapper = true;
        const encoded = encodeFirestoreValue(item,{
          path:`${path}.${key}`,
          directArrayItem:false,
          depth:depth + 1,
          ancestors
        });
        if (encoded !== undefined) entries.push([key,encoded]);
      });
      ancestors.delete(value);

      if (needsMapWrapper) {
        return {
          [ENCODED_NODE_TYPE]:ENCODED_MAP_V2,
          [ENCODED_NODE_ENTRIES]:entries.map(([key,item]) => ({key,value:item}))
        };
      }
      return Object.fromEntries(entries);
    }

    throw firestorePayloadError(
      `Tipo de dato no compatible (${value?.constructor?.name || typeof value})`,
      path
    );
  }

  function decodeFirestoreValue(value) {
    if (Array.isArray(value)) {
      return value.map(item => decodeFirestoreValue(item));
    }

    if (isPlainRecord(value)) {
      const keys = Object.keys(value);
      if (
        value[ENCODED_NODE_TYPE] === ENCODED_ARRAY_V2
        && keys.length === 2
        && Array.isArray(value[ENCODED_NODE_ITEMS])
      ) {
        return value[ENCODED_NODE_ITEMS].map(item => decodeFirestoreValue(item));
      }
      if (
        value[ENCODED_NODE_TYPE] === ENCODED_MAP_V2
        && keys.length === 2
        && Array.isArray(value[ENCODED_NODE_ENTRIES])
      ) {
        return Object.fromEntries(
          value[ENCODED_NODE_ENTRIES]
            .filter(entry => isPlainRecord(entry) && typeof entry.key === "string")
            .map(entry => [entry.key,decodeFirestoreValue(entry.value)])
        );
      }

      /* Compatibilidad de lectura con la versión experimental anterior. */
      const legacyMarker = value[LEGACY_ARRAY_MARKER];
      if (keys.length === 1 && Array.isArray(legacyMarker)) {
        return legacyMarker.map(item => decodeFirestoreValue(item));
      }

      return Object.fromEntries(
        Object.entries(value).map(([key,item]) => [key,decodeFirestoreValue(item)])
      );
    }

    return value;
  }

  function auditFirestoreValue(value,path = "$",depth = 0,issues = []) {
    if (depth > FIRESTORE_MAX_DEPTH) {
      issues.push(`${path}: profundidad superior a ${FIRESTORE_MAX_DEPTH}`);
      return issues;
    }

    if (Array.isArray(value)) {
      value.forEach((item,index) => {
        if (Array.isArray(item)) issues.push(`${path}[${index}]: arreglo anidado`);
        auditFirestoreValue(item,`${path}[${index}]`,depth + 1,issues);
      });
      return issues;
    }

    if (isPlainRecord(value)) {
      Object.entries(value).forEach(([key,item]) => {
        if (RESERVED_FIELD_PATTERN.test(key)) {
          issues.push(`${path}.${key}: nombre de campo reservado`);
        }
        if (new TextEncoder().encode(key).length > 1500) {
          issues.push(`${path}.${key}: nombre de campo superior a 1500 bytes`);
        }
        auditFirestoreValue(item,`${path}.${key}`,depth + 1,issues);
      });
    }
    return issues;
  }

  function fingerprintIdeas(items) {
    try {
      return JSON.stringify(encodeFirestoreValue(Array.isArray(items) ? items : []));
    } catch {
      return "";
    }
  }

  function prepareFirestoreDocument(value) {
    const encoded = encodeFirestoreValue(value);
    const issues = auditFirestoreValue(encoded);
    if (issues.length) {
      throw firestorePayloadError(
        `La validación previa encontró ${issues.length} problema(s): ${issues.slice(0,3).join(" | ")}`,
        ""
      );
    }
    const json = JSON.stringify(encoded);
    const bytes = new TextEncoder().encode(json).length;
    if (bytes > FIRESTORE_DOCUMENT_SAFE_BYTES) {
      throw firestorePayloadError(
        `El documento pesa aproximadamente ${Math.ceil(bytes / 1024)} KB; el límite seguro configurado es ${Math.floor(FIRESTORE_DOCUMENT_SAFE_BYTES / 1024)} KB`,
        "portal/main",
        "firebase/document-too-large"
      );
    }
    return {encoded,bytes};
  }


  function cloudPayload() {
    const state = portal()?.state;
    if (!state) throw new Error("El estado del portal no está disponible.");
    return {
      schemaVersion:11.1,
      storageFormat:"firestore-native-v2",
      years:normalizeYearsForFirestore(state.years),
      resources:state.resources,
      dashboards:state.dashboards,
      commitments:state.commitments,
      citizenRequests:state.citizenRequests,
      news:state.news,
      settings:state.settings,
      content:state.content,
      pageSettings:state.pageSettings
    };
  }

  async function hydrateFromCloud() {
    if (!runtime.db || !portal()) return false;

    try {
      const {doc,getDoc,collection,getDocs} = runtime.modules.firestore;
      const [portalSnapshot,ideasSnapshot] = await Promise.all([
        getDoc(doc(runtime.db,"portal","main")),
        getDocs(collection(runtime.db,"ideas"))
      ]);

      if (!portalSnapshot.exists()) return false;

      const remote = decodeFirestoreValue(portalSnapshot.data());
      const remoteVersion =
        remote.updatedAt?.toMillis?.()
        || Number(remote.updatedAtMs || 0);
      const localVersion =
        Number(localStorage.getItem("sp_v9_cloud_version") || 0);
      const state = portal().state;

      ["resources","commitments","citizenRequests","news"].forEach(key => {
        if (Array.isArray(remote[key])) state[key] = remote[key];
      });
      if (Array.isArray(remote.years)) {
        state.years = normalizeYearsForFirestore(remote.years);
      }
      ["dashboards","settings","content","pageSettings"].forEach(key => {
        if (remote[key] && typeof remote[key] === "object") state[key] = remote[key];
      });

      const cloudIdeas =
        ideasSnapshot.docs.map(item => ({id:item.id,...decodeFirestoreValue(item.data())}));
      if (cloudIdeas.length) state.ideas = cloudIdeas;
      runtime.ideasFingerprint = fingerprintIdeas(state.ideas);

      portal().helpers.save({localOnly:true});
      portal().applySettings();
      emit("firebase:data",{source:"cloud",remoteVersion});

      if (remoteVersion && remoteVersion !== localVersion) {
        localStorage.setItem("sp_v9_cloud_version",String(remoteVersion));
        if (!sessionStorage.getItem(`sp_v9_reload_${remoteVersion}`)) {
          sessionStorage.setItem(`sp_v9_reload_${remoteVersion}`,"1");
          setTimeout(() => location.reload(),180);
        }
      }
      return true;
    } catch (error) {
      runtime.lastError = error;
      console.warn("[Firebase] Lectura pública no disponible.",error);
      return false;
    }
  }

  function queueSync() {
    if (!runtime.canWrite) return;
    clearTimeout(runtime.syncTimer);
    runtime.syncTimer = setTimeout(() => {
      pushAll().catch(error => {
        runtime.lastError = error;
        emit("firebase:sync",{status:"error",error:friendlyError(error),code:error?.code || ""});
        portal()?.helpers.toast(friendlyError(error));
      });
    },1100);
  }

  async function pushAll(options = {}) {
    if (!runtime.ready) await init();
    if (!runtime.canWrite) {
      throw Object.assign(
        new Error("La cuenta no tiene permisos de edición."),
        {code:"permission-denied"}
      );
    }
    if (runtime.syncing) {
      runtime.syncPending = true;
      return;
    }

    runtime.syncing = true;
    runtime.syncPending = false;
    emit("firebase:sync",{status:"saving"});

    try {
      const {
        doc,setDoc,collection,getDocs,writeBatch,
        serverTimestamp,addDoc
      } = runtime.modules.firestore;

      const prepared = prepareFirestoreDocument(cloudPayload());
      const data = prepared.encoded;
      data.updatedAt = serverTimestamp();
      data.updatedAtMs = Date.now();
      data.updatedBy = runtime.user.uid;
      data.updatedByEmail = runtime.user.email || "";
      data.payloadBytes = prepared.bytes;

      /*
       * El documento principal se guarda primero. De esta manera, una regla
       * específica de ideas o auditoría nunca invalida un cambio de diseño,
       * vigencia, recurso o contenido ya válido.
       */
      await setDoc(doc(runtime.db,"portal","main"),data,{merge:false});

      const currentIdeas = Array.isArray(portal().state.ideas) ? portal().state.ideas : [];
      const currentFingerprint = fingerprintIdeas(currentIdeas);
      let secondaryError = null;

      if (currentFingerprint !== runtime.ideasFingerprint) {
        try {
          const existingIdeas = await getDocs(collection(runtime.db,"ideas"));
          const currentIds = new Set(currentIdeas.map(item => item.id).filter(Boolean));
          const actualDeletes = existingIdeas.docs.filter(item => !currentIds.has(item.id));
          const estimatedWrites = actualDeletes.length + currentIdeas.length;
          if (estimatedWrites > 490) {
            throw firestorePayloadError(
              `La colección de ideas requiere ${estimatedWrites} escrituras y supera el límite operativo seguro del lote`,
              "ideas"
            );
          }

          if (estimatedWrites > 0) {
            const ideasBatch = writeBatch(runtime.db);
            actualDeletes.forEach(item => ideasBatch.delete(item.ref));
            currentIdeas.forEach(item => {
              if (!item?.id) return;
              const {id,...ideaData} = item;
              const preparedIdea = encodeFirestoreValue(ideaData);
              preparedIdea.updatedAt = serverTimestamp();
              ideasBatch.set(doc(runtime.db,"ideas",id),preparedIdea,{merge:true});
            });
            await ideasBatch.commit();
          }
          runtime.ideasFingerprint = currentFingerprint;
        } catch (error) {
          secondaryError = error;
          console.warn("[Firebase] El documento principal se guardó, pero falló la sincronización de ideas.",error);
        }
      }

      addDoc(collection(runtime.db,"auditLogs"),{
        action:options.action || "portal_sync",
        userId:runtime.user.uid,
        email:runtime.user.email || "",
        createdAt:serverTimestamp(),
        page:location.pathname,
        schemaVersion:11.1,
        payloadBytes:prepared.bytes
      }).catch(error => {
        console.info("[Firebase] El contenido se guardó; el registro de auditoría no pudo escribirse.",error);
      });

      localStorage.setItem("sp_v9_cloud_version",String(data.updatedAtMs));
      emit("firebase:sync",{
        status:secondaryError ? "saved_with_warning" : "saved",
        at:data.updatedAtMs,
        bytes:prepared.bytes,
        warning:secondaryError ? friendlyError(secondaryError) : ""
      });

      if (secondaryError) {
        const partial = firestorePayloadError(
          `El contenido principal sí se guardó, pero las ideas no pudieron sincronizarse: ${friendlyError(secondaryError)}`,
          "ideas",
          "firebase/partial-sync"
        );
        partial.cause = secondaryError;
        throw partial;
      }

      portal()?.helpers.toast("Cambios sincronizados con Firestore.");
    } finally {
      runtime.syncing = false;
      if (runtime.syncPending) {
        runtime.syncPending = false;
        queueSync();
      }
    }
  }

  async function createPublicIdea(idea) {
    if (!runtime.ready) await init();

    const {doc,setDoc,serverTimestamp} = runtime.modules.firestore;
    const payload = {
      title:String(idea.title || "").slice(0,120),
      author:String(idea.author || "").slice(0,120),
      location:String(idea.location || "").slice(0,120),
      category:String(idea.category || "").slice(0,80),
      description:String(idea.description || "").slice(0,1200),
      status:"recibida",
      response:"",
      votes:0,
      created:idea.created || new Date().toLocaleDateString("es-CO"),
      createdBy:runtime.user?.uid || "",
      createdByEmail:runtime.user?.email || ""
    };
    const firestorePayload = encodeFirestoreValue(payload);
    firestorePayload.createdAt = serverTimestamp();
    await setDoc(doc(runtime.db,"ideas",idea.id),firestorePayload,{merge:false});
    runtime.ideasFingerprint = fingerprintIdeas(portal()?.state?.ideas || []);
    return payload;
  }

  async function uploadFile(file,path,options = {}) {
    if (!runtime.ready) await init();
    if (!runtime.canWrite) {
      throw Object.assign(
        new Error("La cuenta no tiene permiso administrativo para subir archivos."),
        {code:"permission-denied"}
      );
    }
    if (!window.DrivePortal) {
      throw new Error("Google Drive todavía no se encuentra disponible.");
    }
    return window.DrivePortal.uploadFile(file,path,options);
  }

  async function uploadDataUrl(dataUrl,path,options = {}) {
    if (!runtime.ready) await init();
    if (!runtime.canWrite) {
      throw Object.assign(
        new Error("La cuenta no tiene permiso administrativo para subir imágenes."),
        {code:"permission-denied"}
      );
    }
    if (!window.DrivePortal) {
      throw new Error("Google Drive todavía no se encuentra disponible.");
    }
    return window.DrivePortal.uploadDataUrl(dataUrl,path,options);
  }

  window.addEventListener("online",async () => {
    runtime.connected = true;

    if (runtime.db && runtime.modules?.firestore?.enableNetwork) {
      await runtime.modules.firestore.enableNetwork(runtime.db).catch(error => {
        console.warn("[Firebase] No fue posible reactivar la red.",error);
      });
    }

    emit("firebase:connection",{
      connected:true,
      transport:runtime.transport || "default"
    });
    hydrateFromCloud();
  });

  window.addEventListener("offline",() => {
    runtime.connected = false;
    emit("firebase:connection",{
      connected:false,
      transport:runtime.transport || "default"
    });
  });

  window.FirebasePortal = {
    init,
    signInEmail,
    signInGoogle,
    registerEmail,
    resendVerification,
    sendPasswordReset,
    updateOwnProfile,
    signOut:signOutUser,
    hydrateFromCloud,
    pushAll,
    queueSync,
    createPublicIdea,
    uploadFile,
    uploadDataUrl,
    listUserProfiles,
    updateUserAccess,
    normalizeRole,
    roleLabel,
    friendlyError,
    auditPayload:() => {
      const prepared = prepareFirestoreDocument(cloudPayload());
      return {ok:true,bytes:prepared.bytes,schemaVersion:11.1};
    },
    canWrite:() => runtime.canWrite,
    isSuperAdmin:() => runtime.isSuperAdmin,
    getStatus:() => ({
      ...runtime,
      roleLabel:roleLabel(runtime.role)
    })
  };
})();
