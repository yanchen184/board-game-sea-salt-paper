/**
 * Firebase Service
 *
 * All Firebase database operations
 * Room management, player management, game state updates
 */

import { database, ref, set, get, onValue, off, runTransaction, serverTimestamp } from '../config/firebase.js'
import { generateRoomCode } from '../utils/validators.js'
import { initializeGameState, getTargetScore } from './gameService.js'
import { GAME_STATUS, FIREBASE_PATHS, ACTION_LOG, ROOM_TYPE } from '../utils/constants.js'
import { DEFAULT_SETTINGS } from '../data/gameRules.js'

/**
 * Create a new game room
 *
 * @param {string} hostId - Host player ID
 * @param {string} hostName - Host player name
 * @param {Object} settings - Game settings
 * @returns {Promise<string>} Room ID
 */
export async function createRoom(hostId, hostName, settings = {}) {
  const roomId = generateRoomCode()
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)

  const mergedSettings = { ...DEFAULT_SETTINGS, ...settings }

  const roomData = {
    roomId,
    hostId,
    status: GAME_STATUS.WAITING,
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
    players: {
      [hostId]: {
        id: hostId,
        name: hostName,
        isHost: true,
        isReady: false,
        isAI: false,
        difficulty: null,
        score: 0,
        connected: true,
        lastActive: Date.now(),
        hand: [],
        handCount: 0,
        playedPairs: []
      }
    },
    settings: mergedSettings,
    gameState: null
  }

  await set(roomRef, roomData)
  return roomId
}

/**
 * Join an existing room
 *
 * @param {string} roomId - Room ID to join
 * @param {string} playerId - Player ID
 * @param {string} playerName - Player name
 * @returns {Promise<boolean>} Success
 */
export async function joinRoom(roomId, playerId, playerName) {
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)

  try {
    const snapshot = await get(roomRef)

    if (!snapshot.exists()) {
      throw new Error('Room not found')
    }

    const roomData = snapshot.val()

    // Check if room is full
    const currentPlayers = Object.keys(roomData.players || {}).length
    if (currentPlayers >= roomData.settings.maxPlayers) {
      throw new Error('Room is full')
    }

    // Check if game already started
    if (roomData.status !== GAME_STATUS.WAITING) {
      throw new Error('Game already in progress')
    }

    // Add player to room
    const playerRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/players/${playerId}`)
    await set(playerRef, {
      id: playerId,
      name: playerName,
      isHost: false,
      isReady: false,
      isAI: false,
      difficulty: null,
      score: 0,
      connected: true,
      lastActive: Date.now(),
      hand: [],
      handCount: 0,
      playedPairs: []
    })

    return true
  } catch (error) {
    console.error('Join room error:', error)
    throw error
  }
}

/**
 * Leave a room
 *
 * @param {string} roomId - Room ID
 * @param {string} playerId - Player ID
 * @returns {Promise<void>}
 */
export async function leaveRoom(roomId, playerId) {
  const playerRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/players/${playerId}`)
  await set(playerRef, null)

  // If room is empty, delete it
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)
  const snapshot = await get(roomRef)

  if (snapshot.exists()) {
    const roomData = snapshot.val()
    const remainingPlayers = Object.keys(roomData.players || {})

    if (remainingPlayers.length === 0) {
      await set(roomRef, null)
    }
  }
}

/**
 * Update player ready status
 *
 * @param {string} roomId - Room ID
 * @param {string} playerId - Player ID
 * @param {boolean} isReady - Ready status
 * @returns {Promise<void>}
 */
