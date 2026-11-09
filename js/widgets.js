/* Interaktive Schaubilder der Lektionen, zweisprachig */
import { kbd, esc, tt, CHECK, ICON, FOLDER } from "./util.js";
export const WIDGETS = {};

function wbox(el, title, inner) { el.innerHTML = '<div class="wg"><div class="wl"><span class="label">' + title + "</span></div>" + inner + "</div>"; return el.firstChild; }

WIDGETS.pages = (el) => {
  const P = [
    ["Media", "shift+2", tt("Clips importieren, sichten, in Bins sortieren und Ton synchronisieren.", "Import clips, view them, sort them into bins and sync sound."), "#f08a2e"],
    ["Photo", null, tt("Neu in Resolve 21. Fotos verwalten und bearbeiten, mit denselben Farbwerkzeugen. Für den Schnitt nicht nötig.", "New in Resolve 21. Manage and edit photos with the same color tools. Not needed for editing."), "#cdbb9b"],
    ["Cut", "shift+3", tt("Schneller Schnitt mit einem Viewer und zwei Timelines. Ideal für kurze Social Clips.", "Fast editing with one viewer and two timelines. Ideal for short social clips."), "#34b2a6"],
    ["Edit", "shift+4", tt("Der präzise Schnitt. Hier verbringst du die meiste Zeit: Clips setzen, trimmen, Text, Übergänge.", "Precise editing. You spend most of your time here: placing clips, trimming, text, transitions."), "#4f8fe0"],
    ["Fusion", "shift+5", tt("Grafik, Animation und visuelle Effekte, aufgebaut aus Nodes.", "Graphics, animation and visual effects, built from nodes."), "#9b6fe3"],
    ["Color", "shift+6", tt("Farbkorrektur und Look. Resolve kommt ursprünglich aus der Farbkorrektur, hier ist es am stärksten.", "Color correction and look. Resolve started as a grading tool, this is where it is strongest."), "#e6c44a"],
    ["Fairlight", "shift+7", tt("Ton: Pegel, Mischung, Sprache reinigen, Lautheit messen.", "Sound: levels, mixing, cleaning speech, measuring loudness."), "#5bb56d"],
    ["Deliver", "shift+8", tt("Export. Aus der Timeline wird eine fertige Datei.", "Export. The timeline becomes a finished file."), "#e66b9e"]];
  const w = wbox(el, tt("Die Seitenleiste von Resolve, tipp eine Seite an", "The Resolve page bar, tap a page"), '<div class="pbar">' + P.map((p, i) => '<button class="pbtn" style="--mc:' + p[3] + '" data-i="' + i + '" aria-pressed="' + (i === 3) + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[p[0]] + "</svg>" + p[0] + "</button>").join("") + '</div><div class="pinfo" id="pinfo"></div>');
  const info = w.querySelector("#pinfo");
  const show = i => { const p = P[i]; w.querySelectorAll(".pbtn").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.i === i))); info.innerHTML = "<h3>" + p[0] + " Page " + (p[1] ? kbd(p[1]) : "") + "</h3><p>" + esc(p[2]) + "</p>"; };
  w.querySelectorAll(".pbtn").forEach(b => b.addEventListener("click", () => show(+b.dataset.i))); show(3);
};

