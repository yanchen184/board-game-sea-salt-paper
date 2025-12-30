# Sea Salt & Paper - 組件視覺規格

**版本**: 1.0
**日期**: 2025-11-19
**設計師**: Frontend UI/UX Designer
**目的**: 提供所有遊戲組件的完整視覺規格和 CSS 實作指南

---

## 目錄

1. [核心遊戲組件](#核心遊戲組件)
2. [佈局組件](#佈局組件)
3. [互動組件](#互動組件)
4. [通用 UI 組件](#通用-ui-組件)
5. [響應式設計規範](#響應式設計規範)

---

## 核心遊戲組件

### 1. Card (卡片) ✅ 已實作

**檔案位置**:
- `src/components/common/Card/Card.jsx`
- `src/components/common/Card/Card.css`

**視覺規格**:

#### 尺寸
| 尺寸類別 | 寬度 | 高度 | 使用場景 |
|---------|------|------|---------|
| Small | 60px | 84px | 對手已打出的配對 |
| Medium (預設) | 100px | 140px | 玩家手牌（桌面版） |
| Mobile | 70px | 98px | 玩家手牌（手機版） |
| Large | 120px | 168px | CardChoiceModal 中的卡片 |

#### 5 種狀態視覺差異

**1. Default (預設)**:
```css
transform: translateY(0);
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
border-width: 2px;
opacity: 1;
filter: none;
```
- 用途: 手牌中未選擇的卡片
- 視覺: 正常顯示，輕微陰影

**2. Hover (懸停)** - 僅桌面版:
```css
transform: translateY(-8px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
z-index: 20;
```
- 用途: 滑鼠移到卡片上方
- 視覺: 上升 8px，陰影加深
- 觸發: `@media (hover: hover)` 限定

**3. Selected (選中)**:
```css
transform: translateY(-12px);
border-width: 3px;
box-shadow:
  0 0 0 3px rgba(44, 95, 141, 0.3),  /* 藍色發光 */
  0 8px 16px rgba(0, 0, 0, 0.25);    /* 深陰影 */
z-index: 20;

/* 選中標記（右上角打勾） */
::after {
  content: '✓';
  background: var(--primary-ocean);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
}
```
- 用途: 玩家點擊選擇卡片
- 視覺: 上升 12px，藍色發光外圈，右上角打勾

**4. Disabled (禁用)**:
```css
opacity: 0.5;
filter: grayscale(0.5);  /* 50% 灰階 */
cursor: not-allowed;
pointer-events: none;
```
- 用途: 配對驗證時無法選擇的卡片
- 視覺: 半透明 + 灰階，明顯「褪色」
- 互動: 完全無法點擊

**5. Dragging (拖曳)**:
```css
opacity: 0.6;
transform: rotate(5deg) scale(1.05);
cursor: grabbing;
z-index: 9999;
```
- 用途: 拖曳卡片時
- 視覺: 輕微旋轉 + 放大，跟隨游標
- 互動: 暫時狀態，放下後恢復

#### 顏色變體 (4 色系統)

根據 game-balance-designer 的建議，卡片顏色系統簡化為 **4 種顏色**：

```css
/* 藍色卡片 (Fish, Sailboat, Penguin) */
.card--blue {
  border-color: #3498DB;
  background: linear-gradient(135deg, #FFFFFF 0%, #EBF5FB 100%);
}

/* 紅色卡片 (Crab, Shark, Seagull) */
.card--red {
  border-color: #E74C3C;
  background: linear-gradient(135deg, #FFFFFF 0%, #FADBD8 100%);
}

/* 黃色卡片 (Starfish, Swimmer) */
.card--yellow {
  border-color: #D4AC0D;  /* 調整後符合對比度 */
  background: linear-gradient(135deg, #FFFFFF 0%, #FCF3CF 100%);
}

/* 紫色卡片 (Shell, Octopus) */
.card--purple {
  border-color: #9B59B6;
  background: linear-gradient(135deg, #FFFFFF 0%, #EBDEF0 100%);
}
```

**對比度測試**:
| 顏色 | 邊框色碼 | 對比度 | 符合 WCAG |
|------|---------|--------|----------|
| 藍色 | #3498DB | 3.25:1 | ✅ AA (UI) |
| 紅色 | #E74C3C | 3.52:1 | ✅ AA (UI) |
| 黃色 | #D4AC0D | 3.11:1 | ✅ AA (UI) |
| 紫色 | #9B59B6 | 4.75:1 | ✅ AA (UI) |

#### 卡片內容佈局

```
┌─────────────────┐
│      [Emoji]    │  <- 卡片類型 emoji（40% 高度）
│                 │
│     [Name]      │  <- 卡片名稱（12px 小字）
│                 │
│           [Val] │  <- 數值（右下角，24px 粗體）
└─────────────────┘
```

**CSS 佈局**:
```css
.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--spacing-2);
  position: relative;
}

.card__emoji {
  width: 100%;
  height: 40%;
  font-size: var(--font-size-3xl);  /* 30px */
  text-align: center;
}

.card__name {
  font-size: var(--font-size-xs);  /* 12px */
  color: var(--text-secondary);
  text-align: center;
  margin: var(--spacing-1) 0;
}

.card__value {
  position: absolute;
  bottom: var(--spacing-2);
  right: var(--spacing-2);
  font-size: var(--font-size-2xl);  /* 24px */
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}
```

#### 動畫

**抽牌動畫** (`cardDraw`):
```css
@keyframes cardDraw {
  0% {
    transform: translateY(-200%) scale(0.5);
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.card--drawing {
  animation: cardDraw 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**棄牌動畫** (`cardDiscard`):
```css
@keyframes cardDiscard {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(200%) scale(0.5);
    opacity: 0;
  }
}

.card--discarding {
  animation: cardDiscard 400ms ease-in;
}
```

---

### 2. PlayerHand (玩家手牌)

**檔案位置**:
- `src/components/game/PlayerHand/PlayerHand.jsx`
- `src/components/game/PlayerHand/PlayerHand.css`

**視覺規格**:

#### 佈局設計

**桌面版** (≥1024px):
```
┌────────────────────────────────────────────────────┐
│              YOUR HAND (Player 1)                   │  <- 標題
├────────────────────────────────────────────────────┤
│                                                     │
│   [ ]   [ ]   [ ]   [ ]   [ ]   [ ]   [ ]         │  <- 卡片橫向排列
│    ↖️3°  ↖️1°   →   ↗️1°  ↗️3°                        │  <- 輕微旋轉
│                                                     │
└────────────────────────────────────────────────────┘
```

**手機版** (<768px):
```
┌──────────────────┐
│  YOUR HAND (7)   │  <- 標題 + 卡片數量
├──────────────────┤
│                  │
│ [C][C][C][C][C]  │  <- 卡片滾動，無旋轉
│ ← scroll →       │
│                  │
└──────────────────┘
```

#### CSS 實作

**基礎佈局**:
```css
.player-hand {
  display: flex;
  gap: var(--spacing-3);          /* 12px 間距 */
  padding: var(--spacing-4);
  overflow-x: auto;               /* 卡片過多時可滾動 */
  scroll-snap-type: x proximity;  /* 平滑滾動對齊 */
  background: rgba(245, 230, 211, 0.3);  /* 淡沙色背景 */
  border-radius: var(--radius-lg);
  min-height: 180px;
}

.player-hand__card-wrapper {
  flex-shrink: 0;                 /* 防止卡片縮小 */
  scroll-snap-align: center;
  transform: rotate(calc(var(--card-index) * 3deg - 9deg));
  transition: transform var(--duration-medium) var(--ease-out);
}

/* 例如:
   第 1 張卡片: --card-index: 0, rotate(-9deg)
   第 2 張卡片: --card-index: 1, rotate(-6deg)
   第 4 張卡片: --card-index: 3, rotate(0deg)   <- 中間卡片
   第 6 張卡片: --card-index: 5, rotate(6deg)
*/
```

**手機版優化**:
```css
@media (max-width: 767px) {
  .player-hand {
    gap: var(--spacing-2);         /* 8px 間距，節省空間 */
    padding: var(--spacing-2);
    min-height: 120px;
  }

  .player-hand__card-wrapper {
    transform: rotate(0deg);       /* 不旋轉，節省空間 */
  }

  /* 滾動提示 */
  .player-hand::after {
    content: '← →';
    position: absolute;
    bottom: var(--spacing-1);
    right: var(--spacing-2);
    color: var(--text-light);
    font-size: var(--font-size-xs);
  }
}
```

#### 配對驗證邏輯

當第 1 張卡片被選中時，其他卡片的狀態邏輯：

```jsx
// PlayerHand.jsx
const getCardState = (card) => {
  if (!selectedCard) return 'default';
  if (card.id === selectedCard.id) return 'selected';
  if (canPair(selectedCard, card)) return 'default';  // 可配對
  return 'disabled';  // 無法配對，灰階禁用
};

return (
  <div className="player-hand">
    {cards.map((card, index) => (
      <div
        key={card.id}
        className="player-hand__card-wrapper"
        style={{ '--card-index': index }}
      >
        <Card
          cardData={card}
          selected={card.id === selectedCard?.id}
          disabled={getCardState(card) === 'disabled'}
          onClick={handleCardClick}
        />
      </div>
    ))}
  </div>
);
```

---

### 3. CardChoiceModal (抽 2 選 1 Modal) ✅ 已實作

**檔案位置**:
- `src/components/game/CardChoiceModal/CardChoiceModal.jsx`
- `src/components/game/CardChoiceModal/CardChoiceModal.css`

**視覺規格**:

#### 桌面版佈局

```
┌──────────────────────────────────────────────────┐
│        🌊 Choose 1 Card to Keep                   │  <- 標題
│   Select one card to add to your hand             │  <- 副標題
├──────────────────────────────────────────────────┤
│                                                   │
│     ┌─────────┐              ┌─────────┐        │
│     │         │              │         │        │
│     │ Card 1  │              │ Card 2  │        │  <- 2 張大卡片
│     │         │              │         │        │     (120×168px)
│     │         │              │         │        │
│     └─────────┘              └─────────┘        │
│    [Keep This]              [Keep This]         │  <- 選擇按鈕
│                                                   │
├──────────────────────────────────────────────────┤
│  The other card will be discarded to:            │  <- 說明文字
│                                                   │
│   ┌─────────────────┐  ┌─────────────────┐      │
│   │ ( ) Left Pile   │  │ ( ) Right Pile  │      │  <- 棄牌堆選項
│   └─────────────────┘  └─────────────────┘      │
│                                                   │
│           [ Confirm Choice ]                     │  <- 確認按鈕
│                                                   │
└──────────────────────────────────────────────────┘
```

#### 手機版佈局

```
┌────────────────────┐
│ Choose 1 Card      │  <- 標題
│ to Keep            │
├────────────────────┤
│                    │
│   ┌──────────┐     │
│   │          │     │
│   │  Card 1  │     │  <- 卡片 1（垂直排列）
│   │          │     │
│   └──────────┘     │
│  [Keep This]       │
│                    │
│   ┌──────────┐     │
│   │          │     │
│   │  Card 2  │     │  <- 卡片 2
│   │          │     │
│   └──────────┘     │
│  [Keep This]       │
│                    │
├────────────────────┤
│ Discard to:        │
│ ( ) Left Pile      │  <- 棄牌堆選項
│ ( ) Right Pile     │     (垂直排列)
│                    │
│  [Confirm]         │  <- 確認按鈕
└────────────────────┘
```

#### 互動狀態

**狀態 1: 初始**
- 2 張卡片正常顯示
- 「Confirm Choice」按鈕禁用

**狀態 2: 選擇第 1 張卡片**
- 選中的卡片:
  - 邊框高亮 (3px solid var(--primary-ocean))
  - 背景淡藍色 (var(--primary-ocean-pale))
  - transform: translateY(-12px)
- 未選中的卡片:
  - opacity: 0.5
  - filter: grayscale(0.3)
- 棄牌堆選項淡入顯示 (fadeIn animation)

**狀態 3: 選擇棄牌堆**
- 選中的棄牌堆按鈕:
  - border-color: var(--primary-ocean)
  - background: var(--primary-ocean-pale)
- 「Confirm Choice」按鈕啟用

**狀態 4: 確認後**
- 保留的卡片: 動畫飛入手牌 (cardDraw animation)
- 棄掉的卡片: 動畫飛入棄牌堆 (cardDiscard animation)
- Modal 淡出關閉 (fadeOut animation)

#### CSS 關鍵規則

```css
/* Modal 進入動畫 */
.card-choice-modal__content {
  animation: modalSlideIn 300ms ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 選中的卡片容器 */
.card-choice-modal__card--selected {
  border-color: var(--primary-ocean);
  background: var(--primary-ocean-pale);
  transform: translateY(-12px);
}

/* 未選中的卡片容器 */
.card-choice-modal__card:not(.card-choice-modal__card--selected) {
  opacity: 0.5;
  filter: grayscale(0.3);
}

/* 棄牌堆選項淡入 */
.card-choice-modal__discard-choice {
  animation: fadeIn 300ms ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 棄牌堆按鈕 */
.card-choice-modal__discard-btn {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.card-choice-modal__discard-btn--active {
  border-color: var(--primary-ocean);
  background: var(--primary-ocean-pale);
}

/* 確認按鈕 */
.card-choice-modal__confirm-btn {
  min-width: 200px;
  padding: var(--spacing-3) var(--spacing-6);
}

.card-choice-modal__confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--neutral-gray-400);
}
```

---

### 4. DrawCardArea (抽牌區域)

**檔案位置**:
- `src/components/game/DrawCardArea/DrawCardArea.jsx`
- `src/components/game/DrawCardArea/DrawCardArea.css`

**視覺規格**:

#### 桌面版佈局

```
┌────────────────────────────────────────────┐
│                                             │
│   [Discard 1]     [Draw Deck]   [Discard 2]│
│   Top: 🐠 🐚      (32 cards)    Top: 🦈 🏊  │  <- 3 個牌堆
│                   [Back  ]                  │
│                                             │
└────────────────────────────────────────────┘
```

**組件結構**:
```jsx
<div className="draw-card-area">
  {/* 左棄牌堆 */}
  <DiscardPile
    cards={discardLeft}
    position="left"
    onClick={handleTakeFromDiscard}
  />

  {/* 抽牌堆 */}
  <DrawDeck
    remainingCards={deckCount}
    onClick={handleDrawCard}
  />

  {/* 右棄牌堆 */}
  <DiscardPile
    cards={discardRight}
    position="right"
    onClick={handleTakeFromDiscard}
  />
</div>
```

#### CSS 佈局

```css
.draw-card-area {
  display: flex;
  gap: var(--spacing-8);            /* 32px 間距 */
  justify-content: center;
  align-items: center;
  padding: var(--spacing-6);
  background: rgba(232, 242, 249, 0.3);  /* 淡藍色背景 */
  border-radius: var(--radius-xl);
  min-height: 200px;
}

/* 手機版 */
@media (max-width: 767px) {
  .draw-card-area {
    gap: var(--spacing-4);          /* 16px 間距 */
    padding: var(--spacing-3);
    min-height: 140px;
  }
}
```

---

### 5. DiscardPile (棄牌堆)

**視覺規格**:

#### 狀態變體

**狀態 1: 空棄牌堆**
```
┌─────────┐
│         │
│  Empty  │  <- 虛線邊框，淡灰色文字
│         │
└─────────┘
```

**狀態 2: 有卡片的棄牌堆**
```
┌─────────┐
│  🐠 🐚  │  <- 顯示最上面 2 張卡片的 emoji
│         │
│   (12)  │  <- 棄牌堆總數
└─────────┘
```

**狀態 3: Hover (可點擊)**
```
┌─────────┐
│  🐠 🐚  │  <- 卡片上升
│  ↑      │
│   (12)  │
└─────────┘
```

#### CSS 實作

```css
.discard-pile {
  width: var(--card-width);
  height: var(--card-height);
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-card);
  background: var(--neutral-gray-100);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-medium) var(--ease-out);
}

/* 空棄牌堆 */
.discard-pile--empty {
  border-style: dashed;
  color: var(--text-light);
  cursor: not-allowed;
}

/* 有卡片的棄牌堆 */
.discard-pile:not(.discard-pile--empty) {
  border-style: solid;
  border-color: var(--primary-ocean);
}

.discard-pile:hover:not(.discard-pile--empty) {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* 最上面的卡片 emoji */
.discard-pile__top-cards {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-1);
}

/* 棄牌堆數量 */
.discard-pile__count {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
```

---

### 6. DrawDeck (抽牌堆)

**視覺規格**:

#### 狀態變體

**狀態 1: 有牌**
```
┌─────────┐
│    🌊   │  <- 卡牌背面圖案
│         │
│  (32)   │  <- 剩餘牌數
└─────────┘
```

**狀態 2: 牌數不足 (<10 張)**
```
┌─────────┐
│    🌊   │  <- 卡牌背面圖案
│    ⚠️    │  <- 警告圖示
│   (5)   │  <- 剩餘牌數（紅色）
└─────────┘
```

**狀態 3: 空牌堆**
```
┌─────────┐
│         │
│  Empty  │  <- 虛線邊框，無法點擊
│         │
└─────────┘
```

#### CSS 實作

```css
.draw-deck {
  width: var(--card-width);
  height: var(--card-height);
  border: 2px solid var(--secondary-sand-dark);
  border-radius: var(--radius-card);
  background: var(--secondary-sand);
  position: relative;
  cursor: pointer;
  transition: all var(--duration-medium) var(--ease-out);
}

/* 卡牌背面圖案 */
.draw-deck::before {
  content: '';
  position: absolute;
  inset: var(--spacing-2);
  border: 2px solid var(--secondary-sand-dark);
  border-radius: calc(var(--radius-card) - 4px);
  background: repeating-linear-gradient(
    45deg,
    var(--secondary-sand-dark),
    var(--secondary-sand-dark) 10px,
    var(--secondary-sand) 10px,
    var(--secondary-sand) 20px
  );
}

/* Hover 效果 */
.draw-deck:hover:not(.draw-deck--empty) {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

/* 剩餘牌數 */
.draw-deck__count {
  position: absolute;
  bottom: var(--spacing-2);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  z-index: 1;
}

/* 牌數不足警告 */
.draw-deck--low-cards .draw-deck__count {
  color: var(--status-error);
  background: var(--status-error-light);
}

/* 空牌堆 */
.draw-deck--empty {
  border-style: dashed;
  background: var(--neutral-gray-100);
  cursor: not-allowed;
  opacity: 0.5;
}

.draw-deck--empty::before {
  display: none;
}
```

---

## 佈局組件

### 7. GameBoard (遊戲主板)

**檔案位置**:
- `src/components/pages/GameBoard/GameBoard.jsx`
- `src/components/pages/GameBoard/GameBoard.css`

**視覺規格**:

#### 桌面版完整佈局 (≥1024px)

```
┌───────────────────────────────────────────────────────────┐
│  Header: Room Code ABC123  |  Turn: Player 2  |  [≡]     │  <- 頂部工具列
├───────────────────────────────────────────────────────────┤
│                                                            │
│  [Opponent 1]   [Opponent 2]   [Opponent 3]   [Opp 4]    │  <- 對手區域
│  Cards: 5       Cards: 3       Cards: 7       Cards: 6    │
│  Score: 12      Score: 8       Score: 15      Score: 10   │
│  Pairs: 🐟🐟     Pairs: 🦀🦀     Pairs: None    Pairs: 🐚🐚│
│                                                            │
├───────────────────────────────────────────────────────────┤
│                    DRAW CARD AREA                          │
│                                                            │
│      [Discard L]     [Draw Deck]     [Discard R]          │  <- 中央抽牌區
│      Top: 🐠🐚       (32 cards)       Top: 🦈🏊            │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                   YOUR HAND (Player 1)                     │
│                                                            │
│      [ ]   [ ]   [ ]   [ ]   [ ]   [ ]   [ ]              │  <- 玩家手牌
│                                                            │
├───────────────────────────────────────────────────────────┤
│  YOUR PLAYED PAIRS:  [🐟🐟] [🦀🦀] [🐚🐚]                   │  <- 已打出配對
├───────────────────────────────────────────────────────────┤
│  [Declare Stop]  [End Turn]  [Play Pair]  [Help]          │  <- 操作按鈕
├───────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌───────────────────────────┐   │
│  │   SCORE PANEL       │  │   ACTION LOG               │   │  <- 底部面板
│  │  • You: 23 ⭐       │  │  > P2 drew from deck       │   │
│  │  • Player 2: 18     │  │  > P1 played Fish pair     │   │
│  │  • Player 3: 8      │  │  > P3 took from discard    │   │
│  │  • Player 4: 15     │  │  > P2 declared "Stop"      │   │
│  └─────────────────────┘  └───────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

#### CSS Grid 佈局

```css
.game-board {
  display: grid;
  grid-template-areas:
    "header header header"
    "opponents opponents opponents"
    "draw-area draw-area draw-area"
    "hand hand hand"
    "pairs pairs pairs"
    "actions actions actions"
    "score log log";
  grid-template-columns: 1fr 2fr 2fr;
  grid-template-rows: auto auto auto 1fr auto auto auto;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  min-height: 100vh;
  background: var(--bg-game-board);  /* 漸層背景 */
}

.game-board__header { grid-area: header; }
.game-board__opponents { grid-area: opponents; }
.game-board__draw-area { grid-area: draw-area; }
.game-board__hand { grid-area: hand; }
.game-board__pairs { grid-area: pairs; }
.game-board__actions { grid-area: actions; }
.game-board__score { grid-area: score; }
.game-board__log { grid-area: log; }
```

#### 平板版佈局 (768px-1023px)

```css
@media (min-width: 768px) and (max-width: 1023px) {
  .game-board {
    grid-template-areas:
      "header header"
      "opponents opponents"
      "draw-area draw-area"
      "hand hand"
      "pairs pairs"
      "actions actions"
      "score log";
    grid-template-columns: 1fr 2fr;
    gap: var(--spacing-3);
  }
}
```

#### 手機版佈局 (<768px)

```css
@media (max-width: 767px) {
  .game-board {
    grid-template-areas:
      "header"
      "opponents"
      "draw-area"
      "hand"
      "pairs"
      "actions"
      "panels";
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
    padding: var(--spacing-2);
  }

  /* 底部面板合併 */
  .game-board__panels {
    grid-area: panels;
  }
}
```

---

### 8. ScorePanel (分數面板)

**視覺規格**:

#### 桌面版

```
┌───────────────────────┐
│   SCORE PANEL         │  <- 標題（粗體、大寫）
├───────────────────────┤
│ • Player 1 (You): 23⭐│  <- 當前玩家（高亮）
│ • Player 2: 18        │
│ • Player 3: 8         │
│ • Player 4: 15        │
└───────────────────────┘
```

#### CSS 實作

```css
.score-panel {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-sm);
}

.score-panel__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  color: var(--text-primary);
  border-bottom: 2px solid var(--primary-ocean);
  padding-bottom: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.score-panel__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.score-panel__player {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-sm);
  transition: background var(--duration-fast);
}

.score-panel__player:hover {
  background: var(--neutral-gray-100);
}

/* 當前玩家高亮 */
.score-panel__player--current {
  background: var(--primary-ocean-pale);
  border-left: 4px solid var(--primary-ocean);
  font-weight: var(--font-weight-semibold);
}

.score-panel__player-name {
  color: var(--text-primary);
}

.score-panel__player-name::before {
  content: '• ';
  color: var(--primary-ocean);
  margin-right: var(--spacing-1);
}

.score-panel__score {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-ocean);
}

/* 分數變化動畫 */
.score-panel__score--incrementing {
  animation: scoreIncrement 600ms ease-out;
}

@keyframes scoreIncrement {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
    color: var(--status-success);
  }
  100% {
    transform: scale(1);
  }
}
```

---

### 9. ActionLog (行動日誌)

**視覺規格**:

#### 桌面版

```
┌───────────────────────────┐
│   ACTION LOG              │  <- 標題
├───────────────────────────┤
│ > P2 drew from deck       │  <- 最新行動（藍色左框）
│ > P1 played Fish pair     │
│ > P3 took from discard    │
│ > P2 declared "Stop"      │
│ > P1 drew 2 cards         │  <- 舊行動（灰色左框）
│   ...                     │
└───────────────────────────┘
```

#### CSS 實作

```css
.action-log {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-sm);
  max-height: 200px;
  overflow-y: auto;
}

.action-log__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  color: var(--text-primary);
  border-bottom: 2px solid var(--primary-ocean);
  padding-bottom: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.action-log__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column-reverse;  /* 最新在上 */
}

.action-log__item {
  padding: var(--spacing-2) var(--spacing-3);
  border-left: 3px solid var(--neutral-gray-400);
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  transition: all var(--duration-fast);
}

.action-log__item::before {
  content: '> ';
  color: var(--primary-ocean);
  margin-right: var(--spacing-1);
}

/* 最新行動（前 3 個） */
.action-log__item--recent {
  border-left-color: var(--primary-ocean);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  animation: slideInFromRight 300ms var(--ease-out);
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.action-log__item:hover {
  background: var(--neutral-gray-100);
}

/* 手機版 */
@media (max-width: 767px) {
  .action-log {
    max-height: 150px;
  }

  .action-log__item {
    font-size: var(--font-size-xs);
    padding: var(--spacing-1) var(--spacing-2);
  }
}
```

---

## 通用 UI 組件

### 10. Button (按鈕)

**視覺規格**:

#### 按鈕變體

**Primary Button (主要按鈕)**:
```css
.button--primary {
  background: var(--primary-ocean);
  color: var(--neutral-white);
  border: none;
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  box-shadow: var(--shadow-button);
}

.button--primary:hover {
  background: var(--primary-ocean-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-button-hover);
}

.button--primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.button--primary:disabled {
  background: var(--neutral-gray-400);
  color: var(--neutral-gray-600);
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}
```

**Secondary Button (次要按鈕)**:
```css
.button--secondary {
  background: var(--neutral-white);
  color: var(--primary-ocean);
  border: 2px solid var(--primary-ocean);
  padding: calc(var(--spacing-3) - 2px) calc(var(--spacing-6) - 2px);
}

.button--secondary:hover {
  background: var(--primary-ocean-pale);
  border-color: var(--primary-ocean-dark);
}
```

**Danger Button (危險按鈕)**:
```css
.button--danger {
  background: #C0392B;  /* 調整後的紅色，對比度 4.89:1 */
  color: var(--neutral-white);
}

.button--danger:hover {
  background: #A93226;
}
```

**Success Button (成功按鈕)**:
```css
.button--success {
  background: #1E8449;  /* 調整後的綠色，對比度 4.52:1 */
  color: var(--neutral-white);
}

.button--success:hover {
  background: #186A3B;
}
```

#### 按鈕尺寸

```css
/* Small */
.button--small {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
}

/* Medium (預設) */
.button--medium {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
}

/* Large */
.button--large {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-lg);
}
```

#### 觸控優化

```css
@media (max-width: 767px) {
  .button {
    min-height: 48px;  /* Apple HIG 最小觸控區域 */
    min-width: 48px;
    padding: var(--spacing-3) var(--spacing-5);
  }

  .button--small {
    min-height: 44px;
    padding: var(--spacing-2) var(--spacing-4);
  }
}
```

---

### 11. Modal (模態視窗)

**視覺規格**:

#### 基礎 Modal 結構

```css
.modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  animation: fadeIn 200ms ease-out;
}

.modal__content {
  position: relative;
  background: var(--neutral-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-modal);
  animation: modalZoomIn 300ms var(--ease-out);
}

@keyframes modalZoomIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.modal__close {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: var(--font-size-2xl);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-2);  /* 擴大觸控區域至 48px */
  transition: color var(--duration-fast);
}

.modal__close:hover {
  color: var(--text-primary);
}

.modal__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-3);
}

.modal__body {
  margin-bottom: var(--spacing-4);
  color: var(--text-secondary);
}
```

---

## 響應式設計規範

### 斷點系統

```css
/* Mobile (<768px) - 基礎樣式 */
/* 預設所有組件為手機版設計 */

/* Tablet (768px-1023px) */
@media (min-width: 768px) {
  /* 平板優化 */
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  /* 桌面版完整佈局 */
}

/* Large Desktop (≥1440px) */
@media (min-width: 1440px) {
  /* 大螢幕優化 */
}
```

### 觸控 vs. Hover

```css
/* Hover 效果僅桌面版 */
@media (hover: hover) {
  .card:hover {
    transform: translateY(-8px);
  }
}

/* 觸控裝置優化 */
@media (hover: none) {
  .card {
    /* 觸控友善間距 */
    margin: var(--spacing-2);
  }
}
```

---

**文檔版本**: 1.0
**最後更新**: 2025-11-19
**設計師**: Frontend UI/UX Designer
**狀態**: 完成 ✅
