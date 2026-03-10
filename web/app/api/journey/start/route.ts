import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// Prisma requires DATABASE_URL at runtime; this route is a no-op without it.

export async function POST(req: NextRequest) {
  try {
    const { nickname } = await req.json();
    if (!nickname) {
      return NextResponse.json({ error: "nickname required" }, { status: 400 });
    }
    const journey = await prisma.journey.create({
      data: { nickname },
    });
    return NextResponse.json({ journeyId: journey.id });
  } catch {
    return NextResponse.json({ error: "db unavailable" }, { status: 503 });
  }
}
