# Sea Salt & Paper - 技術架構規格書 (Technical Architecture Specification)

**版本**: 1.0.0
**最後更新**: 2025-12-13
**文件類型**: Software Design Document - Technical Architecture

---

## 目錄

1. [架構概述](#1-架構概述)
2. [技術棧](#2-技術棧)
3. [專案結構](#3-專案結構)
4. [組件架構](#4-組件架構)
5. [服務層](#5-服務層)
6. [狀態管理](#6-狀態管理)
7. [即時同步](#7-即時同步)
8. [路由系統](#8-路由系統)
9. [構建與部署](#9-構建與部署)
10. [效能優化](#10-效能優化)

---

## 1. 架構概述

### 1.1 架構模式

本專案採用 **前端主導 + 即時資料庫** 的架構模式：

```
┌──────────────────────────────────────────────┐
│           Client (React SPA)                  │
│  ┌────────────────────────────────────────┐  │
│  │  Pages (HomePage, GameBoard, etc.)     │  │
│  │  ↓                                     │  │
│  │  Components (TableLayout, PlayerHand)  │  │
│  │  ↓                                     │  │
│  │  Services (gameService, scoreService)  │  │
│  │  ↓                                     │  │
│  │  Firebase Service                      │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
                    ↕
┌──────────────────────────────────────────────┐
│    Firebase Realtime Database                 │
│  ┌────────────────────────────────────────┐  │
│  │  /rooms/{roomId}                       │  │
│  │    - players                           │  │
│  │    - gameState                         │  │
│  │    - settings                          │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 1.2 核心設計原則

1. **組件驅動開發** (Component-Driven Development)
   - 所有 UI 元素拆分為獨立的可複用組件
   - 每個組件負責單一職責

2. **自上而下的資料流** (Top-Down Data Flow)
   - 狀態集中管理於頂層組件
   - 透過 props 向下傳遞
   - 透過回調函數向上通知

3. **服務層抽象** (Service Layer Abstraction)
   - 遊戲邏輯與 UI 分離
   - 所有業務邏輯封裝在 services 中
   - Firebase 操作統一在 firebaseService 中

4. **即時同步** (Real-time Synchronization)
   - 使用 Firebase Realtime Database 監聽器
   - 自動同步所有玩家的遊戲狀態
   - 樂觀更新 + 伺服器確認

---

## 2. 技術棧

### 2.1 核心技術

| 技術 | 版本 | 用途 |
|-----|------|------|
| **React** | 18.2.0 | UI 框架 |
| **Vite** | 5.0.8 | 構建工具和開發伺服器 |
| **Firebase** | 10.7.1 | 即時資料庫和 Hosting |
| **React Router DOM** | 6.20.0 | 前端路由 |
| **UUID** | 9.0.1 | 唯一 ID 生成 |

### 2.2 開發工具

| 工具 | 版本 | 用途 |
|-----|------|------|
| **Vitest** | 1.0.4 | 單元測試框架 |
| **Playwright** | 1.56.1 | E2E 測試框架 |
| **ESLint** | 8.55.0 | 程式碼檢查 |

### 2.3 語言與標準

- **JavaScript**: ES2022
- **CSS**: CSS3 + CSS Variables
- **HTML**: HTML5

### 2.4 為什麼選擇這些技術？

#### React
- ✅ 元件化開發，易於維護
- ✅ Virtual DOM，效能優異
- ✅ 生態系統完善
- ✅ Hooks 機制簡化狀態管理

#### Vite
- ✅ 極快的冷啟動速度
- ✅ 熱模組替換 (HMR)
- ✅ 原生 ESM 支援
- ✅ 構建產物優化

#### Firebase Realtime Database
- ✅ 即時同步，無需額外配置
- ✅ 離線支援
- ✅ 簡單的安全規則
- ✅ 免費額度足夠開發使用

#### 純 CSS（無框架）
- ✅ 完全控制樣式
- ✅ 減少打包體積
- ✅ 無需學習額外語法
- ✅ 使用 CSS Variables 實現設計系統

---

## 3. 專案結構

### 3.1 完整目錄結構

```
board-game-sea-salt-paper/
├── src/
│   ├── components/                    # React 組件
│   │   ├── common/                    # 通用可複用組件
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.css
│   │   │   ├── Card/
│   │   │   │   ├── Card.jsx
│   │   │   │   └── Card.css
│   │   │   ├── Input/
│   │   │   │   ├── Input.jsx
│   │   │   │   └── Input.css
│   │   │   └── Modal/
│   │   │       ├── Modal.jsx
│   │   │       └── Modal.css
│   │   │
│   │   ├── game/                      # 遊戲專用組件
│   │   │   ├── TableLayout/           # 四人牌桌佈局
│   │   │   │   ├── TableLayout.jsx
│   │   │   │   └── TableLayout.css
│   │   │   ├── TableSeat/             # 玩家座位
│   │   │   │   ├── TableSeat.jsx
│   │   │   │   └── TableSeat.css
│   │   │   ├── TableCenter/           # 牌桌中央
│   │   │   │   ├── TableCenter.jsx
│   │   │   │   └── TableCenter.css
│   │   │   ├── PlayerHand/            # 玩家手牌
│   │   │   │   ├── PlayerHand.jsx
│   │   │   │   └── PlayerHand.css
│   │   │   ├── PlayedPairs/           # 已打出對子
│   │   │   │   ├── PlayedPairs.jsx
│   │   │   │   └── PlayedPairs.css
│   │   │   ├── DiscardPile/           # 棄牌堆
│   │   │   │   ├── DiscardPile.jsx
│   │   │   │   └── DiscardPile.css
│   │   │   ├── DrawDeck/              # 抽牌堆
│   │   │   │   ├── DrawDeck.jsx
│   │   │   │   └── DrawDeck.css
│   │   │   ├── DrawCardArea/          # 抽牌選擇區
│   │   │   │   ├── DrawCardArea.jsx
│   │   │   │   └── DrawCardArea.css
│   │   │   ├── ScorePanel/            # 得分面板
│   │   │   │   ├── ScorePanel.jsx
│   │   │   │   └── ScorePanel.css
│   │   │   ├── ActionLog/             # 動作記錄
│   │   │   │   ├── ActionLog.jsx
│   │   │   │   └── ActionLog.css
│   │   │   ├── CrabEffectModal/       # 螃蟹效果模態框
│   │   │   │   ├── CrabEffectModal.jsx
│   │   │   │   └── CrabEffectModal.css
│   │   │   ├── StealCardModal/        # 偷牌選擇模態框
│   │   │   │   ├── StealCardModal.jsx
│   │   │   │   └── StealCardModal.css
│   │   │   ├── RoundEndModal/         # 回合結束模態框
│   │   │   │   ├── RoundEndModal.jsx
│   │   │   │   └── RoundEndModal.css
│   │   │   ├── DeclareScoreModal/     # 宣告計分模態框
│   │   │   │   ├── DeclareScoreModal.jsx
│   │   │   │   └── DeclareScoreModal.css
│   │   │   ├── RoundSettlement/       # 回合結算動畫
│   │   │   │   ├── RoundSettlement.jsx
│   │   │   │   └── RoundSettlement.css
│   │   │   ├── CardDrawEffect/        # 抽卡特效
│   │   │   │   ├── CardDrawEffect.jsx
│   │   │   │   └── CardDrawEffect.css
│   │   │   └── TurnNotification/      # 回合通知
│   │   │       ├── TurnNotification.jsx
│   │   │       └── TurnNotification.css
│   │   │
│   │   └── pages/                     # 頁面組件
│   │       ├── HomePage/              # 主頁
│   │       │   ├── HomePage.jsx
│   │       │   └── HomePage.css
│   │       ├── RoomLobby/             # 房間大廳
│   │       │   ├── RoomLobby.jsx
│   │       │   └── RoomLobby.css
│   │       ├── GameBoard/             # 遊戲主界面
│   │       │   ├── GameBoard.jsx
│   │       │   └── GameBoard.css
│   │       └── Tutorial/              # 教學頁面
│   │           ├── Tutorial.jsx
│   │           └── Tutorial.css
│   │
│   ├── services/                      # 業務邏輯層
│   │   ├── gameService.js             # 遊戲核心邏輯
│   │   ├── scoreService.js            # 得分計算引擎
│   │   ├── firebaseService.js         # Firebase 操作
│   │   └── aiService.js               # AI 決策引擎
│   │
│   ├── utils/                         # 工具函數
│   │   ├── cardHelpers.js             # 卡片操作函數
│   │   ├── cardScoreHelpers.js        # 單卡計分
│   │   ├── validators.js              # 資料驗證
│   │   └── constants.js               # 常量定義
│   │
│   ├── hooks/                         # 自訂 Hooks
│   │   └── useGameState.js            # 遊戲狀態 Hook
│   │
│   ├── data/                          # 靜態數據
│   │   ├── cards.js                   # 72 張卡片定義
│   │   ├── cards-balanced.js          # 平衡版卡片
│   │   ├── gameRules.js               # 遊戲規則配置
│   │   └── cardDescriptions.js        # 卡片描述
│   │
│   ├── config/                        # 配置文件
│   │   ├── firebase.js                # Firebase 初始化
│   │   ├── deckConfig.js              # 牌庫配置
│   │   └── colorConfig.js             # 顏色系統
│   │
│   ├── styles/                        # 全域樣式
│   │   ├── global.css                 # 全域樣式
│   │   ├── variables.css              # CSS 變數
│   │   └── animations.css             # 動畫定義
│   │
│   ├── App.jsx                        # 根組件
│   ├── App.css
│   └── main.jsx                       # 應用入口
│
├── public/                            # 靜態資源
│   └── favicon.ico
│
├── tests/                             # 測試文件
│   ├── unit/                          # 單元測試
│   │   ├── scoreService.test.js
│   │   ├── gameService.test.js
│   │   └── cardHelpers.test.js
│   └── e2e/                           # E2E 測試
│       ├── game-flow.spec.js
│       └── multiplayer.spec.js
│
├── .env.example                       # 環境變數範本
├── .gitignore
├── database.rules.json                # Firebase 安全規則
├── firebase.json                      # Firebase 配置
├── package.json
├── vite.config.js                     # Vite 配置
├── vitest.config.js                   # Vitest 配置
├── playwright.config.js               # Playwright 配置
└── README.md
```

### 3.2 檔案命名規範

#### React 組件
```
ComponentName/
├── ComponentName.jsx    # PascalCase
└── ComponentName.css    # PascalCase
```

#### 服務與工具
```
serviceOrUtilName.js     # camelCase
```

#### 常量與配置
```
configName.js            # camelCase
```

#### CSS 類別
```
.component-name          # kebab-case (BEM)
.component-name__element
.component-name--modifier
```

### 3.3 依賴管理

#### package.json 結構
```json
{
  "name": "sea-salt-paper",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext js,jsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "firebase": "^10.7.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "vitest": "^1.0.4",
    "@playwright/test": "^1.56.1",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2"
  }
}
```

---

## 4. 組件架構

### 4.1 組件層級樹

```
App
├── HomePage
│   ├── Button
│   ├── Input
│   └── Modal
├── RoomLobby
│   ├── PlayerList
│   ├── SettingsPanel
│   ├── Button
│   └── Modal
├── GameBoard
│   ├── TableLayout
│   │   ├── TableSeat (top)
│   │   │   └── (opponent components)
│   │   ├── TableSeat (left)
│   │   │   └── (opponent components)
│   │   ├── TableCenter
│   │   │   ├── DrawDeck
│   │   │   │   └── CardDrawEffect
│   │   │   ├── DiscardPile (left)
│   │   │   ├── DiscardPile (right)
│   │   │   └── DrawCardArea
│   │   │       └── Card
│   │   ├── TableSeat (right)
│   │   │   └── (opponent components)
│   │   └── TableSeat (bottom - me)
│   │       ├── PlayerHand
│   │       │   └── Card
│   │       └── PlayedPairs
│   │           └── Card
│   ├── ScorePanel
│   ├── ActionLog
│   ├── RoundEndModal
│   ├── DeclareScoreModal
│   ├── CrabEffectModal
│   ├── StealCardModal
│   └── RoundSettlement
└── Tutorial
    └── (tutorial components)
```

### 4.2 組件職責分類

#### 4.2.1 頁面組件 (Pages)

**HomePage**
- **職責**: 遊戲入口，創建或加入房間
- **狀態**: 房間代碼、玩家名稱、錯誤訊息
- **關鍵功能**:
  - 創建新房間
  - 加入現有房間
  - 驗證房間代碼
  - 導航至 RoomLobby

**RoomLobby**
- **職責**: 房間設置和準備
- **狀態**: 房間資料、玩家列表、遊戲設置
- **關鍵功能**:
  - 顯示房間資訊
  - 管理玩家列表
  - 設置遊戲參數
  - 新增 AI 玩家
  - 開始遊戲

**GameBoard**
- **職責**: 遊戲主界面，整合所有遊戲組件
- **狀態**: 遊戲狀態、玩家資料、選中的卡片、模態框顯示
- **關鍵功能**:
  - 監聽 Firebase 遊戲狀態
  - 管理回合流程
  - 處理玩家動作
  - 顯示適當的模態框
  - AI 自動決策

#### 4.2.2 佈局組件 (Layout)

**TableLayout**
- **職責**: 四人牌桌佈局
- **關鍵邏輯**: 計算玩家相對位置（自己永遠在下方）
- **實現**: CSS Grid 佈局

```javascript
// 核心算法
const getPlayersInTableOrder = () => {
  const playerIds = Object.keys(players || {})
  const myIndex = playerIds.indexOf(myPlayerId)

  const positions = ['bottom', 'right', 'top', 'left']
  const result = []

  for (let i = 0; i < 4; i++) {
    if (i < playerIds.length) {
      const actualIndex = (myIndex + i) % playerIds.length
      const playerId = playerIds[actualIndex]
      result.push({
        position: positions[i],
        player: players[playerId],
        playerId,
        isMe: i === 0
      })
    } else {
      result.push({
        position: positions[i],
        player: null,
        playerId: null,
        isMe: false
      })
    }
  }
  return result
}
```

**TableSeat**
- **職責**: 單個玩家座位
- **變體**:
  - 自己 (bottom) - 顯示完整手牌
  - 對手 (top, left, right) - 顯示卡背和計數
- **關鍵渲染**:
  - 玩家資訊（名稱、分數）
  - 手牌或卡背
  - 已打出的對子
  - 回合指示器
  - 起始玩家標記

**TableCenter**
- **職責**: 牌桌中央區域
- **子組件**: DrawDeck、DiscardPile × 2、DrawCardArea
- **關鍵邏輯**:
  - 管理抽牌和棄牌堆的可拖放狀態
  - 驗證棄牌規則（空堆必須棄到空堆）
  - 顯示抽卡特效

#### 4.2.3 遊戲組件 (Game)

**PlayerHand**
- **職責**: 顯示玩家手牌，支援選擇和操作
- **佈局**: 扇形排列（根據卡片數量調整間距）
- **交互**:
  - 點擊選擇/取消選擇卡片
  - 懸停放大卡片
  - 顯示卡片實際得分

**Card**
- **職責**: 單張卡片顯示
- **變體**:
  - 正面 - 顯示卡片內容
  - 背面 - 顯示統一卡背
- **尺寸**: small, medium, large
- **狀態**: selected, disabled, draggable
- **提示**: 顯示卡片描述和計分

**PlayedPairs**
- **職責**: 顯示已打出的對子
- **顯示模式**:
  - 完整模式 - 顯示所有對子詳細資訊
  - 精簡模式 - 顯示 emoji 摘要
- **效果標籤**: 顯示配對效果（抽、棄、回、偷）

**DiscardPile**
- **職責**: 棄牌堆顯示和交互
- **功能**:
  - 顯示最上方卡片
  - 支援拖放棄牌
  - 點擊拿取棄牌
  - 視覺提示（可拖放、必須棄）

**DrawDeck**
- **職責**: 抽牌堆
- **功能**:
  - 顯示剩餘卡片數量
  - 點擊抽牌
  - 抽卡動畫

**DrawCardArea**
- **職責**: 抽牌選擇區域
- **顯示時機**:
  - 從牌庫抽牌後
  - Fish 配對效果後
  - Crab 配對效果後
- **交互**:
  - 顯示抽到的卡片
  - 拖放到棄牌堆
  - 顯示棄牌提示

#### 4.2.4 模態框組件 (Modals)

**CrabEffectModal**
- **職責**: Crab 配對效果 - 選擇棄牌堆
- **顯示**: 左右兩個棄牌堆的最上方卡片
- **交互**: 點擊選擇

**StealCardModal**
- **職責**: Shark/Swimmer 配對效果 - 選擇對手
- **顯示**: 所有其他玩家列表（過濾無手牌玩家）
- **交互**: 點擊選擇目標

**DeclareScoreModal**
- **職責**: 宣告計分選擇
- **顯示**:
  - 當前分數計算
  - 兩個選項：Stop、Last Chance
- **交互**: 點擊選擇宣告模式

**RoundEndModal**
- **職責**: 回合結束提示
- **顯示**: 獲勝者資訊或回合結果

**RoundSettlement**
- **職責**: 回合結算動畫
- **顯示**: 所有玩家的得分變化
- **動畫**: 分數累積動畫（5 秒）

#### 4.2.5 通用組件 (Common)

**Button**
```jsx
<Button
  variant="primary" | "secondary" | "danger"
  size="small" | "medium" | "large"
  disabled={boolean}
  onClick={function}
>
  內容
</Button>
```

**Input**
```jsx
<Input
  type="text" | "number"
  placeholder={string}
  value={string}
  onChange={function}
  error={string}
/>
```

**Modal**
```jsx
<Modal
  isOpen={boolean}
  onClose={function}
  title={string}
>
  {children}
</Modal>
```

### 4.3 組件通訊模式

#### 4.3.1 Props Down, Events Up

```jsx
// Parent (GameBoard)
<PlayerHand
  cards={myHand}
  selectedCards={selectedCardIds}
  onCardSelect={(card) => handleCardSelect(card)}
  onCardDeselect={(card) => handleCardDeselect(card)}
  canSelect={isMyTurn && turnPhase === 'pair'}
/>

// Child (PlayerHand)
const PlayerHand = ({ cards, selectedCards, onCardSelect, onCardDeselect, canSelect }) => {
  const handleClick = (card) => {
    if (!canSelect) return

    if (selectedCards.includes(card.id)) {
      onCardDeselect(card)
    } else {
      onCardSelect(card)
    }
  }

  return (
    <div className="player-hand">
      {cards.map(card => (
        <Card key={card.id} cardData={card} onClick={handleClick} />
      ))}
    </div>
  )
}
```

#### 4.3.2 Context API（未使用）

本專案**不使用** Context API，原因：
- 狀態相對簡單，props drilling 可控
- 使用 Firebase 作為全域狀態
- 避免不必要的複雜度

#### 4.3.3 Firebase 作為狀態源

```jsx
// GameBoard.jsx
useEffect(() => {
  if (!roomId) return

  const unsubscribe = listenToRoom(roomId, (roomData) => {
    setRoomData(roomData)
    setGameState(roomData.gameState)
  })

  return () => unsubscribe()
}, [roomId])
```

### 4.4 組件生命週期管理

#### 掛載 (Mounting)
```jsx
useEffect(() => {
  // 組件掛載時執行
  console.log('[GameBoard] Component mounted')

  return () => {
    // 清理函數
    console.log('[GameBoard] Component will unmount')
  }
}, [])
```

#### 更新 (Updating)
```jsx
useEffect(() => {
  // 當 gameState 變化時執行
  console.log('[GameBoard] Game state updated', gameState)
}, [gameState])
```

#### 清理 (Cleanup)
```jsx
useEffect(() => {
  const unsubscribe = listenToRoom(roomId, handleRoomUpdate)

  return () => {
    // 組件卸載時取消監聽
    unsubscribe()
  }
}, [roomId])
```

---

## 5. 服務層

### 5.1 gameService.js

**職責**: 遊戲核心邏輯

#### 主要函數

**createDeck()**
```javascript
/**
 * 創建並洗亂牌庫
 * @returns {Array<Card>} 洗亂後的牌庫
 */
export function createDeck() {
  // 1. 從配置中取得所有卡片
  const cards = buildDeckFromConfig(DECK_CONFIG)

  // 2. 為每張卡片分配隨機顏色
  const cardsWithColors = assignRandomColors(cards)

  // 3. 洗亂
  return shuffleDeck(cardsWithColors)
}
```

**dealInitialHands()**
```javascript
/**
 * 發初始手牌
 * @param {number} playerCount - 玩家數量
 * @param {number} handSize - 每人手牌數
 * @returns {Object} { hands, remainingDeck }
 */
export function dealInitialHands(playerCount, handSize) {
  const deck = createDeck()
  const hands = []

  for (let i = 0; i < playerCount; i++) {
    const hand = []
    for (let j = 0; j < handSize; j++) {
      hand.push(deck.pop())
    }
    hands.push(hand)
  }

  return {
    hands,
    remainingDeck: deck
  }
}
```

**drawFromDeck()**
```javascript
/**
 * 從牌庫抽牌
 * @param {Array<Card>} deck - 牌庫
 * @param {number} count - 抽牌數量
 * @returns {Object} { drawnCards, remainingDeck }
 */
export function drawFromDeck(deck, count) {
  const drawnCards = []
  const remainingDeck = [...deck]

  for (let i = 0; i < count; i++) {
    if (remainingDeck.length === 0) break
    drawnCards.push(remainingDeck.pop())
  }

  return { drawnCards, remainingDeck }
}
```

**executePairEffect()**
```javascript
/**
 * 執行配對效果
 * @param {Card} card1 - 第一張卡
 * @param {Card} card2 - 第二張卡
 * @returns {Object} { effect, context }
 */
export function executePairEffect(card1, card2) {
  // 驗證配對
  if (!isValidPair(card1, card2)) {
    return { effect: null }
  }

  // 取得配對效果
  const pairEffect = card1.pairEffect

  return {
    effect: pairEffect,
    context: {
      cardNames: [card1.name, card2.name]
    }
  }
}
```

**checkDeckReshuffle()**
```javascript
/**
 * 檢查並執行牌庫重新洗牌
 * @param {Array<Card>} deck - 當前牌庫
 * @param {Array<Card>} discardLeft - 左棄牌堆
 * @param {Array<Card>} discardRight - 右棄牌堆
 * @returns {Object} { newDeck, newDiscardLeft, newDiscardRight }
 */
export function checkDeckReshuffle(deck, discardLeft, discardRight) {
  if (deck.length > 0) {
    // 牌庫還有牌，不需要重新洗牌
    return { newDeck: deck, newDiscardLeft: discardLeft, newDiscardRight: discardRight }
  }

  // 保留兩個棄牌堆的最上方卡片
  const leftTop = discardLeft[discardLeft.length - 1] || null
  const rightTop = discardRight[discardRight.length - 1] || null

  // 合併其餘棄牌
  const cardsToShuffle = [
    ...discardLeft.slice(0, -1),
    ...discardRight.slice(0, -1)
  ]

  // 洗亂
  const newDeck = shuffleDeck(cardsToShuffle)

  return {
    newDeck,
    newDiscardLeft: leftTop ? [leftTop] : [],
    newDiscardRight: rightTop ? [rightTop] : []
  }
}
```

### 5.2 scoreService.js

**職責**: 得分計算引擎

#### 主要函數

**calculateScore()**
```javascript
/**
 * 計算總分
 * @param {Array<Card>} hand - 手牌
 * @param {Array<Pair>} playedPairs - 已打出對子
 * @param {Object} options - 選項
 * @returns {Object} 得分詳情
 */
export function calculateScore(hand, playedPairs, options = {}) {
  const { includeColorBonus = false } = options

  // 合併所有卡片
  const allCards = [
    ...hand,
    ...playedPairs.flatMap(pair => pair.cards || [])
  ]

  // 1. 基礎分數
  const baseResult = calculateBaseScore(allCards)

  // 2. 倍數加成
  const multipliers = calculateMultipliers(hand, playedPairs)

  // 3. 配對獎勵
  const pairBonus = playedPairs.length * 1

  // 4. 美人魚分數
  const mermaidScore = calculateMermaidScore(hand, playedPairs)

  // 5. 顏色加成（可選）
  const colorBonus = includeColorBonus
    ? calculateColorBonus(hand, playedPairs)
    : 0

  const total = baseResult.total + multipliers.total + pairBonus + mermaidScore + colorBonus

  return {
    base: baseResult.total,
    pairs: pairBonus,
    multipliers: multipliers.total,
    mermaids: mermaidScore,
    colorBonus,
    total
  }
}
```

**calculateBaseScore()**
```javascript
/**
 * 計算基礎分數
 * @param {Array<Card>} cards - 所有卡片
 * @returns {Object} 基礎分數詳情
 */
export function calculateBaseScore(cards) {
  let total = 0

  // Shell: (count-1)*2
  const shellCount = filterCardsByName(cards, 'Shell').length
  const shellScore = shellCount > 0 ? (shellCount - 1) * 2 : 0
  total += shellScore

  // Octopus: (count-1)*3
  const octopusCount = filterCardsByName(cards, 'Octopus').length
  const octopusScore = octopusCount > 0 ? (octopusCount - 1) * 3 : 0
  total += octopusScore

  // Penguin: count*2-1
  const penguinCount = filterCardsByName(cards, 'Penguin').length
  const penguinScore = penguinCount > 0 ? penguinCount * 2 - 1 : 0
  total += penguinScore

  // Sailor: count >= 2 ? 5 : 0
  const sailorCount = filterCardsByName(cards, 'Sailor').length
  const sailorScore = sailorCount >= 2 ? 5 : 0
  total += sailorScore

  // Starfish: (count-1)*2
  const starfishCount = filterCardsByName(cards, 'Starfish').length
  const starfishScore = starfishCount > 0 ? (starfishCount - 1) * 2 : 0
  total += starfishScore

  // Pair Cards: floor(count/2)*1
  const PAIR_CARD_TYPES = ['Fish', 'Crab', 'Sailboat', 'Shark', 'Swimmer']
  let pairCardBonus = 0
  PAIR_CARD_TYPES.forEach(type => {
    const count = filterCardsByName(cards, type).length
    if (count >= 2) {
      pairCardBonus += Math.floor(count / 2) * 1
    }
  })
  total += pairCardBonus

  return {
    total,
    breakdown: {
      shell: shellScore,
      octopus: octopusScore,
      penguin: penguinScore,
      sailor: sailorScore,
      starfish: starfishScore,
      pairCards: pairCardBonus
    }
  }
}
```

**calculateMermaidScore()**
```javascript
/**
 * 計算美人魚分數
 * @param {Array<Card>} hand - 手牌
 * @param {Array<Pair>} playedPairs - 已打出對子
 * @returns {number} 美人魚總分
 */
export function calculateMermaidScore(hand, playedPairs) {
  const allCards = [...hand, ...playedPairs.flatMap(p => p.cards || [])]

  // 統計美人魚數量
  const mermaidCount = filterCardsByName(allCards, 'Mermaid').length

  if (mermaidCount === 0) return 0

  // 統計非美人魚卡片的顏色
  const nonMermaidCards = allCards.filter(card => card.name !== 'Mermaid')
  const colorCounts = countCardsByColor(nonMermaidCards)

  // 按降序排列顏色計數
  const sortedCounts = Object.values(colorCounts).sort((a, b) => b - a)

  // 每張美人魚加上對應排名的顏色計數
  let total = 0
  for (let i = 0; i < mermaidCount; i++) {
    total += sortedCounts[i] || 0
  }

  return total
}
```

**calculateLastChanceScores()**
```javascript
/**
 * 計算 Last Chance 模式的分數
 * @param {Object} players - 所有玩家
 * @param {string} declaringPlayerId - 宣告者 ID
 * @returns {Object} 所有玩家的得分
 */
export function calculateLastChanceScores(players, declaringPlayerId) {
  const scores = {}

  // 計算所有玩家的卡片分數和顏色加成
  Object.entries(players).forEach(([playerId, player]) => {
    const cardScore = calculateScore(player.hand, player.playedPairs, { includeColorBonus: false }).total
    const colorBonus = calculateColorBonus(player.hand, player.playedPairs)

    scores[playerId] = { cardScore, colorBonus }
  })

  // 判斷宣告者是否分數最高
  const declarerCardScore = scores[declaringPlayerId].cardScore
  const declarerHasHighest = Object.entries(scores).every(([id, s]) => {
    if (id === declaringPlayerId) return true
    return declarerCardScore >= s.cardScore
  })

  // 計算最終得分
  const finalScores = {}

  Object.entries(scores).forEach(([playerId, s]) => {
    if (declarerHasHighest) {
      // 宣告者最高：宣告者得 cardScore + colorBonus，其他人只得 colorBonus
      finalScores[playerId] = playerId === declaringPlayerId
        ? s.cardScore + s.colorBonus
        : s.colorBonus
    } else {
      // 宣告者不是最高：宣告者只得 colorBonus，其他人得 cardScore + colorBonus
      finalScores[playerId] = playerId === declaringPlayerId
        ? s.colorBonus
        : s.cardScore + s.colorBonus
    }
  })

  return {
    scores: finalScores,
    declarerHasHighest
  }
}
```

### 5.3 firebaseService.js

**職責**: Firebase 資料庫操作抽象層

#### 主要函數

**createRoom()**
```javascript
/**
 * 創建新房間
 * @param {Object} settings - 房間設置
 * @param {Object} hostPlayer - 房主資料
 * @returns {Promise<string>} 房間 ID
 */
export async function createRoom(settings, hostPlayer) {
  const roomId = generateRoomCode()

  const roomData = {
    roomId,
    hostId: hostPlayer.id,
    status: 'waiting',
    createdAt: serverTimestamp(),
    settings: {
      maxPlayers: settings.maxPlayers || 4,
      targetScore: settings.targetScore || 'auto',
      startingHandSize: settings.startingHandSize || 0,
      mermaidsWin: settings.mermaidsWin !== false,
      colorBonus: settings.colorBonus !== false,
      aiCount: 0,
      aiDifficulty: 'medium'
    },
    players: {
      [hostPlayer.id]: {
        ...hostPlayer,
        isHost: true,
        isReady: false,
        score: 0,
        connected: true,
        lastActive: serverTimestamp()
      }
    }
  }

  await set(ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`), roomData)

  return roomId
}
```

**listenToRoom()**
```javascript
/**
 * 監聽房間資料變化
 * @param {string} roomId - 房間 ID
 * @param {Function} callback - 回調函數
 * @returns {Function} 取消監聽函數
 */
export function listenToRoom(roomId, callback) {
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)

  const unsubscribe = onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val()
      callback(data)
    } else {
      callback(null)
    }
  }, (error) => {
    console.error('[Firebase] Listen error:', error)
    callback(null)
  })

  return () => off(roomRef)
}
```

**updateGameState()**
```javascript
/**
 * 更新遊戲狀態（使用 transaction 確保原子性）
 * @param {string} roomId - 房間 ID
 * @param {Object} updates - 要更新的欄位
 * @returns {Promise<void>}
 */
export async function updateGameState(roomId, updates) {
  const gameStateRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/gameState`)

  await runTransaction(gameStateRef, (currentState) => {
    if (!currentState) return currentState

    return {
      ...currentState,
      ...updates
    }
  })
}
```

**updatePlayerHand()**
```javascript
/**
 * 更新玩家手牌
 * @param {string} roomId - 房間 ID
 * @param {string} playerId - 玩家 ID
 * @param {Array<Card>} hand - 新手牌
 * @returns {Promise<void>}
 */
export async function updatePlayerHand(roomId, playerId, hand) {
  const handRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/players/${playerId}/hand`)

  await set(handRef, hand)
}
```

### 5.4 aiService.js

**職責**: AI 決策引擎

#### 主要函數

**makeAIDecision()**
```javascript
/**
 * AI 決策
 * @param {Object} gameState - 遊戲狀態
 * @param {Object} aiPlayer - AI 玩家資料
 * @param {string} difficulty - 難度
 * @returns {Object} 決策結果
 */
export function makeAIDecision(gameState, aiPlayer, difficulty) {
  switch (difficulty) {
    case 'easy':
      return makeEasyDecision(gameState, aiPlayer)
    case 'medium':
      return makeMediumDecision(gameState, aiPlayer)
    case 'hard':
      return makeHardDecision(gameState, aiPlayer)
    default:
      return makeMediumDecision(gameState, aiPlayer)
  }
}
```

**makeEasyDecision()**
```javascript
/**
 * 簡單 AI - 隨機決策
 */
function makeEasyDecision(gameState, aiPlayer) {
  const hand = aiPlayer.hand || []

  // 隨機決定是否配對
  if (Math.random() > 0.5) {
    const possiblePairs = findAllValidPairs(hand)
    if (possiblePairs.length > 0) {
      const randomPair = possiblePairs[Math.floor(Math.random() * possiblePairs.length)]
      return {
        action: 'play_pair',
        pair: randomPair
      }
    }
  }

  // 隨機宣告
  return {
    action: 'declare',
    mode: Math.random() > 0.5 ? 'stop' : 'last_chance'
  }
}
```

**makeMediumDecision()**
```javascript
/**
 * 中等 AI - 基於分數決策
 */
function makeMediumDecision(gameState, aiPlayer) {
  const hand = aiPlayer.hand || []
  const playedPairs = aiPlayer.playedPairs || []

  // 計算當前分數
  const score = calculateScore(hand, playedPairs)

  // 尋找有效配對
  const possiblePairs = findAllValidPairs(hand)

  // 如果有配對且分數低於 20，先配對
  if (possiblePairs.length > 0 && score.total < 20) {
    // 優先選擇有效果的配對
    const effectPairs = possiblePairs.filter(pair => {
      const effect = executePairEffect(pair[0], pair[1])
      return effect.effect !== null
    })

    const selectedPair = effectPairs.length > 0
      ? effectPairs[0]
      : possiblePairs[0]

    return {
      action: 'play_pair',
      pair: selectedPair
    }
  }

  // 分數達到閾值，宣告
  if (score.total >= 20) {
    return {
      action: 'declare',
      mode: 'stop'
    }
  }

  // 繼續抽牌
  return {
    action: 'end_pair'
  }
}
```

---

## 6. 狀態管理

### 6.1 狀態架構

```
Firebase Realtime Database (唯一真實來源)
           ↓
    listenToRoom()
           ↓
   GameBoard State (useState)
           ↓
    Props → 子組件
```

### 6.2 GameBoard 主要狀態

```javascript
const [roomData, setRoomData] = useState(null)
const [gameState, setGameState] = useState(null)
const [myHand, setMyHand] = useState([])
const [selectedCardIds, setSelectedCardIds] = useState([])
const [showDeclareScore, setShowDeclareScore] = useState(false)
const [showCrabEffect, setShowCrabEffect] = useState(false)
const [showStealEffect, setShowStealEffect] = useState(false)
const [showRoundEnd, setShowRoundEnd] = useState(false)
const [showDrawCardArea, setShowDrawCardArea] = useState(false)
const [drawnCards, setDrawnCards] = useState(null)
const [cardEnteringHand, setCardEnteringHand] = useState(null)
const [showSettlement, setShowSettlement] = useState(false)
const [settlementData, setSettlementData] = useState(null)
const [error, setError] = useState(null)
const [loading, setLoading] = useState(true)
```

### 6.3 狀態更新流程

#### 本地更新 → Firebase → 監聽器 → UI 更新

```javascript
// 1. 玩家動作（本地）
const handleDrawCard = async () => {
  // 2. 更新 Firebase
  await updateGameState(roomId, {
    deckCount: newDeckCount,
    turnPhase: 'pair'
  })

  await updatePlayerHand(roomId, myPlayerId, newHand)
}

// 3. Firebase 監聽器自動觸發
useEffect(() => {
  const unsubscribe = listenToRoom(roomId, (data) => {
    // 4. UI 自動更新
    setRoomData(data)
    setGameState(data.gameState)
  })

  return () => unsubscribe()
}, [roomId])

// 5. 組件重新渲染
```

### 6.4 樂觀更新

```javascript
// 樂觀更新範例：選擇卡片
const handleCardSelect = (card) => {
  // 立即更新本地狀態
  setSelectedCardIds(prev => [...prev, card.id])

  // 不需要等待 Firebase 確認
  // 因為這是純本地狀態，不影響其他玩家
}
```

### 6.5 衝突解決

```javascript
// 使用 Transaction 避免衝突
await runTransaction(gameStateRef, (current) => {
  if (current.locked) {
    // 已被鎖定，放棄更新
    return
  }

  // 執行更新
  current.locked = true
  current.currentPlayerId = nextPlayerId

  return current
})
```

---

## 7. 即時同步

### 7.1 Firebase 監聽器設置

```javascript
useEffect(() => {
  if (!roomId) return

  console.log('[GameBoard] Setting up Firebase listener for room:', roomId)

  const unsubscribe = listenToRoom(roomId, (roomData) => {
    if (!roomData) {
      setError('房間不存在')
      setLoading(false)
      return
    }

    console.log('[GameBoard] Room data updated:', roomData)

    setRoomData(roomData)
    setGameState(roomData.gameState)
    setLoading(false)
  })

  return () => {
    console.log('[GameBoard] Cleaning up Firebase listener')
    unsubscribe()
  }
}, [roomId])
```

### 7.2 資料流向圖

```
玩家 A 動作
    ↓
更新 Firebase
    ↓
Firebase 觸發事件
    ↓  ↓  ↓  ↓
    A  B  C  D  (所有監聽的客戶端)
    ↓  ↓  ↓  ↓
更新本地狀態
    ↓  ↓  ↓  ↓
重新渲染 UI
```

### 7.3 關鍵同步點

#### 遊戲狀態同步
- 當前玩家
- 回合階段
- 牌庫計數
- 棄牌堆

#### 玩家資料同步
- 手牌（僅自己可見完整資料）
- 手牌計數（所有人可見）
- 已打出的對子
- 累積分數

#### 特效狀態同步
- pendingCardChoice（等待選擇的卡片）
- 宣告模式
- 回合結算結果

---

## 8. 路由系統

### 8.1 路由配置

```javascript
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId/lobby" element={<RoomLobby />} />
        <Route path="/room/:roomId/game" element={<GameBoard />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 8.2 路由導航

```javascript
import { useNavigate, useParams } from 'react-router-dom'

function RoomLobby() {
  const navigate = useNavigate()
  const { roomId } = useParams()

  const handleStartGame = () => {
    navigate(`/room/${roomId}/game`)
  }

  return (
    <div>
      {/* ... */}
      <Button onClick={handleStartGame}>開始遊戲</Button>
    </div>
  )
}
```

---

## 9. 構建與部署

### 9.1 Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    open: true
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/database']
        }
      }
    }
  }
})
```

### 9.2 構建命令

```bash
# 開發模式
npm run dev

# 生產構建
npm run build

# 預覽構建產物
npm run preview

# 測試
npm test
npm run test:e2e

# 代碼檢查
npm run lint
```

### 9.3 Firebase Hosting 部署

```bash
# 1. 構建
npm run build

# 2. 部署
firebase deploy --only hosting
```

### 9.4 環境變數

```bash
# .env.local (不提交到 git)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

```javascript
// config/firebase.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}
```

---

## 10. 效能優化

### 10.1 組件優化

#### React.memo
```javascript
export default React.memo(Card, (prevProps, nextProps) => {
  return (
    prevProps.cardData.id === nextProps.cardData.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.disabled === nextProps.disabled
  )
})
```

#### useMemo
```javascript
const sortedCards = useMemo(() => {
  return cards.sort((a, b) => a.value - b.value)
}, [cards])
```

#### useCallback
```javascript
const handleCardClick = useCallback((card) => {
  if (!canSelect) return
  onCardSelect(card)
}, [canSelect, onCardSelect])
```

### 10.2 Firebase 優化

#### 限制監聽範圍
```javascript
// ❌ 監聽整個房間
const unsubscribe = onValue(ref(database, `rooms/${roomId}`), callback)

// ✅ 只監聽遊戲狀態
const unsubscribe = onValue(ref(database, `rooms/${roomId}/gameState`), callback)
```

#### 批次更新
```javascript
// ❌ 多次更新
await set(ref(database, `rooms/${roomId}/gameState/turnPhase`), 'pair')
await set(ref(database, `rooms/${roomId}/gameState/currentPlayerId`), nextId)

// ✅ 批次更新
await update(ref(database, `rooms/${roomId}/gameState`), {
  turnPhase: 'pair',
  currentPlayerId: nextId
})
```

### 10.3 打包優化

#### Code Splitting
```javascript
const GameBoard = lazy(() => import('./pages/GameBoard/GameBoard'))

<Suspense fallback={<LoadingSpinner />}>
  <GameBoard />
</Suspense>
```

#### Tree Shaking
```javascript
// ❌ 匯入整個庫
import _ from 'lodash'

// ✅ 只匯入需要的函數
import shuffle from 'lodash/shuffle'
```

---

**文件結束**
