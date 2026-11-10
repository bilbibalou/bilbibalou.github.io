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

// ===== Flèches : poignées de départ / arrivée / courbure =====
const handles = new Konva.Group({ visible: false });
function mkHandle(role, fill, stroke) {
  const h = new Konva.Circle({ radius: 7, fill, stroke, strokeWidth: 2, draggable: true, name: "ahandle" });
  h.setAttr("role", role);
  h.on("dragstart", () => { if (!gestureSnap) gestureSnap = JSON.stringify(items); });
  h.on("dragmove", () => onHandleMove(h));
  h.on("dragend", () => { onHandleMove(h); commitArrowGeo(); });
  handles.add(h);
  return h;
}
const hStart = mkHandle("start", "#ffffff", "#3b6fe0");
const hEnd = mkHandle("end", "#ffffff", "#3b6fe0");
const hMid = mkHandle("mid", "#3b6fe0", "#ffffff");      // sur la courbe : on l'attrape pour courber
layer.add(handles);

const midOf = (g) => ({ x: (g.x1 + 2 * g.cx + g.x2) / 4, y: (g.y1 + 2 * g.cy + g.y2) / 4 });   // milieu réel de la courbe
function placeHandles(g, skip) {
  if (skip !== "start") hStart.position({ x: g.x1, y: g.y1 });
  if (skip !== "end") hEnd.position({ x: g.x2, y: g.y2 });
  if (skip !== "mid") hMid.position(midOf(g));
}
function showHandles(it) {
  if (!it) { handles.hide(); return; }
  handles.position({ x: 0, y: 0 });
  placeHandles(it);
  handles.show();
  handles.moveToTop();
}
function onHandleMove(h) {
  const n = nodes.get(selectedId);
  if (!n || !n.getAttr("geo")) return;
  const g = { ...n.getAttr("geo") }, role = h.getAttr("role");
  if (role === "start") { g.x1 = h.x(); g.y1 = h.y(); }
  else if (role === "end") { g.x2 = h.x(); g.y2 = h.y(); }
  else { g.cx = 2 * h.x() - (g.x1 + g.x2) / 2; g.cy = 2 * h.y() - (g.y1 + g.y2) / 2; }
  n.setAttr("geo", g);
  placeHandles(g, role);
  layer.batchDraw();
}
function commitArrowGeo() {
  const n = nodes.get(selectedId);
  if (!n || !n.getAttr("geo")) return;
  const g = n.getAttr("geo");
  if (gestureSnap) {
    history.push(gestureSnap);
    if (history.length > 100) history.shift();
    future = [];
    gestureSnap = null;
  }
  items = items.map((i) => (i.id === selectedId ? { ...i, x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2, cx: g.cx, cy: g.cy } : i));
  commit();
}
const shiftArrow = (i, dx, dy) => ({ ...i, x1: i.x1 + dx, y1: i.y1 + dy, x2: i.x2 + dx, y2: i.y2 + dy, cx: i.cx + dx, cy: i.cy + dy });



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
         .forEach((i) => { const n = nodes.get(i.id); if (n) setAnyImage(n, tintCache[key]); });
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

