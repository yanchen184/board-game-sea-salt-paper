/**
 * Spectator Service
 *
 * Orchestrates AI battles for spectator mode
 * Manages game flow, AI turns, and spectator controls
 *
 * Key Features:
 * - Automatic AI turn execution
 * - Game speed control
 * - Pause/Resume functionality
 * - Clean state management
 */

import { database, ref, set, get, runTransaction } from '../config/firebase.js'
import { makeAIDecision } from './aiService.js'
import { drawFromDeck, checkDeckReshuffle, executePairEffect, initializeGameState, createDeck } from './gameService.js'
import { calculateScore } from './scoreService.js'
import {
  GAME_STATUS,
  FIREBASE_PATHS,
  ROOM_TYPE,
  GAME_SPEED,
  SPECTATOR_DEFAULTS,
  SPECTATOR_AI_TIMING
} from '../utils/constants.js'
import { generateRoomCode } from '../utils/validators.js'
import { DEFAULT_SETTINGS } from '../data/gameRules.js'

// Active battle loops - keyed by roomId
const activeBattles = new Map()

/**
 * Create a spectator room with 4 AI players
 *
 * @param {string} spectatorId - Spectator's ID
 * @param {string} spectatorName - Spectator's display name
 * @param {Object} settings - Spectator settings
 * @returns {Promise<string>} Room ID
 */
export async function createSpectatorRoom(spectatorId, spectatorName, settings = {}) {
  const roomId = generateRoomCode()
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)

  const aiDifficulties = settings.aiDifficulties || SPECTATOR_DEFAULTS.AI_DIFFICULTIES
  const aiNames = settings.aiNames || SPECTATOR_DEFAULTS.AI_NAMES
  const aiColors = settings.aiColors || SPECTATOR_DEFAULTS.AI_COLORS

  // Create 4 AI players
  const players = {}
  const playerIds = []

  for (let i = 0; i < 4; i++) {
    const aiId = `ai_spectator_${Date.now()}_${i}`
    playerIds.push(aiId)

    players[aiId] = {
      id: aiId,
      name: aiNames[i],
      isHost: i === 0,
      isReady: true,
      isAI: true,
      difficulty: aiDifficulties[i],
      aiColor: aiColors[i],
      score: 0,
      connected: true,
      lastActive: Date.now(),
      hand: [],
      handCount: 0,
      playedPairs: []
    }
  }

  const gameSettings = {
    ...DEFAULT_SETTINGS,
    maxPlayers: 4,
    targetScore: settings.targetScore || 'auto',
    startingHandSize: settings.startingHandSize || 0
  }

  const roomData = {
    roomId,
    roomType: ROOM_TYPE.SPECTATOR,
    hostId: spectatorId,
    status: GAME_STATUS.WAITING,
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
    players,
    settings: gameSettings,
    spectators: {
      [spectatorId]: {
        id: spectatorId,
        name: spectatorName,
        joinedAt: Date.now(),
        connected: true,
        isOrchestrator: true
      }
    },
    spectatorSettings: {
      aiDifficulties,
      aiNames,
      aiColors,
      gameSpeed: settings.gameSpeed || SPECTATOR_DEFAULTS.GAME_SPEED,
      showAllHands: settings.showAllHands !== false,
      showAIThinking: settings.showAIThinking || false
    },
    orchestration: {
      isPaused: false,
      orchestratorId: spectatorId,
      currentSpeed: settings.gameSpeed || SPECTATOR_DEFAULTS.GAME_SPEED
    },
    gameState: null
  }

  await set(roomRef, roomData)
  console.log(`[Spectator] Created room ${roomId} with 4 AI players`)

  return roomId
}

/**
 * Start the AI battle
 * Initializes game state and begins the battle loop
 *
 * @param {string} roomId - Room ID
 * @returns {Promise<boolean>} Success
 */
