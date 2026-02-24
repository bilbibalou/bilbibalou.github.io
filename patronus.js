// ========================
// DONNÉES DU QUIZ
// ========================

const questions = [
    {
        choices: [
            { text: "Lune", traits: ["mystère", "calme", "sagesse"] },
            { text: "Soleil", traits: ["énergie", "courage", "force"] }
        ]
    },
    {
        choices: [
            { text: "Forêt", traits: ["mystère", "sagesse", "indépendance"] },
            { text: "Océan", traits: ["calme", "liberté", "adaptabilité"] }
        ]
    },
    {
        choices: [
            { text: "Observer", traits: ["sagesse", "calme", "mystère"] },
            { text: "Agir", traits: ["courage", "énergie", "force"] }
        ]
    },
    {
        choices: [
            { text: "Ombre", traits: ["mystère", "indépendance", "adaptabilité"] },
            { text: "Lumière", traits: ["courage", "énergie", "loyauté"] }
        ]
    },
    {
        choices: [
            { text: "Douceur", traits: ["calme", "loyauté", "adaptabilité"] },
            { text: "Fougue", traits: ["courage", "énergie", "force"] }
        ]
    },
    {
        choices: [
            { text: "Étoile", traits: ["sagesse", "mystère", "liberté"] },
            { text: "Flamme", traits: ["énergie", "courage", "force"] }
        ]
    },
    {
        choices: [
            { text: "Seul", traits: ["indépendance", "mystère", "sagesse"] },
            { text: "Ensemble", traits: ["loyauté", "calme", "adaptabilité"] }
        ]
    }
];

const patronusList = [
    {
        name: "Cerf",
        emoji: "🦌",
        description: "Noble et protecteur, ton Patronus reflète un courage inébranlable et un esprit de guide. Comme James Potter, tu es un gardien naturel pour ceux que tu aimes.",
        traits: ["courage", "force", "loyauté"]
    },
    {
        name: "Loutre",
        emoji: "🦦",
        description: "Joueuse et intelligente, la loutre symbolise ta curiosité et ta joie de vivre. Tu combines esprit brillant et cœur chaleureux.",
        traits: ["énergie", "adaptabilité", "calme"]
    },
    {
        name: "Loup",
        emoji: "🐺",
        description: "Loyal et instinctif, le loup représente ta connexion profonde avec ceux que tu considères comme ta meute. Ta force réside dans tes liens.",
        traits: ["loyauté", "courage", "force"]
    },
    {
        name: "Phénix",
        emoji: "🔥",
        description: "Rare et majestueux, le phénix symbolise ta capacité à renaître de tes épreuves. Tu portes en toi une lumière que rien ne peut éteindre.",
        traits: ["énergie", "courage", "sagesse"]
    },
    {
        name: "Chat",
        emoji: "🐈",
        description: "Indépendant et mystérieux, le chat reflète ton esprit libre et ta perspicacité. Tu observes le monde avec une sagesse tranquille.",
        traits: ["indépendance", "mystère", "calme"]
    },
    {
        name: "Chouette",
        emoji: "🦉",
        description: "Sage et silencieuse, la chouette représente ta profonde intuition et ton amour du savoir. Tu vois ce que d'autres ne perçoivent pas.",
        traits: ["sagesse", "mystère", "indépendance"]
    },
    {
        name: "Cheval",
        emoji: "🐎",
        description: "Libre et puissant, le cheval symbolise ton esprit indomptable et ta soif de liberté. Tu galopes vers tes rêves sans regarder en arrière.",
        traits: ["liberté", "force", "énergie"]
    },
    {
        name: "Dauphin",
        emoji: "🐬",
        description: "Joyeux et social, le dauphin reflète ta nature bienveillante et ton intelligence émotionnelle. Tu apportes la lumière partout où tu vas.",
        traits: ["calme", "adaptabilité", "loyauté"]
    },
    {
        name: "Renard",
        emoji: "🦊",
        description: "Rusé et adaptable, le renard représente ton intelligence vive et ta capacité à naviguer les situations les plus complexes avec grâce.",
        traits: ["adaptabilité", "mystère", "indépendance"]
    },
    {
        name: "Aigle",
        emoji: "🦅",
        description: "Majestueux et visionnaire, l'aigle symbolise ton ambition et ta capacité à voir au-delà des horizons. Tu voles plus haut que quiconque.",
        traits: ["liberté", "sagesse", "force"]
    },
    {
        name: "Lièvre",
        emoji: "🐇",
        description: "Vif et intuitif, le lièvre reflète ta sensibilité et ta rapidité d'esprit. Tu perçois la magie dans l'ordinaire.",
        traits: ["calme", "mystère", "adaptabilité"]
    },
    {
        name: "Lynx",
        emoji: "🐱",
        description: "Discret et perçant, le lynx symbolise ta capacité à voir les vérités cachées. Tu es un gardien silencieux doté d'une intuition redoutable.",
        traits: ["mystère", "indépendance", "sagesse"]
    },
    {
        name: "Dragon",
        emoji: "🐉",
        description: "Puissant et rare, le dragon représente une force intérieure exceptionnelle. Tu portes en toi un feu que rien ne peut dompter.",
        traits: ["force", "courage", "énergie"]
    },
    {
        name: "Cygne",
        emoji: "🦢",
        description: "Gracieux et déterminé, le cygne cache une force immense sous son élégance. Ta beauté intérieure est ton arme la plus puissante.",
        traits: ["calme", "sagesse", "loyauté"]
    }
];

