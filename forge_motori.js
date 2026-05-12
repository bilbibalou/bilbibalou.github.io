(function () {
    "use strict";

    // ===== CONFIG =====
    var PDF_PATH = "ressources/flipbook/forge_motori.pdf";
    var RENDER_SCALE = 2;

    // ===== ÉLÉMENTS =====
    var els = {
        loader: document.getElementById("loader"),
        loaderMsg: document.getElementById("loaderMsg"),
        progressFill: document.getElementById("progressFill"),
        progressText: document.getElementById("progressText"),
        container: document.getElementById("flipbook-container"),
        pageIndicator: document.getElementById("pageIndicator"),
        imgLeft: document.getElementById("pageLeftImg"),
        imgRight: document.getElementById("pageRightImg"),
        book: document.getElementById("book"),
        viewport: document.getElementById("book-viewport"),
        wrapper: document.getElementById("book-wrapper"),
        pageLeft: document.querySelector(".page-left"),
        pageRight: document.querySelector(".page-right"),
        spine: document.querySelector(".book-spine"),
        zoneLeft: document.getElementById("click-left"),
        zoneRight: document.getElementById("click-right"),
        thumbsCtn: document.getElementById("thumbnails"),
        btnFullscreen: document.getElementById("btnFullscreen"),
        flipOverlay: document.getElementById("flip-overlay"),
        flipPage: document.getElementById("flip-page"),
        flipFrontImg: document.getElementById("flipFrontImg"),
        flipBackImg: document.getElementById("flipBackImg")
    };

    // ===== ÉTAT =====
    var pdfDoc = null;
    var totalPages = 0;
    var pageImages = [];
    var currentSpread = 0;
    var totalSpreads = 0;
    var isAnimating = false;
    var spreadMap = [];

    // ===== SPREADS =====
    function buildSpreadMap() {
        var spreads = [];
        spreads.push([1]); // couverture seule
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
            console.error(err);
        });
    }

    function renderAllPages() {
        var rendered = 0;

        function renderPage(num) {
            return pdfDoc.getPage(num).then(function (page) {
                var vp = page.getViewport({ scale: RENDER_SCALE });
                var canvas = document.createElement("canvas");
                canvas.width = vp.width;
                canvas.height = vp.height;
                var ctx = canvas.getContext("2d");

                return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
                    pageImages[num - 1] = canvas.toDataURL("image/jpeg", 0.92);

                    rendered++;
                    var pct = Math.round((rendered / totalPages) * 100);
                    els.progressFill.style.width = pct + "%";
                    els.progressText.textContent = rendered + " / " + totalPages;
                });
            });
        }

        var chain = Promise.resolve();
        for (var i = 1; i <= totalPages; i++) {
            (function (num) {
                chain = chain.then(function () { return renderPage(num); });
            })(i);
        }

        chain.then(function () {
            startFlipbook();
        });
    }

    // ===== DÉMARRAGE =====
    function startFlipbook() {
        els.loader.classList.add("hidden");
        els.container.classList.remove("hidden");
        showSpread(0);
    }

    // ===== AFFICHAGE =====
    function showSpread(idx) {
        if (idx < 0 || idx >= totalSpreads) return;
        currentSpread = idx;
        var spread = spreadMap[idx];
        var isSingle = spread.length === 1;

        if (isSingle) {
            els.book.classList.add("single-page");
            els.imgLeft.src = pageImages[spread[0] - 1];
            els.imgRight.src = "";
            els.spine.style.display = "none";
        } else {
            els.book.classList.remove("single-page");
            els.imgLeft.src = pageImages[spread[0] - 1];
            els.imgRight.src = pageImages[spread[1] - 1];
            els.spine.style.display = "";
        }

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
        if (currentSpread <= 0) {
            els.zoneLeft.classList.add("invisible");
        } else {
            els.zoneLeft.classList.remove("invisible");
        }
        if (currentSpread >= totalSpreads - 1) {
            els.zoneRight.classList.add("invisible");
        } else {
            els.zoneRight.classList.remove("invisible");
        }
    }

    // ===== NAVIGATION =====
    function next() {
        if (isAnimating || currentSpread >= totalSpreads - 1) return;
        animateFlip("right", currentSpread + 1);
    }

    function prev() {
        if (isAnimating || currentSpread <= 0) return;
        animateFlip("left", currentSpread - 1);
    }

    function first() { if (!isAnimating) showSpread(0); }
    function last() { if (!isAnimating) showSpread(totalSpreads - 1); }

    // ===== ANIMATION FLIP =====
    function animateFlip(direction, targetSpread) {
        isAnimating = true;
        var curSpread = spreadMap[currentSpread];
        var tgtSpread = spreadMap[targetSpread];

        var bookRect = els.book.getBoundingClientRect();
        var isSingleCur = curSpread.length === 1;
        var isSingleTgt = tgtSpread.length === 1;
        var pageH = bookRect.height;
        var pageW = isSingleCur ? bookRect.width : bookRect.width / 2;

        // Image qui se trouve sur la face avant de la page qui tourne
        var frontPage, backPage, flipLeft;

        if (direction === "right") {
            // Page tournée = page de droite actuelle (ou unique si couverture)
            frontPage = isSingleCur ? curSpread[0] : curSpread[1];
            // Dos = première page de la cible
            backPage = tgtSpread[0];
            flipLeft = isSingleCur ? bookRect.left : bookRect.left + pageW;

            // ⬇ Pré-affiche le nouveau spread SOUS l'overlay
            // Page gauche = ce qui restera après le flip (la page de gauche actuelle reste visible jusqu'à mi-flip,
            // mais ici on prépare déjà la cible en dessous pour qu'au moment où la page tourne, on voie la suite)
            // -> on met immédiatement la cible
            preRenderSpread(targetSpread, "right");

        } else {
            frontPage = curSpread[0];
            backPage = isSingleTgt ? tgtSpread[0] : tgtSpread[tgtSpread.length - 1];
            flipLeft = bookRect.left;

            preRenderSpread(targetSpread, "left");
        }

        els.flipFrontImg.src = pageImages[frontPage - 1] || "";
        els.flipBackImg.src = pageImages[backPage - 1] || "";

        els.flipPage.style.left = flipLeft + "px";
        els.flipPage.style.top = bookRect.top + "px";
        els.flipPage.style.width = pageW + "px";
        els.flipPage.style.height = pageH + "px";

        els.flipOverlay.classList.remove("flip-hidden");
        els.flipPage.className = direction === "right" ? "flipping-right" : "flipping-left";

        setTimeout(function () {
            els.flipPage.className = "";
            els.flipOverlay.classList.add("flip-hidden");
            showSpread(targetSpread);
            isAnimating = false;
        }, 520);
    }

    function preRenderSpread(targetIdx, direction) {
        var tgt = spreadMap[targetIdx];
        var cur = spreadMap[currentSpread];
        var isSingleTgt = tgt.length === 1;
        var isSingleCur = cur.length === 1;

        if (direction === "right") {
            // La page de gauche reste celle du spread courant (sauf si on quitte la couverture)
            if (isSingleCur) {
                // On quittait la couverture seule -> on prépare le double
                els.book.classList.remove("single-page");
                els.spine.style.display = "";
                els.imgLeft.src = pageImages[cur[0] - 1]; // la couverture reste à gauche pendant le flip
                els.imgRight.src = pageImages[isSingleTgt ? tgt[0] - 1 : tgt[1] - 1];
            } else {
                // Spread normal -> on garde la page de gauche actuelle,
                // et on met la NOUVELLE page de droite (celle qui apparaitra après flip)
                els.imgLeft.src = pageImages[cur[0] - 1];
                els.imgRight.src = pageImages[isSingleTgt ? tgt[0] - 1 : tgt[1] - 1];
                if (isSingleTgt) {
                    // cible = page seule (dernière page impaire), on cache la droite après flip via showSpread final
                }
            }
        } else {
            // direction left : la page de droite reste, on remplace la gauche par la nouvelle
            if (isSingleCur) {
                els.book.classList.remove("single-page");
                els.spine.style.display = "";
            }
            els.imgLeft.src = pageImages[isSingleTgt ? tgt[0] - 1 : tgt[0] - 1];
            els.imgRight.src = pageImages[cur[cur.length - 1] - 1];
        }
    }

    // ===== EVENTS =====
    els.zoneLeft.addEventListener("click", prev);
    els.zoneRight.addEventListener("click", next);

    // Clic sur le côté gauche/droit du livre aussi
    els.pageLeft.addEventListener("click", prev);
    els.pageRight.addEventListener("click", next);

    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
        else if (e.key === "Home") { first(); }
        else if (e.key === "End") { last(); }
    });

    // Swipe tactile
    var touchStartX = 0;
    els.wrapper.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    els.wrapper.addEventListener("touchend", function (e) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (dx < -50) next();
        else if (dx > 50) prev();
    });

    // Fullscreen
    els.btnFullscreen.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Molette
    els.wrapper.addEventListener("wheel", function (e) {
        e.preventDefault();
        if (e.deltaY > 0 || e.deltaX > 0) next();
        else prev();
    }, { passive: false });

    // ===== GO =====
    console.log("Flipbook JS chargé ✓");
    load();

})();
