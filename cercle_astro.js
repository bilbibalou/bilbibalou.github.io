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

  // Chargement et mise en cache des SVGs de Runes Primaires et de l'étoile Polaire
  const runeImages = {};
  const runeNames = ['mercure', 'venus', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune', 'sirius', 'chaos', 'deimos', 'grand attracteur', 'phobos', 'pluton', 'soleil'];

  runeNames.forEach(rune => {
    const img = new Image();
    img.src = `./ressources/Astronomie/${rune}.svg`;
    runeImages[rune] = img;
  });

  // Helper pour dessiner une image SVG teintée avec lineColor
  function drawTintedImage(img, cx, cy, size, angle = 0) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const pxSize = Math.ceil(size);
    if (pxSize <= 0) return;

    offscreenCanvas.width = pxSize;
    offscreenCanvas.height = pxSize;
    offscreenCtx.clearRect(0, 0, pxSize, pxSize);
    offscreenCtx.globalCompositeOperation = 'source-over';
    offscreenCtx.drawImage(img, 0, 0, pxSize, pxSize);
    
    // Remplace la silhouette par la couleur sélectionnée
    offscreenCtx.globalCompositeOperation = 'source-in';
    offscreenCtx.fillStyle = lineColor;
    offscreenCtx.fillRect(0, 0, pxSize, pxSize);

    ctx.save();
    ctx.translate(cx, cy);
    if (angle !== 0) ctx.rotate(angle);
    ctx.drawImage(offscreenCanvas, -size / 2, -size / 2, size, size);
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

  function makeStars() {
    const random = mulberry32(92837);
    const count = Math.max(200, Math.floor(W * H / 4000));
    stars = Array.from({ length: count }, () => ({
      x: random(),
      y: random(),
      r: 0.5 + random() * 1.5,
      a: 0.3 + random() * 0.7,
      glow: random() > 0.65,
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
<<<<<<< HEAD
<<<<<<< HEAD
      const pulse = 0.75 + 0.25 * Math.sin(time * 0.002 + s.twinkle);
=======
      const jitter = (Math.random() - 0.5) * 0.08; // 0.08 Gère le tremblement rapide. Augmenter cette valeur fait "sautiller" la lumière de manière plus nerveuse.
      const wave = Math.sin(time * s.twinkleSpeed + s.twinkle);
      const pulse = Math.min(1, Math.max(0.001, 0.75 + 0.25 * wave + jitter)); // valeur min de Math.max Empêche l'étoile de s'éteindre complètement. Si vous mettez 0, l'étoile peut devenir totalement invisible un bref instant en scintillant.
>>>>>>> parent of f9f7a27 (Revert "Update cercle_astro.js")
=======
      const pulse = 0.75 + 0.25 * Math.sin(time * 0.002 + s.twinkle);
>>>>>>> parent of c5016bc (fmzl)
      const alpha = s.a * pulse;
      if (s.glow) {
        ctx.shadowBlur = s.r * 6;
        ctx.shadowColor = `rgba(220, 230, 255, ${alpha})`;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = `rgba(240, 243, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, TAU);
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

    ctx.strokeStyle = lineColor;
    ctx.fillStyle = lineColor;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round';

    const selectedSubject = subjectSelect.value;
    const activeAxis = SUBJECT_AXES[selectedSubject] !== undefined ? SUBJECT_AXES[selectedSubject] : -1;
    const oppositeAxis = activeAxis !== -1 ? (activeAxis + 3) % 6 : -1;

    // Angle de l'axe opposé (ou haut par défaut)
    const oppAngle = oppositeAxis !== -1 
      ? oppositeAxis * (TAU / 6) - (Math.PI / 2)
      : -Math.PI / 2;

    const spec = specSelect.value;
    const denomVal = parseInt(denomInput.value, 10) || 0;
    const selectedRune = primaryRuneSelect.value;

    // 1. SYMBOLE DE LA TERRE AU CENTRE (Trait ÉPAIS)
    ctx.lineWidth = THICK.THICK * baseScale;
    ctx.beginPath();
    ctx.arc(cx, cy, rEarth, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - rEarth, cy);
    ctx.lineTo(cx + rEarth, cy);
    ctx.moveTo(cx, cy - rEarth);
    ctx.lineTo(cx, cy + rEarth);
    ctx.stroke();

    // 2. DESSIN DES 6 AXES (jusqu'au 1er grand double cercle)
    const hexPoints = [];

    for (let i = 0; i < 6; i++) {
      const angle = i * (TAU / 6) - (Math.PI / 2);
      const xHex = cx + rDouble1_In * Math.cos(angle);
      const yHex = cy + rDouble1_In * Math.sin(angle);
      hexPoints.push({ x: xHex, y: yHex });

      const xStart = cx + rEarth * Math.cos(angle);
      const yStart = cy + rEarth * Math.sin(angle);

      if (i === activeAxis && activeAxis !== -1) {
        ctx.lineWidth = THICK.THICK * baseScale;
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xHex, yHex);
        ctx.stroke();
      } else if (i === oppositeAxis && oppositeAxis !== -1) {
        ctx.lineWidth = THICK.FINE * baseScale;
        const offset = 4 * baseScale;
        const perpAngle = angle + Math.PI / 2;
        const dx = Math.cos(perpAngle) * offset;
        const dy = Math.sin(perpAngle) * offset;

        ctx.beginPath();
        ctx.moveTo(xStart + dx, yStart + dy);
        ctx.lineTo(xHex + dx, yHex + dy);
        ctx.moveTo(xStart - dx, yStart - dy);
        ctx.lineTo(xHex - dx, yHex - dy);
        ctx.stroke();
      } else {
        ctx.lineWidth = THICK.FINE * baseScale;
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xHex, yHex);
        ctx.stroke();
      }
    }

    // DÉNOMINATEUR (Tri-cercles & Chiffres)
    if (activeAxis !== -1 && denomVal > 0) {
      const axisAngle = activeAxis * (TAU / 6) - (Math.PI / 2);
      const mainCenterX = cx + distFromCenter * Math.cos(axisAngle);
      const mainCenterY = cy + distFromCenter * Math.sin(axisAngle);
      const maskRadius = rDenomCircle;

      if (denomVal <= 10) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(mainCenterX, mainCenterY, maskRadius, 0, TAU);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(mainCenterX, mainCenterY, maskRadius, 0, TAU);
        ctx.clip();
        drawBackground(time);
        ctx.restore();

        const xSegmentStart = cx + (distFromCenter - rDenomCircle) * Math.cos(axisAngle);
        const ySegmentStart = cy + (distFromCenter - rDenomCircle) * Math.sin(axisAngle);
        const xSegmentEnd = cx + (distFromCenter + rDenomCircle) * Math.cos(axisAngle);
        const ySegmentEnd = cy + (distFromCenter + rDenomCircle) * Math.sin(axisAngle);

        ctx.lineWidth = THICK.FINE * baseScale;
        ctx.beginPath();
        ctx.moveTo(xSegmentStart, ySegmentStart);
        ctx.lineTo(xSegmentEnd, ySegmentEnd);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mainCenterX, mainCenterY, rDenomCircle, 0, TAU);
        ctx.stroke();
      } else {
        const offsetAngle = 50 * (Math.PI / 180);
        const angleLeft = axisAngle - offsetAngle;
        const angleRight = axisAngle + offsetAngle;

        const leftCenterX = cx + distFromCenter * Math.cos(angleLeft);
        const leftCenterY = cy + distFromCenter * Math.sin(angleLeft);

        const rightCenterX = cx + distFromCenter * Math.cos(angleRight);
        const rightCenterY = cy + distFromCenter * Math.sin(angleRight);

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

        const u = denomVal % 10;
        const d = Math.floor(denomVal / 10) % 10;
        const c = Math.floor(denomVal / 100) % 10;
        const m = Math.floor(denomVal / 1000) % 10;

        if (u > 0) {
          const startA = angleLeft + deltaAngle;
          const endA = axisAngle - deltaAngle;
          const arcSpan = endA - startA;
          const midA = (startA + endA) / 2;

          const rDotPos = distFromCenter + 5.5 * baseScale;
          const dotRadius = 1.0 * baseScale;

          const stepA = (arcSpan * 0.7) / 8;
          const startClusterA = midA - ((u - 1) * stepA) / 2;

          for (let k = 0; k < u; k++) {
            const currentA = startClusterA + k * stepA;
            const px = cx + rDotPos * Math.cos(currentA);
            const py = cy + rDotPos * Math.sin(currentA);
            ctx.beginPath();
            ctx.arc(px, py, dotRadius, 0, TAU);
            ctx.fill();
          }
        }

        const totalMarks = d + c + m;
        if (totalMarks > 0) {
          const startA = axisAngle + deltaAngle;
          const endA = angleRight - deltaAngle;
          const arcSpan = endA - startA;
          const midA = (startA + endA) / 2;

          const stepA = (arcSpan * 0.2625) / 8;
          const startClusterA = midA - ((totalMarks - 1) * stepA) / 2;

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

        // Restauration du fond étoilé sous les cercles de l'axe
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

      // ARCS DE CERCLE EN TRAIT MOYEN RELIANT LES CERCLES DÉCALÉS À L'AXE DU TYPE
      ctx.lineWidth = THICK.MEDIUM * baseScale;
      circleInfos.forEach(info => {
        if (info.state !== 'center') {
          const circleAngularOffset = Math.asin(rDenomCircle / info.pDist);
          let startA, endA;
          if (info.currAngle < axisAngle) {
            startA = info.currAngle + circleAngularOffset;
            endA = axisAngle;
          } else {
            startA = axisAngle;
            endA = info.currAngle - circleAngularOffset;
          }

          if (startA < endA) {
            ctx.beginPath();
            ctx.arc(cx, cy, info.pDist, startA, endA);
            ctx.stroke();
          }
        }
      });

      // Tracé uniquement des contours fins des cercles de précision
      ctx.lineWidth = THICK.FINE * baseScale;
      circleInfos.forEach(info => {
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

          ctx.moveTo(cx - offset, yStartExtension);
          ctx.lineTo(cx - offset, yCutBottom);
          ctx.moveTo(cx - offset, yCutTop);
          ctx.lineTo(cx - offset, yEndExtension);
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
          ctx.moveTo(cx - offset, yStartExtension);
          ctx.lineTo(cx - offset, yEndExtension);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(cx, yStartExtension);
          ctx.lineTo(cx, yEndExtension);
          ctx.stroke();
        }
      }
    }

    // 3. PREMIER GRAND DOUBLE CERCLE
    ctx.lineWidth = THICK.THICK * baseScale;
    ctx.beginPath();
    ctx.arc(cx, cy, rDouble1_In, 0, TAU);
    ctx.stroke();

    ctx.lineWidth = THICK.MEDIUM * baseScale;
    ctx.beginPath();
    ctx.arc(cx, cy, rDouble1_Out, 0, TAU);
    ctx.stroke();

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

      const rConnStart = rDouble1_Mid + rRuneCircle;
      const rConnEnd = rDouble2_In;
      const xConn1 = cx + rConnStart * Math.cos(axisAngle);
      const yConn1 = cy + rConnStart * Math.sin(axisAngle);
      const xConn2 = cx + rConnEnd * Math.cos(axisAngle);
      const yConn2 = cy + rConnEnd * Math.sin(axisAngle);

      ctx.lineWidth = THICK.MEDIUM * baseScale;
      ctx.beginPath();
      ctx.moveTo(xConn1, yConn1);
      ctx.lineTo(xConn2, yConn2);
      ctx.stroke();

      if (activeAxis === 0) {
        ctx.lineWidth = THICK.FINE * baseScale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - rDouble2_Out);
        ctx.lineTo(cx, polarY + rPolarCircle);
        ctx.stroke();
      }
    }

    // 5. TRACÉ DES SPÉCIFICATIONS
    if (spec === 'nom') {
      const arcCenterX = cx + rDouble1_In * Math.cos(oppAngle);
      const arcCenterY = cy + rDouble1_In * Math.sin(oppAngle);

      const rArcInner = 30 * baseScale;
      const rArcOuter = 58 * baseScale;

      const aStart = oppAngle + Math.PI - 1.42;
      const aEnd   = oppAngle + Math.PI + 1.42;

      const pathSector = new Path2D();
      pathSector.moveTo(arcCenterX, arcCenterY);
      pathSector.arc(arcCenterX, arcCenterY, rArcOuter + 2 * baseScale, aStart, aEnd, false);
      pathSector.closePath();

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill(pathSector);
      ctx.restore();

      ctx.save();
      ctx.clip(pathSector);
      drawBackground(time);
      ctx.restore();

      ctx.lineWidth = THICK.FINE * baseScale;
      ctx.beginPath();
      ctx.arc(arcCenterX, arcCenterY, rArcInner, aStart, aEnd);
      ctx.stroke();

      ctx.lineWidth = THICK.MEDIUM * baseScale;
      ctx.beginPath();
      ctx.arc(arcCenterX, arcCenterY, rArcOuter, aStart, aEnd);
      ctx.stroke();

      ctx.lineWidth = THICK.FINE * baseScale;
      ctx.beginPath();
      ctx.moveTo(arcCenterX + rArcInner * Math.cos(aStart), arcCenterY + rArcInner * Math.sin(aStart));
      ctx.lineTo(arcCenterX + rArcOuter * Math.cos(aStart), arcCenterY + rArcOuter * Math.sin(aStart));
      ctx.moveTo(arcCenterX + rArcInner * Math.cos(aEnd), arcCenterY + rArcInner * Math.sin(aEnd));
      ctx.lineTo(arcCenterX + rArcOuter * Math.cos(aEnd), arcCenterY + rArcOuter * Math.sin(aEnd));
      ctx.stroke();

      const textToDraw = specNameInput.value.trim();
      if (textToDraw) {
        const rText = (rArcInner + rArcOuter) / 2;
        const midAngle = (aStart + aEnd) / 2;

        ctx.save();
        ctx.fillStyle = lineColor;
        ctx.font = `bold ${Math.round(16 * baseScale)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

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
    } else if (spec === 'echantillon') {
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

    // 7. CERCLE ÉTOILE POLAIRE (Chargement de l'image polaire.svg)
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