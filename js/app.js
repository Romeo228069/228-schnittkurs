/* 228 Schnittkurs: Oberfläche, Rollen, Lehreransicht, Deutsch und Englisch */
import { MODS, SC, L, LEX } from "./data.js";
import { MODS_EN, GROUPS_EN, SC_EN, L_EN, LEX_EN } from "./data_en.js";
import { WIDGETS } from "./widgets.js";
import { SHOTS, IMG } from "./shots.js";
import { store, DELETE, union } from "./store.js";
import { ACCOUNTS } from "./config.js";
import { prefs, savePrefs, tt, caps, kbd, esc, T, CHECK, when, fmtMin } from "./util.js";

const root = document.getElementById("app");
let viewAs = false, editing = null, cur = { view: null, id: null }, shellUp = false;
const openLog = {};
const EN = () => prefs.lang === "en";
document.documentElement.lang = prefs.lang;

/* ---------- Rollen ---------- */
const me = () => (store.user ? store.user.who : null);
const isAdmin = () => me() === "romeo" && !viewAs;
const P = () => store.state.progress;
const OV = () => (store.state.course && store.state.course.lessons) || {};
const NT = () => store.state.notes;
const who = w => ({ name: ACCOUNTS[w].name, role: w === "romeo" ? tt("Lehrer", "Teacher") : tt("Schülerin", "Student") });

/* ---------- Sprache der Inhalte ---------- */
const modName = m => (EN() ? MODS_EN[m.id].name : m.name);
const modDesc = m => (EN() ? MODS_EN[m.id].desc : m.desc);
const modTitle = m => modName(m) + (m.page ? " Page" : "");
const scF = s => (EN() ? SC_EN[s.k + "@" + s.p] || s.f : s.f);
const pageName = p => (p === "Alle" ? tt("überall", "everywhere") : p);
const groupName = g => (EN() ? GROUPS_EN[g] || g : g);

/* ---------- Lektionen mit Romeos Anpassungen ---------- */
const TXT = ["title", "why", "steps", "tips", "task", "romeo", "quiz"];
const META = ["keys", "min", "mod"];
function mergeLesson(base, o) {
  const r = Object.assign({}, base, EN() && L_EN[base.id] ? L_EN[base.id] : {});
  const S = SHOTS[base.id];
  if (S) {
    r.shots = S.shots;
    for (const k of ["why", "steps", "tips"]) if (S[k]) r[k] = S[k][prefs.lang] || S[k].de;
    if ("widget" in S) r.widget = S.widget;
  }
  if (!o) return r;
  for (const k of META) if (o[k] !== undefined) r[k] = o[k];
  const lo = o[prefs.lang] || (base.custom ? o[EN() ? "de" : "en"] : null);
  if (lo) for (const k of TXT) if (lo[k] !== undefined) r[k] = lo[k];
  r.hidden = !!o.hidden;
  r.edited = !base.custom && (META.some(k => o[k] !== undefined) || ["de", "en"].some(x => o[x] && TXT.some(k => o[x][k] !== undefined)));
  r.editedHere = !!(o[prefs.lang] && TXT.some(k => o[prefs.lang][k] !== undefined));
  return r;
}
function lessonList(all) {
  const ov = OV();
  const base = L.map(l => mergeLesson(l, ov[l.id]));
  const custom = Object.entries(ov).filter(([, o]) => o && o.custom).map(([id, o]) =>
    mergeLesson({ id, mod: "m2", title: tt("Neue Lektion", "New lesson"), min: 10, why: "", steps: [], tips: [], keys: [], romeo: "", task: "", quiz: null, custom: true, created: o.created || 0 }, o));
  const out = [];
  for (const m of MODS) {
    out.push(...base.filter(l => l.mod === m.id));
    out.push(...custom.filter(l => l.mod === m.id).sort((a, b) => a.created - b.created));
  }
  const res = all ? out : out.filter(l => !l.hidden);
  res.forEach((l, i) => { l.n = i + 1; l.m = MODS.find(m => m.id === l.mod) || MODS[2]; });
  return res;
}
const lessons = () => lessonList(isAdmin());
const visible = () => lessonList(false);
const findLesson = id => lessons().find(l => l.id === id);

/* ---------- Fortschritt ---------- */
const isDone = id => !!(P().done && P().done[id]);
const exDone = id => !!(P().ex && P().ex[id]);
const quizRes = id => (P().quiz || {})[id];
const nextOf = list => list.find(l => !isDone(l.id)) || null;
function lastOpened(list) { const la = P().last; return la ? list.find(l => l.id === la.id) || null : null; }
function unreadFor(w, id) {
  const th = (NT().threads || {})[id] || [];
  const read = ((NT().read || {})[w === "kamila" ? "k" : "r"] || {})[id] || 0;
  const other = w === "kamila" ? "r" : "k";
  return th.filter(m => m.f === other && m.at > read).length;
}
function canWrite() {
  if (viewAs) { toast(tt("Vorschau als Kamila, es wird nichts gespeichert.", "Previewing as Kamila, nothing is saved.")); return false; }
  return true;
}
const now = () => Date.now();
const dayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
function learnerSet(patch, ev, lid) {
  if (!canWrite()) return;
  const base = { active: now() };
  if (me() === "kamila") base.days = { [dayKey()]: true };
  store.write("progress", Object.assign(base, patch));
  if (ev && me() === "kamila") store.log(ev, lid);
}

/* ---------- Fragen und Kommentare ---------- */
const GEN = "allg";
const kindOf = m => m.k || "q";
const threadOf = id => (NT().threads || {})[id] || [];
function threadState(id) {
  const th = threadOf(id);
  const lastQ = Math.max(0, ...th.filter(m => m.f === "k" && kindOf(m) === "q").map(m => m.at));
  const lastR = Math.max(0, ...th.filter(m => m.f === "r").map(m => m.at));
  const closed = (NT().closed || {})[id] || 0;
  const open = lastQ > 0 && lastQ > Math.max(lastR, closed);
  return { open, answered: lastQ > 0 && !open, closed: closed && closed >= lastQ, last: th.length ? th[th.length - 1].at : 0, n: th.length };
}
function allThreads() { return Object.keys(NT().threads || {}).filter(id => threadOf(id).length && (id === GEN || lessonList(true).some(l => l.id === id))); }
function threadLabel(id) {
  if (id === GEN) return tt("Allgemein", "General");
  const l = lessons().find(x => x.id === id) || lessonList(true).find(x => x.id === id);
  return l ? tt("Lektion ", "Lesson ") + l.n + ": " + l.title : id;
}
function statusChip(id) {
  const s = threadState(id);
  if (!s.n) return "";
  if (s.open) return '<span class="qst open">' + tt("Offen", "Open") + "</span>";
  if (s.closed) return '<span class="qst done">' + tt("Erledigt", "Resolved") + "</span>";
  if (s.answered) return '<span class="qst ok">' + tt("Beantwortet", "Answered") + "</span>";
  return '<span class="qst">' + tt("Kommentar", "Comment") + "</span>";
}
function msgHtml(m) {
  const who_ = m.f === "k" ? "Kamila" : "Romeo";
  const kind = m.f === "k" ? (kindOf(m) === "c" ? tt("Kommentar", "Comment") : tt("Frage", "Question")) : tt("Antwort", "Reply");
  return '<div class="msg ' + (m.f === "k" ? "k" : "r") + '"><span class="who">' + who_ + " <em>" + kind + "</em> <time>" + when(m.at) + "</time></span>" + (m.ref ? '<span class="mref">' + T(m.ref) + "</span>" : "") + "<p>" + esc(m.t).replace(/\n/g, "<br>") + "</p></div>";
}
const qform = {}; // je Gespräch: { kind, ref }
function threadFormHtml(id, compact) {
  const st = qform[id] || (qform[id] = { kind: "q", ref: "" });
  const admin = isAdmin();
  return '<form class="msgf" data-tid="' + id + '">' +
    (admin ? "" : '<div class="wbtns kindseg" role="group"><button type="button" data-kind="q" aria-pressed="' + (st.kind === "q") + '">' + tt("Frage", "Question") + '</button><button type="button" data-kind="c" aria-pressed="' + (st.kind === "c") + '">' + tt("Kommentar", "Comment") + "</button></div>") +
    '<span class="refchip"' + (st.ref ? "" : " hidden") + "><span>" + T(st.ref) + '</span><button type="button" class="refx" aria-label="' + tt("Bezug entfernen", "Remove reference") + '">×</button></span>' +
    '<div class="msgrow"><label class="fld"><span class="vh">' + tt("Nachricht", "Message") + '</span><textarea rows="' + (compact ? 1 : 2) + '" placeholder="' + (admin ? tt("Antwort an Kamila", "Reply to Kamila") : st.kind === "c" ? tt("Was möchtest du festhalten?", "What would you like to note?") : tt("Was ist unklar? Romeo antwortet hier", "What's unclear? Romeo replies here")) + '"></textarea></label><button class="btn sec" type="submit">' + tt("Senden", "Send") + "</button></div>" +
    (admin && threadState(id).open ? '<button type="button" class="btn ghost qclose">' + tt("Als erledigt markieren", "Mark as resolved") + "</button>" : "") +
    "</form>";
}
function sendMsg(id, t, kind, ref) {
  if (!canWrite()) return false;
  const f = me() === "romeo" ? "r" : "k";
  const msg = { f, t, at: now() };
  if (f === "k") msg.k = kind || "q";
  if (ref) msg.ref = ref;
  store.write("notes", { threads: { [id]: union(msg) }, read: { [f]: { [id]: now() } } });
  if (f === "k") { learnerSet({}, null); store.log(kind === "c" ? "comment" : "msg", id === GEN ? null : id); }
  return true;
}
function bindThreadForms(scope, after) {
  scope.querySelectorAll("form.msgf").forEach(form => {
    const id = form.dataset.tid, st = qform[id] || (qform[id] = { kind: "q", ref: "" });
    form.querySelectorAll("[data-kind]").forEach(b => b.addEventListener("click", () => {
      st.kind = b.dataset.kind; form.querySelectorAll("[data-kind]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      form.querySelector("textarea").placeholder = st.kind === "c" ? tt("Was möchtest du festhalten?", "What would you like to note?") : tt("Was ist unklar? Romeo antwortet hier", "What's unclear? Romeo replies here");
    }));
    const rx = form.querySelector(".refx"); if (rx) rx.addEventListener("click", () => { st.ref = ""; form.querySelector(".refchip").hidden = true; });
    const qc = form.querySelector(".qclose"); if (qc) qc.addEventListener("click", () => { store.write("notes", { closed: { [id]: now() } }); toast(tt("Als erledigt markiert.", "Marked as resolved.")); });
    form.addEventListener("submit", e => {
      e.preventDefault();
      const ta = form.querySelector("textarea"), t = ta.value.trim(); if (!t) return;
      const tid = id === "new" ? (document.getElementById("qlesson") || {}).value || GEN : id;
      if (!sendMsg(tid, t, st.kind, st.ref)) return;
      ta.value = ""; st.ref = ""; const rc = form.querySelector(".refchip"); if (rc) rc.hidden = true;
      toast(me() === "romeo" ? tt("Gesendet. Kamila sieht deine Antwort.", "Sent. Kamila can see your reply.") : st.kind === "c" ? tt("Kommentar gespeichert. Romeo sieht ihn.", "Comment saved. Romeo can see it.") : tt("Gesendet. Romeo sieht deine Frage.", "Sent. Romeo can see your question."));
      if (after) after(tid);
    });
  });
}
function unreadTotal() {
  const w = me(); if (!w) return 0;
  if (w === "romeo") return allThreads().filter(id => threadState(id).open).length;
  return allThreads().reduce((a, id) => a + unreadFor("kamila", id), 0);
}

/* ---------- Lernweg ---------- */
const conf = id => ((P().conf || {})[id] || {}).v || 0;
const journal = id => (P().journal || {})[id];
function reviewList(list) { return list.filter(l => conf(l.id) === 1 || (quizRes(l.id) && !quizRes(l.id).ok && conf(l.id) !== 3)); }
function daysHtml(n) {
  const days = P().days || {}, out = [], t = new Date(); let cnt = 0;
  for (let i = n - 1; i >= 0; i--) { const d = new Date(t); d.setDate(t.getDate() - i); const k = dayKey(d), on = !!days[k]; if (on) cnt++; out.push('<i class="' + (on ? "on" : "") + (i === 0 ? " today" : "") + '" title="' + k + '"></i>'); }
  return { html: '<div class="days" aria-label="' + tt("Lerntage der letzten vier Wochen", "Learning days in the last four weeks") + '">' + out.join("") + "</div>", count: cnt, total: Object.keys(days).length };
}
const CONF = () => [[3, tt("Sitzt", "Got it")], [2, tt("Geht so", "So so")], [1, tt("Unsicher", "Unsure")]];
function confChip(v) { const c = CONF().find(x => x[0] === v); return c ? '<span class="conf c' + v + '">' + c[1] + "</span>" : ""; }

/* ---------- Kleine Helfer ---------- */
function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 2600);
}
function go(h) { if (location.hash === "#" + h) route(); else location.hash = h; }
function setSeg(seg, attr, val) {
  if (!seg) return;
  const btns = [...seg.querySelectorAll("button")];
  btns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset[attr] === val)));
  const on = btns.find(b => b.dataset[attr] === val), ind = seg.querySelector(".ind");
  if (on && ind) { ind.style.width = on.offsetWidth + "px"; ind.style.transform = "translateX(" + (on.offsetLeft - 3) + "px)"; }
}
function segHtml(id, attr, cls, items, label) { return '<div class="seg ' + cls + '" id="' + id + '" role="group" aria-label="' + label + '"><span class="ind" aria-hidden="true"></span>' + items.map(([v, t]) => '<button data-' + attr + '="' + v + '" aria-pressed="false">' + t + "</button>").join("") + "</div>"; }
const langSeg = id => segHtml(id, "lang", "lang", [["de", "DE"], ["en", "EN"]], tt("Sprache", "Language"));
const osSeg = id => segHtml(id, "os", "os", [["mac", "Mac"], ["win", "Win"]], tt("Tastatur", "Keyboard"));
function bindLang(id, after) {
  const s = document.getElementById(id); if (!s) return;
  setSeg(s, "lang", prefs.lang);
  s.addEventListener("click", e => { const b = e.target.closest("button"); if (!b || b.dataset.lang === prefs.lang) return; prefs.lang = b.dataset.lang; savePrefs(); document.documentElement.lang = prefs.lang; after(); });
}
function bindOs(id) {
  const s = document.getElementById(id); if (!s) return;
  setSeg(s, "os", prefs.os);
  s.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; prefs.os = b.dataset.os; savePrefs(); document.querySelectorAll(".seg.os").forEach(x => setSeg(x, "os", prefs.os)); rerender(); });
}
function scFind(ref) { const [k, p] = ref.split("@"); return SC.find(s => s.k === k && (!p || s.p === p)); }
function tcOf(min) { const h = 1 + Math.floor(min / 60), m = min % 60; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":00:00"; }
function lines(s) { return String(s || "").split("\n").map(x => x.trim()).filter(Boolean); }
const MARK = '<span class="mark">228<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0v10M0 5h10" stroke="currentColor" stroke-width="1"/></svg></span>';

