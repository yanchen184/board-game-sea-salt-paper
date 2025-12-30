# Sea Salt & Paper - 桌遊風格重新設計計劃

## 目標
將現有的遊戲介面改造成真正的桌遊視角：
- 4 個玩家位置固定在牌桌四周
- 每個玩家都從自己的第一視角看牌桌
- 所有玩家的畫面同步，只有視角方向不同
- 支持 2-4 人遊戲，空位顯示虛線框

## 設計規格

### 1. 俯視全景佈局 (Bird's Eye View)

```
                    ┌─────────────────────┐
                    │     對面玩家(上)     │
                    │    Player Position 2 │
                    │   (旋轉 180°)        │
                    └─────────────────────┘
    ┌─────────┐                              ┌─────────┐
    │  左側   │      ┌─────────────────┐     │  右側   │
    │  玩家   │      │                 │     │  玩家   │
    │ Position│      │    牌桌中央     │     │ Position│
    │    3    │      │  (抽牌/棄牌堆)  │     │    1    │
    │(旋轉90°)│      │                 │     │(旋轉-90°)│
    └─────────┘      └─────────────────┘     └─────────┘
                    ┌─────────────────────┐
                    │     我的位置(下)     │
                    │    Player Position 0 │
                    │   (不旋轉 - 主視角)  │
                    │   【手牌水平排列】    │
                    └─────────────────────┘
```

### 2. 玩家位置映射 (第一人稱視角)

每個玩家看到的畫面都是從自己的角度：
- **我的位置**: 永遠在螢幕下方
- **對面玩家**: 永遠在螢幕上方 (相對我 +2 位置)
- **左邊玩家**: 永遠在螢幕左邊 (相對我 +3 位置)
- **右邊玩家**: 永遠在螢幕右邊 (相對我 +1 位置)

```javascript
// 位置計算公式
const getRelativePosition = (playerIndex, myIndex, totalPlayers) => {
  const offset = (playerIndex - myIndex + totalPlayers) % totalPlayers;
  // offset 0 = 我自己 (下方)
  // offset 1 = 右邊
  // offset 2 = 對面 (上方)
  // offset 3 = 左邊
  return offset;
};
```

### 3. 卡牌旋轉方向

| 位置 | 玩家相對位置 | 卡牌旋轉角度 | 手牌朝向 |
|------|-------------|-------------|---------|
| 下方 | 自己 (0) | 0° | 朝上 (正常) |
| 右側 | +1 | -90° | 朝左 |
| 上方 | +2 | 180° | 朝下 |
| 左側 | +3 | 90° | 朝右 |

### 4. 空位處理

2-3 人遊戲時，空位顯示：
```css
.table-seat--empty {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  background: transparent;
  opacity: 0.5;
}
.table-seat--empty::after {
  content: "空位";
  color: rgba(255, 255, 255, 0.5);
}
```

## 實作步驟

### Phase 1: 新增桌遊佈局組件

#### 1.1 建立 TableLayout 組件
**檔案**: `src/components/game/TableLayout/TableLayout.jsx`

功能：
- 管理牌桌的整體佈局
- 接收玩家列表和當前玩家 ID
- 計算每個玩家的相對位置
- 渲染四個座位區域

```jsx
// 主要 props
interface TableLayoutProps {
  players: Player[];          // 所有玩家
  currentPlayerId: string;    // 當前用戶的 ID
  gameState: GameState;       // 遊戲狀態
  onDrawDeck: () => void;     // 抽牌回調
  onDiscardClick: (side) => void;  // 點擊棄牌堆
}
```

#### 1.2 建立 TableSeat 組件
**檔案**: `src/components/game/TableSeat/TableSeat.jsx`

功能：
- 顯示單個玩家座位
- 根據位置旋轉卡牌
- 顯示玩家名稱、分數、手牌數
- 空位時顯示虛線框

