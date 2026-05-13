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
        book: document.getElementById("book"),
        zoneLeft: document.getElementById("click-left"),
        zoneRight: document.getElementById("click-right"),
        btnFullscreen: document.getElementById("btnFullscreen"),
        bookViewport: document.getElementById("book-viewport"),
    };

    // ===== ÉTAT =====
    var pdfDoc = null;
    var totalPages = 0;
    var pageImages = [];
    var pageFlip = null;
    var pageRatio = 210 / 297; // ratio par défaut A4 (sera recalculé)

    // ===== CHARGEMENT PDF =====
    function load() {
        els.loaderMsg.textContent = "Chargement du PDF…";
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        pdfjsLib.getDocument(PDF_PATH).promise.then(function (pdf) {
            pdfDoc = pdf;
            totalPages = pdf.numPages;
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

                // Récupère le ratio depuis la première page
                if (num === 1) {
                    pageRatio = vp.width / vp.height;
                }

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

        // Calcule les dimensions optimales du livre
        var bookRect = els.book.getBoundingClientRect();
        var maxH = bookRect.height;
        var maxW = bookRect.width;

        // Pour un spread (2 pages côte à côte), largeur = 2 * hauteur * ratio
        var hFromW = maxW / (2 * pageRatio);
        var wFromH = maxH * 2 * pageRatio;

        var height, width;
        if (hFromW <= maxH) {
            width = maxW;
            height = hFromW;
        } else {
            height = maxH;
            width = wFromH;
        }

        var pageW = Math.floor(width / 2);
        var pageH = Math.floor(height);

        // Initialise StPageFlip en mode canvas
        pageFlip = new St.PageFlip(els.book, {
            width: pageW,
            height: pageH,
            size: "stretch",
            minWidth: 200,
            maxWidth: 2000,
            minHeight: 300,
            maxHeight: 2400,
            maxShadowOpacity: 0.5,
            showCover: true,
            mobileScrollSupport: false,
            usePortrait: false,
            startZIndex: 0,
            autoSize: true,
            drawShadow: true,
            flippingTime: 800,
            useMouseEvents: true,
            swipeDistance: 30,
            showPageCorners: true,
            disableFlipByClick: false,
            renderOnlyPageLengthChange: false,
        });

        // Mode canvas : on charge via loadFromImages
        pageFlip.loadFromImages(pageImages);

        // Événements
        pageFlip.on("flip", function (e) {
            var pageIdx = e.data;
            updateIndicator(pageIdx);
            updateArrows(pageIdx);
        });

        pageFlip.on("changeState", function (e) {
            // e.data peut être : "user_fold", "fold_corner", "flipping", "read"
        });

        updateIndicator(0);
        updateArrows(0);
    }

    // ===== UI =====
    function updateIndicator(pageIdx) {
        // pageIdx est l'index de la page de gauche du spread courant
        var current = pageIdx + 1;
        if (pageIdx === 0 || pageIdx === totalPages - 1) {
            // Couverture ou dernière page seule
            els.pageIndicator.textContent = current + " / " + totalPages;
        } else {
            els.pageIndicator.textContent = current + "-" + (current + 1) + " / " + totalPages;
        }
    }

    function updateArrows(pageIdx) {
        if (pageIdx <= 0) {
            els.zoneLeft.classList.add("invisible");
        } else {
            els.zoneLeft.classList.remove("invisible");
        }
        if (pageIdx >= totalPages - 1) {
            els.zoneRight.classList.add("invisible");
        } else {
            els.zoneRight.classList.remove("invisible");
        }
    }

    // ===== NAVIGATION =====
    function next() {
        if (pageFlip) pageFlip.flipNext();
    }

    function prev() {
        if (pageFlip) pageFlip.flipPrev();
    }

    // ===== EVENTS =====
    els.zoneLeft.addEventListener("click", prev);
    els.zoneRight.addEventListener("click", next);

    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
        else if (e.key === "Home" && pageFlip) { pageFlip.flip(0); }
        else if (e.key === "End" && pageFlip) { pageFlip.flip(totalPages - 1); }
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
    els.book.addEventListener("wheel", function (e) {
        e.preventDefault();
        if (e.deltaY > 0 || e.deltaX > 0) next();
        else prev();
    }, { passive: false });

    // ===== GO =====
    console.log("Flipbook JS chargé (StPageFlip canvas) ✓");
    load();

})();
