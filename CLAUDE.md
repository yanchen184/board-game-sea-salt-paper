# Claude Development Guide - Sea Salt & Paper

## Project Overview

This is an online multiplayer card game based on "Sea Salt & Paper". Players collect cards to score points through pairing, collecting sets, and strategic timing. The game supports 2-4 players with real-time synchronization and AI opponents.

## Technology Stack

### Frontend
- **React 18.2**: UI framework with functional components and hooks
- **Vite 5.0**: Build tool and dev server (fast HMR)
- **CSS3**: Pure CSS with BEM methodology (no framework to reduce bundle size)
- **Firebase Realtime Database**: Real-time multiplayer synchronization
- **UUID**: Unique identifier generation

### Backend / Services
- **Firebase Realtime Database**: Game state, rooms, players
- **Firebase Hosting**: Static site deployment
- **Firebase Cloud Functions** (Optional): Server-side validation, cleanup

### Development Tools
- **Vitest**: Unit testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting (optional)
- **Git**: Version control

## Project Structure

```
board-game-sea-salt-paper/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Button/      # Button.jsx, Button.css
│   │   │   ├── Card/        # Card.jsx, Card.css
│   │   │   ├── Modal/       # Modal.jsx, Modal.css
│   │   │   └── Input/       # Input.jsx, Input.css
│   │   ├── game/            # Game-specific components
│   │   │   ├── PlayerHand/
│   │   │   ├── DiscardPile/
│   │   │   ├── DrawDeck/
│   │   │   ├── ScorePanel/
│   │   │   └── ActionLog/
│   │   └── pages/           # Page components
│   │       ├── HomePage/
│   │       ├── RoomLobby/
│   │       └── GameBoard/
│   ├── services/            # Business logic layer
│   │   ├── gameService.js   # Core game logic
│   │   ├── firebaseService.js
│   │   ├── aiService.js
│   │   └── scoreService.js
│   ├── data/                # Static game data
│   │   ├── cards.js         # 72 card definitions
│   │   └── gameRules.js     # Game rules configuration
│   ├── utils/               # Helper functions
│   │   ├── cardHelpers.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── hooks/               # Custom React hooks
│   │   ├── useGameState.js
│   │   ├── useFirebase.js
│   │   └── useAI.js
│   ├── config/              # Configuration
│   │   └── firebase.js
│   └── styles/              # Global styles
│       ├── global.css
│       ├── variables.css
│       └── animations.css
├── tests/                   # Unit and integration tests
│   ├── unit/
│   └── integration/
├── public/                  # Static assets
├── .env.local              # Environment variables (gitignored)
├── .env.example            # Environment template
├── package.json
├── vite.config.js
├── PLANNING.md             # Architecture & planning
├── TASK.md                 # Task tracking
├── DATABASE_DESIGN.md      # Database schema
├── DESIGN_SPEC.md          # UI/UX specifications
├── FRONTEND_SPEC.md        # Frontend implementation
├── FIREBASE_SPEC.md        # Backend specifications
├── INITIAL.md              # Feature overview
├── CLAUDE.md               # This file
└── README.md               # User documentation
```

## Development Workflow

### Initial Setup

```bash
# Navigate to project directory
cd board-game-sea-salt-paper

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Start development server
npm run dev
```

### Development Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm test            # Run unit tests
npm run test:watch  # Run tests in watch mode
npm run lint        # Lint code with ESLint
```

## Coding Standards

### File Organization

1. **Component Structure**:
   ```
   ComponentName/
   ├── ComponentName.jsx
   └── ComponentName.css
   ```

2. **Max File Size**: 500 lines
   - Split large files into smaller modules
   - Extract helper functions to utils/
   - Extract complex logic to services/

3. **Naming Conventions**:
   - Components: PascalCase (`PlayerHand.jsx`)
   - Utilities: camelCase (`cardHelpers.js`)
   - Constants: UPPER_SNAKE_CASE
   - CSS classes: BEM (`.player-hand__card--selected`)

### React Best Practices

```javascript
// 1. Use functional components with hooks
const PlayerHand = ({ cards, onCardClick }) => {
  const [selectedCards, setSelectedCards] = useState([]);

  // 2. Early returns for guards
  if (!cards || cards.length === 0) {
    return <div className="player-hand--empty">No cards</div>;
  }

  // 3. Descriptive function names with verb prefixes
  const handleCardSelection = (cardId) => {
    setSelectedCards(prev => [...prev, cardId]);
  };

  // 4. Use constants for magic numbers
  const MAX_HAND_SIZE = 10;

  // 5. Memoize expensive calculations
  const sortedCards = useMemo(() => {
    return cards.sort((a, b) => a.value - b.value);
  }, [cards]);

  return (
    <div className="player-hand">
      {sortedCards.map(card => (
        <Card key={card.id} {...card} onClick={handleCardSelection} />
      ))}
    </div>
  );
};