/* ---------- Anmeldung ---------- */
function renderLogin() {
  shellUp = false;
  document.body.className = "is-login";
  const local = store.mode === "local";
  root.innerHTML =
    '<div class="login"><div class="lgbox">' +
    '<div class="lgtop"><div class="lgbrand">' + MARK + '<span class="bt">' + tt("Schnittkurs", "Editing course") + "</span></div>" + langSeg("lglang") + "</div>" +
    "<h1>" + tt("Wer bist du?", "Who are you?") + "</h1>" +
    '<div class="lgtiles">' +
    '<button class="lgtile" data-who="kamila" style="--mc:#4f8fe0"><span class="clipsw"></span><b>Kamila</b><span>' + tt("Ich lerne schneiden", "I'm learning to edit") + "</span></button>" +
    '<button class="lgtile" data-who="romeo" style="--mc:#e6c44a"><span class="clipsw"></span><b>Romeo</b><span>' + tt("Ich unterrichte", "I'm teaching") + "</span></button>" +
    "</div>" +
    '<form class="lgform" id="lgform" hidden autocomplete="on">' +
    '<input type="text" name="username" id="lguser" autocomplete="username" hidden>' +
    '<p class="lgwho" id="lgwho"></p>' +
    '<label class="fld"><span>' + tt("Passwort", "Password") + '</span><input type="password" id="pw" autocomplete="current-password" minlength="6" required></label>' +
    '<label class="fld" id="pw2wrap" hidden><span>' + tt("Passwort wiederholen", "Repeat password") + '</span><input type="password" id="pw2" autocomplete="new-password" minlength="6"></label>' +
    '<p class="lgerr" id="lgerr" role="alert"></p>' +
    '<button class="btn pri" type="submit" id="lgsubmit">' + tt("Anmelden", "Sign in") + "</button>" +
    '<button class="btn ghost" type="button" id="lgmode">' + tt("Zum ersten Mal hier? Passwort festlegen", "First time here? Set a password") + "</button>" +
    '<button class="btn ghost" type="button" id="lgback">' + tt("Andere Person wählen", "Choose another person") + "</button>" +
    "</form>" +
    (local ? '<p class="note">' + tt("Vorschau ohne Datenbank. Der Stand bleibt nur in diesem Browser.", "Preview without database. Progress stays in this browser only.") + "</p>" : '<p class="note">' + tt("Einmal angemeldet, bleibst du auf diesem Gerät angemeldet.", "Once signed in, you stay signed in on this device.") + "</p>") +
    (store.status.ok ? "" : '<p class="lgerr">' + esc(store.status.msg) + "</p>") +
    "</div></div>";
  bindLang("lglang", renderLogin);
  let w = null, create = false;
  const form = root.querySelector("#lgform"), tiles = root.querySelector(".lgtiles"), err = root.querySelector("#lgerr");
  const setMode = c => {
    create = c;
    root.querySelector("#pw2wrap").hidden = !c;
    root.querySelector("#pw").autocomplete = c ? "new-password" : "current-password";
    root.querySelector("#lgsubmit").textContent = c ? tt("Passwort festlegen und starten", "Set password and start") : tt("Anmelden", "Sign in");
    root.querySelector("#lgmode").textContent = c ? tt("Ich habe schon ein Passwort", "I already have a password") : tt("Zum ersten Mal hier? Passwort festlegen", "First time here? Set a password");
    err.textContent = "";
  };
  root.querySelectorAll(".lgtile").forEach(b => b.addEventListener("click", async () => {
    w = b.dataset.who;
    if (local) { await store.signIn(w, ""); return; }
    tiles.hidden = true; form.hidden = false;
    root.querySelector("#lguser").value = ACCOUNTS[w].email;
    root.querySelector("#lgwho").innerHTML = "<b>" + who(w).name + "</b>, " + who(w).role;
    root.querySelector("#pw").focus();
  }));
  root.querySelector("#lgmode").addEventListener("click", () => setMode(!create));
  root.querySelector("#lgback").addEventListener("click", () => { form.hidden = true; tiles.hidden = false; setMode(false); });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const pw = root.querySelector("#pw").value, pw2 = root.querySelector("#pw2").value;
    if (pw.length < 6) { err.textContent = tt("Das Passwort braucht mindestens 6 Zeichen.", "The password needs at least 6 characters."); return; }
    if (create && pw !== pw2) { err.textContent = tt("Die beiden Passwörter sind nicht gleich.", "The two passwords don't match."); return; }
    const btn = root.querySelector("#lgsubmit"); btn.disabled = true; err.textContent = "";
    try { create ? await store.signUp(w, pw) : await store.signIn(w, pw); }
    catch (ex) {
      const c = (ex && ex.code) || "";
      err.textContent =
        /invalid-credential|wrong-password|user-not-found|invalid-login/.test(c) ? tt("Das Passwort stimmt nicht. Beim allerersten Mal tippst du unten auf Passwort festlegen.", "Wrong password. The very first time, tap Set a password below.") :
        /email-already-in-use/.test(c) ? tt("Für " + who(w).name + " gibt es schon ein Passwort. Bitte normal anmelden.", who(w).name + " already has a password. Please sign in normally.") :
        /weak-password/.test(c) ? tt("Das Passwort ist zu schwach, nimm mindestens 6 Zeichen.", "The password is too weak, use at least 6 characters.") :
        /too-many-requests/.test(c) ? tt("Zu viele Versuche. Warte kurz und probier es dann noch einmal.", "Too many attempts. Wait a moment and try again.") :
        /network-request-failed/.test(c) ? tt("Keine Internetverbindung.", "No internet connection.") :
        /operation-not-allowed/.test(c) ? tt("Die Anmeldung per Passwort ist in Firebase noch nicht eingeschaltet.", "Password sign in is not enabled in Firebase yet.") :
        tt("Anmelden hat nicht geklappt", "Sign in failed") + " (" + c + ").";
      btn.disabled = false;
    }
  });
}

