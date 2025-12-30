import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../../common/Button/Button'
import Input from '../../common/Input/Input'
import { validateRoomCode, generateRoomCode, generatePlayerName } from '../../../utils/validators'
import { createRoom, roomExists } from '../../../services/firebaseService'
import { getReconnectionData, clearActivelyLeftFlag } from '../../../services/reconnectionService'
import './HomePage.css'

/**
 * HomePage Component
 *
 * Landing page for creating or joining game rooms
 */
function HomePage() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [playerId, setPlayerId] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [reconnectRoomId, setReconnectRoomId] = useState(null)

  // Get or create player ID
  useEffect(() => {
    let id = localStorage.getItem('playerId')
    let name = localStorage.getItem('playerName')

    if (!id) {
      id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('playerId', id)
    }

    if (!name) {
      name = generatePlayerName()
      localStorage.setItem('playerName', name)
    }

    setPlayerId(id)
    setPlayerName(name)
  }, [])

  // Check for reconnection when player ID is available
  useEffect(() => {
    if (!playerId) return

    const checkReconnection = async () => {
      try {
        setReconnecting(true)
        console.log('[HomePage] Checking for active room...')

        const { shouldReconnect, roomId, roomData } = await getReconnectionData(playerId)

        if (shouldReconnect && roomId) {
          console.log('[HomePage] Found active room, reconnecting to:', roomId)
          setReconnectRoomId(roomId)

          // Clear the actively left flag since we're reconnecting
          clearActivelyLeftFlag()

          // Show reconnection message briefly before navigating
          setTimeout(() => {
            navigate(`/game/${roomId}`)
          }, 1000)
        } else {
          console.log('[HomePage] No active room found')
          setReconnecting(false)
        }
      } catch (error) {
        console.error('[HomePage] Reconnection check error:', error)
        setReconnecting(false)
      }
    }

    checkReconnection()
  }, [playerId, navigate])

  /**
   * Handle create room button click
   * Generates a random room code and creates it in Firebase
   */
  const handleCreateRoom = async () => {
    if (!playerId || !playerName) {
      setError('Player not initialized. Please refresh the page.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Clear the actively left flag when creating a new room
      clearActivelyLeftFlag()

      // Create room in Firebase
      const newRoomCode = await createRoom(playerId, playerName)

      console.log('Room created:', newRoomCode)

      // Navigate to lobby
      navigate(`/lobby/${newRoomCode}`)
    } catch (err) {
      setError('Failed to create room. Please try again.')
      console.error('Create room error:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle join room button click
   * Validates room code and checks if it exists in Firebase
   */
  const handleJoinRoom = async () => {
    setError('')

    // Validate room code
    const validation = validateRoomCode(roomCode)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setLoading(true)

    try {
      const upperRoomCode = roomCode.trim().toUpperCase()

      // Check if room exists in Firebase
      const exists = await roomExists(upperRoomCode)

      if (!exists) {
        setError('Room not found. Please check the code.')
        setLoading(false)
        return
      }

      // Clear the actively left flag when joining a room
      clearActivelyLeftFlag()

      // Navigate to lobby
      navigate(`/lobby/${upperRoomCode}`)
    } catch (err) {
      setError('Room not found or unable to join.')
      console.error('Join room error:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle player name change
   */
  const handlePlayerNameChange = (event) => {
    const value = event.target.value.trim()
    setPlayerName(value)
  }

  /**
   * Handle save player name
   */
  const handleSavePlayerName = () => {
    if (playerName && playerName.length >= 2) {
      localStorage.setItem('playerName', playerName)
      setIsEditingName(false)
      setError('')
    } else {
      setError('Player name must be at least 2 characters')
    }
  }

  /**
   * Handle room code input change
   */
  const handleRoomCodeChange = (event) => {
    const value = event.target.value.toUpperCase()
    setRoomCode(value)
    setError('')
  }

  /**
   * Handle Enter key press in input
   */
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && roomCode && !loading) {
      handleJoinRoom()
    }
  }

  /**
   * Handle Enter key for player name
   */
  const handleNameKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSavePlayerName()
    }
  }

  /**
   * Handle watch AI battle button click
   */
  const handleWatchAIBattle = () => {
    navigate('/spectator-lobby')
  }

  return (
    <div className="home-page">
      <div className="home-page__container">
        <header className="home-page__header">
          <h1 className="home-page__title">🌊 海鹽與紙牌</h1>
          <p className="home-page__subtitle">
            線上多人卡牌遊戲
          </p>
        </header>

        {/* Reconnection message */}
        {reconnecting && reconnectRoomId && (
          <div className="home-page__reconnection-message">
            <p>⏳ 偵測到您之前在進行中的遊戲...</p>
            <p>正在重新連線到房間：{reconnectRoomId}</p>
          </div>
        )}

        {/* Player name section */}
        <div className="home-page__player-section">
          <div className="home-page__player-name">
            {isEditingName ? (
              <div className="home-page__player-name-edit">
                <Input
                  type="text"
                  value={playerName}
                  onChange={handlePlayerNameChange}
                  onKeyPress={handleNameKeyPress}
                  placeholder="輸入你的名字"
                  maxLength={20}
                  autoFocus
                />
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleSavePlayerName}
                >
                  儲存
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setIsEditingName(false)}
                >
                  取消
                </Button>
              </div>
            ) : (
              <div className="home-page__player-name-display">
                <span className="home-page__player-label">玩家名稱：</span>
                <span className="home-page__player-name-text">{playerName}</span>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setIsEditingName(true)}
                >
                  更改名稱
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="home-page__actions">
          <div className="home-page__action-group">
            <h2 className="home-page__section-title">創建新遊戲</h2>
            <Button
              variant="primary"
              size="large"
              onClick={handleCreateRoom}
              disabled={loading}
              className="home-page__button"
            >
              {loading ? '創建中...' : '創建房間'}
            </Button>
          </div>

          <div className="home-page__divider">
            <span className="home-page__divider-text">或</span>
          </div>

          <div className="home-page__action-group">
            <h2 className="home-page__section-title">加入現有遊戲</h2>
            <Input
              type="text"
              value={roomCode}
              onChange={handleRoomCodeChange}
              onKeyPress={handleKeyPress}
              placeholder="輸入房間代碼"
              maxLength={6}
              disabled={loading}
              error={error}
              className="home-page__input"
            />
            <Button
              variant="secondary"
              size="large"
              onClick={handleJoinRoom}
              disabled={loading || !roomCode}
              className="home-page__button"
            >
              {loading ? '加入中...' : '加入房間'}
            </Button>
          </div>
        </div>

        {/* Spectator Mode Section */}
        <div className="home-page__spectator-section">
          <Button
            variant="secondary"
            size="large"
            onClick={handleWatchAIBattle}
            className="home-page__button home-page__button--spectator"
          >
            👁️ 觀看 AI 對戰
          </Button>
          <p className="home-page__spectator-desc">
            觀看 4 個 AI 互相對戰
          </p>
        </div>

        <footer className="home-page__footer">
          <p className="home-page__info">
            🎮 2-4 人遊戲 • 即時多人連線 • AI 對手
          </p>
          <Link to="/tutorial" className="home-page__tutorial-link">
            📖 遊戲教學
          </Link>
        </footer>
      </div>
    </div>
  )
}

export default HomePage
