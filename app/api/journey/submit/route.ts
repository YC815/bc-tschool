import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { journeyId, stationId, photoDataUrl, message, nickname } =
      await req.json();

    // If no journeyId, create journey on-the-fly (first submission)
    let resolvedJourneyId: string = journeyId;
    if (!resolvedJourneyId) {
      const journey = await prisma.journey.create({
        data: { nickname: nickname ?? "傳遞者" },
      });
      resolvedJourneyId = journey.id;
    }

    await prisma.stationSubmission.upsert({
      where: {
        journeyId_stationId: {
          journeyId: resolvedJourneyId,
          stationId: Number(stationId),
        },
      },
      create: {
        journeyId: resolvedJourneyId,
        stationId: Number(stationId),
        photoData: photoDataUrl ?? null,
        message: message ?? "",
      },
      update: {
        photoData: photoDataUrl ?? null,
        message: message ?? "",
      },
    });

    return NextResponse.json({ ok: true, journeyId: resolvedJourneyId });
  } catch {
    return NextResponse.json({ error: "db unavailable" }, { status: 503 });
  }
}
