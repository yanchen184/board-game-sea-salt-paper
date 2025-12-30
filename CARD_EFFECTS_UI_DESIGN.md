# Card Effects UI/UX Design Specification

## Overview
This document specifies the user interface and user experience design for the four card pair effects in Sea Salt & Paper. Each effect requires different levels of user interaction and visual feedback.

---

## Effect 1: 🦀 Crab Effect (`draw_discard`)

### What It Does
When a player plays a pair of 2 Crabs, they can **take any card from either discard pile** (left or right).

### User Flow
```
1. Player plays 2 Crabs
2. Game detects effect and pauses
3. UI prompts: "Crab Effect: Choose a card from a discard pile"
4. Both discard piles highlight/glow
5. Player clicks on one discard pile
6. Top card animates to player's hand
7. Feedback message appears
8. Game continues to next phase
```

### Visual Design

#### Modal/Overlay
```
┌─────────────────────────────────────┐
│  🦀 Crab Effect Activated!          │
│                                      │
│  Choose a card from either           │
│  discard pile                        │
│                                      │
│  ┌──────┐              ┌──────┐    │
│  │ Left │              │Right │    │
│  │ Pile │              │ Pile │    │
│  │  🐟  │              │  ⭐  │    │
│  │  1pt │              │  2pt │    │
│  └──────┘              └──────┘    │
│   Click                  Click      │
└─────────────────────────────────────┘
```

#### Component Spec
- **Container**: Modal with semi-transparent overlay
- **Title**:
  - Text: "🦀 Crab Effect Activated!"
  - Font: Bold, 1.5rem
  - Color: var(--card-red) or var(--primary-ocean)
- **Instruction**:
  - Text: "Choose a card from either discard pile"
  - Font: Regular, 1rem
  - Color: var(--text-secondary)
- **Discard Pile Cards**:
  - Display: Show top card of each pile
  - Size: Medium (larger than normal for visibility)
  - State: Hoverable, clickable
  - Hover: Scale(1.1), shadow increase
  - Click: Select pile, trigger animation

#### Interaction States
1. **Idle**: Both piles visible, subtle pulse animation
2. **Hover**: Hovered pile scales up, glows
3. **Click**: Immediate feedback, card moves
4. **Empty Pile**: Show grayed out with "Empty" text

#### Animation Sequence
```
1. Modal fade in (200ms)
2. Piles slide in from sides (300ms, stagger 100ms)
3. Idle pulse (2s loop, subtle scale 1.0-1.05)
4. On click:
   - Card flips face up (if face down)
   - Card moves to player hand (500ms ease-out)
   - Modal fades out (200ms)
5. Success notification (toast, 3s)
```

#### Timing
- Modal appear: 200ms
- User decision time: Unlimited
- Card transfer: 500ms
- Modal dismiss: 200ms
- Total minimum: ~1s

#### Accessibility
- **Keyboard**: Tab between piles, Enter/Space to select
- **Screen Reader**: "Crab effect activated. Choose a card. Left pile has [card name], Right pile has [card name]."
- **Focus Ring**: Clear blue outline on focused pile

#### Mobile Adaptations
- Larger touch targets (min 60x60px)
- Stack piles vertically if narrow screen
- Simplified animations

#### Error Handling
- **Both piles empty**: Auto-skip effect, show message "Both discard piles are empty"
- **Network error**: Retry mechanism, loading spinner

---

## Effect 2: 🐟 Fish Effect (`draw_blind`)

### What It Does
When a player plays a pair of 2 Fish, they **automatically draw 1 card from the deck** (blind draw, no choice).

### User Flow
```
1. Player plays 2 Fish
2. Game detects effect
3. Automatic execution (no user input needed)
4. Brief notification appears
5. Card animates from deck to hand
6. Feedback message
7. Game continues
```

### Visual Design

#### Notification Banner
```
┌─────────────────────────────────────┐
│  🐟 Fish Effect!                     │
│  Drawing 1 card from the deck...    │
│         [Deck Animation]             │
└─────────────────────────────────────┘
```

