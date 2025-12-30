/**
 * Battle Orchestrator
 *
 * Manages batch AI battles with comprehensive statistics
 * Generates all strategy combinations and runs multiple games
 *
 * Features:
 * - Matchup generation for all strategy combinations
 * - Parallel and sequential game execution
 * - Statistics aggregation and analysis
 * - Progress reporting
 * - Result export
 */

// Environment setup for Node.js compatibility
import './utils/nodeEnv.js'

import fs from 'fs'
import path from 'path'
import { GameSimulator } from './gameSimulator.js'
import { StatsAnalyzer } from './utils/statsAnalyzer.js'

/**
 * Available AI strategies
 */
export const STRATEGIES = ['easy', 'medium', 'hard']

/**
 * Battle configuration defaults
 */
export const BATTLE_DEFAULTS = {
  gamesPerMatchup: 10,
  playerCount: 2,
  maxTurns: 500,
  collectTrainingData: true,
  verbose: false,
  outputDir: './scripts/output'
}

/**
 * BattleOrchestrator class
 */
export class BattleOrchestrator {
  constructor(options = {}) {
    // Configuration
    this.config = {
      ...BATTLE_DEFAULTS,
      ...options
    }

    // Results storage
    this.results = []
    this.matchupResults = {}

    // Statistics
    this.stats = {
      totalGames: 0,
      completedGames: 0,
      failedGames: 0,
      totalDuration: 0,
      startTime: null,
      endTime: null
    }

    // Output directory
    this.outputDir = this.config.outputDir
    this.ensureOutputDir()

    // Stats analyzer
    this.statsAnalyzer = new StatsAnalyzer(this.outputDir)
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
   * Generate all matchup combinations
   * @param {Array<string>} strategies - Available strategies
   * @param {number} playerCount - Players per game
   * @returns {Array} Array of matchup configurations
   */
  generateMatchups(strategies = STRATEGIES, playerCount = 2) {
    const matchups = []

    if (playerCount === 2) {
      // All 2-player combinations (including mirror matches)
      for (const s1 of strategies) {
        for (const s2 of strategies) {
          matchups.push({
            id: `${s1}_vs_${s2}`,
            strategies: [s1, s2],
            description: `${s1} vs ${s2}`
          })
        }
      }
    } else if (playerCount === 3) {
      // 3-player combinations
      for (const s1 of strategies) {
        for (const s2 of strategies) {
          for (const s3 of strategies) {
            matchups.push({
              id: `${s1}_vs_${s2}_vs_${s3}`,
              strategies: [s1, s2, s3],
              description: `${s1} vs ${s2} vs ${s3}`
            })
          }
        }
      }
    } else if (playerCount === 4) {
      // 4-player combinations
      for (const s1 of strategies) {
        for (const s2 of strategies) {
          for (const s3 of strategies) {
            for (const s4 of strategies) {
              matchups.push({
                id: `${s1}_vs_${s2}_vs_${s3}_vs_${s4}`,
                strategies: [s1, s2, s3, s4],
                description: `${s1} vs ${s2} vs ${s3} vs ${s4}`
              })
            }
          }
        }
      }
    }

    return matchups
  }

  /**
   * Generate specific matchups (subset of all combinations)
   * @param {Array<Array<string>>} matchupList - List of strategy arrays
   * @returns {Array} Array of matchup configurations
   */
  generateSpecificMatchups(matchupList) {
    return matchupList.map((strategies, index) => ({
      id: strategies.join('_vs_'),
      strategies,
      description: strategies.join(' vs ')
    }))
  }

  /**
   * Run a single battle (one matchup, multiple games)
   * @param {Object} matchup - Matchup configuration
   * @param {number} gamesCount - Number of games to run
   * @returns {Object} Matchup results
   */
  async runBattle(matchup, gamesCount = null) {
    const games = gamesCount || this.config.gamesPerMatchup
    const results = []

    console.log(`\n  [Matchup] ${matchup.description}`)
    console.log(`  Running ${games} games...`)

    for (let i = 0; i < games; i++) {
      try {
        const simulator = new GameSimulator({
          maxTurns: this.config.maxTurns,
          verbose: this.config.verbose,
          collectTrainingData: this.config.collectTrainingData
        })

        const result = await simulator.runGame(matchup.strategies)
        results.push(result)

        // Update stats
        this.stats.completedGames++
        this.stats.totalDuration += result.duration

        // Progress indicator
        if ((i + 1) % 5 === 0 || i === games - 1) {
          process.stdout.write(`\r  Progress: ${i + 1}/${games} games`)
        }

        // Add to stats analyzer
        this.statsAnalyzer.addGameResult(result)

      } catch (error) {
        console.error(`\n  [Error] Game ${i + 1} failed:`, error.message)
        this.stats.failedGames++
      }
    }

    console.log('') // New line after progress

    // Aggregate matchup results
    const matchupResult = this.aggregateMatchupResults(matchup, results)
    this.matchupResults[matchup.id] = matchupResult
    this.results.push(...results)

    return matchupResult
  }

  /**
   * Aggregate results for a matchup
   * @param {Object} matchup - Matchup configuration
   * @param {Array} results - Game results
   * @returns {Object} Aggregated matchup results
   */
  aggregateMatchupResults(matchup, results) {
    if (results.length === 0) {
      return {
        matchup,
        gamesPlayed: 0,
        error: 'No games completed'
      }
    }

    const strategies = matchup.strategies

    // Initialize strategy stats
    const strategyStats = {}
    strategies.forEach((strategy, index) => {
      const key = `player_${index}`
      strategyStats[key] = {
        strategy,
        wins: 0,
        totalScore: 0,
        avgScore: 0,
        winRate: 0
      }
    })

    // Aggregate results
    let totalTurns = 0
    let totalDuration = 0

    results.forEach(result => {
      totalTurns += result.turnCount
      totalDuration += result.duration

      // Count wins and scores
      strategies.forEach((strategy, index) => {
        const key = `player_${index}`
        const playerId = `player_${index}`

        strategyStats[key].totalScore += result.finalScores[playerId] || 0

        if (result.winner === playerId) {
          strategyStats[key].wins++
        }
      })
    })

    // Calculate averages
    const gamesPlayed = results.length

    Object.values(strategyStats).forEach(stats => {
      stats.avgScore = stats.totalScore / gamesPlayed
      stats.winRate = (stats.wins / gamesPlayed) * 100
    })

    return {
      matchup,
      gamesPlayed,
      strategyStats,
      avgTurns: totalTurns / gamesPlayed,
      avgDuration: totalDuration / gamesPlayed,
      totalDuration
    }
  }

  /**
   * Run all battles (all matchups)
   * @param {Object} options - Battle options
   * @returns {Object} Complete battle results
   */
  async runAllBattles(options = {}) {
    const {
      strategies = STRATEGIES,
      playerCount = this.config.playerCount,
      gamesPerMatchup = this.config.gamesPerMatchup
    } = options

    this.stats.startTime = Date.now()

    // Generate all matchups
    const matchups = this.generateMatchups(strategies, playerCount)
    this.stats.totalGames = matchups.length * gamesPerMatchup

    console.log('\n' + '='.repeat(60))
    console.log('  BATTLE ORCHESTRATOR')
    console.log('='.repeat(60))
    console.log(`Strategies: ${strategies.join(', ')}`)
    console.log(`Player Count: ${playerCount}`)
    console.log(`Matchups: ${matchups.length}`)
    console.log(`Games per Matchup: ${gamesPerMatchup}`)
    console.log(`Total Games: ${this.stats.totalGames}`)
    console.log('='.repeat(60))

    // Run all matchups
    for (const matchup of matchups) {
      await this.runBattle(matchup, gamesPerMatchup)
    }

    this.stats.endTime = Date.now()

    // Generate and display final statistics
    return this.generateFinalReport()
  }

  /**
   * Run specific battles
   * @param {Array<Array<string>>} matchupList - List of strategy arrays
   * @param {number} gamesPerMatchup - Games per matchup
   * @returns {Object} Battle results
   */
  async runSpecificBattles(matchupList, gamesPerMatchup = null) {
    const games = gamesPerMatchup || this.config.gamesPerMatchup

    this.stats.startTime = Date.now()

    const matchups = this.generateSpecificMatchups(matchupList)
    this.stats.totalGames = matchups.length * games

    console.log('\n' + '='.repeat(60))
    console.log('  BATTLE ORCHESTRATOR - SPECIFIC MATCHUPS')
    console.log('='.repeat(60))
    console.log(`Matchups: ${matchups.length}`)
    console.log(`Games per Matchup: ${games}`)
    console.log(`Total Games: ${this.stats.totalGames}`)
    console.log('='.repeat(60))

    for (const matchup of matchups) {
      await this.runBattle(matchup, games)
    }

    this.stats.endTime = Date.now()

    return this.generateFinalReport()
  }

  /**
   * Generate final report
   * @returns {Object} Final report
   */
  generateFinalReport() {
    // Generate stats from analyzer
    const analysisStats = this.statsAnalyzer.generateStats()

    // Build final report
    const report = {
      summary: {
        totalGames: this.stats.completedGames,
        failedGames: this.stats.failedGames,
        totalDuration: this.stats.endTime - this.stats.startTime,
        avgGameDuration: this.stats.totalDuration / this.stats.completedGames
      },
      matchupResults: this.matchupResults,
      strategyStats: analysisStats.strategies,
      headToHead: analysisStats.matchups,
      insights: analysisStats.insights,
      timestamp: new Date().toISOString()
    }

    // Display report
    this.displayReport(report)

    // Save report
    this.saveReport(report)

    return report
  }

  /**
   * Display report to console
   * @param {Object} report - Report data
   */
  displayReport(report) {
    console.log('\n' + '='.repeat(60))
    console.log('  FINAL BATTLE REPORT')
    console.log('='.repeat(60))

    // Summary
    console.log('\n--- SUMMARY ---')
    console.log(`Total Games: ${report.summary.totalGames}`)
    console.log(`Failed Games: ${report.summary.failedGames}`)
    console.log(`Total Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`)
    console.log(`Avg Game Duration: ${(report.summary.avgGameDuration / 1000).toFixed(2)}s`)

    // Strategy Performance
    console.log('\n--- STRATEGY PERFORMANCE ---')
    if (report.strategyStats) {
      Object.entries(report.strategyStats).forEach(([strategy, stats]) => {
        console.log(`\n${strategy.toUpperCase()}:`)
        console.log(`  Win Rate: ${stats.winRate?.toFixed(2) || 0}%`)
        console.log(`  Avg Score: ${stats.avgScore?.toFixed(2) || 0}`)
        console.log(`  Games: ${stats.gamesPlayed || 0}`)
      })
    }

    // Head-to-Head
    console.log('\n--- HEAD-TO-HEAD ---')
    Object.entries(report.matchupResults).forEach(([matchupId, result]) => {
      console.log(`\n${result.matchup.description}:`)
      console.log(`  Games: ${result.gamesPlayed}`)
      Object.entries(result.strategyStats || {}).forEach(([player, stats]) => {
        console.log(`  ${player} (${stats.strategy}): ${stats.winRate.toFixed(1)}% win, ${stats.avgScore.toFixed(1)} avg`)
      })
    })

    // Insights
    if (report.insights && report.insights.length > 0) {
      console.log('\n--- INSIGHTS ---')
      report.insights.forEach(insight => {
        console.log(`${insight.message}`)
      })
    }

    console.log('\n' + '='.repeat(60))
  }

  /**
   * Save report to file
   * @param {Object} report - Report data
   */
  saveReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `battle_report_${timestamp}.json`
    const filepath = path.join(this.outputDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2))
    console.log(`\nReport saved to: ${filepath}`)

