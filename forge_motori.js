(function () {
    "use strict";

    // ===== CONFIG =====
    var PDF_PATH = "ressources/forge.pdf";
    var RENDER_SCALE = 2;

    // ===== ÉLÉMENTS (correspondant exactement à ton HTML) =====
    var els = {
        loader: document.getElementById("loader"),
        loaderMsg: document.getElementById("loaderMsg"),
        progressFill: document.getElementById("progressFill"),
        progressText: document.getElementById("progressText"),
        container: document.getElementById("flipbook-container"),
        pageIndicator: document.getElementById("pageIndicator"),
        imgLeft: document.getElementById("pageLeftImg"),
        imgRight: document.getElementById("pageRightImg"),
        numLeft: document.getElementById("pageLeftNum"),
        numRight: document.getElementById("pageRightNum"),
        book: document.getElementById("book"),
        viewport: document.getElementById("book-viewport"),
        wrapper: document.getElementById("book-wrapper"),
        pageLeft: document.querySelector(".page-left"),
        pageRight: document.querySelector(".page-right"),
        spine: document.querySelector(".book-spine"),
        zoneLeft: document.getElementById("click-left"),
        zoneRight: document.getElementById("click-right"),
        thumbsCtn: document.getElementById("thumbnails"),
        btnFirst: document.getElementById("btnFirst"),
        btnPrev: document.getElementById("btnPrev"),
        btnNext: document.getElementById("btnNext"),
        btnLast: document.getElementById("btnLast"),
        btnZin: document.getElementById("btnZoomIn"),
        btnZout: document.getElementById("btnZoomOut"),
        btnZreset: document.getElementById("btnZoomReset"),
        btnFs: document.getElementById("btnFullscreen"),
        flipOverlay: document.getElementById("flip-overlay"),
        flipPage: document.getElementById("flip-page"),
        flipFrontImg: document.getElementById("flipFrontImg"),
        flipBackImg: document.getElementById("flipBackImg")
    };

    // Vérification
    Object.keys(els).forEach(function (k) {
        if (!els[k]) console.warn("Élément manquant :", k);
    });

    // ===== ÉTAT =====
    var pdfDoc = null;
    var totalPages = 0;
    var pageImages = [];    // dataURL par page (index 0 = page 1)
    var thumbImages = [];
    var currentSpread = 0;  // spread courant
    var totalSpreads = 0;
    var zoom = 1;
    var isAnimating = false;

    // ===== SPREADS =====
    // Spread 0 = couverture (page 1 seule)
    // Spread 1 = pages 2-3
    // Spread 2 = pages 4-5
    // etc.
    // Si nombre pair de pages, dernier spread = dernière page seule

    function buildSpreadMap() {
        // Retourne tableau de spreads : chaque élément = [pageNum] ou [pageNum, pageNum]
        var spreads = [];
        // Spread 0 : couverture
        spreads.push([1]);
        // Spreads suivants : par paires
        var p = 2;
        while (p <= totalPages) {
            if (p + 1 <= totalPages) {
                spreads.push([p, p + 1]);
                p += 2;
            } else {
                // Dernière page seule
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
        var done = 0;
        pageImages = new Array(totalPages);
        thumbImages = new Array(totalPages);

        function renderPage(num) {
            return pdfDoc.getPage(num).then(function (page) {
                // Grande image
                var vp = page.getViewport({ scale: RENDER_SCALE });
                var canvas = document.createElement("canvas");
                canvas.width = vp.width;
                canvas.height = vp.height;
                var ctx = canvas.getContext("2d");

                return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
                    pageImages[num - 1] = canvas.toDataURL("image/jpeg", 0.92);

                    // Thumbnail
                    var svp = page.getViewport({ scale: 0.3 });
                    var sc = document.createElement("canvas");
                    sc.width = svp.width;
                    sc.height = svp.height;
                    var sctx = sc.getContext("2d");
                    return page.render({ canvasContext: sctx, viewport: svp }).promise.then(function () {
                        thumbImages[num - 1] = sc.toDataURL("image/jpeg", 0.7);
                        done++;
                        var pct = Math.round((done / totalPages) * 100);
                        els.progressFill.style.width = pct + "%";
                        els.progressText.textContent = pct + "%";
                    });
                });
            });
        }

        // Chaîner les rendus séquentiellement
        var chain = Promise.resolve();
        for (var i = 1; i <= totalPages; i++) {
            (function (num) {
                chain = chain.then(function () { return renderPage(num); });
            })(i);
        }

        chain.then(function () {
            init();
        });
    }

    // ===== INIT =====
    function init() {
        els.loader.classList.add("hidden");
        els.container.classList.remove("hidden");
        buildThumbnails();
        currentSpread = 0;
        showSpread(currentSpread);
        fitSize();
    }

    // ===== AFFICHAGE SPREAD =====
    function showSpread(idx) {
        if (idx < 0 || idx >= totalSpreads) return;
        currentSpread = idx;
        var spread = spreadMap[idx];

        if (spread.length === 1) {
            // Page seule → centrée
            var pg = spread[0];
            els.imgLeft.src = pageImages[pg - 1];
            els.numLeft.textContent = pg;
            els.imgRight.src = "";
            els.numRight.textContent = "";

            els.pageLeft.style.display = "flex";
            els.pageRight.style.display = "none";
            els.spine.style.display = "none";

            // Centrer la page unique
            els.book.classList.add("single-page");
        } else {
            // Double page
            var pgL = spread[0];
            var pgR = spread[1];
            els.imgLeft.src = pageImages[pgL - 1];
            els.numLeft.textContent = pgL;
            els.imgRight.src = pageImages[pgR - 1];
            els.numRight.textContent = pgR;

            els.pageLeft.style.display = "flex";
            els.pageRight.style.display = "flex";
            els.spine.style.display = "block";

            els.book.classList.remove("single-page");
        }

        // Indicateur
        if (spread.length === 1) {
            els.pageIndicator.textContent = "Page " + spread[0] + " / " + totalPages;
        } else {
            els.pageIndicator.textContent = "Pages " + spread[0] + "-" + spread[1] + " / " + totalPages;
        }

        // Boutons
        els.btnFirst.disabled = (currentSpread === 0);
        els.btnPrev.disabled = (currentSpread === 0);
        els.btnNext.disabled = (currentSpread >= totalSpreads - 1);
        els.btnLast.disabled = (currentSpread >= totalSpreads - 1);

        // Highlight thumbnail
        highlightThumb();
    }

    // ===== ANIMATION FLIP =====
    function flipTo(newIdx, direction) {
        if (isAnimating) return;
        if (newIdx < 0 || newIdx >= totalSpreads) return;
        isAnimating = true;

        var oldSpread = spreadMap[currentSpread];
        var newSpread = spreadMap[newIdx];

        // Images pour l'animation
        if (direction === "next") {
            // Front = page droite actuelle, Back = page gauche suivante
            var frontPage = oldSpread.length === 2 ? oldSpread[1] : oldSpread[0];
            var backPage = newSpread[0];

            els.flipFrontImg.src = pageImages[frontPage - 1];
            els.flipBackImg.src = pageImages[backPage - 1];

            els.flipOverlay.classList.remove("flip-hidden");
            els.flipPage.classList.remove("flip-reverse");
            els.flipPage.classList.add("flip-forward");
        } else {
            // Prev: Front = page gauche actuelle, Back = page droite précédente
            var frontPageP = oldSpread[0];
            var backPageP = newSpread.length === 2 ? newSpread[1] : newSpread[0];

            els.flipFrontImg.src = pageImages[frontPageP - 1];
            els.flipBackImg.src = pageImages[backPageP - 1];

            els.flipOverlay.classList.remove("flip-hidden");
            els.flipPage.classList.remove("flip-forward");
            els.flipPage.classList.add("flip-reverse");
        }

        setTimeout(function () {
            showSpread(newIdx);
            els.flipOverlay.classList.add("flip-hidden");
            els.flipPage.classList.remove("flip-forward", "flip-reverse");
            isAnimating = false;
        }, 500);
    }

    // ===== NAVIGATION =====
    function next() {
        if (currentSpread < totalSpreads - 1) {
            flipTo(currentSpread + 1, "next");
        }
    }
    function prev() {
        if (currentSpread > 0) {
            flipTo(currentSpread - 1, "prev");
        }
    }
    function first() { showSpread(0); }
    function last() { showSpread(totalSpreads - 1); }

    function goToPage(pageNum) {
        // Trouver le spread contenant cette page
        for (var i = 0; i < spreadMap.length; i++) {
            if (spreadMap[i].indexOf(pageNum) !== -1) {
                showSpread(i);
                return;
            }
        }
    }

    // ===== THUMBNAILS =====
    function buildThumbnails() {
        els.thumbsCtn.innerHTML = "";
        for (var i = 0; i < totalPages; i++) {
            (function (idx) {
                var div = document.createElement("div");
                div.className = "thumb";
                div.title = "Page " + (idx + 1);
                var img = document.createElement("img");
                img.src = thumbImages[idx];
                img.draggable = false;
                var lbl = document.createElement("span");
                lbl.textContent = idx + 1;
                div.appendChild(img);
                div.appendChild(lbl);
                div.addEventListener("click", function () {
                    goToPage(idx + 1);
                });
                els.thumbsCtn.appendChild(div);
            })(i);
        }
    }

    function highlightThumb() {
        var spread = spreadMap[currentSpread];
        var thumbs = els.thumbsCtn.querySelectorAll(".thumb");
        thumbs.forEach(function (t, i) {
            if (spread.indexOf(i + 1) !== -1) {
                t.classList.add("active");
            } else {
                t.classList.remove("active");
            }
        });

        // Scroll vers la miniature active
        var activeThumb = els.thumbsCtn.querySelector(".thumb.active");
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
    }

    // ===== ZOOM =====
    function setZoom(z) {
        zoom = Math.max(0.5, Math.min(3, z));
        els.book.style.transform = "scale(" + zoom + ")";
        els.btnZreset.textContent = Math.round(zoom * 100) + "%";
    }

    // ===== TAILLE =====
    function fitSize() {
        // Le CSS gère le responsive, on reset le zoom
        setZoom(1);
    }

    // ===== EVENTS =====
    els.btnFirst.addEventListener("click", first);
    els.btnPrev.addEventListener("click", prev);
    els.btnNext.addEventListener("click", next);
    els.btnLast.addEventListener("click", last);
    els.btnZin.addEventListener("click", function () { setZoom(zoom + 0.15); });
    els.btnZout.addEventListener("click", function () { setZoom(zoom - 0.15); });
    els.btnZreset.addEventListener("click", function () { setZoom(1); });
    els.btnFs.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    els.zoneLeft.addEventListener("click", prev);
    els.zoneRight.addEventListener("click", next);

    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
        else if (e.key === "Home") { first(); }
        else if (e.key === "End") { last(); }
        else if (e.key === "+" || e.key === "=") { setZoom(zoom + 0.15); }
        else if (e.key === "-") { setZoom(zoom - 0.15); }
    });

    // Swipe tactile
    var touchStartX = 0;
    els.viewport.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    els.viewport.addEventListener("touchend", function (e) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (dx < -50) next();
        else if (dx > 50) prev();
    });

    // Resize
    window.addEventListener("resize", debounce(function () { fitSize(); }, 200));

    function debounce(fn, ms) {
        var t;
        return function () { clearTimeout(t); t = setTimeout(fn, ms); };
    }

    // ===== GO =====
    console.log("Flipbook JS chargé ✓");
    load();

})();
