"use client";

import { useRouter } from "next/navigation";
import { Landmark, RotateCcw, Share2 } from "lucide-react";
import { useJourney } from "@/lib/journey-context";
import { MemorialGenerator, InstagramStoryGenerator } from "@/components/memorial-generator";

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

        {/* Instagram Story Generator - Separate Section */}
        <div className="scroll-border rounded-sm bg-[#1A1208]/60 p-5 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <InstagramStoryGenerator />
        </div>

        {/* Memorial Generator - Photo Cards */}
        <div className="scroll-border rounded-sm bg-[#1A1208]/60 p-5 animate-fade-up" style={{ animationDelay: "280ms" }}>
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
