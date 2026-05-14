(function () {
    "use strict";

    // ✅ IMPORTANT : utiliser PageFlip correctement
    const PageFlip = window.St.PageFlip;

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
        btnFullscreen: document.getElementById("btnFullscreen")
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

        chain.then(startFlipbook);
    }

    function startFlipbook() {
        els.loader.classList.add("hidden");
        els.container.classList.remove("hidden");

        var bookRect = els.book.getBoundingClientRect();
        var maxH = bookRect.height;
        var maxW = bookRect.width;

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

        // ✅ FIX PRINCIPAL ICI
        pageFlip = new PageFlip(els.book, {
            width: pageW,
            height: pageH,
            size: "stretch",
            showCover: true,
            useMouseEvents: true,
            mobileScrollSupport: false
        });

        pageFlip.loadFromImages(pageImages);

        pageFlip.on("flip", function (e) {
            updateIndicator(e.data);
            updateArrows(e.data);
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
        els.zoneLeft.classList.toggle("invisible", pageIdx <= 0);
        els.zoneRight.classList.toggle("invisible", pageIdx >= totalPages - 1);
    }

    function next() {
        if (pageFlip) pageFlip.flipNext();
    }

    function prev() {
        if (pageFlip) pageFlip.flipPrev();
    }

    els.zoneLeft.addEventListener("click", prev);
    els.zoneRight.addEventListener("click", next);

    els.btnFullscreen.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    console.log("✅ Flipbook corrigé (PageFlip + PDF.js)");
    load();

})();