# AI 訓練計劃 - Sea Salt & Paper

## 📋 目標

透過大規模自我對弈（幾千局遊戲），讓 AI 透過試錯學習，找到最優秀的遊戲策略。

## 🎯 核心概念

### 方法選擇：遺傳算法（Genetic Algorithm）

**為什麼選擇遺傳算法？**
- ✅ 簡單易實現（不需要深度學習框架）
- ✅ 適合參數調優（AI 決策權重）
- ✅ 易於理解和調試
- ✅ 可以在瀏覽器/Node.js 中執行
- ✅ 不需要大量計算資源

**基本流程：**
```
1. 創建初始族群（多個不同參數的 AI）
2. 讓 AI 們互相對戰
3. 評估每個 AI 的表現（勝率、平均分數）
4. 選擇表現好的 AI 繁殖（交叉、突變）
5. 淘汰表現差的 AI
6. 重複 2-5 步驟，持續演化
```

---

## 🏗️ 技術架構

### 1. AI 決策參數化

當前 AI (`aiService.js`) 需要改造為**參數驅動**的決策系統。

#### 決策參數（基因）

```javascript
const AIGenome = {
  // 抽牌偏好
  drawDeckWeight: 0.5,           // 抽牌堆權重 (0-1)
  drawDiscardWeight: 0.5,        // 棄牌堆權重 (0-1)

  // 配對策略
  pairThreshold: 7,              // 打出配對的最低分數門檻 (5-10)
  earlyGamePairBonus: 1.2,       // 前期打配對的加成 (1.0-2.0)
  lateGamePairPenalty: 0.8,      // 後期打配對的懲罰 (0.5-1.0)

  // 宣告策略
  declareThreshold: 9,           // 宣告的最低分數 (7-15)
  lastChanceThreshold: 12,       // Last Chance 宣告門檻 (10-20)
  riskTolerance: 0.5,            // 風險容忍度 (0-1)

  // 顏色策略
  colorFocusWeight: 1.5,         // 專注收集顏色的權重 (1.0-3.0)
  multiColorPenalty: 0.7,        // 分散顏色的懲罰 (0.3-1.0)

  // 特殊卡優先級
  mermaidPriority: 2.0,          // 美人魚優先級 (1.0-3.0)
  multiplierPriority: 1.8,       // 倍數卡優先級 (1.0-3.0)
  shellPriority: 1.3,            // 貝殼優先級 (1.0-2.0)

  // 防守策略
  blockOpponentWeight: 0.6,      // 阻止對手的權重 (0-1)
  cardCountAwareness: 0.8,       // 對手手牌數量警覺 (0-1)

  // 回合階段權重
  earlyGameRounds: 3,            // 前期回合數 (2-5)
  midGameRounds: 6,              // 中期回合數 (4-8)
  // 後期 = 其餘回合
}
```

### 2. 族群系統

```javascript
class AIPopulation {
  constructor(size = 50) {
    this.size = size              // 族群大小
    this.generation = 0           // 當前世代
    this.genomes = []             // AI 基因組
    this.fitness = []             // 適應度分數
  }

  // 初始化隨機族群
  initialize() {
    for (let i = 0; i < this.size; i++) {
      this.genomes.push(this.randomGenome())
    }
  }

  // 生成隨機基因
  randomGenome() {
    return {
      id: `ai-${Date.now()}-${Math.random()}`,
      drawDeckWeight: Math.random(),
      drawDiscardWeight: Math.random(),
      pairThreshold: 5 + Math.random() * 5,
      declareThreshold: 7 + Math.random() * 8,
      lastChanceThreshold: 10 + Math.random() * 10,
      riskTolerance: Math.random(),
      colorFocusWeight: 1.0 + Math.random() * 2.0,
      multiColorPenalty: 0.3 + Math.random() * 0.7,
      mermaidPriority: 1.0 + Math.random() * 2.0,
      multiplierPriority: 1.0 + Math.random() * 2.0,
      shellPriority: 1.0 + Math.random(),
      blockOpponentWeight: Math.random(),
      cardCountAwareness: Math.random(),
      earlyGameRounds: 2 + Math.floor(Math.random() * 4),
      midGameRounds: 4 + Math.floor(Math.random() * 5),
      earlyGamePairBonus: 1.0 + Math.random(),
      lateGamePairPenalty: 0.5 + Math.random() * 0.5
    }
  }
}
```

