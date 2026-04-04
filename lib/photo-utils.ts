async function convertHeicViaServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/convert-heic", { method: "POST", body: formData });
  if (!res.ok) throw new Error("HEIC conversion failed");
  const { dataUrl } = await res.json();
  return dataUrl;
}

export async function resizeAndEncodePhoto(
  file: File,
  maxWidth = 1000,
  quality = 0.82
): Promise<string> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.hei[cf]$/i.test(file.name);

  if (isHeic) {
    // Server-side conversion via Sharp (most reliable HEIC support)
    return await convertHeicViaServer(file);
  }

  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}
