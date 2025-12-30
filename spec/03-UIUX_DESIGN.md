# Sea Salt & Paper - UI/UX 設計規格書 (UI/UX Design Specification)

**版本**: 1.0.0
**最後更新**: 2025-12-13
**文件類型**: Software Design Document - UI/UX Design

---

## 目錄

1. [設計系統](#1-設計系統)
2. [佈局系統](#2-佈局系統)
3. [組件設計](#3-組件設計)
4. [動畫系統](#4-動畫系統)
5. [響應式設計](#5-響應式設計)
6. [無障礙設計](#6-無障礙設計)
7. [視覺規範](#7-視覺規範)

---

## 1. 設計系統

### 1.1 色彩系統

#### 1.1.1 主色系（海洋主題）

```css
/* 深海藍 */
--primary-ocean: #2C5F8D
--primary-ocean-dark: #1E4165
--primary-ocean-light: #4A7BA7
--primary-ocean-pale: #E8F2F9

/* 沙灘色系 */
--secondary-sand: #F5E6D3
--secondary-sand-dark: #E8D4B8
--secondary-sand-light: #FAF4ED

/* 珊瑚色（強調） */
--accent-coral: #E74C3C
--accent-coral-dark: #C0392B
--accent-coral-light: #EC7063
```

#### 1.1.2 遊戲卡片顏色

```css
--card-blue: #3B82F6       /* 藍色卡片 🔵 */
--card-red: #EF4444        /* 紅色卡片 🔴 */
--card-green: #22C55E      /* 綠色卡片 🟢 */
--card-yellow: #EAB308     /* 黃色卡片 🟡 */
--card-purple: #A855F7     /* 紫色卡片 🟣 */
--card-black: #374151      /* 黑色卡片 ⚫ */
--card-white: #F8FAFC      /* 白色卡片 ⚪ (僅美人魚) */
```

**顏色對應表**:

| 色碼 | Hex | 邊框色 | 淡背景 | 符號 |
|-----|-----|--------|--------|------|
| blue | #3B82F6 | #2563EB | rgba(59,130,246,0.15) | 🔵 |
| red | #EF4444 | #DC2626 | rgba(239,68,68,0.15) | 🔴 |
| green | #22C55E | #16A34A | rgba(34,197,94,0.15) | 🟢 |
| yellow | #EAB308 | #CA8A04 | rgba(234,179,8,0.15) | 🟡 |
| purple | #A855F7 | #9333EA | rgba(168,85,247,0.15) | 🟣 |
| black | #374151 | #1F2937 | rgba(55,65,81,0.15) | ⚫ |
| white | #F8FAFC | #CBD5E1 | rgba(248,250,252,0.5) | ⚪ |

#### 1.1.3 語義顏色

```css
/* 成功 */
--status-success: #27AE60
--status-success-light: #52D68C

/* 警告 */
--status-warning: #F39C12
--status-warning-light: #F8C471

/* 錯誤 */
--status-error: #E74C3C
--status-error-light: #EC7063

/* 資訊 */
--status-info: #3498DB
--status-info-light: #5DADE2
```

#### 1.1.4 中性色

```css
/* 背景色 */
--bg-primary: #FFFFFF
--bg-secondary: #F7F9FC
--bg-tertiary: #E8EDF5
--bg-overlay: rgba(0, 0, 0, 0.5)
--bg-game-table: linear-gradient(135deg, #2C5F8D 0%, #1E4165 100%)

/* 文字色 */
--text-primary: #2C3E50
--text-secondary: #7F8C8D
--text-tertiary: #BDC3C7
--text-inverse: #FFFFFF

/* 邊框色 */
--border-light: #E0E6ED
--border-medium: #BDC3C7
--border-dark: #7F8C8D
```

### 1.2 間距系統（8px Grid）

```css
--spacing-1: 0.25rem    /* 4px */
--spacing-2: 0.5rem     /* 8px */
--spacing-3: 0.75rem    /* 12px */
--spacing-4: 1rem       /* 16px */
--spacing-5: 1.25rem    /* 20px */
--spacing-6: 1.5rem     /* 24px */
--spacing-8: 2rem       /* 32px */
--spacing-10: 2.5rem    /* 40px */
--spacing-12: 3rem      /* 48px */
--spacing-16: 4rem      /* 64px */

/* 語義別名 */
--spacing-xs: var(--spacing-2)    /* 8px */
--spacing-sm: var(--spacing-3)    /* 12px */
--spacing-md: var(--spacing-4)    /* 16px */
--spacing-lg: var(--spacing-6)    /* 24px */
--spacing-xl: var(--spacing-8)    /* 32px */
```

### 1.3 字體系統

#### 1.3.1 字體家族

```css
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif
--font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace
```

#### 1.3.2 字體大小

```css
--font-size-xs: 0.75rem     /* 12px */
--font-size-sm: 0.875rem    /* 14px */
--font-size-base: 1rem      /* 16px */
--font-size-lg: 1.125rem    /* 18px */
--font-size-xl: 1.25rem     /* 20px */
--font-size-2xl: 1.5rem     /* 24px */
--font-size-3xl: 1.875rem   /* 30px */
--font-size-4xl: 2.25rem    /* 36px */

/* 卡片相關 */
--font-size-card-small: 0.875rem    /* 14px */
--font-size-card-medium: 1rem       /* 16px */
--font-size-card-large: 1.125rem    /* 18px */
```

#### 1.3.3 字體粗細

```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-extrabold: 800
```

#### 1.3.4 行高

```css
--line-height-tight: 1.2
--line-height-normal: 1.5
--line-height-relaxed: 1.75
--line-height-loose: 2
```

### 1.4 圓角系統

```css
--radius-sm: 0.25rem    /* 4px */
--radius-md: 0.5rem     /* 8px */
--radius-lg: 0.75rem    /* 12px */
--radius-xl: 1rem       /* 16px */
--radius-2xl: 1.5rem    /* 24px */
--radius-full: 9999px   /* 完全圓形 */

/* 組件別名 */
--radius-button: var(--radius-md)
--radius-card: var(--radius-lg)
--radius-modal: var(--radius-xl)
```

### 1.5 陰影系統

```css
/* 提升層級陰影 */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12)
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15)
--shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.2)
--shadow-2xl: 0 24px 48px rgba(0, 0, 0, 0.25)

/* 組件特定陰影 */
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.15)
--shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.2)
--shadow-modal: 0 20px 40px rgba(0, 0, 0, 0.3)
--shadow-dropdown: 0 8px 16px rgba(0, 0, 0, 0.15)

/* 內陰影 */
--shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.1)
```

### 1.6 動畫系統

#### 1.6.1 緩動函數

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

#### 1.6.2 動畫時長

```css
--duration-instant: 100ms
--duration-fast: 150ms
--duration-medium: 300ms
--duration-slow: 500ms
--duration-slower: 700ms
```

#### 1.6.3 預設轉換

```css
--transition-fast: var(--duration-fast) var(--ease-out)
--transition-medium: var(--duration-medium) var(--ease-out)
--transition-slow: var(--duration-slow) var(--ease-out)
--transition-all: all var(--duration-medium) var(--ease-out)
```

### 1.7 Z-Index 系統

```css
--z-index-dropdown: 1000
--z-index-modal-backdrop: 1040
--z-index-modal: 1050
--z-index-popover: 1060
--z-index-tooltip: 1070
--z-index-notification: 1080
```

---

## 2. 佈局系統

### 2.1 TableLayout - 四人牌桌佈局

#### 2.1.1 Grid 結構

```css
.table-layout {
  display: grid;
  grid-template-columns: 180px 1fr 180px;
  grid-template-rows: 140px 1fr auto 200px;
  grid-template-areas:
    ".      top     ."
    "left  center  right"
    ".     pairs    ."
    "bottom bottom  bottom";
  gap: var(--spacing-sm);
  height: 100%;
  min-height: 650px;
  padding: var(--spacing-md);
  background: var(--bg-game-table);
  border-radius: var(--radius-lg);
}
```

**視覺結構**:
```
┌─────────────────────────────────┐
│  .       TOP       .           │  140px
├──────┬─────────────┬────────────┤
│      │             │            │
│ LEFT │   CENTER    │   RIGHT    │  1fr
│      │             │            │
├──────┴─────────────┴────────────┤
│  .      PAIRS       .          │  auto
├─────────────────────────────────┤
│       BOTTOM (ME)               │  200px
└─────────────────────────────────┘
  180px      1fr        180px
```

#### 2.1.2 區域說明

| 區域 | 用途 | Grid Area |
|-----|------|-----------|
| TOP | 上方玩家座位 | top |
| LEFT | 左側玩家座位 | left |
| CENTER | 牌桌中央（牌堆、棄牌堆） | center |
| RIGHT | 右側玩家座位 | right |
| PAIRS | 對子展示區（已廢棄） | pairs |
| BOTTOM | 下方玩家座位（自己） | bottom |

#### 2.1.3 響應式調整

**1200px 以下：中等螢幕**
```css
@media (max-width: 1200px) {
  .table-layout {
    grid-template-columns: 150px 1fr 150px;
    grid-template-rows: 120px 1fr auto 180px;
    gap: var(--spacing-xs);
  }
}
```

**900px 以下：小螢幕**
```css
@media (max-width: 900px) {
  .table-layout {
    grid-template-columns: 120px 1fr 120px;
    grid-template-rows: 100px 1fr auto 160px;
  }
}
```

**768px 以下：行動裝置**
```css
@media (max-width: 768px) {
  .table-layout {
    grid-template-columns: 80px 1fr 80px;
    grid-template-rows: 80px 1fr auto 140px;
    min-height: 500px;
  }
}
```

### 2.2 TableSeat - 玩家座位

#### 2.2.1 基礎結構

```css
.table-seat {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-medium);
}
```

#### 2.2.2 位置變體

```css
.table-seat--bottom { grid-area: bottom; }
.table-seat--top { grid-area: top; }
.table-seat--left { grid-area: left; }
.table-seat--right { grid-area: right; }
```

#### 2.2.3 狀態變體

**空座位**:
```css
.table-seat--empty {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}
```

**活躍（當前回合）**:
```css
.table-seat--active {
  border-color: var(--accent-coral);
  box-shadow: 0 0 20px rgba(231, 76, 60, 0.4);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}
```

**斷線**:
```css
.table-seat--disconnected {
  opacity: 0.6;
  filter: grayscale(0.5);
}
```

**起始玩家**:
```css
.table-seat--starting-player {
  border: 2px solid rgba(255, 215, 0, 0.5);
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
}
```

### 2.3 TableCenter - 牌桌中央

```css
.table-center {
  grid-area: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
  position: relative;
}
```

**子元素排列**:
```
左棄牌堆  |  中央區  |  右棄牌堆
          |  牌堆    |
          |  選擇區  |
```

---

## 3. 組件設計

### 3.1 Card - 卡片組件

#### 3.1.1 尺寸系統

| 尺寸 | 寬度 | 高度 | 用途 |
|-----|------|------|------|
| small | 60px | 84px | 已打出對子、對手手牌背面 |
| medium | 80px | 112px | 玩家手牌、棄牌堆 |
| large | 100px | 140px | 特殊展示、教學 |

**實現**:
```css
.card--small {
  width: 60px;
  height: 84px;
  font-size: var(--font-size-card-small);
}

.card--medium {
  width: 80px;
  height: 112px;
  font-size: var(--font-size-card-medium);
}

.card--large {
  width: 100px;
  height: 140px;
  font-size: var(--font-size-card-large);
}
```

#### 3.1.2 卡片結構

```html
<div class="card card--medium card--selected">
  <div class="card__border"></div>
  <div class="card__content">
    <div class="card__emoji">🐟</div>
    <div class="card__name">Fish</div>
    <div class="card__score">0.5</div>
  </div>
  <div class="card__color-indicator"></div>
</div>
```

#### 3.1.3 卡片背面

```css
.card--face-down {
  background: linear-gradient(135deg, #2C5F8D 0%, #1E4165 100%);
}

.card--face-down .card__back-pattern {
  background-image: url('data:image/svg+xml,...'); /* 波浪圖案 */
  opacity: 0.3;
}
```

#### 3.1.4 卡片狀態

**選中**:
```css
.card--selected {
  transform: translateY(-10px);
  border-color: var(--accent-coral);
  box-shadow:
    0 0 0 3px var(--accent-coral),
    var(--shadow-card-hover);
}
```

**禁用**:
```css
.card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.3);
}
```

**可拖曳**:
```css
.card--draggable {
  cursor: grab;
}

.card--draggable:active {
  cursor: grabbing;
  transform: scale(0.95);
}
```

### 3.2 PlayerHand - 玩家手牌

#### 3.2.1 扇形佈局計算

```css
.player-hand {
  --card-count: 5;           /* 透過 JS 動態設定 */
  --rotation-max: 3deg;      /* 最大旋轉角度 */
  --spread-factor: 1.2;      /* 間距係數 */
}

.player-hand__card-wrapper {
  --card-index: 0;           /* 透過 JS 動態設定 */

  /* 計算相對位置 (-1 到 +1) */
  --position-ratio: calc(
    (var(--card-index) - (var(--card-count) - 1) / 2) / var(--card-count)
  );

  /* 旋轉 */
  transform: rotate(calc(var(--position-ratio) * var(--rotation-max)));

  /* 水平偏移 */
  margin-left: calc(var(--position-ratio) * var(--spread-factor) * -10px);
}
```

**範例（5 張卡）**:
```
卡片索引:  0     1     2     3     4
位置比率: -1.0  -0.5   0.0   0.5   1.0
旋轉角度: -3°   -1.5°  0°    1.5°  3°
```

#### 3.2.2 間距密度

根據卡片數量自動調整：

```css
/* 1-5 張：稀疏 */
.player-hand--sparse {
  --spread-factor: 1.5;
  gap: var(--spacing-lg);
}

/* 6-8 張：正常 */
.player-hand--normal {
  --spread-factor: 1.2;
  gap: var(--spacing-md);
}

/* 9-10 張：密集 */
.player-hand--compact {
  --spread-factor: 1.0;
  gap: var(--spacing-sm);
}

/* 11+ 張：極密集 */
.player-hand--dense {
  --spread-factor: 0.8;
  gap: var(--spacing-xs);
}
```

#### 3.2.3 懸停效果

```css
.player-hand__card-wrapper:hover {
  transform:
    rotate(calc(var(--position-ratio) * var(--rotation-max)))
    translateY(-30px)
    scale(1.05);
  z-index: 10;
  transition: all var(--duration-medium) var(--ease-bounce);
}
```

### 3.3 PlayedPairs - 已打出對子

#### 3.3.1 對子組結構

```html
<div class="played-pairs">
  <div class="played-pair">
    <div class="played-pair__cards">
      <Card size="small" />
      <Card size="small" />
    </div>
    <span class="played-pair__effect">抽</span>
  </div>
</div>
```

#### 3.3.2 效果標籤定位

```css
.played-pair {
  position: relative;
  display: flex;
  gap: var(--spacing-1);
  padding: var(--spacing-2);
}

.played-pair__effect {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--primary-ocean);
  color: var(--text-inverse);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  box-shadow: var(--shadow-sm);
}
```

**效果標籤顏色對應**:

| 效果 | 文字 | 顏色 |
|-----|------|------|
| draw_blind | 抽 | #2C5F8D (藍) |
| draw_discard | 棄 | #E74C3C (紅) |
| extra_turn | 回 | #27AE60 (綠) |
| steal_card | 偷 | #F39C12 (橘) |

#### 3.3.3 行動版調整

```css
@media (max-width: 768px) {
  .played-pair__effect {
    top: -6px;
    right: -6px;
    font-size: 8px;
    padding: 1px 4px;
  }
}
```

### 3.4 DiscardPile - 棄牌堆

#### 3.4.1 基礎樣式

```css
.discard-pile {
  position: relative;
  width: 100px;
  height: 140px;
  border-radius: var(--radius-card);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.2);
  transition: all var(--transition-medium);
}
```

#### 3.4.2 拖放狀態

**可拖放區域**:
```css
.discard-pile--can-drop {
  border-color: var(--status-success);
  border-style: solid;
  background: rgba(39, 174, 96, 0.1);
  box-shadow: 0 0 15px rgba(39, 174, 96, 0.3);
}
```

**必須棄到此堆**:
```css
.discard-pile--must-drop {
  border-color: var(--status-warning);
  border-style: solid;
  background: rgba(243, 156, 18, 0.15);
  box-shadow: 0 0 20px rgba(243, 156, 18, 0.4);
  animation: glow 1s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 15px rgba(243, 156, 18, 0.3); }
  50% { box-shadow: 0 0 25px rgba(243, 156, 18, 0.6); }
}
```

**懸停拖曳中**:
```css
.discard-pile--drag-over {
  border-width: 3px;
  transform: scale(1.05);
  background: rgba(39, 174, 96, 0.2);
}
```

### 3.5 DrawDeck - 抽牌堆

#### 3.5.1 牌堆外觀

```css
.draw-deck {
  position: relative;
  width: 100px;
  height: 140px;
  border-radius: var(--radius-card);
  background: linear-gradient(135deg, #2C5F8D 0%, #1E4165 100%);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: all var(--transition-medium);
}

.draw-deck:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-card-hover);
}
```

#### 3.5.2 卡片計數顯示

```css
.draw-deck__count {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
}
```

#### 3.5.3 空牌堆狀態

```css
.draw-deck--empty {
  background: rgba(0, 0, 0, 0.3);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
  opacity: 0.5;
}
```

### 3.6 Button - 按鈕組件

#### 3.6.1 變體樣式

**Primary**:
```css
.button--primary {
  background: var(--primary-ocean);
  color: var(--text-inverse);
  border: none;

  &:hover {
    background: var(--primary-ocean-dark);
  }
}
```

**Secondary**:
```css
.button--secondary {
  background: transparent;
  color: var(--primary-ocean);
  border: 2px solid var(--primary-ocean);

  &:hover {
    background: var(--primary-ocean);
    color: var(--text-inverse);
  }
}
```

**Danger**:
```css
.button--danger {
  background: var(--status-error);
  color: var(--text-inverse);
  border: none;

  &:hover {
    background: var(--status-error-light);
  }
}
```

#### 3.6.2 尺寸變體

```css
.button--small {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
}

.button--medium {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
}

.button--large {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-lg);
}
```

### 3.7 Modal - 模態框組件

#### 3.7.1 結構與定位

```css
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal-backdrop);
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-modal);
  box-shadow: var(--shadow-modal);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  z-index: var(--z-index-modal);
}
```

#### 3.7.2 進出動畫

```css
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal {
  animation: modalFadeIn var(--duration-medium) var(--ease-out);
}
```

---

## 4. 動畫系統

### 4.1 抽卡特效動畫

#### 4.1.1 卡片翻轉

```css
@keyframes cardFlip {
  0% {
    transform: rotateY(0deg) scale(1);
  }
  50% {
    transform: rotateY(90deg) scale(1.2);
  }
  100% {
    transform: rotateY(180deg) scale(1);
  }
}

.card--drawing {
  animation: cardFlip var(--duration-slow) var(--ease-in-out);
}
```

#### 4.1.2 發光效果

```css
@keyframes cardGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
  }
}

.card--drawing {
  animation:
    cardFlip var(--duration-slow) var(--ease-in-out),
    cardGlow var(--duration-slower) var(--ease-in-out) infinite;
}
```

### 4.2 回合結算動畫

#### 4.2.1 分數變化

```css
@keyframes scoreIncrease {
  0% {
    transform: scale(1);
    color: var(--text-primary);
  }
  50% {
    transform: scale(1.3);
    color: var(--status-success);
  }
  100% {
    transform: scale(1);
    color: var(--text-primary);
  }
}

.score--updating {
  animation: scoreIncrease var(--duration-medium) var(--ease-bounce);
}
```

#### 4.2.2 獲勝慶祝

```css
@keyframes celebrate {
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  50% {
    transform: scale(1.2) rotate(0deg);
  }
  75% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.winner-announcement {
  animation: celebrate 1s var(--ease-bounce) infinite;
}
```

### 4.3 微互動動畫

#### 4.3.1 按鈕點擊

```css
.button:active {
  transform: scale(0.95);
  transition: transform var(--duration-instant);
}
```

#### 4.3.2 卡片懸停

```css
.card:hover {
  transform: translateY(-10px) scale(1.05);
  transition: all var(--duration-medium) var(--ease-bounce);
}
```

---

## 5. 響應式設計

### 5.1 斷點系統

```css
--breakpoint-xs: 480px
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1200px
--breakpoint-2xl: 1536px
```

### 5.2 卡片尺寸響應

```css
/* 桌面 */
.card--medium {
  width: 80px;
  height: 112px;
}

/* 平板 */
@media (max-width: 1024px) {
  .card--medium {
    width: 70px;
    height: 98px;
  }
}

/* 手機 */
@media (max-width: 768px) {
  .card--medium {
    width: 60px;
    height: 84px;
  }
}
```

### 5.3 佈局響應

詳見 2.1.3 響應式調整

---

## 6. 無障礙設計

### 6.1 鍵盤導航

```css
.card:focus-visible {
  outline: 3px solid var(--accent-coral);
  outline-offset: 2px;
}

.button:focus-visible {
  outline: 3px solid var(--primary-ocean);
  outline-offset: 2px;
}
```

### 6.2 ARIA 屬性

```html
<button aria-label="抽取卡片" aria-describedby="deck-count">
  抽牌
</button>

<div role="alert" aria-live="polite">
  輪到你的回合
</div>
```

### 6.3 對比度

所有文字與背景的對比度至少達到 **WCAG AA 標準**（4.5:1）

---

## 7. 視覺規範

### 7.1 卡片顏色邊框規範

每張卡片根據其顏色顯示對應的邊框：

```css
.card[data-color="blue"] {
  border: 3px solid #2563EB;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.3);
}

.card[data-color="red"] {
  border: 3px solid #DC2626;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
}

/* ... 其他顏色 */
```

### 7.2 起始玩家標記

```css
.table-seat__starting-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.table-seat__starting-icon {
  font-size: 1.2rem;
  margin-right: 4px;
}
```

### 7.3 偷牌標記

```css
.table-seat__stolen-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(229, 62, 62, 0.95);
  color: white;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  animation: shake 0.5s ease-in-out, fadeOut 3s ease-in-out forwards;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(-50%) translateY(0) rotate(0deg);
  }
  25% {
    transform: translateX(-50%) translateY(-5px) rotate(-2deg);
  }
  75% {
    transform: translateX(-50%) translateY(-5px) rotate(2deg);
  }
}

@keyframes fadeOut {
  0% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}
```

---

**文件結束**
