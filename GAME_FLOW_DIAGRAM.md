# 🌊 海鹽與紙牌 - 完整遊戲流程圖

## 總覽流程

```mermaid
graph TD
    Start([遊戲開始]) --> CreateRoom[創建/加入房間]
    CreateRoom --> Lobby[遊戲大廳]
    Lobby --> SetupPlayers{設置玩家}
    SetupPlayers --> AddAI[添加 AI 玩家]
    SetupPlayers --> StartGame[開始遊戲]

    StartGame --> NewRound[新回合開始]
    NewRound --> InitDeck[初始化牌堆<br/>每人2張起始手牌]
    InitDeck --> TurnLoop[玩家回合循環]

    TurnLoop --> DrawPhase[抽牌階段]
    DrawPhase --> DrawChoice{選擇抽牌來源}
    DrawChoice -->|牌堆| DrawDeck[從牌堆抽2張<br/>選1張棄1張]
    DrawChoice -->|左棄牌堆| DrawLeft[拿左側棄牌堆頂牌]
    DrawChoice -->|右棄牌堆| DrawRight[拿右側棄牌堆頂牌]

    DrawDeck --> CardEffect{卡牌效果?}
    DrawLeft --> PairPhase
    DrawRight --> PairPhase

    CardEffect -->|企鵝| PenguinEffect[配對獎勵×2]
    CardEffect -->|無| PairPhase[配對階段]

    PenguinEffect --> PairPhase
    PairPhase --> PlayPairs{打組合牌?}

    PlayPairs -->|是| SelectPair[選擇要打的配對]
    PlayPairs -->|否| CheckScore{分數 >= 7?}

    SelectPair --> PairEffect{配對效果?}

    PairEffect -->|魚Fish| FishEffect[配對抽1張]
    PairEffect -->|螃蟹Crab| CrabEffect[從棄牌堆拿1張]
    PairEffect -->|帆船Sailboat| SailboatEffect[額外回合]
    PairEffect -->|鯊魚+游泳者| SharkEffect[偷對手1張牌]
    PairEffect -->|無| PairPhase

    FishEffect --> PairPhase
    CrabEffect --> PairPhase
    SailboatEffect --> DrawPhase
    SharkEffect --> PairPhase

    CheckScore -->|否| NextPlayer[下一位玩家]
    CheckScore -->|是| DeclarePhase[宣告階段]

    DeclarePhase --> DeclareChoice{AI/玩家選擇}
    DeclareChoice -->|跳過| NextPlayer
    DeclareChoice -->|到此為止 Stop| StopDeclare[立即結束回合]
    DeclareChoice -->|最後機會 Last Chance| LastChance[其他玩家各一回合]

    StopDeclare --> ShowScore[展示宣告者分數]
    LastChance --> ShowScore
    ShowScore --> RoundEnd[回合結算]

    NextPlayer --> CheckLastChance{Last Chance?}
    CheckLastChance -->|是| DecrementTurns[剩餘回合-1]
    CheckLastChance -->|否| TurnLoop

    DecrementTurns --> CheckRemaining{剩餘 > 0?}
    CheckRemaining -->|是| TurnLoop
    CheckRemaining -->|否| RoundEnd

    RoundEnd --> Settlement[結算動畫]
    Settlement --> CalculateScore[計算所有玩家分數]
    CalculateScore --> DetermineWinner[決定回合贏家]

    DetermineWinner --> CheckDeclarer{宣告者<br/>分數最高?}
    CheckDeclarer -->|Stop-是| StopBonus[+5分<br/>+顏色獎勵]
    CheckDeclarer -->|Stop-否| StopPenalty[0分]
    CheckDeclarer -->|Last Chance-是| LastChanceBonus[+原始分數<br/>+顏色獎勵]
    CheckDeclarer -->|Last Chance-否| LastChancePenalty[0分]
    CheckDeclarer -->|無宣告| NormalScore[原始分數]

    StopBonus --> UpdateTotal[更新總分]
    StopPenalty --> UpdateTotal
    LastChanceBonus --> UpdateTotal
    LastChancePenalty --> UpdateTotal
    NormalScore --> UpdateTotal

    UpdateTotal --> CheckGameEnd{總分 >= 30?}
    CheckGameEnd -->|是| GameOver[遊戲結束<br/>顯示最終贏家]
    CheckGameEnd -->|否| NextRound[準備下一回合]

    NextRound --> NewRound
    GameOver --> End([結束])
```

## 詳細階段說明

### 1️⃣ 遊戲初始化
- **房間創建**: 玩家創建或加入房間
- **玩家設置**: 添加人類玩家或 AI 玩家（最多4人）
- **開始遊戲**: 初始化牌堆，每人發2張牌

### 2️⃣ 回合階段

#### 抽牌階段 (Draw Phase)
```mermaid
graph LR
    A[抽牌階段] --> B{選擇來源}
    B -->|牌堆| C[抽2張選1張]
    B -->|左棄牌堆| D[拿頂牌]
    B -->|右棄牌堆| E[拿頂牌]
    C --> F[棄1張到棄牌堆]
    D --> G[進入配對階段]
    E --> G
    F --> G
```