/* ---------- Rahmen ---------- */
function renderShell() {
  shellUp = true;
  document.body.className = "";
  const u = who(me());
  root.innerHTML =
    '<header class="top"><div class="wrap topin">' +
    '<button class="brand" id="brand" aria-label="' + tt("Zur Startseite", "Home") + '">' + MARK + '<span class="bt">' + tt("Schnittkurs", "Editing course") + "</span></button>" +
    '<nav class="nav" aria-label="' + tt("Bereiche", "Sections") + '"><div class="seg" id="navseg" role="group"><span class="ind" aria-hidden="true"></span>' +
    '<button data-v="kurs" aria-pressed="true">' + (me() === "romeo" ? "Kamila" : tt("Kurs", "Course")) + '</button><button data-v="fragen" aria-pressed="false">' + tt("Fragen", "Q&amp;A") + '<b class="nb" id="navbadge" hidden></b></button><button data-v="shortcuts" aria-pressed="false"><span class="lg">Shortcuts</span><span class="sm">' + tt("Tasten", "Keys") + '</span></button><button data-v="lexikon" aria-pressed="false">' + tt("Lexikon", "Glossary") + "</button></div></nav>" +
    '<div class="tools">' + langSeg("langseg") +
    '<div class="ring" title="' + tt("Kamilas Fortschritt", "Kamila's progress") + '"><svg viewBox="0 0 40 40" aria-hidden="true"><circle class="bgc" cx="20" cy="20" r="16"/><circle class="fgc" id="ringc" cx="20" cy="20" r="16" stroke-dasharray="100.53" stroke-dashoffset="100.53"/></svg><span id="ringt" class="num">0/0</span></div>' +
    '<div class="ub"><button class="avatar" id="avatar" aria-haspopup="true" aria-expanded="false" aria-label="' + u.name + '" style="--mc:' + (me() === "romeo" ? "#e6c44a" : "#4f8fe0") + '">' + u.name[0] + '<i class="sync" id="syncdot"></i></button>' +
    '<div class="umenu" id="umenu" hidden><b>' + u.name + '</b><span class="mute">' + u.role + '</span><span class="syncl" id="syncl"></span>' +
    '<span class="mute small">' + tt("Tastatur für Shortcuts", "Keyboard for shortcuts") + "</span>" + osSeg("osmenu") +
    (me() === "romeo" ? '<button class="switch" role="switch" aria-checked="' + viewAs + '" id="viewas"><span class="sw"></span>' + tt("Als Kamila ansehen", "View as Kamila") + "</button>" : "") +
    '<button class="btn sec" id="logout">' + tt("Abmelden", "Sign out") + "</button></div></div></div></div></header>" +
    '<div id="banner"></div>' +
    '<main><div class="wrap" id="view"></div></main>' +
    '<footer><div class="wrap"><span>' + tt("228 Schnittkurs für Kamila, von Romeo. Stand DaVinci Resolve 21.1, Shortcuts aus dem offiziellen Handbuch dieser Version.", "228 editing course for Kamila, by Romeo. Based on DaVinci Resolve 21.1, shortcuts from the official manual of that version.") + "</span><span>" + (store.mode === "local" ? tt("Vorschau ohne Datenbank", "Preview without database") : tt("Gespeichert in der Datenbank, auf jedem Gerät gleich", "Saved in the database, the same on every device")) + "</span></div></footer>";
  document.getElementById("navseg").addEventListener("click", e => { const b = e.target.closest("button"); if (b) go(b.dataset.v); });
  document.getElementById("brand").addEventListener("click", () => go("kurs"));
  bindLang("langseg", () => { renderShell(); route(true); });
  bindOs("osmenu");
  const av = document.getElementById("avatar"), um = document.getElementById("umenu");
  av.addEventListener("click", e => { e.stopPropagation(); um.hidden = !um.hidden; av.setAttribute("aria-expanded", String(!um.hidden)); if (!um.hidden) setSeg(document.getElementById("osmenu"), "os", prefs.os); });
  document.addEventListener("click", e => { if (!um.hidden && !e.target.closest(".ub")) { um.hidden = true; av.setAttribute("aria-expanded", "false"); } });
  document.getElementById("logout").addEventListener("click", async () => { viewAs = false; editing = null; await store.signOut(); });
  const va = document.getElementById("viewas");
  if (va) va.addEventListener("click", () => { viewAs = !viewAs; va.setAttribute("aria-checked", String(viewAs)); editing = null; paintBanner(); rerender(); });
  paintStatus(); paintBanner();
}
function paintBanner() {
  const b = document.getElementById("banner"); if (!b) return;
  let h = "";
  if (viewAs) h += '<div class="banner"><div class="wrap"><span>' + tt("Du siehst den Kurs so, wie Kamila ihn sieht. Nichts wird gespeichert.", "You are seeing the course the way Kamila sees it. Nothing is saved.") + '</span><button class="btn sec" id="endview">' + tt("Zurück zur Lehreransicht", "Back to teacher view") + "</button></div></div>";
  if (!store.status.ok) h += '<div class="banner warn"><div class="wrap"><span>' + esc(store.status.msg) + "</span></div></div>";
  b.innerHTML = h;
  const e = document.getElementById("endview");
  if (e) e.addEventListener("click", () => { viewAs = false; const va = document.getElementById("viewas"); if (va) va.setAttribute("aria-checked", "false"); paintBanner(); rerender(); });
}
function paintStatus() {
  const d = document.getElementById("syncdot"), l = document.getElementById("syncl");
  if (!d) return;
  const off = !navigator.onLine, pend = store.pending > 0, bad = !store.status.ok;
  d.className = "sync " + (store.mode === "local" ? "loc" : bad ? "bad" : off ? "off" : pend ? "pend" : "ok");
  l.textContent = store.mode === "local" ? tt("Vorschau, nur in diesem Browser", "Preview, this browser only") : bad ? tt("Problem beim Speichern", "Problem saving") : off ? tt("Offline, wird später gespeichert", "Offline, will save later") : pend ? tt("Wird gespeichert", "Saving") : tt("Alles gespeichert", "Everything saved");
}
function updRing() {
  const list = visible(), d = list.filter(l => isDone(l.id)).length, c = document.getElementById("ringc");
  if (!c) return;
  c.style.strokeDashoffset = String(100.53 * (1 - (list.length ? d / list.length : 0)));
  document.getElementById("ringt").textContent = d + "/" + list.length;
  const nb = document.getElementById("navbadge"), u = viewAs ? 0 : unreadTotal();
  if (nb) { nb.hidden = !u; nb.textContent = u; }
}

/* ---------- Navigation ---------- */
function route(keepScroll) {
  if (!store.user) return;
  if (!shellUp) renderShell();
  const y = window.scrollY;
  const h = (location.hash || "").replace("#", "");
  let v = "kurs";
  const m = /^lektion-([a-z0-9]+)$/.exec(h);
  if (m && findLesson(m[1])) { if (editing && editing !== m[1]) editing = null; renderLesson(m[1]); }
  else if (h === "shortcuts") { v = "shortcuts"; renderShortcuts(); }
  else if (h === "lexikon") { v = "lexikon"; renderLexikon(); }
  else if (h === "fragen") { v = "fragen"; renderFragen(); }
  else { editing = null; renderHome(); }
  setSeg(document.getElementById("navseg"), "v", v);
  window.scrollTo(0, keepScroll === true ? y : 0);
}
function rerender() {
  if (!store.user || !shellUp) return;
  const y = window.scrollY;
  if (cur.view === "lesson" && findLesson(cur.id)) renderLesson(cur.id);
  else if (cur.view === "shortcuts") renderShortcuts(true);
  else if (cur.view === "lexikon") renderLexikon();
  else if (cur.view === "fragen") renderFragen();
  else renderHome();
  window.scrollTo(0, y);
}
window.addEventListener("hashchange", () => route());
window.addEventListener("resize", () => { document.querySelectorAll(".seg.os").forEach(x => setSeg(x, "os", prefs.os)); document.querySelectorAll(".seg.lang").forEach(x => setSeg(x, "lang", prefs.lang)); const c = document.querySelector("#navseg button[aria-pressed=true]"); if (c) setSeg(document.getElementById("navseg"), "v", c.dataset.v); });
window.addEventListener("online", paintStatus); window.addEventListener("offline", paintStatus);

/* ---------- Timeline und Modulliste ---------- */
function timelineHtml(list, curId, label) {
  const total = list.reduce((a, l) => a + (+l.min || 0), 0) || 1;
  let acc = 0; const starts = {}; list.forEach(l => { starts[l.id] = acc; acc += +l.min || 0; });
  const ph = curId && starts[curId] !== undefined ? starts[curId] : (list.length && list.every(l => isDone(l.id)) ? total : 0);
  const marks = [0, 60, 120, 180, 240, 300].filter(m => m <= total);
  return '<section class="tl" aria-label="Timeline"><div class="tlhead"><span class="label">' + label + '</span><span class="tc">' + tcOf(ph) + "</span></div>" +
    '<div class="tlgrid"><span></span><div class="ruler">' + marks.map((m, i) => { const x = m / total * 100, last = i === marks.length - 1 && x > 85; return '<i style="left:' + x + '%"></i><span class="' + (i > 0 && !last ? "mid" : "") + '" style="' + (last ? "left:calc(" + x + "% - 3px);transform:translateX(-100%)" : "left:calc(" + x + "% + 3px)") + '">' + tcOf(m) + "</span>"; }).join("") + "</div>" +
    '<span class="tlh">V1</span><div class="tlbody"><div class="track">' +
    list.map(l => '<button class="tclip' + (isDone(l.id) ? " done" : "") + (l.id === curId ? " cur" : "") + (l.hidden ? " hid" : "") + '" style="left:' + (starts[l.id] / total * 100) + "%;width:calc(" + ((+l.min || 0) / total * 100) + "% - 2px);--mc:" + l.m.color + '" data-go="lektion-' + l.id + '" aria-label="' + tt("Lektion ", "Lesson ") + l.n + ": " + esc(l.title) + '"><span>' + l.n + "</span></button>").join("") + "</div>" +
    '<div class="mrow">' + MODS.map(m => { const f = list.find(l => l.mod === m.id); return f ? '<span style="left:' + (starts[f.id] / total * 100) + "%;--mc:" + m.color + '">' + esc(modName(m)) + "</span>" : ""; }).join("") + "</div>" +
    '<div class="ph" style="left:' + (ph / total * 100) + '%"></div></div></div></section>';
}
function modulesHtml(list, nextId) {
  const admin = isAdmin();
  return '<div class="mods">' + MODS.map(m => {
    const ls = list.filter(l => l.mod === m.id);
    if (!ls.length && !admin) return "";
    const d = ls.filter(l => isDone(l.id) && !l.hidden).length, tot = ls.filter(l => !l.hidden).length;
    return '<section class="mod" style="--mc:' + m.color + '"><div class="modh"><span class="clipsw"></span><h2>' + esc(modTitle(m)) + "</h2>" + (m.key ? kbd(m.key) : "") + '<span class="cnt">' + d + "/" + tot + '</span></div><p class="modd">' + esc(modDesc(m)) + "</p>" +
      ls.map(l => {
        const unread = admin ? unreadFor("romeo", l.id) : unreadFor("kamila", l.id);
        const q = quizRes(l.id);
        const marks = admin ? '<span class="amk">' + (exDone(l.id) ? '<i title="' + tt("Übung gemacht", "Exercise done") + '">' + tt("Ü", "E") + "</i>" : "") + (q ? '<i class="' + (q.ok ? "g" : "r") + '" title="Check">C</i>' : "") + (l.hidden ? '<i class="h">' + tt("aus", "off") + "</i>" : "") + (l.edited || l.custom ? '<i class="e">' + tt("neu", "new") + "</i>" : "") + "</span>" : "";
        return '<button class="lrow' + (isDone(l.id) ? " done" : "") + (l.id === nextId ? " next" : "") + (l.hidden ? " hid" : "") + '" data-go="lektion-' + l.id + '"><span class="n">' + String(l.n).padStart(2, "0") + '</span><span class="t">' + esc(l.title) + (unread ? '<b class="dot">' + unread + "</b>" : "") + "</span>" + (marks || '<span class="m">' + (+l.min || 0) + " Min</span>") + '<span class="st">' + CHECK + "</span></button>";
      }).join("") +
      (admin ? '<button class="addl" data-add="' + m.id + '">' + tt("+ Lektion in " + modName(m) + " hinzufügen", "+ Add a lesson to " + modName(m)) + "</button>" : "") +
      "</section>";
  }).join("") + "</div>";
}
function bindCommon() {
  const v = document.getElementById("view");
  v.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
  v.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", () => {
    const id = "c" + now().toString(36);
    store.write("course", { lessons: { [id]: { custom: true, mod: b.dataset.add, created: now(), min: 10, keys: [], [prefs.lang]: { title: tt("Neue Lektion", "New lesson"), why: "", steps: [], tips: [], task: "", romeo: "", quiz: null } } } });
    editing = id; go("lektion-" + id);
  }));
}

