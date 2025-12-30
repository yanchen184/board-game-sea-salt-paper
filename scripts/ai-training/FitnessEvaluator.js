/**
 * Fitness Evaluator
 *
 * Evaluates AI genomes through competitive matches.
 * Calculates fitness scores based on:
 * - Win rate
 * - Average score
 * - Win margin
 * - Declaration success
 *
 * Supports parallel evaluation using worker threads (optional).
 */

import { GameSimulator } from './GameSimulator.js'
import { DEFAULT_GENOME } from './AIGenome.js'

/**
 * Fitness Evaluator Class
 */
export class FitnessEvaluator {
  constructor(options = {}) {
    this.matchesPerGenome = options.matchesPerGenome || 10
    this.gamesPerMatch = options.gamesPerMatch || 3
    this.playerCount = options.playerCount || 2
    this.simulatorOptions = options.simulatorOptions || {}

    // Fitness weights
    this.weights = {
      winRate: options.winRateWeight || 100,
      avgScore: options.avgScoreWeight || 0.5,
      winMargin: options.winMarginWeight || 0.2,
      lastChanceWin: options.lastChanceWinWeight || 5,
      mermaidWin: options.mermaidWinWeight || 10,
      shortGameBonus: options.shortGameBonusWeight || 0.1
    }

    // Baseline opponent for consistent evaluation
    this.baselineGenome = options.baselineGenome || DEFAULT_GENOME
  }

  /**
   * Evaluate a single genome against random opponents
   * @param {Object} genome - Genome to evaluate
   * @param {Array} opponents - Array of opponent genomes
   * @param {Object} options - Evaluation options
   * @returns {Object} Evaluation results
   */
  evaluateGenome(genome, opponents, options = {}) {
    const { trackBaselinePerformance = false } = options

    const results = {
      wins: 0,
      losses: 0,
      draws: 0,
      totalScore: 0,
      opponentTotalScore: 0,
      totalGames: 0,
      lastChanceWins: 0,
      mermaidWins: 0,
      totalTurns: 0,
      // 新增：對基線 AI 的表現追蹤
      baselineWins: 0,
      baselineLosses: 0,
      baselineDraws: 0,
      baselineTotalGames: 0
    }

    const simulator = new GameSimulator(this.simulatorOptions)

    // Play against each opponent
    for (const opponent of opponents) {
      const isBaselineOpponent = trackBaselinePerformance &&
        (opponent.id === 'baseline' || opponent === this.baselineGenome)

      for (let game = 0; game < this.gamesPerMatch; game++) {
        // Vary seed for each game
        simulator.seed = Date.now() + Math.random() * 10000

        // Play game
        const gameResult = simulator.runGame([genome, opponent], this.playerCount)

        results.totalGames++
        results.totalTurns += gameResult.turnCount

        // Track scores
        results.totalScore += gameResult.scores['player_0'] || 0
        results.opponentTotalScore += gameResult.scores['player_1'] || 0

        // Track wins/losses
        if (gameResult.winner === 'player_0') {
          results.wins++
          if (isBaselineOpponent) results.baselineWins++

          // Bonus for winning with Last Chance
          if (gameResult.declareMode === 'last_chance' &&
              gameResult.declaringPlayerId === 'player_0') {
            results.lastChanceWins++
          }

          // Bonus for mermaid win
          if (gameResult.scores['player_0'] >= 1000) {
            results.mermaidWins++
          }
        } else if (gameResult.winner === 'player_1') {
          results.losses++
          if (isBaselineOpponent) results.baselineLosses++
        } else {
          results.draws++
          if (isBaselineOpponent) results.baselineDraws++
        }

        if (isBaselineOpponent) results.baselineTotalGames++
      }
    }

    return results
  }

