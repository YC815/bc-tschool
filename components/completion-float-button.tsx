"use client";

import { usePathname, useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { useJourney } from "@/lib/journey-context";

export function CompletionFloatButton() {
  const { state, isLoaded } = useJourney();
  const pathname = usePathname();
  const router = useRouter();

  if (!isLoaded) return null;
  if (!state?.completedAt) return null;
  if (pathname === "/result") return null;

  return (
    <button
      onClick={() => router.push("/result")}
      className="fixed bottom-6 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-sm border border-[#C9A84C]/60 bg-[#1A1208]/95 backdrop-blur-sm text-[#C9A84C] font-display tracking-wider text-sm shadow-[0_4px_24px_rgba(201,168,76,0.2),0_0_0_1px_rgba(201,168,76,0.1)] hover:border-[#C9A84C]/80 hover:bg-[#C9A84C]/10 active:scale-[0.97] transition-all duration-200 animate-fade-up"
      style={{ animationDelay: "400ms" }}
    >
      <Landmark className="w-4 h-4 flex-shrink-0" />
      <span>前往完成頁面</span>
    </button>
  );
}