/* ---------- Startseiten ---------- */
function renderHome() {
  cur = { view: "home", id: null };
  const v = document.getElementById("view");
  if (isAdmin()) { v.innerHTML = dashboardHtml(); bindCommon(); bindDashboard(); updRing(); return; }
  const list = visible(), nx = nextOf(list), la = lastOpened(list), all = !nx;
  const resume = la && !isDone(la.id) ? la : nx;
  const left = list.filter(l => !isDone(l.id)).reduce((a, l) => a + (+l.min || 0), 0);
  const msgs = allThreads().filter(id => unreadFor("kamila", id));
  const doneN = list.filter(l => isDone(l.id)).length;
  let h = '<section class="hero"><span class="label">' + tt("DaVinci Resolve 21 für Einsteiger", "DaVinci Resolve 21 for beginners") + "</span><h1>" + tt("Kamila lernt<br>schneiden.", "Kamila learns<br>to edit.") + "</h1>" +
    "<p>" + tt(list.length + " Lektionen vom leeren Ordner bis zum fertigen Export, Seite für Seite durch Resolve. Romeo erklärt, du probierst aus, und hier schlägst du später alles nach.", list.length + " lessons from an empty folder to the finished export, page by page through Resolve. Romeo explains, you try it out, and later you look everything up here.") + "</p></section>";
  if (msgs.length) h += '<div class="cont msgcard"><div class="ct"><span class="label">' + tt("Romeo hat dir geantwortet", "Romeo replied to you") + "</span><b>" + msgs.map(id => esc(threadLabel(id))).join(", ") + '</b></div><button class="btn sec" data-go="fragen">' + tt("Lesen", "Read") + "</button></div>";
  const lab = all ? tt("Alles geschafft", "All done") : la && resume === la ? tt("Weiter, wo du warst", "Pick up where you left off") : doneN ? tt("Weiter mit", "Continue with") : tt("Los geht es mit", "Start with");
  h += '<div class="cont"><div class="ct"><span class="label">' + lab + "</span><b>" + (all ? tt("Alle Lektionen abgeschlossen. Zeit für den nächsten Film.", "All lessons completed. Time for the next film.") : tt("Lektion ", "Lesson ") + resume.n + ": " + esc(resume.title)) + '</b><span class="mute num">' + tt(doneN + " von " + list.length + " abgeschlossen", doneN + " of " + list.length + " completed") + (left ? tt(", noch rund ", ", about ") + fmtMin(left) + tt("", " to go") : "") + (la ? tt(". Zuletzt geöffnet ", ". Last opened ") + when(P().last.at) : "") + "</span></div>" +
    '<button class="btn pri" data-go="lektion-' + (all ? list[list.length - 1].id : resume.id) + '">' + (all ? tt("Abschluss ansehen", "See the final lesson") : tt("Lektion starten", "Start lesson")) + "</button></div>";
  h += lernwegHtml(list, false);
  h += timelineHtml(list, all ? null : resume.id, tt("Dein Kurs als Timeline", "Your course as a timeline"));
  h += modulesHtml(list, all ? null : resume.id);
  v.innerHTML = h; bindCommon(); updRing();
}
function lernwegHtml(list, admin) {
  const d = daysHtml(28), rev = reviewList(list);
  const js = list.filter(l => journal(l.id)).sort((a, b) => journal(b.id).at - journal(a.id).at);
  const cs = [3, 2, 1].map(v => list.filter(l => conf(l.id) === v).length);
  const openQ = allThreads().filter(id => threadState(id).open).length;
  const who_ = admin ? tt("Kamilas", "Kamila's") : tt("Dein", "Your");
  return '<section class="lw" aria-label="' + tt("Lernweg", "Learning path") + '"><div class="lwhead"><span class="label">' + who_ + tt(" Lernweg", " learning path") + '</span><span class="mute small num">' +
    tt(d.total + (d.total === 1 ? " Lerntag" : " Lerntage") + ", davon " + d.count + " in den letzten 4 Wochen", d.total + (d.total === 1 ? " learning day" : " learning days") + ", " + d.count + " in the last 4 weeks") + "</span></div>" + d.html +
    '<div class="lwstats num"><span>' + confChip(3) + " " + cs[0] + "</span><span>" + confChip(2) + " " + cs[1] + "</span><span>" + confChip(1) + " " + cs[2] + '</span><button class="lwq" data-go="fragen">' + tt(openQ + (openQ === 1 ? " offene Frage" : " offene Fragen"), openQ + (openQ === 1 ? " open question" : " open questions")) + "</button></div>" +
    '<div class="lwcols"><div><span class="label">' + tt("Zum Wiederholen", "To review") + "</span>" +
    (rev.length ? '<div class="evl">' + rev.map(l => '<button class="evr" data-go="lektion-' + l.id + '"><span>' + tt("Lektion ", "Lesson ") + l.n + ": " + esc(l.title) + "<small>" + (conf(l.id) === 1 ? tt("als unsicher markiert", "marked as unsure") : tt("Check beim ersten Versuch falsch", "check wrong the first time")) + "</small></span>" + confChip(conf(l.id)) + "</button>").join("") + "</div>" : '<p class="mute small">' + (admin ? tt("Nichts offen.", "Nothing open.") : tt("Nichts offen. Wenn du dich in einer Lektion unsicher fühlst, markier es dort, dann taucht sie hier auf.", "Nothing open. If you feel unsure in a lesson, mark it there and it shows up here.")) + "</p>") +
    '</div><div><span class="label">' + tt("Notizen", "Notes") + "</span>" +
    (js.length ? '<div class="evl">' + js.slice(0, admin ? 50 : 4).map(l => '<button class="evr jn" data-go="lektion-' + l.id + '"><span>' + esc(journal(l.id).t) + "<small>" + tt("Lektion ", "Lesson ") + l.n + ": " + esc(l.title) + ", " + when(journal(l.id).at) + "</small></span></button>").join("") + "</div>" : '<p class="mute small">' + (admin ? tt("Noch keine Notizen.", "No notes yet.") : tt("Am Ende jeder Lektion kannst du festhalten, was du mitnimmst.", "At the end of each lesson you can note what you take away.")) + "</p>") +
    "</div></div></section>";
}

function evText(e, l) {
  const n = l ? l.n : "?", s = e.s != null ? e.s : "?";
  const D = { open: ["hat Lektion " + n + " geöffnet", "opened lesson " + n], done: ["hat Lektion " + n + " abgeschlossen", "completed lesson " + n], undone: ["hat Lektion " + n + " wieder geöffnet", "reopened lesson " + n], ex: ["hat die Übung in Lektion " + n + " gemacht", "did the exercise in lesson " + n], quiz_ok: ["hat den Check in Lektion " + n + " richtig beantwortet", "answered the check in lesson " + n + " correctly"], quiz_bad: ["hat den Check in Lektion " + n + " falsch beantwortet", "got the check in lesson " + n + " wrong"], msg: [l ? "hat eine Frage zu Lektion " + n + " gestellt" : "hat eine allgemeine Frage gestellt", l ? "asked a question about lesson " + n : "asked a general question"], comment: [l ? "hat Lektion " + n + " kommentiert" : "hat einen Kommentar geschrieben", l ? "commented on lesson " + n : "wrote a comment"], conf: ["hat Lektion " + n + " als " + (["", "unsicher", "geht so", "sitzt"][e.v || 0] || "") + " eingeschätzt", "rated lesson " + n + " as " + (["", "unsure", "so so", "got it"][e.v || 0] || "")], journal: ["hat eine Notiz zu Lektion " + n + " geschrieben", "wrote a note on lesson " + n], trainer: ["hat im Shortcut Training " + s + " von 10 geschafft", "scored " + s + " of 10 in shortcut training"] }[e.type];
  return D ? tt(D[0], D[1]) : e.type;
}
function dashboardHtml() {
  const vis = visible(), all = lessons(), p = P();
  const done = vis.filter(l => isDone(l.id)).length, la = lastOpened(vis);
  const qs = vis.map(l => quizRes(l.id)).filter(Boolean), qok = qs.filter(q => q.ok).length;
  const exs = vis.filter(l => exDone(l.id)).length;
  const chk = Object.keys(p.check || {}).length, tr = p.trainer;
  const unread = allThreads().filter(id => threadState(id).open || unreadFor("romeo", id));
  const of = tt(" von ", " of ");
  let h = '<section class="phead"><span class="label">' + tt("Lehreransicht", "Teacher view") + "</span><h1>" + tt("Kamilas Stand.", "Kamila's progress.") + "</h1><p>" +
    (p.active ? tt(done + " von " + vis.length + " Lektionen abgeschlossen. Zuletzt aktiv " + when(p.active), done + " of " + vis.length + " lessons completed. Last active " + when(p.active)) + (la ? tt(", zuletzt geöffnet hat sie Lektion " + la.n + ": ", ", the last lesson she opened is " + la.n + ": ") + esc(la.title) + "." : ".")
      : tt("Kamila hat noch nicht angefangen. Sobald sie sich anmeldet und Lektionen öffnet, siehst du hier jeden Schritt.", "Kamila hasn't started yet. As soon as she signs in and opens lessons, you'll see every step here.")) + "</p></section>";
  h += timelineHtml(vis, la ? la.id : null, tt("Kamilas Kurs, der Playhead steht, wo sie zuletzt war", "Kamila's course, the playhead sits where she was last"));
  h += '<div class="dash"><section><span class="label">' + tt("Auf einen Blick", "At a glance") + '</span><dl class="facts">' +
    "<div><dt>" + tt("Lektionen abgeschlossen", "Lessons completed") + "</dt><dd>" + done + of + vis.length + "</dd></div>" +
    "<div><dt>" + tt("Übungen gemacht", "Exercises done") + "</dt><dd>" + exs + "</dd></div>" +
    "<div><dt>" + tt("Checks beim ersten Versuch richtig", "Checks right first time") + "</dt><dd>" + (qs.length ? qok + of + qs.length : tt("noch keine", "none yet")) + "</dd></div>" +
    "<div><dt>" + tt("Shortcut Training, beste Runde", "Shortcut training, best round") + "</dt><dd>" + (tr ? tr.best + of + "10, " + tr.rounds + " " + (tr.rounds === 1 ? tt("Runde", "round") : tt("Runden", "rounds")) : tt("noch nicht geübt", "not practised yet")) + "</dd></div>" +
    "<div><dt>" + tt("Checkliste erster Film", "First film checklist") + "</dt><dd>" + chk + of + "16</dd></div>" +
    "<div><dt>" + tt("Zuletzt aktiv", "Last active") + "</dt><dd>" + (p.active ? when(p.active) : tt("noch nie", "never")) + "</dd></div></dl>" +
    MODS.map(m => { const ls = vis.filter(l => l.mod === m.id); if (!ls.length) return ""; const d = ls.filter(l => isDone(l.id)).length; return '<div class="mbar" style="--mc:' + m.color + '"><span>' + esc(modName(m)) + '</span><span class="mb"><i style="width:' + (d / ls.length * 100) + '%"></i></span><span class="num">' + d + "/" + ls.length + "</span></div>"; }).join("") +
    "</section><section>" +
    '<span class="label">' + tt("Fragen von Kamila", "Questions from Kamila") + "</span>" +
    (unread.length ? '<div class="evl">' + unread.map(id => '<button class="evr unread" data-go="fragen"><span>' + esc(threadLabel(id)) + "</span>" + statusChip(id) + (unreadFor("romeo", id) ? '<b class="dot">' + unreadFor("romeo", id) + "</b>" : "") + "</button>").join("") + "</div>" : '<p class="mute small">' + tt("Keine offenen Fragen.", "No open questions.") + "</p>") +
    '<span class="label" style="margin-top:22px">' + tt("Verlauf", "Activity") + "</span>" +
    (store.state.events.length ? '<div class="evl">' + store.state.events.slice(0, 14).map(e => { const l = e.lid ? all.find(x => x.id === e.lid) : null; return '<button class="evr"' + (l ? ' data-go="lektion-' + l.id + '"' : "") + "><span>Kamila " + evText(e, l) + (l ? "<small>" + esc(l.title) + "</small>" : "") + '</span><time class="mute small">' + when(e.t) + "</time></button>"; }).join("") + "</div>" : '<p class="mute small">' + tt("Noch keine Einträge.", "No entries yet.") + "</p>") +
    "</section></div>";
  h += lernwegHtml(vis, true);
  h += '<section class="phead" style="padding-top:40px"><span class="label">' + tt("Kurs anpassen", "Adapt the course") + '</span><h2 class="h2">' + tt("Lektionen bearbeiten.", "Edit lessons.") + "</h2><p>" + tt("Tipp eine Lektion an, um sie zu ändern, für Kamila auszublenden oder ihr zu schreiben. Ü heißt Übung gemacht, C zeigt den ersten Check in Grün oder Rot.", "Tap a lesson to change it, hide it from Kamila or write to her. E means exercise done, C shows the first check in green or red.") + "</p></section>";
  h += modulesHtml(all, la ? la.id : null);
  h += '<div class="danger"><span id="resetbox"><button class="btn ghost" id="reset">' + tt("Kamilas Fortschritt zurücksetzen", "Reset Kamila's progress") + "</button></span></div>";
  return h;
}
function bindDashboard() {
  const rb = document.getElementById("resetbox");
  const plain = () => '<button class="btn ghost" id="reset">' + tt("Kamilas Fortschritt zurücksetzen", "Reset Kamila's progress") + "</button>";
  rb.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.id === "reset") rb.innerHTML = '<span class="confirm"><span>' + tt("Kamilas ganzen Fortschritt löschen?", "Delete all of Kamila's progress?") + '</span><button class="btn sec" id="rno">' + tt("Abbrechen", "Cancel") + '</button><button class="btn pri" id="ryes">' + tt("Ja, löschen", "Yes, delete") + "</button></span>";
    else if (t.id === "rno") rb.innerHTML = plain();
    else if (t.id === "ryes") { store.write("progress", { done: DELETE, ex: DELETE, quiz: DELETE, check: DELETE, seen: DELETE, last: DELETE, trainer: DELETE, active: DELETE, conf: DELETE, journal: DELETE, days: DELETE }); toast(tt("Kamilas Fortschritt ist zurückgesetzt.", "Kamila's progress has been reset.")); }
  });
}