### 3. 競技場系統

```javascript
class Arena {
  // 讓兩個 AI 對戰
  async playMatch(genome1, genome2, rounds = 3) {
    const results = {
      player1Wins: 0,
      player2Wins: 0,
      player1TotalScore: 0,
      player2TotalScore: 0,
      draws: 0
    }

    for (let i = 0; i < rounds; i++) {
      const roundResult = await this.playRound(genome1, genome2)

      if (roundResult.winner === 1) {
        results.player1Wins++
      } else if (roundResult.winner === 2) {
        results.player2Wins++
      } else {
        results.draws++
      }

      results.player1TotalScore += roundResult.player1Score
      results.player2TotalScore += roundResult.player2Score
    }

    return results
  }

  // 單局遊戲
  async playRound(genome1, genome2) {
    // 創建遊戲狀態
    const gameState = initializeGame([
      { id: 'ai1', genome: genome1, isAI: true },
      { id: 'ai2', genome: genome2, isAI: true }
    ])

    // 執行遊戲直到結束
    while (!gameState.finished) {
      const currentPlayer = gameState.players[gameState.currentPlayerId]
      const decision = makeAIDecisionWithGenome(
        gameState,
        currentPlayer.genome
      )

      // 執行決策
      gameState = applyDecision(gameState, decision)
    }

    return {
      winner: gameState.winnerId === 'ai1' ? 1 : 2,
      player1Score: gameState.players.ai1.totalScore,
      player2Score: gameState.players.ai2.totalScore
    }
  }
}
```

### 4. 適應度評估

```javascript
class FitnessEvaluator {
  // 計算 AI 的適應度分數
  evaluateGenome(genome, matchResults) {
    const winRate = matchResults.wins / matchResults.totalGames
    const avgScore = matchResults.totalScore / matchResults.totalGames
    const avgWinMargin = matchResults.totalWinMargin / matchResults.wins || 0

    // 綜合評分公式
    const fitness =
      winRate * 100 +                    // 勝率最重要
      avgScore * 0.5 +                   // 平均分數
      avgWinMargin * 0.2 +               // 勝利幅度
      (matchResults.lastChanceWins * 5)  // Last Chance 獲勝獎勵

    return fitness
  }

  // 讓每個 AI 與多個對手對戰
  async evaluatePopulation(population) {
    const arena = new Arena()
    const matchResults = []

    // 每個 AI 與其他 AI 對戰
    for (let i = 0; i < population.genomes.length; i++) {
      const genome = population.genomes[i]
      const results = {
        wins: 0,
        totalGames: 0,
        totalScore: 0,
        totalWinMargin: 0,
        lastChanceWins: 0
      }

      // 隨機選擇 10 個對手對戰
      const opponents = this.selectRandomOpponents(population.genomes, i, 10)

      for (const opponent of opponents) {
        const match = await arena.playMatch(genome, opponent, 3)

        results.totalGames += 3
        results.wins += match.player1Wins
        results.totalScore += match.player1TotalScore
        results.totalWinMargin += (match.player1TotalScore - match.player2TotalScore)
      }

      const fitness = this.evaluateGenome(genome, results)
      matchResults.push({ genome, fitness, results })
    }

    return matchResults
  }

  selectRandomOpponents(genomes, excludeIndex, count) {
    const opponents = []
    const available = genomes.filter((_, i) => i !== excludeIndex)

    for (let i = 0; i < count && i < available.length; i++) {
      const randomIndex = Math.floor(Math.random() * available.length)
      opponents.push(available.splice(randomIndex, 1)[0])
    }

    return opponents
  }
}
```

### 5. 遺傳演化

