/**
 * Parametric AI for Browser
 *
 * Browser-compatible version of the trained AI decision system.
 * Uses genome parameters to make optimal decisions.
 */

import { isValidPair, countCardsByName } from '../utils/cardHelpers.js'
import { calculateScore } from './scoreService.js'

/**
 * Collection card scoring rules
 */
const COLLECTION_SCORING = {
  Shell: (count) => count > 0 ? (count - 1) * 2 : 0,
  Octopus: (count) => count > 0 ? (count - 1) * 3 : 0,
  Penguin: (count) => count > 0 ? count * 2 - 1 : 0,
  Sailor: (count) => count >= 2 ? 5 : 0
}

/**
 * Valid pair combinations
 */
const PAIR_CARDS = ['Fish', 'Crab', 'Sailboat']

/**
 * Check if two cards can form a valid pair
 */
function isValidPairLocal(card1, card2) {
  if (!card1 || !card2) return false

  // Same name pairs
  if (card1.name === card2.name && PAIR_CARDS.includes(card1.name)) {
    return true
  }

  // Shark + Swimmer special pair
  if ((card1.name === 'Shark' && card2.name === 'Swimmer') ||
      (card1.name === 'Swimmer' && card2.name === 'Shark')) {
    return true
  }

  return false
}

/**
 * Get pair effect type
 */
function getPairEffect(card1, card2) {
  if (!isValidPairLocal(card1, card2)) return null

  if ((card1.name === 'Shark' && card2.name === 'Swimmer') ||
      (card1.name === 'Swimmer' && card2.name === 'Shark')) {
    return 'steal_card'
  }

  return card1.pairEffect || null
}

/**
 * Find all valid pairs in hand
 */
function findAllPairs(hand) {
  const pairs = []
  for (let i = 0; i < hand.length; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      if (isValidPairLocal(hand[i], hand[j])) {
        pairs.push([hand[i], hand[j]])
      }
    }
  }
  return pairs
}

/**
 * Count cards by color
 */
function countByColor(cards) {
  const counts = {}
  cards.forEach(card => {
    if (card.color && card.color !== 'multicolor') {
      counts[card.color] = (counts[card.color] || 0) + 1
    }
  })
  return counts
}

/**
 * Evaluate draw source based on genome parameters
 */
function evaluateDrawSource(genome, gameState, playerId) {
  const player = gameState.players[playerId]
  const hand = player.hand || []
  const discardLeft = gameState.discardLeft || []
  const discardRight = gameState.discardRight || []

  const options = []

  // Option 1: Draw from deck
  const deckValue = genome.deckBaseValue

  // Adjust deck value based on hand composition
  let deckBonus = 0
  const collectionNames = ['Shell', 'Octopus', 'Penguin', 'Sailor']
  collectionNames.forEach(name => {
    const count = countCardsByName(hand, name)
    if (count >= 1) {
      deckBonus += 0.3 * (genome[`${name.toLowerCase()}Priority`] || 0.3)
    }
  })

  options.push({
    source: 'deck',
    value: deckValue + deckBonus
  })

  // Option 2: Take from left discard
  if (discardLeft.length > 0) {
    const card = discardLeft[discardLeft.length - 1]
    const value = evaluateDiscardCard(genome, card, hand, gameState, playerId)
    options.push({
      source: 'discard_left',
      value
    })
  }

  // Option 3: Take from right discard
  if (discardRight.length > 0) {
    const card = discardRight[discardRight.length - 1]
    const value = evaluateDiscardCard(genome, card, hand, gameState, playerId)
    options.push({
      source: 'discard_right',
      value
    })
  }

  // Choose best option
  options.sort((a, b) => b.value - a.value)
  return options[0].source
}

/**
 * Evaluate a discard pile card
 */
function evaluateDiscardCard(genome, card, hand, gameState, playerId) {
  if (!card) return 0

  let value = card.value || 0

  // Pair potential
  const canPair = hand.some(h => isValidPairLocal(card, h))
  if (canPair) {
    value += genome.discardPairBonus
  }

  // Collection value
  const collectionNames = ['Shell', 'Octopus', 'Penguin', 'Sailor']
  if (collectionNames.includes(card.name)) {
    const currentCount = countCardsByName(hand, card.name)
    const currentScore = COLLECTION_SCORING[card.name](currentCount)
    const newScore = COLLECTION_SCORING[card.name](currentCount + 1)
    const marginalGain = newScore - currentScore
    value += marginalGain * genome.discardCollectionBonus
  }

  // Multiplier synergy
  const multiplierMap = {
    'Lighthouse': 'Sailboat',
    'FishSchool': 'Fish',
    'PenguinColony': 'Penguin',
    'Captain': 'Sailor'
  }
  const targetToMultiplier = {
    'Sailboat': { mult: 'Lighthouse', bonus: 1 },
    'Fish': { mult: 'FishSchool', bonus: 1 },
    'Penguin': { mult: 'PenguinColony', bonus: 2 },
    'Sailor': { mult: 'Captain', bonus: 3 }
  }

  // If card is a multiplier
  if (multiplierMap[card.name]) {
    const targetName = multiplierMap[card.name]
    const targetCount = countCardsByName(hand, targetName)
    if (targetCount > 0) {
      const synergyBonus = card.name === 'PenguinColony' ? 2 :
                           card.name === 'Captain' ? 3 : 1
      value += targetCount * synergyBonus * genome.discardMultiplierBonus
    }
  }

  // If card is a target for multiplier we have
  if (targetToMultiplier[card.name]) {
    const { mult, bonus } = targetToMultiplier[card.name]
    if (countCardsByName(hand, mult) > 0) {
      value += bonus * genome.discardMultiplierBonus
    }
  }

  // Color bonus
  const colorCounts = countByColor(hand)
  const dominantColor = Object.keys(colorCounts).length > 0
    ? Object.keys(colorCounts).reduce((a, b) =>
        colorCounts[a] > colorCounts[b] ? a : b)
    : null

  if (dominantColor && card.color === dominantColor) {
    value += genome.discardColorBonus
  }

  // Mermaid special value
  if (card.name === 'Mermaid') {
    const currentMermaids = countCardsByName(hand, 'Mermaid')
    if (currentMermaids === 3) {
      value += 100 // 4 mermaids = instant win!
    } else {
      value += genome.mermaidPriority * 2
    }
  }

  // Collection priority
  if (card.name === 'Sailor') {
    const sailorCount = countCardsByName(hand, 'Sailor')
    if (sailorCount === 1) {
      value += genome.sailorPriority * 3 // Getting second sailor = 5 points
    }
  }

  return value
}

