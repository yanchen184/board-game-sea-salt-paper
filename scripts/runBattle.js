#!/usr/bin/env node

/**
 * Run Battle - Main Execution Script
 *
 * Command-line interface for running AI battle simulations
 * Supports various configurations and output options
 *
 * Usage:
 *   node scripts/runBattle.js [options]
 *
 * Options:
 *   --games N          Number of games per matchup (default: 10)
 *   --players N        Number of players (2, 3, or 4, default: 2)
 *   --strategies S     Comma-separated strategies (default: easy,medium,hard)
 *   --matchup S        Specific matchup (e.g., "easy,hard")
 *   --output DIR       Output directory (default: ./scripts/output)
 *   --verbose          Enable verbose output
 *   --training         Collect training data
 *   --single           Run single game (for testing)
 *   --help             Show this help message
 *
 * Examples:
 *   node scripts/runBattle.js --games 100
 *   node scripts/runBattle.js --matchup "hard,hard" --games 50
 *   node scripts/runBattle.js --strategies easy,hard --players 2 --verbose
 *   node scripts/runBattle.js --single --matchup "medium,medium" --verbose
 */

// Environment setup for Node.js compatibility
import './utils/nodeEnv.js'

import { BattleOrchestrator, STRATEGIES } from './battleOrchestrator.js'
import { GameSimulator } from './gameSimulator.js'

// ============================================================================
// Command Line Argument Parsing
// ============================================================================

const args = process.argv.slice(2)

/**
 * Get command line argument value
 * @param {string} name - Argument name (without --)
 * @param {any} defaultValue - Default value if not specified
 * @returns {any} Argument value
 */
function getArg(name, defaultValue = null) {
  const index = args.indexOf(`--${name}`)
  if (index === -1) return defaultValue
  if (index + 1 >= args.length) return true // Flag without value
  const value = args[index + 1]
  if (value.startsWith('--')) return true // Next item is another flag
  return value
}

/**
 * Check if flag is present
 * @param {string} name - Flag name
 * @returns {boolean} Whether flag is present
 */
function hasFlag(name) {
  return args.includes(`--${name}`)
}

/**
 * Parse comma-separated list
 * @param {string} value - Comma-separated string
 * @returns {Array} Parsed array
 */
function parseList(value) {
  if (!value || typeof value !== 'string') return []
  return value.split(',').map(s => s.trim()).filter(s => s.length > 0)
}

// ============================================================================
// Help Message
// ============================================================================

function showHelp() {
  console.log(`
Sea Salt & Paper - AI Battle Simulator
=======================================

Usage: node scripts/runBattle.js [options]

Options:
  --games N          Number of games per matchup (default: 10)
  --players N        Number of players per game (2, 3, or 4, default: 2)
  --strategies S     Comma-separated list of strategies to use
                     (default: easy,medium,hard)
  --matchup S        Run specific matchup only (e.g., "hard,hard")
                     Overrides --strategies for targeted testing
  --output DIR       Output directory for results (default: ./scripts/output)
  --verbose          Enable verbose console output during games
  --training         Collect training data for ML
  --single           Run single game instead of batch
  --help, -h         Show this help message

Available Strategies:
  - easy    : Random decisions with basic declaration logic
  - medium  : Basic strategy with collection and pair awareness
  - hard    : Advanced strategy with opponent analysis

Examples:
  # Run 100 games for all matchups
  node scripts/runBattle.js --games 100

  # Run specific matchup with verbose output
  node scripts/runBattle.js --matchup "hard,medium" --games 50 --verbose

  # Run 3-player games
  node scripts/runBattle.js --players 3 --games 20

  # Run single test game
  node scripts/runBattle.js --single --matchup "easy,hard" --verbose

  # Collect training data
  node scripts/runBattle.js --games 200 --training

Output:
  Results are saved to the output directory in JSON format.
  Training data (if enabled) is saved in CSV and JSON formats.

`)
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  // Show help
  if (hasFlag('help') || hasFlag('h')) {
    showHelp()
    process.exit(0)
  }

  // Parse arguments
  const gamesPerMatchup = parseInt(getArg('games', '10'))
  const playerCount = parseInt(getArg('players', '2'))
  const strategiesArg = getArg('strategies', 'easy,medium,hard')
  const matchupArg = getArg('matchup', null)
  const outputDir = getArg('output', './scripts/output')
  const verbose = hasFlag('verbose')
  const collectTraining = hasFlag('training')
  const singleGame = hasFlag('single')

  // Parse strategies
  const strategies = parseList(strategiesArg)

  // Validate strategies
  const invalidStrategies = strategies.filter(s => !STRATEGIES.includes(s))
  if (invalidStrategies.length > 0) {
    console.error(`Error: Invalid strategies: ${invalidStrategies.join(', ')}`)
    console.error(`Valid strategies are: ${STRATEGIES.join(', ')}`)
    process.exit(1)
  }

  // Validate player count
  if (playerCount < 2 || playerCount > 4) {
    console.error('Error: Player count must be between 2 and 4')
    process.exit(1)
  }

  // Print configuration
  console.log('\n' + '='.repeat(60))
  console.log('  SEA SALT & PAPER - AI BATTLE SIMULATOR')
  console.log('='.repeat(60))
  console.log(`Mode: ${singleGame ? 'Single Game' : 'Batch Battle'}`)
  console.log(`Games per Matchup: ${gamesPerMatchup}`)
  console.log(`Players: ${playerCount}`)
  console.log(`Strategies: ${strategies.join(', ')}`)
  if (matchupArg) console.log(`Specific Matchup: ${matchupArg}`)
  console.log(`Verbose: ${verbose}`)
  console.log(`Collect Training Data: ${collectTraining}`)
  console.log(`Output Directory: ${outputDir}`)
  console.log('='.repeat(60))

  try {
    if (singleGame) {
      // Run single game for testing
      await runSingleGame({
        matchup: matchupArg ? parseList(matchupArg) : ['medium', 'medium'],
        verbose,
        collectTraining,
        outputDir
      })
    } else if (matchupArg) {
      // Run specific matchup
      const matchupStrategies = parseList(matchupArg)

      if (matchupStrategies.length !== playerCount) {
        console.error(`Error: Matchup requires ${playerCount} strategies, got ${matchupStrategies.length}`)
        process.exit(1)
      }

      await runSpecificMatchup({
        matchup: matchupStrategies,
        gamesPerMatchup,
        verbose,
        collectTraining,
        outputDir
      })
    } else {
      // Run all matchups
      await runAllMatchups({
        strategies,
        playerCount,
        gamesPerMatchup,
        verbose,
        collectTraining,
        outputDir
      })
    }

    console.log('\nBattle simulation complete!')
    process.exit(0)

  } catch (error) {
    console.error('\nFatal error:', error)
    process.exit(1)
  }
}

