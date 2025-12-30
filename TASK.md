# Sea Salt & Paper - Task Tracking

> **Last Updated**: 2025-11-14
> **Current Phase**: Planning & Foundation
> **Status**: 🟡 In Progress

---

## 📋 Task Categories

- 🎯 **Critical**: Must be done before launch
- ⭐ **High Priority**: Important for MVP
- 📌 **Medium Priority**: Enhance user experience
- 💡 **Low Priority**: Nice to have
- ✅ **Completed**: Done and tested
- 🔄 **In Progress**: Currently working on
- ⏸️ **Blocked**: Waiting for dependency
- ❌ **Cancelled**: No longer needed

---

## Phase 1: Foundation & Setup

### Project Setup

- [x] 🎯 Create PLANNING.md - 2025-11-14
- [ ] 🎯 Create TASK.md (this file) - 2025-11-14
- [ ] 🎯 Initialize new React + Vite project
- [ ] 🎯 Set up Git repository
- [ ] 🎯 Configure Firebase project
- [ ] 🎯 Create .env.example file
- [ ] 🎯 Set up ESLint and Prettier
- [ ] ⭐ Create project folder structure
- [ ] ⭐ Install dependencies (React, Firebase, UUID)
- [ ] ⭐ Configure Vite for build optimization

### Design System Implementation

- [ ] 🎯 Create CSS variables file (colors, typography, spacing)
- [ ] 🎯 Create global styles (reset, base styles)
- [ ] 🎯 Create animations.css (common animations)
- [ ] ⭐ Define responsive breakpoints
- [ ] ⭐ Create utility CSS classes

### Common UI Components

- [ ] 🎯 Button component (Primary, Secondary, Danger variants)
- [ ] 🎯 Input component (Text, Number, validation)
- [ ] 🎯 Modal component (Base modal with backdrop)
- [ ] 🎯 Card component (Game card display)
- [ ] ⭐ Loading spinner component
- [ ] ⭐ Toast notification component
- [ ] 📌 Tooltip component
- [ ] 📌 Dropdown component

### Unit Tests for Components

- [ ] ⭐ Set up Vitest
- [ ] ⭐ Write tests for Button component
- [ ] ⭐ Write tests for Input component
- [ ] ⭐ Write tests for Card component
- [ ] 📌 Write tests for Modal component

---

## Phase 2: Data Layer

### Game Data

- [ ] 🎯 Create cards.js with all 72 card definitions
- [ ] 🎯 Create constants.js (game constants, enums)
- [ ] 🎯 Create gameRules.js (rule configurations)
- [ ] ⭐ Validate card data structure
- [ ] 📌 Add card images/emojis

### Game Logic

- [ ] 🎯 Implement deck shuffle function
- [ ] 🎯 Implement card dealing logic
- [ ] 🎯 Implement pair validation
- [ ] 🎯 Implement pair effects
- [ ] 🎯 Implement score calculation (base, pairs, multipliers)
- [ ] 🎯 Implement color bonus calculation
- [ ] 🎯 Implement mermaid scoring
- [ ] 🎯 Implement win condition checks
- [ ] ⭐ Create card helper functions (filter by type, color, etc.)
- [ ] ⭐ Create validators (room code, player name, etc.)

### Firebase Service Layer

- [ ] 🎯 Set up Firebase config
- [ ] 🎯 Implement room creation
- [ ] 🎯 Implement room joining
- [ ] 🎯 Implement real-time listeners
- [ ] 🎯 Implement player management
- [ ] 🎯 Implement game state updates
- [ ] ⭐ Add error handling
- [ ] ⭐ Add connection status monitoring
- [ ] 📌 Implement reconnection logic

### Unit Tests for Logic

- [ ] 🎯 Test deck shuffle randomness
- [ ] 🎯 Test card dealing
- [ ] 🎯 Test pair validation
- [ ] 🎯 Test score calculation (multiple scenarios)
- [ ] 🎯 Test color bonus calculation
- [ ] 🎯 Test mermaid scoring
- [ ] 🎯 Test win conditions
- [ ] ⭐ Test Firebase service methods

