name: "Sea Salt & Paper - Complete Multiplayer Card Game Implementation"
description: |

## Purpose
Build a production-ready online multiplayer card game based on "Sea Salt & Paper" using React, Vite, and Firebase Realtime Database. The game supports 2-4 players with real-time synchronization, AI opponents, and comprehensive game mechanics including card pairing, scoring, and win conditions.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints that can be run and fixed iteratively
3. **Information Dense**: Use established patterns for React + Firebase multiplayer games
4. **Progressive Success**: Start with foundation (setup + data), then core features, then polish
5. **Global Rules**: Follow all rules in CLAUDE.md strictly (file size <500 lines, BEM CSS, JSDoc comments)

---

## Goal
Create a fully functional online multiplayer card game where:
- 2-4 players can create/join rooms and play together in real-time
- All game state synchronizes instantly across all clients via Firebase
- AI opponents provide single-player or mixed gameplay
- Complete card mechanics including pairs, effects, and scoring work correctly
- The UI is responsive, accessible, and follows Board Game Arena (BGA) style design
- The game is deployable to Firebase Hosting

## Why
- **User Value**: Provides an engaging multiplayer card game experience accessible from any device
- **Technical Showcase**: Demonstrates advanced React patterns, Firebase real-time sync, and game state management
- **Learning Platform**: Serves as reference implementation for multiplayer browser games
- **Problems Solved**: Eliminates need for physical cards; enables remote play; provides AI practice mode

## What
### User-Visible Features
- Create/join game rooms with 6-character codes
- Real-time lobby with player list and configurable game settings
- Full game implementation with card drawing, pairing, and scoring
- Drag & drop interface for discarding cards
- Declare "Stop" or "Last Chance" mechanics
- Score tracking across multiple rounds
- AI opponents with 3 difficulty levels

### Success Criteria
- [ ] Players can create and join rooms successfully
- [ ] All 4 players can see real-time updates when anyone takes actions
- [ ] All pair effects work correctly (Fish, Crab, Sailboat, Shark+Swimmer)
- [ ] Score calculation matches official game rules (base + pairs + multipliers + mermaids + color bonus)
- [ ] Win conditions trigger correctly (target score reached or 4 mermaids collected)
- [ ] AI opponents make valid moves at all difficulty levels
- [ ] Game runs smoothly on desktop, tablet, and mobile (60 FPS)
- [ ] All unit tests pass with 80%+ coverage
- [ ] Firebase security rules prevent cheating
- [ ] Game deploys successfully to Firebase Hosting

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Official Documentation

- url: https://react.dev/learn
  why: Core React patterns - hooks, state, effects, context
  critical: Focus on useEffect cleanup for Firebase listeners

- url: https://vitejs.dev/guide/
  why: Vite configuration, environment variables (VITE_ prefix), build optimization
  critical: Use import.meta.env for environment variables

- url: https://firebase.google.com/docs/database/web/start
  why: Firebase Realtime Database SDK, initialization, read/write operations
  critical: Always unsubscribe listeners with off() in useEffect cleanup

- url: https://firebase.google.com/docs/database/web/read-and-write
  why: Real-time listeners (on, onValue), transactions for atomic updates
  critical: Use transactions for turn changes to prevent race conditions

- url: https://firebase.google.com/docs/database/security
  why: Security rules syntax, user validation, data validation
  critical: Implement rules from DATABASE_DESIGN.md to prevent cheating

- url: https://vitest.dev/guide/
  why: Unit testing framework similar to Jest but works with Vite
  critical: Mock Firebase in tests, don't hit real database

# Game Mechanics & Rules

- url: https://en.boardgamearena.com/gamepanel?game=seasaltpaper
  why: Reference implementation of game on BGA - test all mechanics here
  critical: Study the UI layout and card interaction patterns

- doc: Sea Salt & Paper Official Rules Summary
  why: Core game mechanics verified from multiple sources
  critical: |
    **Drawing Phase:**
    - Draw 2 cards from deck, keep 1, discard 1 to either pile
    - OR take 1 card from either discard pile
    - GOTCHA: If discard pile empty, MUST discard to that pile

    **Pair Phase (Optional):**
    - Fish Pair: Draw 1 card blind from deck
    - Crab Pair: Take any card from any discard pile
    - Sailboat Pair: Take another turn after this one
    - Shark + Swimmer: Steal 1 card from another player's hand
    - Each pair = 1 point bonus

    **Declare Phase (If score >= 7):**
    - STOP: Round ends immediately, no color bonus for anyone
    - LAST CHANCE: Others get 1 more turn. If caller has highest score,
      they get points + color bonus. If tied or beaten, caller gets
      only color bonus, others get their scores + color bonus

    **Scoring:**
    - Base: Sum of card values in hand + played pairs area
    - Pairs: +1 per pair played
    - Multipliers: Octopus (x2 shells), Penguins (x2 pairs), Seagull (x2 fish/crab)
    - Mermaids: 1st mermaid = count of most common color, 2nd = 2nd most common, etc.
    - Color Bonus: Count of most common color (only if Last Chance and conditions met)
    - GOTCHA: Mermaids don't count toward color bonus calculation

    **Win Conditions:**
    - Target score: 40 (2 players), 35 (3 players), 30 (4 players)
    - OR collect 4 Mermaids (instant win)

# React Drag & Drop Patterns

- url: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
  why: Native HTML5 drag and drop - no library needed for simple use case
  critical: Use onDragStart, onDragOver, onDrop, set dataTransfer

- url: https://refine.dev/blog/react-draggable-components-with-react-dnd/
  why: Alternative using react-dnd library if native DnD insufficient
  critical: Only use if native HTML5 DnD doesn't work on mobile

