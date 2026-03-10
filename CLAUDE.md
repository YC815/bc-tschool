# 專案指引：RPG 任務回傳系統

## 專案背景

這是一個 **RPG 任務回傳系統**，使用者需要上傳照片、填寫文字心得來完成任務。
介面需要融合 RPG 故事感與實用性。Mobile-first，主要在手機使用。

---

## UI/UX 設計指引（每次產出 UI 必讀）

> **IMPORTANT**：每次產出任何 UI 元件、頁面、樣式時，必須完整遵守以下所有規範。
> 這些規範優先於任何通用 AI 預設審美。

### 整體美學方向

- **風格**：奇幻中世紀 × 現代都市奇幻（帶 JRPG 質感）
- **背景色**：深色底為主（`#0D0D0D` 或深棕 `#1A1208` / 深藍 `#080D1A`）
- **強調色**：單一強調色系（金 `#C9A84C` / 琥珀 `#D4822A` / 魔法藍 `#4A90D9`）
- **字體**：
  - 標題：`Cinzel`、`Uncial Antiqua`、`Noto Serif TC`（有個性的 serif / display）
  - 內文：`Noto Serif TC`、`EB Garamond`（可讀性優先的 serif）
  - **絕對禁止**：`Inter`、`Roboto`、`Arial`、`system-ui`

### 絕對禁止清單

```
❌ Inter / Roboto / Arial / Space Grotesk 字體
❌ 紫色漸層白底
❌ 過重卡片陰影（box-shadow 超過 3 層）
❌ 通用 AI 預設審美（白底 + 紫色按鈕 + 圓角卡片）
❌ Emoji 替代 icon（一律用 Lucide icons 或 custom SVG）
```

### 任務卡片 UI

- 任務以「卷軸」或「委託書」形式呈現，而非普通卡片
- 狀態標籤用 RPG 風格：`接受中` → `進行中` → `待審核` → `完成`
- 完成任務時要有儀式感動畫：光效、印章蓋下、羊皮紙展開等

### 照片上傳區域

- 設計成「物品欄」或「證物袋」風格
- 預覽圖片加輕微老舊紙張 filter：`filter: sepia(0.15) contrast(1.05) brightness(0.95)`
- 上傳成功要有正向反饋動畫（光暈、蓋章、文字浮現）

### 文字輸入

- `textarea` 背景使用紙張質感（subtle noise texture via CSS `background-image`）
- placeholder 用第一人稱故事語氣：「記錄你的冒險經歷...」、「描述這趟旅途的收穫...」

### 互動細節

- 所有 hover/tap：`transition: all 150ms–250ms ease`
- 按鈕點擊：`transform: scale(0.97)` 物理感回饋
- 頁面載入：staggered fade-in，每個元素延遲 `80–120ms` 依序出現
- 動畫優先 CSS，複雜互動用 Framer Motion

### 技術規範

- **Mobile-first**，主要在手機使用，touch target ≥ 44px
- **Tailwind CSS** + 自定義 CSS variables（`--color-gold`, `--color-bg`, etc.）
- **Lucide icons** 或 custom SVG，禁止 emoji 替代 icon
- 動畫：CSS 優先，複雜互動用 Framer Motion

---

## 每次產出 UI 的強制 Checklist

在輸出任何 UI 程式碼前，確認每項都已達到：

- [ ] 有明確的視覺層次（主要/次要/輔助資訊清楚區分）
- [ ] 深色背景文字對比度 ≥ 4.5:1（WCAG AA）
- [ ] 所有可點擊元素 touch target ≥ 44px
- [ ] 沒有使用通用 AI 預設審美（Inter + 白底 + 紫色按鈕）
- [ ] 空狀態（empty state）有設計，不是空白
- [ ] 字體不是 Inter / Roboto / Arial
- [ ] 背景是深色系，非白底

---

## 技術開發規範

### NextJS 專案

```bash
# 檢查指令（反覆使用）
npm run lint
npx tsc --noEmit

# 禁止使用
npm run dev
```

### UI 元件

- 優先使用 **shadcn/ui**（建在 Radix UI + Tailwind 之上）
- 需要 shadcn 元件時使用 `shadcn` MCP Tool

---

## Skill 參考

開發 UI 時主動參考以下 skill 的指引：

- **`frontend-design`**：產出 distinctive、production-grade 前端介面的核心指引
- **`ui-styling`**：shadcn/ui + Tailwind 元件與樣式設計
- **`ui-ux-pro-max`**：完整 UI/UX 設計系統

> 每次產出 UI 時，優先以 `frontend-design` skill 的思考框架為基礎，
> 再結合本文件的 RPG 主題規範執行。
