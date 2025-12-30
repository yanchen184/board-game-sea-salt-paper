/**
 * Bug Detector
 *
 * Detects bugs, invariant violations, and anomalies in game simulations
 * Provides comprehensive checks for game state integrity
 *
 * Features:
 * - Invariant checking (hand size, deck integrity, turn order)
 * - Infinite loop detection
 * - State consistency validation
 * - Bug report generation
 */

import fs from 'fs'
import path from 'path'

/**
 * Bug severity levels
 */
export const BUG_SEVERITY = {
  CRITICAL: 'critical',   // Game-breaking bugs
  HIGH: 'high',           // Major bugs affecting gameplay
  MEDIUM: 'medium',       // Moderate issues
  LOW: 'low',             // Minor issues
  INFO: 'info'            // Informational
}

/**
 * Bug categories
 */
export const BUG_CATEGORY = {
  INVARIANT_VIOLATION: 'invariant_violation',
  INFINITE_LOOP: 'infinite_loop',
  STATE_CORRUPTION: 'state_corruption',
  LOGIC_ERROR: 'logic_error',
  DATA_INTEGRITY: 'data_integrity',
  TURN_ORDER: 'turn_order',
  SCORE_CALCULATION: 'score_calculation',
  CARD_MANAGEMENT: 'card_management'
}

/**
 * BugDetector class
 */
