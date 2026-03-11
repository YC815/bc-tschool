"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useJourney } from "@/lib/journey-context";
import { templatePolaroid } from "@/lib/canvas/template-polaroid";
import type { GeneratorInput } from "@/lib/canvas";

export function MemorialGenerator() {
  const { state } = useJourney();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const nickname = state?.nickname ?? "傳遞者";
  const quote = state?.submissions?.["4"]?.message ?? "";
  const photos: GeneratorInput["photos"] = [
    state?.submissions?.["1"]?.photoDataUrl ?? null,
    state?.submissions?.["2"]?.photoDataUrl ?? null,
    state?.submissions?.["3"]?.photoDataUrl ?? null,
    state?.submissions?.["4"]?.photoDataUrl ?? null,
  ];

  async function runGenerate() {
    setIsGenerating(true);
    setPreviewUrl(null);
    try {
      const url = await templatePolaroid.generate({ photos, nickname, quote });
      setPreviewUrl(url);
    } catch (err) {
      console.error("Canvas generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  // Auto-generate when state is loaded or changes
  useEffect(() => {
    if (state) {
      runGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const downloadFilename = `元素傳遞-${nickname}.png`;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-display text-[#C9A84C] tracking-wider flex items-center gap-2">
        <Download className="w-4 h-4" />
        紀念圖預覽
      </h3>

      {/* Preview area */}
      <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-[#0D0D0D] border border-[#C9A84C]/10 flex items-center justify-center">
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0D0D0D]/80 z-10">
            <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
            <p className="text-sm text-[#E8D5A3]/50 font-manuscript">生成中...</p>
          </div>
        )}
        {previewUrl && !isGenerating && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="紀念圖預覽"
            className="w-full h-full object-contain"
          />
        )}
        {!previewUrl && !isGenerating && (
          <p className="text-[#E8D5A3]/20 text-sm font-manuscript">預覽將在此顯示</p>
        )}
      </div>

      {/* Download button */}
      <a
        href={previewUrl ?? "#"}
        download={downloadFilename}
        onClick={(e) => {
          if (!previewUrl || isGenerating) e.preventDefault();
        }}
        className={[
          "w-full h-12 rounded-sm flex items-center justify-center gap-2",
          "font-display tracking-wider transition-all duration-150 active:scale-[0.97]",
          previewUrl && !isGenerating
            ? "bg-gradient-to-r from-[#C9A84C] to-[#D4822A] text-[#1A1208] cursor-pointer"
            : "bg-[#C9A84C]/20 text-[#C9A84C]/40 cursor-not-allowed",
        ].join(" ")}
      >
        <Download className="w-4 h-4" />
        {isGenerating ? "生成中..." : "下載紀念圖"}
      </a>
    </div>
  );
}
