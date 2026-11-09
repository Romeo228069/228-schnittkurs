/* Tastenkappen, Escaping, Symbole, Datumsformat */
const PREF_KEY = "228kurs-prefs";
export const prefs = (() => {
  let p = { os: "win", lang: /^de/i.test(navigator.language || "de") ? "de" : "en" };
  try { Object.assign(p, JSON.parse(localStorage.getItem(PREF_KEY) || "{}")); } catch (e) {}
  return p;
})();
export function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} }
/* Zweisprachig: tt("Deutsch", "English") */
export const tt = (de, en) => (prefs.lang === "en" ? en : de);

const MAC = { cmd: "⌘", opt: "⌥", shift: "⇧", ctrl: "⌃", del: "⌫", space: "Leertaste", left: "←", right: "→", up: "↑", down: "↓", comma: ",", period: ".", eq: "=", minus: "−", lbr: "[", rbr: "]", slash: "/" };
const WIN = { cmd: "Strg", opt: "Alt", shift: "⇧", ctrl: "Strg", del: "Rücktaste", fdel: "Entf", home: "Pos1", end: "Ende", space: "Leertaste", left: "←", right: "→", up: "↑", down: "↓", comma: ",", period: ".", eq: "=", minus: "−", lbr: "[", rbr: "]", slash: "/" };
const WIN_EN = { cmd: "Ctrl", ctrl: "Ctrl", del: "Backspace", fdel: "Del", home: "Home", end: "End", space: "Space" };
const ORD_MAC = { ctrl: 0, opt: 1, shift: 2, cmd: 3 };
const ORD_WIN = { cmd: 0, ctrl: 0, opt: 1, shift: 2 };

export function caps(combo) {
  const parts = combo.split("+");
  const ord = prefs.os === "mac" ? ORD_MAC : ORD_WIN;
  parts.sort((a, b) => (a in ord ? ord[a] : 9) - (b in ord ? ord[b] : 9));
  const out = [];
  for (const p of parts) {
    if (prefs.os === "mac") {
      if (p === "fdel") out.push("fn", "⌫");
      else if (p === "home") out.push("fn", "←");
      else if (p === "end") out.push("fn", "→");
      else if (p === "space") out.push(tt("Leertaste", "Space"));
      else out.push(MAC[p] || p.toUpperCase());
    } else if (prefs.lang === "en" && WIN_EN[p]) out.push(WIN_EN[p]);
    else out.push(WIN[p] || p.toUpperCase());
  }
  return out;
}
export function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
export function kbd(combo) { return '<span class="combo">' + caps(combo).map(c => "<kbd>" + esc(c) + "</kbd>").join("") + "</span>"; }
export function T(s) { return esc(s).replace(/\[\[([^\]]+?)\]\]/g, (m, c) => kbd(c)); }

export const CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="#002b0d" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const ICON = {
  Media: '<rect x="3" y="7" width="14" height="12" rx="2"/><path d="M7 4h11a3 3 0 0 1 3 3v9"/>',
  Photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.4"/>',
  Cut: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M8 15L19 3M16 15L5 3"/>',
  Edit: '<path d="M3 7h10M7 12h14M3 17h12"/>',
  Fusion: '<rect x="2" y="9" width="6" height="6" rx="1.5"/><rect x="16" y="3" width="6" height="6" rx="1.5"/><rect x="16" y="15" width="6" height="6" rx="1.5"/><path d="M8 12h4m0 0V6h4m-4 6v6h4"/>',
  Color: '<circle cx="9" cy="9.5" r="5"/><circle cx="15" cy="9.5" r="5"/><circle cx="12" cy="15" r="5"/>',
  Fairlight: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  Deliver: '<path d="M12 2c3 2 5 6 5 10l-2 4H9l-2-4c0-4 2-8 5-10z"/><circle cx="12" cy="10" r="2"/><path d="M9 16l-3 3M15 16l3 3M12 18v4"/>'
};
export const FOLDER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.6l2 2h8.4A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/></svg>';

export function when(ms) {
  if (!ms) return "";
  const loc = prefs.lang === "en" ? "en-GB" : "de-DE";
  const dfDay = new Intl.DateTimeFormat(loc, { weekday: "short", day: "numeric", month: "short" });
  const dfTime = new Intl.DateTimeFormat(loc, { hour: "2-digit", minute: "2-digit" });
  const d = new Date(ms), now = new Date(), diff = (now - d) / 60000;
  if (diff < 1) return tt("gerade eben", "just now");
  if (diff < 60) return tt("vor " + Math.round(diff) + " Min", Math.round(diff) + " min ago");
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return tt("heute ", "today ") + dfTime.format(d);
  if (sameDay(d, y)) return tt("gestern ", "yesterday ") + dfTime.format(d);
  return dfDay.format(d) + " " + dfTime.format(d);
}
export function fmtMin(m) { const h = Math.floor(m / 60), r = m % 60, H = tt(" Std", " h"), M = " Min"; return h ? (h + H + (r ? " " + r + M : "")).trim() : r + M; }
