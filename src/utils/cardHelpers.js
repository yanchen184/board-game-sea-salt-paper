import { isValidPairCombination } from '../data/gameRules.js'

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Shuffle a deck of cards
 * @param {Array} cards - Array of card objects
 * @returns {Array} Shuffled array of cards
 */
export function shuffleDeck(cards) {
  return shuffleArray(cards)
}

/**
 * Deal cards from a deck
 * @param {Array} deck - Current deck
 * @param {number} count - Number of cards to deal
 * @returns {Object} { dealtCards, remainingDeck }
 */
export function dealCards(deck, count) {
  const dealtCards = deck.slice(0, count)
  const remainingDeck = deck.slice(count)
  return { dealtCards, remainingDeck }
}

/**
 * Check if two cards can form a valid pair
 * @param {Object} card1 - First card
 * @param {Object} card2 - Second card
 * @returns {boolean} Whether cards can pair
 */
export function isValidPair(card1, card2) {
  if (!card1 || !card2) return false
  return isValidPairCombination(card1.name, card2.name)
}

/**
 * Find all possible pairs in a hand
 * @param {Array} hand - Array of cards
 * @returns {Array} Array of pair objects { card1, card2, valid }
 */
export function findPairs(hand) {
  const pairs = []

  for (let i = 0; i < hand.length - 1; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      if (isValidPair(hand[i], hand[j])) {
        pairs.push({
          card1: hand[i],
          card2: hand[j],
          valid: true
        })
      }
    }
  }

  return pairs
}

/**
 * Filter cards by color
 * @param {Array} cards - Array of cards
 * @param {string} color - Color to filter by
 * @returns {Array} Filtered cards
 */
export function filterCardsByColor(cards, color) {
  return cards.filter(card => card.color === color)
}

/**
 * Filter cards by name/type
 * @param {Array} cards - Array of cards
 * @param {string} name - Card name to filter by
 * @returns {Array} Filtered cards
 */
export function filterCardsByName(cards, name) {
  return cards.filter(card => card.name === name)
}

/**
 * Count cards by color
 * @param {Array} cards - Array of cards
 * @returns {Object} Object mapping color to count
 */
export function countCardsByColor(cards) {
  const counts = {}

  cards.forEach(card => {
    // Don't count multicolor cards (Mermaids) for color bonus
    if (card.color && card.color !== 'multicolor') {
      counts[card.color] = (counts[card.color] || 0) + 1
    }
  })

  return counts
}

/**
 * Count cards by name
 * @param {Array} cards - Array of cards
 * @returns {Object} Object mapping card name to count
 */
export function countCardsByName(cards) {
  const counts = {}

  cards.forEach(card => {
    counts[card.name] = (counts[card.name] || 0) + 1
  })

  return counts
}

/**
 * Get the most common color in a hand
 * @param {Array} cards - Array of cards
 * @returns {string|null} Most common color or null
 */
export function getMostCommonColor(cards) {
  const colorCounts = countCardsByColor(cards)
  const colors = Object.keys(colorCounts)

  if (colors.length === 0) return null

  return colors.reduce((a, b) =>
    colorCounts[a] > colorCounts[b] ? a : b
  )
}

/**
 * Sort cards by value (descending), then by name
 * @param {Array} cards - Array of cards
 * @returns {Array} Sorted cards
 */
export function sortCards(cards) {
  return [...cards].sort((a, b) => {
    // First sort by value (descending)
    if (b.value !== a.value) {
      return b.value - a.value
    }
    // Then by name alphabetically
    return a.name.localeCompare(b.name)
  })
}

/**
 * Get pair effect type from card pair
 * @param {Object} card1 - First card
 * @param {Object} card2 - Second card
 * @returns {string|null} Pair effect type or null
 */
export function getPairEffect(card1, card2) {
  if (!isValidPair(card1, card2)) return null

  // Shark + Swimmer special case
  if (
    (card1.name === 'Shark' && card2.name === 'Swimmer') ||
    (card1.name === 'Swimmer' && card2.name === 'Shark')
  ) {
    return 'steal_card'
  }

  // Otherwise, use the pair effect from the card (if any)
  return card1.pairEffect || null
}

/**
 * Count mermaids in a collection
 * @param {Array} cards - Array of cards
 * @returns {number} Number of mermaid cards
 */
export function countMermaids(cards) {
  return filterCardsByName(cards, 'Mermaid').length
}

/**
 * Check if hand has 4 mermaids (instant win condition)
 * @param {Array} cards - Array of cards
 * @returns {boolean} Whether hand has 4 mermaids
 */
export function hasFourMermaids(cards) {
  return countMermaids(cards) >= 4
}

export default {
  shuffleArray,
  shuffleDeck,
  dealCards,
  isValidPair,
  findPairs,
  filterCardsByColor,
  filterCardsByName,
  countCardsByColor,
  countCardsByName,
  getMostCommonColor,
  sortCards,
  getPairEffect,
  countMermaids,
  hasFourMermaids
}
