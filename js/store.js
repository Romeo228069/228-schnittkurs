/* Datenschicht: Firebase (Anmeldung + Firestore mit Offline Cache) oder lokale Vorschau.
   Dokumente: kurs/progress (Kamilas Stand), kurs/course (Romeos Anpassungen),
   kurs/notes (Gespräche je Lektion), Sammlung events (Verlauf für Romeo). */
import { FIREBASE, ACCOUNTS } from "./config.js";
import { tt } from "./util.js";

const SDK = "https://www.gstatic.com/firebasejs/11.10.0/";
const LOCAL_KEY = "228kurs-local-v2";
export const DELETE = { __del: true };
export const union = v => ({ __union: v });

const empty = () => ({
  progress: { done: {}, ex: {}, quiz: {}, check: {}, seen: {}, last: null, trainer: null, active: 0 },
  course: { lessons: {} },
  notes: { threads: {}, read: { k: {}, r: {} } },
  events: []
});

/* Mit ?vorschau in der Adresse läuft die Seite ohne Datenbank, zum Ausprobieren */
let mode = FIREBASE && FIREBASE.apiKey && !new URLSearchParams(location.search).has("vorschau") ? "firebase" : "local";
let state = empty();
let user = null;
let fb = null;
let unsubs = [];
let pending = 0;
let status = { ok: true, msg: "" };
const changeCbs = new Set(), authCbs = new Set(), statusCbs = new Set();
let readyResolve, readyFlags = {};
let ready = Promise.resolve();

function emit(kind) { changeCbs.forEach(cb => { try { cb(kind); } catch (e) { console.error(e); } }); }
function emitAuth() { authCbs.forEach(cb => { try { cb(user); } catch (e) { console.error(e); } }); }
function setStatus(s) { status = Object.assign({ ok: true, msg: "" }, s); statusCbs.forEach(cb => cb(status, pending)); }

function isObj(v) { return v && typeof v === "object" && !Array.isArray(v) && !v.__del && !("__union" in v); }
function merge(target, patch) {
  for (const k of Object.keys(patch)) {
    const v = patch[k];
    if (v && v.__del) { delete target[k]; continue; }
    if (v && typeof v === "object" && "__union" in v) { const arr = Array.isArray(target[k]) ? target[k] : []; arr.push(v.__union); target[k] = arr; continue; }
    if (isObj(v)) { if (!isObj(target[k])) target[k] = {}; merge(target[k], v); continue; }
    target[k] = Array.isArray(v) ? v.slice() : v;
  }
  return target;
}
function toFs(patch) {
  const out = {};
  for (const k of Object.keys(patch)) {
    const v = patch[k];
    if (v && v.__del) out[k] = fb.fs.deleteField();
    else if (v && typeof v === "object" && "__union" in v) out[k] = fb.fs.arrayUnion(v.__union);
    else if (isObj(v)) out[k] = toFs(v);
    else out[k] = v;
  }
  return out;
}

function persistLocal() { try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ state, user })); } catch (e) {} }

function whoFromEmail(email) {
  for (const [who, a] of Object.entries(ACCOUNTS)) if (a.email === email) return who;
  return null;
}

function detach() { unsubs.forEach(u => { try { u(); } catch (e) {} }); unsubs = []; }

function attach() {
  detach();
  state = empty();
  if (!user) { emit("all"); return; }
  const { fs, db } = fb;
  readyFlags = {};
  ready = new Promise(res => { readyResolve = res; setTimeout(res, 5000); });
  const mark = k => { readyFlags[k] = true; if (readyFlags.progress && readyFlags.course && readyFlags.notes) readyResolve(); };
  const onErr = k => err => {
    console.error(k, err);
    setStatus({ ok: false, msg: err.code === "permission-denied" ? tt("Die Datenbank verweigert den Zugriff. Bitte ab und wieder anmelden.", "The database refused access. Please sign out and in again.") : tt("Verbindung zur Datenbank gestört.", "Connection to the database is disrupted.") });
    mark(k);
  };
  for (const k of ["progress", "course", "notes"]) {
    unsubs.push(fs.onSnapshot(fs.doc(db, "kurs", k), snap => {
      const base = empty()[k];
      state[k] = merge(base, snap.exists() ? snap.data() : {});
      mark(k); emit(k);
    }, onErr(k)));
  }
  if (user.who === "romeo") {
    const q = fs.query(fs.collection(db, "events"), fs.orderBy("t", "desc"), fs.limit(40));
    unsubs.push(fs.onSnapshot(q, snap => {
      state.events = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
      emit("events");
    }, onErr("events")));
  }
}

