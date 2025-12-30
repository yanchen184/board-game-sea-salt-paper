/**
 * Training Data Collector
 *
 * Collects decision data from AI battles for machine learning training
 * Extracts features, labels, and exports to JSON/CSV formats
 *
 * Features:
 * - Feature extraction from game state
 * - Decision labeling with outcomes
 * - JSON and CSV export formats
 * - Data normalization and preprocessing
 */

import fs from 'fs'
import path from 'path'

/**
 * Feature types for machine learning
 */
export const FEATURE_TYPE = {
  NUMERIC: 'numeric',
  CATEGORICAL: 'categorical',
  BOOLEAN: 'boolean',
  ARRAY: 'array'
}

/**
 * Decision types to collect
 */
export const DECISION_TYPE = {
  DRAW: 'draw',
  PAIR: 'pair',
  DECLARE: 'declare'
}

/**
 * TrainingDataCollector class
 */
export class TrainingDataCollector {
  constructor(options = {}) {
    this.samples = []
    this.gameId = options.gameId || null
    this.outputDir = options.outputDir || './scripts/output/training'
    this.includeRawState = options.includeRawState || false

    // Feature configuration
    this.featureConfig = {
      maxHandSize: 20,
      maxDeckSize: 72,
      maxPairs: 10,
      maxTurns: 200
    }

    // Statistics
    this.stats = {
      totalSamples: 0,
      samplesByType: {},
      samplesByOutcome: {}
    }

    // Ensure output directory exists
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
   * Set game ID for current batch
   * @param {string} gameId - Game ID
   */
  setGameId(gameId) {
    this.gameId = gameId
  }

  // ============================================================================
  // Feature Extraction
  // ============================================================================

  /**
   * Extract features from game state for a specific player
   * @param {Object} gameState - Current game state
   * @param {string} playerId - Player ID
   * @returns {Object} Extracted features
   */
  extractFeatures(gameState, playerId) {
    const player = gameState.players[playerId]
    const hand = player.hand || []
    const playedPairs = player.playedPairs || []

    // Basic features
    const basicFeatures = this.extractBasicFeatures(gameState, player)

    // Hand features
    const handFeatures = this.extractHandFeatures(hand)

    // Card composition features
    const cardFeatures = this.extractCardCompositionFeatures(hand)

    // Pair features
    const pairFeatures = this.extractPairFeatures(hand, playedPairs)

    // Discard pile features
    const discardFeatures = this.extractDiscardFeatures(gameState)

    // Game progress features
    const progressFeatures = this.extractProgressFeatures(gameState, playerId)

    // Opponent features
    const opponentFeatures = this.extractOpponentFeatures(gameState, playerId)

    return {
      ...basicFeatures,
      ...handFeatures,
      ...cardFeatures,
      ...pairFeatures,
      ...discardFeatures,
      ...progressFeatures,
      ...opponentFeatures
    }
  }

  /**
   * Extract basic game features
   */
  extractBasicFeatures(gameState, player) {
    return {
      // Player state
      handSize: (player.hand || []).length,
      playedPairsCount: (player.playedPairs || []).length,
      currentScore: player.score || 0,

      // Game state
      deckSize: (gameState.deck || []).length,
      turnCount: gameState.turnCount || 0,
      round: gameState.round || 1,
      playerCount: Object.keys(gameState.players || {}).length,

      // Normalized values (0-1 range)
      handSizeNorm: Math.min((player.hand || []).length / this.featureConfig.maxHandSize, 1),
      deckSizeNorm: Math.min((gameState.deck || []).length / this.featureConfig.maxDeckSize, 1),
      turnCountNorm: Math.min((gameState.turnCount || 0) / this.featureConfig.maxTurns, 1)
    }
  }

  /**
   * Extract hand-specific features
   */
  extractHandFeatures(hand) {
    if (!hand || hand.length === 0) {
      return {
        handValue: 0,
        avgCardValue: 0,
        maxCardValue: 0,
        minCardValue: 0
      }
    }

    const values = hand.map(c => c.value || 0)
    const totalValue = values.reduce((sum, v) => sum + v, 0)

    return {
      handValue: totalValue,
      avgCardValue: totalValue / hand.length,
      maxCardValue: Math.max(...values),
      minCardValue: Math.min(...values)
    }
  }

  /**
   * Extract card composition features
   */
  extractCardCompositionFeatures(hand) {
    const cardCounts = {}
    const colorCounts = {}

    hand.forEach(card => {
      cardCounts[card.name] = (cardCounts[card.name] || 0) + 1
      if (card.color && card.color !== 'multicolor') {
        colorCounts[card.color] = (colorCounts[card.color] || 0) + 1
      }
    })

    // Count specific card types
    const features = {
      // Pair effect cards
      fishCount: cardCounts['Fish'] || 0,
      crabCount: cardCounts['Crab'] || 0,
      sailboatCount: cardCounts['Sailboat'] || 0,
      sharkCount: cardCounts['Shark'] || 0,
      swimmerCount: cardCounts['Swimmer'] || 0,

      // Collection cards
      shellCount: cardCounts['Shell'] || 0,
      octopusCount: cardCounts['Octopus'] || 0,
      penguinCount: cardCounts['Penguin'] || 0,
      sailorCount: cardCounts['Sailor'] || 0,

      // Multiplier cards
      lighthouseCount: cardCounts['Lighthouse'] || 0,
      fishSchoolCount: cardCounts['FishSchool'] || 0,
      penguinColonyCount: cardCounts['PenguinColony'] || 0,
      captainCount: cardCounts['Captain'] || 0,

      // Special cards
      mermaidCount: cardCounts['Mermaid'] || 0,
      starfishCount: cardCounts['Starfish'] || 0,

      // Color diversity
      uniqueColors: Object.keys(colorCounts).length,
      dominantColorCount: Math.max(...Object.values(colorCounts), 0),

      // Card type diversity
      uniqueCardTypes: Object.keys(cardCounts).length
    }

    // Color breakdown
    const colors = ['blue', 'red', 'green', 'yellow', 'gray', 'purple', 'orange']
    colors.forEach(color => {
      features[`color_${color}`] = colorCounts[color] || 0
    })

    return features
  }

  /**
   * Extract pair-related features
   */
  extractPairFeatures(hand, playedPairs) {
    const pairTypes = ['Fish', 'Crab', 'Sailboat']
    let potentialPairs = 0
    let potentialSharkSwimmer = 0

    // Count potential pairs
    const cardCounts = {}
    hand.forEach(card => {
      cardCounts[card.name] = (cardCounts[card.name] || 0) + 1
    })

    pairTypes.forEach(type => {
      potentialPairs += Math.floor((cardCounts[type] || 0) / 2)
    })

    // Check for Shark + Swimmer
    potentialSharkSwimmer = Math.min(cardCounts['Shark'] || 0, cardCounts['Swimmer'] || 0)

    // Pair effects in played pairs
    const pairEffects = {
      playedDrawBlind: 0,
      playedDrawDiscard: 0,
      playedExtraTurn: 0,
      playedStealCard: 0
    }

    playedPairs.forEach(pair => {
      const cards = pair.cards || []
      if (cards.length === 2) {
        const effect = cards[0].pairEffect
        switch (effect) {
          case 'draw_blind':
            pairEffects.playedDrawBlind++
            break
          case 'draw_discard':
            pairEffects.playedDrawDiscard++
            break
          case 'extra_turn':
            pairEffects.playedExtraTurn++
            break
          case 'steal_card':
            pairEffects.playedStealCard++
            break
        }
      }
    })

    return {
      potentialPairs,
      potentialSharkSwimmer,
      hasPairAvailable: potentialPairs > 0 || potentialSharkSwimmer > 0,
      ...pairEffects
    }
  }

  /**
   * Extract discard pile features
   */
  extractDiscardFeatures(gameState) {
    const discardLeft = gameState.discardLeft || []
    const discardRight = gameState.discardRight || []

    const leftTop = discardLeft.length > 0 ? discardLeft[discardLeft.length - 1] : null
    const rightTop = discardRight.length > 0 ? discardRight[discardRight.length - 1] : null

    return {
      discardLeftSize: discardLeft.length,
      discardRightSize: discardRight.length,
      leftTopValue: leftTop?.value || 0,
      rightTopValue: rightTop?.value || 0,
      leftTopIsPairable: leftTop ? ['Fish', 'Crab', 'Sailboat', 'Shark', 'Swimmer'].includes(leftTop.name) : false,
      rightTopIsPairable: rightTop ? ['Fish', 'Crab', 'Sailboat', 'Shark', 'Swimmer'].includes(rightTop.name) : false,
      leftTopCardType: leftTop?.name || 'none',
      rightTopCardType: rightTop?.name || 'none'
    }
  }

  /**
   * Extract game progress features
   */
  extractProgressFeatures(gameState, playerId) {
    const targetScore = gameState.targetScore || 40
    const player = gameState.players[playerId]
    const currentScore = player.score || 0

    // Calculate score progress for all players
    let leadingPlayerId = null
    let maxScore = 0
    let totalOpponentScore = 0
    let opponentCount = 0

    Object.entries(gameState.players).forEach(([id, p]) => {
      const score = p.score || 0
      if (score > maxScore) {
        maxScore = score
        leadingPlayerId = id
      }
      if (id !== playerId) {
        totalOpponentScore += score
        opponentCount++
      }
    })

    return {
      targetScore,
      scoreProgress: currentScore / targetScore,
      distanceToTarget: targetScore - currentScore,
      isLeading: leadingPlayerId === playerId,
      leadScore: maxScore,
      scoreDifferential: currentScore - maxScore,
      avgOpponentScore: opponentCount > 0 ? totalOpponentScore / opponentCount : 0,

      // Declare eligibility
      canDeclare: currentScore >= 7,
      scoreAboveThreshold: currentScore - 7,

      // Game phase indicators
      isEarlyGame: (gameState.turnCount || 0) < 10,
      isMidGame: (gameState.turnCount || 0) >= 10 && (gameState.turnCount || 0) < 25,
      isLateGame: (gameState.turnCount || 0) >= 25,

      // Declare mode active
      declareActive: !!gameState.declareMode,
      isLastChance: gameState.declareMode === 'last_chance'
    }
  }

  /**
   * Extract opponent features
   */
  extractOpponentFeatures(gameState, playerId) {
    const opponents = Object.entries(gameState.players)
      .filter(([id]) => id !== playerId)
      .map(([id, player]) => ({
        id,
        handSize: (player.hand || []).length,
        playedPairsCount: (player.playedPairs || []).length,
        score: player.score || 0
      }))

    if (opponents.length === 0) {
      return {
        maxOpponentHandSize: 0,
        minOpponentHandSize: 0,
        avgOpponentHandSize: 0,
        maxOpponentPairs: 0,
        avgOpponentPairs: 0
      }
    }

    const handSizes = opponents.map(o => o.handSize)
    const pairCounts = opponents.map(o => o.playedPairsCount)

    return {
      maxOpponentHandSize: Math.max(...handSizes),
      minOpponentHandSize: Math.min(...handSizes),
      avgOpponentHandSize: handSizes.reduce((a, b) => a + b, 0) / handSizes.length,
      maxOpponentPairs: Math.max(...pairCounts),
      avgOpponentPairs: pairCounts.reduce((a, b) => a + b, 0) / pairCounts.length
    }
  }

  // ============================================================================
  // Sample Collection
  // ============================================================================

  /**
   * Collect a decision sample
   * @param {Object} params - Sample parameters
   */
  collectSample(params) {
    const {
      gameState,
      playerId,
      decisionType,
      decision,
      options,
      outcome = null
    } = params

    const features = this.extractFeatures(gameState, playerId)

    const sample = {
      id: this.samples.length + 1,
      gameId: this.gameId,
      timestamp: Date.now(),
      playerId,
      decisionType,

      // Features
      features,

      // Decision made
      decision: {
        action: decision.action,
        source: decision.source,
        cards: decision.cards?.map(c => c.id),
        type: decision.type
      },

      // Available options
      options: options?.map(opt => ({
        action: opt.action || opt.source,
        score: opt.score,
        cards: opt.cards?.map(c => c.id)
      })),

      // Outcome (populated later)
      outcome
    }

    // Optionally include raw state
    if (this.includeRawState) {
      sample.rawState = {
        deck: gameState.deck?.length,
        turnPhase: gameState.turnPhase,
        turnCount: gameState.turnCount
      }
    }

    this.samples.push(sample)
    this.stats.totalSamples++
    this.stats.samplesByType[decisionType] = (this.stats.samplesByType[decisionType] || 0) + 1

    return sample
  }

  /**
   * Collect draw decision sample
   */
  collectDrawSample(gameState, playerId, decision, options) {
    return this.collectSample({
      gameState,
      playerId,
      decisionType: DECISION_TYPE.DRAW,
      decision,
      options
    })
  }

  /**
   * Collect pair decision sample
   */
  collectPairSample(gameState, playerId, decision, availablePairs) {
    return this.collectSample({
      gameState,
      playerId,
      decisionType: DECISION_TYPE.PAIR,
      decision,
      options: availablePairs?.map(pair => ({
        action: 'play_pair',
        cards: pair
      }))
    })
  }

  /**
   * Collect declare decision sample
   */
  collectDeclareSample(gameState, playerId, decision, scoreBreakdown) {
    return this.collectSample({
      gameState,
      playerId,
      decisionType: DECISION_TYPE.DECLARE,
      decision,
      options: [
        { action: 'declare_stop' },
        { action: 'declare_last_chance' },
        { action: 'end_turn' }
      ]
    })
  }

  /**
   * Update sample with outcome
   * @param {number} sampleId - Sample ID
   * @param {Object} outcome - Outcome data
   */
  updateOutcome(sampleId, outcome) {
    const sample = this.samples.find(s => s.id === sampleId)
    if (sample) {
      sample.outcome = outcome
      this.stats.samplesByOutcome[outcome.result] = (this.stats.samplesByOutcome[outcome.result] || 0) + 1
    }
  }

  /**
   * Add game outcome to all samples from current game
   * @param {Object} gameResult - Game result
   */
  addGameOutcome(gameResult) {
    const { winner, finalScores, winCondition } = gameResult

    this.samples
      .filter(s => s.gameId === this.gameId)
      .forEach(sample => {
        const isWinner = sample.playerId === winner
        sample.gameOutcome = {
          won: isWinner,
          finalScore: finalScores[sample.playerId] || 0,
          winCondition
        }
      })
  }

  // ============================================================================
  // Export Functions
  // ============================================================================

  /**
   * Get all samples
   */
  getSamples() {
    return this.samples
  }

  /**
   * Get samples by decision type
   * @param {string} type - Decision type
   */
  getSamplesByType(type) {
    return this.samples.filter(s => s.decisionType === type)
  }

  /**
   * Get feature names
   */
  getFeatureNames() {
    if (this.samples.length === 0) return []
    return Object.keys(this.samples[0].features)
  }

  /**
   * Convert samples to flat feature array format
   */
  toFeatureArrays() {
    const featureNames = this.getFeatureNames()

    return this.samples.map(sample => {
      const featureValues = featureNames.map(name => {
        const value = sample.features[name]
        // Convert boolean to 0/1
        if (typeof value === 'boolean') return value ? 1 : 0
        // Convert string to numeric (one-hot encoding would be better for ML)
        if (typeof value === 'string') return 0
        return value || 0
      })

      return {
        id: sample.id,
        features: featureValues,
        label: sample.decision.action,
        won: sample.gameOutcome?.won ? 1 : 0
      }
    })
  }

  /**
   * Export to JSON
   * @param {string} filename - Output filename
   */
  exportToJSON(filename = null) {
    const outputFile = filename || `training_data_${Date.now()}.json`
    const filepath = path.join(this.outputDir, outputFile)

    const exportData = {
      metadata: {
        totalSamples: this.samples.length,
        exportedAt: new Date().toISOString(),
        featureNames: this.getFeatureNames(),
        stats: this.stats
      },
      samples: this.samples
    }

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2))
    console.log(`[TrainingDataCollector] Exported ${this.samples.length} samples to: ${filepath}`)

