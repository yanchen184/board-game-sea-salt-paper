# Component CSS Specifications

This document provides complete CSS implementations for all major components using BEM methodology and design system variables.

## Table of Contents
- [Button Component](#button-component)
- [Card Component](#card-component)
- [Modal Component](#modal-component)
- [Home Page](#home-page)
- [Room Lobby](#room-lobby)
- [Game Board](#game-board)

---

## Button Component

### File: `src/components/common/Button/Button.css`

```css
/**
 * Button Component
 * Supports multiple variants: primary, secondary, danger, ghost
 * Includes all interactive states and accessibility features
 */

.button {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);

  /* Typography */
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  text-decoration: none;
  white-space: nowrap;

  /* Sizing */
  padding: var(--spacing-3) var(--spacing-6);
  min-height: 44px; /* Minimum touch target size */

  /* Borders */
  border: none;
  border-radius: var(--radius-md);

  /* Effects */
  cursor: pointer;
  user-select: none;
  transition: var(--transition-all);

  /* Position for pseudo-elements */
  position: relative;
  overflow: hidden;
}

/* Primary Button (default) */
.button--primary {
  background-color: var(--primary-ocean);
  color: var(--text-inverse);
  box-shadow: var(--shadow-button);
}

.button--primary:hover:not(:disabled) {
  background-color: var(--primary-ocean-dark);
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-2px);
}

.button--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Secondary Button */
.button--secondary {
  background-color: var(--bg-primary);
  color: var(--primary-ocean);
  border: var(--border-medium) solid var(--primary-ocean);
  box-shadow: var(--shadow-sm);
}

.button--secondary:hover:not(:disabled) {
  background-color: var(--primary-ocean-pale);
  border-color: var(--primary-ocean-dark);
  transform: translateY(-2px);
}

/* Danger Button */
.button--danger {
  background-color: var(--accent-coral);
  color: var(--text-inverse);
  box-shadow: var(--shadow-button);
}

.button--danger:hover:not(:disabled) {
  background-color: var(--accent-coral-dark);
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-2px);
}

/* Success Button */
.button--success {
  background-color: var(--status-success);
  color: var(--text-inverse);
  box-shadow: var(--shadow-button);
}

.button--success:hover:not(:disabled) {
  background-color: #229954;
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-2px);
}

/* Ghost Button (transparent) */
.button--ghost {
  background-color: transparent;
  color: var(--primary-ocean);
  box-shadow: none;
}

.button--ghost:hover:not(:disabled) {
  background-color: var(--primary-ocean-pale);
}

/* Size Variants */
.button--sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  min-height: 36px;
}

.button--lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-lg);
  min-height: 52px;
}

/* Full Width */
.button--full {
  width: 100%;
}

/* Disabled State */
.button:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
  transform: none;
}

/* Loading State */
.button--loading {
  pointer-events: none;
  position: relative;
}

.button--loading .button__text {
  opacity: 0;
}

.button--loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Icon */
.button__icon {
  display: inline-flex;
  font-size: 1.2em;
}

/* Focus State */
.button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Mobile Touch Optimization */
@media (max-width: 768px) {
  .button {
    min-height: 48px;
    padding: var(--spacing-3) var(--spacing-5);
  }
}

/* Accessibility - High Contrast Mode */
@media (prefers-contrast: high) {
  .button {
    border: var(--border-medium) solid currentColor;
  }
}
```

---

## Card Component

### File: `src/components/common/Card/Card.css`

```css
/**
 * Card Component
 * Playing card with color-coded borders and value display
 * Supports drag-and-drop, selection, and hover states
 */

.card {
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  /* Sizing */
  width: var(--card-width);
  height: var(--card-height);
  padding: var(--spacing-2);

  /* Visual */
  background: var(--bg-primary);
  border-radius: var(--radius-card);
  border: var(--border-medium) solid var(--border-light);
  box-shadow: var(--shadow-card);

  /* Interaction */
  cursor: pointer;
  user-select: none;

  /* Performance */
  will-change: transform, box-shadow;
  transition: transform var(--duration-medium) var(--ease-out),
              box-shadow var(--duration-medium) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);

  /* Position for absolutely positioned elements */
  position: relative;
}

/* Card Content Areas */
.card__icon {
  width: 100%;
  height: 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-3xl);
}

.card__name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-align: center;
  margin: var(--spacing-1) 0;
}

.card__value {
  position: absolute;
  bottom: var(--spacing-2);
  right: var(--spacing-2);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

/* Color Variants (based on card color) */
.card--blue {
  border-color: var(--card-blue);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--card-blue-light) 100%);
}

.card--red {
  border-color: var(--card-red);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--card-red-light) 100%);
}

.card--yellow {
  border-color: var(--card-yellow);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--card-yellow-light) 100%);
}

.card--purple {
  border-color: var(--card-purple);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--card-purple-light) 100%);
}

/* Interactive States */
.card:hover:not(.card--disabled) {
  transform: translateY(-8px);
  box-shadow: var(--shadow-card-hover);
  z-index: var(--z-card-hover);
}

.card--selected {
  transform: translateY(-12px);
  border-width: 3px;
  box-shadow: 0 0 0 3px rgba(44, 95, 141, 0.3),
              var(--shadow-lg);
  z-index: var(--z-card-hover);
}

.card--disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.card--dragging {
  opacity: 0.6;
  cursor: grabbing;
  transform: rotate(5deg) scale(1.05);
  z-index: var(--z-max);
}

/* Card Back (face-down) */
.card--back {
  background: var(--secondary-sand);
  border-color: var(--secondary-sand-dark);
}

.card--back::before {
  content: '';
  position: absolute;
  inset: var(--spacing-2);
  border: var(--border-medium) solid var(--secondary-sand-dark);
  border-radius: calc(var(--radius-card) - 4px);
  background: repeating-linear-gradient(
    45deg,
    var(--secondary-sand-dark),
    var(--secondary-sand-dark) 10px,
    var(--secondary-sand) 10px,
    var(--secondary-sand) 20px
  );
}

/* Animation Classes */
.card--drawing {
  animation: cardDraw 500ms var(--ease-out);
}

.card--flipping {
  animation: cardFlip 600ms var(--ease-in-out);
}

/* Mobile Sizing */
@media (max-width: 768px) {
  .card {
    width: var(--card-width-mobile);
    height: var(--card-height-mobile);
    padding: var(--spacing-1);
  }

  .card__icon {
    font-size: var(--font-size-2xl);
  }

  .card__name {
    font-size: 0.625rem; /* 10px */
  }

  .card__value {
    font-size: var(--font-size-lg);
    bottom: var(--spacing-1);
    right: var(--spacing-1);
  }
}

/* Accessibility */
.card:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Performance Optimization */
@media (prefers-reduced-motion: no-preference) {
  .card {
    will-change: transform, box-shadow;
  }
}
```

---

## Modal Component

### File: `src/components/common/Modal/Modal.css`

```css
/**
 * Modal Component
 * Centered dialog with backdrop overlay
 * Accessible, keyboard-navigable, and responsive
 */

.modal {
  /* Full-screen overlay */
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);

  /* Flexbox centering */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);

  /* Prevent body scroll */
  overflow-y: auto;
}

.modal__backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  animation: fadeIn 200ms var(--ease-out);
  z-index: -1;
}

.modal__content {
  /* Layout */
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;

  /* Visual */
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);

  /* Animation */
  animation: modalZoomIn 300ms var(--ease-out);
}

.modal__header {
  padding: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--border-light);
}

.modal__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.modal__close {
  position: absolute;
  top: var(--spacing-4);
  right: var(--spacing-4);
  width: 32px;
  height: 32px;
  padding: 0;

  background: transparent;
  border: none;
  border-radius: var(--radius-md);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--font-size-xl);

  transition: var(--transition-colors);
}

.modal__close:hover {
  background-color: var(--neutral-gray-200);
  color: var(--text-primary);
}

.modal__close:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

.modal__body {
  padding: var(--spacing-6);
}

.modal__footer {
  padding: var(--spacing-4) var(--spacing-6) var(--spacing-6);
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
  align-items: center;
}

/* Size Variants */
.modal--sm .modal__content {
  max-width: 400px;
}

.modal--lg .modal__content {
  max-width: 700px;
}

.modal--xl .modal__content {
  max-width: 900px;
}

.modal--full .modal__content {
  max-width: none;
  max-height: none;
  height: 100vh;
  border-radius: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .modal {
    padding: 0;
  }

  .modal__content {
    max-height: 100vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    align-self: flex-end;
  }

  .modal__header,
  .modal__body {
    padding: var(--spacing-4);
  }

  .modal__footer {
    padding: var(--spacing-3) var(--spacing-4) var(--spacing-4);
    flex-direction: column-reverse;
  }

  .modal__footer .button {
    width: 100%;
  }
}

/* Scrollable Content */
.modal__body--scrollable {
  max-height: 60vh;
  overflow-y: auto;
}

/* Custom Scrollbar */
.modal__body--scrollable::-webkit-scrollbar {
  width: 8px;
}

.modal__body--scrollable::-webkit-scrollbar-track {
  background: var(--neutral-gray-100);
  border-radius: var(--radius-full);
}

.modal__body--scrollable::-webkit-scrollbar-thumb {
  background: var(--neutral-gray-400);
  border-radius: var(--radius-full);
}

.modal__body--scrollable::-webkit-scrollbar-thumb:hover {
  background: var(--neutral-gray-500);
}
```

---

## Home Page

### File: `src/components/pages/HomePage/HomePage.css`

```css
/**
 * Home Page Component
 * Landing page with title, action buttons, and decorative elements
 */

.home-page {
  /* Full viewport */
  min-height: 100vh;
  width: 100%;

  /* Flexbox centering */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);

  /* Background */
  background: var(--bg-game-board);

  /* Prevent content shift */
  position: relative;
  overflow: hidden;
}

/* Decorative Wave Background */
.home-page__waves {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.1;
}

.home-page__wave {
  position: absolute;
  width: 200%;
  height: 200px;
  background: radial-gradient(ellipse at center, var(--primary-ocean) 0%, transparent 70%);
}

.home-page__wave--1 {
  top: 20%;
  left: -50%;
  animation: wave 8s var(--ease-in-out) infinite;
}

.home-page__wave--2 {
  bottom: 30%;
  right: -50%;
  animation: wave 10s var(--ease-in-out) infinite reverse;
}

/* Main Content Container */
.home-page__container {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 600px;
}

/* Title */
.home-page__title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-ocean);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: var(--spacing-4);
  line-height: var(--line-height-tight);
}

.home-page__subtitle {
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-8);
  font-weight: var(--font-weight-regular);
}

/* Action Buttons */
.home-page__actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
  margin-bottom: var(--spacing-8);
}

.home-page__actions .button {
  min-width: 160px;
}

/* Secondary Links */
.home-page__links {
  display: flex;
  gap: var(--spacing-6);
  justify-content: center;
  margin-top: var(--spacing-6);
}

.home-page__link {
  color: var(--primary-ocean);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: var(--transition-colors);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
}

.home-page__link:hover {
  background-color: var(--primary-ocean-pale);
  color: var(--primary-ocean-dark);
}

.home-page__link:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .home-page {
    padding: var(--spacing-4);
  }

  .home-page__title {
    font-size: var(--font-size-3xl);
  }

  .home-page__subtitle {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-6);
  }

  .home-page__actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .home-page__actions .button {
    width: 100%;
  }

  .home-page__links {
    flex-direction: column;
    gap: var(--spacing-2);
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1023px) {
  .home-page__title {
    font-size: var(--font-size-4xl);
  }
}
```

---

## Room Lobby

### File: `src/components/pages/RoomLobby/RoomLobby.css`

```css
/**
 * Room Lobby Component
 * Waiting room for players before game starts
 */

.room-lobby {
  min-height: 100vh;
  background: var(--bg-game-board);
  padding: var(--spacing-6);
}

/* Header with Room Code */
.room-lobby__header {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  box-shadow: var(--shadow-md);

  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.room-lobby__code-container {
  flex: 1;
}

.room-lobby__code-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-1);
}

.room-lobby__code {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-ocean);
  font-family: var(--font-mono);
  letter-spacing: var(--letter-spacing-wider);
}

.room-lobby__code-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Main Content Grid */
.room-lobby__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

/* Players Panel */
.room-lobby__panel {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
}

.room-lobby__panel-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--border-light);
}

.room-lobby__players {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.room-lobby__player {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  transition: var(--transition-all);
}

.room-lobby__player--ready {
  background: var(--status-success-light);
  border: 2px solid var(--status-success);
}

.room-lobby__player--host {
  border: 2px solid var(--primary-ocean);
}

.room-lobby__player-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--neutral-gray-400);
}

.room-lobby__player--ready .room-lobby__player-status {
  background: var(--status-success);
  box-shadow: 0 0 8px var(--status-success);
  animation: pulse 2s infinite;
}

.room-lobby__player-name {
  flex: 1;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.room-lobby__player-badge {
  font-size: var(--font-size-xs);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  background: var(--primary-ocean);
  color: var(--text-inverse);
  font-weight: var(--font-weight-semibold);
}

/* Settings Panel */
.room-lobby__settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.room-lobby__setting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
}

.room-lobby__setting-label {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.room-lobby__setting-value {
  color: var(--text-secondary);
}

/* Footer Actions */
.room-lobby__footer {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
}

.room-lobby__footer .button {
  min-width: 200px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .room-lobby {
    padding: var(--spacing-4);
  }

  .room-lobby__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .room-lobby__code {
    font-size: var(--font-size-2xl);
  }

  .room-lobby__content {
    grid-template-columns: 1fr;
  }

  .room-lobby__footer {
    flex-direction: column;
  }

  .room-lobby__footer .button {
    width: 100%;
  }
}
```

---

## Game Board

### File: `src/components/pages/GameBoard/GameBoard.css`

```css
/**
 * Game Board Component
 * Main gameplay screen with all game elements
 */

.game-board {
  min-height: 100vh;
  background: var(--bg-game-board);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Top Opponent Area */
.game-board__opponents {
  display: flex;
  justify-content: space-evenly;
  padding: var(--spacing-4);
  gap: var(--spacing-4);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.opponent-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  min-width: 150px;
  box-shadow: var(--shadow-md);
  transition: var(--transition-all);
}

.opponent-card--active {
  border: 3px solid var(--primary-ocean);
  box-shadow: 0 0 0 3px rgba(44, 95, 141, 0.2), var(--shadow-lg);
}

.opponent-card__name {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-2);
}

.opponent-card__stats {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Opponent Played Pairs */
.opponent-card__pairs {
  margin-top: var(--spacing-3);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--border-light);
}

.opponent-card__pairs-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-2);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.opponent-card__pairs-container {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.opponent-card__pair {
  display: inline-flex;
  gap: 2px;
  background: rgba(44, 95, 141, 0.1);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

/* Center Play Area */
.game-board__center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
  position: relative;
}

.play-area {
  display: flex;
  gap: var(--spacing-8);
  align-items: center;
}

.play-area__deck,
.play-area__discard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
}

.play-area__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.play-area__deck-stack {
  width: var(--card-width);
  height: var(--card-height);
  position: relative;
  cursor: pointer;
}

/* Stack effect for deck */
.play-area__deck-stack::before,
.play-area__deck-stack::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: var(--secondary-sand);
  border: var(--border-medium) solid var(--secondary-sand-dark);
  border-radius: var(--radius-card);
}

.play-area__deck-stack::before {
  top: -4px;
  left: -2px;
  z-index: -2;
}

.play-area__deck-stack::after {
  top: -2px;
  left: -1px;
  z-index: -1;
}

.play-area__deck-count {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-semibold);
}

/* Turn Indicator */
.game-board__turn-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-overlay);

  background: var(--bg-primary);
  padding: var(--spacing-4) var(--spacing-8);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);

  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-ocean);
  text-align: center;

  animation: fadeIn 300ms var(--ease-out);
}

.game-board__turn-indicator--active {
  animation: turnPulse 2s infinite;
}

/* Bottom Info Panels */
.game-board__info-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: rgba(255, 255, 255, 0.95);
  border-top: 2px solid var(--border-light);
}

.info-panel {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-md);
  max-height: 200px;
  overflow-y: auto;
  transition: var(--transition-all);
}

.info-panel:hover {
  box-shadow: var(--shadow-lg);
}

.info-panel__title {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-3);
  font-size: var(--font-size-lg);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  border-bottom: 2px solid var(--primary-ocean);
  padding-bottom: var(--spacing-2);
}

.score-panel__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) 0;
  border-bottom: 1px solid var(--border-light);
  transition: var(--transition-all);
}

.score-panel__item:last-child {
  border-bottom: none;
}

.score-panel__item:hover {
  background: rgba(44, 95, 141, 0.05);
  padding-left: var(--spacing-2);
  border-radius: var(--radius-sm);
}

.score-panel__item--current {
  background: rgba(44, 95, 141, 0.1);
  padding-left: var(--spacing-2);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary-ocean);
}

.score-panel__name {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.score-panel__name::before {
  content: '•';
  color: var(--primary-ocean);
  font-weight: bold;
}

.score-panel__value {
  font-weight: var(--font-weight-bold);
  color: var(--primary-ocean);
  font-size: var(--font-size-lg);
}

/* Action Log */
.action-log__item {
  font-size: var(--font-size-sm);
  padding: var(--spacing-2) var(--spacing-3);
  color: var(--text-secondary);
  border-left: 3px solid var(--border-light);
  margin-bottom: var(--spacing-2);
  transition: var(--transition-all);
  position: relative;
}

.action-log__item::before {
  content: '>';
  position: absolute;
  left: var(--spacing-2);
  color: var(--text-tertiary);
}

.action-log__item:hover {
  background: rgba(44, 95, 141, 0.05);
  border-radius: var(--radius-sm);
}

.action-log__item--recent {
  border-left-color: var(--primary-ocean);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  animation: slideInRight 300ms var(--ease-out);
}

.action-log__item--recent::before {
  color: var(--primary-ocean);
}

/* Action log animations */
@keyframes slideInRight {
  from {
    transform: translateX(-10px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Player Hand Area */
.game-board__hand {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: var(--spacing-6) var(--spacing-4);
  border-top: 2px solid var(--border-light);
}

.player-hand {
  display: flex;
  justify-content: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto var(--spacing-4);
}

.player-hand__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  margin-bottom: var(--spacing-2);
  text-align: center;
}

/* Player Played Pairs Area */
.game-board__played-pairs {
  background: rgba(245, 230, 211, 0.6);
  border-top: 1px solid var(--border-light);
  padding: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.played-pairs {
  max-width: 1200px;
  margin: 0 auto;
}

.played-pairs__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  margin-bottom: var(--spacing-3);
}

.played-pairs__container {
  display: flex;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  justify-content: flex-start;
}

.played-pair {
  display: flex;
  gap: var(--spacing-1);
  padding: var(--spacing-2);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-all);
  position: relative;
}

.played-pair:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Mini cards for played pairs */
.played-pair__card {
  width: 50px;
  height: 70px;
  border-radius: var(--radius-sm);
  border: var(--border-thin) solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  background: var(--bg-primary);
  box-shadow: var(--shadow-xs);
}

/* Color variants for mini cards */
.played-pair__card--blue {
  background: linear-gradient(135deg, #3498DB 0%, #2980B9 100%);
}

.played-pair__card--red {
  background: linear-gradient(135deg, #E74C3C 0%, #C0392B 100%);
}

.played-pair__card--yellow {
  background: linear-gradient(135deg, #F1C40F 0%, #F39C12 100%);
}

.played-pair__card--purple {
  background: linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%);
}

/* Pair effect indicator */
.played-pair__effect {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--primary-ocean);
  color: var(--text-white);
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  box-shadow: var(--shadow-sm);
}

/* Empty state */
.played-pairs__empty {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  font-style: italic;
  text-align: center;
  padding: var(--spacing-6) 0;
}

/* Action Buttons */
.game-board__actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--border-light);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .game-board__opponents {
    padding: var(--spacing-2);
    gap: var(--spacing-2);
  }

  .opponent-card {
    min-width: auto;
    padding: var(--spacing-2);
    font-size: var(--font-size-sm);
  }

  /* Compact opponent pairs on mobile */
  .opponent-card__pairs-container {
    font-size: var(--font-size-xs);
    gap: var(--spacing-1);
  }

  .opponent-card__pair {
    padding: 2px 4px;
  }

  /* Stack bottom panels vertically on mobile */
  .game-board__info-panels {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
    padding: var(--spacing-2);
  }

  .info-panel {
    max-height: 150px;
  }

  /* Collapsible panels on mobile */
  .info-panel__title {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-panel__title::after {
    content: '▼';
    font-size: var(--font-size-xs);
    transition: transform 200ms var(--ease-out);
  }

  .info-panel--collapsed .info-panel__title::after {
    transform: rotate(-90deg);
  }

  .info-panel--collapsed .info-panel__content {
    display: none;
  }

  .play-area {
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .player-hand {
    gap: calc(var(--spacing-1) * -1); /* Overlap cards on mobile */
  }

  /* Mobile played pairs - collapsible */
  .game-board__played-pairs {
    padding: var(--spacing-3);
  }

  .played-pairs__container {
    gap: var(--spacing-2);
  }

  .played-pair {
    padding: var(--spacing-1);
    gap: 2px;
  }

  .played-pair__card {
    width: 40px;
    height: 56px;
    font-size: var(--font-size-lg);
  }

  .played-pair__effect {
    top: -6px;
    right: -6px;
    font-size: 8px;
    padding: 1px 4px;
  }

  .game-board__actions {
    flex-wrap: wrap;
  }

  .game-board__actions .button {
    flex: 1;
    min-width: 120px;
  }
}

/* Tablet adjustments */
@media (min-width: 768px) and (max-width: 1023px) {
  .played-pair__card {
    width: 45px;
    height: 63px;
  }

  .opponent-card__pairs-container {
    font-size: var(--font-size-sm);
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1023px) {
  .game-board__sidebar {
    right: var(--spacing-2);
    max-width: 200px;
  }

  .side-panel {
    padding: var(--spacing-3);
  }
}
```

---

## Additional Component Notes

### Input Component
File: `src/components/common/Input/Input.css`

```css
.input {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.input__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.input__field {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  font-family: var(--font-primary);

  border: var(--border-medium) solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);

  transition: var(--transition-all);
}

.input__field:hover:not(:disabled) {
  border-color: var(--border-medium);
}

.input__field:focus {
  outline: none;
  border-color: var(--primary-ocean);
  box-shadow: 0 0 0 3px rgba(44, 95, 141, 0.1);
}

.input__field:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
  background: var(--neutral-gray-100);
}

.input__error {
  font-size: var(--font-size-sm);
  color: var(--status-error);
}

.input--error .input__field {
  border-color: var(--status-error);
}
```

---

## Usage Examples

### Button Component Usage

```jsx
import './Button.css';

// Primary button
<button className="button button--primary">
  Create Room
</button>

// Secondary with icon
<button className="button button--secondary">
  <span className="button__icon">🔗</span>
  <span className="button__text">Copy Link</span>
</button>

// Loading state
<button className="button button--primary button--loading" disabled>
  <span className="button__text">Joining...</span>
</button>
```

### Card Component Usage

```jsx
import './Card.css';

<div
  className={`card card--${color} ${selected ? 'card--selected' : ''}`}
  onClick={handleClick}
  tabIndex={0}
  role="button"
  aria-label={`${name} card, value ${value}`}
>
  <div className="card__icon">{icon}</div>
  <div className="card__name">{name}</div>
  <div className="card__value">{value}</div>
</div>
```

---

This provides complete, production-ready CSS for all major components with proper BEM naming, accessibility features, and responsive design.