// ----- Dessin d'une flèche (courbe de Bézier + pointes) -----
function arrowTangents(g) {
  const fx = g.x2 - g.x1, fy = g.y2 - g.y1;
  const unit = (x, y) => { const l = Math.hypot(x, y); if (l >= 0.5) return [x / l, y / l]; const m = Math.hypot(fx, fy) || 1; return [fx / m, fy / m]; };
  return { s: unit(g.cx - g.x1, g.cy - g.y1), e: unit(g.x2 - g.cx, g.y2 - g.cy) };   // s : sortie du départ, e : arrivée
}
function drawHead(c, tip, d, type, hl, hw) {
  if (!type || type === "none") return;
  const px = -d[1], py = d[0];
  if (type === "triangle") {
    const bx = tip.x - d[0] * hl, by = tip.y - d[1] * hl;
    c.beginPath(); c.moveTo(tip.x, tip.y);
    c.lineTo(bx + px * hw / 2, by + py * hw / 2); c.lineTo(bx - px * hw / 2, by - py * hw / 2);
    c.closePath(); c.fill();
  } else if (type === "open") {
    const bx = tip.x - d[0] * hl * 0.9, by = tip.y - d[1] * hl * 0.9;
    c.beginPath();
    c.moveTo(bx + px * hw / 2, by + py * hw / 2); c.lineTo(tip.x, tip.y); c.lineTo(bx - px * hw / 2, by - py * hw / 2);
    c.stroke();
  } else if (type === "dot") {
    c.beginPath(); c.arc(tip.x - d[0] * hl * 0.25, tip.y - d[1] * hl * 0.25, hl * 0.3, 0, Math.PI * 2); c.fill();
  }
}
function drawArrow(ctx, shape) {
  const g = shape.getAttr("geo"), s = shape.getAttr("style");
  if (!g || !s) return;
  const c = ctx._context, w = s.strokeWidth;
  const hl = Math.max(12, w * 4), hw = hl * 0.9;
  const t = arrowTangents(g);
  const inset = (type) => (type === "triangle" ? hl * 0.85 : type === "dot" ? hl * 0.25 : 0);   // le trait s'arrête avant la pointe
  const a0 = inset(s.headStart), a1 = inset(s.headEnd);
  c.save();
  c.strokeStyle = s.stroke; c.fillStyle = s.stroke; c.lineWidth = w; c.lineJoin = "round";
  c.lineCap = s.dash === "dotted" ? "round" : "butt";
  c.setLineDash(s.dash === "dashed" ? [w * 3, w * 2] : s.dash === "dotted" ? [0.01, w * 2.2] : []);
  c.beginPath();
  c.moveTo(g.x1 + t.s[0] * a0, g.y1 + t.s[1] * a0);
  c.quadraticCurveTo(g.cx, g.cy, g.x2 - t.e[0] * a1, g.y2 - t.e[1] * a1);
  c.stroke();
  c.setLineDash([]); c.lineCap = "butt";
  drawHead(c, { x: g.x1, y: g.y1 }, [-t.s[0], -t.s[1]], s.headStart, hl, hw);
  drawHead(c, { x: g.x2, y: g.y2 }, t.e, s.headEnd, hl, hw);
  c.restore();
}
function arrowRect(n) {
  const g = n.getAttr("geo"), s = n.getAttr("style");
  if (!g) return { x: 0, y: 0, width: 0, height: 0 };
  const m = s ? Math.max(12, s.strokeWidth * 4) + s.strokeWidth : (n.getAttr("thick") || 20);
  const xs = [g.x1, g.cx, g.x2], ys = [g.y1, g.cy, g.y2];
  const x = Math.min(...xs) - m, y = Math.min(...ys) - m;
  return { x, y, width: Math.max(...xs) + m - x, height: Math.max(...ys) + m - y };
}
function distToSeg(x, y, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)) : 0;
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
}
function hitArrow(n, p) {                       // p : position écran ; test géométrique le long de la courbe
  const g = n.getAttr("geo"), s = n.getAttr("style");
  if (!g) return false;
  const q = layer.getAbsoluteTransform().copy().invert().point(p);
  const half = s ? s.strokeWidth / 2 + 6 : (n.getAttr("thick") || 20) / 2;     // icône déformée : demi-épaisseur
  const x = q.x - n.x(), y = q.y - n.y(), tol = Math.max(8, half);
  let px = g.x1, py = g.y1;
  for (let i = 1; i <= 48; i++) {
    const t = i / 48, u = 1 - t;
    const nx = u * u * g.x1 + 2 * u * t * g.cx + t * t * g.x2, ny = u * u * g.y1 + 2 * u * t * g.cy + t * t * g.y2;
    if (distToSeg(x, y, px, py, nx, ny) <= tol) return true;
    px = nx; py = ny;
  }
  return false;
}

