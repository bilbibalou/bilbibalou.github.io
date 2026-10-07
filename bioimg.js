// ===== Configuration =====
const STORAGE_KEY = "bioimg-project";
const MARGIN = 60;                 // marge autour de la page pour attraper les poignées
let pageW = 1200, pageH = 800;

let items = [];
let selectedId = null;
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

const tr = new Konva.Transformer({
  rotateEnabled: true,
  rotateAnchorOffset: 30,
  anchorSize: 12,
  anchorStrokeWidth: 2,
  anchorStroke: "#3b6fe0",
  anchorFill: "#fff",
  borderStroke: "#3b6fe0",
  borderStrokeWidth: 2,
  padding: 4,
  keepRatio: true,
  boundBoxFunc: (oldBox, newBox) =>
    newBox.width < 10 || newBox.height < 10 ? oldBox : newBox,
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
  if (it.type === "image") n.setAttrs({ image: getImage(it.src), width: it.width, height: it.height });
  else n.setAttrs({ text: it.text, fontSize: it.fontSize, fill: it.fill });
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
  selectedId = id && nodes.has(id) ? id : null;
  tr.nodes(selectedId ? [nodes.get(selectedId)] : []);
  tr.moveToTop();
  layer.batchDraw();
  updateProps();
}
function undo() {
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

stage.on("mousedown touchstart", (e) => {
  document.activeElement?.blur();                        // rend le clavier au canvas
  const t = e.target;
  if (t.findAncestor("Transformer")) return;            // clic sur une poignée
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
  add({ type: "text", text: "Texte", fontSize: 28, fill: "#222222", ...center() });

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
  if (!it) return;
  const isText = it.type === "text";
  setHidden("colorWrap", !isText);
  setHidden("fsWrap", !isText);
  setHidden("textHint", !isText);
  setValue("propColor", it.fill || "#000000");
  setValue("propFont", it.fontSize || 20);
  setValue("propOpacity", it.opacity ?? 1);
}
const onChange = (id, fn) => { const el = $(id); if (el) el.onchange = (e) => { fn(e); el.blur(); }; };
onChange("propColor", (e) => selectedId && update(selectedId, { fill: e.target.value }));
onChange("propFont", (e) => selectedId && update(selectedId, { fontSize: +e.target.value }));
onChange("propOpacity", (e) => selectedId && update(selectedId, { opacity: +e.target.value }));

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

function renderIcons() {
  const q = $("search").value.toLowerCase();
  const list = $("iconList");
  list.innerHTML = "";
  icons
    .filter((i) => (i.name + " " + (i.tags || "")).toLowerCase().includes(q))
    .forEach((icon) => {
      const div = document.createElement("div");
      div.className = "icon-item";
      div.draggable = true;
      div.title = icon.name;
      div.innerHTML = `<img src="${icon.src}" alt="" draggable="false"><div>${icon.name}</div>`;
      div.onclick = () => addIcon(icon.src);
      div.ondragstart = (e) => e.dataTransfer.setData("text/plain", icon.src);
      list.appendChild(div);
    });
}
$("search").oninput = renderIcons;

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