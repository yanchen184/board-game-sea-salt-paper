import Card from '../../common/Card/Card'
import './OpponentArea.css'

/**
 * OpponentArea Component
 *
 * Displays opponent player information:
 * - Player name and status
 * - Card count in hand (face-down cards)
 * - Played pairs (face-up cards)
 * - Score
 *
 * @param {Object} player - Player object
 * @param {string} player.id - Player ID
 * @param {string} player.name - Player name
 * @param {number} player.handCount - Number of cards in hand
 * @param {Array} player.playedPairs - Array of played pair objects
 * @param {number} player.score - Player score
 * @param {boolean} player.connected - Connection status
 * @param {boolean} player.isAI - Whether player is AI
 * @param {boolean} isCurrentTurn - Whether it's this player's turn
 * @param {string} className - Additional CSS classes
 */
function OpponentArea({
  player,
  isCurrentTurn = false,
  className = ''
}) {
  if (!player) {
    return null
  }

  const {
    name = 'Unknown',
    handCount = 0,
    playedPairs = [],
    score = 0,
    connected = true,
    isAI = false
  } = player

  return (
    <div
      className={`
        opponent-area
        ${isCurrentTurn ? 'opponent-area--active' : ''}
        ${!connected ? 'opponent-area--disconnected' : ''}
        ${className}
      `}
    >
      {/* Player info header */}
      <div className="opponent-area__header">
        <div className="opponent-area__info">
          <h3 className="opponent-area__name">
            {name}
            {isAI && <span className="opponent-area__ai-badge">🤖</span>}
          </h3>

          <div className="opponent-area__status">
            <span className="opponent-area__score">
              Score: <strong>{score}</strong>
            </span>

            {!connected && (
              <span className="opponent-area__disconnected-badge">
                Disconnected
              </span>
            )}
          </div>
        </div>

        {isCurrentTurn && (
          <div className="opponent-area__turn-indicator">
            <span className="opponent-area__turn-icon">▶</span>
            <span className="opponent-area__turn-text">Turn</span>
          </div>
        )}
      </div>

      {/* Hand cards (face-down) */}
      <div className="opponent-area__hand">
        <div className="opponent-area__hand-label">
          Hand ({handCount})
        </div>
        <div className="opponent-area__hand-cards">
          {Array.from({ length: Math.min(handCount, 10) }).map((_, index) => (
            <div
              key={index}
              className="opponent-area__hand-card"
              style={{ '--card-index': index }}
            >
              <Card
                cardData={{ id: `back-${index}`, name: 'Card Back' }}
                faceDown={true}
                disabled={true}
                size="small"
              />
            </div>
          ))}
          {handCount > 10 && (
            <div className="opponent-area__hand-overflow">
              +{handCount - 10}
            </div>
          )}
        </div>
      </div>

      {/* Played pairs */}
      {playedPairs.length > 0 && (
        <div className="opponent-area__played-pairs">
          <div className="opponent-area__played-label">
            Played Pairs ({playedPairs.length})
          </div>
          <div className="opponent-area__pairs-list">
            {playedPairs.map((pair, pairIndex) => (
              <div key={pairIndex} className="opponent-area__pair">
                {pair.cards && pair.cards.map((card, cardIndex) => (
                  <div
                    key={card.id}
                    className="opponent-area__pair-card"
                    style={{ '--card-index': cardIndex }}
                  >
                    <Card
                      cardData={card}
                      faceDown={false}
                      disabled={true}
                      size="small"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default OpponentArea
