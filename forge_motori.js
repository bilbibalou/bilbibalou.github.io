(function () {
    "use strict";

    // ===== CONFIG =====
    var PDF_PATH = "ressources/flipbook/forge_motori.pdf";
    var RENDER_SCALE = 2;
    var FLIP_DURATION = 600; // ms pour l'animation automatique

    // ===== ÉLÉMENTS =====
    var canvas = document.getElementById("pageCanvas");
    var ctx = canvas.getContext("2d");
    var bookEl = document.getElementById("book");
    var els = {
        loader: document.getElementById("loader"),
        loaderMsg: document.getElementById("loaderMsg"),
        progressFill: document.getElementById("progressFill"),
        progressText: document.getElementById("progressText"),
        container: document.getElementById("flipbook-container"),
        pageIndicator: document.getElementById("pageIndicator"),
        wrapper: document.getElementById("book-wrapper"),
        viewport: document.getElementById("book-viewport"),
        zoneLeft: document.getElementById("click-left"),
        zoneRight: document.getElementById("click-right"),
        btnFullscreen: document.getElementById("btnFullscreen"),
        btnAutoplay: document.getElementById("btnAutoplay")
    };

    // ===== ÉTAT =====
    var pdfDoc = null;
    var totalPages = 0;
    var pageImgs = [];       // Image objects par page (index 0 = page 1)
    var currentSpread = 0;
    var totalSpreads = 0;
    var spreadMap = [];

    // Dimensions du canvas / livre
    var W = 0, H = 0;       // taille canvas
    var pageW = 0, pageH = 0;

    // ===== DRAG STATE =====
    var dragging = false;
    var dragSide = null;     // "right" = on tourne vers la gauche (page suivante)
    var dragStartX = 0;
    var dragStartY = 0;
    var dragX = 0;
    var dragY = 0;
    var dragProgress = 0;    // 0 = pas tourné, 1 = complètement tourné

    // Animation auto
    var animating = false;
    var animStartTime = 0;
    var animDirection = null; // "next" ou "prev"
    var animFrom = 0;
    var animTo = 1;

    // Autoplay
    var autoplayTimer = null;
    var autoplayActive = false;

    // ===== SPREADS =====
    function buildSpreadMap() {
        var spreads = [];
        spreads.push([1]);
        var p = 2;
        while (p <= totalPages) {
            if (p + 1 <= totalPages) {
                spreads.push([p, p + 1]);
                p += 2;
            } else {
                spreads.push([p]);
                p++;
            }
        }
        return spreads;
    }

    // ===== CHARGEMENT PDF =====
    function load() {
        els.loaderMsg.textContent = "Chargement du PDF…";
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        pdfjsLib.getDocument(PDF_PATH).promise.then(function (pdf) {
            pdfDoc = pdf;
            totalPages = pdf.numPages;
            spreadMap = buildSpreadMap();
            totalSpreads = spreadMap.length;
            els.loaderMsg.textContent = "Rendu des pages…";
            renderAllPages();
        }).catch(function (err) {
            els.loaderMsg.textContent = "Erreur : " + err.message;
        });
    }

    function renderAllPages() {
        var rendered = 0;

        function renderPage(num) {
            return pdfDoc.getPage(num).then(function (page) {
                var vp = page.getViewport({ scale: RENDER_SCALE });
                var c = document.createElement("canvas");
                c.width = vp.width;
                c.height = vp.height;
                var cx = c.getContext("2d");

                return page.render({ canvasContext: cx, viewport: vp }).promise.then(function () {
                    var img = new Image();
                    img.src = c.toDataURL("image/jpeg", 0.92);
                    pageImgs[num - 1] = img;

                    rendered++;
                    var pct = Math.round((rendered / totalPages) * 100);
                    els.progressFill.style.width = pct + "%";
                    els.progressText.textContent = rendered + " / " + totalPages;

                    return new Promise(function (res) {
                        img.onload = res;
                    });
                });
            });
        }

        var chain = Promise.resolve();
        for (var i = 1; i <= totalPages; i++) {
            (function (n) {
                chain = chain.then(function () { return renderPage(n); });
            })(i);
        }
        chain.then(startFlipbook);
    }

    // ===== DÉMARRAGE =====
    function startFlipbook() {
        els.loader.classList.add("hidden");
        els.container.classList.remove("hidden");
        resize();
        window.addEventListener("resize", resize);
        requestAnimationFrame(drawLoop);
    }

    // ===== RESIZE =====
    function resize() {
        var wrapRect = els.wrapper.getBoundingClientRect();
        var availW = wrapRect.width - 120; // marge pour flèches
        var availH = wrapRect.height - 20;

        // Ratio page A4 (on prend le ratio de la première image)
        var img0 = pageImgs[0];
        var pageRatio = img0 ? (img0.naturalWidth / img0.naturalHeight) : (210 / 297);

        var isSingle = spreadMap[currentSpread].length === 1;
        var bookRatio = isSingle ? pageRatio : (pageRatio * 2);

        // Calculer taille du livre
        var bw = availH * bookRatio;
        var bh = availH;
        if (bw > availW) {
            bw = availW;
            bh = bw / bookRatio;
        }

        bookEl.style.width = Math.round(bw) + "px";
        bookEl.style.height = Math.round(bh) + "px";

        canvas.width = Math.round(bw * 2); // haute résolution
        canvas.height = Math.round(bh * 2);
        canvas.style.width = Math.round(bw) + "px";
        canvas.style.height = Math.round(bh) + "px";

        W = canvas.width;
        H = canvas.height;
        pageW = isSingle ? W : W / 2;
        pageH = H;

        updateArrows();
    }

    // ===== DESSIN =====
    function drawLoop() {
        if (animating) updateAnimation();
        draw();
        requestAnimationFrame(drawLoop);
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        var spread = spreadMap[currentSpread];
        var isSingle = spread.length === 1;
        var pw = isSingle ? W : W / 2;

        if (dragging || animating) {
            drawWithFlip(spread, isSingle, pw);
        } else {
            drawStatic(spread, isSingle, pw);
        }

        // Reliure
        if (!isSingle) {
            drawSpine();
        }
    }

    function drawStatic(spread, isSingle, pw) {
        // Page gauche
        drawPageImage(pageImgs[spread[0] - 1], 0, 0, pw, H);

        // Page droite
        if (!isSingle && spread[1]) {
            drawPageImage(pageImgs[spread[1] - 1], pw, 0, pw, H);
        }

        // Ombres intérieures
        if (!isSingle) {
            drawInnerShadow();
        }
    }

    function drawPageImage(img, x, y, w, h) {
        if (!img) {
            ctx.fillStyle = "#fff";
            ctx.fillRect(x, y, w, h);
            return;
        }
        // Contain
        var imgR = img.naturalWidth / img.naturalHeight;
        var boxR = w / h;
        var dw, dh, dx, dy;
        if (imgR > boxR) {
            dw = w; dh = w / imgR;
            dx = x; dy = y + (h - dh) / 2;
        } else {
            dh = h; dw = h * imgR;
            dx = x + (w - dw) / 2; dy = y;
        }
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y, w, h);
        ctx.drawImage(img, dx, dy, dw, dh);
    }

    function drawSpine() {
        var cx = W / 2;
        var grad = ctx.createLinearGradient(cx - 8, 0, cx + 8, 0);
        grad.addColorStop(0, "rgba(0,0,0,0.25)");
        grad.addColorStop(0.3, "rgba(0,0,0,0.04)");
        grad.addColorStop(0.5, "rgba(0,0,0,0)");
        grad.addColorStop(0.7, "rgba(0,0,0,0.04)");
        grad.addColorStop(1, "rgba(0,0,0,0.25)");
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 8, 0, 16, H);
    }

    function drawInnerShadow() {
        var cx = W / 2;
        // Gauche
        var g1 = ctx.createLinearGradient(cx - 60, 0, cx, 0);
        g1.addColorStop(0, "rgba(0,0,0,0)");
        g1.addColorStop(1, "rgba(0,0,0,0.06)");
        ctx.fillStyle = g1;
        ctx.fillRect(cx - 60, 0, 60, H);
        // Droite
        var g2 = ctx.createLinearGradient(cx, 0, cx + 60, 0);
        g2.addColorStop(0, "rgba(0,0,0,0.06)");
        g2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g2;
        ctx.fillRect(cx, 0, 60, H);
    }

    // ===== FLIP INTERACTIF =====
    function drawWithFlip(spread, isSingle, pw) {
        var progress = dragging ? dragProgress : animProgress();
        progress = Math.max(0, Math.min(1, progress));

        var flippingNext = (dragSide === "right") || (animDirection === "next");
        var nextSpreadIdx = flippingNext ? currentSpread + 1 : currentSpread - 1;
        if (nextSpreadIdx < 0 || nextSpreadIdx >= totalSpreads) {
            drawStatic(spread, isSingle, pw);
            return;
        }
        var nextSpread = spreadMap[nextSpreadIdx];
        var nextSingle = nextSpread.length === 1;

        if (flippingNext) {
            drawFlipNext(spread, nextSpread, isSingle, nextSingle, pw, progress);
        } else {
            drawFlipPrev(spread, nextSpread, isSingle, nextSingle, pw, progress);
        }
    }

    function drawFlipNext(curSpread, nextSpread, curSingle, nextSingle, pw, t) {
        // Sous la page qui tourne : page suivante (page gauche du prochain spread)
        var underImg = nextSpread[0] ? pageImgs[nextSpread[0] - 1] : null;

        // Page gauche actuelle (reste visible)
        drawPageImage(pageImgs[curSpread[0] - 1], 0, 0, pw, H);

        // Page de dessous à droite (prochaine page droite ou gauche si single)
        if (!nextSingle && nextSpread[1]) {
            drawPageImage(pageImgs[nextSpread[1] - 1], pw, 0, pw, H);
        } else {
            drawPageImage(underImg, pw, 0, pw, H);
        }

        // La page qui tourne
        var flipImg = curSingle ? pageImgs[curSpread[0] - 1] : pageImgs[curSpread[1] - 1];
        var backImg = underImg;

        drawCurlingPage(flipImg, backImg, t, true, pw);
        drawInnerShadow();
    }

    function drawFlipPrev(curSpread, prevSpread, curSingle, prevSingle, pw, t) {
        // Page droite actuelle reste
        if (!curSingle && curSpread[1]) {
            drawPageImage(pageImgs[curSpread[1] - 1], pw, 0, pw, H);
        }

        // Sous la page qui tourne : previous spread right page
        var underImg = prevSingle
            ? pageImgs[prevSpread[0] - 1]
            : (prevSpread[1] ? pageImgs[prevSpread[1] - 1] : null);
        drawPageImage(pageImgs[prevSpread[0] - 1], 0, 0, pw, H);

        var flipImg = pageImgs[curSpread[0] - 1];
        var backImg = underImg;

        drawCurlingPage(flipImg, backImg, t, false, pw);
        drawInnerShadow();
    }

    function drawCurlingPage(frontImg, backImg, t, goingRight, pw) {
        // t = 0 : page à plat (pas tournée)
        // t = 1 : page complètement tournée

        var angle = t * Math.PI; // 0 à PI
        var foldX;

        if (goingRight) {
            // La page part du bord droit vers la gauche
            foldX = pw + pw * (1 - t);
        } else {
            // La page part du bord gauche vers la droite
            foldX = pw * t;
        }

        // Largeur visible de la page tournée
        var visibleW = goingRight ? (W - foldX) : foldX;
        if (visibleW < 1) return;

        // Courbure de la page (effet cylindrique simplifié)
        var curl = Math.sin(t * Math.PI) * pw * 0.15;

        ctx.save();

        // Clipping pour le côté
        ctx.beginPath();
        if (goingRight) {
            ctx.rect(pw, 0, pw, H);
        } else {
            ctx.rect(0, 0, pw, H);
        }
        ctx.clip();

        // Ombre sous la page qui tourne
        var shadowW = Math.sin(t * Math.PI) * 80;
        if (goingRight) {
            var sg = ctx.createLinearGradient(foldX - shadowW, 0, foldX, 0);
            sg.addColorStop(0, "rgba(0,0,0,0)");
            sg.addColorStop(1, "rgba(0,0,0,0.2)");
            ctx.fillStyle = sg;
            ctx.fillRect(foldX - shadowW, 0, shadowW, H);
        } else {
            var sg2 = ctx.createLinearGradient(foldX, 0, foldX + shadowW, 0);
            sg2.addColorStop(0, "rgba(0,0,0,0.2)");
            sg2.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = sg2;
            ctx.fillRect(foldX, 0, shadowW, H);
        }

        // Dessiner la page (face visible)
        var showingBack = t > 0.5;
        var img = showingBack ? backImg : frontImg;

        ctx.save();

        if (goingRight) {
            // Transformation perspective simplifiée
            ctx.translate(foldX, 0);
            var scaleX = Math.abs(Math.cos(angle)) * (visibleW / pw);
            scaleX = Math.max(0.01, scaleX);
            ctx.scale(-scaleX, 1);

            // Fond blanc
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, pw, H);

            if (img) {
                drawPageImageOnCtx(img, 0, 0, pw, H);
            }

            // Highlight/ombre sur la page courbée
            var hlGrad = ctx.createLinearGradient(0, 0, pw, 0);
            hlGrad.addColorStop(0, "rgba(255,255,255," + (0.15 * Math.sin(t * Math.PI)) + ")");
            hlGrad.addColorStop(0.5, "rgba(0,0,0," + (0.08 * Math.sin(t * Math.PI)) + ")");
            hlGrad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = hlGrad;
            ctx.fillRect(0, 0, pw, H);

        } else {
            ctx.translate(foldX, 0);
            var scaleX2 = Math.abs(Math.cos(angle)) * (visibleW / pw);
            scaleX2 = Math.max(0.01, scaleX2);
            ctx.scale(scaleX2, 1);

            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, pw, H);

            if (img) {
                drawPageImageOnCtx(img, 0, 0, pw, H);
            }

            var hlGrad2 = ctx.createLinearGradient(0, 0, pw, 0);
            hlGrad2.addColorStop(0, "rgba(0,0,0,0)");
            hlGrad2.addColorStop(0.5, "rgba(0,0,0," + (0.08 * Math.sin(t * Math.PI)) + ")");
            hlGrad2.addColorStop(1, "rgba(255,255,255," + (0.15 * Math.sin(t * Math.PI)) + ")");
            ctx.fillStyle = hlGrad2;
            ctx.fillRect(0, 0, pw, H);
        }

        ctx.restore();
        ctx.restore();
    }

    function drawPageImageOnCtx(img, x, y, w, h) {
        if (!img) return;
        var imgR = img.naturalWidth / img.naturalHeight;
        var boxR = w / h;
        var dw, dh, dx, dy;
        if (imgR > boxR) {
            dw = w; dh = w / imgR;
            dx = x; dy = y + (h - dh) / 2;
        } else {
            dh = h; dw = h * imgR;
            dx = x + (w - dw) / 2; dy = y;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
    }

    // ===== ANIMATION =====
    function animProgress() {
        if (!animating) return 0;
        var elapsed = Date.now() - animStartTime;
        var t = elapsed / FLIP_DURATION;
        return Math.min(1, t);
    }

    function updateAnimation() {
        var t = animProgress();
        if (t >= 1) {
            animating = false;
            if (animDirection === "next") {
                currentSpread++;
            } else {
                currentSpread--;
            }
            currentSpread = Math.max(0, Math.min(totalSpreads - 1, currentSpread));
            resize();
            updateUI();
        }
    }

    function startFlipAnim(dir) {
        if (animating || dragging) return;
        if (dir === "next" && currentSpread >= totalSpreads - 1) return;
        if (dir === "prev" && currentSpread <= 0) return;

        animating = true;
        animDirection = dir;
        animStartTime = Date.now();
        dragSide = dir === "next" ? "right" : "left";
    }

    // ===== DRAG HANDLING =====
    function getCanvasPos(e) {
        var rect = canvas.getBoundingClientRect();
        var x, y;
        if (e.touches) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }
        return {
            x: (x - rect.left) / rect.width * W,
            y: (y - rect.top) / rect.height * H
        };
    }

    function onDragStart(e) {
        if (animating) return;
        var pos = getCanvasPos(e);

        var spread = spreadMap[currentSpread];
        var isSingle = spread.length === 1;
        var pw = isSingle ? W : W / 2;

        // Zone de grab : les 25% de chaque bord
        var grabZone = pw * 0.25;

        if (pos.x > W - grabZone && currentSpread < totalSpreads - 1) {
            dragSide = "right";
            dragging = true;
        } else if (pos.x < grabZone && currentSpread > 0) {
            dragSide = "left";
            dragging = true;
        }

        if (dragging) {
            dragStartX = pos.x;
            dragStartY = pos.y;
            dragX = pos.x;
            dragY = pos.y;
            dragProgress = 0;
            canvas.style.cursor = "grabbing";
            e.preventDefault();
        }
    }

    function onDragMove(e) {
        if (!dragging) {
            // Curseur
            var pos = getCanvasPos(e);
            var spread = spreadMap[currentSpread];
            var isSingle = spread.length === 1;
            var pw = isSingle ? W : W / 2;
            var grabZone = pw * 0.25;

            if ((pos.x > W - grabZone && currentSpread < totalSpreads - 1) ||
                (pos.x < grabZone && currentSpread > 0)) {
                canvas.style.cursor = "grab";
            } else {
                canvas.style.cursor = "default";
            }
            return;
        }

        e.preventDefault();
        var pos = getCanvasPos(e);
        dragX = pos.x;
        dragY = pos.y;

        var spread = spreadMap[currentSpread];
        var isSingle = spread.length === 1;
        var pw = isSingle ? W : W / 2;

        if (dragSide === "right") {
            var dx = dragStartX - dragX;
            dragProgress = Math.max(0, Math.min(1, dx / pw));
        } else {
            var dx2 = dragX - dragStartX;
            dragProgress = Math.max(0, Math.min(1, dx2 / pw));
        }
    }

    function onDragEnd(e) {
        if (!dragging) return;
        dragging = false;
        canvas.style.cursor = "default";

        // Si on a tourné plus de 30%, on complète le flip
        if (dragProgress > 0.3) {
            // Lancer animation pour compléter
            animating = true;
            animDirection = dragSide === "right" ? "next" : "prev";
            // Calculer le temps restant proportionnellement
            var remaining = 1 - dragProgress;
            var remainTime = remaining * FLIP_DURATION;
            animStartTime = Date.now() - (dragProgress * FLIP_DURATION);
            dragSide = null;
        } else if (dragProgress > 0.01) {
            // Annuler — rebondir en arrière
            animating = true;
            animDirection = dragSide === "right" ? "next" : "prev";
            // On triche: on remet simplement sans animation
            animating = false;
            dragProgress = 0;
        }

        dragProgress = 0;
    }

    // ===== Events souris/touch sur canvas =====
    canvas.addEventListener("mousedown", onDragStart);
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);

    canvas.addEventListener("touchstart", function (e) {
        onDragStart(e);
    }, { passive: false });
    window.addEventListener("touchmove", function (e) {
        onDragMove(e);
    }, { passive: false });
    window.addEventListener("touchend", onDragEnd);

    // ===== NAVIGATION BOUTONS =====
    function next() { startFlipAnim("next"); }
    function prev() { startFlipAnim("prev"); }

    els.zoneLeft.addEventListener("click", prev);
    els.zoneRight.addEventListener("click", next);

    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
        else if (e.key === "Home") { if (!animating) { currentSpread = 0; resize(); updateUI(); } }
        else if (e.key === "End") { if (!animating) { currentSpread = totalSpreads - 1; resize(); updateUI(); } }
    });

    // Swipe rapide (en plus du drag)
    var touchStartX = 0;
    els.wrapper.addEventListener("touchstart", function (e) {
        if (!dragging) touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    // Molette
    els.wrapper.addEventListener("wheel", function (e) {
        e.preventDefault();
        if (e.deltaY > 0 || e.deltaX > 0) next();
        else prev();
    }, { passive: false });

    // Fullscreen
    els.btnFullscreen.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(function () {
                setTimeout(resize, 100);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Autoplay
    els.btnAutoplay.addEventListener("click", function () {
        if (autoplayActive) {
            clearInterval(autoplayTimer);
            autoplayActive = false;
            els.btnAutoplay.style.color = "";
        } else {
            autoplayActive = true;
            els.btnAutoplay.style.color = "#f0a500";
            autoplayTimer = setInterval(function () {
                if (currentSpread >= totalSpreads - 1) {
                    clearInterval(autoplayTimer);
                    autoplayActive = false;
                    els.btnAutoplay.style.color = "";
                } else {
                    next();
                }
            }, 3000);
        }
    });

    // ===== UI =====
    function updateUI() {
        updateIndicator();
        updateArrows();
    }

    function updateIndicator() {
        var spread = spreadMap[currentSpread];
        if (spread.length === 1) {
            els.pageIndicator.textContent = spread[0] + " / " + totalPages;
        } else {
            els.pageIndicator.textContent = spread[0] + "-" + spread[1] + " / " + totalPages;
        }
    }

    function updateArrows() {
        els.zoneLeft.classList.toggle("invisible", currentSpread <= 0);
        els.zoneRight.classList.toggle("invisible", currentSpread >= totalSpreads - 1);
    }

    // ===== GO =====
    console.log("Flipbook JS chargé ✓");
    load();

})();