export async function updatePlayerReady(roomId, playerId, isReady) {
  const readyRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/players/${playerId}/isReady`)
  await set(readyRef, isReady)
}

/**
 * Add an AI player to the room
 *
 * @param {string} roomId - Room ID
 * @param {string} difficulty - AI difficulty ('easy', 'medium', 'hard')
 * @returns {Promise<string>} AI player ID
 */
export async function addAIPlayer(roomId, difficulty = 'medium') {
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)

  try {
    const snapshot = await get(roomRef)

    if (!snapshot.exists()) {
      throw new Error('Room not found')
    }

    const roomData = snapshot.val()

    // Check if room is full
    const currentPlayers = Object.keys(roomData.players || {}).length
    if (currentPlayers >= roomData.settings.maxPlayers) {
      throw new Error('Room is full')
    }

    // Check if game already started
    if (roomData.status !== GAME_STATUS.WAITING) {
      throw new Error('Game already in progress')
    }

    // Generate AI player ID
    const aiPlayerId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    const aiNames = ['AI 小白', 'AI 小黑', 'AI 小紅', 'AI 小藍']
    const usedNames = Object.values(roomData.players || {}).map(p => p.name)
    const availableNames = aiNames.filter(n => !usedNames.includes(n))
    const aiName = availableNames[0] || `AI ${currentPlayers + 1}`

    // Add AI player to room
    const playerRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/players/${aiPlayerId}`)
    await set(playerRef, {
      id: aiPlayerId,
      name: aiName,
      isHost: false,
      isReady: true,
      isAI: true,
      difficulty: difficulty,
      score: 0,
      connected: true,
      lastActive: Date.now(),
      hand: [],
      handCount: 0,
      playedPairs: []
    })

    console.log(`[Add AI] Added AI player ${aiName} (${aiPlayerId}) to room ${roomId}`)
    return aiPlayerId
  } catch (error) {
    console.error('Add AI player error:', error)
    throw error
  }
}

/**
 * Start the game
 * Initializes game state with shuffled deck and dealt cards
 *
 * @param {string} roomId - Room ID
 * @returns {Promise<void>}
 */
export async function startGame(roomId) {
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)

  try {
    await runTransaction(roomRef, (room) => {
      if (!room) {
        console.error('[Start Game] Room not found')
        return room
      }

      // Get player IDs
      const playerIds = Object.keys(room.players || {})
      console.log('[Start Game] Player IDs:', playerIds)
      console.log('[Start Game] Settings:', room.settings)

      // Initialize game state (傳遞 room.players 以複製玩家名稱等信息)
      const gameState = initializeGameState(playerIds, room.settings, room.players)

      // Check if game state initialization failed
      if (!gameState) {
        console.error('[Start Game] Failed to initialize game state - gameState is null')
        throw new Error('Failed to initialize game state. Not enough cards in deck.')
      }

      console.log('[Start Game] Game state initialized:', {
        deckCount: gameState.deckCount,
        playerCount: Object.keys(gameState.players).length
      })

      // Update player hands
      playerIds.forEach((playerId, index) => {
        const playerHand = gameState.players[playerId].hand
        console.log(`[Start Game] Player ${playerId} hand:`, playerHand?.length || 0, 'cards')
        room.players[playerId].hand = playerHand
        room.players[playerId].handCount = playerHand.length
      })

      // Set game state
      room.gameState = gameState
      room.status = GAME_STATUS.PLAYING
      room.startedAt = Date.now()

      console.log('[Start Game] Game started successfully')
      return room
    })
  } catch (error) {
    console.error('[Start Game] Error:', error)
    throw error
  }
}

/**
 * Update game state using transaction with built-in retry mechanism
 * CRITICAL: Use transactions for any concurrent updates
 *
 * Firebase transactions can fail due to:
 * 1. Concurrent modifications (transaction conflict)
 * 2. Network issues
 * 3. Initial null state on first read
 *
 * This function handles these cases with automatic retry.
 *
 * @param {string} roomId - Room ID
 * @param {Function} updateFn - Function that modifies game state
 * @param {Object} options - Optional configuration
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.retryDelay - Base delay between retries in ms (default: 300)
 * @returns {Promise<Object>} Updated game state
 * @throws {Error} If all retries exhausted or non-retryable error
 */
