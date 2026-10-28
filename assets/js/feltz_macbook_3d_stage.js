/**
 * Feltz Studio — VANTA-Grade 3D Blender MacBook Pro Stage
 * - True 3D GLB Rig (feltz_macbook_rig.glb) with planar UV lightmaps
 * - Dramatic Left-to-Right Studio Softbox Shading + Deep Contact Shadow under base
 * - Slow 2.8s Weighted Lid Opening from 100% Flat Closed (+88 deg -> -16 deg)
 * - High-Contrast VANTA//9 Editorial Off-White (#EFECE6) & Obsidian (#070709) Inner Screen
 * - Continuous Floating-Point Auto-Sliding across 3-Section Architectural Layout
 */
(function () {
  'use strict';

  if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
    console.error('[Feltz 3D Stage] THREE or GLTFLoader missing.');
    return;
  }

  // Load portrait & portfolio photos from Base64 bundle
  const kengPortraitImg = new Image();
  let kengPortraitLoaded = false;
  kengPortraitImg.onload = function () { kengPortraitLoaded = true; };
  if (window.FELTZ_KENG_CUTOUT_B64) {
    kengPortraitImg.src = window.FELTZ_KENG_CUTOUT_B64;
  }

  const portfolioImgs = [];
  if (Array.isArray(window.FELTZ_SCREEN_PHOTOS_B64)) {
    window.FELTZ_SCREEN_PHOTOS_B64.forEach(function (src) {
      const im = new Image();
      im.src = src;
      portfolioImgs.push(im);
    });
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function drawCoverImage(ctx, img, x, y, w, h) {
    if (!img || !img.complete || !img.naturalWidth) return;
    const ir = img.naturalWidth / img.naturalHeight;
    const br = w / h;
    let sw, sh, sx, sy;
    if (ir > br) {
      sh = img.naturalHeight;
      sw = sh * br;
      sx = (img.naturalWidth - sw) * 0.5;
      sy = 0;
    } else {
      sw = img.naturalWidth;
      sh = sw / br;
      sx = 0;
      sy = (img.naturalHeight - sh) * 0.5;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  /**
   * 1. Studio Lightmap Textures for Dramatic Left-to-Right Shading & Contact Shadow
   */
  function createPedestalTopLightmap() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext('2d');

    // Dark Obsidian Monolith top: subtle left studio slate highlight grading into deep shadow on the right
    const bg = ctx.createLinearGradient(0, 100, 1024, 940);
    bg.addColorStop(0.0, '#18191e');
    bg.addColorStop(0.32, '#101115');
    bg.addColorStop(0.68, '#090a0c');
    bg.addColorStop(1.0, '#040406');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 1024);

    // Crisp subtle studio bevel highlight along top-left & front edge of the monolith slab
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 1020, 1020);

    // Deep soft Ambient Occlusion & Contact Shadow directly under the MacBook base footprint
    ctx.save();
    ctx.filter = 'blur(32px)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.98)';
    roundedRectPath(ctx, 128, 140, 768, 720, 54);
    ctx.fill();
    ctx.restore();

    // Crisper core contact shadow right under the base and front lip
    ctx.save();
    ctx.filter = 'blur(12px)';
    ctx.fillStyle = '#000000';
    roundedRectPath(ctx, 150, 158, 724, 676, 38);
    ctx.fill();
    ctx.restore();

    const tex = new THREE.CanvasTexture(c);
    tex.flipY = false;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }

  function createMacBookDeckLightmap() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext('2d');

    // Dramatic VANTA//9 Left-to-Right Anodized Space Gray Gradient
    const grad = ctx.createLinearGradient(0, 140, 1024, 880);
    grad.addColorStop(0.0, '#c4c8d0');
    grad.addColorStop(0.24, '#989ca6');
    grad.addColorStop(0.50, '#666a73');
    grad.addColorStop(0.76, '#3a3d44');
    grad.addColorStop(1.0, '#202227');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Specular studio softbox sheen on the front-left palmrest
    const sheen = ctx.createRadialGradient(180, 240, 10, 220, 280, 460);
    sheen.addColorStop(0.0, 'rgba(255,255,255,0.28)');
    sheen.addColorStop(0.55, 'rgba(255,255,255,0.06)');
    sheen.addColorStop(1.0, 'rgba(0,0,0,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle dark AO shadow cast by the open screen near the rear hinge
    const rearAO = ctx.createLinearGradient(0, 740, 0, 1024);
    rearAO.addColorStop(0.0, 'rgba(0,0,0,0)');
    rearAO.addColorStop(1.0, 'rgba(5,6,8,0.62)');
    ctx.fillStyle = rearAO;
    ctx.fillRect(0, 740, 1024, 284);

    const tex = new THREE.CanvasTexture(c);
    tex.flipY = false;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }

  function createKeycapsTexture() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');

    // Dark matte keycap base with subtle left-to-right studio sheen
    const bg = ctx.createLinearGradient(0, 0, 1024, 240);
    bg.addColorStop(0.0, '#22242a');
    bg.addColorStop(0.38, '#16171b');
    bg.addColorStop(0.75, '#0f1013');
    bg.addColorStop(1.0, '#0a0b0d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle keycap top-edge bevel sheen & minimalist key legends across the 6 rows
    const rows = 6;
    const cols = 14;
    const cw = 1024 / cols;
    const rh = 512 / rows;
    const legends = [
      ['fn', 'ctrl', 'opt', 'cmd', '', '', '', '', '', 'cmd', 'opt', '<', 'v', '>'],
      ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 'shift', '', ''],
      ['caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'return', ''],
      ['tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
      ['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'del'],
      ['esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'id']
    ];

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cw;
        const y = (rows - 1 - r) * rh;
        const leftLight = 1.0 - (col / cols) * 0.55;
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.07 * leftLight).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 6, y + 6, cw - 12, rh - 12);

        const label = (legends[r] && legends[r][col]) || '';
        if (label) {
          ctx.fillStyle = 'rgba(215,220,230,' + (0.34 * leftLight).toFixed(3) + ')';
          ctx.fillText(label, x + 14, y + rh * 0.52);
        }
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.flipY = false;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * 2. High-Contrast VANTA//9 Editorial Screen Canvas (2048 x 1296)
   *    - Slide 1 (0..1296): Warm Editorial Off-White (#EFECE6) + Bold Black Swiss Type + Giant Vermilion "FELTZ // 12" + Central Dark Portrait Cutout
   *    - Slide 2 (1296..3080): 3-Column Architectural Grid (Left/Right #EFECE6 Slabs with Giant Cropped 01..04 Numerals + Center Black Vertical Gallery Shaft with Real Portfolio Photos)
   *    - Slide 3 (3080..4050): Stark Black (#060608) Manifesto Finale with Angled Off-White Shoulders & Crimson Emblem
   */
  function createScreenRenderer(variant) {
    const W = 2048;
    const H = 1296;
    const TOTAL_H = 3960;
    const MAX_SCROLL = TOTAL_H - H;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = true;
    texture.anisotropy = 8;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    if (THREE.SRGBColorSpace) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }

    function renderAtScroll(scrollY, activeTab) {
      ctx.save();
      // Base fill
      ctx.fillStyle = '#070709';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(0, -scrollY);

      // =========================================================================
      // SECTION 1: EDITORIAL OFF-WHITE HERO (y = 0 .. 1296) — Matches VANTA//9 Frames 2-6
      // =========================================================================
      const heroGrad = ctx.createRadialGradient(W * 0.5, 580, 120, W * 0.5, 640, 1280);
      heroGrad.addColorStop(0.0, '#F5F2EC');
      heroGrad.addColorStop(0.7, '#EAE6DF');
      heroGrad.addColorStop(1.0, '#DDD8CE');
      ctx.fillStyle = heroGrad;
      ctx.fillRect(0, 0, W, 1296);

      // Subtle architectural grid hairlines on the off-white hero
      ctx.strokeStyle = 'rgba(15, 15, 18, 0.07)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(96, 118); ctx.lineTo(W - 96, 118);
      ctx.moveTo(W * 0.5, 118); ctx.lineTo(W * 0.5, 1296);
      ctx.stroke();

      // Top micro-navigation inside the screen
      ctx.fillStyle = '#0E0E11';
      ctx.font = '700 21px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(variant === 'command' ? 'FELTZ STUDIO  //  COMMISSION' : 'FELTZ STUDIO  +', 96, 82);

      ctx.fillStyle = '#6E6B64';
      ctx.font = '600 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EST. 2012  ·  CHIANG MAI  ·  NATIONWIDE', W * 0.5, 82);

      ctx.fillStyle = '#0E0E11';
      ctx.textAlign = 'right';
      ctx.fillText(variant === 'command' ? 'DIRECT RESPONSE  [09]' : 'VISUAL ARCHIVE  [08]', W - 96, 82);

      // Left Swiss Headline Block
      ctx.fillStyle = '#0A0A0D';
      ctx.textAlign = 'left';
      ctx.font = '800 68px "Syne", "Space Grotesk", sans-serif';
      if (variant === 'command') {
        ctx.fillText('DIRECT', 96, 250);
        ctx.fillText('COMMISSION.', 96, 324);
      } else {
        ctx.fillText('BUILT FOR', 96, 250);
        ctx.fillText('COMMERCIAL.', 96, 324);
      }

      ctx.fillStyle = '#4A4740';
      ctx.font = '600 22px "Noto Sans Thai", sans-serif';
      ctx.fillText(
        variant === 'command'
          ? 'รับบรีฟและวางโครงสร้างภาพลักษณ์โดยตรง'
          : 'ทุกช็อตคือการวางกลยุทธ์ภาพลักษณ์และแสงจริง',
        96, 376
      );
      ctx.fillStyle = '#7A766E';
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.fillText('01 // VISUAL DIRECTOR & FOUNDER', 96, 412);

      // Right Swiss Headline Block
      ctx.fillStyle = '#0A0A0D';
      ctx.textAlign = 'right';
      ctx.font = '800 68px "Syne", "Space Grotesk", sans-serif';
      if (variant === 'command') {
        ctx.fillText('PRODUCTION', W - 96, 250);
        ctx.fillText('STANDARD.', W - 96, 324);
      } else {
        ctx.fillText('THE VISUAL', W - 96, 250);
        ctx.fillText('STANDARD.', W - 96, 324);
      }

      ctx.fillStyle = '#4A4740';
      ctx.font = '600 22px "Noto Sans Thai", sans-serif';
      ctx.fillText('มงคล วงศ์สกุลยานนท์ — ช่างภาพพาณิชย์เชียงใหม่', W - 96, 376);
      ctx.fillStyle = '#7A766E';
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.fillText('DUAL SONY ALPHA RIG  //  12+ YEARS', W - 96, 412);

      // GIANT VERMILION-CRIMSON DISPLAY WORDMARK ACROSS MID-SCREEN (Matches "VANTA // 9")
      ctx.save();
      ctx.fillStyle = '#D9381E';
      ctx.textAlign = 'center';
      ctx.font = '900 272px "Anton", "Syne", Impact, sans-serif';
      ctx.fillText(variant === 'command' ? 'FELTZ // 09' : 'FELTZ // 12', W * 0.5, 790);
      ctx.restore();

      // Central Dark Monolithic Subject Cutout Portrait (Matches VANTA//9 central figure directly over vermilion type)
      const cx = W * 0.5;
      if (kengPortraitLoaded) {
        const pw = 790;
        const ph = 1020;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.38)';
        ctx.shadowBlur = 36;
        ctx.shadowOffsetY = 14;
        ctx.drawImage(kengPortraitImg, cx - pw * 0.5, 1296 - ph + 16, pw, ph);
        ctx.restore();
      }

      // Bottom-left & bottom-right editorial index tags on Slide 1
      ctx.fillStyle = '#141417';
      ctx.textAlign = 'left';
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillText('SCROLL  //  08 SPECIALIZED ARCHIVES', 96, 1228);

      ctx.textAlign = 'right';
      ctx.fillText('SINGHA · KBANK · AIRASIA · TRUE · AIA · TCEB', W - 96, 1228);

      // =========================================================================
      // SECTION 2: 3-COLUMN ARCHITECTURAL BENTO GRID (y = 1296 .. 3080)
      // Matches VANTA//9 Frames 7-14: Off-White Left & Right Slabs + Stark Black Center Shaft
      // =========================================================================
      const sec2Y = 1296;
      const sec2H = 1784;
      ctx.fillStyle = '#060608';
      ctx.fillRect(0, sec2Y, W, sec2H);

      // Helper to draw chamfered VANTA//9 off-white architectural card
      function drawEditorialSlab(x, y, w, h, side, numStr, tag, titleEn, titleTh, descTh, footerSpec) {
        ctx.save();
        ctx.fillStyle = '#EFECE6';
        ctx.beginPath();
        const ch = 64; // Chamfer cut on the inner edge facing the black center shaft
        if (side === 'left') {
          ctx.moveTo(x, y);
          ctx.lineTo(x + w - ch, y);
          ctx.lineTo(x + w, y + ch);
          ctx.lineTo(x + w, y + h - ch);
          ctx.lineTo(x + w - ch, y + h);
          ctx.lineTo(x, y + h);
        } else {
          ctx.moveTo(x + ch, y);
          ctx.lineTo(x + w, y);
          ctx.lineTo(x + w, y + h);
          ctx.lineTo(x + ch, y + h);
          ctx.lineTo(x, y + h - ch);
          ctx.lineTo(x, y + ch);
        }
        ctx.closePath();
        ctx.fill();

        // Giant cropped numeral at top of slab (VANTA//9 signature "01" / "02")
        ctx.save();
        ctx.clip();
        ctx.fillStyle = '#0B0B0E';
        ctx.textAlign = 'left';
        ctx.font = '900 176px "Anton", "Syne", sans-serif';
        ctx.fillText(numStr, x + 48, y + 148);

        // Top-right micro tag inside slab
        ctx.fillStyle = '#D9381E';
        ctx.textAlign = 'right';
        ctx.font = '700 17px "JetBrains Mono", monospace';
        ctx.fillText(tag, x + w - 48, y + 64);

        // Divider hairline
        ctx.strokeStyle = 'rgba(12, 12, 16, 0.14)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 48, y + 210);
        ctx.lineTo(x + w - 48, y + 210);
        ctx.stroke();

        // Bold English Architectural Title (2 lines)
        ctx.fillStyle = '#0A0A0D';
        ctx.textAlign = 'left';
        ctx.font = '800 44px "Syne", "Space Grotesk", sans-serif';
        const lines = titleEn.split('\n');
        lines.forEach(function (ln, idx) {
          ctx.fillText(ln, x + 48, y + 292 + idx * 52);
        });

        // Thai Subhead & Description
        ctx.fillStyle = '#22211E';
        ctx.font = '700 25px "Noto Sans Thai", sans-serif';
        ctx.fillText(titleTh, x + 48, y + 435);

        ctx.fillStyle = '#57544D';
        ctx.font = '500 22px "Noto Sans Thai", sans-serif';
        const descLines = descTh.split('\n');
        descLines.forEach(function (dln, idx) {
          ctx.fillText(dln, x + 48, y + 482 + idx * 34);
        });

        // Bottom technical spec bar
        ctx.strokeStyle = 'rgba(12, 12, 16, 0.14)';
        ctx.beginPath();
        ctx.moveTo(x + 48, y + h - 92);
        ctx.lineTo(x + w - 48, y + h - 92);
        ctx.stroke();

        ctx.fillStyle = '#0E0E12';
        ctx.font = '700 16px "JetBrains Mono", monospace';
        ctx.fillText(footerSpec, x + 48, y + h - 46);
        ctx.restore();
        ctx.restore();
      }

      // Row 1 Slabs (01 Left, 02 Right)
      drawEditorialSlab(
        48, sec2Y + 56, 624, 800, 'left',
        '01', 'ARCHIVE 01 & 02',
        'THE FIRST\nDECISIVE FRAME.',
        'คอนเสิร์ต เวทีใหญ่ และกีฬามอเตอร์สปอร์ต',
        'จับจังหวะพีคของแสงสีและแอ็กชันความเร็วสูง\nด้วยชุดกล้องคู่ Sony Alpha ระดับเรือธง',
        'CONCERT  ·  FESTIVAL  ·  HIGH-SPEED SPORT'
      );

      drawEditorialSlab(
        1376, sec2Y + 56, 624, 800, 'right',
        '02', 'ARCHIVE 03 & 04',
        'THE SPATIAL\nARCHITECTURE.',
        'โรงแรมห้าดาว รีสอร์ต และอสังหาริมทรัพย์',
        'ถ่ายทอดมิติสถาปัตยกรรม แสงธรรมชาติ และสเปซ\nเพื่อยกระดับมูลค่าโครงการและการขายระดับพรีเมียม',
        'LUXURY HOTEL  ·  RESORT  ·  REAL ESTATE'
      );

      // Row 2 Slabs (03 Left, 04 Right)
      drawEditorialSlab(
        48, sec2Y + 912, 624, 800, 'left',
        '03', 'ARCHIVE 05 & 06',
        'THE TACTILE\nCRAFT & FORM.',
        'อาหารไฟน์ไดนิ่ง และสินค้าโฆษณา',
        'จัดแสงสตูดิโอเน้นเท็กซ์เจอร์อาหารและผลิตภัณฑ์\nสร้างภาพลักษณ์ที่กระตุ้นการตัดสินใจซื้อทันที',
        'FINE DINING  ·  COMMERCIAL PRODUCT'
      );

      drawEditorialSlab(
        1376, sec2Y + 912, 624, 800, 'right',
        '04', 'ARCHIVE 07 & 08',
        'THE EXECUTIVE\nPRESENCE.',
        'พอร์ตเทรตผู้บริหาร และงานประชุมนานาชาติ',
        'ดึงคาแรกเตอร์ผู้นำองค์กรและบันทึกภาพงาน MICE\nระดับประเทศด้วยมาตรฐานทีมโปรดักชันมืออาชีพ',
        'EXECUTIVE PORTRAIT  ·  CORPORATE MICE'
      );

      // Center Stark Black Vertical Gallery Shaft (x = 706 .. 1342) with Real Portfolio Photography
      const shaftX = 712;
      const shaftW = 624;
      for (let i = 0; i < 3; i++) {
        const cardY = sec2Y + 70 + i * 556;
        const cardH = 516;
        ctx.save();
        roundedRectPath(ctx, shaftX, cardY, shaftW, cardH, 18);
        ctx.clip();

        if (portfolioImgs[i] && portfolioImgs[i].complete) {
          drawCoverImage(ctx, portfolioImgs[i], shaftX, cardY, shaftW, cardH);
        } else {
          ctx.fillStyle = '#141418';
          ctx.fillRect(shaftX, cardY, shaftW, cardH);
        }

        // Moody studio vignette overlay on center shaft photo
        const vig = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
        vig.addColorStop(0.0, 'rgba(6,6,8,0.45)');
        vig.addColorStop(0.45, 'rgba(6,6,8,0.05)');
        vig.addColorStop(1.0, 'rgba(6,6,8,0.82)');
        ctx.fillStyle = vig;
        ctx.fillRect(shaftX, cardY, shaftW, cardH);

        // Crisp border & caption inside center shaft card
        ctx.strokeStyle = 'rgba(239, 236, 230, 0.16)';
        ctx.lineWidth = 2;
        roundedRectPath(ctx, shaftX + 1, cardY + 1, shaftW - 2, cardH - 2, 18);
        ctx.stroke();

        const labels = [
          ['01 // ARCHITECTURAL SPACE', 'DIMENSIONAL LIGHT & PERSPECTIVE'],
          ['02 // COMMERCIAL PRODUCT', 'PRECISION STUDIO LIGHTING'],
          ['03 // STAGE & LIVE ENERGY', 'DECISIVE MOMENT AT 1/8000S']
        ];
        ctx.fillStyle = '#D9381E';
        ctx.textAlign = 'left';
        ctx.font = '700 15px "JetBrains Mono", monospace';
        ctx.fillText(labels[i][0], shaftX + 28, cardY + cardH - 54);

        ctx.fillStyle = '#F5F2EC';
        ctx.font = '800 24px "Syne", "Space Grotesk", sans-serif';
        ctx.fillText(labels[i][1], shaftX + 28, cardY + cardH - 24);
        ctx.restore();
      }

      // =========================================================================
      // SECTION 3: STARK BLACK MANIFESTO FINALE (y = 3080 .. 3960)
      // Matches VANTA//9 Frames 15-16: Angled Off-White Top Shoulders + Center Statement + 3 Metrics + Emblem
      // =========================================================================
      const sec3Y = 3080;
      const sec3H = 880;
      ctx.fillStyle = '#060608';
      ctx.fillRect(0, sec3Y, W, sec3H);

      // Angled Off-White Architectural Shoulders at Top-Left & Top-Right (VANTA//9 Frame 15-16 signature)
      ctx.fillStyle = '#EFECE6';
      ctx.beginPath();
      ctx.moveTo(48, sec3Y);
      ctx.lineTo(640, sec3Y);
      ctx.lineTo(520, sec3Y + 145);
      ctx.lineTo(48, sec3Y + 145);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(W - 640, sec3Y);
      ctx.lineTo(W - 48, sec3Y);
      ctx.lineTo(W - 48, sec3Y + 145);
      ctx.lineTo(W - 520, sec3Y + 145);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0A0A0D';
      ctx.textAlign = 'left';
      ctx.font = '800 26px "Syne", sans-serif';
      ctx.fillText('FELTZ STUDIO ARCHIVE', 88, sec3Y + 84);
      ctx.textAlign = 'right';
      ctx.fillText('DIRECT COMMISSION  089-554-4355', W - 88, sec3Y + 84);

      // Central Stark White Manifesto Statement
      ctx.fillStyle = '#F4F1EA';
      ctx.textAlign = 'center';
      ctx.font = '800 38px "Syne", "Space Grotesk", sans-serif';
      ctx.fillText('ONE VERIFIED VISUAL PRODUCTION SYSTEM.', W * 0.5, sec3Y + 310);
      ctx.fillStyle = '#A8A39A';
      ctx.font = '600 24px "Noto Sans Thai", sans-serif';
      ctx.fillText('มาตรฐานงานภาพพาณิชย์สำหรับองค์กรและแบรนด์ชั้นนำทั่วประเทศ — ประจำการเชียงใหม่', W * 0.5, sec3Y + 358);

      // Precision horizontal rule
      ctx.strokeStyle = 'rgba(244, 241, 234, 0.16)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(320, sec3Y + 430);
      ctx.lineTo(W - 320, sec3Y + 430);
      ctx.stroke();

      // 3 Metric Columns
      const metrics = [
        { val: '12+ YRS', sub: 'COMMERCIAL MASTERY SINCE 2012', x: W * 0.28 },
        { val: '14+ BRANDS', sub: 'TRUSTED BY NATIONAL ENTERPRISES', x: W * 0.50 },
        { val: '08 FIELDS', sub: 'SPECIALIZED VISUAL PORTFOLIOS', x: W * 0.72 }
      ];
      metrics.forEach(function (m) {
        ctx.fillStyle = '#F4F1EA';
        ctx.font = '800 42px "Syne", sans-serif';
        ctx.fillText(m.val, m.x, sec3Y + 510);
        ctx.fillStyle = '#7C7870';
        ctx.font = '600 15px "JetBrains Mono", monospace';
        ctx.fillText(m.sub, m.x, sec3Y + 544);
      });

      // Glowing Vermilion Geometric Studio Emblem at Bottom Center (Matches VANTA//9 Frame 16)
      const emX = W * 0.5;
      const emY = sec3Y + 690;
      const emGlow = ctx.createRadialGradient(emX, emY, 8, emX, emY, 96);
      emGlow.addColorStop(0.0, 'rgba(217, 56, 30, 0.42)');
      emGlow.addColorStop(1.0, 'rgba(217, 56, 30, 0)');
      ctx.fillStyle = emGlow;
      ctx.beginPath();
      ctx.arc(emX, emY, 96, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#D9381E';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(emX, emY - 36);
      ctx.lineTo(emX + 36, emY);
      ctx.lineTo(emX, emY + 36);
      ctx.lineTo(emX - 36, emY);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#D9381E';
      ctx.beginPath();
      ctx.arc(emX, emY, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // end scroll translate

      // =========================================================================
      // FIXED MACOS GLASS WINDOW BAR & DIAGONAL SCREEN REFLECTION OVERLAY
      // =========================================================================
      ctx.fillStyle = 'rgba(10, 10, 13, 0.88)';
      ctx.fillRect(0, 0, W, 38);

      // Subtle traffic dots
      const dots = ['#FF5F56', '#FFBD2E', '#27C93F'];
      dots.forEach(function (c, i) {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(28 + i * 20, 19, 5.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = 'rgba(244, 241, 234, 0.55)';
      ctx.textAlign = 'left';
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.fillText('FELTZ_STUDIO // VISUAL_ARCHIVE_2026', 104, 24);

      // Right scrollbar progress indicator
      const prog = Math.max(0, Math.min(1, scrollY / MAX_SCROLL));
      ctx.fillStyle = 'rgba(12, 12, 15, 0.22)';
      ctx.fillRect(W - 8, 42, 4, H - 48);
      ctx.fillStyle = '#D9381E';
      ctx.fillRect(W - 8, 42 + prog * (H - 180), 4, 132);

      // Subtle diagonal glass screen reflection (gives authentic Retina glass depth)
      const glassGrad = ctx.createLinearGradient(0, 0, W * 0.65, H);
      glassGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.055)');
      glassGrad.addColorStop(0.38, 'rgba(255, 255, 255, 0.015)');
      glassGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0.0)');
      glassGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.08)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.restore();
      texture.needsUpdate = true;
    }

    return {
      texture: texture,
      renderAtScroll: renderAtScroll,
      maxScroll: MAX_SCROLL
    };
  }

  /**
   * 3. Asymmetric Studio Softbox Environment Map (Left Bright Key -> Right Dark Fill)
   */
  function createStudioEnvMap(renderer) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x060608);

    // Huge warm-white Left Key Softbox
    const leftSoftbox = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    leftSoftbox.position.set(-11, 7, 6);
    leftSoftbox.lookAt(0, 0, 0);
    envScene.add(leftSoftbox);

    // Subtle top-left rim strip
    const topStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 4),
      new THREE.MeshBasicMaterial({ color: 0xd8dce4 })
    );
    topStrip.position.set(-5, 12, -2);
    topStrip.lookAt(0, 0, 0);
    envScene.add(topStrip);

    // Subtle warm crimson ambient bounce on far back-left wall
    const warmBounce = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 10),
      new THREE.MeshBasicMaterial({ color: 0x380c06 })
    );
    warmBounce.position.set(-8, 2, -12);
    warmBounce.lookAt(0, 0, 0);
    envScene.add(warmBounce);

    const envMap = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();
    return envMap;
  }

  const sharedPedestalTex = createPedestalTopLightmap();
  const sharedDeckTex = createMacBookDeckLightmap();
  const sharedKeycapsTex = createKeycapsTexture();

  /**
   * 4. Initialize WebGL Stage Instance
   */
  function initStage(containerId, variant) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const envMap = createStudioEnvMap(renderer);
    scene.environment = envMap;

    // Camera with Architectural Off-Axis Shift (Matches VANTA//9 slanted depth + level horizontals)
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);

    function updateCameraAndSize() {
      const rect = container.getBoundingClientRect();
      const w = Math.max(rect.width || window.innerWidth, 320);
      const h = Math.max(rect.height || 580, 340);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;

      const isMobile = w < 768;
      if (isMobile) {
        camera.fov = 40;
        camera.position.set(-0.78, 2.02, 7.05);
        camera.lookAt(0.0, 0.86, -0.15);
        camera.setViewOffset(w, h, w * 0.035, 0, w, h);
      } else {
        camera.fov = 33.5;
        camera.position.set(-0.98, 2.16, 6.55);
        camera.lookAt(0.0, 0.88, -0.16);
        camera.setViewOffset(w, h, w * 0.055, 0, w, h);
      }
      camera.updateProjectionMatrix();
    }

    // Studio Product Lighting — Strong Left Key, Dark Right Negative Fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.22);
    scene.add(ambient);

    const keyLightLeft = new THREE.DirectionalLight(0xfffcf8, 2.65);
    keyLightLeft.position.set(-6.5, 5.2, 4.8);
    scene.add(keyLightLeft);

    const rimLightBackLeft = new THREE.SpotLight(0xeef2ff, 1.85, 22, Math.PI * 0.30, 0.65);
    rimLightBackLeft.position.set(-4.2, 5.8, -4.5);
    scene.add(rimLightBackLeft);

    const screenUI = createScreenRenderer(variant);

    const state = {
      container: container,
      renderer: renderer,
      scene: scene,
      camera: camera,
      lidPivot: null,
      rootGroup: null,
      screenUI: screenUI,
      isOpenTriggered: variant === 'cover',
      openStartTime: performance.now() + 550, // 0.55s closed hold so viewer sees the closed monolith rig
      openDuration: 2800,                     // 2.8s slow weighted lid opening
      closedAngleRad: THREE.MathUtils.degToRad(109.5),
      openAngleRad: THREE.MathUtils.degToRad(0.0),
      currentLidProgress: 0,
      scrollY: 0,
      scrollDir: 1,
      scrollHoldTimer: 55,
      manualOverrideUntil: 0,
      targetParallaxX: 0,
      targetParallaxY: 0,
      currentParallaxX: 0,
      currentParallaxY: 0
    };

    const loader = new THREE.GLTFLoader();
    function onModelLoaded(gltf) {
      const model = gltf.scene;
      state.rootGroup = model;

      model.traverse(function (node) {
        if (node.name === 'MacBook_Lid_Pivot' || node.name === 'LidPivot') {
          state.lidPivot = node;
        }
        if (node.isMesh) {
          const pName = (node.parent && node.parent.name) ? node.parent.name : '';
          if (node.name === 'Screen_Display' || node.name === 'Screen' || pName === 'Screen_Display') {
            node.material = new THREE.MeshBasicMaterial({
              map: screenUI.texture,
              toneMapped: false
            });
          } else if (node.name === 'Monolith_Pedestal_Top' || pName === 'Monolith_Pedestal_Top') {
            node.material = new THREE.MeshBasicMaterial({
              map: sharedPedestalTex
            });
          } else if (node.name === 'Monolith_Pedestal_Body' || pName === 'Monolith_Pedestal_Body') {
            node.material = new THREE.MeshBasicMaterial({
              color: new THREE.Color(0x060608)
            });
          } else {
            // Real CAD MacBook Pro meshes: keep all original Apple textures (keyboard legends, speakers, ports)
            // and upgrade the Midnight-Black CAD chassis materials to authentic Space Gray Anodized Aluminum
            const aluminumMats = {
              lmWQsEjxpsebDlK: true,
              iyDJFXmHelnMTbD: true,
              CRQixVLpahJzhJc: true,
              LpqXZqhaGCeSzdu: true,
              nDsMUuDKliqGFdU: true,
              YYwBgwvcyZVOOAA: true,
              zhGRTuGrQoJflBD: true
            };
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach(function (m) {
              if (!m) return;
              if (m.name && aluminumMats[m.name]) {
                m.color = new THREE.Color(0x787c86);
                m.metalness = 0.78;
                m.roughness = 0.27;
                m.envMapIntensity = 1.38;
                m.needsUpdate = true;
              } else if (m.name === 'JvMFZolVCdpPqjj') {
                // Apple Logo mirror chrome
                m.color = new THREE.Color(0xd8dce4);
                m.metalness = 0.96;
                m.roughness = 0.08;
                m.envMapIntensity = 1.55;
                m.needsUpdate = true;
              } else {
                // Keycaps, keyboard well, speaker grilles, ports, bezel
                m.envMapIntensity = 0.45;
                m.needsUpdate = true;
              }
            });
          }
        }
      });

      if (state.lidPivot) {
        state.lidPivot.rotation.x = state.closedAngleRad;
      }

      scene.add(model);
      screenUI.renderAtScroll(0, 1);
      renderer.render(scene, camera);
    }

    if (window.FELTZ_MACBOOK_RIG_B64) {
      const binStr = atob(window.FELTZ_MACBOOK_RIG_B64);
      const len = binStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binStr.charCodeAt(i);
      }
      loader.parse(bytes.buffer, '', onModelLoaded, function (err) {
        console.error('[Feltz 3D Stage] GLB parse error:', err);
      });
    } else {
      loader.load('assets/feltz_macbook_rig.glb', onModelLoaded);
    }

    updateCameraAndSize();
    window.addEventListener('resize', updateCameraAndSize);

    // Subtle mouse parallax
    container.addEventListener('mousemove', function (e) {
      const r = container.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / Math.max(r.width, 1)) * 2 - 1;
      const ny = ((e.clientY - r.top) / Math.max(r.height, 1)) * 2 - 1;
      state.targetParallaxX = nx * 0.032;
      state.targetParallaxY = ny * 0.018;
    }, { passive: true });

    container.addEventListener('mouseleave', function () {
      state.targetParallaxX = 0;
      state.targetParallaxY = 0;
    }, { passive: true });

    // Manual wheel scrolling inside the 3D screen when hovering over the laptop
    container.addEventListener('wheel', function (e) {
      if (state.currentLidProgress < 0.7) return;
      const maxS = screenUI.maxScroll;
      const nextS = state.scrollY + e.deltaY * 1.4;
      if ((e.deltaY > 0 && state.scrollY < maxS - 4) || (e.deltaY < 0 && state.scrollY > 4)) {
        e.preventDefault();
        e.stopPropagation();
        state.scrollY = Math.max(0, Math.min(maxS, nextS));
        state.manualOverrideUntil = performance.now() + 2600;
      }
    }, { passive: false });

    return state;
  }

  const stages = [];
  let coverStage = null;
  let cmdStage = null;

  function bootAllStages() {
    if (!coverStage && document.getElementById('cover-webgl-macbook-stage')) {
      coverStage = initStage('cover-webgl-macbook-stage', 'cover');
      if (coverStage) stages.push(coverStage);
    }
    if (!cmdStage && document.getElementById('command-webgl-macbook-stage')) {
      cmdStage = initStage('command-webgl-macbook-stage', 'command');
      if (cmdStage) {
        stages.push(cmdStage);
        const cmdSection = document.getElementById('sec-contact') || document.getElementById('sec-09');
        if (cmdSection && 'IntersectionObserver' in window) {
          const obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && !cmdStage.isOpenTriggered) {
                cmdStage.isOpenTriggered = true;
                cmdStage.openStartTime = performance.now() + 350;
              }
            });
          }, { threshold: 0.22 });
          obs.observe(cmdSection);
        }
      }
    }
  }

  window.initFeltz3DMacBookStages = bootAllStages;
  bootAllStages();
  window.addEventListener('DOMContentLoaded', bootAllStages);

  // Expose helper for external tab buttons & screenshot testing
  window.feltzMacBookStageControl = {
    stages: stages,
    scrollToTab: function (tabIdx) {
      stages.forEach(function (st) {
        st.manualOverrideUntil = performance.now() + 4000;
        st.scrollY = tabIdx === 2 ? 1304 : 0;
      });
    },
    setDebugState: function (opts) {
      stages.forEach(function (st) {
        if (typeof opts.lidProgress === 'number' && st.lidPivot) {
          st.isOpenTriggered = false;
          st.currentLidProgress = opts.lidProgress;
          const eased = easeInOutCubic(opts.lidProgress);
          st.lidPivot.rotation.x = st.closedAngleRad + (st.openAngleRad - st.closedAngleRad) * eased;
        }
        if (typeof opts.scrollY === 'number') {
          st.manualOverrideUntil = performance.now() + 60000;
          st.scrollY = opts.scrollY;
        }
        st.screenUI.renderAtScroll(st.scrollY, st.scrollY > 900 ? 2 : 1);
        st.renderer.render(st.scene, st.camera);
      });
    }
  };

  // Master Animation Loop
  function animate(now) {
    requestAnimationFrame(animate);

    for (let i = 0; i < stages.length; i++) {
      const st = stages[i];
      if (!st.rootGroup) continue;

      // 1. Slow Weighted Lid Opening (0.55s hold closed + 2.8s smooth hinge open)
      if (st.isOpenTriggered && st.lidPivot) {
        const elapsed = now - st.openStartTime;
        const rawP = Math.max(0, Math.min(1, elapsed / st.openDuration));
        st.currentLidProgress = rawP;
        const eased = easeInOutCubic(rawP);
        st.lidPivot.rotation.x = st.closedAngleRad + (st.openAngleRad - st.closedAngleRad) * eased;
      }

      // 2. Subtle Mouse Parallax
      st.currentParallaxX += (st.targetParallaxX - st.currentParallaxX) * 0.08;
      st.currentParallaxY += (st.targetParallaxY - st.currentParallaxY) * 0.08;
      st.rootGroup.rotation.y = st.currentParallaxX;
      st.rootGroup.rotation.x = st.currentParallaxY * 0.5;

      // 3. Continuous Floating-Point Auto-Sliding once lid is >75% open
      if (st.currentLidProgress > 0.75 && now > st.manualOverrideUntil) {
        if (st.scrollHoldTimer > 0) {
          st.scrollHoldTimer--;
        } else {
          st.scrollY += st.scrollDir * 3.6;
          if (st.scrollY >= st.screenUI.maxScroll) {
            st.scrollY = st.screenUI.maxScroll;
            st.scrollDir = -1;
            st.scrollHoldTimer = 85;
          } else if (st.scrollY <= 0) {
            st.scrollY = 0;
            st.scrollDir = 1;
            st.scrollHoldTimer = 85;
          }
        }
      }

      const activeTab = st.scrollY > 900 ? 2 : 1;
      st.screenUI.renderAtScroll(st.scrollY, activeTab);
      st.renderer.render(st.scene, st.camera);
    }
  }

  requestAnimationFrame(animate);
})();
