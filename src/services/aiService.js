/**
 * AI Service
 *
 * Implements AI opponents with three difficulty levels:
 * - Easy: Random decisions with basic declaration logic
 * - Medium: Basic strategy (play pairs, collect colors, collection awareness)
 * - Hard: Advanced strategy (score calculation, blocking, combo planning)
 *
 * Version 2.1 - Enhanced with:
 * - Multi-pair playing capability
 * - Collection card value evaluation
 * - Multiplier synergy awareness
 * - Smart declaration based on turn count:
 *   - Score >= 7 AND turnCount > 10: Declare STOP (到此為止)
 *   - Score >= 7 AND turnCount <= 10: Declare LAST_CHANCE (最後機會)
 */

import { isValidPair, filterCardsByName, countCardsByName } from '../utils/cardHelpers.js'
import { calculateScore } from './scoreService.js'
import { AI_TIMING } from '../utils/constants.js'

// ============================================================================
// HELPER FUNCTIONS - Collection and Multiplier Evaluation
// ============================================================================

/**
 * Evaluate the potential value of collecting more of a specific collection card
 *
 * Collection card scoring rules:
 * - Shell: (count-1) * 2  -> 1=0, 2=2, 3=4, 4=6...
 * - Octopus: (count-1) * 3 -> 1=0, 2=3, 3=6, 4=9...
 * - Penguin: count * 2 - 1 -> 1=1, 2=3, 3=5...
 * - Sailor: 1=0, 2+=5
 *
 * @param {Array} hand - Current hand cards
 * @param {string} cardName - Name of the collection card to evaluate
 * @returns {Object} { currentValue, nextValue, marginalGain, priority }
 */
export function evaluateCollectionValue(hand, cardName) {
  const currentCount = hand.filter(c => c.name === cardName).length

  let currentValue = 0
  let nextValue = 0
  let priority = 0

  switch (cardName) {
    case 'Shell':
      currentValue = currentCount > 0 ? (currentCount - 1) * 2 : 0
      nextValue = currentCount >= 0 ? currentCount * 2 : 0
      // Higher priority when we already have some shells
      priority = currentCount >= 1 ? 3 : 1
      break

    case 'Octopus':
      currentValue = currentCount > 0 ? (currentCount - 1) * 3 : 0
      nextValue = currentCount >= 0 ? currentCount * 3 : 0
      // Higher priority due to better scaling
      priority = currentCount >= 1 ? 4 : 2
      break

    case 'Penguin':
      currentValue = currentCount > 0 ? currentCount * 2 - 1 : 0
      nextValue = (currentCount + 1) * 2 - 1
      // Steady value increase
      priority = 2
      break

    case 'Sailor':
      currentValue = currentCount >= 2 ? 5 : 0
      nextValue = currentCount >= 1 ? 5 : 0
      // High priority if we have 1 (getting second = 5 points!)
      priority = currentCount === 1 ? 5 : (currentCount === 0 ? 1 : 0)
      break

    default:
      return { currentValue: 0, nextValue: 0, marginalGain: 0, priority: 0 }
  }

  const marginalGain = nextValue - currentValue

  return {
    currentValue,
    nextValue,
    marginalGain,
    priority,
    currentCount
  }
}

/**
 * Evaluate multiplier synergy value for a card
 *
 * Multiplier cards and their targets:
 * - Lighthouse: +1 per Sailboat
 * - FishSchool: +1 per Fish
 * - PenguinColony: +2 per Penguin
 * - Captain: +3 per Sailor
 *
 * @param {Array} hand - Current hand cards
 * @param {Object} card - Card to evaluate
 * @returns {Object} { synergyValue, hasMultiplier, targetCount, multiplierBonus }
 */