export async function updateGameState(roomId, updateFn, options = {}) {
  const { maxRetries = 3, retryDelay = 300 } = options
  const gameStateRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/gameState`)

  let lastError = null
  let transactionAttempts = 0

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      transactionAttempts = 0

      const result = await runTransaction(gameStateRef, (currentState) => {
        transactionAttempts++

        // Firebase may call this function multiple times during conflict resolution
        // Log each internal attempt for debugging
        if (transactionAttempts > 1) {
          console.log(`[updateGameState] Internal transaction retry #${transactionAttempts}`)
        }

        // Handle null state - this happens on first read or if data doesn't exist
        if (!currentState) {
          console.warn('[updateGameState] Received null state, aborting transaction')
          // Return undefined to abort transaction cleanly
          // This will NOT throw an error, just abort
          return undefined
        }

        try {
          const newState = updateFn(currentState)

          // Validate that updateFn returned a valid state
          if (newState === undefined) {
            console.error('[updateGameState] updateFn returned undefined')
            return undefined
          }

          return newState
        } catch (updateError) {
          // If updateFn throws, log it and abort transaction
          console.error('[updateGameState] updateFn threw error:', updateError.message)
          throw updateError
        }
      })

      // Check if transaction was committed
      if (result.committed) {
        if (attempt > 0) {
          console.log(`[updateGameState] Succeeded on attempt ${attempt + 1}`)
        }
        return result.snapshot.val()
      } else {
        // Transaction was aborted (returned undefined)
        console.warn('[updateGameState] Transaction aborted (null state or undefined return)')
        lastError = new Error('Transaction aborted - state was null or update returned undefined')
      }
    } catch (error) {
      lastError = error
      const errorMessage = error?.message || String(error)

      console.error(`[updateGameState] Attempt ${attempt + 1}/${maxRetries + 1} failed:`, {
        error: errorMessage,
        roomId,
        transactionAttempts
      })

      // Check if this is a retryable error
      const isRetryable = (
        errorMessage.includes('set') ||
        errorMessage.includes('transaction') ||
        errorMessage.includes('aborted') ||
        errorMessage.includes('network') ||
        errorMessage.includes('PERMISSION_DENIED') === false // Don't retry permission errors
      )

      if (!isRetryable) {
        console.error('[updateGameState] Non-retryable error, giving up')
        throw error
      }

      // Wait before retrying with exponential backoff
      if (attempt < maxRetries) {
        const waitTime = retryDelay * Math.pow(2, attempt) + Math.random() * 100
        console.log(`[updateGameState] Retrying in ${Math.round(waitTime)}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  // All retries exhausted
  console.error('[updateGameState] All retries exhausted')
  throw lastError || new Error('Transaction failed after all retries')
}

/**
 * Update player hand
 * IMPORTANT: Updates ONLY player metadata at /players/{playerId}
 * NOTE: The gameState.players[playerId].hand should be updated via updateGameState transaction
 * This function is called AFTER updateGameState to sync the metadata
 *
 * @param {string} roomId - Room ID
 * @param {string} playerId - Player ID
 * @param {Array} hand - New hand
 * @returns {Promise<void>}
 */
export async function updatePlayerHand(roomId, playerId, hand) {
  // Validate hand parameter
  if (!Array.isArray(hand)) {
    console.error('[updatePlayerHand] Invalid hand parameter:', {
      hand,
      type: typeof hand,
      roomId,
      playerId
    })
    throw new Error('Hand must be an array')
  }

  // Update only player metadata
  const playerMetadataRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/players/${playerId}`)

  await runTransaction(playerMetadataRef, (player) => {
    if (!player) return player

    player.hand = hand
    player.handCount = hand.length
    player.lastActive = Date.now()

    return player
  })
}

/**
 * Add action to action log
 * Maintains maximum of 20 entries
 *
 * @param {string} roomId - Room ID
 * @param {Object} action - Action object
 * @returns {Promise<void>}
 */
export async function addActionToLog(roomId, action) {
  const logRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/gameState/actionLog`)

  await runTransaction(logRef, (currentLog) => {
    const log = currentLog || []

    // Add new action with timestamp
    const newAction = {
      ...action,
      timestamp: Date.now()
    }

    log.push(newAction)

    // Keep only last 20 entries
    if (log.length > ACTION_LOG.MAX_ENTRIES) {
      return log.slice(-ACTION_LOG.MAX_ENTRIES)
    }

    return log
  })
}

/**
 * Subscribe to room changes
 *
 * @param {string} roomId - Room ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function listenToRoom(roomId, callback) {
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)

  onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    } else {
      callback(null)
    }
  })

  // Return unsubscribe function
  return () => off(roomRef)
}

/**
 * Subscribe to game state changes
 *
 * @param {string} roomId - Room ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function listenToGameState(roomId, callback) {
  const gameStateRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/gameState`)

  onValue(gameStateRef, (snapshot) => {
    callback(snapshot.val())
  })

  return () => off(gameStateRef)
}

