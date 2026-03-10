"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUploader } from "@/components/photo-uploader";
import { StationData } from "@/lib/stations";
import { useJourney } from "@/lib/journey-context";
import { Camera, Eye, Waves, Flame, TreePine, Landmark, Bike, CheckCircle2, FileText, User, LogOut, X, AlertTriangle, Skull } from "lucide-react";

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
  const { state, isLoaded, saveStationDraft, markSubmitted, clearJourneyData } = useJourney();
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmStep, setConfirmStep] = useState(0);

  const stationId = String(station.number) as "1" | "2" | "3" | "4";

  // Restore draft from IDB once loaded
  useEffect(() => {
    if (!isLoaded) return;
    const draft = state?.submissions[stationId];
    if (draft) {
      startTransition(() => {
        if (draft.photoDataUrl) setPhotoDataUrl(draft.photoDataUrl);
        if (draft.message) setMessage(draft.message);
      });
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePhotoSelect = async (dataUrl: string | null) => {
    setPhotoDataUrl(dataUrl);
    await saveStationDraft(stationId, { photoDataUrl: dataUrl });
  };

  const handleMessageChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);
    await saveStationDraft(stationId, { message: val });
  };

  const handleSubmit = async () => {
    if (!photoDataUrl || !message.trim()) return;
    setIsSubmitting(true);

    try {
      await fetch("/api/journey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: station.number,
          photoDataUrl,
          message,
          nickname: state?.nickname ?? "",
        }),
      });
      await markSubmitted(stationId, Date.now());
    } catch {
      // Silent fail — data is already in IDB
    }

    router.push(station.nextStation);
  };

  const handleLogout = async () => {
    await clearJourneyData();
    router.push("/");
  };

  const isComplete = photoDataUrl && message.trim();
  const progressPercent = (station.number / 4) * 100;
  const StationIcon = STATION_ICONS[station.number] ?? Landmark;

  const allSubmissions = Object.values(state?.submissions ?? {});
  const photoCount = allSubmissions.filter((s) => s.photoDataUrl).length;
  const textCount = allSubmissions.filter((s) => s.message.trim()).length;
  const completedCount = allSubmissions.filter((s) => s.submittedAt).length;
  const nickname = state?.nickname;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${station.theme.gradient}`}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-[#C9A84C]/10 z-50">
        <div
          className="h-full bg-gradient-to-r from-[#C9A84C] to-[#D4822A] transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Status Strip */}
      <div className="fixed top-0.5 left-0 right-0 z-40 flex items-center justify-between px-4 py-2 bg-[#0D0D0D]/80 backdrop-blur-sm border-b border-[#C9A84C]/10">
        {/* Nickname — clickable for menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 min-w-0 group active:scale-95 transition-transform duration-150"
          >
            <User className="w-3 h-3 text-[#C9A84C]/60 flex-shrink-0 group-hover:text-[#C9A84C] transition-colors" />
            <span className="text-xs font-display text-[#E8D5A3]/70 truncate max-w-[90px] group-hover:text-[#E8D5A3] transition-colors">
              {nickname ?? "旅者"}
            </span>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-50"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 z-50 min-w-[140px] rounded-sm border border-[#C9A84C]/20 bg-[#0D0D0D]/95 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="px-3 py-2 border-b border-[#C9A84C]/10">
                  <p className="text-[10px] font-display text-[#C9A84C]/40 tracking-widest uppercase">旅者</p>
                  <p className="text-xs font-display text-[#E8D5A3]/80 mt-0.5 truncate">{nickname ?? "—"}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); setConfirmStep(1); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-manuscript text-red-400/80 hover:text-red-300 hover:bg-red-950/30 transition-colors duration-150"
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>捨棄旅程</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Station Progress */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`w-5 h-1 rounded-full transition-all duration-500 ${
                n < station.number
                  ? "bg-[#C9A84C]"
                  : n === station.number
                    ? "bg-[#C9A84C]/60"
                    : "bg-[#C9A84C]/15"
              }`}
            />
          ))}
          <span className="text-xs font-display text-[#C9A84C]/60 ml-1 tabular-nums">
            {completedCount}/4
          </span>
        </div>

        {/* Material Counts */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-manuscript text-[#E8D5A3]/50">
            <Camera className="w-3 h-3 text-[#C9A84C]/50" />
            <span className="tabular-nums text-[#C9A84C]/80">{photoCount}</span>
          </span>
          <span className="flex items-center gap-1 text-xs font-manuscript text-[#E8D5A3]/50">
            <FileText className="w-3 h-3 text-[#C9A84C]/50" />
            <span className="tabular-nums text-[#C9A84C]/80">{textCount}</span>
          </span>
        </div>
      </div>

      {/* ── Confirmation Modals ── */}
      {confirmStep > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0D0D0D]/90 backdrop-blur-sm" />

          <div className="relative w-full max-w-sm rounded-sm border border-[#C9A84C]/20 bg-[#1A1208] shadow-[0_8px_48px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Top accent */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-red-800/60 to-transparent" />

            <div className="p-6 space-y-5">
              {/* Icon + Step */}
              <div className="flex flex-col items-center gap-3">
                {confirmStep === 1 && <AlertTriangle className="w-8 h-8 text-amber-500/80" />}
                {confirmStep === 2 && <AlertTriangle className="w-8 h-8 text-red-500/80" />}
                {confirmStep === 3 && <Skull className="w-8 h-8 text-red-600" />}
                <p className="text-[10px] font-display tracking-[0.3em] text-[#C9A84C]/30 uppercase">
                  確認 {confirmStep} / 3
                </p>
              </div>

              {/* Title */}
              <div className="text-center space-y-2">
                {confirmStep === 1 && (
                  <>
                    <h2 className="font-display text-lg text-[#E8D5A3] tracking-wide">捨棄這趟旅程？</h2>
                    <p className="text-sm font-manuscript text-[#E8D5A3]/50 leading-relaxed">
                      所有照片與紀錄將永久消失，<br />無法復原。
                    </p>
                  </>
                )}
                {confirmStep === 2 && (
                  <>
                    <h2 className="font-display text-lg text-red-400/90 tracking-wide">這個動作無法復原</h2>
                    <p className="text-sm font-manuscript text-[#E8D5A3]/50 leading-relaxed">
                      你已走過 <span className="text-[#C9A84C]">{completedCount} 站</span>，<br />
                      確定放棄所有已完成的記錄？
                    </p>
                  </>
                )}
                {confirmStep === 3 && (
                  <>
                    <h2 className="font-display text-lg text-red-500 tracking-wide">最終確認</h2>
                    <p className="text-sm font-manuscript text-[#E8D5A3]/50 leading-relaxed">
                      資料將於此刻永久刪除。<br />
                      旅程記憶不留分毫。
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmStep(0)}
                  className="flex-1 h-11 rounded-sm border border-[#C9A84C]/20 text-sm font-display text-[#E8D5A3]/60 hover:text-[#E8D5A3] hover:border-[#C9A84C]/40 transition-colors duration-150 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <X className="w-3.5 h-3.5" />
                    取消
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (confirmStep < 3) {
                      setConfirmStep((s) => s + 1);
                    } else {
                      handleLogout();
                    }
                  }}
                  className={`flex-1 h-11 rounded-sm text-sm font-display tracking-wide transition-all duration-150 active:scale-95 ${
                    confirmStep === 3
                      ? "bg-red-900/80 border border-red-700/50 text-red-200 hover:bg-red-800/80"
                      : "bg-red-950/60 border border-red-800/30 text-red-300/80 hover:text-red-200"
                  }`}
                >
                  {confirmStep < 3 ? "仍要捨棄" : "永久刪除"}
                </button>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pt-16 pb-8 space-y-6">
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

        {/* Guide Card */}
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

        {/* Task Card */}
        <div
          className={`relative scroll-border rounded-sm p-5 ${station.theme.cardAccent} animate-fade-up`}
          style={{ animationDelay: "160ms" }}
        >
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
            dataUrl={photoDataUrl}
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
                onChange={handleMessageChange}
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