// ----- Icônes-flèches déformables : l'image est découpée en tranches posées le long d'une courbe de Bézier -----
const isArrowLike = (it) => !!it && (it.type === "arrow" || it.type === "arrowicon");
function baseName(src) {
  try { return decodeURIComponent((src.split("?")[0].split("/").pop() || "")).replace(/\.[a-z0-9]+$/i, ""); } catch { return ""; }
}
const isArrowSrc = (src) => !!src && !src.startsWith("data:") && /^arrow[ _-]/i.test(baseName(src));   // fichiers "Arrow ..."
// Rotation (0/90/180/270) à appliquer à l'icône pour que sa flèche pointe vers la droite
function autoOrient(name, ratio) {
  const n = " " + name.toLowerCase().replace(/[_-]+/g, " ") + " ";
  if (/ up /.test(n)) return 90;
  if (/ down /.test(n)) return 270;
  if (/ left /.test(n)) return 180;
  if (/ right /.test(n)) return 0;
  return ratio < 0.8 ? 90 : 0;
}
const rasterCache = new WeakMap();
// Rasterise l'icône (haute résolution, une seule fois) dans un canvas, orienté "flèche vers la droite"
function makeRaster(img, orient) {
  let byImg = rasterCache.get(img);
  if (!byImg) rasterCache.set(img, (byImg = {}));
  if (byImg[orient]) return byImg[orient];
  const ratio = (img.naturalWidth || 100) / (img.naturalHeight || 100), MAX = 1200;
  const cw = ratio >= 1 ? MAX : Math.round(MAX * ratio), ch = ratio >= 1 ? Math.round(MAX / ratio) : MAX;
  const quarter = orient % 180 !== 0;
  const cv = document.createElement("canvas");
  cv.width = quarter ? ch : cw; cv.height = quarter ? cw : ch;
  const c = cv.getContext("2d");
  c.translate(cv.width / 2, cv.height / 2);
  c.rotate((orient * Math.PI) / 180);
  c.drawImage(img, -cw / 2, -ch / 2, cw, ch);
  return (byImg[orient] = cv);
}
function setWarpImage(n, src, orient) {
  const want = (n._wantSrc = src + "|" + orient);
  const img = getImage(src);
  const go = () => { if (n._wantSrc === want) { n.setAttr("raster", makeRaster(img, orient)); layer.batchDraw(); } };
  if (!img.complete) img.addEventListener("load", go, { once: true });
  else if (img.naturalWidth || img.naturalHeight) go();
}
function setAnyImage(n, src) {
  if (n.getAttr("geo")) setWarpImage(n, src, n.getAttr("orient") || 0);
  else setNodeImage(n, src);
}
function drawWarp(ctx, shape) {
  const g = shape.getAttr("geo"), r = shape.getAttr("raster");
  if (!g || !r) return;
  const thick = shape.getAttr("thick") || 20, flip = !!shape.getAttr("flip");
  const c = ctx._context;
  const M = 160, cum = [0];
  const P = (t) => { const u = 1 - t; return { x: u * u * g.x1 + 2 * u * t * g.cx + t * t * g.x2, y: u * u * g.y1 + 2 * u * t * g.cy + t * t * g.y2 }; };
  let prev = P(0), minX = prev.x, maxX = prev.x, minY = prev.y, maxY = prev.y;
  for (let i = 1; i <= M; i++) {
    const p = P(i / M);
    cum.push(cum[i - 1] + Math.hypot(p.x - prev.x, p.y - prev.y));
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    prev = p;
  }
  const L = cum[M];
  if (L < 1) return;
  const N = Math.max(24, Math.min(160, Math.round(L / 3)));
  const sw = r.width / N, dw = L / N, ov = 0.4;
  const paint = (cc) => {
    let j = 0;
    for (let k = 0; k < N; k++) {
      const s = (k + 0.5) * dw;
      while (j < M - 1 && cum[j + 1] < s) j++;
      const seg = cum[j + 1] - cum[j] || 1;
      const t = (j + Math.min(1, Math.max(0, (s - cum[j]) / seg))) / M, u = 1 - t;
      const p = P(t);
      const tx = 2 * u * (g.cx - g.x1) + 2 * t * (g.x2 - g.cx), ty = 2 * u * (g.cy - g.y1) + 2 * t * (g.y2 - g.cy);
      cc.save();
      cc.translate(p.x, p.y);
      cc.rotate(Math.atan2(ty, tx));
      if (flip) cc.scale(1, -1);
      cc.drawImage(r, k * sw, 0, sw, r.height, -dw / 2 - ov, -thick / 2, dw + 2 * ov, thick);
      cc.restore();
    }
  };
  if (c.globalAlpha < 0.999) {
    // opacité générale : on dessine d'abord en opaque puis on applique l'opacité une seule fois (pas de rayures aux jointures)
    const m = c.getTransform(), sc = Math.min(4, Math.hypot(m.a, m.b) || 1);
    const bx = minX - thick, by = minY - thick, bw = maxX - minX + 2 * thick, bh = maxY - minY + 2 * thick;
    const off = document.createElement("canvas");
    off.width = Math.max(1, Math.ceil(bw * sc)); off.height = Math.max(1, Math.ceil(bh * sc));
    const oc = off.getContext("2d");
    oc.scale(sc, sc); oc.translate(-bx, -by);
    paint(oc);
    c.drawImage(off, bx, by, bw, bh);
  } else paint(c);
}