export default PlayerHand;
```

### CSS Conventions

```css
/* Use BEM methodology */
.player-hand { /* Block */ }
.player-hand__card { /* Element */ }
.player-hand__card--selected { /* Modifier */ }

/* Use CSS variables from variables.css */
.player-hand {
  background: var(--secondary-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

/* Mobile-first responsive design */
.player-hand {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .player-hand {
    flex-direction: row;
  }
}
```

### Documentation

```javascript
/**
 * Calculates the total score for a player's hand
 *
 * Reason: Score calculation is complex with multiple bonuses,
 * so we break it down into clear steps for maintainability
 *
 * @param {Array<Object>} hand - Array of card objects
 * @param {Array<Object>} playedPairs - Array of played pair objects
 * @param {Object} settings - Game settings (colorBonus, etc.)
 * @returns {Object} Score breakdown { base, pairs, multipliers, mermaids, color, total }
 */
export const calculateScore = (hand, playedPairs, settings) => {
  // Implementation
};
```

## Firebase Integration

### Configuration

```javascript
// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
```

### Real-time Listeners

```javascript
import { ref, onValue, off } from 'firebase/database';

// Subscribe to game state changes
useEffect(() => {
  const gameRef = ref(database, `rooms/${roomId}/gameState`);

  const unsubscribe = onValue(gameRef, (snapshot) => {
    const gameState = snapshot.val();
    setGameState(gameState);
  });

  // IMPORTANT: Clean up listener on unmount
  return () => off(gameRef);
}, [roomId]);
```

### Atomic Updates

```javascript
import { ref, runTransaction } from 'firebase/database';

// Use transactions for atomic updates (e.g., turn changes)
const nextTurn = async (roomId) => {
  const gameStateRef = ref(database, `rooms/${roomId}/gameState`);

  await runTransaction(gameStateRef, (gameState) => {
    if (!gameState) return gameState;

    const nextIndex = (gameState.currentPlayerIndex + 1) % Object.keys(gameState.players).length;
    gameState.currentPlayerIndex = nextIndex;
    gameState.turnPhase = 'draw';

    return gameState;
  });
};
```

## Testing Guidelines

### Unit Test Structure

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateScore } from './scoreService';

describe('calculateScore', () => {
  let hand, playedPairs, settings;

  beforeEach(() => {
    hand = [];
    playedPairs = [];
    settings = { colorBonus: true, mermaidsWin: true };
  });

  it('should calculate base score correctly', () => {
    hand = [
      { id: 'fish_1', value: 1, color: 'blue' },
      { id: 'crab_1', value: 1, color: 'red' }
    ];

    const result = calculateScore(hand, playedPairs, settings);
    expect(result.base).toBe(2);
    expect(result.total).toBe(2);
  });

  it('should add pair bonus', () => {
    playedPairs = [{ cards: ['fish_1', 'fish_2'] }];

    const result = calculateScore(hand, playedPairs, settings);
    expect(result.pairs).toBe(1);
  });

  // Edge case
  it('should handle empty hand', () => {
    const result = calculateScore([], [], settings);
    expect(result.total).toBe(0);
  });
});
```

### Test Coverage Target

- **Overall**: 80%+
- **Critical paths**: 100% (game logic, scoring, win conditions)
- **UI components**: 60%+ (focus on logic, not rendering)

## Common Pitfalls & Solutions

### 1. Firebase Listener Memory Leaks

**Problem**: Forgetting to unsubscribe from Firebase listeners

**Solution**:
```javascript
useEffect(() => {
  const ref = ref(database, 'path');
  const unsubscribe = onValue(ref, callback);
  return () => off(ref); // Always clean up!
}, []);
```

### 2. Race Conditions in Turn Management

**Problem**: Multiple players trying to take turns simultaneously

**Solution**: Use Firebase transactions
```javascript
await runTransaction(ref, (current) => {
  if (current.locked) return; // Abort if locked
  current.locked = true;
  // Make changes
  return current;
});
```

### 3. Exposing Private Data

**Problem**: Showing other players' hand cards

**Solution**: Store `handCount` separately, only send full `hand` to owner
```javascript
const playerData = {
  hand: isCurrentPlayer ? actualHand : [], // Empty for others
  handCount: actualHand.length // Visible to all
};
```

### 4. Complex Mermaid Scoring

**Problem**: Mermaid scoring logic is confusing (1st = most color, 2nd = 2nd most)

**Solution**: Extract to well-documented function
```javascript
/**
 * Calculate mermaid scores
 * Each mermaid = count of Nth most common color
 */
const calculateMermaidScore = (hand, mermaidCount) => {
  const colorCounts = getColorCounts(hand);
  const sortedCounts = Object.values(colorCounts).sort((a, b) => b - a);

  let total = 0;
  for (let i = 0; i < mermaidCount; i++) {
    total += sortedCounts[i] || 0;
  }
  return total;
};
```

## Git Workflow

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation
- `test`: Adding tests
- `style`: Formatting, CSS
- `chore`: Build, dependencies

**Examples**:
```
feat(game): add drag and drop for card selection

Implemented HTML5 drag and drop API with visual feedback
when hovering over discard piles.

Closes #23
```

```
fix(score): correct mermaid scoring calculation

Mermaids were counting all colors instead of top N colors.
Now properly calculates 1st mermaid = most common color count.
```

## Deployment

### GitHub Actions 自動部署到 GitHub Pages

本專案使用 GitHub Actions 實現自動化部署。每次推送到 `main` 分支時，會自動構建並部署到 GitHub Pages。

#### 配置文件

**`.github/workflows/deploy.yml`**:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.12.0'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_DATABASE_URL: ${{ secrets.VITE_FIREBASE_DATABASE_URL }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**`vite.config.js`** 必須配置 base path:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/board-game-sea-salt-paper/', // Repository 名稱
  // ... other config
})
```

#### 首次設置步驟

1. **安裝 GitHub CLI** (Windows):
```bash
winget install --id GitHub.cli --silent
```

2. **登入 GitHub CLI**:
```bash
"C:\Program Files\GitHub CLI\gh.exe" auth login --with-token < token.txt
```

3. **設置 Firebase 環境變數** (使用 GitHub CLI):
```bash
gh secret set VITE_FIREBASE_API_KEY -b"your-api-key" --repo owner/repo
gh secret set VITE_FIREBASE_AUTH_DOMAIN -b"your-auth-domain" --repo owner/repo
gh secret set VITE_FIREBASE_DATABASE_URL -b"your-database-url" --repo owner/repo
gh secret set VITE_FIREBASE_PROJECT_ID -b"your-project-id" --repo owner/repo
gh secret set VITE_FIREBASE_STORAGE_BUCKET -b"your-storage-bucket" --repo owner/repo
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID -b"your-sender-id" --repo owner/repo
gh secret set VITE_FIREBASE_APP_ID -b"your-app-id" --repo owner/repo
```

4. **啟用 GitHub Pages**:
```bash
gh api repos/owner/repo/pages -X POST -F "build_type=workflow"
```

5. **推送代碼觸發部署**:
```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

