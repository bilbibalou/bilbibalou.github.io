// ===== CONFIGURATION =====
const PDF_PATH = "ressources/flipbook/forge motori.pdf";
const RENDER_SCALE = 2;        // Qualité de rendu (2 = haute qualité)
const THUMB_SCALE = 0.3;       // Échelle des miniatures

// ===== VARIABLES GLOBALES =====
let pdfDoc = null;
let totalPages = 0;
let pageImages = [];
let currentZoom = 1;
let pageWidth = 0;
let pageHeight = 0;

// ===== INITIALISATION PDF.JS =====
pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// ===== CHARGEMENT DU PDF =====
async function loadPDF() {
    const loader = document.getElementById("loader");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");

    try {
        // Charger le PDF
        const loadingTask = pdfjsLib.getDocument(PDF_PATH);
        pdfDoc = await loadingTask.promise;
        totalPages = pdfDoc.numPages;

        // Rendre toutes les pages en images
        for (let i = 1; i <= totalPages; i++) {
            const imgData = await renderPageToImage(i, RENDER_SCALE);
            pageImages.push(imgData);

            // Mise à jour progression
            const percent = Math.round((i / totalPages) * 100);
            progressFill.style.width = percent + "%";
            progressText.textContent = percent + "%";
        }

        // Récupérer les dimensions de la première page pour le ratio
        const firstPage = await pdfDoc.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1 });
        pageWidth = viewport.width;
        pageHeight = viewport.height;

        // Initialiser le flipbook
        initFlipbook();

        // Générer les miniatures
        generateThumbnails();

        // Masquer le loader
        loader.classList.add("hidden");
        setTimeout(() => {
            loader.style.display = "none";
            document.getElementById("flipbook-container").classList.add("visible");
        }, 500);

    } catch (err) {
        console.error("Erreur chargement PDF :", err);
        progressText.textContent = "Erreur de chargement !";
        progressText.style.color = "#ff4444";
    }
}

// ===== RENDU D'UNE PAGE EN IMAGE (base64) =====
async function renderPageToImage(pageNum, scale) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;

    return canvas.toDataURL("image/jpeg", 0.92);
}

// ===== INITIALISATION DU FLIPBOOK =====
function initFlipbook() {
    const $flipbook = $("#flipbook");
    const wrapper = document.getElementById("flipbook-wrapper");

    // Calculer les dimensions adaptées à l'écran
    const availHeight = wrapper.clientHeight - 40;
    const availWidth = wrapper.clientWidth - 40;

    // Ratio d'une seule page
    const ratio = pageWidth / pageHeight;

    // En mode double page, la largeur = 2 × largeur d'une page
    let singleW, singleH;

    // Adapter à la hauteur disponible
    singleH = availHeight;
    singleW = singleH * ratio;

    // Vérifier que 2 pages ne dépassent pas la largeur
    if (singleW * 2 > availWidth) {
        singleW = availWidth / 2;
        singleH = singleW / ratio;
    }

    singleW = Math.floor(singleW);
    singleH = Math.floor(singleH);

    // Ajouter les pages au DOM
    for (let i = 0; i < totalPages; i++) {
        const div = document.createElement("div");
        div.className = "page";

        const img = document.createElement("img");
        img.src = pageImages[i];
        img.alt = `Page ${i + 1}`;
        img.draggable = false;

        div.appendChild(img);
        $flipbook.append(div);
    }

    // Initialiser turn.js
    $flipbook.turn({
        width: singleW * 2,
        height: singleH,
        autoCenter: true,
        elevation: 50,
        gradients: true,
        duration: 1000,
        pages: totalPages,
        when: {
            turned: function (event, page) {
                updatePageIndicator(page);
                updateActiveThumbnail(page);
            }
        }
    });

    // Mise à jour initiale
    updatePageIndicator(1);
    updateActiveThumbnail(1);

    // Gestion clavier
    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === " ") {
            e.preventDefault();
            $flipbook.turn("next");
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            $flipbook.turn("previous");
        } else if (e.key === "Home") {
            e.preventDefault();
            $flipbook.turn("page", 1);
        } else if (e.key === "End") {
            e.preventDefault();
            $flipbook.turn("page", totalPages);
        }
    });

    // Swipe tactile
    let touchStartX = 0;
    const flipbookEl = document.getElementById("flipbook");

    flipbookEl.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    flipbookEl.addEventListener("touchend", function (e) {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                $flipbook.turn("next");
            } else {
                $flipbook.turn("previous");
            }
        }
    }, { passive: true });

    // Boutons toolbar
    document.getElementById("btnPrev").addEventListener("click", () => $flipbook.turn("previous"));
    document.getElementById("btnNext").addEventListener("click", () => $flipbook.turn("next"));
    document.getElementById("btnFirst").addEventListener("click", () => $flipbook.turn("page", 1));
    document.getElementById("btnLast").addEventListener("click", () => $flipbook.turn("page", totalPages));

    // Zones de navigation latérales
    document.getElementById("nav-left").addEventListener("click", () => $flipbook.turn("previous"));
    document.getElementById("nav-right").addEventListener("click", () => $flipbook.turn("next"));

    // Zoom
    document.getElementById("btnZoomIn").addEventListener("click", () => applyZoom(0.1));
    document.getElementById("btnZoomOut").addEventListener("click", () => applyZoom(-0.1));

    // Plein écran
    document.getElementById("btnFullscreen").addEventListener("click", toggleFullscreen);

    // Redimensionnement
    window.addEventListener("resize", debounce(() => resizeFlipbook(), 300));
}