  /**
   * Calculate fitness score from evaluation results
   * 改進評估方式：優先考慮對基線 AI 的表現
   *
   * fitness = (對基線 AI 的勝率) × 100 + (對訓練 AI 的勝率) × 50
   *
   * @param {Object} results - Evaluation results
   * @returns {number} Fitness score
   */
  calculateFitness(results) {
    if (results.totalGames === 0) return 0

    let fitness = 0

    // 對基線 AI 的勝率（權重 100）
    if (results.baselineTotalGames > 0) {
      const baselineWinRate = results.baselineWins / results.baselineTotalGames
      fitness += baselineWinRate * 100
    }

    // 對訓練 AI 的勝率（權重 50）
    const trainingGames = results.totalGames - results.baselineTotalGames
    if (trainingGames > 0) {
      const trainingWins = results.wins - results.baselineWins
      const trainingWinRate = trainingWins / trainingGames
      fitness += trainingWinRate * 50
    }

    // 額外獎勵（保留原有的特殊獎勵機制）
    // Last Chance 勝利獎勵（高風險高回報）
    fitness += results.lastChanceWins * this.weights.lastChanceWin

    // 美人魚勝利獎勵（4 張美人魚 = 即贏）
    fitness += results.mermaidWins * this.weights.mermaidWin

    // 快速勝利獎勵（回合數越少越好）
    if (results.totalGames > 0) {
      const avgTurns = results.totalTurns / results.totalGames
      const shortGameBonus = Math.max(0, 20 - avgTurns)
      fitness += shortGameBonus * this.weights.shortGameBonus
    }

    return fitness
  }

  /**
   * Evaluate entire population
   * 改進：每一代都測試基線 AI，確保訓練方向正確
   *
   * @param {Array} population - Array of genomes
   * @param {Object} options - Evaluation options
   * @returns {Object} Evaluation results for all genomes
   */
  evaluatePopulation(population, options = {}) {
    const {
      useBaseline = true,
      randomOpponentCount = 5
    } = options

    const evaluations = []

    // 確保基線 genome 有 ID 標記
    const baselineWithId = { ...this.baselineGenome, id: 'baseline' }

    for (let i = 0; i < population.length; i++) {
      const genome = population[i]

      // Select opponents
      const opponents = []

      // 必須包含基線 AI（改進：總是測試對基線 AI 的表現）
      if (useBaseline) {
        opponents.push(baselineWithId)
      }

      // Add random opponents from population
      const available = population.filter((_, idx) => idx !== i)
      const shuffled = this.shuffleArray(available)
      const randomOpponents = shuffled.slice(0, randomOpponentCount)
      opponents.push(...randomOpponents)

      // Evaluate (啟用基線表現追蹤)
      const results = this.evaluateGenome(genome, opponents, {
        trackBaselinePerformance: true
      })
      const fitness = this.calculateFitness(results)

      // 計算基線勝率（用於報告）
      const baselineWinRate = results.baselineTotalGames > 0
        ? results.baselineWins / results.baselineTotalGames
        : 0

      evaluations.push({
        genome,
        genomeIndex: i,
        fitness,
        results,
        winRate: results.wins / results.totalGames,
        baselineWinRate, // 新增：對基線 AI 的勝率
        avgScore: results.totalScore / results.totalGames
      })
    }

    // Sort by fitness (descending)
    evaluations.sort((a, b) => b.fitness - a.fitness)

    return {
      evaluations,
      fitnessScores: population.map((_, i) =>
        evaluations.find(e => e.genomeIndex === i).fitness
      ),
      bestGenome: evaluations[0].genome,
      bestFitness: evaluations[0].fitness,
      avgFitness: evaluations.reduce((sum, e) => sum + e.fitness, 0) / evaluations.length,
      bestWinRate: evaluations[0].winRate,
      bestBaselineWinRate: evaluations[0].baselineWinRate // 新增：最佳 AI 對基線的勝率
    }
  }

