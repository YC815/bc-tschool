import { GeneratorInput, MemorialTemplate } from "./types";
import { drawPhotoFilled, drawPlaceholder, ensureFonts, loadImage, wrapText } from "./utils";

const ROMAN = ["I", "II", "III", "IV"] as const;
const LABELS = ["風 × 海", "火", "土 × 木", "金"] as const;
const STATION_COLORS = ["#4A90D9", "#E87D3E", "#B8955A", "#C9A84C"] as const;

// Station positions on 1080×1080
const STATIONS: [number, number][] = [
  [540, 80],
  [380, 380],
  [660, 600],
  [540, 850],
];

async function generate(input: GeneratorInput): Promise<string> {
  await ensureFonts();

  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#0D0D0D";
  ctx.fillRect(0, 0, W, H);

  // Dot grid
  ctx.fillStyle = "rgba(201,168,76,0.06)";
  for (let x = 20; x < W; x += 40) {
    for (let y = 20; y < H; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Watermark "100 km"
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#C9A84C";
  ctx.font = `900 100px Cinzel, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("100 km", W / 2, H / 2);
  ctx.restore();

  // Route: bezier through station points
  ctx.strokeStyle = "#C9A84C";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(STATIONS[0][0], STATIONS[0][1]);
  ctx.bezierCurveTo(
    350, 200,
    500, 300,
    STATIONS[1][0], STATIONS[1][1]
  );
  ctx.bezierCurveTo(
    260, 460,
    580, 500,
    STATIONS[2][0], STATIONS[2][1]
  );
  ctx.bezierCurveTo(
    740, 700,
    440, 760,
    STATIONS[3][0], STATIONS[3][1]
  );
  ctx.stroke();
  ctx.setLineDash([]);

  // Station circles with photos
  const R = 80;

  for (let i = 0; i < 4; i++) {
    const [cx, cy] = STATIONS[i];
    const photoSrc = input.photos[i];
    const color = STATION_COLORS[i];

    // Clip to circle and draw photo
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    if (photoSrc) {
      try {
        const img = await loadImage(photoSrc);
        drawPhotoFilled(ctx, img, cx - R, cy - R, R * 2, R * 2);
      } catch {
        drawPlaceholder(ctx, cx - R, cy - R, R * 2, R * 2, LABELS[i], ROMAN[i]);
      }
    } else {
      drawPlaceholder(ctx, cx - R, cy - R, R * 2, R * 2, LABELS[i], ROMAN[i]);
    }
    ctx.restore();

    // Colored ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, R + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Station label
    const labelX = i === 1 ? cx - R - 16 : cx + R + 16;
    const labelAnchor = i === 1 ? "right" : "left";
    ctx.fillStyle = color;
    ctx.font = `bold 16px Cinzel, serif`;
    ctx.textAlign = labelAnchor as CanvasTextAlign;
    ctx.textBaseline = "middle";
    ctx.fillText(`站 ${i + 1}`, labelX, cy - 10);
    ctx.fillStyle = "rgba(232,213,163,0.6)";
    ctx.font = `14px "Noto Serif TC", serif`;
    ctx.fillText(LABELS[i], labelX, cy + 12);
  }

  // Endpoint speech bubble with quote
  const BUBBLE_X = 200;
  const BUBBLE_Y = 870;
  const BUBBLE_W = 680;
  const BUBBLE_H = 140;
  const BR = 12;

  ctx.fillStyle = "#1A1208";
  ctx.strokeStyle = "#C9A84C";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(BUBBLE_X + BR, BUBBLE_Y);
  ctx.lineTo(BUBBLE_X + BUBBLE_W - BR, BUBBLE_Y);
  ctx.quadraticCurveTo(BUBBLE_X + BUBBLE_W, BUBBLE_Y, BUBBLE_X + BUBBLE_W, BUBBLE_Y + BR);
  ctx.lineTo(BUBBLE_X + BUBBLE_W, BUBBLE_Y + BUBBLE_H - BR);
  ctx.quadraticCurveTo(BUBBLE_X + BUBBLE_W, BUBBLE_Y + BUBBLE_H, BUBBLE_X + BUBBLE_W - BR, BUBBLE_Y + BUBBLE_H);
  ctx.lineTo(BUBBLE_X + BR, BUBBLE_Y + BUBBLE_H);
  ctx.quadraticCurveTo(BUBBLE_X, BUBBLE_Y + BUBBLE_H, BUBBLE_X, BUBBLE_Y + BUBBLE_H - BR);
  ctx.lineTo(BUBBLE_X, BUBBLE_Y + BR);
  ctx.quadraticCurveTo(BUBBLE_X, BUBBLE_Y, BUBBLE_X + BR, BUBBLE_Y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#E8D5A3";
  ctx.font = `italic 24px "EB Garamond", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const quoteText = input.quote ? `「${input.quote}」` : "「一段難忘的旅程」";
  wrapText(ctx, quoteText, W / 2, BUBBLE_Y + 20, BUBBLE_W - 48, 36);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  return canvas.toDataURL("image/png");
}

export const templateMap: MemorialTemplate = {
  id: "map",
  label: "軌跡地圖",
  sublabel: "1080 × 1080",
  width: 1080,
  height: 1080,
  generate,
};
