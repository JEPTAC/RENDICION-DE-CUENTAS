(() => {
  const FIREBASE_VERSION = "12.16.0";
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
    initialized:false, ready:false, connected:navigator.onLine,
    user:null, role:null, canWrite:false, syncing:false, lastError:null,
    app:null, auth:null, db:null, storage:null, modules:null, syncTimer:null, initPromise:null
  };

  const emit = (name, detail = {}) => window.dispatchEvent(new CustomEvent(name, {detail}));
  const portal = () => window.Portal;

  function friendlyError(error) {
    const code = error?.code || "";
    const messages = {
      "auth/invalid-credential":"Correo o contraseña incorrectos.",
      "auth/user-not-found":"No existe un usuario con ese correo.",
      "auth/wrong-password":"La contraseña no es correcta.",
      "auth/popup-closed-by-user":"La ventana de acceso se cerró antes de completar el proceso.",
      "auth/unauthorized-domain":"Debe autorizar el dominio de GitHub Pages en Firebase Authentication.",
      "permission-denied":"Las reglas de Firebase no permiten esta operación.",
      "storage/unauthorized":"La cuenta no tiene permiso para cargar archivos.",
      "storage/quota-exceeded":"Se agotó la cuota de almacenamiento de Firebase."
    };
    return messages[code] || error?.message || "Ocurrió un error al comunicarse con Firebase.";
  }

  async function loadModules() {
    const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
    const [app, auth, firestore, storage] = await Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-firestore.js`),
      import(`${base}/firebase-storage.js`)
    ]);
    return {app,auth,firestore,storage};
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
      runtime.db = runtime.modules.firestore.getFirestore(runtime.app);
      runtime.storage = runtime.modules.storage.getStorage(runtime.app);
      await runtime.modules.auth.setPersistence(runtime.auth, runtime.modules.auth.browserLocalPersistence);

      runtime.modules.auth.onAuthStateChanged(runtime.auth, handleAuthState);
      await hydrateFromCloud();
      runtime.ready = true;
      emit("firebase:ready", {connected:runtime.connected,projectId:firebaseConfig.projectId});
    } catch (error) {
      runtime.lastError = error;
      runtime.ready = false;
      emit("firebase:ready", {connected:false,error:friendlyError(error)});
      console.warn("[Firebase] No fue posible inicializar.", error);
    }
    return runtime;
    })();
    return runtime.initPromise;
  }

  async function handleAuthState(user) {
    runtime.user = user || null;
    runtime.role = null;
    runtime.canWrite = false;

    if (user) {
      try {
        const {doc,getDoc} = runtime.modules.firestore;
        const profile = await getDoc(doc(runtime.db,"users",user.uid));
        const data = profile.exists() ? profile.data() : {};
        runtime.role = data.role || "viewer";
        runtime.canWrite = data.active !== false && ["super_admin","admin","editor"].includes(runtime.role);
      } catch (error) {
        runtime.lastError = error;
      }
    }
    emit("firebase:auth", {user:runtime.user,role:runtime.role,canWrite:runtime.canWrite});
  }

  async function signInEmail(email,password) {
    if (!runtime.ready) await init();
    return runtime.modules.auth.signInWithEmailAndPassword(runtime.auth,email,password);
  }

  async function signInGoogle() {
    if (!runtime.ready) await init();
    const provider = new runtime.modules.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    return runtime.modules.auth.signInWithPopup(runtime.auth,provider);
  }

  async function signOutUser() {
    if (!runtime.auth) return;
    await runtime.modules.auth.signOut(runtime.auth);
  }

  function cloudPayload() {
    const state = portal()?.state;
    if (!state) throw new Error("El estado del portal no está disponible.");
    return {
      schemaVersion:7,
      years:state.years,
      resources:state.resources,
      dashboards:state.dashboards,
      commitments:state.commitments,
      citizenRequests:state.citizenRequests,
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

      const remote = portalSnapshot.data();
      const remoteVersion = remote.updatedAt?.toMillis?.() || Number(remote.updatedAtMs || 0);
      const localVersion = Number(localStorage.getItem("sp_v7_cloud_version") || 0);
      const state = portal().state;

      ["years","resources","commitments","citizenRequests"].forEach(key => {
        if (Array.isArray(remote[key])) state[key] = remote[key];
      });
      ["dashboards","settings","content","pageSettings"].forEach(key => {
        if (remote[key] && typeof remote[key] === "object") state[key] = remote[key];
      });
      const cloudIdeas = ideasSnapshot.docs.map(item => ({id:item.id,...item.data()}));
      if (cloudIdeas.length) state.ideas = cloudIdeas;

      portal().helpers.save({localOnly:true});
      portal().applySettings();
      emit("firebase:data", {source:"cloud",remoteVersion});

      if (remoteVersion && remoteVersion !== localVersion) {
        localStorage.setItem("sp_v7_cloud_version",String(remoteVersion));
        if (!sessionStorage.getItem(`sp_v7_reload_${remoteVersion}`)) {
          sessionStorage.setItem(`sp_v7_reload_${remoteVersion}`,"1");
          setTimeout(() => location.reload(),180);
        }
      }
      return true;
    } catch (error) {
      runtime.lastError = error;
      console.warn("[Firebase] Lectura pública no disponible.", error);
      return false;
    }
  }

  function queueSync() {
    if (!runtime.canWrite) return;
    clearTimeout(runtime.syncTimer);
    runtime.syncTimer = setTimeout(() => pushAll().catch(error => {
      runtime.lastError = error;
      portal()?.helpers.toast(friendlyError(error));
    }),1100);
  }

  async function pushAll(options = {}) {
    if (!runtime.ready) await init();
    if (!runtime.canWrite) throw Object.assign(new Error("La cuenta no tiene permisos de edición."),{code:"permission-denied"});
    if (runtime.syncing) return;
    runtime.syncing = true;
    emit("firebase:sync",{status:"saving"});

    try {
      const {doc,setDoc,collection,getDocs,writeBatch,serverTimestamp,addDoc} = runtime.modules.firestore;
      const data = cloudPayload();
      data.updatedAt = serverTimestamp();
      data.updatedAtMs = Date.now();
      data.updatedBy = runtime.user.uid;
      data.updatedByEmail = runtime.user.email || "";
      await setDoc(doc(runtime.db,"portal","main"),data,{merge:false});

      const existingIdeas = await getDocs(collection(runtime.db,"ideas"));
      const batch = writeBatch(runtime.db);
      const currentIds = new Set(portal().state.ideas.map(item => item.id));
      existingIdeas.docs.forEach(item => { if (!currentIds.has(item.id)) batch.delete(item.ref); });
      portal().state.ideas.forEach(item => {
        const {id,...ideaData} = item;
        batch.set(doc(runtime.db,"ideas",id),{...ideaData,updatedAt:serverTimestamp()},{merge:true});
      });
      await batch.commit();

      await addDoc(collection(runtime.db,"auditLogs"),{
        action:options.action || "portal_sync",
        userId:runtime.user.uid,
        email:runtime.user.email || "",
        createdAt:serverTimestamp(),
        page:location.pathname
      });
      localStorage.setItem("sp_v7_cloud_version",String(data.updatedAtMs));
      emit("firebase:sync",{status:"saved",at:data.updatedAtMs});
      portal()?.helpers.toast("Cambios sincronizados con Firebase.");
    } finally {
      runtime.syncing = false;
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
      createdAt:serverTimestamp()
    };
    await setDoc(doc(runtime.db,"ideas",idea.id),payload,{merge:false});
    return payload;
  }

  async function uploadFile(file,path) {
    if (!runtime.ready) await init();
    if (!runtime.canWrite) throw Object.assign(new Error("No tiene permiso para subir archivos."),{code:"storage/unauthorized"});
    const safeName = String(file.name || "archivo").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"-");
    const fullPath = `${path.replace(/\/$/,"")}/${Date.now()}-${safeName}`;
    const fileRef = runtime.modules.storage.ref(runtime.storage,fullPath);
    await runtime.modules.storage.uploadBytes(fileRef,file,{contentType:file.type || "application/octet-stream"});
    return runtime.modules.storage.getDownloadURL(fileRef);
  }

  async function uploadDataUrl(dataUrl,path) {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const extension = blob.type.includes("png") ? "png" : "jpg";
    return uploadFile(new File([blob],`imagen.${extension}`,{type:blob.type}),path);
  }

  window.addEventListener("online",() => {runtime.connected=true;emit("firebase:connection",{connected:true});hydrateFromCloud();});
  window.addEventListener("offline",() => {runtime.connected=false;emit("firebase:connection",{connected:false});});

  window.FirebasePortal = {
    init,signInEmail,signInGoogle,signOut:signOutUser,hydrateFromCloud,
    pushAll,queueSync,createPublicIdea,uploadFile,uploadDataUrl,friendlyError,
    canWrite:() => runtime.canWrite,
    getStatus:() => ({...runtime})
  };
})();