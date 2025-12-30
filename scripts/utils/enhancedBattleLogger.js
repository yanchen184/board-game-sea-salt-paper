/**
 * Enhanced Battle Logger
 *
 * Comprehensive logging system for AI battle simulations
 * Supports game events, decisions, errors, and export functionality
 *
 * Features:
 * - Detailed game state logging
 * - Decision tracking with reasoning
 * - Error and anomaly detection
 * - JSON export for analysis
 * - Console output with formatting
 */

import fs from 'fs'
import path from 'path'

/**
 * Log entry types
 */
export const LOG_TYPE = {
  GAME_START: 'game_start',
  ROUND_START: 'round_start',
  TURN_START: 'turn_start',
  DECISION: 'decision',
  ACTION: 'action',
  EFFECT: 'effect',
  STATE_CHANGE: 'state_change',
  ERROR: 'error',
  ANOMALY: 'anomaly',
  WARNING: 'warning',
  ROUND_END: 'round_end',
  GAME_END: 'game_end'
}

/**
 * EnhancedBattleLogger class
 */
export class EnhancedBattleLogger {
  constructor(options = {}) {
    this.logs = []
    this.gameId = options.gameId || this.generateGameId()
    this.startTime = Date.now()
    this.verbose = options.verbose || false
    this.outputDir = options.outputDir || './scripts/output/logs'

    // Game metadata
    this.metadata = {
      gameId: this.gameId,
      startTime: new Date().toISOString(),
      playerStrategies: [],
      settings: {}
    }

    // Statistics
    this.stats = {
      totalTurns: 0,
      totalDecisions: 0,
      totalErrors: 0,
      totalAnomalies: 0,
      decisionsByType: {},
      actionsByType: {}
    }

    // Ensure output directory exists
    this.ensureOutputDir()
  }

