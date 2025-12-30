/**
 * Game Rules Configuration
 * Core game rules, scoring formulas, and win conditions
 */

/**
 * Target scores based on player count
 * 2 players: 40 points
 * 3 players: 35 points
 * 4 players: 30 points
 */
export const TARGET_SCORES = {
  2: 40,
  3: 35,
  4: 30
}

/**
 * Minimum score required to declare "Stop" or "Last Chance"
 */
export const MIN_DECLARE_SCORE = 7

/**
 * Number of mermaids required for instant win
 */
export const MERMAID_INSTANT_WIN_COUNT = 4

/**
 * Pair effect types and their actions
 */
export const PAIR_EFFECTS = {
  draw_blind: {
    name: 'Draw Blind',
    description: 'Draw 1 card from the top of the deck',
    action: 'DRAW_FROM_DECK'
  },
  draw_discard: {
    name: 'Choose from Discard',
    description: 'Take any card from either discard pile',
    action: 'CHOOSE_FROM_DISCARD'
  },
  extra_turn: {
    name: 'Extra Turn',
    description: 'Take another turn after this one',
    action: 'SET_EXTRA_TURN'
  },
  steal_card: {
    name: 'Steal Card',
    description: 'Steal 1 card from another player\'s hand',
    action: 'STEAL_FROM_PLAYER'
  }
}

/**
 * Pair effect score bonus
 * Each played pair grants +1 point
 */
export const PAIR_BONUS_VALUE = 1

/**
 * Multiplier card effects
 */
export const MULTIPLIERS = {
  Octopus: {
    target: 'Shell',
    multiplier: 2,
    description: 'Shells count as 2 points each'
  },
  Penguin: {
    target: 'Pair',
    multiplier: 2,
    description: 'Each pair counts as 2 points instead of 1'
  },
  Seagull: {
    targets: ['Fish', 'Crab'],
    multiplier: 2,
    description: 'Fish and Crabs count as 2 points each'
  }
}

/**
 * Declare modes
 */
export const DECLARE_MODES = {
  STOP: {
    name: 'Stop',
    description: 'End the round immediately. No color bonuses for anyone.',
    colorBonus: false,
    lastChance: false
  },
  LAST_CHANCE: {
    name: 'Last Chance',
    description: 'Other players get one more turn. Color bonuses may apply based on results.',
    colorBonus: true,
    lastChance: true
  }
}

/**
 * Scoring rules for "Last Chance" declare mode
 *
 * If declarer has highest score (or tied for highest):
 * - Declarer gets: card score + color bonus
 * - Others get: color bonus only
 *
 * If declarer does NOT have highest score:
 * - Declarer gets: color bonus only
 * - Others get: card score + color bonus
 *
 * @param {boolean} declarerHasHighest - Whether declarer has highest/tied score
 * @returns {Object} Scoring rules for each player type
 */
export function getLastChanceScoringRules(declarerHasHighest) {
  if (declarerHasHighest) {
    return {
      declarer: { cardScore: true, colorBonus: true },
      others: { cardScore: false, colorBonus: true }
    }
  } else {
    return {
      declarer: { cardScore: false, colorBonus: true },
      others: { cardScore: true, colorBonus: true }
    }
  }
}

/**
 * Empty discard pile rule
 * If one discard pile is empty, the player MUST discard to that pile
 *
 * @param {Array} discardLeft - Left discard pile
 * @param {Array} discardRight - Right discard pile
 * @returns {Object} Which piles can receive cards
 */
export function getDiscardRules(discardLeft, discardRight) {
  const leftEmpty = !discardLeft || discardLeft.length === 0
  const rightEmpty = !discardRight || discardRight.length === 0

  // If one is empty, can ONLY discard to empty pile
  if (leftEmpty && !rightEmpty) {
    return { canDiscardLeft: true, canDiscardRight: false, mustDiscardLeft: true }
  }
  if (rightEmpty && !leftEmpty) {
    return { canDiscardLeft: false, canDiscardRight: true, mustDiscardRight: true }
  }

  // If both empty or both have cards, can discard to either
  return { canDiscardLeft: true, canDiscardRight: true }
}

/**
 * Cards that can form pairs (have pairEffect)
 * Only cards with pair effects can be played as pairs
 */
const PAIRABLE_CARDS = ['Fish', 'Crab', 'Sailboat', 'Shark', 'Swimmer']

/**
 * Valid pair combinations
 * Only cards with pair effects can form valid pairs
 * @param {string} cardName1 - First card name
 * @param {string} cardName2 - Second card name
 * @returns {boolean} Whether cards can form a valid pair
 */
export function isValidPairCombination(cardName1, cardName2) {
  // Special case: Shark + Swimmer (different card types can pair)
  if (
    (cardName1 === 'Shark' && cardName2 === 'Swimmer') ||
    (cardName1 === 'Swimmer' && cardName2 === 'Shark')
  ) {
    return true
  }

  // Same card type, but must be a pairable card
  if (cardName1 === cardName2 && PAIRABLE_CARDS.includes(cardName1)) {
    return true
  }

  return false
}

/**
 * Default game settings
 */
export const DEFAULT_SETTINGS = {
  maxPlayers: 4,
  targetScore: 'auto', // 'auto' uses TARGET_SCORES, or can be 30, 35, 40, custom
  customScore: null,
  startingHandSize: 0, // Players start with 0 cards - draw cards during first turn
  mermaidsWin: true,
  colorBonus: true,
  aiCount: 0,
  aiDifficulty: 'medium' // easy | medium | hard
}

export default {
  TARGET_SCORES,
  MIN_DECLARE_SCORE,
  MERMAID_INSTANT_WIN_COUNT,
  PAIR_EFFECTS,
  PAIR_BONUS_VALUE,
  MULTIPLIERS,
  DECLARE_MODES,
  DEFAULT_SETTINGS,
  getLastChanceScoringRules,
  getDiscardRules,
  isValidPairCombination
}
