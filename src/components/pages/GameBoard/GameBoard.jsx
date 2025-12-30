import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TableLayout from '../../game/TableLayout/TableLayout'
import ScorePanel from '../../game/ScorePanel/ScorePanel'
import ActionLog from '../../game/ActionLog/ActionLog'
import Button from '../../common/Button/Button'
import Card from '../../common/Card/Card'
import Modal from '../../common/Modal/Modal'
import CrabEffectModal from '../../game/CrabEffectModal/CrabEffectModal'
import StealCardModal from '../../game/StealCardModal/StealCardModal'
import AnimatedCard from '../../game/AnimatedCard/AnimatedCard'
import TurnNotification from '../../game/TurnNotification/TurnNotification'
import RoundEndModal from '../../game/RoundEndModal/RoundEndModal'
import DeclareScoreModal from '../../game/DeclareScoreModal/DeclareScoreModal'
import RoundSettlement from '../../game/RoundSettlement/RoundSettlement'
import OpponentDrawAnimation from '../../game/OpponentDrawAnimation/OpponentDrawAnimation'
import { listenToRoom, updateGameState, updatePlayerHand, addActionToLog } from '../../../services/firebaseService'
import { database, ref, get } from '../../../config/firebase'
import { calculateScore, calculateLastChanceScores } from '../../../services/scoreService'
import { drawFromDeck, checkDeckReshuffle, createDeck, executePairEffect } from '../../../services/gameService'
import { useGameState } from '../../../hooks/useGameState'
import { makeAIDecision } from '../../../services/aiService'
import { COLOR_DISTRIBUTION, GAME_COLORS } from '../../../config/colorConfig'
import { saveLastRoom, updatePlayerConnectionStatus, reconnectPlayer, clearLastRoom } from '../../../services/reconnectionService'
import './GameBoard.css'

/**
 * GameBoard Component
 *
 * Main game interface with BGA-style layout
 * Features:
 * - Real-time game state synchronization
 * - Player hand at bottom with selection
 * - Opponent areas at top
 * - Center table area (deck, discard piles, action log)
 * - Score panel with declare options
 * - Turn management and game flow
 */