  /**
   * Generate unique game ID
   */
  generateGameId() {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `game_${timestamp}_${random}`
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  /**
   * Create a log entry
   */
  createEntry(type, data) {
    const entry = {
      id: this.logs.length + 1,
      type,
      timestamp: Date.now(),
      relativeTime: Date.now() - this.startTime,
      data
    }

    this.logs.push(entry)

    if (this.verbose) {
      this.printEntry(entry)
    }

    return entry
  }

  /**
   * Print log entry to console
   */
  printEntry(entry) {
    const time = `[${(entry.relativeTime / 1000).toFixed(2)}s]`
    const type = entry.type.toUpperCase().padEnd(15)

    switch (entry.type) {
      case LOG_TYPE.GAME_START:
        console.log(`${time} ${type} Game started with ${entry.data.playerCount} players`)
        break
      case LOG_TYPE.TURN_START:
        console.log(`${time} ${type} Turn ${entry.data.turnNumber}: ${entry.data.playerId} (${entry.data.phase})`)
        break
      case LOG_TYPE.DECISION:
        console.log(`${time} ${type} ${entry.data.playerId}: ${entry.data.action} - ${entry.data.reason || 'no reason'}`)
        break
      case LOG_TYPE.ERROR:
        console.error(`${time} ${type} ERROR: ${entry.data.message}`)
        break
      case LOG_TYPE.ANOMALY:
        console.warn(`${time} ${type} ANOMALY: ${entry.data.description}`)
        break
      case LOG_TYPE.GAME_END:
        console.log(`${time} ${type} Game ended. Winner: ${entry.data.winner}`)
        break
      default:
        console.log(`${time} ${type} ${JSON.stringify(entry.data)}`)
    }
  }

  // ============================================================================
  // Game Lifecycle Logging
  // ============================================================================

  /**
   * Log game start
   * @param {Object} gameState - Initial game state
   * @param {Array<string>} playerStrategies - Strategy for each player
   * @param {Object} settings - Game settings
   */
  logGameStart(gameState, playerStrategies, settings = {}) {
    this.metadata.playerStrategies = playerStrategies
    this.metadata.settings = settings

    const playerInfo = Object.entries(gameState.players).map(([id, player]) => ({
      id,
      name: player.name,
      strategy: playerStrategies[gameState.playerOrder.indexOf(id)] || 'unknown',
      handSize: (player.hand || []).length
    }))

    return this.createEntry(LOG_TYPE.GAME_START, {
      gameId: this.gameId,
      playerCount: playerInfo.length,
      players: playerInfo,
      strategies: playerStrategies,
      settings,
      deckSize: gameState.deck?.length || 0,
      discardLeftSize: gameState.discardLeft?.length || 0,
      discardRightSize: gameState.discardRight?.length || 0
    })
  }

  /**
   * Log round start
   * @param {number} roundNumber - Round number
   * @param {Object} gameState - Current game state
   */
  logRoundStart(roundNumber, gameState) {
    const playerScores = Object.entries(gameState.players).map(([id, player]) => ({
      id,
      totalScore: player.score || 0
    }))

    return this.createEntry(LOG_TYPE.ROUND_START, {
      roundNumber,
      playerScores,
      deckSize: gameState.deck?.length || 0,
      startingPlayerId: gameState.currentPlayerId
    })
  }

  /**
   * Log turn start
   * @param {string} playerId - Current player ID
   * @param {number} turnNumber - Turn number
   * @param {string} phase - Turn phase
   * @param {Object} playerState - Player's current state
   */
  logTurnStart(playerId, turnNumber, phase, playerState) {
    this.stats.totalTurns++

    return this.createEntry(LOG_TYPE.TURN_START, {
      playerId,
      turnNumber,
      phase,
      handSize: playerState.hand?.length || 0,
      playedPairsCount: playerState.playedPairs?.length || 0,
      currentScore: playerState.score || 0
    })
  }

  // ============================================================================
  // Decision Logging
  // ============================================================================

  /**
   * Log AI decision
   * @param {string} playerId - Player making decision
   * @param {string} phase - Decision phase (draw, pair, declare)
   * @param {Object} decision - Decision details
   * @param {Object} context - Additional context
   */
  logDecision(playerId, phase, decision, context = {}) {
    this.stats.totalDecisions++

    const decisionType = decision.action || decision.type || 'unknown'
    this.stats.decisionsByType[decisionType] = (this.stats.decisionsByType[decisionType] || 0) + 1

    return this.createEntry(LOG_TYPE.DECISION, {
      playerId,
      phase,
      action: decision.action,
      source: decision.source,
      cards: decision.cards?.map(c => ({
        id: c.id,
        name: c.name,
        value: c.value
      })),
      reason: decision.reason || decision.reasoning,
      evaluation: decision.evaluation,
      delay: decision.delay,
      context: {
        handSize: context.handSize,
        deckSize: context.deckSize,
        turnCount: context.turnCount,
        currentScore: context.currentScore
      }
    })
  }

  /**
   * Log draw decision details
   * @param {string} playerId - Player ID
   * @param {Object} options - Available draw options with evaluations
   * @param {string} chosenSource - Chosen draw source
   */
  logDrawDecision(playerId, options, chosenSource, reason) {
    return this.createEntry(LOG_TYPE.DECISION, {
      playerId,
      phase: 'draw',
      action: 'draw',
      availableOptions: options.map(opt => ({
        source: opt.source,
        card: opt.card ? { id: opt.card.id, name: opt.card.name } : null,
        score: opt.score,
        reason: opt.reason
      })),
      chosenSource,
      reason
    })
  }

  /**
   * Log pair decision details
   * @param {string} playerId - Player ID
   * @param {Array} availablePairs - All available pairs
   * @param {Array|null} chosenPair - Chosen pair (null if skipped)
   * @param {string} reason - Reason for decision
   */
  logPairDecision(playerId, availablePairs, chosenPair, reason) {
    return this.createEntry(LOG_TYPE.DECISION, {
      playerId,
      phase: 'pair',
      action: chosenPair ? 'play_pair' : 'skip_pair',
      availablePairs: availablePairs.map(pair => ({
        cards: pair.map(c => ({ id: c.id, name: c.name })),
        effect: pair[0].pairEffect
      })),
      chosenPair: chosenPair ? chosenPair.map(c => ({
        id: c.id,
        name: c.name,
        pairEffect: c.pairEffect
      })) : null,
      reason
    })
  }

  /**
   * Log declare decision
   * @param {string} playerId - Player ID
   * @param {string} declareType - 'stop' or 'last_chance'
   * @param {Object} scoreBreakdown - Score breakdown
   * @param {string} reason - Reason for declaration
   */
  logDeclareDecision(playerId, declareType, scoreBreakdown, reason) {
    return this.createEntry(LOG_TYPE.DECISION, {
      playerId,
      phase: 'declare',
      action: `declare_${declareType}`,
      declareType,
      score: scoreBreakdown.total,
      scoreBreakdown: {
        base: scoreBreakdown.base,
        pairs: scoreBreakdown.pairs,
        multipliers: scoreBreakdown.multipliers,
        mermaids: scoreBreakdown.mermaids,
        colorBonus: scoreBreakdown.colorBonus
      },
      reason
    })
  }

  // ============================================================================
  // Action Logging
  // ============================================================================

  /**
   * Log action execution
   * @param {string} actionType - Type of action
   * @param {Object} details - Action details
   */
  logAction(actionType, details) {
    this.stats.actionsByType[actionType] = (this.stats.actionsByType[actionType] || 0) + 1

    return this.createEntry(LOG_TYPE.ACTION, {
      actionType,
      ...details
    })
  }

  /**
   * Log card draw action
   * @param {string} playerId - Player ID
   * @param {string} source - Draw source
   * @param {Object} card - Drawn card
   */
  logCardDraw(playerId, source, card) {
    return this.logAction('card_draw', {
      playerId,
      source,
      card: card ? { id: card.id, name: card.name, value: card.value } : null
    })
  }

  /**
   * Log pair play action
   * @param {string} playerId - Player ID
   * @param {Array} pair - Played pair cards
   * @param {string} effect - Pair effect triggered
   */
  logPairPlay(playerId, pair, effect) {
    return this.logAction('pair_play', {
      playerId,
      pair: pair.map(c => ({ id: c.id, name: c.name })),
      effect
    })
  }

  /**
   * Log effect execution
   * @param {string} effectType - Effect type
   * @param {Object} details - Effect details
   */
  logEffect(effectType, details) {
    return this.createEntry(LOG_TYPE.EFFECT, {
      effectType,
      ...details
    })
  }

  /**
   * Log state change
   * @param {string} changeType - Type of state change
   * @param {Object} before - State before change
   * @param {Object} after - State after change
   */
  logStateChange(changeType, before, after) {
    return this.createEntry(LOG_TYPE.STATE_CHANGE, {
      changeType,
      before,
      after
    })
  }

  // ============================================================================
  // Error and Anomaly Logging
  // ============================================================================

  /**
   * Log error
   * @param {string} message - Error message
   * @param {Error|null} error - Error object
   * @param {Object} context - Additional context
   */
  logError(message, error = null, context = {}) {
    this.stats.totalErrors++

    return this.createEntry(LOG_TYPE.ERROR, {
      message,
      errorType: error?.name || 'UnknownError',
      errorMessage: error?.message,
      stack: error?.stack,
      context
    })
  }

  /**
   * Log anomaly (unexpected but not error)
   * @param {string} description - Anomaly description
   * @param {string} severity - 'low', 'medium', 'high'
   * @param {Object} details - Anomaly details
   */
  logAnomaly(description, severity, details = {}) {
    this.stats.totalAnomalies++

    return this.createEntry(LOG_TYPE.ANOMALY, {
      description,
      severity,
      details
    })
  }

  /**
   * Log warning
   * @param {string} message - Warning message
   * @param {Object} context - Additional context
   */
  logWarning(message, context = {}) {
    return this.createEntry(LOG_TYPE.WARNING, {
      message,
      context
    })
  }

  // ============================================================================
  // Game End Logging
  // ============================================================================

  /**
   * Log round end
   * @param {number} roundNumber - Round number
   * @param {Object} results - Round results
   */
  logRoundEnd(roundNumber, results) {
    return this.createEntry(LOG_TYPE.ROUND_END, {
      roundNumber,
      winner: results.winner,
      winnerScore: results.winnerScore,
      declareMode: results.declareMode,
      declaringPlayerId: results.declaringPlayerId,
      scores: results.scores,
      declarerHasHighest: results.declarerHasHighest
    })
  }

  /**
   * Log game end
   * @param {Object} results - Game results
   */
  logGameEnd(results) {
    const duration = Date.now() - this.startTime

    this.metadata.endTime = new Date().toISOString()
    this.metadata.duration = duration

    return this.createEntry(LOG_TYPE.GAME_END, {
      gameId: this.gameId,
      winner: results.winner,
      winnerStrategy: results.winnerStrategy,
      finalScores: results.finalScores,
      roundsPlayed: results.roundsPlayed || 1,
      totalTurns: this.stats.totalTurns,
      duration,
      winCondition: results.winCondition,
      statistics: this.getStatistics()
    })
  }

  // ============================================================================
  // Export and Analysis
  // ============================================================================

  /**
   * Get all logs
   */
  getLogs() {
    return this.logs
  }

  /**
   * Get logs by type
   * @param {string} type - Log type
   */
  getLogsByType(type) {
    return this.logs.filter(log => log.type === type)
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      totalLogs: this.logs.length,
      duration: Date.now() - this.startTime
    }
  }

