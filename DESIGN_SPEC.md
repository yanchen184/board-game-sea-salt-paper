# Sea Salt & Paper - UI/UX Design Specification

## Table of Contents
1. [Design System](#design-system)
2. [Component Specifications](#component-specifications)
3. [Screen Layouts](#screen-layouts)
4. [Interaction Flows](#interaction-flows)
5. [Responsive Design](#responsive-design)
6. [Animation Specifications](#animation-specifications)
7. [Accessibility Guidelines](#accessibility-guidelines)

---

## Design System

### Color Palette

```css
/* Primary Colors */
--primary-ocean: #2C5F8D;      /* Main ocean blue */
--primary-ocean-dark: #1E4165;  /* Darker variant for depth */
--primary-ocean-light: #4A7BA7; /* Lighter variant for hover */
--primary-ocean-pale: #E8F2F9;  /* Very light for backgrounds */

/* Secondary Colors */
--secondary-sand: #F5E6D3;      /* Sandy beige */
--secondary-sand-dark: #E8D4B8; /* Darker sand for borders */
--secondary-sand-light: #FAF4ED; /* Light sand for backgrounds */

/* Accent Colors */
--accent-coral: #E74C3C;        /* Coral red for important actions */
--accent-coral-dark: #C0392B;   /* Darker coral for hover */
--accent-coral-light: #EC7063;  /* Light coral for notifications */

/* Card Colors */
--card-blue: #3498DB;            /* Water creatures */
--card-red: #E74C3C;             /* Fire/warm creatures */
--card-yellow: #F1C40F;          /* Sun/beach creatures */
--card-purple: #9B59B6;          /* Mystical creatures */

/* Status Colors */
--status-success: #27AE60;       /* Success/ready states */
--status-warning: #F39C12;       /* Warning/waiting states */
--status-error: #E74C3C;         /* Error states */
--status-info: #3498DB;          /* Information */

/* Neutral Colors */
--neutral-white: #FFFFFF;
--neutral-gray-100: #F8F9FA;    /* Lightest gray */
--neutral-gray-200: #E9ECEF;    /* Light gray */
--neutral-gray-300: #DEE2E6;    /* Medium light gray */
--neutral-gray-400: #CED4DA;    /* Medium gray */
--neutral-gray-500: #ADB5BD;    /* True medium */
--neutral-gray-600: #6C757D;    /* Medium dark */
--neutral-gray-700: #495057;    /* Dark gray */
--neutral-gray-800: #343A40;    /* Darker gray */
--neutral-gray-900: #212529;    /* Darkest gray */

/* Shadows */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.2);
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.15);
--shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.2);
```

### Typography Scale

```css
/* Font Families */
--font-primary: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-secondary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Fira Code', 'Courier New', monospace;

/* Font Sizes */
--font-size-xs: 0.75rem;     /* 12px */
--font-size-sm: 0.875rem;    /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg: 1.125rem;    /* 18px */
--font-size-xl: 1.25rem;     /* 20px */
--font-size-2xl: 1.5rem;     /* 24px */
--font-size-3xl: 1.875rem;   /* 30px */
--font-size-4xl: 2.25rem;    /* 36px */
--font-size-5xl: 3rem;       /* 48px */

/* Font Weights */
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Heights */
--line-height-tight: 1.2;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;

/* Letter Spacing */
--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;
--letter-spacing-widest: 0.1em;
```

### Spacing System (8px Grid)

```css
/* Spacing Scale */
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
--spacing-32: 8rem;     /* 128px */
```

### Border & Radius

```css
/* Border Widths */
--border-width-thin: 1px;
--border-width-medium: 2px;
--border-width-thick: 4px;

/* Border Radius */
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* Fully rounded */
--radius-card: 0.75rem;  /* Standard card radius */
```

### Z-Index Scale

```css
--z-index-negative: -1;
--z-index-base: 0;
--z-index-dropdown: 100;
--z-index-sticky: 200;
--z-index-overlay: 300;
--z-index-modal: 400;
--z-index-popover: 500;
--z-index-tooltip: 600;
--z-index-toast: 700;
--z-index-max: 9999;
```

---

## Component Specifications

### 1. Card Component

#### Visual Design
- **Dimensions**:
  - Desktop: 100px × 140px
  - Mobile: 70px × 98px
- **Border Radius**: var(--radius-card)
- **Background**: White with subtle texture gradient
- **Border**: 2px solid based on card color
- **Shadow**: var(--shadow-card), increases on hover

#### Card Structure
```
┌─────────────┐
│   [Icon]    │  <- Card type icon (40% of card height)
│             │
│  [Name]     │  <- Card name (small text)
│             │
│   [Value]   │  <- Large number in corner
└─────────────┘
```

#### States
- **Default**: Base shadow, full opacity
- **Hover**: Lifted shadow, slight scale(1.05)
- **Selected**: Glowing border (3px), background tint
- **Disabled**: opacity: 0.5, grayscale filter
- **Dragging**: opacity: 0.8, cursor: grabbing

### 2. Button Component

#### Primary Button
```css
.button--primary {
  background: var(--primary-ocean);
  color: var(--neutral-white);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  transition: all 200ms ease-out;
}

.button--primary:hover {
  background: var(--primary-ocean-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

#### Secondary Button
```css
.button--secondary {
  background: var(--neutral-white);
  color: var(--primary-ocean);
  border: 2px solid var(--primary-ocean);
  padding: calc(var(--spacing-3) - 2px) calc(var(--spacing-6) - 2px);
}
```

#### Danger Button
```css
.button--danger {
  background: var(--accent-coral);
  color: var(--neutral-white);
}
```

### 3. Modal Component

#### Structure
```css
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal__content {
  background: var(--neutral-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}
```

### 4. Played Pairs Component

**Purpose**: Display cards that have been paired and played by each player

#### Visual Design
- **Location**:
  - Desktop: Below player's hand area
  - Mobile: Collapsed section, expandable on tap
  - Opponents: Shown in compact form in opponent cards
- **Background**: Subtle beige tint (rgba(245, 230, 211, 0.6))
- **Layout**: Horizontal flex row with wrapping

#### Pair Structure
Each played pair consists of:
- **Two mini cards** (50px × 70px on desktop, 40px × 56px on mobile)
- **Pair container** with subtle background and shadow
- **Effect indicator badge** (optional, shows pair effect icon)

#### States
- **Default**: Subtle shadow, normal size
- **Hover**: Elevated shadow, slight lift (-2px translateY)
- **Empty**: Italic text message "No pairs played yet"

#### Mini Card Design
```
┌────────┐ ┌────────┐
│  🐟    │ │  🐟    │  <- Emoji/icon centered
│        │ │        │
│    1   │ │    1   │  <- Small value number
└────────┘ └────────┘
     └──────┘
   Pair container
```

#### Color Coding
- **Blue cards**: Gradient from #3498DB to #2980B9
- **Red cards**: Gradient from #E74C3C to #C0392B
- **Yellow cards**: Gradient from #F1C40F to #F39C12
- **Purple cards**: Gradient from #9B59B6 to #8E44AD

#### Opponent Display
For opponent cards (compact view):
- Show pairs inline with emoji pairs: "🐟🐟 🦀🦀"
- Label: "Played:" in small, uppercase text
- Wrap if more than 3 pairs

#### Responsive Behavior
- **Desktop (1024px+)**: Full mini cards in dedicated section
- **Tablet (768px-1023px)**: Slightly smaller cards, still in section
- **Mobile (<768px)**: Collapsible accordion or emoji-only display

### 5. Score Panel Component

**Purpose**: Display current scores for all players in the game

#### Visual Design
- **Location**: Bottom of game board (left side)
- **Layout**: Vertical list of player scores
- **Background**: White with subtle shadow
- **Border**: 2px border-bottom on title with ocean blue color

#### Structure
- **Title**: "SCORE PANEL" in uppercase, bold, with underline
- **Player Items**: List of players with scores
  - Bullet point before each name (•)
  - Player name on left
  - Score value on right (larger font, ocean blue)
  - Current player highlighted with background tint and left border

#### States
- **Default**: Normal list item
- **Hover**: Light blue background tint
- **Current Player**: Highlighted with blue background and left border
- **Winning Player**: Star icon (⭐) next to name

#### Responsive Behavior
- **Desktop**: Fixed height (200px max), scrollable if needed
- **Mobile**: Collapsible with arrow indicator, max 150px height

### 6. Action Log Component

**Purpose**: Display recent game actions in chronological order

#### Visual Design
- **Location**: Bottom of game board (right side)
- **Layout**: Vertical scrollable list (newest at top)
- **Background**: White with subtle shadow
- **Max Entries**: 20 most recent actions

#### Action Item Structure
- **Left Border**: 3px colored border (blue for recent, gray for old)
- **Prefix**: ">" symbol before each action
- **Text**: Brief description of action
  - Format: "P2 drew from deck"
  - Format: "P1 played Fish pair"
  - Format: "P3 declared 'Stop'"

#### States
- **Recent**: Bold text, blue left border, slide-in animation
- **Old**: Normal text, gray left border
- **Hover**: Light blue background tint

#### Animations
- **New Action**: Slide in from right (300ms)
- **Auto-scroll**: Scroll to top when new action added

#### Responsive Behavior
- **Desktop**: Fixed height (200px max), scrollable
- **Mobile**: Collapsible with arrow indicator, max 150px height, can be dismissed

---

## Screen Layouts

### 1. Home Page Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│              [Wave Animation]                │
│                                             │
│         ╭──────────────────╮                │
│         │  SEA SALT & PAPER │                │ <- Large title
│         │   [Subtitle text]  │                │
│         ╰──────────────────╯                │
│                                             │
│     ┌─────────────┐  ┌─────────────┐       │
│     │ CREATE ROOM │  │  JOIN ROOM  │       │ <- Primary actions
│     └─────────────┘  └─────────────┘       │
│                                             │
│         [ How to Play ] [ Settings ]        │ <- Secondary actions
│                                             │
└─────────────────────────────────────────────┘
```

#### CSS Layout
```css
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-ocean-pale) 0%, var(--secondary-sand-light) 100%);
}

.home-page__title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-ocean);
  text-align: center;
  margin-bottom: var(--spacing-8);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.home-page__actions {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}

@media (max-width: 768px) {
  .home-page__actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
}
```

### 2. Room Lobby Layout

```
┌─────────────────────────────────────────────┐
│  Room Code: ABC123         [Copy] [Share]   │ <- Header
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────┬─────────────────┐ │
│  │   PLAYERS (2/4)     │   GAME SETTINGS  │ │
│  ├─────────────────────┼─────────────────┤ │
│  │ • Player 1 (Host) ✓ │ Target Score: 40 │ │
│  │ • Player 2       ✓ │ AI Difficulty: ▼ │ │
│  │ • [Waiting...]     │ Color Bonus: [✓] │ │
│  │ • [Invite Player]  │ Mermaid Win: [✓] │ │
│  │                    │                   │ │
│  │                    │ [Update Settings] │ │
│  └─────────────────────┴─────────────────┘ │
│                                             │
│         [ START GAME ] (Host only)          │
│         [ LEAVE ROOM ]                      │
│                                             │
└─────────────────────────────────────────────┘
```

### 3. Main Game Board Layout (Desktop)

```
┌────────────────────────────────────────────────────────────────┐
│  [Opponent 2]            [Opponent 3]         [Opponent 4]     │ <- Top opponents
│  Cards: 5 Score: 12      Cards: 3 S: 8        Cards: 7 S:15    │
│  Played: [🐟🐟] [🦀🦀]    Played: [🐙🐙]        Played: None      │ <- Played pairs
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         PLAY AREA                               │
│                                                                 │
│        [Discard]       [Draw Deck]        [Discard]            │ <- Center area
│         Pile 1          (32 cards)         Pile 2              │
│       Top: 🐠🐚         [Deck Back]         Top: 🦈🏊            │
│                                                                 │
│                  Current Turn: Player 2                         │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                       YOUR HAND (Player 1)                      │ <- Player hand
│            [Card] [Card] [Card] [Card] [Card] [Card]           │
├────────────────────────────────────────────────────────────────┤
│  YOUR PLAYED PAIRS:  [🐟🐟] [🦀🦀] [🐚🐚]                        │ <- Your played pairs
├────────────────────────────────────────────────────────────────┤
│  [ Declare Stop ]  [ End Turn ]  [ Play Pair ]                 │ <- Action buttons
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │    SCORE PANEL           │  │    ACTION LOG             │   │ <- Bottom panels
│  │  • Player 1 (You): 23 ⭐ │  │  > P2 drew from deck      │   │
│  │  • Player 2: 18          │  │  > P1 played Fish pair    │   │
│  │  • Player 3: 8           │  │  > P3 took from discard   │   │
│  │  • Player 4: 15          │  │  > P2 declared "Stop"     │   │
│  │                          │  │  > P1 drew 2 cards        │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### 4. Main Game Board Layout (Mobile)

```
┌─────────────────┐
│  Opp: 2/3/4  ▼  │ <- Collapsed opponent bar (tap to expand)
│  Turn: Player 2 │
├─────────────────┤
│                 │
│   [Draw Deck]   │ <- Simplified center
│   (32 cards)    │
│                 │
│  [D1]    [D2]   │ <- Discard piles
│                 │
├─────────────────┤
│   YOUR HAND     │ <- Scrollable hand
│ [C][C][C][C][C] │
├─────────────────┤
│  Your Pairs:    │ <- Your played pairs
│  🐟🐟 🦀🦀 🐚🐚   │
├─────────────────┤
│ [Stop] [End] [≡]│ <- Action buttons
├─────────────────┤
│ Scores [▼]      │ <- Collapsible score panel
│ You: 23 ⭐      │
│ P2:18 P3:8 P4:15│
├─────────────────┤
│ Log [▼]         │ <- Collapsible action log
│ P2 drew card    │
│ P1 played pair  │
│ P3 took discard │
└─────────────────┘
```

---

## Interaction Flows

### Card Selection Flow
1. **Hover**: Card lifts slightly (transform: translateY(-4px))
2. **Click**: Card gets selection border, adds to selected array
3. **Click Again**: Deselects card
4. **Drag Start**: Card becomes semi-transparent
5. **Drag Over Valid Target**: Target highlights
6. **Drop**: Card animates to destination

### Turn Flow Visual Feedback
1. **Your Turn Start**:
   - Pulse animation on your hand area
   - "Your Turn" banner slides in
   - Action buttons become enabled

2. **During Your Turn**:
   - Hand cards are interactive
   - Draw deck glows subtly

3. **Opponent's Turn**:
   - Your cards become non-interactive
   - Opponent's area highlights
   - Loading spinner on active opponent

### Declare Stop Flow
1. Click "Declare Stop" button
2. Modal appears with two large buttons:
   - "STOP" (ends round immediately)
   - "LAST CHANCE" (one more turn for everyone)
3. Confirmation animation
4. Broadcast decision to all players

---

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
/* Base styles for mobile < 768px */

/* Tablet */
@media (min-width: 768px) {
  /* Tablet-specific styles */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Desktop-specific styles */
}

/* Large Desktop */
@media (min-width: 1440px) {
  /* Large screen optimizations */
}
```

### Layout Adaptations

#### Mobile (< 768px)
- Single column layout
- Collapsed opponent information
- Bottom sheet for detailed views
- Swipeable card hand
- Full-screen modals

#### Tablet (768px - 1023px)
- Two-column layout where applicable
- Side drawer for score/log
- Larger touch targets
- Landscape orientation optimized

#### Desktop (≥ 1024px)
- Full multi-panel layout
- All information visible
- Hover states enabled
- Keyboard shortcuts active
- Drag and drop enabled

---

## Animation Specifications

### Core Animations

#### Card Draw Animation
```css
@keyframes cardDraw {
  0% {
    transform: translateX(-100px) rotateY(180deg);
    opacity: 0;
  }
  50% {
    transform: translateX(20px) rotateY(90deg);
    opacity: 0.5;
  }
  100% {
    transform: translateX(0) rotateY(0);
    opacity: 1;
  }
}

.card--drawing {
  animation: cardDraw 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Turn Indicator Pulse
```css
@keyframes turnPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(44, 95, 141, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(44, 95, 141, 0);
  }
}

.turn-indicator--active {
  animation: turnPulse 2s infinite;
}
```

#### Score Increment
```css
@keyframes scoreIncrement {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
    color: var(--status-success);
  }
  100% {
    transform: scale(1);
  }
}

.score--incrementing {
  animation: scoreIncrement 600ms ease-out;
}
```

### Timing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration Standards
- Micro-interactions: 150-200ms
- Card animations: 300-500ms
- Page transitions: 300-400ms
- Complex sequences: 600-1000ms

---

## Accessibility Guidelines

### Color Contrast
- Text on backgrounds: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio
- Use patterns/icons alongside color coding

### Keyboard Navigation
```css
/* Focus styles */
:focus-visible {
  outline: 3px solid var(--primary-ocean);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary-ocean);
  color: var(--neutral-white);
  padding: var(--spacing-2) var(--spacing-4);
  text-decoration: none;
  z-index: var(--z-index-max);
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Labels
```html
<!-- Card example -->
<div
  class="card"
  role="button"
  tabindex="0"
  aria-label="Fish card, value 2, blue color"
  aria-selected="false"
>
  <!-- Card content -->
</div>

<!-- Turn indicator -->
<div
  class="turn-indicator"
  role="status"
  aria-live="polite"
  aria-label="Current turn: Player 2"
>
  <!-- Turn display -->
</div>
```

### Screen Reader Support
- Announce turn changes
- Describe card actions
- Provide score updates
- Label all interactive elements
- Use semantic HTML

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Edge Cases & Special Considerations

### Empty States
- No cards in hand: "Draw a card to continue"
- Empty draw deck: "Deck reshuffling..." animation
- No players in room: "Waiting for players..."
- Connection lost: Overlay with reconnection status

### Loading States
- Skeleton screens for initial load
- Spinner for async operations
- Progress bar for game setup
- Pulse animation for updating data

### Error States
- Toast notifications for errors
- Inline validation messages
- Connection error overlay
- Graceful degradation

### Performance Optimizations
- Use CSS transforms (GPU accelerated)
- Avoid layout thrashing
- Debounce hover effects
- Lazy load non-critical assets
- CSS containment for card grids

---

## Implementation Priority

### Phase 1: Core Components
1. Design system setup (variables.css)
2. Card component
3. Button component
4. Basic layout structure

### Phase 2: Game Board
1. Game board layout
2. Player hand area
3. Draw/discard piles
4. Turn management UI

### Phase 3: Interactions
1. Card selection
2. Drag and drop
3. Animations
4. Responsive adaptations

### Phase 4: Polish
1. Advanced animations
2. Sound effects integration
3. Celebration effects
4. Fine-tuning

---

## Design Tokens Summary

```css
/* Quick reference for developers */
:root {
  /* Core spacing unit */
  --base-unit: 8px;

  /* Standard transitions */
  --transition-fast: 150ms ease-out;
  --transition-medium: 300ms ease-out;
  --transition-slow: 500ms ease-out;

  /* Card dimensions */
  --card-width: 100px;
  --card-height: 140px;
  --card-width-mobile: 70px;
  --card-height-mobile: 98px;

  /* Layout widths */
  --max-width-sm: 640px;
  --max-width-md: 768px;
  --max-width-lg: 1024px;
  --max-width-xl: 1280px;

  /* Header height */
  --header-height: 64px;
  --header-height-mobile: 56px;
}
```

---

This design specification provides a complete foundation for implementing the Sea Salt & Paper game UI. The design emphasizes clarity, responsiveness, and delightful interactions while maintaining accessibility and performance standards.