export async function startAIBattle(roomId) {
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)

  try {
    // Initialize game state
    await runTransaction(roomRef, (room) => {
      if (!room) return room

      const playerIds = Object.keys(room.players || {})
      if (playerIds.length !== 4) {
        console.error('[Spectator] Expected 4 AI players')
        return room
      }

      // Initialize game state
      const gameState = initializeGameState(playerIds, room.settings, room.players)

      if (!gameState) {
        console.error('[Spectator] Failed to initialize game state')
        return room
      }

      // Store fixed player order to ensure consistent ordering
      gameState.playerOrder = [...playerIds]

      // Update player hands
      playerIds.forEach((playerId) => {
        const playerHand = gameState.players[playerId].hand
        room.players[playerId].hand = playerHand
        room.players[playerId].handCount = playerHand.length
      })

      room.gameState = gameState
      room.status = GAME_STATUS.PLAYING
      room.startedAt = Date.now()
      room.orchestration.isPaused = false

      console.log('[Spectator] Game started successfully with playerOrder:', playerIds)
      return room
    })

    // Start the battle loop
    startBattleLoop(roomId)

    return true
  } catch (error) {
    console.error('[Spectator] Start battle error:', error)
    return false
  }
}

/**
 * Start the battle loop
 * Continuously executes AI turns until game ends or is stopped
 *
 * @param {string} roomId - Room ID
 */
function startBattleLoop(roomId) {
  // Stop any existing loop for this room
  stopBattleLoop(roomId)

  const battleState = {
    isRunning: true,
    timeoutId: null,
    roomId
  }

  activeBattles.set(roomId, battleState)

  console.log('[Spectator] Battle loop started for room:', roomId)

  // Start the first turn
  scheduleNextAIAction(roomId)
}

/**
 * Stop the battle loop
 *
 * @param {string} roomId - Room ID
 */
function stopBattleLoop(roomId) {
  const battleState = activeBattles.get(roomId)

  if (battleState) {
    battleState.isRunning = false
    if (battleState.timeoutId) {
      clearTimeout(battleState.timeoutId)
    }
    activeBattles.delete(roomId)
    console.log('[Spectator] Battle loop stopped for room:', roomId)
  }
}

/**
 * Schedule the next AI action based on game speed
 *
 * @param {string} roomId - Room ID
 */
async function scheduleNextAIAction(roomId) {
  const battleState = activeBattles.get(roomId)
  if (!battleState || !battleState.isRunning) {
    console.log('[Spectator] Battle loop not running, skipping action')
    return
  }

  try {
    // Get current room data
    const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)
    const snapshot = await get(roomRef)

    if (!snapshot.exists()) {
      console.log('[Spectator] Room not found, stopping loop')
      stopBattleLoop(roomId)
      return
    }

    const roomData = snapshot.val()
    const gameState = roomData.gameState

    if (!gameState) {
      console.log('[Spectator] No game state, stopping loop')
      stopBattleLoop(roomId)
      return
    }

    // Check if game is over
    if (roomData.status === GAME_STATUS.FINISHED) {
      console.log('[Spectator] Game finished')
      return
    }

    // If in round_end phase, keep checking until round transitions
    if (gameState.turnPhase === 'round_end') {
      console.log('[Spectator] Waiting for round transition...')
      battleState.timeoutId = setTimeout(() => scheduleNextAIAction(roomId), 500)
      return
    }

    // Check if paused
    if (roomData.orchestration?.isPaused) {
      console.log('[Spectator] Game is paused, waiting...')
      // Schedule a check after a short delay
      battleState.timeoutId = setTimeout(() => scheduleNextAIAction(roomId), 500)
      return
    }

    // Get game speed
    const gameSpeed = roomData.orchestration?.currentSpeed || SPECTATOR_DEFAULTS.GAME_SPEED

    // Calculate delay based on phase
    let baseDelay = SPECTATOR_AI_TIMING.DRAW_DELAY
    if (gameState.turnPhase === 'pair') {
      baseDelay = SPECTATOR_AI_TIMING.PAIR_DELAY
    } else if (gameState.turnPhase === 'declare') {
      baseDelay = SPECTATOR_AI_TIMING.DECLARE_DELAY
    }

    const actualDelay = Math.floor(baseDelay / gameSpeed)

    // Schedule the AI action
    battleState.timeoutId = setTimeout(async () => {
      await executeAITurn(roomId)
      scheduleNextAIAction(roomId)
    }, actualDelay)

  } catch (error) {
    console.error('[Spectator] Schedule error:', error)
    // Retry after delay
    const battleState = activeBattles.get(roomId)
    if (battleState && battleState.isRunning) {
      battleState.timeoutId = setTimeout(() => scheduleNextAIAction(roomId), 1000)
    }
  }
}