# Firebase Multiplayer Game Patterns

- url: https://medium.com/@ktamura_74189/how-to-build-a-real-time-multiplayer-game-using-only-firebase-as-a-backend-b5bb805c6543
  why: Proven patterns for multiplayer games with Firebase
  critical: |
    - Use transactions for turn changes to prevent race conditions
    - Detect player disconnections with onDisconnect()
    - Keep data structure flat for better performance
    - Limit action log to prevent unbounded growth

- url: https://bootstrapped.app/guide/how-to-handle-firebase-realtime-database-concurrency-issues
  why: Handling concurrency in multiplayer games
  critical: |
    - Use runTransaction() for any state that multiple players might modify
    - Design operations to be idempotent
    - Handle transaction failures gracefully with retry logic

# Project-Specific Context

- file: PLANNING.md
  why: Complete architecture, data models, component structure, development phases
  critical: Follow the exact folder structure and naming conventions specified

- file: DATABASE_DESIGN.md
  why: Firebase data schema, security rules, query patterns, data lifecycle
  critical: Implement the exact data structure - don't deviate or add extra fields

- file: TASK.md
  why: Detailed task breakdown - reference for what needs to be built
  critical: Use as checklist to ensure nothing is missed

- file: CLAUDE.md
  why: Project-specific coding standards, conventions, gotchas
  critical: |
    - Max 500 lines per file
    - BEM CSS methodology
    - JSDoc for all functions
    - Clean up Firebase listeners in useEffect
    - Use transactions for turn changes
```

### Current Codebase Tree
```bash
board-game-sea-salt-paper/
├── .claude/                  # Claude Code configuration
│   └── commands/
│       ├── generate-prp.md
│       └── execute-prp.md
├── PRPs/                     # Project Requirements Prompts
│   ├── templates/
│   │   └── prp_base.md
│   └── sea-salt-paper-implementation.md (this file)
├── PLANNING.md              # Architecture document
├── DATABASE_DESIGN.md       # Firebase schema & security
├── TASK.md                  # Task breakdown
├── CLAUDE.md                # Coding standards
├── INITIAL.md               # Feature overview
└── README.md                # User documentation

# NOTE: No src/ directory exists yet - this is a fresh implementation
```

### Desired Codebase Tree
```bash
board-game-sea-salt-paper/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   └── assets/              # Card images, icons (if needed)
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.css
│   │   │   ├── Card/
│   │   │   │   ├── Card.jsx (game card display)
│   │   │   │   └── Card.css
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Modal.css
│   │   │   └── Input/
│   │   │       ├── Input.jsx
│   │   │       └── Input.css
│   │   ├── game/            # Game-specific components
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
│   │   └── pages/           # Page-level components
│   │       ├── HomePage/
│   │       │   ├── HomePage.jsx
│   │       │   └── HomePage.css
│   │       ├── RoomLobby/
│   │       │   ├── RoomLobby.jsx
│   │       │   └── RoomLobby.css
│   │       └── GameBoard/
│   │           ├── GameBoard.jsx
│   │           └── GameBoard.css
│   ├── services/            # Business logic layer
│   │   ├── gameService.js   # Core game logic (deck, dealing, pairs)
│   │   ├── firebaseService.js  # Firebase CRUD operations
│   │   ├── aiService.js     # AI decision making
│   │   └── scoreService.js  # Score calculation
│   ├── data/                # Static game data
│   │   ├── cards.js         # 72 card definitions
│   │   └── gameRules.js     # Game rules configuration
│   ├── utils/               # Helper functions
│   │   ├── cardHelpers.js   # Card filtering, sorting
│   │   ├── validators.js    # Input validation
│   │   └── constants.js     # Game constants
│   ├── hooks/               # Custom React hooks
│   │   ├── useGameState.js  # Game state management
│   │   ├── useFirebase.js   # Firebase listeners
│   │   └── useAI.js         # AI turn automation
│   ├── config/
│   │   └── firebase.js      # Firebase initialization
│   ├── styles/              # Global styles
│   │   ├── global.css
│   │   ├── variables.css    # CSS custom properties
│   │   └── animations.css
│   ├── App.jsx              # Root component with routing
│   ├── App.css
│   ├── main.jsx             # Entry point
│   └── index.css
├── tests/                   # Unit & integration tests
│   ├── unit/
│   │   ├── gameService.test.js
│   │   ├── scoreService.test.js
│   │   ├── cardHelpers.test.js
│   │   └── validators.test.js
│   └── integration/
│       └── gameFlow.test.js
├── .env.local               # Environment variables (gitignored)
├── .env.example             # Template for environment variables
├── .gitignore
├── package.json
├── vite.config.js
├── vitest.config.js
├── firebase.json            # Firebase hosting config
└── .firebaserc              # Firebase project config

# Total estimated files: ~80 (components + tests + config)
# Each file: <500 lines as per CLAUDE.md
```

### Known Gotchas & Library Quirks
```javascript
// CRITICAL Firebase Gotchas

// 1. ALWAYS clean up listeners or you'll have memory leaks
useEffect(() => {
  const gameRef = ref(database, `rooms/${roomId}/gameState`);
  const unsubscribe = onValue(gameRef, (snapshot) => {
    setGameState(snapshot.val());
  });

  // CRITICAL: Must return cleanup function
  return () => off(gameRef);
}, [roomId]);

// 2. Use transactions for ANY state that multiple players might modify simultaneously
// BAD - Race condition:
const nextTurn = async () => {
  const currentIndex = gameState.currentPlayerIndex;
  await set(ref(database, `rooms/${roomId}/gameState/currentPlayerIndex`),
    (currentIndex + 1) % playerCount);
};

