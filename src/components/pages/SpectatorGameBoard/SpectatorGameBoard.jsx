import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../common/Button/Button'
import Card from '../../common/Card/Card'
import ActionLog from '../../game/ActionLog/ActionLog'
import RoundEndModal from '../../game/RoundEndModal/RoundEndModal'
import RoundSettlement from '../../game/RoundSettlement/RoundSettlement'
import { listenToRoom } from '../../../services/firebaseService'
import {
  pauseGame,
  resumeGame,
  setGameSpeed,
  restartGame,
  startNextRound,
  cleanupSpectatorRoom,
  startAIBattle
} from '../../../services/spectatorService'
import { calculateScore, calculateLastChanceScores } from '../../../services/scoreService'
import { GAME_SPEED, GAME_STATUS } from '../../../utils/constants'
import { TARGET_SCORES } from '../../../data/gameRules'
import './SpectatorGameBoard.css'

/**
 * SpectatorGameBoard Component
 *
 * View-only game board for watching AI battles
 *
 * Features:
 * - Displays all 4 AI player hands (visible)
 * - Shows game progression in real-time
 * - Speed controls (Slow/Normal/Fast/Turbo)
 * - Pause/Resume controls
 * - Restart capability
 * - No player interaction with game actions
 */
function SpectatorGameBoard() {
  const { roomId } = useParams()
  const navigate = useNavigate()

  const [roomData, setRoomData] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSpeed, setCurrentSpeed] = useState(GAME_SPEED.NORMAL)

  // Round end state
  const [roundResults, setRoundResults] = useState(null)
  const [showRoundEnd, setShowRoundEnd] = useState(false)
  const [showSettlement, setShowSettlement] = useState(false)
  const [settlementData, setSettlementData] = useState(null)

  // Spectator info
  const spectatorId = localStorage.getItem('playerId')

  // Previous phase ref to detect round end
  const previousPhaseRef = useRef(null)

  // Listen to room data
  useEffect(() => {
    if (!roomId) return

    const unsubscribe = listenToRoom(roomId, (data) => {
      if (!data) {
        setError('Room not found')
        setLoading(false)
        return
      }

      setRoomData(data)
      setGameState(data.gameState)
      setIsPaused(data.orchestration?.isPaused || false)
      setCurrentSpeed(data.orchestration?.currentSpeed || GAME_SPEED.NORMAL)
      setLoading(false)
    })

    return () => {
      unsubscribe()
      cleanupSpectatorRoom(roomId)
    }
  }, [roomId])

  // Start AI battle when component mounts (if game is playing)
  useEffect(() => {
    if (!roomId || !roomData) return
    if (roomData.status === GAME_STATUS.PLAYING) {
      console.log('[SpectatorGameBoard] Starting AI battle loop')
      startAIBattle(roomId)
    }
  }, [roomId, roomData?.status])

  // Handle round end detection
  useEffect(() => {
    if (!gameState || !roomData) return

    const currentPhase = gameState.turnPhase
    const previousPhase = previousPhaseRef.current

    // Detect transition to round_end
    if (currentPhase === 'round_end' && previousPhase !== 'round_end') {
      console.log('[Spectator] Round ended, calculating scores...')
      calculateRoundResults()
    }

    previousPhaseRef.current = currentPhase
  }, [gameState?.turnPhase, roomData])

  /**
   * Calculate round results for display
   */
  const calculateRoundResults = useCallback(() => {
    if (!gameState || !roomData) return

    const declareMode = gameState.declareMode
    const declaringPlayerId = gameState.declaringPlayerId
    const players = gameState.players
    const playerIds = Object.keys(players)

    let scores = {}
    let cardScores = {}
    let declarerHasHighest = true

    if (declareMode === 'last_chance') {
      const result = calculateLastChanceScores(players, declaringPlayerId)
      scores = result.scores
      cardScores = result.cardScores
      declarerHasHighest = result.declarerHasHighest
    } else {
      playerIds.forEach(playerId => {
        const player = players[playerId]
        const scoreData = calculateScore(
          player.hand || [],
          player.playedPairs || [],
          { includeColorBonus: false }
        )
        scores[playerId] = {
          ...scoreData,
          playerName: roomData.players?.[playerId]?.name || 'AI'
        }
      })
    }

    // Add player names
    playerIds.forEach(playerId => {
      if (scores[playerId]) {
        scores[playerId].playerName = roomData.players?.[playerId]?.name || 'AI'
      }
    })

    // Find winner
    const winnerId = playerIds.reduce((prev, curr) =>
      (scores[curr]?.total || 0) > (scores[prev]?.total || 0) ? curr : prev
    )

    // Calculate total scores
    const totalScores = {}
    playerIds.forEach(playerId => {
      const previousTotal = gameState.totalScores?.[playerId] || 0
      totalScores[playerId] = previousTotal + (scores[playerId]?.total || 0)
    })

    // Check game over (handle "auto" target score)
    const playerCount = playerIds.length
    const settingsTargetScore = roomData.settings?.targetScore
    const targetScore = settingsTargetScore === 'auto'
      ? TARGET_SCORES[playerCount] || 30
      : parseInt(settingsTargetScore || 30, 10)
    const gameOver = Object.values(totalScores).some(score => score >= targetScore)

    const results = {
      declareMode,
      declarerName: roomData.players?.[declaringPlayerId]?.name || 'AI',
      declarerId: declaringPlayerId,
      declarerHasHighest,
      scores,
      winner: {
        id: winnerId,
        name: roomData.players?.[winnerId]?.name || 'AI'
      },
      totalScores,
      targetScore,
      gameOver
    }

    setRoundResults(results)

    // Prepare settlement data
    const settlementPlayers = playerIds.map(playerId => ({
      id: playerId,
      name: roomData.players?.[playerId]?.name || 'AI',
      hand: players[playerId].hand || [],
      playedPairs: players[playerId].playedPairs || [],
      score: scores[playerId],
      cardScore: cardScores[playerId] || scores[playerId]
    }))

    setSettlementData({
      players: settlementPlayers,
      declarerId: declaringPlayerId,
      declareMode,
      declarerHasHighest
    })

    setShowSettlement(true)
  }, [gameState, roomData])

  /**
   * Handle speed change
   */
  const handleSpeedChange = async (speed) => {
    await setGameSpeed(roomId, speed)
    setCurrentSpeed(speed)
  }

  /**
   * Handle pause/resume toggle
   */
  const handlePauseToggle = async () => {
    if (isPaused) {
      await resumeGame(roomId)
    } else {
      await pauseGame(roomId)
    }
    setIsPaused(!isPaused)
  }

  /**
   * Handle restart game
   */
  const handleRestart = async () => {
    if (window.confirm('Restart the AI battle from the beginning?')) {
      setShowRoundEnd(false)
      setShowSettlement(false)
      setRoundResults(null)
      await restartGame(roomId)
    }
  }

  /**
   * Handle next round
   */
  const handleNextRound = async () => {
    setShowRoundEnd(false)
    setShowSettlement(false)
    await startNextRound(roomId, roundResults?.scores || {})
  }

  /**
   * Handle end game (return to lobby)
   */
  const handleEndGame = () => {
    navigate('/spectator-lobby')
  }

  /**
   * Handle settlement complete
   */
  const handleSettlementComplete = () => {
    setShowSettlement(false)
    setSettlementData(null)
    setShowRoundEnd(true)
  }

  /**
   * Handle leave game
   */
  const handleLeaveGame = () => {
    if (window.confirm('Leave the spectator room?')) {
      cleanupSpectatorRoom(roomId)
      navigate('/')
    }
  }

  /**
   * Get speed button info
   */
  const getSpeedInfo = (speed) => {
    switch (speed) {
      case GAME_SPEED.SLOW:
        return { label: 'Slow', emoji: '🐢' }
      case GAME_SPEED.NORMAL:
        return { label: 'Normal', emoji: '▶️' }
      case GAME_SPEED.FAST:
        return { label: 'Fast', emoji: '⏩' }
      case GAME_SPEED.TURBO:
        return { label: 'Turbo', emoji: '⚡' }
      default:
        return { label: 'Normal', emoji: '▶️' }
    }
  }

  /**
   * Get difficulty color
   */
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#27AE60'
      case 'medium': return '#F39C12'
      case 'hard': return '#E74C3C'
      default: return '#6C757D'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="spectator-game spectator-game--loading">
        <div className="spectator-game__loading">
          <div className="spectator-game__loading-spinner" />
          <p>Loading AI Battle...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !gameState) {
    return (
      <div className="spectator-game spectator-game--error">
        <div className="spectator-game__error-content">
          <h2>Error</h2>
          <p>{error || 'Game state not found'}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  // Get player data
  const playerIds = Object.keys(gameState.players)
  const currentPlayerId = gameState.currentPlayerId
  const currentPlayerName = roomData?.players?.[currentPlayerId]?.name || 'AI'
  const turnPhase = gameState.turnPhase
  const round = gameState.round || 1

  // Calculate target score (handle "auto" mode)
  const playerCount = playerIds.length
  const settingsTargetScore = roomData?.settings?.targetScore
  const targetScore = settingsTargetScore === 'auto'
    ? TARGET_SCORES[playerCount] || 30
    : parseInt(settingsTargetScore || 30, 10)

  // Game finished check
  const isGameFinished = roomData?.status === GAME_STATUS.FINISHED

  return (
    <div className="spectator-game">
      {/* Spectator Mode Banner */}
      <div className="spectator-game__banner">
        <span className="spectator-game__banner-icon">👁️</span>
        <span className="spectator-game__banner-text">
          Spectator Mode - AI Battle
        </span>
        {isPaused && (
          <span className="spectator-game__banner-paused">PAUSED</span>
        )}
      </div>

      {/* Navigation */}
      <div className="spectator-game__nav">
        <div className="spectator-game__nav-left">
          <span className="spectator-game__round">Round {round}</span>
          <span className="spectator-game__target">Target: {targetScore} pts</span>
        </div>

        <div className="spectator-game__nav-center">
          <div className="spectator-game__current-turn">
            <span className="spectator-game__turn-label">Current Turn:</span>
            <span className="spectator-game__turn-player">{currentPlayerName}</span>
            <span className="spectator-game__turn-phase">({turnPhase})</span>
          </div>
        </div>

        <div className="spectator-game__nav-right">
          <Button
            variant="danger"
            size="small"
            onClick={handleLeaveGame}
          >
            Leave
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="spectator-game__main">
        {/* Players Grid - 2x2 layout */}
        <div className="spectator-game__players-grid">
          {playerIds.map((playerId, index) => {
            const player = gameState.players[playerId]
            const playerInfo = roomData?.players?.[playerId] || {}
            const isCurrentTurn = playerId === currentPlayerId
            const difficulty = playerInfo.difficulty || 'medium'
            const difficultyColor = getDifficultyColor(difficulty)

            // Calculate player score
            const playerScore = calculateScore(
              player.hand || [],
              player.playedPairs || [],
              { includeColorBonus: false }
            )

            const totalScore = gameState.totalScores?.[playerId] || 0

            return (
              <div
                key={playerId}
                className={`spectator-game__player-area ${isCurrentTurn ? 'spectator-game__player-area--active' : ''}`}
              >
                {/* Player Header */}
                <div className="spectator-game__player-header">
                  <div className="spectator-game__player-info">
                    <span className="spectator-game__player-name">
                      {playerInfo.name || `AI ${index + 1}`}
                    </span>
                    <span
                      className="spectator-game__player-difficulty"
                      style={{ color: difficultyColor }}
                    >
                      ({difficulty})
                    </span>
                  </div>
                  <div className="spectator-game__player-scores">
                    <span className="spectator-game__score-round">
                      Round: {playerScore.total}
                    </span>
                    <span className="spectator-game__score-total">
                      Total: {totalScore}
                    </span>
                  </div>
                </div>

                {/* Player Hand */}
                <div className="spectator-game__player-hand">
                  {(player.hand || []).length === 0 ? (
                    <div className="spectator-game__hand-empty">No cards</div>
                  ) : (
                    <div className="spectator-game__hand-cards">
                      {(player.hand || []).map((card, cardIndex) => (
                        <div
                          key={card.id || cardIndex}
                          className="spectator-game__card-wrapper"
                        >
                          <Card
                            card={card}
                            showFront={true}
                            size="small"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Played Pairs */}
                {(player.playedPairs || []).length > 0 && (
                  <div className="spectator-game__played-pairs">
                    <div className="spectator-game__pairs-label">Played Pairs:</div>
                    <div className="spectator-game__pairs-list">
                      {(player.playedPairs || []).map((pair, pairIndex) => (
                        <div key={pairIndex} className="spectator-game__pair">
                          {pair.cards?.map((card, cardIdx) => (
                            <span key={cardIdx} className="spectator-game__pair-card">
                              {card.name}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Game Center - Deck and Discard */}
        <div className="spectator-game__center">
          <div className="spectator-game__deck-area">
            <div className="spectator-game__deck">
              <div className="spectator-game__deck-count">
                {gameState.deckCount || 0}
              </div>
              <div className="spectator-game__deck-label">Deck</div>
            </div>

            <div className="spectator-game__discard-piles">
              <div className="spectator-game__discard-pile">
                <div className="spectator-game__discard-label">Left</div>
                {(gameState.discardLeft || []).length > 0 ? (
                  <Card
                    card={gameState.discardLeft[gameState.discardLeft.length - 1]}
                    showFront={true}
                    size="small"
                  />
                ) : (
                  <div className="spectator-game__discard-empty">Empty</div>
                )}
              </div>

              <div className="spectator-game__discard-pile">
                <div className="spectator-game__discard-label">Right</div>
                {(gameState.discardRight || []).length > 0 ? (
                  <Card
                    card={gameState.discardRight[gameState.discardRight.length - 1]}
                    showFront={true}
                    size="small"
                  />
                ) : (
                  <div className="spectator-game__discard-empty">Empty</div>
                )}
              </div>
            </div>
          </div>

          {/* Action Log */}
          <div className="spectator-game__log">
            <ActionLog
              actions={gameState.actionLog || []}
              maxHeight={200}
            />
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="spectator-game__controls">
        {/* Speed Controls */}
        <div className="spectator-game__speed-controls">
          <span className="spectator-game__control-label">Speed:</span>
          {Object.entries(GAME_SPEED).map(([key, value]) => {
            const speedInfo = getSpeedInfo(value)
            const isActive = currentSpeed === value

            return (
              <button
                key={key}
                className={`spectator-game__speed-btn ${isActive ? 'spectator-game__speed-btn--active' : ''}`}
                onClick={() => handleSpeedChange(value)}
                disabled={isPaused}
              >
                <span>{speedInfo.emoji}</span>
                <span>{speedInfo.label}</span>
              </button>
            )
          })}
        </div>

        {/* Playback Controls */}
        <div className="spectator-game__playback-controls">
          <Button
            variant={isPaused ? 'success' : 'warning'}
            size="small"
            onClick={handlePauseToggle}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={handleRestart}
          >
            🔄 Restart
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate('/spectator-lobby')}
          >
            ⚙️ Settings
          </Button>
        </div>
      </div>

      {/* Round Settlement Animation */}
      <RoundSettlement
        isOpen={showSettlement}
        players={settlementData?.players || []}
        declarerId={settlementData?.declarerId}
        declareMode={settlementData?.declareMode}
        declarerHasHighest={settlementData?.declarerHasHighest}
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
    </div>
  )
}

export default SpectatorGameBoard
