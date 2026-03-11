import { GeneratorInput, MemorialTemplate } from "./types";
import { drawPhotoFilled, drawPlaceholder, ensureFonts, loadImage, wrapText } from "./utils";

const ROMAN = ["I", "II", "III", "IV"] as const;
const LABELS = ["風 × 海", "火", "土 × 木", "金"] as const;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ── SVG-style element badge icons ──────────────────────────────────────────

/** 風×海: three flowing S-curve waves + small wind spiral */
function drawIconWave(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const wl = r * 0.95;
  const amp = r * 0.18;
  const vgap = r * 0.3;

  for (let i = 0; i < 3; i++) {
    const wy = cy - vgap + i * vgap;
    ctx.beginPath();
    ctx.moveTo(cx - wl, wy);
    ctx.bezierCurveTo(cx - wl * 0.5, wy - amp, cx - wl * 0.1, wy + amp, cx, wy);
    ctx.bezierCurveTo(cx + wl * 0.1, wy - amp, cx + wl * 0.5, wy + amp, cx + wl, wy);
    ctx.stroke();
  }

  // Wind spiral (top-right corner)
  ctx.save();
  ctx.lineWidth *= 0.75;
  const sx = cx + r * 0.42;
  const sy = cy - r * 0.62;
  ctx.beginPath();
  ctx.arc(sx, sy, r * 0.22, Math.PI * 0.15, Math.PI * 1.85, false);
  ctx.stroke();
  // curl tail pointing inward
  ctx.beginPath();
  ctx.moveTo(sx + r * 0.22, sy);
  ctx.quadraticCurveTo(sx + r * 0.28, sy + r * 0.12, sx + r * 0.14, sy + r * 0.2);
  ctx.stroke();
  ctx.restore();
}