// GOOD - Atomic transaction:
const nextTurn = async () => {
  await runTransaction(ref(database, `rooms/${roomId}/gameState`), (state) => {
    if (!state) return state;
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % playerCount;
    return state;
  });
};

// 3. Environment variables in Vite MUST have VITE_ prefix
// .env.local:
VITE_FIREBASE_API_KEY=your_key_here
// Access in code:
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// 4. Firebase data structure - keep FLAT for performance
// BAD - Deep nesting:
rooms/ABC123/players/player1/gameData/currentHand/cards/0
// GOOD - Shallow:
rooms/ABC123/players/player1/hand

// CRITICAL Game Logic Gotchas

// 5. Don't expose other players' hands - security issue!
// In firebaseService.js when syncing player data:
const playerData = players[playerId];
const isCurrentPlayer = playerId === currentUserId;
return {
  ...playerData,
  hand: isCurrentPlayer ? playerData.hand : [], // Hide others' cards
  handCount: playerData.hand.length // Show count only
};

// 6. Empty discard pile MUST receive next discarded card
const canDiscardToLeft = discardLeft.length > 0 || discardRight.length === 0;
const canDiscardToRight = discardRight.length > 0 || discardLeft.length === 0;
// If one is empty, can only discard there

// 7. Mermaid scoring is COMPLEX - 1st mermaid = most common color count
const calculateMermaidScore = (hand, mermaidCount) => {
  // Count each color in hand
  const colorCounts = hand.reduce((acc, card) => {
    if (card.color !== 'multicolor') {
      acc[card.color] = (acc[card.color] || 0) + 1;
    }
    return acc;
  }, {});

  // Sort counts descending
  const sortedCounts = Object.values(colorCounts).sort((a, b) => b - a);

  // Each mermaid = Nth highest color count
  let total = 0;
  for (let i = 0; i < mermaidCount; i++) {
    total += sortedCounts[i] || 0;
  }
  return total;
};

// 8. Shark + Swimmer is a VALID pair (special case)
const isValidPair = (card1, card2) => {
  // Normal pair - same card type
  if (card1.name === card2.name) return true;

  // Special case - Shark + Swimmer
  if ((card1.name === 'Shark' && card2.name === 'Swimmer') ||
      (card1.name === 'Swimmer' && card2.name === 'Shark')) {
    return true;
  }

  return false;
};

// 9. AI turn timing - add realistic delays
const makeAIMove = async () => {
  // CRITICAL: Add 1-2 second delay so AI doesn't feel instant/robotic
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Then make the move
  await performAIAction();
};

// 10. Score must be >= 7 to declare
const canDeclare = (playerScore) => {
  return playerScore >= 7;
};

// React Patterns

// 11. Memoize expensive calculations
const sortedCards = useMemo(() => {
  return cards.sort((a, b) => a.value - b.value);
}, [cards]);

// 12. Debounce rapid Firebase writes
import { debounce } from './utils/debounce';
const updatePlayerHand = useMemo(() =>
  debounce((hand) => {
    set(ref(database, `rooms/${roomId}/players/${playerId}/hand`), hand);
  }, 300), // Wait 300ms before writing
[roomId, playerId]);
```

## Implementation Blueprint

### Phase Overview
This implementation follows a progressive approach:
1. **Foundation** (Week 1): Project setup, design system, common components
2. **Data Layer** (Week 1): Card definitions, game rules, Firebase service
3. **Core Pages** (Week 2): Home, Lobby, routing
4. **Game Board** (Week 2-3): Main game UI, all components
5. **Game Mechanics** (Week 3-4): Turn management, pairs, scoring
6. **Multiplayer Sync** (Week 4): Real-time listeners, conflict resolution
7. **AI Opponents** (Week 4): Decision-making logic
8. **Testing & Polish** (Week 5): Tests, animations, mobile optimization

### Task List - Complete Implementation Path

```yaml
PHASE 1: PROJECT FOUNDATION

Task 1.1: Initialize Vite + React Project
CREATE project with Vite:
  - Run: npm create vite@latest . -- --template react
  - Install: npm install
  - Test dev server: npm run dev
  - VALIDATE: App loads at http://localhost:5173

Task 1.2: Install Dependencies
INSTALL required packages:
  - npm install firebase uuid
  - npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  - UPDATE package.json scripts:
      "test": "vitest",
      "test:ui": "vitest --ui",
      "test:coverage": "vitest --coverage"

Task 1.3: Create Folder Structure
CREATE all directories:
  - mkdir -p src/{components/{common,game,pages},services,data,utils,hooks,config,styles}
  - mkdir -p src/components/common/{Button,Card,Modal,Input}
  - mkdir -p src/components/game/{PlayerHand,DiscardPile,DrawDeck,ScorePanel,ActionLog,OpponentArea}
  - mkdir -p src/components/pages/{HomePage,RoomLobby,GameBoard}
  - mkdir -p tests/{unit,integration}
  - mkdir -p public/assets

Task 1.4: Setup Environment Variables
CREATE .env.example:
  - VITE_FIREBASE_API_KEY=your_api_key
  - VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
  - VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
  - VITE_FIREBASE_PROJECT_ID=your_project_id
  - VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
  - VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  - VITE_FIREBASE_APP_ID=your_app_id

CREATE .env.local:
  - Copy from .env.example and fill in real values
  - CRITICAL: Ensure .gitignore includes .env.local

Task 1.5: Configure Firebase
CREATE src/config/firebase.js:
  - PATTERN: Initialize Firebase app
  - Export database instance
  - Export helper functions (ref, set, onValue, off, runTransaction)
  - VALIDATE: No errors on import

Task 1.6: Setup Vitest
CREATE vitest.config.js:
  - Configure test environment: jsdom
  - Setup globals: true
  - Include coverage thresholds: 80%