export function evaluateMultiplierSynergy(hand, card) {
  const result = {
    synergyValue: 0,
    hasMultiplier: false,
    targetCount: 0,
    multiplierBonus: 0,
    explanation: ''
  }

  if (!card) return result

  const cardName = card.name
  const allCards = [...hand]

  // Check if this card is a multiplier
  const multiplierMap = {
    'Lighthouse': { target: 'Sailboat', bonus: 1 },
    'FishSchool': { target: 'Fish', bonus: 1 },
    'PenguinColony': { target: 'Penguin', bonus: 2 },
    'Captain': { target: 'Sailor', bonus: 3 }
  }

  // Check if this card is a target for a multiplier we have
  const targetToMultiplier = {
    'Sailboat': { multiplier: 'Lighthouse', bonus: 1 },
    'Fish': { multiplier: 'FishSchool', bonus: 1 },
    'Penguin': { multiplier: 'PenguinColony', bonus: 2 },
    'Sailor': { multiplier: 'Captain', bonus: 3 }
  }

  // Case 1: Card is a multiplier - calculate potential value based on existing targets
  if (multiplierMap[cardName]) {
    const { target, bonus } = multiplierMap[cardName]
    const targetCount = allCards.filter(c => c.name === target).length
    result.hasMultiplier = true
    result.targetCount = targetCount
    result.multiplierBonus = targetCount * bonus
    result.synergyValue = targetCount * bonus
    result.explanation = `${cardName} gives +${bonus} per ${target} (have ${targetCount})`
  }

  // Case 2: Card is a target - check if we have the multiplier
  if (targetToMultiplier[cardName]) {
    const { multiplier, bonus } = targetToMultiplier[cardName]
    const hasMultiplier = allCards.some(c => c.name === multiplier)
    if (hasMultiplier) {
      result.hasMultiplier = true
      result.multiplierBonus = bonus
      result.synergyValue += bonus
      result.explanation = `${cardName} gets +${bonus} from ${multiplier}`
    }
  }

  return result
}

/**
 * Determine if AI should continue playing more pairs in the same turn
 *
 * Considers:
 * - Remaining pairs in hand
 * - Value of each remaining pair
 * - Special effects that might be beneficial
 *
 * @param {Array} hand - Current hand after playing some pairs
 * @param {Array} playedPairs - Already played pairs this game
 * @param {Array} pairsPlayedThisTurn - Pairs played this turn
 * @returns {Object} { shouldPlay, bestPair, reason }
 */
export function shouldPlayMorePairs(hand, playedPairs, pairsPlayedThisTurn = []) {
  console.log('[shouldPlayMorePairs] Checking hand:', hand?.map(c => c.name))
  const pairs = findAllPairs(hand)
  console.log('[shouldPlayMorePairs] Found pairs:', pairs.length, pairs.map(p => `${p[0].name}+${p[1].name}`))

  if (pairs.length === 0) {
    console.log('[shouldPlayMorePairs] No pairs found')
    return { shouldPlay: false, bestPair: null, reason: 'No more pairs available' }
  }

  // Evaluate remaining pairs
  const pairEvaluations = pairs.map(pair => {
    const value = calculatePairValue(pair, hand, playedPairs)

    // Effect bonuses
    let effectBonus = 0
    let effectName = ''

    if (pair[0].name === 'Fish' && pair[1].name === 'Fish') {
      effectBonus = 2 // draw_blind - get a new card
      effectName = 'draw_blind'
    }
    if (pair[0].name === 'Crab' && pair[1].name === 'Crab') {
      effectBonus = 3 // draw_discard - choose from discard
      effectName = 'draw_discard'
    }
    if (pair[0].name === 'Sailboat' && pair[1].name === 'Sailboat') {
      effectBonus = 4 // extra_turn - very valuable
      effectName = 'extra_turn'
    }
    if ((pair[0].name === 'Shark' && pair[1].name === 'Swimmer') ||
        (pair[0].name === 'Swimmer' && pair[1].name === 'Shark')) {
      effectBonus = 3 // steal_card
      effectName = 'steal_card'
    }

    return {
      pair,
      value,
      effectBonus,
      effectName,
      totalValue: value + effectBonus
    }
  })

  // Sort by total value
  pairEvaluations.sort((a, b) => b.totalValue - a.totalValue)

  const best = pairEvaluations[0]

  // Play if total value is positive, or if we get a beneficial effect
  if (best.totalValue > 0 || best.effectBonus >= 2) {
    return {
      shouldPlay: true,
      bestPair: best.pair,
      reason: `Value: ${best.value}, Effect: ${best.effectName || 'none'} (+${best.effectBonus})`,
      evaluation: best
    }
  }

  return {
    shouldPlay: false,
    bestPair: null,
    reason: `Best pair value (${best.totalValue}) too low`
  }
}

/**
 * Find all valid pairs in hand
 *
 * @param {Array} hand - Array of cards
 * @returns {Array} Array of valid pair combinations
 */
function findAllPairs(hand) {
  const pairs = []

  for (let i = 0; i < hand.length; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      if (isValidPair(hand[i], hand[j])) {
        pairs.push([hand[i], hand[j]])
      }
    }
  }

  return pairs
}