/**
 * Run a single game for testing
 */
async function runSingleGame(options) {
  const { matchup, verbose, collectTraining, outputDir } = options

  console.log(`\nRunning single game: ${matchup.join(' vs ')}`)

  const simulator = new GameSimulator({
    maxTurns: 500,
    verbose,
    collectTrainingData: collectTraining
  })

  const startTime = Date.now()
  const result = await simulator.runGame(matchup)
  const duration = Date.now() - startTime

  // Print result
  console.log('\n' + '-'.repeat(40))
  console.log('GAME RESULT')
  console.log('-'.repeat(40))
  console.log(`Winner: Player ${result.winner} (${result.winnerStrategy})`)
  console.log(`Final Score: ${result.winnerScore}`)
  console.log(`Turns: ${result.turnCount}`)
  console.log(`Rounds: ${result.roundsPlayed}`)
  console.log(`Duration: ${(duration / 1000).toFixed(2)}s`)
  console.log(`Win Condition: ${result.winCondition}`)

  console.log('\nAll Scores:')
  Object.entries(result.finalScores).forEach(([id, score]) => {
    console.log(`  ${id}: ${score}`)
  })

  // Export data
  if (verbose) {
    simulator.exportData(outputDir)
  }

  // Print logger summary
  const logger = simulator.getLogger()
  if (logger) {
    logger.printSummary()
  }

  // Print bug detector summary
  const bugDetector = simulator.getBugDetector()
  if (bugDetector) {
    bugDetector.printSummary()
  }

  // Print training data stats
  if (collectTraining) {
    const trainingCollector = simulator.getTrainingCollector()
    if (trainingCollector) {
      trainingCollector.printStats()
    }
  }
}

/**
 * Run a specific matchup multiple times
 */
async function runSpecificMatchup(options) {
  const { matchup, gamesPerMatchup, verbose, collectTraining, outputDir } = options

  console.log(`\nRunning matchup: ${matchup.join(' vs ')}`)
  console.log(`Games: ${gamesPerMatchup}`)

  const orchestrator = new BattleOrchestrator({
    gamesPerMatchup,
    verbose,
    collectTrainingData: collectTraining,
    outputDir
  })

  await orchestrator.runSpecificBattles([matchup], gamesPerMatchup)
}

/**
 * Run all matchup combinations
 */
async function runAllMatchups(options) {
  const { strategies, playerCount, gamesPerMatchup, verbose, collectTraining, outputDir } = options

  const orchestrator = new BattleOrchestrator({
    gamesPerMatchup,
    playerCount,
    verbose,
    collectTrainingData: collectTraining,
    outputDir
  })

  await orchestrator.runAllBattles({
    strategies,
    playerCount,
    gamesPerMatchup
  })
}

// ============================================================================
// Run Main
// ============================================================================

main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