PHASE 2: DESIGN SYSTEM & COMMON COMPONENTS

Task 2.1: Create CSS Variables
CREATE src/styles/variables.css:
  - PATTERN: BGA-style color palette (dark blues, ocean theme)
  - Define spacing scale, border radius, shadows
  - Typography (font sizes, weights, families)
  - Z-index scale for layering

Task 2.2: Create Global Styles
CREATE src/styles/global.css:
  - CSS reset
  - Base styles (body, html, buttons)
  - Utility classes (flex, grid helpers)
  - Import variables.css

CREATE src/styles/animations.css:
  - Card flip animation
  - Card draw animation
  - Score increment animation
  - Fade in/out transitions

Task 2.3: Build Common Components
CREATE src/components/common/Button/Button.jsx:
  - Props: variant (primary|secondary|danger), size, disabled, onClick
  - Accessibility: proper ARIA attributes
  - VALIDATE: Renders all variants correctly

CREATE src/components/common/Input/Input.jsx:
  - Props: type, value, onChange, placeholder, error, maxLength
  - Validation display
  - VALIDATE: Handles input correctly

CREATE src/components/common/Modal/Modal.jsx:
  - Props: isOpen, onClose, title, children
  - Backdrop click to close
  - Escape key to close
  - Focus trap
  - VALIDATE: Opens/closes correctly

CREATE src/components/common/Card/Card.jsx:
  - Props: cardData (id, name, emoji, color, value), selected, onClick
  - Visual states: selected, dragging, disabled
  - Drag & drop support
  - VALIDATE: Displays card info correctly

PHASE 3: DATA LAYER

Task 3.1: Define Card Data
CREATE src/data/cards.js:
  - PATTERN: Array of 72 card objects from PLANNING.md
  - Structure: { id, name, type, value, color, emoji, pairEffect, description }
  - Card types:
    * 10x Fish (blue, value 1, pair effect: draw_blind)
    * 10x Crab (red, value 1, pair effect: draw_discard)
    * 8x Shell (purple, value 1)
    * 8x Starfish (orange, value 2)
    * 6x Sailboat (green, value 3, pair effect: extra_turn)
    * 6x Shark (gray, value 3)
    * 6x Swimmer (yellow, value 3)
    * 4x Octopus (purple, value 3, multiplier: shells x2)
    * 4x Penguin (black/white, value 4, multiplier: pairs x2)
    * 4x Seagull (white, value 4, multiplier: fish/crab x2)
    * 6x Mermaid (multicolor, value 0, special scoring)
  - VALIDATE: Total 72 cards, all properties present

Task 3.2: Create Game Rules Configuration
CREATE src/data/gameRules.js:
  - Target scores: { 2: 40, 3: 35, 4: 30 }
  - Minimum declare score: 7
  - Mermaid instant win count: 4
  - Pair effects mapping
  - VALIDATE: All rules match official game

Task 3.3: Create Constants
CREATE src/utils/constants.js:
  - Game statuses: WAITING, PLAYING, FINISHED
  - Turn phases: DRAW, PAIR, DECLARE, ROUND_END
  - Declare modes: STOP, LAST_CHANCE
  - Action types: DRAW_DECK, DRAW_DISCARD, PLAY_PAIR, etc.

Task 3.4: Implement Card Helpers
CREATE src/utils/cardHelpers.js:
  - shuffleDeck(cards): Fisher-Yates shuffle
  - dealCards(deck, count): Deal N cards from deck
  - findPairs(hand): Find all valid pairs in hand
  - isValidPair(card1, card2): Check if two cards can pair
  - filterCardsByColor(cards, color)
  - filterCardsByType(cards, type)
  - VALIDATE: All functions tested

Task 3.5: Implement Validators
CREATE src/utils/validators.js:
  - validateRoomCode(code): 6 alphanumeric chars
  - validatePlayerName(name): 1-20 chars, no special chars
  - validateGameSettings(settings): Check all required fields
  - VALIDATE: All validators tested

Task 3.6: Implement Score Service
CREATE src/services/scoreService.js:
  - calculateScore(hand, playedPairs, settings)
    * Returns: { base, pairs, multipliers, mermaids, colorBonus, total }
  - calculateBaseScore(cards)
  - calculatePairBonus(playedPairs)
  - calculateMultipliers(hand, playedPairs)
  - calculateMermaidScore(hand)
  - calculateColorBonus(hand)
  - CRITICAL: Handle all edge cases from INITIAL.md
  - VALIDATE: Comprehensive tests for all scenarios

Task 3.7: Implement Game Service
CREATE src/services/gameService.js:
  - createDeck(): Return shuffled 72-card deck
  - dealInitialHands(playerCount): Deal starting hands
  - drawCards(deck, count): Remove and return cards from deck
  - playPair(card1, card2): Validate and execute pair
  - executePairEffect(pairType, gameState): Handle fish, crab, sailboat, shark effects
  - canDeclare(score): Check if score >= 7
  - calculateRoundWinner(players, declareMode): Determine round winner
  - checkWinCondition(players, targetScore): Check if game is over
  - VALIDATE: All functions tested

Task 3.8: Implement Firebase Service
CREATE src/services/firebaseService.js:
  - createRoom(hostId, hostName, settings): Generate room, return roomId
  - joinRoom(roomId, playerId, playerName): Add player to room
  - leaveRoom(roomId, playerId): Remove player from room
  - updateGameState(roomId, stateUpdate): Update game state with transaction
  - listenToRoom(roomId, callback): Subscribe to room changes
  - updatePlayerHand(roomId, playerId, hand): Update player's hand
  - addActionToLog(roomId, action): Add action to log (limit 20)
  - PATTERN: Use transactions for any state multiple players might modify
  - VALIDATE: Mock Firebase in tests