/** 火: dancing flame with flickering tongues */
function drawIconFire(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Three flame tongues: center (tallest), left, right
  const baseY = cy + r * 0.75;

  // Helper to draw one flame tongue
  const drawTongue = (
    tipX: number,
    tipY: number,
    baseLeftX: number,
    baseRightX: number,
    lean: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(baseLeftX, baseY);
    // Left curve up to tip
    ctx.bezierCurveTo(
      baseLeftX + (tipX - baseLeftX) * 0.3,
      baseY - (baseY - tipY) * 0.4,
      tipX - lean * 0.3,
      tipY + (baseY - tipY) * 0.3,
      tipX,
      tipY
    );
    // Right curve down to base
    ctx.bezierCurveTo(
      tipX + lean * 0.3,
      tipY + (baseY - tipY) * 0.3,
      baseRightX - (baseRightX - tipX) * 0.3,
      baseY - (baseY - tipY) * 0.4,
      baseRightX,
      baseY
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Left tongue (smaller, leaning left)
  drawTongue(
    cx - r * 0.35,
    cy - r * 0.25,
    cx - r * 0.55,
    cx - r * 0.05,
    -r * 0.15
  );

  // Right tongue (smaller, leaning right)
  drawTongue(
    cx + r * 0.35,
    cy - r * 0.20,
    cx + r * 0.05,
    cx + r * 0.55,
    r * 0.15
  );

  // Center tongue (tallest, main flame)
  drawTongue(
    cx,
    cy - r * 0.72,
    cx - r * 0.42,
    cx + r * 0.42,
    0
  );

  // Inner bright core (smaller flame inside center)
  ctx.save();
  ctx.strokeStyle = "rgba(201,168,76,0.5)";
  ctx.fillStyle = "rgba(201,168,76,0.15)";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.18, baseY - r * 0.15);
  ctx.bezierCurveTo(
    cx - r * 0.12,
    baseY - r * 0.45,
    cx - r * 0.05,
    cy - r * 0.25,
    cx,
    cy - r * 0.42
  );
  ctx.bezierCurveTo(
    cx + r * 0.05,
    cy - r * 0.25,
    cx + r * 0.12,
    baseY - r * 0.45,
    cx + r * 0.18,
    baseY - r * 0.15
  );
  ctx.quadraticCurveTo(cx, baseY, cx - r * 0.18, baseY - r * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** 土×木: mountain silhouette with tree on peak */
function drawIconEarth(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const baseY = cy + r * 0.48;
  const pkX = cx + r * 0.55;
  const pkY = cy - r * 0.55;

  // Mountain silhouette (fill then stroke)
  ctx.beginPath();
  ctx.moveTo(cx - r, baseY);
  ctx.lineTo(cx - r * 0.12, cy - r * 0.22);   // left peak (shorter)
  ctx.lineTo(cx + r * 0.22, cy + r * 0.08);   // saddle
  ctx.lineTo(pkX, pkY);                         // main peak (taller, right)
  ctx.lineTo(cx + r, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tree trunk on main peak
  const trunkTop = pkY - r * 0.28;
  ctx.beginPath();
  ctx.moveTo(pkX, pkY - r * 0.02);
  ctx.lineTo(pkX, trunkTop);
  ctx.stroke();

  // Four branches (two levels)
  const branches: [number, number][] = [
    [-r * 0.14, pkY - r * 0.16],
    [r * 0.14, pkY - r * 0.16],
    [-r * 0.1, pkY - r * 0.23],
    [r * 0.1, pkY - r * 0.23],
  ];
  for (const [bdx, bdy] of branches) {
    ctx.beginPath();
    ctx.moveTo(pkX, bdy);
    ctx.lineTo(pkX + bdx, bdy - r * 0.09);
    ctx.stroke();
  }
}

/** 金: 8-pointed star (compass rose) with center dot */
function drawIconMetal(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const n = 8;
  const r1 = r;
  const r2 = r * 0.4;

  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const angle = (i * Math.PI) / n - Math.PI / 2;
    const rad = i % 2 === 0 ? r1 : r2;
    const x = cx + rad * Math.cos(angle);
    const y = cy + rad * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "#C9A84C";
  ctx.fill();
}

/** Draw a full badge (background + border + icon) */
function drawBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  index: number
) {
  const r = size / 2;

  // Background
  ctx.fillStyle = "#120D06";
  roundRect(ctx, cx - r, cy - r, size, size, 7);
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(201,168,76,0.55)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, cx - r, cy - r, size, size, 7);
  ctx.stroke();

  // Icon
  ctx.save();
  ctx.strokeStyle = "#C9A84C";
  ctx.fillStyle = "rgba(201,168,76,0.14)";
  ctx.lineWidth = size * 0.038;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const ir = size * 0.28; // icon radius (drawing space)
  switch (index) {
    case 0: drawIconWave(ctx, cx, cy, ir); break;
    case 1: drawIconFire(ctx, cx, cy, ir); break;
    case 2: drawIconEarth(ctx, cx, cy, ir); break;
    case 3: drawIconMetal(ctx, cx, cy, ir); break;
  }
  ctx.restore();
}

// ── Main generator ──────────────────────────────────────────────────────────

async function generate(input: GeneratorInput): Promise<string> {
  await ensureFonts();

  const W = 1500;
  const H = 1050;
  const SPLIT = 900;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Preload all images once
  const images = await Promise.all(
    input.photos.map(async (src) => {
      if (!src) return null;
      try { return await loadImage(src); }
      catch { return null; }
    })
  );

  // === BACKGROUND ===
  ctx.fillStyle = "#1A1208";
  ctx.fillRect(0, 0, W, H);

  // Subtle vignette on right panel
  const panelGrad = ctx.createLinearGradient(SPLIT, 0, W, H);
  panelGrad.addColorStop(0, "rgba(0,0,0,0.0)");
  panelGrad.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = panelGrad;
  ctx.fillRect(SPLIT, 0, W - SPLIT, H);

  // === LEFT SIDE: 2×2 Photo Collage (0 to SPLIT) ===
  const PAD = 40;
  const GAP = 12;
  const PHOTO_W = (SPLIT - PAD * 2 - GAP) / 2;
  const PHOTO_H = (H - PAD * 2 - GAP) / 2;

  const positions: [number, number][] = [
    [PAD, PAD],
    [PAD + PHOTO_W + GAP, PAD],
    [PAD, PAD + PHOTO_H + GAP],
    [PAD + PHOTO_W + GAP, PAD + PHOTO_H + GAP],
  ];

  for (let i = 0; i < 4; i++) {
    const [px, py] = positions[i];
    const img = images[i];

    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, PHOTO_W, PHOTO_H);
    ctx.clip();

    if (img) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as any).filter = "sepia(0.15) contrast(1.05) brightness(0.95)";
      drawPhotoFilled(ctx, img, px, py, PHOTO_W, PHOTO_H);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as any).filter = "none";
    } else {
      drawPlaceholder(ctx, px, py, PHOTO_W, PHOTO_H, LABELS[i], ROMAN[i]);
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(201,168,76,0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px + 0.5, py + 0.5, PHOTO_W - 1, PHOTO_H - 1);
  }

  // Center diamond at 4-cell intersection
  const DX = PAD + PHOTO_W + GAP / 2;
  const DY = PAD + PHOTO_H + GAP / 2;
  const DR = 5;
  ctx.fillStyle = "rgba(201,168,76,0.7)";
  ctx.beginPath();
  ctx.moveTo(DX, DY - DR);
  ctx.lineTo(DX + DR, DY);
  ctx.lineTo(DX, DY + DR);
  ctx.lineTo(DX - DR, DY);
  ctx.closePath();
  ctx.fill();

  // Vertical divider
  ctx.strokeStyle = "rgba(201,168,76,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(SPLIT, 0);
  ctx.lineTo(SPLIT, H);
  ctx.stroke();

  // === RIGHT SIDE: Info Panel ===
  const RCX = SPLIT + (W - SPLIT) / 2; // = 1200
  const RPAD = 50;
  const RW = W - SPLIT - RPAD * 2;

  // --- Stamp circle: "2026 環島" ---
  const STAMP_Y = 115;
  const STAMP_R = 62;

  ctx.save();
  // Outer dashed ring
  ctx.strokeStyle = "#C9A84C";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(RCX, STAMP_Y, STAMP_R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // Inner solid ring
  ctx.strokeStyle = "rgba(201,168,76,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(RCX, STAMP_Y, STAMP_R - 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Stamp text: "2026" + "環島"
  ctx.fillStyle = "#C9A84C";
  ctx.font = `bold 28px Cinzel, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("2026", RCX, STAMP_Y - 12);
  ctx.font = `bold 22px "Noto Serif TC", serif`;
  ctx.fillText("環島", RCX, STAMP_Y + 16);

  // --- 4 SVG-style element badges ---
  const BADGE_SIZE = 96;
  const BADGE_GAP = 8;
  const BADGES_TOTAL_W = 4 * BADGE_SIZE + 3 * BADGE_GAP;
  const BADGE_START_X = RCX - BADGES_TOTAL_W / 2;
  const BADGE_Y = 215;

  for (let i = 0; i < 4; i++) {
    const bx = BADGE_START_X + i * (BADGE_SIZE + BADGE_GAP) + BADGE_SIZE / 2;
    const by = BADGE_Y + BADGE_SIZE / 2;
    drawBadge(ctx, bx, by, BADGE_SIZE, i);

    // Element label below badge
    ctx.fillStyle = "rgba(201,168,76,0.72)";
    ctx.font = `11px "Noto Serif TC", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(LABELS[i], bx, BADGE_Y + BADGE_SIZE + 6);
  }

  // --- Route info ---
  const ROUTE_Y = 390;
  const LINE_START_X = SPLIT + RPAD;
  const LINE_END_X = W - RPAD;

  ctx.fillStyle = "#E8D5A3";
  ctx.font = `20px "Noto Serif TC", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("新竹", LINE_START_X + 20, ROUTE_Y);
  ctx.fillText("台中", LINE_END_X - 20, ROUTE_Y);

  ctx.strokeStyle = "rgba(201,168,76,0.45)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(LINE_START_X + 50, ROUTE_Y);
  ctx.lineTo(LINE_END_X - 50, ROUTE_Y);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const dx of [LINE_START_X + 50, LINE_END_X - 50]) {
    ctx.fillStyle = "#C9A84C";
    ctx.beginPath();
    ctx.arc(dx, ROUTE_Y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 116 km badge ---
  const DIST_Y = 530;
  ctx.save();
  ctx.fillStyle = "#C9A84C";
  ctx.font = `bold 80px Cinzel, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(201,168,76,0.5)";
  ctx.shadowBlur = 24;
  ctx.fillText("116", RCX, DIST_Y);
  ctx.restore();

  ctx.fillStyle = "rgba(232,213,163,0.75)";
  ctx.font = `26px Cinzel, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("km  完騎", RCX, DIST_Y + 50);

  // --- Divider with diamond ---
  const DIV_Y = 720;
  ctx.strokeStyle = "rgba(201,168,76,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(LINE_START_X, DIV_Y);
  ctx.lineTo(LINE_END_X, DIV_Y);
  ctx.stroke();

  const DMR = 5;
  ctx.fillStyle = "rgba(201,168,76,0.5)";
  ctx.beginPath();
  ctx.moveTo(RCX, DIV_Y - DMR);
  ctx.lineTo(RCX + DMR, DIV_Y);
  ctx.lineTo(RCX, DIV_Y + DMR);
  ctx.lineTo(RCX - DMR, DIV_Y);
  ctx.closePath();
  ctx.fill();

  // --- Nickname ---
  ctx.fillStyle = "#E8D5A3";
  ctx.font = `bold 30px "Noto Serif TC", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(input.nickname, RCX, DIV_Y + 24);

  // --- Quote ---
  const quote = input.quote || "一段難忘的旅程";
  ctx.fillStyle = "rgba(232,213,163,0.65)";
  ctx.font = `italic 22px "EB Garamond", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  wrapText(ctx, `「${quote}」`, RCX, DIV_Y + 68, RW, 32);

  // === OUTER FRAME ===
  ctx.strokeStyle = "rgba(201,168,76,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.strokeStyle = "rgba(201,168,76,0.2)";
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Corner ticks
  const TICK = 18;
  const tickCorners = [
    { x: 18, y: 18, dx: 1, dy: 1 },
    { x: W - 18, y: 18, dx: -1, dy: 1 },
    { x: 18, y: H - 18, dx: 1, dy: -1 },
    { x: W - 18, y: H - 18, dx: -1, dy: -1 },
  ];
  ctx.strokeStyle = "#C9A84C";
  ctx.lineWidth = 1.5;
  for (const { x, y, dx, dy } of tickCorners) {
    ctx.beginPath();
    ctx.moveTo(x + dx * TICK, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * TICK);
    ctx.stroke();
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  return canvas.toDataURL("image/png");
}

export const templatePostcard: MemorialTemplate = {
  id: "postcard",
  label: "明信片",
  sublabel: "1500 × 1050",
  width: 1500,
  height: 1050,
  generate,
};
