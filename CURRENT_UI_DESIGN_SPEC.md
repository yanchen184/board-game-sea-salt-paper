# Sea Salt & Paper - Current UI Design Specification

## Overview
This document outlines the complete UI design system for the Sea Salt & Paper board game. The design follows a modern, clean aesthetic inspired by Board Game Arena (BGA) with an ocean theme.

## 1. Color Palette

### Primary Colors - Ocean Theme
- **Primary Ocean**: `#2C5F8D` - Main brand color (buttons, accents)
- **Primary Ocean Dark**: `#1E4165` - Hover states, emphasis
- **Primary Ocean Light**: `#4A7BA7` - Light accents
- **Primary Ocean Pale**: `#E8F2F9` - Backgrounds

### Secondary Colors - Sand Theme
- **Secondary Sand**: `#F5E6D3` - Secondary backgrounds
- **Secondary Sand Dark**: `#E8D4B8` - Darker sand tones
- **Secondary Sand Light**: `#FAF4ED` - Light backgrounds

### Game Card Colors
- **Card Blue**: `#3498DB` - Water creatures (Fish)
- **Card Red**: `#E74C3C` - Fire/warm creatures (Crab)
- **Card Yellow**: `#F1C40F` - Sun/beach creatures (Swimmer)
- **Card Purple**: `#9B59B6` - Mystical creatures (Shell, Octopus)
- **Card Orange**: Not defined - Used for Starfish
- **Card Green**: Not defined - Used for Sailboat
- **Card Gray**: Not defined - Used for Shark

### Status Colors
- **Success**: `#27AE60` / Light: `#D5F4E6`
- **Warning**: `#F39C12` / Light: `#FCF3CF`
- **Error**: `#E74C3C` / Light: `#FADBD8`
- **Info**: `#3498DB` / Light: `#EBF5FB`

### Neutral Colors (Grayscale)
- **White**: `#FFFFFF`
- **Gray 100**: `#F8F9FA` - Lightest
- **Gray 200**: `#E9ECEF`
- **Gray 300**: `#DEE2E6`
- **Gray 400**: `#CED4DA`
- **Gray 500**: `#ADB5BD`
- **Gray 600**: `#6C757D`
- **Gray 700**: `#495057`
- **Gray 800**: `#343A40`
- **Gray 900**: `#212529` - Darkest

### Text Colors
- **Primary**: `#212529` (Gray 900) - Main text
- **Secondary**: `#6C757D` (Gray 600) - Supporting text
- **Light**: `#ADB5BD` (Gray 500) - Disabled/faded text
- **Inverse**: `#FFFFFF` - White text on dark backgrounds

## 2. Typography

### Font Families
- **Primary**: `'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Secondary**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Monospace**: `'Fira Code', 'Courier New', monospace`

### Font Sizes
- **XS**: `0.75rem` (12px)
- **SM**: `0.875rem` (14px)
- **Base**: `1rem` (16px)
- **LG**: `1.125rem` (18px)
- **XL**: `1.25rem` (20px)
- **2XL**: `1.5rem` (24px)
- **3XL**: `1.875rem` (30px)
- **4XL**: `2.25rem` (36px)
- **5XL**: `3rem` (48px)

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Line Heights
- **Tight**: 1.2
- **Snug**: 1.375
- **Normal**: 1.5
- **Relaxed**: 1.625
- **Loose**: 2

## 3. Spacing System (8px Grid)

- **0**: `0`
- **1**: `0.25rem` (4px)
- **2**: `0.5rem` (8px)
- **3**: `0.75rem` (12px)
- **4**: `1rem` (16px)
- **5**: `1.25rem` (20px)
- **6**: `1.5rem` (24px)
- **8**: `2rem` (32px)
- **10**: `2.5rem` (40px)
- **12**: `3rem` (48px)
- **16**: `4rem` (64px)
- **20**: `5rem` (80px)
- **24**: `6rem` (96px)

### Spacing Aliases
- **XS**: spacing-2 (8px)
- **SM**: spacing-3 (12px)
- **MD**: spacing-4 (16px)
- **LG**: spacing-6 (24px)
- **XL**: spacing-8 (32px)
- **2XL**: spacing-12 (48px)

## 4. Border & Radius

### Border Widths
- **Thin**: 1px
- **Medium**: 2px
- **Thick**: 4px

### Border Radius
- **SM**: `0.25rem` (4px)
- **MD**: `0.5rem` (8px)
- **LG**: `0.75rem` (12px)
- **XL**: `1rem` (16px)
- **2XL**: `1.5rem` (24px)
- **Full**: `9999px` (Fully rounded)
- **Card**: `0.75rem` (12px) - Standard for cards

## 5. Shadows

### General Shadows
- **XS**: `0 1px 2px rgba(0, 0, 0, 0.05)`
- **SM**: `0 2px 4px rgba(0, 0, 0, 0.1)`
- **MD**: `0 4px 8px rgba(0, 0, 0, 0.12)`
- **LG**: `0 8px 16px rgba(0, 0, 0, 0.15)`
- **XL**: `0 12px 24px rgba(0, 0, 0, 0.2)`
- **2XL**: `0 24px 48px rgba(0, 0, 0, 0.25)`

### Component Shadows
- **Card**: `0 2px 8px rgba(0, 0, 0, 0.15)`
- **Card Hover**: `0 4px 12px rgba(0, 0, 0, 0.2)`
- **Button**: `0 2px 4px rgba(0, 0, 0, 0.1)`
- **Button Hover**: `0 4px 8px rgba(0, 0, 0, 0.15)`
- **Modal**: `0 20px 40px rgba(0, 0, 0, 0.3)`

## 6. Animation

### Timing Functions
- **Ease In**: `cubic-bezier(0.4, 0, 1, 1)`
- **Ease Out**: `cubic-bezier(0, 0, 0.2, 1)`
- **Ease In Out**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Ease Bounce**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`

