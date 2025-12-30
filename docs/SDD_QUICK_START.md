# SDD 系統快速開始指南

> **5 分鐘內開始使用 AI 自動對戰系統**

---

## 📋 前置需求

- Node.js 18+ 已安裝
- 專案已安裝依賴（`npm install`）

---

## 🚀 快速開始

### 步驟 1: 驗證安裝

```bash
# 檢查 Node.js 版本
node --version  # 應該 >= 18.0.0

# 進入專案目錄
cd board-game-sea-salt-paper

# 確保依賴已安裝
npm install
```

### 步驟 2: 運行第一場測試

```bash
# 運行單場詳細測試
npm run battle:single -- --verbose
```

**預期輸出**:
```
🎮 AI Battle System - Single Game Mode
======================================

Creating game with strategies: hard vs medium

[Game Start] game_xxx
  Player 0: hard
  Player 1: medium
  Deck size: 72

[Turn 1] player_0 (hard)
  Phase: draw
  Decision: draw from deck
  Result: drew 2 cards

[Turn 1] player_0 (hard)
  Phase: pair
  Decision: play Fish + Fish pair (draw_blind effect)
  Result: success, drew 1 extra card

...

[Game End] game_xxx
  Winner: player_0 (hard)
  Final Score: 15 - 11
  Total Turns: 18
  Duration: 1.2s

✅ Game completed successfully!
📊 Results saved to: ./scripts/output/session_xxx/
```

### 步驟 3: 查看結果

```bash
# 列出輸出文件
ls scripts/output/session_*/

# 查看遊戲摘要
cat scripts/output/session_*/games_*.json

# 查看 Bug 報告
cat scripts/output/session_*/errors_*.json
```

---

## 📊 常用命令

### 測試命令

```bash
# 快速測試（10 場遊戲）
npm run battle:quick

# 完整測試（100 場遊戲）
npm run battle:full

# 大規模測試（500 場遊戲）
npm run battle:extensive

# 單場詳細測試
npm run battle:single -- --verbose
```

### 自定義命令

```bash
# 運行特定數量的遊戲
npm run battle -- --games 50

# 測試特定策略組合
npm run battle -- --matchup hard medium --games 20

# 收集訓練數據
npm run battle -- --games 200 --training

# 啟用 Firebase 同步
npm run battle -- --games 100 --firebase
```

---

## 📁 輸出文件說明

執行後在 `scripts/output/session_xxx/` 目錄會生成：

| 文件 | 說明 | 大小（100場遊戲） |
|------|------|------------------|
| `games_*.json` | 所有遊戲記錄 | ~500 KB |
| `turns_*.json` | 所有回合詳情 | ~5 MB |
| `decisions_*.json` | AI 決策記錄 | ~3 MB |
| `errors_*.json` | Bug 和錯誤報告 | ~50 KB |
| `anomalies_*.json` | 異常檢測結果 | ~30 KB |
| `training_data_*.csv` | ML 訓練數據 | ~2 MB |
| `session_summary.json` | 統計摘要 | ~10 KB |

---

## 🔍 查看結果

### 1. 查看統計摘要

```bash
# 使用 jq 美化輸出（如果已安裝）
cat scripts/output/session_*/session_summary.json | jq

# 或直接查看
cat scripts/output/session_*/session_summary.json
```

**示例輸出**:
```json
{
  "totalGames": 100,
  "completedGames": 99,
  "failedGames": 1,
  "strategyStats": {
    "easy": {
      "wins": 15,
      "winRate": 22.7
    },
    "medium": {
      "wins": 28,
      "winRate": 42.4
    },
    "hard": {
      "wins": 56,
      "winRate": 84.8
    }
  }
}
```

### 2. 查看 Bug 報告

```bash
cat scripts/output/session_*/errors_*.json
```

**如果有 Bug**:
```json
{
  "totalIssues": 3,
  "criticalIssues": [
    {
      "type": "potential_infinite_loop",
      "gameId": "game_042",
      "turnNumber": 245,
      "description": "Game stuck, pendingEffect not clearing"
    }
  ]
}
```

