/**
 * Battle Logger
 *
 * Logs game events during batch battles
 * Provides detailed logging for debugging and analysis
 */

export class BattleLogger {
  constructor() {
    this.log = []
    this.startTime = Date.now()
  }

  /**
   * Log game start
   */
  logGameStart(gameState, playerStrategies) {
    this.log.push({
      type: 'game_start',
      timestamp: Date.now(),
      playerCount: Object.keys(gameState.players).length,
      strategies: playerStrategies,
      settings: gameState.settings
    })
  }

  /**
   * Log turn start
   */
  logTurnStart(playerId, phase, handSize) {
    this.log.push({
      type: 'turn_start',
      timestamp: Date.now(),
      playerId,
      phase,
      handSize
    })
  }

  /**
   * Log AI decision
   */
  logDecision(playerId, phase, decision) {
    this.log.push({
      type: 'decision',
      timestamp: Date.now(),
      playerId,
      phase,
      decision: {
        action: decision.action,
        source: decision.source,
        cards: decision.cards,
        reasoning: decision.reasoning || null
      }
    })
  }

  /**
   * Log game event
   */
  logEvent(eventType, data) {
    this.log.push({
      type: eventType,
      timestamp: Date.now(),
      data
    })
  }

  /**
   * Log warning
   */
  logWarning(message) {
    this.log.push({
      type: 'warning',
      timestamp: Date.now(),
      message
    })
  }

  /**
   * Log error
   */
  logError(turnCount, playerId, error) {
    this.log.push({
      type: 'error',
      timestamp: Date.now(),
      turnCount,
      playerId,
      error: error.message,
      stack: error.stack
    })
  }

  /**
   * Log game end
   */
  logGameEnd(gameResult) {
    const duration = Date.now() - this.startTime

    this.log.push({
      type: 'game_end',
      timestamp: Date.now(),
      duration,
      winner: gameResult.winner,
      winnerStrategy: gameResult.winnerStrategy,
      turnCount: gameResult.turnCount,
      finalScores: gameResult.finalScores
    })
  }

  /**
   * Get complete log
   */
  getLog() {
    return this.log
  }

  /**
   * Get log as formatted JSON
   */
  toJSON() {
    return JSON.stringify(this.log, null, 2)
  }

  /**
   * Get summary statistics from log
   */
  getSummary() {
    const events = this.log.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1
      return acc
    }, {})

    const decisions = this.log
      .filter(entry => entry.type === 'decision')
      .map(entry => entry.decision)

    const errors = this.log
      .filter(entry => entry.type === 'error')
      .map(entry => ({ turnCount: entry.turnCount, playerId: entry.playerId, error: entry.error }))

    const gameEnd = this.log.find(entry => entry.type === 'game_end')

    return {
      eventCounts: events,
      totalDecisions: decisions.length,
      errorCount: errors.length,
      errors,
      duration: gameEnd?.duration,
      turnCount: gameEnd?.turnCount
    }
  }
}
