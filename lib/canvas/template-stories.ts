import { GeneratorInput, MemorialTemplate } from "./types";
import { drawPhotoFilled, drawPlaceholder, ensureFonts, loadImage, wrapText } from "./utils";

const ROMAN = ["I", "II", "III", "IV"] as const;
const LABELS = ["風 × 海", "火", "土 × 木", "金"] as const;
const STATIONS = ["香山", "通霄", "大甲", "台中"] as const;

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

async function generate(input: GeneratorInput): Promise<string> {
  await ensureFonts();

  const W = 1080;
  const H = 1920;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Preload all images once
  const images = await Promise.all(
    input.photos.map(async (src) => {
      if (!src) return null;
      try {
        return await loadImage(src);
      } catch {
        return null;
      }
    })
  );

  // Pick hero image: prefer station 4 → fallback down
  const heroImg = images[3] ?? images[2] ?? images[1] ?? images[0];

  // === FULL BACKGROUND ===
  ctx.fillStyle = "#0D0D0D";
  ctx.fillRect(0, 0, W, H);

  // === ZONE 1: Hero photo + "116" (0 to 672) ===
  const Z1_H = 672;

  if (heroImg) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, Z1_H);
    ctx.clip();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).filter = "brightness(0.55) saturate(0.85)";
    drawPhotoFilled(ctx, heroImg, 0, 0, W, Z1_H);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).filter = "none";
    ctx.restore();
  }

  // Gradient overlay on Zone 1
  const grad1 = ctx.createLinearGradient(0, 0, 0, Z1_H);
  grad1.addColorStop(0, "rgba(0,0,0,0.65)");
  grad1.addColorStop(0.45, "rgba(0,0,0,0.15)");
  grad1.addColorStop(1, "rgba(13,13,13,0.85)");
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, W, Z1_H);

  // Activity header top-left
  ctx.fillStyle = "rgba(201,168,76,0.9)";
  ctx.font = `bold 18px Cinzel, serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("ELEMENTAL RELAY  2025", 44, 44);
  ctx.fillStyle = "rgba(232,213,163,0.55)";
  ctx.font = `16px "Noto Serif TC", serif`;
  ctx.fillText("元素傳遞", 44, 70);

  // "116" giant with gold glow
  ctx.save();
  ctx.fillStyle = "#C9A84C";
  ctx.font = `bold 250px Cinzel, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(201,168,76,0.75)";
  ctx.shadowBlur = 40;
  ctx.fillText("116", W / 2, 340);
  ctx.restore();

  // "km 完騎" below the number
  ctx.fillStyle = "#E8D5A3";
  ctx.font = `bold 38px Cinzel, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("km", W / 2 - 52, 494);

  ctx.fillStyle = "rgba(232,213,163,0.8)";
  ctx.font = `32px "Noto Serif TC", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("完騎", W / 2 + 52, 498);

  // === ZONE 2: Station photos + route (672 to 1440) ===
  const Z2_Y = Z1_H;

  // Divider
  ctx.strokeStyle = "rgba(201,168,76,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, Z2_Y);
  ctx.lineTo(W - 40, Z2_Y);
  ctx.stroke();

  // 4 station thumbnails in a row
  const THUMB = 200;
  const THUMB_GAP = 13;
  const THUMBS_TOTAL_W = 4 * THUMB + 3 * THUMB_GAP;
  const THUMB_START_X = (W - THUMBS_TOTAL_W) / 2;
  const THUMB_Y = Z2_Y + 60;

  for (let i = 0; i < 4; i++) {
    const tx = THUMB_START_X + i * (THUMB + THUMB_GAP);
    const ty = THUMB_Y;
    const img = images[i];

    ctx.save();
    roundRect(ctx, tx, ty, THUMB, THUMB, 8);
    ctx.clip();

    if (img) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as any).filter = "sepia(0.1) brightness(0.88)";
      drawPhotoFilled(ctx, img, tx, ty, THUMB, THUMB);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as any).filter = "none";
    } else {
      drawPlaceholder(ctx, tx, ty, THUMB, THUMB, LABELS[i], ROMAN[i]);
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(201,168,76,0.5)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, tx, ty, THUMB, THUMB, 8);
    ctx.stroke();

    // Element label
    ctx.fillStyle = "#C9A84C";
    ctx.font = `bold 14px "Noto Serif TC", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(LABELS[i], tx + THUMB / 2, ty + THUMB + 10);
  }

  // Route timeline
  const ROUTE_Y = THUMB_Y + THUMB + 56;
  const DOT_R = 6;

  const dotX: number[] = Array.from(
    { length: 4 },
    (_, i) => THUMB_START_X + i * (THUMB + THUMB_GAP) + THUMB / 2
  );

  // Connecting line
  ctx.strokeStyle = "rgba(201,168,76,0.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(dotX[0], ROUTE_Y);
  ctx.lineTo(dotX[3], ROUTE_Y);
  ctx.stroke();

  // Dots
  for (const dx of dotX) {
    ctx.fillStyle = "#C9A84C";
    ctx.beginPath();
    ctx.arc(dx, ROUTE_Y, DOT_R, 0, Math.PI * 2);
    ctx.fill();
  }

  // Station names
  ctx.fillStyle = "#E8D5A3";
  ctx.font = `16px "Noto Serif TC", serif`;
  ctx.textBaseline = "top";
  for (let i = 0; i < 4; i++) {
    ctx.textAlign = "center";
    ctx.fillText(STATIONS[i], dotX[i], ROUTE_Y + DOT_R + 10);
  }

  // Route label: 新竹 → 台中
  ctx.fillStyle = "rgba(201,168,76,0.5)";
  ctx.font = `italic 20px "EB Garamond", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("新竹  ·  台中  116 km", W / 2, ROUTE_Y + DOT_R + 46);

  // === ZONE 3: Quote + name (1440 to 1920) ===
  const Z3_Y = 1440;

  // Subtle background gradient for Zone 3
  const grad3 = ctx.createLinearGradient(0, Z3_Y, 0, H);
  grad3.addColorStop(0, "rgba(26,18,8,0.0)");
  grad3.addColorStop(1, "rgba(26,18,8,0.5)");
  ctx.fillStyle = grad3;
  ctx.fillRect(0, Z3_Y, W, H - Z3_Y);

  // Divider with diamond
  ctx.strokeStyle = "rgba(201,168,76,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, Z3_Y);
  ctx.lineTo(W - 40, Z3_Y);
  ctx.stroke();

  const DMR = 6;
  ctx.fillStyle = "rgba(201,168,76,0.5)";
  ctx.beginPath();
  ctx.moveTo(W / 2, Z3_Y - DMR);
  ctx.lineTo(W / 2 + DMR, Z3_Y);
  ctx.lineTo(W / 2, Z3_Y + DMR);
  ctx.lineTo(W / 2 - DMR, Z3_Y);
  ctx.closePath();
  ctx.fill();

  // Quote
  const quote = input.quote || "一段難忘的旅程";
  ctx.fillStyle = "#E8D5A3";
  ctx.font = `italic 34px "EB Garamond", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const afterQuoteY = wrapText(ctx, `「${quote}」`, W / 2, Z3_Y + 44, W - 120, 50);

  // Name separator line
  const nameSepY = Math.min(Math.max(afterQuoteY + 24, 1720), 1820);
  ctx.strokeStyle = "rgba(201,168,76,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 90, nameSepY);
  ctx.lineTo(W / 2 + 90, nameSepY);
  ctx.stroke();

  // Nickname
  ctx.fillStyle = "#C9A84C";
  ctx.font = `bold 30px "Noto Serif TC", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(input.nickname, W / 2, nameSepY + 18);

  // Activity tag
  ctx.fillStyle = "rgba(201,168,76,0.45)";
  ctx.font = `16px Cinzel, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("元素傳遞  ·  2025", W / 2, nameSepY + 60);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  return canvas.toDataURL("image/png");
}

export const templateStories: MemorialTemplate = {
  id: "stories",
  label: "IG Stories",
  sublabel: "1080 × 1920",
  width: 1080,
  height: 1920,
  generate,
};