// ===== INDICATEUR DE PAGE =====
function updatePageIndicator(page) {
    document.getElementById("pageIndicator").textContent = `Page ${page} / ${totalPages}`;
}

// ===== MINIATURES =====
async function generateThumbnails() {
    const container = document.getElementById("thumbnails");

    for (let i = 0; i < totalPages; i++) {
        const div = document.createElement("div");
        div.className = "thumbnail";
        if (i === 0) div.classList.add("active");
        div.dataset.page = i + 1;

        const img = document.createElement("img");
        img.src = pageImages[i];
        img.alt = `Miniature ${i + 1}`;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.draggable = false;

        div.appendChild(img);

        div.addEventListener("click", function () {
            const pageNum = parseInt(this.dataset.page);
            $("#flipbook").turn("page", pageNum);
        });

        container.appendChild(div);
    }
}

function updateActiveThumbnail(page) {
    document.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("active"));
    const active = document.querySelector(`.thumbnail[data-page="${page}"]`);
    if (active) {
        active.classList.add("active");
        // Scroll dans la barre de miniatures
        active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
}

// ===== ZOOM =====
function applyZoom(delta) {
    currentZoom = Math.max(0.5, Math.min(2, currentZoom + delta));
    const wrapper = document.getElementById("flipbook-wrapper");
    const flipbook = document.getElementById("flipbook");
    flipbook.style.transform = `scale(${currentZoom})`;
    flipbook.style.transformOrigin = "center center";
}

// ===== PLEIN ÉCRAN =====
function toggleFullscreen() {
    const container = document.getElementById("flipbook-container");

    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            console.warn("Fullscreen non supporté :", err);
        });
    } else {
        document.exitFullscreen();
    }
}

// ===== REDIMENSIONNEMENT =====
function resizeFlipbook() {
    const $flipbook = $("#flipbook");
    if (!$flipbook.data("turn")) return;

    const wrapper = document.getElementById("flipbook-wrapper");
    const availHeight = wrapper.clientHeight - 40;
    const availWidth = wrapper.clientWidth - 40;
    const ratio = pageWidth / pageHeight;

    let singleH = availHeight;
    let singleW = singleH * ratio;

    if (singleW * 2 > availWidth) {
        singleW = availWidth / 2;
        singleH = singleW / ratio;
    }

    singleW = Math.floor(singleW);
    singleH = Math.floor(singleH);

    $flipbook.turn("size", singleW * 2, singleH);
}

// ===== UTILITAIRE DEBOUNCE =====
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ===== LANCEMENT =====
loadPDF();