/**
 * Check if a card can form a pair with any card in hand
 *
 * @param {Object} card - Card to check
 * @param {Array} hand - Player's hand
 * @returns {Object|null} The matching card in hand, or null if no match
 */
function canFormPairWith(card, hand) {
  if (!card || !hand || hand.length === 0) return null

  for (const handCard of hand) {
    if (isValidPair(card, handCard)) {
      return handCard
    }
  }
  return null
}

/**
 * Calculate value of playing a pair
 *
 * @param {Array} pair - Two cards
 * @param {Array} hand - Current hand
 * @param {Array} playedPairs - Already played pairs
 * @returns {number} Estimated value score
 */
function calculatePairValue(pair, hand, playedPairs) {
  // Simulate playing this pair
  const simulatedHand = hand.filter(c => !pair.includes(c))
  const simulatedPairs = [...playedPairs, { cards: pair }]

  // Calculate score difference
  const currentScore = calculateScore(hand, playedPairs, { includeColorBonus: false })
  const newScore = calculateScore(simulatedHand, simulatedPairs, { includeColorBonus: false })

  return newScore.total - currentScore.total
}

/**
 * Evaluate a discard pile card for collection/multiplier potential
 *
 * @param {Object} card - Card from discard pile
 * @param {Array} hand - Current hand
 * @returns {Object} { value, reason }
 */
function evaluateDiscardCard(card, hand) {
  if (!card) return { value: 0, reason: 'No card' }

  let value = card.value || 0
  let reasons = []

  // Check pair potential
  const canPair = canFormPairWith(card, hand)
  if (canPair) {
    value += 3
    reasons.push(`can pair with ${canPair.name}`)
  }

  // Check collection value
  const collectionNames = ['Shell', 'Octopus', 'Penguin', 'Sailor']
  if (collectionNames.includes(card.name)) {
    const collectionEval = evaluateCollectionValue(hand, card.name)
    value += collectionEval.marginalGain
    if (collectionEval.marginalGain > 0) {
      reasons.push(`collection gain: +${collectionEval.marginalGain}`)
    }
  }

  // Check multiplier synergy
  const multiplierEval = evaluateMultiplierSynergy(hand, card)
  if (multiplierEval.synergyValue > 0) {
    value += multiplierEval.synergyValue
    reasons.push(multiplierEval.explanation)
  }

  return {
    value,
    reason: reasons.length > 0 ? reasons.join(', ') : 'base value'
  }
}

// ============================================================================
// AI DECISION FUNCTIONS
// ============================================================================

/**
 * Easy AI: Makes random decisions with basic declaration logic
 *
 * @param {Object} gameState - Current game state
 * @param {string} playerId - AI player ID
 * @returns {Object} AI decision
 */
export function makeEasyDecision(gameState, playerId) {
  const player = gameState.players[playerId]

  // Draw phase: Random choice between deck and discard
  if (gameState.turnPhase === 'draw') {
    const options = ['deck']

    if (gameState.discardLeft.length > 0) options.push('discard_left')
    if (gameState.discardRight.length > 0) options.push('discard_right')

    const choice = options[Math.floor(Math.random() * options.length)]

    return {
      action: 'draw',
      source: choice,
      delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
    }
  }

  // Pair phase: Play random pair or pass
  if (gameState.turnPhase === 'pair') {
    const pairs = findAllPairs(player.hand)

    // 50% chance to play pair if available
    if (pairs.length > 0 && Math.random() > 0.5) {
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)]
      return {
        action: 'play_pair',
        cards: randomPair,
        delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
      }
    }

    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY
    }
  }

  // Declare phase: Smart declaration based on turn count
  if (gameState.turnPhase === 'declare') {
    const score = calculateScore(player.hand, player.playedPairs, { includeColorBonus: false })
    const turnCount = gameState.turnCount || 0

    if (score.total >= 7) {
      // Turn count > 10: STOP (到此為止), Turn count <= 10: LAST_CHANCE (最後機會)
      const declareType = turnCount > 10 ? 'stop' : 'last_chance'
      console.log(`[AI Easy] Score ${score.total} >= 7, turnCount ${turnCount}, declaring ${declareType.toUpperCase()}`)
      return {
        action: 'declare',
        type: declareType,
        delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
      }
    }

    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY
    }
  }

  return {
    action: 'end_turn',
    delay: AI_TIMING.MIN_DELAY
  }
}

