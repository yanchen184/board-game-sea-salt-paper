# Round Settlement Animation - Design Specification

## Table of Contents
1. [Overview](#overview)
2. [Animation Timeline](#animation-timeline)
3. [Visual Design](#visual-design)
4. [Layout Structure](#layout-structure)
5. [Animation Phases](#animation-phases)
6. [CSS Implementation](#css-implementation)
7. [Component Structure](#component-structure)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)
10. [Performance Considerations](#performance-considerations)

---

## Overview

### Purpose
Create an immersive, theatrical round settlement experience that transforms the end-of-round scoring into a dramatic reveal sequence. All players watch synchronized animations showing each player's cards being revealed and scored.

### Design Philosophy
- **Ocean Theme**: Consistent with the Sea Salt & Paper aesthetic
- **Dramatic Reveal**: Build tension before showing scores
- **Clear Communication**: Players understand exactly how scores are calculated
- **Synchronized Experience**: All players see the same animation at the same time
- **Celebratory**: Winners feel rewarded with special visual effects

### Key Features
- Full-screen overlay with ocean-themed backdrop
- Sequential player card reveals
- Animated score calculation with item-by-item breakdown
- Particle effects for score accumulation
- Special effects for winners and high scores
- Rank reveal with podium-style presentation

---

## Animation Timeline

### Total Duration: ~15-20 seconds per player + 5 seconds for final ranking

```
Timeline Overview (for 4 players):
=====================================

Phase 0: Intro (1.5s)
  |-- Overlay fade in (0.3s)
  |-- Title animation "Round Complete" (0.5s)
  |-- Declarer highlight (0.7s)

Phase 1: Player 1 Reveal (4-5s)
  |-- Player spotlight (0.3s)
  |-- Hand cards flip sequence (1.5s, 0.15s stagger)
  |-- Played pairs reveal (0.8s)
  |-- Score calculation sequence (2-3s)
      |-- Base score tick (0.4s)
      |-- Pairs bonus (0.3s)
      |-- Multipliers (0.3s each)
      |-- Mermaid score (0.5s)
      |-- Color bonus (0.4s)
      |-- Total reveal with burst (0.6s)

Phase 2-4: Other Players (3-4s each)
  |-- Same structure as Phase 1
  |-- Faster timing for non-declarers

Phase 5: Final Ranking (5s)
  |-- All scores fly to center (0.8s)
  |-- Ranking sort animation (1s)
  |-- Winner spotlight + celebration (2s)
  |-- Bonus points for declarer (if won) (1.2s)

Phase 6: Outro (2s)
  |-- "Continue" button appears (0.5s)
  |-- Auto-advance countdown (optional)
```

### Timing Configuration (CSS Variables)
```css
:root {
  /* Phase Durations */
  --settle-intro-duration: 1500ms;
  --settle-player-spotlight: 300ms;
  --settle-card-flip-duration: 400ms;
  --settle-card-flip-stagger: 150ms;
  --settle-pairs-reveal: 800ms;
  --settle-score-item-duration: 400ms;
  --settle-total-reveal: 600ms;
  --settle-ranking-duration: 3000ms;
  --settle-celebration-duration: 2000ms;

  /* Easing Functions */
  --settle-ease-reveal: cubic-bezier(0.34, 1.56, 0.64, 1);
  --settle-ease-score-pop: cubic-bezier(0.68, -0.6, 0.32, 1.6);
  --settle-ease-dramatic: cubic-bezier(0.16, 1, 0.3, 1);
  --settle-ease-float: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

---

## Visual Design

### Color Palette (Using existing variables.css)

```css
/* Settlement Screen Colors */
--settle-bg-primary: rgba(13, 40, 24, 0.95);        /* Deep ocean dark */
--settle-bg-gradient: radial-gradient(
  ellipse at center,
  rgba(26, 95, 60, 0.9) 0%,
  rgba(13, 40, 24, 0.98) 100%
);

/* Spotlight Colors */
--settle-spotlight-active: rgba(255, 215, 0, 0.15); /* Gold spotlight */
--settle-spotlight-declarer: rgba(231, 76, 60, 0.2); /* Coral for declarer */

/* Score Colors */
--settle-score-base: var(--neutral-white);
--settle-score-bonus: var(--status-success);        /* #27AE60 */
--settle-score-multiplier: var(--card-purple);      /* #9B59B6 */
--settle-score-mermaid: var(--card-blue);           /* #3498DB */
--settle-score-color: var(--card-yellow);           /* #F1C40F */
--settle-score-total: var(--effect-glow-gold);      /* #FFD700 */

/* Rank Colors */
--settle-rank-gold: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
--settle-rank-silver: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
--settle-rank-bronze: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);

/* Particle Colors */
--settle-particle-gold: rgba(255, 215, 0, 0.8);
--settle-particle-white: rgba(255, 255, 255, 0.9);
--settle-particle-blue: rgba(52, 152, 219, 0.7);
```

### Typography

```css
/* Settlement Typography */
.settlement__title {
  font-family: var(--font-primary);
  font-size: var(--font-size-4xl);        /* 36px */
  font-weight: var(--font-weight-bold);
  color: var(--neutral-white);
  text-shadow:
    0 0 20px rgba(255, 215, 0, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: var(--letter-spacing-wide);
}

.settlement__player-name {
  font-size: var(--font-size-2xl);        /* 24px */
  font-weight: var(--font-weight-semibold);
  color: var(--neutral-white);
}

.settlement__score-label {
  font-size: var(--font-size-sm);         /* 14px */
  font-weight: var(--font-weight-medium);
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
}

.settlement__score-value {
  font-family: var(--font-mono);
  font-size: var(--font-size-3xl);        /* 30px */
  font-weight: var(--font-weight-bold);
}

.settlement__total-score {
  font-size: var(--font-size-5xl);        /* 48px */
  font-weight: var(--font-weight-bold);
  background: var(--settle-rank-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}
```

---

## Layout Structure

### Desktop Layout (1024px+)

```
+------------------------------------------------------------------+
|                      ROUND SETTLEMENT                              |
|                    "Player X declared STOP"                        |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------------+    +-------------------------------+   |
|  |                        |    |                               |   |
|  |    PLAYER SPOTLIGHT    |    |      SCORE BREAKDOWN          |   |
|  |                        |    |                               |   |
|  |  [Avatar/Name Badge]   |    |   Base Score      +12        |   |
|  |                        |    |   -----------------           |   |
|  |  +------------------+  |    |   Pairs Bonus     +3         |   |
|  |  |                  |  |    |   Multipliers     +4         |   |
|  |  |   HAND CARDS     |  |    |   Mermaids        +5         |   |
|  |  |   (revealed)     |  |    |   Color Bonus     +3         |   |
|  |  |                  |  |    |   -----------------           |   |
|  |  +------------------+  |    |                               |   |
|  |                        |    |   TOTAL           27         |   |
|  |  PLAYED PAIRS:         |    |                               |   |
|  |  [Pair][Pair][Pair]    |    +-------------------------------+   |
|  |                        |    |                               |   |
|  +------------------------+    |   OTHER PLAYERS (waiting)     |   |
|                                |   P2: ?? | P3: ?? | P4: ??    |   |
|                                +-------------------------------+   |
|                                                                    |
+------------------------------------------------------------------+
|                     [ Skip Animation ]                             |
+------------------------------------------------------------------+
```

### Final Ranking Layout

```
+------------------------------------------------------------------+
|                        FINAL RANKINGS                              |
+------------------------------------------------------------------+
|                                                                    |
|                          +-------+                                 |
|                          |       |                                 |
|           +-------+      |  1st  |      +-------+                  |
|           |       |      | GOLD  |      |       |                  |
|           |  2nd  |      | 35pts |      |  3rd  |                  |
|           |SILVER |      +-------+      |BRONZE |                  |
|           | 28pts |    [Player Name]    | 22pts |                  |
|           +-------+     [Confetti]      +-------+                  |
|         [Player 2]                     [Player 3]                  |
|                                                                    |
|                      4th Place: Player 4 - 18pts                   |
|                                                                    |
+------------------------------------------------------------------+
|                       [ Continue to Next Round ]                   |
+------------------------------------------------------------------+
```

### Mobile Layout (<768px)

```
+-----------------------------+
|      ROUND SETTLEMENT       |
|   "Player X declared STOP"  |
+-----------------------------+
|                             |
|    [Player Name + Avatar]   |
|                             |
|    HAND CARDS (scrollable)  |
|    [C][C][C][C][C][C]       |
|                             |
|    PLAYED PAIRS             |
|    [Pair] [Pair]            |
|                             |
+-----------------------------+
|    SCORE BREAKDOWN          |
|    Base Score      +12      |
|    Pairs Bonus     +3       |
|    Multipliers     +4       |
|    Mermaids        +5       |
|    Color Bonus     +3       |
|    ----------------------   |
|    TOTAL           27       |
+-----------------------------+
|    Other Players:           |
|    P2: ?? | P3: ?? | P4: ?? |
+-----------------------------+
|      [ Skip Animation ]     |
+-----------------------------+
```

---

## Animation Phases

### Phase 0: Introduction

**Purpose**: Set the stage, announce the round is complete, highlight the declarer.

```css
/* Intro Animation Sequence */
@keyframes settleIntroOverlay {
  0% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  100% {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

@keyframes settleTitleReveal {
  0% {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
    letter-spacing: 0.5em;
  }
  60% {
    opacity: 1;
    transform: translateY(5px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    letter-spacing: var(--letter-spacing-wide);
  }
}

@keyframes settleDeclarerPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.5);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(231, 76, 60, 0);
  }
}
```

### Phase 1-4: Player Reveal Sequence

**Purpose**: Show each player's cards and calculate their score dramatically.

#### Card Flip Animation
```css
@keyframes settleCardFlip {
  0% {
    transform: rotateY(180deg) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: rotateY(90deg) scale(0.9);
    opacity: 0.5;
  }
  100% {
    transform: rotateY(0deg) scale(1);
    opacity: 1;
  }
}

/* Staggered card reveal */
.settlement__card {
  animation: settleCardFlip var(--settle-card-flip-duration) var(--settle-ease-reveal) forwards;
  animation-delay: calc(var(--card-index) * var(--settle-card-flip-stagger));
}
```

#### Score Calculation Animation
```css
/* Score item slide-in */
@keyframes settleScoreItemReveal {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  70% {
    opacity: 1;
    transform: translateX(5px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Score value counting animation */
@keyframes settleScoreCount {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.3);
    color: var(--settle-score-bonus);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Score value pop for each item */
@keyframes settleScorePop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.4);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}
```

#### Total Score Reveal
```css
@keyframes settleTotalReveal {
  0% {
    opacity: 0;
    transform: scale(0);
    filter: blur(10px);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
    filter: blur(0);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Burst effect behind total */
@keyframes settleTotalBurst {
  0% {
    opacity: 1;
    transform: scale(0);
  }
  100% {
    opacity: 0;
    transform: scale(3);
  }
}
```

### Phase 5: Final Ranking

**Purpose**: Show final standings with celebratory effects for the winner.

```css
/* Scores fly to center and sort */
@keyframes settleScoreFlyToCenter {
  0% {
    transform: translate(var(--start-x), var(--start-y)) scale(1);
  }
  100% {
    transform: translate(0, 0) scale(0.8);
  }
}

/* Ranking sort animation */
@keyframes settleRankSort {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(var(--rank-position));
  }
}

/* Winner podium rise */
@keyframes settleWinnerRise {
  0% {
    transform: translateY(100px) scale(0.8);
    opacity: 0;
  }
  60% {
    transform: translateY(-20px) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Gold shimmer for winner */
@keyframes settleGoldShimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

/* Confetti burst */
@keyframes settleConfetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
```

---

## CSS Implementation

### Complete Settlement Modal CSS

```css
/* ==================== Settlement Overlay ==================== */

.settlement {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: var(--spacing-8) var(--spacing-4);
  overflow-y: auto;

  /* Background */
  background: var(--settle-bg-gradient);
  backdrop-filter: blur(8px);

  /* Initial state for animation */
  opacity: 0;
  animation: settleIntroOverlay 300ms var(--ease-out) forwards;
}

/* ==================== Header Section ==================== */

.settlement__header {
  text-align: center;
  margin-bottom: var(--spacing-8);
  opacity: 0;
  animation: settleTitleReveal 600ms var(--settle-ease-reveal) 200ms forwards;
}

.settlement__title {
  font-family: var(--font-primary);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--neutral-white);
  margin: 0 0 var(--spacing-2) 0;
  text-shadow:
    0 0 20px rgba(255, 215, 0, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: var(--letter-spacing-wide);
}

.settlement__subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-light);
  margin: 0;
}

.settlement__declarer-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(231, 76, 60, 0.2);
  border: 2px solid var(--accent-coral);
  border-radius: var(--radius-full);
  color: var(--accent-coral-light);
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing-3);
  animation: settleDeclarerPulse 2s ease-in-out infinite;
}

/* ==================== Main Content ==================== */

.settlement__content {
  display: flex;
  gap: var(--spacing-8);
  width: 100%;
  max-width: 1200px;
  flex: 1;
}

/* ==================== Player Spotlight ==================== */

.settlement__player-spotlight {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-6);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.settlement__player-spotlight--active {
  background: var(--settle-spotlight-active);
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow:
    0 0 60px rgba(255, 215, 0, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
}

.settlement__player-spotlight--declarer {
  border-color: var(--accent-coral);
}

/* Player Info */
.settlement__player-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-6);
}

.settlement__player-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--primary-ocean);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  color: var(--neutral-white);
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.settlement__player-name {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--neutral-white);
  margin: 0;
}

.settlement__player-tag {
  font-size: var(--font-size-xs);
  color: var(--accent-coral);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
}

/* ==================== Cards Display ==================== */

.settlement__cards-section {
  width: 100%;
}

.settlement__cards-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  margin-bottom: var(--spacing-3);
}

.settlement__hand-cards {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  justify-content: center;
  margin-bottom: var(--spacing-6);
  min-height: 180px;
}

/* Individual card in settlement */
.settlement__card {
  opacity: 0;
  transform: rotateY(180deg) scale(0.8);
  transform-style: preserve-3d;
  perspective: 1000px;
}

.settlement__card--revealed {
  animation: settleCardFlip var(--settle-card-flip-duration) var(--settle-ease-reveal) forwards;
}

/* Played pairs display */
.settlement__pairs {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  flex-wrap: wrap;
}

.settlement__pair {
  display: flex;
  gap: var(--spacing-1);
  padding: var(--spacing-2);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  opacity: 0;
  transform: scale(0.8);
}

.settlement__pair--revealed {
  animation: settlePairReveal 400ms var(--settle-ease-reveal) forwards;
}

@keyframes settlePairReveal {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ==================== Score Breakdown Panel ==================== */

.settlement__score-panel {
  width: 350px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--spacing-6);
}

.settlement__score-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--neutral-white);
  margin: 0 0 var(--spacing-4) 0;
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

/* Score item row */
.settlement__score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) 0;
  opacity: 0;
  transform: translateX(-20px);
}

.settlement__score-item--revealed {
  animation: settleScoreItemReveal 400ms var(--ease-out) forwards;
}

.settlement__score-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--text-light);
}