---

## Phase 3: Core Pages

### HomePage Component

- [ ] 🎯 Create HomePage layout
- [ ] 🎯 Implement "Create Room" functionality
- [ ] 🎯 Implement "Join Room" functionality
- [ ] 🎯 Add room code input validation
- [ ] ⭐ Add error messages
- [ ] ⭐ Add loading states
- [ ] 📌 Add "How to Play" modal
- [ ] 📌 Add "Leaderboard" button
- [ ] 📌 Add "Game History" button
- [ ] 💡 Add game logo/banner

### RoomLobby Component

- [ ] 🎯 Create RoomLobby layout
- [ ] 🎯 Display room code
- [ ] 🎯 Display player list
- [ ] 🎯 Implement real-time player sync
- [ ] 🎯 Add "Start Game" button (host only)
- [ ] 🎯 Add "Leave Room" button
- [ ] ⭐ Add player ready status
- [ ] ⭐ Add host indicator
- [ ] ⭐ Add copy room code button
- [ ] 📌 Add game settings panel
- [ ] 📌 Add AI player management
- [ ] 📌 Add kick player (host only)

### Settings Panel

- [ ] ⭐ Create settings modal UI
- [ ] ⭐ Add target score selector
- [ ] ⭐ Add starting hand size selector
- [ ] ⭐ Add toggles (mermaids win, color bonus)
- [ ] ⭐ Add AI configuration
- [ ] ⭐ Implement settings save/load
- [ ] 📌 Add preset configurations

---

## Phase 4: Game Board

### GameBoard Layout

- [ ] 🎯 Create GameBoard main layout (BGA style)
- [ ] 🎯 Implement top navigation bar
- [ ] 🎯 Implement opponent area (top)
- [ ] 🎯 Implement table area (center)
- [ ] 🎯 Implement player hand area (bottom)
- [ ] ⭐ Add responsive design for mobile/tablet
- [ ] ⭐ Add "Leave Game" confirmation

### Game Components

- [ ] 🎯 PlayerHand component
  - Display cards
  - Card selection
  - Drag to reorder
- [ ] 🎯 DrawDeck component
  - Show deck count
  - Draw button
  - Draw animation
- [ ] 🎯 DiscardPile component (x2)
  - Show top card
  - Show pile count
  - Click to take card
  - Drag & drop target
- [ ] 🎯 OpponentArea component
  - Show opponent name
  - Show card count
  - Show score
  - Show played pairs
- [ ] 🎯 ScorePanel component
  - Show current score
  - Show breakdown button
  - Show score details modal
- [ ] 🎯 ActionLog component
  - Show recent actions
  - Auto-scroll to latest
  - Limit to 20 entries
- [ ] ⭐ PlayedPairs component
  - Display paired cards
  - Show pair effects

### Drag & Drop System

- [ ] 🎯 Implement card drag handlers
- [ ] 🎯 Implement drop zones (discard piles)
- [ ] 🎯 Add visual feedback (dragging, hovering)
- [ ] 🎯 Handle drag cancellation
- [ ] ⭐ Add drag animations
- [ ] ⭐ Touch support for mobile

### Card Interactions

- [ ] 🎯 Card hover tooltip (2 second delay)
- [ ] 🎯 Card selection visual feedback
- [ ] 🎯 Card pairing UI
- [ ] 🎯 Play pair button
- [ ] ⭐ Double-click to quick pair
- [ ] 📌 Card magnify on hover

---

## Phase 5: Game Mechanics

### Turn Management

- [ ] 🎯 Implement turn progression
- [ ] 🎯 Implement turn phases (draw, pair, declare)
- [ ] 🎯 Lock actions for non-current player
- [ ] 🎯 Show "Your Turn" indicator
- [ ] ⭐ Add turn timer (optional)
- [ ] ⭐ Add skip turn button (emergency)

### Draw Phase

