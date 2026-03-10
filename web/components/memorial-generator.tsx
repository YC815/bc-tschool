"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useJourney } from "@/lib/journey-context";
import { TEMPLATES } from "@/lib/canvas";
import type { MemorialTemplate, GeneratorInput } from "@/lib/canvas";

export function MemorialGenerator() {
  const { state } = useJourney();
  const [selectedId, setSelectedId] = useState<string>(TEMPLATES[0].id);
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

  const selectedTemplate = TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[0];

  async function runGenerate(template: MemorialTemplate) {
    setIsGenerating(true);
    setPreviewUrl(null);
    try {
      const url = await template.generate({ photos, nickname, quote });
      setPreviewUrl(url);
    } catch (err) {
      console.error("Canvas generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  // Auto-generate on template change
  useEffect(() => {
    runGenerate(selectedTemplate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const downloadFilename = `元素傳遞-${nickname}-${selectedId}.png`;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-display text-[#C9A84C] tracking-wider flex items-center gap-2">
        <Download className="w-4 h-4" />
        選擇紀念圖版型
      </h3>

      {/* Template selector */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            className={[
              "flex-none snap-start w-36 h-20 rounded-sm border transition-all duration-200",
              "flex flex-col items-center justify-center gap-1 text-center px-2",
              "active:scale-[0.97]",
              selectedId === t.id
                ? "border-[#C9A84C] bg-[#C9A84C]/10 shadow-[0_0_12px_rgba(201,168,76,0.2)]"
                : "border-[#C9A84C]/20 bg-[#0D0D0D]/60 hover:border-[#C9A84C]/40",
            ].join(" ")}
          >
            <span
              className={`text-xs font-display tracking-wide leading-tight ${
                selectedId === t.id ? "text-[#C9A84C]" : "text-[#E8D5A3]/70"
              }`}
            >
              {t.label}
            </span>
            <span className="text-[10px] text-[#E8D5A3]/30 font-manuscript">{t.sublabel}</span>
          </button>
        ))}
      </div>

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