function buildNode(it) {
  let n;
  if (it.type === "image") n = new Konva.Image({ id: it.id, draggable: true });
  else if (it.type === "text") n = new Konva.Text({ id: it.id, draggable: true, fontFamily: "Arial" });
  else if (it.type === "arrowicon") {
    n = new Konva.Shape({ id: it.id, draggable: true, sceneFunc: drawWarp, hitFunc: () => {} });
    n.getSelfRect = () => arrowRect(n);
    n.on("dragmove", () => { handles.position({ x: n.x(), y: n.y() }); });
  }
  else if (it.type === "arrow") {
    n = new Konva.Shape({ id: it.id, draggable: true, sceneFunc: drawArrow, hitFunc: () => {} });
    n.getSelfRect = () => arrowRect(n);
    n.on("dragmove", () => { handles.position({ x: n.x(), y: n.y() }); });   // les poignées suivent la flèche
  }
  else return null;

  n.on("dragstart transformstart", () => {
    if (!gestureSnap) gestureSnap = JSON.stringify(items);
  });
  n.on("dragend transformend", () => endGesture(n));
  return n;
}

function applyAttrs(n, it) {
  if (it.type === "arrowicon") {
    n.setAttrs({
      x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, opacity: it.opacity ?? 1,
      geo: { x1: it.x1, y1: it.y1, x2: it.x2, y2: it.y2, cx: it.cx, cy: it.cy },
      thick: it.thick || 20, flip: !!it.flip, orient: it.orient || 0,
    });
    setWarpImage(n, srcFor(it), it.orient || 0);
    return;
  }
  if (it.type === "arrow") {
    n.setAttrs({
      x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, opacity: it.opacity ?? 1,
      geo: { x1: it.x1, y1: it.y1, x2: it.x2, y2: it.y2, cx: it.cx, cy: it.cy },
      style: { stroke: it.stroke || "#222222", strokeWidth: it.strokeWidth || 4, headStart: it.headStart || "none", headEnd: it.headEnd || "triangle", dash: it.dash || "solid" },
    });
    return;
  }
  n.setAttrs({
    x: it.x, y: it.y, rotation: it.rotation || 0,
    scaleX: it.scaleX || 1, scaleY: it.scaleY || 1,
    opacity: it.opacity ?? 1,
  });
  if (it.type === "image") { n.setAttrs({ width: it.width, height: it.height }); setNodeImage(n, srcFor(it)); }
  else n.setAttrs({
    text: it.text, fontSize: it.fontSize, fill: it.fill, fontFamily: it.fontFamily || "Arial",
    fontStyle: [it.italic ? "italic" : "", it.bold ? "bold" : ""].join(" ").trim() || "normal",
    textDecoration: it.underline ? "underline" : "",
  });
}

