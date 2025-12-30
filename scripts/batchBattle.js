/**
 * Batch Battle System
 *
 * Runs hundreds of automated games to collect AI performance data
 * Supports different AI strategies and parameter configurations
 *
 * Usage:
 *   node scripts/batchBattle.js --games 300 --strategies easy,medium,hard
 */

import { initializeGameState } from '../src/services/gameService.js'
import { makeEasyDecision, makeMediumDecision, makeHardDecision } from '../src/services/aiService.js'
import { calculateScore } from '../src/utils/cardScoreHelpers.js'
import { BattleLogger } from './utils/battleLogger.js'
import { StatsAnalyzer } from './utils/statsAnalyzer.js'

// Parse command line arguments
const args = process.argv.slice(2)
const getArg = (name, defaultValue) => {
  const index = args.indexOf(`--${name}`)
  return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue
}

const TOTAL_GAMES = parseInt(getArg('games', '300'))
const STRATEGIES = getArg('strategies', 'easy,medium,hard').split(',')
const OUTPUT_DIR = getArg('output', './scripts/output')

// Strategy map
const STRATEGY_MAP = {
  easy: makeEasyDecision,
  medium: makeMediumDecision,
  hard: makeHardDecision
}

/**
 * Simulate a single game with specified AI strategies
 * @param {Array<string>} playerStrategies - Strategy for each player
 * @param {Object} settings - Game settings
 * @returns {Object} Game result
 */
async function simulateGame(playerStrategies, settings = {}) {
  const playerIds = playerStrategies.map((_, i) => `player_${i}`)
  const players = playerStrategies.reduce((acc, strategy, i) => {
    acc[playerIds[i]] = {
      id: playerIds[i],
      name: `AI_${strategy}_${i}`,
      isAI: true,
      strategy: strategy,
      isReady: true
    }
    return acc
  }, {})

  // Initialize game state
  let gameState = initializeGameState(playerIds, settings, players)

  const logger = new BattleLogger()
  logger.logGameStart(gameState, playerStrategies)

  let turnCount = 0
  const MAX_TURNS = 1000 // Prevent infinite loops

  // Game loop
  while (!gameState.isGameOver && turnCount < MAX_TURNS) {
    turnCount++
    const currentPlayerId = gameState.currentPlayerId
    const currentPlayer = gameState.players[currentPlayerId]
    const strategy = STRATEGY_MAP[currentPlayer.strategy]

    if (!strategy) {
      throw new Error(`Unknown strategy: ${currentPlayer.strategy}`)
    }

    try {
      // Execute AI turn
      const result = await executeAITurn(gameState, currentPlayerId, strategy, logger)

      if (result.gameOver) {
        gameState.isGameOver = true
        gameState.winner = result.winner
        break
      }

      gameState = result.gameState
    } catch (error) {
      console.error(`Error in turn ${turnCount}:`, error)
      logger.logError(turnCount, currentPlayerId, error)
      break
    }
  }

  if (turnCount >= MAX_TURNS) {
    logger.logWarning('Game reached maximum turns limit')
    // Determine winner by score
    const scores = Object.entries(gameState.players).map(([id, player]) => ({
      id,
      score: player.score || 0
    }))
    scores.sort((a, b) => b.score - a.score)
    gameState.winner = scores[0].id
  }

  const gameResult = {
    winner: gameState.winner,
    winnerStrategy: players[gameState.winner].strategy,
    turnCount,
    finalScores: Object.entries(gameState.players).reduce((acc, [id, player]) => {
      acc[id] = player.score || 0
      return acc
    }, {}),
    playerStrategies: playerStrategies,
    gameLog: logger.getLog()
  }

  logger.logGameEnd(gameResult)
  return gameResult
}

/**
 * Execute a single AI turn
 * @param {Object} gameState - Current game state
 * @param {string} playerId - Current player ID
 * @param {Function} strategy - AI strategy function
 * @param {BattleLogger} logger - Logger instance
 * @returns {Object} Updated game state and actions
 */
