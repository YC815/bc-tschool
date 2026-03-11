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

  // IG Story Safe Zone - 精準邊界規劃
  // 頂部 250px: 頭像、帳號名稱、動態點點
  // 底部 250px: 發送訊息框、連結貼紙
  // 左右 60px: 避免邊緣裁切
  const SAFE_TOP = 250;
  const SAFE_BOTTOM = 250;
  const SAFE_PADDING_X = 60;
  const SAFE_WIDTH = W - SAFE_PADDING_X * 2; // 960px
  const SAFE_HEIGHT = H - SAFE_TOP - SAFE_BOTTOM; // 1420px

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

  // === BACKGROUND PHOTO (全螢幕，但內容在安全區) ===
  if (heroImg) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.clip();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).filter = "brightness(0.35) saturate(0.85)";
    drawPhotoFilled(ctx, heroImg, 0, 0, W, H);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).filter = "none";
    ctx.restore();
  }

  // Gradient overlay for safe zone protection
  // Top gradient - stronger for UI protection
  const gradTop = ctx.createLinearGradient(0, 0, 0, SAFE_TOP);
  gradTop.addColorStop(0, "rgba(0,0,0,0.92)");
  gradTop.addColorStop(0.6, "rgba(0,0,0,0.6)");
  gradTop.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradTop;
  ctx.fillRect(0, 0, W, SAFE_TOP);

  // Bottom gradient - stronger for UI protection
  const gradBottom = ctx.createLinearGradient(0, H - SAFE_BOTTOM, 0, H);
  gradBottom.addColorStop(0, "rgba(0,0,0,0)");
  gradBottom.addColorStop(0.4, "rgba(0,0,0,0.7)");
  gradBottom.addColorStop(1, "rgba(0,0,0,0.95)");
  ctx.fillStyle = gradBottom;
  ctx.fillRect(0, H - SAFE_BOTTOM, W, SAFE_BOTTOM);

  // === SAFE ZONE BOUNDARIES (for debugging - remove in production) ===
  // ctx.strokeStyle = "rgba(255,0,0,0.3)";
  // ctx.lineWidth = 1;
  // ctx.strokeRect(SAFE_PADDING_X, SAFE_TOP, SAFE_WIDTH, SAFE_HEIGHT);

  // === MAIN CONTENT - ALL WITHIN SAFE ZONE ===
  const CENTER_X = W / 2;

  // 大標題 - 放在 116 上方，字更大
  const titleY = SAFE_TOP + SAFE_HEIGHT * 0.08;
  ctx.fillStyle = "rgba(201,168,76,0.95)";
  ctx.font = `bold 42px Cinzel, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("2026 環島 Day.2", CENTER_X, titleY);

  // "116" - Centered in safe zone
  const numberY = SAFE_TOP + SAFE_HEIGHT * 0.22;
  ctx.save();
  ctx.fillStyle = "#C9A84C";
  ctx.font = `bold 300px Cinzel, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(201,168,76,0.85)";
  ctx.shadowBlur = 50;
  ctx.fillText("116", CENTER_X, numberY);
  ctx.restore();

  // "km 完騎"
  const kmY = numberY + 150;
  ctx.fillStyle = "#E8D5A3";
  ctx.font = `bold 48px Cinzel, serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("km", CENTER_X - 12, kmY);

  ctx.fillStyle = "rgba(232,213,163,0.95)";
  ctx.font = `bold 42px "Noto Serif TC", serif`;
  ctx.textAlign = "left";
  ctx.fillText("完騎", CENTER_X + 12, kmY);

  // === STATION PHOTOS GRID (2x2 within safe zone) ===
  const GRID_Y = SAFE_TOP + SAFE_HEIGHT * 0.42;
  const THUMB = 195;
  const THUMB_GAP = 24;
  const GRID_W = 2 * THUMB + THUMB_GAP;
  const GRID_START_X = (W - GRID_W) / 2;

  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const tx = GRID_START_X + col * (THUMB + THUMB_GAP);
    const ty = GRID_Y + row * (THUMB + THUMB_GAP + 40);
    const img = images[i];

    // Photo frame with border
    ctx.save();
    roundRect(ctx, tx, ty, THUMB, THUMB, 10);
    ctx.clip();

    if (img) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as any).filter = "sepia(0.06) brightness(0.94)";
      drawPhotoFilled(ctx, img, tx, ty, THUMB, THUMB);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as any).filter = "none";
    } else {
      drawPlaceholder(ctx, tx, ty, THUMB, THUMB, LABELS[i], ROMAN[i]);
    }
    ctx.restore();

    // Border
    ctx.strokeStyle = "rgba(201,168,76,0.65)";
    ctx.lineWidth = 2;
    roundRect(ctx, tx, ty, THUMB, THUMB, 10);
    ctx.stroke();

    // Station number + element label
    ctx.fillStyle = "#C9A84C";
    ctx.font = `bold 16px Cinzel, serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(ROMAN[i], tx, ty + THUMB + 10);

    ctx.fillStyle = "rgba(232,213,163,0.85)";
    ctx.font = `bold 15px "Noto Serif TC", serif`;
    ctx.textAlign = "right";
    ctx.fillText(LABELS[i], tx + THUMB, ty + THUMB + 11);
  }

  // === ROUTE INFO ===
  const ROUTE_Y = GRID_Y + 2 * (THUMB + THUMB_GAP + 40) + 25;

  // Route line - 四個站點置中排列
  const routeGap = THUMB + THUMB_GAP;
  const totalRouteWidth = 3 * routeGap; // 四個點之間有三個間隔
  const routeStartX = CENTER_X - totalRouteWidth / 2;
  
  ctx.strokeStyle = "rgba(201,168,76,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(routeStartX, ROUTE_Y);
  ctx.lineTo(routeStartX + totalRouteWidth, ROUTE_Y);
  ctx.stroke();

  // Station dots and names - 四個點置中
  const DOT_R = 7;
  const stationDots = [
    routeStartX,
    routeStartX + routeGap,
    routeStartX + 2 * routeGap,
    routeStartX + 3 * routeGap,
  ];

  for (let i = 0; i < 4; i++) {
    const dx = stationDots[i];

    // Dot
    ctx.fillStyle = "#C9A84C";
    ctx.beginPath();
    ctx.arc(dx, ROUTE_Y, DOT_R, 0, Math.PI * 2);
    ctx.fill();

    // Station name
    ctx.fillStyle = "#E8D5A3";
    ctx.font = `bold 18px "Noto Serif TC", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(STATIONS[i], dx, ROUTE_Y + DOT_R + 10);
  }

  // Route summary
  ctx.fillStyle = "rgba(201,168,76,0.75)";
  ctx.font = `italic 22px "EB Garamond", serif`;
  ctx.textAlign = "center";
  ctx.fillText("新竹  →  台中  ·  116 km", CENTER_X, ROUTE_Y + 48);

  // === QUOTE & NAME (within safe zone bottom) ===
  // 增加與上方路線資訊的間距，避免重疊
  const QUOTE_Y = SAFE_TOP + SAFE_HEIGHT - 180;

  // Quote - 限制最多 2 行，避免擋到暱稱
  const quote = input.quote || "一段難忘的旅程";
  ctx.fillStyle = "#E8D5A3";
  ctx.font = `italic 38px "EB Garamond", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const afterQuoteY = wrapText(ctx, `「${quote}」`, CENTER_X, QUOTE_Y, SAFE_WIDTH - 80, 52, 2);

  // Name separator line - 動態計算位置，確保與引言有足夠間距
  const nameY = Math.max(afterQuoteY + 20, QUOTE_Y + 110);
  ctx.strokeStyle = "rgba(201,168,76,0.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(CENTER_X - 110, nameY);
  ctx.lineTo(CENTER_X + 110, nameY);
  ctx.stroke();

  // Nickname
  ctx.fillStyle = "#C9A84C";
  ctx.font = `bold 32px "Noto Serif TC", serif`;
  ctx.textAlign = "center";
  ctx.fillText(input.nickname, CENTER_X, nameY + 18);

  // Reset text alignment
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
