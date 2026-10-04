// ===== Configuration =====
const STORAGE_KEY = "bioimg-project";
let pageW = 1200, pageH = 800;

let items = [];          // modèle de données
let selectedId = null;
let history = [], future = [];
let counter = Date.now();
const newId = () => "n" + (counter++);

// ===== Konva =====
const stage = new Konva.Stage({ container: "canvas", width: pageW, height: pageH });
const bgLayer = new Konva.Layer();
const bg = new Konva.Rect({ x: 0, y: 0, width: pageW, height: pageH, fill: "#fff" });
bgLayer.add(bg);
const layer = new Konva.Layer();
stage.add(bgLayer, layer);

const tr = new Konva.Transformer({
  rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
  anchorSize: 8, borderStroke: "#3b6fe0", anchorStroke: "#3b6fe0",
});

// Cache des images
const imgCache = {};
function getImage(src) {
  if (!imgCache[src]) {
    const img = new Image();
    img.onload = () => layer.batchDraw();
    img.src = src;
    imgCache[src] = img;
  }
  return imgCache[src];
}

// ===== Rendu =====
function render() {
  layer.destroyChildren();
  items.forEach((it) => layer.add(createNode(it)));
  layer.add(tr);
  const node = selectedId && layer.findOne("#" + selectedId);
  tr.nodes(node ? [node] : []);
  if (!node) selectedId = null;
  layer.batchDraw();
  updateProps();
}

function createNode(it) {
  const common = {
    id: it.id, x: it.x, y: it.y, rotation: it.rotation || 0,
    scaleX: it.scaleX || 1, scaleY: it.scaleY || 1,
    opacity: it.opacity ?? 1, draggable: true,
  };
  let n;
  switch (it.type) {
    case "image":
      n = new Konva.Image({ ...common, image: getImage(it.src), width: it.width, height: it.height });
      break;
    case "text":
      n = new Konva.Text({ ...common, text: it.text, fontSize: it.fontSize, fill: it.fill, fontFamily: "Arial" });
      n.on("dblclick dbltap", () => {
        const t = prompt("Texte :", it.text);
        if (t !== null) update(it.id, { text: t });
      });
      break;
    case "arrow":
      n = new Konva.Arrow({ ...common, points: [0, 0, it.width, 0], stroke: it.stroke, fill: it.stroke,
        strokeWidth: it.strokeWidth, pointerLength: 14, pointerWidth: 14, hitStrokeWidth: 20 });
      break;
    case "rect":
      n = new Konva.Rect({ ...common, width: it.width, height: it.height, fill: it.fill,
        stroke: it.stroke, strokeWidth: it.strokeWidth, cornerRadius: 8 });
      break;
    case "ellipse":
      n = new Konva.Ellipse({ ...common, radiusX: it.width / 2, radiusY: it.height / 2,
        fill: it.fill, stroke: it.stroke, strokeWidth: it.strokeWidth });
      break;
  }
  n.on("mousedown tap", () => select(it.id));
  n.on("dragend transformend", () =>
    update(it.id, { x: n.x(), y: n.y(), rotation: n.rotation(), scaleX: n.scaleX(), scaleY: n.scaleY() }));
  return n;
}

// ===== État / historique =====
function snapshot() {
  history.push(JSON.stringify(items));
  if (history.length > 100) history.shift();
  future = [];
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ pageW, pageH, items }));
}
function commit() { save(); render(); }

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
  selectedId = id;
  const node = id && layer.findOne("#" + id);
  tr.nodes(node ? [node] : []);
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

// ===== Ajout d'éléments =====
const center = () => ({ x: pageW / 2 - 60, y: pageH / 2 - 60 });

function addIcon(src, x, y) {
  const img = getImage(src);
  const place = () => {
    const ratio = (img.naturalWidth || 100) / (img.naturalHeight || 100);
    const w = 120, h = 120 / ratio;
    const c = center();
    add({ type: "image", src, x: x ?? c.x, y: y ?? c.y, width: w, height: h });
  };
  img.complete && img.naturalWidth ? place() : img.addEventListener("load", place, { once: true });
}

document.getElementById("btnText").onclick = () =>
  add({ type: "text", text: "Texte", fontSize: 28, fill: "#222222", ...center() });
document.getElementById("btnArrow").onclick = () =>
  add({ type: "arrow", width: 150, stroke: "#222222", strokeWidth: 4, ...center() });
document.getElementById("btnRect").onclick = () =>
  add({ type: "rect", width: 160, height: 100, fill: "#dbe7ff", stroke: "#3b6fe0", strokeWidth: 2, ...center() });
document.getElementById("btnEllipse").onclick = () =>
  add({ type: "ellipse", width: 140, height: 100, fill: "#ffe3d6", stroke: "#e05a3b", strokeWidth: 2, x: pageW / 2, y: pageH / 2 });

