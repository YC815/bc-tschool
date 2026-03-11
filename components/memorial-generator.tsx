"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useJourney } from "@/lib/journey-context";
import { TEMPLATES } from "@/lib/canvas";
import type { GeneratorInput } from "@/lib/canvas";

const ASPECT_MAP: Record<string, string> = {
  polaroid: "aspect-square",
  postcard: "aspect-[10/7]",
  stories: "aspect-[9/16]",
};

export function MemorialGenerator() {
  const { state } = useJourney();
  const [selectedId, setSelectedId] = useState("polaroid");
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

  const template = TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[0];

  async function runGenerate() {
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

  useEffect(() => {
    if (state) {
      runGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, selectedId]);

  const aspectClass = ASPECT_MAP[selectedId] ?? "aspect-square";
  const downloadFilename = `元素傳遞-${nickname}-${template.label}.png`;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-display text-[#C9A84C] tracking-wider flex items-center gap-2">
        <Download className="w-4 h-4" />
        紀念圖預覽
      </h3>

      {/* Template selector tabs */}
      <div className="flex gap-1 p-1 bg-[#0D0D0D] rounded-sm border border-[#C9A84C]/10">
        {TEMPLATES.map((tmpl) => {
          const active = selectedId === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => setSelectedId(tmpl.id)}
              className={[
                "flex-1 py-2 px-1 rounded-sm text-center transition-all duration-150 active:scale-[0.97]",
                active
                  ? "bg-[#C9A84C]/15 border border-[#C9A84C]/40"
                  : "border border-transparent hover:bg-[#C9A84C]/5",
              ].join(" ")}
            >
              <div
                className={`text-xs font-display tracking-wide ${
                  active ? "text-[#C9A84C]" : "text-[#E8D5A3]/45"
                }`}
              >
                {tmpl.label}
              </div>
              <div
                className={`text-[10px] font-manuscript mt-0.5 ${
                  active ? "text-[#C9A84C]/60" : "text-[#E8D5A3]/22"
                }`}
              >
                {tmpl.sublabel}
              </div>
            </button>
          );
        })}
      </div>

      {/* Preview area — aspect ratio changes with template */}
      <div
        className={`relative w-full ${aspectClass} rounded-sm overflow-hidden bg-[#0D0D0D] border border-[#C9A84C]/10 flex items-center justify-center`}
      >
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
