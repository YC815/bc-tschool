import { GeneratorInput, MemorialTemplate } from "./types";
import { drawPhotoFilled, drawPlaceholder, ensureFonts, loadImage, wrapText } from "./utils";

const ROMAN = ["I", "II", "III", "IV"] as const;
const LABELS = ["風 × 海", "火", "土 × 木", "金"] as const;
const ELEMENT_COLORS = ["#4A90D9", "#E87D3E", "#B8955A", "#C9A84C"] as const;

// Bounding boxes: [x, y, w, h]
const PHOTO_BOXES: [number, number, number, number][] = [
  [160, 160, 280, 280], // TL - wind/sea
  [640, 160, 280, 280], // TR - fire
  [160, 540, 280, 280], // BL - earth/wood
  [640, 540, 280, 280], // BR - gold
];

function drawWaveClip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) / 2;
  // Wave-like bezier clip (flowing shape for wind/sea)
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.bezierCurveTo(cx - r, cy - r * 0.6, cx - r * 0.3, cy - r, cx, cy - r);
  ctx.bezierCurveTo(cx + r * 0.3, cy - r, cx + r, cy - r * 0.4, cx + r, cy);
  ctx.bezierCurveTo(cx + r, cy + r * 0.6, cx + r * 0.3, cy + r, cx, cy + r);
  ctx.bezierCurveTo(cx - r * 0.3, cy + r, cx - r, cy + r * 0.4, cx - r, cy);
  ctx.closePath();
}

function drawDiamondClip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2 * 0.85;
  const ry = h / 2 * 0.85;
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry);
  ctx.lineTo(cx + rx, cy);
  ctx.lineTo(cx, cy + ry);
  ctx.lineTo(cx - rx, cy);
  ctx.closePath();
}

function drawArchClip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const archH = h * 0.55;
  const flatH = h - archH;
  const cx = x + w / 2;
  const archTop = y;
  const r = w / 2 * 0.9;
  ctx.beginPath();
  ctx.moveTo(x + (w - r * 2) / 2, y + archH);
  ctx.lineTo(x + (w - r * 2) / 2, y + h);
  ctx.lineTo(x + (w - r * 2) / 2 + r * 2, y + h);
  ctx.lineTo(x + (w - r * 2) / 2 + r * 2, y + archH);
  ctx.arc(cx, archTop + archH, r, 0, Math.PI, true);
  ctx.closePath();
  // Clamp within box
  void flatH;
}

function drawCircleClip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) / 2 * 0.9;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
}

async function generate(input: GeneratorInput): Promise<string> {
  await ensureFonts();

  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, W, H);

  // Concentric octagon decorative lines
  const CENTER_X = W / 2;
  const CENTER_Y = H / 2;
  for (let r = 100; r <= 500; r += 80) {
    ctx.strokeStyle = `rgba(201,168,76,${0.04 + (r / 500) * 0.04})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const angle = (k / 8) * Math.PI * 2 - Math.PI / 8;
      const px = CENTER_X + r * Math.cos(angle);
      const py = CENTER_Y + r * Math.sin(angle);
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Outer circle ring
  ctx.strokeStyle = "rgba(201,168,76,0.3)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(CENTER_X, CENTER_Y, 520, 0, Math.PI * 2);
  ctx.stroke();

  // Center dividing lines
  ctx.strokeStyle = "rgba(201,168,76,0.2)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.moveTo(0, H / 2);
  ctx.lineTo(W, H / 2);
  ctx.stroke();

  // 4 photo quadrants with different clip shapes
  const clipFns = [drawWaveClip, drawDiamondClip, drawArchClip, drawCircleClip];

  for (let i = 0; i < 4; i++) {
    const [px, py, pw, ph] = PHOTO_BOXES[i];
    const photoSrc = input.photos[i];
    const color = ELEMENT_COLORS[i];
    const clipFn = clipFns[i];

    ctx.save();
    clipFn(ctx, px, py, pw, ph);
    ctx.clip();

    if (photoSrc) {
      try {
        const img = await loadImage(photoSrc);
        drawPhotoFilled(ctx, img, px, py, pw, ph);
      } catch {
        drawPlaceholder(ctx, px, py, pw, ph, LABELS[i], ROMAN[i]);
      }
    } else {
      drawPlaceholder(ctx, px, py, pw, ph, LABELS[i], ROMAN[i]);
    }
    ctx.restore();

    // Colored border stroke using same path
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.save();
    clipFn(ctx, px, py, pw, ph);
    ctx.stroke();
    ctx.restore();

    // Element label outside quadrant
    const labelPositions: [number, number, CanvasTextAlign][] = [
      [px + pw / 2, py - 20, "center"],      // TL - above
      [px + pw / 2, py - 20, "center"],      // TR - above
      [px + pw / 2, py + ph + 30, "center"], // BL - below
      [px + pw / 2, py + ph + 30, "center"], // BR - below
    ];

    const [lx, ly, la] = labelPositions[i];
    ctx.fillStyle = color;
    ctx.font = `bold 16px Cinzel, serif`;
    ctx.textAlign = la;
    ctx.textBaseline = "middle";
    ctx.fillText(LABELS[i], lx, ly);
  }

  // Quote area at bottom
  const QUOTE_Y = 860;
  ctx.fillStyle = "rgba(201,168,76,0.06)";
  ctx.fillRect(80, QUOTE_Y - 20, W - 160, 100);

  ctx.strokeStyle = "rgba(201,168,76,0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(80, QUOTE_Y - 20, W - 160, 100);

  const quoteText = input.quote ? `「${input.quote}」` : "「一段難忘的旅程」";
  ctx.fillStyle = "#E8D5A3";
  ctx.font = `italic 28px "EB Garamond", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  wrapText(ctx, quoteText, W / 2, QUOTE_Y - 6, W - 200, 38);

  // Footer label
  ctx.fillStyle = "rgba(201,168,76,0.4)";
  ctx.font = `14px Cinzel, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("100km 元素傳遞", W / 2, H - 20);

  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}

export const templateShield: MemorialTemplate = {
  id: "shield",
  label: "元素煉金徽章",
  sublabel: "1080 × 1080",
  width: 1080,
  height: 1080,
  generate,
};
