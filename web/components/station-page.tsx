"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUploader } from "@/components/photo-uploader";
import { StationData } from "@/lib/stations";
import { Camera, Eye, Waves, Flame, TreePine, Landmark, Bike, CheckCircle2 } from "lucide-react";

interface StationPageProps {
  station: StationData;
}

const STATION_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  1: Waves,
  2: Flame,
  3: TreePine,
  4: Landmark,
};

export function StationPage({ station }: StationPageProps) {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoSelect = (file: File | null, previewUrl: string | null) => {
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
  };

  const handleSubmit = async () => {
    if (!photoFile || !message.trim()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push(station.nextStation);
  };

  const isComplete = photoFile && message.trim();
  const progressPercent = (station.number / 4) * 100;
  const StationIcon = STATION_ICONS[station.number] ?? Landmark;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${station.theme.gradient}`}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-[#C9A84C]/10 z-50">
        <div
          className="h-full bg-gradient-to-r from-[#C9A84C] to-[#D4822A] transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <StationIcon className="w-8 h-8 text-[#C9A84C]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-sm font-display text-[#C9A84C]/70 tracking-wider">
              <span>站 {station.number}</span>
              <span className="text-[#C9A84C]/30">/</span>
              <span>4</span>
            </div>
            <h1 className="text-2xl font-display text-gold-gradient tracking-wide">
              {station.elements.join(" × ")}
              {station.isFinal && <span className="text-[#C9A84C]/60 ml-2 text-lg">終點</span>}
            </h1>
            <p className="text-[#E8D5A3]/50 font-manuscript text-sm">{station.name}</p>
          </div>
        </header>

        {/* Guide Card - Scroll style */}
        <div className="scroll-border rounded-sm p-5 space-y-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="border-t border-[#C9A84C]/20" />
          <div className="flex items-center gap-2 text-[#C9A84C] font-display tracking-wider text-sm">
            <Eye className="w-4 h-4" />
            <span>指引</span>
          </div>
          <ul className="space-y-3">
            {station.guide.map((step, index) => (
              <li key={index} className="flex gap-3 text-[#E8D5A3]/70 font-manuscript">
                <span className="flex-shrink-0 w-6 h-6 rounded-sm bg-[#C9A84C]/15 border border-[#C9A84C]/30 font-display text-[#C9A84C] text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
          <div className="border-b border-[#C9A84C]/20" />
        </div>

        {/* Task Card - Commission letter */}
        <div
          className={`relative scroll-border rounded-sm p-5 ${station.theme.cardAccent} animate-fade-up`}
          style={{ animationDelay: "160ms" }}
        >
          {/* Watermark */}
          <div className="absolute top-2 right-3 font-display text-xs tracking-widest text-[#C9A84C]/10 select-none">
            委託
          </div>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-sm bg-[#0D0D0D]/40 ${station.theme.cardAccentText}`}>
              {station.isFinal ? <CheckCircle2 className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
            </div>
            <div>
              <p className={`font-display tracking-wide text-sm ${station.theme.cardAccentTitle}`}>
                {station.isFinal ? "終點任務" : "路上任務（手機收起）"}
              </p>
              <p className={`mt-1 text-sm font-manuscript ${station.theme.cardAccentText}`}>
                {station.task}
              </p>
            </div>
          </div>
        </div>

        {/* Report Card */}
        <div className="scroll-border rounded-sm p-5 space-y-5 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <div className="border-t border-[#C9A84C]/20" />
          <div className="flex items-center gap-2 text-[#C9A84C] font-display tracking-wider text-sm">
            <Camera className="w-4 h-4" />
            <span>{station.isFinal ? "最終回報" : "下一站回報"}</span>
          </div>

          <PhotoUploader
            onPhotoSelect={handlePhotoSelect}
            previewUrl={photoPreview}
          />

          <div className="space-y-2">
            <label className="text-sm font-manuscript text-[#E8D5A3]/60 flex items-center gap-2">
              一句話
              {station.isFinal && <span className="text-[#C9A84C]/50 text-xs">（金的結晶）</span>}
            </label>
            <div className="relative">
              <Textarea
                placeholder={`${station.prompt}＿＿＿＿。`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px] resize-none border-[#C9A84C]/20 focus-visible:ring-[#C9A84C]/30 text-[#E8D5A3] placeholder:text-[#C9A84C]/30 font-manuscript"
                style={{
                  backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(201, 168, 76, 0.06) 27px, rgba(201, 168, 76, 0.06) 28px)",
                  backgroundColor: "rgba(26, 18, 8, 0.6)",
                }}
                maxLength={100}
              />
              <div className="absolute bottom-2 right-2 text-xs text-[#E8D5A3]/30">
                {message.length}/100
              </div>
            </div>
          </div>

          <button
            className="w-full h-12 rounded-sm bg-gradient-to-r from-[#C9A84C] to-[#D4822A] text-[#1A1208] font-display tracking-wider btn-rpg disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
          >
            {isSubmitting
              ? "儲存中..."
              : station.isFinal
                ? "完成旅程，生成紀念卡片"
                : "完成，前往下一站"
            }
          </button>
          <div className="border-b border-[#C9A84C]/20" />
        </div>
      </div>
    </div>
  );
}
