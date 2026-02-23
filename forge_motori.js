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
        flipOverlay: document.getElementById("flip-overlay"),
        flipPage: document.getElementById("flip-page"),
        flipFrontImg: document.getElementById("flipFrontImg"),
        flipBackImg: document.getElementById("flipBackImg")
    };

    // ===== ÉTAT =====
    var pdfDoc = null;
    var totalPages = 0;
    var pageImages = [];
    var thumbImages = [];
    var currentSpread = 0;
    var totalSpreads = 0;
    var isAnimating = false;

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

    var spreadMap = [];

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

                    // Miniature
                    var tc = document.createElement("canvas");
                    var ts = 0.15;
                    tc.width = vp.width * ts;
                    tc.height = vp.height * ts;
                    tc.getContext("2d").drawImage(canvas, 0, 0, tc.width, tc.height);
                    thumbImages[num - 1] = tc.toDataURL("image/jpeg", 0.6);

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
            els.pageRight.style.display = "none";
            els.spine.style.display = "none";
        } else {
            els.book.classList.remove("single-page");
            els.imgLeft.src = pageImages[spread[0] - 1];
            els.imgRight.src = pageImages[spread[1] - 1];
            els.pageRight.style.display = "";
            els.spine.style.display = "";
        }

        updateIndicator();
        updateArrows();
    }

    function updateIndicator() {
        var spread = spreadMap[currentSpread];
        if (spread.length === 1) {
            els.pageIndicator.textContent = "Page " + spread[0] + " / " + totalPages;
        } else {
            els.pageIndicator.textContent = "Pages " + spread[0] + "-" + spread[1] + " / " + totalPages;
        }
    }

    function updateArrows() {
        els.zoneLeft.style.visibility = currentSpread > 0 ? "visible" : "hidden";
        els.zoneRight.style.visibility = currentSpread < totalSpreads - 1 ? "visible" : "hidden";
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

        // Position du flip
        var bookRect = els.book.getBoundingClientRect();
        var pageW = bookRect.width / 2;
        var pageH = bookRect.height;

        els.flipOverlay.classList.remove("flip-hidden");

        if (direction === "right") {
            // Page qui tourne = page droite actuelle
            var frontPage = curSpread.length === 2 ? curSpread[1] : curSpread[0];
            var backPage = tgtSpread[0];

            els.flipFrontImg.src = pageImages[frontPage - 1] || "";
            els.flipBackImg.src = pageImages[backPage - 1] || "";

            els.flipPage.style.left = (bookRect.left + pageW) + "px";
            els.flipPage.style.top = bookRect.top + "px";
            els.flipPage.style.width = pageW + "px";
            els.flipPage.style.height = pageH + "px";

            els.flipPage.className = "flipping-right";
        } else {
            var frontPage2 = curSpread[0];
            var backPage2 = tgtSpread.length === 2 ? tgtSpread[1] : tgtSpread[0];

            els.flipFrontImg.src = pageImages[frontPage2 - 1] || "";
            els.flipBackImg.src = pageImages[backPage2 - 1] || "";

            els.flipPage.style.left = bookRect.left + "px";
            els.flipPage.style.top = bookRect.top + "px";
            els.flipPage.style.width = pageW + "px";
            els.flipPage.style.height = pageH + "px";

            els.flipPage.className = "flipping-left";
        }

        setTimeout(function () {
            els.flipPage.className = "";
            els.flipOverlay.classList.add("flip-hidden");
            showSpread(targetSpread);
            isAnimating = false;
        }, 620);
    }

    function goToPage(pageNum) {
        for (var i = 0; i < spreadMap.length; i++) {
            if (spreadMap[i].indexOf(pageNum) !== -1) {
                showSpread(i);
                return;
            }
        }
    }

    // ===== EVENTS =====
    els.zoneLeft.addEventListener("click", prev);
    els.zoneRight.addEventListener("click", next);

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

    // Double-clic fullscreen
    els.wrapper.addEventListener("dblclick", function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // ===== GO =====
    console.log("Flipbook JS chargé ✓");
    load();

})();