  /**
   * Get game summary
   */
  getSummary() {
    const gameEnd = this.logs.find(log => log.type === LOG_TYPE.GAME_END)
    const decisions = this.getLogsByType(LOG_TYPE.DECISION)
    const errors = this.getLogsByType(LOG_TYPE.ERROR)
    const anomalies = this.getLogsByType(LOG_TYPE.ANOMALY)

    return {
      gameId: this.gameId,
      metadata: this.metadata,
      statistics: this.getStatistics(),
      winner: gameEnd?.data?.winner,
      finalScores: gameEnd?.data?.finalScores,
      totalDecisions: decisions.length,
      errorCount: errors.length,
      anomalyCount: anomalies.length,
      errors: errors.map(e => e.data),
      anomalies: anomalies.map(a => a.data)
    }
  }

  /**
   * Export logs to JSON file
   * @param {string} filename - Output filename (optional)
   */
  exportToJSON(filename = null) {
    const outputFile = filename || `${this.gameId}.json`
    const filepath = path.join(this.outputDir, outputFile)

    const exportData = {
      metadata: this.metadata,
      statistics: this.getStatistics(),
      summary: this.getSummary(),
      logs: this.logs
    }

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2))

    if (this.verbose) {
      console.log(`[Logger] Exported logs to: ${filepath}`)
    }

    return filepath
  }

  /**
   * Export condensed logs (for batch analysis)
   * @param {string} filename - Output filename (optional)
   */
  exportCondensed(filename = null) {
    const outputFile = filename || `${this.gameId}_condensed.json`
    const filepath = path.join(this.outputDir, outputFile)

    const condensed = {
      gameId: this.gameId,
      metadata: this.metadata,
      summary: this.getSummary(),
      decisions: this.getLogsByType(LOG_TYPE.DECISION).map(log => log.data),
      errors: this.getLogsByType(LOG_TYPE.ERROR).map(log => log.data),
      anomalies: this.getLogsByType(LOG_TYPE.ANOMALY).map(log => log.data)
    }

    fs.writeFileSync(filepath, JSON.stringify(condensed, null, 2))

    return filepath
  }

  /**
   * Clear logs
   */
  clear() {
    this.logs = []
    this.stats = {
      totalTurns: 0,
      totalDecisions: 0,
      totalErrors: 0,
      totalAnomalies: 0,
      decisionsByType: {},
      actionsByType: {}
    }
  }

  /**
   * Print summary to console
   */
  printSummary() {
    const summary = this.getSummary()

    console.log('\n' + '='.repeat(60))
    console.log('  GAME LOG SUMMARY')
    console.log('='.repeat(60))
    console.log(`Game ID: ${summary.gameId}`)
    console.log(`Duration: ${(summary.statistics.duration / 1000).toFixed(2)}s`)
    console.log(`Total Turns: ${summary.statistics.totalTurns}`)
    console.log(`Total Decisions: ${summary.totalDecisions}`)
    console.log(`Winner: ${summary.winner}`)
    console.log(`Errors: ${summary.errorCount}`)
    console.log(`Anomalies: ${summary.anomalyCount}`)

    if (summary.finalScores) {
      console.log('\nFinal Scores:')
      Object.entries(summary.finalScores).forEach(([id, score]) => {
        console.log(`  ${id}: ${score}`)
      })
    }

    console.log('='.repeat(60) + '\n')
  }
}

export default EnhancedBattleLogger
