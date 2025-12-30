/**
 * Game Simulator
 *
 * Simulates complete Sea Salt & Paper games for AI training and testing
 * Integrates existing aiService, gameService, and scoreService
 *
 * Features:
 * - Complete game flow simulation
 * - Multiple AI strategy support
 * - Detailed turn logging
 * - Effect handling (draw_blind, draw_discard, extra_turn, steal_card)
 * - Declare mode support (STOP, LAST_CHANCE)
 */

// Environment setup for Node.js compatibility
import './utils/nodeEnv.js'

import {
  initializeGameState,
  drawFromDeck,
  validatePair,
  executePairEffect,
  checkDeckReshuffle,
  calculateRoundWinner,
  getTargetScore,
  dealInitialHands
} from '../src/services/gameService.js'

import {
  makeAIDecision,
  makeEasyDecision,
  makeMediumDecision,
  makeHardDecision,
  shouldPlayMorePairs
} from '../src/services/aiService.js'

import { calculateScore } from '../src/services/scoreService.js'

import { isValidPair, getPairEffect } from '../src/utils/cardHelpers.js'

import { EnhancedBattleLogger } from './utils/enhancedBattleLogger.js'
import { BugDetector } from './utils/bugDetector.js'
import { TrainingDataCollector } from './utils/trainingDataCollector.js'

/**
 * Strategy mapping
 */
const STRATEGY_MAP = {
  easy: makeEasyDecision,
  medium: makeMediumDecision,
  hard: makeHardDecision
}

/**
 * GameSimulator class
 */
export class GameSimulator {
  constructor(options = {}) {
    // Configuration
    this.maxTurns = options.maxTurns || 500
    this.maxRounds = options.maxRounds || 10
    this.verbose = options.verbose || false
    this.collectTrainingData = options.collectTrainingData || false

    // Components
    this.logger = null
    this.bugDetector = null
    this.trainingCollector = null

    // Game state
    this.gameState = null
    this.playerStrategies = []
    this.gameId = null
    this.turnCount = 0
    this.roundCount = 0

    // Results
    this.gameResult = null
  }

  /**
   * Initialize a new game
   * @param {Array<string>} strategies - Strategy for each player ['easy', 'medium', 'hard']
   * @param {Object} settings - Game settings
   * @returns {Object} Initial game state
   */
  initializeGame(strategies, settings = {}) {
    this.gameId = this.generateGameId()
    this.playerStrategies = strategies
    this.turnCount = 0
    this.roundCount = 1

    // Initialize components
    this.logger = new EnhancedBattleLogger({
      gameId: this.gameId,
      verbose: this.verbose
    })

    this.bugDetector = new BugDetector({
      maxTurns: this.maxTurns
    })

    if (this.collectTrainingData) {
      this.trainingCollector = new TrainingDataCollector({
        gameId: this.gameId
      })
      this.trainingCollector.setGameId(this.gameId)
    }

    // Create player data
    const playerIds = strategies.map((_, i) => `player_${i}`)
    const playersData = {}

    strategies.forEach((strategy, i) => {
      const playerId = playerIds[i]
      playersData[playerId] = {
        name: `AI_${strategy}_${i}`,
        isAI: true,
        strategy: strategy
      }
    })

    // Initialize game state
    const gameSettings = {
      startingHandSize: settings.startingHandSize || 2,
      ...settings
    }

    this.gameState = initializeGameState(playerIds, gameSettings, playersData)

    // Store strategy in player objects
    playerIds.forEach((id, i) => {
      this.gameState.players[id].strategy = strategies[i]
    })

    // Set target score
    this.gameState.targetScore = getTargetScore(playerIds.length)

    // Log game start
    this.logger.logGameStart(this.gameState, strategies, gameSettings)

    if (this.verbose) {
      console.log(`[GameSimulator] Game ${this.gameId} initialized`)
      console.log(`[GameSimulator] Players: ${strategies.join(' vs ')}`)
      console.log(`[GameSimulator] Target Score: ${this.gameState.targetScore}`)
    }

    return this.gameState
  }