#### 配對階段 (Pair Phase)
```mermaid
graph TD
    A[配對階段] --> B{有可打的配對?}
    B -->|是| C[選擇配對]
    B -->|否| D[結束回合]
    C --> E{配對效果}
    E -->|Fish| F[立即抽1張]
    E -->|Crab| G[從棄牌堆拿1張]
    E -->|Sailboat| H[獲得額外回合]
    E -->|Shark+Swimmer| I[偷對手1張牌]
    F --> A
    G --> A
    H --> J[回到抽牌階段]
    I --> A
```

#### 宣告階段 (Declare Phase)
```mermaid
graph TD
    A[分數 >= 7] --> B{選擇宣告?}
    B -->|跳過| C[結束回合]
    B -->|到此為止 Stop| D[立即結算<br/>成功+5分+顏色<br/>失敗0分]
    B -->|最後機會 Last Chance| E[其他玩家各一回合<br/>成功保留分數+顏色<br/>失敗0分]
    C --> F[下一位玩家]
    D --> G[回合結算]
    E --> H[剩餘回合倒數]
    H --> I{剩餘 > 0?}
    I -->|是| F
    I -->|否| G
```

### 3️⃣ 計分系統

#### 基礎計分
```
1. 手牌分數：每張牌的點數相加
2. 配對獎勵：每個已打出的配對 +1 分
3. 倍數卡：企鵝配對使配對獎勵 ×2
4. 特殊卡：
   - FishSchool (魚群): 每條Fish額外 +1
   - Captain (船長): 每位Swimmer額外 +3
```

#### 美人魚計分（特殊規則）
```
每條美人魚 = 第N多的顏色數量
- 第1條美人魚 = 最多的顏色數量
- 第2條美人魚 = 第2多的顏色數量
```

#### 顏色獎勵
```
只有 Stop 成功 或 Last Chance 成功才能獲得
擁有最多某種顏色：該顏色數量作為額外分數
```

### 4️⃣ 宣告模式對照表

| 宣告模式 | 條件 | 成功 | 失敗 |
|---------|------|------|------|
| **Stop** | 立即結算 | 原始分數 + 5 + 顏色獎勵 | 0 分 |
| **Last Chance** | 其他玩家各一回合 | 原始分數 + 顏色獎勵 | 0 分 |
| **無宣告** | - | 原始分數（無顏色獎勵） | - |

### 5️⃣ 遊戲結束條件

```mermaid
graph LR
    A[回合結束] --> B[累加本回合分數]
    B --> C{任何玩家<br/>總分 >= 30?}
    C -->|是| D[遊戲結束<br/>總分最高者獲勝]
    C -->|否| E[開始新回合]
```

## 卡牌類型與效果

### 基礎卡牌
| 卡牌 | 點數 | 配對效果 | 數量 |
|------|------|----------|------|
| Fish (魚) | 0-3 | 配對抽1張 | 多張 |
| Crab (螃蟹) | 0-3 | 配對從棄牌堆拿1張 | 多張 |
| Shell (貝殼) | 0-3 | 無 | 多張 |
| Penguin (企鵝) | 0 | 配對獎勵×2 | 2張 |

### 特殊卡牌
| 卡牌 | 點數 | 效果 |
|------|------|------|
| Mermaid (美人魚) | 0 | 特殊計分 |
| Sailboat (帆船) | 0 | 配對獲得額外回合 |
| Shark (鯊魚) | 0 | 配對+游泳者=偷牌 |
| Swimmer (游泳者) | 0 | 配對+鯊魚=偷牌 |
| FishSchool (魚群) | 0 | 每條Fish +1 |
| Captain (船長) | 0 | 每位Swimmer +3 |
| PenguinColony (企鵝群) | 0 | 每隻Penguin +1 |

## AI 決策流程

```mermaid
graph TD
    A[AI 回合開始] --> B[抽牌決策]
    B --> C{評估選項}
    C -->|牌堆未知| D[優先抽牌堆]
    C -->|棄牌有價值| E[評估棄牌價值<br/>可配對+2<br/>收集+1]

    E --> F{選擇最佳來源}
    F --> G[配對決策]

    G --> H{尋找可打配對}
    H -->|有| I[評估配對價值<br/>效果+分數]
    H -->|無| J[結束回合]

    I --> K{打出配對}
    K --> L{分數 >= 7?}

    L -->|是| M[宣告決策]
    L -->|否| J

    M --> N{分數 >= 15?}
    N -->|是| O[宣告 Stop]
    N -->|否| P{分數 >= 10?}

    P -->|是| Q[隨機 50% Stop]
    P -->|否| R[跳過宣告]

    O --> S[回合結束]
    Q --> S
    R --> J
    J --> S
```

## 測試關鍵時刻

### 📸 需要截圖的時刻
1. ✅ **遊戲初始化**: 所有玩家就緒，牌堆初始化
2. ✅ **首次配對**: 第一位玩家打出配對
3. ✅ **特殊效果觸發**:
   - 偷牌效果 (Shark+Swimmer)
   - 額外回合 (Sailboat)
   - 從棄牌堆拿牌 (Crab)
4. ✅ **宣告時刻**:
   - AI 宣告 "到此為止 (Stop)"
   - AI 宣告 "最後機會 (Last Chance)"
5. ✅ **回合結算**: 展示所有玩家分數
6. ✅ **遊戲結束**: 最終贏家宣布

---

**Created**: 2025-12-24
**Version**: 1.0
**For**: Playwright E2E Testing Reference