/**
 * Check if room exists
 *
 * @param {string} roomId - Room ID
 * @returns {Promise<boolean>} Room exists
 */
export async function roomExists(roomId) {
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)
  const snapshot = await get(roomRef)
  return snapshot.exists()
}

/**
 * Get room data
 *
 * @param {string} roomId - Room ID
 * @returns {Promise<Object|null>} Room data or null
 */
export async function getRoomData(roomId) {
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)
  const snapshot = await get(roomRef)
  return snapshot.exists() ? snapshot.val() : null
}

/**
 * Update room settings
 * Only host can update
 *
 * @param {string} roomId - Room ID
 * @param {Object} settings - New settings
 * @returns {Promise<void>}
 */
export async function updateRoomSettings(roomId, settings) {
  const settingsRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/settings`)
  await set(settingsRef, settings)
}

/**
 * Join a spectator room as spectator
 *
 * @param {string} roomId - Room ID
 * @param {string} spectatorId - Spectator ID
 * @param {string} spectatorName - Spectator name
 * @returns {Promise<boolean>} Success
 */
export async function joinAsSpectator(roomId, spectatorId, spectatorName) {
  const spectatorRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/spectators/${spectatorId}`)

  try {
    await set(spectatorRef, {
      id: spectatorId,
      name: spectatorName,
      joinedAt: Date.now(),
      connected: true,
      isOrchestrator: false
    })
    return true
  } catch (error) {
    console.error('Join as spectator error:', error)
    throw error
  }
}

/**
 * Leave spectator room
 *
 * @param {string} roomId - Room ID
 * @param {string} spectatorId - Spectator ID
 * @returns {Promise<void>}
 */
export async function leaveSpectatorRoom(roomId, spectatorId) {
  const spectatorRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/spectators/${spectatorId}`)
  await set(spectatorRef, null)
}

/**
 * Update spectator connection status
 *
 * @param {string} roomId - Room ID
 * @param {string} spectatorId - Spectator ID
 * @param {boolean} connected - Connection status
 * @returns {Promise<void>}
 */
export async function updateSpectatorConnection(roomId, spectatorId, connected) {
  const connectedRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}/spectators/${spectatorId}/connected`)
  await set(connectedRef, connected)
}

/**
 * Check if room is a spectator room
 *
 * @param {string} roomId - Room ID
 * @returns {Promise<boolean>} Is spectator room
 */
export async function isSpectatorRoom(roomId) {
  const roomRef = ref(database, `${FIREBASE_PATHS.ROOMS}/${roomId}`)
  const snapshot = await get(roomRef)

  if (!snapshot.exists()) return false

  const roomData = snapshot.val()
  return roomData.roomType === ROOM_TYPE.SPECTATOR
}

export default {
  createRoom,
  joinRoom,
  leaveRoom,
  updatePlayerReady,
  startGame,
  updateGameState,
  updatePlayerHand,
  addActionToLog,
  listenToRoom,
  listenToGameState,
  roomExists,
  getRoomData,
  updateRoomSettings,
  joinAsSpectator,
  leaveSpectatorRoom,
  updateSpectatorConnection,
  isSpectatorRoom
}