.settlement__score-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
}

.settlement__score-value {
  font-family: var(--font-mono);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--neutral-white);
  min-width: 60px;
  text-align: right;
}

/* Score value color variants */
.settlement__score-value--base {
  color: var(--settle-score-base);
}

.settlement__score-value--bonus {
  color: var(--settle-score-bonus);
}

.settlement__score-value--multiplier {
  color: var(--settle-score-multiplier);
}

.settlement__score-value--mermaid {
  color: var(--settle-score-mermaid);
}

.settlement__score-value--color {
  color: var(--settle-score-color);
}

/* Score value pop animation */
.settlement__score-value--popping {
  animation: settleScorePop 300ms var(--settle-ease-score-pop);
}

/* Collection detail sub-item */
.settlement__score-detail {
  margin-left: var(--spacing-8);
  padding: var(--spacing-1) 0;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  opacity: 0;
}

.settlement__score-detail--revealed {
  animation: settleScoreItemReveal 300ms var(--ease-out) forwards;
}

/* Divider */
.settlement__score-divider {
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 215, 0, 0.5) 50%,
    transparent 100%
  );
  margin: var(--spacing-4) 0;
}

/* Total score */
.settlement__score-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-3);
  opacity: 0;
  transform: scale(0);
}

.settlement__score-total--revealed {
  animation: settleTotalReveal 600ms var(--settle-ease-score-pop) forwards;
}