#### 常見問題與解決方案

##### 問題 1: Git Remote URL 錯誤

**現象**: 推送時出現 "Permission denied" 或指向錯誤的 repository

**原因**: Git remote URL 配置錯誤，可能指向其他 repository

**解決方案**:
```bash
# 檢查當前 remote
git remote -v

# 如果錯誤，重新設置
git remote set-url origin https://github.com/correct-owner/correct-repo.git

# 驗證
git remote -v
```

**經驗教訓**: 克隆或初始化 repository 後，立即驗證 remote URL 是否正確

---

##### 問題 2: GitHub Actions 找不到 package.json

**現象**:
```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
Process completed with exit code 254
```

**原因**:
- `package.json` 和 `src/` 目錄在 `.gitignore` 中被忽略
- 或者這些文件從未被添加到 git

**解決方案**:
```bash
# 檢查哪些文件未被追蹤
git status

# 添加所有必要的源代碼文件
git add package.json package-lock.json vite.config.js index.html
git add src/ public/

# 提交並推送
git commit -m "feat: add all source files for GitHub Actions"
git push origin main
```

**經驗教訓**:
- 在設置 CI/CD 前，確保所有必要文件都已提交到 git
- 檢查 `.gitignore` 是否意外忽略了重要文件
- 使用 `git status` 和 `git ls-files` 驗證文件追蹤狀態

---

##### 問題 3: GitHub Actions 構建失敗 (缺少 package-lock.json)

**現象**:
```
npm ci
npm error Could not find package-lock.json
```

**原因**: `npm ci` 需要 `package-lock.json` 文件，但該文件未提交到 git

