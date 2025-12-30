import { ref, get, onDisconnect, set } from 'firebase/database'
import { database } from '../config/firebase.js'

/**
 * Reconnection Service
 *
 * Handles player reconnection after disconnection
 */

/**
 * Check if player is in an active room
 *
 * @param {string} playerId - Player ID to check
 * @returns {Promise<{inRoom: boolean, roomId: string|null, roomData: object|null}>}
 */
export async function checkPlayerInActiveRoom(playerId) {
  if (!playerId) {
    return { inRoom: false, roomId: null, roomData: null }
  }

  try {
    // Get all rooms from Firebase
    const roomsRef = ref(database, 'rooms')
    const snapshot = await get(roomsRef)

    if (!snapshot.exists()) {
      return { inRoom: false, roomId: null, roomData: null }
    }

    const rooms = snapshot.val()

    // Check each room to see if player is in it
    for (const [roomId, roomData] of Object.entries(rooms)) {
      // Skip if room is not in playing status
      if (roomData.status !== 'playing') {
        continue
      }

      // Check if player is in this room's players list
      if (roomData.players && roomData.players[playerId]) {
        console.log('[Reconnection] Found player in room:', roomId)
        return {
          inRoom: true,
          roomId,
          roomData
        }
      }
    }

    return { inRoom: false, roomId: null, roomData: null }
  } catch (error) {
    console.error('[Reconnection] Error checking player in active room:', error)
    return { inRoom: false, roomId: null, roomData: null }
  }
}

/**
 * Update player connection status in Firebase
 *
 * @param {string} roomId - Room ID
 * @param {string} playerId - Player ID
 * @param {boolean} connected - Connection status
 */
export async function updatePlayerConnectionStatus(roomId, playerId, connected) {
  if (!roomId || !playerId) return

  try {
    const playerConnectedRef = ref(database, `rooms/${roomId}/players/${playerId}/connected`)
    const playerLastActiveRef = ref(database, `rooms/${roomId}/players/${playerId}/lastActive`)

    // Update connection status
    await set(playerConnectedRef, connected)

    // Update last active timestamp
    if (connected) {
      await set(playerLastActiveRef, Date.now())
    }

    // Set up auto-disconnect handler
    if (connected) {
      const disconnectRef = onDisconnect(playerConnectedRef)
      await disconnectRef.set(false)

      const disconnectActiveRef = onDisconnect(playerLastActiveRef)
      await disconnectActiveRef.set(Date.now())
    }

    console.log(`[Reconnection] Updated connection status for player ${playerId} in room ${roomId}:`, connected)
  } catch (error) {
    console.error('[Reconnection] Error updating player connection status:', error)
  }
}

/**
 * Mark player as reconnected
 *
 * @param {string} roomId - Room ID
 * @param {string} playerId - Player ID
 * @param {string} playerName - Player name
 */
export async function reconnectPlayer(roomId, playerId, playerName) {
  try {
    // Update connection status
    await updatePlayerConnectionStatus(roomId, playerId, true)

    console.log(`[Reconnection] Player ${playerName} (${playerId}) reconnected to room ${roomId}`)

    return { success: true }
  } catch (error) {
    console.error('[Reconnection] Error reconnecting player:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save current room to localStorage (for faster reconnection)
 *
 * @param {string} roomId - Room ID
 * @param {string} playerId - Player ID
 */
export function saveLastRoom(roomId, playerId) {
  if (!roomId || !playerId) return

  const lastRoomData = {
    roomId,
    playerId,
    timestamp: Date.now()
  }

  localStorage.setItem('lastRoom', JSON.stringify(lastRoomData))
  console.log('[Reconnection] Saved last room:', lastRoomData)
}

/**
 * Get last room from localStorage
 *
 * @returns {{roomId: string, playerId: string, timestamp: number}|null}
 */
export function getLastRoom() {
  try {
    const lastRoomStr = localStorage.getItem('lastRoom')
    if (!lastRoomStr) return null

    const lastRoomData = JSON.parse(lastRoomStr)

    // Check if last room data is less than 24 hours old
    const ONE_DAY = 24 * 60 * 60 * 1000
    if (Date.now() - lastRoomData.timestamp > ONE_DAY) {
      console.log('[Reconnection] Last room data is too old, clearing')
      localStorage.removeItem('lastRoom')
      return null
    }

    return lastRoomData
  } catch (error) {
    console.error('[Reconnection] Error getting last room:', error)
    return null
  }
}

/**
 * Clear last room data
 */
export function clearLastRoom() {
  localStorage.removeItem('lastRoom')
  // Set flag to prevent immediate reconnection
  localStorage.setItem('hasActivelyLeft', 'true')
  console.log('[Reconnection] Cleared last room data and set actively left flag')
}

/**
 * Clear the actively left flag
 * Call this when user joins/creates a new room
 */
export function clearActivelyLeftFlag() {
  localStorage.removeItem('hasActivelyLeft')
  console.log('[Reconnection] Cleared actively left flag')
}

/**
 * Check if player should reconnect and get reconnection data
 *
 * @param {string} playerId - Player ID
 * @returns {Promise<{shouldReconnect: boolean, roomId: string|null, roomData: object|null}>}
 */
export async function getReconnectionData(playerId) {
  if (!playerId) {
    return { shouldReconnect: false, roomId: null, roomData: null }
  }

  // Check if user has actively left - if so, don't reconnect
  const hasActivelyLeft = localStorage.getItem('hasActivelyLeft')
  if (hasActivelyLeft === 'true') {
    console.log('[Reconnection] User has actively left, skipping reconnection')
    return { shouldReconnect: false, roomId: null, roomData: null }
  }

  // First check last room from localStorage (faster)
  const lastRoom = getLastRoom()

  if (lastRoom && lastRoom.playerId === playerId) {
    console.log('[Reconnection] Checking last room from localStorage:', lastRoom.roomId)

    try {
      // Verify the room still exists and player is still in it
      const roomRef = ref(database, `rooms/${lastRoom.roomId}`)
      const snapshot = await get(roomRef)

      if (snapshot.exists()) {
        const roomData = snapshot.val()

        // Check if room is still playing and player is in it
        if (roomData.status === 'playing' && roomData.players && roomData.players[playerId]) {
          console.log('[Reconnection] Last room is still active, reconnecting')
          return {
            shouldReconnect: true,
            roomId: lastRoom.roomId,
            roomData
          }
        }
      }

      // Last room is no longer valid, clear it
      clearLastRoom()
    } catch (error) {
      console.error('[Reconnection] Error checking last room:', error)
      clearLastRoom()
    }
  }

  // Fall back to checking all rooms
  console.log('[Reconnection] Checking all rooms for player')
  const result = await checkPlayerInActiveRoom(playerId)

  if (result.inRoom) {
    // Save this room for faster reconnection next time
    saveLastRoom(result.roomId, playerId)
  }

  return {
    shouldReconnect: result.inRoom,
    roomId: result.roomId,
    roomData: result.roomData
  }
}
