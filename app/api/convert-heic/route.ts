import { NextRequest, NextResponse } from "next/server";
import convert from "heic-convert";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer) as unknown as ArrayBuffer;
  const jpegBuffer = await convert({ buffer, format: "JPEG", quality: 0.9 });
  const base64 = Buffer.from(jpegBuffer).toString("base64");

  return NextResponse.json({ dataUrl: `data:image/jpeg;base64,${base64}` });
}