/**
 * Medium AI: Uses basic strategy with collection awareness
 *
 * Strategy:
 * - Draw: Prioritize pairs > collection cards > multiplier synergy > colors
 * - Pair: Play multiple valuable pairs in one turn
 * - Declare: Based on turn count (>10: STOP, <=10: LAST_CHANCE) when score >= 7
 *
 * @param {Object} gameState - Current game state
 * @param {string} playerId - AI player ID
 * @returns {Object} AI decision
 */
export function makeMediumDecision(gameState, playerId) {
  const player = gameState.players[playerId]
  const hand = player?.hand || []
  const playedPairs = player?.playedPairs || []

  // Draw phase: Prioritize cards that can form pairs, then collections, then colors
  if (gameState.turnPhase === 'draw') {
    const discardLeft = gameState.discardLeft || []
    const discardRight = gameState.discardRight || []
    const leftTop = discardLeft[discardLeft.length - 1]
    const rightTop = discardRight[discardRight.length - 1]

    // Evaluate both discard options
    const leftEval = evaluateDiscardCard(leftTop, hand)
    const rightEval = evaluateDiscardCard(rightTop, hand)

    console.log(`[AI Medium] Evaluating draw options:`)
    console.log(`  - Deck: unknown (base value 3)`)
    if (leftTop) console.log(`  - Left (${leftTop.name}): value ${leftEval.value} (${leftEval.reason})`)
    if (rightTop) console.log(`  - Right (${rightTop.name}): value ${rightEval.value} (${rightEval.reason})`)

    // PRIORITY 1: High value discard cards (pair potential, collection gain)
    const deckBaseValue = 3 // Unknown card base value

    if (leftEval.value > deckBaseValue && leftEval.value >= rightEval.value) {
      console.log(`[AI Medium] Taking ${leftTop.name} from left discard (value: ${leftEval.value})`)
      return {
        action: 'draw',
        source: 'discard_left',
        delay: AI_TIMING.MIN_DELAY + Math.random() * 500
      }
    }

    if (rightEval.value > deckBaseValue && rightEval.value > leftEval.value) {
      console.log(`[AI Medium] Taking ${rightTop.name} from right discard (value: ${rightEval.value})`)
      return {
        action: 'draw',
        source: 'discard_right',
        delay: AI_TIMING.MIN_DELAY + Math.random() * 500
      }
    }

    // PRIORITY 2: Color matching for color bonus
    const colorCounts = {}
    hand.forEach(card => {
      if (card.color && card.color !== 'multicolor') {
        colorCounts[card.color] = (colorCounts[card.color] || 0) + 1
      }
    })

    const dominantColor = Object.keys(colorCounts).length > 0
      ? Object.keys(colorCounts).reduce((a, b) =>
          colorCounts[a] > colorCounts[b] ? a : b, null)
      : null

    if (leftTop && dominantColor && leftTop.color === dominantColor && colorCounts[dominantColor] >= 2) {
      console.log(`[AI Medium] Taking ${leftTop.name} for color bonus (${dominantColor})`)
      return {
        action: 'draw',
        source: 'discard_left',
        delay: AI_TIMING.MIN_DELAY + Math.random() * 500
      }
    }

    if (rightTop && dominantColor && rightTop.color === dominantColor && colorCounts[dominantColor] >= 2) {
      console.log(`[AI Medium] Taking ${rightTop.name} for color bonus (${dominantColor})`)
      return {
        action: 'draw',
        source: 'discard_right',
        delay: AI_TIMING.MIN_DELAY + Math.random() * 500
      }
    }

    // PRIORITY 3: Draw from deck
    console.log('[AI Medium] No good discard options, drawing from deck')
    return {
      action: 'draw',
      source: 'deck',
      delay: AI_TIMING.MIN_DELAY + Math.random() * 500
    }
  }

  // Pair phase: Play multiple valuable pairs
  if (gameState.turnPhase === 'pair') {
    console.log(`[AI Medium] Pair phase - hand:`, hand?.map(c => c.name))
    console.log(`[AI Medium] Pair phase - playedPairs count:`, playedPairs?.length || 0)

    const pairResult = shouldPlayMorePairs(hand, playedPairs, [])
    console.log(`[AI Medium] shouldPlayMorePairs result:`, pairResult)

    if (pairResult.shouldPlay && pairResult.bestPair) {
      console.log(`[AI Medium] Playing pair: ${pairResult.bestPair[0].name} + ${pairResult.bestPair[1].name}`)
      console.log(`  Reason: ${pairResult.reason}`)

      return {
        action: 'play_pair',
        cards: pairResult.bestPair,
        delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
      }
    }

    console.log(`[AI Medium] Not playing pair - ${pairResult.reason}`)
    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY + 300
    }
  }

  // Declare phase: Smart declaration based on turn count
  if (gameState.turnPhase === 'declare') {
    const score = calculateScore(hand, playedPairs, { includeColorBonus: false })
    const turnCount = gameState.turnCount || 0
    console.log(`[AI Medium] Current score: ${score.total} (base: ${score.base}, pairs: ${score.pairs}, multipliers: ${score.multipliers}, mermaids: ${score.mermaids}), turnCount: ${turnCount}`)

    if (score.total >= 7) {
      // Turn count > 10: STOP (到此為止), Turn count <= 10: LAST_CHANCE (最後機會)
      const declareType = turnCount > 10 ? 'stop' : 'last_chance'
      console.log(`[AI Medium] Score ${score.total} >= 7, turnCount ${turnCount}, declaring ${declareType.toUpperCase()}`)
      return {
        action: 'declare',
        type: declareType,
        delay: AI_TIMING.MIN_DELAY + 500
      }
    }

    console.log('[AI Medium] Score too low to declare, continuing game')
    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY + 300
    }
  }

  return {
    action: 'end_turn',
    delay: AI_TIMING.MIN_DELAY
  }
}

