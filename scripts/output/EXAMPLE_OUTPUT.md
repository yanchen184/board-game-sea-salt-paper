# 📊 批次對戰輸出範例

這是運行 `npm run battle:quick` (30場) 後的預期輸出範例。

## 控制台輸出

```
🎮 Starting Batch Battle System
📊 Total Games: 30
🤖 Strategies: easy, medium, hard
📁 Output Directory: ./scripts/output

📋 Total Matchups: 9

🎯 Matchup: easy vs easy
  Progress: 10/30 games

🎯 Matchup: easy vs medium
  Progress: 20/30 games

🎯 Matchup: easy vs hard
  Progress: 30/30 games

✅ Completed 30 games

📊 Analyzing results...

═══════════════════════════════════════════════════════════
  BATCH BATTLE RESULTS
═══════════════════════════════════════════════════════════

Total Games: 30
Generated: 2025-01-14, 10:30:45

────────────────────────────────────────────────────────────
  STRATEGY PERFORMANCE
────────────────────────────────────────────────────────────

EASY:
  Games Played: 20
  Win Rate: 35.00% (7W / 13L)
  Avg Score: 8.45
  Avg Turns: 15.20

MEDIUM:
  Games Played: 20
  Win Rate: 50.00% (10W / 10L)
  Avg Score: 11.23
  Avg Turns: 18.35

HARD:
  Games Played: 20
  Win Rate: 65.00% (13W / 7L)
  Avg Score: 13.67
  Avg Turns: 21.40

────────────────────────────────────────────────────────────
  HEAD-TO-HEAD MATCHUPS
────────────────────────────────────────────────────────────

easy vs easy:
  Games: 4
  easy Win Rate: 50.00%
  easy Win Rate: 50.00%
  Avg Score Difference: 2.75
  Avg Game Length: 14.50 turns

easy vs medium:
  Games: 4
  easy Win Rate: 25.00%
  medium Win Rate: 75.00%
  Avg Score Difference: 4.25
  Avg Game Length: 16.75 turns

easy vs hard:
  Games: 4
  easy Win Rate: 0.00%
  hard Win Rate: 100.00%
  Avg Score Difference: 6.50
  Avg Game Length: 18.25 turns

medium vs easy:
  Games: 4
  medium Win Rate: 75.00%
  easy Win Rate: 25.00%
  Avg Score Difference: 4.00
  Avg Game Length: 17.00 turns

medium vs medium:
  Games: 2
  medium Win Rate: 50.00%
  medium Win Rate: 50.00%
  Avg Score Difference: 1.50
  Avg Game Length: 19.00 turns

medium vs hard:
  Games: 4
  medium Win Rate: 25.00%
  hard Win Rate: 75.00%
  Avg Score Difference: 3.75
  Avg Game Length: 20.50 turns

hard vs easy:
  Games: 4
  hard Win Rate: 100.00%
  easy Win Rate: 0.00%
  Avg Score Difference: 6.75
  Avg Game Length: 19.25 turns

hard vs medium:
  Games: 4
  hard Win Rate: 75.00%
  medium Win Rate: 25.00%
  Avg Score Difference: 3.50
  Avg Game Length: 22.00 turns

hard vs hard:
  Games: 2
  hard Win Rate: 50.00%
  hard Win Rate: 50.00%
  Avg Score Difference: 2.00
  Avg Game Length: 24.50 turns

────────────────────────────────────────────────────────────
  OVERALL PERFORMANCE
────────────────────────────────────────────────────────────

Score Range: 3 - 18
Average Score: 11.12
Turn Range: 12 - 28
Average Turns: 18.32

────────────────────────────────────────────────────────────
  KEY INSIGHTS
────────────────────────────────────────────────────────────

🏆 Best Strategy: hard (Win Rate: 65.00%)

⚠️ Worst Strategy: easy (Win Rate: 35.00%)

📊 Highest Avg Score: hard (13.67 points)

⚡ Fastest Strategy: easy (15.20 avg turns)

⚠️ Large win rate difference detected (30.00%). Game may be unbalanced.

═══════════════════════════════════════════════════════════

📄 Stats saved to: ./scripts/output/battle_stats_2025-01-14T10-30-45.json
📄 Report saved to: ./scripts/output/battle_report_2025-01-14T10-30-45.txt

💾 Results saved to ./scripts/output

🎉 Batch Battle Complete!
```

