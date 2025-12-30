/**
 * Fast Game Simulator
 *
 * Runs complete games without UI or Firebase.
 * Optimized for speed - used during AI training.
 *
 * Features:
 * - Pure JavaScript, no external dependencies
 * - Deterministic when given same seed
 * - Logs game events for analysis
 */

import { makeDecision, calculateScore, isValidPair, getPairEffect } from './ParametricAI.js'

/**
 * Card definitions (simplified from cards.js)
 */
const CARD_DEFINITIONS = [
  // Fish - 10 cards
  ...Array(10).fill(null).map((_, i) => ({
    id: `fish_${i + 1}`, name: 'Fish', type: 'pair_effect', value: 1, pairEffect: 'draw_blind'
  })),
  // Crab - 10 cards
  ...Array(10).fill(null).map((_, i) => ({
    id: `crab_${i + 1}`, name: 'Crab', type: 'pair_effect', value: 1, pairEffect: 'draw_discard'
  })),
  // Shell - 8 cards
  ...Array(8).fill(null).map((_, i) => ({
    id: `shell_${i + 1}`, name: 'Shell', type: 'collection', value: 0
  })),
  // Starfish - 8 cards
  ...Array(8).fill(null).map((_, i) => ({
    id: `starfish_${i + 1}`, name: 'Starfish', type: 'collection', value: 2
  })),
  // Sailboat - 6 cards
  ...Array(6).fill(null).map((_, i) => ({
    id: `sailboat_${i + 1}`, name: 'Sailboat', type: 'pair_effect', value: 1, pairEffect: 'extra_turn'
  })),
  // Shark - 6 cards
  ...Array(6).fill(null).map((_, i) => ({
    id: `shark_${i + 1}`, name: 'Shark', type: 'pair_effect', value: 2, pairEffect: 'steal_card'
  })),
  // Swimmer - 6 cards
  ...Array(6).fill(null).map((_, i) => ({
    id: `swimmer_${i + 1}`, name: 'Swimmer', type: 'pair_effect', value: 1, pairEffect: 'steal_card'
  })),
  // Sailor - 4 cards
  ...Array(4).fill(null).map((_, i) => ({
    id: `sailor_${i + 1}`, name: 'Sailor', type: 'collection', value: 0
  })),
  // Octopus - 4 cards
  ...Array(4).fill(null).map((_, i) => ({
    id: `octopus_${i + 1}`, name: 'Octopus', type: 'collection', value: 0
  })),
  // Penguin - 4 cards
  ...Array(4).fill(null).map((_, i) => ({
    id: `penguin_${i + 1}`, name: 'Penguin', type: 'collection', value: 0
  })),
  // Lighthouse - 2 cards
  ...Array(2).fill(null).map((_, i) => ({
    id: `lighthouse_${i + 1}`, name: 'Lighthouse', type: 'multiplier', value: 1
  })),
  // FishSchool - 2 cards
  ...Array(2).fill(null).map((_, i) => ({
    id: `fishschool_${i + 1}`, name: 'FishSchool', type: 'multiplier', value: 1
  })),
  // PenguinColony - 2 cards
  ...Array(2).fill(null).map((_, i) => ({
    id: `penguincolony_${i + 1}`, name: 'PenguinColony', type: 'multiplier', value: 2
  })),
  // Captain - 2 cards
  ...Array(2).fill(null).map((_, i) => ({
    id: `captain_${i + 1}`, name: 'Captain', type: 'multiplier', value: 2
  })),
  // Mermaid - 4 cards
  ...Array(4).fill(null).map((_, i) => ({
    id: `mermaid_${i + 1}`, name: 'Mermaid', type: 'special', value: 0
  }))
]

/**
 * Available colors for random assignment
 */
const COLORS = ['blue', 'red', 'green', 'yellow', 'gray', 'purple', 'orange']

/**
 * Fisher-Yates shuffle
 */
function shuffle(array, rng = Math.random) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Simple seeded random number generator
 */
