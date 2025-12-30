# Sea Salt & Paper - 資料結構規格書 (Data Structures Specification)

**版本**: 1.0.0
**最後更新**: 2025-12-13
**文件類型**: Software Design Document - Data Structures

---

## 目錄

1. [Firebase 資料庫 Schema](#1-firebase-資料庫-schema)
2. [資料物件定義](#2-資料物件定義)
3. [安全規則](#3-安全規則)
4. [資料流動](#4-資料流動)
5. [索引與查詢](#5-索引與查詢)

---

## 1. Firebase 資料庫 Schema

### 1.1 根層結構

```json
{
  "rooms": {
    "{roomId}": { Room }
  }
}
```

### 1.2 Room 完整結構

```json
{
  "rooms": {
    "ABC123": {
      "roomId": "ABC123",
      "hostId": "player_uuid_1",
      "status": "waiting" | "playing" | "finished",
      "createdAt": { ".sv": "timestamp" },
      "startedAt": 1234567890 | null,
      "finishedAt": 1234567890 | null,

      "settings": {
        "maxPlayers": 4,
        "targetScore": "auto" | 30,
        "customScore": 30 | null,
        "startingHandSize": 0,
        "mermaidsWin": true,
        "colorBonus": true,
        "aiCount": 0,
        "aiDifficulty": "easy" | "medium" | "hard"
      },

      "players": {
        "player_uuid_1": {
          "id": "player_uuid_1",
          "name": "Alice",
          "isHost": true,
          "isReady": false,
          "isAI": false,
          "difficulty": null,
          "score": 0,
          "connected": true,
          "lastActive": { ".sv": "timestamp" },

          "hand": [
            {
              "id": "fish_1",
              "name": "Fish",
              "type": "pair_effect",
              "emoji": "🐟",
              "color": "blue",
              "value": 0,
              "pairEffect": "draw_blind",
              "description": "配對時，從牌庫抽 1 張牌"
            }
          ],
          "handCount": 5,
          "playedPairs": [
            {
              "id": "pair_1234567890",
              "cards": [
                { Card },
                { Card }
              ],
              "hasEffect": true,
              "effectText": "抽",
              "stolenFrom": {
                "playerId": "player_uuid_2",
                "playerName": "Bob",
                "cardName": "Fish"
              } | null
            }
          ]
        }
      },

      "gameState": {
        "deckCount": 62,
        "discardLeft": [
          { Card }
        ],
        "discardRight": [
          { Card }
        ],

        "currentPlayerId": "player_uuid_1",
        "currentPlayerIndex": 0,
        "startingPlayerId": "player_uuid_1",

        "turnPhase": "draw" | "pair" | "declare" | "declare_showing" | "round_end",

        "declareMode": "stop" | "last_chance" | null,
        "declaringPlayerId": "player_uuid_1" | null,
        "declarationScore": 25 | null,

        "roundNumber": 1,
        "roundResults": {
          "player_uuid_1": {
            "cardScore": 20,
            "colorBonus": 5,
            "roundTotal": 25
          }
        } | null,

        "pendingCardChoice": {
          "playerId": "player_uuid_1",
          "cards": [ { Card } ],
          "type": "draw_discard" | "crab_effect" | "steal_card",
          "context": {
            "targetPlayerId": "player_uuid_2" | null
          }
        } | null,

        "actionLog": [
          {
            "timestamp": 1234567890,
            "playerId": "player_uuid_1",
            "playerName": "Alice",
            "type": "draw_card" | "play_pair" | "declare_stop" | "declare_last_chance" | "pair_effect" | "round_end",
            "card": { Card } | null,
            "cards": [ { Card } ] | null,
            "pair": { Pair } | null,
            "declareMode": "stop" | "last_chance" | null,
            "score": 25 | null,
            "description": "Alice 從牌庫抽取 Fish"
          }
        ],

        "targetScore": 30,
        "deck": [
          { Card }
        ]
      }
    }
  }
}
```

---

## 2. 資料物件定義

### 2.1 Room 物件

```typescript
interface Room {
  roomId: string                 // 6 個字元的房間代碼
  hostId: string                 // 房主的玩家 ID
  status: RoomStatus             // 房間狀態
  createdAt: Timestamp           // 建立時間
  startedAt: Timestamp | null    // 開始遊戲時間
  finishedAt: Timestamp | null   // 遊戲結束時間
  settings: RoomSettings         // 房間設置
  players: { [playerId: string]: Player }  // 玩家列表
  gameState: GameState | null    // 遊戲狀態（僅在遊戲開始後）
}

type RoomStatus = 'waiting' | 'playing' | 'finished'
```

### 2.2 RoomSettings 物件

```typescript
interface RoomSettings {
  maxPlayers: number             // 最大玩家數 (2-4)
  targetScore: 'auto' | number   // 目標分數 ('auto' 或自訂數值)
  customScore: number | null     // 自訂分數 (當 targetScore 為數值時使用)
  startingHandSize: number       // 起始手牌數量 (通常為 0)
  mermaidsWin: boolean           // 4 張美人魚是否直接獲勝
  colorBonus: boolean            // 是否計算顏色加成
  aiCount: number                // AI 玩家數量
  aiDifficulty: AIDifficulty     // AI 難度
}

type AIDifficulty = 'easy' | 'medium' | 'hard'
```

**預設值**:
```javascript
const DEFAULT_SETTINGS = {
  maxPlayers: 4,
  targetScore: 'auto',        // 根據玩家數自動計算
  customScore: null,
  startingHandSize: 0,
  mermaidsWin: true,
  colorBonus: true,
  aiCount: 0,
  aiDifficulty: 'medium'
}
```

**targetScore 計算規則**:
```javascript
function calculateTargetScore(playerCount) {
  const scoreMap = {
    2: 40,
    3: 35,
    4: 30
  }
  return scoreMap[playerCount] || 30
}
```

### 2.3 Player 物件

```typescript
interface Player {
  // 基本資訊
  id: string                     // UUID
  name: string                   // 玩家名稱
  isHost: boolean                // 是否為房主
  isReady: boolean               // 是否準備就緒
  isAI: boolean                  // 是否為 AI
  difficulty: AIDifficulty | null  // AI 難度（僅 AI 玩家）

  // 遊戲狀態
  score: number                  // 累積分數
  connected: boolean             // 連線狀態
  lastActive: Timestamp          // 最後活動時間

  // 遊戲中資料（僅在遊戲進行中）
  hand: Card[]                   // 手牌（僅自己可見完整資料）
  handCount: number              // 手牌數量（所有人可見）
  playedPairs: Pair[]            // 已打出的對子
}
```

**資料可見性規則**:

| 欄位 | 自己 | 其他玩家 |
|-----|------|---------|
| hand | ✅ 完整 | ❌ 空陣列 |
| handCount | ✅ | ✅ |
| playedPairs | ✅ | ✅ |
| score | ✅ | ✅ |
| connected | ✅ | ✅ |

### 2.4 GameState 物件

```typescript
interface GameState {
  // 牌庫與棄牌堆
  deckCount: number              // 牌庫剩餘卡片數
  discardLeft: Card[]            // 左棄牌堆
  discardRight: Card[]           // 右棄牌堆

  // 當前回合
  currentPlayerId: string        // 當前玩家 ID
  currentPlayerIndex: number     // 當前玩家索引 (0-3)
  startingPlayerId: string       // 起始玩家 ID

  // 回合階段
  turnPhase: TurnPhase           // 當前階段

  // 宣告資訊
  declareMode: DeclareMode | null        // 宣告模式
  declaringPlayerId: string | null       // 宣告者 ID
  declarationScore: number | null        // 宣告時的分數

  // 回合記錄
  roundNumber: number                    // 回合編號（從 1 開始）
  roundResults: RoundResults | null      // 回合結算結果

  // 待處理狀態
  pendingCardChoice: PendingCardChoice | null  // 等待選擇的卡片

  // 動作記錄
  actionLog: Action[]                    // 動作歷史記錄

  // 遊戲配置
  targetScore: number                    // 目標分數
  deck: Card[]                          // 完整牌庫（用於驗證）
}

type TurnPhase = 'draw' | 'pair' | 'declare' | 'declare_showing' | 'round_end'
type DeclareMode = 'stop' | 'last_chance'
```

### 2.5 Card 物件

```typescript
interface Card {
  // 唯一識別
  id: string                     // 格式: "{cardName}_{index}"

  // 基本資訊
  name: CardName                 // 卡片名稱
  type: CardType                 // 卡片類型
  emoji: string                  // 圖示符號
  color: CardColor               // 卡片顏色
  value: number                  // 基礎點數（通常為 0）

  // 配對效果
  pairEffect: PairEffect | null  // 配對效果

  // 倍數卡特定
  multiplierTarget: CardName | CardName[] | null  // 目標卡片類型
  multiplierValue: number | null                   // 加成數值

  // 描述
  description: string            // 卡片描述文字
}

type CardName =
  | 'Fish' | 'Crab' | 'Sailboat' | 'Shark' | 'Swimmer'
  | 'Shell' | 'Octopus' | 'Penguin' | 'Sailor' | 'Starfish'
  | 'Lighthouse' | 'FishSchool' | 'PenguinColony' | 'Captain' | 'Seagull'
  | 'Mermaid'

type CardType = 'pair_effect' | 'collection' | 'multiplier' | 'special'

type CardColor = 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'black' | 'white'

type PairEffect = 'draw_blind' | 'draw_discard' | 'extra_turn' | 'steal_card'
```

**範例**:

```json
{
  "id": "fish_1",
  "name": "Fish",
  "type": "pair_effect",
  "emoji": "🐟",
  "color": "blue",
  "value": 0,
  "pairEffect": "draw_blind",
  "multiplierTarget": null,
  "multiplierValue": null,
  "description": "配對時，從牌庫抽 1 張牌"
}
```

```json
{
  "id": "lighthouse_1",
  "name": "Lighthouse",
  "type": "multiplier",
  "emoji": "🗼",
  "color": "white",
  "value": 0,
  "pairEffect": null,
  "multiplierTarget": "Sailboat",
  "multiplierValue": 1,
  "description": "每張帆船 +1 分"
}
```

### 2.6 Pair 物件

```typescript
interface Pair {
  id: string                     // 唯一識別碼（用於 React key）
  cards: Card[]                  // 兩張卡片的陣列
  hasEffect: boolean             // 是否有配對效果
  effectText: string | null      // 效果標籤文字 ('抽', '棄', '回', '偷')
  stolenFrom: StolenInfo | null  // 偷牌資訊（僅 Shark/Swimmer 配對）
}

interface StolenInfo {
  playerId: string               // 被偷玩家 ID
  playerName: string             // 被偷玩家名稱
  cardName: string               // 被偷卡片名稱
}
```

**範例**:

```json
{
  "id": "pair_1234567890",
  "cards": [
    {
      "id": "fish_1",
      "name": "Fish",
      "emoji": "🐟",
      "color": "blue"
    },
    {
      "id": "fish_2",
      "name": "Fish",
      "emoji": "🐟",
      "color": "red"
    }
  ],
  "hasEffect": true,
  "effectText": "抽",
  "stolenFrom": null
}
```

### 2.7 PendingCardChoice 物件

```typescript
interface PendingCardChoice {
  playerId: string               // 需要選擇的玩家 ID
  cards: Card[]                  // 可選擇的卡片
  type: CardChoiceType           // 選擇類型
  context: ChoiceContext         // 額外上下文資訊
}

type CardChoiceType = 'draw_discard' | 'crab_effect' | 'steal_card'

interface ChoiceContext {
  targetPlayerId?: string        // 目標玩家 ID（偷牌時）
  sourcePile?: 'left' | 'right'  // 來源棄牌堆
}
```

**範例 - 從牌庫抽牌後選擇棄牌**:
```json
{
  "playerId": "player_uuid_1",
  "cards": [
    {
      "id": "crab_3",
      "name": "Crab",
      "emoji": "🦀",
      "color": "red"
    }
  ],
  "type": "draw_discard",
  "context": {}
}
```

**範例 - Crab 效果選擇棄牌堆**:
```json
{
  "playerId": "player_uuid_1",
  "cards": [
    { "id": "fish_5", "name": "Fish" },
    { "id": "sailboat_3", "name": "Sailboat" }
  ],
  "type": "crab_effect",
  "context": {}
}
```

### 2.8 Action 物件

```typescript
interface Action {
  timestamp: number              // Unix timestamp
  playerId: string               // 執行動作的玩家 ID
  playerName: string             // 執行動作的玩家名稱
  type: ActionType               // 動作類型

  // 根據 type 不同，包含不同的額外欄位
  card?: Card                    // 單張卡片（抽牌、棄牌）
  cards?: Card[]                 // 多張卡片（配對）
  pair?: Pair                    // 配對物件
  declareMode?: DeclareMode      // 宣告模式
  score?: number                 // 分數
  roundResults?: RoundResults    // 回合結果
  description?: string           // 自訂描述
}

type ActionType =
  | 'draw_card'                  // 抽牌
  | 'discard_card'               // 棄牌
  | 'take_discard'               // 從棄牌堆拿牌
  | 'play_pair'                  // 打出對子
  | 'pair_effect'                // 配對效果觸發
  | 'declare_stop'               // 宣告停止
  | 'declare_last_chance'        // 宣告最後機會
  | 'steal_card'                 // 偷牌
  | 'round_end'                  // 回合結束
  | 'game_start'                 // 遊戲開始
  | 'game_end'                   // 遊戲結束
```

**範例 - 抽牌動作**:
```json
{
  "timestamp": 1234567890,
  "playerId": "player_uuid_1",
  "playerName": "Alice",
  "type": "draw_card",
  "card": {
    "id": "fish_1",
    "name": "Fish"
  },
  "description": "Alice 從牌庫抽取 Fish"
}
```

**範例 - 配對動作**:
```json
{
  "timestamp": 1234567890,
  "playerId": "player_uuid_1",
  "playerName": "Alice",
  "type": "play_pair",
  "pair": {
    "id": "pair_1234567890",
    "cards": [
      { "id": "fish_1", "name": "Fish" },
      { "id": "fish_2", "name": "Fish" }
    ],
    "hasEffect": true,
    "effectText": "抽"
  },
  "description": "Alice 打出對子：Fish + Fish"
}
```

### 2.9 RoundResults 物件

```typescript
interface RoundResults {
  [playerId: string]: PlayerRoundResult
}

interface PlayerRoundResult {
  cardScore: number              // 卡片分數
  colorBonus: number             // 顏色加成
  roundTotal: number             // 本回合總分
}
```

**範例**:
```json
{
  "player_uuid_1": {
    "cardScore": 20,
    "colorBonus": 5,
    "roundTotal": 25
  },
  "player_uuid_2": {
    "cardScore": 18,
    "colorBonus": 0,
    "roundTotal": 0
  }
}
```

---

## 3. 安全規則

### 3.1 Firebase Realtime Database Rules

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "auth != null",

        "players": {
          "$playerId": {
            "hand": {
              ".read": "auth.uid == $playerId",
              ".write": "auth.uid == $playerId"
            },
            ".read": true,
            ".write": "auth.uid == $playerId || data.parent().child('hostId').val() == auth.uid"
          }
        },

        "gameState": {
          ".read": true,
          ".write": "auth != null"
        },

        "settings": {
          ".read": true,
          ".write": "data.parent().child('hostId').val() == auth.uid"
        }
      }
    }
  }
}
```

### 3.2 規則說明

| 路徑 | 讀取 | 寫入 | 說明 |
|-----|------|------|------|
| `/rooms/{roomId}` | ✅ 所有人 | ✅ 認證用戶 | 房間基本資料 |
| `/rooms/{roomId}/players/{playerId}/hand` | ✅ 僅自己 | ✅ 僅自己 | 手牌資料隱私保護 |
| `/rooms/{roomId}/players/{playerId}` | ✅ 所有人 | ✅ 自己或房主 | 玩家資料 |
| `/rooms/{roomId}/gameState` | ✅ 所有人 | ✅ 認證用戶 | 遊戲狀態 |
| `/rooms/{roomId}/settings` | ✅ 所有人 | ✅ 僅房主 | 房間設置 |

### 3.3 資料驗證規則

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".validate": "newData.hasChildren(['roomId', 'hostId', 'status'])",

        "roomId": {
          ".validate": "newData.isString() && newData.val().length == 6"
        },

        "status": {
          ".validate": "newData.isString() && (newData.val() == 'waiting' || newData.val() == 'playing' || newData.val() == 'finished')"
        },

        "settings": {
          "maxPlayers": {
            ".validate": "newData.isNumber() && newData.val() >= 2 && newData.val() <= 4"
          }
        }
      }
    }
  }
}
```

---

## 4. 資料流動

### 4.1 遊戲開始流程

```
1. 房主點擊「開始遊戲」
   ↓
2. 建立牌庫：createDeck()
   ↓
3. 發起始手牌：dealInitialHands()
   ↓
4. 更新 Firebase:
   - status: 'playing'
   - gameState: { ... }
   - players[].hand: [ ... ]
   ↓
5. Firebase 觸發監聽器
   ↓
6. 所有客戶端更新 UI
```

**資料變更**:
```javascript
// Before
{
  status: 'waiting',
  gameState: null
}

// After
{
  status: 'playing',
  startedAt: 1234567890,
  gameState: {
    deckCount: 62,
    discardLeft: [],
    discardRight: [],
    currentPlayerId: 'player_uuid_1',
    turnPhase: 'draw',
    // ...
  },
  players: {
    player_uuid_1: {
      // ...
      hand: [ ... ],  // 分配的手牌
      handCount: 0
    }
  }
}
```

### 4.2 抽牌流程

```
1. 玩家點擊牌庫
   ↓
2. 從牌庫抽取 1 張：drawFromDeck()
   ↓
3. 顯示抽到的卡片（本地狀態）
   ↓
4. 玩家選擇棄牌堆
   ↓
5. 更新 Firebase:
   - gameState.deckCount: -1
   - gameState.discardLeft/Right: +1 card
   - players[playerId].hand: +1 card
   - gameState.turnPhase: 'pair'
   ↓
6. Firebase 觸發監聽器
   ↓
7. 所有客戶端更新 UI
```

**資料變更**:
```javascript
// Before
{
  gameState: {
    deckCount: 62,
    discardLeft: [],
    turnPhase: 'draw'
  },
  players: {
    player_uuid_1: {
      hand: [],
      handCount: 0
    }
  }
}

// After
{
  gameState: {
    deckCount: 61,
    discardLeft: [ { id: 'shell_3', name: 'Shell', ... } ],
    turnPhase: 'pair',
    actionLog: [
      {
        timestamp: 1234567890,
        playerId: 'player_uuid_1',
        type: 'draw_card',
        card: { id: 'fish_1', name: 'Fish' }
      },
      ...previousLog
    ]
  },
  players: {
    player_uuid_1: {
      hand: [ { id: 'fish_1', name: 'Fish', ... } ],
      handCount: 1
    }
  }
}
```

### 4.3 配對流程

```
1. 玩家選擇 2 張卡片
   ↓
2. 驗證配對：isValidPair()
   ↓
3. 執行配對效果：executePairEffect()
   ↓
4. 更新 Firebase:
   - players[playerId].hand: -2 cards
   - players[playerId].playedPairs: +1 pair
   - gameState.pendingCardChoice: 效果卡片（如有）
   ↓
5. Firebase 觸發監聽器
   ↓
6. 所有客戶端更新 UI
   ↓
7. 如有效果，顯示對應模態框
```

**資料變更 - Fish 配對**:
```javascript
// Before
{
  players: {
    player_uuid_1: {
      hand: [
        { id: 'fish_1', name: 'Fish' },
        { id: 'fish_2', name: 'Fish' },
        { id: 'crab_1', name: 'Crab' }
      ],
      playedPairs: []
    }
  },
  gameState: {
    deckCount: 61,
    pendingCardChoice: null
  }
}

// After
{
  players: {
    player_uuid_1: {
      hand: [
        { id: 'crab_1', name: 'Crab' }
      ],
      playedPairs: [
        {
          id: 'pair_1234567890',
          cards: [
            { id: 'fish_1', name: 'Fish' },
            { id: 'fish_2', name: 'Fish' }
          ],
          hasEffect: true,
          effectText: '抽'
        }
      ]
    }
  },
  gameState: {
    deckCount: 60,
    pendingCardChoice: {
      playerId: 'player_uuid_1',
      cards: [ { id: 'shell_5', name: 'Shell' } ],
      type: 'draw_discard'
    },
    actionLog: [
      {
        timestamp: 1234567890,
        playerId: 'player_uuid_1',
        type: 'play_pair',
        pair: { ... }
      },
      ...
    ]
  }
}
```

### 4.4 宣告流程

```
1. 玩家點擊「結束配對」
   ↓
2. 進入宣告階段
   - turnPhase: 'declare'
   ↓
3. 顯示宣告模態框
   ↓
4. 玩家選擇 Stop 或 Last Chance
   ↓
5. 更新 Firebase:
   - gameState.declareMode: 'stop' | 'last_chance'
   - gameState.declaringPlayerId: playerId
   - gameState.declarationScore: currentScore
   - gameState.turnPhase: 'declare_showing'
   ↓
6. 顯示宣告畫面（3 秒）
   ↓
7. 進入回合結算：
   - gameState.turnPhase: 'round_end'
```

### 4.5 回合結算流程

```
1. 計算所有玩家分數
   ↓
2. 更新 Firebase:
   - gameState.roundResults: { ... }
   - players[].score: += roundScore
   - gameState.turnPhase: 'round_end'
   ↓
3. 顯示結算動畫（5 秒）
   ↓
4. 檢查勝利條件
   ↓
   4a. 有獲勝者 →
       - status: 'finished'
       - finishedAt: timestamp
       - 顯示獲勝畫面
   ↓
   4b. 無獲勝者 →
       - 重置遊戲狀態
       - currentPlayerId: 下一位玩家
       - turnPhase: 'draw'
       - roundNumber: +1
```

---

## 5. 索引與查詢

### 5.1 常見查詢

#### 取得房間資料
```javascript
const roomRef = ref(database, `rooms/${roomId}`)
const snapshot = await get(roomRef)
const roomData = snapshot.val()
```

#### 監聽房間變化
```javascript
const roomRef = ref(database, `rooms/${roomId}`)
const unsubscribe = onValue(roomRef, (snapshot) => {
  const roomData = snapshot.val()
  // 更新 UI
})
```

#### 更新玩家手牌
```javascript
const handRef = ref(database, `rooms/${roomId}/players/${playerId}/hand`)
await set(handRef, newHand)
```

#### 更新遊戲狀態（Transaction）
```javascript
const gameStateRef = ref(database, `rooms/${roomId}/gameState`)
await runTransaction(gameStateRef, (current) => {
  if (!current) return current

  return {
    ...current,
    turnPhase: 'pair',
    currentPlayerId: nextPlayerId
  }
})
```

### 5.2 批次更新

```javascript
const updates = {}
updates[`rooms/${roomId}/gameState/turnPhase`] = 'pair'
updates[`rooms/${roomId}/gameState/currentPlayerId`] = nextPlayerId
updates[`rooms/${roomId}/players/${playerId}/hand`] = newHand

await update(ref(database), updates)
```

### 5.3 效能優化

#### 限制監聽範圍
```javascript
// ❌ 監聽整個房間
onValue(ref(database, `rooms/${roomId}`), callback)

// ✅ 只監聽遊戲狀態
onValue(ref(database, `rooms/${roomId}/gameState`), callback)
```

#### 使用快照
```javascript
const snapshot = await get(ref(database, `rooms/${roomId}/gameState`))
const gameState = snapshot.val()
```

---

**文件結束**