/* ---------- Lektion ---------- */
function renderLesson(id) {
  cur = { view: "lesson", id };
  const v = document.getElementById("view");
  const list = lessons(), idx = list.findIndex(l => l.id === id), l = list[idx], m = l.m;
  const prev = list[idx - 1], next = list[idx + 1], admin = isAdmin();
  if (admin && editing === id) { v.innerHTML = editHtml(l); bindEdit(l); updRing(); return; }
  if (me() === "kamila" && !viewAs) openedLesson(l);
  let h = '<div class="col" style="--mc:' + m.color + '"><div class="lhead"><button class="btn ghost" data-go="kurs">← ' + (admin ? tt("Lehreransicht", "Teacher view") : tt("Übersicht", "Overview")) + "</button>" +
    (admin ? '<div class="abtns"><button class="btn sec" id="editbtn">' + tt("Bearbeiten", "Edit") + '</button><button class="btn sec" id="hidebtn">' + (l.hidden ? tt("Für Kamila einblenden", "Show to Kamila") : tt("Für Kamila ausblenden", "Hide from Kamila")) + "</button></div>" : "") + "</div>";
  if (admin) h += '<div class="kstat" id="kstat"></div>';
  h += '<div class="lmeta"><span class="chip"><span class="clipsw"></span>' + esc(modTitle(m)) + '</span><span class="x">' + tt("Lektion " + l.n + " von " + list.length, "Lesson " + l.n + " of " + list.length) + '</span><span class="x">' + (+l.min || 0) + " Min</span>" + (l.hidden ? '<span class="x warnc">' + tt("für Kamila ausgeblendet", "hidden from Kamila") + "</span>" : "") + '<span class="x okc" id="donetag"></span></div>' +
    '<h1 class="ltitle">' + esc(l.title) + ".</h1>" + (l.why ? '<p class="lead">' + T(l.why) + "</p>" : "");
  h += shotsHtml(l);
  if (l.widget && WIDGETS[l.widget]) h += '<div class="sec" id="wg"></div>';
  if (l.steps && l.steps.length) h += '<div class="sec"><span class="label">' + (l.rules ? tt("Die Regeln", "The rules") : tt("Schritt für Schritt", "Step by step")) + "</span>" + (l.rules ? '<ul class="rules">' : '<ol class="steps">') + l.steps.map(s => "<li><span>" + T(s) + "</span></li>").join("") + (l.rules ? "</ul>" : "</ol>") + "</div>";
  if (l.tips && l.tips.length) h += '<div class="sec"><span class="label">' + tt("Merken", "Remember") + '</span><ul class="tips">' + l.tips.map(s => "<li><span>" + T(s) + "</span></li>").join("") + "</ul></div>";
  const ks = (l.keys || []).map(scFind).filter(Boolean);
  if (ks.length) h += '<div class="sec"><span class="label">' + tt("Shortcuts in dieser Lektion", "Shortcuts in this lesson") + '</span><div class="klist">' + ks.map(s => '<div class="krow">' + kbd(s.k) + '<span class="f">' + T(scF(s)) + "</span></div>").join("") + "</div></div>";
  if (admin && l.romeo) h += '<div class="sec romeo"><span class="label">' + tt("Für dich, so erklärst du es", "For you, how to explain it") + "</span><p>" + T(l.romeo) + "</p></div>";
  if (l.task) h += '<div class="sec task"><span class="label">' + tt("Übung", "Exercise") + "</span><p>" + T(l.task) + '</p><button class="chk" role="checkbox" aria-checked="false" id="exchk"' + (admin ? " disabled" : "") + '><span class="bx">' + CHECK + "</span>" + (admin ? tt("Kamila hat die Übung gemacht", "Kamila did the exercise") : tt("Übung gemacht", "Exercise done")) + "</button></div>";
  if (l.quiz && l.quiz.q) h += '<div class="sec quiz" id="quiz"><span class="label">Check</span><p class="q">' + T(l.quiz.q) + "</p>" + l.quiz.a.map((a, i) => '<button class="qopt" data-i="' + i + '"' + (admin ? " disabled" : "") + '><span class="ltr">' + "ABC"[i] + "</span><span>" + T(a) + "</span></button>").join("") + '<p class="qwhy" id="qwhy" hidden></p></div>';
  if (!admin) h += '<div class="sec reflect" id="reflect"><span class="label">' + tt("Wie sicher fühlst du dich?", "How confident do you feel?") + '</span><div class="wbtns confseg" role="group">' + CONF().map(c => '<button type="button" data-conf="' + c[0] + '" aria-pressed="false">' + c[1] + "</button>").join("") + "</div>" +
    '<label class="fld"><span>' + tt("Deine Notiz zur Lektion", "Your note on this lesson") + " <em>" + tt("Romeo sieht sie", "Romeo can see it") + '</em></span><textarea id="jt" rows="2" placeholder="' + tt("Was nimmst du mit? Was war schwer?", "What do you take away? What was hard?") + '"></textarea></label>' +
    '<div class="jrow"><button type="button" class="btn sec" id="jsave">' + tt("Notiz speichern", "Save note") + '</button><span class="mute small" id="jstate"></span></div></div>';
  h += '<div class="sec thread" id="thread"><div class="thead"><span class="label">' + (admin ? tt("Fragen und Kommentare von Kamila", "Questions and comments from Kamila") : tt("Frage oder Kommentar an Romeo", "Question or comment for Romeo")) + '</span><span id="qstatus"></span></div><div class="msgs" id="msgs"></div>' + threadFormHtml(id) + "</div>";
  h += '<div class="finish">' + (admin ? '<button class="chk" role="checkbox" aria-checked="false" id="donebtn"><span class="bx">' + CHECK + "</span>" + tt("Für Kamila als abgeschlossen markieren", "Mark as completed for Kamila") + "</button>" : '<button class="btn pri" id="donebtn">' + tt("Lektion abschließen", "Complete lesson") + "</button>") +
    '<div class="pn"><button ' + (prev ? 'data-go="lektion-' + prev.id + '"' : "disabled") + "><small>" + tt("Zurück", "Back") + "</small><span>" + (prev ? esc(prev.title) : "") + "</span></button><button " + (next ? 'data-go="lektion-' + next.id + '"' : 'data-go="kurs"') + "><small>" + (next ? tt("Weiter", "Next") : tt("Fertig", "Done")) + "</small><span>" + (next ? esc(next.title) : tt("Zur Übersicht", "To the overview")) + "</span></button></div></div></div>";
  v.innerHTML = h; bindCommon(); updRing();

  if (admin) {
    document.getElementById("editbtn").addEventListener("click", () => { editing = id; renderLesson(id); window.scrollTo(0, 0); });
    document.getElementById("hidebtn").addEventListener("click", () => { store.write("course", { lessons: { [id]: { hidden: l.hidden ? DELETE : true } } }); toast(l.hidden ? tt("Lektion ist für Kamila wieder sichtbar.", "The lesson is visible to Kamila again.") : tt("Lektion ist für Kamila ausgeblendet.", "The lesson is hidden from Kamila.")); });
  }
  const ex = document.getElementById("exchk");
  if (ex && !admin) ex.addEventListener("click", () => { const on = !exDone(id); learnerSet({ ex: { [id]: on ? now() : DELETE } }, on ? "ex" : null, id); paintLesson(); });
  document.getElementById("donebtn").addEventListener("click", () => {
    const on = !isDone(id);
    if (admin) { store.write("progress", { done: { [id]: on ? now() : DELETE } }); paintLesson(); return; }
    learnerSet({ done: { [id]: on ? now() : DELETE } }, on ? "done" : "undone", id); paintLesson();
    if (on && !viewAs) toast(next ? tt("Abgeschlossen. Weiter geht es mit ", "Completed. Next up: ") + next.title + "." : tt("Abgeschlossen. Der ganze Kurs ist geschafft.", "Completed. You've finished the whole course."));
  });
  if (l.quiz && l.quiz.q && !admin) document.querySelectorAll(".qopt").forEach(o => o.addEventListener("click", () => {
    const i = +o.dataset.i, ok = i === l.quiz.ok;
    if (!quizRes(id) && canWrite()) learnerSet({ quiz: { [id]: { ok, at: now(), pick: i } } }, ok ? "quiz_ok" : "quiz_bad", id);
    showQuiz(l, i);
  }));
  bindThreadForms(v, () => paintThread(l));
  const rf = document.getElementById("reflect");
  if (rf) {
    rf.querySelectorAll("[data-conf]").forEach(b => b.addEventListener("click", () => {
      const val = +b.dataset.conf, on = conf(id) !== val;
      if (!canWrite()) return;
      learnerSet({ conf: { [id]: on ? { v: val, at: now() } : DELETE } }, null, id);
      if (on && me() === "kamila") store.log("conf", id, { v: val });
      paintLesson();
    }));
    document.getElementById("jsave").addEventListener("click", () => {
      const t = document.getElementById("jt").value.trim();
      if (!canWrite()) return;
      learnerSet({ journal: { [id]: t ? { t, at: now() } : DELETE } }, null, id);
      if (t && me() === "kamila") store.log("journal", id);
      document.getElementById("jstate").textContent = t ? tt("Gespeichert", "Saved") : tt("Notiz gelöscht", "Note removed");
    });
  }
  if (l.widget && WIDGETS[l.widget]) WIDGETS[l.widget](document.getElementById("wg"), l, {
    readonly: admin,
    check: () => Object.keys(P().check || {}).map(Number),
    setCheck: (i, on) => learnerSet({ check: { [i]: on ? true : DELETE } }, null, id)
  });
  bindShots(v);
  paintLesson();
  markRead(id);
}