function createRng(seed) {
  let s = seed
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

/**
 * Create and shuffle a deck with random colors
 */
function createDeck(rng = Math.random) {
  const deck = CARD_DEFINITIONS.map(card => ({
    ...card,
    color: COLORS[Math.floor(rng() * COLORS.length)]
  }))
  return shuffle(deck, rng)
}

/**
 * Game Simulator Class
 */
export class GameSimulator {
  constructor(options = {}) {
    this.maxTurns = options.maxTurns || 100
    this.startingHandSize = options.startingHandSize || 2
    this.enableLogging = options.enableLogging || false
    this.seed = options.seed || Date.now()
  }

  /**
   * Initialize a new game
   */
  initializeGame(genomes, playerCount = 2) {
    const rng = createRng(this.seed)
    const deck = createDeck(rng)

    const playerIds = Array.from({ length: playerCount }, (_, i) => `player_${i}`)
    const hands = {}
    const playedPairs = {}

    // Deal starting hands
    let deckIndex = 0
    playerIds.forEach(playerId => {
      hands[playerId] = deck.slice(deckIndex, deckIndex + this.startingHandSize)
      deckIndex += this.startingHandSize
    })

    // Initialize discard piles
    const discardLeft = [deck[deckIndex++]]
    const discardRight = [deck[deckIndex++]]
    const remainingDeck = deck.slice(deckIndex)

    // Select random starting player
    const startingIndex = Math.floor(rng() * playerCount)

    const players = {}
    playerIds.forEach((playerId, index) => {
      players[playerId] = {
        hand: hands[playerId],
        playedPairs: [],
        score: 0,
        genome: genomes[index] || null,
        isAI: true
      }
    })

    return {
      deck: remainingDeck,
      discardLeft,
      discardRight,
      players,
      playerOrder: playerIds,
      currentPlayerIndex: startingIndex,
      currentPlayerId: playerIds[startingIndex],
      turnCount: 0,
      turnPhase: 'draw',
      declareMode: null,
      declaringPlayerId: null,
      remainingTurns: null,
      finished: false,
      winner: null
    }
  }

  /**
   * Run a complete game between AI players
   * @param {Array} genomes - Array of genomes for each player
   * @param {number} playerCount - Number of players (2-4)
   * @returns {Object} Game result
   */
  runGame(genomes, playerCount = 2) {
    let gameState = this.initializeGame(genomes, playerCount)
    const log = []

    while (!gameState.finished && gameState.turnCount < this.maxTurns) {
      const currentPlayerId = gameState.currentPlayerId
      const currentPlayer = gameState.players[currentPlayerId]
      const genome = currentPlayer.genome

      // Make AI decision
      const decision = makeDecision(genome, gameState, currentPlayerId)

      if (this.enableLogging) {
        log.push({
          turn: gameState.turnCount,
          player: currentPlayerId,
          phase: gameState.turnPhase,
          decision: decision.action,
          handSize: currentPlayer.hand.length
        })
      }

      // Execute decision
      gameState = this.executeAction(gameState, currentPlayerId, decision)

      // Check for game end
      if (gameState.declareMode && !gameState.finished) {
        gameState = this.handleDeclaration(gameState)
      }
    }

    // Calculate final scores
    const finalScores = {}
    const playerIds = gameState.playerOrder

    playerIds.forEach(playerId => {
      const player = gameState.players[playerId]
      const score = calculateScore(
        player.hand || [],
        player.playedPairs || [],
        gameState.declareMode === 'last_chance'
      )
      finalScores[playerId] = score.total
    })

    // Determine winner
    let winner = null
    let highestScore = -1
    Object.entries(finalScores).forEach(([playerId, score]) => {
      if (score > highestScore) {
        highestScore = score
        winner = playerId
      }
    })

    // Check for 4 mermaids instant win
    playerIds.forEach(playerId => {
      const player = gameState.players[playerId]
      const allCards = [...(player.hand || []), ...(player.playedPairs || []).flatMap(p => p.cards || [])]
      const mermaidCount = allCards.filter(c => c.name === 'Mermaid').length
      if (mermaidCount >= 4) {
        winner = playerId
        finalScores[playerId] = 1000 // Bonus for mermaid win
      }
    })

    return {
      winner,
      scores: finalScores,
      turnCount: gameState.turnCount,
      declareMode: gameState.declareMode,
      declaringPlayerId: gameState.declaringPlayerId,
      log: this.enableLogging ? log : null
    }
  }

  /**
   * Execute a player action
   */
  executeAction(gameState, playerId, decision) {
    const newState = JSON.parse(JSON.stringify(gameState)) // Deep clone
    const player = newState.players[playerId]

    switch (decision.action) {
      case 'draw':
        return this.executeDraw(newState, playerId, decision.source)

      case 'play_pair':
        return this.executePlayPair(newState, playerId, decision.cards)

      case 'declare':
        return this.executeDeclare(newState, playerId, decision.type)

      case 'end_turn':
        return this.executeEndTurn(newState, playerId)

      default:
        return this.executeEndTurn(newState, playerId)
    }
  }

  /**
   * Execute draw action
   */
  executeDraw(gameState, playerId, source) {
    const player = gameState.players[playerId]

    if (source === 'deck') {
      if (gameState.deck.length >= 2) {
        // Draw 2, keep 1
        const card1 = gameState.deck.pop()
        const card2 = gameState.deck.pop()
        // Keep higher value card (simple heuristic)
        const keepCard = (card1.value || 0) >= (card2.value || 0) ? card1 : card2
        const discardCard = keepCard === card1 ? card2 : card1
        player.hand.push(keepCard)
        gameState.discardLeft.push(discardCard)
      } else if (gameState.deck.length === 1) {
        player.hand.push(gameState.deck.pop())
      }
    } else if (source === 'discard_left' && gameState.discardLeft.length > 0) {
      const card = gameState.discardLeft.pop()
      player.hand.push(card)
    } else if (source === 'discard_right' && gameState.discardRight.length > 0) {
      const card = gameState.discardRight.pop()
      player.hand.push(card)
    }

    gameState.turnPhase = 'pair'
    return gameState
  }

  /**
   * Execute play pair action
   */
  executePlayPair(gameState, playerId, pairCards) {
    const player = gameState.players[playerId]

    // Find and remove cards from hand
    const cardIds = pairCards.map(c => c.id)
    const removedCards = []

    player.hand = player.hand.filter(card => {
      if (cardIds.includes(card.id) && removedCards.length < 2) {
        removedCards.push(card)
        return false
      }
      return true
    })

    if (removedCards.length === 2) {
      // Add to played pairs
      player.playedPairs.push({
        cards: removedCards,
        timestamp: Date.now()
      })

      // Execute pair effect
      const effect = getPairEffect(removedCards[0], removedCards[1])
      gameState = this.executePairEffect(gameState, playerId, effect)
    }

    return gameState
  }

  /**
   * Execute pair effect
   */
  executePairEffect(gameState, playerId, effect) {
    const player = gameState.players[playerId]

    switch (effect) {
      case 'draw_blind':
        // Draw 1 card from deck
        if (gameState.deck.length > 0) {
          player.hand.push(gameState.deck.pop())
        }
        break

      case 'draw_discard':
        // Take from any discard pile (AI takes highest value)
        const leftTop = gameState.discardLeft[gameState.discardLeft.length - 1]
        const rightTop = gameState.discardRight[gameState.discardRight.length - 1]
        if (leftTop && rightTop) {
          if ((leftTop.value || 0) >= (rightTop.value || 0)) {
            player.hand.push(gameState.discardLeft.pop())
          } else {
            player.hand.push(gameState.discardRight.pop())
          }
        } else if (leftTop) {
          player.hand.push(gameState.discardLeft.pop())
        } else if (rightTop) {
          player.hand.push(gameState.discardRight.pop())
        }
        break

      case 'extra_turn':
        // Flag for extra turn (handled in end turn)
        gameState.hasExtraTurn = true
        break

      case 'steal_card':
        // Steal random card from opponent with most cards
        const playerIds = gameState.playerOrder.filter(id => id !== playerId)
        let targetPlayer = null
        let maxCards = 0

        playerIds.forEach(id => {
          const opp = gameState.players[id]
          if (opp.hand.length > maxCards) {
            maxCards = opp.hand.length
            targetPlayer = opp
          }
        })

        if (targetPlayer && targetPlayer.hand.length > 0) {
          const randomIndex = Math.floor(Math.random() * targetPlayer.hand.length)
          const stolenCard = targetPlayer.hand.splice(randomIndex, 1)[0]
          player.hand.push(stolenCard)
        }
        break
    }

    return gameState
  }

  /**
   * Execute declare action
   */
  executeDeclare(gameState, playerId, declareType) {
    gameState.declareMode = declareType
    gameState.declaringPlayerId = playerId

    if (declareType === 'stop') {
      // Round ends immediately
      gameState.finished = true
    } else if (declareType === 'last_chance') {
      // Other players get one more turn
      const playerCount = gameState.playerOrder.length
      gameState.remainingTurns = playerCount - 1
    }

    return gameState
  }

  /**
   * Execute end turn action
   */
  executeEndTurn(gameState, playerId) {
    // Check for extra turn
    if (gameState.hasExtraTurn) {
      gameState.hasExtraTurn = false
      gameState.turnPhase = 'draw'
      return gameState
    }

    // Move to next player
    const playerCount = gameState.playerOrder.length
    const currentIndex = gameState.playerOrder.indexOf(playerId)
    const nextIndex = (currentIndex + 1) % playerCount

    gameState.currentPlayerIndex = nextIndex
    gameState.currentPlayerId = gameState.playerOrder[nextIndex]
    gameState.turnPhase = 'draw'
    gameState.turnCount++

    // Handle Last Chance countdown
    if (gameState.declareMode === 'last_chance' && gameState.remainingTurns !== null) {
      gameState.remainingTurns--
      if (gameState.remainingTurns <= 0) {
        gameState.finished = true
      }
    }

    // Check for deck exhaustion
    if (gameState.deck.length === 0) {
      gameState = this.reshuffleDeck(gameState)
      if (gameState.deck.length === 0) {
        // No cards left to reshuffle, end game
        gameState.finished = true
      }
    }

    return gameState
  }

  /**
   * Handle declaration scoring
   */
  handleDeclaration(gameState) {
    if (gameState.declareMode === 'stop') {
      gameState.finished = true
    }
    return gameState
  }

  /**
   * Reshuffle deck from discard piles
   */
  reshuffleDeck(gameState) {
    // Keep top card of each discard pile
    const topLeft = gameState.discardLeft.length > 0
      ? gameState.discardLeft.pop() : null
    const topRight = gameState.discardRight.length > 0
      ? gameState.discardRight.pop() : null

    // Combine remaining discard cards
    const toShuffle = [
      ...gameState.discardLeft,
      ...gameState.discardRight
    ]

    // Shuffle and set as new deck
    gameState.deck = shuffle(toShuffle)

    // Restore top cards
    gameState.discardLeft = topLeft ? [topLeft] : []
    gameState.discardRight = topRight ? [topRight] : []

    return gameState
  }

  /**
   * Run multiple games and return statistics
   * @param {Array} genomes - Array of genomes
   * @param {number} gameCount - Number of games to run
   * @param {number} playerCount - Players per game
   * @returns {Object} Aggregated statistics
   */
  runBatch(genomes, gameCount = 100, playerCount = 2) {
    const results = {
      gamesPlayed: 0,
      wins: {},
      totalScores: {},
      avgScores: {},
      avgTurns: 0,
      declareModes: { stop: 0, last_chance: 0, none: 0 }
    }

    // Initialize counters
    const playerIds = Array.from({ length: playerCount }, (_, i) => `player_${i}`)
    playerIds.forEach(id => {
      results.wins[id] = 0
      results.totalScores[id] = 0
    })

    let totalTurns = 0

    for (let i = 0; i < gameCount; i++) {
      // Vary seed for each game
      this.seed = Date.now() + i * 1000

      const gameResult = this.runGame(genomes, playerCount)

      results.gamesPlayed++

      // Track wins
      if (gameResult.winner) {
        results.wins[gameResult.winner]++
      }

      // Track scores
      Object.entries(gameResult.scores).forEach(([playerId, score]) => {
        results.totalScores[playerId] += score
      })

      // Track turns
      totalTurns += gameResult.turnCount

      // Track declare modes
      if (gameResult.declareMode) {
        results.declareModes[gameResult.declareMode]++
      } else {
        results.declareModes.none++
      }
    }

    // Calculate averages
    results.avgTurns = totalTurns / gameCount
    playerIds.forEach(id => {
      results.avgScores[id] = results.totalScores[id] / gameCount
    })

    return results
  }
}

export default GameSimulator