/**
 * Execute a single AI turn
 *
 * @param {string} roomId - Room ID
 */
async function executeAITurn(roomId) {
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)

  try {
    const snapshot = await get(roomRef)
    if (!snapshot.exists()) return

    const roomData = snapshot.val()
    const gameState = roomData.gameState

    if (!gameState || roomData.status !== GAME_STATUS.PLAYING) return

    const currentPlayerId = gameState.currentPlayerId
    const currentPlayer = roomData.players[currentPlayerId]

    if (!currentPlayer?.isAI) {
      console.log('[Spectator] Current player is not AI, this should not happen')
      return
    }

    const difficulty = currentPlayer.difficulty || 'medium'
    const decision = makeAIDecision(difficulty, gameState, currentPlayerId)

    console.log(`[Spectator] ${currentPlayer.name} (${difficulty}) - Phase: ${gameState.turnPhase}, Decision:`, decision.action)

    // Execute the decision
    await executeAIDecision(roomId, currentPlayerId, currentPlayer, gameState, decision)

  } catch (error) {
    console.error('[Spectator] Execute AI turn error:', error)
    console.error('[Spectator] Error details:', error.message, error.stack)
  }
}

/**
 * Execute an AI decision and update game state
 *
 * @param {string} roomId - Room ID
 * @param {string} playerId - AI player ID
 * @param {Object} playerData - Player data from room
 * @param {Object} gameState - Current game state
 * @param {Object} decision - AI decision
 */