### 3. 查看訓練數據

```bash
# 查看前 10 行
head -n 10 scripts/output/session_*/training_data_*.csv
```

---

## ⚠️ 常見問題

### Q1: 模組導入錯誤

**錯誤**: `Cannot find module 'xxx'`

**解決**:
```bash
# 確保所有依賴已安裝
npm install

# 如果問題持續，清除 node_modules
rm -rf node_modules package-lock.json
npm install
```

### Q2: 遊戲卡死/超時

**錯誤**: `Game exceeded max turns (1000)`

**原因**: 發現了無限循環 bug

**解決**:
1. 查看 `errors_*.json` 中的詳細信息
2. 檢查 `infinite_loop` 類型的異常
3. 修復相關代碼邏輯（通常在 `useGameState.js` 的 `endTurn()` 函數）

### Q3: 記憶體不足

**錯誤**: `JavaScript heap out of memory`

**解決**:
```bash
# 方案 1: 減少遊戲數量
npm run battle -- --games 50

# 方案 2: 增加 Node.js 記憶體限制
node --max-old-space-size=4096 scripts/runBattle.js --games 500
```

### Q4: 找不到輸出文件

**問題**: `scripts/output/` 目錄為空

**檢查**:
1. 確認命令正確執行完成
2. 查看控制台是否有錯誤
3. 確認當前目錄是專案根目錄

---

## 🎯 下一步

### 選項 1: 分析 Bug 報告

```bash
# 1. 查看錯誤報告
cat scripts/output/session_*/errors_*.json

# 2. 找到 critical bugs
grep -A 10 '"severity": "critical"' scripts/output/session_*/errors_*.json

# 3. 修復代碼
# 根據 affectedCode 字段定位問題

# 4. 重新測試驗證
npm run battle:quick
```

### 選項 2: 訓練 AI

```bash
# 1. 收集大量訓練數據
npm run battle -- --games 500 --training

# 2. 查看訓練數據
head -n 20 scripts/output/session_*/training_data_*.csv

# 3. 使用機器學習工具訓練模型
# 例如: Python + scikit-learn, TensorFlow, PyTorch
```

### 選項 3: 平衡性調整

根據統計數據調整遊戲參數：

```javascript
// 如果 Hard AI 勝率過高 (>90%)
// 調整 src/services/aiService.js 中的評估函數

// 如果遊戲時間過長 (>30 回合)
// 調整 src/data/gameRules.js 中的 TARGET_SCORES
```

---

## 📚 進階使用

### 並行執行（實驗性）

```bash
# 使用 GNU parallel（需要另外安裝）
seq 1 10 | parallel -j 4 "node scripts/runBattle.js --games 50 --output ./scripts/output/parallel_{}"
```

### 持續集成

```yaml
# .github/workflows/battle-test.yml
name: AI Battle Test

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run battle:quick
      - uses: actions/upload-artifact@v2
        with:
          name: battle-results
          path: scripts/output/
```

### 定時執行

```bash
# Linux crontab
# 每天凌晨 2 點執行 500 場測試
0 2 * * * cd /path/to/project && npm run battle:extensive
```

---

## 🆘 需要幫助？

1. **查看完整文檔**: `docs/SDD_ARCHITECTURE.md`
2. **查看示例輸出**: `docs/SDD_EXAMPLE_OUTPUT.md`
3. **查看 API 文檔**: `docs/SDD_API_REFERENCE.md`

---

## ✅ 檢查清單

運行系統前確認：

- [ ] Node.js >= 18.0.0
- [ ] 已運行 `npm install`
- [ ] 專案根目錄有 `scripts/` 文件夾
- [ ] 可以訪問 `scripts/output/` 目錄（會自動創建）

運行後驗證：

- [ ] 看到 "Game completed successfully" 消息
- [ ] `scripts/output/` 目錄有新的 session 文件夾
- [ ] 可以打開並查看 JSON 文件
- [ ] 沒有 `ERR_MODULE_NOT_FOUND` 錯誤

---

**祝您測試順利！** 🎉