- [ ] 🎯 Draw 2 cards from deck UI
- [ ] 🎯 Choose 1 to keep, 1 to discard
- [ ] 🎯 Drag card to discard pile
- [ ] 🎯 Auto-add chosen card to hand
- [ ] 🎯 Take from discard pile (click)
- [ ] ⭐ Handle empty discard pile rule
- [ ] ⭐ Animate card movement

### Pair Phase

- [ ] 🎯 Validate pair selection
- [ ] 🎯 Play pair to table
- [ ] 🎯 Trigger pair effects
- [ ] 🎯 Fish pair: Draw 1 blind
- [ ] 🎯 Crab pair: Choose from discard
- [ ] 🎯 Sailboat pair: Extra turn
- [ ] 🎯 Shark+Swimmer: Steal card
- [ ] ⭐ Allow multiple pairs per turn
- [ ] ⭐ Undo pair action

### Declare Phase

- [ ] 🎯 Check if score >= 7
- [ ] 🎯 Show declare buttons
- [ ] 🎯 Implement "Stop" logic
- [ ] 🎯 Implement "Last Chance" logic
- [ ] 🎯 Handle other players' final turns
- [ ] 🎯 Calculate all scores
- [ ] 🎯 Determine winner of round
- [ ] 🎯 Apply score bonuses/penalties
- [ ] ⭐ Show declare confirmation modal

### Scoring & Win Conditions

- [ ] 🎯 Calculate base card score
- [ ] 🎯 Calculate pair bonuses
- [ ] 🎯 Calculate multiplier bonuses
- [ ] 🎯 Calculate mermaid scores
- [ ] 🎯 Calculate color bonus
- [ ] 🎯 Check target score win
- [ ] 🎯 Check 4 mermaid instant win
- [ ] 🎯 Display score breakdown
- [ ] ⭐ Animate score changes

---

## Phase 6: Multiplayer Sync

### Real-time Synchronization

- [ ] 🎯 Set up Firebase listeners for game state
- [ ] 🎯 Sync player actions across clients
- [ ] 🎯 Sync deck and discard piles
- [ ] 🎯 Sync turn progression
- [ ] 🎯 Sync scores
- [ ] ⭐ Optimistic UI updates
- [ ] ⭐ Conflict resolution
- [ ] ⭐ Handle rapid sequential actions

### Connection Management

- [ ] 🎯 Detect player disconnection
- [ ] 🎯 Show disconnected status
- [ ] 🎯 Handle reconnection
- [ ] 🎯 Restore game state on reconnect
- [ ] ⭐ Auto-skip turn if player AFK
- [ ] ⭐ Replace disconnected player with AI (optional)
- [ ] 📌 Show connection status indicator

### Error Handling

- [ ] 🎯 Handle Firebase errors gracefully
- [ ] 🎯 Show user-friendly error messages
- [ ] 🎯 Retry failed operations
- [ ] ⭐ Log errors for debugging
- [ ] ⭐ Add error boundary component

---

## Phase 7: AI Opponents

### AI Service

- [ ] ⭐ Create AI decision-making framework
- [ ] ⭐ Implement AI turn automation
- [ ] ⭐ Add realistic delays (1-2 seconds)

### AI Difficulty Levels

- [ ] ⭐ Easy AI: Random valid decisions
- [ ] ⭐ Medium AI: Basic strategy (value cards, pairs)
- [ ] ⭐ Hard AI: Advanced strategy (color focus, multipliers)

### AI Actions

- [ ] ⭐ AI draw decision (deck vs discard)
- [ ] ⭐ AI pair decision (which pairs to play)
- [ ] ⭐ AI declare decision (stop vs last chance)
- [ ] ⭐ AI card stealing (choose best target)

### AI Management

- [ ] ⭐ Add AI to room
- [ ] ⭐ Configure AI difficulty
- [ ] ⭐ Remove AI from room
- [ ] 📌 AI player visual indicator

---

## Phase 8: Polish & Features

### Animations

- [ ] ⭐ Card draw animations
- [ ] ⭐ Card movement animations
- [ ] ⭐ Score change animations
- [ ] ⭐ Turn transition animations
- [ ] 📌 Particle effects (win celebration)
- [ ] 💡 Card flip animations

### Game History