async function executeAITurn(gameState, playerId, strategy, logger) {
  const player = gameState.players[playerId]
  const hand = player.hand || []
  const turnPhase = gameState.turnPhase

  logger.logTurnStart(playerId, turnPhase, hand.length)

  // Draw phase
  if (turnPhase === 'draw') {
    const decision = await strategy(gameState, playerId, 'draw')
    logger.logDecision(playerId, 'draw', decision)

    // Simulate draw action
    const drawResult = simulateDrawCard(gameState, playerId, decision.source)
    gameState = drawResult.gameState

    if (drawResult.deckEmpty) {
      // Trigger "Last Chance" if deck is empty
      gameState.lastChanceTriggered = true
      gameState.lastChancePlayerId = playerId
      logger.logEvent('last_chance_triggered', { playerId })
    }

    gameState.turnPhase = 'action'
  }

  // Action phase
  if (turnPhase === 'action') {
    const decision = await strategy(gameState, playerId, 'action')
    logger.logDecision(playerId, 'action', decision)

    if (decision.action === 'playPair') {
      const pairResult = simulatePlayPair(gameState, playerId, decision.cards)
      gameState = pairResult.gameState
      logger.logEvent('play_pair', { playerId, cards: decision.cards })
    } else if (decision.action === 'declare') {
      const declareResult = simulateDeclare(gameState, playerId)
      logger.logEvent('declare', {
        playerId,
        score: declareResult.score,
        winner: declareResult.winner
      })

      return {
        gameState: declareResult.gameState,
        gameOver: true,
        winner: declareResult.winner
      }
    } else if (decision.action === 'endTurn') {
      logger.logEvent('end_turn', { playerId })
    }

    // Move to next player
    gameState = moveToNextPlayer(gameState)
    gameState.turnPhase = 'draw'
  }

  return { gameState, gameOver: false }
}

/**
 * Simulate drawing a card
 */
function simulateDrawCard(gameState, playerId, source = 'deck') {
  const player = gameState.players[playerId]
  const hand = [...(player.hand || [])]

  let drawnCard = null
  let deckEmpty = false

  if (source === 'deck' || source === 'draw_deck') {
    if (gameState.deck && gameState.deck.length > 0) {
      drawnCard = gameState.deck.pop()
    } else {
      deckEmpty = true
      // Draw from discard pile as fallback
      if (gameState.discardPiles?.pile1?.length > 0) {
        drawnCard = gameState.discardPiles.pile1.pop()
      } else if (gameState.discardPiles?.pile2?.length > 0) {
        drawnCard = gameState.discardPiles.pile2.pop()
      }
    }
  } else if (source === 'discard_pile_1') {
    if (gameState.discardPiles?.pile1?.length > 0) {
      drawnCard = gameState.discardPiles.pile1.pop()
    }
  } else if (source === 'discard_pile_2') {
    if (gameState.discardPiles?.pile2?.length > 0) {
      drawnCard = gameState.discardPiles.pile2.pop()
    }
  }

  if (drawnCard) {
    hand.push(drawnCard)
  }

  return {
    gameState: {
      ...gameState,
      players: {
        ...gameState.players,
        [playerId]: {
          ...player,
          hand
        }
      }
    },
    drawnCard,
    deckEmpty
  }
}

/**
 * Simulate playing a pair
 */
function simulatePlayPair(gameState, playerId, cardIds) {
  const player = gameState.players[playerId]
  const hand = [...(player.hand || [])]
  const playedPairs = [...(player.playedPairs || [])]

  // Remove cards from hand
  const pairCards = hand.filter(c => cardIds.includes(c.id))
  const newHand = hand.filter(c => !cardIds.includes(c.id))

  // Add to played pairs
  playedPairs.push({
    cards: pairCards,
    timestamp: Date.now()
  })

  return {
    gameState: {
      ...gameState,
      players: {
        ...gameState.players,
        [playerId]: {
          ...player,
          hand: newHand,
          playedPairs
        }
      }
    }
  }
}