  /**
   * Generate unique game ID
   */
  generateGameId() {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 6)
    return `sim_${timestamp}_${random}`
  }

  /**
   * Run a complete game simulation
   * @param {Array<string>} strategies - Strategies for each player
   * @param {Object} settings - Game settings
   * @returns {Object} Game result
   */
  async runGame(strategies, settings = {}) {
    this.initializeGame(strategies, settings)

    if (this.verbose) {
      console.log('\n' + '='.repeat(60))
      console.log('  STARTING GAME SIMULATION')
      console.log('='.repeat(60) + '\n')
    }

    // Main game loop
    while (!this.isGameOver()) {
      // Check for infinite loop
      const loopCheck = this.bugDetector.checkInfiniteLoop(this.gameState, this.turnCount)
      if (loopCheck.detected) {
        console.error(`[GameSimulator] Infinite loop detected: ${loopCheck.reason}`)
        break
      }

      // Execute turn
      await this.executeTurn()

      // Run invariant checks periodically
      if (this.turnCount % 10 === 0) {
        this.bugDetector.runAllChecks(this.gameState)
      }
    }

    // Finalize game
    return this.finalizeGame()
  }

  /**
   * Check if game is over
   */
  isGameOver() {
    if (this.turnCount >= this.maxTurns) {
      return true
    }

    if (this.gameState.isGameOver) {
      return true
    }

    // Check if any player reached target score
    const targetScore = this.gameState.targetScore
    for (const player of Object.values(this.gameState.players)) {
      if ((player.score || 0) >= targetScore) {
        return true
      }
    }

    // Check if deck is completely empty and can't reshuffle
    if (this.gameState.deck.length === 0) {
      const reshuffleResult = checkDeckReshuffle(
        this.gameState.deck,
        this.gameState.discardLeft,
        this.gameState.discardRight
      )
      if (reshuffleResult.newDeck.length === 0) {
        return true
      }
    }

    return false
  }

  /**
   * Execute a single turn
   */
  async executeTurn() {
    this.turnCount++
    this.gameState.turnCount = this.turnCount

    const currentPlayerId = this.gameState.currentPlayerId
    const player = this.gameState.players[currentPlayerId]
    const strategy = player.strategy

    // Log turn start
    this.logger.logTurnStart(currentPlayerId, this.turnCount, this.gameState.turnPhase, player)

    if (this.verbose) {
      console.log(`\n[Turn ${this.turnCount}] ${player.name} (${strategy}) - Phase: ${this.gameState.turnPhase}`)
    }

    try {
      // Execute turn phases
      await this.executeDrawPhase(currentPlayerId)
      await this.executePairPhase(currentPlayerId)
      await this.executeDeclarePhase(currentPlayerId)

      // Handle declare mode (Last Chance) if active
      if (this.gameState.declareMode && !this.gameState.isGameOver) {
        this.handleDeclareMode()
      }

      // Move to next player (if not extra turn)
      if (!this.gameState.hasExtraTurn) {
        this.advanceToNextPlayer()
      } else {
        this.gameState.hasExtraTurn = false
        if (this.verbose) {
          console.log(`[Turn ${this.turnCount}] ${player.name} gets an extra turn!`)
        }
      }

    } catch (error) {
      this.logger.logError(`Error in turn ${this.turnCount}`, error, {
        playerId: currentPlayerId,
        phase: this.gameState.turnPhase
      })
      console.error(`[GameSimulator] Turn error:`, error)

      // Try to recover by advancing to next player
      this.advanceToNextPlayer()
    }
  }

  /**
   * Execute draw phase
   * @param {string} playerId - Current player ID
   */
  async executeDrawPhase(playerId) {
    if (this.gameState.turnPhase !== 'draw') return

    const player = this.gameState.players[playerId]
    const strategy = STRATEGY_MAP[player.strategy] || makeEasyDecision

    // Set phase for AI decision
    const drawGameState = { ...this.gameState, turnPhase: 'draw' }
    const decision = strategy(drawGameState, playerId)

    // Build options for training data
    const options = [{ source: 'deck', score: 3 }]
    if (this.gameState.discardLeft.length > 0) {
      const leftTop = this.gameState.discardLeft[this.gameState.discardLeft.length - 1]
      options.push({ source: 'discard_left', card: leftTop, score: leftTop.value })
    }
    if (this.gameState.discardRight.length > 0) {
      const rightTop = this.gameState.discardRight[this.gameState.discardRight.length - 1]
      options.push({ source: 'discard_right', card: rightTop, score: rightTop.value })
    }

    // Log decision
    this.logger.logDecision(playerId, 'draw', decision, {
      handSize: player.hand.length,
      deckSize: this.gameState.deck.length,
      turnCount: this.turnCount
    })

    // Collect training data
    if (this.trainingCollector) {
      this.trainingCollector.collectDrawSample(
        this.gameState,
        playerId,
        decision,
        options
      )
    }

    // Execute draw
    await this.executeDrawAction(playerId, decision.source)

    // Track action for bug detection
    this.bugDetector.trackAction(playerId, 'draw', { source: decision.source })

    // Advance to pair phase
    this.gameState.turnPhase = 'pair'
  }

  /**
   * Execute draw action
   * @param {string} playerId - Player ID
   * @param {string} source - Draw source ('deck', 'discard_left', 'discard_right')
   */
  async executeDrawAction(playerId, source) {
    const player = this.gameState.players[playerId]
    let drawnCard = null

    if (source === 'deck') {
      // Check if deck needs reshuffling
      if (this.gameState.deck.length === 0) {
        const reshuffleResult = checkDeckReshuffle(
          this.gameState.deck,
          this.gameState.discardLeft,
          this.gameState.discardRight
        )
        this.gameState.deck = reshuffleResult.newDeck
        this.gameState.discardLeft = reshuffleResult.newDiscardLeft
        this.gameState.discardRight = reshuffleResult.newDiscardRight

        if (this.verbose) {
          console.log(`[Draw] Deck reshuffled, now has ${this.gameState.deck.length} cards`)
        }
      }

      if (this.gameState.deck.length > 0) {
        const drawResult = drawFromDeck(this.gameState.deck, 1)
        drawnCard = drawResult.drawnCards[0]
        this.gameState.deck = drawResult.remainingDeck
      }
    } else if (source === 'discard_left') {
      if (this.gameState.discardLeft.length > 0) {
        drawnCard = this.gameState.discardLeft.pop()
      }
    } else if (source === 'discard_right') {
      if (this.gameState.discardRight.length > 0) {
        drawnCard = this.gameState.discardRight.pop()
      }
    }

    if (drawnCard) {
      player.hand.push(drawnCard)
      this.logger.logCardDraw(playerId, source, drawnCard)

      if (this.verbose) {
        console.log(`[Draw] ${player.name} drew ${drawnCard.name} from ${source}`)
      }
    }
  }

  /**
   * Execute pair phase
   * @param {string} playerId - Current player ID
   */
  async executePairPhase(playerId) {
    if (this.gameState.turnPhase !== 'pair') return

    const player = this.gameState.players[playerId]
    const strategy = STRATEGY_MAP[player.strategy] || makeEasyDecision

    // Keep playing pairs while beneficial
    let continuePlaying = true
    let pairsPlayedThisTurn = 0
    const maxPairsPerTurn = 5 // Safety limit

    while (continuePlaying && pairsPlayedThisTurn < maxPairsPerTurn) {
      // Set phase for AI decision
      const pairGameState = { ...this.gameState, turnPhase: 'pair' }
      const decision = strategy(pairGameState, playerId)

      // Log decision
      this.logger.logDecision(playerId, 'pair', decision, {
        handSize: player.hand.length,
        turnCount: this.turnCount
      })

      // Collect training data
      if (this.trainingCollector && decision.action === 'play_pair') {
        const availablePairs = this.findAllPairs(player.hand)
        this.trainingCollector.collectPairSample(
          this.gameState,
          playerId,
          decision,
          availablePairs
        )
      }

      if (decision.action === 'play_pair' && decision.cards && decision.cards.length === 2) {
        // Validate pair
        if (!validatePair(decision.cards[0], decision.cards[1])) {
          this.logger.logWarning('Invalid pair attempted', {
            playerId,
            cards: decision.cards.map(c => c.name)
          })
          continuePlaying = false
          continue
        }

        // Execute pair play
        await this.executePlayPair(playerId, decision.cards)
        pairsPlayedThisTurn++

        // Check if more pairs should be played
        const moreResult = shouldPlayMorePairs(player.hand, player.playedPairs, [])
        continuePlaying = moreResult.shouldPlay

        // Track action
        this.bugDetector.trackAction(playerId, 'play_pair', {
          cards: decision.cards.map(c => c.name)
        })
      } else {
        continuePlaying = false
      }
    }

    // Advance to declare phase
    this.gameState.turnPhase = 'declare'
  }

  /**
   * Execute play pair action
   * @param {string} playerId - Player ID
   * @param {Array} cards - Pair cards
   */
  async executePlayPair(playerId, cards) {
    const player = this.gameState.players[playerId]

    // Remove cards from hand
    const cardIds = cards.map(c => c.id)
    player.hand = player.hand.filter(c => !cardIds.includes(c.id))

    // Add to played pairs
    player.playedPairs = player.playedPairs || []
    player.playedPairs.push({
      cards: cards,
      timestamp: Date.now()
    })

    // Get pair effect
    const effect = getPairEffect(cards[0], cards[1])

    // Log pair play
    this.logger.logPairPlay(playerId, cards, effect)

    if (this.verbose) {
      console.log(`[Pair] ${player.name} played ${cards[0].name} + ${cards[1].name}`)
      if (effect) console.log(`[Pair] Effect triggered: ${effect}`)
    }

    // Handle effect
    if (effect) {
      await this.handlePairEffect(playerId, effect, cards)
    }
  }

  /**
   * Handle pair effect
   * @param {string} playerId - Player ID
   * @param {string} effect - Effect type
   * @param {Array} cards - Pair cards
   */
  async handlePairEffect(playerId, effect, cards) {
    const player = this.gameState.players[playerId]

    this.logger.logEffect(effect, { playerId, cards: cards.map(c => c.name) })

    switch (effect) {
      case 'draw_blind':
        // Draw from deck
        if (this.gameState.deck.length > 0) {
          const drawResult = drawFromDeck(this.gameState.deck, 1)
          if (drawResult.drawnCards.length > 0) {
            player.hand.push(drawResult.drawnCards[0])
            this.gameState.deck = drawResult.remainingDeck

            if (this.verbose) {
              console.log(`[Effect] ${player.name} drew ${drawResult.drawnCards[0].name} (draw_blind)`)
            }
          }
        }
        break

      case 'draw_discard':
        // Draw from discard pile (AI chooses best)
        const leftTop = this.gameState.discardLeft.length > 0
          ? this.gameState.discardLeft[this.gameState.discardLeft.length - 1]
          : null
        const rightTop = this.gameState.discardRight.length > 0
          ? this.gameState.discardRight[this.gameState.discardRight.length - 1]
          : null

        let chosenCard = null
        if (leftTop && rightTop) {
          chosenCard = (leftTop.value || 0) >= (rightTop.value || 0)
            ? this.gameState.discardLeft.pop()
            : this.gameState.discardRight.pop()
        } else if (leftTop) {
          chosenCard = this.gameState.discardLeft.pop()
        } else if (rightTop) {
          chosenCard = this.gameState.discardRight.pop()
        }

        if (chosenCard) {
          player.hand.push(chosenCard)
          if (this.verbose) {
            console.log(`[Effect] ${player.name} took ${chosenCard.name} from discard (draw_discard)`)
          }
        }
        break

      case 'extra_turn':
        this.gameState.hasExtraTurn = true
        if (this.verbose) {
          console.log(`[Effect] ${player.name} will get an extra turn!`)
        }
        break

      case 'steal_card':
        // Steal from opponent with most cards
        const opponents = Object.entries(this.gameState.players)
          .filter(([id]) => id !== playerId)
          .sort((a, b) => (b[1].hand?.length || 0) - (a[1].hand?.length || 0))

        if (opponents.length > 0) {
          const [targetId, targetPlayer] = opponents[0]
          if (targetPlayer.hand && targetPlayer.hand.length > 0) {
            const randomIndex = Math.floor(Math.random() * targetPlayer.hand.length)
            const stolenCard = targetPlayer.hand.splice(randomIndex, 1)[0]
            player.hand.push(stolenCard)

            if (this.verbose) {
              console.log(`[Effect] ${player.name} stole ${stolenCard.name} from ${targetPlayer.name}`)
            }
          }
        }
        break
    }
  }

  /**
   * Execute declare phase
   * @param {string} playerId - Current player ID
   */
  async executeDeclarePhase(playerId) {
    if (this.gameState.turnPhase !== 'declare') return
    if (this.gameState.declareMode) return // Already in declare mode

    const player = this.gameState.players[playerId]
    const strategy = STRATEGY_MAP[player.strategy] || makeEasyDecision

    // Calculate current score
    const scoreResult = calculateScore(player.hand, player.playedPairs, { includeColorBonus: false })
    player.currentRoundScore = scoreResult.total

    // Check if can declare (score >= 7)
    if (scoreResult.total < 7) {
      return
    }

    // Get AI decision
    const declareGameState = { ...this.gameState, turnPhase: 'declare' }
    const decision = strategy(declareGameState, playerId)

    // Log decision
    this.logger.logDecision(playerId, 'declare', decision, {
      score: scoreResult.total,
      turnCount: this.turnCount
    })

    // Collect training data
    if (this.trainingCollector && decision.action === 'declare') {
      this.trainingCollector.collectDeclareSample(
        this.gameState,
        playerId,
        decision,
        scoreResult
      )
    }

    if (decision.action === 'declare' && decision.type) {
      // Execute declare
      this.gameState.declareMode = decision.type
      this.gameState.declaringPlayerId = playerId

      // Log declare
      this.logger.logDeclareDecision(playerId, decision.type, scoreResult, decision.reason)

      if (this.verbose) {
        console.log(`[Declare] ${player.name} declares ${decision.type.toUpperCase()} with score ${scoreResult.total}`)
      }

      // Track action
      this.bugDetector.trackAction(playerId, 'declare', {
        type: decision.type,
        score: scoreResult.total
      })

      if (decision.type === 'stop') {
        // STOP: End round immediately
        this.endRound()
      }
      // LAST_CHANCE: Continue, handled by handleDeclareMode
    }
  }

  /**
   * Handle declare mode (Last Chance turns)
   */
  handleDeclareMode() {
    if (this.gameState.declareMode !== 'last_chance') return

    // Initialize remaining turns if not set
    if (this.gameState.remainingTurns === null) {
      const playerCount = Object.keys(this.gameState.players).length
      this.gameState.remainingTurns = playerCount - 1 // Everyone except declarer
    }

    // Decrement remaining turns
    this.gameState.remainingTurns--

    if (this.verbose) {
      console.log(`[LastChance] Remaining turns: ${this.gameState.remainingTurns}`)
    }

    // End round when all players have had their last turn
    if (this.gameState.remainingTurns <= 0) {
      this.endRound()
    }
  }

  /**
   * End the current round
   */
  endRound() {
    const roundResult = calculateRoundWinner(
      this.gameState.players,
      this.gameState.declareMode || 'stop',
      this.gameState.declaringPlayerId
    )

    // Update player scores
    Object.entries(roundResult.scores).forEach(([playerId, scoreData]) => {
      const player = this.gameState.players[playerId]
      player.score = (player.score || 0) + scoreData.total
      player.roundScores = player.roundScores || []
      player.roundScores.push(scoreData)
    })

    // Log round end
    this.logger.logRoundEnd(this.roundCount, roundResult)

    if (this.verbose) {
      console.log(`\n[Round ${this.roundCount} End]`)
      console.log(`Mode: ${roundResult.mode}`)
      console.log(`Winner: ${roundResult.winner} with ${roundResult.winnerScore} points`)
      Object.entries(roundResult.scores).forEach(([id, score]) => {
        const player = this.gameState.players[id]
        console.log(`  ${player.name}: ${score.total} (Total: ${player.score})`)
      })
    }

    // Check if game is over
    const targetScore = this.gameState.targetScore
    let gameWinner = null

    for (const [playerId, player] of Object.entries(this.gameState.players)) {
      if ((player.score || 0) >= targetScore) {
        gameWinner = playerId
        break
      }
    }

    if (gameWinner) {
      this.gameState.isGameOver = true
      this.gameState.winner = gameWinner
      return
    }

    // Start new round
    this.startNewRound()
  }

  /**
   * Start a new round
   */
  startNewRound() {
    this.roundCount++
    this.gameState.round = this.roundCount

    // Reset round state
    this.gameState.declareMode = null
    this.gameState.declaringPlayerId = null
    this.gameState.remainingTurns = null
    this.gameState.turnPhase = 'draw'

    // Clear player hands and played pairs, keep scores
    Object.values(this.gameState.players).forEach(player => {
      player.hand = []
      player.playedPairs = []
      player.currentRoundScore = 0
    })

    // Reinitialize deck and deal
    const playerIds = this.gameState.playerOrder
    const playerCount = playerIds.length

    // Recreate deck using imported function
    const { hands, remainingDeck } = dealInitialHands(playerCount, 2)

    playerIds.forEach((id, index) => {
      this.gameState.players[id].hand = hands[index]
    })

    // Reset deck and discard piles
    this.gameState.deck = remainingDeck.slice(2) // Leave some for discard
    this.gameState.discardLeft = remainingDeck.slice(0, 1)
    this.gameState.discardRight = remainingDeck.slice(1, 2)

    // Log round start
    this.logger.logRoundStart(this.roundCount, this.gameState)

    if (this.verbose) {
      console.log(`\n[Round ${this.roundCount} Start]`)
    }
  }

  /**
   * Advance to next player
   */
  advanceToNextPlayer() {
    const playerOrder = this.gameState.playerOrder
    const currentIndex = this.gameState.currentPlayerIndex
    const nextIndex = (currentIndex + 1) % playerOrder.length

    this.gameState.currentPlayerIndex = nextIndex
    this.gameState.currentPlayerId = playerOrder[nextIndex]
    this.gameState.turnPhase = 'draw'
  }

  /**
   * Finalize game and return results
   */
  finalizeGame() {
    // Determine winner if not already set
    if (!this.gameState.winner) {
      let maxScore = 0
      let winner = null

      Object.entries(this.gameState.players).forEach(([id, player]) => {
        if ((player.score || 0) > maxScore) {
          maxScore = player.score
          winner = id
        }
      })

      this.gameState.winner = winner
    }

    const winner = this.gameState.winner
    const winnerPlayer = this.gameState.players[winner]

    // Build final scores
    const finalScores = {}
    Object.entries(this.gameState.players).forEach(([id, player]) => {
      finalScores[id] = player.score || 0
    })

    // Determine win condition
    let winCondition = 'score'
    if (this.turnCount >= this.maxTurns) {
      winCondition = 'max_turns'
    }

    // Build game result
    this.gameResult = {
      gameId: this.gameId,
      winner,
      winnerStrategy: winnerPlayer.strategy,
      winnerScore: finalScores[winner],
      finalScores,
      playerStrategies: this.playerStrategies,
      turnCount: this.turnCount,
      roundsPlayed: this.roundCount,
      winCondition,
      duration: Date.now() - this.logger.startTime
    }

    // Log game end
    this.logger.logGameEnd(this.gameResult)

    // Add game outcome to training data
    if (this.trainingCollector) {
      this.trainingCollector.addGameOutcome(this.gameResult)
    }

    // Run final bug checks
    const bugResults = this.bugDetector.runAllChecks(this.gameState)

    if (this.verbose) {
      console.log('\n' + '='.repeat(60))
      console.log('  GAME COMPLETE')
      console.log('='.repeat(60))
      console.log(`Winner: ${winnerPlayer.name} (${winnerPlayer.strategy})`)
      console.log(`Final Score: ${finalScores[winner]}`)
      console.log(`Turns: ${this.turnCount}`)
      console.log(`Rounds: ${this.roundCount}`)
      console.log(`Duration: ${(this.gameResult.duration / 1000).toFixed(2)}s`)
      console.log('='.repeat(60) + '\n')

      // Print bug summary
      this.bugDetector.printSummary()
    }

    return this.gameResult
  }

  /**
   * Find all valid pairs in hand
   * @param {Array} hand - Player's hand
   * @returns {Array} Array of valid pairs
   */
  findAllPairs(hand) {
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

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * Get current game state
   */
  getGameState() {
    return this.gameState
  }

  /**
   * Get game result
   */
  getGameResult() {
    return this.gameResult
  }

  /**
   * Get logger
   */
  getLogger() {
    return this.logger
  }

  /**
   * Get bug detector
   */
  getBugDetector() {
    return this.bugDetector
  }

  /**
   * Get training data collector
   */
  getTrainingCollector() {
    return this.trainingCollector
  }

  /**
   * Export all data
   * @param {string} outputDir - Output directory
   */
  exportData(outputDir = null) {
    const dir = outputDir || './scripts/output'

    // Export logs
    if (this.logger) {
      this.logger.exportToJSON(`${this.gameId}_logs.json`)
    }

    // Export bug report if any bugs found
    if (this.bugDetector && this.bugDetector.getBugs().length > 0) {
      this.bugDetector.saveReport(this.gameId)
    }

    // Export training data
    if (this.trainingCollector) {
      this.trainingCollector.exportToJSON(`${this.gameId}_training.json`)
      this.trainingCollector.exportToCSV(`${this.gameId}_training.csv`)
    }
  }
}

export default GameSimulator