function endGesture(n) {
  if (gestureSnap) {
    history.push(gestureSnap);
    if (history.length > 100) history.shift();
    future = [];
    gestureSnap = null;
  }
  if (n.getAttr("geo")) {                         // flèche déplacée : on "cuit" le décalage dans ses points
    const dx = n.x(), dy = n.y();
    if (dx || dy) items = items.map((i) => (i.id === n.id() ? shiftArrow(i, dx, dy) : i));
    save(); sync();
    return;
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

// Cadre de transformation pour images/textes, poignées dédiées pour les flèches
function attachSelection() {
  const it = items.find((i) => i.id === selectedId);
  const n = it && nodes.get(it.id);
  const isArrow = isArrowLike(it);
  tr.nodes(n && !isArrow ? [n] : []);
  tr.keepRatio(keepRatioLocked);
  showHandles(isArrow ? it : null);
  tr.moveToTop();
  handles.moveToTop();
}

function sync() {
  const ids = new Set(items.map((i) => i.id));
  for (const [id, n] of nodes) {
    if (!ids.has(id)) { n.destroy(); nodes.delete(id); }
  }
  items.forEach((it) => {
    let n = nodes.get(it.id);
    if (n && n._kind !== it.type) { n.destroy(); nodes.delete(it.id); n = null; }   // type changé (conversion / annulation)
    if (!n) {
      n = buildNode(it);
      if (!n) return;
      n._kind = it.type;
      nodes.set(it.id, n);
      layer.add(n);
    }
    applyAttrs(n, it);
    n.moveToTop();
  });
  tr.moveToTop();                       // le cadre toujours au-dessus
  if (selectedId && !nodes.has(selectedId)) selectedId = null;
  attachSelection();
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
  attachSelection();
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
  if (handles.isVisible()) {
    for (const h of handles.getChildren()) {                // poignées de flèche
      const ap = h.getAbsolutePosition();
      if (Math.hypot(ap.x - p.x, ap.y - p.y) <= 12) return h;
    }
  }
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
    if (isArrowLike(items[i])) { if (hitArrow(n, p)) return n; continue; }
    const q = n.getAbsoluteTransform().copy().invert().point(p);
    if (q.x >= 0 && q.y >= 0 && q.x <= n.width() && q.y <= n.height()) return n;
  }
  return null;
}
layer.getIntersection = (pos) => geoHit(pos);

function isClickOnTransformer(t, p) {
  if (!t) return false;
  if (t.hasName && t.hasName("ahandle")) return true;
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
    if (isArrowSrc(src)) {                       // icône "Arrow ..." : flèche modifiable (départ, arrivée, courbure)
      const orient = autoOrient(baseName(src), ratio), r2 = orient % 180 ? 1 / ratio : ratio;
      const mx = (x ?? c.x) + 60, my = (y ?? c.y) + 60;
      add({ type: "arrowicon", src, x1: mx - 120, y1: my, x2: mx + 120, y2: my, cx: mx, cy: my,
            thick: Math.round(Math.max(8, Math.min(300, 240 / r2))), orient, flip: false });
      return;
    }
    add({ type: "image", src, x: x ?? c.x, y: y ?? c.y, width: 120, height: 120 / ratio });
  };
  img.complete ? place() : img.addEventListener("load", place, { once: true });
}