// ========================
// VARIABLES GLOBALES
// ========================

let currentQuestion = 0;
let collectedTraits = [];
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// ========================
// ÉLÉMENTS DOM
// ========================

const screenIntro = document.getElementById('screen-intro');
const screenQuestion = document.getElementById('screen-question');
const screenLoading = document.getElementById('screen-loading');
const screenResult = document.getElementById('screen-result');
const btnRestart = document.getElementById('btn-restart');
const choicesContainer = document.getElementById('choices');
const questionCounter = document.getElementById('question-counter');
const patronusEmoji = document.getElementById('patronus-emoji');
const patronusName = document.getElementById('patronus-name');
const patronusDescription = document.getElementById('patronus-description');
const firefliesContainer = document.getElementById('fireflies');
const swipeArea = document.getElementById('swipe-area');

function createFireflies() {
    const firefliesContainer = document.querySelector('.fireflies');

    const TOTAL = 50;
    const BASE_COLOR = {r: 72, g: 244, b: 214};

    function spawnFirefly() {
        const firefly = document.createElement('div');
        firefly.classList.add('firefly');

        // ================================
        // APPARITION : moitié basse (50% - 100%)
        // ================================
        const startX = Math.random() * 100;
        const startY = 55 + Math.random() * 45; // Entre 55% et 100%
        firefly.style.left = startX + '%';
        firefly.style.top = startY + '%';

        // ================================
        // TRAJECTOIRE VERS LE HAUT
        // Dérive horizontale aléatoire + montée
        // ================================
        // Montée : entre 30% et 70% de la hauteur écran
        const riseDistance = 30 + Math.random() * 40;

        // Dérive horizontale : zigzag aléatoire
        const driftX1 = (Math.random() * 2 - 1) * 80;   // -80px à +80px
        const driftX2 = (Math.random() * 2 - 1) * 120;  // -120px à +120px
        const driftX3 = (Math.random() * 2 - 1) * 60;   // -60px à +60px

        // Points intermédiaires de montée (pas linéaire)
        const riseStep1 = riseDistance * 0.3 + Math.random() * riseDistance * 0.1;
        const riseStep2 = riseDistance * 0.6 + Math.random() * riseDistance * 0.1;

        firefly.style.setProperty('--rise-total', riseDistance + 'vh');
        firefly.style.setProperty('--drift-x1', driftX1 + 'px');
        firefly.style.setProperty('--drift-x2', driftX2 + 'px');
        firefly.style.setProperty('--drift-x3', driftX3 + 'px');
        firefly.style.setProperty('--rise-step1', riseStep1 + 'vh');
        firefly.style.setProperty('--rise-step2', riseStep2 + 'vh');

        // ================================
        // TAILLE & LUMINOSITÉ
        // ================================
        const coreSize = 0.3 + Math.random() * 0.7;
        firefly.style.setProperty('--core-size', coreSize + 'px');

        const colorShift = Math.random() * 40 - 20;
        const r = Math.min(255, Math.max(0, BASE_COLOR.r + colorShift));
        const g = Math.min(255, Math.max(0, BASE_COLOR.g + colorShift));
        const b = Math.min(255, Math.max(0, BASE_COLOR.b - colorShift * 0.5));
        firefly.style.setProperty('--color-r', Math.round(r));
        firefly.style.setProperty('--color-g', Math.round(g));
        firefly.style.setProperty('--color-b', Math.round(b));

        firefly.style.setProperty('--glow-sm', (coreSize * 3) + 'px');
        firefly.style.setProperty('--glow-sm-spread', (coreSize * 1.5) + 'px');
        firefly.style.setProperty('--glow-md', (coreSize * 8) + 'px');
        firefly.style.setProperty('--glow-md-spread', (coreSize * 3) + 'px');
        firefly.style.setProperty('--glow-lg', (coreSize * 20) + 'px');
        firefly.style.setProperty('--glow-lg-spread', (coreSize * 10) + 'px');
        firefly.style.setProperty('--halo-size', (coreSize * 35) + 'px');
        firefly.style.setProperty('--halo-opacity', 0.03 + Math.random() * 0.07);

        const maxOpacity = 0.4 + Math.random() * 0.5;
        firefly.style.setProperty('--max-opacity', maxOpacity);

        // ================================
        // VITESSE : aléatoire entre 8s et 30s
        // Lent = majestueux, rapide = énergique
        // ================================
        const duration = 25 + Math.random() * 35;
        firefly.style.animationDuration = duration + 's';

        // Délai initial échelonné
        const delay = Math.random() * 10;
        firefly.style.animationDelay = delay + 's';

        firefliesContainer.appendChild(firefly);

        // ================================
        // RECYCLAGE : quand l'animation finit,
        // on supprime et on en recrée une nouvelle
        // ================================
        setTimeout(() => {
            firefly.remove();
            spawnFirefly(); // Nouvelle luciole depuis le bas
        }, (duration + delay) * 1000);
    }

    // Lancer toutes les lucioles
    for (let i = 0; i < TOTAL; i++) {
        spawnFirefly();
    }
}