#### Component Spec
- **Type**: Toast notification (non-blocking)
- **Position**: Top-center of screen
- **Style**:
  - Background: var(--card-blue) with 90% opacity
  - Text: White, bold
  - Icon: 🐟 emoji, 2rem
  - Border radius: var(--radius-lg)
  - Shadow: var(--shadow-lg)
- **Duration**: 2 seconds
- **Timing**: Appears immediately after pair is played

#### Animation Sequence
```
1. Notification slides down (200ms)
2. Deck card flips to show back (100ms)
3. Card moves from deck to hand (600ms bezier curve)
4. Card flips to reveal face (200ms)
5. Notification fades out (300ms)
6. Hand reorganizes (200ms)
```

#### Timing
- Notification: 200ms in, 2s display, 300ms out
- Card animation: 900ms total
- Total: ~3.4s

#### Accessibility
- **Screen Reader**: "Fish effect activated. You drew [card name] from the deck."
- **Reduced Motion**: Skip fancy animations, instant transfer

#### Mobile Adaptations
- Full-width notification bar
- Slightly slower animation for visibility

#### Error Handling
- **Deck empty**: Show message "Deck is empty, cannot draw"
- **Hand full**: Should not happen, but handle gracefully

---

## Effect 3: ⛵ Sailboat Effect (`extra_turn`)

### What It Does
When a player plays a pair of 2 Sailboats, they **get an extra turn** after the current turn ends.

### User Flow
```
1. Player plays 2 Sailboats
2. Game detects effect
3. Persistent indicator appears
4. Current turn continues normally
5. At turn end, instead of passing to next player
6. Same player gets another turn
7. Indicator updates or disappears
```

### Visual Design

#### Turn Indicator
```
┌─────────────────────────────────────┐
│  🎯 Your Turn                        │
│  ⛵ Extra Turn Active! (Turn 1 of 2)│
└─────────────────────────────────────┘
```

#### Component Spec
- **Type**: Persistent banner (stays visible during turns)
- **Position**: Top of game board, below navigation
- **Style**:
  - Background: Gradient (var(--status-success) to var(--card-green))
  - Text: White, bold
  - Icon: ⛵ emoji
  - Border: 2px solid darker green
  - Animation: Subtle pulse or wave animation

#### Badge on Current Turn Indicator
```
┌──────────────────────┐
│ ▶ Your Turn          │
│ ⛵ Extra Turn (1/2)  │
└──────────────────────┘
```

#### Notification (when effect activates)
```
┌─────────────────────────────────────┐
│  ⛵ Sailboat Effect!                 │
│  You will get an extra turn!        │
└─────────────────────────────────────┘
```

#### Animation Sequence
```
1. On pair played:
   - Notification slides in (200ms)
   - Badge appears with bounce (300ms)
   - Notification auto-dismisses after 3s
2. During turns:
   - Badge pulses gently (2s loop)
   - Counter updates "Turn 1 of 2" → "Turn 2 of 2"
3. On second turn end:
   - Badge fades out (300ms)
   - Success sparkle effect (optional)
```

#### Timing
- Initial notification: 3s display
- Badge: Persistent until extra turn used
- Turn counter: Updates instantly

#### Accessibility
- **Screen Reader**: "Sailboat effect activated. You have an extra turn. Currently turn 1 of 2."
- **Visual**: Clear color differentiation from normal turn indicator

#### Mobile Adaptations
- Compact badge version
- Icon-only mode if space constrained

#### Error Handling
- **Game interrupted**: Preserve extra turn state in database
- **Player disconnects**: Extra turn waits until reconnection

---

## Effect 4: 🦈🏊 Shark + Swimmer Effect (`steal_card`)

### What It Does
When a player plays Shark + Swimmer combo, they can **steal a random card from another player's hand**.

### User Flow
```
1. Player plays Shark + Swimmer pair
2. Game detects effect
3. Modal shows all opponents
4. Player selects an opponent
5. Random card stolen from opponent's hand
6. Card animates to player's hand
7. Both players see notifications
8. Game continues
```

### Visual Design

