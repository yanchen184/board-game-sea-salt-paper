/**
 * Transaction Retry Test Script
 *
 * This script tests the Firebase transaction retry mechanism.
 * Run with: node scripts/test-transaction-retry.js
 *
 * Prerequisites:
 * 1. Have a game room created
 * 2. Set ROOM_ID environment variable
 */

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, runTransaction, get, set } from 'firebase/database'

// Firebase configuration (use the same as your app)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

/**
 * Simulates the updateGameState function with retry
 */
async function updateGameStateWithRetry(roomId, updateFn, options = {}) {
  const { maxRetries = 3, retryDelay = 300 } = options
  const gameStateRef = ref(database, `rooms/${roomId}/gameState`)

  let lastError = null
  let transactionAttempts = 0

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      transactionAttempts = 0

      const result = await runTransaction(gameStateRef, (currentState) => {
        transactionAttempts++

        if (transactionAttempts > 1) {
          console.log(`  [Internal retry #${transactionAttempts}]`)
        }

        if (!currentState) {
          console.warn('  Received null state')
          return undefined
        }

        try {
          const newState = updateFn(currentState)
          if (newState === undefined) {
            console.error('  updateFn returned undefined')
            return undefined
          }
          return newState
        } catch (updateError) {
          console.error('  updateFn threw:', updateError.message)
          throw updateError
        }
      })

      if (result.committed) {
        console.log(`  Transaction committed (attempt ${attempt + 1})`)
        return result.snapshot.val()
      } else {
        console.warn('  Transaction aborted')
        lastError = new Error('Transaction aborted')
      }
    } catch (error) {
      lastError = error
      console.error(`  Attempt ${attempt + 1} failed:`, error.message)

      if (attempt < maxRetries) {
        const waitTime = retryDelay * Math.pow(2, attempt)
        console.log(`  Retrying in ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError || new Error('All retries exhausted')
}

/**
 * Test concurrent transactions
 */
async function testConcurrentTransactions(roomId) {
  console.log('\n=== Test: Concurrent Transactions ===')

  // Create two concurrent updates
  const update1 = updateGameStateWithRetry(roomId, (state) => {
    console.log('  Update 1 processing...')
    state.testCounter = (state.testCounter || 0) + 1
    return state
  })

  const update2 = updateGameStateWithRetry(roomId, (state) => {
    console.log('  Update 2 processing...')
    state.testCounter = (state.testCounter || 0) + 10
    return state
  })

  try {
    const [result1, result2] = await Promise.all([update1, update2])
    console.log('Both transactions completed:')
    console.log('  Result 1 testCounter:', result1?.testCounter)
    console.log('  Result 2 testCounter:', result2?.testCounter)
  } catch (error) {
    console.error('Concurrent test failed:', error.message)
  }
}

/**
 * Test null state handling
 */
async function testNullStateHandling() {
  console.log('\n=== Test: Null State Handling ===')

  const fakeRoomId = 'non-existent-room-' + Date.now()

  try {
    await updateGameStateWithRetry(fakeRoomId, (state) => {
      console.log('  This should not be called')
      return state
    }, { maxRetries: 1 })
    console.log('  Unexpected success')
  } catch (error) {
    console.log('  Expected error:', error.message)
  }
}

/**
 * Test updateFn throwing error
 */
async function testUpdateFnError(roomId) {
  console.log('\n=== Test: updateFn Error ===')

  try {
    await updateGameStateWithRetry(roomId, (state) => {
      throw new Error('Simulated business logic error')
    }, { maxRetries: 1 })
    console.log('  Unexpected success')
  } catch (error) {
    console.log('  Expected error:', error.message)
  }
}

// Main
async function main() {
  const roomId = process.env.ROOM_ID

  if (!roomId) {
    console.error('Please set ROOM_ID environment variable')
    console.log('Example: ROOM_ID=ABC123 node scripts/test-transaction-retry.js')
    process.exit(1)
  }

  console.log('Testing transaction retry mechanism...')
  console.log('Room ID:', roomId)

  // Check if room exists
  const roomRef = ref(database, `rooms/${roomId}`)
  const snapshot = await get(roomRef)

  if (!snapshot.exists()) {
    console.error('Room does not exist')
    process.exit(1)
  }

  console.log('Room found, starting tests...')

  await testNullStateHandling()
  await testUpdateFnError(roomId)
  await testConcurrentTransactions(roomId)

  console.log('\n=== All tests completed ===')
  process.exit(0)
}

main().catch(error => {
  console.error('Test failed:', error)
  process.exit(1)
})
