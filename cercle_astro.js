(() => {
  'use strict';

  const canvas = document.querySelector('#astroCanvas');
  const ctx = canvas.getContext('2d');
  const colorInput = document.querySelector('#lineColor');
  const resetButton = document.querySelector('#resetButton');
  const downloadBtn = document.querySelector('#downloadBtn');
  const subjectSelect = document.querySelector('#subjectType');
  const primaryRuneSelect = document.querySelector('#primaryRune');
  const specSelect = document.querySelector('#specType');
  const specNameGroup = document.querySelector('#specNameGroup');
  const specNameInput = document.querySelector('#specNameInput');
  const denomInput = document.querySelector('#denomInput');

  // Éléments Audio
  const musicToggleBtn = document.querySelector('#musicToggleBtn');
  const musicVolumeInput = document.querySelector('#musicVolume');

  // --- AUDIO DE FOND EN BOUCLE ---
  const bgAudio = new Audio('./ressources/Astronomie/audio.wav');
  bgAudio.loop = true;
  bgAudio.volume = 0.5;

  let isMuted = false;
  let lastVolume = 0.5;

  function updateAudioUI() {
    if (!musicToggleBtn) return;
    const isPlaying = !bgAudio.paused && bgAudio.volume > 0 && !bgAudio.muted;
    if (isPlaying) {
      musicToggleBtn.classList.remove('paused');
    } else {
      musicToggleBtn.classList.add('paused');
    }
  }

  function tryPlayAudio() {
    if (isMuted) return;
    bgAudio.volume = lastVolume > 0 ? lastVolume : 0.5;
    bgAudio.muted = false;
    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        updateAudioUI();
        removeUnlockListeners();
      }).catch(() => {
        updateAudioUI();
      });
    }
  }

  const unlockEvents = ['pointerdown', 'click', 'touchstart', 'keydown', 'wheel'];
  function unlockAudio() {
    tryPlayAudio();
  }
  function addUnlockListeners() {
    unlockEvents.forEach(evt => window.addEventListener(evt, unlockAudio, { passive: true }));
  }
  function removeUnlockListeners() {
    unlockEvents.forEach(evt => window.removeEventListener(evt, unlockAudio));
  }

  addUnlockListeners();
  tryPlayAudio();

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (bgAudio.paused || isMuted || bgAudio.volume === 0) {
        isMuted = false;
        bgAudio.muted = false;
        bgAudio.volume = lastVolume > 0 ? lastVolume : 0.5;
        if (musicVolumeInput) musicVolumeInput.value = bgAudio.volume;
        bgAudio.play().then(() => updateAudioUI()).catch(() => {});
      } else {
        isMuted = true;
        lastVolume = bgAudio.volume > 0 ? bgAudio.volume : 0.5;
        bgAudio.pause();
        if (musicVolumeInput) musicVolumeInput.value = 0;
        updateAudioUI();
      }
    });
  }

  if (musicVolumeInput) {
    musicVolumeInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      bgAudio.volume = val;
      if (val === 0) {
        isMuted = true;
        bgAudio.pause();
      } else {
        isMuted = false;
        bgAudio.muted = false;
        lastVolume = val;
        if (bgAudio.paused) {
          bgAudio.play().catch(() => {});
        }
      }
      updateAudioUI();
    });
  }

  // Canvas hors-écran réutilisable et performant pour teinter les SVGs
  const offscreenCanvas = document.createElement('canvas');
  const offscreenCtx = offscreenCanvas.getContext('2d');

  // Éléments Précision
  const precisionToggle = document.querySelector('#precisionToggle');
  const precisionGearBtn = document.querySelector('#precisionGearBtn');
  const precisionSubmenu = document.querySelector('#precisionSubmenu');
  const triSwitches = document.querySelectorAll('.tri-switch');

  const SUBJECT_PRECISION_MAP = {
    'concept':    [1, 4],
    'energie':    [1, 3, 4],
    'lieu':       [1, 3, 4, 5],
    'phenomene':  [0, 1, 3, 4],
    'objet':      [0, 1, 2, 3, 4, 5],
    'etre':       [0, 1, 2, 3, 4, 5]
  };

  const precisionStates = ['center', 'center', 'center', 'center', 'center', 'center'];

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  let stars = [];
  let lineColor = colorInput.value;

  const view = { x: 0, y: 0, zoom: 1 };
  const TAU = Math.PI * 2;

  const THICK = { FINE: 2, MEDIUM: 4, THICK: 7 };

  const SUBJECT_AXES = {
    'concept': 0,
    'lieu': 1,
    'energie': 2,
    'objet': 3,
    'phenomene': 4,
    'etre': 5
  };

  // Chargement direct des SVGs
  const runeImages = {};
  const runeNames = ['mercure', 'venus', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune', 'sirius', 'chaos', 'deimos', 'grand attracteur', 'phobos', 'pluton', 'soleil', 'polaire'];

  runeNames.forEach(rune => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `./ressources/Astronomie/${rune}.svg`;
    runeImages[rune] = img;
  });

  function drawTintedImage(img, cx, cy, maxSize, angle = 0, targetCtx = ctx) {
    if (!img || !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return;

    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW = maxSize;
    let drawH = maxSize;

    if (aspect > 1) {
      drawH = maxSize / aspect;
    } else {
      drawW = maxSize * aspect;
    }

    const pxW = Math.ceil(drawW);
    const pxH = Math.ceil(drawH);
    if (pxW <= 0 || pxH <= 0) return;

    offscreenCanvas.width = pxW;
    offscreenCanvas.height = pxH;
    offscreenCtx.clearRect(0, 0, pxW, pxH);
    offscreenCtx.globalCompositeOperation = 'source-over';
    offscreenCtx.drawImage(img, 0, 0, pxW, pxH);
    
    offscreenCtx.globalCompositeOperation = 'source-in';
    offscreenCtx.fillStyle = lineColor;
    offscreenCtx.fillRect(0, 0, pxW, pxH);

    targetCtx.save();
    targetCtx.translate(cx, cy);
    if (angle !== 0) targetCtx.rotate(angle);
    targetCtx.drawImage(offscreenCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
    targetCtx.restore();
  }

  function getActiveIndices() {
    return SUBJECT_PRECISION_MAP[subjectSelect.value] || [0, 1, 2, 3, 4, 5];
  }

  function updatePrecisionSwitches() {
    const allowed = getActiveIndices();

    triSwitches.forEach((sw) => {
      const idx = parseInt(sw.getAttribute('data-index'), 10);
      const row = sw.closest('.precision-item') || sw;
      if (allowed.includes(idx)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  specSelect.addEventListener('change', () => {
    if (specSelect.value === 'nom') {
      specNameGroup.classList.remove('hidden');
    } else {
      specNameGroup.classList.add('hidden');
    }
  });

  subjectSelect.addEventListener('change', () => {
    updatePrecisionSwitches();
  });

  precisionToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      precisionGearBtn.classList.remove('hidden');
      updatePrecisionSwitches();
    } else {
      precisionGearBtn.classList.add('hidden');
      precisionSubmenu.classList.add('hidden');
    }
  });

  precisionGearBtn.addEventListener('click', () => {
    precisionSubmenu.classList.toggle('hidden');
  });

  triSwitches.forEach(sw => {
    sw.addEventListener('click', () => {
      const idx = parseInt(sw.getAttribute('data-index'), 10);
      const currState = sw.getAttribute('data-state') || 'center';
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
    const count = 400;
    
    stars = Array.from({ length: count }, () => {
      return {
        x: random(),
        y: random(),
        r: 0.5 + random() * 1.5,
        twinkle: random() * TAU,
        speed: 0.0003 + random() * 0.0012,
        sparklePow: 1.2 + random() * 4.0,
        minAlpha: 0.03 + random() * 0.10,
        maxAlpha: 0.90 + random() * 0.10
      };
    });
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

  function drawBackground(time, targetCtx = ctx, targetW = W, targetH = H) {
    const g = targetCtx.createRadialGradient(targetW * 0.5, targetH * 0.5, 0, targetW * 0.5, targetH * 0.5, Math.max(targetW, targetH) * 0.8);
    g.addColorStop(0, '#151336');
    g.addColorStop(0.5, '#0a081c');
    g.addColorStop(1, '#020207');
    targetCtx.fillStyle = g;
    targetCtx.fillRect(0, 0, targetW, targetH);
    
    targetCtx.save();
    const starScale = Math.min(targetW, targetH) / 1080;
    stars.forEach(s => {
      const wave = (Math.sin(time * s.speed + s.twinkle) + 1) / 2;
      const factor = Math.pow(wave, s.sparklePow);
      const alpha = s.minAlpha + (s.maxAlpha - s.minAlpha) * factor;

      targetCtx.shadowBlur = (4 + factor * 2) * starScale;
      targetCtx.shadowColor = `rgba(255, 255, 255, ${alpha})`;
      targetCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      targetCtx.beginPath();
      targetCtx.arc(s.x * targetW, s.y * targetH, s.r * starScale, 0, TAU);
      targetCtx.fill();
    });
    targetCtx.restore();
  }

  function renderScene(targetCtx, targetW, targetH, baseScale, cx, cy, time, withBackground = true) {
    if (withBackground) {
      drawBackground(time, targetCtx, targetW, targetH);
    } else {
      targetCtx.clearRect(0, 0, targetW, targetH);
    }

    const rEarth = 32 * baseScale;
    const rDouble1_In = 300 * baseScale;
    const rDouble1_Out = 320 * baseScale;
    const rDouble2_In = 460 * baseScale;
    const rDouble2_Out = 480 * baseScale;
    
    const rDenomCircle = 8 * baseScale;
    const distFromCenter = rEarth + 30 * baseScale;

    const polarY = cy - ((rDouble2_In + rDouble2_Out) / 2);
    const rPolarCircle = 28 * baseScale;

    targetCtx.strokeStyle = lineColor;
    targetCtx.fillStyle = lineColor;
    targetCtx.lineCap = 'butt';
    targetCtx.lineJoin = 'round';

    const selectedSubject = subjectSelect.value;
    const activeAxis = SUBJECT_AXES[selectedSubject] !== undefined ? SUBJECT_AXES[selectedSubject] : -1;
    const oppositeAxis = activeAxis !== -1 ? (activeAxis + 3) % 6 : -1;

    const oppAngle = oppositeAxis !== -1 
      ? oppositeAxis * (TAU / 6) - (Math.PI / 2)
      : -Math.PI / 2;

    const spec = specSelect.value;
    const denomVal = parseInt(denomInput.value, 10) || 0;
    const selectedRune = primaryRuneSelect.value;

    // 1. SYMBOLE DE LA TERRE AU CENTRE
    targetCtx.lineWidth = THICK.THICK * baseScale;
    targetCtx.beginPath();
    targetCtx.arc(cx, cy, rEarth, 0, TAU);
    targetCtx.stroke();
    targetCtx.beginPath();
    targetCtx.moveTo(cx - rEarth, cy);
    targetCtx.lineTo(cx + rEarth, cy);
    targetCtx.moveTo(cx, cy - rEarth);
    targetCtx.lineTo(cx, cy + rEarth);
    targetCtx.stroke();

    // 2. TRACÉ DES 6 AXES
    const hexPoints = [];

    for (let i = 0; i < 6; i++) {
      const angle = i * (TAU / 6) - (Math.PI / 2);
      const xHex = cx + rDouble1_In * Math.cos(angle);
      const yHex = cy + rDouble1_In * Math.sin(angle);
      hexPoints.push({ x: xHex, y: yHex });

      const xStart = cx + rEarth * Math.cos(angle);
      const yStart = cy + rEarth * Math.sin(angle);

      if (i === activeAxis && activeAxis !== -1) {
        targetCtx.lineWidth = THICK.THICK * baseScale;
        targetCtx.beginPath();
        targetCtx.moveTo(xStart, yStart);
        targetCtx.lineTo(xHex, yHex);
        targetCtx.stroke();
      } else if (i === oppositeAxis && oppositeAxis !== -1 && spec !== 'none') {
        targetCtx.lineWidth = THICK.FINE * baseScale;
        const offset = 4 * baseScale;
        const perpAngle = angle + Math.PI / 2;
        const dx = Math.cos(perpAngle) * offset;
        const dy = Math.sin(perpAngle) * offset;

        targetCtx.beginPath();
        targetCtx.moveTo(xStart + dx, yStart + dy);
        targetCtx.lineTo(xHex + dx, yHex + dy);
        targetCtx.moveTo(xStart - dx, yStart - dy);
        targetCtx.lineTo(xHex - dx, yHex - dy);
        targetCtx.stroke();
      } else {
        targetCtx.lineWidth = THICK.FINE * baseScale;
        targetCtx.beginPath();
        targetCtx.moveTo(xStart, yStart);
        targetCtx.lineTo(xHex, yHex);
        targetCtx.stroke();
      }
    }

    // 2.0 DÉNOMBREMENT
    if (activeAxis !== -1 && denomVal > 0) {
      const axisAngle = activeAxis * (TAU / 6) - (Math.PI / 2);
      const mainCenterX = cx + distFromCenter * Math.cos(axisAngle);
      const mainCenterY = cy + distFromCenter * Math.sin(axisAngle);
      const maskRadius = rDenomCircle;

      if (denomVal === 1) {
        targetCtx.save();
        targetCtx.globalCompositeOperation = 'destination-out';
        targetCtx.beginPath();
        targetCtx.arc(mainCenterX, mainCenterY, maskRadius, 0, TAU);
        targetCtx.fill();
        targetCtx.restore();

        if (withBackground) {
          targetCtx.save();
          targetCtx.beginPath();
          targetCtx.arc(mainCenterX, mainCenterY, maskRadius, 0, TAU);
          targetCtx.clip();
          drawBackground(time, targetCtx, targetW, targetH);
          targetCtx.restore();
        }

        const xSegmentStart = cx + (distFromCenter - rDenomCircle) * Math.cos(axisAngle);
        const ySegmentStart = cy + (distFromCenter - rDenomCircle) * Math.sin(axisAngle);
        const xSegmentEnd = cx + (distFromCenter + rDenomCircle) * Math.cos(axisAngle);
        const ySegmentEnd = cy + (distFromCenter + rDenomCircle) * Math.sin(axisAngle);

        targetCtx.strokeStyle = lineColor;
        targetCtx.lineWidth = THICK.FINE * baseScale;
        targetCtx.beginPath();
        targetCtx.moveTo(xSegmentStart, ySegmentStart);
        targetCtx.lineTo(xSegmentEnd, ySegmentEnd);
        targetCtx.stroke();

        targetCtx.beginPath();
        targetCtx.arc(mainCenterX, mainCenterY, rDenomCircle, 0, TAU);
        targetCtx.stroke();
      } else {
        const offsetAngle = 48 * (Math.PI / 180);
        const angleLeft = axisAngle - offsetAngle;
        const angleRight = axisAngle + offsetAngle;

        const leftCenterX = cx + distFromCenter * Math.cos(angleLeft);
        const leftCenterY = cy + distFromCenter * Math.sin(angleLeft);

        const rightCenterX = cx + distFromCenter * Math.cos(angleRight);
        const rightCenterY = cy + distFromCenter * Math.sin(angleRight);

        targetCtx.strokeStyle = lineColor;
        targetCtx.lineWidth = THICK.MEDIUM * baseScale;
        targetCtx.beginPath();
        targetCtx.arc(cx, cy, distFromCenter, angleLeft, axisAngle);
        targetCtx.stroke();

        targetCtx.beginPath();
        targetCtx.arc(cx, cy, distFromCenter, axisAngle, angleRight);
        targetCtx.stroke();

        targetCtx.save();
        targetCtx.globalCompositeOperation = 'destination-out';
        targetCtx.beginPath();
        targetCtx.moveTo(mainCenterX + maskRadius, mainCenterY);
        targetCtx.arc(mainCenterX, mainCenterY, maskRadius, 0, TAU);
        targetCtx.moveTo(leftCenterX + maskRadius, leftCenterY);
        targetCtx.arc(leftCenterX, leftCenterY, maskRadius, 0, TAU);
        targetCtx.moveTo(rightCenterX + maskRadius, rightCenterY);
        targetCtx.arc(rightCenterX, rightCenterY, maskRadius, 0, TAU);
        targetCtx.fill();
        targetCtx.restore();

        if (withBackground) {
          targetCtx.save();
          targetCtx.beginPath();
          targetCtx.moveTo(mainCenterX + maskRadius, mainCenterY);
          targetCtx.arc(mainCenterX, mainCenterY, maskRadius, 0, TAU);
          targetCtx.moveTo(leftCenterX + maskRadius, leftCenterY);
          targetCtx.arc(leftCenterX, leftCenterY, maskRadius, 0, TAU);
          targetCtx.moveTo(rightCenterX + maskRadius, rightCenterY);
          targetCtx.arc(rightCenterX, rightCenterY, maskRadius, 0, TAU);
          targetCtx.clip();
          drawBackground(time, targetCtx, targetW, targetH);
          targetCtx.restore();
        }

        targetCtx.strokeStyle = lineColor;
        targetCtx.lineWidth = THICK.FINE * baseScale;
        targetCtx.beginPath();
        targetCtx.arc(mainCenterX, mainCenterY, rDenomCircle, 0, TAU);
        targetCtx.stroke();

        targetCtx.beginPath();
        targetCtx.arc(leftCenterX, leftCenterY, rDenomCircle, 0, TAU);
        targetCtx.stroke();

        targetCtx.beginPath();
        targetCtx.arc(rightCenterX, rightCenterY, rDenomCircle, 0, TAU);
        targetCtx.stroke();

        const u = denomVal % 10;
        const d = Math.floor(denomVal / 10) % 10;
        const c = Math.floor(denomVal / 100) % 10;
        const m = Math.floor(denomVal / 1000) % 10;

        const deltaAngle = Math.asin(rDenomCircle / distFromCenter);

        if (u > 0) {
          const startA = angleLeft + deltaAngle;
          const endA = axisAngle - deltaAngle;
          const arcSpan = endA - startA;
          const midA = (startA + endA) / 2;

          const rDotPos = distFromCenter + 6 * baseScale;
          const dotRadius = 1.6 * baseScale;

          const stepA = (arcSpan * 0.7) / 8;
          const startClusterA = midA - ((u - 1) * stepA) / 2;

          targetCtx.fillStyle = lineColor;
          for (let k = 0; k < u; k++) {
            const currentA = startClusterA + k * stepA;
            const px = cx + rDotPos * Math.cos(currentA);
            const py = cy + rDotPos * Math.sin(currentA);
            targetCtx.beginPath();
            targetCtx.arc(px, py, dotRadius, 0, TAU);
            targetCtx.fill();
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

          targetCtx.strokeStyle = lineColor;
          targetCtx.lineWidth = 0.65 * baseScale;

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

            targetCtx.beginPath();
            targetCtx.moveTo(x1, y1);
            targetCtx.lineTo(x2, y2);
            targetCtx.stroke();
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
      
      const allowedIndices = getActiveIndices();
      const numCircles = allowedIndices.length;

      const stepDist = numCircles > 1 
        ? (lastCircleDist - firstCircleDist) / (numCircles - 1) 
        : 0;

      const maskRadius = rDenomCircle;

      let leftCount = 0;
      let rightCount = 0;

      const circleInfos = [];
      for (let i = 0; i < numCircles; i++) {
        const pDist = numCircles > 1 
          ? (firstCircleDist + i * stepDist) 
          : (firstCircleDist + lastCircleDist) / 2;
          
        const switchIdx = allowedIndices[i];
        const state = precisionStates[switchIdx] || 'center';

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

        circleInfos.push({ switchIdx, pDist, px, py, currAngle, state });
      }

      const centerCircles = circleInfos.filter(info => info.state === 'center');

      if (centerCircles.length > 0) {
        targetCtx.save();
        targetCtx.globalCompositeOperation = 'destination-out';
        targetCtx.beginPath();
        centerCircles.forEach(info => {
          targetCtx.moveTo(info.px + maskRadius, info.py);
          targetCtx.arc(info.px, info.py, maskRadius, 0, TAU);
        });
        targetCtx.fill();
        targetCtx.restore();

        if (withBackground) {
          targetCtx.save();
          targetCtx.beginPath();
          centerCircles.forEach(info => {
            targetCtx.moveTo(info.px + maskRadius, info.py);
            targetCtx.arc(info.px, info.py, maskRadius, 0, TAU);
          });
          targetCtx.clip();
          drawBackground(time, targetCtx, targetW, targetH);
          targetCtx.restore();
        }
      }

      targetCtx.strokeStyle = lineColor;
      targetCtx.lineWidth = THICK.MEDIUM * baseScale;
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
            targetCtx.beginPath();
            targetCtx.arc(cx, cy, info.pDist, startA, endA);
            targetCtx.stroke();
          }
        }
      });

      targetCtx.lineWidth = THICK.FINE * baseScale;
      circleInfos.forEach(info => {
        targetCtx.beginPath();
        targetCtx.arc(info.px, info.py, rDenomCircle, 0, TAU);
        targetCtx.stroke();
      });
    }

    // CONTOUR DE L'HEXAGONE
    targetCtx.strokeStyle = lineColor;
    targetCtx.lineWidth = THICK.MEDIUM * baseScale;
    targetCtx.beginPath();
    targetCtx.moveTo(hexPoints[0].x, hexPoints[0].y);
    for (let i = 1; i < 6; i++) {
      targetCtx.lineTo(hexPoints[i].x, hexPoints[i].y);
    }
    targetCtx.closePath();
    targetCtx.stroke();

    // PROLONGEMENT DE L'AXE VERTICAL HAUT
    targetCtx.lineWidth = THICK.FINE * baseScale;
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

        targetCtx.beginPath();
        targetCtx.moveTo(cx, yStartExtension);
        targetCtx.lineTo(cx, yCutBottom);
        targetCtx.moveTo(cx, yCutTop);
        targetCtx.lineTo(cx, yEndExtension);
        targetCtx.stroke();
      } else {
        targetCtx.beginPath();
        targetCtx.moveTo(cx, yStartExtension);
        targetCtx.lineTo(cx, yEndExtension);
        targetCtx.stroke();
      }
    }

    // 3. PREMIER GRAND DOUBLE CERCLE
    targetCtx.strokeStyle = lineColor;
    targetCtx.lineWidth = THICK.THICK * baseScale;
    targetCtx.beginPath();
    targetCtx.arc(cx, cy, rDouble1_In, 0, TAU);
    targetCtx.stroke();

    targetCtx.lineWidth = THICK.MEDIUM * baseScale;
    targetCtx.beginPath();
    targetCtx.arc(cx, cy, rDouble1_Out, 0, TAU);
    targetCtx.stroke();

    // 3.1 CERCLE DE RUNE PRIMAIRE
    if (activeAxis !== -1) {
      const axisAngle = activeAxis * (TAU / 6) - (Math.PI / 2);
      const rDouble1_Mid = (rDouble1_In + rDouble1_Out) / 2;
      const runeCenterX = cx + rDouble1_Mid * Math.cos(axisAngle);
      const runeCenterY = cy + rDouble1_Mid * Math.sin(axisAngle);
      const rRuneCircle = 36 * baseScale;

      targetCtx.save();
      targetCtx.globalCompositeOperation = 'destination-out';
      targetCtx.beginPath();
      targetCtx.arc(runeCenterX, runeCenterY, rRuneCircle, 0, TAU);
      targetCtx.fill();
      targetCtx.restore();

      if (withBackground) {
        targetCtx.save();
        targetCtx.beginPath();
        targetCtx.arc(runeCenterX, runeCenterY, rRuneCircle, 0, TAU);
        targetCtx.clip();
        drawBackground(time, targetCtx, targetW, targetH);
        targetCtx.restore();
      }

      targetCtx.strokeStyle = lineColor;
      targetCtx.lineWidth = THICK.FINE * baseScale;
      targetCtx.beginPath();
      targetCtx.arc(runeCenterX, runeCenterY, rRuneCircle, 0, TAU);
      targetCtx.stroke();

      if (selectedRune !== 'none' && runeImages[selectedRune]) {
        const runeImg = runeImages[selectedRune];
        const runeSize = rRuneCircle * 1.35;
        drawTintedImage(runeImg, runeCenterX, runeCenterY, runeSize, axisAngle + Math.PI / 2, targetCtx);
      }

      const rConnStart = rDouble1_Mid + rRuneCircle;
      const rConnEnd = rDouble2_In;
      const xConn1 = cx + rConnStart * Math.cos(axisAngle);
      const yConn1 = cy + rConnStart * Math.sin(axisAngle);
      const xConn2 = cx + rConnEnd * Math.cos(axisAngle);
      const yConn2 = cy + rConnEnd * Math.sin(axisAngle);

      targetCtx.strokeStyle = lineColor;
      targetCtx.lineWidth = THICK.MEDIUM * baseScale;
      targetCtx.beginPath();
      targetCtx.moveTo(xConn1, yConn1);
      targetCtx.lineTo(xConn2, yConn2);
      targetCtx.stroke();

      if (activeAxis === 0) {
        targetCtx.lineWidth = THICK.FINE * baseScale;
        targetCtx.beginPath();
        targetCtx.moveTo(cx, cy - rDouble2_Out);
        targetCtx.lineTo(cx, polarY + rPolarCircle);
        targetCtx.stroke();
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

      targetCtx.save();
      targetCtx.globalCompositeOperation = 'destination-out';
      targetCtx.fill(pathSector);
      targetCtx.restore();

      if (withBackground) {
        targetCtx.save();
        targetCtx.clip(pathSector);
        drawBackground(time, targetCtx, targetW, targetH);
        targetCtx.restore();
      }

      targetCtx.strokeStyle = lineColor;
      targetCtx.lineWidth = THICK.FINE * baseScale;
      targetCtx.beginPath();
      targetCtx.arc(arcCenterX, arcCenterY, rArcInner, aStart, aEnd);
      targetCtx.stroke();

      targetCtx.lineWidth = THICK.MEDIUM * baseScale;
      targetCtx.beginPath();
      targetCtx.arc(arcCenterX, arcCenterY, rArcOuter, aStart, aEnd);
      targetCtx.stroke();

      targetCtx.lineWidth = THICK.FINE * baseScale;
      targetCtx.beginPath();
      targetCtx.moveTo(arcCenterX + rArcInner * Math.cos(aStart), arcCenterY + rArcInner * Math.sin(aStart));
      targetCtx.lineTo(arcCenterX + rArcOuter * Math.cos(aStart), arcCenterY + rArcOuter * Math.sin(aStart));
      targetCtx.moveTo(arcCenterX + rArcInner * Math.cos(aEnd), arcCenterY + rArcInner * Math.sin(aEnd));
      targetCtx.lineTo(arcCenterX + rArcOuter * Math.cos(aEnd), arcCenterY + rArcOuter * Math.sin(aEnd));
      targetCtx.stroke();

      const textToDraw = specNameInput.value.trim();
      if (textToDraw) {
        const rText = (rArcInner + rArcOuter) / 2;
        const midAngle = (aStart + aEnd) / 2;

        targetCtx.save();
        targetCtx.fillStyle = lineColor;
        targetCtx.font = `bold ${Math.round(16 * baseScale)}px system-ui, sans-serif`;
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';

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

          targetCtx.save();
          targetCtx.translate(x, y);
          targetCtx.rotate(charAngle + Math.PI / 2);
          targetCtx.fillText(char, 0, 0);
          targetCtx.restore();
        }
        targetCtx.restore();
      }
    } else if (spec === 'echantillon') {
      const centerSpecX = cx + rDouble1_In * Math.cos(oppAngle);
      const centerSpecY = cy + rDouble1_In * Math.sin(oppAngle);

      const rSpecOut = 56 * baseScale;
      const rSpecIn = 36 * baseScale;

      targetCtx.save();
      targetCtx.globalCompositeOperation = 'destination-out';
      targetCtx.beginPath();
      targetCtx.arc(centerSpecX, centerSpecY, rSpecOut + 1 * baseScale, 0, TAU);
      targetCtx.fill();
      targetCtx.restore();

      if (withBackground) {
        targetCtx.save();
        targetCtx.beginPath();
        targetCtx.arc(centerSpecX, centerSpecY, rSpecOut + 1 * baseScale, 0, TAU);
        targetCtx.clip();
        drawBackground(time, targetCtx, targetW, targetH);
        targetCtx.restore();
      }

      targetCtx.strokeStyle = lineColor;
      targetCtx.lineWidth = THICK.MEDIUM * baseScale;
      targetCtx.beginPath();
      targetCtx.arc(centerSpecX, centerSpecY, rSpecOut, 0, TAU);
      targetCtx.stroke();

      targetCtx.lineWidth = THICK.FINE * baseScale;
      targetCtx.beginPath();
      targetCtx.arc(centerSpecX, centerSpecY, rSpecIn, 0, TAU);
      targetCtx.stroke();
    }

    // 6. SECOND GRAND DOUBLE CERCLE
    targetCtx.strokeStyle = lineColor;
    targetCtx.lineWidth = THICK.THICK * baseScale;
    targetCtx.beginPath();
    targetCtx.arc(cx, cy, rDouble2_In, 0, TAU);
    targetCtx.stroke();

    targetCtx.lineWidth = THICK.MEDIUM * baseScale;
    targetCtx.beginPath();
    targetCtx.arc(cx, cy, rDouble2_Out, 0, TAU);
    targetCtx.stroke();

    // 7. CERCLE ÉTOILE POLAIRE
    targetCtx.save();
    targetCtx.globalCompositeOperation = 'destination-out';
    targetCtx.beginPath();
    targetCtx.arc(cx, polarY, rPolarCircle, 0, TAU);
    targetCtx.fill();
    targetCtx.restore();

    if (withBackground) {
      targetCtx.save();
      targetCtx.beginPath();
      targetCtx.arc(cx, polarY, rPolarCircle, 0, TAU);
      targetCtx.clip();
      drawBackground(time, targetCtx, targetW, targetH);
      targetCtx.restore();
    }

    targetCtx.strokeStyle = lineColor;
    targetCtx.lineWidth = THICK.MEDIUM * baseScale;
    targetCtx.beginPath();
    targetCtx.arc(cx, polarY, rPolarCircle, 0, TAU);
    targetCtx.stroke();

    const polarImg = runeImages['polaire'];
    if (polarImg) {
      const polarSize = rPolarCircle * 1.35;
      drawTintedImage(polarImg, cx, polarY, polarSize, 0, targetCtx);
    }
  }

  function draw(time = 0) {
    const cx = W / 2 + view.x;
    const cy = H / 2 + view.y;
    const baseScale = (Math.min(W, H) / 1080) * view.zoom;
    renderScene(ctx, W, H, baseScale, cx, cy, time, true);
    requestAnimationFrame(draw);
  }

  // --- TÉLÉCHARGEMENT HAUTE DÉFINITION SUR FOND TRANSPARENT ---
  function downloadHighResImage() {
    try {
      const exportSize = 4096;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = exportSize;
      exportCanvas.height = exportSize;
      const expCtx = exportCanvas.getContext('2d');

      expCtx.imageSmoothingEnabled = true;
      expCtx.imageSmoothingQuality = 'high';

      const expScale = exportSize / 1080;
      const expCenter = exportSize / 2;

      // withBackground = false -> Fond 100% transparent
      renderScene(expCtx, exportSize, exportSize, expScale, expCenter, expCenter, performance.now(), false);

      const selectedSubject = subjectSelect ? subjectSelect.value : 'none';
      const filename = selectedSubject !== 'none' 
        ? `cercle_astrologique_${selectedSubject}_HD.png` 
        : `cercle_astrologique_HD.png`;

      exportCanvas.toBlob((blob) => {
        if (!blob) {
          console.error("Impossible de générer le blob de l'image.");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }, 'image/png');

    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err);
    }
  }

  // Clic sur le bouton Enregistrer HD
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadHighResImage);
  }

  // Clic droit sur le canevas
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    downloadHighResImage();
  });

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
    colorInput.value = '#d8c996';
    lineColor = colorInput.value;
  });

  window.addEventListener('resize', resize);

  resize();
  updatePrecisionSwitches();
  requestAnimationFrame(draw);
})();