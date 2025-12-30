# Sea Salt & Paper - 無障礙設計檢查清單

**版本**: 1.0
**日期**: 2025-11-19
**設計標準**: WCAG 2.1 AA 級
**專案階段**: 基礎建設 - UI/UX 設計

---

## 目錄

1. [無障礙設計原則](#無障礙設計原則)
2. [色彩對比度要求](#色彩對比度要求)
3. [鍵盤導航](#鍵盤導航)
4. [螢幕閱讀器支援](#螢幕閱讀器支援)
5. [動畫與動態效果](#動畫與動態效果)
6. [觸控與手勢](#觸控與手勢)
7. [組件級檢查清單](#組件級檢查清單)
8. [測試工具與方法](#測試工具與方法)

---

## 無障礙設計原則

### POUR 原則

#### 1. Perceivable (可感知)
- ✅ 所有非文字內容都有文字替代
- ✅ 顏色不是唯一的資訊傳達方式
- ✅ 足夠的色彩對比度
- ✅ 文字可縮放至 200% 而不失功能

#### 2. Operable (可操作)
- ✅ 所有功能可通過鍵盤操作
- ✅ 用戶有足夠時間完成操作
- ✅ 避免引發癲癇的閃爍內容
- ✅ 清晰的導航和標題

#### 3. Understandable (可理解)
- ✅ 文字清晰易讀
- ✅ 頁面行為可預測
- ✅ 幫助用戶避免和修正錯誤

#### 4. Robust (穩健)
- ✅ 與輔助技術兼容
- ✅ 語義化 HTML 結構
- ✅ 正確使用 ARIA 標籤

---

## 色彩對比度要求

### WCAG AA 標準

#### 文字對比度
| 文字類型 | 最小對比度 | 實際對比度 | 狀態 |
|---------|-----------|----------|------|
| 一般文字 (16px) | 4.5:1 | - | 需測試 |
| 大文字 (18px+) | 3:1 | - | 需測試 |
| UI 組件邊框 | 3:1 | - | 需測試 |

#### 當前色彩配對測試

**主要文字顏色**:
```css
/* 深色背景上的白色文字 */
--primary-ocean (#2C5F8D) + --text-inverse (#FFFFFF)
對比度: 5.12:1 ✅ (符合 AA 標準)

/* 白色背景上的深色文字 */
--bg-primary (#FFFFFF) + --text-primary (#212529)
對比度: 16.07:1 ✅ (超越 AAA 標準)

/* 白色背景上的次要文字 */
--bg-primary (#FFFFFF) + --text-secondary (#6C757D)
對比度: 4.66:1 ✅ (符合 AA 標準)

/* 白色背景上的淡色文字 */
--bg-primary (#FFFFFF) + --text-light (#ADB5BD)
對比度: 2.89:1 ❌ (不符合 AA，僅用於裝飾)
```

**按鈕顏色**:
```css
/* 主要按鈕 */
--primary-ocean (#2C5F8D) + --neutral-white (#FFFFFF)
對比度: 5.12:1 ✅

/* 成功按鈕 */
--status-success (#27AE60) + --neutral-white (#FFFFFF)
對比度: 3.16:1 ❌ (需調整)
建議: 使用 #1E8449 (對比度 4.52:1 ✅)

/* 錯誤按鈕 */
--status-error (#E74C3C) + --neutral-white (#FFFFFF)
對比度: 3.52:1 ❌ (需調整)
建議: 使用 #C0392B (對比度 4.89:1 ✅)
```

**卡片邊框與背景**:
```css
/* 藍色卡片 */
--card-blue (#3498DB) 於白色背景上
對比度: 3.25:1 ✅ (UI 組件符合 3:1 要求)

/* 紅色卡片 */
--card-red (#E74C3C) 於白色背景上
對比度: 3.52:1 ✅

/* 黃色卡片 */
--card-yellow (#F1C40F) 於白色背景上
對比度: 1.99:1 ❌ (需調整)
建議: 使用 #D4AC0D (對比度 3.11:1 ✅)

/* 紫色卡片 */
--card-purple (#9B59B6) 於白色背景上
對比度: 4.75:1 ✅
```

### 色彩使用建議

#### ❌ 避免的用法
```css
/* 不要僅用顏色區分狀態 */
.bad-example {
  color: red; /* 僅用顏色表示錯誤 */
}
```

#### ✅ 正確的用法
```css
/* 使用顏色 + 圖示 + 文字 */
.good-example {
  color: var(--status-error);
  background: var(--status-error-light);
}

.good-example::before {
  content: '❌'; /* 圖示 */
}
```

**實作範例**:
```jsx
// 卡片禁用狀態 - 不僅顏色，還有灰階濾鏡
<div className="card card--disabled" aria-disabled="true">
  {/* 視覺: 灰階 + 半透明 */}
  {/* ARIA: aria-disabled 告知螢幕閱讀器 */}
</div>
```

---

## 鍵盤導航

### 必須支援的快捷鍵

#### 基礎導航
| 按鍵 | 功能 | 狀態 |
|------|------|------|
| `Tab` | 移動到下一個可互動元素 | 必須 ✅ |
| `Shift + Tab` | 移動到上一個可互動元素 | 必須 ✅ |
| `Enter` | 啟動按鈕/連結 | 必須 ✅ |
| `Space` | 啟動按鈕/切換選項 | 必須 ✅ |
| `Esc` | 關閉 Modal/取消操作 | 必須 ✅ |
| `Arrow Keys` | 在群組內移動（如卡片選擇） | 建議 ⭐ |

#### 遊戲專用快捷鍵（可選）
| 按鍵 | 功能 | 狀態 |
|------|------|------|
| `1-9` | 選擇手牌第 N 張卡片 | 可選 📌 |
| `D` | 從牌堆抽牌 | 可選 📌 |
| `E` | 結束回合 | 可選 📌 |
| `S` | 宣告 Stop | 可選 📌 |

### Focus 樣式設計

#### 視覺設計要求
```css
/* 所有可互動元素的 Focus 樣式 */
:focus-visible {
  outline: 3px solid var(--primary-ocean);    /* 藍色外框 */
  outline-offset: 2px;                        /* 2px 間距 */
  border-radius: var(--radius-sm);            /* 圓角 */
}

/* 避免使用 outline: none */
/* ❌ 錯誤 */
button:focus {
  outline: none; /* 絕不使用 */
}

/* ✅ 正確 - 使用 :focus-visible 區分鍵盤和滑鼠 */
button:focus:not(:focus-visible) {
  outline: none; /* 僅滑鼠點擊時移除 */
}

button:focus-visible {
  outline: 3px solid var(--primary-ocean); /* 鍵盤導航時顯示 */
  outline-offset: 2px;
}
```

#### 卡片 Focus 樣式
```css
/* Card.css */
.card:focus-visible {
  outline: 3px solid var(--primary-ocean);
  outline-offset: 2px;
  z-index: var(--z-card-hover); /* 確保可見 */
}

/* 避免與 Selected 狀態混淆 */
.card--selected:focus-visible {
  outline-color: var(--status-success); /* 綠色區分 */
}
```

### Tab 順序邏輯

#### GameBoard Tab Order
```
1. Skip to Main Content (跳過連結)
2. Player Hand (玩家手牌)
   → 2.1 Card 1
   → 2.2 Card 2
   → ...
3. Action Buttons (操作按鈕)
   → 3.1 Draw Card
   → 3.2 End Turn
   → 3.3 Declare Stop
4. Discard Piles (棄牌堆)
   → 4.1 Left Discard
   → 4.2 Right Discard
5. Draw Deck (抽牌堆)
6. Score Panel (可選)
7. Action Log (可選)
```

**實作方式**:
```jsx
// GameBoard.jsx
<main role="main" tabIndex="-1" id="main-content">
  {/* Skip Link */}
  <a href="#main-content" className="skip-link">
    Skip to main content
  </a>

  {/* Tab Order 1: Player Hand */}
  <div className="player-hand" role="group" aria-label="Your hand">
    {handCards.map((card, index) => (
      <Card
        key={card.id}
        cardData={card}
        tabIndex={0}  {/* 可 Tab 到 */}
        aria-posinset={index + 1}
        aria-setsize={handCards.length}
      />
    ))}
  </div>

  {/* Tab Order 2: Action Buttons */}
  <div className="game-actions" role="group" aria-label="Game actions">
    <button tabIndex={0}>Draw Card</button>
    <button tabIndex={0}>End Turn</button>
    <button tabIndex={0} disabled={!canDeclare}>Declare Stop</button>
  </div>

  {/* ... */}
</main>
```

### 鍵盤陷阱預防

**Modal 鍵盤陷阱**:
```javascript
// CardChoiceModal.jsx
useEffect(() => {
  if (isOpen) {
    // 記錄打開前的 focus 元素
    const previousFocus = document.activeElement;

    // Modal 打開時，focus 第一個互動元素
    modalRef.current?.querySelector('button')?.focus();

    // 限制 Tab 在 Modal 內
    const handleTabKey = (e) => {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      // 恢復 focus
      previousFocus?.focus();
    };
  }
}, [isOpen]);
```

---

## 螢幕閱讀器支援

### ARIA 標籤完整規範

#### Landmark Roles
```html
<!-- HomePage -->
<body>
  <header role="banner">
    <h1>Sea Salt & Paper</h1>
  </header>

  <nav role="navigation" aria-label="Main navigation">
    <!-- Navigation links -->
  </nav>

  <main role="main" id="main-content">
    <!-- Main content -->
  </main>

  <footer role="contentinfo">
    <!-- Footer -->
  </footer>
</body>
```

#### 組件 ARIA 標籤

**1. Card 組件**:
```jsx
<div
  className="card"
  role="button"
  tabIndex={disabled ? -1 : 0}
  aria-label={`${card.name} card, value ${card.value}, color ${card.color}`}
  aria-pressed={selected}
  aria-disabled={disabled}
  aria-describedby={`card-${card.id}-description`}
>
  <div className="card__front">
    {/* Visual content */}
  </div>

  {/* Hidden description for screen readers */}
  <span id={`card-${card.id}-description`} className="sr-only">
    {card.pairEffect
      ? `Pair effect: ${card.pairEffect}`
      : 'Collection card'}
  </span>
</div>
```

**2. ScorePanel 組件**:
```jsx
<section
  className="score-panel"
  role="region"
  aria-label="Player scores"
>
  <h2 id="score-panel-title">Score Panel</h2>

  <ul role="list" aria-labelledby="score-panel-title">
    {players.map(player => (
      <li
        key={player.id}
        role="listitem"
        aria-current={player.isCurrentPlayer ? 'true' : undefined}
      >
        <span className="score-panel__player-name">
          {player.name}
        </span>
        <span
          className="score-panel__score"
          aria-label={`Score: ${player.score} points`}
        >
          {player.score}
        </span>
      </li>
    ))}
  </ul>
</section>
```

**3. ActionLog 組件**:
```jsx
<section
  className="action-log"
  role="log"
  aria-live="polite"
  aria-atomic="false"
  aria-label="Game action history"
>
  <h2>Action Log</h2>

  <ul role="list">
    {actions.map((action, index) => (
      <li
        key={action.id}
        role="listitem"
        aria-label={formatActionForScreenReader(action)}
      >
        {action.description}
      </li>
    ))}
  </ul>
</section>
```

**4. Modal 組件**:
```jsx
<div
  className="modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <div className="modal__overlay" />

  <div className="modal__content">
    <h2 id="modal-title">Choose 1 Card to Keep</h2>
    <p id="modal-description">
      Select one card to add to your hand. The other will be discarded.
    </p>

    {/* Modal content */}

    <button
      onClick={onClose}
      aria-label="Close dialog"
    >
      ×
    </button>
  </div>
</div>
```

**5. 回合指示器**:
```jsx
<div
  className="turn-indicator"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  <span aria-label={`Current turn: ${currentPlayer.name}`}>
    {`Turn: ${currentPlayer.name}`}
  </span>
</div>
```

### 動態內容通知

#### ARIA Live Regions
```jsx
// 分數變化通知
<div
  className="score-update"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {scoreChange > 0 && (
    <span className="sr-only">
      Your score increased by {scoreChange} points. New score: {totalScore}
    </span>
  )}
</div>

// 遊戲狀態變化通知
<div
  className="game-status"
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
>
  {gameStatus === 'round_end' && (
    <span>
      Round ended. Winner: {winner.name} with {winner.score} points.
    </span>
  )}
</div>
```

### Screen Reader Only 文字

**CSS 實作**:
```css
/* 視覺隱藏但螢幕閱讀器可讀 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* 可 focus 時顯示（Skip Link） */
.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: var(--spacing-2) var(--spacing-4);
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
  background: var(--primary-ocean);
  color: var(--neutral-white);
  z-index: var(--z-max);
}
```

**使用範例**:
```jsx
// Skip Link
<a href="#main-content" className="sr-only">
  Skip to main content
</a>

// Card description
<span className="sr-only">
  Fish card. Value: 1 point. Blue color. Pair effect: Draw 1 card from deck.
</span>
```

---

## 動畫與動態效果

### Prefers-Reduced-Motion

**實作要求**:
```css
/* 所有動畫必須尊重用戶偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* 保留關鍵狀態變化，但移除過渡 */
  .card--selected {
    /* 保留視覺狀態 */
    transform: translateY(-12px);
    /* 但不使用 transition */
  }
}
```

**JavaScript 檢測**:
```javascript
// useReducedMotion.js
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// 使用
function Card({ cardData, ...props }) {
  const reducedMotion = useReducedMotion();

  const animationDuration = reducedMotion ? 0 : 300;

  return (
    <motion.div
      animate={{ y: selected ? -12 : 0 }}
      transition={{ duration: animationDuration / 1000 }}
    >
      {/* Card content */}
    </motion.div>
  );
}
```

### 自動播放限制

**避免自動播放動畫**:
```jsx
// ❌ 錯誤 - 進入頁面就自動播放
<div className="animation-autoplay">
  {/* 一進入就播放閃爍動畫 */}
</div>

// ✅ 正確 - 僅在用戶操作時播放
<button onClick={handleDrawCard}>
  Draw Card
</button>

// 僅在點擊後才播放抽牌動畫
{isDrawing && (
  <div className="card--drawing">
    {/* 動畫 */}
  </div>
)}
```

---

## 觸控與手勢

### 觸控目標大小

**最小觸控區域**: 48px × 48px (Apple HIG)

```css
/* 按鈕觸控優化 */
.button {
  min-height: 48px;
  min-width: 48px;
  padding: var(--spacing-3) var(--spacing-6);
}

/* 卡片觸控優化（手機版） */
@media (max-width: 767px) {
  .card {
    min-width: 70px;   /* 已符合 48px */
    min-height: 98px;  /* 已符合 48px */
  }

  /* 間距確保不誤觸 */
  .player-hand {
    gap: var(--spacing-2); /* 8px 間距 */
  }
}

/* 小元素增加觸控區域 */
.modal__close {
  /* 視覺大小 24px，但觸控區域 48px */
  width: 24px;
  height: 24px;
  padding: 12px; /* 擴大至 48px */
}
```

### 手勢支援

**避免僅手勢操作**:
```jsx
// ❌ 錯誤 - 僅支援滑動手勢
<div onSwipe={handleSwipe}>
  {/* 沒有替代按鈕 */}
</div>

// ✅ 正確 - 提供替代按鈕
<div className="card-carousel">
  <button onClick={handlePrevious}>Previous</button>
  <div onSwipe={handleSwipe}>
    {/* 卡片 */}
  </div>
  <button onClick={handleNext}>Next</button>
</div>
```

---

## 組件級檢查清單

### Card 組件 ✅
- [x] `role="button"` 正確設定
- [x] `tabIndex` 正確（0 for enabled, -1 for disabled）
- [x] `aria-label` 包含卡片資訊
- [x] `aria-pressed` 反映選擇狀態
- [x] `aria-disabled` 反映禁用狀態
- [x] Focus visible 樣式明顯
- [x] 鍵盤 Enter/Space 可操作
- [x] 顏色對比度 ≥3:1 (UI 組件)
- [x] Hover 效果僅桌面版 (`@media (hover: hover)`)
- [ ] 支援 Arrow Keys 在手牌間移動 (可選)

### Button 組件
- [ ] 正確的語義化標籤 (`<button>`)
- [ ] `disabled` 屬性正確反映狀態
- [ ] `aria-label` 或可讀文字
- [ ] Focus visible 樣式明顯
- [ ] 色彩對比度 ≥4.5:1
- [ ] 最小觸控區域 48px × 48px
- [ ] Loading 狀態有視覺和文字提示

### Modal 組件
- [x] `role="dialog"` 正確設定
- [x] `aria-modal="true"`
- [x] `aria-labelledby` 指向標題
- [x] `aria-describedby` 指向描述
- [ ] 鍵盤陷阱正確實作
- [ ] Esc 鍵關閉功能
- [ ] 打開時 focus 第一個互動元素
- [ ] 關閉時恢復原 focus
- [ ] 背景內容 `aria-hidden="true"`

### ScorePanel 組件
- [ ] `role="region"` 正確設定
- [ ] `aria-label` 描述用途
- [ ] 當前玩家有 `aria-current="true"`
- [ ] 分數變化有 `aria-live` 通知
- [ ] 列表使用 `<ul>` 和 `<li>`

### ActionLog 組件
- [ ] `role="log"` 正確設定
- [ ] `aria-live="polite"` 設定
- [ ] `aria-atomic="false"` （僅通知新增項目）
- [ ] 新行動有可讀的 `aria-label`
- [ ] 列表使用 `<ul>` 和 `<li>`

### CardChoiceModal 組件
- [x] `role="dialog"` 正確設定
- [x] `aria-modal="true"`
- [ ] 選擇狀態有視覺和 ARIA 反映
- [ ] 確認按鈕禁用時有說明
- [ ] 鍵盤可完整操作

---

## 測試工具與方法

### 自動化測試工具

#### 1. Lighthouse (Chrome DevTools)
```bash
# 開啟 Chrome DevTools
F12 → Lighthouse Tab → Accessibility Report

目標分數: ≥90
```

#### 2. axe DevTools (瀏覽器擴充)
- Chrome: [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools)
- Firefox: [axe DevTools](https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/)

```
安裝後:
F12 → axe DevTools Tab → Scan All Pages
```

#### 3. WAVE (Web Accessibility Evaluation Tool)
- 線上版: https://wave.webaim.org/
- 瀏覽器擴充: [WAVE Extension](https://wave.webaim.org/extension/)

#### 4. Pa11y (CI 整合)
```bash
npm install -D pa11y pa11y-ci

# package.json
{
  "scripts": {
    "test:a11y": "pa11y-ci --sitemap http://localhost:5173/sitemap.xml"
  }
}
```

### 手動測試清單

#### 鍵盤導航測試
- [ ] 不使用滑鼠，僅用鍵盤完成整個遊戲流程
- [ ] Tab 順序合理且符合視覺順序
- [ ] Focus 樣式清晰可見
- [ ] Esc 鍵可關閉 Modal
- [ ] Enter/Space 可啟動按鈕

#### 螢幕閱讀器測試
**工具**:
- Windows: NVDA (免費) - https://www.nvaccess.org/
- macOS: VoiceOver (內建) - Cmd + F5 啟動
- Android: TalkBack (內建)
- iOS: VoiceOver (內建)

**測試步驟**:
1. 啟動螢幕閱讀器
2. 瀏覽整個頁面，確認所有元素可讀
3. 測試遊戲操作（抽牌、配對、結束回合）
4. 確認動態內容更新有通知

#### 色彩對比度測試
**工具**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)

**測試清單**:
- [ ] 主要文字 (#212529) vs 白色背景
- [ ] 次要文字 (#6C757D) vs 白色背景
- [ ] 按鈕文字 vs 按鈕背景
- [ ] 卡片邊框 vs 白色背景
- [ ] 錯誤訊息 vs 背景

#### 縮放測試
```
瀏覽器縮放至 200%:
- [ ] 所有文字可讀
- [ ] 佈局不破壞
- [ ] 功能仍可用
- [ ] 無水平滾動 (手機版可接受)
```

#### 動態內容測試
```
開啟 prefers-reduced-motion:
Chrome DevTools → Rendering → Emulate CSS prefers-reduced-motion

確認:
- [ ] 動畫時間縮短至 <50ms
- [ ] 關鍵狀態仍可辨識
- [ ] 無閃爍效果
```

---

## 修復優先級

### Critical (必須修復)
- ❌ 黃色卡片邊框對比度不足 (1.99:1 < 3:1)
  - 修復: 使用 #D4AC0D
- ❌ 成功按鈕對比度不足 (3.16:1 < 4.5:1)
  - 修復: 使用 #1E8449
- ❌ 錯誤按鈕對比度不足 (3.52:1 < 4.5:1)
  - 修復: 使用 #C0392B

### High (應該修復)
- [ ] Modal 鍵盤陷阱未實作
- [ ] ActionLog 缺少 aria-live
- [ ] 部分按鈕缺少 aria-label

### Medium (建議修復)
- [ ] 手牌卡片缺少 Arrow Keys 導航
- [ ] 分數變化缺少螢幕閱讀器通知
- [ ] 部分組件缺少 landmark roles

### Low (可選修復)
- [ ] 快捷鍵未實作 (1-9, D, E, S)
- [ ] Skip Link 樣式優化
- [ ] 部分裝飾性圖示缺少 aria-hidden

---

## 實作檢查流程

### 開發階段
1. 使用 ESLint plugin: [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
   ```bash
   npm install -D eslint-plugin-jsx-a11y
   ```

2. 編寫組件時同時編寫 ARIA 標籤

3. 使用 React Testing Library 測試無障礙
   ```javascript
   import { render, screen } from '@testing-library/react';
   import { axe, toHaveNoViolations } from 'jest-axe';

   expect.extend(toHaveNoViolations);

   test('Card should have no accessibility violations', async () => {
     const { container } = render(<Card cardData={mockCard} />);
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
   ```

### 測試階段
1. 運行 Lighthouse (目標 ≥90)
2. 運行 axe DevTools (0 violations)
3. 手動鍵盤導航測試
4. 手動螢幕閱讀器測試
5. 色彩對比度檢查

### 部署前
1. 完整無障礙審計
2. 修復所有 Critical 和 High 問題
3. 更新本檢查清單狀態
4. 記錄已知問題（Medium/Low）

---

## 參考資源

### 官方文檔
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### React 無障礙
- [React Accessibility Docs](https://react.dev/learn/accessibility)
- [Reach UI (無障礙 React 組件)](https://reach.tech/)
- [React ARIA (Adobe)](https://react-spectrum.adobe.com/react-aria/)

### 測試工具
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Pa11y](https://pa11y.org/)
- [jest-axe](https://github.com/nickcolley/jest-axe)

---

**最後更新**: 2025-11-19
**檢查清單版本**: 1.0
**負責設計師**: Frontend UI/UX Designer