export class BugDetector {
  constructor(options = {}) {
    this.bugs = []
    this.warnings = []
    this.checksPerformed = 0
    this.checksPass = 0
    this.checksFailed = 0

    // Configuration
    this.maxHandSize = options.maxHandSize || 20
    this.maxTurns = options.maxTurns || 500
    this.maxConsecutiveSameState = options.maxConsecutiveSameState || 10
    this.totalCardCount = options.totalCardCount || 72

    // Loop detection
    this.stateHistory = []
    this.actionHistory = []
    this.consecutiveSameStateCount = 0
    this.lastStateHash = null

    // Output directory
    this.outputDir = options.outputDir || './scripts/output/bugs'
    this.ensureOutputDir()
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
   * Add a bug
   * @param {string} category - Bug category
   * @param {string} severity - Bug severity
   * @param {string} description - Bug description
   * @param {Object} details - Bug details
   */
  addBug(category, severity, description, details = {}) {
    const bug = {
      id: this.bugs.length + 1,
      timestamp: Date.now(),
      category,
      severity,
      description,
      details
    }

    this.bugs.push(bug)
    this.checksFailed++

    console.error(`[BUG DETECTED] [${severity.toUpperCase()}] ${description}`)

    return bug
  }

  /**
   * Add a warning (potential issue)
   * @param {string} message - Warning message
   * @param {Object} context - Warning context
   */
  addWarning(message, context = {}) {
    const warning = {
      id: this.warnings.length + 1,
      timestamp: Date.now(),
      message,
      context
    }

    this.warnings.push(warning)

    return warning
  }

  // ============================================================================
  // Invariant Checks
  // ============================================================================

  /**
   * Run all invariant checks
   * @param {Object} gameState - Current game state
   * @returns {Object} Check results
   */
  runAllChecks(gameState) {
    const results = {
      passed: [],
      failed: []
    }

    // Hand size check
    const handSizeResult = this.checkHandSize(gameState)
    results[handSizeResult.passed ? 'passed' : 'failed'].push(handSizeResult)

    // Deck integrity check
    const deckResult = this.checkDeckIntegrity(gameState)
    results[deckResult.passed ? 'passed' : 'failed'].push(deckResult)

    // Turn order check
    const turnResult = this.checkTurnOrder(gameState)
    results[turnResult.passed ? 'passed' : 'failed'].push(turnResult)

    // Card count check
    const cardCountResult = this.checkTotalCardCount(gameState)
    results[cardCountResult.passed ? 'passed' : 'failed'].push(cardCountResult)

    // Player state check
    const playerStateResult = this.checkPlayerStates(gameState)
    results[playerStateResult.passed ? 'passed' : 'failed'].push(playerStateResult)

    // Phase validity check
    const phaseResult = this.checkPhaseValidity(gameState)
    results[phaseResult.passed ? 'passed' : 'failed'].push(phaseResult)

    // Score validity check
    const scoreResult = this.checkScoreValidity(gameState)
    results[scoreResult.passed ? 'passed' : 'failed'].push(scoreResult)

    return results
  }

  /**
   * Check hand size invariant
   * All players should have reasonable hand sizes
   */
  checkHandSize(gameState) {
    this.checksPerformed++

    const violations = []

    Object.entries(gameState.players || {}).forEach(([playerId, player]) => {
      const handSize = (player.hand || []).length

      if (handSize > this.maxHandSize) {
        violations.push({
          playerId,
          handSize,
          issue: `Hand size ${handSize} exceeds maximum ${this.maxHandSize}`
        })
      }

      if (handSize < 0) {
        violations.push({
          playerId,
          handSize,
          issue: `Negative hand size: ${handSize}`
        })
      }
    })

    if (violations.length > 0) {
      this.addBug(
        BUG_CATEGORY.INVARIANT_VIOLATION,
        BUG_SEVERITY.HIGH,
        'Hand size invariant violated',
        { violations }
      )

      return { check: 'handSize', passed: false, violations }
    }

    this.checksPass++
    return { check: 'handSize', passed: true }
  }

  /**
   * Check deck integrity
   * No duplicate cards, all cards valid
   */
  checkDeckIntegrity(gameState) {
    this.checksPerformed++

    const deck = gameState.deck || []
    const violations = []

    // Check for duplicates within deck
    const deckIds = deck.map(c => c.id)
    const duplicates = deckIds.filter((id, index) => deckIds.indexOf(id) !== index)

    if (duplicates.length > 0) {
      violations.push({
        issue: 'Duplicate cards in deck',
        duplicates
      })
    }

    // Check for null/undefined cards
    const invalidCards = deck.filter(c => !c || !c.id || !c.name)
    if (invalidCards.length > 0) {
      violations.push({
        issue: 'Invalid cards in deck',
        count: invalidCards.length
      })
    }

    if (violations.length > 0) {
      this.addBug(
        BUG_CATEGORY.DATA_INTEGRITY,
        BUG_SEVERITY.HIGH,
        'Deck integrity violated',
        { violations }
      )

      return { check: 'deckIntegrity', passed: false, violations }
    }

    this.checksPass++
    return { check: 'deckIntegrity', passed: true }
  }

  /**
   * Check turn order validity
   */
  checkTurnOrder(gameState) {
    this.checksPerformed++

    const violations = []
    const playerOrder = gameState.playerOrder || []
    const currentPlayerId = gameState.currentPlayerId
    const currentPlayerIndex = gameState.currentPlayerIndex

    // Check if current player is valid
    if (currentPlayerId && !playerOrder.includes(currentPlayerId)) {
      violations.push({
        issue: 'Current player ID not in player order',
        currentPlayerId,
        playerOrder
      })
    }

    // Check if current player index is valid
    if (currentPlayerIndex !== undefined) {
      if (currentPlayerIndex < 0 || currentPlayerIndex >= playerOrder.length) {
        violations.push({
          issue: 'Invalid current player index',
          currentPlayerIndex,
          playerOrderLength: playerOrder.length
        })
      }

      // Check consistency between index and ID
      if (playerOrder[currentPlayerIndex] !== currentPlayerId) {
        violations.push({
          issue: 'Player index and ID mismatch',
          currentPlayerIndex,
          expectedPlayerId: playerOrder[currentPlayerIndex],
          actualPlayerId: currentPlayerId
        })
      }
    }

    if (violations.length > 0) {
      this.addBug(
        BUG_CATEGORY.TURN_ORDER,
        BUG_SEVERITY.MEDIUM,
        'Turn order violation detected',
        { violations }
      )

      return { check: 'turnOrder', passed: false, violations }
    }

    this.checksPass++
    return { check: 'turnOrder', passed: true }
  }

  /**
   * Check total card count
   * Total cards in game should equal expected count
   */
  checkTotalCardCount(gameState) {
    this.checksPerformed++

    let totalCards = 0

    // Cards in deck
    totalCards += (gameState.deck || []).length

    // Cards in discard piles
    totalCards += (gameState.discardLeft || []).length
    totalCards += (gameState.discardRight || []).length

    // Cards in player hands and played pairs
    Object.values(gameState.players || {}).forEach(player => {
      totalCards += (player.hand || []).length
      totalCards += (player.playedPairs || []).reduce((sum, pair) => {
        return sum + (pair.cards || []).length
      }, 0)
    })

    if (totalCards !== this.totalCardCount) {
      // This might be a warning rather than bug if cards are legitimately removed
      this.addWarning(`Card count mismatch: expected ${this.totalCardCount}, found ${totalCards}`, {
        totalCards,
        expected: this.totalCardCount
      })

      // Only treat as bug if count is higher (cards duplicated)
      if (totalCards > this.totalCardCount) {
        this.addBug(
          BUG_CATEGORY.DATA_INTEGRITY,
          BUG_SEVERITY.CRITICAL,
          'Card duplication detected',
          { totalCards, expected: this.totalCardCount }
        )
        return { check: 'cardCount', passed: false, totalCards, expected: this.totalCardCount }
      }
    }

    this.checksPass++
    return { check: 'cardCount', passed: true, totalCards, expected: this.totalCardCount }
  }

  /**
   * Check player states validity
   */
  checkPlayerStates(gameState) {
    this.checksPerformed++

    const violations = []

    Object.entries(gameState.players || {}).forEach(([playerId, player]) => {
      // Check for required properties
      if (!Array.isArray(player.hand)) {
        violations.push({
          playerId,
          issue: 'Missing or invalid hand array'
        })
      }

      // Check for negative score
      if (typeof player.score === 'number' && player.score < 0) {
        violations.push({
          playerId,
          issue: `Negative score: ${player.score}`
        })
      }

      // Check played pairs validity
      if (player.playedPairs) {
        player.playedPairs.forEach((pair, index) => {
          if (!pair.cards || !Array.isArray(pair.cards)) {
            violations.push({
              playerId,
              issue: `Invalid played pair at index ${index}`
            })
          }
        })
      }
    })

    if (violations.length > 0) {
      this.addBug(
        BUG_CATEGORY.STATE_CORRUPTION,
        BUG_SEVERITY.HIGH,
        'Player state corruption detected',
        { violations }
      )

      return { check: 'playerStates', passed: false, violations }
    }

    this.checksPass++
    return { check: 'playerStates', passed: true }
  }

  /**
   * Check phase validity
   */
  checkPhaseValidity(gameState) {
    this.checksPerformed++

    const validPhases = ['draw', 'pair', 'declare', 'declare_showing', 'round_end', 'effect', 'steal']
    const currentPhase = gameState.turnPhase

    if (currentPhase && !validPhases.includes(currentPhase)) {
      this.addBug(
        BUG_CATEGORY.LOGIC_ERROR,
        BUG_SEVERITY.MEDIUM,
        `Invalid turn phase: ${currentPhase}`,
        { currentPhase, validPhases }
      )

      return { check: 'phaseValidity', passed: false, currentPhase }
    }

    this.checksPass++
    return { check: 'phaseValidity', passed: true }
  }

  /**
   * Check score validity
   */
  checkScoreValidity(gameState) {
    this.checksPerformed++

    const violations = []

    Object.entries(gameState.players || {}).forEach(([playerId, player]) => {
      const score = player.score || 0

      // Check for NaN
      if (isNaN(score)) {
        violations.push({
          playerId,
          issue: 'Score is NaN'
        })
      }

      // Check for Infinity
      if (!isFinite(score)) {
        violations.push({
          playerId,
          issue: `Score is infinite: ${score}`
        })
      }
    })

    if (violations.length > 0) {
      this.addBug(
        BUG_CATEGORY.SCORE_CALCULATION,
        BUG_SEVERITY.HIGH,
        'Score calculation error detected',
        { violations }
      )

      return { check: 'scoreValidity', passed: false, violations }
    }

    this.checksPass++
    return { check: 'scoreValidity', passed: true }
  }

  // ============================================================================
  // Infinite Loop Detection
  // ============================================================================

  /**
   * Check for infinite loop
   * @param {Object} gameState - Current game state
   * @param {number} turnCount - Current turn count
   * @returns {Object} Loop detection result
   */
  checkInfiniteLoop(gameState, turnCount) {
    // Check turn count limit
    if (turnCount > this.maxTurns) {
      this.addBug(
        BUG_CATEGORY.INFINITE_LOOP,
        BUG_SEVERITY.CRITICAL,
        `Possible infinite loop: turn count ${turnCount} exceeds maximum ${this.maxTurns}`,
        { turnCount, maxTurns: this.maxTurns }
      )

      return {
        detected: true,
        reason: 'max_turns_exceeded',
        turnCount
      }
    }

    // Check for repeated state
    const stateHash = this.hashGameState(gameState)

    if (stateHash === this.lastStateHash) {
      this.consecutiveSameStateCount++

      if (this.consecutiveSameStateCount >= this.maxConsecutiveSameState) {
        this.addBug(
          BUG_CATEGORY.INFINITE_LOOP,
          BUG_SEVERITY.CRITICAL,
          `Possible infinite loop: same state repeated ${this.consecutiveSameStateCount} times`,
          {
            consecutiveCount: this.consecutiveSameStateCount,
            stateHash
          }
        )

        return {
          detected: true,
          reason: 'repeated_state',
          consecutiveCount: this.consecutiveSameStateCount
        }
      }
    } else {
      this.consecutiveSameStateCount = 0
    }

    this.lastStateHash = stateHash

    // Track state history
    this.stateHistory.push({
      turnCount,
      hash: stateHash,
      phase: gameState.turnPhase,
      currentPlayer: gameState.currentPlayerId
    })

    // Keep history manageable
    if (this.stateHistory.length > 100) {
      this.stateHistory = this.stateHistory.slice(-50)
    }

    return { detected: false }
  }

  /**
   * Track action for loop detection
   * @param {string} playerId - Player ID
   * @param {string} action - Action type
   * @param {Object} details - Action details
   */
  trackAction(playerId, action, details = {}) {
    this.actionHistory.push({
      timestamp: Date.now(),
      playerId,
      action,
      details
    })

    // Keep history manageable
    if (this.actionHistory.length > 200) {
      this.actionHistory = this.actionHistory.slice(-100)
    }
  }

  /**
   * Hash game state for comparison
   * @param {Object} gameState - Game state to hash
   * @returns {string} State hash
   */
  hashGameState(gameState) {
    const significantState = {
      deckSize: (gameState.deck || []).length,
      currentPlayer: gameState.currentPlayerId,
      phase: gameState.turnPhase,
      players: Object.entries(gameState.players || {}).map(([id, player]) => ({
        id,
        handSize: (player.hand || []).length,
        pairsCount: (player.playedPairs || []).length,
        score: player.score || 0
      }))
    }

    return JSON.stringify(significantState)
  }

  /**
   * Detect action pattern that might indicate loop
   * @returns {Object} Pattern detection result
   */
  detectActionPattern() {
    if (this.actionHistory.length < 10) {
      return { detected: false }
    }

    // Look for repeating patterns
    const recentActions = this.actionHistory.slice(-20)
    const actionSequence = recentActions.map(a => `${a.playerId}:${a.action}`).join(',')

    // Check for simple repeating patterns
    for (let patternLength = 2; patternLength <= 5; patternLength++) {
      const pattern = actionSequence.slice(-patternLength * 10)
      const halfPattern = pattern.slice(0, pattern.length / 2)

      if (pattern.endsWith(halfPattern) && halfPattern.length > 20) {
        return {
          detected: true,
          patternLength,
          pattern: halfPattern
        }
      }
    }

    return { detected: false }
  }

  // ============================================================================
  // Bug Report Generation
  // ============================================================================

  /**
   * Get all detected bugs
   */
  getBugs() {
    return this.bugs
  }

  /**
   * Get bugs by severity
   * @param {string} severity - Severity level
   */
  getBugsBySeverity(severity) {
    return this.bugs.filter(bug => bug.severity === severity)
  }

  /**
   * Get bugs by category
   * @param {string} category - Bug category
   */
  getBugsByCategory(category) {
    return this.bugs.filter(bug => bug.category === category)
  }

  /**
   * Check if any critical bugs exist
   */
  hasCriticalBugs() {
    return this.bugs.some(bug => bug.severity === BUG_SEVERITY.CRITICAL)
  }

  /**
   * Get bug summary
   */
  getSummary() {
    const bySeverity = {}
    const byCategory = {}

    this.bugs.forEach(bug => {
      bySeverity[bug.severity] = (bySeverity[bug.severity] || 0) + 1
      byCategory[bug.category] = (byCategory[bug.category] || 0) + 1
    })

    return {
      totalBugs: this.bugs.length,
      totalWarnings: this.warnings.length,
      checksPerformed: this.checksPerformed,
      checksPassed: this.checksPass,
      checksFailed: this.checksFailed,
      bySeverity,
      byCategory,
      hasCritical: this.hasCriticalBugs()
    }
  }

  /**
   * Generate bug report
   * @param {string} gameId - Game ID for reference
   */
  generateReport(gameId = 'unknown') {
    const summary = this.getSummary()

    const report = {
      reportId: `bug_report_${Date.now()}`,
      gameId,
      generatedAt: new Date().toISOString(),
      summary,
      bugs: this.bugs,
      warnings: this.warnings,
      stateHistory: this.stateHistory.slice(-20),
      actionHistory: this.actionHistory.slice(-50)
    }

    return report
  }

  /**
   * Save bug report to file
   * @param {string} gameId - Game ID
   */
  saveReport(gameId = 'unknown') {
    const report = this.generateReport(gameId)
    const filename = `bug_report_${gameId}_${Date.now()}.json`
    const filepath = path.join(this.outputDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2))

    console.log(`[BugDetector] Report saved to: ${filepath}`)

    return filepath
  }

  /**
   * Print bug summary to console
   */
  printSummary() {
    const summary = this.getSummary()

    console.log('\n' + '='.repeat(60))
    console.log('  BUG DETECTION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Bugs: ${summary.totalBugs}`)
    console.log(`Total Warnings: ${summary.totalWarnings}`)
    console.log(`Checks: ${summary.checksPassed}/${summary.checksPerformed} passed`)

    if (summary.totalBugs > 0) {
      console.log('\nBugs by Severity:')
      Object.entries(summary.bySeverity).forEach(([severity, count]) => {
        console.log(`  ${severity}: ${count}`)
      })

      console.log('\nBugs by Category:')
      Object.entries(summary.byCategory).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`)
      })
    }

    console.log('='.repeat(60) + '\n')
  }

  /**
   * Reset detector state
   */
  reset() {
    this.bugs = []
    this.warnings = []
    this.checksPerformed = 0
    this.checksPass = 0
    this.checksFailed = 0
    this.stateHistory = []
    this.actionHistory = []
    this.consecutiveSameStateCount = 0
    this.lastStateHash = null
  }
}

export default BugDetector
