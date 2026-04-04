import type { Metadata } from "next";
import { Cinzel, Noto_Serif_TC, EB_Garamond } from "next/font/google";
import { JourneyProvider } from "@/lib/journey-context";
import { CompletionFloatButton } from "@/components/completion-float-button";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-serif-tc",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-eb-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "元素傳遞 - 單車環島 Day.2",
  description: "一場與感官對話的旅程",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${cinzel.variable} ${notoSerifTC.variable} ${ebGaramond.variable}`}>
      <body className="antialiased min-h-screen bg-background font-manuscript">
        <JourneyProvider>
          {children}
          <CompletionFloatButton />
        </JourneyProvider>
      </body>
    </html>
  );
}
