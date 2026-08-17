(() => {
  'use strict';

  const canvas = document.querySelector('#astroCanvas');
  const ctx = canvas.getContext('2d');
  const colorInput = document.querySelector('#lineColor');
  const resetButton = document.querySelector('#resetButton');
  const subjectSelect = document.querySelector('#subjectType');
  const primaryRuneSelect = document.querySelector('#primaryRune');
  const specSelect = document.querySelector('#specType');
  const specNameGroup = document.querySelector('#specNameGroup');
  const specNameInput = document.querySelector('#specNameInput');
  const denomInput = document.querySelector('#denomInput');

  // Canvas hors-écran réutilisable pour teinter les SVGs de la couleur du tracé
  const offscreenCanvas = document.createElement('canvas');
  const offscreenCtx = offscreenCanvas.getContext('2d');

  // Éléments Précision
  const precisionToggle = document.querySelector('#precisionToggle');
  const precisionGearBtn = document.querySelector('#precisionGearBtn');
  const precisionSubmenu = document.querySelector('#precisionSubmenu');
  const triSwitches = document.querySelectorAll('.tri-switch');

  // Éléments de précision (6 interrupteurs à 3 états)
  const precisionStates = ['center', 'center', 'center', 'center', 'center', 'center'];

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  let stars = [];
  let lineColor = colorInput.value;

  const view = { x: 0, y: 0, zoom: 1 };
  const TAU = Math.PI * 2;

  // Épaisseurs (Fin, Moyen, Épais)
  const THICK = { FINE: 2, MEDIUM: 4, THICK: 7 };

  // Correspondance entre les choix et l'index de l'axe
  const SUBJECT_AXES = {
    'concept': 0,    // Haut
    'lieu': 1,       // Haut-droite
    'energie': 2,    // Bas-droite
    'objet': 3,      // Bas
    'phenomene': 4,  // Bas-gauche
    'etre': 5        // Haut-gauche
  };

  // Chargement et mise en cache des SVGs (runes primaires et étoile polaire)
  const runeImages = {};
  const runeNames = [
    'mercure', 'venus', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune',
    'sirius', 'chaos', 'deimos', 'grand attracteur', 'phobos', 'pluton', 'soleil', 'polaire'
  ];

  runeNames.forEach(rune => {
    const img = new Image();
    img.src = `./ressources/Astronomie/${rune}.svg`;
    runeImages[rune] = img;
  });

  // Helper pour dessiner une image SVG teintée tout en préservant ses proportions
  function drawTintedImage(img, cx, cy, targetSize, angle = 0) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Calcul du ratio d'aspect pour éviter toute déformation
    const aspect = img.naturalWidth / img.naturalHeight;
    let w = targetSize;
    let h = targetSize;

    if (aspect > 1) {
      h = targetSize / aspect; // Plus large que haute
    } else {
      w = targetSize * aspect; // Plus haute que large
    }
    const pxW = Math.ceil(w);
    const pxH = Math.ceil(h);
    if (pxW <= 0 || pxH <= 0) return;

    offscreenCanvas.width = pxW;
    offscreenCanvas.height = pxH;
    offscreenCtx.clearRect(0, 0, pxW, pxH);
    offscreenCtx.globalCompositeOperation = 'source-over';
    offscreenCtx.drawImage(img, 0, 0, pxW, pxH);
    
    // Remplace la silhouette par la couleur sélectionnée (lineColor)
    offscreenCtx.globalCompositeOperation = 'source-in';
    offscreenCtx.fillStyle = lineColor;
    offscreenCtx.fillRect(0, 0, pxW, pxH);

    ctx.save();
    ctx.translate(cx, cy);
    if (angle !== 0) ctx.rotate(angle);
    ctx.drawImage(offscreenCanvas, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  specSelect.addEventListener('change', () => {
    if (specSelect.value === 'nom') {
      specNameGroup.classList.remove('hidden');
    } else {
      specNameGroup.classList.add('hidden');
    }
  });

  // Gestion de la Précision
  precisionToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      precisionGearBtn.classList.remove('hidden');
    } else {
      precisionGearBtn.classList.add('hidden');
      precisionSubmenu.classList.add('hidden');
    }
  });

  precisionGearBtn.addEventListener('click', () => {
    precisionSubmenu.classList.toggle('hidden');
  });

  // Gestion des interrupteurs à 3 positions
  triSwitches.forEach(sw => {
    sw.addEventListener('click', () => {
      const idx = parseInt(sw.getAttribute('data-index'), 10);
      const currState = sw.getAttribute('data-state');
      let nextState = 'center';

      if (currState === 'left') nextState = 'center';
      else if (currState === 'center') nextState = 'right';
      else if (currState === 'right') nextState = 'left';
      
      sw.setAttribute('data-state', nextState);
      precisionStates[idx] = nextState;
    });
  });

  function mulberry32(seed) {
    return () => {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // --- ÉTOILES AVEC CŒUR LUMINEUX ET BRILLANCE ---
  function makeStars() {
    const random = mulberry32(92837);
    const count = Math.max(200, Math.floor(W * H / 4000)); // Modifier / 4000 : Plus ce nombre est petit plus il y aura d'étoiles.
    stars = Array.from({ length: count }, () => ({
      x: random(),
      y: random(),
      r: 0.8 + random() * 1.6, // Le rayon définit la taille de base des étoiles. Augmenter ces valeurs rendra les étoiles physiquement plus grosses.
      a: 0.4 + random() * 0.6,
      glow: random() > 0.55,
      twinkleSpeed: 0.0015 + random() * 0.003,
      twinkle: random() * TAU
    }));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
  }

  function drawBackground(time) {
    const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    g.addColorStop(0, '#151336');
    g.addColorStop(0.5, '#0a081c');
    g.addColorStop(1, '#020207');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    
    ctx.save();
    stars.forEach(s => {
      const jitter = (Math.random() - 0.5) * 0.08; // 0.08 Gère le tremblement rapide. Augmenter cette valeur fait "sautiller" la lumière de manière plus nerveuse.
      const wave = Math.sin(time * s.twinkleSpeed + s.twinkle);
      const pulse = Math.min(1, Math.max(0.2, 0.75 + 0.25 * wave + jitter)); // valeur min de Math.max Empêche l'étoile de s'éteindre complètement. Si vous mettez 0, l'étoile peut devenir totalement invisible un bref instant en scintillant.
      const alpha = s.a * pulse;
      const sx = s.x * W;
      const sy = s.y * H;

      // 1. Halo extérieur lumineux pour l'effet de brillance
      if (s.glow) {
        ctx.shadowBlur = s.r * (4 + pulse * 4); // Contrôle l'étalement du flou lumineux autour de l'étoile. passez à (10 + pulse * 10), la lumière baignera beaucoup plus loin autour de l'étoile.
        ctx.shadowColor = `rgba(180, 220, 255, ${alpha * 0.8})`; // Plus il est proche de 1 (ou plus), plus le flou lumineux sera vif et opaque.
        //                   RGB Règlent la teinte du halo
        const auraRad = s.r * (2.2 + pulse * 0.8); // Ajuste le rayon du cercle dégradé transparent. Augmenter ce chiffre agrandit le disque de lumière diffuse.
        const auraGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, auraRad);
        auraGrad.addColorStop(0, `rgba(220, 240, 255, ${alpha * 0.5})`);
        auraGrad.addColorStop(0.5, `rgba(140, 180, 255, ${alpha * 0.2})`);
        auraGrad.addColorStop(1, 'rgba(100, 150, 255, 0)');

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, auraRad, 0, TAU);
        ctx.fill();
      } else {
        ctx.shadowBlur = 0;
      }

      // 2. Corps intermédiaire de l'étoile
      ctx.fillStyle = `rgba(210, 230, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, TAU);
      ctx.fill();

      // 3. Cœur ultra-lumineux (blanc pur brillant au centre)
      ctx.shadowBlur = s.r * 2;
      ctx.shadowColor = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.2)})`;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.3)})`; // alpha * 1.3 Ajuste l'intensité blanche du cœur.
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(0.5, s.r * 0.5), 0, TAU); // s.r * 0.5 Contrôle la taille du point blanc au centre. 
      ctx.fill();
    });
    ctx.restore();
  }

  function draw(time = 0) {
    drawBackground(time);

    const cx = W / 2 + view.x;
    const cy = H / 2 + view.y;
    const baseScale = (Math.min(W, H) / 900) * view.zoom;
    const rEarth = 32 * baseScale;
    
    // RAYONS DES DOUBLES CERCLES
    const rDouble1_In = 300 * baseScale;
    const rDouble1_Out = 320 * baseScale;
    const rDouble2_In = 400 * baseScale;
    const rDouble2_Out = 420 * baseScale;
    
    // TAILLE DES CERCLES DE DÉNOMBREMENT / PRÉCISION
    const rDenomCircle = 8 * baseScale;
    const distFromCenter = rEarth + 30 * baseScale;

    // ETOILE POLAIRE
    const polarY = cy - ((rDouble2_In + rDouble2_Out) / 2);
    const rPolarCircle = 28 * baseScale;

    const subjectVal = subjectSelect.value;
    const activeAxis = SUBJECT_AXES[subjectVal] !== undefined ? SUBJECT_AXES[subjectVal] : -1;
    const selectedRune = primaryRuneSelect.value;
    const spec = specSelect.value;
    const specName = specNameInput.value.trim();
    const denomVal = parseInt(denomInput.value, 10) || 0;

    ctx.strokeStyle = lineColor;
    ctx.fillStyle = lineColor;

    // 1. CERCLE TERRESTRE ET AXES HEXAGONAUX
    ctx.lineWidth = THICK.MEDIUM * baseScale;
    ctx.beginPath();
    ctx.arc(cx, cy, rEarth, 0, TAU);
    ctx.stroke();

    const hexPoints = [];
    const rHex = rDouble1_In;

    for (let i = 0; i < 6; i++) {
      const angle = i * (TAU / 6) - (Math.PI / 2);
      hexPoints.push({
        x: cx + rHex * Math.cos(angle),
        y: cy + rHex * Math.sin(angle)
      });
    }

    // TRAITS DES AXES DU MÊME RAYON QUE L'HEXAGONE
    ctx.lineWidth = THICK.FINE * baseScale;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(hexPoints[i].x, hexPoints[i].y);
      ctx.stroke();
    }

    // 2. DÉNOMBREMENT (3 CERCLES SUR L'AXE DU SUJET)
    if (activeAxis !== -1) {
      const axisAngle = activeAxis * (TAU / 6) - (Math.PI / 2);
      const angleOffset = Math.asin((rDenomCircle * 2) / distFromCenter);

      const mainCenterX = cx + distFromCenter * Math.cos(axisAngle);
      const mainCenterY = cy + distFromCenter * Math.sin(axisAngle);

      const angleLeft = axisAngle - angleOffset;
      const leftCenterX = cx + distFromCenter * Math.cos(angleLeft);
      const leftCenterY = cy + distFromCenter * Math.sin(angleLeft);

      const angleRight = axisAngle + angleOffset;
      const rightCenterX = cx + distFromCenter * Math.cos(angleRight);
      const rightCenterY = cy + distFromCenter * Math.sin(angleRight);

      const maskRadius = rDenomCircle;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(mainCenterX, mainCenterY, maskRadius, 0, TAU);
      ctx.arc(leftCenterX, leftCenterY, maskRadius, 0, TAU);
      ctx.arc(rightCenterX, rightCenterY, maskRadius, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(mainCenterX, mainCenterY, maskRadius, 0, TAU);
      ctx.arc(leftCenterX, leftCenterY, maskRadius, 0, TAU);
      ctx.arc(rightCenterX, rightCenterY, maskRadius, 0, TAU);
      ctx.clip();
      drawBackground(time);
      ctx.restore();

      const deltaAngle = Math.asin(rDenomCircle / distFromCenter);

      ctx.lineWidth = THICK.MEDIUM * baseScale;

      ctx.beginPath();
      ctx.arc(cx, cy, distFromCenter, angleLeft + deltaAngle, axisAngle - deltaAngle);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, distFromCenter, axisAngle + deltaAngle, angleRight - deltaAngle);
      ctx.stroke();

      ctx.lineWidth = THICK.FINE * baseScale;
      ctx.beginPath();
      ctx.arc(mainCenterX, mainCenterY, rDenomCircle, 0, TAU);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(leftCenterX, leftCenterY, rDenomCircle, 0, TAU);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(rightCenterX, rightCenterY, rDenomCircle, 0, TAU);
      ctx.stroke();

      // UNITES DE DENOMBREMENT (TRAITS)
      if (denomVal > 0) {
        const d = Math.floor(denomVal / 100);
        const c = Math.floor((denomVal % 100) / 10);
        const m = denomVal % 10;
        const totalMarks = d + c + m;

        if (totalMarks > 0) {
          const startClusterA = axisAngle - Math.PI / 12;
          const endClusterA = axisAngle + Math.PI / 12;
          const stepA = (endClusterA - startClusterA) / Math.max(1, totalMarks - 1);

          ctx.lineWidth = (THICK.FINE / 4) * baseScale;

          let posIndex = 0;

          const drawMarkAtPos = (idx, offsetRadius, markLen) => {
            const currentA = startClusterA + idx * stepA;
            const cosA = Math.cos(currentA);
            const sinA = Math.sin(currentA);

            const rCenter = distFromCenter + offsetRadius;
            const x1 = cx + (rCenter - markLen / 2) * cosA;
            const y1 = cy + (rCenter - markLen / 2) * sinA;
            const x2 = cx + (rCenter + markLen / 2) * cosA;
            const y2 = cy + (rCenter + markLen / 2) * sinA;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          };

          for (let k = 0; k < d; k++) drawMarkAtPos(posIndex++, 7 * baseScale, 5 * baseScale);
          for (let k = 0; k < c; k++) drawMarkAtPos(posIndex++, -7 * baseScale, 5 * baseScale);
          for (let k = 0; k < m; k++) drawMarkAtPos(posIndex++, 0, 9 * baseScale);
        }
      }
    }

    // 2.1 CERCLES DE PRÉCISION
    if (precisionToggle.checked && activeAxis !== -1) {
      const axisAngle = activeAxis * (TAU / 6) - (Math.PI / 2);
      
      const gap = 30 * baseScale; 
      const rRuneCircle = 36 * baseScale;
      const rDouble1_Mid = (rDouble1_In + rDouble1_Out) / 2;
      const firstCircleDist = distFromCenter + gap;
      const lastCircleDist  = (rDouble1_Mid - rRuneCircle) - gap;
      
      const stepDist = (lastCircleDist - firstCircleDist) / 5;

      const maskRadius = rDenomCircle;

      let leftCount = 0;
      let rightCount = 0;

      // Calcul des positions des cercles
      const circleInfos = [];
      for (let i = 0; i < 6; i++) {
        const pDist = firstCircleDist + i * stepDist;
        const state = precisionStates[i];

        let angleOffset = 0;
        if (state === 'left') {
          leftCount++;
          angleOffset = -leftCount * (30 * Math.PI / 180);
        } else if (state === 'right') {
          rightCount++;
          angleOffset = rightCount * (30 * Math.PI / 180);
        }

        const currAngle = axisAngle + angleOffset;
        const px = cx + pDist * Math.cos(currAngle);
        const py = cy + pDist * Math.sin(currAngle);

        circleInfos.push({ pDist, px, py, currAngle, state });
      }

      // Masquage UNIQUE pour les cercles situés sur l'axe (state === 'center')
      const centerCircles = circleInfos.filter(info => info.state === 'center');

      if (centerCircles.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        centerCircles.forEach(info => {
          ctx.moveTo(info.px + maskRadius, info.py);
          ctx.arc(info.px, info.py, maskRadius, 0, TAU);
        });
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        centerCircles.forEach(info => {
          ctx.moveTo(info.px + maskRadius, info.py);
          ctx.arc(info.px, info.py, maskRadius, 0, TAU);
        });
        ctx.clip();
        drawBackground(time);
        ctx.restore();
      }

      // Dessin des 6 cercles de précision
      circleInfos.forEach(info => {
        ctx.lineWidth = THICK.FINE * baseScale;
        ctx.beginPath();
        ctx.arc(info.px, info.py, rDenomCircle, 0, TAU);
        ctx.stroke();
      });
    }

    // CONTOUR DE L'HEXAGONE (Trait MOYEN)
    ctx.lineWidth = THICK.MEDIUM * baseScale;
    ctx.beginPath();
    ctx.moveTo(hexPoints[0].x, hexPoints[0].y);
    for (let i = 1; i < 6; i++) {
      ctx.lineTo(hexPoints[i].x, hexPoints[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    // 3. PREMIER GRAND DOUBLE CERCLE ET SPÉCIFICATION
    const oppositeAxis = activeAxis !== -1 ? (activeAxis + 3) % 6 : -1;
    const oppAngle = oppositeAxis !== -1 ? oppositeAxis * (TAU / 6) - (Math.PI / 2) : 0;

    // PROLONGEMENT DE L'AXE VERTICAL HAUT
    const isConceptActiveDouble = (oppositeAxis === 0);
    ctx.lineWidth = THICK.FINE * baseScale;
    if (activeAxis !== 0) {
      const yStartExtension = cy - rDouble1_In;
      const yEndExtension = polarY + rPolarCircle;

      const isSpecOnConcept = (oppositeAxis === 0 && spec !== 'none');

      if (isSpecOnConcept) {
        let rCutOut = 0;
        if (spec === 'nom') rCutOut = 58 * baseScale;
        else if (spec === 'echantillon') rCutOut = 56 * baseScale;

        const yCutBottom = yStartExtension - rCutOut;
        const yCutTop = yStartExtension - (rCutOut * 0.2);

        if (isConceptActiveDouble) {
          const offset = 4 * baseScale;
          ctx.beginPath();
          ctx.moveTo(cx + offset, yStartExtension);
          ctx.lineTo(cx + offset, yCutBottom);
          ctx.moveTo(cx + offset, yCutTop);
          ctx.lineTo(cx + offset, yEndExtension);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(cx, yStartExtension);
          ctx.lineTo(cx, yCutBottom);
          ctx.moveTo(cx, yCutTop);
          ctx.lineTo(cx, yEndExtension);
          ctx.stroke();
        }
      } else {
        if (isConceptActiveDouble) {
          const offset = 4 * baseScale;
          ctx.beginPath();
          ctx.moveTo(cx + offset, yStartExtension);
          ctx.lineTo(cx + offset, yEndExtension);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(cx, yStartExtension);
          ctx.lineTo(cx, yEndExtension);
          ctx.stroke();
        }
      }
    }

    // SI LE SUJET SÉLECTIONNÉ EST "CONCEPT" (OU OPPOSITE_AXIS === 0), DÉDOULER LES LIGNES
    if (isConceptActiveDouble) {
      const offset = 4 * baseScale;

      ctx.lineWidth = THICK.FINE * baseScale;

      ctx.beginPath();
      ctx.moveTo(cx - offset, cy);
      ctx.lineTo(hexPoints[0].x - offset, hexPoints[0].y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + offset, cy);
      ctx.lineTo(hexPoints[0].x + offset, hexPoints[0].y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - offset, cy);
      ctx.lineTo(hexPoints[3].x - offset, hexPoints[3].y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + offset, cy);
      ctx.lineTo(hexPoints[3].x + offset, hexPoints[3].y);
      ctx.stroke();
    }

    // 3.1 CERCLE DE RUNE PRIMAIRE (SUR L'AXE DU SUJET)
    if (activeAxis !== -1) {
      const axisAngle = activeAxis * (TAU / 6) - (Math.PI / 2);
      const rDouble1_Mid = (rDouble1_In + rDouble1_Out) / 2;
      const runeCenterX = cx + rDouble1_Mid * Math.cos(axisAngle);
      const runeCenterY = cy + rDouble1_Mid * Math.sin(axisAngle);
      const rRuneCircle = 36 * baseScale;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(runeCenterX, runeCenterY, rRuneCircle, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(runeCenterX, runeCenterY, rRuneCircle, 0, TAU);
      ctx.clip();
      drawBackground(time);
      ctx.restore();

      // Dessin du contour fin du cercle de rune primaire
      ctx.lineWidth = THICK.FINE * baseScale;
      ctx.beginPath();
      ctx.arc(runeCenterX, runeCenterY, rRuneCircle, 0, TAU);
      ctx.stroke();

      // Dessin de l'image SVG de la rune primaire (orientée et teintée avec lineColor)
      if (selectedRune !== 'none' && runeImages[selectedRune]) {
        const runeImg = runeImages[selectedRune];
        const runeSize = rRuneCircle * 1.35;
        drawTintedImage(runeImg, runeCenterX, runeCenterY, runeSize, axisAngle + Math.PI / 2);
      }
    }

    // 4. PREMIER DOUBLE CERCLE
    ctx.lineWidth = THICK.THICK * baseScale;
    ctx.beginPath();
    ctx.arc(cx, cy, rDouble1_In, 0, TAU);
    ctx.stroke();

    ctx.lineWidth = THICK.MEDIUM * baseScale;
    ctx.beginPath();
    ctx.arc(cx, cy, rDouble1_Out, 0, TAU);
    ctx.stroke();

    // 5. SPÉCIFICATION (SUR L'AXE OPPOSÉ À LA RUNE)
    if (spec === 'nom' && activeAxis !== -1) {
      const arcCenterX = cx + rDouble1_In * Math.cos(oppAngle);
      const arcCenterY = cy + rDouble1_In * Math.sin(oppAngle);

      const rSpecOut = 58 * baseScale;
      const rSpecIn = 36 * baseScale;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(arcCenterX, arcCenterY, rSpecOut, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(arcCenterX, arcCenterY, rSpecOut, 0, TAU);
      ctx.clip();
      drawBackground(time);
      ctx.restore();

      ctx.lineWidth = THICK.FINE * baseScale;
      ctx.beginPath();
      ctx.arc(arcCenterX, arcCenterY, rSpecIn, 0, TAU);
      ctx.stroke();

      const aStart = oppAngle + Math.PI * 0.75;
      const aEnd = oppAngle + Math.PI * 2.25;

      ctx.lineWidth = THICK.MEDIUM * baseScale;
      ctx.beginPath();
      ctx.arc(arcCenterX, arcCenterY, rSpecOut, aStart, aEnd);
      ctx.stroke();

      if (specName) {
        ctx.save();
        ctx.font = `600 ${Math.round(11 * baseScale)}px system-ui, sans-serif`;
        ctx.fillStyle = lineColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const rText = (rSpecOut + rSpecIn) / 2;
        const midAngle = oppAngle + Math.PI * 1.5;

        const textToDraw = specName.toUpperCase();
        const textLen = textToDraw.length;
        const margin = 0.15;
        const maxAvailableArc = (aEnd - aStart) - (margin * 2);
        const totalArc = Math.min(maxAvailableArc, textLen * 0.2);
        const startTextAngle = midAngle - totalArc / 2;
        const angleStep = textLen > 1 ? totalArc / (textLen - 1) : 0;

        for (let i = 0; i < textLen; i++) {
          const char = textToDraw[i];
          const charAngle = textLen === 1 ? midAngle : (startTextAngle + i * angleStep);
          const x = arcCenterX + rText * Math.cos(charAngle);
          const y = arcCenterY + rText * Math.sin(charAngle);

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(charAngle + Math.PI / 2);
          ctx.fillText(char, 0, 0);
          ctx.restore();
        }
        ctx.restore();
      }
    } else if (spec === 'echantillon' && activeAxis !== -1) {
      const centerSpecX = cx + rDouble1_In * Math.cos(oppAngle);
      const centerSpecY = cy + rDouble1_In * Math.sin(oppAngle);

      const rSpecOut = 56 * baseScale;
      const rSpecIn = 36 * baseScale;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(centerSpecX, centerSpecY, rSpecOut + 1 * baseScale, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerSpecX, centerSpecY, rSpecOut + 1 * baseScale, 0, TAU);
      ctx.clip();
      drawBackground(time);
      ctx.restore();

      ctx.lineWidth = THICK.MEDIUM * baseScale;
      ctx.beginPath();
      ctx.arc(centerSpecX, centerSpecY, rSpecOut, 0, TAU);
      ctx.stroke();

      ctx.lineWidth = THICK.FINE * baseScale;
      ctx.beginPath();
      ctx.arc(centerSpecX, centerSpecY, rSpecIn, 0, TAU);
      ctx.stroke();
    }

    // 6. SECOND GRAND DOUBLE CERCLE
    ctx.lineWidth = THICK.THICK * baseScale;
    ctx.beginPath();
    ctx.arc(cx, cy, rDouble2_In, 0, TAU);
    ctx.stroke();

    ctx.lineWidth = THICK.MEDIUM * baseScale;
    ctx.beginPath();
    ctx.arc(cx, cy, rDouble2_Out, 0, TAU);
    ctx.stroke();

    // 7. CERCLE ÉTOILE POLAIRE
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, polarY, rPolarCircle, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, polarY, rPolarCircle, 0, TAU);
    ctx.clip();
    drawBackground(time);
    ctx.restore();

    ctx.lineWidth = THICK.MEDIUM * baseScale;
    ctx.beginPath();
    ctx.arc(cx, polarY, rPolarCircle, 0, TAU);
    ctx.stroke();

    // Affichage de polaire.svg au centre du cercle polaire
    const polarImg = runeImages['polaire'];
    if (polarImg) {
      const polarSize = rPolarCircle * 1.35;
      drawTintedImage(polarImg, cx, polarY, polarSize);
    }

    requestAnimationFrame(draw);
  }

  // Interactivité / Déplacement & Zoom
  let dragging = false, lastX = 0, lastY = 0;

  canvas.addEventListener('pointerdown', e => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    view.x += e.clientX - lastX;
    view.y += e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.addEventListener('pointerup', () => dragging = false);

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    view.zoom = Math.max(0.4, Math.min(4, view.zoom * Math.exp(-e.deltaY * 0.001)));
  }, { passive: false });

  colorInput.addEventListener('input', e => lineColor = e.target.value);

  resetButton.addEventListener('click', () => {
    view.x = 0;
    view.y = 0;
    view.zoom = 1;
    colorInput.value = '#d8c996';
    lineColor = colorInput.value;
    subjectSelect.value = 'none';
    primaryRuneSelect.value = 'none';
    specSelect.value = 'none';
    specNameInput.value = '';
    denomInput.value = '0';
    specNameGroup.classList.add('hidden');

    // Réinitialisation Précision
    precisionToggle.checked = false;
    precisionGearBtn.classList.add('hidden');
    precisionSubmenu.classList.add('hidden');
    triSwitches.forEach((sw, idx) => {
      sw.setAttribute('data-state', 'center');
      precisionStates[idx] = 'center';
    });
  });

  window.addEventListener('resize', resize);

  resize();
  requestAnimationFrame(draw);
})();