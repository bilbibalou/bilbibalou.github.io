(function () {
    "use strict";

    /* ===== CONFIG ===== */
    var PDF_PATH = "ressources/flipbook/forge_motori.pdf";
    var RENDER_SCALE = 2;
    var FLIP_DURATION = 600;

    /* ===== ÉLÉMENTS ===== */
    var canvas = document.getElementById("pageCanvas");
    var ctx = canvas.getContext("2d");
    var bookEl = document.getElementById("book");

    var loader      = document.getElementById("loader");
    var loaderMsg   = document.getElementById("loaderMsg");
    var progressFill = document.getElementById("progressFill");
    var progressText = document.getElementById("progressText");
    var container   = document.getElementById("flipbook-container");
    var pageIndicator = document.getElementById("pageIndicator");
    var wrapper     = document.getElementById("book-wrapper");
    var viewport    = document.getElementById("book-viewport");
    var zoneLeft    = document.getElementById("click-left");
    var zoneRight   = document.getElementById("click-right");
    var btnFullscreen = document.getElementById("btnFullscreen");
    var btnAutoplay = document.getElementById("btnAutoplay");

    /* ===== VÉRIFICATION ===== */
    if (!canvas || !bookEl || !loader || !container || !zoneLeft || !zoneRight || !btnFullscreen || !btnAutoplay) {
        console.error("Flipbook: élément(s) DOM manquant(s) !");
        console.log("canvas:", canvas);
        console.log("bookEl:", bookEl);
        console.log("zoneLeft:", zoneLeft);
        console.log("zoneRight:", zoneRight);
        console.log("btnFullscreen:", btnFullscreen);
        console.log("btnAutoplay:", btnAutoplay);
        return;
    }

    /* ===== ÉTAT ===== */
    var pdfDoc = null;
    var totalPages = 0;
    var pageImgs = [];
    var currentSpread = 0;
    var totalSpreads = 0;
    var spreadMap = [];

    var W = 0, H = 0;
    var pageW = 0, pageH = 0;

    /* Drag */
    var dragging = false;
    var dragSide = null;
    var dragStartX = 0;
    var dragX = 0;
    var dragProgress = 0;

    /* Animation */
    var animating = false;
    var animStartTime = 0;
    var animDirection = null;
    var animDragStart = 0;

    /* Autoplay */
    var autoplayTimer = null;
    var autoplayActive = false;

    /* ===== SPREADS ===== */
    function buildSpreadMap() {
        var spreads = [];
        spreads.push([1]);            // couverture seule
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

    /* ===== CHARGEMENT PDF ===== */
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
            console.error(err);
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
                    var dataUrl = c.toDataURL("image/jpeg", 0.92);
                    img.src = dataUrl;
                    pageImgs[num - 1] = img;

                    rendered++;
                    var pct = Math.round((rendered / totalPages) * 100);
                    progressFill.style.width = pct + "%";
                    progressText.textContent = rendered + " / " + totalPages;

                    return new Promise(function (res) {
                        img.onload = res;
                        img.onerror = res; // ne pas bloquer
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
        chain.then(startFlipbook).catch(function (e) {
            console.error("Erreur rendu:", e);
            loaderMsg.textContent = "Erreur de rendu";
        });
    }

    /* ===== DÉMARRAGE ===== */
    function startFlipbook() {
        loader.classList.add("hidden");
        container.classList.remove("hidden");
        doResize();
        updateUI();
        window.addEventListener("resize", doResize);
        requestAnimationFrame(drawLoop);
        console.log("Flipbook démarré ✓", totalPages, "pages,", totalSpreads, "spreads");
    }

    /* ===== RESIZE ===== */
    function doResize() {
        var wrapRect = wrapper.getBoundingClientRect();
        var availW = wrapRect.width - 120;
        var availH = wrapRect.height - 20;

        var img0 = pageImgs[0];
        var pageRatio = img0 ? (img0.naturalWidth / img0.naturalHeight) : (210 / 297);

        var spread = spreadMap[currentSpread];
        var isSingle = spread.length === 1;
        var bookRatio = isSingle ? pageRatio : (pageRatio * 2);

        var bw = availH * bookRatio;
        var bh = availH;
        if (bw > availW) {
            bw = availW;
            bh = bw / bookRatio;
        }

        bw = Math.round(bw);
        bh = Math.round(bh);

        bookEl.style.width = bw + "px";
        bookEl.style.height = bh + "px";

        canvas.width = bw * 2;
        canvas.height = bh * 2;
        canvas.style.width = bw + "px";
        canvas.style.height = bh + "px";

        W = canvas.width;
        H = canvas.height;
        pageW = isSingle ? W : Math.round(W / 2);
        pageH = H;
    }

    /* ===== BOUCLE DE DESSIN ===== */
    function drawLoop() {
        if (animating) updateAnimation();
        draw();
        requestAnimationFrame(drawLoop);
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        var spread = spreadMap[currentSpread];
        var isSingle = spread.length === 1;
        var pw = isSingle ? W : Math.round(W / 2);

        if (dragging || animating) {
            drawWithFlip(spread, isSingle, pw);
        } else {
            drawStatic(spread, isSingle, pw);
        }

        if (!isSingle) {
            drawSpine();
        }
    }

    /* ===== DESSIN STATIQUE ===== */
    function drawStatic(spread, isSingle, pw) {
        drawPageImg(pageImgs[spread[0] - 1], 0, 0, pw, H);

        if (!isSingle && spread[1]) {
            drawPageImg(pageImgs[spread[1] - 1], pw, 0, pw, H);
        }

        if (!isSingle) drawInnerShadow(pw);
    }

    function drawPageImg(img, x, y, w, h) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y, w, h);
        if (!img || !img.naturalWidth) return;

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

    function drawSpine() {
        var cx = Math.round(W / 2);
        var grad = ctx.createLinearGradient(cx - 10, 0, cx + 10, 0);
        grad.addColorStop(0, "rgba(0,0,0,0.3)");
        grad.addColorStop(0.35, "rgba(0,0,0,0.05)");
        grad.addColorStop(0.5, "rgba(0,0,0,0)");
        grad.addColorStop(0.65, "rgba(0,0,0,0.05)");
        grad.addColorStop(1, "rgba(0,0,0,0.3)");
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 10, 0, 20, H);
    }

    function drawInnerShadow(pw) {
        var cx = Math.round(W / 2);
        var g1 = ctx.createLinearGradient(cx - 50, 0, cx, 0);
        g1.addColorStop(0, "rgba(0,0,0,0)");
        g1.addColorStop(1, "rgba(0,0,0,0.06)");
        ctx.fillStyle = g1;
        ctx.fillRect(cx - 50, 0, 50, H);

        var g2 = ctx.createLinearGradient(cx, 0, cx + 50, 0);
        g2.addColorStop(0, "rgba(0,0,0,0.06)");
        g2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g2;
        ctx.fillRect(cx, 0, 50, H);
    }

    /* ===== DESSIN AVEC FLIP ===== */
    function drawWithFlip(spread, isSingle, pw) {
        var t = dragging ? dragProgress : getAnimProgress();
        t = Math.max(0, Math.min(1, t));

        var goingNext = (dragging && dragSide === "right") || (!dragging && animDirection === "next");
        var targetIdx = goingNext ? currentSpread + 1 : currentSpread - 1;

        if (targetIdx < 0 || targetIdx >= totalSpreads) {
            drawStatic(spread, isSingle, pw);
            return;
        }

        var targetSpread = spreadMap[targetIdx];

        if (goingNext) {
            drawFlipForward(spread, targetSpread, isSingle, pw, t);
        } else {
            drawFlipBackward(spread, targetSpread, isSingle, pw, t);
        }
    }

    function drawFlipForward(curSpread, nextSpread, curSingle, pw, t) {
        // Fond : page gauche actuelle reste
        drawPageImg(pageImgs[curSpread[0] - 1], 0, 0, pw, H);

        // Fond droite : prochaine page droite (ou gauche si single)
        var nextRight = nextSpread.length > 1 ? pageImgs[nextSpread[1] - 1] : pageImgs[nextSpread[0] - 1];
        drawPageImg(nextRight, pw, 0, pw, H);

        // La page qui tourne : page droite actuelle
        var frontImg = curSingle ? pageImgs[curSpread[0] - 1] : (curSpread[1] ? pageImgs[curSpread[1] - 1] : null);
        // Le dos : page gauche du prochain spread
        var backImg = pageImgs[nextSpread[0] - 1];

        drawFlippingPage(frontImg, backImg, t, true, pw);
        drawInnerShadow(pw);
    }

    function drawFlipBackward(curSpread, prevSpread, curSingle, pw, t) {
        // Fond gauche : previous spread gauche
        drawPageImg(pageImgs[prevSpread[0] - 1], 0, 0, pw, H);

        // Fond droite : page droite actuelle reste
        if (!curSingle && curSpread[1]) {
            drawPageImg(pageImgs[curSpread[1] - 1], pw, 0, pw, H);
        } else {
            ctx.fillStyle = "#fff";
            ctx.fillRect(pw, 0, pw, H);
        }

        // La page qui tourne : page gauche actuelle
        var frontImg = pageImgs[curSpread[0] - 1];
        // Le dos : previous spread page droite
        var backImg = prevSpread.length > 1 ? (prevSpread[1] ? pageImgs[prevSpread[1] - 1] : null) : pageImgs[prevSpread[0] - 1];

        drawFlippingPage(frontImg, backImg, t, false, pw);
        drawInnerShadow(pw);
    }

    function drawFlippingPage(frontImg, backImg, t, goingRight, pw) {
        if (t <= 0) return;

        var angle = t * Math.PI;
        var foldX, clipX, clipW;

        if (goingRight) {
            foldX = pw + pw * (1 - t);
            clipX = pw;
            clipW = pw;
        } else {
            foldX = pw * t;
            clipX = 0;
            clipW = pw;
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(clipX, 0, clipW, H);
        ctx.clip();

        // Ombre portée
        var shadowSize = Math.sin(t * Math.PI) * 60;
        if (shadowSize > 1) {
            if (goingRight) {
                var sg = ctx.createLinearGradient(foldX - shadowSize, 0, foldX, 0);
                sg.addColorStop(0, "rgba(0,0,0,0)");
                sg.addColorStop(1, "rgba(0,0,0,0.18)");
                ctx.fillStyle = sg;
                ctx.fillRect(foldX - shadowSize, 0, shadowSize, H);
            } else {
                var sg2 = ctx.createLinearGradient(foldX, 0, foldX + shadowSize, 0);
                sg2.addColorStop(0, "rgba(0,0,0,0.18)");
                sg2.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = sg2;
                ctx.fillRect(foldX, 0, shadowSize, H);
            }
        }

        // Page qui tourne
        var showBack = t > 0.5;
        var drawImg = showBack ? backImg : frontImg;
        var cosA = Math.cos(angle);
        var scaleAbs = Math.abs(cosA);
        var scaleX = Math.max(0.005, scaleAbs);

        ctx.save();
        ctx.translate(foldX, 0);

        if (goingRight) {
            ctx.scale(-scaleX, 1);
        } else {
            ctx.scale(scaleX, 1);
        }

        // Fond blanc
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, pw, H);

        // Image
        if (drawImg && drawImg.naturalWidth) {
            drawPageImgDirect(drawImg, 0, 0, pw, H);
        }

        // Highlight/ombre courbure
        var intensity = Math.sin(t * Math.PI);
        var hl = ctx.createLinearGradient(0, 0, pw, 0);
        if (goingRight) {
            hl.addColorStop(0, "rgba(255,255,255," + (0.12 * intensity) + ")");
            hl.addColorStop(0.4, "rgba(0,0,0," + (0.06 * intensity) + ")");
            hl.addColorStop(1, "rgba(0,0,0,0)");
        } else {
            hl.addColorStop(0, "rgba(0,0,0,0)");
            hl.addColorStop(0.6, "rgba(0,0,0," + (0.06 * intensity) + ")");
            hl.addColorStop(1, "rgba(255,255,255," + (0.12 * intensity) + ")");
        }
        ctx.fillStyle = hl;
        ctx.fillRect(0, 0, pw, H);

        ctx.restore();
        ctx.restore();
    }

    function drawPageImgDirect(img, x, y, w, h) {
        if (!img || !img.naturalWidth) return;
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

    /* ===== ANIMATION AUTO ===== */
    function getAnimProgress() {
        if (!animating) return 0;
        var elapsed = Date.now() - animStartTime;
        var duration = FLIP_DURATION;
        // Easing: ease-in-out
        var t = Math.min(1, elapsed / duration);
        return easeInOutCubic(t);
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function updateAnimation() {
        var elapsed = Date.now() - animStartTime;
        if (elapsed >= FLIP_DURATION) {
            animating = false;
            if (animDirection === "next" && currentSpread < totalSpreads - 1) {
                currentSpread++;
            } else if (animDirection === "prev" && currentSpread > 0) {
                currentSpread--;
            }
            animDirection = null;
            doResize();
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
    }

    /* ===== DRAG ===== */
    function getCanvasXY(e) {
        var rect = canvas.getBoundingClientRect();
        var clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return {
            x: (clientX - rect.left) / rect.width * W,
            y: (clientY - rect.top) / rect.height * H
        };
    }

    function onPointerDown(e) {
        if (animating) return;
        var pos = getCanvasXY(e);

        var spread = spreadMap[currentSpread];
        var isSingle = spread.length === 1;
        var pw = isSingle ? W : Math.round(W / 2);
        var grabZone = pw * 0.3;

        if (pos.x > W - grabZone && currentSpread < totalSpreads - 1) {
            dragSide = "right";
            dragging = true;
        } else if (pos.x < grabZone && currentSpread > 0) {
            dragSide = "left";
            dragging = true;
        }

        if (dragging) {
            dragStartX = pos.x;
            dragX = pos.x;
            dragProgress = 0;
            canvas.style.cursor = "grabbing";
            e.preventDefault();
        }
    }

    function onPointerMove(e) {
        if (!dragging) {
            // Changer le curseur
            var pos = getCanvasXY(e);
            var spread = spreadMap[currentSpread];
            var isSingle = spread.length === 1;
            var pw = isSingle ? W : Math.round(W / 2);
            var grabZone = pw * 0.3;

            if ((pos.x > W - grabZone && currentSpread < totalSpreads - 1) ||
                (pos.x < grabZone && currentSpread > 0)) {
                canvas.style.cursor = "grab";
            } else {
                canvas.style.cursor = "default";
            }
            return;
        }

        e.preventDefault();
        var pos = getCanvasXY(e);
        dragX = pos.x;

        var spread = spreadMap[currentSpread];
        var isSingle = spread.length === 1;
        var pw = isSingle ? W : Math.round(W / 2);

        if (dragSide === "right") {
            dragProgress = Math.max(0, Math.min(1, (dragStartX - dragX) / pw));
        } else {
            dragProgress = Math.max(0, Math.min(1, (dragX - dragStartX) / pw));
        }
    }

    function onPointerUp(e) {
        if (!dragging) return;

        var completed = dragProgress > 0.3;
        var savedProgress = dragProgress;
        var savedSide = dragSide;

        dragging = false;
        canvas.style.cursor = "default";

        if (completed) {
            // Compléter l'animation
            animating = true;
            animDirection = savedSide === "right" ? "next" : "prev";
            // Démarrer depuis la progression actuelle
            var remaining = 1 - savedProgress;
            var totalTime = FLIP_DURATION;
            // Inverser le easing pour trouver le temps correspondant
            animStartTime = Date.now() - (savedProgress * totalTime);
        }

        dragProgress = 0;
        dragSide = null;
    }

    /* Events souris */
    canvas.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    /* Events touch */
    canvas.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);

    /* ===== NAVIGATION ===== */
    function goNext() { startFlipAnim("next"); }
    function goPrev() { startFlipAnim("prev"); }

    zoneLeft.addEventListener("click", goPrev);
    zoneRight.addEventListener("click", goNext);

    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === " ") {
            e.preventDefault();
            goNext();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            goPrev();
        } else if (e.key === "Home") {
            if (!animating) {
                currentSpread = 0;
                doResize();
                updateUI();
            }
        } else if (e.key === "End") {
            if (!animating) {
                currentSpread = totalSpreads - 1;
                doResize();
                updateUI();
            }
        }
    });

    /* Molette */
    wrapper.addEventListener("wheel", function (e) {
        e.preventDefault();
        if (e.deltaY > 0 || e.deltaX > 0) goNext();
        else goPrev();
    }, { passive: false });

    /* Fullscreen */
    btnFullscreen.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(function () {
                setTimeout(doResize, 150);
            });
        } else {
            document.exitFullscreen();
        }
    });

    /* Autoplay */
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
                } else {
                    goNext();
                }
            }, 3000);
        }
    });

    /* ===== UI ===== */
    function updateUI() {
        var spread = spreadMap[currentSpread];
        if (spread.length === 1) {
            pageIndicator.textContent = spread[0] + " / " + totalPages;
        } else {
            pageIndicator.textContent = spread[0] + "-" + spread[1] + " / " + totalPages;
        }
        zoneLeft.classList.toggle("invisible", currentSpread <= 0);
        zoneRight.classList.toggle("invisible", currentSpread >= totalSpreads - 1);
    }

    /* ===== GO ===== */
    console.log("Flipbook JS initialisé ✓");
    load();

})();
