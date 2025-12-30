/**
 * Game Service
 *
 * Core game logic for Sea Salt & Paper
 * Deck management, dealing, pair validation, win conditions
 */

import { ALL_CARDS } from '../data/cards.js'
import { shuffleDeck, dealCards, isValidPair, getPairEffect, hasFourMermaids } from '../utils/cardHelpers.js'
import { TARGET_SCORES, MERMAID_INSTANT_WIN_COUNT, isValidPairCombination } from '../data/gameRules.js'
import { calculateScore } from './scoreService.js'
import { assignRandomColors } from '../config/colorConfig.js'

/**
 * Create a new shuffled deck with random colors
 * 建立牌庫時，會隨機分配顏色給每張卡牌
 * @returns {Array} Shuffled deck of cards with random colors
 */
export function createDeck() {
  // 複製原始卡牌
  const cards = [...ALL_CARDS]

  // 隨機分配顏色
  const cardsWithColors = assignRandomColors(cards)

  // 洗牌
  return shuffleDeck(cardsWithColors)
}

/**
 * Deal initial hands to all players
 * @param {number} playerCount - Number of players
 * @param {number} cardsPerPlayer - Cards to deal to each player
 * @returns {Object} { hands, remainingDeck }
 */
export function dealInitialHands(playerCount, cardsPerPlayer = 0) {
  let deck = createDeck()
  const hands = []

  for (let i = 0; i < playerCount; i++) {
    const result = dealCards(deck, cardsPerPlayer)
    hands.push(result.dealtCards)
    deck = result.remainingDeck
  }

  return {
    hands,
    remainingDeck: deck
  }
}

/**
 * Draw cards from deck
 * @param {Array} deck - Current deck
 * @param {number} count - Number of cards to draw
 * @returns {Object} { drawnCards, remainingDeck }
 */
export function drawFromDeck(deck, count) {
  const result = dealCards(deck, count)
  // dealCards returns { dealtCards, remainingDeck }
  // We need to return { drawnCards, remainingDeck } for consistency
  return {
    drawnCards: result.dealtCards,
    remainingDeck: result.remainingDeck
  }
}

/**
 * Validate if two cards can form a pair
 * @param {Object} card1 - First card
 * @param {Object} card2 - Second card
 * @returns {boolean} Valid pair
 */
export function validatePair(card1, card2) {
  return isValidPair(card1, card2)
}

/**
 * Execute pair effect
 * Returns the effect type to be handled by the game state
 *
 * @param {Object} card1 - First card in pair
 * @param {Object} card2 - Second card in pair
 * @returns {Object} Effect details
 */
export function executePairEffect(card1, card2) {
  const effectType = getPairEffect(card1, card2)

  if (!effectType) {
    return { effect: null }
  }

  return {
    effect: effectType,
    cards: [card1, card2]
  }
}

/**
 * Check if deck needs reshuffling
 * If deck is empty, reshuffle discard piles
 *
 * @param {Array} deck - Current deck
 * @param {Array} discardLeft - Left discard pile
 * @param {Array} discardRight - Right discard pile
 * @returns {Object} { needsReshuffle, newDeck, newDiscardLeft, newDiscardRight }
 */
export function checkDeckReshuffle(deck, discardLeft, discardRight) {
  if (deck.length > 0) {
    return {
      needsReshuffle: false,
      newDeck: deck,
      newDiscardLeft: discardLeft,
      newDiscardRight: discardRight
    }
  }

  // Combine both discard piles (keep top card of each if possible)
  const topLeft = discardLeft && discardLeft.length > 0 ? discardLeft[discardLeft.length - 1] : null
  const topRight = discardRight && discardRight.length > 0 ? discardRight[discardRight.length - 1] : null

  // Get cards to reshuffle from discard piles
  const leftCards = discardLeft && discardLeft.length > 1 ? discardLeft.slice(0, -1) : []
  const rightCards = discardRight && discardRight.length > 1 ? discardRight.slice(0, -1) : []

  const cardsToShuffle = [...leftCards, ...rightCards]

  // If no cards available to reshuffle, return empty deck
  if (cardsToShuffle.length === 0) {
    return {
      needsReshuffle: true,
      newDeck: [],
      newDiscardLeft: topLeft ? [topLeft] : [],
      newDiscardRight: topRight ? [topRight] : []
    }
  }

  const newDeck = shuffleDeck(cardsToShuffle)

  return {
    needsReshuffle: true,
    newDeck,
    newDiscardLeft: topLeft ? [topLeft] : [],
    newDiscardRight: topRight ? [topRight] : []
  }
}

