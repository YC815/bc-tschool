import { GeneratorInput, MemorialTemplate } from "./types";
import { drawPhotoFilled, drawPlaceholder, ensureFonts, loadImage, wrapText } from "./utils";

const ROMAN = ["I", "II", "III", "IV"] as const;
const LABELS = ["風 × 海", "火", "土 × 木", "金"] as const;

async function generate(input: GeneratorInput): Promise<string> {
  await ensureFonts();

  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 1. 全畫布深褐色背景
  ctx.fillStyle = "#1A1208";
  ctx.fillRect(0, 0, W, H);

  // 2. 雙線金框
  ctx.strokeStyle = "rgba(201,168,76,0.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, W - 24, H - 24);

  ctx.strokeStyle = "rgba(201,168,76,0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // 3. 四角刻度線（L 型，16px）
  const TICK = 16;
  const corners = [
    { x: 20, y: 20, dx: 1, dy: 1 },
    { x: W - 20, y: 20, dx: -1, dy: 1 },
    { x: 20, y: H - 20, dx: 1, dy: -1 },
    { x: W - 20, y: H - 20, dx: -1, dy: -1 },
  ];
  ctx.strokeStyle = "#C9A84C";
  ctx.lineWidth = 1.5;
  for (const { x, y, dx, dy } of corners) {
    ctx.beginPath();
    ctx.moveTo(x + dx * TICK, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * TICK);
    ctx.stroke();
  }

  // 4. 照片格線（2×2），外邊距 40px，格間距 12px
  const MARGIN = 40;
  const GAP = 12;
  const PHOTO_AREA_BOTTOM = 880;
  const PHOTO_W = (W - MARGIN * 2 - GAP) / 2; // 494
  const PHOTO_H = (PHOTO_AREA_BOTTOM - MARGIN - GAP) / 2; // 414

  const positions: [number, number][] = [
    [MARGIN, MARGIN],
    [MARGIN + PHOTO_W + GAP, MARGIN],
    [MARGIN, MARGIN + PHOTO_H + GAP],
    [MARGIN + PHOTO_W + GAP, MARGIN + PHOTO_H + GAP],
  ];

  for (let i = 0; i < 4; i++) {
    const [px, py] = positions[i];
    const photoSrc = input.photos[i];
    if (photoSrc) {
      try {
        const img = await loadImage(photoSrc);
        ctx.save();
        ctx.beginPath();
        ctx.rect(px, py, PHOTO_W, PHOTO_H);
        ctx.clip();
        drawPhotoFilled(ctx, img, px, py, PHOTO_W, PHOTO_H);
        ctx.restore();
      } catch {
        drawPlaceholder(ctx, px, py, PHOTO_W, PHOTO_H, LABELS[i], ROMAN[i]);
      }
    } else {
      drawPlaceholder(ctx, px, py, PHOTO_W, PHOTO_H, LABELS[i], ROMAN[i]);
    }
    // 每格照片極細金邊
    ctx.strokeStyle = "rgba(201,168,76,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, PHOTO_W - 1, PHOTO_H - 1);
  }

  // 5. 中心菱形（四格交叉點，x=540, y=460）
  const DX = MARGIN + PHOTO_W + GAP / 2; // 540
  const DY = MARGIN + PHOTO_H + GAP / 2; // 460
  const DR = 4;
  ctx.fillStyle = "rgba(201,168,76,0.7)";
  ctx.beginPath();
  ctx.moveTo(DX, DY - DR);
  ctx.lineTo(DX + DR, DY);
  ctx.lineTo(DX, DY + DR);
  ctx.lineTo(DX - DR, DY);
  ctx.closePath();
  ctx.fill();

  // 6. 頁腳深色 overlay + 分隔線
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, PHOTO_AREA_BOTTOM, W, H - PHOTO_AREA_BOTTOM);

  ctx.strokeStyle = "rgba(201,168,76,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, 892);
  ctx.lineTo(W - MARGIN, 892);
  ctx.stroke();

  // 7. 文字層級（深底亮色）
  const quote = input.quote || "一段難忘的旅程";
  ctx.fillStyle = "#E8D5A3";
  ctx.font = `italic 26px "EB Garamond", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  wrapText(ctx, `「${quote}」`, W / 2, 930, 900, 36);

  ctx.fillStyle = "#C9A84C";
  ctx.font = `bold 16px Cinzel, serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("100 km 完騎", W - MARGIN, H - 24);

  ctx.fillStyle = "rgba(232,213,163,0.6)";
  ctx.font = `16px "Noto Serif TC", serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(input.nickname, MARGIN, H - 24);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  return canvas.toDataURL("image/png");
}

export const templatePolaroid: MemorialTemplate = {
  id: "polaroid",
  label: "經典拍立得",
  sublabel: "1080 × 1080",
  width: 1080,
  height: 1080,
  generate,
};
