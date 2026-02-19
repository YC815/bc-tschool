# AGENTS.md

## Project Overview

這是一個單車環島 Day.2 互動遊戲專案（新竹至台中）。
- 網站: https://bc.tschool.cc
- 概念：元素傳遞實境解謎遊戲（風、海、火、土、木、金）
- 技術棧：Next.js 16 + TypeScript + Tailwind CSS + PostgreSQL + Prisma

## Build Commands

```bash
# 開發環境（在 web/ 目錄下執行）
cd web
npm run dev        # 啟動開發伺服器 - 禁止使用，使用其他測試方式
npm run build      # 建構生產版本
npm run start      # 啟動生產伺服器

# 程式碼品質檢查
npm run lint       # 執行 ESLint 檢查
npx tsc --noEmit   # TypeScript 型別檢查

# 測試
npm test           # 執行所有測試
npm test -- <pattern>  # 執行單一測試檔案
```

## Code Style Guidelines

### 基本原則
- 簡潔優先：函式不超過 3 層縮排，只做一件事
- 消除特殊情況：用資料結構設計取代 if/else 分支
- 永不破壞現有功能：向後相容是鐵律

### TypeScript 規範
- 啟用 strict mode
- 避免 `any`，使用具體型別
- 介面命名使用 PascalCase（如 `UserData`）
- 型別定義放在獨立檔案或靠近使用處

### 命名慣例
- 變數/函式：camelCase（如 `getUserData`）
- 元件：PascalCase（如 `PhotoUploader`）
- 常數：UPPER_SNAKE_CASE（如 `MAX_UPLOAD_SIZE`）
- 檔案：kebab-case（如 `user-service.ts`）

### Import 規範
```typescript
// 1. 外部套件
import React from 'react';

// 2. 內部絕對路徑
import { Button } from '@/components/ui/button';

// 3. 內部相對路徑
import { useGameState } from '../hooks/use-game-state';
```

### 錯誤處理
- 使用具體錯誤類別，避免泛型 Error
- 非同步操作必須有 try/catch
- 使用者錯誤要有友善提示
- 絕不暴露敏感資訊到前端

### 資料庫規範
- 所有資料即時備份到 PostgreSQL
- 不依賴瀏覽器本地儲存
- 使用 ORM（如 Prisma）管理資料結構

### UI/UX 要求
- 行動裝置優先（手機體驗要好）
- 使用 ShadcnUI 元件庫
- 照片上傳介面要直覺

## Project Structure

```
/web/            # Next.js 專案目錄
  - app/              # App Router
  - components/       # React 元件
  - lib/              # 工具函式
  - prisma/           # Prisma 設定
  - public/           # 靜態資源
  - .env.local        # 環境變數（已加入 .gitignore）

/docs/           # 企劃文件
  - 實境解謎規劃.md    # 遊戲流程設計
  - 手冊資訊整理.md    # 停靠點資訊
  - 技術架構.md        # 技術規格文件
```

## 注意事項

1. 專案已初始化於 `web/` 目錄
2. 所有操作請在 `web/` 目錄下執行
3. `.env*` 檔案已加入 `.gitignore`，可安全放置資料庫連線等敏感資訊
4. 遊戲核心：四站打卡（香山、通霄、大甲、台中舊車站）
5. 每站任務：一張照片 + 一句話
6. 終點生成專屬紀念圖片
