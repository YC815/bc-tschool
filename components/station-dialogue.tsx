"use client";

import { useEffect, useRef, useState } from "react";
import {
  Wind, Waves, Flame, TreePine, Landmark,
  MapPin, BookOpen, Map, Shell, Sparkles, Wheat,
} from "lucide-react";
import { StationData, DialogueLine } from "@/lib/stations";

interface StationDialogueProps {
  dialogues: (string | DialogueLine)[];
  theme: StationData["theme"];
  stationNumber: number;
  speakerName?: string;
  onComplete: () => void;
}

const STATION_ICONS: Record<number, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  1: Waves,
  2: Flame,
  3: TreePine,
  4: Landmark,
};

const TOPIC_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Wind,
  MapPin,
  BookOpen,
  Map,
  Shell,
  Sparkles,
  Wheat,
  Waves,
  Flame,
  TreePine,
  Landmark,
};

function parseLine(line: string | DialogueLine): DialogueLine {
  return typeof line === "string" ? { text: line } : line;
}

export function StationDialogue({
  dialogues,
  theme,
  stationNumber,
  speakerName = "使者",
  onComplete,
}: StationDialogueProps) {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const StationIcon = STATION_ICONS[stationNumber] ?? Landmark;
  const accentHex = theme.cardAccentTitle.match(/#[A-Fa-f0-9]{6}/)?.[0] ?? "#C9A84C";

  const currentLine = parseLine(dialogues[dialogueIndex]);
  const TopicIcon = currentLine.icon ? (TOPIC_ICONS[currentLine.icon] ?? null) : null;

  useEffect(() => {
    if (typingRef.current) clearTimeout(typingRef.current);
    setDisplayText("");
    setIsTyping(true);

    const text = parseLine(dialogues[dialogueIndex]).text;
    let i = 0;

    const type = () => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
        typingRef.current = setTimeout(type, 40);
      } else {
        setIsTyping(false);
      }
    };

    typingRef.current = setTimeout(type, 40);

    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [dialogueIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdvance = () => {
    if (isTyping) {
      if (typingRef.current) clearTimeout(typingRef.current);
      setDisplayText(parseLine(dialogues[dialogueIndex]).text);
      setIsTyping(false);
    } else if (dialogueIndex < dialogues.length - 1) {
      setDialogueIndex((i) => i + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[55] animate-screen-reveal bg-gradient-to-b ${theme.gradient} flex flex-col`}
      onClick={handleAdvance}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-[#0D0D0D]/50" />

      {/* Central icon */}
      <div className="relative flex-1 flex items-center justify-center pointer-events-none">
        <StationIcon className="w-28 h-28 opacity-10 text-white" />
      </div>

      {/* Bottom dialogue box */}
      <div className="relative px-4 pb-10 pointer-events-none">
        <div
          key={dialogueIndex}
          className="scroll-border rounded-sm bg-[#0D0D0D]/90 backdrop-blur-sm animate-dialogue overflow-hidden"
        >
          {/* Top accent line */}
          <div
            className="h-0.5"
            style={{
              background: `linear-gradient(to right, transparent, ${accentHex}80, transparent)`,
            }}
          />

          <div className="p-6 min-h-[168px] space-y-4">
            {/* Speaker + optional topic icon badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StationIcon className="w-4 h-4" style={{ color: accentHex }} />
                <span
                  className="font-display text-sm tracking-wider"
                  style={{ color: accentHex }}
                >
                  {speakerName}
                </span>
              </div>
              {TopicIcon && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{ background: `${accentHex}20`, border: `1px solid ${accentHex}40` }}
                >
                  <TopicIcon className="w-4 h-4" style={{ color: accentHex }} />
                </div>
              )}
            </div>

            {/* Typewriter text */}
            <p className="font-manuscript text-[#E8D5A3]/90 leading-loose tracking-wide text-base">
              {displayText}
              {isTyping && (
                <span className="inline-block w-0.5 h-5 bg-[#E8D5A3]/60 align-middle ml-0.5 animate-pulse" />
              )}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex gap-2">
              {dialogues.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: accentHex,
                    opacity: i === dialogueIndex ? 1 : i < dialogueIndex ? 0.4 : 0.15,
                  }}
                />
              ))}
            </div>
            {/* Continue hint */}
            {!isTyping && (
              <span className="text-sm font-manuscript text-[#C9A84C]/40 animate-pulse">
                點擊繼續 ▼
              </span>
            )}
          </div>

          {/* Bottom accent line */}
          <div
            className="h-0.5"
            style={{
              background: `linear-gradient(to right, transparent, ${accentHex}40, transparent)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