## 生成的文件

### 1. `battle_stats_2025-01-14T10-30-45.json`

詳細的 JSON 統計數據，包含：

```json
{
  "totalGames": 30,
  "strategies": {
    "easy": {
      "gamesPlayed": 20,
      "wins": 7,
      "losses": 13,
      "totalScore": 169,
      "totalTurns": 304,
      "avgScore": 8.45,
      "avgTurns": 15.2,
      "winRate": 35
    },
    "medium": {
      "gamesPlayed": 20,
      "wins": 10,
      "losses": 10,
      "totalScore": 224.6,
      "totalTurns": 367,
      "avgScore": 11.23,
      "avgTurns": 18.35,
      "winRate": 50
    },
    "hard": {
      "gamesPlayed": 20,
      "wins": 13,
      "losses": 7,
      "totalScore": 273.4,
      "totalTurns": 428,
      "avgScore": 13.67,
      "avgTurns": 21.4,
      "winRate": 65
    }
  },
  "matchups": {
    "easy_vs_medium": {
      "totalGames": 4,
      "strategy1Wins": 1,
      "strategy2Wins": 3,
      "avgScoreDiff": 4.25,
      "avgTurns": 16.75,
      "winRate1": 25,
      "winRate2": 75
    }
    // ... 更多對戰數據
  },
  "performance": {
    "avgScore": 11.12,
    "minScore": 3,
    "maxScore": 18,
    "avgTurns": 18.32,
    "minTurns": 12,
    "maxTurns": 28
  },
  "insights": [
    {
      "type": "best_strategy",
      "message": "🏆 Best Strategy: hard (Win Rate: 65.00%)",
      "data": {
        "strategy": "hard",
        "winRate": 65
      }
    }
    // ... 更多洞察
  ],
  "timestamp": "2025-01-14T02:30:45.123Z"
}
```

### 2. `battle_report_2025-01-14T10-30-45.txt`

可讀的文本報告（與控制台輸出相同格式）

## 如何解讀結果

### ✅ 正常情況

```
HARD:
  Win Rate: 60-70%
  Avg Score: 12-15
  Avg Turns: 20-25
```

**分析**：困難 AI 表現符合預期，略強於其他策略。

### ⚠️ 需要調整

```
MEDIUM:
  Win Rate: 20%
  Avg Score: 6.5
```

**問題**：中等 AI 勝率過低，平均分數不足。

**可能原因**：
- 宣告閾值設定過低，過早結束遊戲
- 沒有有效收集高分牌組
- 對手分數評估不準確

**建議修改**：
```javascript
// aiService.js - makeMediumDecision
const declareThreshold = 7  // 從 5 提高到 7
```

### 🚨 嚴重不平衡

```
KEY INSIGHTS:
⚠️ Large win rate difference detected (50.00%). Game may be unbalanced.
```

**問題**：策略間差距過大，遊戲平衡性需要改善。

**解決方案**：
1. 降低強策略的進攻性（提高宣告閾值）
2. 提升弱策略的決策品質（改善牌組評估）
3. 調整遊戲規則（如果是遊戲本身的問題）

## 實驗範例

### 實驗 1: 調整宣告閾值

**假設**：降低宣告閾值可以提高勝率

**步驟**：

1. 運行基準測試：
```bash
npm run battle:full > baseline.txt
```

2. 修改 `aiService.js`：
```javascript
// 原始值
const declareThreshold = 7

// 改為
const declareThreshold = 5
```

3. 運行實驗：
```bash
npm run battle:full > experiment_lower_threshold.txt
```

4. 比較結果：
```
原始 (threshold=7):  Win Rate: 55%, Avg Score: 12.3
實驗 (threshold=5):  Win Rate: 48%, Avg Score: 10.8
```

**結論**：降低閾值導致勝率下降，因為過早宣告導致分數不足。

**下一步**：嘗試提高閾值到 9。

---

**注意**：這是模擬數據，實際結果將根據 AI 實現和遊戲規則而定。