/**
 * Evaluate and choose best pair to play
 */
function evaluateBestPair(genome, hand, playedPairs, turnCount) {
  const pairs = findAllPairs(hand)

  if (pairs.length === 0) {
    return null
  }

  // Evaluate each pair
  const evaluations = pairs.map(pair => {
    let value = 0

    // Base value from pair effect
    const effect = getPairEffect(pair[0], pair[1])
    switch (effect) {
      case 'draw_blind':
        value += genome.fishPairBonus
        break
      case 'draw_discard':
        value += genome.crabPairBonus
        break
      case 'extra_turn':
        value += genome.sailboatPairBonus
        break
      case 'steal_card':
        value += genome.stealPairBonus
        break
    }

    // Game phase modifier
    const earlyGame = turnCount <= genome.earlyGamePairThreshold
    if (earlyGame) {
      value *= genome.earlyGamePairBonus
    } else {
      value *= genome.lateGamePairBonus
    }

    return { pair, value, effect }
  })

  // Sort by value and check if best pair exceeds minimum
  evaluations.sort((a, b) => b.value - a.value)
  const best = evaluations[0]

  if (best.value >= genome.minPairValue) {
    return best
  }

  return null
}

/**
 * Decide whether to declare and which mode
 */
function evaluateDeclaration(genome, gameState, playerId) {
  const player = gameState.players[playerId]
  const hand = player.hand || []
  const playedPairs = player.playedPairs || []
  const turnCount = gameState.turnCount || 0

  // Calculate current score using the game's calculateScore
  const score = calculateScore(hand, playedPairs, false)

  // Check minimum threshold
  if (score.total < genome.declareThreshold) {
    return { shouldDeclare: false }
  }

  // Analyze opponents
  const playerIds = gameState.playerOrder || Object.keys(gameState.players)
  let maxOpponentScore = 0
  let maxOpponentHandSize = 0

  playerIds.forEach(id => {
    if (id !== playerId) {
      const opp = gameState.players[id]
      if (opp) {
        const oppScore = calculateScore(opp.hand || [], opp.playedPairs || [], false)
        maxOpponentScore = Math.max(maxOpponentScore, oppScore.total)
        maxOpponentHandSize = Math.max(maxOpponentHandSize, (opp.hand || []).length)
      }
    }
  })

  // Adjust threshold based on opponent state
  const scoreLead = score.total - maxOpponentScore
  const handSizePenalty = maxOpponentHandSize * genome.opponentHandSizeWeight * 0.5

  // Risk assessment
  const riskFactor = 1 - genome.riskTolerance
  const adjustedThreshold = genome.declareThreshold + handSizePenalty * riskFactor

  if (score.total < adjustedThreshold) {
    return { shouldDeclare: false }
  }

  // Decide Stop vs Last Chance
  let declareType
  if (turnCount > genome.stopVsLastChanceTurnThreshold) {
    declareType = 'stop'
  } else if (scoreLead >= genome.scoreDifferenceForStop) {
    declareType = 'stop'
  } else {
    declareType = 'last_chance'
  }

  return {
    shouldDeclare: true,
    type: declareType,
    score: score.total,
    scoreLead
  }
}

/**
 * Make AI decision based on genome
 */
export function makeParametricDecision(genome, gameState, playerId) {
  const player = gameState.players[playerId]

  if (!player) {
    return { action: 'end_turn' }
  }

  const phase = gameState.turnPhase

  // Draw phase
  if (phase === 'draw') {
    const source = evaluateDrawSource(genome, gameState, playerId)
    return {
      action: 'draw',
      source
    }
  }

  // Pair phase
  if (phase === 'pair') {
    const hand = player.hand || []
    const playedPairs = player.playedPairs || []
    const turnCount = gameState.turnCount || 0

    const pairEval = evaluateBestPair(genome, hand, playedPairs, turnCount)

    if (pairEval) {
      return {
        action: 'play_pair',
        cards: pairEval.pair,
        effect: pairEval.effect
      }
    }

    return { action: 'end_turn' }
  }

  // Declare phase
  if (phase === 'declare') {
    const declareEval = evaluateDeclaration(genome, gameState, playerId)

    if (declareEval.shouldDeclare) {
      return {
        action: 'declare',
        type: declareEval.type
      }
    }

    return { action: 'end_turn' }
  }

  // Default
  return { action: 'end_turn' }
}

export default {
  makeParametricDecision
}
