export interface StationData {
  number: number;
  name: string;
  elements: string[];
  emoji: string;
  theme: {
    gradient: string;
    cardAccent: string;
    cardAccentBorder: string;
    cardAccentText: string;
    cardAccentTitle: string;
  };
  guide: string[];
  task: string;
  prompt?: string;
  nextStation: string;
  isFinal?: boolean;
  departureMessage?: string;
  envelopeNarrative?: string;
  minLength?: number;
  maxLength?: number;
  revealDialogues?: string[];
  messengerReveal?: string;
}

export const STATIONS: Record<string, StationData> = {
  "1": {
    number: 1,
    name: "香山 17公里海岸線",
    elements: ["風", "海"],
    emoji: "🌊",
    theme: {
      gradient: "from-[#080D1A] via-[#0D0D0D] to-[#0D0D0D]",
      cardAccent: "bg-[#4A90D9]/10",
      cardAccentBorder: "border-[#4A90D9]/30",
      cardAccentText: "text-[#4A90D9]/80",
      cardAccentTitle: "text-[#4A90D9]",
    },
    guide: [
      "抓出隱形的風！",
      "找任何「被風推動」的東西——旗、草、浪、電塔線影。",
      "對準它，按下快門。",
    ],
    task: "騎上路，把手機收起來。用眼睛繼續找風。",
    nextStation: "/station/2",
    departureMessage: "手機收起，用心感受路上的風吧！下一站見。",
    envelopeNarrative: "站一的元素是風與海——流動本身。",
  },
  "2": {
    number: 2,
    name: "通霄 日落大道觀景台",
    elements: ["火"],
    emoji: "☀️",
    theme: {
      gradient: "from-[#1A0D00] via-[#0D0D0D] to-[#0D0D0D]",
      cardAccent: "bg-[#E87D3E]/10",
      cardAccentBorder: "border-[#E87D3E]/30",
      cardAccentText: "text-[#E87D3E]/80",
      cardAccentTitle: "text-[#E87D3E]",
    },
    guide: [
      "尋找火焰的替身！",
      "☀️ 晴天：找被曬熱的表面（石頭、柏油、鐵欄杆），手背感受 3 秒。",
      "🌧 陰雨天：找任何讓你聯想到「暖」或「火」的顏色或畫面。",
    ],
    task: "任何天氣：拍下此刻讓你感覺「暖」的那個畫面。",
    nextStation: "/station/3",
    departureMessage: "手機收起，用心感受路上的火吧！下一站見。",
  },
  "3": {
    number: 3,
    name: "大甲 鎮瀾宮前廣場",
    elements: ["土", "木"],
    emoji: "🌳",
    theme: {
      gradient: "from-[#0D1208] via-[#0D0D0D] to-[#0D0D0D]",
      cardAccent: "bg-[#B8955A]/10",
      cardAccentBorder: "border-[#B8955A]/30",
      cardAccentText: "text-[#B8955A]/80",
      cardAccentTitle: "text-[#B8955A]",
    },
    guide: [
      "尋找阿公級的痕跡！",
      "在廣場找一樣最有年紀的東西——老木柱、龜裂石板、磨光門檻。",
      "靠近它，拍下那道歲月留下的紋路。",
    ],
    task: "路上留意舊的東西：老屋、老樹、老招牌。",
    nextStation: "/station/4",
    departureMessage: "手機收起，繼續感受土地的厚度。終點見！",
  },
  "4": {
    number: 4,
    name: "台中舊火車站前廣場",
    elements: ["金"],
    emoji: "🏛️",
    theme: {
      gradient: "from-[#1A1208] via-[#0D0D0D] to-[#0D0D0D]",
      cardAccent: "bg-[#C9A84C]/10",
      cardAccentBorder: "border-[#C9A84C]/30",
      cardAccentText: "text-[#C9A84C]/80",
      cardAccentTitle: "text-[#C9A84C]",
    },
    guide: [
      "尋找你的「金」——閃耀的證據！",
      "在舊車站周圍，找一樣讓你聯想到「這趟旅程」的東西。",
      "可以是：車站的某個角落、你腳下的影子、遠方的建築、或是任何讓你覺得「我到了」的畫面。",
      "拍下這個「抵達」的證明。",
    ],
    task: "深呼吸三次，環顧四周。這趟旅程的終點，你想記住什麼？",
    prompt: "走完這段路，我想說的是",
    nextStation: "/result",
    isFinal: true,
    envelopeNarrative:
      "你騎過了風、穿過了火、踏過了土木，如今以金收束。這封信等了你整整一天。",
    maxLength: 150,
    revealDialogues: [
      "你小心地撕開信封封口。",
      "裡面......",
      "是空白的。",
    ],
    messengerReveal:
      "原來，想要你實際走過這段路，用雙腳、雙眼深深感受——那才是真正的訊息。",
  },
};

export function getStation(id: string): StationData | null {
  return STATIONS[id] || null;
}

export function getAllStationIds(): string[] {
  return Object.keys(STATIONS);
}