function GameBoard() {
  const { roomId } = useParams()
  const navigate = useNavigate()

  const [gameState, setGameState] = useState(null)
  const [roomData, setRoomData] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [selectedCards, setSelectedCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [drawnCards, setDrawnCards] = useState(null)
  const [showDrawCardArea, setShowDrawCardArea] = useState(false)
  const [isDraggingCard, setIsDraggingCard] = useState(false)
  const [animatedCards, setAnimatedCards] = useState([])
  const [showTurnNotification, setShowTurnNotification] = useState(false)
  const [cardEnteringHand, setCardEnteringHand] = useState(null) // 觸發抽卡特效的卡牌
  const [roundResults, setRoundResults] = useState(null)
  const [showRoundEnd, setShowRoundEnd] = useState(false)
  const [showSettlement, setShowSettlement] = useState(false)
  const [settlementData, setSettlementData] = useState(null)
  const [opponentDrawAnimation, setOpponentDrawAnimation] = useState(null)
  const [showDeclareScore, setShowDeclareScore] = useState(false)
  const [declareScoreData, setDeclareScoreData] = useState(null)
  const [showColorInfo, setShowColorInfo] = useState(false)
  const [showHandColorStats, setShowHandColorStats] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const previousHandRef = useRef([])
  const previousCurrentPlayerIdRef = useRef(null)
  const previousActionLogLengthRef = useRef(0)
  const aiTimerRef = useRef(null) // 追蹤 AI 定時器
  const aiTurnKeyRef = useRef(null) // 追蹤當前 AI 回合的唯一標識
  const isLeavingRef = useRef(false) // 標記是否為主動離開

  // Game state hook
  const gameActions = useGameState(roomId, gameState, currentPlayer?.id)

  // Get current player
  useEffect(() => {
    const playerId = localStorage.getItem('playerId')
    const playerName = localStorage.getItem('playerName')

    if (!playerId || !playerName) {
      navigate('/')
      return
    }

    setCurrentPlayer({ id: playerId, name: playerName })
  }, [navigate])

  // Handle reconnection and connection status
  useEffect(() => {
    if (!roomId || !currentPlayer?.id || !currentPlayer?.name) return

    console.log('[GameBoard] Saving room and updating connection status')

    // Save current room for reconnection
    saveLastRoom(roomId, currentPlayer.id)

    // Mark player as connected and handle reconnection
    const setupConnection = async () => {
      try {
        await reconnectPlayer(roomId, currentPlayer.id, currentPlayer.name)
        console.log('[GameBoard] Player marked as connected')
      } catch (error) {
        console.error('[GameBoard] Error setting up connection:', error)
      }
    }

    setupConnection()

    // Clean up on unmount: mark player as disconnected
    return () => {
      console.log('[GameBoard] Component unmounting, marking player as disconnected')
      updatePlayerConnectionStatus(roomId, currentPlayer.id, false)

      // 如果是主動離開，清除重連資料
      if (isLeavingRef.current) {
        console.log('[GameBoard] Active leave detected, clearing reconnection data')
        clearLastRoom()
      }
    }
  }, [roomId, currentPlayer?.id, currentPlayer?.name])

  // Listen to room data (includes both gameState and player metadata)
  useEffect(() => {
    if (!roomId) return

    const unsubscribe = listenToRoom(roomId, (data) => {
      if (!data) {
        setError('Game not found')
        setLoading(false)
        return
      }

      // Check if game is actually started
      if (!data.gameState) {
        setError('Game not started yet')
        navigate(`/lobby/${roomId}`)
        return
      }

      setRoomData(data)

      // Check if turn changed to current player
      const newCurrentPlayerId = data.gameState.currentPlayerId
      const previousCurrentPlayerId = previousCurrentPlayerIdRef.current

      // Only show notification if:
      // 1. Turn has changed
      // 2. It's now the current player's turn
      // 3. Game is not over
      // 4. Not the first render
      if (
        newCurrentPlayerId !== previousCurrentPlayerId &&
        newCurrentPlayerId === currentPlayer?.id &&
        data.status !== 'finished' &&
        previousCurrentPlayerId !== null
      ) {
        setShowTurnNotification(true)
      }

      previousCurrentPlayerIdRef.current = newCurrentPlayerId
      setGameState(data.gameState)
      setLoading(false)

      // Debug: Log pendingCardChoice
      if (data.gameState.pendingCardChoice) {
        console.log('[GameBoard] pendingCardChoice detected:', {
          playerId: data.gameState.pendingCardChoice.playerId,
          cardCount: data.gameState.pendingCardChoice.cards?.length,
          currentPlayer: currentPlayer?.id
        })
      }

      // Check if game ended
      if (data.status === 'finished') {
        // TODO: Show game over modal
      }
    })

    return () => unsubscribe()
  }, [roomId, navigate, currentPlayer])

  // Detect when cards are added to player's hand and trigger draw effect
  useEffect(() => {
    if (!gameState || !currentPlayer) return

    const currentHand = gameState.players[currentPlayer.id]?.hand || []
    const previousHand = previousHandRef.current

    // Check if hand increased (card was added)
    if (currentHand.length > previousHand.length) {
      const newCards = currentHand.slice(previousHand.length)
      console.log('[GameBoard] New cards detected in hand:', newCards.map(c => c.name))

      // 觸發抽卡特效 - 使用第一張新卡
      if (newCards.length > 0) {
        // 先清除之前的狀態，再設置新狀態（確保重新觸發）
        setCardEnteringHand(null)
        setTimeout(() => {
          console.log('[GameBoard] Triggering draw effect for:', newCards[0].name)
          setCardEnteringHand(newCards[0])
        }, 50)
      }

      // 舊的 AnimatedCard 動畫（備用）
      newCards.forEach((card, index) => {
        const animationId = `${card.id}-${Date.now()}-${index}`
        setAnimatedCards(prev => [
          ...prev,
          {
            id: animationId,
            cardData: card,
            delay: index * 200
          }
        ])

        // Remove from animated cards after animation completes
        setTimeout(() => {
          setAnimatedCards(prev => prev.filter(ac => ac.id !== animationId))
        }, 800 + index * 200 + 100)
      })
    }

    // Store current hand for next comparison
    previousHandRef.current = currentHand
  }, [gameState, currentPlayer])

  // Handle round end - calculate and display scores with settlement animation
  useEffect(() => {
    if (!gameState || !roomData || gameState.turnPhase !== 'round_end') return
    if (showSettlement || showRoundEnd) return // Already showing

    console.log('[RoundEnd] Detected round_end phase, calculating scores...')

    const declareMode = gameState.declareMode
    const declaringPlayerId = gameState.declaringPlayerId
    const players = gameState.players
    const playerIds = Object.keys(players)

    // Calculate scores based on declare mode
    let scores = {}
    let declarerHasHighest = true
    let cardScores = {}  // 原始卡牌分數（用於 Last Chance 顯示）

    if (declareMode === 'last_chance') {
      // Use Last Chance scoring rules
      const result = calculateLastChanceScores(players, declaringPlayerId)
      scores = result.scores
      cardScores = result.cardScores  // 保存原始卡牌分數
      declarerHasHighest = result.declarerHasHighest
    } else {
      // Stop mode - everyone gets their card score, NO color bonus
      playerIds.forEach(playerId => {
        const player = players[playerId]
        const scoreData = calculateScore(
          player.hand || [],
          player.playedPairs || [],
          { includeColorBonus: false }
        )
        scores[playerId] = {
          ...scoreData,
          playerName: roomData.players?.[playerId]?.name || `玩家`
        }
      })
    }

    // Add player names to scores
    playerIds.forEach(playerId => {
      if (scores[playerId]) {
        scores[playerId].playerName = roomData.players?.[playerId]?.name || `玩家`
      }
    })

    // Find winner (highest round score)
    const winnerId = playerIds.reduce((prev, curr) =>
      (scores[curr]?.total || 0) > (scores[prev]?.total || 0) ? curr : prev
    )

    // Calculate total scores (accumulate from previous rounds)
    const totalScores = {}
    playerIds.forEach(playerId => {
      const previousTotal = gameState.totalScores?.[playerId] || 0
      totalScores[playerId] = previousTotal + (scores[playerId]?.total || 0)
    })

    // Check if game is over (someone reached target score)
    const targetScore = parseInt(roomData.settings?.targetScore || 30, 10)
    const gameOver = Object.values(totalScores).some(score => score >= targetScore)

    const results = {
      declareMode,
      declarerName: roomData.players?.[declaringPlayerId]?.name || '玩家',
      declarerId: declaringPlayerId,
      declarerHasHighest,
      scores,
      winner: {
        id: winnerId,
        name: roomData.players?.[winnerId]?.name || '玩家'
      },
      totalScores,
      targetScore,  // 包含 targetScore
      gameOver
    }

    console.log('[RoundEnd] Results:', results)
    setRoundResults(results)

    // Prepare settlement data for animation
    const settlementPlayers = playerIds.map(playerId => ({
      id: playerId,
      name: roomData.players?.[playerId]?.name || '玩家',
      hand: players[playerId].hand || [],
      playedPairs: players[playerId].playedPairs || [],
      score: scores[playerId],
      cardScore: cardScores[playerId] || scores[playerId]  // 原始卡牌分數（Last Chance 用）
    }))

    // Prepare totalScores data for score transition animation
    // Format: { playerId: { oldScore, newScore, roundScore } }
    const totalScoresForAnimation = {}
    playerIds.forEach(playerId => {
      const previousTotal = gameState.totalScores?.[playerId] || 0
      const roundScore = scores[playerId]?.total || 0
      totalScoresForAnimation[playerId] = {
        oldScore: previousTotal,
        newScore: previousTotal + roundScore,
        roundScore: roundScore
      }
    })

    setSettlementData({
      players: settlementPlayers,
      declarerId: declaringPlayerId,
      declareMode,
      declarerHasHighest,  // 傳遞宣告者是否獲勝
      totalScores: totalScoresForAnimation,  // 累計總分數據
      targetScore  // 目標分數
    })

    // Show settlement animation first
    setShowSettlement(true)

    // Log round end
    addActionToLog(roomId, {
      type: 'round_end',
      playerId: winnerId,
      playerName: results.winner.name,
      message: `回合結束！${results.winner.name} 獲得 ${scores[winnerId]?.total || 0} 分`
    })
  }, [gameState?.turnPhase, gameState?.declareMode, roomData, roomId, showSettlement, showRoundEnd])

  // Handle declare_showing phase - show declarer's score before proceeding
  useEffect(() => {
    if (!gameState || !roomData || gameState.turnPhase !== 'declare_showing') return
    if (showDeclareScore) return // Already showing

    console.log('[DeclareShowing] Detected declare_showing phase, preparing score display...')

    const declaringPlayerId = gameState.declaringPlayerId
    const declareMode = gameState.declareMode
    const declarerPlayerState = gameState.players[declaringPlayerId]

    if (!declarerPlayerState) return

    // Calculate declarer's score (不含顏色獎勵)
    // 原因：Stop 和 Last Chance 都是在結算時才決定是否加顏色獎勵
    const declarerScore = calculateScore(
      declarerPlayerState.hand || [],
      declarerPlayerState.playedPairs || [],
      { includeColorBonus: false }
    )

    const declarerName = roomData.players?.[declaringPlayerId]?.name || '玩家'

    console.log('[DeclareShowing] Declarer score:', {
      declarerId: declaringPlayerId,
      declarerName,
      declareMode,
      score: declarerScore.total
    })

    setDeclareScoreData({
      declareMode,
      declarerName,
      declarerScore,
      declaringPlayerId
    })
    setShowDeclareScore(true)

    // 如果宣告者是 AI，自動確認並繼續遊戲
    const isAI = roomData.players?.[declaringPlayerId]?.isAI
    if (isAI) {
      console.log('[DeclareShowing] Declarer is AI, auto-confirming after delay...')
      setTimeout(async () => {
        console.log('[DeclareShowing] Auto-confirming AI declaration')
        setShowDeclareScore(false)
        await gameActions.confirmDeclareScore()
      }, 2000) // 2 秒後自動確認，讓玩家能看到分數
    }
  }, [gameState?.turnPhase, gameState?.declaringPlayerId, roomData, showDeclareScore, gameActions])

  // Opponent draw animation - detect when opponents draw cards
  useEffect(() => {
    if (!gameState || !currentPlayer || !roomData) return

    const actionLog = gameState.actionLog || []
    const previousLength = previousActionLogLengthRef.current

    // Check if there are new actions
    if (actionLog.length > previousLength) {
      const newActions = actionLog.slice(previousLength)

      // Find draw actions from opponents
      for (const action of newActions) {
        console.log('[Opponent Action]', action.type, action.playerName, action.playerId, 'myId:', currentPlayer.id)

        if (
          (action.type === 'draw' || action.type === 'draw_discard') &&
          action.playerId !== currentPlayer.id
        ) {
          // Calculate opponent position
          // 使用固定的玩家順序數組，而不是 Object.keys
          const playerIds = gameState.playerOrder || Object.keys(gameState.players)
          const myIndex = playerIds.indexOf(currentPlayer.id)
          const opponentIndex = playerIds.indexOf(action.playerId)

          console.log('[Opponent Draw Detected]', {
            type: action.type,
            playerName: action.playerName,
            cardData: action.cardData,
            myIndex,
            opponentIndex
          })

          if (opponentIndex !== -1 && myIndex !== -1) {
            const positions = ['bottom', 'right', 'top', 'left']
            const relativeIndex = (opponentIndex - myIndex + playerIds.length) % playerIds.length
            const position = positions[relativeIndex] || 'top'

            console.log('[Triggering Animation]', { position, type: action.type })

            // Trigger animation with card data for discard draws
            setOpponentDrawAnimation({
              playerId: action.playerId,
              playerName: action.playerName || roomData.players?.[action.playerId]?.name || '對手',
              position: position,
              type: action.type,
              cardData: action.details?.cardData || action.cardData || null
            })
          }
        }
      }
    }

    previousActionLogLengthRef.current = actionLog.length
  }, [gameState?.actionLog, currentPlayer, roomData])

  // AI Turn Handler - Direct Firebase updates (bypass player validation)
  // 使用唯一的 turnKey 來追蹤每個 AI 回合，避免重複執行
  // AI 回合處理 - 處理所有階段 (draw, pair, declare)
  useEffect(() => {
    if (!gameState || !roomData || !roomId) return

    const aiPlayerId = gameState.currentPlayerId
    const aiPlayerData = roomData.players?.[aiPlayerId]

    // Check if current player is AI
    if (!aiPlayerData?.isAI) {
      // 如果切換到非 AI 玩家，清理定時器
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current)
        aiTimerRef.current = null
      }
      aiTurnKeyRef.current = null
      return
    }

    // 只處理 draw, pair, declare 階段
    const validPhases = ['draw', 'pair', 'declare']
    if (!validPhases.includes(gameState.turnPhase)) {
      return
    }

    // 創建唯一的階段標識 (玩家ID + 回合數 + 階段)
    const turnKey = `${aiPlayerId}_turn${gameState.turnCount || 0}_${gameState.turnPhase}`

    // 檢查是否有待處理的效果需要優先處理
    const hasPendingEffect = gameState.pendingEffect && gameState.pendingEffect.playerId === aiPlayerId

    // 如果這個階段已經在處理中，且沒有待處理的效果，直接返回
    if (aiTurnKeyRef.current === turnKey && !hasPendingEffect) {
      console.log('[AI Turn] Phase already scheduled, skipping...', turnKey)
      return
    }

    // 如果有待處理的效果，允許重新執行（即使 turnKey 相同）
    if (hasPendingEffect && aiTurnKeyRef.current === turnKey) {
      console.log('[AI Turn] Pending effect detected, allowing re-execution for:', gameState.pendingEffect.effect)
    }

    // 清理之前的定時器（如果有）
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current)
      aiTimerRef.current = null
    }

    console.log('[AI Turn] AI player phase detected:', aiPlayerId, 'phase:', gameState.turnPhase, 'turnKey:', turnKey)

    // 標記這個階段
    aiTurnKeyRef.current = turnKey

    // Add delay before AI action
    const aiDelay = 1000 + Math.random() * 800

    const executeAIPhase = async () => {
      // 清理定時器引用
      aiTimerRef.current = null

      // 再次檢查是否還是這個階段（防止過時的定時器執行）
      if (aiTurnKeyRef.current !== turnKey) {
        console.log('[AI Turn] Turn key mismatch, aborting', { expected: turnKey, current: aiTurnKeyRef.current })
        return
      }

      try {
        // ========== 優先處理 pendingEffect（例如偷牌效果、額外回合）==========
        if (gameState.pendingEffect && gameState.pendingEffect.playerId === aiPlayerId) {
          const effect = gameState.pendingEffect.effect

          if (effect === 'extra_turn') {
            console.log('[AI Turn] Processing extra turn effect')

            await updateGameState(roomId, (state) => {
              if (!state.pendingEffect || state.pendingEffect.effect !== 'extra_turn') {
                return state
              }

              // 重置回合階段為抽牌，同一玩家繼續
              state.turnPhase = 'draw'
              state.pendingEffect = null

              console.log('[AI Turn] Extra turn activated, turnPhase reset to draw')
              return state
            })

            await addActionToLog(roomId, {
              type: 'extra_turn',
              playerId: aiPlayerId,
              playerName: aiPlayerData.name,
              message: `使用帆船效果，獲得額外回合！`
            })

            // 清除 turnKey，讓 AI 可以繼續抽牌階段
            aiTurnKeyRef.current = null
            return
          } else if (effect === 'steal_card') {
            console.log('[AI Turn] Processing steal card effect')

            // AI 選擇要偷的對手（選擇手牌最多的對手）
            // 使用固定的玩家順序數組，而不是 Object.keys
            const opponentIds = (gameState.playerOrder || Object.keys(gameState.players)).filter(id => id !== aiPlayerId)
            let targetOpponent = null
            let maxHandSize = 0

            opponentIds.forEach(opId => {
              const opponent = gameState.players[opId]
              const handSize = opponent?.hand?.length || 0
              if (handSize > maxHandSize) {
                maxHandSize = handSize
                targetOpponent = opId
              }
            })

            if (targetOpponent && maxHandSize > 0) {
              // 隨機選擇一張牌偷取
              const randomCardIndex = Math.floor(Math.random() * maxHandSize)

              // 先獲取對手名稱（優先從 gameState，後備 roomData）
              const opponentName = gameState.players[targetOpponent]?.name ||
                                   roomData.players?.[targetOpponent]?.name ||
                                   '未知玩家'
              console.log('[AI Steal] Target opponent:', targetOpponent, 'Name:', opponentName, {
                fromGameState: gameState.players[targetOpponent]?.name,
                fromRoomData: roomData.players?.[targetOpponent]?.name
              })
              let stolenCardName = '' // 僅用於內部記錄，不對外顯示

              await updateGameState(roomId, (state) => {
                if (!state.pendingEffect || state.pendingEffect.effect !== 'steal_card') {
                  return state
                }

                const opponent = state.players[targetOpponent]
                if (!opponent || !opponent.hand || opponent.hand.length === 0) {
                  console.log('[AI Turn] Opponent has no cards to steal')
                  state.pendingEffect = null
                  // 繼續到配對階段，讓 AI 決定是否要打更多牌
                  state.turnPhase = 'pair'
                  return state
                }

                // 偷牌
                const stolenCard = opponent.hand[randomCardIndex]
                stolenCardName = stolenCard.name
                opponent.hand = opponent.hand.filter((_, idx) => idx !== randomCardIndex)

                const aiPlayer = state.players[aiPlayerId]
                if (!Array.isArray(aiPlayer.hand)) aiPlayer.hand = []
                aiPlayer.hand.push(stolenCard)

                // 更新最近的 Shark+Swimmer 配對記錄（內部記錄，不對外顯示）
                if (Array.isArray(aiPlayer.playedPairs) && aiPlayer.playedPairs.length > 0) {
                  const lastPair = aiPlayer.playedPairs[aiPlayer.playedPairs.length - 1]
                  if (lastPair.cards) {
                    const cardNames = lastPair.cards.map(c => c.name)
                    if (cardNames.includes('Shark') && cardNames.includes('Swimmer')) {
                      lastPair.stolenFrom = {
                        playerId: targetOpponent,
                        playerName: opponentName,
                        cardName: stolenCard.name
                      }
                    }
                  }
                }

                state.pendingEffect = null
                // 保持在 pair 階段，讓 AI 繼續評估是否要打更多組合
                // (turnPhase 已經是 'pair'，這裡明確設定以確保流程繼續)
                state.turnPhase = 'pair'
                console.log('[AI Turn] Stole', stolenCard.name, 'from', opponentName, ', continuing to pair phase')
                return state
              })

              // 記錄動作（不顯示卡片名稱，保密）
              await addActionToLog(roomId, {
                type: 'effect_steal',
                playerId: aiPlayerId,
                playerName: aiPlayerData.name,
                message: `偷取了 ${opponentName} 的一張牌`,
                cardData: {
                  opponentName: opponentName
                  // 不記錄 cardName，保持機密性
                }
              })

              // 不要清除 turnKey，讓代碼繼續執行到 pair 階段的 AI 決策
              // 這樣 AI 可以繼續評估是否打更多組合牌
              console.log('[AI Turn] Steal complete, continuing to pair phase decision...')
              // 不 return，繼續執行後面的 pair 階段邏輯
            } else {
              // 沒有對手有牌可偷，清除效果並繼續
              console.log('[AI Turn] No opponents with cards to steal, continuing to pair phase')
              await updateGameState(roomId, (state) => {
                state.pendingEffect = null
                // 繼續到配對階段，讓 AI 決定是否要打更多牌
                state.turnPhase = 'pair'
                return state
              })
              // 不清除 turnKey，不 return，繼續執行 pair 階段決策
              console.log('[AI Turn] No steal target, continuing to pair phase decision...')
            }
          }
        }

        const difficulty = aiPlayerData.difficulty || 'medium'
        const decision = makeAIDecision(difficulty, gameState, aiPlayerId)

        console.log('[AI Turn] AI decision:', decision, 'for phase:', gameState.turnPhase)
        console.log('[AI Turn] AI hand (from gameState):', gameState.players?.[aiPlayerId]?.hand?.map(c => c.name))
        console.log('[AI Turn] AI playedPairs:', gameState.players?.[aiPlayerId]?.playedPairs?.length || 0)

        // ========== DRAW 階段 ==========
        if (gameState.turnPhase === 'draw' && decision.action === 'draw') {
          if (decision.source === 'deck') {
            // AI draws 2 cards and shows them
            let drawnCardsForAI = []

            await updateGameState(roomId, (state) => {
              // 防止重複抽牌：檢查是否已經有 pendingCardChoice
              if (state.pendingCardChoice && state.pendingCardChoice.playerId === aiPlayerId) {
                console.log('[AI Turn] Already drew cards, skipping duplicate draw')
                return state
              }

              const reshuffleResult = checkDeckReshuffle(
                state.deck || [],
                state.discardLeft || [],
                state.discardRight || []
              )

              let deck = reshuffleResult.newDeck
              if (!deck || deck.length < 2) {
                console.log('[AI Turn] Not enough cards to draw')
                return state
              }

              const { drawnCards, remainingDeck } = drawFromDeck(deck, 2)
              drawnCardsForAI = drawnCards

              state.pendingCardChoice = {
                playerId: aiPlayerId,
                cards: drawnCards
              }

              state.deck = remainingDeck
              state.deckCount = remainingDeck.length
              state.discardLeft = reshuffleResult.newDiscardLeft
              state.discardRight = reshuffleResult.newDiscardRight

              console.log('[AI Turn] Drew 2 cards, showing choice:', drawnCards.map(c => c.name))
              return state
            })

            // After delay, AI makes choice and transitions to pair phase
            setTimeout(async () => {
              await updateGameState(roomId, (state) => {
                const cards = state.pendingCardChoice?.cards || drawnCardsForAI
                if (!cards || cards.length !== 2) return state

                const [card1, card2] = cards
                const keepCard = (card1.value || 0) >= (card2.value || 0) ? card1 : card2
                const discardCard = keepCard === card1 ? card2 : card1

                // 檢查空棄牌堆規則：如果有一邊是空的，必須棄到空的那邊
                const leftEmpty = (state.discardLeft || []).length === 0
                const rightEmpty = (state.discardRight || []).length === 0
                const discardSide = leftEmpty ? 'discardLeft'
                  : rightEmpty ? 'discardRight'
                  : (Math.random() < 0.5 ? 'discardLeft' : 'discardRight')

                console.log('[AI Turn] Empty pile check - Left:', leftEmpty, 'Right:', rightEmpty, '→ Discarding to:', discardSide)

                const aiPlayer = state.players[aiPlayerId]
                if (!Array.isArray(aiPlayer.hand)) aiPlayer.hand = []
                aiPlayer.hand = [...aiPlayer.hand, keepCard]

                state[discardSide] = [...(state[discardSide] || []), discardCard]
                state.pendingCardChoice = null
                state.turnPhase = 'pair' // 進入配對階段

                console.log('[AI Turn] Chose card:', keepCard.name, ', entering pair phase')
                return state
              })

              await addActionToLog(roomId, {
                type: 'draw',
                playerId: aiPlayerId,
                playerName: aiPlayerData.name,
                message: '抽了一張牌'
              })
            }, 1500)

          } else {
            // AI takes from discard pile
            const side = decision.source === 'discard_left' ? 'left' : 'right'
            const pileKey = side === 'left' ? 'discardLeft' : 'discardRight'
            let aiTakenCard = null

            await updateGameState(roomId, (state) => {
              const pile = state[pileKey] || []
              if (pile.length === 0) return state

              const takenCard = pile[pile.length - 1]
              aiTakenCard = takenCard
              state[pileKey] = pile.slice(0, -1)

              const aiPlayer = state.players[aiPlayerId]
              if (!Array.isArray(aiPlayer.hand)) aiPlayer.hand = []
              aiPlayer.hand = [...aiPlayer.hand, takenCard]
              state.turnPhase = 'pair' // 進入配對階段

              console.log('[AI Turn] Took from discard:', takenCard.name, ', entering pair phase')
              return state
            })

            await addActionToLog(roomId, {
              type: 'draw_discard',
              playerId: aiPlayerId,
              playerName: aiPlayerData.name,
              message: `從${side === 'left' ? '左側' : '右側'}棄牌堆拿了一張牌`,
              cardData: aiTakenCard
            })
          }
        }

        // ========== PAIR 階段 ==========
        else if (gameState.turnPhase === 'pair') {
          if (decision.action === 'play_pair' && decision.cards?.length === 2) {
            const [card1, card2] = decision.cards

            let crabEffectCard = null
            let crabEffectSide = null
            let hasPendingEffectAfterPair = false

            await updateGameState(roomId, (state) => {
              const aiPlayer = state.players[aiPlayerId]
              if (!aiPlayer) return state

              // Remove cards from hand
              const newHand = aiPlayer.hand.filter(c => c.id !== card1.id && c.id !== card2.id)
              aiPlayer.hand = newHand

              // Add to played pairs
              if (!Array.isArray(aiPlayer.playedPairs)) aiPlayer.playedPairs = []
              aiPlayer.playedPairs.push({
                cards: [card1, card2],
                timestamp: Date.now()
              })

              console.log('[AI Turn] Played pair:', card1.name, '+', card2.name)
              console.log('[AI Turn] AI Player ID:', aiPlayerId, 'playedPairs count:', aiPlayer.playedPairs.length)

              // 檢查配對效果
              const effect = executePairEffect(card1, card2)
              console.log('[AI Turn] Pair effect:', effect.effect)

              if (effect.effect) {
                switch (effect.effect) {
                  case 'draw_blind':
                    // 自動從牌堆抽一張牌
                    if (state.deck && state.deck.length > 0) {
                      const drawnCard = state.deck.pop()
                      aiPlayer.hand.push(drawnCard)
                      console.log('[AI Turn] Auto-draw effect: Drew', drawnCard.name)
                    }
                    break

                  case 'draw_discard':
                    // Crab 效果 - AI 從棄牌堆選牌
                    console.log('[AI Turn] Crab effect triggered - evaluating discard piles')

                    const leftPile = state.discardLeft || []
                    const rightPile = state.discardRight || []
                    const leftTop = leftPile[leftPile.length - 1]
                    const rightTop = rightPile[rightPile.length - 1]

                    let chosenCard = null
                    let chosenSide = null

                    // 如果兩邊都有牌，選擇價值更高的
                    if (leftTop && rightTop) {
                      // 簡單評估：選擇點數更高的，或者選擇能配對的
                      const canPairLeft = aiPlayer.hand.some(c => c.name === leftTop.name)
                      const canPairRight = aiPlayer.hand.some(c => c.name === rightTop.name)

                      if (canPairLeft && !canPairRight) {
                        chosenCard = leftTop
                        chosenSide = 'left'
                      } else if (canPairRight && !canPairLeft) {
                        chosenCard = rightTop
                        chosenSide = 'right'
                      } else {
                        // 都能配對或都不能配對，選點數高的
                        chosenCard = (leftTop.value || 0) >= (rightTop.value || 0) ? leftTop : rightTop
                        chosenSide = chosenCard === leftTop ? 'left' : 'right'
                      }
                    } else if (leftTop) {
                      chosenCard = leftTop
                      chosenSide = 'left'
                    } else if (rightTop) {
                      chosenCard = rightTop
                      chosenSide = 'right'
                    }

                    if (chosenCard && chosenSide) {
                      // 從棄牌堆移除並加入手牌
                      const pileKey = chosenSide === 'left' ? 'discardLeft' : 'discardRight'
                      state[pileKey] = state[pileKey].slice(0, -1)
                      aiPlayer.hand.push(chosenCard)

                      // 保存拿的牌信息用於記錄
                      crabEffectCard = chosenCard
                      crabEffectSide = chosenSide

                      console.log('[AI Turn] Crab effect: Took', chosenCard.name, 'from', chosenSide, 'discard pile')
                    } else {
                      console.log('[AI Turn] Crab effect: No cards in discard piles')
                    }
                    break

                  case 'extra_turn':
                    // 額外回合效果
                    state.pendingEffect = {
                      effect: 'extra_turn',
                      playerId: aiPlayerId,
                      cards: effect.cards
                    }
                    hasPendingEffectAfterPair = true
                    console.log('[AI Turn] Extra turn effect set')
                    break

                  case 'steal_card':
                    // 偷牌效果 - 設置 pendingEffect，讓 AI 選擇偷誰
                    state.pendingEffect = {
                      effect: 'steal_card',
                      playerId: aiPlayerId,
                      cards: effect.cards
                    }
                    hasPendingEffectAfterPair = true
                    console.log('[AI Turn] Steal card effect set')
                    break

                  default:
                    console.log('[AI Turn] Unknown effect:', effect.effect)
                }
              }

              // 保持在 pair 階段，讓 AI 決定是否要打更多組合
              // 如果沒有 pendingEffect，設置時間戳來觸發 useEffect 重新執行
              if (!hasPendingEffectAfterPair) {
                state.lastAIAction = Date.now()
                console.log('[AI Turn] No pending effect, set lastAIAction to trigger re-evaluation')
              }
              return state
            })

            // 在記錄日誌之前先清除 turnKey，確保 useEffect 可以重新執行
            // 如果有 pendingEffect (steal_card, extra_turn)，保持 turnKey，讓 useEffect 重新觸發來處理
            if (!hasPendingEffectAfterPair) {
              console.log('[AI Turn] No pending effect, clearing turnKey BEFORE logging to allow next pair decision')
              aiTurnKeyRef.current = null
            } else {
              console.log('[AI Turn] Pending effect detected, keeping turnKey for effect processing')
            }

            await addActionToLog(roomId, {
              type: 'play_pair',
              playerId: aiPlayerId,
              playerName: aiPlayerData.name,
              message: `打出了一對：${card1.name} + ${card2.name}`,
              cardData: { card1: card1.name, card2: card2.name }
            })

            // 如果有 Crab 效果，記錄拿了哪張牌
            if (crabEffectCard && crabEffectSide) {
              await addActionToLog(roomId, {
                type: 'effect_crab',
                playerId: aiPlayerId,
                playerName: aiPlayerData.name,
                message: `從${crabEffectSide === 'left' ? '左側' : '右側'}棄牌堆拿了 ${crabEffectCard.name}`,
                cardData: { cardName: crabEffectCard.name, side: crabEffectSide }
              })
            }

          } else if (decision.action === 'end_turn') {
            // 沒有要打的組合牌，直接更新遊戲狀態來結束回合
            console.log('[AI Turn] No pairs to play, ending turn via state update')

            await updateGameState(roomId, (state) => {
              // 🔑 Check for extra_turn effect FIRST
              const hasExtraTurn = state.pendingEffect && state.pendingEffect.effect === 'extra_turn'

              if (hasExtraTurn) {
                console.log('[AI Turn] ⛵ Extra turn detected! AI gets another turn')
                state.turnPhase = 'draw'
                state.pendingEffect = null
                return state
              }

              // 💡 檢查玩家分數，只有 >= 7 分才進入宣告階段
              console.log('[AI Turn] Checking AI score for currentPlayerId:', state.currentPlayerId)
              const player = state.players[state.currentPlayerId]

              if (!player) {
                console.error('[AI Turn] ERROR: Player not found for currentPlayerId:', state.currentPlayerId)
                return state
              }

              console.log('[AI Turn] Player found:', player.name, 'calculating score...')

              const playerScore = calculateScore(
                player?.hand || [],
                player?.playedPairs || [],
                { includeColorBonus: false }
              )

              console.log('[AI Turn] Calculated score:', playerScore.total)

              // 如果分數 >= 7，AI 需要進入宣告階段做決定
              if (playerScore.total >= 7) {
                console.log('[AI Turn] Score >= 7, entering declare phase for AI decision')
                state.turnPhase = 'declare'
                state.pendingEffect = null
                return state
              }

              // 分數 < 7，自動跳過宣告，直接切換到下一個玩家
              console.log('[AI Turn] Score < 7, auto-skipping declare, switching to next player')

              const playerIds = state.playerOrder || Object.keys(state.players)
              const currentIndex = playerIds.indexOf(state.currentPlayerId)
              const nextIndex = (currentIndex + 1) % playerIds.length
              const nextPlayerId = playerIds[nextIndex]

              // Increment turn count
              state.turnCount = (state.turnCount || 0) + 1

              // 處理 Last Chance 模式
              if (state.declareMode === 'last_chance' && state.remainingTurns !== null) {
                state.remainingTurns = state.remainingTurns - 1
                console.log('[AI Turn] Last Chance mode - remaining turns:', state.remainingTurns)

                if (state.remainingTurns <= 0) {
                  console.log('[AI Turn] Last Chance complete - ending round')
                  state.turnPhase = 'round_end'
                  return state
                }
              }

              state.currentPlayerId = nextPlayerId
              state.currentPlayerIndex = nextIndex
              state.turnPhase = 'draw'
              state.pendingEffect = null

              console.log('[AI Turn] Switched to next player:', nextPlayerId, 'turnCount:', state.turnCount)

              return state
            })

            // 檢查是否進入 declare 階段，如果是就直接返回
            // 從 Firebase 重新讀取當前狀態
            const currentState = await new Promise((resolve) => {
              const stateRef = ref(database, `rooms/${roomId}/gameState`)
              get(stateRef).then(snapshot => resolve(snapshot.val()))
            })

            if (currentState?.turnPhase === 'declare') {
              console.log('[AI Turn] Entered declare phase, skipping endTurn cleanup')
              return
            }

            // Log action
            await addActionToLog(roomId, {
              type: 'end_turn',
              playerId: aiPlayerId,
              playerName: aiPlayerData.name,
              message: '結束了回合'
            })

            console.log('[AI Turn] Turn ended, clearing turnKey for:', aiPlayerId)
            // 清除 turnKey（只清除當前玩家的 turnKey）
            // 檢查 turnKey 是否還屬於這個玩家，避免清除新玩家的 turnKey
            if (aiTurnKeyRef.current && aiTurnKeyRef.current.startsWith(aiPlayerId)) {
              console.log('[AI Turn] Clearing turnKey:', aiTurnKeyRef.current)
              aiTurnKeyRef.current = null
            } else {
              console.log('[AI Turn] TurnKey already updated to new player, keeping it:', aiTurnKeyRef.current)
            }
          }
        }

        // ========== DECLARE 階段 ==========
        else if (gameState.turnPhase === 'declare') {
          if (decision.action === 'declare') {
            const declareType = decision.type // 'stop' or 'last_chance'
            console.log('[AI Turn] Declaring:', declareType)

            await updateGameState(roomId, (state) => {
              state.declareMode = declareType
              state.declaringPlayerId = aiPlayerId

              if (declareType === 'stop') {
                state.turnPhase = 'round_end'
              } else {
                // last_chance - 其他玩家各有一回合
                // 使用固定的玩家順序數組，而不是 Object.keys
                const playerIds = state.playerOrder || Object.keys(state.players)
                state.remainingTurns = playerIds.length - 1
                state.turnPhase = 'declare_showing'
              }

              return state
            })

            const declareText = declareType === 'stop' ? '到此為止 (Stop)' : '最後機會 (Last Chance)'
            await addActionToLog(roomId, {
              type: `declare_${declareType}`,
              playerId: aiPlayerId,
              playerName: aiPlayerData.name,
              message: `宣告「${declareText}」！`
            })

            // 清除 turnKey（只清除當前玩家的 turnKey）
            if (aiTurnKeyRef.current && aiTurnKeyRef.current.startsWith(aiPlayerId)) {
              aiTurnKeyRef.current = null
              console.log('[AI Turn] Cleared turnKey after declare for:', aiPlayerId)
            } else {
              console.log('[AI Turn] TurnKey already updated to new player after declare, keeping it:', aiTurnKeyRef.current)
            }

          } else {
            // 不宣告，結束回合
            await updateGameState(roomId, (state) => {
              // 使用固定的玩家順序數組，而不是 Object.keys
              const playerIds = state.playerOrder || Object.keys(state.players)
              const currentIndex = playerIds.indexOf(state.currentPlayerId)
              const nextIndex = (currentIndex + 1) % playerIds.length

              // Increment turn count
              state.turnCount = (state.turnCount || 0) + 1

              // ========== 處理 Last Chance 模式 ==========
              if (state.declareMode === 'last_chance' && state.remainingTurns !== null) {
                state.remainingTurns = state.remainingTurns - 1
                console.log('[AI Turn] Last Chance mode - remaining turns:', state.remainingTurns)

                // 如果沒有剩餘回合，結束回合
                if (state.remainingTurns <= 0) {
                  console.log('[AI Turn] Last Chance complete - ending round')
                  state.turnPhase = 'round_end'
                  return state
                }
              }

              state.currentPlayerId = playerIds[nextIndex]
              state.currentPlayerIndex = nextIndex
              state.turnPhase = 'draw'
              state.pendingEffect = null

              console.log('[AI Turn] Ended turn, next player:', playerIds[nextIndex], 'turnCount:', state.turnCount, 'playerOrder:', playerIds)
              return state
            })

            await addActionToLog(roomId, {
              type: 'end_turn',
              playerId: aiPlayerId,
              playerName: aiPlayerData.name,
              message: '結束了回合'
            })

            // 清除 turnKey（只清除當前玩家的 turnKey）
            if (aiTurnKeyRef.current && aiTurnKeyRef.current.startsWith(aiPlayerId)) {
              aiTurnKeyRef.current = null
              console.log('[AI Turn] Cleared turnKey after ending turn for:', aiPlayerId)
            } else {
              console.log('[AI Turn] TurnKey already updated to new player after ending turn, keeping it:', aiTurnKeyRef.current)
            }
          }
        }

      } catch (error) {
        console.error('[AI Turn] EXCEPTION CAUGHT!')
        console.error('[AI Turn] Error type:', typeof error)
        console.error('[AI Turn] Error:', error)
        console.error('[AI Turn] Error message:', error?.message)
        console.error('[AI Turn] Error stack:', error?.stack)
        console.error('[AI Turn] Stringified error:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
        aiTurnKeyRef.current = null
      }
    }

    // 設置定時器
    aiTimerRef.current = setTimeout(executeAIPhase, aiDelay)

  }, [gameState?.currentPlayerId, gameState?.turnPhase, gameState?.turnCount, gameState?.pendingEffect, gameState?.lastAIAction, roomData, roomId])

  /**
   * Handle card selection
   */
  const handleCardSelect = (card) => {
    setSelectedCards(prev => [...prev, card])
  }

  /**
   * Handle card deselection
   */
  const handleCardDeselect = (card) => {
    setSelectedCards(prev => prev.filter(c => c.id !== card.id))
  }

  /**
   * Handle draw from deck (draws 2 cards for choice)
   */
  const handleDrawDeck = async () => {
    const result = await gameActions.drawCard()
    if (!result.success) {
      setError(result.error)
    } else {
      setDrawnCards(result.cards)
      setShowDrawCardArea(true)
    }
  }

  /**
   * Handle card dragged from draw area
   */
  const handleCardDragged = (cardId) => {
    setIsDraggingCard(true)
  }

  /**
   * Handle card drag end
   */
  const handleCardDragEnd = () => {
    setIsDraggingCard(false)
  }

  /**
   * Handle card dropped on discard pile
   */
  const handleCardDropped = async (cardId, side) => {
    // Use cards from state or from pendingCardChoice
    const cards = drawnCards || gameState.pendingCardChoice?.cards

    console.log('[handleCardDropped] Starting:', {
      droppedCardId: cardId,
      side,
      hasDrawnCards: !!drawnCards,
      hasPendingChoice: !!gameState.pendingCardChoice,
      cardCount: cards?.length
    })

    if (!cards || cards.length !== 2) {
      setError('No cards to choose from')
      return
    }

    // Find which card to keep (the one NOT dropped)
    const droppedCard = cards.find(c => c.id === cardId)
    const keptCard = cards.find(c => c.id !== cardId)

    console.log('[handleCardDropped] Card selection:', {
      dropped: droppedCard?.name,
      kept: keptCard?.name,
      droppedId: droppedCard?.id,
      keptId: keptCard?.id
    })

    if (!keptCard || !droppedCard) {
      setError('Invalid card selection')
      return
    }

    const result = await gameActions.confirmCardChoice(keptCard, side)
    console.log('[handleCardDropped] Result:', result)

    if (!result.success) {
      setError(result.error)
    } else {
      // 特效會由手牌監聽 useEffect 自動觸發
      setShowDrawCardArea(false)
      setDrawnCards(null)
      setIsDraggingCard(false)
    }
  }

  /**
   * Handle take from discard pile
   */
  const handleTakeDiscard = async (side) => {
    const result = await gameActions.takeFromDiscard(side)
    if (!result.success) {
      setError(result.error)
    }
    // 特效會由手牌監聽 useEffect 自動觸發
  }

  /**
   * Handle card effect complete - clear the effect state
   */
  const handleCardEffectComplete = () => {
    console.log('[GameBoard] Card effect completed, clearing state')
    setCardEnteringHand(null)
  }

  /**
   * Handle play pair
   */
  const handlePlayPair = async () => {
    if (selectedCards.length !== 2) return

    const result = await gameActions.playPair(selectedCards)
    if (!result.success) {
      setError(result.error)
    } else {
      setSelectedCards([])
    }
  }

  /**
   * Handle end turn
   */
  const handleEndTurn = async () => {
    const result = await gameActions.endTurn()
    if (!result.success) {
      setError(result.error)
    }
  }

  /**
   * Handle extra turn (sailboat pair effect)
   */
  const handleExtraTurn = async () => {
    const result = await gameActions.executeExtraTurn()
    if (!result.success) {
      setError(result.error)
    }
  }

  /**
   * Handle declare stop
   */
  const handleDeclareStop = async () => {
    const result = await gameActions.declareStop()
    if (!result.success) {
      setError(result.error)
    }
  }

  /**
   * Handle declare last chance
   */
  const handleDeclareLastChance = async () => {
    const result = await gameActions.declareLastChance()
    if (!result.success) {
      setError(result.error)
    }
  }

  /**
   * Handle skip declare - player chooses not to declare
   */
  const handleSkipDeclare = async () => {
    const result = await gameActions.skipDeclare()
    if (!result.success) {
      setError(result.error)
    }
  }

  /**
   * Handle confirm declare score - after viewing declarer's score
   * This will either end the round (STOP) or move to next player (Last Chance)
   */
  const handleConfirmDeclareScore = async () => {
    console.log('[ConfirmDeclareScore] Confirming declare score...')

    const result = await gameActions.confirmDeclareScore()
    if (!result.success) {
      setError(result.error)
    } else {
      // Close the modal
      setShowDeclareScore(false)
      setDeclareScoreData(null)
    }
  }

  /**
   * Handle leave game - Show confirmation modal
   */
  const handleLeaveGame = () => {
    setShowLeaveConfirm(true)
  }

  /**
   * Confirm leave game
   */
  const confirmLeaveGame = async () => {
    // 標記為主動離開，cleanup 函數會清除重連資料
    console.log('[GameBoard] Player actively leaving game')
    isLeavingRef.current = true

    // 標記玩家為離線
    if (roomId && currentPlayer?.id) {
      await updatePlayerConnectionStatus(roomId, currentPlayer.id, false)
    }

    navigate('/')
  }

  /**
   * Handle Crab Effect - Select card from discard pile
   */
  const handleCrabEffect = async (cardIndex, side) => {
    const result = await gameActions.executeCrabEffect(cardIndex, side)
    if (!result.success) {
      setError(result.error)
    }
  }

  /**
   * Handle Steal Card Effect - Steal a card from opponent
   */
  const handleStealCard = async (opponentId, cardIndex) => {
    const result = await gameActions.executeStealEffect(opponentId, cardIndex)
    if (!result.success) {
      setError(result.error)
    }
  }

  /**
   * Handle Settlement Animation Complete
   * Close settlement and show round end modal
   */
  const handleSettlementComplete = () => {
    console.log('[Settlement] Animation complete, showing round end modal')
    setShowSettlement(false)
    setSettlementData(null)
    setShowRoundEnd(true)
  }

  /**
   * Handle Next Round - Reset for new round
   */
  const handleNextRound = async () => {
    console.log('[NextRound] Starting new round...')

    try {
      await updateGameState(roomId, (state) => {
        // 使用固定的玩家順序數組，而不是 Object.keys
        const playerIds = state.playerOrder || Object.keys(state.players)

        // Create new shuffled deck
        let newDeck = createDeck()

        // Reset player hands and played pairs
        playerIds.forEach(playerId => {
          state.players[playerId].hand = []
          state.players[playerId].playedPairs = []
        })

        // Update total scores from round results
        if (roundResults?.totalScores) {
          state.totalScores = roundResults.totalScores
        }

        // Deal one card to each discard pile (game rule)
        const leftCard = newDeck.pop()
        const rightCard = newDeck.pop()

        // 計算下一個起始玩家（逆時針）
        // 如果當前起始玩家 index 是 2，下一個是 1，以此類推
        // 如果是 0，則回到最後一個玩家
        const currentStartingIndex = state.startingPlayerIndex ?? 0
        const nextStartingIndex = (currentStartingIndex - 1 + playerIds.length) % playerIds.length
        const nextStartingPlayerId = playerIds[nextStartingIndex]

        console.log(`[NextRound] Starting player: ${nextStartingPlayerId} (index: ${nextStartingIndex}, was: ${currentStartingIndex})`)

        // Reset game state for new round
        state.deck = newDeck
        state.deckCount = newDeck.length
        state.discardLeft = leftCard ? [leftCard] : []
        state.discardRight = rightCard ? [rightCard] : []
        state.round = (state.round || 1) + 1
        state.turnPhase = 'draw'
        state.currentPlayerIndex = nextStartingIndex
        state.currentPlayerId = nextStartingPlayerId
        state.startingPlayerIndex = nextStartingIndex  // 更新起始玩家標記
        state.startingPlayerId = nextStartingPlayerId
        state.declareMode = null
        state.declaringPlayerId = null
        state.remainingTurns = null
        state.pendingEffect = null
        state.pendingCardChoice = null

        return state
      })

      // Log new round start
      await addActionToLog(roomId, {
        type: 'round_start',
        playerId: currentPlayer?.id,
        playerName: currentPlayer?.name || '系統',
        message: `第 ${(gameState?.round || 1) + 1} 回合開始！`
      })

      setShowRoundEnd(false)
      setRoundResults(null)
    } catch (error) {
      console.error('[NextRound] Error:', error)
      setError(error.message)
    }
  }

  /**
   * Handle End Game - Return to lobby
   */
  const handleEndGame = async () => {
    console.log('[EndGame] Game over, returning to lobby...')

    // 標記為主動離開，cleanup 函數會清除重連資料
    isLeavingRef.current = true

    try {
      // Update room status to finished
      await updateGameState(roomId, (state) => {
        // Save final total scores
        if (roundResults?.totalScores) {
          state.totalScores = roundResults.totalScores
        }
        return state
      })

      // 標記玩家為離線
      if (roomId && currentPlayer?.id) {
        await updatePlayerConnectionStatus(roomId, currentPlayer.id, false)
      }

      // Navigate to home
      navigate('/')
    } catch (error) {
      console.error('[EndGame] Error:', error)
      navigate('/')
    }
  }

  // Loading state
  if (loading || !gameState || !currentPlayer || !roomData) {
    return (
      <div className="game-board game-board--loading">
        <div className="game-board__loading">
          <div className="game-board__loading-spinner" />
          <p>載入遊戲中...</p>
        </div>
      </div>
    )
  }

  // Extract game state
  // 使用固定的玩家順序數組，而不是 Object.keys
  const playerIds = gameState.playerOrder || Object.keys(gameState.players)
  const opponentIds = playerIds.filter(id => id !== currentPlayer.id)
  const isMyTurn = gameState.currentPlayerId === currentPlayer.id
  const turnPhase = gameState.turnPhase
  const myPlayerState = gameState.players[currentPlayer.id]

  // Calculate my score
  const myScore = calculateScore(
    myPlayerState?.hand || [],
    myPlayerState?.playedPairs || [],
    { includeColorBonus: false }
  )

  const canDeclare = myScore.total >= 7
  const isDeclarePhase = turnPhase === 'declare'

  // Get target score
  const targetScore = (() => {
    const rawScore = roomData?.settings?.targetScore
    const parsed = parseInt(rawScore, 10)
    return !isNaN(parsed) && parsed > 0 ? parsed : 30
  })()

  // Check for pending effects
  const hasPendingEffect = gameState.pendingEffect && gameState.pendingEffect.effect
  const isCrabEffect = hasPendingEffect && gameState.pendingEffect.effect === 'draw_discard'
  const showCrabModal = isCrabEffect && isMyTurn
  const isStealEffect = hasPendingEffect && gameState.pendingEffect.effect === 'steal_card'
  const showStealModal = isStealEffect && isMyTurn
  const isExtraTurnEffect = hasPendingEffect && gameState.pendingEffect.effect === 'extra_turn'

  // Prepare opponents data for steal modal
  const opponents = opponentIds.map(opponentId => {
    const gamePlayerData = gameState.players[opponentId] || {}
    const roomPlayerData = roomData?.players?.[opponentId] || {}

    // Determine opponent name with fallback（優先從 gameState 獲取）
    let opponentName = gamePlayerData.name || roomPlayerData.name
    if (!opponentName) {
      // Debug: 當名稱缺失時輸出資訊
      console.warn('[StealModal] Missing opponent name:', {
        opponentId,
        gamePlayerName: gamePlayerData.name,
        roomPlayerName: roomPlayerData.name,
        hasRoomPlayerData: Object.keys(roomPlayerData).length > 0,
        hasGamePlayerData: Object.keys(gamePlayerData).length > 0
      })

      // Fallback: check if it's an AI player
      if (opponentId.startsWith('ai_')) {
        opponentName = 'AI 對手'
      } else {
        opponentName = '對手'
      }
    }

    return {
      id: opponentId,
      name: opponentName,
      handCount: gamePlayerData.hand?.length || 0
    }
  }).filter(opp => opp.handCount > 0) // Only show opponents with cards

  // Merge players data from gameState and roomData
  const playersWithMeta = {}
  // 使用固定的玩家順序數組，而不是 Object.keys
  const allPlayerIds = gameState.playerOrder || Object.keys(gameState.players)
  allPlayerIds.forEach(playerId => {
    const gamePlayerData = gameState.players[playerId] || {}
    const roomPlayerData = roomData?.players[playerId] || {}
    playersWithMeta[playerId] = {
      ...gamePlayerData,
      id: playerId,
      name: roomPlayerData.name || 'Unknown',
      handCount: gamePlayerData.hand?.length || roomPlayerData.handCount || 0,
      connected: roomPlayerData.connected !== false,
      isAI: roomPlayerData.isAI || false
    }
  })

  return (
    <div className="game-board game-board--table-view">
      {/* Turn Notification - subtle fade in/out at top */}
      <TurnNotification
        show={showTurnNotification}
        onComplete={() => setShowTurnNotification(false)}
      />

      {/* Opponent Draw Animation */}
      <OpponentDrawAnimation
        animation={opponentDrawAnimation}
        onComplete={() => setOpponentDrawAnimation(null)}
      />

      {/* Card Effect Modals */}
      <CrabEffectModal
        isOpen={showCrabModal || false}
        leftPile={gameState.discardLeft || []}
        rightPile={gameState.discardRight || []}
        onSelectCard={handleCrabEffect}
        onClose={() => {}}
      />

      <StealCardModal
        isOpen={showStealModal || false}
        opponents={opponents}
        onStealCard={handleStealCard}
        onClose={() => {}}
      />

      {/* Round Settlement Animation */}
      <RoundSettlement
        isOpen={showSettlement}
        players={settlementData?.players || []}
        declarerId={settlementData?.declarerId}
        declareMode={settlementData?.declareMode}
        declarerHasHighest={settlementData?.declarerHasHighest}
        totalScores={settlementData?.totalScores || {}}
        targetScore={settlementData?.targetScore || 30}
        onComplete={handleSettlementComplete}
        onSkip={handleSettlementComplete}
      />

      {/* Round End Modal */}
      <RoundEndModal
        isOpen={showRoundEnd}
        roundResults={roundResults}
        onNextRound={handleNextRound}
        onEndGame={handleEndGame}
        targetScore={targetScore}
      />

      {/* Declare Score Modal - shows when player declares Stop or Last Chance */}
      <DeclareScoreModal
        isOpen={showDeclareScore}
        declareMode={declareScoreData?.declareMode}
        declarerName={declareScoreData?.declarerName}
        declarerScore={declareScoreData?.declarerScore}
        isCurrentPlayer={declareScoreData?.declaringPlayerId === currentPlayer?.id}
        onConfirm={handleConfirmDeclareScore}
      />

      {/* Navigation bar */}
      <div className="game-board__nav">
        <div className="game-board__nav-left">
          <h2 className="game-board__room-code">房間：{roomId}</h2>
          <span className="game-board__round">第 {gameState.round} 輪</span>

          {/* Color Info Button */}
          <div className="game-board__color-info-container">
            <button
              className={`game-board__color-info-btn ${showColorInfo ? 'game-board__color-info-btn--active' : ''}`}
              onClick={() => setShowColorInfo(!showColorInfo)}
              title="顏色分配說明"
            >
              🎨 顏色說明
            </button>

            {showColorInfo && (
              <div className="game-board__color-info-panel game-board__color-info-panel--below">
                <div className="game-board__color-info-header">
                  <span>🎨 顏色分配說明</span>
                  <button
                    className="game-board__color-info-close"
                    onClick={() => setShowColorInfo(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="game-board__color-info-desc">
                  每局遊戲開始時，顏色會隨機分配給所有卡牌。
                  <br />美人魚計分會根據你手牌中各顏色的數量。
                </div>
                <div className="game-board__color-info-list">
                  {Object.entries(COLOR_DISTRIBUTION).map(([colorKey, count]) => {
                    const colorData = GAME_COLORS[colorKey]
                    return (
                      <div key={colorKey} className="game-board__color-info-item">
                        <span
                          className="game-board__color-info-dot"
                          style={{ backgroundColor: colorData.hex }}
                        />
                        <span className="game-board__color-info-name">{colorData.name}</span>
                        <span className="game-board__color-info-count">{count} 張</span>
                      </div>
                    )
                  })}
                  {/* 白色 - 美人魚專用 */}
                  <div className="game-board__color-info-item game-board__color-info-item--special">
                    <span
                      className="game-board__color-info-dot"
                      style={{ backgroundColor: GAME_COLORS.white.hex, border: '1px solid #CBD5E1' }}
                    />
                    <span className="game-board__color-info-name">{GAME_COLORS.white.name} (美人魚專用)</span>
                    <span className="game-board__color-info-count">4 張</span>
                  </div>
                </div>
                <div className="game-board__color-info-total">
                  總計: {Object.values(COLOR_DISTRIBUTION).reduce((a, b) => a + b, 0) + 4} 張 (含美人魚)
                </div>
              </div>
            )}
          </div>

          {/* Hand Color Stats Button */}
          <div className="game-board__color-info-container">
            <button
              className={`game-board__color-info-btn ${showHandColorStats ? 'game-board__color-info-btn--active' : ''}`}
              onClick={() => setShowHandColorStats(!showHandColorStats)}
              title="我的手牌顏色統計"
            >
              🎴 手牌統計
            </button>

            {showHandColorStats && myPlayerState?.hand && (
              <div className="game-board__color-info-panel game-board__color-info-panel--below">
                <div className="game-board__color-info-header">
                  <span>🎴 我的手牌顏色統計</span>
                  <button
                    className="game-board__color-info-close"
                    onClick={() => setShowHandColorStats(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="game-board__color-info-desc">
                  共 {(() => {
                    const playedPairCards = (myPlayerState.playedPairs || []).flatMap(p => p.cards || [])
                    return myPlayerState.hand.length + playedPairCards.length
                  })()} 張卡片（含打出的對子）
                </div>
                <div className="game-board__color-info-list">
                  {(() => {
                    // 合併手牌和打出去的對子
                    const playedPairCards = (myPlayerState.playedPairs || []).flatMap(p => p.cards || [])
                    const allCards = [...myPlayerState.hand, ...playedPairCards]

                    const colorCounts = {}
                    allCards.forEach(card => {
                      const color = card.color || 'white'
                      colorCounts[color] = (colorCounts[color] || 0) + 1
                    })

                    return Object.entries(colorCounts).map(([colorKey, count]) => {
                      const colorData = GAME_COLORS[colorKey]
                      if (!colorData) return null
                      return (
                        <div key={colorKey} className="game-board__color-info-item">
                          <span
                            className="game-board__color-info-dot"
                            style={{
                              backgroundColor: colorData.hex,
                              border: colorKey === 'white' ? '1px solid #CBD5E1' : 'none'
                            }}
                          />
                          <span className="game-board__color-info-name">{colorData.name}</span>
                          <span className="game-board__color-info-count">{count} 張</span>
                        </div>
                      )
                    }).filter(Boolean)
                  })()}
                </div>
                <div className="game-board__color-info-total">
                  總計: {(() => {
                    const playedPairCards = (myPlayerState.playedPairs || []).flatMap(p => p.cards || [])
                    return myPlayerState.hand.length + playedPairCards.length
                  })()} 張
                </div>
              </div>
            )}
          </div>

          {/* Leave Button */}
          <Button
            variant="danger"
            size="small"
            onClick={handleLeaveGame}
          >
            離開
          </Button>
        </div>
        <div className="game-board__nav-center">
          <span className="game-board__player-name">
            {currentPlayer.name}
          </span>
        </div>
        <div className="game-board__nav-right">
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="game-board__error-banner">
          {error}
          <button
            className="game-board__error-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Main content area */}
      <div className="game-board__main">
        {/* Table Layout - 桌遊視角 */}
        <div className="game-board__table-container">
          <TableLayout
            players={playersWithMeta}
            currentPlayerId={gameState.currentPlayerId}
            myPlayerId={currentPlayer.id}
            gameState={gameState}
            myHand={myPlayerState?.hand || []}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            onCardDeselect={handleCardDeselect}
            onDrawDeck={handleDrawDeck}
            onDiscardClick={handleTakeDiscard}
            onCardDropped={handleCardDropped}
            onCardDragged={handleCardDragged}
            onCardDragEnd={handleCardDragEnd}
            drawnCards={drawnCards}
            showDrawCardArea={showDrawCardArea}
            turnPhase={turnPhase}
            isMyTurn={isMyTurn}
            cardEnteringHand={cardEnteringHand}
            onCardEffectComplete={handleCardEffectComplete}
            startingPlayerId={gameState.startingPlayerId}
          />

          {/* Action Buttons - 浮動在牌桌上 */}
          <div className="game-board__floating-actions">
            {/* Extra Turn button - when sailboat pair effect is active */}
            {isMyTurn && isExtraTurnEffect && (
              <Button
                variant="success"
                size="small"
                onClick={handleExtraTurn}
              >
                ⛵ 再一回合！
              </Button>
            )}

            {/* End Turn button - only after drawing (turnPhase === 'pair') and no extra turn pending */}
            {isMyTurn && turnPhase === 'pair' && !isExtraTurnEffect && (
              <Button
                variant="secondary"
                size="small"
                onClick={handleEndTurn}
              >
                結束回合
              </Button>
            )}

            {isMyTurn && turnPhase === 'pair' && selectedCards.length === 2 && !isExtraTurnEffect && (
              <Button
                variant="success"
                size="small"
                onClick={handlePlayPair}
              >
                打出組合
              </Button>
            )}

            {canDeclare && !isDeclarePhase && isMyTurn && turnPhase === 'pair' && !isExtraTurnEffect && (
              <>
                <Button
                  variant="warning"
                  size="small"
                  onClick={handleDeclareStop}
                >
                  到此為止 (Stop)
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleDeclareLastChance}
                >
                  最後機會 (Last Chance)
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="game-board__sidebar">
          {/* Score Panel */}
          <div className="game-board__panel">
            <h3 className="game-board__panel-title">計分</h3>
            <ScorePanel
              scoreBreakdown={myScore}
              currentTotalScore={gameState.totalScores?.[currentPlayer.id] || 0}
              targetScore={targetScore}
              canDeclare={canDeclare}
              onDeclareStop={handleDeclareStop}
              onDeclareLastChance={handleDeclareLastChance}
              onSkipDeclare={handleSkipDeclare}
              isDeclarePhase={isDeclarePhase}
            />
          </div>

          {/* Action Log */}
          <div className="game-board__panel game-board__panel--log">
            <ActionLog
              actions={gameState.actionLog || []}
              maxHeight={350}
            />
          </div>
        </div>
      </div>

      {/* Animated Cards */}
      {animatedCards.map(({ id, cardData, delay }) => (
        <AnimatedCard
          key={id}
          cardData={cardData}
          delay={delay}
        />
      ))}

      {/* Leave Confirmation Modal */}
      <Modal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        title="離開遊戲"
        size="small"
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ marginBottom: '24px', fontSize: '16px' }}>
            確定要離開遊戲嗎？
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button
              variant="danger"
              onClick={confirmLeaveGame}
            >
              確定離開
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowLeaveConfirm(false)}
            >
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default GameBoard