```jsx
// 主要 props
interface TableSeatProps {
  player: Player | null;      // 玩家資料 (null = 空位)
  position: 'bottom' | 'right' | 'top' | 'left';
  isCurrentTurn: boolean;     // 是否輪到此玩家
  isMe: boolean;              // 是否是自己
  hand?: Card[];              // 如果是自己，顯示手牌
  onCardSelect?: (card) => void;  // 選擇卡牌回調
}
```

#### 1.3 建立 TableCenter 組件
**檔案**: `src/components/game/TableCenter/TableCenter.jsx`

功能：
- 顯示牌桌中央區域
- 包含抽牌堆和兩個棄牌堆
- 顯示抽牌選擇區 (DrawCardArea)

### Phase 2: CSS Grid 佈局實現

#### 2.1 桌遊佈局 CSS
**檔案**: `src/components/game/TableLayout/TableLayout.css`

```css
.table-layout {
  width: 100%;
  height: calc(100vh - 80px);  /* 扣除導航欄 */
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 180px 1fr 220px;
  grid-template-areas:
    ".       top     ."
    "left   center  right"
    ".      bottom   .";
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-game-table);  /* 新增: 牌桌背景 */
}

/* 四個座位位置 */
.table-seat--bottom { grid-area: bottom; }
.table-seat--top    { grid-area: top; transform: rotate(180deg); }
.table-seat--left   { grid-area: left; transform: rotate(90deg); }
.table-seat--right  { grid-area: right; transform: rotate(-90deg); }

/* 中央區域 */
.table-center { grid-area: center; }
```

#### 2.2 新增牌桌背景色
**檔案**: `src/styles/variables.css`

```css
/* 新增牌桌背景 */
--bg-game-table: radial-gradient(ellipse at center,
  #1a472a 0%,      /* 深綠色中心 */
  #0d2818 100%     /* 更深的邊緣 */
);
--table-felt: #1a5f3c;  /* 桌布顏色 */
--table-border: #8b6914;  /* 木框邊緣 */
```

### Phase 3: 修改 GameBoard 整合

#### 3.1 更新 GameBoard.jsx
- 移除現有的對手區域 (opponents area)
- 引入新的 TableLayout 組件
- 保留側邊欄 (ScorePanel, ActionLog)

#### 3.2 玩家位置計算邏輯

```javascript
// 在 GameBoard.jsx 中
const getPlayersInTableOrder = (players, myId) => {
  const playerIds = Object.keys(players);
  const myIndex = playerIds.indexOf(myId);

  // 重新排序，讓自己在位置 0
  const reordered = [];
  for (let i = 0; i < 4; i++) {
    const actualIndex = (myIndex + i) % playerIds.length;
    if (actualIndex < playerIds.length) {
      reordered.push({
        position: ['bottom', 'right', 'top', 'left'][i],
        player: players[playerIds[actualIndex]],
        playerId: playerIds[actualIndex]
      });
    } else {
      reordered.push({
        position: ['bottom', 'right', 'top', 'left'][i],
        player: null,  // 空位
        playerId: null
      });
    }
  }
  return reordered;
};
```

### Phase 4: 手牌水平排列

#### 4.1 更新 PlayerHand 組件
- 移除扇形旋轉效果
- 改為水平一列排列
- 卡牌間距適中，可顯示所有手牌

```css
.player-hand--horizontal {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  max-width: 100%;
}

.player-hand--horizontal .player-hand__card-wrapper {
  transform: none;  /* 移除旋轉 */
}
```

### Phase 5: 對手手牌顯示 (牌背)

#### 5.1 建立 OpponentHand 組件
**檔案**: `src/components/game/OpponentHand/OpponentHand.jsx`

功能：
- 顯示對手的手牌 (牌背朝向自己)
- 根據位置旋轉牌面
- 顯示手牌數量

```jsx
function OpponentHand({ cardCount, position }) {
  const rotation = {
    top: 180,
    left: 90,
    right: -90
  }[position];

  return (
    <div className="opponent-hand" style={{ transform: `rotate(${rotation}deg)` }}>
      {Array.from({ length: Math.min(cardCount, 7) }).map((_, i) => (
        <Card key={i} faceDown={true} size="small" />
      ))}
      {cardCount > 7 && <span className="overflow">+{cardCount - 7}</span>}
    </div>
  );
}
```

