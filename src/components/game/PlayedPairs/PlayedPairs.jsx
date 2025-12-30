import { useState } from 'react'
import PropTypes from 'prop-types'
import './PlayedPairs.css'

/**
 * PlayedPairs Component
 *
 * Displays cards that have been paired and played by each player
 * Shows mini cards grouped in pairs with special effects
 *
 * @param {Object} props - Component props
 * @param {Array<Object>} props.pairs - Array of played pairs
 * @param {boolean} [props.isCompact=false] - Whether to show compact view (for opponents)
 * @param {boolean} [props.isCollapsible=false] - Whether the component is collapsible (mobile)
 * @param {boolean} [props.defaultCollapsed=false] - Initial collapsed state
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Function} [props.onPairClick] - Handler when a pair is clicked
 */
function PlayedPairs({
  pairs = [],
  isCompact = false,
  isCollapsible = false,
  defaultCollapsed = false,
  className = '',
  onPairClick
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  /**
   * Toggle collapsed state
   */
  const handleToggle = () => {
    if (isCollapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  /**
   * Handle pair click
   */
  const handlePairClick = (pair) => {
    if (onPairClick) {
      onPairClick(pair)
    }
  }

  /**
   * Render compact view for opponents
   */
  const renderCompactView = () => {
    if (pairs.length === 0) {
      return <span className="played-pairs__compact-empty">None</span>
    }

    return (
      <div className="played-pairs__compact">
        <span className="played-pairs__compact-label">Played:</span>
        <div className="played-pairs__compact-list">
          {pairs.map((pair, index) => (
            <span key={pair.id || index} className="played-pairs__compact-pair">
              {pair.cards.map(card => card.emoji).join('')}
            </span>
          ))}
        </div>
      </div>
    )
  }

  /**
   * Render mini card
   */
  const renderMiniCard = (card) => {
    const cardClass = [
      'played-pair__card',
      `played-pair__card--${card.color}`
    ].join(' ')

    return (
      <div className={cardClass} key={card.id}>
        <div className="played-pair__card-emoji">{card.emoji}</div>
        <div className="played-pair__card-value">{card.value}</div>
      </div>
    )
  }

  /**
   * Render full view for player's pairs
   */
  const renderFullView = () => {
    if (pairs.length === 0) {
      return (
        <div className="played-pairs__empty">
          No pairs played yet
        </div>
      )
    }

    return (
      <div className="played-pairs__container">
        {pairs.map((pair, index) => {
          const pairClass = [
            'played-pair',
            pair.hasEffect && 'played-pair--with-effect'
          ].filter(Boolean).join(' ')

          return (
            <div
              key={pair.id || index}
              className={pairClass}
              onClick={() => handlePairClick(pair)}
              role="button"
              tabIndex={onPairClick ? 0 : -1}
              aria-label={`Pair of ${pair.cards[0].name}`}
            >
              {pair.cards.map(card => renderMiniCard(card))}
              {pair.hasEffect && (
                <div className="played-pair__effect">
                  {pair.effectText || '+'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Build component classes
  const componentClass = [
    'played-pairs',
    isCompact && 'played-pairs--compact',
    isCollapsible && 'played-pairs--collapsible',
    isCollapsed && 'played-pairs--collapsed',
    className
  ].filter(Boolean).join(' ')

  // Compact view for opponents
  if (isCompact) {
    return <div className={componentClass}>{renderCompactView()}</div>
  }

  // Full view for player
  return (
    <div className={componentClass}>
      <div
        className="played-pairs__header"
        onClick={handleToggle}
        role={isCollapsible ? 'button' : undefined}
        tabIndex={isCollapsible ? 0 : undefined}
        aria-expanded={isCollapsible ? !isCollapsed : undefined}
      >
        <span className="played-pairs__label">YOUR PLAYED PAIRS</span>
        {isCollapsible && (
          <span className="played-pairs__toggle-icon">
            {isCollapsed ? '▶' : '▼'}
          </span>
        )}
      </div>
      {(!isCollapsible || !isCollapsed) && renderFullView()}
    </div>
  )
}

// PropTypes validation
PlayedPairs.propTypes = {
  pairs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    cards: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      emoji: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })).isRequired,
    hasEffect: PropTypes.bool,
    effectText: PropTypes.string
  })),
  isCompact: PropTypes.bool,
  isCollapsible: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  className: PropTypes.string,
  onPairClick: PropTypes.func
}

export default PlayedPairs