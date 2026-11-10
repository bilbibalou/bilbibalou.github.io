// ===== Configuration =====
const STORAGE_KEY = "bioimg-project";
const MARGIN = 60;                 // marge autour de la page pour attraper les poignées
let pageW = 1200, pageH = 800;

let items = [];
let selectedId = null;
let pendingTint = null;               // couleur d'icône en cours de choix (pas encore enregistrée)
let history = [], future = [];
let counter = Date.now();
const newId = () => "n" + (counter++);
const $ = (id) => document.getElementById(id);
const setHidden = (id, v) => { const el = $(id); if (el) el.hidden = v; };
const setValue = (id, v) => { const el = $(id); if (el) el.value = v; };

// ===== Konva =====
const stage = new Konva.Stage({
  container: "canvas",
  width: pageW + MARGIN * 2,
  height: pageH + MARGIN * 2,
});
const bgLayer = new Konva.Layer({ x: MARGIN, y: MARGIN });
const bg = new Konva.Rect({
  x: 0, y: 0, width: pageW, height: pageH, fill: "#fff",
  shadowColor: "black", shadowBlur: 8, shadowOpacity: 0.15,
});
bgLayer.add(bg);
const layer = new Konva.Layer({ x: MARGIN, y: MARGIN });
stage.add(bgLayer, layer);

let keepRatioLocked = true;

const tr = new Konva.Transformer({
  rotateEnabled: true,
  rotateAnchorOffset: 26,
  anchorSize: 12,
  anchorCornerRadius: 6,
  anchorStrokeWidth: 2,
  anchorStroke: "#3b6fe0",
  anchorFill: "#ffffff",
  borderStroke: "#3b6fe0",
  borderStrokeWidth: 1.5,
  borderDash: [5, 4],
  padding: 4,
  keepRatio: true,                       // coins : proportions conservées (Maj = libre)
  shiftBehavior: 'inverted',
  boundBoxFunc: (oldBox, newBox) => {
    if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
    return newBox;
  },
});

layer.add(tr);



// Cache des images
const imgCache = {};
function getImage(src) {
  if (!imgCache[src]) {
    const img = new Image();
    img.onload = () => { tr.forceUpdate(); layer.batchDraw(); };
    img.crossOrigin = "anonymous";
    img.src = src;
    imgCache[src] = img;
  }
  return imgCache[src];
}

