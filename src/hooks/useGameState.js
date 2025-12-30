import { useCallback } from 'react'
import { updateGameState, updatePlayerHand, addActionToLog } from '../services/firebaseService.js'
import { drawFromDeck, validatePair, executePairEffect, checkDeckReshuffle } from '../services/gameService.js'
import { calculateScore } from '../services/scoreService.js'

/**
 * useGameState Hook
 *
 * Manages all game state operations
 * Provides functions for:
 * - Drawing cards (from deck or discard)
 * - Playing pairs
 * - Ending turns
 * - Declaring (stop/last chance)
 *
 * @param {string} roomId - Room ID
 * @param {Object} gameState - Current game state
 * @param {string} playerId - Current player ID
 * @returns {Object} Game action functions
 */
export function useGameState(roomId, gameState, playerId) {
  /**
   * Draw cards from deck (draws 2 cards for player choice)
   * Returns the 2 cards drawn without adding to hand yet
   */
  const drawCard = useCallback(async () => {
    if (!gameState || !playerId) return { success: false, error: 'Invalid state' }

    if (gameState.currentPlayerId !== playerId) {
      return { success: false, error: 'Not your turn' }
    }

    if (gameState.turnPhase !== 'draw') {
      return { success: false, error: 'Cannot draw now' }
    }

    try {
      const updatedState = await updateGameState(roomId, (state) => {
        const currentDeckSize = state.deck ? state.deck.length : 0
        const leftDiscardSize = state.discardLeft ? state.discardLeft.length : 0
        const rightDiscardSize = state.discardRight ? state.discardRight.length : 0

        console.log(`[Draw Card] Deck: ${currentDeckSize}, Left: ${leftDiscardSize}, Right: ${rightDiscardSize}`)

        // Check for reshuffle
        const reshuffleResult = checkDeckReshuffle(
          state.deck || [],
          state.discardLeft || [],
          state.discardRight || []
        )

        if (reshuffleResult.needsReshuffle) {
          console.log(`[Draw Card] Reshuffled! New deck size: ${reshuffleResult.newDeck.length}`)
        }

        let deck = reshuffleResult.newDeck
        const discardLeft = reshuffleResult.newDiscardLeft
        const discardRight = reshuffleResult.newDiscardRight

        // Check if we have at least 2 cards to draw
        if (!deck || deck.length < 2) {
          throw new Error('Not enough cards in deck to draw 2 cards')
        }

        // Draw 2 cards
        const { drawnCards, remainingDeck } = drawFromDeck(deck, 2)

        if (!drawnCards || drawnCards.length < 2) {
          throw new Error('Failed to draw 2 cards')
        }

        // Store drawn cards temporarily in game state for player choice
        state.pendingCardChoice = {
          playerId,
          cards: drawnCards
        }

        state.deck = remainingDeck
        state.deckCount = remainingDeck.length
        state.discardLeft = discardLeft
        state.discardRight = discardRight
        state.turnPhase = 'choosing_card'

        console.log('[drawCard] Setting pendingCardChoice:', {
          playerId,
          cardCount: drawnCards.length,
          turnPhase: state.turnPhase
        })

        return state
      })

      console.log('[drawCard] Updated state:', {
        hasPendingChoice: !!updatedState.pendingCardChoice,
        turnPhase: updatedState.turnPhase
      })

      // Log action
      const playerName = localStorage.getItem('playerName') || '未知玩家'
      await addActionToLog(roomId, {
        type: 'draw',
        playerId,
        playerName,
        message: '抽了 2 張牌進行選擇'
      })

      return {
        success: true,
        cards: updatedState.pendingCardChoice.cards
      }
    } catch (error) {
      console.error('Draw card error:', error)
      return { success: false, error: error.message }
    }
  }, [roomId, gameState, playerId])

  /**
   * Take card from discard pile
   *
   * @param {string} side - 'left' or 'right'
   */
  const takeFromDiscard = useCallback(async (side) => {
    if (!gameState || !playerId) return { success: false, error: 'Invalid state' }

    if (gameState.currentPlayerId !== playerId) {
      return { success: false, error: 'Not your turn' }
    }

    if (gameState.turnPhase !== 'draw') {
      return { success: false, error: 'Cannot take from discard now' }
    }

    const pile = side === 'left' ? gameState.discardLeft : gameState.discardRight

    if (!pile || pile.length === 0) {
      return { success: false, error: 'Discard pile is empty' }
    }

    try {
      const updatedState = await updateGameState(roomId, (state) => {
        // Defensive check: abort transaction if state is null
        if (!state) {
          console.error('[Take Discard] Transaction aborted - state is null')
          return // Return undefined to abort transaction
        }

        const pileKey = side === 'left' ? 'discardLeft' : 'discardRight'
        const pile = state[pileKey]

        // Check if pile exists and has cards
        if (!pile || pile.length === 0) {
          console.error('[Take Discard] Pile is empty or undefined')
          return // Abort transaction
        }

        // Take top card
        const takenCard = pile[pile.length - 1]
        const newPile = pile.slice(0, -1)

        // Update player hand
        const player = state.players?.[playerId]

        // Defensive check
        if (!player) {
          console.error('[Take Discard] Player not found in game state')
          return // Abort transaction
        }
        if (!Array.isArray(player.hand)) {
          console.error(`[Take Discard] Player ${playerId} hand is not an array:`, player.hand)
          player.hand = []
        }

        const newHand = [...player.hand, takenCard]

        state.players[playerId].hand = newHand
        state[pileKey] = newPile
        state.turnPhase = 'pair'

        return state
      })

      // Check if transaction succeeded
      if (!updatedState || !updatedState.players?.[playerId]) {
        console.error('[Take Discard] Transaction failed or returned invalid state')
        return { success: false, error: 'Transaction aborted - please try again' }
      }

      // Update player hand in database
      await updatePlayerHand(roomId, playerId, updatedState.players[playerId].hand)

      // Log action with card data (last card in hand is the one just taken)
      const playerName = localStorage.getItem('playerName') || '未知玩家'
      const sideText = side === 'left' ? '左側' : '右側'
      const playerHand = updatedState.players[playerId].hand
      const takenCard = playerHand[playerHand.length - 1]
      await addActionToLog(roomId, {
        type: 'draw_discard',
        playerId,
        playerName,
        message: `從${sideText}棄牌堆拿了一張牌`,
        cardData: takenCard
      })

      return { success: true }
    } catch (error) {
      console.error('Take from discard error:', error)
      return { success: false, error: error.message }
    }
  }, [roomId, gameState, playerId])

  /**
   * Play a pair of cards
   *
   * @param {Array} cards - Two cards to play as pair
   */
  const playPair = useCallback(async (cards) => {
    if (!gameState || !playerId) return { success: false, error: 'Invalid state' }

    if (gameState.currentPlayerId !== playerId) {
      return { success: false, error: 'Not your turn' }
    }

    if (gameState.turnPhase !== 'pair') {
      return { success: false, error: 'Cannot play pair now' }
    }

    if (!cards || cards.length !== 2) {
      return { success: false, error: 'Must select exactly 2 cards' }
    }

    // Validate pair
    if (!validatePair(cards[0], cards[1])) {
      return { success: false, error: 'Invalid pair' }
    }

    try {
      const updatedState = await updateGameState(roomId, (state) => {
        const player = state.players[playerId]

        // Defensive check
        if (!player) {
          throw new Error('Player not found in game state')
        }
        if (!Array.isArray(player.hand)) {
          console.error(`[Play Pair] Player ${playerId} hand is not an array:`, player.hand)
          player.hand = []
        }
        if (!Array.isArray(player.playedPairs)) {
          console.error(`[Play Pair] Player ${playerId} playedPairs is not an array:`, player.playedPairs)
          player.playedPairs = []
        }

        // Remove cards from hand
        const newHand = player.hand.filter(c => !cards.some(pc => pc.id === c.id))

        // Add pair to played pairs
        const newPair = {
          cards: cards,
          timestamp: Date.now()
        }
        const newPlayedPairs = [...player.playedPairs, newPair]

        state.players[playerId].hand = newHand
        state.players[playerId].playedPairs = newPlayedPairs

        // Execute pair effect
        const effect = executePairEffect(cards[0], cards[1])

        if (effect.effect) {
          // Handle different effect types
          switch (effect.effect) {
            case 'draw_blind':
              // Auto-draw one card from deck
              if (state.deck && state.deck.length > 0) {
                const drawnCard = state.deck.pop()
                state.players[playerId].hand.push(drawnCard)
                console.log('[playPair] Auto-draw effect: Drew', drawnCard.name)
              }
              break

            case 'draw_discard':
              // Crab effect - let player choose from discard pile
              state.pendingEffect = {
                effect: 'draw_discard',
                playerId,
                cards: effect.cards
              }
              break

            case 'extra_turn':
              // Extra turn effect - keep current player
              state.pendingEffect = {
                effect: 'extra_turn',
                playerId,
                cards: effect.cards
              }
              break

            case 'steal_card':
              // Steal card effect - let player choose opponent
              state.pendingEffect = {
                effect: 'steal_card',
                playerId,
                cards: effect.cards
              }
              break

            default:
              // Unknown effect, just log it
              console.log('[playPair] Unknown effect:', effect.effect)
          }
        }

        return state
      })

      // Update player hand in database
      const playerHand = updatedState?.players?.[playerId]?.hand
      if (playerHand !== undefined) {
        await updatePlayerHand(roomId, playerId, playerHand)
      } else {
        console.error('[playPair] Updated state missing player hand:', {
          hasUpdatedState: !!updatedState,
          hasPlayers: !!updatedState?.players,
          hasPlayer: !!updatedState?.players?.[playerId],
          playerId
        })
      }

      // Log action
      const playerName = localStorage.getItem('playerName') || '未知玩家'
      const effect = updatedState.pendingEffect
      let effectMessage = ''

      // Add effect description to message
      if (effect && effect.effect) {
        switch (effect.effect) {
          case 'draw_discard':
            effectMessage = ' → 可以從棄牌堆選一張牌'
            break
          case 'extra_turn':
            effectMessage = ' → 獲得額外回合'
            break
          case 'steal_card':
            effectMessage = ' → 可以偷取對手一張牌'
            break
        }
      } else {
        // Check if it was draw_blind (auto-executed)
        const pairEffect = executePairEffect(cards[0], cards[1])
        if (pairEffect.effect === 'draw_blind') {
          effectMessage = ' → 自動抽一張牌'
        }
      }

      await addActionToLog(roomId, {
        type: 'play_pair',
        playerId,
        playerName,
        message: `打出了一對：${cards[0].name} + ${cards[1].name}${effectMessage}`
      })

      return { success: true, effect: updatedState.pendingEffect }
    } catch (error) {
      console.error('Play pair error:', error)
      return { success: false, error: error.message }
    }
  }, [roomId, gameState, playerId])

  /**
   * End turn and move to next player
   * Handles Last Chance mode countdown
   */
  const endTurn = useCallback(async () => {
    if (!gameState || !playerId) return { success: false, error: 'Invalid state' }

    if (gameState.currentPlayerId !== playerId) {
      return { success: false, error: 'Not your turn' }
    }

    try {
      const updatedState = await updateGameState(roomId, (state) => {
        // 🔑 Check for extra_turn effect FIRST
        const hasExtraTurn = state.pendingEffect && state.pendingEffect.effect === 'extra_turn'

        if (hasExtraTurn) {
          console.log('[endTurn] ⛵ Extra turn detected! Current player gets another turn')
          // Keep current player, reset to draw phase
          state.turnPhase = 'draw'
          state.pendingEffect = null
          // Don't increment turnCount or change player
          return state
        }

        // 💡 改進：檢查玩家分數，只有 >= 7 分才進入宣告階段
        console.log('[endTurn] Checking player score for currentPlayerId:', state.currentPlayerId)
        const player = state.players[state.currentPlayerId]

        if (!player) {
          console.error('[endTurn] ERROR: Player not found for currentPlayerId:', state.currentPlayerId)
          console.error('[endTurn] Available players:', Object.keys(state.players))
          throw new Error(`Player ${state.currentPlayerId} not found in game state`)
        }

        console.log('[endTurn] Player found:', player.name, 'calculating score...')
        console.log('[endTurn] Player hand:', player.hand?.length || 0, 'cards')
        console.log('[endTurn] Player playedPairs:', player.playedPairs?.length || 0, 'pairs')

        const playerScore = calculateScore(
          player?.hand || [],
          player?.playedPairs || [],
          { includeColorBonus: false }
        )

        console.log('[endTurn] Calculated score:', playerScore.total)

        // 如果分數 >= 7，進入宣告階段讓玩家選擇
        if (playerScore.total >= 7) {
          console.log('[endTurn] Score >= 7, entering declare phase')
          state.turnPhase = 'declare'
          state.pendingEffect = null
          return state
        }

        // 分數 < 7，自動跳過宣告，直接切換到下一個玩家
        console.log('[endTurn] Score < 7, auto-skipping declare, switching to next player')

        // 使用固定的玩家順序數組
        const playerIds = state.playerOrder || Object.keys(state.players)
        console.log('[endTurn] Player IDs:', playerIds)
        console.log('[endTurn] Current player ID:', state.currentPlayerId)

        const currentIndex = playerIds.indexOf(state.currentPlayerId)
        console.log('[endTurn] Current index:', currentIndex)

        if (currentIndex === -1) {
          console.error('[endTurn] ERROR: currentPlayerId not found in playerIds array')
          throw new Error(`Current player ${state.currentPlayerId} not in player order`)
        }

        const nextIndex = (currentIndex + 1) % playerIds.length
        const nextPlayerId = playerIds[nextIndex]
        console.log('[endTurn] Next player index:', nextIndex, 'ID:', nextPlayerId)

        // Increment turn count
        state.turnCount = (state.turnCount || 0) + 1

        // 處理 Last Chance 模式
        if (state.declareMode === 'last_chance' && state.remainingTurns !== null) {
          state.remainingTurns = state.remainingTurns - 1
          console.log('[endTurn] Last Chance mode - remaining turns:', state.remainingTurns)

          // 如果沒有剩餘回合，結束回合
          if (state.remainingTurns <= 0) {
            console.log('[endTurn] Last Chance complete - ending round')
            state.turnPhase = 'round_end'
            return state
          }
        }

        state.currentPlayerId = nextPlayerId
        state.currentPlayerIndex = nextIndex
        state.turnPhase = 'draw'
        state.pendingEffect = null

        console.log('[endTurn] Switched to next player:', nextPlayerId, 'turnCount:', state.turnCount)

        return state
      })

      console.log('[endTurn] Updated state:', {
        currentPlayerId: updatedState.currentPlayerId,
        turnPhase: updatedState.turnPhase,
        declareMode: updatedState.declareMode,
        remainingTurns: updatedState.remainingTurns
      })

      // Log action
      const playerName = localStorage.getItem('playerName') || '未知玩家'
      await addActionToLog(roomId, {
        type: 'end_turn',
        playerId,
        playerName,
        message: '結束了回合'
      })

      return { success: true }
    } catch (error) {
      console.error('End turn error:', error)
      return { success: false, error: error.message }
    }
  }, [roomId, gameState, playerId])

  /**
   * Declare stop
   * Shows declarer's score first, then immediately ends the round
   */
  const declareStop = useCallback(async () => {
    if (!gameState || !playerId) return { success: false, error: 'Invalid state' }

    try {
      await updateGameState(roomId, (state) => {
        state.declareMode = 'stop'
        state.declaringPlayerId = playerId
        // Show declarer's score first before ending round
        state.turnPhase = 'declare_showing'

        return state
      })

      // Log action
      const playerName = localStorage.getItem('playerName') || '未知玩家'
      await addActionToLog(roomId, {
        type: 'declare_stop',
        playerId,
        playerName,
        message: '宣告「到此為止 (Stop)」！先來看看宣告者的分數...'
      })

      return { success: true }
    } catch (error) {
      console.error('Declare stop error:', error)
      return { success: false, error: error.message }
    }
  }, [roomId, gameState, playerId])

  /**
   * Declare last chance
   * Shows declarer's score first, then auto-ends turn and gives others one more turn each
   */
  const declareLastChance = useCallback(async () => {
    if (!gameState || !playerId) return { success: false, error: 'Invalid state' }

    try {
      const playerIds = Object.keys(gameState.players)

      await updateGameState(roomId, (state) => {
        state.declareMode = 'last_chance'
        state.declaringPlayerId = playerId
        state.remainingTurns = playerIds.length - 1 // Everyone else gets one more turn
        // Show declarer's score first before continuing
        state.turnPhase = 'declare_showing'

        return state
      })

      // Log action
      const playerName = localStorage.getItem('playerName') || '未知玩家'
      await addActionToLog(roomId, {
        type: 'declare_last_chance',
        playerId,
        playerName,
        message: '宣告「最後機會 (Last Chance)」！先來看看宣告者的分數，然後每人還有一次回合...'
      })

      return { success: true }
    } catch (error) {
      console.error('Declare last chance error:', error)
      return { success: false, error: error.message }
    }
  }, [roomId, gameState, playerId])

  /**
   * Confirm card choice (keep one, discard the other)
   *
   * The retry mechanism is now handled by updateGameState internally.
   * This function focuses on the business logic only.
   *
   * @param {Object} chosenCard - Card to keep
   * @param {string} discardSide - 'left' or 'right' for discard pile
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const confirmCardChoice = useCallback(async (chosenCard, discardSide) => {
    if (!playerId) return { success: false, error: 'Invalid state' }

    console.log('[confirmCardChoice] Starting:', {
      chosenCard: chosenCard?.name,
      chosenCardId: chosenCard?.id,
      discardSide
    })

    try {
      // updateGameState now has built-in retry with exponential backoff
      const updatedState = await updateGameState(roomId, (state) => {
        // Validate state structure
        // Note: null check is now handled by updateGameState
        console.log('[confirmCardChoice] Processing state:', {
          turnPhase: state.turnPhase,
          hasPendingChoice: !!state.pendingCardChoice,
          currentPlayerId: state.currentPlayerId
        })

        // Validate phase
        if (state.turnPhase !== 'choosing_card') {
          // This might happen if the operation was already completed
          // Check if we should treat this as success
          if (state.turnPhase === 'pair' && !state.pendingCardChoice) {
            console.warn('[confirmCardChoice] Already in pair phase, operation may have completed')
            // Return state unchanged - will be treated as no-op
            return state
          }
          console.error(`[confirmCardChoice] Wrong phase: ${state.turnPhase}, expected: choosing_card`)
          throw new Error(`Wrong phase: ${state.turnPhase}`)
        }

        if (!state.pendingCardChoice) {
          console.error('[confirmCardChoice] No pending card choice in state')
          throw new Error('No pending card choice')
        }

        const { cards } = state.pendingCardChoice

        // Find the card to discard
        const discardedCard = cards.find(c => c.id !== chosenCard.id)

        if (!discardedCard) {
          console.error('[confirmCardChoice] Could not find discarded card:', {
            chosenId: chosenCard.id,
            availableIds: cards.map(c => c.id)
          })
          throw new Error('Invalid card choice')
        }

        console.log('[confirmCardChoice] Card decision:', {
          kept: chosenCard.name,
          discarded: discardedCard.name
        })

        // Get player data
        const player = state.players[playerId]
        if (!player) {
          console.error('[confirmCardChoice] Player not found in state')
          throw new Error('Player not found')
        }

        // Update player hand
        const currentHand = Array.isArray(player.hand) ? player.hand : []
        const newHand = [...currentHand, chosenCard]

        console.log('[confirmCardChoice] Hand update:', {
          oldSize: currentHand.length,
          newSize: newHand.length,
          addedCard: chosenCard.name
        })

        // Update discard pile
        const pileKey = discardSide === 'left' ? 'discardLeft' : 'discardRight'
        const currentPile = state[pileKey] || []

        // Create new state with all updates
        return {
          ...state,
          [pileKey]: [...currentPile, discardedCard],
          players: {
            ...state.players,
            [playerId]: {
              ...player,
              hand: newHand
            }
          },
          pendingCardChoice: null,
          turnPhase: 'pair'
        }
      }, { maxRetries: 3, retryDelay: 300 })

      console.log('[confirmCardChoice] Transaction completed:', {
        hasUpdatedState: !!updatedState,
        turnPhase: updatedState?.turnPhase,
        handSize: updatedState?.players?.[playerId]?.hand?.length
      })

      // Sync player hand metadata
      const playerHand = updatedState?.players?.[playerId]?.hand
      if (playerHand !== undefined) {
        try {
          await updatePlayerHand(roomId, playerId, playerHand)
        } catch (handError) {
          // Log but don't fail - the main transaction succeeded
          console.error('[confirmCardChoice] Failed to sync player hand metadata:', handError)
        }
      }

      // Log action (non-critical, don't fail if this errors)
      try {
        const playerName = localStorage.getItem('playerName') || '未知玩家'
        const sideText = discardSide === 'left' ? '左側' : '右側'
        await addActionToLog(roomId, {
          type: 'card_choice',
          playerId,
          playerName,
          message: `保留了 ${chosenCard.name}，並將另一張棄到${sideText}棄牌堆`
        })
      } catch (logError) {
        console.error('[confirmCardChoice] Failed to log action:', logError)
      }

      console.log('[confirmCardChoice] Success!')
      return { success: true }
    } catch (error) {
      console.error('[confirmCardChoice] Failed:', {
        errorMessage: error?.message,
        errorStack: error?.stack
      })

      return { success: false, error: error?.message || String(error) }
    }
  }, [roomId, playerId])

  /**
   * Execute Crab Effect - Take card from discard pile
   *
   * @param {number} cardIndex - Index of card in pile (0 = bottom, length-1 = top)
   * @param {string} side - 'left' or 'right'
   */
  const executeCrabEffect = useCallback(async (cardIndex, side) => {
    if (!playerId) return { success: false, error: 'Invalid state' }

    try {
      const updatedState = await updateGameState(roomId, (state) => {
        if (!state.pendingEffect || state.pendingEffect.effect !== 'draw_discard') {
          throw new Error('No crab effect pending')
        }

        const pileKey = side === 'left' ? 'discardLeft' : 'discardRight'
        const pile = state[pileKey]

        if (!pile || pile.length === 0) {
          throw new Error(`${side} discard pile is empty`)
        }

        if (cardIndex < 0 || cardIndex >= pile.length) {
          throw new Error('Invalid card index')
        }

        // Take selected card from pile
        const takenCard = pile[cardIndex]
        const newPile = pile.filter((_, idx) => idx !== cardIndex)

        // Add to player hand
        const player = state.players[playerId]
        if (!Array.isArray(player.hand)) {
          player.hand = []
        }
        const newHand = [...player.hand, takenCard]

        state.players[playerId].hand = newHand
        state[pileKey] = newPile
        state.pendingEffect = null

        console.log('[executeCrabEffect] Took card:', {
          card: takenCard.name,
          cardIndex,
          side,
          newHandSize: newHand.length
        })

        return state
      })

      // Update player hand in database
      await updatePlayerHand(roomId, playerId, updatedState.players[playerId].hand)

      // Log action with card data (last card in hand is the one just taken)
      const playerName = localStorage.getItem('playerName') || '未知玩家'
      const sideText = side === 'left' ? '左側' : '右側'
      const playerHand = updatedState.players[playerId].hand
      const takenCard = playerHand[playerHand.length - 1]
      await addActionToLog(roomId, {
        type: 'draw_discard',
        playerId,
        playerName,
        message: `使用螃蟹效果，從${sideText}棄牌堆拿了一張牌`,
        cardData: takenCard
      })

      return { success: true }
    } catch (error) {
      console.error('Execute crab effect error:', error)
      return { success: false, error: error.message }
    }
  }, [roomId, playerId])

  /**
   * Execute steal card effect - Steal a card from opponent's hand
   * @param {string} opponentId - ID of opponent to steal from
   * @param {number} cardIndex - Index of card in opponent's hand
   */
  const executeStealEffect = useCallback(async (opponentId, cardIndex) => {
    console.log('[executeStealEffect] Starting:', { opponentId, cardIndex, playerId })

    if (!roomId || !playerId) {
      return { success: false, error: 'Missing room or player ID' }
    }

    try {
      // Update game state atomically
      const updatedState = await updateGameState(roomId, (state) => {
        if (!state) throw new Error('Game state not found')

        // Verify pending effect
        if (!state.pendingEffect || state.pendingEffect.effect !== 'steal_card') {
          throw new Error('No steal card effect pending')
        }

        if (state.pendingEffect.playerId !== playerId) {
          throw new Error('Not your effect to execute')
        }

        // Verify opponent exists and has cards
        const opponent = state.players[opponentId]
        if (!opponent) {
          throw new Error('Opponent not found')
        }

        if (!Array.isArray(opponent.hand) || opponent.hand.length === 0) {
          throw new Error('Opponent has no cards')
        }

        if (cardIndex < 0 || cardIndex >= opponent.hand.length) {
          throw new Error('Invalid card index')
        }

        // Steal the card
        const stolenCard = opponent.hand[cardIndex]
        const newOpponentHand = opponent.hand.filter((_, idx) => idx !== cardIndex)

        // Add to current player's hand
        const player = state.players[playerId]
        if (!Array.isArray(player.hand)) {
          player.hand = []
        }
        const newPlayerHand = [...player.hand, stolenCard]

        // Update the most recent Shark+Swimmer pair with stolen info
        if (Array.isArray(player.playedPairs) && player.playedPairs.length > 0) {
          const lastPair = player.playedPairs[player.playedPairs.length - 1]
          if (lastPair.cards) {
            const cardNames = lastPair.cards.map(c => c.name)
            if (cardNames.includes('Shark') && cardNames.includes('Swimmer')) {
              lastPair.stolenFrom = {
                playerId: opponentId,
                playerName: opponent.name || '未知玩家',
                cardName: stolenCard.name
              }
              console.log('[executeStealEffect] Updated pair with stolen info:', lastPair.stolenFrom)
            }
          }
        }

        // Update both players' hands
        state.players[opponentId].hand = newOpponentHand
        state.players[playerId].hand = newPlayerHand
        state.pendingEffect = null

        console.log('[executeStealEffect] Stole card:', {
          card: stolenCard.name,
          from: opponentId,
          newPlayerHandSize: newPlayerHand.length,
          newOpponentHandSize: newOpponentHand.length
        })

        return state
      })

      // Update both players' hands in database
      await updatePlayerHand(roomId, playerId, updatedState.players[playerId].hand)
      await updatePlayerHand(roomId, opponentId, updatedState.players[opponentId].hand)

      // Log action（不顯示卡片名稱，保密）
      const playerName = localStorage.getItem('playerName') || '未知玩家'
      const opponentName = updatedState.players[opponentId]?.name || '對手'
      await addActionToLog(roomId, {
        type: 'effect_steal',
        playerId,
        playerName,
        message: `偷取了 ${opponentName} 的一張牌`,
        cardData: {
          opponentName: opponentName
          // 不記錄 cardName，保持機密性
        }
      })

      return { success: true }
    } catch (error) {
      console.error('Execute steal effect error:', error)
      return { success: false, error: error.message }
    }
  }, [roomId, playerId])

  /**
   * Confirm declare score - after showing declarer's score
   * For STOP: go directly to round_end
   * For Last Chance: move to next player's turn
   */
  const confirmDeclareScore = useCallback(async () => {
    if (!gameState || !playerId) return { success: false, error: 'Invalid state' }

    try {
      const declareMode = gameState.declareMode

      await updateGameState(roomId, (state) => {
        if (declareMode === 'stop') {
          // STOP mode: end round immediately
          state.turnPhase = 'round_end'
        } else if (declareMode === 'last_chance') {
          // Last Chance mode: move to next player
          // Use fixed player order array for consistency
          const playerIds = state.playerOrder || Object.keys(state.players)
          const currentIndex = playerIds.indexOf(state.currentPlayerId)
          const nextIndex = (currentIndex + 1) % playerIds.length
          const nextPlayerId = playerIds[nextIndex]

          console.log('[confirmDeclareScore] Last Chance mode - switching to next player:', {
            currentPlayerId: state.currentPlayerId,
            nextPlayerId,
            currentIndex,
            nextIndex,
            remainingTurns: state.remainingTurns,
            playerOrder: playerIds
          })

          state.currentPlayerId = nextPlayerId
          state.currentPlayerIndex = nextIndex
          state.turnPhase = 'draw'
          state.pendingEffect = null
        }

        return state
      })

      // Log action
      const playerName = localStorage.getItem('playerName') || '未知玩家'
      if (declareMode === 'stop') {
        await addActionToLog(roomId, {
          type: 'declare_confirmed',
          playerId,
          playerName,
          message: '分數確認完畢，回合正式結束！'
        })
      } else {
        await addActionToLog(roomId, {
          type: 'declare_confirmed',
          playerId,
          playerName,
          message: '分數確認完畢，輪到下一位玩家！'
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Confirm declare score error:', error)
      return { success: false, error: error.message }
    }
  }, [roomId, gameState, playerId])

  /**
   * Skip declaration - move to next player without declaring
   */
  const skipDeclare = useCallback(async () => {
    if (!gameState || !playerId) return { success: false, error: 'Invalid state' }

    if (gameState.turnPhase !== 'declare') {
      return { success: false, error: 'Not in declare phase' }
    }

    try {
      await updateGameState(roomId, (state) => {
        // 使用固定的玩家順序數組，而不是 Object.keys
        const playerIds = state.playerOrder || Object.keys(state.players)
        const currentIndex = playerIds.indexOf(state.currentPlayerId)
        const nextIndex = (currentIndex + 1) % playerIds.length
        const nextPlayerId = playerIds[nextIndex]

        // Increment turn count
        state.turnCount = (state.turnCount || 0) + 1

        console.log('[skipDeclare] Skipping declare, next player:', nextPlayerId, 'playerOrder:', playerIds)

        // Handle Last Chance mode
        if (state.declareMode === 'last_chance' && state.remainingTurns !== null) {
          state.remainingTurns = state.remainingTurns - 1
          console.log('[skipDeclare] Last Chance mode - remaining turns:', state.remainingTurns)

          // If no more turns left, end the round
          if (state.remainingTurns <= 0) {
            console.log('[skipDeclare] Last Chance complete - ending round')
            state.turnPhase = 'round_end'
            return state
          }
        }

        state.currentPlayerId = nextPlayerId
        state.currentPlayerIndex = nextIndex
        state.turnPhase = 'draw'
        state.pendingEffect = null

        return state
      })

      // Log action
      const playerName = localStorage.getItem('playerName') || '未知玩家'
      await addActionToLog(roomId, {
        type: 'skip_declare',
        playerId,
        playerName,
        message: '選擇不宣告，結束回合'
      })

      return { success: true }
    } catch (error) {
      console.error('Skip declare error:', error)
      return { success: false, error: error.message }
    }
  }, [roomId, gameState, playerId])

  /**
   * Execute Extra Turn effect - Start a new turn for current player
   * Instead of moving to next player, reset turn phase to 'draw'
   */
  const executeExtraTurn = useCallback(async () => {
    if (!playerId) return { success: false, error: 'Invalid state' }

    console.log('[executeExtraTurn] Starting extra turn for player:', playerId)

    try {
      await updateGameState(roomId, (state) => {
        if (!state.pendingEffect || state.pendingEffect.effect !== 'extra_turn') {
          throw new Error('No extra turn effect pending')
        }

        // Reset turn phase to 'draw' - same player gets another turn
        state.turnPhase = 'draw'
        state.pendingEffect = null

        console.log('[executeExtraTurn] Extra turn started, turnPhase reset to draw')

        return state
      })

      // Log action
      const playerName = localStorage.getItem('playerName') || '未知玩家'
      await addActionToLog(roomId, {
        type: 'extra_turn',
        playerId,
        playerName,
        message: `使用帆船效果，獲得額外回合！`
      })

      return { success: true }
    } catch (error) {
      console.error('Execute extra turn error:', error)
      return { success: false, error: error.message }
    }
  }, [roomId, playerId])

  return {
    drawCard,
    takeFromDiscard,
    playPair,
    endTurn,
    declareStop,
    declareLastChance,
    skipDeclare,
    confirmCardChoice,
    executeCrabEffect,
    executeStealEffect,
    executeExtraTurn,
    confirmDeclareScore
  }
}

export default useGameState