async function executeAIDecision(roomId, playerId, playerData, gameState, decision) {
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)
  const gameStateRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/gameState`)

  // ========== DRAW PHASE ==========
  if (gameState.turnPhase === 'draw' && decision.action === 'draw') {
    await runTransaction(gameStateRef, (state) => {
      if (!state) return state

      if (decision.source === 'deck') {
        // Draw from deck
        const reshuffleResult = checkDeckReshuffle(
          state.deck || [],
          state.discardLeft || [],
          state.discardRight || []
        )

        let deck = reshuffleResult.newDeck
        if (!deck || deck.length < 2) {
          console.log('[Spectator] Not enough cards')
          return state
        }

        const { drawnCards, remainingDeck } = drawFromDeck(deck, 2)

        // AI immediately chooses the higher value card
        const [card1, card2] = drawnCards
        const keepCard = (card1.value || 0) >= (card2.value || 0) ? card1 : card2
        const discardCard = keepCard === card1 ? card2 : card1

        // Check empty pile rule
        const leftEmpty = (reshuffleResult.newDiscardLeft || []).length === 0
        const rightEmpty = (reshuffleResult.newDiscardRight || []).length === 0
        const discardSide = leftEmpty ? 'discardLeft'
          : rightEmpty ? 'discardRight'
          : (Math.random() < 0.5 ? 'discardLeft' : 'discardRight')

        const player = state.players[playerId]
        if (!Array.isArray(player.hand)) player.hand = []
        player.hand = [...player.hand, keepCard]

        state.deck = remainingDeck
        state.deckCount = remainingDeck.length
        state.discardLeft = reshuffleResult.newDiscardLeft
        state.discardRight = reshuffleResult.newDiscardRight
        state[discardSide] = [...(state[discardSide] || []), discardCard]
        state.turnPhase = 'pair'

        // Add to action log
        addToActionLog(state, {
          type: 'draw',
          playerId,
          playerName: playerData.name,
          message: `${playerData.name} drew a card`
        })

        console.log(`[Spectator] ${playerData.name} drew from deck, kept ${keepCard.name}`)

      } else {
        // Draw from discard pile
        const side = decision.source === 'discard_left' ? 'discardLeft' : 'discardRight'
        const pile = state[side] || []

        if (pile.length === 0) return state

        const takenCard = pile[pile.length - 1]
        state[side] = pile.slice(0, -1)

        const player = state.players[playerId]
        if (!Array.isArray(player.hand)) player.hand = []
        player.hand = [...player.hand, takenCard]
        state.turnPhase = 'pair'

        addToActionLog(state, {
          type: 'draw_discard',
          playerId,
          playerName: playerData.name,
          message: `${playerData.name} took ${takenCard.name} from discard`
        })

        console.log(`[Spectator] ${playerData.name} took ${takenCard.name} from ${side}`)
      }

      return state
    })
  }

  // ========== PAIR PHASE ==========
  else if (gameState.turnPhase === 'pair') {
    if (decision.action === 'play_pair' && decision.cards?.length === 2) {
      const [card1, card2] = decision.cards

      await runTransaction(gameStateRef, (state) => {
        if (!state) return state

        const player = state.players[playerId]
        if (!player) return state

        // Remove cards from hand
        player.hand = player.hand.filter(c => c.id !== card1.id && c.id !== card2.id)

        // Add to played pairs
        if (!Array.isArray(player.playedPairs)) player.playedPairs = []
        player.playedPairs.push({
          cards: [card1, card2],
          timestamp: Date.now()
        })

        // Execute pair effect
        const effect = executePairEffect(card1, card2)

        if (effect.effect) {
          handlePairEffect(state, playerId, playerData, effect, card1, card2)
        }

        addToActionLog(state, {
          type: 'play_pair',
          playerId,
          playerName: playerData.name,
          message: `${playerData.name} played ${card1.name} + ${card2.name}`
        })

        console.log(`[Spectator] ${playerData.name} played pair: ${card1.name} + ${card2.name}`)

        return state
      })

    } else if (decision.action === 'end_turn') {
      // Move to declare phase
      await runTransaction(gameStateRef, (state) => {
        if (!state) return state
        state.turnPhase = 'declare'
        return state
      })
    }
  }

  // ========== DECLARE PHASE ==========
  else if (gameState.turnPhase === 'declare') {
    try {
      if (decision.action === 'declare') {
        const declareType = decision.type

        await runTransaction(gameStateRef, (state) => {
          if (!state) return state

          state.declareMode = declareType
          state.declaringPlayerId = playerId

          if (declareType === 'stop') {
            state.turnPhase = 'round_end'
          } else {
            // last_chance
            // 使用固定的玩家順序數組，而不是 Object.keys
            const playerIds = state.playerOrder || Object.keys(state.players)
            state.remainingTurns = playerIds.length - 1
            state.turnPhase = 'declare_showing'
          }

          const declareText = declareType === 'stop' ? 'Stop' : 'Last Chance'
          addToActionLog(state, {
            type: `declare_${declareType}`,
            playerId,
            playerName: playerData.name,
            message: `${playerData.name} declares "${declareText}"!`
          })

          console.log(`[Spectator] ${playerData.name} declared ${declareType}`)

          return state
        })

      } else {
        // End turn without declaring
        await runTransaction(gameStateRef, (state) => {
          if (!state) {
            console.error('[Spectator] State is null in declare phase')
            return state
          }

          // 使用固定的玩家順序數組，而不是 Object.keys
          const playerIds = state.playerOrder || Object.keys(state.players)
          if (!playerIds || playerIds.length === 0) {
            console.error('[Spectator] Player order is invalid')
            return state
          }

          const currentIndex = playerIds.indexOf(state.currentPlayerId)
          if (currentIndex === -1) {
            console.error('[Spectator] Current player not found in playerOrder')
            return state
          }

          const nextIndex = (currentIndex + 1) % playerIds.length

          state.turnCount = (state.turnCount || 0) + 1

          // Handle Last Chance mode
          if (state.declareMode === 'last_chance' && state.remainingTurns !== null) {
            state.remainingTurns = state.remainingTurns - 1

            if (state.remainingTurns <= 0) {
              state.turnPhase = 'round_end'
              return state
            }
          }

          state.currentPlayerId = playerIds[nextIndex]
          state.currentPlayerIndex = nextIndex
          state.turnPhase = 'draw'
          state.pendingEffect = null

          addToActionLog(state, {
            type: 'end_turn',
            playerId,
            playerName: playerData.name,
            message: `${playerData.name} ended their turn`
          })

          console.log(`[Spectator] ${playerData.name} ended turn, next: ${playerIds[nextIndex]}`)

          return state
        })
      }
    } catch (error) {
      console.error('[Spectator] Declare phase error:', error)
      console.error('[Spectator] Decision was:', decision)
      console.error('[Spectator] GameState phase:', gameState.turnPhase)
      throw error
    }
  }

  // ========== DECLARE SHOWING PHASE (AI auto-confirm) ==========
  else if (gameState.turnPhase === 'declare_showing') {
    // Auto-confirm and move to next player
    await runTransaction(gameStateRef, (state) => {
      if (!state) return state

      // 使用固定的玩家順序數組，而不是 Object.keys
      const playerIds = state.playerOrder || Object.keys(state.players)
      const declarerIndex = playerIds.indexOf(state.declaringPlayerId)
      const nextIndex = (declarerIndex + 1) % playerIds.length

      state.currentPlayerId = playerIds[nextIndex]
      state.currentPlayerIndex = nextIndex
      state.turnPhase = 'draw'

      return state
    })
  }
}

/**
 * Handle pair effect during AI turn
 *
 * @param {Object} state - Game state (mutable)
 * @param {string} playerId - Player ID
 * @param {Object} playerData - Player data
 * @param {Object} effect - Effect details
 * @param {Object} card1 - First card
 * @param {Object} card2 - Second card
 */
function handlePairEffect(state, playerId, playerData, effect, card1, card2) {
  const player = state.players[playerId]

  switch (effect.effect) {
    case 'draw_blind':
      // Draw one card from deck
      if (state.deck && state.deck.length > 0) {
        const drawnCard = state.deck.pop()
        player.hand.push(drawnCard)
        state.deckCount = state.deck.length

        addToActionLog(state, {
          type: 'effect_fish',
          playerId,
          playerName: playerData.name,
          message: `${playerData.name} drew a card (Fish effect)`
        })

        console.log(`[Spectator] Fish effect: ${playerData.name} drew ${drawnCard.name}`)
      }
      break

    case 'draw_discard':
      // Crab effect - take from discard pile (AI chooses best)
      const leftPile = state.discardLeft || []
      const rightPile = state.discardRight || []
      const leftTop = leftPile[leftPile.length - 1]
      const rightTop = rightPile[rightPile.length - 1]

      let chosenCard = null
      let chosenSide = null

      if (leftTop && rightTop) {
        chosenCard = (leftTop.value || 0) >= (rightTop.value || 0) ? leftTop : rightTop
        chosenSide = chosenCard === leftTop ? 'discardLeft' : 'discardRight'
      } else if (leftTop) {
        chosenCard = leftTop
        chosenSide = 'discardLeft'
      } else if (rightTop) {
        chosenCard = rightTop
        chosenSide = 'discardRight'
      }

      if (chosenCard && chosenSide) {
        state[chosenSide] = state[chosenSide].slice(0, -1)
        player.hand.push(chosenCard)

        addToActionLog(state, {
          type: 'effect_crab',
          playerId,
          playerName: playerData.name,
          message: `${playerData.name} took ${chosenCard.name} (Crab effect)`
        })

        console.log(`[Spectator] Crab effect: ${playerData.name} took ${chosenCard.name}`)
      }
      break

    case 'extra_turn':
      // Sailboat effect - reset to draw phase
      state.turnPhase = 'draw'

      addToActionLog(state, {
        type: 'effect_sailboat',
        playerId,
        playerName: playerData.name,
        message: `${playerData.name} gets an extra turn! (Sailboat effect)`
      })

      console.log(`[Spectator] Sailboat effect: ${playerData.name} gets extra turn`)
      break

    case 'steal_card':
      // Shark+Swimmer effect - steal from opponent
      // 使用固定的玩家順序數組，而不是 Object.keys
      const opponentIds = (state.playerOrder || Object.keys(state.players)).filter(id => id !== playerId)
      let targetOpponent = null
      let maxHandSize = 0

      opponentIds.forEach(opId => {
        const opponent = state.players[opId]
        const handSize = opponent?.hand?.length || 0
        if (handSize > maxHandSize) {
          maxHandSize = handSize
          targetOpponent = opId
        }
      })

      if (targetOpponent && maxHandSize > 0) {
        const randomIndex = Math.floor(Math.random() * maxHandSize)
        const opponent = state.players[targetOpponent]
        const stolenCard = opponent.hand[randomIndex]
        opponent.hand = opponent.hand.filter((_, idx) => idx !== randomIndex)
        player.hand.push(stolenCard)

        addToActionLog(state, {
          type: 'effect_steal',
          playerId,
          playerName: playerData.name,
          message: `${playerData.name} stole a card from ${opponent.name}`
        })

        console.log(`[Spectator] Steal effect: ${playerData.name} stole from ${opponent.name}`)
      }
      break
  }
}

/**
 * Add entry to action log
 *
 * @param {Object} state - Game state (mutable)
 * @param {Object} action - Action details
 */
function addToActionLog(state, action) {
  if (!Array.isArray(state.actionLog)) {
    state.actionLog = []
  }

  state.actionLog.push({
    ...action,
    timestamp: Date.now()
  })

  // Keep only last 30 entries
  if (state.actionLog.length > 30) {
    state.actionLog = state.actionLog.slice(-30)
  }
}

/**
 * Stop the AI battle
 *
 * @param {string} roomId - Room ID
 * @returns {Promise<boolean>} Success
 */
export async function stopAIBattle(roomId) {
  stopBattleLoop(roomId)

  try {
    const orchestrationRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/orchestration`)
    await runTransaction(orchestrationRef, (orch) => {
      if (!orch) return orch
      orch.isPaused = true
      return orch
    })
    return true
  } catch (error) {
    console.error('[Spectator] Stop battle error:', error)
    return false
  }
}

