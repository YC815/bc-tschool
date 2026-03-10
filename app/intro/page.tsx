"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useJourney } from "@/lib/journey-context";
import { Wind } from "lucide-react";

const DIALOGUES = [
  { speaker: "風之使者", text: "你就是今天的傳遞者嗎？" },
  { speaker: "風之使者", text: "我有一封信，需要你帶到台中舊火車站。" },
  { speaker: "風之使者", text: "沿途，六種元素會為你引路。" },
  { speaker: "風之使者", text: "但——在你抵達終點之前，不要打開這封信。" },
  { speaker: null, text: "" }, // nickname line, filled dynamically
  { speaker: "風之使者", text: "出發吧。風會第一個找上你的。" },
];

export default function IntroPage() {
  const router = useRouter();
  const { state, isLoaded, setIntroSeen } = useJourney();

  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [ready, setReady] = useState(false);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build dialogues with nickname interpolation
  const dialogues = DIALOGUES.map((d, i) => {
    if (i === 4) {
      const nick = state?.nickname ?? "旅者";
      return {
        speaker: nick,
        text: `（接過信封，感受到它出奇的輕盈）`,
      };
    }
    return d;
  });

  // Guard: redirect if already seen or no nickname
  useEffect(() => {
    if (!isLoaded) return;
    if (state?.introSeen) {
      router.replace("/station/1");
      return;
    }
    if (!state?.nickname) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [isLoaded, state?.introSeen, state?.nickname, router]);

  // Typewriter effect
  useEffect(() => {
    if (!ready) return;
    const current = dialogues[index];
    if (!current) return;

    setDisplayed("");
    setIsTyping(true);
    let i = 0;

    const tick = () => {
      i++;
      setDisplayed(current.text.slice(0, i));
      if (i < current.text.length) {
        typingRef.current = setTimeout(tick, 45);
      } else {
        setIsTyping(false);
      }
    };
    typingRef.current = setTimeout(tick, 120);

    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [index, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdvance = () => {
    if (isTyping) {
      // Skip typewriter — show full text immediately
      if (typingRef.current) clearTimeout(typingRef.current);
      setDisplayed(dialogues[index].text);
      setIsTyping(false);
      return;
    }
    if (index < dialogues.length - 1) {
      setIndex((v) => v + 1);
    }
  };

  const handleAccept = async () => {
    await setIntroSeen();
    router.push("/station/1");
  };

  const isLastLine = index === dialogues.length - 1 && !isTyping;
  const current = dialogues[index];

  if (!ready) {
    return <div className="min-h-screen bg-[#0D0D0D]" />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#080D1A] via-[#0D0D0D] to-[#1A1208] flex flex-col"
      onClick={!isLastLine ? handleAdvance : undefined}
    >
      {/* Background atmosphere */}
      <div className="flex-1 flex items-center justify-center px-6 pointer-events-none select-none">
        <div className="text-center space-y-4 animate-fade-up opacity-20">
          <Wind className="w-16 h-16 text-[#4A90D9] mx-auto" />
          <p className="text-[#4A90D9]/40 font-display tracking-[0.4em] text-xs uppercase">
            元素傳遞
          </p>
        </div>
      </div>

      {/* JRPG dialogue box — fixed bottom */}
      <div className="px-4 pb-8">
        <div
          className="w-full max-w-lg mx-auto scroll-border rounded-sm bg-[#0D0D0D]/95 backdrop-blur-sm overflow-hidden animate-dialogue"
          key={index}
        >
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#4A90D9]/50 to-transparent" />

          <div className="p-5 space-y-3 min-h-[120px]">
            {/* Speaker name */}
            {current.speaker && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4A90D9]" />
                <span className="text-xs font-display text-[#4A90D9] tracking-wider">
                  {current.speaker}
                </span>
              </div>
            )}

            {/* Dialogue text */}
            <p className="font-manuscript text-[#E8D5A3]/90 leading-relaxed text-base">
              {displayed}
              {isTyping && (
                <span className="inline-block w-0.5 h-4 bg-[#C9A84C]/70 ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          </div>

          {/* Footer */}
          <div className="px-5 pb-4">
            {isLastLine ? (
              <button
                onClick={handleAccept}
                className="w-full h-12 rounded-sm bg-gradient-to-r from-[#C9A84C] to-[#D4822A] text-[#1A1208] font-display tracking-wider btn-rpg text-sm"
              >
                接受委託，出發
              </button>
            ) : (
              <div className="flex justify-end">
                <div className="flex items-center gap-1.5 text-[#C9A84C]/40 text-xs font-manuscript animate-pulse">
                  <span>{isTyping ? "..." : "點擊繼續"}</span>
                  {!isTyping && (
                    <span className="inline-block w-2 h-2 border-r-2 border-b-2 border-[#C9A84C]/40 rotate-45 mb-0.5" />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {dialogues.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i < index
                  ? "bg-[#C9A84C]/60"
                  : i === index
                    ? "bg-[#C9A84C] scale-125"
                    : "bg-[#C9A84C]/15"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