// ===== Actions =====
function deleteSelected() {
  if (!selectedId) return;
  snapshot();
  items = items.filter((i) => i.id !== selectedId);
  selectedId = null;
  commit();
}
function duplicate() {
  const it = items.find((i) => i.id === selectedId);
  if (it) add({ ...structuredClone(it), x: it.x + 20, y: it.y + 20 });
}
function reorder(dir) {
  const idx = items.findIndex((i) => i.id === selectedId);
  if (idx < 0) return;
  snapshot();
  const [it] = items.splice(idx, 1);
  dir > 0 ? items.push(it) : items.unshift(it);
  commit();
}

document.getElementById("btnDelete").onclick = deleteSelected;
document.getElementById("btnDuplicate").onclick = duplicate;
document.getElementById("btnFront").onclick = () => reorder(1);
document.getElementById("btnBack").onclick = () => reorder(-1);
document.getElementById("btnUndo").onclick = undo;
document.getElementById("btnRedo").onclick = redo;

// Désélection en cliquant dans le vide
stage.on("mousedown tap", (e) => {
  if (e.target === stage || e.target === bg) select(null);
});

// Raccourcis clavier
window.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  else if ((e.ctrlKey || e.metaKey) && k === "y") { e.preventDefault(); redo(); }
  else if ((e.ctrlKey || e.metaKey) && k === "d") { e.preventDefault(); duplicate(); }
  else if (k === "delete" || k === "backspace") deleteSelected();
  else if (selectedId && k.startsWith("arrow")) {
    e.preventDefault();
    const it = items.find((i) => i.id === selectedId);
    const s = e.shiftKey ? 10 : 1;
    const d = { arrowleft: [-s, 0], arrowright: [s, 0], arrowup: [0, -s], arrowdown: [0, s] }[k];
    update(selectedId, { x: it.x + d[0], y: it.y + d[1] });
  }
});

// ===== Panneau des propriétés =====
const $ = (id) => document.getElementById(id);
function updateProps() {
  const it = items.find((i) => i.id === selectedId);
  $("noSel").hidden = !!it;
  $("propFields").hidden = !it;
  if (!it) return;
  $("propColor").value = it.fill || it.stroke || "#000000";
  $("propStroke").value = it.stroke || "#000000";
  $("propStrokeW").value = it.strokeWidth || 0;
  $("propFont").value = it.fontSize || 20;
  $("propOpacity").value = it.opacity ?? 1;
  $("fsWrap").hidden = it.type !== "text";
}
$("propColor").onchange = (e) => {
  const it = items.find((i) => i.id === selectedId);
  if (!it) return;
  update(it.id, it.type === "arrow" ? { stroke: e.target.value } : { fill: e.target.value });
};
$("propStroke").onchange = (e) => selectedId && update(selectedId, { stroke: e.target.value });
$("propStrokeW").onchange = (e) => selectedId && update(selectedId, { strokeWidth: +e.target.value });
$("propFont").onchange = (e) => selectedId && update(selectedId, { fontSize: +e.target.value });
$("propOpacity").onchange = (e) => selectedId && update(selectedId, { opacity: +e.target.value });

function resizePage() {
  pageW = +$("pageW").value || 1200;
  pageH = +$("pageH").value || 800;
  stage.size({ width: pageW, height: pageH });
  bg.size({ width: pageW, height: pageH });
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
      div.innerHTML = `<img src="${icon.src}" alt=""><div>${icon.name}</div>`;
      div.onclick = () => addIcon(icon.src);
      div.ondragstart = (e) => e.dataTransfer.setData("text/plain", icon.src);
      list.appendChild(div);
    });
}
$("search").oninput = renderIcons;

// Glisser-déposer vers le canvas
const container = stage.container();
container.addEventListener("dragover", (e) => e.preventDefault());
container.addEventListener("drop", (e) => {
  e.preventDefault();
  const src = e.dataTransfer.getData("text/plain");
  if (!src) return;
  stage.setPointersPositions(e);
  const p = stage.getPointerPosition();
  addIcon(src, p.x - 60, p.y - 60);
});

// Importer ses propres icônes (enregistrées dans le projet)
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

// ===== Projet : nouveau / sauvegarde / ouverture =====
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
  items = data.items || [];
  $("pageW").value = data.pageW || 1200;
  $("pageH").value = data.pageH || 800;
  resizePage();
  selectedId = null;
  render();
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

// ===== Export PNG haute résolution =====
$("btnPng").onclick = () => {
  tr.nodes([]);
  const url = stage.toDataURL({ pixelRatio: 3 });
  select(selectedId);
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
render();