.settlement__total-label {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--neutral-white);
}

.settlement__total-value {
  font-family: var(--font-mono);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  background: var(--settle-rank-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

/* Burst effect */
.settlement__total-burst {
  position: absolute;
  inset: -50%;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.4) 0%,
    transparent 70%
  );
  opacity: 0;
  pointer-events: none;
}

.settlement__total-burst--active {
  animation: settleTotalBurst 800ms var(--ease-out) forwards;
}

/* ==================== Waiting Players ==================== */

.settlement__waiting-players {
  margin-top: auto;
  padding: var(--spacing-4);
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-lg);
}

.settlement__waiting-title {
  font-size: var(--font-size-sm);
  color: var(--text-light);
  margin: 0 0 var(--spacing-2) 0;
}

.settlement__waiting-list {
  display: flex;
  gap: var(--spacing-4);
}

.settlement__waiting-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.settlement__waiting-score {
  font-family: var(--font-mono);
  color: var(--text-light);
}

.settlement__waiting-score--revealed {
  color: var(--neutral-white);
}

.settlement__waiting-score--hidden::after {
  content: '??';
}

/* ==================== Particle Effects ==================== */

.settlement__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.settlement__particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
}

.settlement__particle--gold {
  background: var(--settle-particle-gold);
  box-shadow: 0 0 6px var(--settle-particle-gold);
}