**解決方案**:
```bash
# 確保 package-lock.json 存在
npm install  # 如果不存在會生成

# 添加到 git
git add package-lock.json
git commit -m "chore: add package-lock.json for CI/CD"
git push origin main
```

**經驗教訓**:
- `npm ci` 比 `npm install` 更適合 CI/CD（速度快、可靠）
- 但必須確保 `package-lock.json` 已提交
- 不要將 `package-lock.json` 加入 `.gitignore`

---

##### 問題 4: 構建失敗 (缺少 Firebase 環境變數)

**現象**: Vite 構建過程中 Firebase 配置為 `undefined`，導致應用無法運行

**原因**: GitHub Actions 環境中沒有 Firebase 環境變數

**解決方案 A - 手動設置** (不推薦):
在 GitHub repository → Settings → Secrets and variables → Actions 中手動添加每個 secret

**解決方案 B - 使用 GitHub CLI** (推薦):
```bash
# 一次性設置所有 secrets
gh secret set VITE_FIREBASE_API_KEY -b"AIzaSy..." --repo owner/repo
gh secret set VITE_FIREBASE_AUTH_DOMAIN -b"project.firebaseapp.com" --repo owner/repo
# ... (重複所有 7 個變數)

# 驗證 secrets 已設置
gh secret list --repo owner/repo
```

**在 workflow 中使用**:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
    # ... 所有其他變數
```

**經驗教訓**:
- Vite 環境變數必須以 `VITE_` 開頭才能在客戶端訪問
- 不要在代碼中硬編碼敏感信息
- 使用 GitHub CLI 可以自動化 secrets 設置，避免手動輸入錯誤
- 提交 `.env.example` 作為範本，但永遠不要提交 `.env.local`

---

##### 問題 5: GitHub Pages 部署失敗 (404 Not Found)

**現象**:
```
##[error]Creating Pages deployment failed
##[error]HttpError: Not Found
Error: Failed to create deployment (status: 404)
Ensure GitHub Pages has been enabled
```

**原因**: GitHub Pages 功能未在 repository 設置中啟用

**解決方案**:
```bash
# 使用 GitHub CLI 啟用 Pages (workflow 模式)
gh api repos/owner/repo/pages -X POST -F "build_type=workflow"

# 驗證設置
gh api repos/owner/repo/pages
```

**手動方式** (如果 CLI 失敗):
1. 前往 repository Settings → Pages
2. Source 選擇 "GitHub Actions"
3. 保存設置

**經驗教訓**:
- GitHub Actions 部署需要先啟用 Pages 功能
- 使用 `build_type=workflow` 而不是傳統的分支部署
- 第一次部署可能需要幾分鐘才能生效

---

##### 問題 6: Windows 環境下 GitHub CLI 路徑問題

**現象**:
```
bash: gh: command not found
```

**原因**:
- GitHub CLI 安裝後未添加到 PATH
- 或 bash session 未重新加載環境變數

**解決方案**:
```bash
# 使用完整路徑
"C:\Program Files\GitHub CLI\gh.exe" [command]

# 或添加到 PATH 並重啟終端
# 但在自動化腳本中，直接使用完整路徑更可靠
```

**經驗教訓**:
- Windows 環境下，安裝新工具後可能需要重啟終端
- 在腳本中使用完整路徑更可靠
- 可以用 `where gh.exe` 查找安裝路徑

---

#### 部署驗證清單

完成部署後，驗證以下項目：

- [ ] GitHub Actions workflow 運行成功 (綠色勾勾)
- [ ] 檢查 Actions 頁面沒有錯誤訊息
- [ ] 網站可以訪問: `https://owner.github.io/repo-name/`
- [ ] Firebase 功能正常運作（連接、讀寫數據）
- [ ] 控制台無 Firebase 配置錯誤
- [ ] 路由正常（Vite base path 設置正確）
- [ ] 靜態資源加載正常（圖片、CSS、JS）
- [ ] Repository About 更新了網站連結

#### 自動化部署腳本範例

完整的自動化設置腳本：

