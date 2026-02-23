// ===== CONFIG =====
const PDF_PATH = "ressources/flipbook/forge_motori.pdf";
const RENDER_SCALE = 1.5;

// ===== STATE =====
let totalPages = 0;zzz
let pageImages = [];
let currentSpread = 0;       // index de la double-page actuelle (0 = pages 1-2)
let isAnimating = false;
let currentZoom = 1;
let pageWidth = 0;
let pageHeight = 0;

// ===== PDF.JS =====
pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// ===== CHARGEMENT =====
async function loadPDF() {
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const loaderMsg = document.getElementById("loaderMsg");
    const loader = document.getElementById("loader");
    const container = document.getElementById("flipbook-container");

    try {
        loaderMsg.textContent = "Vérification du fichier…";

        // Vérifier que le PDF existe
        let resp;
        try {
            resp = await fetch(PDF_PATH, { method: "HEAD" });
        } catch (e) {
            throw new Error("Impossible d'accéder au fichier : " + PDF_PATH);
        }

        if (!resp.ok) {
            throw new Error("Fichier introuvable : " + PDF_PATH);
        }

        // Charger le PDF
        loaderMsg.textContent = "Ouverture du PDF…";
        const pdfDoc = await pdfjsLib.getDocument(PDF_PATH).promise;
        totalPages = pdfDoc.numPages;
        console.log(`PDF chargé : ${totalPages} pages`);

        // Dimensions
        const firstPage = await pdfDoc.getPage(1);
        const vp = firstPage.getViewport({ scale: 1 });
        pageWidth = vp.width;
        pageHeight = vp.height;

        // Rendu de toutes les pages
        for (let i = 1; i <= totalPages; i++) {
            loaderMsg.textContent = `Rendu page ${i} / ${totalPages}`;
            progressText.textContent = `${Math.round((i / totalPages) * 100)}%`;
            progressFill.style.width = `${Math.round((i / totalPages) * 100)}%`;

            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: RENDER_SCALE });

            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: canvas.getContext("2d"),
                viewport: viewport
            }).promise;

            pageImages.push(canvas.toDataURL("image/jpeg", 0.9));
        }

        // Tout prêt !
        initBook();
        buildThumbnails();

        loader.classList.add("hidden");
        container.classList.remove("hidden");

    } catch (err) {
        console.error(err);
        loaderMsg.textContent = "Erreur de chargement !";
        progressText.textContent = err.message;
        progressText.style.color = "#ff4444";
        progressFill.style.width = "100%";
        progressFill.style.background = "#ff4444";
    }
}

// ===== INIT BOOK =====
function initBook() {
    resizeBook();
    showSpread(0);

    // Boutons
    document.getElementById("btnPrev").addEventListener("click", prevSpread);
    document.getElementById("btnNext").addEventListener("click", nextSpread);
    document.getElementById("btnFirst").addEventListener("click", () => goToSpread(0));
    document.getElementById("btnLast").addEventListener("click", () => goToSpread(getMaxSpread()));

    // Zones cliquables
    document.getElementById("click-left").addEventListener("click", prevSpread);
    document.getElementById("click-right").addEventListener("click", nextSpread);

    // Zoom
    document.getElementById("btnZoomIn").addEventListener("click", () => setZoom(currentZoom + 0.15));
    document.getElementById("btnZoomOut").addEventListener("click", () => setZoom(currentZoom - 0.15));
    document.getElementById("btnZoomReset").addEventListener("click", () => setZoom(1));

    // Plein écran
    document.getElementById("btnFullscreen").addEventListener("click", toggleFullscreen);

    // Clavier
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); nextSpread(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); prevSpread(); }
        else if (e.key === "Home") { goToSpread(0); }
        else if (e.key === "End") { goToSpread(getMaxSpread()); }
        else if (e.key === "+" || e.key === "=") { setZoom(currentZoom + 0.15); }
        else if (e.key === "-") { setZoom(currentZoom - 0.15); }
        else if (e.key === "0") { setZoom(1); }
    });

    // Swipe
    let touchStartX = 0;
    const wrapper = document.getElementById("book-wrapper");

    wrapper.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    wrapper.addEventListener("touchend", (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextSpread() : prevSpread();
        }
    }, { passive: true });

    // Resize
    window.addEventListener("resize", debounce(resizeBook, 200));
}

// ===== NAVIGATION =====
function getMaxSpread() {
    // spread 0 = pages 1-2, spread 1 = pages 3-4, etc.
    return Math.ceil(totalPages / 2) - 1;
}

function getSpreadPages(spread) {
    const left = spread * 2;       // index 0-based
    const right = spread * 2 + 1;
    return {
        leftIdx: left,
        rightIdx: right < totalPages ? right : -1
    };
}

function showSpread(spread, animate = false, direction = "right") {
    const { leftIdx, rightIdx } = getSpreadPages(spread);

    const leftImg = document.getElementById("pageLeftImg");
    const rightImg = document.getElementById("pageRightImg");
    const leftNum = document.getElementById("pageLeftNum");
    const rightNum = document.getElementById("pageRightNum");

    if (animate) {
        animateFlip(direction, () => {
            setImages(leftImg, rightImg, leftNum, rightNum, leftIdx, rightIdx);
        });
    } else {
        setImages(leftImg, rightImg, leftNum, rightNum, leftIdx, rightIdx);
    }

    currentSpread = spread;
    updateIndicator();
    updateActiveThumbnail();
}