/**
 * Pause the AI battle
 *
 * @param {string} roomId - Room ID
 * @returns {Promise<boolean>} Success
 */
export async function pauseGame(roomId) {
  try {
    const orchestrationRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/orchestration`)
    await runTransaction(orchestrationRef, (orch) => {
      if (!orch) return orch
      orch.isPaused = true
      return orch
    })
    console.log('[Spectator] Game paused')
    return true
  } catch (error) {
    console.error('[Spectator] Pause error:', error)
    return false
  }
}

/**
 * Resume the AI battle
 *
 * @param {string} roomId - Room ID
 * @returns {Promise<boolean>} Success
 */
export async function resumeGame(roomId) {
  try {
    const orchestrationRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/orchestration`)
    await runTransaction(orchestrationRef, (orch) => {
      if (!orch) return orch
      orch.isPaused = false
      return orch
    })

    // Restart the battle loop if it was stopped
    const battleState = activeBattles.get(roomId)
    if (!battleState || !battleState.isRunning) {
      startBattleLoop(roomId)
    }

    console.log('[Spectator] Game resumed')
    return true
  } catch (error) {
    console.error('[Spectator] Resume error:', error)
    return false
  }
}

/**
 * Set game speed
 *
 * @param {string} roomId - Room ID
 * @param {number} speed - Speed multiplier
 * @returns {Promise<boolean>} Success
 */