.settlement__particle--white {
  background: var(--settle-particle-white);
  box-shadow: 0 0 4px var(--settle-particle-white);
}

.settlement__particle--blue {
  background: var(--settle-particle-blue);
  box-shadow: 0 0 6px var(--settle-particle-blue);
}

/* Score accumulation particles */
@keyframes settleParticleFloat {
  0% {
    opacity: 1;
    transform: translate(var(--start-x), var(--start-y)) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--end-x), var(--end-y)) scale(0.3);
  }
}

.settlement__particle--floating {
  animation: settleParticleFloat 600ms var(--settle-ease-float) forwards;
}

/* ==================== Final Ranking ==================== */

.settlement__ranking {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
}

.settlement__ranking-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--neutral-white);
  margin-bottom: var(--spacing-8);
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

/* Podium */
.settlement__podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}

.settlement__podium-place {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transform: translateY(100px);
}

.settlement__podium-place--revealed {
  animation: settleWinnerRise 800ms var(--settle-ease-dramatic) forwards;
}

/* 1st place - center and tallest */
.settlement__podium-place--1st {
  order: 2;
  animation-delay: 500ms;
}

/* 2nd place - left */
.settlement__podium-place--2nd {
  order: 1;
  animation-delay: 700ms;
}

/* 3rd place - right */
.settlement__podium-place--3rd {
  order: 3;
  animation-delay: 900ms;
}