$("btnArrow").onclick = () => {
  const cx = pageW / 2, cy = pageH / 2;
  add({ type: "arrow", x1: cx - 120, y1: cy + 30, x2: cx + 120, y2: cy + 30, cx, cy: cy - 50,
        stroke: "#222222", strokeWidth: 4, headStart: "none", headEnd: "triangle", dash: "solid" });
};
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
  add(isArrowLike(copy) ? shiftArrow(copy, 20 * pasteCount, 20 * pasteCount) : { ...copy, x: it.x + 20 * pasteCount, y: it.y + 20 * pasteCount });
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
    items = items.map((i) => (i.id === selectedId ? (isArrowLike(i) ? shiftArrow(i, d[0], d[1]) : { ...i, x: it.x + d[0], y: it.y + d[1] }) : i));
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
  const isArrow = it.type === "arrow";
  setHidden("colorWrap", !(isText || isArrow));
  setHidden("arrowWrap", !isArrow);
  const isWarp = it.type === "arrowicon";
  setHidden("warpWrap", !isWarp);
  setHidden("toWarpWrap", !(it.type === "image" && isArrowSrc(it.src)));
  setHidden("dimWrap", isArrow || isWarp);
  setHidden("rotWrap", isArrow || isWarp);
  if (isWarp) setValue("propThick", Math.round(it.thick || 20));
  setHidden("fsWrap", !isText);
  setHidden("textHint", !isText);
  setValue("propColor", (isArrow ? it.stroke : it.fill) || "#000000");
  if (isArrow) {
    setValue("propStroke", it.strokeWidth || 4);
    setValue("propHeadStart", it.headStart || "none");
    setValue("propHeadEnd", it.headEnd || "triangle");
    setValue("propDash", it.dash || "solid");
  }
  setValue("propFont", it.fontSize || 20);
  setHidden("ffWrap", !isText);
  const isSvgImg = (it.type === "image" || isWarp) && isSvgSrc(it.src);
  setHidden("tintWrap", !isSvgImg);
  setValue("propTint", it.tint || "#000000");
  if (isSvgImg) refreshPalette(it); else { paletteFor = null; picker.close(); }
  setValue("propFontFamily", it.fontFamily || "Arial");
  setHidden("styleWrap", !isText);
  if (isText) {
    $("btnBold").classList.toggle("active", !!it.bold);
    $("btnItalic").classList.toggle("active", !!it.italic);
    $("btnUnderline").classList.toggle("active", !!it.underline);
  }
  setValue("propOpacity", it.opacity ?? 1);
}
const onChange = (id, fn) => { const el = $(id); if (el) el.onchange = (e) => { fn(e); el.blur(); }; };
const selIsArrow = () => { const it = items.find((i) => i.id === selectedId); return !!it && it.type === "arrow"; };
onChange("propColor", (e) => selectedId && update(selectedId, selIsArrow() ? { stroke: e.target.value } : { fill: e.target.value }));
onChange("propStroke", (e) => selectedId && update(selectedId, { strokeWidth: Math.max(1, Math.min(60, +e.target.value || 4)) }));
onChange("propHeadStart", (e) => selectedId && update(selectedId, { headStart: e.target.value }));
onChange("propHeadEnd", (e) => selectedId && update(selectedId, { headEnd: e.target.value }));
onChange("propDash", (e) => selectedId && update(selectedId, { dash: e.target.value }));
$("btnStraighten").onclick = () => {
  const it = items.find((i) => i.id === selectedId);
  if (it && it.type === "arrow") update(it.id, { cx: (it.x1 + it.x2) / 2, cy: (it.y1 + it.y2) / 2 });
};
// --- icônes-flèches déformables ---
onChange("propThick", (e) => selectedId && update(selectedId, { thick: Math.max(4, Math.min(600, +e.target.value || 20)) }));
const warpItem = () => { const it = items.find((i) => i.id === selectedId); return it && it.type === "arrowicon" ? it : null; };
$("btnWStraighten").onclick = () => { const it = warpItem(); if (it) update(it.id, { cx: (it.x1 + it.x2) / 2, cy: (it.y1 + it.y2) / 2 }); };
$("btnWSwap").onclick = () => { const it = warpItem(); if (it) update(it.id, { x1: it.x2, y1: it.y2, x2: it.x1, y2: it.y1 }); };
$("btnWFlip").onclick = () => { const it = warpItem(); if (it) update(it.id, { flip: !it.flip }); };
$("btnWOrient").onclick = () => { const it = warpItem(); if (it) update(it.id, { orient: ((it.orient || 0) + 90) % 360 }); };
$("btnToWarp").onclick = () => {
  const it = items.find((i) => i.id === selectedId);
  if (!it || it.type !== "image") return;
  const ratio = it.width / it.height, orient = autoOrient(baseName(it.src), ratio);
  const w = it.width * (it.scaleX || 1), h = it.height * (it.scaleY || 1), th = ((it.rotation || 0) * Math.PI) / 180;
  const P = ([lx, ly]) => ({ x: it.x + lx * Math.cos(th) - ly * Math.sin(th), y: it.y + lx * Math.sin(th) + ly * Math.cos(th) });
  const [a, b] = orient === 0 ? [[0, h / 2], [w, h / 2]] : orient === 180 ? [[w, h / 2], [0, h / 2]] : orient === 90 ? [[w / 2, h], [w / 2, 0]] : [[w / 2, 0], [w / 2, h]];
  const s = P(a), e = P(b);
  snapshot();
  const old = nodes.get(it.id);
  if (old) { old.destroy(); nodes.delete(it.id); }          // le nœud image est remplacé par un nœud déformable
  items = items.map((i) => (i.id === it.id ? {
    type: "arrowicon", id: i.id, src: i.src, x1: s.x, y1: s.y, x2: e.x, y2: e.y, cx: (s.x + e.x) / 2, cy: (s.y + e.y) / 2,
    thick: Math.round(orient % 180 ? w : h), orient, flip: false, opacity: i.opacity, tint: i.tint, colorMap: i.colorMap, colorOpacity: i.colorOpacity,
  } : i));
  commit();
};
$("btnSwapArrow").onclick = () => {
  const it = items.find((i) => i.id === selectedId);
  if (it && it.type === "arrow") update(it.id, { x1: it.x2, y1: it.y2, x2: it.x1, y2: it.y1, headStart: it.headEnd || "triangle", headEnd: it.headStart || "none" });
};
onChange("propFont", (e) => selectedId && update(selectedId, { fontSize: +e.target.value }));
onChange("propOpacity", (e) => selectedId && update(selectedId, { opacity: +e.target.value }));

