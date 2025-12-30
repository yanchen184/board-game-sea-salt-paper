# AI Training - Improved Evaluation System

**Date**: 2025-12-30
**Status**: ✅ Implemented & Testing

---

## Problem Identified

第一次訓練（100 代，50 族群）失敗：
- 訓練完成於第 16 代（早停觸發）
- 最佳適應度：516.01（第 1 代）
- **最終基準測試：18% 勝率 vs 基線 AI**

### 根本原因

1. **評估不一致**：訓練時 AI 只對抗訓練 AI，測試時對抗基線 AI
2. **相對進步陷阱**：AI 在弱對手中互相競爭，但對強基線無效
3. **早停過於積極**：耐心值 15 代，在第 16 代停止

---

## Solution: 改進評估方式

### 核心改進

**新適應度公式**：
```javascript
fitness = (對基線 AI 的勝率) × 100 + (對訓練 AI 的勝率) × 50
```

### 實現細節

#### 1. FitnessEvaluator.js 改進

**追蹤基線表現**：
```javascript
evaluateGenome(genome, opponents, options = {}) {
  const { trackBaselinePerformance = false } = options

  const results = {
    // ... 原有字段
    baselineWins: 0,
    baselineLosses: 0,
    baselineDraws: 0,
    baselineTotalGames: 0
  }

  for (const opponent of opponents) {
    const isBaselineOpponent = trackBaselinePerformance &&
      (opponent.id === 'baseline' || opponent === this.baselineGenome)

    // 遊戲進行...

    if (isBaselineOpponent) {
      results.baselineWins++ // 記錄對基線的勝利
      results.baselineTotalGames++
    }
  }
}
```

**新適應度計算**：
```javascript
calculateFitness(results) {
  let fitness = 0

  // 對基線 AI 的勝率（權重 100）
  if (results.baselineTotalGames > 0) {
    const baselineWinRate = results.baselineWins / results.baselineTotalGames
    fitness += baselineWinRate * 100
  }

  // 對訓練 AI 的勝率（權重 50）
  const trainingGames = results.totalGames - results.baselineTotalGames
  if (trainingGames > 0) {
    const trainingWins = results.wins - results.baselineWins
    const trainingWinRate = trainingWins / trainingGames
    fitness += trainingWinRate * 50
  }

  // 額外獎勵：Last Chance、美人魚、快速勝利
  fitness += results.lastChanceWins * this.weights.lastChanceWin
  fitness += results.mermaidWins * this.weights.mermaidWin
  // ... 其他獎勵

  return fitness
}
```

**每一代測試基線**：
```javascript
evaluatePopulation(population, options = {}) {
  // 確保基線 genome 有 ID 標記
  const baselineWithId = { ...this.baselineGenome, id: 'baseline' }

  for (let i = 0; i < population.length; i++) {
    const genome = population[i]
    const opponents = []

    // 必須包含基線 AI
    if (useBaseline) {
      opponents.push(baselineWithId)
    }

    // 添加隨機訓練對手
    const randomOpponents = this.shuffleArray(available).slice(0, randomOpponentCount)
    opponents.push(...randomOpponents)

    // 啟用基線表現追蹤
    const results = this.evaluateGenome(genome, opponents, {
      trackBaselinePerformance: true
    })

    const baselineWinRate = results.baselineTotalGames > 0
      ? results.baselineWins / results.baselineTotalGames
      : 0

    evaluations.push({
      genome,
      genomeIndex: i,
      fitness: this.calculateFitness(results),
      results,
      winRate: results.wins / results.totalGames,
      baselineWinRate, // 新增：對基線 AI 的勝率
      avgScore: results.totalScore / results.totalGames
    })
  }

  return {
    // ... 其他字段
    bestBaselineWinRate: evaluations[0].baselineWinRate // 新增
  }
}
```

#### 2. TrainingManager.js 改進

**延長早停耐心**：
```javascript
// Training Control (改進：放寬早停限制)
enableEarlyStopping: true,
earlyStoppingPatience: 30, // 增加從 15 → 30
earlyStoppingMinDelta: 0.1, // 降低從 0.5 → 0.1
```

**報告基線勝率**：
```javascript
const historyEntry = {
  generation: this.generation + 1,
  maxFitness: stats.maxFitness,
  avgFitness: stats.avgFitness,
  minFitness: stats.minFitness,
  diversity: stats.diversity,
  bestWinRate: evalResult.bestWinRate,
  bestBaselineWinRate: evalResult.bestBaselineWinRate || 0, // 新增
  evaluationTime: evalTime,
  timestamp: new Date().toISOString()
}

console.log(`  Best vs Baseline: ${((evalResult.bestBaselineWinRate || 0) * 100).toFixed(1)}%`)
```

