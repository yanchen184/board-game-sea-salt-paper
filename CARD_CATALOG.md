# 🎴 Sea Salt & Paper - Card Catalog

This file lists all 72 cards in the game. You can modify the quantities here to customize which cards are included in the deck.

## 📊 Summary
- **Total Cards**: 72
- **Card Types**: 11 different types

---

## 🐟 Blue Cards (Fish)
| Card Name | Color | Quantity | Value | Effect |
|-----------|-------|----------|-------|--------|
| Fish 🐟 | Blue | **10** | 1 | **Pair Effect**: Draw 1 card from deck (blind) |

**Description**: When you play a pair of Fish, automatically draw 1 card from the top of the deck without seeing it first.

---

## 🦀 Red Cards (Crab)
| Card Name | Color | Quantity | Value | Effect |
|-----------|-------|----------|-------|--------|
| Crab 🦀 | Red | **10** | 1 | **Pair Effect**: Take any card from either discard pile |

**Description**: When you play a pair of Crabs, choose and take any card from the left or right discard pile.

---

## 🐚 Purple Cards (Shell)
| Card Name | Color | Quantity | Value | Effect |
|-----------|-------|----------|-------|--------|
| Shell 🐚 | Purple | **8** | 1 | Collection card (multiplied by Octopus) |

**Description**: Collection card. Each Octopus in your hand makes all your Shells worth 2 points instead of 1.

---

## ⭐ Orange Cards (Starfish)
| Card Name | Color | Quantity | Value | Effect |
|-----------|-------|----------|-------|--------|
| Starfish ⭐ | Orange | **8** | 2 | Collection card |

**Description**: Basic collection card worth 2 points each.

---

## ⛵ Green Cards (Sailboat/Penguin)
| Card Name | Color | Quantity | Value | Effect |
|-----------|-------|----------|-------|--------|
| Sailboat ⛵ | Green | **6** | 3 | **Pair Effect**: Extra turn |

**Description**: When you play a pair of Sailboats, you get an extra turn immediately after this one.

---

## 🦈 Gray Cards (Shark)
| Card Name | Color | Quantity | Value | Effect |
|-----------|-------|----------|-------|--------|
| Shark 🦈 | Gray | **6** | 3 | **Pair Effect**: Steal card (pairs with Swimmer) |

**Description**: When you play Shark + Swimmer (mixed pair), steal one card from any opponent's hand (you choose which opponent and which card position).

---

## 🏊 Yellow Cards (Swimmer)
| Card Name | Color | Quantity | Value | Effect |
|-----------|-------|----------|-------|--------|
| Swimmer 🏊 | Yellow | **6** | 3 | **Pair Effect**: Steal card (pairs with Shark) |

**Description**: When you play Swimmer + Shark (mixed pair), steal one card from any opponent's hand.

---

## 🐙 Purple Cards (Octopus) - MULTIPLIER
| Card Name | Color | Quantity | Value | Effect |
|-----------|-------|----------|-------|--------|
| Octopus 🐙 | Purple | **4** | 3 | **Multiplier**: Shells × 2 |

**Description**: Each Octopus in your hand doubles the value of all your Shells (from 1 to 2 points each).

---

## 🐧 Black/White Cards (Penguin) - MULTIPLIER
| Card Name | Color | Quantity | Value | Effect |
|-----------|-------|----------|-------|--------|
| Penguin 🐧 | Black & White | **4** | 4 | **Multiplier**: Pairs × 2 |

**Description**: Each Penguin in your hand doubles your pair bonus (from 1 to 2 points per pair played).

---

## 🦅 White Cards (Seagull) - MULTIPLIER
| Card Name | Color | Quantity | Value | Effect |
|-----------|-------|----------|-------|--------|
| Seagull 🦅 | White | **4** | 4 | **Multiplier**: Fish & Crab × 2 |

**Description**: Each Seagull in your hand doubles the value of all your Fish and Crabs (from 1 to 2 points each).

---

## 🧜 Multicolor Cards (Mermaid) - SPECIAL
| Card Name | Color | Quantity | Value | Effect |
|-----------|-------|----------|-------|--------|
| Mermaid 🧜 | Multicolor | **6** | 0 | **Special Scoring** (see below) |

**Description**:
- **1st Mermaid**: Worth points equal to your most common color count
- **2nd Mermaid**: Worth points equal to your 2nd most common color count
- **3rd Mermaid**: Worth points equal to your 3rd most common color count
- **4 Mermaids**: Instant win! 🏆

**Example**: If you have 5 Blue, 3 Red, 2 Green cards and 2 Mermaids:
- 1st Mermaid = 5 points (most common color)
- 2nd Mermaid = 3 points (2nd most common color)
- Total Mermaid points = 8

---

## 🎯 Deck Customization Guide

### How to Modify the Deck

1. **Edit Quantities**: Change the numbers in the "Quantity" column above
2. **Update Code**: Modify `src/data/cards.js` with your changes
3. **Example Change**:
   ```javascript
   // Original: 10 Fish cards
   const fishCards = generateCards('Fish', 10, { ... })

   // Modified: Only 5 Fish cards
   const fishCards = generateCards('Fish', 5, { ... })
   ```

### Common Customizations

#### Beginner Mode (Simpler, fewer cards)
- Fish: 6 (instead of 10)
- Crab: 6 (instead of 10)
- Shell: 4 (instead of 8)
- Starfish: 4 (instead of 8)
- Sailboat: 3 (instead of 6)
- Shark: 3 (instead of 6)
- Swimmer: 3 (instead of 6)
- Octopus: 2 (instead of 4)
- Penguin: 2 (instead of 4)
- Seagull: 2 (instead of 4)
- Mermaid: 3 (instead of 6)
- **Total**: 38 cards

#### Expert Mode (More strategy, more pairs)
- Fish: 12 (instead of 10)
- Crab: 12 (instead of 10)
- Shell: 10 (instead of 8)
- Starfish: 10 (instead of 8)
- Keep others the same
- **Total**: 80 cards

#### No Special Effects (Simple collecting only)
- Remove all pair effect cards:
  - Fish: 0
  - Crab: 0
  - Sailboat: 0
  - Shark: 0
  - Swimmer: 0
- Increase collection cards:
  - Shell: 15
  - Starfish: 15
- Keep multipliers and mermaids

---

## 📝 Notes

- **Total must be even**: The game works best with an even number of cards
- **Balance is key**: Don't make one color too dominant
- **Test thoroughly**: After modifying, play a few test games to ensure balance
- **Multipliers need targets**: If you remove Shells, remove Octopuses too

---

## 🔄 Reverting to Original

If you want to return to the original 72-card deck, use these quantities:

| Card | Original Quantity |
|------|-------------------|
| Fish 🐟 | 10 |
| Crab 🦀 | 10 |
| Shell 🐚 | 8 |
| Starfish ⭐ | 8 |
| Sailboat ⛵ | 6 |
| Shark 🦈 | 6 |
| Swimmer 🏊 | 6 |
| Octopus 🐙 | 4 |
| Penguin 🐧 | 4 |
| Seagull 🦅 | 4 |
| Mermaid 🧜 | 6 |

**Total: 72 cards**

---

Last Updated: 2025-11-20
Version: 1.0.0
