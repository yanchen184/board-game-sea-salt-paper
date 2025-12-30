# Sea Salt & Paper - Project Planning Document

> **Project Type**: Online Multiplayer Card Game
> **Technology Stack**: React + Vite + Firebase
> **Target Audience**: 2-4 players, casual card game enthusiasts
> **Last Updated**: 2025-11-14
> **Version**: 2.0.0

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Design](#architecture-design)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Data Models](#data-models)
6. [Game Flow](#game-flow)
7. [Development Phases](#development-phases)
8. [Coding Standards](#coding-standards)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Strategy](#deployment-strategy)

---

## 🎯 Project Overview

### Game Description

Sea Salt & Paper is an online multiplayer card game based on the physical board game. Players collect cards to score points through:
- Pairing cards for special effects
- Collecting sets for multiplier bonuses
- Strategic timing of round endings
- Color bonuses and mermaid special victories

### Core Features

1. **Multiplayer Support**: 2-4 real players via Firebase Realtime Database
2. **AI Opponents**: Configurable AI with 3 difficulty levels
3. **Custom Game Rules**: Adjustable win conditions, starting hands, etc.
4. **Real-time Sync**: All game actions synchronized across players
5. **Game History**: Track past games and statistics
6. **Leaderboard**: Player rankings and achievements
7. **Responsive Design**: Works on desktop, tablet, and mobile

### Design Goals

- **Intuitive UX**: New players can learn in 5 minutes
- **Visual Clarity**: All information clearly visible
- **Immediate Feedback**: Every action has visual response
- **Performance**: Smooth animations even with 4 players
- **Accessibility**: WCAG AA compliant

---

## 🏗️ Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Client Layer (React)                │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │   Home   │  │  Lobby   │  │   Game   │         │
│  │   Page   │→ │   Page   │→ │  Board   │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              Service Layer (React)                  │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐               │
│  │ Game Service │  │  AI Service  │               │
│  └──────────────┘  └──────────────┘               │
│  ┌──────────────┐  ┌──────────────┐               │
│  │  Room Mgmt   │  │  Score Calc  │               │
│  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│         Firebase Backend (Realtime DB)              │
├─────────────────────────────────────────────────────┤
│  /rooms/{roomId}     - Room state                   │
│  /players/{playerId} - Player profiles              │
│  /games/{gameId}     - Game history                 │
│  /leaderboard        - Rankings                     │
└─────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── Input/
│   ├── game/            # Game-specific components
│   │   ├── PlayerHand/
│   │   ├── DiscardPile/
│   │   ├── DrawDeck/
│   │   └── ScorePanel/
│   └── pages/           # Page components
│       ├── HomePage/
│       ├── RoomLobby/
│       └── GameBoard/
├── services/            # Business logic
│   ├── gameService.js   # Core game logic
│   ├── firebaseService.js
│   ├── aiService.js
│   └── scoreService.js
├── data/                # Static game data
│   ├── cards.js         # Card definitions
│   └── gameRules.js     # Game rules & scoring
├── utils/               # Helper functions
│   ├── cardHelpers.js
│   ├── validators.js
│   └── constants.js
├── hooks/               # Custom React hooks
│   ├── useGameState.js
│   ├── useFirebase.js
│   └── useAI.js
└── config/              # Configuration
    └── firebase.js
```

---

## 🛠️ Technology Stack

### Frontend

- **React 18.2**: UI framework
- **Vite 5.0**: Build tool and dev server
- **CSS3**: Styling (no CSS frameworks to reduce bundle size)
- **UUID**: Unique ID generation

### Backend / Database

- **Firebase Realtime Database**: Real-time data sync
- **Firebase Authentication**: (Optional) User accounts
- **Firebase Hosting**: Static site hosting

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Unit testing
- **Git**: Version control

---

## 📁 Project Structure

```
board-game-sea-salt-paper/
├── public/
│   ├── favicon.ico
│   └── assets/          # Static images
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.css
│   │   │   ├── Card/
│   │   │   │   ├── Card.jsx
│   │   │   │   └── Card.css
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Modal.css
│   │   │   └── Input/
│   │   │       ├── Input.jsx
│   │   │       └── Input.css
│   │   ├── game/
│   │   │   ├── PlayerHand/
│   │   │   │   ├── PlayerHand.jsx
│   │   │   │   └── PlayerHand.css
│   │   │   ├── DiscardPile/
│   │   │   │   ├── DiscardPile.jsx
│   │   │   │   └── DiscardPile.css
│   │   │   ├── DrawDeck/
│   │   │   │   ├── DrawDeck.jsx
│   │   │   │   └── DrawDeck.css
│   │   │   ├── ScorePanel/
│   │   │   │   ├── ScorePanel.jsx
│   │   │   │   └── ScorePanel.css
│   │   │   ├── ActionLog/
│   │   │   │   ├── ActionLog.jsx
│   │   │   │   └── ActionLog.css
│   │   │   └── OpponentArea/
│   │   │       ├── OpponentArea.jsx
│   │   │       └── OpponentArea.css
│   │   └── pages/
│   │       ├── HomePage/
│   │       │   ├── HomePage.jsx
│   │       │   └── HomePage.css
│   │       ├── RoomLobby/
│   │       │   ├── RoomLobby.jsx
│   │       │   └── RoomLobby.css
│   │       └── GameBoard/
│   │           ├── GameBoard.jsx
│   │           └── GameBoard.css
│   ├── services/
│   │   ├── gameService.js
│   │   ├── firebaseService.js
│   │   ├── aiService.js
│   │   └── scoreService.js
│   ├── data/
│   │   ├── cards.js
│   │   └── gameRules.js
│   ├── utils/
│   │   ├── cardHelpers.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── hooks/
│   │   ├── useGameState.js
│   │   ├── useFirebase.js
│   │   └── useAI.js
│   ├── config/
│   │   └── firebase.js
│   ├── styles/
│   │   ├── global.css
│   │   ├── variables.css
│   │   └── animations.css
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── tests/
│   ├── unit/
│   │   ├── gameService.test.js
│   │   ├── scoreService.test.js
│   │   └── cardHelpers.test.js
│   └── integration/
│       └── gameFlow.test.js
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── PLANNING.md          # This file
├── TASK.md             # Task tracking
├── README.md           # User documentation
├── DESIGN_SPEC.md      # Design specifications
├── FRONTEND_SPEC.md    # Frontend implementation details
└── FIREBASE_SPEC.md    # Backend specifications
```

### File Size Constraints

- **Maximum file size**: 500 lines of code
- **Reason**: Maintainability, readability, easier code review
- **Solution**: Split large files into smaller modules

### Naming Conventions

- **Components**: PascalCase (e.g., `PlayerHand.jsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **CSS**: BEM methodology (e.g., `.player-hand__card--selected`)
- **Constants**: UPPER_SNAKE_CASE
- **Functions**: camelCase with descriptive names

---

## 📊 Data Models

### Room Data Model

```javascript
{
  roomId: "ABC123",           // 6-character room code
  hostId: "player-uuid",      // Room creator
  status: "waiting",          // waiting | playing | finished
  players: {
    "player-1-id": {
      id: "player-1-id",
      name: "Player 1",
      isHost: true,
      isReady: false,
      isAI: false,
      difficulty: null,       // easy | medium | hard
      score: 0,
      hand: [],              // Array of card IDs
      playedPairs: [],       // Array of {card1, card2}
      connected: true
    }
  },
  settings: {
    maxPlayers: 4,
    targetScore: "auto",      // auto | 30 | 35 | 40 | custom
    customScore: null,
    startingHandSize: 0,
    mermaidsWin: true,        // 4 mermaids = instant win
    colorBonus: true,
    aiCount: 0,
    aiDifficulty: "medium"
  },
  gameState: {
    deck: [],                 // Array of card IDs
    discardLeft: [],
    discardRight: [],
    currentPlayerIndex: 0,
    round: 1,
    turnPhase: "draw",        // draw | pair | declare
    lastAction: {
      playerId: "player-id",
      action: "draw_deck",
      timestamp: 1699999999999
    }
  },
  createdAt: 1699999999999,
  startedAt: null,
  finishedAt: null
}
```

### Card Data Model

```javascript
{
  id: "fish_1",               // Unique card ID
  name: "Fish",
  type: "pair_effect",        // pair_effect | collection | multiplier | special
  value: 1,                   // Base score
  color: "blue",
  emoji: "🐟",
  pairEffect: "draw_blind",   // Effect when paired
  description: "Draw 1 card from deck when paired",
  multiplierTarget: null,     // For multiplier cards
  multiplierValue: null
}
```

### Player Profile Model

```javascript
{
  playerId: "player-uuid",
  name: "Player Name",
  gamesPlayed: 0,
  gamesWon: 0,
  totalScore: 0,
  achievements: [],
  createdAt: 1699999999999,
  lastActive: 1699999999999
}
```

### Game History Model

```javascript
{
  gameId: "game-uuid",
  roomId: "ABC123",
  players: ["player-1-id", "player-2-id"],
  winner: "player-1-id",
  finalScores: {
    "player-1-id": 42,
    "player-2-id": 35
  },
  rounds: 3,
  duration: 1800000,          // milliseconds
  winCondition: "score",      // score | mermaids
  settings: { /* room settings */ },
  playedAt: 1699999999999
}
```

---

## 🎮 Game Flow

### Phase 1: Room Creation & Joining

```
User → Home Page
  ↓
[Create Room] → Generate Room Code → Room Lobby (as Host)
  OR
[Join Room] → Enter Code → Validate → Room Lobby (as Guest)
```

### Phase 2: Room Lobby

```
Room Lobby (Host)
  ↓
1. Configure game settings (optional)
2. Add AI players (optional)
3. Wait for players to join
4. All players ready
  ↓
[Start Game] → Initialize game state → Game Board
```

### Phase 3: Game Loop

```
Game Board
  ↓
For each player turn:
  ┌──────────────────────────────────────┐
  │ 1. Draw Phase (mandatory)            │
  │    - Draw 2 from deck (choose 1)     │
  │    OR                                │
  │    - Take 1 from discard pile        │
  ├──────────────────────────────────────┤
  │ 2. Pair Phase (optional)             │
  │    - Play matching pairs             │
  │    - Trigger pair effects            │
  │    - Can play multiple pairs         │
  ├──────────────────────────────────────┤
  │ 3. Declare Phase (optional)          │
  │    - If score >= 7                   │
  │    - Choose "Stop" or "Last Chance"  │
  │    - Trigger round end               │
  └──────────────────────────────────────┘
  ↓
Next player's turn OR Round ends
  ↓
Calculate scores → Update totals
  ↓
Check win condition:
  - Target score reached? → Game Over
  - 4 Mermaids collected? → Game Over
  - Otherwise → Next round
```

### Phase 4: Game End

```
Game Over
  ↓
Show final scores
Display winner
Save game history
Update leaderboard
  ↓
[Play Again] OR [Return to Home]
```

---

## 🔧 Development Phases

### Phase 1: Foundation (Week 1)

**Goal**: Set up project structure and design system

- [ ] Initialize Vite + React project
- [ ] Set up Firebase configuration
- [ ] Create folder structure
- [ ] Implement design system (CSS variables, colors, typography)
- [ ] Build common UI components (Button, Input, Modal, Card)
- [ ] Write unit tests for components

### Phase 2: Data Layer (Week 2)

**Goal**: Implement game data and rules

- [ ] Define card data (72 cards)
- [ ] Implement game rules logic
- [ ] Create score calculation functions
- [ ] Build Firebase service layer
- [ ] Write unit tests for game logic

### Phase 3: Core Pages (Week 3)

**Goal**: Build main user flows

- [ ] HomePage component
- [ ] RoomLobby component
- [ ] Room creation & joining logic
- [ ] Real-time player sync
- [ ] Room settings UI

### Phase 4: Game Board (Week 4-5)

**Goal**: Main game interface

- [ ] GameBoard layout (BGA style)
- [ ] Player hand management
- [ ] Draw deck & discard piles
- [ ] Drag & drop functionality
- [ ] Card pairing logic
- [ ] Score panel
- [ ] Action log

### Phase 5: Game Mechanics (Week 6)

**Goal**: Complete game logic

- [ ] Turn management
- [ ] Pair effects implementation
- [ ] Declare & end round logic
- [ ] Score calculation
- [ ] Win condition checks
- [ ] Round transitions

### Phase 6: Multiplayer Sync (Week 7)

**Goal**: Real-time synchronization

- [ ] Firebase listeners for game state
- [ ] Optimistic UI updates
- [ ] Conflict resolution
- [ ] Player disconnection handling
- [ ] Reconnection logic

### Phase 7: AI Opponents (Week 8)

**Goal**: AI player implementation

- [ ] AI decision-making logic
- [ ] Easy difficulty (random decisions)
- [ ] Medium difficulty (basic strategy)
- [ ] Hard difficulty (advanced strategy)
- [ ] AI turn automation

### Phase 8: Polish & Features (Week 9)

**Goal**: Enhanced features

- [ ] Game history tracking
- [ ] Leaderboard system
- [ ] Achievements
- [ ] Animations & transitions
- [ ] Sound effects (optional)
- [ ] Mobile responsive design

### Phase 9: Testing & Debug (Week 10)

**Goal**: Quality assurance

- [ ] Complete unit test coverage (>80%)
- [ ] Integration testing
- [ ] Manual QA testing
- [ ] Performance optimization
- [ ] Bug fixes

### Phase 10: Deployment (Week 11)

**Goal**: Production release

- [ ] Firebase hosting setup
- [ ] Environment configuration
- [ ] CI/CD pipeline
- [ ] Documentation completion
- [ ] Launch

---

## 📝 Coding Standards

### JavaScript/React Conventions

```javascript
// 1. Use functional components with hooks
const PlayerHand = ({ cards, onCardClick }) => {
  const [selectedCards, setSelectedCards] = useState([]);

  // 2. Early returns for guards
  if (!cards || cards.length === 0) {
    return <div>No cards</div>;
  }

  // 3. Descriptive function names
  const handleCardSelection = (cardId) => {
    // Implementation
  };

  // 4. Use constants for magic numbers/strings
  const MAX_HAND_SIZE = 10;

  return (
    <div className="player-hand">
      {/* JSX */}
    </div>
  );
};

// 5. PropTypes or TypeScript for type checking
PlayerHand.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  onCardClick: PropTypes.func
};

// 6. Export at bottom
export default PlayerHand;
```

### CSS Conventions

```css
/* BEM Methodology */
.player-hand {
  /* Block */
}

.player-hand__card {
  /* Element */
}

.player-hand__card--selected {
  /* Modifier */
}

/* Use CSS variables for theming */
.player-hand {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

/* Mobile-first responsive design */
.player-hand {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .player-hand {
    /* Tablet/Desktop styles */
  }
}
```

### Comments & Documentation

```javascript
/**
 * Calculates the total score for a player's hand
 *
 * @param {Array} hand - Array of card objects
 * @param {Array} playedPairs - Array of played pair objects
 * @param {Object} settings - Game settings
 * @returns {Object} Score breakdown { base, pairs, multipliers, mermaids, color, total }
 */
export const calculateScore = (hand, playedPairs, settings) => {
  // Reason: We need to separate base score from bonuses for display
  const baseScore = hand.reduce((sum, card) => sum + card.value, 0);

  // ... rest of implementation
};
```

### Git Commit Conventions

```
feat: Add drag and drop for card selection
fix: Resolve score calculation bug for mermaids
refactor: Split GameBoard into smaller components
docs: Update README with deployment instructions
test: Add unit tests for scoreService
style: Format code with Prettier
```

---

## 🧪 Testing Strategy

### Unit Tests

**Tools**: Vitest, React Testing Library

**Coverage Target**: 80%+

**Focus Areas**:
- Game logic functions (scoreService, gameRules)
- Card helpers and validators
- AI decision making
- Component rendering and interactions

```javascript
// Example test
import { describe, it, expect } from 'vitest';
import { calculateScore } from './scoreService';

describe('calculateScore', () => {
  it('should calculate base score correctly', () => {
    const hand = [
      { id: 'fish_1', value: 1 },
      { id: 'crab_1', value: 1 }
    ];
    const result = calculateScore(hand, [], {});
    expect(result.base).toBe(2);
  });

  it('should add color bonus for most common color', () => {
    // Test implementation
  });

  it('should handle mermaid scoring correctly', () => {
    // Test implementation
  });
});
```

### Integration Tests

**Focus**: User flows and Firebase integration
- Room creation and joining
- Game state synchronization
- Turn progression
- Score calculation through full game

### Manual Testing Checklist

- [ ] Create room successfully
- [ ] Join room with code
- [ ] Start game with 2-4 players
- [ ] Draw cards from deck
- [ ] Take cards from discard piles
- [ ] Play pair effects
- [ ] Declare "Stop" and "Last Chance"
- [ ] Score calculation is correct
- [ ] Win conditions trigger properly
- [ ] AI players function correctly
- [ ] Mobile responsive layout works
- [ ] Reconnection after disconnect
- [ ] Multiple concurrent games

---

## 🚀 Deployment Strategy

### Environment Variables

```bash
# .env.example
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Continuous Deployment

**GitHub Actions workflow** (optional):

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
```

---

## 📈 Performance Optimization

### Code Splitting

```javascript
// Lazy load pages for better initial load time
import { lazy, Suspense } from 'react';

const GameBoard = lazy(() => import('./components/pages/GameBoard/GameBoard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameBoard />
    </Suspense>
  );
}
```

### Memoization

```javascript
import { useMemo, useCallback } from 'react';

const PlayerHand = ({ cards, onCardClick }) => {
  // Memoize expensive calculations
  const sortedCards = useMemo(() => {
    return cards.sort((a, b) => a.value - b.value);
  }, [cards]);

  // Memoize callbacks
  const handleClick = useCallback((cardId) => {
    onCardClick(cardId);
  }, [onCardClick]);

  return <div>{/* ... */}</div>;
};
```

### Firebase Optimization

- Use Firebase indexes for queries
- Limit listener scope to necessary data
- Batch writes when possible
- Clean up old game data periodically

---

## 🔒 Security Considerations

### Firebase Security Rules

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "auth != null || data.child('players').hasChild(auth.uid)"
      }
    }
  }
}
```

### Input Validation

- Validate room codes (6 alphanumeric characters)
- Sanitize player names
- Validate game moves on server side (Cloud Functions)

---

## 📚 Documentation

### Required Documents

1. **README.md**: User-facing documentation, how to play
2. **PLANNING.md**: This document - architecture and planning
3. **DESIGN_SPEC.md**: UI/UX design specifications
4. **FRONTEND_SPEC.md**: Frontend implementation details
5. **FIREBASE_SPEC.md**: Backend and database specifications
6. **TASK.md**: Task tracking and progress

### Code Documentation

- All functions must have JSDoc comments
- Complex logic needs inline comments explaining "why"
- Component props should be documented with PropTypes or TypeScript

---

## 🎯 Success Metrics

### Technical Metrics

- [ ] 80%+ unit test coverage
- [ ] <3 second initial page load
- [ ] <500ms action response time
- [ ] Supports 100+ concurrent games
- [ ] 0 critical bugs at launch

### User Experience Metrics

- [ ] 90%+ players can start a game without help
- [ ] <1 minute average time from homepage to game start
- [ ] <5% player disconnect rate
- [ ] Positive user feedback on controls and UI

---

## 🗺️ Future Roadmap

### Version 2.1

- [ ] User accounts and authentication
- [ ] Friends system
- [ ] Private rooms with passwords
- [ ] Spectator mode

### Version 2.2

- [ ] Tournaments and ranked play
- [ ] More game modes (e.g., team play)
- [ ] Customizable card backs and themes
- [ ] Sound effects and music

### Version 3.0

- [ ] Mobile apps (React Native)
- [ ] Internationalization (multiple languages)
- [ ] Advanced statistics and analytics
- [ ] Player profiles and avatars

---

## 📞 Contact & Support

- **Project Lead**: [Your Name]
- **Repository**: [GitHub URL]
- **Issues**: [GitHub Issues URL]
- **Documentation**: [Docs URL]

---

**Last Updated**: 2025-11-14
**Version**: 2.0.0
**Status**: In Planning