    return filepath
  }

  /**
   * Export to CSV format
   * @param {string} filename - Output filename
   */
  exportToCSV(filename = null) {
    if (this.samples.length === 0) {
      console.warn('[TrainingDataCollector] No samples to export')
      return null
    }

    const outputFile = filename || `training_data_${Date.now()}.csv`
    const filepath = path.join(this.outputDir, outputFile)

    const featureNames = this.getFeatureNames()

    // Build CSV header
    const headers = [
      'sample_id',
      'game_id',
      'player_id',
      'decision_type',
      'action',
      ...featureNames,
      'won'
    ]

    // Build CSV rows
    const rows = this.samples.map(sample => {
      const featureValues = featureNames.map(name => {
        const value = sample.features[name]
        if (typeof value === 'boolean') return value ? 1 : 0
        if (typeof value === 'string') return `"${value}"`
        return value || 0
      })

      return [
        sample.id,
        sample.gameId || '',
        sample.playerId,
        sample.decisionType,
        sample.decision.action,
        ...featureValues,
        sample.gameOutcome?.won ? 1 : 0
      ]
    })

    // Write CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    fs.writeFileSync(filepath, csvContent)
    console.log(`[TrainingDataCollector] Exported ${this.samples.length} samples to CSV: ${filepath}`)

    return filepath
  }

  /**
   * Export feature statistics
   * @param {string} filename - Output filename
   */
  exportFeatureStats(filename = null) {
    if (this.samples.length === 0) return null

    const outputFile = filename || `feature_stats_${Date.now()}.json`
    const filepath = path.join(this.outputDir, outputFile)

    const featureNames = this.getFeatureNames()
    const stats = {}

    featureNames.forEach(name => {
      const values = this.samples
        .map(s => s.features[name])
        .filter(v => typeof v === 'number')

      if (values.length > 0) {
        stats[name] = {
          min: Math.min(...values),
          max: Math.max(...values),
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          count: values.length
        }
      }
    })

    fs.writeFileSync(filepath, JSON.stringify(stats, null, 2))
    console.log(`[TrainingDataCollector] Exported feature stats to: ${filepath}`)

    return filepath
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      featureCount: this.getFeatureNames().length
    }
  }

  /**
   * Clear all samples
   */
  clear() {
    this.samples = []
    this.stats = {
      totalSamples: 0,
      samplesByType: {},
      samplesByOutcome: {}
    }
  }

  /**
   * Print statistics summary
   */
  printStats() {
    const stats = this.getStats()

    console.log('\n' + '='.repeat(60))
    console.log('  TRAINING DATA STATISTICS')
    console.log('='.repeat(60))
    console.log(`Total Samples: ${stats.totalSamples}`)
    console.log(`Feature Count: ${stats.featureCount}`)

    console.log('\nSamples by Type:')
    Object.entries(stats.samplesByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })

    if (Object.keys(stats.samplesByOutcome).length > 0) {
      console.log('\nSamples by Outcome:')
      Object.entries(stats.samplesByOutcome).forEach(([outcome, count]) => {
        console.log(`  ${outcome}: ${count}`)
      })
    }

    console.log('='.repeat(60) + '\n')
  }
}

export default TrainingDataCollector
