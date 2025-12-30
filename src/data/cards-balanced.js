/**
 * Card Definitions - BALANCED VERSION
 * All 72 cards in the Sea Salt & Paper game
 *
 * Version: 2.0 (Balanced)
 * Changes from v1.0:
 * - Fixed color system to 4 colors only (blue, red, yellow, purple)
 * - Adjusted card values for better balance
 * - Modified effect restrictions
 * - Reduced mermaid count and increased win condition
 *
 * Card Types:
 * - pair_effect: Cards with special effects when paired
 * - collection: Cards valuable for collecting
 * - multiplier: Cards that multiply other card values
 * - special: Cards with unique scoring (Mermaids)
 */

/**
 * Generate multiple card instances
 * @param {string} name - Card name
 * @param {number} count - Number of cards to generate
 * @param {Object} properties - Card properties
 * @returns {Array} Array of card objects
 */
function generateCards(name, count, properties) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${name.toLowerCase()}_${i + 1}`,
    name,
    ...properties
  }));
}

// ============================================================
// PAIR EFFECT CARDS (38 cards total)
// ============================================================

// Fish (10 cards) - Blue, Value 1
// Effect: Draw 1 card from deck (blind draw)
const fishCards = generateCards('Fish', 10, {
  type: 'pair_effect',
  value: 1,
  color: 'blue',
  emoji: '🐟',
  pairEffect: 'draw_blind',
  description: 'When paired, draw 1 card from the deck (blind)',
  effectPower: 'medium'
});

// Crab (10 cards) - Red, Value 2 (ADJUSTED from 1)
// Effect: Take any card from either discard pile
const crabCards = generateCards('Crab', 10, {
  type: 'pair_effect',
  value: 2, // CHANGED from 1 (stronger effect = higher value)
  color: 'red',
  emoji: '🦀',
  pairEffect: 'draw_discard',
  description: 'When paired, take any card from either discard pile',
  effectPower: 'high'
});

// Sailboat (6 cards) - Blue, Value 5 (ADJUSTED from 3)
// Effect: Extra turn (RESTRICTED: once per round)
const sailboatCards = generateCards('Sailboat', 6, {
  type: 'pair_effect',
  value: 5, // CHANGED from 3 (very strong effect)
  color: 'blue',
  emoji: '⛵',
  pairEffect: 'extra_turn',
  description: 'When paired, take another turn after this one (max once per round)',
  effectPower: 'very_high',
  restriction: 'max_once_per_round' // NEW RESTRICTION
});

// Shark (6 cards) - Red, Value 4 (ADJUSTED from 3)
// Effect: Steal card (RESTRICTED: only ≤3 value cards)
const sharkCards = generateCards('Shark', 6, {
  type: 'pair_effect',
  value: 4, // CHANGED from 3
  color: 'red',
  emoji: '🦈',
  pairEffect: 'steal_card',
  description: 'Can pair with Swimmer to steal a card (≤3 value) from another player',
  effectPower: 'very_high',
  restriction: 'steal_max_value_3', // NEW RESTRICTION
  specialPair: 'Swimmer' // Can pair with different card
});

// Swimmer (6 cards) - Yellow, Value 4 (ADJUSTED from 3)
// Effect: Steal card (RESTRICTED: only ≤3 value cards)
const swimmerCards = generateCards('Swimmer', 6, {
  type: 'pair_effect',
  value: 4, // CHANGED from 3
  color: 'yellow',
  emoji: '🏊',
  pairEffect: 'steal_card',
  description: 'Can pair with Shark to steal a card (≤3 value) from another player',
  effectPower: 'very_high',
  restriction: 'steal_max_value_3', // NEW RESTRICTION
  specialPair: 'Shark' // Can pair with different card
});

// ============================================================
// COLLECTION CARDS (16 cards total)
// ============================================================

// Shell (8 cards) - Purple, Value 1
// Pure collection card, multiplied by Octopus
const shellCards = generateCards('Shell', 8, {
  type: 'collection',
  value: 1,
  color: 'purple',
  emoji: '🐚',
  pairEffect: null,
  description: 'Collection card, multiplied by Octopus (×2)',
  effectPower: 'none'
});

// Starfish (8 cards) - Yellow, Value 2
// Pure collection card worth 2 points
const starfishCards = generateCards('Starfish', 8, {
  type: 'collection',
  value: 2,
  color: 'yellow',
  emoji: '⭐',
  pairEffect: null,
  description: 'Collection card worth 2 points',
  effectPower: 'none'
});

// ============================================================
// MULTIPLIER CARDS (12 cards total)
// ============================================================

// Octopus (4 cards) - Purple, Value 4 (ADJUSTED from 3)
// Multiplier: Shell cards count as 2 points
const octopusCards = generateCards('Octopus', 4, {
  type: 'multiplier',
  value: 4, // CHANGED from 3 (compensation for weaker multiplier)
  color: 'purple',
  emoji: '🐙',
  pairEffect: null,
  multiplierTarget: 'Shell',
  multiplierValue: 2,
  description: 'Each Shell in your collection counts as 2 points (instead of 1)',
  effectPower: 'high'
});

// Penguin (4 cards) - Blue, Value 4
// Multiplier: Each pair counts as 2 points
const penguinCards = generateCards('Penguin', 4, {
  type: 'multiplier',
  value: 4,
  color: 'blue',
  emoji: '🐧',
  pairEffect: null,
  multiplierTarget: 'Pair',
  multiplierValue: 2,
  description: 'Each pair you played counts as 2 points (instead of 1)',
  effectPower: 'high'
});

// Seagull (4 cards) - Red, Value 5 (ADJUSTED from 4)
// Multiplier: Fish and Crab cards count as 2 points
const seagullCards = generateCards('Seagull', 4, {
  type: 'multiplier',
  value: 5, // CHANGED from 4 (strong multiplier)
  color: 'red',
  emoji: '🦅',
  pairEffect: null,
  multiplierTarget: ['Fish', 'Crab'],
  multiplierValue: 2,
  description: 'Each Fish and Crab in your collection counts as 2 points (instead of base value)',
  effectPower: 'very_high'
});

// ============================================================
// SPECIAL CARDS (6 cards total)
// ============================================================

// Mermaid (6 cards) - Multicolor, Value 0
// Special scoring: 5 mermaids = instant win (ADJUSTED from 4)
// 1st mermaid = most common color count, 2nd = 2nd most, etc.
const mermaidCards = generateCards('Mermaid', 6, {
  type: 'special',
  value: 0,
  color: 'multicolor',
  emoji: '🧜',
  pairEffect: null,
  description: 'Special scoring: 1st mermaid = most common color count, 2nd = 2nd most. 5 mermaids = instant win! (changed from 4)',
  effectPower: 'special',
  winCondition: 5 // CHANGED from 4
});

// ============================================================
// CARD DECK ASSEMBLY
// ============================================================

/**
 * All cards in the game (72 total)
 * @type {Array<Object>}
 */
export const ALL_CARDS = [
  ...fishCards,      // 10 cards
  ...crabCards,      // 10 cards
  ...shellCards,     // 8 cards
  ...starfishCards,  // 8 cards
  ...sailboatCards,  // 6 cards
  ...sharkCards,     // 6 cards
  ...swimmerCards,   // 6 cards
  ...octopusCards,   // 4 cards
  ...penguinCards,   // 4 cards
  ...seagullCards,   // 4 cards
  ...mermaidCards    // 6 cards
  // TOTAL: 72 cards
];

// ============================================================
// STATISTICS AND METADATA
// ============================================================

/**
 * Card counts by type (for reference and validation)
 */
export const CARD_COUNTS = {
  Fish: 10,
  Crab: 10,
  Shell: 8,
  Starfish: 8,
  Sailboat: 6,
  Shark: 6,
  Swimmer: 6,
  Octopus: 4,
  Penguin: 4,
  Seagull: 4,
  Mermaid: 6,
  TOTAL: 72
};

/**
 * Card distribution by color (BALANCED - 4 colors only)
 */
export const COLOR_DISTRIBUTION = {
  blue: 20,      // Fish (10) + Sailboat (6) + Penguin (4)
  red: 20,       // Crab (10) + Shark (6) + Seagull (4)
  yellow: 14,    // Starfish (8) + Swimmer (6)
  purple: 12,    // Shell (8) + Octopus (4)
  multicolor: 6  // Mermaid (6) - NOT counted in color bonus
};

/**
 * Card distribution by type
 */
export const TYPE_DISTRIBUTION = {
  pair_effect: 38,    // Fish, Crab, Sailboat, Shark, Swimmer
  collection: 16,     // Shell, Starfish
  multiplier: 12,     // Octopus, Penguin, Seagull
  special: 6,         // Mermaid
  TOTAL: 72
};

/**
 * Value distribution for balance analysis
 */
export const VALUE_DISTRIBUTION = {
  0: 6,   // Mermaid
  1: 18,  // Fish (10) + Shell (8)
  2: 18,  // Crab (10) + Starfish (8)
  3: 0,   // None
  4: 20,  // Shark (6) + Swimmer (6) + Octopus (4) + Penguin (4)
  5: 10,  // Sailboat (6) + Seagull (4)
  TOTAL_VALUE: 184, // Total points in deck
  AVERAGE_VALUE: 2.56 // Average value per card
};

/**
 * Effect power distribution
 */
export const EFFECT_POWER = {
  none: 16,        // Shell, Starfish
  medium: 10,      // Fish
  high: 18,        // Crab, Octopus, Penguin
  very_high: 22,   // Sailboat, Shark, Swimmer, Seagull
  special: 6       // Mermaid
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get a card by its ID
 * @param {string} cardId - Card ID (e.g., "fish_1")
 * @returns {Object|undefined} Card object or undefined
 */
export function getCardById(cardId) {
  return ALL_CARDS.find(card => card.id === cardId);
}

/**
 * Get all cards of a specific name
 * @param {string} cardName - Card name (e.g., "Fish")
 * @returns {Array} Array of card objects
 */
export function getCardsByName(cardName) {
  return ALL_CARDS.filter(card => card.name === cardName);
}

/**
 * Get all cards of a specific color
 * @param {string} color - Color (blue, red, yellow, purple, multicolor)
 * @returns {Array} Array of card objects
 */
export function getCardsByColor(color) {
  return ALL_CARDS.filter(card => card.color === color);
}

/**
 * Get all cards of a specific type
 * @param {string} type - Type (pair_effect, collection, multiplier, special)
 * @returns {Array} Array of card objects
 */
export function getCardsByType(type) {
  return ALL_CARDS.filter(card => card.type === type);
}

/**
 * Check if two cards can be paired
 * @param {Object} card1 - First card
 * @param {Object} card2 - Second card
 * @returns {boolean} True if cards can be paired
 */
export function canPair(card1, card2) {
  // Same name cards can always pair
  if (card1.name === card2.name) {
    return true;
  }

  // Special case: Shark + Swimmer can pair
  if (
    (card1.name === 'Shark' && card2.name === 'Swimmer') ||
    (card1.name === 'Swimmer' && card2.name === 'Shark')
  ) {
    return true;
  }

  return false;
}

/**
 * Get the effect of a paired cards
 * @param {Object} card1 - First card
 * @param {Object} card2 - Second card
 * @returns {string|null} Effect name or null
 */
export function getPairEffect(card1, card2) {
  if (!canPair(card1, card2)) {
    return null;
  }

  // Return the pair effect (both cards should have the same effect if they can pair)
  return card1.pairEffect || card2.pairEffect || null;
}

/**
 * Validate deck composition
 * @returns {Object} Validation result with any errors
 */
export function validateDeck() {
  const errors = [];

  // Check total count
  if (ALL_CARDS.length !== 72) {
    errors.push(`Total cards should be 72, but found ${ALL_CARDS.length}`);
  }

  // Check color distribution
  const colorCounts = {};
  ALL_CARDS.forEach(card => {
    colorCounts[card.color] = (colorCounts[card.color] || 0) + 1;
  });

  const expectedColors = ['blue', 'red', 'yellow', 'purple', 'multicolor'];
  Object.keys(colorCounts).forEach(color => {
    if (!expectedColors.includes(color)) {
      errors.push(`Invalid color found: ${color}`);
    }
  });

  // Check for duplicate IDs
  const ids = ALL_CARDS.map(card => card.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate IDs found: ${duplicates.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      totalCards: ALL_CARDS.length,
      colorDistribution: colorCounts,
      totalValue: ALL_CARDS.reduce((sum, card) => sum + card.value, 0),
      averageValue: (ALL_CARDS.reduce((sum, card) => sum + card.value, 0) / ALL_CARDS.length).toFixed(2)
    }
  };
}

// ============================================================
// BALANCE NOTES
// ============================================================

/**
 * BALANCE CHANGES FROM v1.0 TO v2.0:
 *
 * 1. COLOR SYSTEM FIX:
 *    - Reduced from 11 colors to 4 colors (blue, red, yellow, purple) + multicolor
 *    - Color distribution: Blue 20, Red 20, Yellow 14, Purple 12, Multi 6
 *    - This enables the color bonus mechanism
 *
 * 2. VALUE ADJUSTMENTS:
 *    - Crab: 1 → 2 (stronger effect justifies higher value)
 *    - Sailboat: 3 → 5 (very strong extra turn effect)
 *    - Shark: 3 → 4 (strong steal effect)
 *    - Swimmer: 3 → 4 (strong steal effect)
 *    - Octopus: 3 → 4 (compensation for weaker multiplier)
 *    - Seagull: 4 → 5 (strongest multiplier)
 *    - Average value: 1.97 → 2.56 points/card
 *    - 7-card hand: 13.8 → 17.9 points average
 *
 * 3. EFFECT RESTRICTIONS:
 *    - Sailboat: Added "max once per round" to prevent chaining
 *    - Shark/Swimmer: Can only steal cards with value ≤3
 *    - Mermaid: Win condition increased from 4 to 5 cards
 *
 * 4. GAME SETTINGS (recommended):
 *    - Target score: 30-40 → 50
 *    - Min score to Stop: 7 → 12
 *    - Starting hand size: 6-8 → 7 (fixed)
 *    - Color bonus: 3 points for most common color
 *
 * 5. EXPECTED GAME LENGTH:
 *    - Before: ~8 turns (too short)
 *    - After: ~13-15 turns (ideal)
 *
 * 6. STRATEGY DIVERSITY:
 *    - Before: Seagull flow dominant, Mermaid rush too random
 *    - After: 4+ viable strategies with similar win rates
 */

export default ALL_CARDS;
