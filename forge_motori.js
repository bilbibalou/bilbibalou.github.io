(function () {
    "use strict";

    var PDF_PATH = "ressources/flipbook/forge_motori.pdf";
    var RENDER_SCALE = 2;

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
        bookWrapper: document.getElementById("book-wrapper"),
    };

    var pdfDoc = null;
    var totalPages = 0;
    var pageImages = [];
    var pageFlip = null;
    var pageRatio = 210 / 297;

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

    function startFlipbook() {
        els.loader.classList.add("hidden");
        els.container.classList.remove("hidden");

        // Attend que le DOM soit rendu avant de calculer les dimensions
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                initPageFlip();
            });
        });
    }

    function initPageFlip() {
        var wrapperRect = els.bookWrapper.getBoundingClientRect();
        var maxW = wrapperRect.width - 120; // espace pour les flèches
        var maxH = wrapperRect.height - 20;

        // Calcule dimensions : spread = 2 pages côte à côte
        var pageH = Math.min(maxH, maxW / 2 / pageRatio);
        var pageW = Math.floor(pageH * pageRatio);
        pageH = Math.floor(pageH);

        pageFlip = new St.PageFlip(els.book, {
            width: pageW,
            height: pageH,
            size: "fixed",
            maxShadowOpacity: 0.5,
            showCover: true,
            mobileScrollSupport: false,
            usePortrait: false,
            autoSize: false,
            drawShadow: true,
            flippingTime: 800,
            useMouseEvents: true,
            swipeDistance: 30,
            showPageCorners: true,
            disableFlipByClick: false,
        });

        pageFlip.loadFromImages(pageImages);

        pageFlip.on("flip", function (e) {
            var pageIdx = e.data;
            updateIndicator(pageIdx);
            updateArrows(pageIdx);
        });

        updateIndicator(0);
        updateArrows(0);
    }

    function updateIndicator(pageIdx) {
        var current = pageIdx + 1;
        if (pageIdx === 0 || pageIdx === totalPages - 1) {
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

    function next() { if (pageFlip) pageFlip.flipNext(); }
    function prev() { if (pageFlip) pageFlip.flipPrev(); }

    els.zoneLeft.addEventListener("click", prev);
    els.zoneRight.addEventListener("click", next);

    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
        else if (e.key === "Home" && pageFlip) { pageFlip.flip(0); }
        else if (e.key === "End" && pageFlip) { pageFlip.flip(totalPages - 1); }
    });

    els.btnFullscreen.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    els.book.addEventListener("wheel", function (e) {
        e.preventDefault();
        if (e.deltaY > 0 || e.deltaX > 0) next();
        else prev();
    }, { passive: false });

    load();

})();