```javascript
class GeneticEvolution {
  // 選擇（Selection）
  selectParents(population, fitnessScores) {
    // 輪盤賭選擇（Roulette Wheel Selection）
    const totalFitness = fitnessScores.reduce((sum, f) => sum + f, 0)
    const selected = []

    for (let i = 0; i < population.size / 2; i++) {
      const randomValue = Math.random() * totalFitness
      let sum = 0

      for (let j = 0; j < population.genomes.length; j++) {
        sum += fitnessScores[j]
        if (sum >= randomValue) {
          selected.push(population.genomes[j])
          break
        }
      }
    }

    return selected
  }

  // 交叉（Crossover）
  crossover(parent1, parent2) {
    const child = {}

    // 單點交叉
    const keys = Object.keys(parent1).filter(k => k !== 'id')
    const crossoverPoint = Math.floor(Math.random() * keys.length)

    keys.forEach((key, index) => {
      child[key] = index < crossoverPoint ? parent1[key] : parent2[key]
    })

    child.id = `ai-${Date.now()}-${Math.random()}`
    return child
  }

  // 突變（Mutation）
  mutate(genome, mutationRate = 0.1) {
    const mutated = { ...genome }

    Object.keys(mutated).forEach(key => {
      if (key === 'id') return

      if (Math.random() < mutationRate) {
        // 高斯突變（添加隨機噪音）
        const noise = (Math.random() - 0.5) * 0.4

        if (typeof mutated[key] === 'number') {
          mutated[key] += noise

          // 確保在合理範圍內
          if (key.includes('Weight') || key.includes('tolerance') || key.includes('Awareness')) {
            mutated[key] = Math.max(0, Math.min(1, mutated[key]))
          } else if (key.includes('Threshold')) {
            mutated[key] = Math.max(5, Math.min(20, mutated[key]))
          } else if (key.includes('Priority')) {
            mutated[key] = Math.max(1, Math.min(3, mutated[key]))
          }
        }
      }
    })

    return mutated
  }

  // 生成下一代
  evolve(population, fitnessScores) {
    const parents = this.selectParents(population, fitnessScores)
    const nextGeneration = []

    // 精英保留（保留最好的 10%）
    const elite = population.genomes
      .map((genome, index) => ({ genome, fitness: fitnessScores[index] }))
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, Math.floor(population.size * 0.1))
      .map(e => e.genome)

    nextGeneration.push(...elite)

    // 交叉和突變生成新個體
    while (nextGeneration.length < population.size) {
      const parent1 = parents[Math.floor(Math.random() * parents.length)]
      const parent2 = parents[Math.floor(Math.random() * parents.length)]

      const child = this.crossover(parent1, parent2)
      const mutatedChild = this.mutate(child)

      nextGeneration.push(mutatedChild)
    }

    population.genomes = nextGeneration
    population.generation++

    return population
  }
}
```

---

## 🚀 訓練流程

### 完整訓練腳本