WIDGETS.folders = (el) => {
  const F = [[tt("20261108_Kamila_Ersterfilm", "20261108_Kamila_Firstfilm"), tt("Der Projektordner. Datum zuerst, dann sortiert der Finder alle Projekte von selbst nach Zeit.", "The project folder. Date first, so the Finder sorts all projects by time on its own."), 0],
    ["01_Footage", tt("Alles, was aus der Kamera kommt. Pro Karte oder Drehtag ein eigener Unterordner, zum Beispiel A001.", "Everything that comes out of the camera. One subfolder per card or shooting day, for example A001."), 1],
    [tt("02_Ton", "02_Audio"), tt("Ton vom externen Rekorder oder Mikrofon, wenn er getrennt aufgenommen wurde.", "Sound from an external recorder or microphone, if it was recorded separately."), 1],
    [tt("03_Musik", "03_Music"), tt("Musik und Soundeffekte, mit Lizenz, die du verwenden darfst.", "Music and sound effects with a licence you are allowed to use."), 1],
    [tt("04_Grafik", "04_Graphics"), tt("Logos, Fotos, Schriften und Grafiken vom Kunden.", "Logos, photos, fonts and graphics from the client."), 1],
    [tt("05_Projekt", "05_Project"), tt("Exportierte Projektdateien und Sicherungen aus Resolve.", "Exported project files and backups from Resolve."), 1],
    ["06_Export", tt("Nur fertige Exporte, mit Version im Namen, zum Beispiel Ersterfilm_v01.mp4.", "Only finished exports, with the version in the name, for example Firstfilm_v01.mp4."), 1]];
  const w = wbox(el, tt("So sieht ein sauberer Projektordner aus", "This is what a clean project folder looks like"), '<div class="tree">' + F.map((f, i) => '<button style="--mc:#cdbb9b" class="' + (f[2] ? "in" : "") + '" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + FOLDER + "<code>" + esc(f[0]) + "</code></button>").join("") + '</div><p class="wcap" id="fcap"></p>');
  const cap = w.querySelector("#fcap");
  const show = i => { w.querySelectorAll(".tree button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.i === i))); cap.textContent = F[i][1]; };
  w.querySelectorAll(".tree button").forEach(b => b.addEventListener("click", () => show(+b.dataset.i))); show(0);
};

WIDGETS.proxy = (el) => {
  const w = wbox(el, tt("Proxy Handling ausprobieren", "Try out Proxy Handling"), '<div class="wbtns" role="group"><button data-m="orig" aria-pressed="true">Camera Originals</button><button data-m="prox" aria-pressed="false">Prefer Proxies</button></div>' +
    '<div class="pxwrap"><div style="display:grid;gap:10px;min-width:0"><div class="film" id="film"><span class="pp"></span></div><div class="meter"><i id="pxm"></i></div><span class="mute num" id="pxfps" style="font-size:.88rem"></span></div>' +
    '<dl class="dl" id="pxdl"></dl></div><p class="wcap" id="pxcap"></p>');
  const film = w.querySelector("#film"), m = w.querySelector("#pxm"), fps = w.querySelector("#pxfps"), dl = w.querySelector("#pxdl"), cap = w.querySelector("#pxcap");
  const setW = () => { if (!film.isConnected) { window.removeEventListener("resize", setW); return; } film.style.setProperty("--fw", (film.clientWidth - 2) + "px"); };
  setW(); window.addEventListener("resize", setW);
  const row = (a, b) => "<dt>" + a + "</dt><dd>" + b + "</dd>";
  const show = mode => {
    w.querySelectorAll("[data-m]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    const o = mode === "orig"; film.classList.toggle("stutter", o);
    m.style.width = o ? "40%" : "100%"; m.style.background = o ? "var(--red)" : "var(--ok)";
    fps.textContent = o ? tt("Wiedergabe ruckelt, Bilder werden ausgelassen (Beispiel)", "Playback stutters, frames are dropped (example)") : tt("Wiedergabe flüssig in Echtzeit (Beispiel)", "Smooth real time playback (example)");
    dl.innerHTML = o
      ? row(tt("Datei", "File"), tt("Original vom Handy", "Original from the phone")) + row("Format", "3840 × 2160, H.265") + row(tt("Rechenlast", "Processing load"), tt("sehr hoch", "very high")) + row(tt("Export nutzt", "Export uses"), "Original")
      : row(tt("Datei", "File"), tt("Proxy, eigene Datei", "Proxy, a separate file")) + row("Format", "1920 × 1080, ProRes 422 Proxy") + row(tt("Rechenlast", "Processing load"), tt("gering", "low")) + row(tt("Export nutzt", "Export uses"), tt("trotzdem das Original", "still the original"));
    cap.textContent = o ? tt("Stark komprimierte 4K Dateien muss der Rechner bei jedem Bild aufwendig entpacken. Deshalb stockt die Wiedergabe.", "Heavily compressed 4K files have to be unpacked by the computer for every frame. That is why playback stalls.")
      : tt("Du schneidest mit der leichten Kopie. Die Schnittentscheidungen gelten für das Original, beim Export rechnet Resolve mit voller Qualität.", "You edit with the light copy. Your edit decisions apply to the original, and the export is rendered at full quality.");
  };
  w.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => show(b.dataset.m))); show("orig");
};

WIDGETS.editmap = (el) => {
  const A = [["mp", "Media Pool", tt("Alle Clips, Musik und Timelines deines Projekts, sortiert in Bins. Von hier ziehst du Material in die Timeline.", "All clips, music and timelines of your project, sorted into bins. From here you drag footage into the timeline.")],
    ["fx", "Effects", tt("Die Effects Library: Titel wie Text+, Übergänge, Generatoren und Effekte. Per Ziehen auf einen Clip oder Schnitt anwenden.", "The Effects Library: titles like Text+, transitions, generators and effects. Drag them onto a clip or edit.")],
    ["sv", "Source Viewer", tt("Zeigt den Rohclip. Hier setzt du mit I und O, welcher Teil in den Schnitt soll.", "Shows the raw clip. Here you mark with I and O which part goes into the edit.")],
    ["tv", "Timeline Viewer", tt("Zeigt deinen Schnitt an der Stelle des Playheads. Das ist, was der Zuschauer später sieht.", "Shows your edit at the playhead. This is what the viewer will see.")],
    ["in", "Inspector", tt("Einstellungen des markierten Clips: Größe, Position, Zuschnitt, Tempo, Ton und Effektparameter.", "Settings of the selected clip: size, position, crop, speed, sound and effect parameters.")],
    ["tb", tt("Werkzeugleiste", "Toolbar"), tt("Auswahl, Trim, Blade, Einrasten und die Knöpfe für Insert, Overwrite und Replace.", "Selection, Trim, Blade, Snapping and the buttons for Insert, Overwrite and Replace.")],
    ["tm", "Timeline", tt("Deine Arbeitsfläche mit Videospuren oben und Tonspuren unten. Der rote Strich ist der Playhead.", "Your workspace with video tracks on top and audio tracks below. The red line is the playhead.")]];
  const w = wbox(el, tt("Die Edit Page, tipp einen Bereich an", "The Edit page, tap an area"), '<div class="emap" style="--mc:#4f8fe0">' + A.map((a, i) => '<button class="' + a[0] + '" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + a[1] + "</button>").join("") + '</div><p class="wcap" id="ecap"></p>');
  const cap = w.querySelector("#ecap");
  const show = i => { w.querySelectorAll(".emap button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.i === i))); cap.innerHTML = "<b>" + A[i][1] + ".</b> " + esc(A[i][2]); };
  w.querySelectorAll(".emap button").forEach(b => b.addEventListener("click", () => show(+b.dataset.i))); show(0);
};

WIDGETS.timecode = (el, l) => {
  const w = wbox(el, tt("Timecode lesen, zieh den Regler", "Reading timecode, drag the slider"), '<div class="wbtns" role="group"><button data-f="25" aria-pressed="true">25 fps</button><button data-f="30" aria-pressed="false">30 fps</button></div>' +
    '<div class="tcbig" style="--mc:' + l.m.color + '"><div><b id="th">01</b><small>' + tt("Stunden", "Hours") + '</small></div><div><b id="tm">00</b><small>' + tt("Minuten", "Minutes") + '</small></div><div><b id="ts">00</b><small>' + tt("Sekunden", "Seconds") + '</small></div><div class="fr"><b id="tf">00</b><small>Frames</small></div></div>' +
    '<input type="range" id="tcr" min="0" max="1499" value="320" aria-label="' + tt("Position in der Timeline", "Position in the timeline") + '"><p class="wcap" id="tccap"></p>');
  let fps = 25; const r = w.querySelector("#tcr"), cap = w.querySelector("#tccap");
  const upd = () => {
    const f = +r.value, s = Math.floor(f / fps), fr = f % fps;
    w.querySelector("#tm").textContent = String(Math.floor(s / 60)).padStart(2, "0"); w.querySelector("#ts").textContent = String(s % 60).padStart(2, "0"); w.querySelector("#tf").textContent = String(fr).padStart(2, "0");
    cap.textContent = tt("Frame " + f + " der Timeline. Bei " + fps + " fps zählen die Frames von 00 bis " + (fps - 1) + ", danach springt die Sekunde weiter.", "Frame " + f + " of the timeline. At " + fps + " fps the frames count from 00 to " + (fps - 1) + ", then the second ticks over.");
  };
  r.addEventListener("input", upd);
  w.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", () => { fps = +b.dataset.f; w.querySelectorAll("[data-f]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); r.max = String(fps * 60 - 1); if (+r.value > fps * 60 - 1) r.value = String(fps * 60 - 1); upd(); }));
  upd();
};

function mtl(tracks) { return '<div class="mt">' + tracks.map(t => '<div class="tr" data-n="' + t + '" data-t="' + t + '"></div>').join("") + '<span class="phx"></span></div>'; }
function placeClips(w, layout, scale, ph) {
  const tr = {}; w.querySelectorAll(".tr").forEach(t => tr[t.dataset.t] = t);
  Object.entries(layout).forEach(([id, c]) => {
    let d = w.querySelector('[data-c="' + id + '"]');
    if (!d) { d = document.createElement("div"); d.className = "mc" + (c.au ? " au" : ""); d.dataset.c = id; d.style.setProperty("--mc", c.col); }
    if (d.parentNode !== tr[c.tr]) tr[c.tr].appendChild(d);
    d.innerHTML = esc(c.lab || "") + (c.src ? '<span class="src">' + esc(c.src) + "</span>" : "");
    d.classList.toggle("joinl", !!c.jl); d.classList.toggle("joinr", !!c.jr); d.classList.toggle("hl", !!c.hl);
    d.style.visibility = c.w > 0 ? "visible" : "hidden";
    d.style.left = (c.x / scale * 100) + "%"; d.style.width = (Math.max(0, c.w) / scale * 100) + "%";
  });
  if (ph != null) { const p = w.querySelector(".phx"); p.style.left = "calc(40px + " + (ph / scale) + " * (100% - 50px))"; }
}

WIDGETS.editdemo = (el) => {
  const NEW = tt("Neu", "New");
  const w = wbox(el, tt("Insert, Overwrite und Co. im Vergleich", "Insert, Overwrite and friends compared"), '<div class="wbtns" role="group">' +
    [["ins", "Insert", "F9"], ["ovr", "Overwrite", "F10"], ["top", "Place on Top", "F12"], ["app", "Append", "shift+F12"]].map(b => '<button data-a="' + b[0] + '" aria-pressed="false">' + b[1] + " " + kbd(b[2]) + "</button>").join("") + '<button data-a="reset" aria-pressed="false">' + tt("Zurück", "Reset") + "</button></div>" +
    '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="mute" style="font-size:.85rem">' + tt("Neuer Clip:", "New clip:") + '</span><span style="display:inline-block;width:70px;height:22px;border-radius:4px;background:#f08a2e;box-shadow:inset 0 7px 0 rgba(255,255,255,.22)"></span><span class="mute" style="font-size:.85rem">' + tt("4 Sekunden, Playhead in der Mitte von B", "4 seconds, playhead in the middle of B") + "</span></div>" +
    mtl(["V2", "V1"]) + '<div class="lenrow"><span>Timeline: <b id="edlen">18 s</b></span><span id="edst"></span></div><p class="wcap" id="edcap"></p>');
  const SC_ = 28, B = "#4f8fe0", B2 = "#6aa3e8", N = "#f08a2e";
  const base = { A: { tr: "V1", x: 0, w: 6, col: B, lab: "A" }, B1: { tr: "V1", x: 6, w: 3, col: B2, lab: "B", jr: 1 }, B2: { tr: "V1", x: 9, w: 3, col: B2, lab: "", jl: 1 }, C: { tr: "V1", x: 12, w: 6, col: B, lab: "C" }, N: { tr: "V2", x: 9, w: 0, col: N, lab: NEW } };
  const LONG = tt("länger", "longer"), SAME = tt("gleich", "same");
  const X = {
    reset: [base, 18, tt("Ausgangslage: drei Clips A, B und C. Der Playhead steht mitten in B. Wähl eine Art, den neuen Clip einzusetzen.", "Starting point: three clips A, B and C. The playhead is in the middle of B. Pick a way to edit in the new clip."), ""],
    ins: [{ A: base.A, B1: { ...base.B1, lab: "B" }, B2: { ...base.B2, x: 13, lab: "B", jl: 0 }, C: { ...base.C, x: 16 }, N: { tr: "V1", x: 9, w: 4, col: N, lab: NEW, hl: 1 } }, 22, tt("Insert schneidet B am Playhead auf, setzt den neuen Clip dazwischen und schiebt alles dahinter nach hinten. Nichts geht verloren, der Film wird länger.", "Insert splits B at the playhead, puts the new clip in between and pushes everything after it back. Nothing is lost, the film gets longer."), LONG],
    ovr: [{ A: base.A, B1: { ...base.B1, lab: "B" }, B2: { ...base.B2, w: 0 }, C: { ...base.C, x: 13, w: 5, src: tt("Anfang überschrieben", "start overwritten") }, N: { tr: "V1", x: 9, w: 4, col: N, lab: NEW, hl: 1 } }, 18, tt("Overwrite legt den neuen Clip über das, was dort liegt. Der Rest von B und der Anfang von C sind weg, die Länge bleibt gleich.", "Overwrite puts the new clip over whatever is there. The rest of B and the start of C are gone, the length stays the same."), SAME],
    top: [{ ...base, N: { tr: "V2", x: 9, w: 4, col: N, lab: NEW, hl: 1 } }, 18, tt("Place on Top legt den Clip auf die Spur darüber. Unten bleibt alles erhalten, zu sehen ist der obere Clip. So arbeitest du mit B Roll.", "Place on Top puts the clip on the track above. Everything below stays, you see the clip on top. This is how you work with B roll."), SAME],
    app: [{ ...base, N: { tr: "V1", x: 18, w: 4, col: N, lab: NEW, hl: 1 } }, 22, tt("Append hängt den Clip ans Ende der Timeline, egal wo der Playhead steht. Perfekt, um einen Grobschnitt Clip für Clip aufzubauen.", "Append adds the clip to the end of the timeline, wherever the playhead is. Perfect for building a rough cut clip by clip."), LONG]
  };
  const cap = w.querySelector("#edcap"), len = w.querySelector("#edlen"), st = w.querySelector("#edst");
  const run = a => { const [lay, ln, txt, s] = X[a]; w.querySelectorAll("[data-a]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.a === a && a !== "reset"))); placeClips(w, lay, SC_, a === "app" ? 18 : 9); len.textContent = ln + " s"; st.textContent = s ? tt("Länge: ", "Length: ") + s : ""; cap.textContent = txt; };
  w.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => run(b.dataset.a))); run("reset");
};

WIDGETS.trim = (el) => {
  const w = wbox(el, tt("Die vier Trimarten im Trim Modus", "The four kinds of trim in Trim mode"), '<div class="wbtns" role="group">' + ["Ripple", "Roll", "Slip", "Slide"].map(b => '<button data-a="' + b + '" aria-pressed="false">' + b + "</button>").join("") + '<button data-a="reset" aria-pressed="false">' + tt("Zurück", "Reset") + "</button></div>" + mtl(["V1"]) + '<div class="lenrow"><span>Timeline: <b id="trlen">18 s</b></span><span id="trst"></span></div><p class="wcap" id="trcap"></p>');
  const c1 = "#4f8fe0", c2 = "#e6c44a", c3 = "#5bb56d", SC_ = 20;
  const src = (s, w2) => tt("Bild " + s + " bis " + (s + w2), "Frames " + s + " to " + (s + w2));
  const mk = (ax, aw, as, bx, bw, bs, cx, cw, cs, hl) => ({ A: { tr: "V1", x: ax, w: aw, col: c1, lab: "A", src: src(as, aw), hl: hl === "A" }, B: { tr: "V1", x: bx, w: bw, col: c2, lab: "B", src: src(bs, bw), hl: hl === "B" }, C: { tr: "V1", x: cx, w: cw, col: c3, lab: "C", src: src(cs, cw), hl: hl === "C" } });
  const CH = tt("Länge ändert sich", "length changes"), KE = tt("Länge bleibt", "length stays");
  const X = {
    reset: [mk(0, 6, 0, 6, 6, 10, 12, 6, 20), 18, tt("Drei Clips. In jedem steht, welchen Teil seines Materials er gerade zeigt.", "Three clips. Each shows which part of its footage it is currently using."), ""],
    Ripple: [mk(0, 4, 0, 4, 6, 10, 10, 6, 20, "A"), 16, tt("Ripple: Das Ende von A wird zwei Sekunden kürzer und alles dahinter rückt nach. Keine Lücke, aber der Film wird kürzer.", "Ripple: the end of A gets two seconds shorter and everything after it moves up. No gap, but the film gets shorter."), CH],
    Roll: [mk(0, 8, 0, 8, 4, 12, 12, 6, 20, "B"), 18, tt("Roll: Der Schnitt zwischen A und B wandert nach rechts. A wird länger, B kürzer. Die Gesamtlänge bleibt gleich.", "Roll: the edit between A and B moves right. A gets longer, B shorter. The total length stays the same."), KE],
    Slip: [mk(0, 6, 0, 6, 6, 13, 12, 6, 20, "B"), 18, tt("Slip: B bleibt an seinem Platz und behält seine Länge, zeigt aber einen späteren Teil seines Materials.", "Slip: B stays in place and keeps its length, but shows a later part of its footage."), KE],
    Slide: [mk(0, 8, 0, 8, 6, 10, 14, 4, 22, "B"), 18, tt("Slide: B rutscht als Ganzes nach rechts. A wird länger, C kürzer, B selbst bleibt unverändert.", "Slide: B moves right as a whole. A gets longer, C shorter, B itself stays unchanged."), KE]
  };
  const cap = w.querySelector("#trcap"), len = w.querySelector("#trlen"), st = w.querySelector("#trst");
  const run = a => { const [lay, ln, txt, s] = X[a]; w.querySelectorAll("[data-a]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.a === a && a !== "reset"))); placeClips(w, lay, SC_, null); w.querySelector(".phx").style.display = "none"; len.textContent = ln + " s"; st.textContent = s; cap.textContent = txt; };
  w.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => run(b.dataset.a))); run("reset");
};

WIDGETS.jl = (el) => {
  const w = wbox(el, tt("Bild und Ton getrennt schneiden", "Cutting picture and sound separately"), '<div class="wbtns" role="group"><button data-a="std" aria-pressed="true">' + tt("Normaler Schnitt", "Straight cut") + '</button><button data-a="J" aria-pressed="false">J Cut</button><button data-a="L" aria-pressed="false">L Cut</button></div>' + mtl(["V1", "A1"]) + '<p class="wcap" id="jlcap"></p>');
  const c1 = "#4f8fe0", c2 = "#9b6fe3", a1 = "#5bb56d", a2 = "#34b2a6", SC_ = 20;
  const S1 = tt("Szene 1", "Scene 1"), S2 = tt("Szene 2", "Scene 2"), T1 = tt("Ton 1", "Sound 1"), T2 = tt("Ton 2", "Sound 2");
  const mk = e => ({ V1: { tr: "V1", x: 0, w: 10, col: c1, lab: S1 }, V2: { tr: "V1", x: 10, w: 10, col: c2, lab: S2 }, A1: { tr: "A1", x: 0, w: e, col: a1, lab: T1, au: 1, hl: e !== 10 }, A2: { tr: "A1", x: e, w: 20 - e, col: a2, lab: T2, au: 1, hl: e !== 10 } });
  const X = {
    std: [10, tt("Bild und Ton schneiden an derselben Stelle. Sauber, aber oft hart und abrupt.", "Picture and sound cut at the same point. Clean, but often hard and abrupt.")],
    J: [7, tt("J Cut: Der Ton von Szene 2 beginnt schon, während noch Szene 1 zu sehen ist. Unten ragt der Ton nach links, wie der Bogen eines J.", "J cut: the sound of scene 2 starts while scene 1 is still showing. Below, the sound reaches to the left, like the curve of a J.")],
    L: [13, tt("L Cut: Das Bild springt zu Szene 2, der Ton von Szene 1 läuft noch weiter. Unten ragt der Ton nach rechts, wie der Fuß eines L.", "L cut: the picture jumps to scene 2, the sound of scene 1 keeps running. Below, the sound reaches to the right, like the foot of an L.")]
  };
  const cap = w.querySelector("#jlcap");
  const run = a => { w.querySelectorAll("[data-a]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.a === a))); placeClips(w, mk(X[a][0]), SC_, 10); cap.textContent = X[a][1]; };
  w.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => run(b.dataset.a))); run("std");
};

WIDGETS.lgg = (el) => {
  const w = wbox(el, tt("Lift, Gamma und Gain mit Waveform", "Lift, Gamma and Gain with waveform"), '<div class="lgg"><div style="display:grid;gap:8px;min-width:0"><canvas id="img" width="320" height="180" aria-label="' + tt("Testbild", "Test image") + '"></canvas><div class="wave"><canvas id="wav" width="320" height="130" aria-label="Waveform"></canvas><span class="gl" style="top:4%">1023</span><span class="gl" style="top:50%">512</span><span class="gl" style="top:95%">0</span></div></div>' +
    '<div style="display:grid;gap:6px;min-width:0">' + [["lift", "Lift", -.3, .3, .005, 0], ["gamma", "Gamma", -.5, .5, .01, 0], ["gain", "Gain", .5, 1.7, .01, 1], ["temp", "Temp", -1, 1, .02, 0], ["sat", tt("Sättigung", "Saturation"), 0, 2, .02, 1]].map(s => '<label class="sl"><span>' + s[1] + '</span><input type="range" id="s_' + s[0] + '" min="' + s[2] + '" max="' + s[3] + '" step="' + s[4] + '" value="' + s[5] + '"><output id="o_' + s[0] + '"></output></label>').join("") +
    '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:6px"><span class="badge" id="lstat"></span><button class="btn sec" id="lreset" style="min-height:38px;padding:0 14px;font-size:.82rem">' + tt("Zurücksetzen", "Reset") + "</button></div></div></div>" +
    '<p class="wcap">' + tt("Das Testbild ist flau wie Log Material und zu warm. Ziel: Der Graukeil unten reicht im Waveform von knapp über 0 bis knapp unter 1023, wie in Resolve, und der Farbstich ist weg.", "The test image is flat like log footage and too warm. Goal: the grey scale at the bottom spans from just above 0 to just below 1023 in the waveform, as in Resolve, and the color cast is gone.") + "</p>");
  const ci = w.querySelector("#img"), cw = w.querySelector("#wav"), xi = ci.getContext("2d"), xw = cw.getContext("2d");
  const W = 320, H = 180, WH = 130; const base = new Float32Array(W * H * 3);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let r, g, b; const t = y / (H * .6);
    if (y < H * .6) { r = .42 + .38 * t; g = .58 + .25 * t; b = .92 - .12 * t; } else { const n = .04 * Math.sin(x * .21 + y * .13); r = .36 + n; g = .3 + n; b = .22 + n; }
    const dx = x - W * .78, dy = y - H * .22; if (dx * dx + dy * dy < 15 * 15) { r = 1; g = .98; b = .92; }
    const hx = (x - W * .3) / 14, hy = (y - H * .47) / 17; if (hx * hx + hy * hy < 1) { r = .86; g = .63; b = .5; }
    if (x > W * .3 - 20 && x < W * .3 + 20 && y > H * .56 && y < H * .84) { r = .14; g = .16; b = .22; }
    if (y > H * .86) { const v = Math.floor(x / W * 11) / 10; r = g = b = v; }
    const i = (y * W + x) * 3;
    r = .13 + r * .6; g = .13 + g * .6; b = .13 + b * .6; r *= 1.07; b *= .9;
    base[i] = r; base[i + 1] = g; base[i + 2] = b;
  }
  const S_ = {}; const ids = ["lift", "gamma", "gain", "temp", "sat"];
  const img = xi.createImageData(W, H), wav = xw.createImageData(W, WH), acc = new Uint16Array(W * WH);
  const stat = w.querySelector("#lstat");
  function draw() {
    ids.forEach(k => { S_[k] = +w.querySelector("#s_" + k).value; w.querySelector("#o_" + k).textContent = S_[k].toFixed(2); });
    const { lift, gamma, gain, temp, sat } = S_; const ex = 1 / (1 + gamma); acc.fill(0); let rampMin = 1, rampMax = 0;
    for (let p = 0, q = 0; p < W * H; p++, q += 3) {
      let r = base[q] + temp * .07, g = base[q + 1], b = base[q + 2] - temp * .07;
      r = r * gain + lift * (1 - r); g = g * gain + lift * (1 - g); b = b * gain + lift * (1 - b);
      r = r < 0 ? 0 : r > 1 ? 1 : r; g = g < 0 ? 0 : g > 1 ? 1 : g; b = b < 0 ? 0 : b > 1 ? 1 : b;
      r = Math.pow(r, ex); g = Math.pow(g, ex); b = Math.pow(b, ex);
      const lu = .2126 * r + .7152 * g + .0722 * b; r = lu + (r - lu) * sat; g = lu + (g - lu) * sat; b = lu + (b - lu) * sat;
      r = r < 0 ? 0 : r > 1 ? 1 : r; g = g < 0 ? 0 : g > 1 ? 1 : g; b = b < 0 ? 0 : b > 1 ? 1 : b;
      const o = p * 4; img.data[o] = r * 255; img.data[o + 1] = g * 255; img.data[o + 2] = b * 255; img.data[o + 3] = 255;
      const x = p % W, y = (p / W) | 0;
      if (y % 2 === 0) { const L2 = .2126 * r + .7152 * g + .0722 * b; const yy = Math.round((1 - L2) * (WH - 1)); acc[yy * W + x]++; if (y > H * .88) { if (L2 < rampMin) rampMin = L2; if (L2 > rampMax) rampMax = L2; } }
    }
    xi.putImageData(img, 0, 0);
    for (let i = 0; i < W * WH; i++) {
      const v = acc[i], o = i * 4, yy = (i / W) | 0;
      const grid = (yy === 0 || yy === Math.round((WH - 1) / 2) || yy === WH - 1 || yy === Math.round((WH - 1) / 4) || yy === Math.round((WH - 1) * 3 / 4));
      if (v) { wav.data[o] = 120; wav.data[o + 1] = 230; wav.data[o + 2] = 150; wav.data[o + 3] = Math.min(255, 60 + v * 40); }
      else if (grid) { wav.data[o] = 60; wav.data[o + 1] = 60; wav.data[o + 2] = 66; wav.data[o + 3] = 255; }
      else { wav.data[o] = 8; wav.data[o + 1] = 8; wav.data[o + 2] = 10; wav.data[o + 3] = 255; }
    }
    xw.putImageData(wav, 0, 0);
    const lo = Math.round(rampMin * 1023), hi = Math.round(rampMax * 1023);
    const cast = Math.abs(temp + .6) >= .35;
    const good = rampMin >= 0 && rampMin <= .06 && rampMax >= .9 && rampMax <= .995 && !cast;
    stat.className = "badge" + (good ? " good" : "");
    stat.textContent = (good ? tt("Passt. ", "Spot on. ") : "") + tt("Schwarz ", "Black ") + lo + ", " + tt("Weiß ", "White ") + hi + (cast ? tt(", Farbstich", ", color cast") : "");
  }
  ids.forEach(k => w.querySelector("#s_" + k).addEventListener("input", draw));
  w.querySelector("#lreset").addEventListener("click", () => { [["lift", 0], ["gamma", 0], ["gain", 1], ["temp", 0], ["sat", 1]].forEach(([k, v]) => w.querySelector("#s_" + k).value = v); draw(); });
  draw();
};

WIDGETS.meter = (el) => {
  const p = v => (v + 40) / 40 * 100;
  const w = wbox(el, tt("Lautheit einschätzen, Faustregel", "Judging loudness, rule of thumb"), '<label class="sl" style="grid-template-columns:5.6em minmax(0,1fr) 5.2em"><span>' + tt("Lautheit", "Loudness") + '</span><input type="range" id="lu" min="-36" max="-4" step="1" value="-24"><output id="luo"></output></label>' +
    '<div class="lm"><i id="lmi"></i></div><div class="lmk"><span style="left:' + p(-23) + '%">−23<br>TV</span><span style="left:' + p(-14) + '%">−14<br>Social</span><span style="left:' + p(-6) + '%">−6<br>' + tt("zu laut", "too loud") + '</span></div><p class="wcap" id="lucap"></p>');
  const r = w.querySelector("#lu"), o = w.querySelector("#luo"), i = w.querySelector("#lmi"), cap = w.querySelector("#lucap");
  const upd = () => {
    const v = +r.value; o.textContent = (v < 0 ? "−" : "") + Math.abs(v) + " LUFS"; i.style.width = p(v) + "%";
    cap.textContent = v <= -26 ? tt("Zu leise für jede Plattform. Am Handy versteht man kaum etwas.", "Too quiet for any platform. On a phone you can hardly understand anything.")
      : v <= -20 ? tt("Passt für das Fernsehen (−23 LUFS). Für Social Media noch zu leise.", "Right for television (−23 LUFS). Still too quiet for social media.")
      : v <= -12 ? tt("Passt für YouTube, Instagram und TikTok. Ziel ist etwa −14 LUFS.", "Right for YouTube, Instagram and TikTok. The target is about −14 LUFS.")
      : tt("Zu laut. Plattformen regeln das herunter, und Spitzen verzerren schnell.", "Too loud. Platforms turn it down, and peaks distort quickly.");
  };
  r.addEventListener("input", upd); upd();
};

WIDGETS.export = (el, l) => {
  const E = {
    yt: ["YouTube", [["Format", "MP4"], ["Codec", tt("H.264, oder H.265 für kleinere Dateien", "H.264, or H.265 for smaller files")], [tt("Auflösung", "Resolution"), tt("wie die Timeline, 1920 × 1080 oder 3840 × 2160", "same as the timeline, 1920 × 1080 or 3840 × 2160")], [tt("Bildrate", "Frame rate"), tt("wie die Timeline", "same as the timeline")], [tt("Qualität", "Quality"), "Automatic, Best"], [tt("Ton", "Audio"), "AAC, 320 kb/s"], [tt("Lautheit", "Loudness"), tt("etwa −14 LUFS", "about −14 LUFS")]]],
    ig: ["Reel", [["Timeline", tt("1080 × 1920 Hochformat", "1080 × 1920 vertical")], ["Format", "MP4"], ["Codec", "H.264"], [tt("Bildrate", "Frame rate"), tt("wie die Timeline", "same as the timeline")], [tt("Ton", "Audio"), "AAC, 320 kb/s"], [tt("Lautheit", "Loudness"), tt("etwa −14 LUFS", "about −14 LUFS")], ["Tipp", tt("wichtige Texte nicht an den unteren Rand, dort liegt die App Oberfläche", "keep important text away from the bottom edge, the app interface sits there")]]],
    ab: [tt("Abnahme", "Review"), [["Format", "MP4"], ["Codec", "H.264"], [tt("Auflösung", "Resolution"), tt("1920 × 1080 reicht", "1920 × 1080 is enough")], [tt("Qualität", "Quality"), tt("Restrict to, etwa 10.000 kb/s für kleine Dateien", "Restrict to, about 10,000 kb/s for small files")], ["Extra", tt("Timecode über Workspace > Data Burn In einblenden", "burn in timecode via Workspace > Data Burn In")], ["Name", tt("mit Version, zum Beispiel Film_v02_Abnahme", "with version, for example Film_v02_Review")]]],
    ma: ["Master", [["Format", "QuickTime"], ["Codec", tt("DNxHR HQ unter Windows, ProRes 422 HQ am Mac", "DNxHR HQ on Windows, ProRes 422 HQ on a Mac")], [tt("Auflösung", "Resolution"), tt("volle Auflösung der Timeline", "full timeline resolution")], [tt("Bildrate", "Frame rate"), tt("wie die Timeline", "same as the timeline")], [tt("Ton", "Audio"), "Linear PCM, 24 Bit"], [tt("Wofür", "For"), tt("Archiv, Kinoabgabe, Weiterarbeit", "archive, cinema delivery, further work")]]]
  };
  const w = wbox(el, tt("Welche Einstellung für welchen Zweck", "Which settings for which purpose"), '<div class="exg" style="--mc:' + l.m.color + '">' + Object.entries(E).map(([k, v], i) => '<button data-e="' + k + '" aria-pressed="' + (i === 0) + '">' + v[0] + "</button>").join("") + '</div><dl class="dl" id="exdl"></dl>');
  const dl = w.querySelector("#exdl");
  const show = k => { w.querySelectorAll("[data-e]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.e === k))); dl.innerHTML = E[k][1].map(r => "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>").join(""); };
  w.querySelectorAll("[data-e]").forEach(b => b.addEventListener("click", () => show(b.dataset.e))); show("yt");
};

WIDGETS.checklist = (el, l, ctx) => {
  const C = tt(
    ["20 bis 30 Clips gedreht", "Projektordner mit sechs Unterordnern angelegt", "Clips kopiert und Kopie geprüft", "Projekt mit passender Bildrate angelegt", "Importiert und in Bins sortiert", "Proxys gebaut, Prefer Proxies an", "Gesichtet, beste Clips farbig markiert", "Grobschnitt mit Append", "Feinschnitt auf Musik, höchstens 60 Sekunden", "B Roll, ein J Cut und ein Titel drin", "Farbe angeglichen, Graukeil im Waveform geprüft", "Ton auf etwa −14 LUFS, Musik unter der Sprache", "Einmal komplett angesehen, Tippfehler geprüft", "Exportiert für YouTube und als Reel", "Project Archive exportiert und gesichert", "Jemandem gezeigt"],
    ["Shot 20 to 30 clips", "Created project folder with six subfolders", "Copied clips and checked the copy", "Created project with the right frame rate", "Imported and sorted into bins", "Built proxies, Prefer Proxies on", "Viewed, best clips marked with a color", "Rough cut with Append", "Fine cut to music, 60 seconds at most", "B roll, one J cut and a title in", "Color matched, grey scale checked in the waveform", "Sound at about −14 LUFS, music under speech", "Watched it all once, checked for typos", "Exported for YouTube and as a reel", "Exported and backed up the Project Archive", "Showed it to someone"]);
  const w = wbox(el, ctx.readonly ? tt("Kamilas Checkliste für den ersten Film", "Kamila's checklist for the first film") : tt("Checkliste für deinen ersten Film", "Checklist for your first film"), '<div style="display:grid;gap:2px" id="cl"></div><div class="lenrow"><span id="clc"></span></div>');
  const box = w.querySelector("#cl"), cnt = w.querySelector("#clc");
  const count = () => { cnt.innerHTML = "<b>" + ctx.check().length + "</b> " + tt("von ", "of ") + C.length + tt(" erledigt", " done"); };
  box.innerHTML = C.map((c, i) => '<button class="chk" role="checkbox" aria-checked="' + ctx.check().includes(i) + '" data-i="' + i + '"' + (ctx.readonly ? " disabled" : "") + '><span class="bx">' + CHECK + "</span>" + esc(c) + "</button>").join(""); count();
  box.querySelectorAll(".chk").forEach(b => b.addEventListener("click", () => { if (ctx.readonly) return; const i = +b.dataset.i; const on = !ctx.check().includes(i); ctx.setCheck(i, on); b.setAttribute("aria-checked", String(on)); count(); }));
  WIDGETS.checklist.refresh = () => { box.querySelectorAll(".chk").forEach(b => b.setAttribute("aria-checked", String(ctx.check().includes(+b.dataset.i)))); count(); };
};