/* ---------- Bildstrecken mit echten Screenshots ---------- */
function shotsHtml(l) {
  if (!l.shots || !l.shots.length) return "";
  const lab = s => (s.title ? s.title[prefs.lang] || s.title.de : "");
  return '<div class="sec shots">' + l.shots.map((s, si) => {
    const [W, H] = IMG[s.img];
    return '<figure class="shot" data-img="' + s.img + '">' +
      '<figcaption class="label">' + T(lab(s)) + "</figcaption>" +
      '<div class="shimg" style="aspect-ratio:' + W + "/" + H + '"><img src="img/' + s.img + '.jpg" width="' + W + '" height="' + H + '" alt="' + esc(lab(s).replace(/\[\[|\]\]/g, "")) + '"' + (si ? ' loading="lazy"' : "") + ">" +
      s.spots.map((p, i) => '<button class="spot' + (i ? "" : " on") + '" data-i="' + i + '" style="left:' + p[0][0] + "%;top:" + p[0][1] + "%;width:" + p[0][2] + "%;height:" + p[0][3] + '%" aria-label="' + tt("Punkt ", "Point ") + (i + 1) + '"><b>' + (i + 1) + "</b></button>").join("") +
      '<button class="shbig" aria-label="' + tt("Bild groß ansehen", "View image large") + '"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8V3h5M17 12v5h-5M3 3l5 5M17 17l-5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>' +
      '<div class="shdet"><div class="lens" aria-hidden="true"></div><ol class="shlist">' +
      s.spots.map((p, i) => '<li><button data-i="' + i + '" aria-pressed="' + !i + '"><b>' + (i + 1) + "</b><span>" + T(EN() ? p[2] : p[1]) + "</span></button></li>").join("") +
      "</ol>" + (isAdmin() ? "" : '<button class="btn ghost askspot" type="button">' + tt("Frage zu diesem Punkt stellen", "Ask about this point") + "</button>") + "</div></figure>";
  }).join("") + "</div>";
}
function setSpot(fig, i) {
  const s = findShot(fig); if (!s) return;
  fig.querySelectorAll(".spot").forEach(b => b.classList.toggle("on", +b.dataset.i === i));
  fig.querySelectorAll(".shlist button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.i === i)));
  fig.dataset.on = String(i);
  paintLens(fig);
}
function findShot(fig) { const l = findLesson(cur.id); if (!l || !l.shots) return null; return l.shots.find(s => s.img === fig.dataset.img) || null; }
function paintLens(fig) {
  const s = findShot(fig), lens = fig.querySelector(".lens"); if (!s || !lens) return;
  const i = +(fig.dataset.on || 0), [x, y, w, h] = s.spots[i][0], [W, H] = IMG[s.img];
  const bw = lens.clientWidth, bh = lens.clientHeight; if (!bw || !bh) return;
  const pad = 1.35, rw = Math.max(w, 6) / 100 * W * pad, rh = Math.max(h, 6) / 100 * H * pad;
  const sc = Math.min(bw / rw, bh / rh, 3);
  const sw = W * sc, sh = H * sc, cx = (x + w / 2) / 100 * sw, cy = (y + h / 2) / 100 * sh;
  lens.style.backgroundImage = "url(img/" + s.img + ".jpg)";
  lens.style.backgroundSize = sw + "px " + sh + "px";
  lens.style.backgroundPosition = (bw / 2 - cx) + "px " + (bh / 2 - cy) + "px";
  lens.style.setProperty("--rx", (bw / 2 - w / 200 * sw) + "px"); lens.style.setProperty("--ry", (bh / 2 - h / 200 * sh) + "px");
  lens.style.setProperty("--rw", (w / 100 * sw) + "px"); lens.style.setProperty("--rh", (h / 100 * sh) + "px");
}
function bindShots(v) {
  v.querySelectorAll(".shot").forEach(fig => {
    fig.querySelectorAll(".spot, .shlist button").forEach(b => b.addEventListener("click", () => setSpot(fig, +b.dataset.i)));
    fig.querySelector(".shbig").addEventListener("click", () => openBig(fig.dataset.img));
    const ask = fig.querySelector(".askspot");
    if (ask) ask.addEventListener("click", () => {
      const s = findShot(fig); if (!s) return;
      const i = +(fig.dataset.on || 0), title = s.title ? s.title[prefs.lang] || s.title.de : "";
      const st = qform[cur.id] || (qform[cur.id] = { kind: "q", ref: "" });
      st.ref = title + tt(", Punkt ", ", point ") + (i + 1);
      const form = document.querySelector('#thread form.msgf'); if (!form) return;
      const rc = form.querySelector(".refchip"); rc.hidden = false; rc.querySelector("span").innerHTML = T(st.ref);
      form.scrollIntoView({ block: "center" }); form.querySelector("textarea").focus();
    });
    const img = fig.querySelector("img"); if (img && !img.complete) img.addEventListener("load", () => paintLens(fig));
    paintLens(fig);
  });
}
function openBig(name) {
  const [W, H] = IMG[name];
  const ov = document.createElement("div"); ov.className = "bigov"; ov.setAttribute("role", "dialog");
  ov.innerHTML = '<div class="bigbar"><span class="mute small">' + tt("Zum Vergrößern wischen oder scrollen", "Swipe or scroll to explore") + '</span><button class="btn sec" id="bigclose">' + tt("Schließen", "Close") + '</button></div><div class="bigscroll"><img src="img/' + name + '.jpg" width="' + W + '" height="' + H + '" alt=""></div>';
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
  const close = () => { ov.remove(); document.body.style.overflow = ""; document.removeEventListener("keydown", esc_); };
  const esc_ = e => { if (e.key === "Escape") close(); };
  ov.querySelector("#bigclose").addEventListener("click", close); document.addEventListener("keydown", esc_);
  ov.querySelector("#bigclose").focus();
}
window.addEventListener("resize", () => document.querySelectorAll(".shot").forEach(paintLens));
function openedLesson(l) {
  const t = now();
  store.write("progress", { last: { id: l.id, at: t }, seen: { [l.id]: t }, active: t });
  if (!openLog[l.id] || t - openLog[l.id] > 10 * 60000) { openLog[l.id] = t; store.log("open", l.id); }
}
function markRead(id) {
  if (viewAs || !me()) return;
  const w = me();
  if (unreadFor(w, id)) store.write("notes", { read: { [w === "romeo" ? "r" : "k"]: { [id]: now() } } });
}
function showQuiz(l, pick) {
  const qwhy = document.getElementById("qwhy"); if (!qwhy) return;
  document.querySelectorAll(".qopt").forEach(o => { const oi = +o.dataset.i; o.classList.toggle("ok", oi === l.quiz.ok); o.classList.toggle("bad", oi === pick && pick !== l.quiz.ok); });
  qwhy.hidden = false;
  qwhy.innerHTML = (pick === l.quiz.ok ? "<b>" + tt("Richtig.", "Correct.") + "</b> " : "<b>" + tt("Nicht ganz.", "Not quite.") + "</b> ") + T(l.quiz.why || "");
}
function paintThread(l) {
  const box = document.getElementById("msgs"); if (!box) return;
  const th = threadOf(l.id);
  box.innerHTML = th.length ? th.map(msgHtml).join("") :
    '<p class="mute small">' + (isAdmin() ? tt("Noch keine Nachrichten zu dieser Lektion.", "No messages about this lesson yet.") : tt("Wenn etwas unklar ist, schreib es hier hin. Zu einem Bildpunkt fragst du direkt beim Bild.", "If something is unclear, write it here. To ask about a point in a picture, use the button next to the picture.")) + "</p>";
  const qs = document.getElementById("qstatus"); if (qs) qs.innerHTML = statusChip(l.id);
  const form = document.querySelector("#thread form.msgf");
  if (form && isAdmin()) { const has = !!form.querySelector(".qclose"); if (has !== threadState(l.id).open) { form.outerHTML = threadFormHtml(l.id); bindThreadForms(document.getElementById("thread"), () => paintThread(l)); } }
}
function paintLesson() {
  if (cur.view !== "lesson") return;
  const l = findLesson(cur.id); if (!l) return;
  const admin = isAdmin(), d = isDone(l.id), p = P();
  const db = document.getElementById("donebtn");
  if (db) { if (admin) db.setAttribute("aria-checked", String(d)); else { db.className = "btn " + (d ? "done" : "pri"); db.textContent = d ? tt("Abgeschlossen ✓", "Completed ✓") : tt("Lektion abschließen", "Complete lesson"); } }
  const tag = document.getElementById("donetag"); if (tag) tag.textContent = d ? (admin ? tt("Kamila hat abgeschlossen", "Kamila completed it") : tt("Abgeschlossen", "Completed")) : "";
  const ex = document.getElementById("exchk"); if (ex) ex.setAttribute("aria-checked", String(exDone(l.id)));
  const q = quizRes(l.id);
  if (l.quiz && l.quiz.q) {
    const w = document.getElementById("qwhy");
    if (admin) {
      document.querySelectorAll(".qopt").forEach(o => { const oi = +o.dataset.i; o.classList.toggle("ok", oi === l.quiz.ok); o.classList.toggle("bad", !!q && q.pick === oi && oi !== l.quiz.ok); });
      if (w) { w.hidden = false; w.innerHTML = q ? "<b>" + (q.ok ? tt("Kamila lag beim ersten Versuch richtig.", "Kamila was right the first time.") : tt("Kamila lag beim ersten Versuch falsch.", "Kamila was wrong the first time.")) + "</b> " + T(l.quiz.why || "") : tt("Kamila hat den Check noch nicht beantwortet. Grün ist die richtige Antwort.", "Kamila hasn't answered the check yet. Green is the right answer."); }
    } else if (q && q.ok && w && w.hidden) showQuiz(l, l.quiz.ok);
  }
  const ks = document.getElementById("kstat");
  if (ks) {
    const seen = (p.seen || {})[l.id];
    ks.innerHTML = '<span class="label">' + tt("Kamila in dieser Lektion", "Kamila in this lesson") + '</span><dl class="facts compact">' +
      "<div><dt>Status</dt><dd>" + (d ? tt("abgeschlossen ", "completed ") + when(p.done[l.id]) : seen ? tt("angefangen", "started") : tt("noch nicht geöffnet", "not opened yet")) + "</dd></div>" +
      "<div><dt>" + tt("Zuletzt geöffnet", "Last opened") + "</dt><dd>" + (seen ? when(seen) : tt("noch nie", "never")) + "</dd></div>" +
      "<div><dt>" + tt("Übung", "Exercise") + "</dt><dd>" + (exDone(l.id) ? tt("gemacht ", "done ") + when(p.ex[l.id]) : tt("offen", "open")) + "</dd></div>" +
      "<div><dt>Check</dt><dd>" + (q ? (q.ok ? tt("beim ersten Versuch richtig", "right first time") : tt("beim ersten Versuch falsch", "wrong first time")) : tt("offen", "open")) + "</dd></div>" +
      "<div><dt>" + tt("Selbsteinschätzung", "Self assessment") + "</dt><dd>" + (conf(l.id) ? confChip(conf(l.id)) : tt("offen", "open")) + "</dd></div></dl>" +
      (journal(l.id) ? '<p class="jnote"><span class="label">' + tt("Ihre Notiz", "Her note") + "</span>" + esc(journal(l.id).t) + ' <span class="mute small">' + when(journal(l.id).at) + "</span></p>" : "");
  }
  const rf = document.getElementById("reflect");
  if (rf) {
    rf.querySelectorAll("[data-conf]").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.conf === conf(l.id))));
    const jt = document.getElementById("jt"), jn = journal(l.id);
    if (jt && document.activeElement !== jt && !jt.dataset.touched) jt.value = jn ? jn.t : "";
    if (jt && !jt.dataset.bound) { jt.dataset.bound = "1"; jt.addEventListener("input", () => { jt.dataset.touched = "1"; }); }
  }
  paintThread(l);
  if (l.widget === "checklist" && WIDGETS.checklist.refresh) WIDGETS.checklist.refresh();
}