```javascript
// scripts/trainAI.js

class AITrainer {
  constructor(config = {}) {
    this.populationSize = config.populationSize || 50
    this.generations = config.generations || 100
    this.matchesPerEvaluation = config.matchesPerEvaluation || 10
    this.mutationRate = config.mutationRate || 0.1

    this.population = new AIPopulation(this.populationSize)
    this.evolution = new GeneticEvolution()
    this.evaluator = new FitnessEvaluator()

    this.history = []
  }

  async train() {
    console.log('🎮 開始 AI 訓練...')
    console.log(`族群大小: ${this.populationSize}`)
    console.log(`世代數: ${this.generations}`)
    console.log(`每次評估對戰數: ${this.matchesPerEvaluation}`)

    // 初始化族群
    this.population.initialize()

    for (let gen = 0; gen < this.generations; gen++) {
      console.log(`\n📊 世代 ${gen + 1}/${this.generations}`)

      // 評估當前族群
      const evaluationResults = await this.evaluator.evaluatePopulation(
        this.population
      )

      // 提取適應度分數
      const fitnessScores = evaluationResults.map(r => r.fitness)

      // 記錄統計數據
      const stats = this.calculateStats(evaluationResults)
      this.history.push(stats)

      console.log(`  最高適應度: ${stats.maxFitness.toFixed(2)}`)
      console.log(`  平均適應度: ${stats.avgFitness.toFixed(2)}`)
      console.log(`  最低適應度: ${stats.minFitness.toFixed(2)}`)
      console.log(`  最佳勝率: ${(stats.bestWinRate * 100).toFixed(1)}%`)

      // 保存最佳 AI
      if (gen % 10 === 0) {
        await this.saveBestAI(evaluationResults)
      }

      // 演化到下一代
      this.population = this.evolution.evolve(
        this.population,
        fitnessScores
      )
    }

    // 訓練完成，保存最終結果
    await this.saveResults()

    console.log('\n✅ 訓練完成！')
  }

  calculateStats(evaluationResults) {
    const fitnessValues = evaluationResults.map(r => r.fitness)
    const winRates = evaluationResults.map(r =>
      r.results.wins / r.results.totalGames
    )

    return {
      generation: this.population.generation,
      maxFitness: Math.max(...fitnessValues),
      avgFitness: fitnessValues.reduce((a, b) => a + b) / fitnessValues.length,
      minFitness: Math.min(...fitnessValues),
      bestWinRate: Math.max(...winRates),
      avgWinRate: winRates.reduce((a, b) => a + b) / winRates.length
    }
  }

  async saveBestAI(evaluationResults) {
    const best = evaluationResults
      .sort((a, b) => b.fitness - a.fitness)[0]

    const fs = require('fs').promises
    await fs.writeFile(
      `trained-ai/best-ai-gen${this.population.generation}.json`,
      JSON.stringify(best.genome, null, 2)
    )

    console.log(`  💾 已保存最佳 AI (適應度: ${best.fitness.toFixed(2)})`)
  }

  async saveResults() {
    const fs = require('fs').promises

    // 保存訓練歷史
    await fs.writeFile(
      'trained-ai/training-history.json',
      JSON.stringify(this.history, null, 2)
    )

    // 生成圖表數據
    const chartData = {
      generations: this.history.map(h => h.generation),
      maxFitness: this.history.map(h => h.maxFitness),
      avgFitness: this.history.map(h => h.avgFitness),
      bestWinRate: this.history.map(h => h.bestWinRate)
    }

    await fs.writeFile(
      'trained-ai/chart-data.json',
      JSON.stringify(chartData, null, 2)
    )
  }
}

// 執行訓練
const trainer = new AITrainer({
  populationSize: 50,      // 50 個 AI
  generations: 100,        // 100 代演化
  matchesPerEvaluation: 10 // 每個 AI 對戰 10 個對手
})

trainer.train().then(() => {
  console.log('訓練結束！')
  process.exit(0)
})
```

---

## 📊 性能估算

### 計算量

**單代訓練：**
- 族群大小: 50
- 每個 AI 對戰 10 個對手
- 每場對戰 3 局
- 總遊戲數: 50 × 10 × 3 = **1,500 局 / 代**

**完整訓練：**
- 100 代
- 總遊戲數: 1,500 × 100 = **150,000 局**

### 時間估算

假設每局遊戲 2 秒（自動化無延遲）：
- 單代時間: 1,500 × 2s = 3,000s ≈ **50 分鐘**
- 完整訓練: 150,000 × 2s = 300,000s ≈ **83 小時**

**優化方案：**
1. **並行處理**：同時執行多場遊戲（Node.js Worker Threads）
   - 8 核心 CPU → 時間縮短至 **10 小時**
2. **減少遊戲局數**：每次對戰只打 1 局
   - 時間縮短至 **28 小時**
3. **快速模式**：跳過動畫、簡化日誌
   - 每局 0.5 秒 → 總時間 **7 小時**

---

## 🎯 實施步驟

### 階段 1：重構 AI 服務（1-2 天）

**目標：** 將 AI 決策改為參數驅動