// ================================
// TRAÎNÉE DE PARTICULES (CURSOR TRAIL)
// ================================
const trailCanvas = document.createElement('canvas');
trailCanvas.id = 'cursorTrail';
trailCanvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
`;
document.body.appendChild(trailCanvas);

const ctx = trailCanvas.getContext('2d');
let trailParticles = [];
let mouse = { x: -100, y: -100 };
let lastMouse = { x: -100, y: -100 };
let isMoving = false;
let moveTimeout;

function resizeCanvas() {
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Constantes anti-lag
const MAX_TRAIL_PARTICLES = 5000;
let lastTrailTime = 0;
const TRAIL_THROTTLE = 16; // ms (~60fps max)

// Suivi souris
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    isMoving = true;
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => { isMoving = false; }, 100);

    // Throttle : limite les appels
    const now = performance.now();
    if (now - lastTrailTime < TRAIL_THROTTLE) return;
    lastTrailTime = now;

    // Créer des particules de traînée
    spawnTrailParticles(e.clientX, e.clientY);

    // Repousser les lucioles
    repelFireflies(e.clientX, e.clientY);
});

// ================================
// PARTICULES DE TRAÎNÉE
// ================================

function spawnTrailParticles(x, y) {

    if (trailParticles.length > MAX_TRAIL_PARTICLES) return;

    const dx = x - lastMouse.x;
    const dy = y - lastMouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1) return;

    const steps = Math.max(1, Math.floor(dist / 5)); // Taux d'interpolation reduir pour plus d'apparitions

    for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const ix = lastMouse.x + dx * t;
        const iy = lastMouse.y + dy * t;

        const count = Math.max(5, Math.min(Math.floor(dist / steps / 1), 15)); // Nombre de particules, min diviseur max

        for (let i = 0; i < count; i++) {
            // Angle aléatoire pour s'écarter dans toutes les directions
            const angle = Math.random() * Math.PI * 2;
            // Vitesse d'éjection (s'écarte vite au départ)
            const speed = 3 + Math.random() * 4;

            trailParticles.push({
                x: ix + (Math.random() - 0.5) * 40, // Concentration du trail autour de la souris 
                y: iy + (Math.random() - 0.5) * 40, // Concentration du trail autour de la souris
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.01 + Math.random() * 0.25,  // Durée de vie (plus grand = meurt plus vite)
                size: Math.random() * 1 + 0.4, // La taille des particules du trail
                opacity: Math.random() * 0.8 + 0.2,
                hue: 165 + Math.random() * 20,
                saturation: 70 + Math.random() * 20,
                lightness: 60 + Math.random() * 20,

                // Phase : "expand" → s'écarte, puis "return" → revient
                phase: "expand",
                expandTime: 0,
                expandDuration: 3 + Math.random() * 5  // Frames avant de revenir
            });
        }
    }

    lastMouse.x = x;
    lastMouse.y = y;
}


// ================================
// ANIMATION DE LA TRAÎNÉE
// ================================
function animateTrail() {
    ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];

        p.expandTime++;

        if (p.phase === "expand") {
            // Phase 1 : s'écarter — ralentir progressivement
            p.vx *= 0.9;
            p.vy *= 0.9;

            // Quand le temps est écoulé, passer en phase retour
            if (p.expandTime >= p.expandDuration) {
                p.phase = "return";
            }

        } else {
            // Phase 2 : revenir vers la position actuelle de la souris
            const dxMouse = lastMouse.x - p.x;
            const dyMouse = lastMouse.y - p.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse > 1) {
                // Attraction vers la souris (de plus en plus forte)
                const attraction = 0.5 + (1 - p.life) * 0.60;
                p.vx += (dxMouse / distMouse) * attraction;
                p.vy += (dyMouse / distMouse) * attraction;
            }

            // Friction pour lisser le mouvement
            p.vx *= 0.95;
            p.vy *= 0.95;

            // Disparaître plus vite en phase retour quand proche de la souris
            if (distMouse < 20) {
                p.decay *= 1.5;
            }
        }

        // Appliquer le mouvement
        p.x += p.vx;
        p.y += p.vy;

        // Réduire la vie
        p.life -= p.decay;

        // Supprimer si mort
        if (p.life <= 0) {
            trailParticles.splice(i, 1);
            continue;
        }
        
        // ---- Dessin ----
        const alpha = p.life * p.opacity;
        const progress = Math.pow(1 - p.life, 2);  // blanchissement Exposant 1 linéaire, 2 doux, 3 80%, 5 tardif
        
        const hue = 225;                                    // Bleu fixe
        const saturation = 80 * (1 - progress);             // 80% → 0% (désature vers blanc)
        const lightness = 60 + progress * 40;               // 60% → 100% (éclaircit vers blanc)
        
        // Petit halo doux
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Point central net
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${Math.min(lightness + 15, 100)}%, ${alpha})`;
        ctx.fill();
    }

    requestAnimationFrame(animateTrail);
}

