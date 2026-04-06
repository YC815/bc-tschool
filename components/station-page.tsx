"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PhotoUploader } from "@/components/photo-uploader";
import { StationDialogue } from "@/components/station-dialogue";
import { StationData } from "@/lib/stations";
import { useJourney } from "@/lib/journey-context";
import {
  Camera,
  Waves,
  Flame,
  TreePine,
  Landmark,
  User,
  LogOut,
  X,
  AlertTriangle,
  Skull,
  Wind,
  Mail,
  Sword,
  MapPin,
} from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmStep, setConfirmStep] = useState(0);
  const [isDeparting, setIsDeparting] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [dialogueDone, setDialogueDone] = useState(false);
  const [showReadyDialog, setShowReadyDialog] = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  const stationId = String(station.number) as "1" | "2" | "3" | "4";

  // Restore draft from IDB once loaded
  useEffect(() => {
    if (!isLoaded) return;
    const draft = state?.submissions[stationId];
    if (draft) {
      startTransition(() => {
        if (draft.photoDataUrl) setPhotoDataUrl(draft.photoDataUrl);
        // Skip location gate if station already completed
        if (draft.submittedAt) {
          setLocationConfirmed(true);
          setDialogueDone(true);
        }
      });
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Envelope open animation (station 4 only)
  useEffect(() => {
    if (!station.isFinal) return;
    const t = setTimeout(() => setEnvelopeOpen(true), 600);
    return () => clearTimeout(t);
  }, [station.isFinal]);

  const handlePhotoSelect = async (dataUrl: string | null) => {
    setPhotoDataUrl(dataUrl);
    await saveStationDraft(stationId, { photoDataUrl: dataUrl });
  };

  const handleSubmit = async () => {
    if (!photoDataUrl) return;

    // Station 4: after photo upload, go to write page
    if (station.isFinal) {
      setIsSubmitting(true);
      try {
        await fetch("/api/journey/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: station.number,
            photoDataUrl,
            message: "",
            nickname: state?.nickname ?? "",
          }),
        });
        await markSubmitted(stationId, Date.now());
      } catch {
        // Silent fail
      }
      setIsSubmitting(false);
      router.push("/station/4/write");
      return;
    }

    // Non-final stations
    setIsSubmitting(true);
    try {
      await fetch("/api/journey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: station.number,
          photoDataUrl,
          message: "",
          nickname: state?.nickname ?? "",
        }),
      });
      await markSubmitted(stationId, Date.now());
    } catch {
      // Silent fail
    }
    setIsSubmitting(false);
    setIsDeparting(true);
  };

  const handleLogout = async () => {
    await clearJourneyData();
    router.push("/");
  };

  const isComplete = !!photoDataUrl;

  const progressPercent = (station.number / 4) * 100;
  const StationIcon = STATION_ICONS[station.number] ?? Landmark;

  const allSubmissions = Object.values(state?.submissions ?? {});
  const photoCount = allSubmissions.filter((s) => s.photoDataUrl).length;
  const completedCount = allSubmissions.filter((s) => s.submittedAt).length;
  const nickname = state?.nickname;

  // Previous 3 station photos for station 4
  const prevPhotos = station.isFinal
    ? (["1", "2", "3"] as const).map(
        (id) => state?.submissions[id]?.photoDataUrl ?? null
      )
    : [];

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

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)} />
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

        {/* Photo Count */}
        <div className="flex items-center gap-1 text-xs font-manuscript text-[#E8D5A3]/50">
          <Camera className="w-3 h-3 text-[#C9A84C]/50" />
          <span className="tabular-nums text-[#C9A84C]/80">{photoCount}</span>
        </div>
      </div>

      {/* ── Logout Confirmation Modals ── */}
      {confirmStep > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-[#0D0D0D]/90 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-sm border border-[#C9A84C]/20 bg-[#1A1208] shadow-[0_8px_48px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-red-800/60 to-transparent" />
            <div className="p-6 space-y-5">
              <div className="flex flex-col items-center gap-3">
                {confirmStep === 1 && <AlertTriangle className="w-8 h-8 text-amber-500/80" />}
                {confirmStep === 2 && <AlertTriangle className="w-8 h-8 text-red-500/80" />}
                {confirmStep === 3 && <Skull className="w-8 h-8 text-red-600" />}
                <p className="text-[10px] font-display tracking-[0.3em] text-[#C9A84C]/30 uppercase">
                  確認 {confirmStep} / 3
                </p>
              </div>
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
                      資料將於此刻永久刪除。<br />旅程記憶不留分毫。
                    </p>
                  </>
                )}
              </div>
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
                    if (confirmStep < 3) setConfirmStep((s) => s + 1);
                    else handleLogout();
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
            <div className="h-0.5 bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />
          </div>
        </div>
      )}

      {/* ── Location Confirmation Gate ── */}
      {!locationConfirmed && (
        <>
          {/* Ready dialog */}
          {showReadyDialog && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
              <div className="absolute inset-0 bg-[#0D0D0D]/85 backdrop-blur-sm" />
              <div className="relative w-full max-w-sm rounded-sm border border-[#C9A84C]/30 bg-[#1A1208] shadow-[0_8px_48px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-up">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
                <div className="p-6 space-y-5 text-center">
                  <div className="flex justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
                      <Sword className="w-7 h-7 text-[#C9A84C]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-display text-lg text-[#E8D5A3] tracking-wide">準備好迎接任務了嗎？</h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => { setLocationConfirmed(true); setShowReadyDialog(false); }}
                      className="w-full h-12 rounded-sm bg-gradient-to-r from-[#C9A84C] to-[#D4822A] text-[#1A1208] font-display tracking-wider btn-rpg"
                    >
                      準備好了！
                    </button>
                    <button
                      onClick={() => setShowReadyDialog(false)}
                      className="w-full h-11 rounded-sm border border-[#C9A84C]/20 text-sm font-display text-[#E8D5A3]/60 hover:text-[#E8D5A3] hover:border-[#C9A84C]/40 transition-colors duration-150 active:scale-95"
                    >
                      其實我還沒到
                    </button>
                  </div>
                </div>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
              </div>
            </div>
          )}

          {/* Gate screen */}
          <div className="max-w-lg mx-auto px-4 pt-16 pb-8 flex flex-col items-center justify-center min-h-screen">
            <div className="text-center space-y-8 animate-fade-up">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-[#C9A84C]" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="font-manuscript text-[#E8D5A3]/60 text-base">你現在是不是到</p>
                <h1 className="font-display text-2xl text-gold-gradient tracking-wide">
                  「{station.name}」
                </h1>
                <p className="font-manuscript text-[#E8D5A3]/60 text-base">了？</p>
              </div>
              <button
                onClick={() => setShowReadyDialog(true)}
                className="h-12 px-10 rounded-sm bg-gradient-to-r from-[#C9A84C] to-[#D4822A] text-[#1A1208] font-display tracking-wider btn-rpg"
              >
                是
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Departure Dialog (stations 1-3) ── */}
      {isDeparting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-[#0D0D0D]/85 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-sm border border-[#C9A84C]/30 bg-[#1A1208] shadow-[0_8px_48px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-up">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
            <div className="p-6 space-y-5 text-center">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
                  <Wind className="w-7 h-7 text-[#C9A84C]" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-lg text-[#E8D5A3] tracking-wide">準備出發</h2>
                <p className="text-sm font-manuscript text-[#E8D5A3]/60 leading-relaxed">
                  {station.departureMessage ?? "手機收起，繼續感受旅途。下一站見。"}
                </p>
              </div>
              <button
                onClick={() => router.push(station.nextStation)}
                className="w-full h-12 rounded-sm bg-gradient-to-r from-[#C9A84C] to-[#D4822A] text-[#1A1208] font-display tracking-wider btn-rpg"
              >
                出發！
              </button>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
          </div>
        </div>
      )}

      {/* JRPG 對話層 */}
      {locationConfirmed && !dialogueDone && station.entryDialogues && (
        <StationDialogue
          dialogues={station.entryDialogues}
          theme={station.theme}
          stationNumber={station.number}
          speakerName={station.speakerName}
          onComplete={() => setDialogueDone(true)}
        />
      )}

      {/* 任務 UI */}
      {locationConfirmed && (dialogueDone || !station.entryDialogues) && <div className="max-w-lg mx-auto px-4 pt-16 pb-8 space-y-6">
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

        {/* ── Station 4 Envelope ── */}
        {station.isFinal && (
          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <div className={`envelope-wrapper ${envelopeOpen ? "envelope-open" : ""}`}>
              {/* Envelope body */}
              <div className="envelope-body scroll-border rounded-sm bg-[#1A1208] overflow-hidden">
                {/* Flap */}
                <div className="envelope-flap" />
                {/* Letter content inside */}
                <div className={`envelope-letter transition-all duration-700 ${envelopeOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "400ms" }}>
                  <div className="px-5 pt-3 pb-5 space-y-3">
                    <div className="flex items-center gap-2 text-[#C9A84C]/60">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs font-display tracking-widest uppercase">給旅者的信</span>
                    </div>
                    <p className="text-sm font-manuscript text-[#E8D5A3]/70 leading-relaxed italic">
                      {station.envelopeNarrative}
                    </p>
                    {/* Previous station photo thumbnails */}
                    {prevPhotos.some(Boolean) && (
                      <div className="flex gap-2 pt-1">
                        {prevPhotos.map((photo, i) => (
                          <div
                            key={i}
                            className="flex-1 aspect-square rounded-sm overflow-hidden border border-[#C9A84C]/20 bg-[#0D0D0D]"
                          >
                            {photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={photo}
                                alt={`站 ${i + 1}`}
                                className="w-full h-full object-cover photo-aged"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-[10px] font-display text-[#C9A84C]/30">
                                  站 {i + 1}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guide Card */}
        <div className="scroll-border rounded-sm overflow-hidden animate-fade-up" style={{ animationDelay: "80ms" }}>
          {/* Banner */}
          <div className="bg-[#1A1208] border-b border-[#C9A84C]/30 px-5 py-3">
            <div className="flex items-center gap-2 text-[#C9A84C] font-display tracking-widest text-base">
              <Sword className="w-4 h-4" />
              <span>任 務 指 引</span>
            </div>
            <div className="mt-1 text-[#C9A84C]/30 text-xs tracking-widest select-none">
              ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
            </div>
          </div>
          {/* Steps */}
          <ul>
            {station.guide.map((step, index) => (
              <li
                key={index}
                className="flex gap-3 px-5 py-4 border-b border-[#C9A84C]/10 last:border-b-0 border-l-2 border-l-[#C9A84C]/50 font-manuscript"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-sm bg-[#C9A84C]/15 border border-[#C9A84C]/30 font-display text-[#C9A84C] text-sm flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-[#E8D5A3]/90 text-base leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Report Card */}
        <div className="scroll-border rounded-sm p-5 space-y-5 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <div className="border-t border-[#C9A84C]/20" />
          <div className="flex items-center gap-2 text-[#C9A84C] font-display tracking-wider text-sm">
            <Camera className="w-4 h-4" />
            <span>{station.isFinal ? "最終回報" : "此站回報"}</span>
          </div>

          <PhotoUploader
            onPhotoSelect={handlePhotoSelect}
            dataUrl={photoDataUrl}
          />

          <button
            className="w-full h-12 rounded-sm bg-gradient-to-r from-[#C9A84C] to-[#D4822A] text-[#1A1208] font-display tracking-wider btn-rpg disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
          >
            {isSubmitting
              ? "儲存中..."
              : station.isFinal
                ? "完成，前往最後任務"
                : "完成，前往下一站"
            }
          </button>
          <div className="border-b border-[#C9A84C]/20" />
        </div>
      </div>}
    </div>
  );
}