// Aperçu en direct pendant qu'on déplace le curseur / choisit la couleur (validé au relâchement)
const live = (id, fn) => {
  const el = $(id);
  if (el) el.oninput = (e) => { const n = nodes.get(selectedId); if (n) { fn(n, e.target.value); layer.batchDraw(); } };
};
live("propColor", (n, v) => (n.getAttr("geo") ? n.setAttr("style", { ...n.getAttr("style"), stroke: v }) : n.fill(v)));
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
    img.onload = () => { if (n.getAttr("geo")) n.setAttr("raster", makeRaster(img, n.getAttr("orient") || 0)); else n.image(img); layer.batchDraw(); };
    img.src = svgDataUri(renderVariant(t, { ...it, ...patch }));
  }).catch(() => {});
}
const currentSvgItem = () => {
  const it = items.find((i) => i.id === selectedId), n = nodes.get(selectedId);
  return it && n && (it.type === "image" || it.type === "arrowicon") && isSvgSrc(it.src) ? { it, n } : null;
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

// ===== Gras / italique / souligné =====
function toggleTextStyle(key) {
  return async () => {
    const id = selectedId, it = items.find((i) => i.id === id);
    if (!it || it.type !== "text") return;
    const next = { ...it, [key]: !it[key] };
    if (key !== "underline") await loadFonts([fontSpec(next)]);    // la variante de police doit être chargée avant le calcul de taille
    if (items.some((i) => i.id === id)) update(id, { [key]: !it[key] });
  };
}
$("btnBold").onclick = toggleTextStyle("bold");
$("btnItalic").onclick = toggleTextStyle("italic");
$("btnUnderline").onclick = toggleTextStyle("underline");

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
const fontSpec = (it, fam) => `${it.italic ? "italic " : ""}${it.bold ? "bold " : ""}16px "${fam || it.fontFamily || "Arial"}"`;
async function loadFonts(families) {
  try { await Promise.all([...new Set(families)].map((f) => document.fonts.load(f.includes("px") ? f : `16px "${f}"`))); } catch {}
  refreshTextFonts();
}
onChange("propFontFamily", async (e) => {
  if (!selectedId) return;
  const f = e.target.value;
  const cur = items.find((i) => i.id === selectedId);
  await loadFonts([fontSpec(cur || {}, f)]);
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
  items = (data.items || []).filter((i) => i.type === "image" || i.type === "text" || i.type === "arrow" || i.type === "arrowicon");
  $("pageW").value = data.pageW || 1200;
  $("pageH").value = data.pageH || 800;
  resizePage();
  selectedId = null;
  sync();
  loadFonts(items.filter((i) => i.type === "text").map((i) => fontSpec(i)));
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
  handles.hide();
  bg.shadowEnabled(false);
  const url = stage.toDataURL({ x: MARGIN, y: MARGIN, width: pageW, height: pageH, pixelRatio: 3 });
  bg.shadowEnabled(true);
  tr.show();
  if (isArrowLike(items.find((i) => i.id === selectedId))) handles.show();
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