/**
 * Check win conditions
 * @param {Object} player - Player object with hand and playedPairs
 * @param {number} targetScore - Target score to win
 * @returns {Object} { hasWon, reason }
 */
export function checkWinCondition(player, targetScore) {
  // Check for 4 mermaids instant win
  const allCards = [...(player.hand || []), ...(player.playedPairs || []).flatMap(p => p.cards || [])]
  if (hasFourMermaids(allCards)) {
    return {
      hasWon: true,
      reason: '4_mermaids',
      message: 'Won with 4 Mermaids!'
    }
  }

  // Check if total score reaches target
  if (player.score >= targetScore) {
    return {
      hasWon: true,
      reason: 'target_score',
      message: `Reached target score of ${targetScore}!`
    }
  }

  return {
    hasWon: false,
    reason: null
  }
}

/**
 * Calculate round winner
 * Determines who won the round and what scores they get
 *
 * @param {Object} players - Map of player IDs to player data
 * @param {string} declareMode - 'stop' or 'last_chance'
 * @param {string} declaringPlayerId - Player who declared
 * @returns {Object} Round results
 */
export function calculateRoundWinner(players, declareMode, declaringPlayerId) {
  const playerIds = Object.keys(players)

  if (declareMode === 'stop') {
    // STOP: Everyone gets card score, NO color bonus
    const scores = {}
    playerIds.forEach(playerId => {
      const player = players[playerId]
      const scoreData = calculateScore(
        player.hand || [],
        player.playedPairs || [],
        { includeColorBonus: false }
      )
      scores[playerId] = scoreData
    })

    // Find winner (highest score)
    const winner = playerIds.reduce((prev, curr) =>
      scores[curr].total > scores[prev].total ? curr : prev
    )

    return {
      mode: 'stop',
      scores,
      winner,
      winnerScore: scores[winner].total
    }
  }

  // LAST CHANCE: Complex scoring rules
  if (declareMode === 'last_chance') {
    const allScores = {}

    // Calculate card scores (no color bonus yet)
    playerIds.forEach(playerId => {
      const player = players[playerId]
      allScores[playerId] = calculateScore(
        player.hand || [],
        player.playedPairs || [],
        { includeColorBonus: false }
      )
    })

    // Determine if declarer has highest score
    const declarerScore = allScores[declaringPlayerId].total
    const allScoreValues = Object.values(allScores).map(s => s.total)
    const highestScore = Math.max(...allScoreValues)
    const declarerHasHighest = declarerScore >= highestScore

    // Apply Last Chance rules
    const finalScores = {}

    playerIds.forEach(playerId => {
      const player = players[playerId]
      const isDeclarer = playerId === declaringPlayerId

      // Calculate color bonus
      const colorBonus = calculateScore(
        player.hand || [],
        player.playedPairs || [],
        { includeColorBonus: true }
      ).colorBonus

      if (declarerHasHighest) {
        // Declarer wins: gets card score + color bonus, others get only color bonus
        if (isDeclarer) {
          finalScores[playerId] = {
            ...allScores[playerId],
            colorBonus,
            total: allScores[playerId].total + colorBonus
          }
        } else {
          finalScores[playerId] = {
            base: 0,
            pairs: 0,
            multipliers: 0,
            mermaids: 0,
            colorBonus,
            total: colorBonus
          }
        }
      } else {
        // Declarer lost: gets only color bonus, others get card score + color bonus
        if (isDeclarer) {
          finalScores[playerId] = {
            base: 0,
            pairs: 0,
            multipliers: 0,
            mermaids: 0,
            colorBonus,
            total: colorBonus
          }
        } else {
          finalScores[playerId] = {
            ...allScores[playerId],
            colorBonus,
            total: allScores[playerId].total + colorBonus
          }
        }
      }
    })

    // Find winner
    const winner = playerIds.reduce((prev, curr) =>
      finalScores[curr].total > finalScores[prev].total ? curr : prev
    )

    return {
      mode: 'last_chance',
      scores: finalScores,
      winner,
      winnerScore: finalScores[winner].total,
      declarerHasHighest
    }
  }

  return null
}

