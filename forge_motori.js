(function () {
    "use strict";

    // ===== CONFIG =====
    var PDF_PATH = "ressources/flipbook/forge_motori.pdf";
    var RENDER_SCALE = 2;

    // ===== ÉLÉMENTS =====
    var els = {
        loader: document.getElementById("loader"),
        loaderMsg: document.getElementById("loader-msg"),
        progressFill: document.getElementById("progress-fill"),
        progressText: document.getElementById("progress-text"),
        app: document.getElementById("app"),
        pageInfo: document.getElementById("page-info"),
        imgLeft: document.getElementById("img-left"),
        imgRight: document.getElementById("img-right"),
        numLeft: document.getElementById("num-left"),
        numRight: document.getElementById("num-right"),
        book: document.getElementById("book"),
        viewport: document.getElementById("viewport"),
        leftSlot: document.querySelector(".left-slot"),
        rightSlot: document.querySelector(".right-slot"),
        spine: document.querySelector(".spine"),
        zoneLeft: document.getElementById("zone-left"),
        zoneRight: document.getElementById("zone-right"),
        thumbsCtn: document.getElementById("thumbs"),
        btnFirst: document.getElementById("btn-first"),
        btnPrev: document.getElementById("btn-prev"),
        btnNext: document.getElementById("btn-next"),
        btnLast: document.getElementById("btn-last"),
        btnZin: document.getElementById("btn-zin"),
        btnZout: document.getElementById("btn-zout"),
        btnZreset: document.getElementById("btn-zreset"),
        btnFs: document.getElementById("btn-fs")
    };

    // Vérification
    var ok = true;
    Object.keys(els).forEach(function (k) {
        if (!els[k]) {
            console.error("Élément manquant :", k);
            ok = false;
        }
    });
    if (!ok) return;

    // ===== VARIABLES =====
    var pages = [];        // tableau d'images (data URLs)
    var totalPages = 0;
    var spread = 0;        // spread courant
    var maxSpread = 0;
    var zoom = 1;
    var pageRatio = 1;

    // ===== LOGIQUE DES SPREADS =====
    // Spread 0 : page 1 seule (couverture)
    // Spread 1 : pages 2-3
    // Spread 2 : pages 4-5
    // ...
    // Si nombre pair de pages : dernier spread = dernière page seule

    function getMaxSpread() {
        if (totalPages <= 1) return 0;
        // Pages restantes après la couverture
        var rest = totalPages - 1;
        var spreads = Math.ceil(rest / 2);
        return spreads;
    }

    function getSpreadPages(s) {
        // Spread 0 = couverture (page index 0, seule)
        if (s === 0) {
            return { left: -1, right: 0, single: true };
        }

        // Spread s >= 1
        // Page gauche = 1 + (s-1)*2 = index dans le tableau pages
        var leftIdx = 1 + (s - 1) * 2;
        var rightIdx = leftIdx + 1;

        if (leftIdx >= totalPages) {
            return { left: -1, right: -1, single: false };
        }

        if (rightIdx >= totalPages) {
            // Dernière page seule
            return { left: leftIdx, right: -1, single: true };
        }

        return { left: leftIdx, right: rightIdx, single: false };
    }

    // ===== AFFICHAGE =====
    function show() {
        var sp = getSpreadPages(spread);

        if (sp.single) {
            // Mode page seule (couverture ou dernière)
            els.leftSlot.style.display = "none";
            els.spine.style.display = "none";
            els.rightSlot.style.display = "flex";
            els.rightSlot.style.borderRadius = "8px";
            els.rightSlot.querySelector(".shadow-inner").style.display = "none";

            var pageIdx = (sp.right >= 0) ? sp.right : sp.left;
            els.imgRight.src = pages[pageIdx];
            els.imgRight.style.display = "block";
            els.numRight.textContent = (pageIdx + 1);

            els.imgLeft.style.display = "none";
            els.numLeft.textContent = "";

            // Centrer la page unique
            els.book.style.justifyContent = "center";

            // Page info
            els.pageInfo.textContent = "Page " + (pageIdx + 1) + " / " + totalPages;
        } else {
            // Mode double page
            els.leftSlot.style.display = "flex";
            els.spine.style.display = "block";
            els.rightSlot.style.display = "flex";
            els.rightSlot.style.borderRadius = "0 8px 8px 0";
            els.leftSlot.querySelector(".shadow-inner").style.display = "block";
            els.rightSlot.querySelector(".shadow-inner").style.display = "block";

            els.book.style.justifyContent = "center";

            // Gauche
            if (sp.left >= 0) {
                els.imgLeft.src = pages[sp.left];
                els.imgLeft.style.display = "block";
                els.numLeft.textContent = (sp.left + 1);
            } else {
                els.imgLeft.style.display = "none";
                els.numLeft.textContent = "";
            }

            // Droite
            if (sp.right >= 0) {
                els.imgRight.src = pages[sp.right];
                els.imgRight.style.display = "block";
                els.numRight.textContent = (sp.right + 1);
            } else {
                els.imgRight.style.display = "none";
                els.numRight.textContent = "";
            }

            // Page info
            var leftNum = (sp.left >= 0) ? (sp.left + 1) : "";
            var rightNum = (sp.right >= 0) ? (sp.right + 1) : "";
            if (leftNum && rightNum) {
                els.pageInfo.textContent = "Pages " + leftNum + " – " + rightNum + " / " + totalPages;
            } else {
                els.pageInfo.textContent = "Page " + (leftNum || rightNum) + " / " + totalPages;
            }
        }

        fitSize();
        highlightThumbs();
    }

    // ===== NAVIGATION =====
    function go(s) {
        spread = Math.max(0, Math.min(maxSpread, s));
        show();
    }

    function next() { go(spread + 1); }
    function prev() { go(spread - 1); }
    function first() { go(0); }
    function last() { go(maxSpread); }

    function goToPage(pageNum) {
        // pageNum = 1-indexed
        if (pageNum === 1) { go(0); return; }
        // Pour les pages après la couverture
        var s = Math.ceil((pageNum - 1) / 2);
        go(s);
    }

    // ===== CHARGEMENT PDF =====
    function load() {
        els.loaderMsg.textContent = "Chargement du PDF…";
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        pdfjsLib.getDocument(PDF_PATH).promise.then(function (pdf) {
            totalPages = pdf.numPages;
            maxSpread = getMaxSpread();
            console.log("PDF ouvert :", totalPages, "pages,", maxSpread + 1, "spreads");

            var done = 0;
            var chain = Promise.resolve();

            for (var i = 1; i <= totalPages; i++) {
                (function (num) {
                    chain = chain.then(function () {
                        return pdf.getPage(num).then(function (page) {
                            var vp = page.getViewport({ scale: RENDER_SCALE });
                            if (num === 1) pageRatio = vp.width / vp.height;

                            var canvas = document.createElement("canvas");
                            canvas.width = vp.width;
                            canvas.height = vp.height;
                            var ctx = canvas.getContext("2d");

                            return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
                                pages.push(canvas.toDataURL("image/jpeg", 0.92));
                                done++;
                                var pct = Math.round((done / totalPages) * 100);
                                els.progressFill.style.width = pct + "%";
                                els.progressText.textContent = pct + "%";
                                els.loaderMsg.textContent = "Rendu page " + done + " / " + totalPages;
                            });
                        });
                    });
                })(i);
            }

            chain.then(function () {
                console.log("Toutes les pages rendues ✓");
                els.loader.style.display = "none";
                els.app.style.display = "flex";
                buildThumbs();
                spread = 0;
                show();
            });
        }).catch(function (err) {
            console.error("Erreur PDF :", err);
            els.loaderMsg.textContent = "Erreur : " + err.message;
        });
    }

    // ===== TAILLE =====
    function fitSize() {
        var sp = getSpreadPages(spread);
        var wrapRect = els.viewport.parentElement.getBoundingClientRect();
        var maxW = wrapRect.width * 0.95;
        var maxH = wrapRect.height * 0.95;

        var pageW, pageH;

        if (sp.single) {
            // Page seule : une seule largeur
            pageH = maxH;
            pageW = pageH * pageRatio;
            if (pageW > maxW * 0.6) {
                pageW = maxW * 0.6;
                pageH = pageW / pageRatio;
            }
            els.rightSlot.style.width = pageW + "px";
            els.rightSlot.style.height = pageH + "px";
            els.leftSlot.style.width = "0px";
            els.leftSlot.style.height = pageH + "px";
        } else {
            // Double page
            pageH = maxH;
            pageW = pageH * pageRatio;
            if (pageW * 2 + 6 > maxW) {
                pageW = (maxW - 6) / 2;
                pageH = pageW / pageRatio;
            }
            pageW = Math.floor(pageW);
            pageH = Math.floor(pageH);
            els.leftSlot.style.width = pageW + "px";
            els.leftSlot.style.height = pageH + "px";
            els.rightSlot.style.width = pageW + "px";
            els.rightSlot.style.height = pageH + "px";
        }
    }

    // ===== ZOOM =====
    function setZoom(z) {
        zoom = Math.max(0.4, Math.min(3, z));
        els.viewport.style.transform = "scale(" + zoom + ")";
        els.btnZreset.textContent = Math.round(zoom * 100) + "%";
    }

    // ===== THUMBNAILS =====
    function buildThumbs() {
        els.thumbsCtn.innerHTML = "";
        for (var i = 0; i < totalPages; i++) {
            var div = document.createElement("div");
            div.className = "thumb";
            div.dataset.p = i + 1;

            var img = document.createElement("img");
            img.src = pages[i];
            img.draggable = false;
            div.appendChild(img);

            div.addEventListener("click", (function (pNum) {
                return function () {
                    goToPage(pNum);
                };
            })(i + 1));

            els.thumbsCtn.appendChild(div);
        }
    }

    function highlightThumbs() {
        var sp = getSpreadPages(spread);
        var activePages = [];
        if (sp.left >= 0) activePages.push(sp.left + 1);
        if (sp.right >= 0) activePages.push(sp.right + 1);

        document.querySelectorAll(".thumb").forEach(function (t) {
            var p = parseInt(t.dataset.p);
            if (activePages.indexOf(p) >= 0) {
                t.classList.add("on");
            } else {
                t.classList.remove("on");
            }
        });

        var active = document.querySelector(".thumb.on");
        if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    // ===== ÉVÉNEMENTS =====
    els.btnNext.addEventListener("click", next);
    els.btnPrev.addEventListener("click", prev);
    els.btnFirst.addEventListener("click", first);
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