/**
 * Simulate declare action and calculate final scores
 */
function simulateDeclare(gameState, playerId) {
  // Calculate all player scores
  const playerScores = Object.entries(gameState.players).map(([id, player]) => {
    const scoreResult = calculateScore(player.hand || [], player.playedPairs || [], gameState.settings || {})
    return {
      id,
      score: scoreResult.total,
      scoreBreakdown: scoreResult
    }
  })

  // Sort by score
  playerScores.sort((a, b) => b.score - a.score)

  // Determine winner
  const declaredPlayerScore = playerScores.find(p => p.id === playerId)
  const winner = playerScores[0].id
  const isDeclaredPlayerWinner = winner === playerId

  // Update game state with final scores
  const updatedPlayers = { ...gameState.players }
  playerScores.forEach(({ id, score, scoreBreakdown }) => {
    updatedPlayers[id] = {
      ...updatedPlayers[id],
      score,
      scoreBreakdown
    }
  })

  return {
    gameState: {
      ...gameState,
      players: updatedPlayers,
      isGameOver: true,
      winner
    },
    score: declaredPlayerScore.score,
    winner,
    isDeclaredPlayerWinner
  }
}

/**
 * Move to next player
 */
function moveToNextPlayer(gameState) {
  const playerIds = Object.keys(gameState.players)
  const currentIndex = playerIds.indexOf(gameState.currentPlayerId)
  const nextIndex = (currentIndex + 1) % playerIds.length

  return {
    ...gameState,
    currentPlayerId: playerIds[nextIndex],
    turnNumber: (gameState.turnNumber || 0) + 1
  }
}

/**
 * Run batch battles
 */
async function runBatchBattles() {
  console.log(`🎮 Starting Batch Battle System`)
  console.log(`📊 Total Games: ${TOTAL_GAMES}`)
  console.log(`🤖 Strategies: ${STRATEGIES.join(', ')}`)
  console.log(`📁 Output Directory: ${OUTPUT_DIR}`)
  console.log('')

  const analyzer = new StatsAnalyzer(OUTPUT_DIR)
  const results = []

  // Generate matchups (all combinations)
  const matchups = generateMatchups(STRATEGIES, 2) // 2-player games

  console.log(`📋 Total Matchups: ${matchups.length}`)
  console.log('')

  let gameCount = 0
  const gamesPerMatchup = Math.floor(TOTAL_GAMES / matchups.length)

  for (const matchup of matchups) {
    console.log(`\n🎯 Matchup: ${matchup.join(' vs ')}`)

    for (let i = 0; i < gamesPerMatchup; i++) {
      gameCount++

      if (gameCount % 10 === 0) {
        process.stdout.write(`\r  Progress: ${gameCount}/${TOTAL_GAMES} games`)
      }

      try {
        const result = await simulateGame(matchup)
        results.push(result)
        analyzer.addGameResult(result)
      } catch (error) {
        console.error(`\n  ❌ Error in game ${gameCount}:`, error.message)
      }
    }
  }

  console.log(`\n\n✅ Completed ${gameCount} games`)
  console.log('\n📊 Analyzing results...\n')

  // Generate and display statistics
  const stats = analyzer.generateStats()
  analyzer.displayStats(stats)
  analyzer.saveStats(stats)

  console.log(`\n💾 Results saved to ${OUTPUT_DIR}`)
  console.log(`\n🎉 Batch Battle Complete!`)
}

/**
 * Generate all matchup combinations
 */
function generateMatchups(strategies, playerCount) {
  if (playerCount === 2) {
    const matchups = []
    for (let i = 0; i < strategies.length; i++) {
      for (let j = 0; j < strategies.length; j++) {
        matchups.push([strategies[i], strategies[j]])
      }
    }
    return matchups
  }

  // For more players, use recursive combination generation
  // For now, just support 2 players
  throw new Error('Only 2-player games supported currently')
}

// Run the batch battles
runBatchBattles().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
