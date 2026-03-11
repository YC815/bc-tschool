"use client";

import { useRouter } from "next/navigation";
import { Waves, Flame, TreePine, Landmark, RotateCcw, Share2 } from "lucide-react";
import { useJourney } from "@/lib/journey-context";
import { MemorialGenerator } from "@/components/memorial-generator";

const STATION_META = [
  {
    number: 1,
    elements: ["風", "海"],
    icon: Waves,
    theme: {
      bg: "bg-[#4A90D9]/10",
      border: "border-[#4A90D9]/25",
      text: "text-[#4A90D9]/80",
      icon: "text-[#4A90D9]",
    },
  },
  {
    number: 2,
    elements: ["火"],
    icon: Flame,
    theme: {
      bg: "bg-[#E87D3E]/10",
      border: "border-[#E87D3E]/25",
      text: "text-[#E87D3E]/80",
      icon: "text-[#E87D3E]",
    },
  },
  {
    number: 3,
    elements: ["土", "木"],
    icon: TreePine,
    theme: {
      bg: "bg-[#B8955A]/10",
      border: "border-[#B8955A]/25",
      text: "text-[#B8955A]/80",
      icon: "text-[#B8955A]",
    },
  },
  {
    number: 4,
    elements: ["金"],
    icon: Landmark,
    theme: {
      bg: "bg-[#C9A84C]/10",
      border: "border-[#C9A84C]/25",
      text: "text-[#C9A84C]/80",
      icon: "text-[#C9A84C]",
    },
  },
];

export default function ResultPage() {
  const router = useRouter();
  const { state, clearJourneyData } = useJourney();

  const nickname = state?.nickname ?? "傳遞者";

  const handleRestart = async () => {
    await clearJourneyData();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1208] via-[#0D0D0D] to-[#080D1A]">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="text-center space-y-4 animate-fade-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[#C9A84C]/50 bg-[#C9A84C]/10 animate-stamp animate-glow-pulse">
            <Landmark className="w-10 h-10 text-[#C9A84C]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-display text-gold-gradient tracking-wider">
              旅程完成
            </h1>
            <p className="text-[#E8D5A3]/50 font-manuscript">
              {nickname}，你已傳遞所有元素
            </p>
          </div>
        </header>

        {/* Certificate Card */}
        <div className="scroll-border rounded-sm overflow-hidden animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="bg-gradient-to-r from-[#1A1208] to-[#0D0D0D] p-5 text-center border-b border-[#C9A84C]/20">
            <div className="border-t border-[#C9A84C]/30 mb-3" />
            <h2 className="text-base font-display text-gold-gradient tracking-widest">元素傳遞</h2>
            <p className="text-[#E8D5A3]/40 text-xs font-manuscript mt-1">
              單車環島 Day.2｜新竹 → 台中｜101km
            </p>
            <div className="border-b border-[#C9A84C]/30 mt-3" />
          </div>

          <div className="divide-y divide-[#C9A84C]/10">
            {STATION_META.map((meta) => {
              const Icon = meta.icon;
              const submission = state?.submissions[String(meta.number) as "1" | "2" | "3" | "4"];
              const photo = submission?.photoDataUrl ?? null;
              const isFinal = meta.number === 4;
              const msg = submission?.message;

              return (
                <div key={meta.number} className={`p-4 ${meta.theme.bg}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-sm border ${meta.theme.border} bg-[#0D0D0D]/40 flex items-center justify-center ${meta.theme.icon}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className={`text-sm font-display tracking-wide ${meta.theme.icon}`}>
                      站 {meta.number}｜{meta.elements.join(" × ")}
                    </p>
                  </div>
                  {photo ? (
                    <div className={`overflow-hidden rounded-sm border border-[#C9A84C]/20 ${isFinal ? "aspect-video" : "aspect-[4/3]"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={`站 ${meta.number}`}
                        className="w-full h-full object-cover photo-aged"
                      />
                    </div>
                  ) : (
                    <div className={`rounded-sm border border-[#C9A84C]/10 bg-[#0D0D0D]/30 flex items-center justify-center ${isFinal ? "aspect-video" : "aspect-[4/3]"}`}>
                      <span className={`text-xs font-display ${meta.theme.text} opacity-40`}>未上傳照片</span>
                    </div>
                  )}
                  {isFinal && msg && (
                    <p className={`mt-3 text-sm italic font-manuscript ${meta.theme.text}`}>
                      「{msg}」
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-[#0D0D0D]/40 p-4 text-center border-t border-[#C9A84C]/10">
            <p className="text-xs text-[#E8D5A3]/30 font-manuscript">
              完成時間：{new Date().toLocaleDateString("zh-TW")}
            </p>
          </div>
        </div>

        {/* Story Summary */}
        <div className="scroll-border rounded-sm bg-[#1A1208]/60 p-5 animate-fade-up" style={{ animationDelay: "160ms" }}>
          <h3 className="text-sm font-display text-[#C9A84C] mb-3 flex items-center gap-2 tracking-wider">
            <Share2 className="w-4 h-4" />
            你的元素之旅
          </h3>
          <div className="space-y-2 text-sm text-[#E8D5A3]/60 leading-relaxed font-manuscript">
            <p>風與海教會你流動，火為你照亮方向，</p>
            <p>土木記錄你的汗水，金在終點收束成結晶。</p>
            <p className="text-[#E8D5A3]/30 text-xs pt-2">
              這是一條「自然元素如何累積成故事」的路線。
            </p>
          </div>
        </div>

        {/* Memorial Generator */}
        <div className="scroll-border rounded-sm bg-[#1A1208]/60 p-5 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <MemorialGenerator />
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2 animate-fade-up" style={{ animationDelay: "320ms" }}>
          <button
            className="w-full h-12 rounded-sm border border-[#C9A84C]/30 text-[#C9A84C]/80 font-display tracking-wider btn-rpg hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5 flex items-center justify-center gap-2"
            onClick={handleRestart}
          >
            <RotateCcw className="w-4 h-4" />
            開始新的旅程
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#E8D5A3]/25 font-manuscript pb-4">
          截圖分享你的元素傳遞之旅
        </p>
      </div>
    </div>
  );
}
