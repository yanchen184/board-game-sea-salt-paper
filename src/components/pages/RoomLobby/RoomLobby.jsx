import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../common/Button/Button'
import Input from '../../common/Input/Input'
import Modal from '../../common/Modal/Modal'
import { listenToRoom, updatePlayerReady, startGame, leaveRoom, updateRoomSettings, joinRoom, addAIPlayer } from '../../../services/firebaseService'
import { DEFAULT_SETTINGS } from '../../../data/gameRules'
import { generatePlayerName } from '../../../utils/validators'
import './RoomLobby.css'

/**
 * RoomLobby Component
 *
 * Waiting room before game starts
 * Features:
 * - Real-time player list with ready status
 * - Game settings configuration (host only)
 * - Start game button (validates all ready)
 * - Copy room code functionality
 */
function RoomLobby() {
  const { roomId } = useParams()
  const navigate = useNavigate()

  const [roomData, setRoomData] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [copiedCode, setCopiedCode] = useState(false)

  // Get or create player ID
  useEffect(() => {
    let playerId = localStorage.getItem('playerId')
    let playerName = localStorage.getItem('playerName')

    if (!playerId) {
      playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('playerId', playerId)
    }

    if (!playerName) {
      playerName = generatePlayerName()
      localStorage.setItem('playerName', playerName)
    }

    setCurrentPlayer({ id: playerId, name: playerName })
  }, [])

  // Auto-join room if player is not in it yet
  useEffect(() => {
    if (!roomId || !currentPlayer) return

    let hasJoined = false

    const checkAndJoinRoom = async () => {
      const unsubscribe = listenToRoom(roomId, async (data) => {
        if (!data) {
          setError('Room not found')
          setLoading(false)
          return
        }

        // Check if player is already in the room
        if (!data.players || !data.players[currentPlayer.id]) {
          // Player not in room, auto-join
          if (!hasJoined) {
            hasJoined = true
            try {
              console.log('[RoomLobby] Auto-joining room:', roomId, 'as', currentPlayer.name)
              await joinRoom(roomId, currentPlayer.id, currentPlayer.name)
              console.log('[RoomLobby] Auto-joined successfully')
              // Don't update roomData here - wait for the listener to fire again with updated data
              return
            } catch (err) {
              console.error('[RoomLobby] Auto-join error:', err)
              setError(err.message)
              setLoading(false)
              hasJoined = false
            }
          }
          return
        }

        // Player is in the room, update state
        console.log('[RoomLobby] Player found in room:', currentPlayer.id)
        setRoomData(data)
        setSettings(data.settings || DEFAULT_SETTINGS)
        setLoading(false)

        // If game started, navigate to game board
        if (data.status === 'playing') {
          navigate(`/game/${roomId}`)
        }
      })

      return unsubscribe
    }

    const unsubscribePromise = checkAndJoinRoom()

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe())
    }
  }, [roomId, currentPlayer, navigate])

  /**
   * Handle toggle ready status
   */
  const handleToggleReady = async () => {
    if (!currentPlayer || !roomData) {
      console.log('[Ready] Missing data:', { currentPlayer, roomData: !!roomData })
      return
    }

    try {
      const player = roomData.players[currentPlayer.id]
      console.log('[Ready] Current player:', currentPlayer.id)
      console.log('[Ready] Player in room:', player)
      console.log('[Ready] All players:', Object.keys(roomData.players))

      if (!player) {
        console.error('[Ready] Player not found in room!')
        setError('Player not found in room. Please refresh.')
        return
      }

      console.log('[Ready] Toggling ready from:', player.isReady, 'to:', !player.isReady)
      await updatePlayerReady(roomId, currentPlayer.id, !player.isReady)
    } catch (err) {
      console.error('Toggle ready error:', err)
      setError(err.message)
    }
  }

  /**
   * Handle start game (host only)
   */
  const handleStartGame = async () => {
    if (!currentPlayer || !roomData) return

    try {
      // Validate all players ready (except host)
      const players = Object.values(roomData.players)
      const allReady = players.every(p => p.isHost || p.isReady || p.isAI)

      if (!allReady) {
        setError('All players must be ready')
        return
      }

      // Validate minimum players
      if (players.length < 2) {
        setError('Need at least 2 players to start')
        return
      }

      console.log('[Start Game] Starting game with', players.length, 'players')
      await startGame(roomId)
      // Navigation handled by room listener
    } catch (err) {
      console.error('Start game error:', err)
      setError(err.message)
    }
  }

  /**
   * Handle leave room
   */
  const handleLeaveRoom = async () => {
    if (!currentPlayer) return

    try {
      await leaveRoom(roomId, currentPlayer.id)
      navigate('/')
    } catch (err) {
      console.error('Leave room error:', err)
    }
  }

  /**
   * Handle copy room code
   */
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  /**
   * Handle update settings (host only)
   */
  const handleUpdateSettings = async () => {
    if (!currentPlayer || !roomData) return

    try {
      await updateRoomSettings(roomId, settings)
      setShowSettings(false)
    } catch (err) {
      console.error('Update settings error:', err)
      setError(err.message)
    }
  }

  /**
   * Handle add AI player (host only)
   */
  const [aiDifficulty, setAiDifficulty] = useState('medium')

  const handleAddAI = async () => {
    if (!currentPlayer || !roomData) return

    try {
      await addAIPlayer(roomId, aiDifficulty)
    } catch (err) {
      console.error('Add AI player error:', err)
      setError(err.message)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="room-lobby room-lobby--loading">
        <div className="room-lobby__container">
          <div className="room-lobby__loading">
            <div className="room-lobby__loading-spinner" />
            <p>載入房間中...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !roomData) {
    return (
      <div className="room-lobby room-lobby--error">
        <div className="room-lobby__container">
          <div className="room-lobby__error">
            <span className="room-lobby__error-icon">⚠️</span>
            <h2>錯誤</h2>
            <p>{error}</p>
            <Button onClick={() => navigate('/')}>
              返回首頁
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!roomData || !currentPlayer || !roomData.players) return null

  const currentPlayerData = roomData.players[currentPlayer.id]
  const isHost = currentPlayerData?.isHost === true
  const players = Object.values(roomData.players)
  const allReady = players.every(p => p.isHost || p.isReady || p.isAI)

  console.log('[RoomLobby] Current player:', currentPlayer.id)
  console.log('[RoomLobby] Current player data:', currentPlayerData)
  console.log('[RoomLobby] Is host:', isHost)
  console.log('[RoomLobby] All players:', players.map(p => ({ id: p.id, name: p.name, isHost: p.isHost })))

  return (
    <div className="room-lobby">
      <div className="room-lobby__container">
        {/* Header */}
        <div className="room-lobby__header">
          <h1 className="room-lobby__title">遊戲大廳</h1>

          {/* Room code */}
          <div className="room-lobby__room-code">
            <span className="room-lobby__code-label">房間代碼：</span>
            <span className="room-lobby__code-value">{roomId}</span>
            <button
              className="room-lobby__copy-btn"
              onClick={handleCopyCode}
              aria-label="複製房間代碼"
            >
              {copiedCode ? '✓ 已複製' : '📋 複製'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="room-lobby__error-banner">
            {error}
          </div>
        )}

        {/* Players list */}
        <div className="room-lobby__players">
          <h2 className="room-lobby__section-title">
            玩家 ({players.length}/{settings.maxPlayers})
          </h2>

          <div className="room-lobby__players-list">
            {players.map(player => (
              <div
                key={player.id}
                className={`
                  room-lobby__player
                  ${player.isReady ? 'room-lobby__player--ready' : ''}
                  ${!player.connected ? 'room-lobby__player--disconnected' : ''}
                `}
              >
                <div className="room-lobby__player-info">
                  <span className="room-lobby__player-name">
                    {player.name}
                    {player.isAI && ' 🤖'}
                  </span>
                  {player.isHost && (
                    <span className="room-lobby__player-badge">房主</span>
                  )}
                </div>

                <div className="room-lobby__player-status">
                  {player.isHost ? (
                    <span className="room-lobby__player-status-text">房主</span>
                  ) : player.isReady ? (
                    <span className="room-lobby__player-status-text room-lobby__player-status-text--ready">
                      ✓ 準備完成
                    </span>
                  ) : (
                    <span className="room-lobby__player-status-text room-lobby__player-status-text--waiting">
                      等待中...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game settings */}
        <div className="room-lobby__settings-summary">
          <h3 className="room-lobby__section-title">遊戲設定</h3>
          <div className="room-lobby__settings-grid">
            <div className="room-lobby__setting">
              <span className="room-lobby__setting-label">目標分數：</span>
              <span className="room-lobby__setting-value">{settings.targetScore || 30}</span>
            </div>
            <div className="room-lobby__setting">
              <span className="room-lobby__setting-label">起始手牌：</span>
              <span className="room-lobby__setting-value">{settings.startingHandSize || 0} 張</span>
            </div>
            <div className="room-lobby__setting">
              <span className="room-lobby__setting-label">最多玩家：</span>
              <span className="room-lobby__setting-value">{settings.maxPlayers || 4}</span>
            </div>
          </div>

          {isHost && (
            <div className="room-lobby__host-actions">
              <Button
                variant="secondary"
                size="small"
                onClick={() => setShowSettings(true)}
                className="room-lobby__settings-btn"
              >
                ⚙️ 編輯設定
              </Button>
              <div className="room-lobby__ai-controls">
                <select
                  className="room-lobby__ai-difficulty"
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                  disabled={players.length >= settings.maxPlayers}
                >
                  <option value="easy">簡單 AI</option>
                  <option value="medium">中等 AI</option>
                  <option value="hard">困難 AI</option>
                  <option value="expert">專家 AI ⭐</option>
                </select>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleAddAI}
                  disabled={players.length >= settings.maxPlayers}
                  className="room-lobby__add-ai-btn"
                >
                  🤖 添加 AI
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="room-lobby__actions">
          {isHost ? (
            /* Host only sees Start Game button */
            <Button
              variant="primary"
              size="large"
              onClick={handleStartGame}
              disabled={!allReady || players.length < 2}
              className="room-lobby__start-btn"
            >
              {players.length < 2 ? '等待玩家加入...' : allReady ? '▶ 開始遊戲' : '等待準備中...'}
            </Button>
          ) : (
            /* Non-host players see Ready Up button */
            <Button
              variant={currentPlayerData?.isReady ? 'secondary' : 'primary'}
              size="large"
              onClick={handleToggleReady}
              className="room-lobby__ready-btn"
            >
              {currentPlayerData?.isReady ? '✓ 準備完成' : '準備'}
            </Button>
          )}

          <Button
            variant="danger"
            size="medium"
            onClick={handleLeaveRoom}
            className="room-lobby__leave-btn"
          >
            離開房間
          </Button>
        </div>
      </div>

      {/* Settings modal (host only) */}
      {isHost && (
        <Modal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          title="遊戲設定"
          size="medium"
        >
          <div className="room-lobby__settings-form">
            <Input
              type="number"
              label="目標分數"
              value={settings.targetScore || 30}
              onChange={(e) => setSettings({ ...settings, targetScore: parseInt(e.target.value) })}
              min={20}
              max={50}
            />

            <Input
              type="number"
              label="起始手牌數量"
              value={settings.startingHandSize || 0}
              onChange={(e) => setSettings({ ...settings, startingHandSize: parseInt(e.target.value) })}
              min={0}
              max={10}
            />

            <Input
              type="number"
              label="最多玩家"
              value={settings.maxPlayers || 4}
              onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
              min={2}
              max={4}
              disabled={players.length > 2}
            />

            <div className="room-lobby__settings-actions">
              <Button
                variant="secondary"
                onClick={() => setShowSettings(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateSettings}
              >
                儲存設定
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default RoomLobby
