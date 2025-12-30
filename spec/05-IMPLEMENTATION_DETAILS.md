# Sea Salt & Paper - 實作細節規範 (Implementation Details Specification)

**版本**: 1.0.0
**最後更新**: 2025-01-13
**文件類型**: 技術規範文件 (Technical Specification Document)

## 目錄

1. [核心演算法實作](#1-核心演算法實作)
2. [邊緣案例處理](#2-邊緣案例處理)
3. [React 實作模式](#3-react-實作模式)
4. [Firebase 實作模式](#4-firebase-實作模式)
5. [錯誤處理機制](#5-錯誤處理機制)
6. [測試規範](#6-測試規範)
7. [效能優化策略](#7-效能優化策略)
8. [程式碼組織規範](#8-程式碼組織規範)
9. [部署與建置](#9-部署與建置)

---

## 1. 核心演算法實作

### 1.1 Fisher-Yates 洗牌演算法

**位置**: `src/utils/cardHelpers.js`

**演算法描述**:
```
對於長度為 n 的陣列:
  從 i = n-1 到 i = 1:
    j = random(0, i)  // 生成 0 到 i 之間的隨機索引
    swap(array[i], array[j])  // 交換元素
```

**完整實作**:
```javascript
/**
 * Fisher-Yates Shuffle Algorithm (Durstenfeld variant)
 * 時間複雜度: O(n)
 * 空間複雜度: O(1)
 *
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array (mutates original)
 */
export function shuffleDeck(array) {
  // Create a copy to avoid mutating original
  const shuffled = [...array]

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate random index j where 0 <= j <= i
    const j = Math.floor(Math.random() * (i + 1))

    // Swap elements at positions i and j
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}
```

**關鍵實作細節**:
1. **為何從後往前**: 確保每個元素都有相等機會被選中
2. **範圍選擇**: `Math.random() * (i + 1)` 確保包含位置 i
3. **不可變性**: 複製陣列避免修改原始資料
4. **解構賦值**: 使用 `[a, b] = [b, a]` 進行優雅交換

**測試案例**:
```javascript
describe('shuffleDeck', () => {
  it('應該不改變陣列長度', () => {
    const cards = [1, 2, 3, 4, 5]
    const shuffled = shuffleDeck(cards)
    expect(shuffled.length).toBe(5)
  })

  it('應該包含所有原始元素', () => {
    const cards = ['A', 'B', 'C', 'D']
    const shuffled = shuffleDeck(cards)
    expect(shuffled.sort()).toEqual(['A', 'B', 'C', 'D'])
  })

  it('應該產生不同的排列 (統計測試)', () => {
    const cards = [1, 2, 3]
    const results = new Set()

    for (let i = 0; i < 50; i++) {
      const shuffled = shuffleDeck(cards)
      results.add(shuffled.join(','))
    }

    // 3個元素有 3! = 6 種排列
    // 50次洗牌應該至少產生 4 種不同排列
    expect(results.size).toBeGreaterThanOrEqual(4)
  })
})
```

---

### 1.2 隨機顏色分配演算法

**位置**: `src/config/colorConfig.js`

**需求**: 72 張卡片隨機分配到 4 種顏色，每種顏色 18 張

**演算法步驟**:
```
1. 建立顏色池: ['blue', 'red', 'green', 'yellow'] × 18
2. 使用 Fisher-Yates 洗牌打亂顏色池
3. 按順序分配給每張卡片
```

**完整實作**:
```javascript
/**
 * Assign random colors to cards
 * 每種顏色固定 18 張，確保顏色平衡
 *
 * @param {Array} cards - Array of card objects (72 cards)
 * @returns {Array} Cards with assigned colors
 */
export function assignRandomColors(cards) {
  // 定義可用顏色和每種顏色的數量
  const COLORS = ['blue', 'red', 'green', 'yellow']
  const CARDS_PER_COLOR = 18
  const TOTAL_CARDS = 72

  // 驗證卡片數量
  if (cards.length !== TOTAL_CARDS) {
    console.warn(
      `Expected ${TOTAL_CARDS} cards, got ${cards.length}. Color assignment may be unbalanced.`
    )
  }

  // 建立顏色池: 每種顏色 18 張
  const colorPool = []
  COLORS.forEach(color => {
    for (let i = 0; i < CARDS_PER_COLOR; i++) {
      colorPool.push(color)
    }
  })

  // 洗牌顏色池，確保隨機性
  const shuffledColors = shuffleDeck(colorPool)

  // 為每張卡片分配顏色
  const cardsWithColors = cards.map((card, index) => {
    // 某些卡片有固定顏色（如 Mermaid 永遠是 white）
    if (card.color && card.color !== 'random') {
      return card // 保持原有顏色
    }

    // 分配隨機顏色
    const assignedColor = shuffledColors[index % shuffledColors.length]

    return {
      ...card,
      color: assignedColor
    }
  })

  // 驗證顏色分佈 (開發模式)
  if (process.env.NODE_ENV === 'development') {
    const colorCounts = {}
    cardsWithColors.forEach(card => {
      if (card.color !== 'white') {
        colorCounts[card.color] = (colorCounts[card.color] || 0) + 1
      }
    })
    console.log('[Color Assignment] Distribution:', colorCounts)
  }

  return cardsWithColors
}
```

**特殊規則**:
```javascript
// 固定顏色卡片 (在 cards.js 中定義)
{
  name: 'Mermaid',
  color: 'white',  // 固定白色，不參與隨機分配
  ...
}
```

**顏色分佈驗證**:
```javascript
/**
 * 驗證顏色分佈是否平衡
 * @param {Array} cards - 已分配顏色的卡片
 * @returns {Object} { isBalanced: boolean, distribution: Object }
 */
export function validateColorDistribution(cards) {
  const counts = {}
  const EXPECTED_PER_COLOR = 18

  cards.forEach(card => {
    if (card.color !== 'white') {
      counts[card.color] = (counts[card.color] || 0) + 1
    }
  })

  const isBalanced = Object.values(counts).every(
    count => count === EXPECTED_PER_COLOR
  )

  return {
    isBalanced,
    distribution: counts,
    expected: EXPECTED_PER_COLOR
  }
}
```

---

### 1.3 計分引擎實作

**位置**: `src/services/scoreService.js`

#### 1.3.1 基礎分數計算

**公式**:
- **配對卡片** (Fish, Crab, Sailboat, Shark, Swimmer): 每對 1 分
- **貝殼** (Shell): `(count - 1) × 2`
- **章魚** (Octopus): `(count - 1) × 3`
- **企鵝** (Penguin): `count × 2 - 1`
- **水手** (Sailor): `count >= 2 ? 5 : 0`

**實作**:
```javascript
/**
 * Calculate base score from cards
 * 基礎分數 = 配對卡片分數 + 收集卡片分數 + 其他卡片數值
 *
 * @param {Array} cards - All cards (hand + played pairs)
 * @returns {Object} Score breakdown
 */
export function calculateBaseScore(cards) {
  if (!cards || cards.length === 0) {
    return {
      total: 0,
      cardValues: 0,
      pairCardBonus: 0,
      collectionDetails: []
    }
  }

  // ========== 收集卡片計分 ==========

  // 1. Shell: (count-1) * 2
  const shellCount = cards.filter(c => c.name === 'Shell').length
  const shellScore = shellCount > 0 ? (shellCount - 1) * 2 : 0

  // 2. Octopus: (count-1) * 3
  const octopusCount = cards.filter(c => c.name === 'Octopus').length
  const octopusScore = octopusCount > 0 ? (octopusCount - 1) * 3 : 0

  // 3. Penguin: count * 2 - 1
  const penguinCount = cards.filter(c => c.name === 'Penguin').length
  const penguinScore = penguinCount > 0 ? penguinCount * 2 - 1 : 0

  // 4. Sailor: count >= 2 ? 5 : 0
  const sailorCount = cards.filter(c => c.name === 'Sailor').length
  const sailorScore = sailorCount >= 2 ? 5 : 0

  // ========== 配對卡片計分 ==========
  // 只有成對的配對卡片才給分：每對 1 分
  const PAIR_CARD_TYPES = ['Fish', 'Crab', 'Sailboat', 'Shark', 'Swimmer']

  const pairCardCounts = {}
  PAIR_CARD_TYPES.forEach(type => {
    const count = cards.filter(c => c.name === type).length
    if (count >= 2) {
      pairCardCounts[type] = Math.floor(count / 2) // 配對數
    }
  })

  const totalPairs = Object.values(pairCardCounts).reduce(
    (sum, pairs) => sum + pairs,
    0
  )
  const pairCardBonus = totalPairs * 1 // 每對 1 分

  // ========== 其他卡片數值 ==========
  const otherCards = cards.filter(
    c =>
      c.name !== 'Shell' &&
      c.name !== 'Octopus' &&
      c.name !== 'Penguin' &&
      c.name !== 'Sailor' &&
      !PAIR_CARD_TYPES.includes(c.name)
  )
  const cardValues = otherCards.reduce((sum, c) => sum + (c.value || 0), 0)

  // ========== 建立詳細分數清單 ==========
  const collectionDetails = []

  if (shellScore > 0) {
    collectionDetails.push({
      name: 'Shell',
      emoji: '🐚',
      count: shellCount,
      score: shellScore,
      rule: `${shellCount}張=(${shellCount}-1)×2`
    })
  }

  if (octopusScore > 0) {
    collectionDetails.push({
      name: 'Octopus',
      emoji: '🐙',
      count: octopusCount,
      score: octopusScore,
      rule: `${octopusCount}張=(${octopusCount}-1)×3`
    })
  }

  if (penguinScore > 0) {
    collectionDetails.push({
      name: 'Penguin',
      emoji: '🐧',
      count: penguinCount,
      score: penguinScore,
      rule: `${penguinCount}張=${penguinCount}×2-1`
    })
  }

  if (sailorScore > 0) {
    collectionDetails.push({
      name: 'Sailor',
      emoji: '🧑‍✈️',
      count: sailorCount,
      score: sailorScore,
      rule: '2張=5分'
    })
  }

  if (pairCardBonus > 0) {
    const pairCardEmojis = {
      Fish: '🐟',
      Crab: '🦀',
      Sailboat: '⛵',
      Shark: '🦈',
      Swimmer: '🏊'
    }

    Object.entries(pairCardCounts).forEach(([type, pairs]) => {
      const totalCards = cards.filter(c => c.name === type).length
      collectionDetails.push({
        name: type,
        emoji: pairCardEmojis[type] || '🃏',
        count: totalCards,
        score: pairs * 1,
        rule: `${totalCards}張(${pairs}對)×1分`
      })
    })
  }

  // ========== 總分 ==========
  const total =
    shellScore +
    octopusScore +
    penguinScore +
    sailorScore +
    cardValues +
    pairCardBonus

  return {
    total,
    cardValues,
    pairCardBonus,
    collectionDetails
  }
}
```

**計分範例**:
```javascript
// 範例 1: 貝殼計分
const cards1 = [
  { name: 'Shell', value: 0 },
  { name: 'Shell', value: 0 },
  { name: 'Shell', value: 0 }
]
calculateBaseScore(cards1)
// 結果: { total: 4, ... }
// 計算: (3-1) × 2 = 4

// 範例 2: 配對卡片計分
const cards2 = [
  { name: 'Fish', value: 0 },
  { name: 'Fish', value: 0 },
  { name: 'Fish', value: 0 }
]
calculateBaseScore(cards2)
// 結果: { total: 1, pairCardBonus: 1, ... }
// 計算: floor(3/2) = 1 對 = 1 分

// 範例 3: 企鵝計分
const cards3 = [
  { name: 'Penguin', value: 0 },
  { name: 'Penguin', value: 0 }
]
calculateBaseScore(cards3)
// 結果: { total: 3, ... }
// 計算: 2 × 2 - 1 = 3
```

---

#### 1.3.2 美人魚計分

**複雜規則**: 第 N 張美人魚 = 第 N 多的顏色卡片數量

**演算法步驟**:
```
1. 統計所有非美人魚卡片的顏色數量
2. 將顏色數量由大到小排序
3. 第 i 張美人魚 = sortedCounts[i-1]
```

**實作**:
```javascript
/**
 * Calculate mermaid score
 * 美人魚計分邏輯：
 * - 第 1 張美人魚 = 最多顏色的卡片數量
 * - 第 2 張美人魚 = 第 2 多顏色的卡片數量
 * - 以此類推
 *
 * 重要: 美人魚本身不計入顏色統計
 *
 * @param {Array} hand - Player's hand
 * @param {Array} playedPairs - Played pairs
 * @returns {number} Mermaid score
 */
export function calculateMermaidScore(hand, playedPairs) {
  const allCards = [...hand, ...playedPairs.flatMap(p => p.cards || [])]

  // 1. 計算美人魚數量
  const mermaidCount = allCards.filter(c => c.name === 'Mermaid').length

  if (mermaidCount === 0) return 0

  // 2. 統計非美人魚卡片的顏色
  const nonMermaidCards = allCards.filter(c => c.name !== 'Mermaid')

  // 3. 計算每種顏色的卡片數量
  const colorCounts = {}
  nonMermaidCards.forEach(card => {
    if (card.color && card.color !== 'multicolor') {
      colorCounts[card.color] = (colorCounts[card.color] || 0) + 1
    }
  })

  // 4. 將顏色數量由大到小排序
  const sortedCounts = Object.values(colorCounts).sort((a, b) => b - a)

  // 5. 每張美人魚對應第 N 多的顏色數量
  let total = 0
  for (let i = 0; i < mermaidCount; i++) {
    total += sortedCounts[i] || 0
  }

  return total
}
```

**計分範例**:
```javascript
// 範例 1: 1 張美人魚
const hand1 = [
  { name: 'Mermaid', color: 'white' },
  { name: 'Fish', color: 'blue' },
  { name: 'Crab', color: 'blue' },
  { name: 'Shell', color: 'blue' },
  { name: 'Starfish', color: 'red' },
  { name: 'Sailboat', color: 'red' }
]
calculateMermaidScore(hand1, [])
// 顏色統計: { blue: 3, red: 2 }
// 排序: [3, 2]
// 第 1 張美人魚 = 3
// 結果: 3

// 範例 2: 2 張美人魚
const hand2 = [
  { name: 'Mermaid', color: 'white' },
  { name: 'Mermaid', color: 'white' },
  { name: 'Fish', color: 'blue' },
  { name: 'Crab', color: 'blue' },
  { name: 'Shell', color: 'blue' },
  { name: 'Starfish', color: 'red' },
  { name: 'Sailboat', color: 'red' },
  { name: 'Shark', color: 'green' }
]
calculateMermaidScore(hand2, [])
// 顏色統計: { blue: 3, red: 2, green: 1 }
// 排序: [3, 2, 1]
// 第 1 張美人魚 = 3
// 第 2 張美人魚 = 2
// 結果: 3 + 2 = 5

// 範例 3: 美人魚多於顏色種類
const hand3 = [
  { name: 'Mermaid', color: 'white' },
  { name: 'Mermaid', color: 'white' },
  { name: 'Mermaid', color: 'white' },
  { name: 'Fish', color: 'blue' },
  { name: 'Crab', color: 'blue' }
]
calculateMermaidScore(hand3, [])
// 顏色統計: { blue: 2 }
// 排序: [2]
// 第 1 張美人魚 = 2
// 第 2 張美人魚 = 0 (沒有第 2 多的顏色)
// 第 3 張美人魚 = 0
// 結果: 2 + 0 + 0 = 2
```

---

#### 1.3.3 Last Chance 計分邏輯

**規則**:
- **宣告者分數最高**: 宣告者得【卡片分 + 顏色獎勵】，其他人只得【顏色獎勵】
- **宣告者分數不是最高**: 宣告者只得【顏色獎勵】，其他人得【卡片分 + 顏色獎勵】

**實作**:
```javascript
/**
 * Calculate round winner for Last Chance mode
 *
 * @param {Object} players - Map of player IDs to player objects
 * @param {string} declareMode - 'stop' or 'last_chance'
 * @param {string} declaringPlayerId - Player who declared
 * @returns {Object} Round results
 */
export function calculateRoundWinner(players, declareMode, declaringPlayerId) {
  const playerIds = Object.keys(players)

  if (declareMode === 'last_chance') {
    const allScores = {}

    // 步驟 1: 計算所有玩家的卡片分數 (不含顏色獎勵)
    playerIds.forEach(playerId => {
      const player = players[playerId]
      allScores[playerId] = calculateScore(
        player.hand || [],
        player.playedPairs || [],
        { includeColorBonus: false }
      )
    })

    // 步驟 2: 判斷宣告者是否擁有最高分
    const declarerScore = allScores[declaringPlayerId].total
    const allScoreValues = Object.values(allScores).map(s => s.total)
    const highestScore = Math.max(...allScoreValues)
    const declarerHasHighest = declarerScore >= highestScore

    // 步驟 3: 根據規則計算最終分數
    const finalScores = {}

    playerIds.forEach(playerId => {
      const player = players[playerId]
      const isDeclarer = playerId === declaringPlayerId

      // 計算顏色獎勵
      const colorBonus = calculateScore(
        player.hand || [],
        player.playedPairs || [],
        { includeColorBonus: true }
      ).colorBonus

      if (declarerHasHighest) {
        // 宣告者分數最高
        if (isDeclarer) {
          // 宣告者: 卡片分 + 顏色獎勵
          finalScores[playerId] = {
            ...allScores[playerId],
            colorBonus,
            total: allScores[playerId].total + colorBonus
          }
        } else {
          // 其他玩家: 只得顏色獎勵
          finalScores[playerId] = {
            base: 0,
            pairs: 0,
            multipliers: 0,
            mermaids: 0,
            colorBonus,
            total: colorBonus
          }
        }
      } else {
        // 宣告者分數不是最高
        if (isDeclarer) {
          // 宣告者: 只得顏色獎勵
          finalScores[playerId] = {
            base: 0,
            pairs: 0,
            multipliers: 0,
            mermaids: 0,
            colorBonus,
            total: colorBonus
          }
        } else {
          // 其他玩家: 卡片分 + 顏色獎勵
          finalScores[playerId] = {
            ...allScores[playerId],
            colorBonus,
            total: allScores[playerId].total + colorBonus
          }
        }
      }
    })

    // 步驟 4: 找出贏家 (最高分者)
    const winner = playerIds.reduce((prev, curr) =>
      finalScores[curr].total > finalScores[prev].total ? curr : prev
    )

    return {
      mode: 'last_chance',
      scores: finalScores,
      winner,
      winnerScore: finalScores[winner].total,
      declarerHasHighest
    }
  }

  // Stop 模式較簡單，省略...
}
```

**計分範例**:
```javascript
// 範例: Last Chance 宣告者分數最高
const players = {
  player1: {
    // 宣告者
    hand: [
      { name: 'Shell', value: 0, color: 'blue' },
      { name: 'Shell', value: 0, color: 'blue' },
      { name: 'Shell', value: 0, color: 'blue' },
      { name: 'Fish', value: 0, color: 'blue' }
    ],
    playedPairs: []
  },
  player2: {
    hand: [
      { name: 'Fish', value: 0, color: 'red' },
      { name: 'Fish', value: 0, color: 'red' }
    ],
    playedPairs: []
  }
}

calculateRoundWinner(players, 'last_chance', 'player1')

// player1 卡片分: (3-1)×2 = 4 分 (Shell)
// player2 卡片分: 1 分 (Fish 對)
// 宣告者 player1 分數最高 ✓

// player1 顏色獎勵: 4 (blue)
// player2 顏色獎勵: 2 (red)

// 最終結果:
// player1: 4 (卡片分) + 4 (顏色) = 8 分
// player2: 0 (卡片分) + 2 (顏色) = 2 分
// 贏家: player1
```

---

### 1.4 AI 決策樹實作

**位置**: `src/services/aiService.js`

#### 1.4.1 三種難度的決策流程

```
┌─────────────────────────────────────────────────────────┐
│                    AI 決策流程圖                          │
└─────────────────────────────────────────────────────────┘

                    開始 AI 回合
                         ↓
              ┌──────────┴──────────┐
              │  判斷當前遊戲階段    │
              └──────────┬──────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    Draw 階段        Pair 階段      Declare 階段
         │               │               │
         ↓               ↓               ↓
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │選擇抽牌  │    │選擇配對  │    │選擇宣告  │
  │  來源    │    │   卡片   │    │  或繼續  │
  └─────┬────┘    └─────┬────┘    └─────┬────┘
        │               │               │
        │               │               │
  [難度分支]       [難度分支]       [難度分支]
        │               │               │
   Easy │ Medium │ Hard │          [基於回合數]
        │        │      │               │
        ↓        ↓      ↓               ↓
      隨機    策略性  深度分析   turnCount > 10?
      選擇    評估    所有選項      ↙        ↘
                                  STOP   LAST_CHANCE
```

#### 1.4.2 Easy AI 實作

**策略**: 隨機決策 + 基本宣告邏輯

```javascript
/**
 * Easy AI Decision Making
 * 特點:
 * - Draw: 隨機選擇牌庫或棄牌堆
 * - Pair: 50% 機率打出配對
 * - Declare: 分數 >= 7 時宣告 (基於回合數選擇模式)
 */
export function makeEasyDecision(gameState, playerId) {
  const player = gameState.players[playerId]

  // Draw 階段
  if (gameState.turnPhase === 'draw') {
    const options = ['deck']

    // 加入可用的棄牌堆選項
    if (gameState.discardLeft.length > 0) options.push('discard_left')
    if (gameState.discardRight.length > 0) options.push('discard_right')

    // 隨機選擇
    const choice = options[Math.floor(Math.random() * options.length)]

    return {
      action: 'draw',
      source: choice,
      delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
    }
  }

  // Pair 階段
  if (gameState.turnPhase === 'pair') {
    const pairs = findAllPairs(player.hand)

    // 50% 機率打出配對
    if (pairs.length > 0 && Math.random() > 0.5) {
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)]
      return {
        action: 'play_pair',
        cards: randomPair,
        delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
      }
    }

    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY
    }
  }

  // Declare 階段
  if (gameState.turnPhase === 'declare') {
    const score = calculateScore(player.hand, player.playedPairs, {
      includeColorBonus: false
    })
    const turnCount = gameState.turnCount || 0

    if (score.total >= 7) {
      // turnCount > 10: STOP, <= 10: LAST_CHANCE
      const declareType = turnCount > 10 ? 'stop' : 'last_chance'
      return {
        action: 'declare',
        type: declareType,
        delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
      }
    }

    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY
    }
  }

  return {
    action: 'end_turn',
    delay: AI_TIMING.MIN_DELAY
  }
}
```

---

#### 1.4.3 Medium AI 實作

**策略**: 配對優先 > 收集卡片 > 乘數器協同 > 顏色配對

```javascript
/**
 * Medium AI Decision Making
 * 特點:
 * - Draw: 評估棄牌堆卡片價值 (配對、收集、乘數器)
 * - Pair: 打出所有有價值的配對
 * - Declare: 基於回合數和分數智能宣告
 */
export function makeMediumDecision(gameState, playerId) {
  const player = gameState.players[playerId]
  const hand = player?.hand || []
  const playedPairs = player?.playedPairs || []

  // Draw 階段: 評估卡片價值
  if (gameState.turnPhase === 'draw') {
    const leftTop = gameState.discardLeft[gameState.discardLeft.length - 1]
    const rightTop = gameState.discardRight[gameState.discardRight.length - 1]

    // 評估兩個棄牌堆的頂牌
    const leftEval = evaluateDiscardCard(leftTop, hand)
    const rightEval = evaluateDiscardCard(rightTop, hand)
    const deckBaseValue = 3 // 未知卡片的基礎價值

    console.log('[AI Medium] Draw evaluation:')
    console.log(`  - Deck: ${deckBaseValue}`)
    if (leftTop)
      console.log(`  - Left (${leftTop.name}): ${leftEval.value} (${leftEval.reason})`)
    if (rightTop)
      console.log(
        `  - Right (${rightTop.name}): ${rightEval.value} (${rightEval.reason})`
      )

    // 選擇價值最高的選項
    if (leftEval.value > deckBaseValue && leftEval.value >= rightEval.value) {
      return {
        action: 'draw',
        source: 'discard_left',
        delay: AI_TIMING.MIN_DELAY + Math.random() * 500
      }
    }

    if (rightEval.value > deckBaseValue && rightEval.value > leftEval.value) {
      return {
        action: 'draw',
        source: 'discard_right',
        delay: AI_TIMING.MIN_DELAY + Math.random() * 500
      }
    }

    // 顏色配對次優先
    const colorCounts = {}
    hand.forEach(card => {
      if (card.color && card.color !== 'multicolor') {
        colorCounts[card.color] = (colorCounts[card.color] || 0) + 1
      }
    })

    const dominantColor =
      Object.keys(colorCounts).length > 0
        ? Object.keys(colorCounts).reduce((a, b) =>
            colorCounts[a] > colorCounts[b] ? a : b
          )
        : null

    if (leftTop && dominantColor && leftTop.color === dominantColor) {
      return {
        action: 'draw',
        source: 'discard_left',
        delay: AI_TIMING.MIN_DELAY + Math.random() * 500
      }
    }

    if (rightTop && dominantColor && rightTop.color === dominantColor) {
      return {
        action: 'draw',
        source: 'discard_right',
        delay: AI_TIMING.MIN_DELAY + Math.random() * 500
      }
    }

    // 默認: 從牌庫抽牌
    return {
      action: 'draw',
      source: 'deck',
      delay: AI_TIMING.MIN_DELAY + Math.random() * 500
    }
  }

  // Pair 階段: 打出有價值的配對
  if (gameState.turnPhase === 'pair') {
    const pairResult = shouldPlayMorePairs(hand, playedPairs, [])

    if (pairResult.shouldPlay && pairResult.bestPair) {
      console.log(
        `[AI Medium] Playing pair: ${pairResult.bestPair[0].name} + ${pairResult.bestPair[1].name}`
      )
      console.log(`  Reason: ${pairResult.reason}`)

      return {
        action: 'play_pair',
        cards: pairResult.bestPair,
        delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
      }
    }

    console.log(`[AI Medium] ${pairResult.reason}`)
    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY + 300
    }
  }

  // Declare 階段: 智能宣告
  if (gameState.turnPhase === 'declare') {
    const score = calculateScore(hand, playedPairs, { includeColorBonus: false })
    const turnCount = gameState.turnCount || 0

    console.log(
      `[AI Medium] Current score: ${score.total}, turnCount: ${turnCount}`
    )

    if (score.total >= 7) {
      const declareType = turnCount > 10 ? 'stop' : 'last_chance'
      console.log(
        `[AI Medium] Score ${score.total} >= 7, declaring ${declareType.toUpperCase()}`
      )

      return {
        action: 'declare',
        type: declareType,
        delay: AI_TIMING.MIN_DELAY + 500
      }
    }

    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY + 300
    }
  }

  return {
    action: 'end_turn',
    delay: AI_TIMING.MIN_DELAY
  }
}
```

**卡片評估函數**:
```javascript
/**
 * Evaluate discard pile card value
 *
 * 評估因素:
 * 1. 配對潛力 (+3~6 分)
 * 2. 收集價值 (+marginal gain)
 * 3. 乘數器協同 (+synergy value)
 *
 * @param {Object} card - Card to evaluate
 * @param {Array} hand - Current hand
 * @returns {Object} { value, reason }
 */
function evaluateDiscardCard(card, hand) {
  if (!card) return { value: 0, reason: 'No card' }

  let value = card.value || 0
  let reasons = []

  // 1. 配對潛力
  const canPair = canFormPairWith(card, hand)
  if (canPair) {
    value += 3
    reasons.push(`can pair with ${canPair.name}`)
  }

  // 2. 收集價值
  const collectionNames = ['Shell', 'Octopus', 'Penguin', 'Sailor']
  if (collectionNames.includes(card.name)) {
    const collectionEval = evaluateCollectionValue(hand, card.name)
    value += collectionEval.marginalGain
    if (collectionEval.marginalGain > 0) {
      reasons.push(`collection gain: +${collectionEval.marginalGain}`)
    }
  }

  // 3. 乘數器協同
  const multiplierEval = evaluateMultiplierSynergy(hand, card)
  if (multiplierEval.synergyValue > 0) {
    value += multiplierEval.synergyValue
    reasons.push(multiplierEval.explanation)
  }

  return {
    value,
    reason: reasons.length > 0 ? reasons.join(', ') : 'base value'
  }
}
```

---

#### 1.4.4 Hard AI 實作

**策略**: 深度分析所有選項 + 對手意識 + 組合規劃

```javascript
/**
 * Hard AI Decision Making
 * 特點:
 * - Draw: 計算牌庫期望值，深度評估棄牌堆卡片
 * - Pair: 優化配對順序，最大化效果鏈
 * - Declare: 基於回合數、對手分數智能宣告
 */
export function makeHardDecision(gameState, playerId) {
  const player = gameState.players[playerId]
  const hand = player?.hand || []
  const playedPairs = player?.playedPairs || []

  // Draw 階段: 深度分析
  if (gameState.turnPhase === 'draw') {
    const options = []

    // 選項 1: 牌庫 (計算期望值)
    const deckValue = calculateDeckExpectedValue(hand, gameState)
    options.push({
      source: 'deck',
      score: deckValue,
      reason: `Unknown card (expected: ${deckValue.toFixed(1)})`
    })

    // 選項 2: 左棄牌堆
    const leftTop = gameState.discardLeft[gameState.discardLeft.length - 1]
    if (leftTop) {
      const leftEval = evaluateDiscardCardAdvanced(
        leftTop,
        hand,
        playedPairs,
        gameState
      )
      options.push({
        source: 'discard_left',
        score: leftEval.value,
        reason: `Left (${leftTop.name}): ${leftEval.reason}`
      })
    }

    // 選項 3: 右棄牌堆
    const rightTop = gameState.discardRight[gameState.discardRight.length - 1]
    if (rightTop) {
      const rightEval = evaluateDiscardCardAdvanced(
        rightTop,
        hand,
        playedPairs,
        gameState
      )
      options.push({
        source: 'discard_right',
        score: rightEval.value,
        reason: `Right (${rightTop.name}): ${rightEval.reason}`
      })
    }

    // 排序並選擇最佳選項
    options.sort((a, b) => b.score - a.score)

    console.log('[AI Hard] Draw analysis:')
    options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt.reason}`))
    console.log(`  -> Choosing: ${options[0].source}`)

    return {
      action: 'draw',
      source: options[0].source,
      delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
    }
  }

  // Pair 階段: 優化配對序列
  if (gameState.turnPhase === 'pair') {
    const pairResult = shouldPlayMorePairs(hand, playedPairs, [])

    if (pairResult.shouldPlay && pairResult.bestPair) {
      console.log(
        `[AI Hard] Playing pair: ${pairResult.bestPair[0].name} + ${pairResult.bestPair[1].name}`
      )
      console.log(`  Analysis: ${pairResult.reason}`)

      return {
        action: 'play_pair',
        cards: pairResult.bestPair,
        delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
      }
    }

    console.log(`[AI Hard] No beneficial pairs: ${pairResult.reason}`)
    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY + 500
    }
  }

  // Declare 階段: 策略性宣告 (考慮對手)
  if (gameState.turnPhase === 'declare') {
    const score = calculateScore(hand, playedPairs, { includeColorBonus: false })
    const turnCount = gameState.turnCount || 0

    // 分析對手
    const opponentAnalysis = analyzeOpponents(gameState, playerId)

    console.log('[AI Hard] Score analysis:')
    console.log(`  My score: ${score.total}`)
    console.log(
      `  Opponent max: ${opponentAnalysis.maxScore}, avg: ${opponentAnalysis.avgScore.toFixed(1)}`
    )
    console.log(`  Turn count: ${turnCount}`)

    if (score.total >= 7) {
      const declareType = turnCount > 10 ? 'stop' : 'last_chance'
      console.log(
        `[AI Hard] Score ${score.total} >= 7, declaring ${declareType.toUpperCase()}`
      )

      return {
        action: 'declare',
        type: declareType,
        delay: AI_TIMING.MIN_DELAY + 800
      }
    }

    console.log('[AI Hard] Score too low, continuing to build hand')
    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY + 500
    }
  }

  return {
    action: 'end_turn',
    delay: AI_TIMING.MIN_DELAY
  }
}
```

**牌庫期望值計算**:
```javascript
/**
 * Calculate expected value from drawing from deck
 *
 * 考慮因素:
 * 1. 基礎期望值 (3分)
 * 2. 收集卡片完成潛力 (+0.5 per high-priority collection)
 * 3. 乘數器協同潛力 (+0.2~0.3 per multiplier)
 *
 * @param {Array} hand - Current hand
 * @param {Object} gameState - Game state
 * @returns {number} Expected value
 */
function calculateDeckExpectedValue(hand, gameState) {
  let expectedValue = 3 // 基礎值

  // 收集卡片潛力
  const collectionNames = ['Shell', 'Octopus', 'Penguin', 'Sailor']
  collectionNames.forEach(name => {
    const eval_ = evaluateCollectionValue(hand, name)
    if (eval_.priority >= 3) {
      expectedValue += 0.5
    }
  })

  // 乘數器潛力
  const hasLighthouse = hand.some(c => c.name === 'Lighthouse')
  const hasFishSchool = hand.some(c => c.name === 'FishSchool')
  const hasPenguinColony = hand.some(c => c.name === 'PenguinColony')
  const hasCaptain = hand.some(c => c.name === 'Captain')

  if (hasLighthouse) expectedValue += 0.3
  if (hasFishSchool) expectedValue += 0.3
  if (hasPenguinColony) expectedValue += 0.2
  if (hasCaptain) expectedValue += 0.2

  return expectedValue
}
```

---

## 2. 邊緣案例處理

### 2.1 空牌庫重新洗牌邏輯

**場景**: 玩家需要抽牌，但牌庫已空

**處理流程**:
```
1. 檢查牌庫是否為空
2. 如果為空:
   a. 保留兩個棄牌堆的頂牌
   b. 收集其餘所有棄牌
   c. 洗牌後成為新牌庫
   d. 頂牌返回棄牌堆
3. 從新牌庫抽牌
```

**實作**:
```javascript
/**
 * Check if deck needs reshuffling and perform reshuffle
 *
 * @param {Array} deck - Current deck
 * @param {Array} discardLeft - Left discard pile
 * @param {Array} discardRight - Right discard pile
 * @returns {Object} { needsReshuffle, newDeck, newDiscardLeft, newDiscardRight }
 */
export function checkDeckReshuffle(deck, discardLeft, discardRight) {
  // 牌庫不為空,無需洗牌
  if (deck.length > 0) {
    return {
      needsReshuffle: false,
      newDeck: deck,
      newDiscardLeft: discardLeft,
      newDiscardRight: discardRight
    }
  }

  console.log('[Deck Reshuffle] Deck is empty, reshuffling discard piles...')

  // 保留兩個棄牌堆的頂牌
  const topLeft =
    discardLeft && discardLeft.length > 0
      ? discardLeft[discardLeft.length - 1]
      : null
  const topRight =
    discardRight && discardRight.length > 0
      ? discardRight[discardRight.length - 1]
      : null

  // 收集其餘卡片用於洗牌
  const leftCards = discardLeft && discardLeft.length > 1 ? discardLeft.slice(0, -1) : []
  const rightCards =
    discardRight && discardRight.length > 1 ? discardRight.slice(0, -1) : []

  const cardsToShuffle = [...leftCards, ...rightCards]

  // 如果沒有卡片可洗牌,返回空牌庫
  if (cardsToShuffle.length === 0) {
    console.warn('[Deck Reshuffle] No cards available to reshuffle!')
    return {
      needsReshuffle: true,
      newDeck: [],
      newDiscardLeft: topLeft ? [topLeft] : [],
      newDiscardRight: topRight ? [topRight] : []
    }
  }

  // 洗牌
  const newDeck = shuffleDeck(cardsToShuffle)

  console.log(
    `[Deck Reshuffle] Created new deck with ${newDeck.length} cards from discard piles`
  )

  return {
    needsReshuffle: true,
    newDeck,
    newDiscardLeft: topLeft ? [topLeft] : [],
    newDiscardRight: topRight ? [topRight] : []
  }
}
```

**邊緣案例**:

1. **兩個棄牌堆都只有 1 張牌**:
```javascript
const result = checkDeckReshuffle(
  [], // 空牌庫
  [card1], // 左棄牌堆只有 1 張
  [card2] // 右棄牌堆只有 1 張
)
// 結果:
// newDeck: [] (沒有卡片可洗牌)
// newDiscardLeft: [card1] (保留頂牌)
// newDiscardRight: [card2] (保留頂牌)
```

2. **一個棄牌堆為空**:
```javascript
const result = checkDeckReshuffle(
  [],
  [card1, card2, card3], // 左棄牌堆 3 張
  [] // 右棄牌堆空
)
// 結果:
// newDeck: shuffle([card1, card2]) (洗牌前 2 張)
// newDiscardLeft: [card3] (保留頂牌)
// newDiscardRight: []
```

3. **遊戲末期牌庫和棄牌堆都空**:
```javascript
const result = checkDeckReshuffle([], [], [])
// 結果:
// newDeck: []
// newDiscardLeft: []
// newDiscardRight: []
// 此時遊戲應該進入結算階段
```

---

### 2.2 玩家斷線/重連處理

**需求**: 玩家暫時斷線後能重新連接並恢復遊戲狀態

**實作策略**:
```javascript
/**
 * 玩家斷線處理流程
 */

// 1. 檢測斷線 (Firebase onDisconnect)
const playerRef = ref(database, `rooms/${roomId}/players/${playerId}`)

onDisconnect(playerRef).update({
  connectionStatus: 'disconnected',
  lastSeen: serverTimestamp()
})

// 2. 斷線狀態更新
useEffect(() => {
  const connectedRef = ref(database, '.info/connected')

  const unsubscribe = onValue(connectedRef, snapshot => {
    if (snapshot.val() === true) {
      // 玩家重新連線
      update(playerRef, {
        connectionStatus: 'connected',
        lastSeen: serverTimestamp()
      })
    }
  })

  return () => off(connectedRef)
}, [])

// 3. UI 顯示斷線玩家
const PlayerSeat = ({ player }) => {
  const isDisconnected = player.connectionStatus === 'disconnected'

  return (
    <div className={`player-seat ${isDisconnected ? 'player-seat--disconnected' : ''}`}>
      <div className="player-seat__name">{player.name}</div>
      {isDisconnected && (
        <div className="player-seat__disconnected-badge">Disconnected</div>
      )}
    </div>
  )
}

// 4. 遊戲暫停邏輯 (可選)
const shouldPauseGame = (players) => {
  const disconnectedCount = Object.values(players).filter(
    p => p.connectionStatus === 'disconnected'
  ).length

  // 如果超過一半玩家斷線,暫停遊戲
  return disconnectedCount > Object.keys(players).length / 2
}

// 5. 重連恢復
const handleReconnect = async (playerId, roomId) => {
  // 重新訂閱 Firebase 監聽器
  const roomRef = ref(database, `rooms/${roomId}`)

  const roomData = await get(roomRef)
  const gameState = roomData.val().gameState

  // 恢復玩家狀態
  setGameState(gameState)
  setMyPlayerId(playerId)

  // 更新連線狀態
  await update(ref(database, `rooms/${roomId}/players/${playerId}`), {
    connectionStatus: 'connected',
    lastSeen: serverTimestamp()
  })

  console.log(`[Reconnect] Player ${playerId} successfully reconnected`)
}
```

**邊緣案例**:

1. **玩家輪到時斷線**: AI 代替玩家執行動作
```javascript
const handlePlayerTurn = async () => {
  const currentPlayer = gameState.players[gameState.currentPlayerId]

  if (currentPlayer.connectionStatus === 'disconnected') {
    // 使用 Easy AI 代替執行
    const aiDecision = makeEasyDecision(gameState, gameState.currentPlayerId)
    await executeAIAction(aiDecision)
  }
}
```

2. **房主斷線**: 轉移房主權限
```javascript
const transferHost = async (roomId, oldHostId) => {
  const roomRef = ref(database, `rooms/${roomId}`)
  const roomData = await get(roomRef)
  const players = roomData.val().players

  // 找到第一個連線中的玩家
  const newHost = Object.keys(players).find(
    id => id !== oldHostId && players[id].connectionStatus === 'connected'
  )

  if (newHost) {
    await update(roomRef, { hostId: newHost })
    console.log(`[Transfer Host] New host: ${newHost}`)
  } else {
    console.warn('[Transfer Host] No connected players to transfer host to')
  }
}
```

---

### 2.3 同時勝利條件處理

**場景**: 多個玩家同時達到勝利條件

**優先級規則**:
```
1. 4 張美人魚 > 達到目標分數
2. 如果多人同時 4 張美人魚: 回合順序先的玩家獲勝
3. 如果多人同時達到目標分數: 分數高者獲勝,平手則回合順序先的玩家獲勝
```

**實作**:
```javascript
/**
 * Determine final winner when multiple players meet win conditions
 *
 * @param {Object} players - Map of player IDs to player data
 * @param {Array} playerIds - Array of player IDs in turn order
 * @returns {Object} { winner, reason, tiedPlayers }
 */
export function determineFinalWinner(players, playerIds) {
  // 1. 檢查 4 張美人魚勝利
  const fourMermaidWinners = playerIds.filter(id => {
    const allCards = [
      ...(players[id].hand || []),
      ...(players[id].playedPairs || []).flatMap(p => p.cards || [])
    ]
    return hasFourMermaids(allCards)
  })

  if (fourMermaidWinners.length > 0) {
    // 如果多人有 4 張美人魚,回合順序先的玩家獲勝
    const winner = fourMermaidWinners[0]
    return {
      winner,
      reason: '4_mermaids',
      tiedPlayers: fourMermaidWinners.length > 1 ? fourMermaidWinners : null
    }
  }

  // 2. 檢查目標分數勝利
  const targetScore = getTargetScore(playerIds.length)
  const scoreWinners = playerIds.filter(id => players[id].score >= targetScore)

  if (scoreWinners.length === 0) {
    return { winner: null, reason: null, tiedPlayers: null }
  }

  if (scoreWinners.length === 1) {
    return {
      winner: scoreWinners[0],
      reason: 'target_score',
      tiedPlayers: null
    }
  }

  // 3. 多人達到目標分數: 找出最高分
  const scores = scoreWinners.map(id => ({
    id,
    score: players[id].score
  }))

  const maxScore = Math.max(...scores.map(s => s.score))
  const highestScorers = scores.filter(s => s.score === maxScore)

  if (highestScorers.length === 1) {
    return {
      winner: highestScorers[0].id,
      reason: 'highest_score',
      tiedPlayers: scoreWinners
    }
  }

  // 4. 完全平手: 回合順序先的玩家獲勝
  const winner = highestScorers[0].id
  return {
    winner,
    reason: 'tie_breaker',
    tiedPlayers: highestScorers.map(s => s.id)
  }
}
```

**測試案例**:
```javascript
describe('determineFinalWinner', () => {
  it('應該處理單一玩家達到目標分數', () => {
    const players = {
      p1: { score: 35, hand: [], playedPairs: [] },
      p2: { score: 20, hand: [], playedPairs: [] }
    }
    const result = determineFinalWinner(players, ['p1', 'p2'])
    expect(result.winner).toBe('p1')
    expect(result.reason).toBe('target_score')
  })

  it('應該處理 4 張美人魚優先於分數', () => {
    const players = {
      p1: {
        score: 50,
        hand: [
          { name: 'Mermaid' },
          { name: 'Mermaid' },
          { name: 'Mermaid' },
          { name: 'Mermaid' }
        ],
        playedPairs: []
      },
      p2: { score: 60, hand: [], playedPairs: [] }
    }
    const result = determineFinalWinner(players, ['p1', 'p2'])
    expect(result.winner).toBe('p1')
    expect(result.reason).toBe('4_mermaids')
  })

  it('應該處理多人同分平手,回合順序先的玩家獲勝', () => {
    const players = {
      p1: { score: 35, hand: [], playedPairs: [] },
      p2: { score: 35, hand: [], playedPairs: [] },
      p3: { score: 35, hand: [], playedPairs: [] }
    }
    const result = determineFinalWinner(players, ['p1', 'p2', 'p3'])
    expect(result.winner).toBe('p1')
    expect(result.reason).toBe('tie_breaker')
    expect(result.tiedPlayers).toEqual(['p1', 'p2', 'p3'])
  })
})
```

---

### 2.4 無效配對防止

**需求**: 防止玩家打出無效的卡片配對

**配對規則**:
```
有效配對:
1. 相同名稱的兩張卡片 (Fish + Fish)
2. 鯊魚 + 游泳者 (Shark + Swimmer)
3. 游泳者 + 鯊魚 (Swimmer + Shark)

無效配對:
- 其他所有組合
```

**實作**:
```javascript
/**
 * Validate if two cards can form a valid pair
 *
 * @param {Object} card1 - First card
 * @param {Object} card2 - Second card
 * @returns {boolean} True if valid pair
 */
export function isValidPair(card1, card2) {
  if (!card1 || !card2) return false

  // 規則 1: 相同名稱
  if (card1.name === card2.name) return true

  // 規則 2: 鯊魚 + 游泳者
  if (
    (card1.name === 'Shark' && card2.name === 'Swimmer') ||
    (card1.name === 'Swimmer' && card2.name === 'Shark')
  ) {
    return true
  }

  return false
}

/**
 * UI 層驗證
 * 防止玩家選擇無效配對
 */
const PlayerHand = ({ cards, onPlayPair }) => {
  const [selectedCards, setSelectedCards] = useState([])

  const handleCardClick = card => {
    // 如果已選擇 1 張卡片
    if (selectedCards.length === 1) {
      const firstCard = selectedCards[0]

      // 驗證配對
      if (isValidPair(firstCard, card)) {
        // 有效配對,執行打出動作
        onPlayPair([firstCard, card])
        setSelectedCards([])
      } else {
        // 無效配對,顯示錯誤訊息
        showNotification('Invalid pair! Cards must have the same name or be Shark+Swimmer.', 'error')
        // 取消選擇第一張卡片
        setSelectedCards([card])
      }
    } else {
      // 選擇第一張卡片
      setSelectedCards([card])
    }
  }

  return (
    <div className="player-hand">
      {cards.map(card => (
        <Card
          key={card.id}
          {...card}
          selected={selectedCards.some(c => c.id === card.id)}
          onClick={() => handleCardClick(card)}
        />
      ))}
    </div>
  )
}
```

**視覺反饋**:
```css
/* 選中的卡片 */
.card--selected {
  transform: translateY(-20px);
  box-shadow: 0 0 20px var(--accent-coral);
}

/* 無效配對動畫 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.card--invalid-pair {
  animation: shake 0.3s ease-in-out;
}
```

---

### 2.5 卡片選擇超時處理

**需求**: 限制玩家每個動作的思考時間,防止遊戲拖延

**實作策略**:
```javascript
/**
 * 回合計時器
 */
const TURN_TIME_LIMIT = 60000 // 60 秒

const useTurnTimer = (isMyTurn, onTimeout) => {
  const [timeLeft, setTimeLeft] = useState(TURN_TIME_LIMIT)

  useEffect(() => {
    if (!isMyTurn) {
      setTimeLeft(TURN_TIME_LIMIT)
      return
    }

    // 開始計時
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = TURN_TIME_LIMIT - elapsed

      if (remaining <= 0) {
        clearInterval(interval)
        onTimeout()
      } else {
        setTimeLeft(remaining)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isMyTurn])

  return timeLeft
}

/**
 * 超時處理
 */
const GameBoard = () => {
  const handleTurnTimeout = async () => {
    console.log('[Timeout] Player took too long, auto-ending turn')

    // 顯示通知
    showNotification('Time is up! Turn ended automatically.', 'warning')

    // 自動結束回合
    await endTurn()
  }

  const timeLeft = useTurnTimer(isMyTurn, handleTurnTimeout)

  return (
    <div className="game-board">
      {isMyTurn && (
        <div className="turn-timer">
          <div className="turn-timer__bar" style={{ width: `${(timeLeft / TURN_TIME_LIMIT) * 100}%` }} />
          <span className="turn-timer__text">{Math.ceil(timeLeft / 1000)}s</span>
        </div>
      )}
      {/* ... */}
    </div>
  )
}
```

**超時策略**:
```javascript
/**
 * 根據當前階段執行超時動作
 */
const handlePhaseTimeout = async (phase) => {
  switch (phase) {
    case 'draw':
      // 超時: 自動從牌庫抽牌
      await drawFromDeck()
      break

    case 'pair':
      // 超時: 自動結束配對階段
      await endPairPhase()
      break

    case 'declare':
      // 超時: 自動不宣告,結束回合
      await endTurn()
      break

    case 'card_choice':
      // 偷牌或螃蟹效果超時: 隨機選擇
      const options = getPendingChoiceOptions()
      const randomChoice = options[Math.floor(Math.random() * options.length)]
      await selectCard(randomChoice)
      break

    default:
      await endTurn()
  }
}
```

---

## 3. React 實作模式

### 3.1 Hooks 使用模式

#### 3.1.1 自定義 Hook: useGameState

**用途**: 管理完整的遊戲狀態及同步邏輯

```javascript
/**
 * useGameState Hook
 * 集中管理遊戲狀態,封裝 Firebase 監聽邏輯
 *
 * @param {string} roomId - Room ID
 * @param {string} myPlayerId - Current player ID
 * @returns {Object} Game state and actions
 */
export function useGameState(roomId, myPlayerId) {
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 訂閱遊戲狀態更新
  useEffect(() => {
    if (!roomId) return

    setLoading(true)
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`)

    const unsubscribe = onValue(
      gameStateRef,
      snapshot => {
        const data = snapshot.val()
        setGameState(data)
        setLoading(false)
      },
      error => {
        console.error('[useGameState] Error:', error)
        setError(error.message)
        setLoading(false)
      }
    )

    // 清理監聽器
    return () => {
      off(gameStateRef)
    }
  }, [roomId])

  // Derived state
  const myPlayer = useMemo(() => {
    if (!gameState || !myPlayerId) return null
    return gameState.players[myPlayerId]
  }, [gameState, myPlayerId])

  const isMyTurn = useMemo(() => {
    if (!gameState || !myPlayerId) return false
    return gameState.currentPlayerId === myPlayerId
  }, [gameState, myPlayerId])

  const currentPhase = gameState?.turnPhase || null

  return {
    gameState,
    myPlayer,
    isMyTurn,
    currentPhase,
    loading,
    error
  }
}
```

**使用範例**:
```javascript
const GameBoard = ({ roomId, myPlayerId }) => {
  const {
    gameState,
    myPlayer,
    isMyTurn,
    currentPhase,
    loading,
    error
  } = useGameState(roomId, myPlayerId)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!gameState) return <div>Game not found</div>

  return (
    <div className="game-board">
      <PlayerHand
        cards={myPlayer.hand}
        canSelect={isMyTurn && currentPhase === 'pair'}
      />
      {/* ... */}
    </div>
  )
}
```

---

#### 3.1.2 自定義 Hook: useAI

**用途**: 管理 AI 玩家的決策與執行

```javascript
/**
 * useAI Hook
 * 自動執行 AI 玩家的回合動作
 *
 * @param {Object} gameState - Current game state
 * @param {string} roomId - Room ID
 * @returns {Object} AI execution state
 */
export function useAI(gameState, roomId) {
  const [aiExecuting, setAiExecuting] = useState(false)

  useEffect(() => {
    if (!gameState || !roomId) return

    const currentPlayer = gameState.players[gameState.currentPlayerId]

    // 檢查是否為 AI 玩家的回合
    if (!currentPlayer || !currentPlayer.isAI || aiExecuting) {
      return
    }

    const executeAITurn = async () => {
      setAiExecuting(true)

      try {
        console.log(`[AI] Executing AI turn for ${currentPlayer.name} (${currentPlayer.difficulty})`)

        // 獲取 AI 決策
        const decision = makeAIDecision(
          currentPlayer.difficulty,
          gameState,
          gameState.currentPlayerId
        )

        console.log(`[AI] Decision:`, decision)

        // 延遲執行 (模擬思考時間)
        await new Promise(resolve => setTimeout(resolve, decision.delay || 1000))

        // 執行 AI 動作
        await executeAIAction(roomId, gameState, decision)
      } catch (error) {
        console.error('[AI] Error executing AI turn:', error)
      } finally {
        setAiExecuting(false)
      }
    }

    // 延遲執行,避免太快
    const timeoutId = setTimeout(executeAITurn, 500)

    return () => clearTimeout(timeoutId)
  }, [gameState, roomId, aiExecuting])

  return { aiExecuting }
}
```

**使用範例**:
```javascript
const GameBoard = ({ roomId }) => {
  const { gameState } = useGameState(roomId)
  const { aiExecuting } = useAI(gameState, roomId)

  return (
    <div className="game-board">
      {aiExecuting && (
        <div className="ai-thinking-indicator">
          AI is thinking...
        </div>
      )}
      {/* ... */}
    </div>
  )
}
```

---

### 3.2 效能優化模式

#### 3.2.1 React.memo 使用

**何時使用**: 組件接收的 props 很少改變,且渲染成本較高

```javascript
/**
 * Card 組件
 * 使用 React.memo 避免不必要的重新渲染
 */
const Card = React.memo(
  ({ card, selected, onClick, disabled }) => {
    console.log(`[Card] Rendering ${card.name}`)

    return (
      <div
        className={`card card--${card.color} ${selected ? 'card--selected' : ''} ${disabled ? 'card--disabled' : ''}`}
        onClick={disabled ? undefined : onClick}
      >
        <div className="card__emoji">{card.emoji}</div>
        <div className="card__name">{card.name}</div>
        {card.value > 0 && <div className="card__value">{card.value}</div>}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // 自定義比較函數
    return (
      prevProps.card.id === nextProps.card.id &&
      prevProps.selected === nextProps.selected &&
      prevProps.disabled === nextProps.disabled
    )
  }
)

Card.displayName = 'Card'
```

**何時不使用**:
- Props 頻繁改變的組件
- 渲染成本很低的簡單組件
- 需要在每次父組件更新時都重新渲染的組件

---

#### 3.2.2 useMemo 使用

**何時使用**: 計算成本高且依賴項不常變化

```javascript
const ScorePanel = ({ player, gameState }) => {
  // ✅ 好的使用: 計分邏輯複雜且成本高
  const scoreBreakdown = useMemo(() => {
    return calculateScore(
      player.hand || [],
      player.playedPairs || [],
      { includeColorBonus: true }
    )
  }, [player.hand, player.playedPairs])

  // ✅ 好的使用: 過濾和排序操作
  const sortedPlayers = useMemo(() => {
    return Object.entries(gameState.players)
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => b.score - a.score)
  }, [gameState.players])

  // ❌ 不需要: 簡單計算
  const handSize = player.hand.length // 直接計算即可,不需要 useMemo

  return (
    <div className="score-panel">
      <div>Total Score: {scoreBreakdown.total}</div>
      <div>Base: {scoreBreakdown.base}</div>
      <div>Pairs: {scoreBreakdown.pairs}</div>
      {/* ... */}
    </div>
  )
}
```

---

#### 3.2.3 useCallback 使用

**何時使用**: 函數被傳遞給子組件,且子組件使用 React.memo

```javascript
const PlayerHand = ({ cards, onCardClick }) => {
  const [selectedCards, setSelectedCards] = useState([])

  // ✅ 好的使用: 傳遞給 React.memo 子組件的函數
  const handleCardClick = useCallback(
    card => {
      if (selectedCards.some(c => c.id === card.id)) {
        // 取消選擇
        setSelectedCards(selectedCards.filter(c => c.id !== card.id))
      } else {
        // 選擇卡片
        setSelectedCards([...selectedCards, card])
      }

      onCardClick(card)
    },
    [selectedCards, onCardClick]
  )

  return (
    <div className="player-hand">
      {cards.map(card => (
        <Card
          key={card.id}
          card={card}
          selected={selectedCards.some(c => c.id === card.id)}
          onClick={handleCardClick}
        />
      ))}
    </div>
  )
}
```

**依賴陣列規則**:
```javascript
// ✅ 正確: 包含所有使用的外部變數
const handleClick = useCallback(() => {
  console.log(count)
  setCount(count + 1)
}, [count])

// ❌ 錯誤: 遺漏依賴項
const handleClick = useCallback(() => {
  console.log(count) // count 在依賴陣列中缺失
  setCount(count + 1)
}, [])

// ✅ 使用函數更新避免依賴
const handleClick = useCallback(() => {
  setCount(prevCount => prevCount + 1)
}, [])
```

---

## 4. Firebase 實作模式

### 4.1 事務 (Transactions) 使用

**何時使用**: 需要原子性更新,防止並發衝突

```javascript
/**
 * 使用事務更新回合
 * 防止多個玩家同時結束回合
 */
const nextTurn = async roomId => {
  const gameStateRef = ref(database, `rooms/${roomId}/gameState`)

  await runTransaction(gameStateRef, currentState => {
    if (!currentState) {
      console.error('[Transaction] Game state is null')
      return currentState // 中止事務
    }

    // 檢查遊戲狀態是否允許換回合
    if (currentState.roundEnded) {
      console.warn('[Transaction] Round has ended, cannot advance turn')
      return // 中止事務
    }

    // 計算下一個玩家
    const playerIds = Object.keys(currentState.players)
    const currentIndex = playerIds.indexOf(currentState.currentPlayerId)
    const nextIndex = (currentIndex + 1) % playerIds.length

    // 更新遊戲狀態
    currentState.currentPlayerId = playerIds[nextIndex]
    currentState.currentPlayerIndex = nextIndex
    currentState.turnPhase = 'draw'
    currentState.turnCount = (currentState.turnCount || 0) + 1

    console.log(`[Transaction] Advanced to player ${playerIds[nextIndex]}`)

    return currentState // 提交更新
  })
}
```

**事務最佳實踐**:
```javascript
// ✅ 好的事務使用
await runTransaction(ref, currentData => {
  if (!currentData) return currentData // 檢查 null

  // 簡單的邏輯
  currentData.counter += 1

  return currentData
})

// ❌ 不好的事務使用
await runTransaction(ref, async currentData => {
  // ❌ 事務函數不應該是 async
  const result = await someAsyncOperation()
  currentData.value = result
  return currentData
})

// ❌ 不需要事務的情況
await runTransaction(ref, currentData => {
  // 如果不需要讀取舊值,直接用 set/update 即可
  return { newValue: 123 }
})
```

---

### 4.2 監聽器管理

**原則**: 始終清理監聽器,避免記憶體洩漏

```javascript
/**
 * ✅ 正確的監聽器使用
 */
useEffect(() => {
  const roomRef = ref(database, `rooms/${roomId}`)

  const unsubscribe = onValue(roomRef, snapshot => {
    const data = snapshot.val()
    setRoomData(data)
  })

  // 清理函數
  return () => {
    off(roomRef) // 或 unsubscribe()
  }
}, [roomId])

/**
 * ❌ 錯誤: 忘記清理監聽器
 */
useEffect(() => {
  const roomRef = ref(database, `rooms/${roomId}`)

  onValue(roomRef, snapshot => {
    const data = snapshot.val()
    setRoomData(data)
  })

  // ❌ 沒有清理函數,導致記憶體洩漏
}, [roomId])
```

**多個監聽器的清理**:
```javascript
useEffect(() => {
  const gameStateRef = ref(database, `rooms/${roomId}/gameState`)
  const playersRef = ref(database, `rooms/${roomId}/players`)

  const unsubscribe1 = onValue(gameStateRef, handleGameStateUpdate)
  const unsubscribe2 = onValue(playersRef, handlePlayersUpdate)

  return () => {
    unsubscribe1()
    unsubscribe2()
  }
}, [roomId])
```

---

### 4.3 樂觀 UI 更新

**策略**: 先更新本地狀態,再同步到 Firebase

```javascript
/**
 * 樂觀 UI 更新範例: 選擇卡片
 */
const handleCardSelect = async card => {
  // 1. 立即更新本地狀態 (樂觀更新)
  setSelectedCards(prev => [...prev, card])

  try {
    // 2. 同步到 Firebase
    await update(ref(database, `rooms/${roomId}/players/${myPlayerId}`), {
      selectedCards: [...selectedCards, card.id]
    })
  } catch (error) {
    // 3. 如果失敗,回滾本地狀態
    console.error('[Optimistic Update] Failed:', error)
    setSelectedCards(prev => prev.filter(c => c.id !== card.id))
    showNotification('Failed to select card. Please try again.', 'error')
  }
}
```

**何時使用樂觀更新**:
- ✅ 高頻操作 (卡片選擇、UI 互動)
- ✅ 預期成功率高的操作
- ✅ 用戶體驗要求即時反饋

**何時不使用**:
- ❌ 關鍵遊戲邏輯 (打出配對、宣告)
- ❌ 需要伺服器驗證的操作
- ❌ 失敗後難以回滾的操作

---

## 5. 錯誤處理機制

### 5.1 錯誤邊界 (Error Boundaries)

**實作**:
```javascript
/**
 * ErrorBoundary Component
 * 捕獲子組件樹中的 JavaScript 錯誤
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    // 更新狀態以顯示備用 UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // 記錄錯誤到控制台
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)

    // 可選: 發送錯誤到日誌服務
    // logErrorToService(error, errorInfo)

    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error && this.state.error.toString()}</pre>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={this.handleReset}>Try again</button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 使用 ErrorBoundary
 */
function App() {
  return (
    <ErrorBoundary>
      <GameBoard />
    </ErrorBoundary>
  )
}
```

---

### 5.2 非同步錯誤處理

**模式**: Try-Catch + 用戶通知

```javascript
/**
 * 標準非同步操作錯誤處理
 */
const handleDrawCard = async source => {
  setLoading(true)

  try {
    // 執行操作
    await drawCard(roomId, myPlayerId, source)

    // 成功通知
    showNotification('Card drawn successfully', 'success')
  } catch (error) {
    console.error('[Draw Card] Error:', error)

    // 用戶友好的錯誤訊息
    let message = 'Failed to draw card. Please try again.'

    if (error.code === 'PERMISSION_DENIED') {
      message = 'You do not have permission to perform this action.'
    } else if (error.code === 'NETWORK_ERROR') {
      message = 'Network error. Please check your connection.'
    }

    showNotification(message, 'error')
  } finally {
    setLoading(false)
  }
}
```

---

### 5.3 驗證與防禦性編程

**輸入驗證**:
```javascript
/**
 * 驗證函數參數
 */
export function calculateScore(hand, playedPairs, options = {}) {
  // 參數驗證
  if (!Array.isArray(hand)) {
    console.error('[calculateScore] hand must be an array')
    return { total: 0, base: 0, pairs: 0, multipliers: 0, mermaids: 0, colorBonus: 0 }
  }

  if (!Array.isArray(playedPairs)) {
    console.error('[calculateScore] playedPairs must be an array')
    playedPairs = []
  }

  // ... 計分邏輯
}

/**
 * 防禦性檢查
 */
const PlayerHand = ({ cards, onCardClick }) => {
  // 防禦性檢查: cards 可能為 undefined
  const safeCards = cards || []

  return (
    <div className="player-hand">
      {safeCards.map(card => (
        <Card key={card.id} card={card} onClick={onCardClick} />
      ))}
    </div>
  )
}
```

---

## 6. 測試規範

### 6.1 單元測試

**目標覆蓋率**: 80%+

**測試框架**: Vitest

**測試結構**:
```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { calculateScore } from './scoreService'

describe('scoreService', () => {
  describe('calculateScore', () => {
    let hand, playedPairs, options

    beforeEach(() => {
      hand = []
      playedPairs = []
      options = { includeColorBonus: false }
    })

    it('應該正確計算空手牌的分數', () => {
      const result = calculateScore(hand, playedPairs, options)
      expect(result.total).toBe(0)
    })

    it('應該正確計算貝殼分數', () => {
      hand = [
        { name: 'Shell', value: 0 },
        { name: 'Shell', value: 0 },
        { name: 'Shell', value: 0 }
      ]
      const result = calculateScore(hand, playedPairs, options)
      expect(result.base).toBe(4) // (3-1) * 2
    })

    it('應該正確計算美人魚分數', () => {
      hand = [
        { name: 'Mermaid', color: 'white' },
        { name: 'Fish', color: 'blue' },
        { name: 'Crab', color: 'blue' },
        { name: 'Shell', color: 'blue' }
      ]
      const result = calculateScore(hand, playedPairs, options)
      expect(result.mermaids).toBe(3) // 第1張美人魚 = 最多的藍色 (3張)
    })

    it('應該處理無效輸入', () => {
      const result = calculateScore(null, null, options)
      expect(result.total).toBe(0)
    })
  })
})
```

**關鍵測試案例**:
1. **正常流程**: 測試預期輸入和輸出
2. **邊緣案例**: 空陣列、單一元素、極大值
3. **錯誤處理**: null、undefined、無效類型
4. **複雜邏輯**: 美人魚計分、Last Chance 模式

---

### 6.2 整合測試

**測試 React 組件與 Firebase 互動**:
```javascript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import GameBoard from './GameBoard'

// Mock Firebase
vi.mock('../services/firebaseService', () => ({
  listenToRoom: vi.fn((roomId, callback) => {
    const mockData = {
      gameState: {
        currentPlayerId: 'player1',
        turnPhase: 'draw',
        players: {
          player1: { hand: [], playedPairs: [] }
        }
      }
    }
    callback(mockData)
    return vi.fn() // unsubscribe function
  }),
  drawCard: vi.fn()
}))

describe('GameBoard Integration', () => {
  it('應該顯示抽牌按鈕當輪到玩家時', async () => {
    render(<GameBoard roomId="test-room" myPlayerId="player1" />)

    await waitFor(() => {
      expect(screen.getByText('Draw from Deck')).toBeInTheDocument()
    })
  })

  it('應該呼叫 drawCard 當點擊抽牌按鈕', async () => {
    const { drawCard } = await import('../services/firebaseService')

    render(<GameBoard roomId="test-room" myPlayerId="player1" />)

    const drawButton = await screen.findByText('Draw from Deck')
    await userEvent.click(drawButton)

    expect(drawCard).toHaveBeenCalledWith('test-room', 'player1', 'deck')
  })
})
```

---

### 6.3 E2E 測試

**使用 Playwright**:
```javascript
import { test, expect } from '@playwright/test'

test.describe('完整遊戲流程', () => {
  test('玩家可以建立房間並開始遊戲', async ({ page }) => {
    // 1. 進入首頁
    await page.goto('http://localhost:5173')

    // 2. 建立房間
    await page.fill('[data-testid="player-name-input"]', 'Test Player')
    await page.click('[data-testid="create-room-button"]')

    // 3. 等待進入房間
    await expect(page.locator('[data-testid="room-code"]')).toBeVisible()

    // 4. 新增 AI 玩家
    await page.click('[data-testid="add-ai-button"]')
    await page.selectOption('[data-testid="ai-difficulty"]', 'easy')
    await page.click('[data-testid="confirm-ai-button"]')

    // 5. 開始遊戲
    await page.click('[data-testid="start-game-button"]')

    // 6. 驗證遊戲開始
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
    await expect(page.locator('[data-testid="player-hand"]')).toBeVisible()
  })

  test('玩家可以抽牌並打出配對', async ({ page }) => {
    // 假設已進入遊戲...

    // 1. 抽牌
    await page.click('[data-testid="draw-deck-button"]')

    // 2. 等待手牌更新
    await page.waitForTimeout(1000)

    // 3. 選擇兩張相同卡片
    const cards = page.locator('[data-testid="hand-card"]')
    await cards.first().click()
    await cards.nth(1).click()

    // 4. 打出配對
    await page.click('[data-testid="play-pair-button"]')

    // 5. 驗證配對成功
    await expect(page.locator('[data-testid="played-pairs"]')).toContainText('1 pair')
  })
})
```

---

## 7. 效能優化策略

### 7.1 Firebase 查詢優化

**使用索引**:
```json
{
  "rules": {
    "rooms": {
      ".indexOn": ["status", "createdAt"]
    }
  }
}
```

**限制查詢結果**:
```javascript
// ✅ 好: 限制結果數量
const roomsQuery = query(
  ref(database, 'rooms'),
  orderByChild('status'),
  equalTo('waiting'),
  limitToFirst(10)
)

// ❌ 不好: 查詢所有房間
const roomsQuery = ref(database, 'rooms')
```

---

### 7.2 程式碼分割

**路由層級分割**:
```javascript
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('./pages/HomePage'))
const RoomLobby = lazy(() => import('./pages/RoomLobby'))
const GameBoard = lazy(() => import('./pages/GameBoard'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<RoomLobby />} />
        <Route path="/game/:roomId" element={<GameBoard />} />
      </Routes>
    </Suspense>
  )
}
```

---

### 7.3 資源優化

**圖片優化**:
- 使用 WebP 格式
- 提供多種尺寸 (responsive images)
- Lazy loading

**CSS 優化**:
- 使用 CSS Grid 而非複雜的 Flexbox 嵌套
- 避免深層選擇器
- 使用 CSS 變數減少重複

**JavaScript 優化**:
- Tree shaking (Vite 自動處理)
- 避免大型第三方庫
- 使用 Web Workers 處理重運算

---

## 8. 程式碼組織規範

### 8.1 檔案命名規範

```
組件: PascalCase
  - PlayerHand.jsx
  - ScorePanel.jsx

工具/服務: camelCase
  - cardHelpers.js
  - gameService.js

常數: UPPER_SNAKE_CASE
  - constants.js (export const MAX_PLAYERS = 4)

CSS: kebab-case (與組件同名)
  - player-hand.css
  - score-panel.css
```

---

### 8.2 Import 順序

```javascript
// 1. React 核心
import React, { useState, useEffect } from 'react'

// 2. 第三方庫
import { ref, onValue } from 'firebase/database'

// 3. 本地服務層
import { calculateScore } from '../services/scoreService'
import { listenToRoom } from '../services/firebaseService'

// 4. 本地組件
import Card from '../components/common/Card/Card'
import PlayerHand from '../components/game/PlayerHand/PlayerHand'

// 5. 工具函數
import { shuffleDeck } from '../utils/cardHelpers'

// 6. 常數
import { MAX_HAND_SIZE } from '../utils/constants'

// 7. CSS
import './GameBoard.css'
```

---

### 8.3 註解規範

**函數註解**:
```javascript
/**
 * Calculate the total score for a player
 *
 * Combines all scoring components:
 * - Base score (card values)
 * - Pair bonuses
 * - Multipliers
 * - Mermaid scores
 * - Color bonuses (optional)
 *
 * @param {Array<Object>} hand - Player's hand cards
 * @param {Array<Object>} playedPairs - Played pairs
 * @param {Object} options - Scoring options
 * @param {boolean} [options.includeColorBonus=false] - Include color bonus
 * @returns {Object} Score breakdown
 *
 * @example
 * const hand = [{ name: 'Fish', value: 0, color: 'blue' }]
 * const score = calculateScore(hand, [], { includeColorBonus: true })
 * console.log(score.total) // 1
 */
export function calculateScore(hand, playedPairs, options = {}) {
  // ...
}
```

**複雜邏輯註解**:
```javascript
// Calculate mermaid score
// Rule: 1st mermaid = most common color count
//       2nd mermaid = 2nd most common color count
//       etc.
const mermaidScore = calculateMermaidScore(hand, playedPairs)
```

---

## 9. 部署與建置

### 9.1 Vite 建置配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 輸出目錄
    outDir: 'dist',
    // Source maps (生產環境關閉)
    sourcemap: false,
    // 最小化
    minify: 'terser',
    // Chunk 分割策略
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Firebase
          'firebase-vendor': ['firebase/app', 'firebase/database'],
          // 遊戲邏輯
          'game-logic': [
            './src/services/gameService.js',
            './src/services/scoreService.js'
          ]
        }
      }
    }
  },
  // 開發伺服器配置
  server: {
    port: 5173,
    open: true
  }
})
```

---

### 9.2 Firebase Hosting 部署

**步驟**:
```bash
# 1. 建置生產版本
npm run build

# 2. 初始化 Firebase Hosting (首次)
firebase init hosting

# 3. 部署
firebase deploy --only hosting

# 4. 查看部署 URL
firebase hosting:channel:list
```

**firebase.json 配置**:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

### 9.3 環境變數管理

**開發環境** (`.env.local`):
```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=my-game.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://my-game.firebaseio.com
VITE_FIREBASE_PROJECT_ID=my-game
VITE_FIREBASE_STORAGE_BUCKET=my-game.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**生產環境** (Firebase Functions 或 Hosting):
```javascript
// 在 Firebase Hosting 部署時,環境變數會從 .env.production 讀取
// 或使用 Firebase Functions config
firebase functions:config:set app.api_key="xxx"
```

---

## 結語

本文檔提供了 Sea Salt & Paper 遊戲的完整實作細節規範。遵循這些規範可以確保:

✅ **代碼品質**: 一致的編碼風格和最佳實踐
✅ **可維護性**: 清晰的結構和充分的文檔
✅ **可測試性**: 全面的測試覆蓋
✅ **效能**: 優化的渲染和網路請求
✅ **可擴展性**: 模組化設計,易於添加新功能

配合其他規範文件 (`01-GAME_RULES.md`, `02-TECHNICAL_ARCHITECTURE.md`, `03-UIUX_DESIGN.md`, `04-DATA_STRUCTURES.md`),開發者可以完整重現此遊戲。

---

**文件版本**: 1.0.0
**撰寫日期**: 2025-01-13
**適用專案**: Sea Salt & Paper Online Multiplayer Card Game