PHASE 4: CORE PAGES

Task 4.1: Create HomePage
CREATE src/components/pages/HomePage/HomePage.jsx:
  - LAYOUT:
    * Game title and logo
    * "Create Room" button
    * "Join Room" input + button
    * Optional: "How to Play" button
  - FUNCTIONS:
    * handleCreateRoom(): Generate room code, navigate to lobby
    * handleJoinRoom(code): Validate code, check if room exists, navigate
  - ERROR HANDLING: Display toast for invalid codes
  - VALIDATE: Can create and join rooms

CREATE src/components/pages/HomePage/HomePage.css:
  - BEM methodology
  - Responsive layout (mobile-first)
  - Center content vertically and horizontally

Task 4.2: Create RoomLobby
CREATE src/components/pages/RoomLobby/RoomLobby.jsx:
  - LAYOUT:
    * Room code display with copy button
    * Player list (show ready status, host indicator)
    * Game settings panel (host only)
    * "Start Game" button (host only, disabled until all ready)
    * "Leave Room" button
  - FIREBASE LISTENERS:
    * Listen to room.players for real-time updates
    * Listen to room.settings
    * Cleanup on unmount
  - FUNCTIONS:
    * handleToggleReady(): Update player ready status
    * handleStartGame(): Validate all ready, initialize game state
    * handleLeaveRoom(): Remove player, cleanup
  - VALIDATE: Real-time updates work with multiple browsers

CREATE src/components/pages/RoomLobby/RoomLobby.css:
  - BEM methodology
  - Player cards layout
  - Settings panel styling

Task 4.3: Setup Routing
MODIFY src/App.jsx:
  - Install: npm install react-router-dom
  - Setup BrowserRouter
  - Routes:
    * / -> HomePage
    * /lobby/:roomId -> RoomLobby
    * /game/:roomId -> GameBoard
  - VALIDATE: Navigation works

PHASE 5: GAME BOARD UI

Task 5.1: Create GameBoard Layout
CREATE src/components/pages/GameBoard/GameBoard.jsx:
  - LAYOUT (BGA style):
    * Top: Navigation bar (room code, leave button, settings)
    * Below top: Opponent areas (2-3 opponents)
    * Center: Table area (draw deck, discard piles, action log)
    * Bottom: Player hand and controls
  - STATE MANAGEMENT:
    * Use useGameState hook
    * Subscribe to Firebase game state
  - VALIDATE: Layout renders correctly

CREATE src/components/pages/GameBoard/GameBoard.css:
  - Grid layout for BGA style
  - Responsive (stack vertically on mobile)
  - Dark blue ocean theme

Task 5.2: Create PlayerHand Component
CREATE src/components/game/PlayerHand/PlayerHand.jsx:
  - PROPS: cards, selectedCards, onCardClick, canSelectCard
  - DISPLAY: Fanned out card display
  - INTERACTION:
    * Click to select/deselect
    * Visual indication of selected cards
    * Drag support for discarding
  - VALIDATE: Card selection works

CREATE src/components/game/PlayerHand/PlayerHand.css:
  - Fanned card layout with overlapping
  - Selected state styling
  - Responsive sizing

