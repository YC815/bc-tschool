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

  // Background
  ctx.fillStyle = "#1A1208";
  ctx.fillRect(0, 0, W, H);

  // 2×2 photo grid: total photo area y=24..880 → h=856
  const GRID_X = 24;
  const GRID_Y = 24;
  const GRID_W = W - 48; // 1032 → but 2 cols with 16px gap
  const COL_GAP = 16;
  const ROW_GAP = 24;
  const PHOTO_W = (GRID_W - COL_GAP) / 2; // ~508
  const PHOTO_AREA_H = 880 - GRID_Y;
  const PHOTO_H = (PHOTO_AREA_H - ROW_GAP) / 2; // ~416

  const positions = [
    [GRID_X, GRID_Y],
    [GRID_X + PHOTO_W + COL_GAP, GRID_Y],
    [GRID_X, GRID_Y + PHOTO_H + ROW_GAP],
    [GRID_X + PHOTO_W + COL_GAP, GRID_Y + PHOTO_H + ROW_GAP],
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
  }

  // Bottom white bar
  const BAR_Y = 880;
  const BAR_H = 200;
  ctx.fillStyle = "#FDFAF5";
  ctx.fillRect(0, BAR_Y, W, BAR_H);

  // Outer frame inset stroke
  ctx.strokeStyle = "#1A0D00";
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  // Gold quote
  const quote = input.quote || "一段難忘的旅程";
  ctx.fillStyle = "#2A1E0A";
  ctx.font = `italic 28px "EB Garamond", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const quoteText = `「${quote}」`;
  wrapText(ctx, quoteText, W / 2, BAR_Y + 70, W - 120, 36);

  // "100km 完騎" label
  ctx.fillStyle = "#C9A84C";
  ctx.font = `bold 20px Cinzel, serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("100 km 完騎", W - 32, BAR_Y + BAR_H - 24);

  // Nickname
  ctx.fillStyle = "#2A1E0A";
  ctx.font = `18px "Noto Serif TC", serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(input.nickname, 32, BAR_Y + BAR_H - 24);

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