- [ ] 📌 Save completed games to Firebase
- [ ] 📌 Create GameHistory page
- [ ] 📌 Display past games list
- [ ] 📌 Show game details
- [ ] 💡 Replay game moves

### Leaderboard

- [ ] 📌 Track player statistics
- [ ] 📌 Create Leaderboard page
- [ ] 📌 Display top players
- [ ] 📌 Show ranking criteria
- [ ] 💡 Filter by time period

### Achievements

- [ ] 💡 Define achievement list
- [ ] 💡 Implement achievement tracking
- [ ] 💡 Display unlocked achievements
- [ ] 💡 Achievement notifications

### Mobile Optimization

- [ ] ⭐ Test on iOS Safari
- [ ] ⭐ Test on Android Chrome
- [ ] ⭐ Optimize touch interactions
- [ ] ⭐ Adjust layout for small screens
- [ ] ⭐ Test landscape orientation

### Accessibility

- [ ] 📌 Add ARIA labels
- [ ] 📌 Keyboard navigation support
- [ ] 📌 Test with screen reader
- [ ] 📌 Ensure color contrast (WCAG AA)
- [ ] 📌 Add focus indicators

---

## Phase 9: Testing & QA

### Unit Testing

- [ ] 🎯 Achieve 80% code coverage
- [ ] 🎯 Test all game logic functions
- [ ] 🎯 Test React components
- [ ] ⭐ Test Firebase service methods
- [ ] ⭐ Test AI logic

### Integration Testing

- [ ] ⭐ Test room creation flow
- [ ] ⭐ Test game start flow
- [ ] ⭐ Test full game playthrough
- [ ] ⭐ Test multiplayer sync
- [ ] 📌 Test AI vs human games

### Manual QA

- [ ] 🎯 Play full game with 2 players
- [ ] 🎯 Play full game with 3 players
- [ ] 🎯 Play full game with 4 players
- [ ] 🎯 Test all pair effects
- [ ] 🎯 Test declare mechanisms
- [ ] 🎯 Test win conditions
- [ ] ⭐ Test on multiple browsers
- [ ] ⭐ Test on mobile devices
- [ ] ⭐ Test edge cases (disconnect, errors)
- [ ] ⭐ Performance testing (multiple concurrent games)

### Bug Fixes

- [ ] 🎯 Fix any critical bugs
- [ ] ⭐ Fix high-priority bugs
- [ ] 📌 Fix medium-priority bugs
- [ ] 💡 Fix low-priority bugs

---

## Phase 10: Deployment

### Pre-deployment

- [ ] 🎯 Complete all documentation
- [ ] 🎯 Create deployment checklist
- [ ] 🎯 Set up Firebase Hosting
- [ ] 🎯 Configure environment variables
- [ ] ⭐ Set up Firebase security rules
- [ ] ⭐ Set up Firebase indexes
- [ ] ⭐ Optimize build bundle size
- [ ] ⭐ Enable production mode optimizations

### Deployment

- [ ] 🎯 Test production build locally
- [ ] 🎯 Deploy to Firebase Hosting
- [ ] 🎯 Test live site
- [ ] 🎯 Verify all features work
- [ ] ⭐ Set up custom domain (optional)
- [ ] ⭐ Set up SSL certificate
- [ ] 📌 Set up analytics (Google Analytics)

### Post-deployment

- [ ] 🎯 Monitor for errors
- [ ] 🎯 Gather user feedback
- [ ] ⭐ Create user guide video
- [ ] 📌 Announce launch
- [ ] 💡 Set up CI/CD pipeline

---

## Discovered During Development

_This section will be populated as new tasks are discovered during development_

---

## Completed Tasks Archive

### 2025-11-14

- [x] Create PLANNING.md
- [x] Create TASK.md

---

## Notes & Reminders

- Keep all files under 500 lines
- Write unit tests for all new features
- Update documentation when adding features
- Test on mobile devices regularly
- Maintain BGA-style design consistency
- Follow BEM CSS naming convention

---

**Last Updated**: 2025-11-14
**Next Review**: When Phase 1 is 50% complete