```bash
#!/bin/bash
# setup-github-pages.sh

REPO="owner/repo"
GH_CLI="C:\Program Files\GitHub CLI\gh.exe"

echo "🚀 設置 GitHub Pages 自動部署..."

# 1. 驗證 GitHub CLI
if ! "$GH_CLI" auth status; then
  echo "❌ 請先登入 GitHub CLI"
  exit 1
fi

# 2. 設置所有 Firebase secrets
echo "📝 設置 Firebase 環境變數..."
"$GH_CLI" secret set VITE_FIREBASE_API_KEY -b"$FIREBASE_API_KEY" --repo "$REPO"
"$GH_CLI" secret set VITE_FIREBASE_AUTH_DOMAIN -b"$FIREBASE_AUTH_DOMAIN" --repo "$REPO"
# ... (其他變數)

# 3. 驗證 secrets
echo "✅ 驗證 secrets..."
"$GH_CLI" secret list --repo "$REPO"

# 4. 啟用 GitHub Pages
echo "🌐 啟用 GitHub Pages..."
"$GH_CLI" api repos/"$REPO"/pages -X POST -F "build_type=workflow"

# 5. 觸發部署
echo "🔨 觸發首次部署..."
"$GH_CLI" workflow run deploy.yml --repo "$REPO"

# 6. 等待部署完成
echo "⏳ 等待部署完成..."
sleep 60

# 7. 檢查部署狀態
"$GH_CLI" run list --repo "$REPO" --limit 1

echo "✨ 完成！網站地址: https://owner.github.io/repo/"
```

#### 日常部署流程

設置完成後，日常部署非常簡單：

```bash
# 1. 修改代碼
# 2. 提交變更
git add .
git commit -m "feat: your changes"

# 3. 推送到 GitHub (自動觸發部署)
git push origin main

# 4. 等待 1-2 分鐘，檢查部署狀態
gh run list --limit 1

# 完成！變更已上線
```

#### 故障排除命令

```bash
# 查看最近的 workflow 運行
gh run list --limit 5

# 查看特定運行的詳細日誌
gh run view [run-id] --log

# 查看失敗的日誌
gh run view [run-id] --log-failed

# 手動觸發 workflow
gh workflow run deploy.yml

# 檢查 secrets 列表
gh secret list

# 檢查 Pages 設置
gh api repos/owner/repo/pages
```

---

### Pre-deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Firebase security rules deployed
- [ ] Environment variables configured in GitHub Secrets
- [ ] GitHub Pages enabled with workflow mode
- [ ] Vite config base path set correctly
- [ ] All source files committed to git
- [ ] Mobile responsive testing complete
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance audit (Lighthouse score > 90)

## Performance Optimization

### Code Splitting

```javascript
import { lazy, Suspense } from 'react';

const GameBoard = lazy(() => import('./components/pages/GameBoard/GameBoard'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GameBoard />
    </Suspense>
  );
}
```

### Memoization

```javascript
// Memoize expensive calculations
const sortedCards = useMemo(() => {
  return cards.sort((a, b) => a.value - b.value);
}, [cards]);

// Memoize callbacks
const handleClick = useCallback((cardId) => {
  onCardClick(cardId);
}, [onCardClick]);

// Memoize components
const PlayerCard = React.memo(({ player }) => {
  return <div>{player.name}</div>;
});
```

## Security Considerations

### Environment Variables

**Never commit**:
- `.env.local` (gitignored)
- Firebase private keys
- API secrets

**Do commit**:
- `.env.example` (template without real values)

### Firebase Security Rules

See `DATABASE_DESIGN.md` for complete security rules.

**Key rules**:
- Players can only modify their own data
- Room state changes require player membership
- Read access is public (for now)
- Consider Firebase Auth for production

## References

- **PLANNING.md**: Full architecture and development plan
- **TASK.md**: Detailed task breakdown
- **DATABASE_DESIGN.md**: Complete database schema
- **DESIGN_SPEC.md**: UI/UX design system
- **FRONTEND_SPEC.md**: React implementation details
- **FIREBASE_SPEC.md**: Backend specifications
- **INITIAL.md**: Feature overview and gotchas

## Quick Reference

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm test                # Run tests
npm run test:watch      # Watch mode

# Production
npm run build           # Build for production
npm run preview         # Preview build
firebase deploy         # Deploy to Firebase

# Utilities
npm run lint            # Lint code
npm run format          # Format with Prettier (if configured)
```

### File Size Check

```bash
# Check if any files exceed 500 lines
find src -name "*.jsx" -o -name "*.js" | xargs wc -l | sort -nr | head -20
```

### Test Coverage

```bash
# Generate coverage report
npm test -- --coverage
```

## Support & Resources

- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/
- **Firebase Docs**: https://firebase.google.com/docs
- **Vitest Docs**: https://vitest.dev/
- **Game Rules**: See README.md

---

**Last Updated**: 2025-11-14
**Project Status**: Planning → Implementation
**Maintainer**: Development Team