#### Selection Modal
```
┌─────────────────────────────────────┐
│  🦈🏊 Shark + Swimmer Effect!        │
│                                      │
│  Choose a player to steal from:     │
│                                      │
│  ┌──────────┐  ┌──────────┐        │
│  │ Player 2 │  │ Player 3 │        │
│  │   👤     │  │   👤     │        │
│  │ 5 cards  │  │ 3 cards  │        │
│  └──────────┘  └──────────┘        │
│     Click         Click              │
└─────────────────────────────────────┘
```

#### Component Spec
- **Container**: Large modal, centered
- **Title**:
  - Text: "🦈🏊 Shark + Swimmer Effect!"
  - Font: Bold, 1.75rem
  - Color: var(--card-blue) or var(--card-gray)
- **Player Cards**:
  - Display: Grid layout (2 columns on desktop, 1 on mobile)
  - Content: Avatar, name, card count
  - Style: Card-like boxes with hover effect
  - Disabled: Players with 0 cards (grayed out)

#### Player Card Spec
```css
.opponent-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: var(--transition-medium);
}

.opponent-card:hover {
  border-color: var(--primary-ocean);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.opponent-card--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Animation Sequence
```
1. Modal appears (fade + scale, 300ms)
2. Player cards slide in (staggered, 100ms delay each)
3. On player selection:
   - Selected card flashes (200ms)
   - "Stealing card..." animation (spinning cards, 1s)
   - Card flies from opponent area to player hand (800ms)
   - Card flips to reveal (300ms)
4. Modal fades out (200ms)
5. Notifications for both players (3s each)
```

#### Notifications

**For Stealer:**
```
┌─────────────────────────────────────┐
│  ✅ You stole [🐟 Fish] from         │
│     Player 2!                        │
└─────────────────────────────────────┘
```

**For Victim:**
```
┌─────────────────────────────────────┐
│  ⚠️ Player 1 stole a card from you! │
│     (You lost 1 card)                │
└─────────────────────────────────────┘
```

#### Timing
- Modal appear: 300ms
- Selection time: User-controlled
- Steal animation: 2.1s total
- Modal dismiss: 200ms
- Notification: 3s display

#### Accessibility
- **Keyboard**: Tab through opponents, Enter to select
- **Screen Reader**: "Shark and Swimmer effect activated. Choose an opponent to steal from. Player 2 has 5 cards. Player 3 has 3 cards."
- **Focus**: Clear visual focus indicator

#### Mobile Adaptations
- Single column layout
- Larger tap targets
- Fullscreen modal on small screens

#### Error Handling
- **All opponents have 0 cards**: Auto-skip effect, show message
- **Selected player disconnects**: Random selection from available players
- **Network error**: Retry with timeout

---

## Common Design Patterns

### Modal Base Style
```css
.effect-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  padding: var(--spacing-xl);
  z-index: var(--z-modal);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

.effect-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: calc(var(--z-modal) - 1);
  backdrop-filter: blur(4px);
}
```

### Notification Toast Style
```css
.effect-notification {
  position: fixed;
  top: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-ocean);
  color: var(--text-inverse);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-toast);
  font-weight: var(--font-weight-semibold);
}
```

### Animation Keyframes
```css
@keyframes slideDown {
  from {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes cardFly {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(var(--tx), var(--ty)) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(var(--tx-end), var(--ty-end)) scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(44, 95, 141, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(44, 95, 141, 0);
  }
}
```

---

## Implementation Priority

### Phase 1 (MVP)
1. ✅ **Fish Effect** - Simplest, automatic
2. ✅ **Crab Effect** - Basic interaction

### Phase 2
3. ✅ **Sailboat Effect** - UI indicator

### Phase 3
4. ✅ **Shark + Swimmer Effect** - Most complex

---

## Testing Checklist

For each effect, test:
- ✅ Effect triggers correctly after pair played
- ✅ UI appears as expected
- ✅ User can complete interaction
- ✅ Animation plays smoothly
- ✅ Effect executes correctly
- ✅ Game state updates properly
- ✅ Multiplayer sync works
- ✅ Error cases handled
- ✅ Keyboard navigation works
- ✅ Screen reader announces correctly
- ✅ Mobile layout responsive
- ✅ Reduced motion respected

---

**Last Updated**: 2025-01-20
**Version**: 1.0