### Durations
- **Instant**: 100ms
- **Fast**: 150ms
- **Medium**: 300ms
- **Slow**: 500ms
- **Slower**: 700ms

### Transitions
- **Fast**: 150ms ease-out
- **Medium**: 300ms ease-out
- **Slow**: 500ms ease-out
- **All**: all 300ms ease-out

## 7. Component Styles

### Button Component
**Location**: `src/components/common/Button/`

**Variants**:
- **Primary**: Ocean blue background, white text
- **Secondary**: White background, ocean blue border and text
- **Danger**: Coral red background, white text
- **Success**: Green background, white text
- **Ghost**: Transparent background, ocean blue text
- **Warning**: Orange/yellow background

**Sizes**:
- **Small**: Compact padding
- **Medium**: Default size
- **Large**: Increased padding and font size

**States**:
- Hover: Darker background, translateY(-2px)
- Active: Normal position, reduced shadow
- Disabled: 50% opacity, not-allowed cursor

### Card Component
**Location**: `src/components/common/Card/`

**Structure**:
- Width: 100px (desktop), 70px (mobile)
- Height: 140px (desktop), 98px (mobile)
- Aspect Ratio: 0.714
- Border Radius: var(--radius-card)

**Card States**:
1. **Normal**: Default appearance
2. **Hover**: Scale(1.05), elevated shadow, slight rotation
3. **Selected**: Blue glowing border, checkmark badge
4. **Disabled**: 50% opacity, grayscale filter

**Card Colors**:
- Each color has gradient background
- PlayedPairs mini cards use darker gradients for better contrast
- Text color adjusts based on background (white on dark, dark on light)

### Modal Component
**Location**: `src/components/common/Modal/`

**Structure**:
- Overlay: Semi-transparent dark background
- Content: White background, rounded corners, shadow
- Max width: Responsive to viewport
- Z-index: 400 (modal layer)

**Animations**:
- Entry: Scale from 0.95 to 1, fade in
- Exit: Scale to 0.95, fade out

### Input Component
**Location**: `src/components/common/Input/`

**Style**:
- Background: White
- Border: 2px solid gray
- Focus: Blue border, shadow
- Error state: Red border

## 8. Layout Patterns

### GameBoard Layout
**Grid Structure**:
```
┌─────────────────────────────┐
│      Navigation Bar         │
├─────────────────────────────┤
│     Opponents Area          │
│  (Auto-fit grid, 300px+)    │
├─────────────────────────────┤
│       Play Area             │
│  ┌────┬─────────┬────┐     │
│  │Left│ Center  │Right│     │
│  │Pile│  Deck   │Pile │     │
│  └────┴─────────┴────┘     │
├─────────────────────────────┤
│      Player Hand            │
├─────────────────────────────┤
│     Played Pairs            │
├─────────────────────────────┤
│    Action Buttons           │
├─────────────────────────────┤
│  Score Panel | Action Log   │
└─────────────────────────────┘
```

**Responsive Breakpoints**:
- **Mobile**: < 768px (stacked layout)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Card Layout
- **Hand**: Fanned layout with CSS transforms
- **Played Pairs**: Horizontal flex with wrapping
- **Discard Piles**: Stacked with depth indicators

## 9. Existing Components

### ✅ Implemented
1. **Button** - All variants and states
2. **Card** - With hover, selection, dragging
3. **Modal** - Basic modal with overlay
4. **Input** - Form input with validation
5. **PlayerHand** - Fanned card display
6. **DiscardPile** - With top card and count
7. **DrawDeck** - Card back stack
8. **OpponentArea** - Opponent info display
9. **ScorePanel** - Score breakdown
10. **ActionLog** - Game action history
11. **PlayedPairs** - Paired cards display
12. **DrawCardArea** - Two-card choice interface

### ❌ Not Implemented
1. **Card Effect Modals** - Special effect UI
2. **Player Selection Interface** - For steal card effect
3. **Effect Notifications** - Toast/banner notifications
4. **Extra Turn Indicator** - Visual indicator for bonus turns

## 10. Accessibility

### Focus States
- **Ring Width**: 3px
- **Ring Color**: Primary Ocean
- **Ring Offset**: 2px

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order follows visual layout
- Escape key closes modals

### Screen Reader Support
- Proper ARIA labels on cards and buttons
- Live regions for game state changes
- Descriptive alt text

## 11. Mobile Adaptations

### Touch Targets
- Minimum size: 44x44px
- Adequate spacing between interactive elements

### Layout Changes
- Stack components vertically
- Reduce card sizes
- Collapsible sections for played pairs
- Single column for action buttons

### Performance
- Reduce animations on mobile
- Optimize card rendering
- Lazy load off-screen components

## 12. Design Tokens Usage

All components should use CSS variables from `variables.css`:
```css
/* Example */
.my-component {
  color: var(--text-primary);
  background: var(--bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: var(--transition-medium);
}
```

## 13. BGA-Style Characteristics

The design follows Board Game Arena (BGA) conventions:
1. **Clean and Uncluttered** - Focus on gameplay
2. **Clear Information Hierarchy** - Important info is prominent
3. **Smooth Animations** - Polished transitions
4. **Intuitive Interactions** - Obvious what's clickable
5. **Mobile-Friendly** - Works on all devices
6. **Accessibility** - Keyboard and screen reader support

---

**Last Updated**: 2025-01-20
**Version**: 1.0