/* ---------- Bearbeiten (Romeo) ---------- */
function editHtml(l) {
  const qz = l.quiz || { q: "", a: ["", "", ""], ok: 0, why: "" };
  const a = (qz.a || []).concat(["", "", ""]).slice(0, 3);
  const f = (id, label, val, rows, hint) => '<label class="fld"><span>' + label + (hint ? " <em>" + hint + "</em>" : "") + "</span>" + (rows ? '<textarea id="' + id + '" rows="' + rows + '">' + esc(val) + "</textarea>" : '<input id="' + id + '" value="' + esc(val) + '">') + "</label>";
  return '<div class="col" style="--mc:' + l.m.color + '"><div class="lhead"><button class="btn ghost" id="ecancel">← ' + tt("Abbrechen", "Cancel") + '</button><span class="label">' + tt("Lektion " + l.n + " bearbeiten", "Edit lesson " + l.n) + "</span></div>" +
    '<p class="note" style="margin:0 0 18px">' + tt("Du bearbeitest die deutsche Fassung. Für die englische oben auf EN umstellen.", "You are editing the English version. Switch to DE at the top for the German one.") + "</p>" +
    '<form class="edit" id="editf">' +
    f("e_title", tt("Titel", "Title"), l.title) +
    '<div class="erow"><label class="fld"><span>' + tt("Modul", "Module") + '</span><select id="e_mod">' + MODS.map(m => '<option value="' + m.id + '"' + (m.id === l.mod ? " selected" : "") + ">" + esc(modName(m)) + "</option>").join("") + '</select></label><label class="fld"><span>' + tt("Minuten", "Minutes") + '</span><input id="e_min" type="number" min="1" max="240" value="' + (+l.min || 10) + '"></label></div>' +
    f("e_why", tt("Darum geht es", "What it's about"), l.why, 3) +
    f("e_steps", l.rules ? tt("Regeln", "Rules") : tt("Schritte", "Steps"), (l.steps || []).join("\n"), 7, tt("eine Zeile je Schritt", "one line per step")) +
    f("e_tips", tt("Merken", "Remember"), (l.tips || []).join("\n"), 4, tt("eine Zeile je Punkt", "one line per point")) +
    f("e_task", tt("Übung", "Exercise"), l.task, 2) +
    f("e_romeo", tt("Deine Notiz zum Erklären", "Your note for explaining"), l.romeo, 3, tt("sieht nur du", "only you see this")) +
    f("e_keys", "Shortcuts", (l.keys || []).join(", "), 0, tt("mit Komma, zum Beispiel shift+4, cmd+B", "comma separated, for example shift+4, cmd+B")) +
    '<fieldset class="efs"><legend class="label">Check</legend>' + f("e_q", tt("Frage", "Question"), qz.q) +
    a.map((x, i) => '<div class="erow ans"><label class="radio"><input type="radio" name="e_ok" value="' + i + '"' + ((qz.ok || 0) === i ? " checked" : "") + "><span>" + "ABC"[i] + tt(" richtig", " correct") + "</span></label>" + f("e_a" + i, tt("Antwort ", "Answer ") + "ABC"[i], x) + "</div>").join("") +
    f("e_qwhy", tt("Erklärung nach der Antwort", "Explanation after answering"), qz.why, 2) + "</fieldset>" +
    '<p class="note">' + tt("Tasten schreibst du im Text in doppelten eckigen Klammern, zum Beispiel [[cmd+B]] oder [[shift+cmd+lbr]]. Daraus werden Tastenkappen.", "Write keys in the text in double square brackets, for example [[cmd+B]] or [[shift+cmd+lbr]]. They turn into key caps.") + "</p>" +
    '<div class="ebtns"><button class="btn pri" type="submit">' + tt("Speichern", "Save") + '</button><button class="btn sec" type="button" id="ecancel2">' + tt("Abbrechen", "Cancel") + "</button>" +
    (l.custom ? '<button class="btn ghost danger" type="button" id="edel">' + tt("Lektion löschen", "Delete lesson") + "</button>" : (l.edited ? '<button class="btn ghost" type="button" id="erestore">' + tt("Original wiederherstellen", "Restore original") + "</button>" : "")) + "</div></form></div>";
}
function bindEdit(l) {
  const id = l.id, val = x => document.getElementById(x).value;
  const cancel = () => { editing = null; renderLesson(id); };
  document.getElementById("ecancel").addEventListener("click", cancel);
  document.getElementById("ecancel2").addEventListener("click", cancel);
  document.getElementById("editf").addEventListener("submit", e => {
    e.preventDefault();
    const q = val("e_q").trim();
    const text = {
      title: val("e_title").trim() || tt("Ohne Titel", "Untitled"), why: val("e_why").trim(), steps: lines(val("e_steps")), tips: lines(val("e_tips")), task: val("e_task").trim(), romeo: val("e_romeo").trim(),
      quiz: q ? { q, a: [0, 1, 2].map(i => val("e_a" + i).trim()), ok: +(document.querySelector("input[name=e_ok]:checked") || { value: 0 }).value, why: val("e_qwhy").trim() } : null
    };
    store.write("course", { lessons: { [id]: { mod: val("e_mod"), min: Math.max(1, +val("e_min") || 10), keys: val("e_keys").split(",").map(s => s.trim()).filter(Boolean), [prefs.lang]: text } } });
    editing = null; toast(tt("Gespeichert. Kamila sieht die Änderung sofort.", "Saved. Kamila sees the change right away.")); renderLesson(id); window.scrollTo(0, 0);
  });
  const del = document.getElementById("edel");
  if (del) del.addEventListener("click", () => { if (del.dataset.sure) { store.write("course", { lessons: { [id]: DELETE } }); editing = null; toast(tt("Lektion gelöscht.", "Lesson deleted.")); go("kurs"); } else { del.dataset.sure = "1"; del.textContent = tt("Wirklich löschen?", "Really delete?"); } });
  const rs = document.getElementById("erestore");
  if (rs) rs.addEventListener("click", () => { store.write("course", { lessons: { [id]: { [prefs.lang]: DELETE, keys: DELETE, min: DELETE, mod: DELETE } } }); editing = null; toast(tt("Originaltext ist wiederhergestellt.", "The original text is restored.")); renderLesson(id); });
}

