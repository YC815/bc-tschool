"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { StationPage } from "@/components/station-page";
import { getStation } from "@/lib/stations";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StationDynamicPage({ params }: PageProps) {
  const { id } = use(params);
  const station = getStation(id);

  if (!station) {
    notFound();
  }

  return <StationPage station={station} />;
}
