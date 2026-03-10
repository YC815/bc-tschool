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
  prompt: string;
  nextStation: string;
  isFinal?: boolean;
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
      "抬頭：找一支「正在轉動的風車」。",
      "聽：站在海邊聽 10 秒風聲或浪聲。",
      "看：找一條由風或海「推動」的線（旗、浪、電塔線影、草）。",
    ],
    task: "騎行時，只要看到「被推動」的東西，就在心裡記住。",
    prompt: "記錄這趟旅途中，流動讓我",
    nextStation: "/station/2",
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
      "伸手感受太陽的熱（至少 10 秒）。",
      "看地面：尋找影子最短的瞬間。",
    ],
    task: "觀察一路上「光在哪裡最強」。",
    prompt: "光照亮了我前行的路，那一刻",
    nextStation: "/station/3",
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
      "今天第一個讓你喘的坡，停下來 10 秒。",
      "記住坡頂看到的第一樣東西。",
      "到鎮瀾宮找「最老的木紋」。",
    ],
    task: "留意所有木頭：老屋、門框、神轎、樑柱、木椅。",
    prompt: "時間在這片土地留下的痕跡，讓我",
    nextStation: "/station/4",
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
      "坐下來，深呼吸三次。",
      "打開相簿：從前三站挑出一張最喜歡的照片。",
      "寫一句話：「這趟旅程帶給我的＿＿＿＿。」",
    ],
    task: "這是終點，也是回望整趟旅程的時刻。",
    prompt: "這趟旅程帶給我的",
    nextStation: "/result",
    isFinal: true,
  },
};

export function getStation(id: string): StationData | null {
  return STATIONS[id] || null;
}

export function getAllStationIds(): string[] {
  return Object.keys(STATIONS);
}