#### 3. BatchEvaluator 修復

**傳遞基線勝率**：
```javascript
async evaluatePopulation(population, progressCallback = null) {
  // ... 批次處理

  return {
    evaluations: allEvaluations,
    fitnessScores: population.map((_, i) =>
      allEvaluations.find(e => e.genomeIndex === i).fitness
    ),
    bestGenome: allEvaluations[0].genome,
    bestFitness: allEvaluations[0].fitness,
    avgFitness: allEvaluations.reduce((sum, e) => sum + e.fitness, 0) / allEvaluations.length,
    bestWinRate: allEvaluations[0].winRate,
    bestBaselineWinRate: allEvaluations[0].baselineWinRate || 0 // 新增
  }
}
```

---

## Verification

### Quick Test

創建 `quickTest.js` 驗證基線追蹤：

```bash
node scripts/ai-training/quickTest.js
```

**結果**：
```
Random AI vs Baseline AI:
  Total Games: 10
  Baseline Games: 10
  Wins vs Baseline: 4
  Losses vs Baseline: 6
  Win Rate vs Baseline: 40.0%
  Fitness: 50.00
```

✅ 基線追蹤正常運作

### Training Output

**第 1-2 代輸出**：
```
--- Generation 1/100 ---
  NEW BEST! Fitness: 137.78
  Best Win Rate: 66.7%
  Best vs Baseline: 100.0%  ✅ 正確顯示

--- Generation 2/100 ---
  NEW BEST! Fitness: 163.33
  Best Win Rate: 75.0%
  Best vs Baseline: 100.0%  ✅ 持續改進
```

---

## Expected Improvements

### 舊評估方式問題

```
fitness = (整體勝率) × 100 + 其他獎勵

問題：
- AI 在弱對手中互相競爭
- 高勝率但對基線無效
- 訓練方向偏離目標
```

### 新評估方式優勢

```
fitness = (對基線勝率) × 100 + (對訓練勝率) × 50

優勢：
- 每一代都測試對基線的真實表現
- 優先考慮擊敗基線 AI
- 訓練進步可測量、可驗證
- 避免相對進步陷阱
```

---

## Implementation Status

### ✅ Completed

1. `FitnessEvaluator.js`
   - 新增基線表現追蹤字段
   - 修改 `calculateFitness()` 使用新公式
   - 修改 `evaluatePopulation()` 每一代測試基線
   - 修復 `BatchEvaluator` 傳遞基線勝率

2. `TrainingManager.js`
   - 延長早停耐心值（15 → 30）
   - 降低最小改進閾值（0.5 → 0.1）
   - 報告中新增基線勝率

3. `quickTest.js`
   - 創建驗證腳本測試基線追蹤

### 🔄 In Progress

- 運行完整訓練（100 代，50 族群）
- 監控對基線勝率進步趨勢

### 📊 Expected Results

1. **對基線勝率穩定提升**（目標 > 50%）
2. **適應度持續增長**（不會停滯在早期）
3. **早停觸發時機更合理**（至少 30+ 代）
4. **最終基準測試**：>= 60% 勝率 vs 基線

---

## Key Metrics to Track

### 每一代

- Max Fitness（最大適應度）
- Best Win Rate（對所有對手勝率）
- **Best vs Baseline**（對基線勝率）⭐
- Diversity（基因多樣性）

### 最終評估

- 訓練時間
- 早停觸發代數
- 最佳 AI 對基線勝率（訓練期間）
- 最終基準測試（50 場獨立遊戲）

---

## Lessons Learned

1. **評估一致性至關重要**：訓練評估必須與測試評估一致
2. **絕對進步 > 相對進步**：必須對強基線進行測試
3. **早停需謹慎調整**：太激進會錯失真正進步
4. **透明度很重要**：每一代報告基線勝率提供可見進度

---

## Files Modified

1. `scripts/ai-training/FitnessEvaluator.js`
2. `scripts/ai-training/TrainingManager.js`
3. `scripts/ai-training/quickTest.js` (new)
4. `AI_TRAINING_IMPROVED_EVALUATION.md` (this file)

---

**Next Steps**:
- 監控訓練完成（預計 125 分鐘）
- 分析訓練歷史中基線勝率趨勢
- 運行最終基準測試
- 如果結果良好，部署最佳 AI 到遊戲中