### Phase 6: 響應式設計

#### 6.1 平板版本 (768px - 1024px)
- 縮小卡牌尺寸
- 減少邊距

#### 6.2 手機版本 (< 768px)
- 切換為縱向滾動佈局
- 或保持俯視但大幅縮小

## 檔案變更清單

### 新增檔案
1. `src/components/game/TableLayout/TableLayout.jsx`
2. `src/components/game/TableLayout/TableLayout.css`
3. `src/components/game/TableSeat/TableSeat.jsx`
4. `src/components/game/TableSeat/TableSeat.css`
5. `src/components/game/TableCenter/TableCenter.jsx`
6. `src/components/game/TableCenter/TableCenter.css`
7. `src/components/game/OpponentHand/OpponentHand.jsx`
8. `src/components/game/OpponentHand/OpponentHand.css`

### 修改檔案
1. `src/components/pages/GameBoard/GameBoard.jsx` - 整合新佈局
2. `src/components/pages/GameBoard/GameBoard.css` - 更新樣式
3. `src/components/game/PlayerHand/PlayerHand.jsx` - 支援水平模式
4. `src/components/game/PlayerHand/PlayerHand.css` - 水平排列樣式
5. `src/styles/variables.css` - 新增牌桌背景變數

## UI 預覽

### 4 人遊戲
```
        ╔═══════════════════════════════════════════╗
        ║           Player 3 (上方)                  ║
        ║    [手牌5] 🃏🃏🃏🃏🃏  Score: 15           ║
        ╠═══════════════════════════════════════════╣
   ┌────║                                           ║────┐
   │P4  ║        ┌─────────────────┐                ║ P2 │
   │左  ║        │   棄牌堆  抽牌堆 │                ║ 右 │
   │🃏  ║        │   [左]   [54]   │                ║ 🃏 │
   │🃏  ║        │          [右]   │                ║ 🃏 │
   │🃏  ║        │                 │                ║ 🃏 │
   │    ║        │  [抽到的2張牌]  │                ║    │
   │S:8 ║        └─────────────────┘                ║S:12│
   └────║                                           ║────┘
        ╠═══════════════════════════════════════════╣
        ║              我的手牌 (下方)               ║
        ║    🐚  🦐  🐙  🦀  🐟  🏄  Score: 10     ║
        ║    [ 選擇卡牌 ]  [ 結束回合 ]             ║
        ╚═══════════════════════════════════════════╝
```

### 2 人遊戲
```
        ╔═══════════════════════════════════════════╗
        ║           Player 2 (上方)                  ║
        ║    [手牌3] 🃏🃏🃏  Score: 8              ║
        ╠═══════════════════════════════════════════╣
   ┌────║                                           ║────┐
   │空位║        ┌─────────────────┐                ║空位│
   │----║        │   棄牌堆  抽牌堆 │                ║----│
   │    ║        │   [左]   [56]   │                ║    │
   │    ║        │          [右]   │                ║    │
   └────║        └─────────────────┘                ║────┘
        ╠═══════════════════════════════════════════╣
        ║              我的手牌 (下方)               ║
        ║        🐚  🦐  🐙  Score: 5              ║
        ╚═══════════════════════════════════════════╝
```

## 執行順序建議

1. **Phase 1**: 建立基礎組件結構 (TableLayout, TableSeat, TableCenter)
2. **Phase 2**: 實現 CSS Grid 佈局和牌桌背景
3. **Phase 3**: 整合到 GameBoard，確保基本運作
4. **Phase 4**: 調整手牌為水平排列
5. **Phase 5**: 優化對手手牌顯示
6. **Phase 6**: 響應式調整

## 預估影響

- **視覺變化**: 重大 - 完全改變遊戲介面風格
- **功能影響**: 無 - 所有遊戲邏輯保持不變
- **效能影響**: 輕微 - CSS transform 效能良好
- **向後兼容**: 完全兼容 - 只是 UI 重構
