import Card from '../../common/Card/Card'
import './PublicPairsArea.css'

/**
 * PublicPairsArea Component
 *
 * Displays all players' played pairs in a public area
 * Visible to all players for strategic awareness
 *
 * @param {Array} players - Array of player objects with playedPairs
 * @param {string} currentPlayerId - Current player's ID (to highlight)
 * @param {string} className - Additional CSS classes
 */
function PublicPairsArea({
  players = [],
  currentPlayerId = '',
  className = ''
}) {
  // Filter players with played pairs
  const playersWithPairs = players.filter(p => p.playedPairs && p.playedPairs.length > 0)

  if (playersWithPairs.length === 0) {
    return null
  }

  return (
    <div className={`public-pairs-area ${className}`}>
      <div className="public-pairs-area__header">
        <span className="public-pairs-area__title">已打出的對子</span>
      </div>

      <div className="public-pairs-area__content">
        {playersWithPairs.map(player => (
          <div
            key={player.id}
            className={`public-pairs-area__player ${player.id === currentPlayerId ? 'public-pairs-area__player--current' : ''}`}
          >
            <div className="public-pairs-area__player-name">
              {player.name}
              {player.isAI && <span className="public-pairs-area__ai-badge">AI</span>}
            </div>

            <div className="public-pairs-area__pairs">
              {player.playedPairs.map((pair, pairIndex) => (
                <div key={pairIndex} className="public-pairs-area__pair">
                  {pair.cards && pair.cards.map((card, cardIndex) => (
                    <div key={card.id || cardIndex} className="public-pairs-area__card-wrapper">
                      <Card
                        cardData={card}
                        size="small"
                        disabled={true}
                        showRuleHint={false}
                        showTooltip={true}
                        className="public-pairs-area__card"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="public-pairs-area__count">
              {player.playedPairs.length} 對
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PublicPairsArea