.settlement__podium-block {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--spacing-4);
  position: relative;
}

.settlement__podium-block--1st {
  height: 180px;
  background: var(--settle-rank-gold);
}

.settlement__podium-block--2nd {
  height: 140px;
  background: var(--settle-rank-silver);
}

.settlement__podium-block--3rd {
  height: 100px;
  background: var(--settle-rank-bronze);
}

.settlement__podium-rank {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.settlement__podium-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--neutral-white);
  margin-top: var(--spacing-2);
  text-align: center;
}

.settlement__podium-score {
  font-family: var(--font-mono);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--neutral-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Winner crown */
.settlement__winner-crown {
  position: absolute;
  top: -40px;
  font-size: 2.5rem;
  animation: settleCrownBounce 1s ease-in-out infinite;
}

@keyframes settleCrownBounce {
  0%, 100% {
    transform: translateY(0) rotate(-5deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

/* Winner shimmer effect */
.settlement__winner-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 20%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 80%
  );
  background-size: 200% 100%;
  animation: settleGoldShimmer 2s linear infinite;
}

/* Other places (4th+) */
.settlement__other-places {
  display: flex;
  gap: var(--spacing-4);
  opacity: 0;
}

.settlement__other-places--revealed {
  animation: fadeIn 500ms var(--ease-out) 1100ms forwards;
}

.settlement__other-place {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: var(--text-light);
}

/* ==================== Confetti ==================== */

.settlement__confetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-max);
}

.settlement__confetti-piece {
  position: absolute;
  width: 10px;
  height: 20px;
  top: -20px;
  animation: settleConfetti 3s linear forwards;
}

/* Confetti colors */
.settlement__confetti-piece--gold {
  background: #FFD700;
}

.settlement__confetti-piece--silver {
  background: #C0C0C0;
}

.settlement__confetti-piece--coral {
  background: var(--accent-coral);
}

