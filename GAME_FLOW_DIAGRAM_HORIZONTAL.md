# 🌊 海鹽與紙牌 - 遊戲流程圖（橫向版本）

> 💡 **提示**：此版本使用橫向佈局（LR），適合在 Obsidian 等 Markdown 編輯器中查看

## 簡化總覽流程（橫向）

```mermaid
graph LR
    Start([開始]) --> Room[創建房間]
    Room --> Setup[添加玩家]
    Setup --> Game[開始遊戲]
    Game --> Round[回合循環]
    Round --> End([遊戲結束])
```

## 詳細遊戲流程（分段顯示）

### 第一階段：遊戲初始化

```mermaid
graph LR
    A([遊戲開始]) --> B[創建/加入房間]
    B --> C[遊戲大廳]
    C --> D{設置玩家}
    D --> E[添加 AI]
    D --> F[開始遊戲]
    F --> G[初始化牌堆<br/>發起始手牌]
    G --> H[第一回合開始]
```

### 第二階段：玩家回合流程

```mermaid
graph LR
    A[玩家回合] --> B[抽牌階段]
    B --> C{選擇來源}
    C -->|牌堆| D[抽2選1]
    C -->|左棄牌堆| E[拿頂牌]
    C -->|右棄牌堆| F[拿頂牌]
    D --> G[配對階段]
    E --> G
    F --> G
    G --> H{打配對?}
    H -->|是| I[觸發效果]
    H -->|否| J[檢查宣告]
    I --> J
```

### 第三階段：宣告與結算

```mermaid
graph LR
    A{分數>=7?} -->|否| B[下一位玩家]
    A -->|是| C{選擇宣告}
    C -->|跳過| B
    C -->|Stop| D[立即結算]
    C -->|Last Chance| E[其他玩家各一回合]
    D --> F[計分]
    E --> F
    F --> G{總分>=30?}
    G -->|否| H[下一回合]
    G -->|是| I([遊戲結束])
```

### 第四階段：AI 決策流程

```mermaid
graph LR
    A[AI回合] --> B{抽牌決策}
    B --> C[評估棄牌價值]
    C --> D[選擇最佳來源]
    D --> E{尋找配對}
    E -->|有| F{評估價值}
    E -->|無| G[結束]
    F --> H{分數>=15?}
    H -->|是| I[宣告Stop]
    H -->|否| J{分數>=10?}
    J -->|是| K[50%機率Stop]
    J -->|否| G
    I --> G
    K --> G
```

### 第五階段：計分系統

```mermaid
graph LR
    A[回合結算] --> B[計算基礎分數]
    B --> C[加上配對獎勵]
    C --> D{有宣告?}
    D -->|Stop成功| E[+5分+顏色獎勵]
    D -->|Stop失敗| F[0分]
    D -->|Last Chance成功| G[保留分數+顏色]
    D -->|Last Chance失敗| F
    D -->|無宣告| H[原始分數]
    E --> I[更新總分]
    F --> I
    G --> I
    H --> I
```

## 特殊效果流程

### Fish 配對效果

```mermaid
graph LR
    A[打出Fish配對] --> B[立即抽1張牌]
    B --> C[繼續配對階段]
```

### Crab 配對效果

```mermaid
graph LR
    A[打出Crab配對] --> B[從棄牌堆選1張]
    B --> C[加入手牌]
    C --> D[繼續配對階段]
```

### Sailboat 配對效果

```mermaid
graph LR
    A[打出Sailboat配對] --> B[獲得額外回合]
    B --> C[回到抽牌階段]
```

### Shark+Swimmer 組合

```mermaid
graph LR
    A[打出Shark+Swimmer] --> B[選擇對手]
    B --> C[偷取1張手牌]
    C --> D[繼續配對階段]
```

---

## 💡 Obsidian 查看技巧

1. **切換到閱讀模式**：按 `Ctrl+E`
2. **調整縮放**：`Ctrl+-` 縮小，`Ctrl+0` 重置
3. **全螢幕查看**：按 `F11`
4. **匯出為 PDF**：右鍵 → Export to PDF

## 🔗 相關文檔

- 完整版流程圖：`GAME_FLOW_DIAGRAM.md`
- 測試指南：`E2E_TEST_GUIDE.md`
- 測試報告模板：`AI_BATTLE_TEST_REPORT.md`