export const store = {
  get mode() { return mode; },
  get state() { return state; },
  get user() { return user; },
  get status() { return status; },
  get pending() { return pending; },
  ready: () => ready,
  onChange(cb) { changeCbs.add(cb); },
  onAuth(cb) { authCbs.add(cb); },
  onStatus(cb) { statusCbs.add(cb); },

  async init() {
    if (mode === "local") {
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) { const p = JSON.parse(raw); state = merge(empty(), p.state || {}); user = p.user || null; }
      } catch (e) {}
      emitAuth(); emit("all");
      return;
    }
    try {
      const [app, auth, fs] = await Promise.all([import(SDK + "firebase-app.js"), import(SDK + "firebase-auth.js"), import(SDK + "firebase-firestore.js")]);
      const a = app.initializeApp(FIREBASE);
      let db;
      try { db = fs.initializeFirestore(a, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) }); }
      catch (e) { db = fs.getFirestore(a); }
      fb = { app: a, authM: auth, auth: auth.getAuth(a), fs, db };
      await new Promise(res => {
        let first = true;
        auth.onAuthStateChanged(fb.auth, u => {
          const who = u ? whoFromEmail(u.email) : null;
          if (u && !who) { auth.signOut(fb.auth); return; }
          user = who ? { who, uid: u.uid } : null;
          attach(); emitAuth();
          if (first) { first = false; res(); }
        });
      });
    } catch (e) {
      console.error(e);
      setStatus({ ok: false, msg: tt("Die Datenbank konnte nicht geladen werden. Internetverbindung prüfen.", "The database could not be loaded. Check your internet connection.") });
      emitAuth();
    }
  },

  async signIn(who, password) {
    if (mode === "local") { user = { who, uid: "local-" + who }; persistLocal(); emitAuth(); emit("all"); return; }
    await fb.authM.signInWithEmailAndPassword(fb.auth, ACCOUNTS[who].email, password);
  },
  async signUp(who, password) {
    if (mode === "local") return this.signIn(who, password);
    await fb.authM.createUserWithEmailAndPassword(fb.auth, ACCOUNTS[who].email, password);
  },
  async signOut() {
    if (mode === "local") { user = null; persistLocal(); emitAuth(); return; }
    detach(); await fb.authM.signOut(fb.auth);
  },

  write(docName, patch) {
    merge(state[docName], patch);
    emit(docName);
    if (mode === "local") { persistLocal(); return Promise.resolve(); }
    pending++; setStatus({ ok: true });
    return fb.fs.setDoc(fb.fs.doc(fb.db, "kurs", docName), toFs(patch), { merge: true })
      .then(() => { pending--; setStatus({ ok: true }); })
      .catch(err => { pending--; console.error(err); setStatus({ ok: false, msg: err.code === "permission-denied" ? tt("Speichern nicht erlaubt. Bist du richtig angemeldet?", "Saving is not allowed. Are you signed in correctly?") : tt("Speichern fehlgeschlagen, bitte noch einmal versuchen.", "Saving failed, please try again.") }); });
  },

  log(type, lid, extra) {
    const ev = Object.assign({ type, lid: lid || null, t: Date.now() }, extra || {});
    if (mode === "local") { state.events.unshift(Object.assign({ id: String(ev.t) }, ev)); state.events = state.events.slice(0, 40); persistLocal(); emit("events"); return; }
    if (user && user.who === "kamila") fb.fs.addDoc(fb.fs.collection(fb.db, "events"), ev).catch(e => console.error(e));
  }
};