    // Also save using stats analyzer
    this.statsAnalyzer.saveStats(this.statsAnalyzer.generateStats())

    return filepath
  }

  /**
   * Get all results
   */
  getResults() {
    return this.results
  }

  /**
   * Get matchup results
   */
  getMatchupResults() {
    return this.matchupResults
  }

  /**
   * Get statistics
   */
  getStats() {
    return this.stats
  }

  /**
   * Export training data from all games
   * @param {string} filename - Output filename
   */
  exportTrainingData(filename = null) {
    const outputFile = filename || `training_data_all_${Date.now()}.json`
    const filepath = path.join(this.outputDir, 'training', outputFile)

    // Ensure training directory exists
    const trainingDir = path.join(this.outputDir, 'training')
    if (!fs.existsSync(trainingDir)) {
      fs.mkdirSync(trainingDir, { recursive: true })
    }

    // Aggregate all training data
    const allTrainingData = {
      metadata: {
        totalGames: this.stats.completedGames,
        exportedAt: new Date().toISOString()
      },
      samples: []
    }

    // Note: Training data is collected within each GameSimulator instance
    // This method is a placeholder for aggregated export

    fs.writeFileSync(filepath, JSON.stringify(allTrainingData, null, 2))
    console.log(`Training data exported to: ${filepath}`)

    return filepath
  }

  /**
   * Reset orchestrator state
   */
  reset() {
    this.results = []
    this.matchupResults = {}
    this.stats = {
      totalGames: 0,
      completedGames: 0,
      failedGames: 0,
      totalDuration: 0,
      startTime: null,
      endTime: null
    }
    this.statsAnalyzer = new StatsAnalyzer(this.outputDir)
  }
}

export default BattleOrchestrator
