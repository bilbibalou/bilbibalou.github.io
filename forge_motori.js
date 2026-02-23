(function () {
    "use strict";

    var PDF_PATH = "ressources/flipbook/forge_motori.pdf";
    var RENDER_SCALE = 2;
    var FLIP_DURATION = 800;

    /* ===== DOM ===== */
    var canvas, ctx, bookEl;
    var loader, loaderMsg, progressFill, progressText;
    var container, pageIndicator, wrapper, viewport;
    var zoneLeft, zoneRight, btnFullscreen, btnAutoplay;

    canvas        = document.getElementById("pageCanvas");
    ctx           = canvas.getContext("2d");
    bookEl        = document.getElementById("book");
    loader        = document.getElementById("loader");
    loaderMsg     = document.getElementById("loaderMsg");
    progressFill  = document.getElementById("progressFill");
    progressText  = document.getElementById("progressText");
    container     = document.getElementById("flipbook-container");
    pageIndicator = document.getElementById("pageIndicator");
    wrapper       = document.getElementById("book-wrapper");
    viewport      = document.getElementById("book-viewport");
    zoneLeft      = document.getElementById("click-left");
    zoneRight     = document.getElementById("click-right");
    btnFullscreen = document.getElementById("btnFullscreen");
    btnAutoplay   = document.getElementById("btnAutoplay");

    if (!canvas || !bookEl || !loader || !container || !zoneLeft || !zoneRight || !btnFullscreen || !btnAutoplay) {
        console.error("DOM manquant"); return;
    }

    /* ===== STATE ===== */
    var pdfDoc = null, totalPages = 0;
    var pageImgs = [];         // Image objects
    var pageCanvases = [];     // offscreen canvases pour clipping
    var currentSpread = 0, totalSpreads = 0;
    var spreadMap = [];
    var bookW = 0, bookH = 0; // taille CSS du livre
    var cW = 0, cH = 0;       // taille canvas pixels

    /* Drag / Curl */
    var dragging = false;
    var dragCorner = null;     // "br", "tr", "bl", "tl"
    var dragSide = null;       // "right" ou "left"
    var mouse = { x: 0, y: 0 };
    var cornerOrigin = { x: 0, y: 0 };

    /* Animation */
    var animating = false;
    var animStart = 0;
    var animFrom = { x: 0, y: 0 };
    var animTo = { x: 0, y: 0 };
    var animSide = null;
    var animComplete = false; // true = va compléter le flip

    /* Autoplay */
    var autoplayTimer = null, autoplayActive = false;

    /* ===== SPREAD MAP ===== */
    function buildSpreadMap() {
        var s = [];
        s.push([1]);
        var p = 2;
        while (p <= totalPages) {
            if (p + 1 <= totalPages) { s.push([p, p + 1]); p += 2; }
            else { s.push([p]); p++; }
        }
        return s;
    }

    /* ===== PDF LOADING ===== */
    function load() {
        loaderMsg.textContent = "Chargement du PDF…";
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        pdfjsLib.getDocument(PDF_PATH).promise.then(function (pdf) {
            pdfDoc = pdf;
            totalPages = pdf.numPages;
            spreadMap = buildSpreadMap();
            totalSpreads = spreadMap.length;
            loaderMsg.textContent = "Rendu des pages…";
            renderAllPages();
        }).catch(function (err) {
            loaderMsg.textContent = "Erreur : " + err.message;
        });
    }

    function renderAllPages() {
        var done = 0;
        function renderOne(num) {
            return pdfDoc.getPage(num).then(function (page) {
                var vp = page.getViewport({ scale: RENDER_SCALE });
                var c = document.createElement("canvas");
                c.width = vp.width; c.height = vp.height;
                var cx = c.getContext("2d");
                return page.render({ canvasContext: cx, viewport: vp }).promise.then(function () {
                    pageCanvases[num - 1] = c;
                    var img = new Image();
                    img.src = c.toDataURL("image/jpeg", 0.92);
                    pageImgs[num - 1] = img;
                    done++;
                    var pct = Math.round((done / totalPages) * 100);
                    progressFill.style.width = pct + "%";
                    progressText.textContent = done + " / " + totalPages;
                    return new Promise(function (r) { img.onload = r; img.onerror = r; });
                });
            });
        }
        var chain = Promise.resolve();
        for (var i = 1; i <= totalPages; i++) {
            (function (n) { chain = chain.then(function () { return renderOne(n); }); })(i);
        }
        chain.then(startFlipbook);
    }

    /* ===== START ===== */
    function startFlipbook() {
        loader.classList.add("hidden");
        container.classList.remove("hidden");
        doResize();
        updateUI();
        window.addEventListener("resize", doResize);
        requestAnimationFrame(loop);
    }

    /* ===== RESIZE ===== */
    function doResize() {
        var rect = wrapper.getBoundingClientRect();
        var availW = rect.width - 120;
        var availH = rect.height - 20;

        var img0 = pageImgs[0];
        var pr = img0 ? (img0.naturalWidth / img0.naturalHeight) : (210 / 297);
        var spread = spreadMap[currentSpread];
        var single = spread.length === 1;
        var br = single ? pr : pr * 2;

        var bw = availH * br;
        var bh = availH;
        if (bw > availW) { bw = availW; bh = bw / br; }

        bookW = Math.round(bw);
        bookH = Math.round(bh);

        bookEl.style.width = bookW + "px";
        bookEl.style.height = bookH + "px";

        var dpr = window.devicePixelRatio || 1;
        cW = Math.round(bookW * dpr);
        cH = Math.round(bookH * dpr);
        canvas.width = cW;
        canvas.height = cH;
        canvas.style.width = bookW + "px";
        canvas.style.height = bookH + "px";
    }

    /* ===== MAIN LOOP ===== */
    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    /* ===== UPDATE ===== */
    function update() {
        if (!animating) return;

        var elapsed = Date.now() - animStart;
        var t = Math.min(1, elapsed / FLIP_DURATION);
        t = easeInOut(t);

        var cx = animFrom.x + (animTo.x - animFrom.x) * t;
        var cy = animFrom.y + (animTo.y - animFrom.y) * t;
        mouse.x = cx;
        mouse.y = cy;

        if (t >= 1) {
            animating = false;
            dragging = false;
            if (animComplete) {
                if (animSide === "right" && currentSpread < totalSpreads - 1) currentSpread++;
                else if (animSide === "left" && currentSpread > 0) currentSpread--;
                doResize();
            }
            updateUI();
        }
    }

    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /* ===== DRAW ===== */
    function draw() {
        ctx.clearRect(0, 0, cW, cH);

        var spread = spreadMap[currentSpread];
        var single = spread.length === 1;
        var pw = single ? cW : Math.round(cW / 2);

        // Si pas de drag, dessin statique
        if (!dragging && !animating) {
            drawStatic(spread, single, pw);
            return;
        }

        // Avec curl
        drawWithCurl(spread, single, pw);
    }

    /* ===== STATIC DRAW ===== */
    function drawStatic(spread, single, pw) {
        drawPageAt(spread[0] - 1, 0, 0, pw, cH);
        if (!single && spread[1]) {
            drawPageAt(spread[1] - 1, pw, 0, pw, cH);
        }
        if (!single) drawSpine(pw);
    }

    function drawPageAt(idx, x, y, w, h) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y, w, h);
        var img = pageImgs[idx];
        if (!img || !img.naturalWidth) return;
        var ir = img.naturalWidth / img.naturalHeight;
        var br = w / h;
        var dw, dh, dx, dy;
        if (ir > br) { dw = w; dh = w / ir; dx = x; dy = y + (h - dh) / 2; }
        else { dh = h; dw = h * ir; dx = x + (w - dw) / 2; dy = y; }
        ctx.drawImage(img, dx, dy, dw, dh);
    }

    function drawSpine(pw) {
        var cx = pw;
        var g = ctx.createLinearGradient(cx - 15, 0, cx + 15, 0);
        g.addColorStop(0, "rgba(0,0,0,0.25)");
        g.addColorStop(0.4, "rgba(0,0,0,0.02)");
        g.addColorStop(0.5, "rgba(255,255,255,0.03)");
        g.addColorStop(0.6, "rgba(0,0,0,0.02)");
        g.addColorStop(1, "rgba(0,0,0,0.25)");
        ctx.fillStyle = g;
        ctx.fillRect(cx - 15, 0, 30, cH);
    }

    /* ===== CURL DRAW ===== */
    function drawWithCurl(spread, single, pw) {
        var goRight = dragSide === "right" || animSide === "right";
        var targetIdx = goRight ? currentSpread + 1 : currentSpread - 1;
        if (targetIdx < 0 || targetIdx >= totalSpreads) {
            drawStatic(spread, single, pw); return;
        }

        var tgtSpread = spreadMap[targetIdx];

        // Coordonnées du coin qui se soulève (en pixels canvas)
        var corner = cornerOrigin;
        var m = { x: mouse.x, y: mouse.y };

        // Limiter le mouvement pour que ça reste réaliste
        m = clampCurl(m, corner, pw, goRight);

        // Point milieu entre le coin et la souris
        var mid = { x: (corner.x + m.x) / 2, y: (corner.y + m.y) / 2 };

        // Vecteur perpendiculaire au pli
        var dx = m.x - corner.x;
        var dy = m.y - corner.y;

        // Angle du pli
        var foldAngle = Math.atan2(dy, dx);

        // Ligne de pli passe par mid, perpendiculaire à (corner -> mouse)
        // Direction du pli :
        var perpX = -dy;
        var perpY = dx;
        var perpLen = Math.sqrt(perpX * perpX + perpY * perpY);
        if (perpLen < 1) { drawStatic(spread, single, pw); return; }
        perpX /= perpLen;
        perpY /= perpLen;

        // Calculer les intersections de la ligne de pli avec le rectangle de la page
        var pageLeft, pageRight;
        if (goRight) { pageLeft = pw; pageRight = cW; }
        else { pageLeft = 0; pageRight = pw; }

        var foldPts = getFoldIntersections(mid, perpX, perpY, pageLeft, 0, pageRight, cH);
        if (foldPts.length < 2) { drawStatic(spread, single, pw); return; }

        // Construire le polygone de la partie "soulevée" (côté souris)
        var liftedPoly = getLiftedPolygon(foldPts, corner, m, pageLeft, 0, pageRight, cH, goRight);

        // === 1) Dessiner la page sous-jacente (celle qu'on révèle) ===
        ctx.save();
        ctx.beginPath();
        ctx.rect(goRight ? pw : 0, 0, pw, cH);
        ctx.clip();

        if (goRight) {
            // On révèle la page gauche du prochain spread
            drawPageAt(tgtSpread[0] - 1, pw, 0, pw, cH);
        } else {
            // On révèle la page droite du précédent spread
            var prevRight = tgtSpread.length > 1 ? tgtSpread[1] - 1 : tgtSpread[0] - 1;
            drawPageAt(prevRight, 0, 0, pw, cH);
        }
        ctx.restore();

        // === 2) Dessiner la page non-tournée (l'autre côté) ===
        if (goRight) {
            drawPageAt(spread[0] - 1, 0, 0, pw, cH);
        } else {
            if (!single && spread[1]) {
                drawPageAt(spread[1] - 1, pw, 0, pw, cH);
            }
        }

        // === 3) Dessiner la partie NON soulevée de la page qui tourne ===
        var pageIdx;
        if (goRight) {
            pageIdx = single ? spread[0] - 1 : (spread[1] ? spread[1] - 1 : spread[0] - 1);
        } else {
            pageIdx = spread[0] - 1;
        }

        ctx.save();
        // Clip = zone de la page MINUS le polygone soulevé
        clipNotLifted(foldPts, liftedPoly, pageLeft, 0, pageRight, cH, goRight, corner);
        drawPageAt(pageIdx, goRight ? pw : 0, 0, pw, cH);
        ctx.restore();

        // === 4) Ombre sous le pli ===
        drawFoldShadow(foldPts, mid, corner, m, goRight, pw);

        // === 5) Dessiner la partie soulevée (reflétée par rapport au pli) ===
        ctx.save();
        // Clip au polygone soulevé ET au rectangle de la page sous-jacente
        ctx.beginPath();
        ctx.rect(goRight ? pw : 0, 0, pw, cH);
        ctx.clip();

        clipLiftedPoly(liftedPoly);

        // Transformer : réflexion par rapport à la ligne de pli
        applyFoldReflection(mid, foldAngle);

        // Dessiner le dos de la page (= page suivante côté gauche ou précédente côté droit)
        var backIdx;
        if (goRight) {
            backIdx = tgtSpread[0] - 1;
        } else {
            backIdx = tgtSpread.length > 1 ? (tgtSpread[1] ? tgtSpread[1] - 1 : tgtSpread[0] - 1) : tgtSpread[0] - 1;
        }
        drawPageAt(backIdx, goRight ? pw : 0, 0, pw, cH);

        // Gradient d'ombre/lumière sur la page retournée
        ctx.restore();

        // === 6) Highlight sur la partie soulevée ===
        drawCurlHighlight(liftedPoly, mid, perpX, perpY, foldAngle);

        // Spine
        if (!single) drawSpine(pw);
    }

    /* ===== CURL HELPERS ===== */

    function clampCurl(m, corner, pw, goRight) {
        // Garder la souris dans des limites raisonnables
        var cx = m.x, cy = m.y;

        if (goRight) {
            // Le coin vient de la droite, la souris va vers la gauche
            if (cx > corner.x - 5) cx = corner.x - 5;
            // Ne pas dépasser le bord gauche du livre
            if (cx < 0) cx = 0;
        } else {
            if (cx < corner.x + 5) cx = corner.x + 5;
            if (cx > cW) cx = cW;
        }

        return { x: cx, y: cy };
    }

    function getFoldIntersections(mid, nx, ny, left, top, right, bottom) {
        // Ligne : point mid, direction (nx, ny)
        // Trouve les intersections avec le rectangle [left,top,right,bottom]
        var pts = [];

        // Haut (y = top)
        if (Math.abs(ny) > 0.0001) {
            var t = (top - mid.y) / ny;
            var ix = mid.x + t * nx;
            if (ix >= left - 1 && ix <= right + 1) pts.push({ x: ix, y: top });
        }
        // Bas (y = bottom)
        if (Math.abs(ny) > 0.0001) {
            var t2 = (bottom - mid.y) / ny;
            var ix2 = mid.x + t2 * nx;
            if (ix2 >= left - 1 && ix2 <= right + 1) pts.push({ x: ix2, y: bottom });
        }
        // Gauche (x = left)
        if (Math.abs(nx) > 0.0001) {
            var t3 = (left - mid.x) / nx;
            var iy = mid.y + t3 * ny;
            if (iy >= top - 1 && iy <= bottom + 1) pts.push({ x: left, y: iy });
        }
        // Droite (x = right)
        if (Math.abs(nx) > 0.0001) {
            var t4 = (right - mid.x) / nx;
            var iy2 = mid.y + t4 * ny;
            if (iy2 >= top - 1 && iy2 <= bottom + 1) pts.push({ x: right, y: iy2 });
        }

        // Déduplicate (points proches)
        var unique = [pts[0]];
        for (var i = 1; i < pts.length; i++) {
            var dup = false;
            for (var j = 0; j < unique.length; j++) {
                if (Math.abs(pts[i].x - unique[j].x) < 2 && Math.abs(pts[i].y - unique[j].y) < 2) {
                    dup = true; break;
                }
            }
            if (!dup) unique.push(pts[i]);
        }
        return unique;
    }

    function getLiftedPolygon(foldPts, corner, mouse, left, top, right, bottom, goRight) {
        // Le polygone soulevé = la partie du rectangle de la page qui est du côté de la souris
        // par rapport à la ligne de pli
        // On construit ça en partant des foldPts et en ajoutant les coins du côté du corner original

        var rectCorners = [
            { x: left, y: top },
            { x: right, y: top },
            { x: right, y: bottom },
            { x: left, y: bottom }
        ];

        // Direction : quel côté de la ligne de pli est le corner ?
        var mid = { x: (corner.x + mouse.x) / 2, y: (corner.y + mouse.y) / 2 };
        var dx = mouse.x - corner.x;
        var dy = mouse.y - corner.y;

        function sideOf(p) {
            return (p.x - mid.x) * (-dy) + (p.y - mid.y) * dx;
        }

        var cornerSide = sideOf(corner);

        // Collecter les coins du rectangle du côté du corner
        var sameSideCorners = [];
        for (var i = 0; i < rectCorners.length; i++) {
            if (sideOf(rectCorners[i]) * cornerSide > 0) {
                sameSideCorners.push(rectCorners[i]);
            }
        }

        // Construire le polygone : foldPts + coins du même côté, dans l'ordre
        var poly = [];
        for (var j = 0; j < foldPts.length; j++) poly.push(foldPts[j]);
        // Trier les coins par angle
        var cx = 0, cy2 = 0;
        for (var k = 0; k < sameSideCorners.length; k++) {
            cx += sameSideCorners[k].x; cy2 += sameSideCorners[k].y;
        }
        cx /= sameSideCorners.length || 1;
        cy2 /= sameSideCorners.length || 1;

        sameSideCorners.sort(function (a, b) {
            return Math.atan2(a.y - cy2, a.x - cx) - Math.atan2(b.y - cy2, b.x - cx);
        });

        for (var l = 0; l < sameSideCorners.length; l++) poly.push(sameSideCorners[l]);

        // Trier le polygone entier en ordre convexe
        var pcx = 0, pcy = 0;
        for (var ii = 0; ii < poly.length; ii++) { pcx += poly[ii].x; pcy += poly[ii].y; }
        pcx /= poly.length; pcy /= poly.length;
        poly.sort(function (a, b) {
            return Math.atan2(a.y - pcy, a.x - pcx) - Math.atan2(b.y - pcy, b.x - pcx);
        });

        return poly;
    }

    function clipLiftedPoly(poly) {
        if (poly.length < 3) return;
        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        for (var i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
        ctx.closePath();
        ctx.clip();
    }

    function clipNotLifted(foldPts, liftedPoly, left, top, right, bottom, goRight, corner) {
        // Clip au rectangle de la page MINUS le polygone soulevé
        // On utilise "evenodd" fill rule
        ctx.beginPath();
        // Rectangle extérieur
        ctx.moveTo(left, top);
        ctx.lineTo(right, top);
        ctx.lineTo(right, bottom);
        ctx.lineTo(left, bottom);
        ctx.closePath();

        // Polygone intérieur (trou) - en sens inverse
        if (liftedPoly.length >= 3) {
            ctx.moveTo(liftedPoly[liftedPoly.length - 1].x, liftedPoly[liftedPoly.length - 1].y);
            for (var i = liftedPoly.length - 2; i >= 0; i--) {
                ctx.lineTo(liftedPoly[i].x, liftedPoly[i].y);
            }
            ctx.closePath();
        }
        ctx.clip("evenodd");
    }

    function applyFoldReflection(mid, foldAngle) {
        // Réflexion par rapport à la ligne de pli passant par mid
        // avec angle perpendiculaire = foldAngle
        var a = foldAngle;
        ctx.translate(mid.x, mid.y);
        ctx.transform(
            Math.cos(2 * a), Math.sin(2 * a),
            Math.sin(2 * a), -Math.cos(2 * a),
            0, 0
        );
        ctx.translate(-mid.x, -mid.y);
    }

    function drawFoldShadow(foldPts, mid, corner, mouse, goRight, pw) {
        if (foldPts.length < 2) return;

        // Distance du pli au coin = intensité de l'ombre
        var dx = mouse.x - corner.x;
        var dy = mouse.y - corner.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var maxDist = pw;
        var intensity = Math.min(1, dist / maxDist) * 0.3;

        // Direction perpendiculaire au pli, vers le côté non-soulevé
        var px = -(foldPts[1].y - foldPts[0].y);
        var py = foldPts[1].x - foldPts[0].x;
        var pl = Math.sqrt(px * px + py * py);
        if (pl < 1) return;
        px /= pl; py /= pl;

        // S'assurer que la direction va vers l'intérieur du livre
        var testX = mid.x + px * 10;
        var centerX = goRight ? pw + pw / 2 : pw / 2;
        if (goRight) {
            if (testX > mid.x) { px = -px; py = -py; }
        } else {
            if (testX < mid.x) { px = -px; py = -py; }
        }

        var shadowW = 40 * intensity / 0.3;
        var g = ctx.createLinearGradient(
            mid.x, mid.y,
            mid.x + px * shadowW, mid.y + py * shadowW
        );
        g.addColorStop(0, "rgba(0,0,0," + intensity + ")");
        g.addColorStop(1, "rgba(0,0,0,0)");

        ctx.save();
        ctx.beginPath();
        ctx.rect(goRight ? pw : 0, 0, pw, cH);
        ctx.clip();
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, cW, cH);
        ctx.restore();
    }

    function drawCurlHighlight(poly, mid, perpX, perpY, foldAngle) {
        if (poly.length < 3) return;
        ctx.save();
        clipLiftedPoly(poly);

        var g = ctx.createLinearGradient(
            mid.x - perpX * 30, mid.y - perpY * 30,
            mid.x + perpX * 30, mid.y + perpY * 30
        );
        g.addColorStop(0, "rgba(255,255,255,0.15)");
        g.addColorStop(0.3, "rgba(0,0,0,0.03)");
        g.addColorStop(0.7, "rgba(0,0,0,0.05)");
        g.addColorStop(1, "rgba(255,255,255,0.1)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, cW, cH);
        ctx.restore();
    }

    /* ===== POINTER / DRAG ===== */
    function canvasXY(e) {
        var rect = canvas.getBoundingClientRect();
        var cx, cy;
        if (e.touches && e.touches.length > 0) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
        else if (e.changedTouches && e.changedTouches.length > 0) { cx = e.changedTouches[0].clientX; cy = e.changedTouches[0].clientY; }
        else { cx = e.clientX; cy = e.clientY; }
        var dpr = window.devicePixelRatio || 1;
        return {
            x: (cx - rect.left) / rect.width * cW,
            y: (cy - rect.top) / rect.height * cH
        };
    }

    function nearCorner(pos) {
        var spread = spreadMap[currentSpread];
        var single = spread.length === 1;
        var pw = single ? cW : Math.round(cW / 2);
        var zone = pw * 0.25;
        var zoneY = cH * 0.3;

        // Coins droits (page qui tourne à droite)
        if (currentSpread < totalSpreads - 1) {
            if (pos.x > cW - zone) {
                if (pos.y > cH - zoneY) return { side: "right", corner: "br", ox: cW, oy: cH };
                if (pos.y < zoneY) return { side: "right", corner: "tr", ox: cW, oy: 0 };
            }
        }
        // Coins gauches (page qui tourne à gauche)
        if (currentSpread > 0) {
            if (pos.x < zone) {
                if (pos.y > cH - zoneY) return { side: "left", corner: "bl", ox: 0, oy: cH };
                if (pos.y < zoneY) return { side: "left", corner: "tl", ox: 0, oy: 0 };
            }
        }
        return null;
    }

    function onDown(e) {
        if (animating) return;
        var pos = canvasXY(e);
        var info = nearCorner(pos);
        if (!info) return;

        dragging = true;
        dragSide = info.side;
        dragCorner = info.corner;
        cornerOrigin = { x: info.ox, y: info.oy };
        mouse.x = pos.x;
        mouse.y = pos.y;
        canvas.style.cursor = "grabbing";
        e.preventDefault();
    }

    function onMove(e) {
        if (!dragging && !animating) {
            var pos = canvasXY(e);
            var info = nearCorner(pos);
            canvas.style.cursor = info ? "grab" : "default";
            return;
        }
        if (!dragging) return;
        e.preventDefault();
        var pos2 = canvasXY(e);
        mouse.x = pos2.x;
        mouse.y = pos2.y;
    }

    function onUp(e) {
        if (!dragging) return;
        canvas.style.cursor = "default";

        // Décider si on complète ou annule
        var dist = Math.sqrt(
            Math.pow(mouse.x - cornerOrigin.x, 2) +
            Math.pow(mouse.y - cornerOrigin.y, 2)
        );
        var spread = spreadMap[currentSpread];
        var single = spread.length === 1;
        var pw = single ? cW : Math.round(cW / 2);
        var threshold = pw * 0.35;

        var complete = dist > threshold;

        // Animation vers la fin
        animating = true;
        animStart = Date.now();
        animFrom = { x: mouse.x, y: mouse.y };
        animSide = dragSide;
        animComplete = complete;

        if (complete) {
            // Aller vers le coin opposé
            if (dragSide === "right") {
                animTo = { x: 0, y: cornerOrigin.y };
            } else {
                animTo = { x: cW, y: cornerOrigin.y };
            }
        } else {
            // Retour au coin d'origine
            animTo = { x: cornerOrigin.x, y: cornerOrigin.y };
        }

        // Ne pas mettre dragging=false, on continue de dessiner le curl pendant l'anim
        // dragging reste true mais animating aussi — update() gère la position
    }

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    /* ===== NAVIGATION BOUTONS ===== */
    function animFlip(dir) {
        if (animating || dragging) return;
        if (dir === "next" && currentSpread >= totalSpreads - 1) return;
        if (dir === "prev" && currentSpread <= 0) return;

        var spread = spreadMap[currentSpread];
        var single = spread.length === 1;
        var pw = single ? cW : Math.round(cW / 2);

        dragging = true;
        animating = true;
        animComplete = true;
        animStart = Date.now();
        animSide = dir === "next" ? "right" : "left";
        dragSide = animSide;

        if (dir === "next") {
            cornerOrigin = { x: cW, y: cH };
            dragCorner = "br";
            animFrom = { x: cW - 10, y: cH - 10 };
            animTo = { x: 0, y: cH };
        } else {
            cornerOrigin = { x: 0, y: cH };
            dragCorner = "bl";
            animFrom = { x: 10, y: cH - 10 };
            animTo = { x: cW, y: cH };
        }
        mouse.x = animFrom.x;
        mouse.y = animFrom.y;
    }

    zoneLeft.addEventListener("click", function () { animFlip("prev"); });
    zoneRight.addEventListener("click", function () { animFlip("next"); });

    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); animFlip("next"); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); animFlip("prev"); }
    });

    wrapper.addEventListener("wheel", function (e) {
        e.preventDefault();
        if (e.deltaY > 0 || e.deltaX > 0) animFlip("next");
        else animFlip("prev");
    }, { passive: false });

    btnFullscreen.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(function () {
                setTimeout(doResize, 150);
            });
        } else { document.exitFullscreen(); }
    });

    btnAutoplay.addEventListener("click", function () {
        if (autoplayActive) {
            clearInterval(autoplayTimer);
            autoplayActive = false;
            btnAutoplay.style.color = "";
        } else {
            autoplayActive = true;
            btnAutoplay.style.color = "#f0a500";
            autoplayTimer = setInterval(function () {
                if (currentSpread >= totalSpreads - 1) {
                    clearInterval(autoplayTimer);
                    autoplayActive = false;
                    btnAutoplay.style.color = "";
                } else { animFlip("next"); }
            }, 3000);
        }
    });

    /* ===== UI ===== */
    function updateUI() {
        var spread = spreadMap[currentSpread];
        if (spread.length === 1) pageIndicator.textContent = spread[0] + " / " + totalPages;
        else pageIndicator.textContent = spread[0] + "-" + spread[1] + " / " + totalPages;
        zoneLeft.classList.toggle("invisible", currentSpread <= 0);
        zoneRight.classList.toggle("invisible", currentSpread >= totalSpreads - 1);
    }

    /* ===== GO ===== */
    load();

})();
