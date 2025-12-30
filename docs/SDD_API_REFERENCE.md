# SDD 系統 API 參考文檔

> 完整的 API 函數說明和使用範例

---

## 目錄

1. [BattleOrchestrator](#battleorchestrator)
2. [GameSimulator](#gamesimulator)
3. [EnhancedBattleLogger](#enhancedbattlelogger)
4. [BugDetector](#bugdetector)
5. [TrainingDataCollector](#trainingdatacollector)
6. [工具函數](#工具函數)

---

## BattleOrchestrator

**文件**: `scripts/battleOrchestrator.js`

**職責**: 管理整個對戰會話，協調所有組件

### Constructor

```javascript
new BattleOrchestrator(config)
```

**參數**:
```javascript
{
  totalGames: number,           // 總遊戲數（默認: 300）
  strategies: string[],         // AI 策略列表（默認: ['easy', 'medium', 'hard']）
  playerCount: number,          // 玩家數量（默認: 2）
  maxTurnsPerGame: number,      // 每場遊戲最大回合數（默認: 1000）
  outputDir: string,            // 輸出目錄（默認: './scripts/output'）
  enableFirebase: boolean,      // 是否啟用 Firebase（默認: false）
  enableTrainingData: boolean,  // 是否收集訓練數據（默認: true）
  enableBugDetection: boolean   // 是否啟用 Bug 檢測（默認: true）
}
```

**示例**:
```javascript
const orchestrator = new BattleOrchestrator({
  totalGames: 100,
  strategies: ['medium', 'hard'],
  enableTrainingData: true
})
```

### Methods

#### runSession()

運行完整的對戰會話

```javascript
async runSession(): Promise<SessionResult>
```

**返回**:
```javascript
{
  sessionId: string,
  duration: number,              // 毫秒
  totalGames: number,
  completedGames: number,
  failedGames: number,
  stats: {
    strategyStats: {...},
    matchupStats: {...}
  },
  bugReport: {
    totalIssues: number,
    criticalIssues: Array
  },
  trainingDataPath: string       // 如果啟用
}
```

**示例**:
```javascript
const result = await orchestrator.runSession()
console.log(`完成 ${result.completedGames}/${result.totalGames} 場遊戲`)
console.log(`發現 ${result.bugReport.totalIssues} 個問題`)
```

#### runSingleGame()

運行單場遊戲

```javascript
async runSingleGame(playerStrategies: string[]): Promise<GameResult>
```

**參數**:
- `playerStrategies`: 玩家策略陣列，例如 `['hard', 'medium']`

**返回**:
```javascript
{
  gameId: string,
  winner: string,                // playerId
  winnerStrategy: string,
  winReason: string,             // 'declare_stop', 'declare_last_chance', '4_mermaids'
  turnCount: number,
  duration: number,
  finalScores: Object,
  hasBug: boolean,
  hasAnomaly: boolean
}
```

**示例**:
```javascript
const result = await orchestrator.runSingleGame(['hard', 'medium'])
console.log(`Winner: ${result.winnerStrategy} with ${result.finalScores[result.winner]} points`)
```

#### generateMatchups()

生成所有策略組合

```javascript
generateMatchups(): string[][]
```

**返回**: 二維陣列，每個元素是一對策略

**示例**:
```javascript
const matchups = orchestrator.generateMatchups()
// [['easy', 'easy'], ['easy', 'medium'], ['easy', 'hard'], ...]
```

---

## GameSimulator

**文件**: `scripts/gameSimulator.js`

**職責**: 模擬單場完整遊戲

### Constructor

```javascript
new GameSimulator(options)
```

**參數**:
```javascript
{
  strategies: string[],         // 玩家策略，例如 ['hard', 'medium']
  maxTurns: number,             // 最大回合數（默認: 1000）
  logger: EnhancedBattleLogger, // 日誌記錄器
  bugDetector: BugDetector,     // Bug 檢測器
  trainingCollector: TrainingDataCollector | null
}
```

### Methods

#### simulate()

運行完整遊戲模擬

```javascript
async simulate(): Promise<GameResult>
```

**流程**:
1. 初始化遊戲狀態
2. 主遊戲循環
3. 計算最終結果
4. 記錄日誌

**示例**:
```javascript
const simulator = new GameSimulator({
  strategies: ['hard', 'medium'],
  maxTurns: 1000,
  logger: battleLogger,
  bugDetector: bugDetector
})

const result = await simulator.simulate()
```

#### executeTurn()

執行單個回合

```javascript
async executeTurn(): Promise<void>
```

**內部流程**:
1. 捕獲前置狀態
2. 執行抽牌階段
3. 執行配對階段
4. 執行宣告階段
5. 驗證狀態
6. 記錄回合

#### captureState()

捕獲當前遊戲狀態快照

```javascript
captureState(): GameStateSnapshot
```

**返回**:
```javascript
{
  timestamp: number,
  turnNumber: number,
  currentPlayerId: string,
  turnPhase: string,
  handCards: string[],          // 卡牌 ID
  handSize: number,
  playedPairsCount: number,
  score: number,
  deckSize: number,
  discardLeftSize: number,
  discardRightSize: number
}
```

#### extractFeatures()

提取 ML 特徵向量（41 維）

```javascript
extractFeatures(state: GameStateSnapshot, playerId: string): FeatureVector
```

**返回**:
```javascript
{
  // 手牌組成 (14 維)
  handSize: number,
  handComposition: {
    fish: number,
    crab: number,
    // ... 其他卡片
  },
  // 配對潛力 (4 維)
  pairPotential: {
    fishPair: boolean,
    crabPair: boolean,
    sailboatPair: boolean,
    sharkSwimmerPair: boolean
  },
  // 收集進度 (12 維)
  collectionProgress: {
    shell: { count, marginalGain, priority },
    octopus: { count, marginalGain, priority },
    // ...
  },
  // 乘數協同 (4 維)
  multiplierSynergy: {
    lighthouse: number,
    fishSchool: number,
    // ...
  },
  // 遊戲進度 (5 維)
  gameProgress: {
    turnCount: number,
    deckRatio: number,
    scoreDifferential: number,
    opponentHandSizes: number[],
    opponentPairsCounts: number[]
  },
  // 當前狀態 (2 維)
  currentScore: number,
  scoreToWin: number
}
```

---

## EnhancedBattleLogger

**文件**: `scripts/utils/enhancedBattleLogger.js`

**職責**: 詳細日誌記錄

### Constructor

```javascript
new EnhancedBattleLogger(sessionId: string)
```

### Methods

#### logGameStart()

記錄遊戲開始

```javascript
logGameStart(gameId: string, gameState: GameState, strategies: string[]): void
```

**示例**:
```javascript
logger.logGameStart('game_001', gameState, ['hard', 'medium'])
```

#### logTurn()

記錄回合詳情

```javascript
logTurn(gameId: string, turnData: TurnData): void
```

**TurnData 結構**:
```javascript
{
  turnNumber: number,
  phase: string,
  playerId: string,
  preState: GameStateSnapshot,
  decision: {
    action: string,
    source: string,
    cards: Card[],
    reasoning: Object
  },
  result: {
    success: boolean,
    cardDrawn: Card,
    effect: string
  },
  postState: GameStateSnapshot
}
```

#### logDecision()

記錄 AI 決策

```javascript
logDecision(
  gameId: string,
  turnNumber: number,
  playerId: string,
  phase: string,
  decision: Decision,
  features: FeatureVector
): void
```

#### logError()

記錄錯誤

```javascript
logError(
  gameId: string,
  turnNumber: number,
  error: Error,
  context?: Object
): void
```

**Context 示例**:
```javascript
{
  phase: 'pair',
  playerId: 'player_0',
  action: 'play_pair',
  gameState: {...}
}
```

#### logAnomaly()

記錄異常

```javascript
logAnomaly(
  gameId: string,
  turnNumber: number,
  anomaly: Anomaly
): void
```

**Anomaly 結構**:
```javascript
{
  type: string,                  // 'invalid_hand_size', 'deck_integrity', etc.
  description: string,
  severity: string,              // 'critical', 'high', 'medium', 'low'
  expected: any,
  actual: any,
  stateSnapshot: Object
}
```

#### export()

導出日誌到文件

```javascript
async export(outputDir: string): Promise<void>
```

**生成文件**:
- `games_{sessionId}.json`
- `turns_{sessionId}.json`
- `decisions_{sessionId}.json`
- `errors_{sessionId}.json`
- `anomalies_{sessionId}.json`

**示例**:
```javascript
await logger.export('./scripts/output/session_xxx')
```

#### getStats()

獲取統計摘要

```javascript
getStats(): Stats
```

**返回**:
```javascript
{
  totalGames: number,
  totalTurns: number,
  totalDecisions: number,
  totalErrors: number,
  totalAnomalies: number,
  avgGameDuration: number,
  avgTurnsPerGame: number
}
```

---

## BugDetector

**文件**: `scripts/utils/bugDetector.js`

**職責**: 檢測遊戲狀態異常和 Bug

### Constructor

```javascript
new BugDetector()
```

### Methods

#### validateGameState()

運行所有不變量檢查

```javascript
validateGameState(gameState: GameState, turnNumber: number): Anomaly[]
```

**返回**: 檢測到的異常陣列（空陣列表示無異常）

**示例**:
```javascript
const issues = bugDetector.validateGameState(gameState, 15)
if (issues.length > 0) {
  console.log(`發現 ${issues.length} 個問題`)
  issues.forEach(issue => {
    console.log(`- ${issue.type}: ${issue.description}`)
  })
}
```

#### 不變量檢查函數

##### checkHandSizeValid()

檢查手牌大小合法性

```javascript
checkHandSizeValid(gameState: GameState, turnNumber: number): Anomaly | null
```

**規則**:
- 手牌大小應在 0-20 之間
- 遊戲進行中不應為 0（除非 round_end）

##### checkDeckIntegrity()

檢查牌庫完整性

```javascript
checkDeckIntegrity(gameState: GameState, turnNumber: number): Anomaly | null
```

**規則**:
- deck + discards + hands + playedPairs = 72 張

##### checkPlayerTurnOrder()

檢查回合順序一致性

```javascript
checkPlayerTurnOrder(gameState: GameState, turnNumber: number): Anomaly | null
```

**規則**:
- currentPlayerId 必須在 playerOrder 中

##### checkPhaseTransitions()

檢查階段轉換合法性

```javascript
checkPhaseTransitions(gameState: GameState, turnNumber: number): Anomaly | null
```

**合法階段**:
- `draw`
- `choosing_card`
- `pair`
- `declare`
- `declare_showing`
- `round_end`

##### checkCardUniqueness()

檢查卡牌唯一性

```javascript
checkCardUniqueness(gameState: GameState, turnNumber: number): Anomaly | null
```

**規則**:
- 所有卡牌 ID 不重複

##### checkScoreConsistency()

檢查分數一致性

```javascript
checkScoreConsistency(gameState: GameState, turnNumber: number): Anomaly | null
```

**規則**:
- 計算分數 = 存儲分數（誤差 ≤ 1）

##### checkTotalCardCount()

檢查總卡牌數

```javascript
checkTotalCardCount(gameState: GameState, turnNumber: number): Anomaly | null
```

**規則**:
- 總卡牌數 = 72

#### checkForInfiniteLoop()

檢測無限循環

```javascript
checkForInfiniteLoop(gameState: GameState, turnNumber: number): Anomaly | null
```

**檢測方法**:
1. 計算狀態哈希值
2. 如果 10 回合內出現相同狀態 → 標記為無限循環

**示例**:
```javascript
const loopIssue = bugDetector.checkForInfiniteLoop(gameState, 245)
if (loopIssue) {
  console.log(`無限循環檢測: ${loopIssue.description}`)
}
```

#### generateReport()

生成完整 Bug 報告

```javascript
generateReport(): BugReport
```

**返回**:
```javascript
{
  totalIssues: number,
  severityCounts: {
    critical: number,
    high: number,
    medium: number,
    low: number
  },
  issuesByType: {
    [type: string]: Anomaly[]
  },
  criticalIssues: Anomaly[],
  recommendations: Recommendation[]
}
```

**Recommendation 結構**:
```javascript
{
  priority: string,              // 'critical', 'high', 'medium', 'low'
  area: string,                  // 'Game Loop', 'Card Management', etc.
  suggestion: string,
  affectedFiles: string[]
}
```

**示例**:
```javascript
const report = bugDetector.generateReport()
console.log(`總問題數: ${report.totalIssues}`)
console.log(`Critical: ${report.severityCounts.critical}`)

report.recommendations.forEach(rec => {
  console.log(`[${rec.priority}] ${rec.area}: ${rec.suggestion}`)
})
```

---

## TrainingDataCollector

**文件**: `scripts/utils/trainingDataCollector.js`

**職責**: 收集 ML 訓練數據

### Constructor

```javascript
new TrainingDataCollector()
```

### Methods

#### addDecision()

添加決策記錄

```javascript
addDecision(decisionData: DecisionData): void
```

**DecisionData 結構**:
```javascript
{
  gameId: string,
  turnNumber: number,
  playerId: string,
  strategy: string,
  phase: string,
  features: FeatureVector,       // 41 維特徵
  action: {
    type: string,
    choice: string
  },
  outcome: {
    immediateScoreChange: number,
    turnEnded: boolean,
    gameWon: boolean
  }
}
```

**示例**:
```javascript
collector.addDecision({
  gameId: 'game_001',
  turnNumber: 5,
  playerId: 'player_0',
  strategy: 'hard',
  phase: 'draw',
  features: extractedFeatures,
  action: { type: 'draw', choice: 'discard_left' },
  outcome: { immediateScoreChange: 0, turnEnded: false, gameWon: false }
})
```

#### addGame()

添加遊戲結果並標記決策

```javascript
addGame(
  gameId: string,
  turnHistory: TurnData[],
  result: GameResult
): void
```

**功能**:
- 為該遊戲的所有決策添加結果標籤
- 標記獲勝/失敗決策
- 計算 `turnsUntilWin`

**示例**:
```javascript
collector.addGame('game_001', turnHistory, {
  winner: 'player_0',
  winnerStrategy: 'hard',
  turnCount: 18,
  finalScores: {...}
})
```

#### export()

導出訓練數據

```javascript
async export(outputDir: string, format?: string): Promise<void>
```

**參數**:
- `outputDir`: 輸出目錄
- `format`: 'json' | 'csv' | 'both'（默認: 'json'）

**生成文件**:
- `training_decisions_{timestamp}.json`
- `training_outcomes_{timestamp}.json`
- `feature_stats_{timestamp}.json`
- `training_data_{timestamp}.csv`（如果 format = 'csv' 或 'both'）

**示例**:
```javascript
await collector.export('./scripts/output/session_xxx', 'both')
```

#### getStats()

獲取特徵統計

```javascript
getStats(): FeatureStats
```

**返回**:
```javascript
{
  min: { [featureName: string]: number },
  max: { [featureName: string]: number },
  avg: { [featureName: string]: number },
  count: number
}
```

**用途**: 用於特徵歸一化

**示例**:
```javascript
const stats = collector.getStats()
console.log(`收集了 ${stats.count} 條決策記錄`)
console.log(`handSize 範圍: ${stats.min.handSize} - ${stats.max.handSize}`)
console.log(`handSize 平均: ${stats.avg.handSize}`)
```

---

## 工具函數

### computeStateHash()

計算遊戲狀態哈希值（用於循環檢測）

```javascript
computeStateHash(gameState: GameState): string
```

**示例**:
```javascript
const hash = computeStateHash(gameState)
// 返回: "a3f5c7d9"
```

### formatDuration()

格式化時間

```javascript
formatDuration(milliseconds: number): string
```

**示例**:
```javascript
formatDuration(125000)  // "2m 5s"
formatDuration(3500)    // "3.5s"
```

### generateSessionId()

生成唯一會話 ID

```javascript
generateSessionId(): string
```

**格式**: `session_YYYY-MM-DD_HHmmss_random`

**示例**:
```javascript
const sessionId = generateSessionId()
// "session_2025-01-30_143025_abc123"
```

### generateGameId()

生成唯一遊戲 ID

```javascript
generateGameId(sessionId: string, gameNumber: number): string
```

**示例**:
```javascript
const gameId = generateGameId('session_xxx', 42)
// "game_session_xxx_042"
```

---

## 類型定義

### GameState

```typescript
interface GameState {
  deck: Card[]
  deckCount: number
  discardLeft: Card[]
  discardRight: Card[]
  currentPlayerIndex: number
  currentPlayerId: string
  playerOrder: string[]
  round: number
  turnCount: number
  turnPhase: string
  players: {
    [playerId: string]: Player
  }
  declareMode: string | null
  declaringPlayerId: string | null
  remainingTurns: number | null
  pendingEffect: Effect | null
}
```

### Player

```typescript
interface Player {
  hand: Card[]
  playedPairs: Pair[]
  score: number
  name: string
  isAI: boolean
  strategy?: string
}
```

### Card

```typescript
interface Card {
  id: string
  name: string
  value: number
  color: string
  effect?: string
}
```

### FeatureVector

```typescript
interface FeatureVector {
  handSize: number
  handComposition: { [cardName: string]: number }
  pairPotential: { [pairType: string]: boolean }
  collectionProgress: {
    [collectionName: string]: {
      count: number
      marginalGain: number
      priority: number
    }
  }
  multiplierSynergy: { [multiplierName: string]: number }
  gameProgress: {
    turnCount: number
    deckRatio: number
    scoreDifferential: number
    opponentHandSizes: number[]
    opponentPairsCounts: number[]
  }
  currentScore: number
  scoreToWin: number
}
```

---

## 常數

### 階段常數

```javascript
const PHASES = {
  DRAW: 'draw',
  CHOOSING_CARD: 'choosing_card',
  PAIR: 'pair',
  DECLARE: 'declare',
  DECLARE_SHOWING: 'declare_showing',
  ROUND_END: 'round_end'
}
```

### 嚴重程度常數

```javascript
const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
}
```

### Bug 類型常數

```javascript
const BUG_TYPES = {
  INFINITE_LOOP: 'potential_infinite_loop',
  DECK_INTEGRITY: 'deck_integrity_violation',
  INVALID_HAND_SIZE: 'invalid_hand_size',
  INVALID_PHASE: 'invalid_phase',
  DUPLICATE_CARDS: 'duplicate_cards',
  SCORE_MISMATCH: 'score_mismatch',
  INVALID_TURN_ORDER: 'invalid_player_turn'
}
```

---

## 使用範例

### 完整流程示例

```javascript
import { BattleOrchestrator } from './scripts/battleOrchestrator.js'

async function main() {
  // 1. 創建 Orchestrator
  const orchestrator = new BattleOrchestrator({
    totalGames: 100,
    strategies: ['medium', 'hard'],
    enableTrainingData: true,
    outputDir: './scripts/output'
  })

  // 2. 運行會話
  console.log('開始對戰測試...')
  const result = await orchestrator.runSession()

  // 3. 查看結果
  console.log(`\n✅ 完成 ${result.completedGames} 場遊戲`)
  console.log(`⏱ 總時長: ${result.duration / 1000}s`)
  console.log(`\n📊 勝率統計:`)
  Object.entries(result.stats.strategyStats).forEach(([strategy, stats]) => {
    console.log(`  ${strategy}: ${stats.winRate}% (${stats.wins} 勝)`)
  })

  // 4. 檢查 Bug
  if (result.bugReport.totalIssues > 0) {
    console.log(`\n⚠️ 發現 ${result.bugReport.totalIssues} 個問題:`)
    result.bugReport.criticalIssues.forEach(issue => {
      console.log(`  [CRITICAL] ${issue.type}: ${issue.description}`)
    })
  } else {
    console.log('\n✅ 沒有發現 Bug!')
  }

  // 5. 訓練數據
  if (result.trainingDataPath) {
    console.log(`\n📁 訓練數據已保存到: ${result.trainingDataPath}`)
  }
}

main().catch(console.error)
```

---

**文檔版本**: 1.0
**最後更新**: 2025-01-30