  /**
   * Compare two genomes directly
   * @param {Object} genome1 - First genome
   * @param {Object} genome2 - Second genome
   * @param {number} gameCount - Number of games to play
   * @returns {Object} Comparison results
   */
  compareGenomes(genome1, genome2, gameCount = 30) {
    const simulator = new GameSimulator(this.simulatorOptions)
    const results = {
      genome1Wins: 0,
      genome2Wins: 0,
      draws: 0,
      genome1TotalScore: 0,
      genome2TotalScore: 0
    }

    for (let i = 0; i < gameCount; i++) {
      simulator.seed = Date.now() + i * 1000

      const gameResult = simulator.runGame([genome1, genome2], 2)

      if (gameResult.winner === 'player_0') {
        results.genome1Wins++
      } else if (gameResult.winner === 'player_1') {
        results.genome2Wins++
      } else {
        results.draws++
      }

      results.genome1TotalScore += gameResult.scores['player_0'] || 0
      results.genome2TotalScore += gameResult.scores['player_1'] || 0
    }

    return {
      ...results,
      genome1WinRate: results.genome1Wins / gameCount,
      genome2WinRate: results.genome2Wins / gameCount,
      genome1AvgScore: results.genome1TotalScore / gameCount,
      genome2AvgScore: results.genome2TotalScore / gameCount,
      winner: results.genome1Wins > results.genome2Wins ? 'genome1' :
              results.genome2Wins > results.genome1Wins ? 'genome2' : 'tie'
    }
  }

  /**
   * Benchmark genome against baseline
   * @param {Object} genome - Genome to benchmark
   * @param {number} gameCount - Number of games
   * @returns {Object} Benchmark results
   */
  benchmark(genome, gameCount = 50) {
    return this.compareGenomes(genome, this.baselineGenome, gameCount)
  }

  /**
   * Shuffle array (Fisher-Yates)
   */
  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

/**
 * Batch evaluator for parallel processing
 * Uses a simple batch approach (can be extended to use Worker Threads)
 */
export class BatchEvaluator {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10
    this.evaluator = new FitnessEvaluator(options)
  }

  /**
   * Evaluate population in batches
   * @param {Array} population - Array of genomes
   * @param {Function} progressCallback - Optional progress callback
   * @returns {Object} Evaluation results
   */
  async evaluatePopulation(population, progressCallback = null) {
    const allEvaluations = []
    const totalBatches = Math.ceil(population.length / this.batchSize)

    for (let batch = 0; batch < totalBatches; batch++) {
      const start = batch * this.batchSize
      const end = Math.min(start + this.batchSize, population.length)
      const batchPopulation = population.slice(start, end)

      // Evaluate batch
      const batchResult = this.evaluator.evaluatePopulation(batchPopulation, {
        useBaseline: true,
        randomOpponentCount: 3
      })

      // Adjust genome indices
      batchResult.evaluations.forEach(e => {
        e.genomeIndex = start + e.genomeIndex
        allEvaluations.push(e)
      })

      // Report progress
      if (progressCallback) {
        progressCallback({
          batch: batch + 1,
          totalBatches,
          progress: (batch + 1) / totalBatches,
          genomesEvaluated: end
        })
      }

      // Small delay to prevent blocking
      await new Promise(resolve => setImmediate(resolve))
    }

    // Sort by fitness
    allEvaluations.sort((a, b) => b.fitness - a.fitness)

    return {
      evaluations: allEvaluations,
      fitnessScores: population.map((_, i) =>
        allEvaluations.find(e => e.genomeIndex === i).fitness
      ),
      bestGenome: allEvaluations[0].genome,
      bestFitness: allEvaluations[0].fitness,
      avgFitness: allEvaluations.reduce((sum, e) => sum + e.fitness, 0) / allEvaluations.length,
      bestWinRate: allEvaluations[0].winRate,
      bestBaselineWinRate: allEvaluations[0].baselineWinRate || 0 // 新增：對基線的勝率
    }
  }
}

export default { FitnessEvaluator, BatchEvaluator }