**文件：**
- `src/services/aiServiceParametric.js` - 新的參數化 AI
- `src/data/aiGenome.js` - AI 基因定義

**任務：**
1. ✅ 定義 AI 基因結構
2. ✅ 重寫 `makeAIDecision` 使用基因參數
3. ✅ 實現決策評分系統
4. ✅ 測試參數化 AI 能正常遊戲

### 階段 2：建立訓練框架（2-3 天）

**目標：** 實現遺傳算法核心

**文件：**
- `scripts/ai-training/AIPopulation.js`
- `scripts/ai-training/Arena.js`
- `scripts/ai-training/FitnessEvaluator.js`
- `scripts/ai-training/GeneticEvolution.js`

**任務：**
1. ✅ 實現族群系統
2. ✅ 實現競技場系統
3. ✅ 實現適應度評估
4. ✅ 實現遺傳演化（選擇、交叉、突變）

### 階段 3：遊戲模擬器（1-2 天）

**目標：** 創建無 UI 的快速遊戲模擬

**文件：**
- `scripts/ai-training/GameSimulator.js`

**任務：**
1. ✅ 提取遊戲邏輯（不依賴 Firebase）
2. ✅ 實現快速遊戲執行
3. ✅ 記錄遊戲統計數據

### 階段 4：執行訓練（3-7 天）

**目標：** 執行大規模訓練

**任務：**
1. ✅ 小規模測試（10 代，10 族群）
2. ✅ 中規模測試（50 代，30 族群）
3. ✅ 大規模訓練（100 代，50 族群）
4. ✅ 分析訓練結果

### 階段 5：整合最佳 AI（1 天）

**目標：** 將訓練好的 AI 整合到遊戲中

**任務：**
1. ✅ 載入最佳基因參數
2. ✅ 替換舊的 AI 服務
3. ✅ 測試遊戲表現
4. ✅ 調整難度級別

---

## 📈 監控與分析

### 訓練過程監控

**即時指標：**
- 當前世代
- 最高適應度
- 平均適應度
- 最佳勝率
- 訓練進度 (%)

**保存數據：**
```json
{
  "generation": 45,
  "maxFitness": 127.3,
  "avgFitness": 89.5,
  "minFitness": 52.1,
  "bestWinRate": 0.78,
  "avgWinRate": 0.52,
  "bestGenome": { ... },
  "timestamp": "2025-12-15T10:30:00Z"
}
```

### 可視化工具

**建議使用：**
1. **Chart.js** - 繪製適應度曲線
2. **D3.js** - 族群演化樹狀圖
3. **TensorBoard** (選用) - 進階分析

**圖表類型：**
- 適應度演化曲線（最高、平均、最低）
- 勝率變化趨勢
- 參數分布熱圖
- AI 決策樹

---

## 🔧 優化技巧

### 1. 加速訓練

**並行處理：**
```javascript
// 使用 Worker Threads
const { Worker } = require('worker_threads')

class ParallelArena {
  async evaluatePopulationParallel(population) {
    const workers = []
    const chunkSize = Math.ceil(population.size / 8) // 8 個 worker

    for (let i = 0; i < 8; i++) {
      const chunk = population.genomes.slice(
        i * chunkSize,
        (i + 1) * chunkSize
      )

      workers.push(new Promise((resolve) => {
        const worker = new Worker('./worker.js', {
          workerData: { genomes: chunk }
        })
        worker.on('message', resolve)
      }))
    }

    const results = await Promise.all(workers)
    return results.flat()
  }
}
```

### 2. 早停機制

```javascript
class EarlyStopping {
  constructor(patience = 10, minDelta = 0.01) {
    this.patience = patience
    this.minDelta = minDelta
    this.bestFitness = -Infinity
    this.counter = 0
  }

  shouldStop(currentFitness) {
    if (currentFitness > this.bestFitness + this.minDelta) {
      this.bestFitness = currentFitness
      this.counter = 0
      return false
    }

    this.counter++
    return this.counter >= this.patience
  }
}
```

### 3. 自適應突變率