export async function setGameSpeed(roomId, speed) {
  // Validate speed
  const validSpeeds = Object.values(GAME_SPEED)
  if (!validSpeeds.includes(speed)) {
    console.error('[Spectator] Invalid speed:', speed)
    return false
  }

  try {
    const orchestrationRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/orchestration`)
    await runTransaction(orchestrationRef, (orch) => {
      if (!orch) return orch
      orch.currentSpeed = speed
      return orch
    })
    console.log('[Spectator] Speed set to:', speed)
    return true
  } catch (error) {
    console.error('[Spectator] Set speed error:', error)
    return false
  }
}

/**
 * Restart the game with a new round
 *
 * @param {string} roomId - Room ID
 * @returns {Promise<boolean>} Success
 */
export async function restartGame(roomId) {
  try {
    const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)

    await runTransaction(roomRef, (room) => {
      if (!room) return room

      // 使用 gameState.playerOrder 如果存在，否則使用 room.players
      const playerIds = room.gameState?.playerOrder || Object.keys(room.players)

      // Reset player scores for a fresh game
      playerIds.forEach(playerId => {
        room.players[playerId].hand = []
        room.players[playerId].handCount = 0
        room.players[playerId].playedPairs = []
        room.players[playerId].score = 0
      })

      // Create new game state
      const newGameState = initializeGameState(playerIds, room.settings, room.players)

      if (!newGameState) {
        console.error('[Spectator] Failed to reinitialize game')
        return room
      }

      // Update player hands
      playerIds.forEach(playerId => {
        const playerHand = newGameState.players[playerId].hand
        room.players[playerId].hand = playerHand
        room.players[playerId].handCount = playerHand.length
      })

      room.gameState = newGameState
      room.gameState.totalScores = {} // Reset total scores
      room.status = GAME_STATUS.PLAYING
      room.orchestration.isPaused = false

      console.log('[Spectator] Game restarted')
      return room
    })

    // Restart battle loop
    startBattleLoop(roomId)

    return true
  } catch (error) {
    console.error('[Spectator] Restart error:', error)
    return false
  }
}

/**
 * Start next round (after round end)
 *
 * @param {string} roomId - Room ID
 * @param {Object} roundScores - Scores from the ended round
 * @returns {Promise<boolean>} Success
 */
export async function startNextRound(roomId, roundScores = {}) {
  try {
    const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)

    await runTransaction(roomRef, (room) => {
      if (!room) return room

      // 使用 gameState.playerOrder 如果存在，否則使用 room.players
      const playerIds = room.gameState?.playerOrder || Object.keys(room.players)
      const gameState = room.gameState

      // Update total scores
      const totalScores = gameState.totalScores || {}
      playerIds.forEach(playerId => {
        const roundScore = roundScores[playerId]?.total || 0
        totalScores[playerId] = (totalScores[playerId] || 0) + roundScore
      })

      // Check if game should end
      const targetScore = parseInt(room.settings?.targetScore, 10) || 30
      const gameOver = Object.values(totalScores).some(score => score >= targetScore)

      if (gameOver) {
        room.status = GAME_STATUS.FINISHED
        room.finishedAt = Date.now()
        room.gameState.totalScores = totalScores
        console.log('[Spectator] Game finished!')
        return room
      }

      // Create new deck for next round
      let newDeck = createDeck()

      // Reset player hands
      playerIds.forEach(playerId => {
        room.players[playerId].hand = []
        room.players[playerId].handCount = 0
        room.players[playerId].playedPairs = []
        gameState.players[playerId].hand = []
        gameState.players[playerId].playedPairs = []
      })

      // Deal cards to discard piles
      const leftCard = newDeck.pop()
      const rightCard = newDeck.pop()

      // Calculate next starting player (counter-clockwise)
      const currentStartingIndex = gameState.startingPlayerIndex ?? 0
      const nextStartingIndex = (currentStartingIndex - 1 + playerIds.length) % playerIds.length
      const nextStartingPlayerId = playerIds[nextStartingIndex]

      // Update game state
      gameState.deck = newDeck
      gameState.deckCount = newDeck.length
      gameState.discardLeft = leftCard ? [leftCard] : []
      gameState.discardRight = rightCard ? [rightCard] : []
      gameState.round = (gameState.round || 1) + 1
      gameState.turnPhase = 'draw'
      gameState.currentPlayerIndex = nextStartingIndex
      gameState.currentPlayerId = nextStartingPlayerId
      gameState.startingPlayerIndex = nextStartingIndex
      gameState.startingPlayerId = nextStartingPlayerId
      gameState.declareMode = null
      gameState.declaringPlayerId = null
      gameState.remainingTurns = null
      gameState.pendingEffect = null
      gameState.totalScores = totalScores

      room.orchestration.isPaused = false

      console.log('[Spectator] Starting round', gameState.round)
      return room
    })

    // Restart battle loop
    const battleState = activeBattles.get(roomId)
    if (!battleState || !battleState.isRunning) {
      startBattleLoop(roomId)
    }

    return true
  } catch (error) {
    console.error('[Spectator] Next round error:', error)
    return false
  }
}

/**
 * Clean up spectator room resources
 *
 * @param {string} roomId - Room ID
 */
export function cleanupSpectatorRoom(roomId) {
  stopBattleLoop(roomId)
  console.log('[Spectator] Cleaned up room:', roomId)
}

export default {
  createSpectatorRoom,
  startAIBattle,
  stopAIBattle,
  pauseGame,
  resumeGame,
  setGameSpeed,
  restartGame,
  startNextRound,
  cleanupSpectatorRoom
}