animateTrail();


// ================================
// RÉPULSION DES LUCIOLES
// ================================
function initFireflyRepulsion() {
    const REPEL_RADIUS = 200;
    const REPEL_STRENGTH = 140;

    let mouseX = -9999;
    let mouseY = -9999;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouseX = -9999;
        mouseY = -9999;
    });

    function animateRepulsion() {
        const fireflies = document.querySelectorAll('.firefly');

        fireflies.forEach(f => {
            const rect = f.getBoundingClientRect();
            const fx = rect.left + rect.width / 2;
            const fy = rect.top + rect.height / 2;

            const dx = fx - mouseX;
            const dy = fy - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < REPEL_RADIUS && dist > 0) {
                const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
                const angle = Math.atan2(dy, dx);

                const targetX = Math.cos(angle) * force;
                const targetY = Math.sin(angle) * force;

                f.style.setProperty('--repel-x', targetX + 'px');
                f.style.setProperty('--repel-y', targetY + 'px');
            } else {
                const currentX = parseFloat(f.style.getPropertyValue('--repel-x')) || 0;
                const currentY = parseFloat(f.style.getPropertyValue('--repel-y')) || 0;

                f.style.setProperty('--repel-x', (currentX * 0.93) + 'px');
                f.style.setProperty('--repel-y', (currentY * 0.93) + 'px');
            }
        });

        requestAnimationFrame(animateRepulsion);
    }

    animateRepulsion();
}

// APPELER après createFireflies()
initFireflyRepulsion();

// ========================
// SWIPE / DRAG POUR COMMENCER
// ========================

swipeArea.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
});

swipeArea.addEventListener('mousemove', (e) => {
    if (isDragging) {
        createTrailDot(e.clientX, e.clientY);
    }
});

swipeArea.addEventListener('mouseup', (e) => {
    if (isDragging) {
        isDragging = false;
        const dist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
        if (dist > 50) {
            startQuiz();
        }
    }
});

// Touch support
swipeArea.addEventListener('touchstart', (e) => {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
});

swipeArea.addEventListener('touchmove', (e) => {
    if (isDragging) {
        createTrailDot(e.touches[0].clientX, e.touches[0].clientY);
    }
});

