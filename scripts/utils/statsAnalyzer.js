/**
 * Stats Analyzer
 *
 * Analyzes batch battle results and generates statistics
 * Provides win rates, performance metrics, and insights
 */

import fs from 'fs'
import path from 'path'

export class StatsAnalyzer {
  constructor(outputDir = './scripts/output') {
    this.outputDir = outputDir
    this.results = []

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
  }

  /**
   * Add a game result
   */
  addGameResult(result) {
    this.results.push(result)
  }

  /**
   * Generate comprehensive statistics
   */
  generateStats() {
    const stats = {
      totalGames: this.results.length,
      strategies: this.analyzeStrategies(),
      matchups: this.analyzeMatchups(),
      performance: this.analyzePerformance(),
      insights: this.generateInsights(),
      timestamp: new Date().toISOString()
    }

    return stats
  }

  /**
   * Analyze individual strategy performance
   */
  analyzeStrategies() {
    const strategyStats = {}

    this.results.forEach(result => {
      const { winner, winnerStrategy, playerStrategies, finalScores, turnCount } = result

      playerStrategies.forEach((strategy, index) => {
        const playerId = `player_${index}`

        if (!strategyStats[strategy]) {
          strategyStats[strategy] = {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            totalScore: 0,
            totalTurns: 0,
            avgScore: 0,
            avgTurns: 0,
            winRate: 0
          }
        }

        const stats = strategyStats[strategy]
        stats.gamesPlayed++
        stats.totalScore += finalScores[playerId] || 0
        stats.totalTurns += turnCount

        if (winner === playerId) {
          stats.wins++
        } else {
          stats.losses++
        }
      })
    })

    // Calculate averages and win rates
    Object.values(strategyStats).forEach(stats => {
      stats.avgScore = stats.totalScore / stats.gamesPlayed
      stats.avgTurns = stats.totalTurns / stats.gamesPlayed
      stats.winRate = (stats.wins / stats.gamesPlayed) * 100
    })

    return strategyStats
  }

  /**
   * Analyze head-to-head matchups
   */
  analyzeMatchups() {
    const matchupStats = {}

    this.results.forEach(result => {
      const { playerStrategies, winner, finalScores, turnCount } = result

      // Only analyze 2-player games for now
      if (playerStrategies.length === 2) {
        const [strategy1, strategy2] = playerStrategies
        const matchupKey = `${strategy1}_vs_${strategy2}`

        if (!matchupStats[matchupKey]) {
          matchupStats[matchupKey] = {
            totalGames: 0,
            strategy1Wins: 0,
            strategy2Wins: 0,
            avgScoreDiff: 0,
            totalScoreDiff: 0,
            avgTurns: 0,
            totalTurns: 0
          }
        }

        const stats = matchupStats[matchupKey]
        stats.totalGames++
        stats.totalTurns += turnCount

        const score1 = finalScores['player_0'] || 0
        const score2 = finalScores['player_1'] || 0
        const scoreDiff = Math.abs(score1 - score2)

        stats.totalScoreDiff += scoreDiff

        if (winner === 'player_0') {
          stats.strategy1Wins++
        } else {
          stats.strategy2Wins++
        }
      }
    })

    // Calculate averages
    Object.values(matchupStats).forEach(stats => {
      stats.avgScoreDiff = stats.totalScoreDiff / stats.totalGames
      stats.avgTurns = stats.totalTurns / stats.totalGames
      stats.winRate1 = (stats.strategy1Wins / stats.totalGames) * 100
      stats.winRate2 = (stats.strategy2Wins / stats.totalGames) * 100
    })

    return matchupStats
  }

  /**
   * Analyze overall performance metrics
   */
  analyzePerformance() {
    const scores = this.results.flatMap(r => Object.values(r.finalScores))
    const turns = this.results.map(r => r.turnCount)

    return {
      avgScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      avgTurns: turns.reduce((sum, t) => sum + t, 0) / turns.length,
      minTurns: Math.min(...turns),
      maxTurns: Math.max(...turns)
    }
  }

  /**
   * Generate insights and recommendations
   */
  generateInsights() {
    const strategyStats = this.analyzeStrategies()
    const insights = []

    // Find best performing strategy
    const strategies = Object.entries(strategyStats)
    strategies.sort((a, b) => b[1].winRate - a[1].winRate)

    const [bestStrategy, bestStats] = strategies[0]
    const [worstStrategy, worstStats] = strategies[strategies.length - 1]

    insights.push({
      type: 'best_strategy',
      message: `🏆 Best Strategy: ${bestStrategy} (Win Rate: ${bestStats.winRate.toFixed(2)}%)`,
      data: { strategy: bestStrategy, winRate: bestStats.winRate }
    })

    insights.push({
      type: 'worst_strategy',
      message: `⚠️ Worst Strategy: ${worstStrategy} (Win Rate: ${worstStats.winRate.toFixed(2)}%)`,
      data: { strategy: worstStrategy, winRate: worstStats.winRate }
    })

    // Find strategy with highest average score
    strategies.sort((a, b) => b[1].avgScore - a[1].avgScore)
    const [highScoreStrategy, highScoreStats] = strategies[0]

    insights.push({
      type: 'highest_avg_score',
      message: `📊 Highest Avg Score: ${highScoreStrategy} (${highScoreStats.avgScore.toFixed(2)} points)`,
      data: { strategy: highScoreStrategy, avgScore: highScoreStats.avgScore }
    })

    // Find fastest strategy (lowest avg turns)
    strategies.sort((a, b) => a[1].avgTurns - b[1].avgTurns)
    const [fastestStrategy, fastestStats] = strategies[0]

    insights.push({
      type: 'fastest_strategy',
      message: `⚡ Fastest Strategy: ${fastestStrategy} (${fastestStats.avgTurns.toFixed(2)} avg turns)`,
      data: { strategy: fastestStrategy, avgTurns: fastestStats.avgTurns }
    })

    // Analyze win rate differences
    const winRateDiff = Math.max(...strategies.map(s => s[1].winRate)) - Math.min(...strategies.map(s => s[1].winRate))

    if (winRateDiff > 30) {
      insights.push({
        type: 'balance_issue',
        message: `⚠️ Large win rate difference detected (${winRateDiff.toFixed(2)}%). Game may be unbalanced.`,
        data: { winRateDiff }
      })
    } else if (winRateDiff < 10) {
      insights.push({
        type: 'balanced',
        message: `✅ Strategies are well balanced (win rate diff: ${winRateDiff.toFixed(2)}%)`,
        data: { winRateDiff }
      })
    }

    return insights
  }