/**
 * Get target score based on player count
 * @param {number} playerCount - Number of players
 * @returns {number} Target score
 */
export function getTargetScore(playerCount) {
  return TARGET_SCORES[playerCount] || 30
}

/**
 * Initialize game state
 * @param {Array} playerIds - Array of player IDs
 * @param {Object} settings - Game settings
 * @param {Object} playersData - Player data object with names and other info
 * @returns {Object} Initial game state
 */
export function initializeGameState(playerIds, settings, playersData = {}) {
  const playerCount = playerIds.length
  const { hands, remainingDeck } = dealInitialHands(playerCount, settings.startingHandSize || 0)

  const players = {}
  playerIds.forEach((playerId, index) => {
    const playerInfo = playersData[playerId] || {}
    players[playerId] = {
      hand: hands[index],
      playedPairs: [],
      score: 0,
      // 複製玩家名稱和其他必要信息
      name: playerInfo.name || '未知玩家',
      isAI: playerInfo.isAI || false
    }
  })

  // Deal one card to each discard pile
  let deck = remainingDeck

  // Ensure we have cards to deal
  if (deck.length < 2) {
    console.error('Not enough cards in deck to initialize game!')
    return null
  }

  const leftCardResult = drawFromDeck(deck, 1)
  const leftCard = leftCardResult.drawnCards[0]
  deck = leftCardResult.remainingDeck

  const rightCardResult = drawFromDeck(deck, 1)
  const rightCard = rightCardResult.drawnCards[0]
  deck = rightCardResult.remainingDeck

  // 隨機選擇起始玩家
  const startingPlayerIndex = Math.floor(Math.random() * playerCount)
  const startingPlayerId = playerIds[startingPlayerIndex]

  console.log(`[Game Init] Initialized with ${playerCount} players, deck has ${deck.length} cards`)
  console.log(`[Game Init] Starting player: ${startingPlayerId} (index: ${startingPlayerIndex})`)
  console.log(`[Game Init] Player order:`, playerIds)

  return {
    deck: deck,
    deckCount: deck.length,
    discardLeft: leftCard ? [leftCard] : [],
    discardRight: rightCard ? [rightCard] : [],
    currentPlayerIndex: startingPlayerIndex,
    currentPlayerId: startingPlayerId,
    startingPlayerId: startingPlayerId,  // 起始玩家標記
    startingPlayerIndex: startingPlayerIndex,
    playerOrder: playerIds,  // 固定的玩家順序數組
    round: 1,
    turnCount: 0,  // Track total turns played in this round
    turnPhase: 'draw',
    players,
    declareMode: null,
    declaringPlayerId: null,
    remainingTurns: null,
    lastAction: null,
    actionLog: []
  }
}

export default {
  createDeck,
  dealInitialHands,
  drawFromDeck,
  validatePair,
  executePairEffect,
  checkDeckReshuffle,
  checkWinCondition,
  calculateRoundWinner,
  getTargetScore,
  initializeGameState
}