/* ---------- Shortcuts ---------- */
let F = { g: "Alle", q: "", must: false };
const GROUPS = ["Alle", "Seiten", "Projekt", "Ansicht", "Wiedergabe", "Markieren", "Einsetzen", "Schneiden", "Trimmen", "Effekte", "Ton", "Color", "Fusion"];
const KB_DE = [["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P", "Ü"], ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä"], ["Y", "X", "C", "V", "B", "N", "M", "comma", "period", "-"]];
const KB_EN = [["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "["], ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"], ["Z", "X", "C", "V", "B", "N", "M", "comma", "period", "/"]];
let TR = null;
function renderShortcuts(keep) {
  cur = { view: "shortcuts", id: null };
  const v = document.getElementById("view"), tr = P().trainer, rows = EN() ? KB_EN : KB_DE;
  let h = '<section class="phead"><span class="label">Shortcuts</span><h1>' + tt("Die Tasten der Profis.", "The keys the pros use.") + "</h1><p>" + tt("Die Standardbelegung von DaVinci Resolve 21, abgeglichen mit dem offiziellen Handbuch der Version 21.1. Was als Pflicht markiert ist, solltest du ohne Nachdenken können.", "The default layout of DaVinci Resolve 21, checked against the official manual of version 21.1. Anything marked as essential should become second nature.") + '</p><div class="ostog"><span class="mute small">' + tt("Tasten anzeigen für", "Show keys for") + "</span>" + osSeg("ospage") + "</div></section>";
  h += '<div class="kb" aria-label="' + tt("Tastatur mit belegten Tasten", "Keyboard with assigned keys") + '">' +
    rows.map((r, ri) => '<div class="kbr r' + (ri + 1) + '">' + (ri ? '<span class="kk blank"></span>' : "") + r.map(k => { const hits = SC.filter(s => s.k === k); const lab = k === "comma" ? "," : k === "period" ? "." : k; return hits.length ? '<button class="kk on" data-k="' + k + '" aria-pressed="false">' + lab + "</button>" : '<span class="kk">' + esc(lab) + "</span>"; }).join("") + (ri ? '<span class="kk blank"></span>' : "") + "</div>").join("") +
    '<div class="kbr r4"><span></span><button class="kk on sp" data-k="space" aria-pressed="false">' + tt("Leertaste", "Space") + '</button><span></span></div>' +
    '<div class="kbinfo" id="kbinfo"><span>' + tt("Tipp eine helle Taste an. Fast jede Taste in Resolve hat eine Aufgabe, ohne Zusatztaste gedrückt.", "Tap a light key. Almost every key in Resolve does something on its own, without a modifier.") + "</span></div></div>";
  h += '<section class="trainer" id="trainer"></section>' + (tr ? '<p class="note" style="margin-top:-18px;margin-bottom:26px">' + (isAdmin() ? tt("Kamilas beste Runde: ", "Kamila's best round: ") : tt("Deine beste Runde: ", "Your best round: ")) + tr.best + tt(" von 10, insgesamt ", " of 10, ") + tr.rounds + " " + (tr.rounds === 1 ? tt("Runde.", "round in total.") : tt("Runden.", "rounds in total.")) + "</p>" : "");
  h += '<div class="search"><input id="scq" type="search" placeholder="' + tt("Suchen, zum Beispiel Marker oder Ripple", "Search, for example marker or ripple") + '" value="' + esc(F.q) + '" aria-label="' + tt("Shortcuts durchsuchen", "Search shortcuts") + '"><button class="switch" role="switch" aria-checked="' + F.must + '" id="mustsw"><span class="sw"></span>' + tt("Nur Pflicht", "Essentials only") + "</button></div>";
  h += '<div class="filt" role="group">' + GROUPS.map(g => '<button data-g="' + g + '" aria-pressed="' + (F.g === g) + '">' + groupName(g) + "</button>").join("") + "</div>";
  h += '<div class="sct" id="sct"></div><p class="note">' + tt("Am MacBook brauchen die F Tasten und Pos1 oder Ende meist zusätzlich fn. Forward Delete ist fn und ⌫. Resolve richtet sich nach dem Zeichen auf der Taste, auf deutscher Tastatur liegen = und − deshalb an anderer Stelle als auf amerikanischer.", "On a MacBook the F keys and Home or End usually need fn as well. Forward Delete is fn and ⌫. Resolve goes by the character on the key, so on a German keyboard = and − sit in different places than on a US keyboard.") + "</p>";
  v.innerHTML = h; bindCommon(); updRing(); bindOs("ospage");
  const info = v.querySelector("#kbinfo");
  v.querySelectorAll(".kk.on").forEach(b => b.addEventListener("click", () => { v.querySelectorAll(".kk.on").forEach(x => x.setAttribute("aria-pressed", String(x === b))); info.innerHTML = SC.filter(s => s.k === b.dataset.k).map(s => "<span>" + kbd(s.k) + " <b>" + T(scF(s)) + '</b> <span style="color:var(--faint)">' + esc(s.p === "Alle" ? pageName(s.p) : s.p + " Page") + "</span></span>").join(""); }));
  const q = v.querySelector("#scq"); q.addEventListener("input", () => { F.q = q.value; table(); });
  v.querySelector("#mustsw").addEventListener("click", e => { F.must = !F.must; e.currentTarget.setAttribute("aria-checked", String(F.must)); table(); });
  v.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => { F.g = b.dataset.g; v.querySelectorAll("[data-g]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); table(); }));
  table(); trainer(keep ? TR : null);
}
function table() {
  const q = F.q.trim().toLowerCase();
  const rows = SC.filter(s => (F.g === "Alle" || s.g === F.g) && (!F.must || s.must) && (!q || (scF(s) + " " + s.f + " " + groupName(s.g) + " " + s.p + " " + caps(s.k).join(" ")).toLowerCase().includes(q)));
  document.getElementById("sct").innerHTML = rows.length ? '<div class="scr hd"><span>' + tt("Taste", "Key") + "</span><span>" + tt("Funktion", "Function") + '</span><span style="text-align:right">' + tt("Seite", "Page") + "</span></div>" + rows.map(s => '<div class="scr"><span class="k">' + kbd(s.k) + "</span><span>" + T(scF(s)) + (s.must ? '<span class="must">' + tt("Pflicht", "Essential") + "</span>" : "") + '</span><span class="pg">' + esc(pageName(s.p)) + "</span></div>").join("") : '<p class="empty">' + tt("Nichts gefunden. Versuch ein anderes Wort oder wähl die Gruppe Alle.", "Nothing found. Try another word or choose the group All.") + "</p>";
}
const CODE = { space: "Space", left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown", del: "Backspace", fdel: "Delete" };
function trainer(old) {
  const box = document.getElementById("trainer");
  const pool = SC.filter(s => s.t);
  const touch = window.matchMedia("(hover: none)").matches;
  const newRound = () => { TR.round = [...pool].sort(() => Math.random() - .5).slice(0, 10); TR.i = 0; TR.res = []; TR.answered = false; TR.saved = false; };
  if (old) TR = old; else { TR = { mode: touch ? "choice" : "keys" }; newRound(); }
  const match = (combo, e) => {
    const parts = combo.split("+"), main = parts[parts.length - 1];
    const want = { shift: parts.includes("shift"), cmd: parts.includes("cmd"), opt: parts.includes("opt") };
    const cmdKey = prefs.os === "mac" ? e.metaKey : e.ctrlKey;
    if (want.shift !== e.shiftKey || want.cmd !== cmdKey || want.opt !== e.altKey) return false;
    if (CODE[main]) return e.code === CODE[main];
    if (/^\d$/.test(main)) return e.code === "Digit" + main || e.key === main;
    if (/^[A-Z]$/.test(main)) { const k = (e.key || "").toUpperCase(); return k === main || ((e.altKey || e.metaKey || e.ctrlKey) && e.code === "Key" + main); }
    return false;
  };
  const answer = ok => { TR.res[TR.i] = ok; TR.answered = true; const d = box.querySelectorAll(".dots i")[TR.i]; if (d) d.className = ok ? "ok" : "bad"; const sk = box.querySelector("#trskip"); if (sk) sk.textContent = tt("Weiter", "Next"); };
  const saveRound = () => {
    if (TR.saved || me() !== "kamila" || viewAs) return; TR.saved = true;
    const ok = TR.res.filter(Boolean).length, t = P().trainer || { best: 0, rounds: 0 };
    store.write("progress", { trainer: { best: Math.max(t.best || 0, ok), rounds: (t.rounds || 0) + 1, last: ok, at: now() }, active: now() });
    store.log("trainer", null, { s: ok });
  };
  const pad0 = tt("Hier klicken, dann die Tasten drücken", "Click here, then press the keys");
  const rend = () => {
    const done = TR.i >= TR.round.length, c = TR.round[TR.i];
    let h = '<div class="trfoot"><span class="label">' + tt("Shortcut Training", "Shortcut training") + '</span><div class="wbtns" role="group"><button data-tm="keys" aria-pressed="' + (TR.mode === "keys") + '">' + tt("Mit Tastatur", "With keyboard") + '</button><button data-tm="choice" aria-pressed="' + (TR.mode === "choice") + '">' + tt("Antwort wählen", "Pick an answer") + "</button></div></div>";
    if (done) { saveRound(); const ok = TR.res.filter(Boolean).length; h += '<p class="trq">' + tt(ok + " von " + TR.round.length + " richtig.", ok + " of " + TR.round.length + " correct.") + '</p><p class="mute" style="margin:0">' + (ok >= 9 ? tt("Sehr stark. Die sitzen.", "Excellent. You've got these.") : ok >= 6 ? tt("Gut. Die falschen kommen in der nächsten Runde vielleicht wieder.", "Good. The ones you missed may come up again next round.") : tt("Noch eine Runde, mit jeder wird es leichter.", "One more round, it gets easier every time.")) + '</p><div><button class="btn pri" id="trnew">' + tt("Neue Runde", "New round") + "</button></div>"; }
    else {
      h += '<p class="trq">' + T(scF(c)) + '<br><span class="mute" style="font-size:.8rem;font-weight:400">' + esc(c.p === "Alle" ? tt("gilt überall", "works everywhere") : tt("in der " + c.p + " Page", "on the " + c.p + " page")) + "</span></p>";
      if (TR.mode === "keys") h += '<div class="trpad" id="trpad" tabindex="0">' + pad0 + "</div>";
      else { const opts = [c, ...pool.filter(s => s.k !== c.k).sort(() => Math.random() - .5).slice(0, 3)].sort(() => Math.random() - .5); h += '<div class="trch">' + opts.map(o => '<button data-k="' + o.k + '">' + kbd(o.k) + "</button>").join("") + "</div>"; }
      h += '<div class="trfoot"><div class="dots">' + TR.round.map((x, i) => '<i class="' + (TR.res[i] === true ? "ok" : TR.res[i] === false ? "bad" : "") + '"></i>').join("") + '</div><button class="btn sec" id="trskip">' + (TR.answered ? tt("Weiter", "Next") : tt("Überspringen", "Skip")) + "</button></div>";
    }
    box.innerHTML = h;
    box.querySelectorAll("[data-tm]").forEach(b => b.addEventListener("click", () => { TR.mode = b.dataset.tm; rend(); }));
    const nb = box.querySelector("#trnew"); if (nb) nb.addEventListener("click", () => { newRound(); rend(); });
    const sk = box.querySelector("#trskip"); if (sk) sk.addEventListener("click", () => { if (!TR.answered) TR.res[TR.i] = false; TR.i++; TR.answered = false; rend(); });
    if (done) return;
    if (TR.mode === "choice") box.querySelectorAll(".trch button").forEach(b => b.addEventListener("click", () => { if (TR.answered) return; const ok = b.dataset.k === c.k; b.classList.add(ok ? "ok" : "bad"); if (!ok) box.querySelector('.trch button[data-k="' + CSS.escape(c.k) + '"]').classList.add("ok"); answer(ok); }));
    else {
      const pad = box.querySelector("#trpad");
      pad.addEventListener("focus", () => { if (!TR.answered) { pad.classList.add("armed"); pad.textContent = tt("Bereit. Drück die Tasten.", "Ready. Press the keys."); } });
      pad.addEventListener("blur", () => { if (!TR.answered) { pad.classList.remove("armed"); pad.textContent = pad0; } });
      pad.addEventListener("keydown", e => {
        if (["Shift", "Meta", "Alt", "Control", "CapsLock", "Tab"].includes(e.key)) return;
        e.preventDefault();
        if (TR.answered) { TR.i++; TR.answered = false; rend(); const p = box.querySelector("#trpad"); if (p) p.focus(); return; }
        const ok = match(c.k, e); pad.classList.remove("armed"); pad.classList.add(ok ? "ok" : "bad");
        pad.innerHTML = (ok ? tt("Richtig ", "Correct ") : tt("Gesucht war ", "The answer was ")) + kbd(c.k) + '<br><span class="mute" style="font-size:.82rem">' + tt("Beliebige Taste für weiter", "Any key to continue") + "</span>"; answer(ok);
      });
    }
  };
  rend();
}

/* ---------- Fragen-Seite ---------- */
let QF = "open";
function renderFragen() {
  cur = { view: "fragen", id: null };
  const v = document.getElementById("view"), admin = isAdmin();
  const ids = allThreads().sort((a, b) => threadState(b).last - threadState(a).last);
  const openN = ids.filter(id => threadState(id).open).length;
  const shown = QF === "open" ? ids.filter(id => threadState(id).open || unreadFor(admin ? "romeo" : "kamila", id)) : ids;
  const opts = '<option value="' + GEN + '">' + tt("Allgemein", "General") + "</option>" + visible().map(l => '<option value="' + l.id + '">' + esc(tt("Lektion ", "Lesson ") + l.n + ": " + l.title) + "</option>").join("");
  let h = '<section class="phead"><span class="label">' + tt("Fragen und Kommentare", "Questions and comments") + "</span><h1>" + (admin ? tt("Kamilas Fragen.", "Kamila's questions.") : tt("Frag Romeo.", "Ask Romeo.")) + "</h1><p>" +
    (admin ? tt(openN + (openN === 1 ? " Frage ist offen." : " Fragen sind offen.") + " Antworte direkt hier oder in der Lektion. Erledigt schließt eine Frage, bis Kamila nachfragt.", openN + (openN === 1 ? " question is open." : " questions are open.") + " Reply right here or in the lesson. Resolved closes a question until Kamila asks again.")
      : tt("Frag alles, was unklar ist, oder halte einen Gedanken als Kommentar fest. Romeo antwortet hier und in der Lektion. Zu einem Bildpunkt fragst du am besten direkt beim Bild.", "Ask anything that's unclear, or keep a thought as a comment. Romeo replies here and in the lesson. To ask about a point in a picture, use the button next to the picture.")) + "</p></section>";
  if (!admin) h += '<section class="qnew"><label class="fld"><span>' + tt("Wozu?", "About what?") + '</span><select id="qlesson">' + opts + "</select></label>" + threadFormHtml("new") + "</section>";
  h += '<div class="qbar"><div class="wbtns" role="group"><button data-qf="open" aria-pressed="' + (QF === "open") + '">' + tt("Offen und neu", "Open and new") + '</button><button data-qf="all" aria-pressed="' + (QF === "all") + '">' + tt("Alle", "All") + " " + ids.length + "</button></div></div>";
  h += shown.length ? '<div class="qlist">' + shown.map(id => '<section class="qthread" data-id="' + id + '"><div class="thead"><button class="qlink" ' + (id === GEN ? "" : 'data-go="lektion-' + id + '"') + ">" + esc(threadLabel(id)) + "</button>" + statusChip(id) + '</div><div class="msgs">' + threadOf(id).map(msgHtml).join("") + "</div>" + threadFormHtml(id, true) + "</section>").join("") + "</div>"
    : '<p class="empty">' + (QF === "open" ? (admin ? tt("Keine offenen Fragen. Unter Alle findest du jedes Gespräch.", "No open questions. All shows every conversation.") : tt("Nichts offen. Unter Alle findest du jedes Gespräch mit Romeo.", "Nothing open. All shows every conversation with Romeo.")) : tt("Noch keine Fragen oder Kommentare.", "No questions or comments yet.")) + "</p>";
  v.innerHTML = h; bindCommon(); updRing();
  v.querySelectorAll("[data-qf]").forEach(b => b.addEventListener("click", () => { QF = b.dataset.qf; renderFragen(); }));
  bindThreadForms(v, () => renderFragen());
  shown.forEach(id => markRead(id));
}

/* ---------- Lexikon ---------- */
function renderLexikon() {
  cur = { view: "lexikon", id: null };
  const v = document.getElementById("view"), data = EN() ? LEX_EN : LEX;
  v.innerHTML = '<section class="phead"><span class="label">' + tt("Lexikon", "Glossary") + "</span><h1>" + tt("Wörter, die Editoren benutzen.", "Words editors use.") + "</h1><p>" + tt(data.length + " Begriffe aus Schnitt, Farbe und Ton, kurz erklärt. Die englischen Namen stehen so da, wie du sie in Resolve findest.", data.length + " terms from editing, color and sound, briefly explained. The names match what you find in Resolve.") + '</p></section><div class="search"><input id="lxq" type="search" placeholder="' + tt("Begriff suchen", "Search a term") + '" aria-label="' + tt("Lexikon durchsuchen", "Search glossary") + '"></div><dl class="lex" id="lex"></dl>';
  bindCommon(); updRing();
  const q = v.querySelector("#lxq"), box = v.querySelector("#lex"), sorted = [...data].sort((a, b) => a[0].localeCompare(b[0], prefs.lang));
  const upd = () => { const s = q.value.trim().toLowerCase(), r = sorted.filter(x => !s || (x[0] + " " + x[1]).toLowerCase().includes(s)); box.innerHTML = r.length ? r.map(x => "<div><dt>" + esc(x[0]) + "</dt><dd>" + esc(x[1]) + "</dd></div>").join("") : '<p class="empty">' + tt("Kein Begriff gefunden.", "No term found.") + "</p>"; };
  q.addEventListener("input", upd); upd();
}

/* ---------- Live Aktualisierung ---------- */
let raf = 0;
store.onChange(kind => {
  if (!store.user || !shellUp) return;
  clearTimeout(raf);
  raf = setTimeout(() => {
    updRing(); paintStatus();
    const focus = document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (cur.view === "home") { if (!focus) { const y = window.scrollY; renderHome(); window.scrollTo(0, y); } }
    else if (cur.view === "fragen") { if (!focus && (kind === "notes" || kind === "all" || kind === "course")) { const y = window.scrollY; renderFragen(); window.scrollTo(0, y); } }
    else if (cur.view === "lesson") {
      if (editing) return;
      if (kind === "course" || kind === "all") { if (!focus) { if (!findLesson(cur.id)) { go("kurs"); return; } const y = window.scrollY; renderLesson(cur.id); window.scrollTo(0, y); } }
      else paintLesson();
    }
  }, 0);
});
store.onStatus(() => { paintStatus(); paintBanner(); });

/* ---------- Start ---------- */
let authSeq = 0;
store.onAuth(async u => {
  const seq = ++authSeq;
  if (!u) { renderLogin(); return; }
  if (!shellUp) root.innerHTML = '<div class="loading"><span class="mark">228</span><span class="mute">' + tt("Lädt deinen Stand", "Loading your progress") + "</span></div>";
  await store.ready();
  if (seq !== authSeq || !store.user) return;
  renderShell(); route();
});
store.init();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { document.querySelectorAll(".seg.lang").forEach(x => setSeg(x, "lang", prefs.lang)); const c = document.querySelector("#navseg button[aria-pressed=true]"); if (c) setSeg(document.getElementById("navseg"), "v", c.dataset.v); });