```javascript
class AdaptiveMutation {
  constructor() {
    this.baseRate = 0.1
    this.minRate = 0.01
    this.maxRate = 0.3
  }

  getMutationRate(generation, fitnessProgress) {
    // 如果進步停滯，提高突變率探索
    if (fitnessProgress < 0.01) {
      return Math.min(this.baseRate * 1.5, this.maxRate)
    }

    // 後期降低突變率精調
    if (generation > 70) {
      return Math.max(this.baseRate * 0.5, this.minRate)
    }

    return this.baseRate
  }
}
```

---

## 🎓 預期成果

### 成功指標

**基礎目標：**
- ✅ AI 勝率 > 60%（對抗隨機 AI）
- ✅ AI 平均分數 > 20 分/局
- ✅ Last Chance 宣告成功率 > 70%

**進階目標：**
- ✅ AI 勝率 > 45%（對抗人類玩家）
- ✅ AI 能識別並執行複雜組合策略
- ✅ AI 能根據對手行為調整策略

### 可學習的策略

**預期 AI 會發現：**
1. **顏色集中策略** - 專注收集 1-2 種顏色
2. **美人魚+顏色** - 優先拿美人魚配合顏色
3. **倍數卡配對** - 燈塔+帆船、企鵝+企鵝群
4. **防守性棄牌** - 避免給對手有用的牌
5. **時機把握** - 何時宣告、何時打配對
6. **Last Chance 判斷** - 分數優勢時的決策

---

## 🚀 快速開始

### 安裝依賴

```bash
npm install --save-dev worker_threads
```

### 執行訓練

```bash
# 測試訓練（快速驗證）
node scripts/trainAI.js --test

# 正式訓練
node scripts/trainAI.js --generations 100 --population 50

# 恢復訓練（從上次斷點繼續）
node scripts/trainAI.js --resume trained-ai/checkpoint-gen45.json
```

### 使用訓練好的 AI

```javascript
// src/services/aiService.js
import bestGenome from '../trained-ai/best-ai-final.json'

export function makeAIDecision(gameState, playerId) {
  return makeAIDecisionWithGenome(gameState, playerId, bestGenome)
}
```

---

## 📚 參考資料

### 遺傳算法
- [Introduction to Genetic Algorithms](https://www.geeksforgeeks.org/genetic-algorithms/)
- [Genetic Algorithms in JavaScript](https://blog.logrocket.com/genetic-algorithms-in-javascript/)

### 強化學習（進階選項）
- [Q-Learning Tutorial](https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning/)
- [Deep Q-Network (DQN)](https://pytorch.org/tutorials/intermediate/reinforcement_q_learning.html)

### 遊戲 AI
- [AlphaGo Zero](https://www.deepmind.com/research/highlighted-research/alphago) - 自我對弈學習
- [OpenAI Five](https://openai.com/research/openai-five) - 多智能體訓練

---

## ⚠️ 注意事項

1. **計算資源**
   - 需要至少 4GB RAM
   - 建議使用多核心 CPU
   - 訓練時間可能需要數小時到數天

2. **隨機性**
   - 遺傳算法有隨機性，多次訓練結果可能不同
   - 建議執行 3-5 次取最佳結果

3. **過擬合風險**
   - AI 可能過度適應特定對手
   - 需要與多樣化對手訓練

4. **人類可玩性**
   - 太強的 AI 可能讓玩家沮喪
   - 建議提供多個難度級別（簡單、中等、困難、大師）

---

## 🎯 總結

透過遺傳算法訓練，我們可以：

✅ **自動發現** 最優策略（無需手動編程）
✅ **大規模對弈** 數千到數萬局遊戲
✅ **持續進化** AI 會隨著訓練變得更強
✅ **可解釋性** 可以查看最佳 AI 的參數，理解其策略
✅ **易於實現** 不需要深度學習框架，純 JavaScript 即可

**下一步：** 選擇要實施的階段，我們可以逐步建立訓練系統！

---

**文件版本：** v1.0
**最後更新：** 2025-12-15
**作者：** Claude Code
