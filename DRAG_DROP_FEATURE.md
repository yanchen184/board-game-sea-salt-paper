# 拖曳式抽牌功能

## 功能描述

玩家從牌堆抽兩張牌時，不再需要透過彈出視窗選擇，而是直接將不要的牌**拖曳到棄牌堆**來完成選擇。

**佈局設計：**
- 牌堆在中間
- 兩張抽到的牌顯示在牌堆下方
- 左右兩邊是棄牌堆
- 玩家直接拖曳卡片到左邊或右邊的棄牌堆

## 實現細節

### 新增組件

#### DrawCardArea (`src/components/game/DrawCardArea/`)
- 顯示剛抽到的兩張牌
- **內嵌式設計**，直接顯示在牌堆下方
- 支援拖曳操作
- 提供視覺提示

**特色：**
- 優雅的淡入縮放動畫
- 卡片依序出現（延遲動畫）
- 卡片懸停時會向上浮動
- 拖曳時卡片變半透明（40%）
- 頂部顯示脈衝提示文字「Drag one card to a discard pile」

### 更新組件

#### GameBoard
**變更：**
- 新增 `showDrawCardArea` 狀態管理抽牌區域顯示
- 新增 `isDraggingCard` 追蹤拖曳狀態
- 移除 `CardChoiceModal` 組件
- 新增 `handleCardDragged` 處理拖曳開始
- 新增 `handleCardDragEnd` 處理拖曳結束
- 更新 `handleCardDropped` 處理卡片放下邏輯
- **新增 `game-board__center-area` 容器**，將牌堆和抽牌區域組合在一起

**佈局結構：**
```
game-board__table (grid: auto 1fr auto)
├── DiscardPile (left)
├── game-board__center-area
│   ├── DrawDeck
│   └── DrawCardArea (conditional)
└── DiscardPile (right)
```

**重要邏輯：**
```javascript
// 當卡片被放下時，保留「未被拖曳」的卡片
const droppedCard = drawnCards.find(c => c.id === cardId)
const keptCard = drawnCards.find(c => c.id !== cardId)
```

#### DiscardPile
**增強功能：**
- `canDrop` prop 控制是否可接受卡片
- 拖曳懸停時顯示視覺反饋（發光效果）
- 拖曳懸停時棄牌堆放大 1.05 倍
- 虛線邊框提示可放置區域

**CSS 動畫：**
- `dragOverPulse`: 拖曳懸停時的脈衝效果
- 棄牌堆周圍顯示發光圓圈動畫

#### Card
**新增 prop：**
- `draggable` (boolean): 明確控制卡片是否可拖曳
- 預設行為：非 disabled 且非 faceDown 的卡片可拖曳

## 使用流程

1. **玩家點擊牌堆**
   - 觸發 `handleDrawDeck()`
   - 從後端抽取兩張牌
   - 顯示 `DrawCardArea`

2. **選擇要棄置的牌**
   - 玩家看到兩張牌顯示在中央
   - 開始拖曳其中一張牌
   - 觸發 `handleCardDragged(cardId)`
   - `isDraggingCard` 設為 true

3. **拖曳到棄牌堆**
   - 棄牌堆的 `canDrop` 變為 true（因為 `isDraggingCard === true`）
   - 懸停時棄牌堆顯示接受提示
   - 放下卡片觸發 `handleCardDropped(cardId, side)`

4. **完成選擇**
   - 系統判斷要保留哪張牌（未拖曳的那張）
   - 呼叫 `gameActions.confirmCardChoice(keptCard, side)`
   - 被拖曳的牌加到指定的棄牌堆
   - 保留的牌加入玩家手牌
   - 關閉 `DrawCardArea`

## 視覺設計

### DrawCardArea
- **背景**：無背景（融入遊戲桌面）
- **動畫**：淡入縮放
- **卡片**：中等尺寸 (medium)，懸停向上浮動
- **提示文字**：
  - 白色半透明背景
  - 藍色邊框 + 藍色文字
  - 脈衝動畫效果

### DiscardPile (拖曳時)
- **邊框**：虛線藍色邊框 (rgba(100, 200, 255, 0.3))
- **脈衝**：發光圓圈從中心向外擴散
- **縮放**：輕微放大 (scale 1.05)
- **指示器**：顯示向下箭頭和「Drop card」文字

## 技術要點

### 拖曳資料傳遞
```javascript
event.dataTransfer.setData('cardId', card.id)
event.dataTransfer.setData('source', 'drawArea')
```

### 拖曳效果
```javascript
event.dataTransfer.effectAllowed = 'move'
e.dataTransfer.dropEffect = 'move'
```

### 狀態管理
- `drawnCards`: 抽到的兩張牌
- `showDrawCardArea`: 控制抽牌區域顯示
- `isDraggingCard`: 追蹤拖曳狀態

### 條件渲染
```javascript
canDrop={showDrawCardArea && isDraggingCard}
canTake={isMyTurn && turnPhase === 'draw' && !showDrawCardArea}
```

## 優勢

### 相比舊版 CardChoiceModal
1. **更直覺**：直接拖曳而非多步驟點擊
2. **視覺反饋更好**：即時看到卡片移動到棄牌堆
3. **減少認知負擔**：不需要記住「先選牌再選棄牌堆」
4. **更流暢**：一次操作完成

### 無障礙支持
- 保留鍵盤支持（tab 和 enter）
- ARIA 標籤完整
- 動畫可通過 `prefers-reduced-motion` 禁用

## 未來改進

- [ ] 添加拖曳預覽圖片（`setDragImage`）
- [ ] 支援觸控裝置的拖曳
- [ ] 添加音效反饋
- [ ] 拖曳軌跡動畫
- [ ] 支援取消操作（ESC 鍵）

## 相關文件

- `src/components/game/DrawCardArea/DrawCardArea.jsx`
- `src/components/game/DrawCardArea/DrawCardArea.css`
- `src/components/game/DiscardPile/DiscardPile.jsx`
- `src/components/game/DiscardPile/DiscardPile.css`
- `src/components/pages/GameBoard/GameBoard.jsx`
- `src/components/common/Card/Card.jsx`