// ===== Recoloration des icônes SVG =====
const isSvgSrc = (src) => /^data:image\/svg/i.test(src || "") || /\.svg([?#]|$)/i.test(src || "");
const svgDataUri = (s) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
const svgTextCache = {};
const tintCache = {};
const svgTextSync = {};            // code SVG déjà chargé (permet de recolorer sans attendre)

// Récupère le code source du SVG (data: URI ou fichier du site)
function getSvgText(src) {
  if (!svgTextCache[src]) {
    svgTextCache[src] = (async () => {
      if (src.startsWith("data:")) {
        const i = src.indexOf(",");
        const head = src.slice(0, i), data = src.slice(i + 1);
        return /;base64/i.test(head)
          ? new TextDecoder().decode(Uint8Array.from(atob(data), (c) => c.charCodeAt(0)))
          : decodeURIComponent(data);
      }
      const r = await fetch(src);
      if (!r.ok) throw new Error("SVG introuvable");
      return r.text();
    })().then((t) => { svgTextSync[src] = t; return t; })
      .catch((e) => { delete svgTextCache[src]; throw e; });
  }
  return svgTextCache[src];
}

// Remplace les couleurs (fill / stroke) du SVG ; le blanc et "none" sont conservés
function tintSvg(text, color) {
  const KEEP = /^(none|transparent|white|#fff|#ffffff|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))$/i;
  const fix = (v) => (KEEP.test(v.trim()) ? v : color);
  let out = text
    .replace(/\b(fill|stroke)\s*=\s*(["'])(.*?)\2/gi, (m, a, q, v) => `${a}=${q}${fix(v)}${q}`)
    .replace(/\b(fill|stroke)\s*:\s*([^;"'}]+)/gi, (m, a, v) => `${a}:${fix(v)}`);
  // éléments sans couleur explicite (noir par défaut) : on colore la racine
  out = out.replace(/<svg\b([^>]*)>/i, (m, attrs) => (/\sfill\s*=/.test(attrs) ? m : `<svg${attrs} fill="${color}">`));
  return out;
}

// ----- Palette : changer une couleur précise de l'icône (ex. le liquide) en gardant le reste -----
const _cctx = document.createElement("canvas").getContext("2d");
const _colorCache = new Map();
// Convertit n'importe quelle couleur CSS (#abc, rgb(), nom...) en [r,g,b] ; null si ce n'est pas une couleur
function parseColor(v) {
  v = (v || "").trim();
  if (_colorCache.has(v)) return _colorCache.get(v);
  let res = null;
  if (v && !/^(none|transparent|currentcolor|inherit|url\()/i.test(v)) {
    _cctx.fillStyle = "#123456"; _cctx.fillStyle = v;
    const r = _cctx.fillStyle;
    if (!(r === "#123456" && v.toLowerCase().replace(/\s/g, "") !== "#123456")) {
      if (r[0] === "#") res = [1, 3, 5].map((i) => parseInt(r.slice(i, i + 2), 16));
      else { const m = r.match(/[\d.]+/g).map(Number); if (m.length < 4 || m[3] > 0) res = m.slice(0, 3); }
    }
  }
  _colorCache.set(v, res);
  return res;
}
const toHex = (c) => "#" + c.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return [h, s, l];
}
function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
// Nouvelle couleur d'une nuance : teinte/saturation de la cible, en gardant l'écart de clarté (dégradés conservés)
function shiftColor(memberHex, repHex, targetHex) {
  const m = rgbToHsl(hexToRgb(memberHex)), r = rgbToHsl(hexToRgb(repHex)), t = rgbToHsl(hexToRgb(targetHex));
  return toHex(hslToRgb(t[0], t[1], Math.min(1, Math.max(0, t[2] + (m[2] - r[2])))));
}
const ATTR_RX = /\b(fill|stroke|stop-color)\s*=\s*(["'])(.*?)\2/gi;
const CSS_RX = /\b(fill|stroke|stop-color)\s*:\s*([^;"'}]+)/gi;
const CLUSTER_DIST = 55;           // nuances proches regroupées en une seule pastille

// Deux couleurs sont de la même famille si elles ont presque la même teinte (ex. jaune clair / jaune foncé d'un dégradé)
// ou, pour les gris/blancs/noirs, si elles sont proches
function sameFamily(c1, c2) {
  const a = rgbToHsl(c1), b = rgbToHsl(c2);
  if (a[1] > 0.25 && b[1] > 0.25) {
    const dh = Math.min(Math.abs(a[0] - b[0]), 360 - Math.abs(a[0] - b[0]));
    return dh < 25 && Math.abs(a[2] - b[2]) < 0.45;
  }
  return Math.hypot(c1[0] - c2[0], c1[1] - c2[1], c1[2] - c2[2]) < CLUSTER_DIST;
}
// Liste des couleurs principales du SVG (nuances proches regroupées), les plus utilisées d'abord
function svgPalette(text) {
  const counts = new Map();
  const add = (v) => { const c = parseColor(v); if (c) { const h = toHex(c); counts.set(h, (counts.get(h) || 0) + 1); } };
  text.replace(ATTR_RX, (m, a, q, v) => { add(v); return m; });
  text.replace(CSS_RX, (m, a, v) => { add(v); return m; });
  const clusters = [];
  [...counts].sort((x, y) => y[1] - x[1]).forEach(([hex, n]) => {
    const rgb = hexToRgb(hex);
    const cl = clusters.find((k) => sameFamily(k.rgb, rgb));
    if (cl) { cl.members.push(hex); cl.n += n; } else clusters.push({ rep: hex, rgb, members: [hex], n });
  });
  return clusters;
}
function applyColorMap(text, colorMap, opacity) {
  const memberMap = {};
  svgPalette(text).forEach((cl) => {
    const target = colorMap[cl.rep], alpha = opacity[cl.rep];
    const transparent = typeof alpha === "number" && alpha < 1;
    if (!target && !transparent) return;
    cl.members.forEach((m) => {
      const hex = target ? shiftColor(m, cl.rep, target) : m;
      memberMap[m] = transparent ? `rgba(${hexToRgb(hex).join(",")},${alpha})` : hex;   // rgba : s'ajoute aux opacités déjà présentes
    });
  });
  const fix = (v) => { const c = parseColor(v); return c && memberMap[toHex(c)] ? memberMap[toHex(c)] : v; };
  return text
    .replace(ATTR_RX, (m, a, q, v) => `${a}=${q}${fix(v)}${q}`)
    .replace(CSS_RX, (m, a, v) => `${a}:${fix(v)}`);
}

// Variante d'une icône : "" (originale), "t:#rrggbb" (tout en une couleur) ou "m:{...}" (couleurs choisies)
const hasMap = (it) => (it.colorMap && Object.keys(it.colorMap).length > 0) || (it.colorOpacity && Object.keys(it.colorOpacity).length > 0);
const variantOf = (it) => (it.tint ? "t:" + it.tint : hasMap(it) ? "m:" + JSON.stringify([it.colorMap || {}, it.colorOpacity || {}]) : "");
const renderVariant = (text, it) => (it.tint ? tintSvg(text, it.tint) : hasMap(it) ? applyColorMap(text, it.colorMap || {}, it.colorOpacity || {}) : text);

// Source à afficher pour un élément (version recolorée si disponible)
function srcFor(it) {
  const variant = variantOf(it);
  if (!variant || !isSvgSrc(it.src)) return it.src;
  const key = it.src + "|" + variant;
  if (tintCache[key]) return tintCache[key];
  if (svgTextSync[it.src]) return (tintCache[key] = svgDataUri(renderVariant(svgTextSync[it.src], it)));
  getSvgText(it.src).then((t) => {
    tintCache[key] = svgDataUri(renderVariant(t, it));
    items.filter((i) => i.src === it.src && variantOf(i) === variant)
         .forEach((i) => { const n = nodes.get(i.id); if (n) setNodeImage(n, tintCache[key]); });
  }).catch(() => {});
  return it.src;                                  // en attendant, on garde l'original
}

// Change l'image d'un nœud sans clignotement (attend que la nouvelle soit chargée)
function setNodeImage(n, src) {
  n._wantSrc = src;
  const img = getImage(src);
  if (n.image() === img) return;
  if (img.complete || !n.image()) n.image(img);
  if (!img.complete) {
    img.addEventListener("load", () => {
      if (n._wantSrc === src) { n.image(img); tr.forceUpdate(); layer.batchDraw(); }
    }, { once: true });
  }
}

// ===== Nœuds Konva =====
const nodes = new Map();
let gestureSnap = null;

function buildNode(it) {
  let n;
  if (it.type === "image") n = new Konva.Image({ id: it.id, draggable: true });
  else if (it.type === "text") n = new Konva.Text({ id: it.id, draggable: true, fontFamily: "Arial" });
  else return null;

  n.on("dragstart transformstart", () => {
    if (!gestureSnap) gestureSnap = JSON.stringify(items);
  });
  n.on("dragend transformend", () => endGesture(n));
  return n;
}

function applyAttrs(n, it) {
  n.setAttrs({
    x: it.x, y: it.y, rotation: it.rotation || 0,
    scaleX: it.scaleX || 1, scaleY: it.scaleY || 1,
    opacity: it.opacity ?? 1,
  });
  if (it.type === "image") { n.setAttrs({ width: it.width, height: it.height }); setNodeImage(n, srcFor(it)); }
  else n.setAttrs({ text: it.text, fontSize: it.fontSize, fill: it.fill, fontFamily: it.fontFamily || "Arial" });
}

function endGesture(n) {
  if (gestureSnap) {
    history.push(gestureSnap);
    if (history.length > 100) history.shift();
    future = [];
    gestureSnap = null;
  }
  const isText = n.getClassName() === "Text";
  if (isText && Math.abs(n.scaleX() - n.scaleY()) < 0.01 && n.scaleY() !== 1) {
    n.fontSize(Math.max(6, Math.round(n.fontSize() * n.scaleY())));
    n.scale({ x: 1, y: 1 });                       // on "cuit" l'échelle dans la taille de police
  }
  keepOnPage(n);
  const patch = { x: n.x(), y: n.y(), rotation: n.rotation(), scaleX: n.scaleX(), scaleY: n.scaleY(),
                  ...(isText ? { fontSize: n.fontSize() } : {}) };
  items = items.map((i) => (i.id === n.id() ? { ...i, ...patch } : i));
  save();
  updateProps();
}

// Empêche de perdre un élément hors de la zone visible
function keepOnPage(n) {
  const r = n.getClientRect({ relativeTo: layer }), m = 30;
  let dx = 0, dy = 0;
  if (r.x + r.width < m) dx = m - (r.x + r.width); else if (r.x > pageW - m) dx = pageW - m - r.x;
  if (r.y + r.height < m) dy = m - (r.y + r.height); else if (r.y > pageH - m) dy = pageH - m - r.y;
  n.x(n.x() + dx); n.y(n.y() + dy);
}

function sync() {
  const ids = new Set(items.map((i) => i.id));
  for (const [id, n] of nodes) {
    if (!ids.has(id)) { n.destroy(); nodes.delete(id); }
  }
  items.forEach((it) => {
    let n = nodes.get(it.id);
    if (!n) {
      n = buildNode(it);
      if (!n) return;
      nodes.set(it.id, n);
      layer.add(n);
    }
    applyAttrs(n, it);
    n.moveToTop();
  });
  tr.moveToTop();                       // le cadre toujours au-dessus
  if (selectedId && !nodes.has(selectedId)) selectedId = null;
  tr.nodes(selectedId ? [nodes.get(selectedId)] : []);
  tr.forceUpdate();
  layer.batchDraw();
  updateProps();
}

// ===== État / historique =====
function snapshot() {
  commitPendingTint();
  history.push(JSON.stringify(items));
  if (history.length > 100) history.shift();
  future = [];
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ pageW, pageH, items })); }
  catch { console.warn("Sauvegarde locale impossible (projet trop gros ?)"); }
}
function commit() { save(); sync(); }

function add(item) {
  snapshot();
  item.id = newId();
  items.push(item);
  selectedId = item.id;
  commit();
}
function update(id, patch) {
  snapshot();
  items = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
  commit();
}
function select(id) {
  commitPendingTint();
  picker.close();
  selectedId = id && nodes.has(id) ? id : null;
  tr.nodes(selectedId ? [nodes.get(selectedId)] : []);
  tr.keepRatio(keepRatioLocked);
  tr.moveToTop();
  tr.forceUpdate();
  layer.batchDraw();
  updateProps();
}
function undo() {
  commitPendingTint();
  if (!history.length) return;
  future.push(JSON.stringify(items));
  items = JSON.parse(history.pop());
  commit();
}
function redo() {
  if (!future.length) return;
  history.push(JSON.stringify(items));
  items = JSON.parse(future.pop());
  commit();
}

// ===== Sélection =====
// Détection géométrique : élément le plus haut sous le curseur (gère la rotation/l'échelle)
let fallbackDrag = null;
const endFallbackDrag = () => {
  if (!fallbackDrag) return;
  const n = fallbackDrag;
  fallbackDrag = null;
  if (n.isDragging()) n.stopDrag();                    // relâcher la souris termine toujours le drag
};
["mouseup", "pointerup", "touchend", "touchcancel", "blur"].forEach((ev) => window.addEventListener(ev, endFallbackDrag, true));
window.addEventListener("mousemove", (e) => { if (fallbackDrag && e.buttons === 0) endFallbackDrag(); }, true);

function pickNode() {
  const p = stage.getPointerPosition();
  if (!p) return null;
  for (let i = items.length - 1; i >= 0; i--) {
    const n = nodes.get(items[i].id);
    if (!n) continue;
    const q = n.getAbsoluteTransform().copy().invert().point(p);
    if (q.x >= 0 && q.y >= 0 && q.x <= n.width() && q.y <= n.height()) return n;
  }
  return null;
}

// Détection géométrique branchée directement dans Konva : remplace le "hit canvas" (lecture de pixels),
// que Brave / Firefox anti-empreinte / certaines extensions faussent. Poignées d'abord, puis éléments.
bgLayer.listening(false);
function geoHit(p) {
  if (!p) return null;
  if (tr.nodes().length && tr.isVisible()) {
    for (const a of tr.find("._anchor")) {                 // 8 poignées + poignée de rotation
      if (!a.isVisible()) continue;
      const q = a.getAbsoluteTransform().copy().invert().point(p);
      const pad = 6;                                        // zone de clic un peu plus large que le dessin
      if (q.x >= -pad && q.y >= -pad && q.x <= a.width() + pad && q.y <= a.height() + pad) return a;
    }
  }
  for (let i = items.length - 1; i >= 0; i--) {
    const n = nodes.get(items[i].id);
    if (!n) continue;
    const q = n.getAbsoluteTransform().copy().invert().point(p);
    if (q.x >= 0 && q.y >= 0 && q.x <= n.width() && q.y <= n.height()) return n;
  }
  return null;
}
layer.getIntersection = (pos) => geoHit(pos);

function isClickOnTransformer(t, p) {
  if (!t) return false;
  if (t === tr) return true;
  if (t.findAncestor && t.findAncestor("Transformer")) return true;
  if (t.getParent && t.getParent() === tr) return true;
  if (!selectedId || !p) return false;

  // Détection des clics sur ou à proximité d'une poignée du Transformer
  const anchors = tr.find("._anchor");
  for (const a of anchors) {
    if (!a.visible()) continue;
    const ap = a.getAbsolutePosition();
    const distSq = (ap.x - p.x) ** 2 + (ap.y - p.y) ** 2;
    if (distSq <= 324) { // rayon de 18px autour du centre de la poignée
      return true;
    }
  }

  // Détection sur la tige de rotation
  const rot = tr.findOne(".rotater");
  const topC = tr.findOne(".top-center");
  if (rot && topC && rot.visible()) {
    const rp = rot.getAbsolutePosition();
    const tp = topC.getAbsolutePosition();
    const minX = Math.min(rp.x, tp.x) - 12, maxX = Math.max(rp.x, tp.x) + 12;
    const minY = Math.min(rp.y, tp.y) - 12, maxY = Math.max(rp.y, tp.y) + 12;
    if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) {
      return true;
    }
  }
  return false;
}

stage.on("mousedown touchstart", (e) => {
  document.activeElement?.blur();                        // rend le clavier au canvas
  const p = stage.getPointerPosition();
  const t = e.target;
  if (isClickOnTransformer(t, p)) return;               // clic sur une poignée ou le cadre

  let node = t.getLayer() === layer && nodes.has(t.id()) ? t : null;
  const fallback = !node;
  if (!node) node = pickNode();                          // détection de secours (sans le "hit canvas")
  if (!node) { select(null); return; }                   // clic dans le vide
  if (selectedId !== node.id()) select(node.id());
  if (fallback && !node.isDragging()) {                 // Konva n'a pas démarré le drag tout seul
    fallbackDrag = node;
    node.startDrag();
  }
});

$("canvasWrap").addEventListener("mousedown", (e) => {
  if (!stage.container().contains(e.target)) select(null);
});

stage.on("dblclick dbltap", (e) => {
  const it = items.find((i) => i.id === e.target.id());
  if (!it || it.type !== "text") return;
  const t = prompt("Texte :", it.text);
  if (t !== null && t !== it.text) update(it.id, { text: t });
});

// ===== Ajout d'éléments =====
const center = () => ({ x: pageW / 2 - 60, y: pageH / 2 - 60 });

function addIcon(src, x, y) {
  const img = getImage(src);
  const place = () => {
    const ratio = (img.naturalWidth || 100) / (img.naturalHeight || 100);
    const c = center();
    add({ type: "image", src, x: x ?? c.x, y: y ?? c.y, width: 120, height: 120 / ratio });
  };
  img.complete ? place() : img.addEventListener("load", place, { once: true });
}

$("btnText").onclick = () =>
  add({ type: "text", text: "Texte", fontSize: 28, fill: "#222222", fontFamily: "Arial", ...center() });

// ===== Actions =====
function deleteSelected() {
  if (!selectedId) return;
  snapshot();
  items = items.filter((i) => i.id !== selectedId);
  selectedId = null;
  commit();
}
function reorder(dir) {
  const idx = items.findIndex((i) => i.id === selectedId);
  if (idx < 0) return;
  snapshot();
  const [it] = items.splice(idx, 1);
  dir > 0 ? items.push(it) : items.unshift(it);
  commit();
}
$("btnDelete").onclick = deleteSelected;
$("btnFront").onclick = () => reorder(1);
$("btnBack").onclick = () => reorder(-1);

// ===== Copier / Couper / Coller =====
const isTyping = () => {
  const a = document.activeElement;
  return !!a && (a.tagName === "TEXTAREA" ||
    (a.tagName === "INPUT" && !["range", "color", "file", "button", "checkbox"].includes(a.type)));
};
let clipboard = null, pasteCount = 0;

function copySelected() {
  const it = items.find((i) => i.id === selectedId);
  if (!it) return false;
  clipboard = structuredClone(it);
  pasteCount = 0;
  navigator.clipboard?.writeText("BIOIMG:" + JSON.stringify(it)).catch(() => {});
  return true;
}
function pasteItem(it) {
  if (!clipboard || JSON.stringify(it) !== JSON.stringify(clipboard)) {
    clipboard = structuredClone(it);
    pasteCount = 0;
  }
  pasteCount++;
  const copy = structuredClone(it);
  delete copy.id;
  add({ ...copy, x: it.x + 20 * pasteCount, y: it.y + 20 * pasteCount });
}
document.addEventListener("paste", (e) => {
  if (isTyping()) return;
  const dt = e.clipboardData;
  const text = dt.getData("text/plain");
  if (text && text.startsWith("BIOIMG:")) {
    try { e.preventDefault(); pasteItem(JSON.parse(text.slice(7))); return; } catch {}
  }
  const imgItem = [...dt.items].find((i) => i.type.startsWith("image/"));
  if (imgItem) {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = () => addIcon(reader.result);
    reader.readAsDataURL(imgItem.getAsFile());
    return;
  }
  if (clipboard) { e.preventDefault(); pasteItem(clipboard); }
});

// ===== Raccourcis clavier =====
let lastNudge = 0;
window.addEventListener("keydown", (e) => {
  if (isTyping()) return;
  const k = e.key.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && k === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  else if (ctrl && k === "y") { e.preventDefault(); redo(); }
  else if (ctrl && k === "c") copySelected();
  else if (ctrl && k === "x") { if (copySelected()) deleteSelected(); }
  else if (k === "delete" || k === "backspace") { e.preventDefault(); deleteSelected(); }
  else if (k === "escape") select(null);
  else if (selectedId && k.startsWith("arrow")) {
    e.preventDefault();
    const it = items.find((i) => i.id === selectedId);
    if (!it) return;
    const s = e.shiftKey ? 10 : 1;
    const d = { arrowleft: [-s, 0], arrowright: [s, 0], arrowup: [0, -s], arrowdown: [0, s] }[k];
    if (Date.now() - lastNudge > 600) snapshot();
    lastNudge = Date.now();
    items = items.map((i) => (i.id === selectedId ? { ...i, x: it.x + d[0], y: it.y + d[1] } : i));
    commit();
  }
});

// ===== Panneau des propriétés =====
function updateProps() {
  const it = items.find((i) => i.id === selectedId);
  setHidden("noSel", !!it);
  setHidden("propFields", !it);
  setHidden("pageWrap", !!it);
  if (!it) return;
  const isText = it.type === "text";
  setHidden("colorWrap", !isText);
  setHidden("fsWrap", !isText);
  setHidden("textHint", !isText);
  setValue("propColor", it.fill || "#000000");
  setValue("propFont", it.fontSize || 20);
  setHidden("ffWrap", !isText);
  const isSvgImg = it.type === "image" && isSvgSrc(it.src);
  setHidden("tintWrap", !isSvgImg);
  setValue("propTint", it.tint || "#000000");
  if (isSvgImg) refreshPalette(it); else { paletteFor = null; picker.close(); }
  setValue("propFontFamily", it.fontFamily || "Arial");
  setValue("propOpacity", it.opacity ?? 1);
}
const onChange = (id, fn) => { const el = $(id); if (el) el.onchange = (e) => { fn(e); el.blur(); }; };
onChange("propColor", (e) => selectedId && update(selectedId, { fill: e.target.value }));
onChange("propFont", (e) => selectedId && update(selectedId, { fontSize: +e.target.value }));
onChange("propOpacity", (e) => selectedId && update(selectedId, { opacity: +e.target.value }));

// Aperçu en direct pendant qu'on déplace le curseur / choisit la couleur (validé au relâchement)
const live = (id, fn) => {
  const el = $(id);
  if (el) el.oninput = (e) => { const n = nodes.get(selectedId); if (n) { fn(n, e.target.value); layer.batchDraw(); } };
};
live("propColor", (n, v) => n.fill(v));
live("propOpacity", (n, v) => n.opacity(+v));

// Couleurs de l'icône SVG : aperçu en direct, enregistré dès qu'on quitte le sélecteur,
// qu'on sélectionne autre chose ou qu'on ajoute un élément (toujours sur l'icône d'origine)
function commitPendingTint() {
  if (!pendingTint) return;
  const { id, patch } = pendingTint;
  pendingTint = null;
  if (items.some((i) => i.id === id)) update(id, patch);
}
function startPreview(it, n, patch) {
  const token = (pendingTint = { id: it.id, patch });
  getSvgText(it.src).then((t) => {
    if (pendingTint !== token) return;
    const img = new Image();
    img.onload = () => { n.image(img); layer.batchDraw(); };
    img.src = svgDataUri(renderVariant(t, { ...it, ...patch }));
  }).catch(() => {});
}
const currentSvgItem = () => {
  const it = items.find((i) => i.id === selectedId), n = nodes.get(selectedId);
  return it && n && it.type === "image" && isSvgSrc(it.src) ? { it, n } : null;
};
function bindCommit(el) { el.addEventListener("change", commitPendingTint); el.addEventListener("blur", commitPendingTint); }

// Valeurs de l'icône en tenant compte d'un aperçu en cours (évite de perdre un réglage non encore validé)
const baseOf = (it) => (pendingTint && pendingTint.id === it.id ? { ...it, ...pendingTint.patch } : it);

// ----- Mini sélecteur de couleur (carré + teinte + transparence), ouvert au clic sur une pastille -----
const clamp01 = (x) => Math.min(1, Math.max(0, x));
function rgbToHsv([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
  let h = 0;
  if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
  return [h, mx ? d / mx : 0, mx];
}
function hsvToRgb(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
const picker = (() => {
  let el, sv, dot, hue, alpha, afill, aval, hex, anchor = null, cb = null;
  const st = { h: 0, s: 1, v: 1, a: 1 };
  const hexOf = () => toHex(hsvToRgb(st.h, st.s, st.v));
  function paint() {
    const c = hexOf(), [r, g, b] = hexToRgb(c);
    sv.style.background = `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(${st.h},100%,50%))`;
    dot.style.left = st.s * 100 + "%"; dot.style.top = (1 - st.v) * 100 + "%";
    hue.value = st.h; alpha.value = st.a;
    afill.style.background = `linear-gradient(to right,rgba(${r},${g},${b},0),rgb(${r},${g},${b}))`;
    aval.textContent = Math.round(st.a * 100) + "%";
    if (document.activeElement !== hex) hex.value = c;
  }
  const emit = () => { paint(); if (cb) cb(hexOf(), Math.round(st.a * 100) / 100); };
  function build() {
    el = document.createElement("div");
    el.className = "cpick";
    el.hidden = true;
    el.innerHTML = `<div class="cp-sv"><div class="cp-dot"></div></div>
      <div class="cp-cap">Teinte</div>
      <div class="cp-track cp-hue-track"><input type="range" class="cp-hue" min="0" max="360" step="1"></div>
      <div class="cp-cap">Transparence <b class="cp-aval"></b></div>
      <div class="cp-track cp-alpha-track"><div class="cp-afill"></div><input type="range" class="cp-alpha" min="0" max="1" step="0.01"></div>
      <input type="text" class="cp-hex" maxlength="7" spellcheck="false">`;
    document.body.appendChild(el);
    sv = el.querySelector(".cp-sv"); dot = el.querySelector(".cp-dot");
    hue = el.querySelector(".cp-hue"); alpha = el.querySelector(".cp-alpha");
    afill = el.querySelector(".cp-afill"); aval = el.querySelector(".cp-aval"); hex = el.querySelector(".cp-hex");
    const pick = (e) => {
      const r = sv.getBoundingClientRect();
      st.s = clamp01((e.clientX - r.left) / r.width);
      st.v = 1 - clamp01((e.clientY - r.top) / r.height);
      emit();
    };
    sv.addEventListener("pointerdown", (e) => { sv.setPointerCapture(e.pointerId); pick(e); sv.onpointermove = pick; });
    ["pointerup", "pointercancel"].forEach((ev) => sv.addEventListener(ev, () => { sv.onpointermove = null; }));
    hue.oninput = () => { st.h = +hue.value; emit(); };
    alpha.oninput = () => { st.a = +alpha.value; emit(); };
    hex.oninput = () => {
      if (!/^#[0-9a-f]{6}$/i.test(hex.value)) return;
      const [h, s, v] = rgbToHsv(hexToRgb(hex.value.toLowerCase()));
      st.s = s; st.v = v; if (s > 0.001 && v > 0.001) st.h = h;
      emit();
    };
    // clic en dehors / Échap : on ferme (et on enregistre)
    document.addEventListener("pointerdown", (e) => {
      if (!el.hidden && !el.contains(e.target) && !(anchor && anchor.contains(e.target))) close();
    }, true);
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }
  function open(btn, color, a, onChange) {
    if (!el) build();
    commitPendingTint();
    cb = null;
    const [h, s, v] = rgbToHsv(hexToRgb(color));
    st.s = s; st.v = v; st.a = a; if (s > 0.001 && v > 0.001) st.h = h;
    paint();
    el.hidden = false;
    anchor = btn;
    const r = btn.getBoundingClientRect(), w = el.offsetWidth, hh = el.offsetHeight;
    let left = r.left - w - 10;
    if (left < 8) left = Math.min(r.right + 10, window.innerWidth - w - 8);
    el.style.left = left + "px";
    el.style.top = Math.max(8, Math.min(r.top, window.innerHeight - hh - 8)) + "px";
    cb = onChange;
  }
  function close() {
    if (!el || el.hidden) return;
    el.hidden = true;
    cb = null; anchor = null;
    commitPendingTint();
  }
  return { open, close, anchor: () => anchor };
})();

// Palette : une pastille par couleur principale ; clic = sélecteur (couleur + transparence de cette couleur)
let paletteFor = null;
const paintSwatch = (btn, color, a) => { const [r, g, b] = hexToRgb(color); btn.firstChild.style.background = `rgba(${r},${g},${b},${a})`; };
function refreshPalette(it) {
  const box = $("palette");
  if (!box) return;
  const key = it.id + "|" + it.src;
  if (paletteFor && paletteFor.key === key) {          // même icône : on met juste les pastilles à jour
    paletteFor.inputs.forEach(({ rep, btn }) => {
      const op = !it.tint && it.colorOpacity && it.colorOpacity[rep];
      paintSwatch(btn, (!it.tint && it.colorMap && it.colorMap[rep]) || rep, typeof op === "number" ? op : 1);
    });
    return;
  }
  picker.close();
  const state = (paletteFor = { key, inputs: [] });
  box.innerHTML = "";
  getSvgText(it.src).then((t) => {
    if (paletteFor !== state) return;
    svgPalette(t).slice(0, 12).forEach((cl) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sw";
      btn.title = "Couleur et transparence";
      btn.innerHTML = "<span></span>";
      paintSwatch(btn, cl.rep, 1);
      btn.onclick = () => {
        if (picker.anchor() === btn) return picker.close();
        const cur = currentSvgItem();
        if (!cur) return;
        const b = baseOf(cur.it);
        const op = !b.tint && b.colorOpacity && b.colorOpacity[cl.rep];
        picker.open(btn, (!b.tint && b.colorMap && b.colorMap[cl.rep]) || cl.rep, typeof op === "number" ? op : 1, (hex, a) => {
          const cur2 = currentSvgItem();
          if (!cur2) return;
          const b2 = baseOf(cur2.it);
          const colorMap = { ...(b2.colorMap || {}) }, colorOpacity = { ...(b2.colorOpacity || {}) };
          if (hex.toLowerCase() === cl.rep) delete colorMap[cl.rep]; else colorMap[cl.rep] = hex;   // inchangé = pas d'entrée
          if (a >= 1) delete colorOpacity[cl.rep]; else colorOpacity[cl.rep] = a;
          paintSwatch(btn, hex, a);
          startPreview(cur2.it, cur2.n, { colorMap, colorOpacity, tint: null });
        });
      };
      box.appendChild(btn);
      state.inputs.push({ rep: cl.rep, btn });
    });
    const cur = items.find((i) => i.id === selectedId);
    if (cur) refreshPalette(cur);
  }).catch(() => {});
}

const tintInput = $("propTint");
if (tintInput) {
  tintInput.oninput = (e) => {
    const cur = currentSvgItem();
    if (cur) startPreview(cur.it, cur.n, { tint: e.target.value, colorMap: null, colorOpacity: null });
  };
  bindCommit(tintInput);
}
const btnTintReset = $("btnTintReset");
if (btnTintReset) btnTintReset.onclick = () => { pendingTint = null; if (selectedId) update(selectedId, { tint: null, colorMap: null, colorOpacity: null }); };

// ===== Polices =====
const FONTS = ["Arial", "Verdana", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Courier New",
               "Comic Sans MS", "Impact", "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Playfair Display", "Caveat"];
const fontSel = $("propFontFamily");
if (fontSel) FONTS.forEach((f) => {
  const o = document.createElement("option");
  o.value = f; o.textContent = f; o.style.fontFamily = `"${f}"`;
  fontSel.appendChild(o);
});

// Force Konva à recalculer la taille des textes une fois la police réellement chargée
function refreshTextFonts() {
  nodes.forEach((n) => {
    if (n.getClassName() !== "Text") return;
    const f = n.fontFamily();
    n.fontFamily("serif"); n.fontFamily(f);
  });
  tr.forceUpdate();
  layer.batchDraw();
}
async function loadFonts(families) {
  try { await Promise.all([...new Set(families)].map((f) => document.fonts.load(`16px "${f}"`))); } catch {}
  refreshTextFonts();
}
onChange("propFontFamily", async (e) => {
  if (!selectedId) return;
  const f = e.target.value;
  await loadFonts([f]);
  update(selectedId, { fontFamily: f });
});

function resizePage() {
  pageW = +$("pageW").value || 1200;
  pageH = +$("pageH").value || 800;
  stage.size({ width: pageW + MARGIN * 2, height: pageH + MARGIN * 2 });
  bg.size({ width: pageW, height: pageH });
  bgLayer.batchDraw();
  save();
}
$("pageW").onchange = resizePage;
$("pageH").onchange = resizePage;

// ===== Bibliothèque d'icônes =====
let icons = [...(window.BIOIMG_ICONS || [])];

const ICON_BATCH = 60;                       // nombre d'icônes ajoutées à chaque étape
let iconObserver = null;

function renderIcons() {
  const q = $("search").value.toLowerCase();
  const list = $("iconList");
  list.innerHTML = "";
  iconObserver?.disconnect();
  const filtered = icons.filter((i) => (i.name + " " + (i.tags || "")).toLowerCase().includes(q));

  // Sentinelle en bas de la liste : quand elle devient visible, on ajoute le lot suivant
  const sentinel = document.createElement("div");
  sentinel.style.cssText = "grid-column:1/-1;height:1px";
  list.appendChild(sentinel);

  let shown = 0;
  const addBatch = () => {
    const frag = document.createDocumentFragment();
    filtered.slice(shown, shown + ICON_BATCH).forEach((icon) => {
      const div = document.createElement("div");
      div.className = "icon-item";
      div.draggable = true;
      div.title = icon.name;
      div.innerHTML = `<img src="${icon.src}" alt="" draggable="false" loading="lazy" decoding="async"><div>${icon.name}</div>`;
      div.onclick = () => addIcon(icon.src);
      div.ondragstart = (e) => e.dataTransfer.setData("text/plain", icon.src);
      frag.appendChild(div);
    });
    shown += ICON_BATCH;
    list.insertBefore(frag, sentinel);
    if (shown >= filtered.length) { iconObserver.disconnect(); sentinel.remove(); }
    else { iconObserver.unobserve(sentinel); iconObserver.observe(sentinel); }   // re-vérifie si la sentinelle est encore visible
  };

  iconObserver = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) addBatch(); },
                                          { root: list, rootMargin: "300px" });
  addBatch();
}

let searchTimer = null;
$("search").oninput = () => { clearTimeout(searchTimer); searchTimer = setTimeout(renderIcons, 150); };

const container = stage.container();
container.addEventListener("dragover", (e) => e.preventDefault());
container.addEventListener("drop", (e) => {
  e.preventDefault();
  const src = e.dataTransfer.getData("text/plain");
  if (!src || src.startsWith("BIOIMG:")) return;
  stage.setPointersPositions(e);
  const p = layer.getRelativePointerPosition();   // position dans la page
  addIcon(src, p.x - 60, p.y - 60);
});

$("fileIcon").onchange = (e) => {
  [...e.target.files].forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      icons.unshift({ name: file.name.replace(/\.\w+$/, ""), tags: "perso", src: reader.result });
      renderIcons();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = "";
};

// ===== Projet =====
$("btnNew").onclick = () => {
  if (!confirm("Effacer la figure actuelle ?")) return;
  snapshot();
  items = [];
  selectedId = null;
  commit();
};

$("btnSave").onclick = () => {
  const blob = new Blob([JSON.stringify({ pageW, pageH, items }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "figure.bioimg.json";
  a.click();
  URL.revokeObjectURL(a.href);
};

function loadProject(data) {
  items = (data.items || []).filter((i) => i.type === "image" || i.type === "text");
  $("pageW").value = data.pageW || 1200;
  $("pageH").value = data.pageH || 800;
  resizePage();
  selectedId = null;
  sync();
  loadFonts(items.filter((i) => i.type === "text").map((i) => i.fontFamily || "Arial"));
}

$("fileProject").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try { snapshot(); loadProject(JSON.parse(reader.result)); save(); }
    catch { alert("Fichier invalide"); }
  };
  reader.readAsText(file);
  e.target.value = "";
};

// ===== Export PNG (uniquement la page, sans la marge ni le cadre) =====
$("btnPng").onclick = () => {
  tr.hide();
  bg.shadowEnabled(false);
  const url = stage.toDataURL({ x: MARGIN, y: MARGIN, width: pageW, height: pageH, pixelRatio: 3 });
  bg.shadowEnabled(true);
  tr.show();
  layer.batchDraw();
  const a = document.createElement("a");
  a.href = url;
  a.download = "figure.png";
  a.click();
};

// ===== Démarrage =====
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved) loadProject(saved);
} catch {}
renderIcons();
sync();