.settlement__confetti-piece--blue {
  background: var(--card-blue);
}

/* ==================== Actions ==================== */

.settlement__actions {
  display: flex;
  gap: var(--spacing-4);
  margin-top: var(--spacing-8);
}

.settlement__skip-btn {
  padding: var(--spacing-2) var(--spacing-6);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  color: var(--text-light);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.settlement__skip-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: var(--neutral-white);
}

.settlement__continue-btn {
  padding: var(--spacing-3) var(--spacing-8);
  background: var(--primary-ocean);
  border: none;
  border-radius: var(--radius-md);
  color: var(--neutral-white);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  opacity: 0;
  transform: translateY(20px);
}

.settlement__continue-btn--visible {
  animation: fadeIn 400ms var(--ease-out) forwards,
             slideInFromBottom 400ms var(--ease-out) forwards;
}

.settlement__continue-btn:hover {
  background: var(--primary-ocean-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 95, 141, 0.4);
}
```

---

## Component Structure

### React Component Hierarchy

```
RoundSettlementModal/
├── RoundSettlementModal.jsx        # Main container, orchestrates phases
├── RoundSettlementModal.css        # All styles from above
├── components/
│   ├── SettlementHeader.jsx        # Title, subtitle, declarer badge
│   ├── PlayerSpotlight.jsx         # Active player display
│   │   ├── PlayerInfo.jsx          # Avatar, name, tag
│   │   ├── HandCardsReveal.jsx     # Animated card flip sequence
│   │   └── PlayedPairsReveal.jsx   # Animated pairs display
│   ├── ScoreBreakdown.jsx          # Score calculation panel
│   │   ├── ScoreItem.jsx           # Individual score line item
│   │   ├── ScoreDetail.jsx         # Sub-item for collections
│   │   └── ScoreTotal.jsx          # Total with burst effect
│   ├── WaitingPlayers.jsx          # Other players status
│   ├── FinalRanking.jsx            # End ranking display
│   │   ├── Podium.jsx              # 1st/2nd/3rd places
│   │   └── OtherPlaces.jsx         # 4th+ places
│   ├── ParticleSystem.jsx          # Score particles
│   └── ConfettiSystem.jsx          # Victory confetti
└── hooks/
    ├── useSettlementPhase.js       # Phase state machine
    ├── useScoreAnimation.js        # Score counting logic
    └── useParticles.js             # Particle spawning logic
```

### State Management

```javascript
// Settlement phase states
const SETTLEMENT_PHASES = {
  INTRO: 'intro',
  PLAYER_REVEAL: 'player_reveal',
  SCORE_CALCULATE: 'score_calculate',
  RANKING: 'ranking',
  COMPLETE: 'complete'
};

