"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useJourney } from "@/lib/journey-context";
import { Wind, Waves, Flame, Mountain, TreePine, Landmark, Bike, ArrowRight, Star, RotateCcw } from "lucide-react";

const ELEMENTS = [
  { icon: Wind,     label: "風", color: "text-[#4A90D9]", bg: "bg-[#4A90D9]/10 border border-[#4A90D9]/30" },
  { icon: Waves,    label: "海", color: "text-[#5BA8E8]", bg: "bg-[#5BA8E8]/10 border border-[#5BA8E8]/30" },
  { icon: Flame,    label: "火", color: "text-[#E87D3E]", bg: "bg-[#E87D3E]/10 border border-[#E87D3E]/30" },
  { icon: Mountain, label: "土", color: "text-[#B8955A]", bg: "bg-[#B8955A]/10 border border-[#B8955A]/30" },
  { icon: TreePine, label: "木", color: "text-[#6BAD72]", bg: "bg-[#6BAD72]/10 border border-[#6BAD72]/30" },
  { icon: Landmark, label: "金", color: "text-[#C9A84C]", bg: "bg-[#C9A84C]/10 border border-[#C9A84C]/30" },
];

export default function Home() {
  const router = useRouter();
  const { state, isLoaded, setNickname, clearJourneyData } = useJourney();
  const [nickname, setNicknameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Detect in-progress journey
  const hasProgress =
    isLoaded &&
    state?.submissions &&
    Object.keys(state.submissions).length > 0;

  // Find the furthest completed station to resume from the next one
  const resumeStation = (() => {
    if (!state?.submissions) return "/station/1";
    const done = Object.keys(state.submissions)
      .map(Number)
      .filter((n) => state.submissions[String(n) as "1" | "2" | "3" | "4"]?.submittedAt)
      .sort((a, b) => b - a);
    const next = done.length > 0 ? done[0] + 1 : 1;
    if (next > 4) return "/result";
    return `/station/${next}`;
  })();

  // Pre-fill nickname from saved state
  useEffect(() => {
    if (isLoaded && state?.nickname) {
      startTransition(() => setNicknameInput(state.nickname));
    }
  }, [isLoaded, state?.nickname]);

  const handleStart = async () => {
    if (!nickname.trim()) return;
    setIsLoading(true);
    await setNickname(nickname.trim());
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push("/station/1");
  };

  const handleContinue = () => {
    router.push(resumeStation);
  };

  const handleRestart = async () => {
    await clearJourneyData();
    setNicknameInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1208] via-[#0D0D0D] to-[#080D1A]">
      <div className="max-w-lg mx-auto px-4 py-12 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
          {/* Logo / Icon */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0ms" }}>
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#C9A84C] to-[#D4822A] flex items-center justify-center shadow-lg">
              <Bike className="w-12 h-12 text-[#1A1208]" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 flex items-center justify-center shadow-md">
              <Star className="w-4 h-4 text-[#C9A84C]" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
            <h1 className="text-3xl font-display text-gold-gradient tracking-wider">
              元素傳遞
            </h1>
            <p className="text-[#E8D5A3]/60 font-manuscript">
              單車環島 Day.2 — 新竹至台中
            </p>
          </div>

          {/* Story Card */}
          <div className="w-full scroll-border rounded-sm p-6 animate-fade-up" style={{ animationDelay: "160ms" }}>
            <div className="border-t border-[#C9A84C]/20 mb-4" />
            <div className="space-y-4 text-[#E8D5A3]/80 leading-relaxed font-manuscript">
              <p>有六則訊息要交到台中。</p>
              <div className="flex justify-center gap-2 py-2">
                {ELEMENTS.map((el, i) => (
                  <div
                    key={el.label}
                    className={`w-10 h-10 rounded-xl ${el.bg} flex items-center justify-center ${el.color} transition-transform hover:scale-110`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <el.icon className="w-5 h-5" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#E8D5A3]/50">
                風會在第一站等待你，海會在此刻現身，
                <br />
                火在陽光最強的地方發聲，
                <br />
                土與木永遠同行，金在終點收束。
              </p>
            </div>
            <div className="border-b border-[#C9A84C]/20 mt-4" />
          </div>

          {/* Rules */}
          <div className="flex gap-4 text-xs text-[#E8D5A3]/40 animate-fade-up" style={{ animationDelay: "240ms" }}>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/60" />
              掃碼即玩
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/60" />
              無需安裝
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/60" />
              定點任務
            </span>
          </div>
        </div>

        {/* Continue Journey Banner */}
        {hasProgress && (
          <div className="scroll-border rounded-sm p-4 mb-4 animate-fade-up" style={{ animationDelay: "280ms" }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-display text-[#C9A84C] tracking-wide">旅程進行中</p>
                <p className="text-xs text-[#E8D5A3]/50 font-manuscript mt-0.5">
                  {state?.nickname} · 已完成 {Object.keys(state?.submissions ?? {}).filter(k => state?.submissions[k as "1"|"2"|"3"|"4"]?.submittedAt).length} / 4 站
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRestart}
                  className="h-9 px-3 rounded-sm border border-[#C9A84C]/20 text-[#E8D5A3]/50 font-display text-xs hover:border-[#C9A84C]/40 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  重置
                </button>
                <button
                  onClick={handleContinue}
                  className="h-9 px-4 rounded-sm bg-gradient-to-r from-[#C9A84C] to-[#D4822A] text-[#1A1208] font-display text-xs tracking-wider btn-rpg flex items-center gap-1"
                >
                  繼續旅程
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="space-y-4 pt-4 animate-fade-up" style={{ animationDelay: "320ms" }}>
          <div className="space-y-2">
            <label className="text-sm font-manuscript text-[#E8D5A3]/70 text-center block tracking-wide">
              你的稱呼
            </label>
            <Input
              placeholder="輸入暱稱開始旅程"
              value={nickname}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              className="h-12 text-center bg-[#1A1208]/80 border-[#C9A84C]/30 text-[#E8D5A3] placeholder:text-[#E8D5A3]/30 focus-visible:ring-[#C9A84C]/20 font-manuscript"
            />
          </div>

          <button
            className="w-full h-12 rounded-md bg-gradient-to-r from-[#C9A84C] to-[#D4822A] text-[#1A1208] font-display tracking-wider btn-rpg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            onClick={handleStart}
            disabled={!nickname.trim() || isLoading}
          >
            {isLoading ? (
              "準備中..."
            ) : (
              <>
                接受委託，成為傳遞者
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