swipeArea.addEventListener('touchend', (e) => {
    if (isDragging) {
        isDragging = false;
        const touch = e.changedTouches[0];
        const dist = Math.hypot(touch.clientX - dragStartX, touch.clientY - dragStartY);
        if (dist > 50) {
            startQuiz();
        }
    }
});

// ========================
// NAVIGATION
// ========================

function showScreen(screenToShow) {
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        currentScreen.classList.add('fade-out');
        setTimeout(() => {
            currentScreen.classList.remove('active', 'fade-out');
            screenToShow.classList.add('active', 'fade-in');
            setTimeout(() => {
                screenToShow.classList.remove('fade-in');
            }, 800);
        }, 500);
    } else {
        screenToShow.classList.add('active', 'fade-in');
    }
}

function startQuiz() {
    showScreen(screenQuestion);
    setTimeout(showQuestion, 600);
}

// ========================
// AFFICHER UNE QUESTION
// ========================

function showQuestion() {
    const question = questions[currentQuestion];
    questionCounter.textContent = '';

    choicesContainer.innerHTML = '';

    question.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.classList.add('choice-btn', 'appearing');
        btn.textContent = choice.text;

        btn.addEventListener('click', () => selectChoice(btn, choice));
        choicesContainer.appendChild(btn);

        // Animation d'apparition progressive
        setTimeout(() => {
            btn.classList.add('visible');
        }, 400 + index * 300);
    });
}

// ========================
// SÉLECTIONNER UN CHOIX
// ========================

function selectChoice(selectedBtn, choice) {
    const allBtns = choicesContainer.querySelectorAll('.choice-btn');
    allBtns.forEach(btn => {
        btn.disabled = true;
        if (btn !== selectedBtn) {
            btn.classList.add('fade-out');
        }
    });

    selectedBtn.classList.add('selected');
    collectedTraits.push(...choice.traits);

    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            // Transition douce entre questions
            allBtns.forEach(btn => btn.classList.add('fade-out'));
            setTimeout(() => {
                showQuestion();
            }, 500);
        } else {
            showLoadingScreen();
        }
    }, 900);
}

// ========================
// ÉCRAN DE CHARGEMENT
// ========================

function showLoadingScreen() {
    showScreen(screenLoading);
    setTimeout(() => {
        revealPatronus();
    }, 3500);
}

// ========================
// CALCUL DU PATRONUS
// ========================

function calculatePatronus() {
    const traitCount = {};
    collectedTraits.forEach(trait => {
        traitCount[trait] = (traitCount[trait] || 0) + 1;
    });

    let bestMatch = null;
    let bestScore = -1;

    patronusList.forEach(patronus => {
        let score = 0;
        patronus.traits.forEach(trait => {
            score += traitCount[trait] || 0;
        });
        score += Math.random() * 1.5;

        if (score > bestScore) {
            bestScore = score;
            bestMatch = patronus;
        }
    });

    return bestMatch;
}

// ========================
// RÉVÉLER LE PATRONUS
// ========================

function revealPatronus() {
    const patronus = calculatePatronus();

    patronusEmoji.textContent = patronus.emoji;
    patronusName.textContent = patronus.name.toUpperCase();
    patronusDescription.textContent = patronus.description;

    showScreen(screenResult);

    // Extra fireflies pour le résultat
    for (let i = 0; i < 10; i++) {
        const firefly = document.createElement('div');
        firefly.classList.add('firefly');
        firefly.style.left = (30 + Math.random() * 40) + '%';
        firefly.style.top = (30 + Math.random() * 40) + '%';
        const dx = (Math.random() - 0.5) * 100;
        const dy = (Math.random() - 0.5) * 100;
        firefly.style.setProperty('--dx', dx + 'px');
        firefly.style.setProperty('--dy', dy + 'px');
        firefly.style.setProperty('--dx2', (dx * 1.5) + 'px');
        firefly.style.setProperty('--dy2', (dy * 1.5) + 'px');
        firefly.style.animationDuration = (Math.random() * 4 + 3) + 's';
        firefly.style.animationDelay = (Math.random() * 1) + 's';
        firefliesContainer.appendChild(firefly);
    }
}

// ========================
// REDÉMARRAGE
// ========================

btnRestart.addEventListener('click', () => {
    currentQuestion = 0;
    collectedTraits = [];

    // Nettoyer les fireflies extra
    firefliesContainer.innerHTML = '';
    createFireflies();

    showScreen(screenIntro);
});

// ========================
// INIT
// ========================

createFireflies();
initFireflyRepulsion();