function setImages(leftImg, rightImg, leftNum, rightNum, leftIdx, rightIdx) {
    if (leftIdx >= 0 && leftIdx < totalPages) {
        leftImg.src = pageImages[leftIdx];
        leftImg.style.visibility = "visible";
        leftNum.textContent = leftIdx + 1;
    } else {
        leftImg.style.visibility = "hidden";
        leftNum.textContent = "";
    }

    if (rightIdx >= 0 && rightIdx < totalPages) {
        rightImg.src = pageImages[rightIdx];
        rightImg.style.visibility = "visible";
        rightNum.textContent = rightIdx + 1;
    } else {
        rightImg.style.visibility = "hidden";
        rightNum.textContent = "";
    }
}

function nextSpread() {
    if (isAnimating) return;
    if (currentSpread >= getMaxSpread()) return;
    showSpread(currentSpread + 1, true, "right");
}

function prevSpread() {
    if (isAnimating) return;
    if (currentSpread <= 0) return;
    showSpread(currentSpread - 1, true, "left");
}

function goToSpread(spread) {
    if (isAnimating) return;
    spread = Math.max(0, Math.min(spread, getMaxSpread()));
    if (spread === currentSpread) return;
    const dir = spread > currentSpread ? "right" : "left";
    showSpread(spread, true, dir);
}

function goToPage(pageNum) {
    const spread = Math.floor((pageNum - 1) / 2);
    goToSpread(spread);
}

// ===== ANIMATION =====
function animateFlip(direction, onComplete) {
    isAnimating = true;

    const book = document.getElementById("book");
    const className = direction === "right" ? "flip-right-anim" : "flip-left-anim";

    book.classList.add(className);

    setTimeout(() => {
        onComplete();
        book.classList.remove(className);
        isAnimating = false;
    }, 350);
}

// Ajouter les keyframes dynamiquement
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes bookFlipRight {
        0%   { transform: perspective(1500px) rotateY(0deg); }
        40%  { transform: perspective(1500px) rotateY(-4deg); }
        100% { transform: perspective(1500px) rotateY(0deg); }
    }
    @keyframes bookFlipLeft {
        0%   { transform: perspective(1500px) rotateY(0deg); }
        40%  { transform: perspective(1500px) rotateY(4deg); }
        100% { transform: perspective(1500px) rotateY(0deg); }
    }
    #book.flip-right-anim {
        animation: bookFlipRight 0.35s ease-in-out;
    }
    #book.flip-left-anim {
        animation: bookFlipLeft 0.35s ease-in-out;
    }
`;
document.head.appendChild(styleSheet);

// ===== INDICATOR =====
function updateIndicator() {
    const { leftIdx, rightIdx } = getSpreadPages(currentSpread);
    let text;
    if (rightIdx >= 0 && rightIdx < totalPages) {
        text = `Pages ${leftIdx + 1}-${rightIdx + 1} / ${totalPages}`;
    } else {
        text = `Page ${leftIdx + 1} / ${totalPages}`;
    }
    document.getElementById("pageIndicator").textContent = text;
}

// ===== RESIZE =====
function resizeBook() {
    const wrapper = document.getElementById("book-wrapper");
    const book = document.getElementById("book");
    const pageLeft = book.querySelector(".page-left");
    const pageRight = book.querySelector(".page-right");

    const availH = wrapper.clientHeight - 30;
    const availW = wrapper.clientWidth - 30;
    const ratio = pageWidth / pageHeight;

    let pH = availH;
    let pW = pH * ratio;

    // Deux pages côte à côte
    if (pW * 2 > availW) {
        pW = availW / 2;
        pH = pW / ratio;
    }

    pW = Math.floor(pW);
    pH = Math.floor(pH);

    pageLeft.style.width = pW + "px";
    pageLeft.style.height = pH + "px";
    pageRight.style.width = pW + "px";
    pageRight.style.height = pH + "px";
}

// ===== ZOOM =====
function setZoom(z) {
    currentZoom = Math.max(0.4, Math.min(3, z));
    document.getElementById("book-viewport").style.transform = `scale(${currentZoom})`;
    document.getElementById("btnZoomReset").textContent = Math.round(currentZoom * 100) + "%";
}

// ===== FULLSCREEN =====
function toggleFullscreen() {
    const el = document.getElementById("flipbook-container");
    if (!document.fullscreenElement) {
        el.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
}

// ===== MINIATURES =====
function buildThumbnails() {
    const container = document.getElementById("thumbnails");
    container.innerHTML = "";

    for (let i = 0; i < totalPages; i++) {
        const div = document.createElement("div");
        div.className = "thumbnail";
        div.dataset.page = i + 1;

        const img = document.createElement("img");
        img.src = pageImages[i];
        img.draggable = false;

        div.appendChild(img);
        div.addEventListener("click", () => goToPage(i + 1));
        container.appendChild(div);
    }

    updateActiveThumbnail();
}

function updateActiveThumbnail() {
    const { leftIdx, rightIdx } = getSpreadPages(currentSpread);

    document.querySelectorAll(".thumbnail").forEach(t => {
        t.classList.remove("active");
        const p = parseInt(t.dataset.page);
        if (p === leftIdx + 1 || (rightIdx >= 0 && p === rightIdx + 1)) {
            t.classList.add("active");
        }
    });

    // Scroll vers la miniature active
    const active = document.querySelector(".thumbnail.active");
    if (active) {
        active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
}

// ===== DEBOUNCE =====
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// ===== GO =====
console.log("Flipbook JS chargé, démarrage…");
loadPDF();
