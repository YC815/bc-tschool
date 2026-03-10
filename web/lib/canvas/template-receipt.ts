import { GeneratorInput, MemorialTemplate } from "./types";
import { drawPhotoFilled, drawPlaceholder, drawNoise, ensureFonts, loadImage, wrapText } from "./utils";

const ROMAN = ["I", "II", "III", "IV"] as const;
const ITEM_LABELS = [
  { name: "香山的風", element: "風 × 海", color: "#4A90D9" },
  { name: "通霄的火", element: "火", color: "#E87D3E" },
  { name: "大甲的土", element: "土 × 木", color: "#B8955A" },
  { name: "台中的金", element: "金", color: "#C9A84C" },
] as const;

async function generate(input: GeneratorInput): Promise<string> {
  await ensureFonts();

  const W = 720;
  const H = 1280;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#F5F0E8";
  ctx.fillRect(0, 0, W, H);
  drawNoise(ctx, W, H, 0.04);

  // Header
  ctx.fillStyle = "#2A1E0A";
  ctx.font = `bold 52px "Noto Serif TC", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("元素傳遞所", W / 2, 90);

  ctx.font = `18px "Noto Serif TC", serif`;
  ctx.fillStyle = "#6B5A3E";
  ctx.fillText("單車環島 Day.2｜新竹 → 台中｜101km", W / 2, 124);

  // Divider
  ctx.strokeStyle = "#2A1E0A";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(32, 144);
  ctx.lineTo(W - 32, 144);
  ctx.stroke();
  ctx.setLineDash([]);

  // 4 line items
  const ITEM_START_Y = 164;
  const ITEM_H = 160;
  const THUMB = 100;
  const THUMB_X = 40;
  const TEXT_X = THUMB_X + THUMB + 24;

  for (let i = 0; i < 4; i++) {
    const itemY = ITEM_START_Y + i * ITEM_H;
    const meta = ITEM_LABELS[i];
    const photoSrc = input.photos[i];

    // Thumbnail
    ctx.save();
    ctx.beginPath();
    ctx.rect(THUMB_X, itemY + (ITEM_H - THUMB) / 2, THUMB, THUMB);
    ctx.clip();

    if (photoSrc) {
      try {
        const img = await loadImage(photoSrc);
        // sepia-like: draw image, then overlay
        drawPhotoFilled(ctx, img, THUMB_X, itemY + (ITEM_H - THUMB) / 2, THUMB, THUMB);
        ctx.fillStyle = "rgba(139,90,43,0.25)";
        ctx.fillRect(THUMB_X, itemY + (ITEM_H - THUMB) / 2, THUMB, THUMB);
      } catch {
        drawPlaceholder(ctx, THUMB_X, itemY + (ITEM_H - THUMB) / 2, THUMB, THUMB, meta.element, ROMAN[i]);
      }
    } else {
      drawPlaceholder(ctx, THUMB_X, itemY + (ITEM_H - THUMB) / 2, THUMB, THUMB, meta.element, ROMAN[i]);
    }
    ctx.restore();

    // Item text
    ctx.fillStyle = "#2A1E0A";
    ctx.font = `bold 22px "Noto Serif TC", serif`;
    ctx.textAlign = "left";
    ctx.fillText(`購買 ${meta.name}`, TEXT_X, itemY + 44);

    ctx.fillStyle = meta.color;
    ctx.font = `16px "Noto Serif TC", serif`;
    ctx.fillText(`元素：${meta.element}`, TEXT_X, itemY + 70);

    ctx.fillStyle = "#8B7355";
    ctx.font = `14px "EB Garamond", serif`;
    ctx.fillText("數量：× 1", TEXT_X, itemY + 92);

    const submsgRaw = (i === 0
      ? input.photos[0]
      : i === 1
      ? input.photos[1]
      : i === 2
      ? input.photos[2]
      : input.photos[3])
      ? "✓ 已蒐集"
      : "— 未蒐集";
    ctx.fillStyle = submsgRaw.startsWith("✓") ? "#4A8A4A" : "#8B7355";
    ctx.font = `14px "Noto Serif TC", serif`;
    ctx.fillText(submsgRaw, TEXT_X, itemY + 114);

    // Row divider
    ctx.strokeStyle = "rgba(42,30,10,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(32, itemY + ITEM_H - 4);
    ctx.lineTo(W - 32, itemY + ITEM_H - 4);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const ITEMS_END_Y = ITEM_START_Y + 4 * ITEM_H + 16;

  // Total
  ctx.fillStyle = "#2A1E0A";
  ctx.font = `bold 20px "Noto Serif TC", serif`;
  ctx.textAlign = "right";
  ctx.fillText("花費：堅持與毅力", W - 40, ITEMS_END_Y + 40);

  // Dashed border
  ctx.strokeStyle = "rgba(42,30,10,0.2)";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(32, ITEMS_END_Y + 60);
  ctx.lineTo(W - 32, ITEMS_END_Y + 60);
  ctx.stroke();
  ctx.setLineDash([]);

  // Signature
  ctx.fillStyle = "#6B5A3E";
  ctx.font = `20px "Noto Serif TC", serif`;
  ctx.textAlign = "left";
  ctx.fillText("顧客簽名", 40, ITEMS_END_Y + 100);

  ctx.fillStyle = "#2A1E0A";
  ctx.font = `italic 32px "EB Garamond", serif`;
  const quoteText = input.quote || "一段難忘的旅程";
  wrapText(ctx, `「${quoteText}」`, 40, ITEMS_END_Y + 136, W - 80, 40);

  // Footer
  ctx.fillStyle = "#8B7355";
  ctx.font = `14px Cinzel, serif`;
  ctx.textAlign = "center";
  ctx.fillText("元素傳遞所 · 100 KM COMPLETE · 感謝您的旅程", W / 2, H - 32);

  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}

export const templateReceipt: MemorialTemplate = {
  id: "receipt",
  label: "百公里收據",
  sublabel: "720 × 1280",
  width: 720,
  height: 1280,
  generate,
};
