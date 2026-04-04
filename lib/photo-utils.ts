async function convertHeicToJpeg(file: File): Promise<File> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.hei[cf]$/i.test(file.name);
  if (!isHeic) return file;

  const { default: heic2any } = await import("heic2any");
  const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const converted = Array.isArray(blob) ? blob[0] : blob;
  return new File([converted], file.name.replace(/\.hei[cf]$/i, ".jpg"), {
    type: "image/jpeg",
  });
}

export async function resizeAndEncodePhoto(
  file: File,
  maxWidth = 1000,
  quality = 0.82
): Promise<string> {
  const processedFile = await convertHeicToJpeg(file);
  const bitmap = await createImageBitmap(processedFile);

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
