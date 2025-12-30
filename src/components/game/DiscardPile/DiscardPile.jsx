import { useState, useCallback, useMemo } from 'react'
import Card from '../../common/Card/Card'
import './DiscardPile.css'

/**
 * DiscardPile Component
 *
 * Displays a discard pile with top card visible
 * Supports click to take card and drag & drop target
 *
 * @param {Array} cards - Array of cards in pile (last = top)
 * @param {Function} onTakeCard - Callback when top card is taken
 * @param {Function} onCardDropped - Callback when card is dropped on pile
 * @param {boolean} canTake - Whether player can take from this pile
 * @param {boolean} canDrop - Whether cards can be dropped here
 * @param {boolean} mustDrop - Whether player MUST drop to this pile (because it's empty)
 * @param {string} side - Which side pile this is ('left' or 'right')
 * @param {boolean} isTaking - Whether take animation is in progress
 * @param {string} className - Additional CSS classes
 */
function DiscardPile({
  cards = [],
  onTakeCard,
  onCardDropped,
  canTake = false,
  canDrop = false,
  mustDrop = false,
  side = 'left',
  isTaking = false,
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Get top card
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null

  /**
   * Calculate the number of depth layers to display based on card count
   * Each layer represents 1 card, max 5 layers (excluding top card)
   */
  const depthLayers = useMemo(() => {
    if (cards.length <= 1) return 0
    // Subtract 1 for the top card, each underlying card = 1 layer
    const underlyingCards = cards.length - 1
    return Math.min(underlyingCards, 5)
  }, [cards.length])

  /**
   * Placeholder card data for displaying card backs in depth layers
   */
  const placeholderCard = {
    id: 'discard-placeholder',
    name: 'Card Back',
    emoji: '🌊',
    color: 'blue',
    value: 0
  }

  /**
   * Handle pile click to take card
   */
  const handleClick = useCallback(() => {
    if (!canTake || isTaking || !topCard) return

    onTakeCard?.()
  }, [canTake, isTaking, topCard, onTakeCard])

  /**
   * Handle keyboard interaction
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick])

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((e) => {
    if (!canDrop) return

    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }, [canDrop])

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  /**
   * Handle drop
   */
  const handleDrop = useCallback((e) => {
    if (!canDrop) return

    e.preventDefault()
    setIsDragOver(false)

    const cardId = e.dataTransfer.getData('cardId')
    if (cardId) {
      onCardDropped?.(cardId, side)
    }
  }, [canDrop, side, onCardDropped])

  // Empty pile state
  if (!topCard) {
    return (
      <div
        className={`
          discard-pile
          discard-pile--empty
          discard-pile--${side}
          ${canDrop ? 'discard-pile--can-drop' : ''}
          ${mustDrop ? 'discard-pile--must-drop' : ''}
          ${isDragOver ? 'discard-pile--drag-over' : ''}
          ${className}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="discard-pile__empty-message">
          <span className="discard-pile__empty-icon">{mustDrop ? '⬇️' : '🗑️'}</span>
          <p className="discard-pile__empty-text">
            {side === 'left' ? '左側棄牌堆' : '右側棄牌堆'}
          </p>
          {mustDrop && (
            <p className="discard-pile__must-drop-hint">必須棄到這裡！</p>
          )}
          {canDrop && isDragOver && (
            <p className="discard-pile__drop-hint">放到這裡</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
        discard-pile
        discard-pile--${side}
        ${canTake ? 'discard-pile--can-take' : ''}
        ${canDrop ? 'discard-pile--can-drop' : ''}
        ${isTaking ? 'discard-pile--taking' : ''}
        ${isDragOver ? 'discard-pile--drag-over' : ''}
        ${isHovered ? 'discard-pile--hovered' : ''}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={canTake ? 0 : -1}
      aria-label={`${side} discard pile with ${cards.length} cards. Top card: ${topCard.name}`}
      aria-disabled={!canTake && !canDrop}
    >
      {/* Card stack visual */}
      <div className="discard-pile__stack">
        {/* Top card - render first so it's on top visually */}
        <div className={`discard-pile__top-card ${isTaking ? 'discard-pile__top-card--taking' : ''}`}>
          <Card
            cardData={topCard}
            faceDown={false}
            disabled={!canTake}
            className="discard-pile__card"
            size="medium"
          />
        </div>

        {/* Dynamic depth layers based on card count - render after so they appear behind */}
        {depthLayers > 0 && (
          <div className="discard-pile__depth-indicator">
            {Array.from({ length: depthLayers }).map((_, index) => {
              const layerIndex = index + 1 // Layer numbering for CSS classes

              return (
                <div
                  key={`discard-layer-${index}`}
                  className={`discard-pile__card-layer discard-pile__card-layer--${layerIndex}`}
                  style={{
                    '--layer-index': index,
                    '--layer-offset': `${(index + 1) * 2}px`,
                    '--layer-z': `${(index + 1) * -3}px`,
                    zIndex: -(index + 1)
                  }}
                >
                  <Card
                    cardData={placeholderCard}
                    faceDown={true}
                    disabled={true}
                    size="medium"
                    className="discard-pile__depth-card"
                    showTooltip={false}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Card count badge */}
      <div className="discard-pile__count-badge">
        <span className="discard-pile__count-number">{cards.length}</span>
      </div>

      {/* Hover prompt */}
      {canTake && isHovered && !isTaking && (
        <div className="discard-pile__prompt">
          <span>Click to take</span>
        </div>
      )}

      {/* Drop zone indicator */}
      {canDrop && isDragOver && (
        <div className="discard-pile__drop-indicator">
          <span className="discard-pile__drop-icon">↓</span>
          <span className="discard-pile__drop-text">Drop card</span>
        </div>
      )}
    </div>
  )
}

export default DiscardPile
