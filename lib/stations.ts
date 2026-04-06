export interface DialogueLine {
  text: string;
  icon?: string; // Lucide icon component name, e.g. "MapPin"
}

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
  speakerName?: string;
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
  entryDialogues?: (string | DialogueLine)[];
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
    speakerName: "風之使者",
    task: "騎上路，把手機收起來。用眼睛繼續找風。",
    nextStation: "/station/2",
    departureMessage: "手機收起，用心感受路上的風吧！下一站見。",
    envelopeNarrative: "站一的元素是風與海——流動本身。",
    entryDialogues: [
      { text: "感受到了嗎？打在臉上的，是新竹特產的『九降風』。這不是普通的海風——每年秋冬從東北方俯衝而來，才造就了眼前這一切。", icon: "Wind" },
      { text: "你知道『香山』這名字怎麼來的嗎？傳說早期航海人還沒看到岸，就先聞到山上的花香——驚嘆道：「這是一座香山啊！」", icon: "MapPin" },
      { text: "不過歷史學家有另一套說法：香山很可能是平埔族竹塹社地名的音譯。漢人聽了原住民的發音，挑了這兩個優雅的字留下來。", icon: "BookOpen" },
      { text: "眼前這片泥灘從金城湖延伸到海山漁港，全長 15 公里、面積 1,760 公頃。北台灣最大的潮間帶，國家級重要濕地。", icon: "Map" },
      { text: "這裡的土質是頭前溪帶來的有機泥漿，與海浪捲來的細沙交匯而成。這種「泥沙各半」的環境，是台灣招潮蟹最愛的棲地——全台數量最多就在這裡。", icon: "Shell" },
      { text: "知道新竹風為什麼這麼狂嗎？香山地形像個漏斗——東北季風一進來就被壓縮，風速瞬間加速噴射出去，就像你捏住水管的噴嘴。", icon: "Wind" },
      { text: "香山的蚵仔，是用花崗岩石柱插進泥灘養的「石蚵」。漲潮吃水，退潮曬風——比中南部的吊蚵慢一倍長大，但肉質緊實，鮮味極濃。", icon: "Shell" },
      { text: "香山一帶盛產矽砂，加上新竹地底的天然氣，這裡曾是台灣玻璃工業的重鎮。燈泡、酒瓶、藝術玻璃，都從這片海岸出發外銷全世界。", icon: "Sparkles" },
      { text: "九降風不只雕塑大地，還吹乾了新竹米粉。老師傅把米粉攤在竹篾上，讓強風帶走水分。這樣吹出來的米粉，韌脆有嚼勁，是機器烘乾比不上的味道。", icon: "Wheat" },
      "數百年來，從討海人到玻璃工匠，這裡的人都靠著讀懂這股風生活。現在換你了——用眼睛，找到風的形狀。",
    ],
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
    speakerName: "火之使者",
    task: "任何天氣：拍下此刻讓你感覺「暖」的那個畫面。",
    nextStation: "/station/3",
    departureMessage: "手機收起，用心感受路上的火吧！下一站見。",
    entryDialogues: [
      "站在這裡，你腳下的柏油路筆直衝向海平線——晴天有火龍，下雨天也沒關係，火焰從來不只是顏色，也藏在溫熱的石頭、橘色的燈光、剛淋過雨的柏油裡。",
      { text: "你知道「通霄」這名字怎麼來的嗎？1904 年日治時期的官員抬頭看了看高聳的虎頭山，覺得「吞」字不雅，改成了音近的「通霄」——寓意通往雲霄。", icon: "MapPin" },
      { text: "更早之前，這裡屬於平埔族道卡斯族的「吞霄社」，原名 Tonsuyan。漢人移民把這個音譯寫作「吞霄」——一個吞噬雲霄的地方。", icon: "BookOpen" },
      { text: "這條路的正式名稱是「台 61 線西濱快速道路新埔聯絡道」，原本只是平凡的交流道。但它從高坡向海平面筆直俯衝，製造了一種「公路通往大海」的視覺錯覺。", icon: "Map" },
      { text: "每年有兩次機會——約在 5 月與 7 月，夕陽會剛好落在這條公路的正中點。整條柏油路被染成金紅色，就像一條從天際燒下來的火龍。", icon: "Flame" },
      { text: "太多人為了拍這條路衝進車道違停，2023 年政府特地蓋了這座觀景台——讓你安全地站在高處，俯視整條燃燒的火龍。", icon: "Landmark" },
      { text: "看到遠方那棟鹽包造型的建築嗎？那是台鹽通霄精鹽廠——台灣目前唯一的食用鹽生產基地，你喝的「台鹽海洋鹼性離子水」也出自這裡。", icon: "Sparkles" },
      { text: "再往南騎，遠遠就能看到六根巨大的彩繪煙囪——那是通霄發電廠，全台最早的複循環發電廠，燃燒天然氣，支撐著整個台灣中部的電力。", icon: "Flame" },
      { text: "通霄還有一個被遺忘的身份：「雕刻城」。南華社區曾以神像雕刻聞名全台，大甲鎮瀾宮那些精緻的樑柱木雕，很多就出自通霄師傅之手。", icon: "Landmark" },
      "從吞噬天空的部落，到通往雲霄的小鎮——通霄用夕陽把每一天燃燒成儀式。現在，用你的眼睛，找到火焰的替身。",
    ],
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
    entryDialogues: [
      "兩百多年來，無數先民帶著對未知的恐懼橫渡黑水溝，最終在這裡雙腳踏上『實土』。",
      "抬頭看看那些樑柱與石獅，不知名的匠人將畢生心血刻入木與石中，吸收了幾世代人的香火。",
      "仔細看，去尋找那些阿公級的歲月痕跡。",
    ],
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
    entryDialogues: [
      "你抵達了。這座建於 1917 年的紅磚車站，曾是台灣鐵路全線貫通的心臟。",
      "百年後，它等到了騎行百公里的你。信封裡其實什麼都沒有——",
      "因為真正的『金』，是你一路扛過來的痠痛、汗水與堅持。留下你淬鍊成金的一句話吧。",
    ],
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