Task 5.3: Create DrawDeck Component
CREATE src/components/game/DrawDeck/DrawDeck.jsx:
  - PROPS: deckCount, canDraw, onDraw
  - DISPLAY: Card back graphic, count badge
  - INTERACTION: Click to draw (if current player's turn)
  - ANIMATION: Cards slide out when drawn
  - VALIDATE: Draw interaction works

Task 5.4: Create DiscardPile Component
CREATE src/components/game/DiscardPile/DiscardPile.jsx:
  - PROPS: pile ('left' | 'right'), cards, canTake, onTake, onDrop
  - DISPLAY: Top card visible, count badge
  - INTERACTION:
    * Click to take (if current player's turn)
    * Drop zone for discarding
  - DRAG & DROP:
    * onDragOver: Highlight as valid drop zone
    * onDrop: Accept card, update game state
  - VALIDATE: Drag & drop works

Task 5.5: Create OpponentArea Component
CREATE src/components/game/OpponentArea/OpponentArea.jsx:
  - PROPS: player (name, handCount, score, playedPairs, isCurrentTurn)
  - DISPLAY:
    * Player name
    * Card count (back of cards)
    * Current score
    * Played pairs (face up)
    * Turn indicator
  - VALIDATE: Shows correct player info

Task 5.6: Create ScorePanel Component
CREATE src/components/game/ScorePanel/ScorePanel.jsx:
  - PROPS: currentScore, breakdown, canDeclare, onDeclare
  - DISPLAY:
    * Total score (large)
    * "View Breakdown" button -> modal
    * "Stop" / "Last Chance" buttons (if canDeclare)
  - MODAL: Show score breakdown (base, pairs, multipliers, etc.)
  - VALIDATE: Score display is accurate

Task 5.7: Create ActionLog Component
CREATE src/components/game/ActionLog/ActionLog.jsx:
  - PROPS: actions (array of last 20 actions)
  - DISPLAY:
    * Scrollable list
    * Each action: player name, action type, timestamp
    * Auto-scroll to latest
  - VALIDATE: Updates in real-time

PHASE 6: GAME MECHANICS

Task 6.1: Implement useGameState Hook
CREATE src/hooks/useGameState.js:
  - STATE:
    * gameState (from Firebase)
    * currentPlayer (derived)
    * isMyTurn (boolean)
    * turnPhase
  - FUNCTIONS:
    * drawFromDeck()
    * takeFromDiscard(pile)
    * discardCard(cardId, pile)
    * playPair(card1Id, card2Id)
    * declareStop()
    * declareLastChance()
    * endTurn()
  - FIREBASE SYNC:
    * Listen to gameState changes
    * Use transactions for state updates
  - VALIDATE: All functions update state correctly

Task 6.2: Implement Draw Phase Logic
MODIFY useGameState:
  - drawFromDeck():
    * Draw 2 cards
    * Store in temporary state
    * Show UI: "Choose 1 to keep, 1 to discard"
    * Update deck count
  - discardCard():
    * Remove from hand
    * Add to discard pile
    * Check empty pile rule
    * Transition to PAIR phase
  - takeFromDiscard():
    * Take top card from pile
    * Add to hand
    * Transition to PAIR phase
  - VALIDATE: Draw phase works correctly

Task 6.3: Implement Pair Phase Logic
MODIFY useGameState:
  - playPair(card1, card2):
    * Validate pair
    * Remove from hand
    * Add to playedPairs
    * Execute pair effect
    * Update score
  - executePairEffect(type):
    * FISH: Draw 1 card blind
    * CRAB: UI to choose from discard
    * SAILBOAT: Set extraTurn flag
    * SHARK+SWIMMER: UI to choose player, steal card
  - VALIDATE: All pair effects work

Task 6.4: Implement Declare Phase Logic
MODIFY useGameState:
  - declareStop():
    * Check canDeclare (score >= 7)
    * End round immediately
    * Calculate all scores (no color bonus)
    * Update round totals
    * Check win condition
  - declareLastChance():
    * Check canDeclare
    * Set declareMode, declaringPlayerId
    * remainingTurns = playerCount - 1
    * Continue game
  - handleLastChanceEnd():
    * Compare declarer score with others
    * Apply scoring rules
    * Update totals
    * Check win condition
  - VALIDATE: Both declare modes work correctly

Task 6.5: Implement Turn Management
MODIFY useGameState:
  - endTurn():
    * Use transaction to update currentPlayerIndex
    * Reset turnPhase to DRAW
    * Check if extraTurn flag set
    * If Last Chance, decrement remainingTurns
  - listenForTurnChanges():
    * Subscribe to currentPlayerIndex
    * Update isMyTurn
    * Show notification on turn start
  - VALIDATE: Turns progress correctly, no race conditions

Task 6.6: Implement Round & Game End Logic
MODIFY useGameState:
  - endRound():
    * Calculate final scores for round
    * Update round history
    * Reset hands and game state
    * Check win condition
  - checkWinCondition():
    * Check if any player >= target score
    * Check if any player has 4 mermaids
    * If winner, set game status to FINISHED
  - VALIDATE: Game ends correctly

PHASE 7: MULTIPLAYER SYNCHRONIZATION

Task 7.1: Implement useFirebase Hook
CREATE src/hooks/useFirebase.js:
  - subscribeToRoom(roomId, callback)
  - subscribeToGameState(roomId, callback)
  - unsubscribeAll()
  - CRITICAL: Cleanup all listeners on unmount
  - VALIDATE: No memory leaks

Task 7.2: Implement Connection Status
MODIFY src/hooks/useFirebase.js:
  - Track online/offline status
  - Use Firebase .info/connected
  - Show connection indicator in UI
  - VALIDATE: Detects disconnections

Task 7.3: Handle Player Disconnections
MODIFY src/services/firebaseService.js:
  - Use onDisconnect() to mark player as disconnected
  - Show "Player disconnected" in UI
  - Option: Auto-skip disconnected player's turn after 30s
  - Option: Allow reconnection
  - VALIDATE: Disconnection handling works

Task 7.4: Implement Optimistic UI Updates
MODIFY useGameState:
  - Update local state immediately
  - Show loading state
  - If Firebase update fails, rollback
  - Show error toast
  - VALIDATE: UI feels responsive

PHASE 8: AI OPPONENTS

Task 8.1: Implement AI Service
CREATE src/services/aiService.js:
  - makeAIDecision(gameState, aiDifficulty, aiPlayerId)
    * Returns: { action, data }
  - Difficulty levels:
    * EASY: Random valid moves
    * MEDIUM: Basic strategy (prefer high value, complete pairs)
    * HARD: Advanced strategy (color focus, multiplier optimization)
  - VALIDATE: AI makes valid moves

Task 8.2: Implement AI Turn Automation
CREATE src/hooks/useAI.js:
  - Effect: Watch for AI player's turn
  - Delay 1-2 seconds (realistic timing)
  - Call aiService.makeAIDecision()
  - Execute returned action
  - End AI turn
  - VALIDATE: AI plays automatically

Task 8.3: Implement AI Decision Logic
MODIFY src/services/aiService.js:
  - decideDrawAction(): Deck vs discard
  - decidePairActions(): Which pairs to play
  - decideDeclareAction(): Stop vs Last Chance vs continue
  - Easy: Random.choice(validActions)
  - Medium: Score-based heuristics
  - Hard: Multi-step lookahead
  - VALIDATE: AI difficulty feels appropriate

PHASE 9: TESTING

Task 9.1: Unit Tests - Score Service
CREATE tests/unit/scoreService.test.js:
  - Test calculateScore with various hands
  - Test mermaid scoring (1, 2, 3, 4 mermaids)
  - Test color bonus calculation
  - Test multiplier effects
  - Test edge cases (empty hand, all mermaids)
  - VALIDATE: 100% coverage for scoreService

Task 9.2: Unit Tests - Game Service
CREATE tests/unit/gameService.test.js:
  - Test deck creation (72 cards, all present)
  - Test shuffle randomness
  - Test pair validation (including Shark+Swimmer)
  - Test pair effects
  - Test win conditions
  - VALIDATE: 100% coverage for gameService

Task 9.3: Unit Tests - Card Helpers
CREATE tests/unit/cardHelpers.test.js:
  - Test all helper functions
  - Test edge cases
  - VALIDATE: 100% coverage

Task 9.4: Unit Tests - Validators
CREATE tests/unit/validators.test.js:
  - Test all validators
  - Test invalid inputs
  - VALIDATE: 100% coverage

Task 9.5: Integration Tests - Game Flow
CREATE tests/integration/gameFlow.test.js:
  - Test: Create room -> Join -> Start -> Play full game -> End
  - Mock Firebase
  - Test multiplayer sync
  - VALIDATE: Full game flow works

Task 9.6: Component Tests
CREATE tests for all components:
  - Test rendering
  - Test interactions
  - Test props
  - Use @testing-library/react
  - VALIDATE: 60%+ coverage for components

PHASE 10: POLISH & DEPLOYMENT

Task 10.1: Implement Animations
MODIFY src/styles/animations.css:
  - Card draw animation
  - Card movement
  - Score increment
  - Turn transition
  - VALIDATE: Animations smooth (60 FPS)

Task 10.2: Mobile Optimization
MODIFY all CSS files:
  - Test on mobile devices
  - Adjust touch targets (min 44x44px)
  - Test drag & drop on touch
  - Optimize for small screens
  - VALIDATE: Works on iOS Safari, Android Chrome

Task 10.3: Accessibility
MODIFY all components:
  - Add ARIA labels
  - Ensure keyboard navigation
  - Test with screen reader
  - Check color contrast (WCAG AA)
  - Add focus indicators
  - VALIDATE: Passes accessibility audit

Task 10.4: Firebase Security Rules
CREATE firebase-security-rules.json:
  - Implement rules from DATABASE_DESIGN.md
  - Players can only modify own data
  - Validate data structure
  - Rate limiting for room creation
  - DEPLOY: firebase deploy --only database:rules
  - VALIDATE: Security rules work correctly

Task 10.5: Deploy to Firebase Hosting
SETUP Firebase Hosting:
  - npm install -g firebase-tools
  - firebase login
  - firebase init hosting
  - firebase init database (if not done)
  - Configure firebase.json:
      {
        "hosting": {
          "public": "dist",
          "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
          "rewrites": [{
            "source": "**",
            "destination": "/index.html"
          }]
        }
      }

DEPLOY:
  - npm run build
  - firebase deploy
  - VALIDATE: Site loads at Firebase URL

Task 10.6: Final Testing
MANUAL TESTING CHECKLIST:
  - [ ] Create room successfully
  - [ ] Join room with code
  - [ ] Start game with 2-4 players
  - [ ] Draw from deck (keep 1, discard 1)
  - [ ] Take from discard piles
  - [ ] Play all pair types (Fish, Crab, Sailboat, Shark+Swimmer)
  - [ ] Pair effects execute correctly
  - [ ] Score calculation accurate
  - [ ] Declare "Stop" works
  - [ ] Declare "Last Chance" works
  - [ ] Round end scoring correct
  - [ ] Win conditions trigger
  - [ ] AI players function at all difficulties
  - [ ] Real-time sync with multiple players
  - [ ] Mobile responsive
  - [ ] No console errors
  - VALIDATE: All checks pass
```

### Integration Points

```yaml
FIREBASE SETUP:
  - Create Firebase project at console.firebase.google.com
  - Enable Realtime Database
  - Copy config to .env.local
  - Deploy security rules from DATABASE_DESIGN.md

ENVIRONMENT VARIABLES:
  - All must use VITE_ prefix
  - Store in .env.local (gitignored)
  - Provide .env.example template

BUILD CONFIGURATION:
  - Vite handles bundling
  - Tree-shaking for small bundle size
  - Code splitting for lazy loading
  - Target: <500KB total bundle

ROUTING:
  - react-router-dom for SPA routing
  - Firebase Hosting rewrites for client-side routing

TESTING:
  - Vitest for unit tests
  - @testing-library/react for component tests
  - Mock Firebase in tests (don't hit real DB)
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run BEFORE committing any code
npm run lint           # ESLint for code quality
# Expected: No errors

# Optional: Setup Prettier
npm install -D prettier
npx prettier --write src/

# Check file sizes
find src -name "*.jsx" -o -name "*.js" | xargs wc -l | awk '$1 > 500 {print}'
# Expected: No output (all files < 500 lines)
```

### Level 2: Unit Tests
```bash
# Run tests in watch mode during development
npm run test:watch

# Run full test suite
npm test

# Generate coverage report
npm run test:coverage

# Expected: 80%+ overall coverage
# Expected: 100% for gameService.js, scoreService.js
# Expected: 60%+ for React components
```

### Level 3: Integration Test
```bash
# Start dev server
npm run dev

# Open multiple browser windows (test multiplayer)
# Window 1: http://localhost:5173
# Window 2: http://localhost:5173 (incognito)

# Test flow:
# 1. Window 1: Create room
# 2. Window 2: Join room with code
# 3. Window 1: Configure settings, start game
# 4. Play full game, test all features
# 5. Verify scores match expected values
# 6. Test AI opponent (add in lobby)
# 7. Test on mobile device

# Expected: All interactions work smoothly across clients
```

### Level 4: Firebase Validation
```bash
# Check Firebase database structure
# Open Firebase Console -> Realtime Database
# Verify data structure matches DATABASE_DESIGN.md

# Test security rules
# Try unauthorized writes - should be rejected
# Try reading other player's hand - should get empty array

# Check indexes
# Open Database -> Rules & Indexes tab
# Ensure indexes defined for:
# - rooms: status, createdAt
# - games: playedAt, winner/id
```

### Level 5: Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Check bundle size
ls -lh dist/assets

# Expected:
# - index.html < 10KB
# - Total JS < 500KB
# - Total CSS < 50KB

# Test in production mode
# Open http://localhost:4173
# Verify all features work
# Check console for errors (should be none)
```

## Final Validation Checklist

### Functional Requirements
- [ ] All unit tests pass: `npm test`
- [ ] Test coverage >= 80%: `npm run test:coverage`
- [ ] No linting errors: `npm run lint`
- [ ] Production build succeeds: `npm run build`
- [ ] Bundle size < 500KB
- [ ] All 72 cards defined correctly in cards.js
- [ ] Score calculation matches official rules
- [ ] All pair effects work (Fish, Crab, Sailboat, Shark+Swimmer)
- [ ] Declare "Stop" and "Last Chance" work correctly
- [ ] Win conditions trigger (target score, 4 mermaids)
- [ ] AI opponents make valid moves at all difficulties
- [ ] Real-time sync works with 2-4 players
- [ ] Firebase security rules deployed

### User Experience
- [ ] Game loads in < 3 seconds
- [ ] Actions respond in < 500ms
- [ ] Animations smooth (60 FPS)
- [ ] Drag & drop works on desktop and mobile
- [ ] UI is responsive (desktop, tablet, mobile)
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on iOS Safari and Android Chrome
- [ ] Touch targets >= 44x44px on mobile
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

### Code Quality
- [ ] All files < 500 lines
- [ ] All functions have JSDoc comments
- [ ] CSS follows BEM methodology
- [ ] No console.log statements in production
- [ ] No TODO comments in production
- [ ] All Firebase listeners cleaned up
- [ ] No memory leaks (check DevTools memory profiler)
- [ ] Error boundaries implemented

### Deployment
- [ ] Firebase Hosting configured
- [ ] Site deployed successfully
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enabled
- [ ] Firebase security rules deployed
- [ ] Environment variables set correctly
- [ ] Database indexes created
- [ ] All features work on live site

---

## Anti-Patterns to Avoid

### Firebase Anti-Patterns
- ❌ Don't forget to unsubscribe from Firebase listeners (causes memory leaks)
- ❌ Don't use `.once()` where you need real-time updates (use `.on()`)
- ❌ Don't skip transactions for concurrent state updates (causes race conditions)
- ❌ Don't nest data deeply (keep structure flat for performance)
- ❌ Don't expose sensitive data (hide other players' hands)
- ❌ Don't skip security rules (implement authentication and validation)

### React Anti-Patterns
- ❌ Don't mutate state directly (use setState or hooks)
- ❌ Don't use indexes as keys (causes re-render issues)
- ❌ Don't forget to memoize expensive calculations (use useMemo)
- ❌ Don't create functions in render (use useCallback)
- ❌ Don't skip useEffect dependency arrays (causes stale closures)
- ❌ Don't use inline styles extensively (use CSS classes)

### Game Logic Anti-Patterns
- ❌ Don't allow declaring with score < 7
- ❌ Don't forget Shark+Swimmer is a valid pair
- ❌ Don't count Mermaids in color bonus calculation
- ❌ Don't forget to enforce empty discard pile rule
- ❌ Don't skip validation of moves on server side
- ❌ Don't make AI turns instant (add realistic delays)

### Code Organization Anti-Patterns
- ❌ Don't exceed 500 lines per file
- ❌ Don't skip JSDoc comments for functions
- ❌ Don't mix business logic with UI components
- ❌ Don't hardcode values (use constants)
- ❌ Don't duplicate code (DRY principle)
- ❌ Don't skip tests for critical functions

---

## Confidence Score: 8.5/10

### High Confidence Due To:
- Clear architecture documented in PLANNING.md
- Detailed database schema in DATABASE_DESIGN.md
- Comprehensive task breakdown in TASK.md
- Well-researched Firebase multiplayer patterns
- Proven React + Vite + Firebase stack
- Multiple reference implementations found
- Executable validation gates at each phase
- Complete game rules documented

### Minor Uncertainties:
1. **Drag & Drop on Mobile** (0.5): May need react-beautiful-dnd if native HTML5 DnD doesn't work well on touch devices
2. **AI Difficulty Tuning** (0.5): Hard difficulty strategy may need iteration based on playtesting
3. **Firebase Scaling** (0.25): May need optimization if >100 concurrent games
4. **Animation Performance** (0.25): May need requestAnimationFrame for 60 FPS on older devices

### Mitigation Strategies:
- Test drag & drop on real devices early (Phase 5)
- Implement simple AI first, enhance in iterations
- Monitor Firebase usage, implement cleanup Cloud Functions if needed
- Profile animations in Chrome DevTools, optimize as needed

---

## Additional Resources

### Helpful Tools
- **Firebase Console**: https://console.firebase.google.com
- **React DevTools**: Chrome extension for debugging
- **Firebase DevTools**: Chrome extension for database inspection
- **Lighthouse**: Audit performance, accessibility, SEO

### Community Support
- React Discord: https://discord.gg/react
- Firebase Discord: https://discord.gg/firebase
- Stack Overflow tags: reactjs, firebase, vite

### Reference Implementations
- BGA Sea Salt & Paper: https://en.boardgamearena.com/gamepanel?game=seasaltpaper
- Firebase Game Tutorial: https://medium.com/@ktamura_74189/how-to-build-a-real-time-multiplayer-game-using-only-firebase-as-a-backend-b5bb805c6543

---

**Last Updated**: 2025-11-14
**Total Estimated Implementation Time**: 5 weeks (1 developer, full-time)
**Target Launch Date**: TBD based on start date