  /**
   * Display statistics in console
   */
  displayStats(stats) {
    console.log('═'.repeat(60))
    console.log('  BATCH BATTLE RESULTS')
    console.log('═'.repeat(60))
    console.log(`\nTotal Games: ${stats.totalGames}`)
    console.log(`Generated: ${new Date(stats.timestamp).toLocaleString()}`)

    console.log('\n' + '─'.repeat(60))
    console.log('  STRATEGY PERFORMANCE')
    console.log('─'.repeat(60))

    Object.entries(stats.strategies).forEach(([strategy, data]) => {
      console.log(`\n${strategy.toUpperCase()}:`)
      console.log(`  Games Played: ${data.gamesPlayed}`)
      console.log(`  Win Rate: ${data.winRate.toFixed(2)}% (${data.wins}W / ${data.losses}L)`)
      console.log(`  Avg Score: ${data.avgScore.toFixed(2)}`)
      console.log(`  Avg Turns: ${data.avgTurns.toFixed(2)}`)
    })

    console.log('\n' + '─'.repeat(60))
    console.log('  HEAD-TO-HEAD MATCHUPS')
    console.log('─'.repeat(60))

    Object.entries(stats.matchups).forEach(([matchup, data]) => {
      const [s1, s2] = matchup.split('_vs_')
      console.log(`\n${s1} vs ${s2}:`)
      console.log(`  Games: ${data.totalGames}`)
      console.log(`  ${s1} Win Rate: ${data.winRate1.toFixed(2)}%`)
      console.log(`  ${s2} Win Rate: ${data.winRate2.toFixed(2)}%`)
      console.log(`  Avg Score Difference: ${data.avgScoreDiff.toFixed(2)}`)
      console.log(`  Avg Game Length: ${data.avgTurns.toFixed(2)} turns`)
    })

    console.log('\n' + '─'.repeat(60))
    console.log('  OVERALL PERFORMANCE')
    console.log('─'.repeat(60))

    console.log(`\nScore Range: ${stats.performance.minScore} - ${stats.performance.maxScore}`)
    console.log(`Average Score: ${stats.performance.avgScore.toFixed(2)}`)
    console.log(`Turn Range: ${stats.performance.minTurns} - ${stats.performance.maxTurns}`)
    console.log(`Average Turns: ${stats.performance.avgTurns.toFixed(2)}`)

    console.log('\n' + '─'.repeat(60))
    console.log('  KEY INSIGHTS')
    console.log('─'.repeat(60))

    stats.insights.forEach(insight => {
      console.log(`\n${insight.message}`)
    })

    console.log('\n' + '═'.repeat(60))
  }

  /**
   * Save statistics to JSON file
   */
  saveStats(stats) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `battle_stats_${timestamp}.json`
    const filepath = path.join(this.outputDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(stats, null, 2))

    console.log(`\n📄 Stats saved to: ${filepath}`)

    // Also save a summary report
    this.saveSummaryReport(stats, timestamp)
  }

  /**
   * Save human-readable summary report
   */
  saveSummaryReport(stats, timestamp) {
    const filename = `battle_report_${timestamp}.txt`
    const filepath = path.join(this.outputDir, filename)

    let report = '═'.repeat(60) + '\n'
    report += '  BATCH BATTLE REPORT\n'
    report += '═'.repeat(60) + '\n\n'
    report += `Total Games: ${stats.totalGames}\n`
    report += `Generated: ${new Date(stats.timestamp).toLocaleString()}\n\n`

    report += '─'.repeat(60) + '\n'
    report += '  STRATEGY PERFORMANCE\n'
    report += '─'.repeat(60) + '\n\n'

    Object.entries(stats.strategies).forEach(([strategy, data]) => {
      report += `${strategy.toUpperCase()}:\n`
      report += `  Win Rate: ${data.winRate.toFixed(2)}% (${data.wins}W / ${data.losses}L)\n`
      report += `  Avg Score: ${data.avgScore.toFixed(2)}\n`
      report += `  Avg Turns: ${data.avgTurns.toFixed(2)}\n\n`
    })

    report += '─'.repeat(60) + '\n'
    report += '  KEY INSIGHTS\n'
    report += '─'.repeat(60) + '\n\n'

    stats.insights.forEach(insight => {
      report += `${insight.message}\n`
    })

    report += '\n' + '═'.repeat(60) + '\n'

    fs.writeFileSync(filepath, report)

    console.log(`📄 Report saved to: ${filepath}`)
  }

  /**
   * Export detailed game logs
   */
  exportGameLogs() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `game_logs_${timestamp}.json`
    const filepath = path.join(this.outputDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2))

    console.log(`📄 Game logs saved to: ${filepath}`)
  }
}