// Phase state machine
const settlementState = {
  phase: SETTLEMENT_PHASES.INTRO,
  currentPlayerIndex: 0,
  revealedCards: [],
  revealedScoreItems: [],
  calculatedScores: {},
  rankings: [],
  isSkipped: false
};
```

### Props Interface

```typescript
interface RoundSettlementModalProps {
  isOpen: boolean;
  players: {
    [playerId: string]: {
      name: string;
      hand: Card[];
      playedPairs: Pair[];
      totalScore: number;
    }
  };
  declarerId: string;
  declareType: 'stop' | 'lastChance';
  declarerWon: boolean;
  scores: {
    [playerId: string]: {
      base: number;
      baseDetails: {
        cardValues: number;
        collectionDetails: Array<{
          name: string;
          emoji: string;
          count: number;
          score: number;
          rule: string;
        }>;
      };
      pairs: number;
      multipliers: number;
      multiplierDetails: {
        octopus: number;
        lighthouse: number;
        fishSchool: number;
        penguinColony: number;
        captain: number;
      };
      mermaids: number;
      colorBonus: number;
      total: number;
    }
  };
  onComplete: () => void;
  onSkip?: () => void;
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */

/* Base styles for mobile < 768px */
.settlement {
  padding: var(--spacing-4) var(--spacing-2);
}

.settlement__content {
  flex-direction: column;
  gap: var(--spacing-4);
}

.settlement__player-spotlight {
  padding: var(--spacing-4);
}

.settlement__hand-cards {
  min-height: 120px;
}

.settlement__score-panel {
  width: 100%;
}

.settlement__podium {
  transform: scale(0.8);
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .settlement {
    padding: var(--spacing-6) var(--spacing-4);
  }

  .settlement__content {
    flex-direction: row;
  }

  .settlement__score-panel {
    width: 300px;
  }

  .settlement__podium {
    transform: scale(0.9);
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .settlement {
    padding: var(--spacing-8) var(--spacing-6);
  }

  .settlement__score-panel {
    width: 350px;
  }

  .settlement__podium {
    transform: scale(1);
  }
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
  .settlement__content {
    max-width: 1400px;
  }

  .settlement__player-spotlight {
    padding: var(--spacing-8);
  }
}
```

### Mobile-Specific Adaptations

```css
@media (max-width: 767px) {
  /* Smaller title */
  .settlement__title {
    font-size: var(--font-size-2xl);
  }

  /* Horizontal scrolling for cards */
  .settlement__hand-cards {
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: var(--spacing-2);
    -webkit-overflow-scrolling: touch;
  }

  /* Smaller cards on mobile */
  .settlement__card {
    flex-shrink: 0;
  }

  /* Stacked score items */
  .settlement__score-item {
    flex-wrap: wrap;
  }

  /* Smaller podium */
  .settlement__podium-block {
    width: 90px;
  }

  .settlement__podium-block--1st {
    height: 140px;
  }

  .settlement__podium-block--2nd {
    height: 110px;
  }

  .settlement__podium-block--3rd {
    height: 80px;
  }

  /* Simplified confetti */
  .settlement__confetti-piece {
    width: 6px;
    height: 12px;
  }
}
```

---

## Accessibility

### ARIA Labels and Roles

```jsx
// Settlement modal
<div
  className="settlement"
  role="dialog"
  aria-modal="true"
  aria-labelledby="settlement-title"
  aria-describedby="settlement-desc"
>
  <h1 id="settlement-title">Round Complete</h1>
  <p id="settlement-desc">
    {declarerName} declared {declareType}. Revealing scores...
  </p>

  {/* Live region for score updates */}
  <div
    role="status"
    aria-live="polite"
    aria-atomic="false"
    className="sr-only"
  >
    {currentAnnouncement}
  </div>
</div>
```

### Screen Reader Announcements

```javascript
// Announce phase changes
const announcements = {
  intro: `Round complete. ${declarerName} declared ${declareType}.`,
  playerReveal: `Revealing ${playerName}'s cards.`,
  scoreItem: (label, value) => `${label}: plus ${value} points.`,
  total: (playerName, total) => `${playerName} total score: ${total} points.`,
  ranking: `Final rankings. First place: ${winner.name} with ${winner.score} points.`
};
```

### Keyboard Navigation

```css
/* Focus states */
.settlement__skip-btn:focus-visible,
.settlement__continue-btn:focus-visible {
  outline: 3px solid var(--primary-ocean-light);
  outline-offset: 2px;
}

/* Skip animation with keyboard */
.settlement[data-can-skip="true"]:focus {
  /* Visual indicator that Space/Enter will skip */
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .settlement,
  .settlement__card,
  .settlement__score-item,
  .settlement__score-total,
  .settlement__podium-place,
  .settlement__particle,
  .settlement__confetti-piece {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }

  /* Show elements immediately without animation */
  .settlement__card--revealed,
  .settlement__score-item--revealed,
  .settlement__score-total--revealed,
  .settlement__podium-place--revealed {
    opacity: 1;
    transform: none;
  }

  /* Disable particles and confetti */
  .settlement__particles,
  .settlement__confetti {
    display: none;
  }
}
```

---

## Performance Considerations

### Animation Optimization

```css
/* GPU-accelerated properties only */
.settlement__card,
.settlement__particle,
.settlement__confetti-piece {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU layer */
}

/* Contain layout recalculations */
.settlement__player-spotlight,
.settlement__score-panel {
  contain: layout style;
}

/* Reduce paint area for particles */
.settlement__particles {
  contain: strict;
  isolation: isolate;
}
```

### Resource Management

```javascript
// Limit particle count based on device
const getMaxParticles = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 0;
  }
  if (window.innerWidth < 768) {
    return 20; // Mobile
  }
  if (window.innerWidth < 1024) {
    return 40; // Tablet
  }
  return 60; // Desktop
};

