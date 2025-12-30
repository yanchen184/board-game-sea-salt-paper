import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../common/Button/Button'
import { createSpectatorRoom, startAIBattle } from '../../../services/spectatorService'
import { SPECTATOR_DEFAULTS, GAME_SPEED, AI_DIFFICULTY } from '../../../utils/constants'
import './SpectatorLobby.css'

/**
 * SpectatorLobby Component
 *
 * Configuration screen for AI battle spectator mode
 * Allows customizing AI players and game settings before starting
 *
 * Features:
 * - Configure 4 AI players (name, difficulty)
 * - Set game speed
 * - Toggle visibility options
 * - Start AI battle
 */
function SpectatorLobby() {
  const navigate = useNavigate()

  // Spectator info
  const [spectatorId, setSpectatorId] = useState(null)
  const [spectatorName, setSpectatorName] = useState('')

  // AI player configurations
  const [aiPlayers, setAiPlayers] = useState([
    { name: SPECTATOR_DEFAULTS.AI_NAMES[0], difficulty: SPECTATOR_DEFAULTS.AI_DIFFICULTIES[0], color: SPECTATOR_DEFAULTS.AI_COLORS[0] },
    { name: SPECTATOR_DEFAULTS.AI_NAMES[1], difficulty: SPECTATOR_DEFAULTS.AI_DIFFICULTIES[1], color: SPECTATOR_DEFAULTS.AI_COLORS[1] },
    { name: SPECTATOR_DEFAULTS.AI_NAMES[2], difficulty: SPECTATOR_DEFAULTS.AI_DIFFICULTIES[2], color: SPECTATOR_DEFAULTS.AI_COLORS[2] },
    { name: SPECTATOR_DEFAULTS.AI_NAMES[3], difficulty: SPECTATOR_DEFAULTS.AI_DIFFICULTIES[3], color: SPECTATOR_DEFAULTS.AI_COLORS[3] }
  ])

  // Game settings
  const [gameSpeed, setGameSpeed] = useState(SPECTATOR_DEFAULTS.GAME_SPEED)
  const [showAllHands, setShowAllHands] = useState(SPECTATOR_DEFAULTS.SHOW_ALL_HANDS)
  const [showAIThinking, setShowAIThinking] = useState(SPECTATOR_DEFAULTS.SHOW_AI_THINKING)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get spectator info from localStorage
  useEffect(() => {
    let id = localStorage.getItem('playerId')
    let name = localStorage.getItem('playerName')

    if (!id) {
      id = `spectator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('playerId', id)
    }

    if (!name) {
      name = 'Spectator'
      localStorage.setItem('playerName', name)
    }

    setSpectatorId(id)
    setSpectatorName(name)
  }, [])

  /**
   * Handle AI player name change
   */
  const handleNameChange = (index, newName) => {
    setAiPlayers(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], name: newName }
      return updated
    })
  }

  /**
   * Handle AI player difficulty change
   */
  const handleDifficultyChange = (index, newDifficulty) => {
    setAiPlayers(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], difficulty: newDifficulty }
      return updated
    })
  }

  /**
   * Handle start spectator battle
   */
  const handleStartBattle = async () => {
    if (!spectatorId) {
      setError('Spectator not initialized')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Prepare settings
      const settings = {
        aiDifficulties: aiPlayers.map(p => p.difficulty),
        aiNames: aiPlayers.map(p => p.name || 'AI Player'),
        aiColors: aiPlayers.map(p => p.color),
        gameSpeed,
        showAllHands,
        showAIThinking
      }

      // Create spectator room
      const roomId = await createSpectatorRoom(spectatorId, spectatorName, settings)
      console.log('[SpectatorLobby] Room created:', roomId)

      // Start the AI battle
      const started = await startAIBattle(roomId)
      if (!started) {
        setError('Failed to start AI battle')
        setLoading(false)
        return
      }

      // Navigate to spectator game board
      navigate(`/spectator/${roomId}`)

    } catch (err) {
      console.error('[SpectatorLobby] Error:', err)
      setError('Failed to create spectator room')
      setLoading(false)
    }
  }

  /**
   * Handle go back to home
   */
  const handleGoBack = () => {
    navigate('/')
  }

  /**
   * Get difficulty display info
   */
  const getDifficultyInfo = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return { label: 'Easy', emoji: '🌱', color: '#27AE60' }
      case 'medium':
        return { label: 'Medium', emoji: '🌿', color: '#F39C12' }
      case 'hard':
        return { label: 'Hard', emoji: '🔥', color: '#E74C3C' }
      default:
        return { label: 'Medium', emoji: '🌿', color: '#F39C12' }
    }
  }

  /**
   * Get speed display info
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
   * Get AI color styles
   */
  const getColorStyle = (color) => {
    const colors = {
      blue: { bg: '#EBF5FB', border: '#3498DB', text: '#2980B9' },
      green: { bg: '#E8F8F5', border: '#27AE60', text: '#1E8449' },
      orange: { bg: '#FDF2E9', border: '#E67E22', text: '#CA6F1E' },
      pink: { bg: '#FDEDEC', border: '#E91E63', text: '#C2185B' }
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="spectator-lobby">
      <div className="spectator-lobby__container">
        <header className="spectator-lobby__header">
          <h1 className="spectator-lobby__title">AI Battle Configuration</h1>
          <p className="spectator-lobby__subtitle">
            Configure 4 AI players and watch them compete!
          </p>
        </header>

        {/* AI Players Configuration */}
        <section className="spectator-lobby__section">
          <h2 className="spectator-lobby__section-title">AI Players</h2>
          <div className="spectator-lobby__players">
            {aiPlayers.map((player, index) => {
              const colorStyle = getColorStyle(player.color)
              const diffInfo = getDifficultyInfo(player.difficulty)

              return (
                <div
                  key={index}
                  className="spectator-lobby__player-card"
                  style={{
                    backgroundColor: colorStyle.bg,
                    borderColor: colorStyle.border
                  }}
                >
                  <div className="spectator-lobby__player-number">
                    Player {index + 1}
                  </div>

                  <input
                    type="text"
                    className="spectator-lobby__player-name-input"
                    value={player.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    maxLength={16}
                    placeholder="AI Name"
                    style={{ borderColor: colorStyle.border }}
                  />

                  <div className="spectator-lobby__difficulty-selector">
                    <button
                      className={`spectator-lobby__difficulty-btn ${player.difficulty === 'easy' ? 'spectator-lobby__difficulty-btn--active' : ''}`}
                      onClick={() => handleDifficultyChange(index, 'easy')}
                      title="Easy"
                    >
                      🌱
                    </button>
                    <button
                      className={`spectator-lobby__difficulty-btn ${player.difficulty === 'medium' ? 'spectator-lobby__difficulty-btn--active' : ''}`}
                      onClick={() => handleDifficultyChange(index, 'medium')}
                      title="Medium"
                    >
                      🌿
                    </button>
                    <button
                      className={`spectator-lobby__difficulty-btn ${player.difficulty === 'hard' ? 'spectator-lobby__difficulty-btn--active' : ''}`}
                      onClick={() => handleDifficultyChange(index, 'hard')}
                      title="Hard"
                    >
                      🔥
                    </button>
                  </div>

                  <div
                    className="spectator-lobby__difficulty-label"
                    style={{ color: diffInfo.color }}
                  >
                    {diffInfo.label}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Game Speed */}
        <section className="spectator-lobby__section">
          <h2 className="spectator-lobby__section-title">Game Speed</h2>
          <div className="spectator-lobby__speed-selector">
            {Object.entries(GAME_SPEED).map(([key, value]) => {
              const speedInfo = getSpeedInfo(value)
              const isActive = gameSpeed === value

              return (
                <button
                  key={key}
                  className={`spectator-lobby__speed-btn ${isActive ? 'spectator-lobby__speed-btn--active' : ''}`}
                  onClick={() => setGameSpeed(value)}
                >
                  <span className="spectator-lobby__speed-emoji">{speedInfo.emoji}</span>
                  <span className="spectator-lobby__speed-label">{speedInfo.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Options */}
        <section className="spectator-lobby__section">
          <h2 className="spectator-lobby__section-title">Options</h2>
          <div className="spectator-lobby__options">
            <label className="spectator-lobby__option">
              <input
                type="checkbox"
                checked={showAllHands}
                onChange={(e) => setShowAllHands(e.target.checked)}
              />
              <span className="spectator-lobby__option-text">
                Show all AI hands (reveal cards)
              </span>
            </label>

            <label className="spectator-lobby__option">
              <input
                type="checkbox"
                checked={showAIThinking}
                onChange={(e) => setShowAIThinking(e.target.checked)}
              />
              <span className="spectator-lobby__option-text">
                Show AI thinking (decision logs)
              </span>
            </label>
          </div>
        </section>

        {/* Error display */}
        {error && (
          <div className="spectator-lobby__error">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="spectator-lobby__actions">
          <Button
            variant="primary"
            size="large"
            onClick={handleStartBattle}
            disabled={loading}
            className="spectator-lobby__start-btn"
          >
            {loading ? 'Starting...' : '🎬 Start AI Battle'}
          </Button>

          <Button
            variant="secondary"
            size="medium"
            onClick={handleGoBack}
            disabled={loading}
          >
            Back to Home
          </Button>
        </div>

        {/* Info footer */}
        <footer className="spectator-lobby__footer">
          <p className="spectator-lobby__info">
            4 AI players will compete automatically.
            <br />
            You can adjust speed, pause, and restart at any time.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default SpectatorLobby
