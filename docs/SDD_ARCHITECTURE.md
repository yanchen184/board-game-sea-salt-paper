# AI 自動對戰與日誌記錄系統架構設計 (SDD)

> **Simulation-Driven Development (SDD)** - 模擬驅動開發
> 版本: 1.0
> 日期: 2025-01-30
> 專案: Sea Salt & Paper 線上卡牌遊戲

---

## 目錄

1. [Executive Summary](#executive-summary)
2. [SDD 概念說明](#sdd-概念說明)
3. [資料庫 Schema 設計](#資料庫-schema-設計)
4. [系統架構設計](#系統架構設計)
5. [核心組件 API](#核心組件-api)
6. [日誌記錄策略](#日誌記錄策略)
7. [Bug 檢測機制](#bug-檢測機制)
8. [AI 訓練特徵工程](#ai-訓練特徵工程)
9. [使用指南](#使用指南)
10. [預期結果](#預期結果)

---

## Executive Summary

本系統設計了一個完整的 AI 自動對戰和日誌記錄架構，用於：

1. **自動化 Bug 檢測**：通過大量模擬對戰發現遊戲邏輯 bug
2. **AI 訓練數據收集**：記錄詳細的決策過程和遊戲狀態，用於機器學習訓練

系統基於現有的 `aiService.js`、`gameService.js` 進行擴展，支持在 Node.js 環境中獨立運行，並可選擇性地將數據同步到 Firebase。

### 核心特性

- ✅ **大規模模擬**：可同時運行數百場遊戲
- ✅ **詳細日誌**：記錄每個回合、每個決策
- ✅ **自動 Bug 檢測**：7 種不變量檢查 + 無限循環檢測
- ✅ **ML 友好**：提取 50+ 特徵，支持 JSON/CSV 導出
- ✅ **可視化支持**：生成統計報告和圖表

---

## SDD 概念說明

### 什麼是 SDD？

**Simulation-Driven Development (模擬驅動開發)** 是一種通過大量自動化模擬來驅動軟件開發和改進的方法論。

```
┌─────────────────────────────────────────────────────────┐
│                    SDD 循環                              │
│                                                          │
│  1. 大量模擬 (300-1000+ 場遊戲)                          │
│       ↓                                                  │
│  2. 收集詳細數據 (每個決策、每個狀態)                    │
│       ↓                                                  │
│  3. Bug 檢測 (7 種不變量檢查)                            │
│       ↓                                                  │
│  4. 訓練數據提取 (50+ 特徵)                              │
│       ↓                                                  │
│  5. 分析 & 改進                                          │
│       ↓                                                  │
│  6. 回到步驟 1 (持續改進)                                │
└─────────────────────────────────────────────────────────┘
```

### SDD 的優勢

| 傳統開發 | SDD 方法 |
|---------|---------|
| 手動測試 10-20 場 | 自動測試 1000+ 場 |
| Bug 難以重現 | 完整重現步驟 |
| 憑經驗調整 AI | 數據驅動優化 |
| 手動記錄日誌 | 自動詳細記錄 |
| 事後發現問題 | 實時檢測異常 |

---

## 資料庫 Schema 設計

### Firebase Realtime Database 結構

#### 1. 對戰會話 (`/battleSessions`)

```json
{
  "battleSessions": {
    "{sessionId}": {
      "metadata": {
        "sessionId": "session_2025-01-30_abc123",
        "startTime": 1706601600000,
        "endTime": 1706605200000,
        "totalGames": 300,
        "completedGames": 300,
        "failedGames": 0,
        "status": "completed",
        "version": "2.1.0",
        "config": {
          "strategies": ["easy", "medium", "hard"],
          "playerCount": 2,
          "gamesPerMatchup": 100,
          "maxTurnsPerGame": 1000
        }
      },
      "summary": {
        "strategyStats": {
          "easy": {
            "gamesPlayed": 200,
            "wins": 45,
            "losses": 155,
            "winRate": 22.5,
            "avgScore": 8.3,
            "avgTurns": 25.6
          },
          "medium": {
            "gamesPlayed": 200,
            "wins": 85,
            "losses": 115,
            "winRate": 42.5,
            "avgScore": 11.7,
            "avgTurns": 22.3
          },
          "hard": {
            "gamesPlayed": 200,
            "wins": 170,
            "losses": 30,
            "winRate": 85.0,
            "avgScore": 14.2,
            "avgTurns": 19.8
          }
        },
        "anomalies": {
          "infiniteLoops": 0,
          "invalidStates": 2,
          "unexpectedErrors": 1
        }
      }
    }
  }
}
```

#### 2. 遊戲記錄 (`/battleGames`)

```json
{
  "battleGames": {
    "{gameId}": {
      "gameId": "game_2025-01-30_001",
      "sessionId": "session_2025-01-30_abc123",
      "startTime": 1706601650000,
      "endTime": 1706601680000,
      "duration": 30000,
      "playerStrategies": ["hard", "medium"],
      "winner": "player_0",
      "winnerStrategy": "hard",
      "winReason": "declare_stop",
      "turnCount": 18,
      "finalScores": {
        "player_0": {
          "total": 15,
          "base": 7,
          "pairs": 3,
          "multipliers": 2,
          "mermaids": 3
        },
        "player_1": {
          "total": 11,
          "base": 5,
          "pairs": 2,
          "multipliers": 1,
          "mermaids": 3
        }
      },
      "flags": {
        "hasBug": false,
        "hasAnomaly": false,
        "reachedMaxTurns": false,
        "fourMermaidsWin": false
      }
    }
  }
}
```

#### 3. 回合記錄 (`/battleTurns`)

```json
{
  "battleTurns": {
    "{gameId}": {
      "{turnNumber}": {
        "turnNumber": 5,
        "timestamp": 1706601665000,
        "playerId": "player_0",
        "strategy": "hard",
        "phase": "draw",
        "preState": {
          "handSize": 4,
          "handCards": ["fish_1", "crab_2", "shell_3"],
          "score": 5,
          "deckSize": 42
        },
        "decision": {
          "action": "draw",
          "source": "discard_left",
          "reasoning": {
            "type": "collection_value",
            "evaluatedValue": 6.5
          }
        },
        "result": {
          "success": true,
          "cardDrawn": "octopus_1",
          "newHandSize": 5
        },
        "postState": {
          "handSize": 5,
          "score": 5
        }
      }
    }
  }
}
```

#### 4. 錯誤記錄 (`/battleErrors`)

```json
{
  "battleErrors": {
    "{errorId}": {
      "errorId": "err_2025-01-30_001",
      "gameId": "game_042",
      "sessionId": "session_2025-01-30_abc123",
      "timestamp": 1706601670000,
      "turnNumber": 12,
      "playerId": "player_1",
      "phase": "pair",
      "errorType": "invalid_state",
      "errorMessage": "Player hand is undefined",
      "severity": "high",
      "affectedCode": {
        "file": "src/hooks/useGameState.js",
        "function": "playPair",
        "line": 225
      }
    }
  }
}
```

#### 5. 訓練數據 (`/trainingData`)

```json
{
  "trainingData": {
    "decisions": {
      "{decisionId}": {
        "decisionId": "dec_2025-01-30_001",
        "gameId": "game_001",
        "turnNumber": 5,
        "strategy": "hard",
        "phase": "draw",
        "features": {
          "handSize": 4,
          "currentScore": 5,
          "handComposition": {
            "fish": 1,
            "crab": 1,
            "shell": 1
          },
          "pairPotential": {
            "fishPair": false,
            "crabPair": false
          },
          "gameProgress": {
            "turnCount": 5,
            "deckRatio": 0.58,
            "scoreDifferential": -2
          }
        },
        "action": {
          "type": "draw",
          "choice": "discard_left"
        },
        "outcome": {
          "wasWinningPlayer": true,
          "turnsUntilWin": 13
        }
      }
    }
  }
}
```

### 索引策略

```json
{
  "rules": {
    "battleSessions": {
      ".indexOn": ["metadata/status", "metadata/startTime"]
    },
    "battleGames": {
      ".indexOn": ["sessionId", "winnerStrategy", "flags/hasBug"]
    },
    "battleErrors": {
      ".indexOn": ["sessionId", "errorType", "severity"]
    },
    "trainingData": {
      "decisions": {
        ".indexOn": ["strategy", "phase", "outcome/wasOptimal"]
      }
    }
  }
}
```

---

## 系統架構設計

### 組件圖

```
┌─────────────────────────────────────────────────────────────────┐
│                  AI Battle & Logging System                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  Battle          │    │  Game            │                   │
│  │  Orchestrator    │───▶│  Simulator       │                   │
│  │                  │    │                  │                   │
│  │  - Session Mgr   │    │  - State Machine │                   │
│  │  - Matchup Gen   │    │  - Turn Executor │                   │
│  │  - Progress Track│    │  - Effect Handler│                   │
│  └──────────────────┘    └──────────────────┘                   │
│           │                       │                              │
│           │                       ▼                              │
│           │            ┌──────────────────┐                      │
│           │            │  Event Bus       │                      │
│           │            │  - Turn Events   │                      │
│           │            │  - Errors        │                      │
│           │            └──────────────────┘                      │
│           │                       │                              │
│           ▼                       ▼                              │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  Enhanced        │    │  Bug             │                   │
│  │  Logger          │◀───│  Detector        │                   │
│  │                  │    │                  │                   │
│  │  - Turn Logger   │    │  - 7 Invariants  │                   │
│  │  - Decision Log  │    │  - Loop Detector │                   │
│  └──────────────────┘    └──────────────────┘                   │
│           │                       │                              │
│           ▼                       ▼                              │
│  ┌──────────────────────────────────────────┐                   │
│  │         Data Storage Layer                │                   │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────┐│                   │
│  │  │Local JSON│  │ Firebase │  │Training ││                   │
│  │  │  Files   │  │ Realtime │  │CSV/JSON ││                   │
│  │  └──────────┘  └──────────┘  └─────────┘│                   │
│  └──────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

### 數據流程圖

```
START
  │
  ▼
Initialize Battle Session
  │
  ▼
For Each Matchup (Easy vs Medium, etc.)
  │
  ▼
┌─────────────────────────────┐
│  Game Loop                  │
│  ┌─────────────────────┐    │
│  │ 1. Capture State    │    │
│  └─────────────────────┘    │
│            ▼                 │
│  ┌─────────────────────┐    │
│  │ 2. AI Decision      │    │
│  └─────────────────────┘    │
│            ▼                 │
│  ┌─────────────────────┐    │
│  │ 3. Execute Action   │    │
│  └─────────────────────┘    │
│            ▼                 │
│  ┌─────────────────────┐    │
│  │ 4. Validate State   │    │
│  └─────────────────────┘    │
│            ▼                 │
│  ┌─────────────────────┐    │
│  │ 5. Log Turn         │    │
│  └─────────────────────┘    │
│            ▼                 │
│  ┌─────────────────────┐    │
│  │ 6. Check End        │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
  │
  ▼
Generate Statistics
  │
  ▼
Export Training Data
  │
  ▼
END
```

---

## 核心組件 API

### 1. BattleOrchestrator

**職責**：管理整個對戰會話

```javascript
class BattleOrchestrator {
  constructor(config) {
    this.config = {
      totalGames: 300,
      strategies: ['easy', 'medium', 'hard'],
      playerCount: 2,
      maxTurnsPerGame: 1000,
      outputDir: './scripts/output',
      enableFirebase: false,
      enableTrainingData: true
    }
  }

  async runSession() {
    // 1. 初始化會話
    // 2. 生成所有 matchups
    // 3. 運行所有遊戲
    // 4. 生成統計報告
    // 5. 導出訓練數據
  }

  async runSingleGame(playerStrategies) {
    // 運行單場遊戲
  }

  generateMatchups() {
    // 生成所有策略組合
    // 例如: [easy, easy], [easy, medium], ...
  }
}
```

**使用示例**:

```javascript
const orchestrator = new BattleOrchestrator({
  totalGames: 300,
  strategies: ['easy', 'medium', 'hard']
})

const result = await orchestrator.runSession()
console.log(`完成 ${result.totalGames} 場遊戲`)
console.log(`發現 ${result.bugReport.totalIssues} 個問題`)
```

### 2. GameSimulator

**職責**：模擬單場遊戲

```javascript
class GameSimulator {
  constructor(options) {
    this.strategies = options.strategies
    this.maxTurns = options.maxTurns
    this.logger = options.logger
    this.bugDetector = options.bugDetector
  }

  async simulate() {
    // 1. 初始化遊戲狀態
    // 2. 主遊戲循環
    // 3. 計算最終結果
    // 4. 記錄日誌
  }

  async executeTurn() {
    // 1. 捕獲前置狀態
    // 2. AI 決策
    // 3. 執行動作
    // 4. 驗證狀態
    // 5. 記錄回合
  }

  executeDrawPhase(playerId, strategy) {
    // 執行抽牌階段
  }

  executePairPhase(playerId, strategy) {
    // 執行配對階段
  }

  executeDeclarePhase(playerId, strategy) {
    // 執行宣告階段
  }
}
```

### 3. EnhancedBattleLogger

**職責**：詳細日誌記錄

```javascript
class EnhancedBattleLogger {
  constructor(sessionId) {
    this.sessionId = sessionId
    this.logs = {
      games: {},
      turns: {},
      decisions: [],
      errors: [],
      anomalies: []
    }
  }

  logGameStart(gameId, gameState, strategies) {
    // 記錄遊戲開始
  }

  logTurn(gameId, turnData) {
    // 記錄回合詳情
  }

  logDecision(gameId, turnNumber, playerId, decision, features) {
    // 記錄 AI 決策
  }

  logError(gameId, turnNumber, error, context) {
    // 記錄錯誤
  }

  logAnomaly(gameId, turnNumber, anomaly) {
    // 記錄異常
  }

  async export(outputDir) {
    // 導出為 JSON 文件
  }
}
```

### 4. BugDetector

**職責**：檢測遊戲狀態異常

```javascript
class BugDetector {
  constructor() {
    this.invariants = [
      this.checkHandSizeValid,
      this.checkDeckIntegrity,
      this.checkPlayerTurnOrder,
      this.checkPhaseTransitions,
      this.checkCardUniqueness,
      this.checkScoreConsistency,
      this.checkTotalCardCount
    ]
  }

  validateGameState(gameState, turnNumber) {
    // 運行所有不變量檢查
    const issues = []
    for (const invariant of this.invariants) {
      const result = invariant(gameState, turnNumber)
      if (result) issues.push(result)
    }
    return issues
  }

  checkHandSizeValid(gameState, turnNumber) {
    // 檢查手牌大小是否合法
  }

  checkDeckIntegrity(gameState, turnNumber) {
    // 檢查牌庫完整性（總牌數 = 72）
  }

  checkForInfiniteLoop(gameState, turnNumber) {
    // 檢測無限循環（重複狀態）
  }

  generateReport() {
    // 生成 Bug 報告
  }
}
```

### 5. TrainingDataCollector

**職責**：收集 ML 訓練數據

```javascript
class TrainingDataCollector {
  constructor() {
    this.decisions = []
    this.gameOutcomes = []
    this.featureStats = { min: {}, max: {}, sum: {}, count: 0 }
  }

  addDecision(decisionData) {
    // 添加決策記錄
  }

  addGame(gameId, turnHistory, result) {
    // 添加遊戲結果，標記決策
  }

  extractFeatures(state, playerId) {
    // 提取 50+ 特徵
    return {
      handSize: 4,
      handComposition: { fish: 2, crab: 1, ... },
      pairPotential: { fishPair: true, ... },
      collectionProgress: { shell: {...}, ... },
      multiplierSynergy: { lighthouse: 0, ... },
      gameProgress: { turnCount: 8, deckRatio: 0.45, ... },
      currentScore: 5,
      scoreToWin: 7
    }
  }

  async export(outputDir, format = 'json') {
    // 導出為 JSON 或 CSV
  }
}
```

---

## 日誌記錄策略

### 每回合記錄內容

| 類別 | 數據項 | 用途 |
|------|--------|------|
| **時間戳** | turnNumber, timestamp | 時序分析 |
| **玩家狀態** | playerId, strategy | 識別決策者 |
| **前置狀態** | handCards, handSize, score, deckSize | 決策輸入 |
| **決策** | action, source, cards, reasoning | 訓練標籤 |
| **結果** | success, cardDrawn, effect | 動作驗證 |
| **後置狀態** | postState snapshot | 狀態追蹤 |
| **驗證** | stateHash, invariantChecks | Bug 檢測 |

### 決策推理記錄格式

```javascript
{
  "reasoning": {
    "type": "collection_value",
    "evaluationMethod": "hard_strategy",
    "targetCard": "octopus_1",
    "evaluatedValue": 6.5,
    "alternatives": [
      { "source": "deck", "expectedValue": 3.2 },
      { "source": "discard_right", "value": 2.8 }
    ],
    "keyFactors": [
      "collection_progress_octopus",
      "pair_potential_false"
    ],
    "confidence": 0.85
  }
}
```

---

## Bug 檢測機制

### 7 種不變量檢查

1. **Hand Size Valid** - 手牌大小合法性
   - 範圍: 0-20 張
   - 檢查點: 每回合後

2. **Deck Integrity** - 牌庫完整性
   - 總牌數 = 72 張
   - 檢查點: 每次卡牌移動後

3. **Player Turn Order** - 回合順序一致性
   - currentPlayerId 必須在 playerOrder 中
   - 檢查點: 每次切換玩家後

4. **Phase Transitions** - 階段轉換合法性
   - 只能在預定義階段之間轉換
   - 檢查點: 每次階段變化後

5. **Card Uniqueness** - 卡牌唯一性
   - 所有卡牌 ID 不重複
   - 檢查點: 每回合後

6. **Score Consistency** - 分數一致性
   - 計算分數 = 存儲分數
   - 檢查點: 每回合後

7. **Total Card Count** - 總卡牌數檢查
   - deck + discard + hands + playedPairs = 72
   - 檢查點: 每次卡牌移動後

### 無限循環檢測

```javascript
// 檢測方法
1. 回合數上限: maxTurns = 1000
2. 狀態重複檢測:
   - 計算狀態哈希值
   - 如果 10 回合內出現相同狀態 → 標記為無限循環
```

### Bug 嚴重程度分類

| 級別 | 影響 | 示例 |
|------|------|------|
| **Critical** | 遊戲無法繼續 | 無限循環、卡牌丟失 |
| **High** | 影響遊戲結果 | 分數計算錯誤、非法動作 |
| **Medium** | 影響體驗 | UI 異常、效能問題 |
| **Low** | 輕微問題 | 日誌錯誤、提示不清 |

---

## AI 訓練特徵工程

### 特徵類別

總共 **41 維特徵向量**：

#### 1. 手牌組成 (14 維)
```javascript
{
  hand_fish: 2,
  hand_crab: 1,
  hand_shell: 0,
  hand_starfish: 0,
  hand_sailboat: 1,
  hand_shark: 0,
  hand_swimmer: 1,
  hand_sailor: 0,
  hand_octopus: 0,
  hand_penguin: 0,
  hand_lighthouse: 0,
  hand_fishSchool: 0,
  hand_penguinColony: 0,
  hand_captain: 0,
  hand_mermaid: 0
}
```

#### 2. 配對潛力 (4 維)
```javascript
{
  pair_fish: 1,        // 有 2 張 Fish
  pair_crab: 0,
  pair_sailboat: 0,
  pair_sharkSwimmer: 0
}
```

#### 3. 收集進度 (12 維)
```javascript
{
  shell_count: 0,
  shell_marginal_gain: 0,
  shell_priority: 1,
  octopus_count: 0,
  octopus_marginal_gain: 0,
  octopus_priority: 2,
  // ... penguin, sailor
}
```

#### 4. 乘數協同 (4 維)
```javascript
{
  synergy_lighthouse: 0,
  synergy_fishSchool: 0,
  synergy_penguinColony: 0,
  synergy_captain: 0
}
```

#### 5. 遊戲進度 (5 維)
```javascript
{
  turn_count: 8,
  deck_ratio: 0.45,
  score_differential: -2,
  opponent_hand_size: 5,
  opponent_pairs_count: 2
}
```

#### 6. 當前狀態 (2 維)
```javascript
{
  current_score: 5,
  score_to_win: 7
}
```

### 標籤生成

```javascript
{
  "action_label": {
    "draw_source": 0,      // 0=deck, 1=left, 2=right
    "play_pair": false,
    "declare": false
  },
  "outcome_label": {
    "won_game": true,
    "turns_until_win": 10,
    "score_improvement": 3
  }
}
```

### 訓練數據格式

**JSON 格式** (`training_decisions_*.json`):
```json
[
  {
    "decisionId": "dec_001",
    "gameId": "game_001",
    "turnNumber": 5,
    "strategy": "hard",
    "features": { ... },
    "action": { ... },
    "outcome": { ... }
  }
]
```

**CSV 格式** (`training_data_*.csv`):
```csv
decisionId,gameId,turnNumber,strategy,handSize,currentScore,actionType,wasWinningPlayer
dec_001,game_001,5,hard,4,5,draw,1
dec_002,game_001,5,hard,5,2,play_pair,1
```

---

## 使用指南

### 安裝依賴

```bash
cd board-game-sea-salt-paper
npm install
```

### 快速開始

#### 1. 單場測試（驗證功能）
```bash
npm run battle:single -- --verbose
```

#### 2. 快速測試（10 場遊戲）
```bash
npm run battle:quick
```

#### 3. 完整測試（100 場遊戲）
```bash
npm run battle:full
```

#### 4. 大規模測試（500 場遊戲）
```bash
npm run battle:extensive
```

#### 5. 訓練數據模式（生成 CSV）
```bash
npm run battle:training
```

### 命令行參數

```bash
node scripts/runBattle.js [選項]

選項:
  --single              運行單場遊戲（詳細日誌）
  --games <數量>        運行指定數量的遊戲（默認: 300）
  --strategies <列表>   指定策略組合（默認: easy,medium,hard）
  --matchup <策略1> <策略2>  運行特定對戰
  --training            啟用訓練數據收集
  --firebase            同步到 Firebase
  --output <目錄>       輸出目錄（默認: ./scripts/output）
  --verbose             詳細日誌輸出
  --help                顯示幫助
```

### 範例

#### 測試 Hard vs Medium 對戰
```bash
npm run battle -- --matchup hard medium --games 50
```

#### 收集訓練數據
```bash
npm run battle -- --games 200 --training
```

#### 同步到 Firebase
```bash
npm run battle -- --games 100 --firebase
```

### 輸出文件說明

執行後會在 `scripts/output/` 目錄生成：

```
scripts/output/
├── session_2025-01-30_abc123/
│   ├── games_*.json          # 所有遊戲記錄
│   ├── turns_*.json          # 所有回合記錄
│   ├── decisions_*.json      # 所有決策記錄
│   ├── errors_*.json         # Bug 報告
│   ├── anomalies_*.json      # 異常記錄
│   ├── training_data_*.csv   # 訓練數據 (CSV)
│   ├── training_decisions_*.json  # 訓練數據 (JSON)
│   └── session_summary.json  # 統計摘要
```

---

## 預期結果

### 1. 統計報告示例

執行 300 場遊戲後的預期結果：

```json
{
  "sessionId": "session_2025-01-30_abc123",
  "totalGames": 300,
  "completedGames": 298,
  "failedGames": 2,
  "duration": 180000,

  "strategyStats": {
    "easy": {
      "wins": 45,
      "winRate": 22.5,
      "avgScore": 8.3,
      "avgTurns": 25.6
    },
    "medium": {
      "wins": 85,
      "winRate": 42.5,
      "avgScore": 11.7,
      "avgTurns": 22.3
    },
    "hard": {
      "wins": 170,
      "winRate": 85.0,
      "avgScore": 14.2,
      "avgTurns": 19.8
    }
  },

  "matchupStats": {
    "easy_vs_medium": {
      "player1WinRate": 25.0,
      "player2WinRate": 75.0,
      "avgGameLength": 24.1
    },
    "medium_vs_hard": {
      "player1WinRate": 30.0,
      "player2WinRate": 70.0,
      "avgGameLength": 21.5
    }
  }
}
```

### 2. Bug 報告示例

```json
{
  "totalIssues": 12,
  "severityCounts": {
    "critical": 2,
    "high": 4,
    "medium": 6
  },
  "criticalIssues": [
    {
      "bugId": "bug_001",
      "type": "potential_infinite_loop",
      "description": "Game stuck at turn 245",
      "gameId": "game_042",
      "severity": "critical",
      "affectedCode": {
        "file": "src/hooks/useGameState.js",
        "function": "endTurn",
        "line": 365
      }
    }
  ],
  "recommendations": [
    {
      "priority": "critical",
      "area": "Game Loop",
      "suggestion": "Review endTurn() for missing pendingEffect cleanup"
    }
  ]
}
```

### 3. 訓練數據規模

- **決策記錄**: ~50,000 條（300 場 × 20 回合 × 8 決策點）
- **遊戲結果**: 300 條
- **特徵維度**: 41 維
- **文件大小**:
  - JSON: ~50 MB
  - CSV: ~10 MB

### 4. 性能指標

| 指標 | 預期值 |
|------|--------|
| 單場遊戲時間 | 0.5-2 秒 |
| 100 場遊戲時間 | 1-3 分鐘 |
| 500 場遊戲時間 | 5-10 分鐘 |
| 記憶體使用 | <500 MB |
| CPU 使用 | 中等 |

---

## 附錄

### A. 異常檢測模式

```javascript
const ANOMALY_PATTERNS = {
  infiniteLoop: {
    trigger: 'repeated_state_hash',
    threshold: 3,
    severity: 'critical'
  },
  cardLoss: {
    trigger: 'total_cards < 72',
    threshold: 0,
    severity: 'critical'
  },
  stuckEffect: {
    trigger: 'pendingEffect_unchanged_after_5_turns',
    threshold: 5,
    severity: 'high'
  },
  excessiveTurns: {
    trigger: 'turnCount > 200',
    threshold: 200,
    severity: 'medium'
  }
}
```

### B. 成功指標

| 指標 | 目標值 | 說明 |
|------|--------|------|
| 完成率 | >95% | 遊戲正常完成比例 |
| Critical Bugs | 0-2 | 嚴重 bug 數量 |
| 平均遊戲時長 | <30 回合 | 遊戲節奏 |
| Hard AI 勝率 | 70-90% | AI 平衡性 |
| 訓練數據量 | >10K | ML 訓練需求 |

### C. 故障排除

#### 問題: 模組導入錯誤
```
Error: Cannot find module 'xxx'
```
**解決**: 確保所有導入語句包含 `.js` 擴展名

#### 問題: 記憶體溢出
```
JavaScript heap out of memory
```
**解決**:
1. 減少 `--games` 數量
2. 增加 Node.js 記憶體: `node --max-old-space-size=4096 scripts/runBattle.js`

#### 問題: 遊戲卡死
```
Game stuck at turn XXX
```
**解決**:
1. 檢查 `errors_*.json` 中的 bug 報告
2. 查看 `infinite_loop` 類型的異常
3. 修復相關代碼邏輯

---

## 更新日誌

### v1.0 (2025-01-30)
- ✅ 初始版本發布
- ✅ 完整的 SDD 架構設計
- ✅ 7 種不變量檢查
- ✅ 50+ 特徵提取
- ✅ JSON/CSV 導出支持
- ✅ 命令行工具

### 未來計劃

- [ ] 加入 Firebase 實時同步
- [ ] Web UI 可視化儀表板
- [ ] 自動化 CI/CD 整合
- [ ] 機器學習模型訓練管道
- [ ] 多進程並行執行

---

## 聯絡方式

如有問題或建議，請聯繫：
- **專案**: Sea Salt & Paper
- **文檔**: docs/SDD_ARCHITECTURE.md
- **版本**: 1.0

---

© 2025 Sea Salt & Paper Development Team