// Limit confetti count
const getMaxConfetti = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 0;
  }
  return window.innerWidth < 768 ? 30 : 50;
};
```

### Lazy Loading

```javascript
// Only load ranking component when needed
const FinalRanking = lazy(() => import('./components/FinalRanking'));

// Preload during score calculation phase
useEffect(() => {
  if (phase === SETTLEMENT_PHASES.SCORE_CALCULATE) {
    import('./components/FinalRanking');
  }
}, [phase]);
```

### Memory Cleanup

```javascript
// Clean up particles after animation
useEffect(() => {
  const particles = particlesRef.current;

  return () => {
    // Remove all particle elements
    while (particles.firstChild) {
      particles.removeChild(particles.firstChild);
    }
  };
}, []);

// Cancel animations on unmount
useEffect(() => {
  const animations = [];

  return () => {
    animations.forEach(anim => anim.cancel());
  };
}, []);
```

---

## Firebase Synchronization

### Sync Strategy

```javascript
// All clients listen to the same phase state
const settlementRef = ref(database, `rooms/${roomId}/settlement`);

// Host controls phase progression
if (isHost) {
  await set(settlementRef, {
    phase: SETTLEMENT_PHASES.INTRO,
    currentPlayerIndex: 0,
    timestamp: serverTimestamp()
  });
}

// All clients animate based on timestamp
onValue(settlementRef, (snapshot) => {
  const data = snapshot.val();
  const elapsed = Date.now() - data.timestamp;

  // Catch up to current state if joined late
  if (elapsed > PHASE_DURATIONS[data.phase]) {
    skipToCurrentState(data);
  } else {
    startPhaseAnimation(data.phase, elapsed);
  }
});
```

### Phase Progression

```javascript
// Host advances phases based on timers
const advancePhase = async () => {
  const nextPhase = getNextPhase(currentPhase, currentPlayerIndex, totalPlayers);

  await update(settlementRef, {
    phase: nextPhase.phase,
    currentPlayerIndex: nextPhase.playerIndex,
    timestamp: serverTimestamp()
  });
};

// Auto-advance timer (host only)
useEffect(() => {
  if (!isHost) return;

  const timer = setTimeout(() => {
    advancePhase();
  }, PHASE_DURATIONS[currentPhase]);

  return () => clearTimeout(timer);
}, [currentPhase, isHost]);
```

---

## Implementation Checklist

### Phase 1: Core Structure
- [ ] Create RoundSettlementModal component
- [ ] Implement phase state machine
- [ ] Add overlay and header animations
- [ ] Set up Firebase sync listeners

### Phase 2: Player Reveal
- [ ] Build PlayerSpotlight component
- [ ] Implement card flip animation sequence
- [ ] Add played pairs reveal animation
- [ ] Create stagger delay system

### Phase 3: Score Calculation
- [ ] Build ScoreBreakdown component
- [ ] Implement score item reveal sequence
- [ ] Add score counting animation
- [ ] Create total reveal with burst effect
- [ ] Add particle effects for score accumulation

### Phase 4: Final Ranking
- [ ] Build FinalRanking component
- [ ] Implement podium rise animation
- [ ] Add winner crown and shimmer
- [ ] Create confetti system
- [ ] Add other places display

### Phase 5: Polish
- [ ] Add responsive styles
- [ ] Implement accessibility features
- [ ] Add reduced motion support
- [ ] Performance optimization
- [ ] Testing across devices

---

## Usage Example

```jsx
import RoundSettlementModal from './components/game/RoundSettlementModal';

function GameBoard() {
  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementData, setSettlementData] = useState(null);

  // Triggered when round ends
  const handleRoundEnd = (data) => {
    setSettlementData(data);
    setShowSettlement(true);
  };

  const handleSettlementComplete = () => {
    setShowSettlement(false);
    // Proceed to next round or game over
  };

  return (
    <>
      <GameBoardContent />

      {showSettlement && (
        <RoundSettlementModal
          isOpen={showSettlement}
          players={settlementData.players}
          declarerId={settlementData.declarerId}
          declareType={settlementData.declareType}
          declarerWon={settlementData.declarerWon}
          scores={settlementData.scores}
          onComplete={handleSettlementComplete}
          onSkip={() => {
            // Skip to final ranking
          }}
        />
      )}
    </>
  );
}
```

---

**Last Updated**: 2025-12-12
**Version**: 1.0.0
**Author**: Frontend UI/UX Designer