/**
 * Hard AI: Uses advanced strategy with combo planning
 *
 * Strategy:
 * - Draw: Deep analysis of all options including future potential
 * - Pair: Optimize pair order for maximum effect chain
 * - Declare: Based on turn count (>10: STOP, <=10: LAST_CHANCE) when score >= 7, with opponent awareness
 *
 * @param {Object} gameState - Current game state
 * @param {string} playerId - AI player ID
 * @returns {Object} AI decision
 */
export function makeHardDecision(gameState, playerId) {
  const player = gameState.players[playerId]
  const hand = player?.hand || []
  const playedPairs = player?.playedPairs || []

  // Draw phase: Comprehensive analysis
  if (gameState.turnPhase === 'draw') {
    const options = []

    // Option 1: Draw from deck (unknown card with potential)
    // Calculate expected value based on remaining deck composition
    const deckValue = calculateDeckExpectedValue(hand, gameState)
    options.push({
      source: 'deck',
      score: deckValue,
      reason: `Unknown card (expected value: ${deckValue.toFixed(1)})`
    })

    // Option 2: Take from left discard
    const leftTop = (gameState.discardLeft && gameState.discardLeft.length > 0)
      ? gameState.discardLeft[gameState.discardLeft.length - 1]
      : null
    if (leftTop) {
      const leftEval = evaluateDiscardCardAdvanced(leftTop, hand, playedPairs, gameState)
      options.push({
        source: 'discard_left',
        score: leftEval.value,
        reason: `Left (${leftTop.name}): ${leftEval.reason}`
      })
    }

    // Option 3: Take from right discard
    const rightTop = (gameState.discardRight && gameState.discardRight.length > 0)
      ? gameState.discardRight[gameState.discardRight.length - 1]
      : null
    if (rightTop) {
      const rightEval = evaluateDiscardCardAdvanced(rightTop, hand, playedPairs, gameState)
      options.push({
        source: 'discard_right',
        score: rightEval.value,
        reason: `Right (${rightTop.name}): ${rightEval.reason}`
      })
    }

    // Sort and choose best
    options.sort((a, b) => b.score - a.score)

    console.log('[AI Hard] Draw analysis:')
    options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt.reason}`))
    console.log(`  -> Choosing: ${options[0].source}`)

    return {
      action: 'draw',
      source: options[0].source,
      delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
    }
  }

  // Pair phase: Optimize pair sequence for best effects
  if (gameState.turnPhase === 'pair') {
    const pairResult = shouldPlayMorePairs(hand, playedPairs, [])

    if (pairResult.shouldPlay && pairResult.bestPair) {
      console.log(`[AI Hard] Playing pair: ${pairResult.bestPair[0].name} + ${pairResult.bestPair[1].name}`)
      console.log(`  Analysis: ${pairResult.reason}`)

      return {
        action: 'play_pair',
        cards: pairResult.bestPair,
        delay: AI_TIMING.MIN_DELAY + Math.random() * (AI_TIMING.MAX_DELAY - AI_TIMING.MIN_DELAY)
      }
    }

    console.log(`[AI Hard] No beneficial pairs to play: ${pairResult.reason}`)
    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY + 500
    }
  }

  // Declare phase: Strategic declaration with opponent awareness and turn count
  if (gameState.turnPhase === 'declare') {
    const score = calculateScore(hand, playedPairs, { includeColorBonus: false })
    const turnCount = gameState.turnCount || 0

    // Calculate opponents' visible scores
    const opponentAnalysis = analyzeOpponents(gameState, playerId)

    console.log(`[AI Hard] Score analysis:`)
    console.log(`  My score: ${score.total}`)
    console.log(`  Opponent max: ${opponentAnalysis.maxScore}, avg: ${opponentAnalysis.avgScore.toFixed(1)}`)
    console.log(`  Turn count: ${turnCount}`)

    if (score.total >= 7) {
      // Turn count > 10: STOP (到此為止), Turn count <= 10: LAST_CHANCE (最後機會)
      const declareType = turnCount > 10 ? 'stop' : 'last_chance'
      console.log(`[AI Hard] Score ${score.total} >= 7, turnCount ${turnCount}, declaring ${declareType.toUpperCase()}`)

      return {
        action: 'declare',
        type: declareType,
        delay: AI_TIMING.MIN_DELAY + 800
      }
    }

    console.log('[AI Hard] Score too low, continuing to build hand')
    return {
      action: 'end_turn',
      delay: AI_TIMING.MIN_DELAY + 500
    }
  }

  return {
    action: 'end_turn',
    delay: AI_TIMING.MIN_DELAY
  }
}

/**
 * Calculate expected value from drawing a random card from deck
 * Based on remaining cards and current hand synergies
 *
 * @param {Array} hand - Current hand
 * @param {Object} gameState - Game state
 * @returns {number} Expected value
 */
function calculateDeckExpectedValue(hand, gameState) {
  // Base expected value
  let expectedValue = 3

  // Adjust based on hand composition - potential for collection completion
  const collectionNames = ['Shell', 'Octopus', 'Penguin', 'Sailor']
  collectionNames.forEach(name => {
    const eval_ = evaluateCollectionValue(hand, name)
    if (eval_.priority >= 3) {
      expectedValue += 0.5 // Higher chance of beneficial draw
    }
  })

  // Check for multiplier potential
  const hasLighthouse = hand.some(c => c.name === 'Lighthouse')
  const hasFishSchool = hand.some(c => c.name === 'FishSchool')
  const hasPenguinColony = hand.some(c => c.name === 'PenguinColony')
  const hasCaptain = hand.some(c => c.name === 'Captain')

  if (hasLighthouse) expectedValue += 0.3 // Might draw Sailboat
  if (hasFishSchool) expectedValue += 0.3 // Might draw Fish
  if (hasPenguinColony) expectedValue += 0.2 // Might draw Penguin
  if (hasCaptain) expectedValue += 0.2 // Might draw Sailor

  return expectedValue
}

/**
 * Advanced evaluation of a discard pile card
 * Considers immediate value, combo potential, and opponent blocking
 *
 * @param {Object} card - Card to evaluate
 * @param {Array} hand - Current hand
 * @param {Array} playedPairs - Played pairs
 * @param {Object} gameState - Game state
 * @returns {Object} { value, reason }
 */
function evaluateDiscardCardAdvanced(card, hand, playedPairs, gameState) {
  if (!card) return { value: 0, reason: 'No card' }

  let value = card.value || 0
  const reasons = []

  // Immediate pair potential
  const pairMatch = canFormPairWith(card, hand)
  if (pairMatch) {
    // Bonus based on pair effect
    let pairBonus = 3
    if (card.name === 'Fish' || pairMatch.name === 'Fish') pairBonus = 4
    if (card.name === 'Crab' || pairMatch.name === 'Crab') pairBonus = 5
    if (card.name === 'Sailboat' || pairMatch.name === 'Sailboat') pairBonus = 6
    if ((card.name === 'Shark' && pairMatch.name === 'Swimmer') ||
        (card.name === 'Swimmer' && pairMatch.name === 'Shark')) pairBonus = 5

    value += pairBonus
    reasons.push(`pairs with ${pairMatch.name} (+${pairBonus})`)
  }

  // Collection value
  const collectionNames = ['Shell', 'Octopus', 'Penguin', 'Sailor']
  if (collectionNames.includes(card.name)) {
    const collectionEval = evaluateCollectionValue(hand, card.name)
    if (collectionEval.marginalGain > 0) {
      value += collectionEval.marginalGain
      reasons.push(`collection: +${collectionEval.marginalGain}`)
    }
    // Extra bonus for high priority collections
    if (collectionEval.priority >= 4) {
      value += 1
      reasons.push('high priority collection')
    }
  }

  // Multiplier synergy
  const multiplierEval = evaluateMultiplierSynergy(hand, card)
  if (multiplierEval.synergyValue > 0) {
    value += multiplierEval.synergyValue
    reasons.push(multiplierEval.explanation)
  }

  // Future multiplier potential (e.g., taking Lighthouse when we have Sailboats)
  const multiplierMap = {
    'Lighthouse': 'Sailboat',
    'FishSchool': 'Fish',
    'PenguinColony': 'Penguin',
    'Captain': 'Sailor'
  }

  if (multiplierMap[card.name]) {
    const targetCount = hand.filter(c => c.name === multiplierMap[card.name]).length
    if (targetCount > 0) {
      const futureValue = targetCount * (card.name === 'PenguinColony' ? 2 : card.name === 'Captain' ? 3 : 1)
      value += futureValue
      reasons.push(`multiplies ${targetCount} ${multiplierMap[card.name]}(s) for +${futureValue}`)
    }
  }

  // Mermaid special value
  if (card.name === 'Mermaid') {
    const currentMermaids = hand.filter(c => c.name === 'Mermaid').length
    if (currentMermaids === 3) {
      value += 100 // 4 mermaids = instant win!
      reasons.push('4th mermaid = WIN!')
    } else {
      // Value based on color diversity
      const colorCounts = {}
      hand.forEach(c => {
        if (c.color && c.color !== 'multicolor') {
          colorCounts[c.color] = (colorCounts[c.color] || 0) + 1
        }
      })
      const sortedCounts = Object.values(colorCounts).sort((a, b) => b - a)
      const mermaidValue = sortedCounts[currentMermaids] || 0
      value += mermaidValue
      reasons.push(`mermaid value: +${mermaidValue}`)
    }
  }

  return {
    value,
    reason: reasons.length > 0 ? reasons.join(', ') : `base value: ${card.value || 0}`
  }
}

/**
 * Analyze opponent scores and hand sizes
 *
 * @param {Object} gameState - Game state
 * @param {string} playerId - Current AI player ID
 * @returns {Object} Opponent analysis
 */
function analyzeOpponents(gameState, playerId) {
  // 使用固定的玩家順序數組，而不是 Object.keys
  const opponents = (gameState.playerOrder || Object.keys(gameState.players))
    .filter(id => id !== playerId)
    .map(id => {
      const opp = gameState.players[id]
      const score = calculateScore(opp.hand || [], opp.playedPairs || [], { includeColorBonus: false })
      return {
        id,
        score: score.total,
        handSize: (opp.hand || []).length,
        pairCount: (opp.playedPairs || []).length
      }
    })

  const scores = opponents.map(o => o.score)

  return {
    opponents,
    maxScore: scores.length > 0 ? Math.max(...scores) : 0,
    avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    maxHandSize: opponents.length > 0 ? Math.max(...opponents.map(o => o.handSize)) : 0
  }
}

/**
 * Make AI decision based on difficulty
 *
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {Object} gameState - Current game state
 * @param {string} playerId - AI player ID
 * @returns {Object} AI decision
 */
export function makeAIDecision(difficulty, gameState, playerId) {
  console.log(`[AI] Making ${difficulty} decision for player ${playerId}, phase: ${gameState.turnPhase}`)

  switch (difficulty) {
    case 'easy':
      return makeEasyDecision(gameState, playerId)
    case 'medium':
      return makeMediumDecision(gameState, playerId)
    case 'hard':
      return makeHardDecision(gameState, playerId)
    default:
      return makeEasyDecision(gameState, playerId)
  }
}

export default {
  makeAIDecision,
  makeEasyDecision,
  makeMediumDecision,
  makeHardDecision,
  // Export helper functions for testing
  evaluateCollectionValue,
  evaluateMultiplierSynergy,
  shouldPlayMorePairs
}
