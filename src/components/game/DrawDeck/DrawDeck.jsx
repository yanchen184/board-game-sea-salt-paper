import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import Card from '../../common/Card/Card'
import CardDrawEffect from '../CardDrawEffect/CardDrawEffect'
import './DrawDeck.css'

/**
 * DrawDeck Component
 *
 * Displays the draw deck with card count and premium draw effects.
 * Handles click to draw card with cinematic animation.
 *
 * @param {number} cardCount - Number of cards remaining in deck
 * @param {Function} onDrawClick - Callback when deck is clicked
 * @param {boolean} canDraw - Whether player can draw from deck
 * @param {boolean} isDrawing - Whether draw animation is in progress (controlled by parent)
 * @param {Object} drawnCard - The card that was drawn (for effect display)
 * @param {Function} onDrawEffectComplete - Callback when draw effect finishes
 * @param {string} className - Additional CSS classes
 */
function DrawDeck({
  cardCount = 0,
  onDrawClick,
  canDraw = false,
  isDrawing = false,
  drawnCard = null,
  onDrawEffectComplete,
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false)
  const deckRef = useRef(null)

  // 當 isDrawing 和 drawnCard 同時存在時，顯示特效
  const showEffect = isDrawing && !!drawnCard

  // Debug log for effect state
  useEffect(() => {
    console.log('[DrawDeck] Effect state:', { isDrawing, drawnCard: drawnCard?.name, showEffect })
  }, [isDrawing, drawnCard, showEffect])

  /**
   * Calculate the number of depth layers to display based on card count
   * Each layer represents approximately 10 cards, max 6 layers
   */
  const depthLayers = useMemo(() => {
    if (cardCount === 0) return 0
    // Minimum 1 layer, max 6 layers, 1 layer per 10 cards
    return Math.min(Math.ceil(cardCount / 10), 6)
  }, [cardCount])

  /**
   * Placeholder card data for displaying card backs
   * Uses a neutral design that matches the Card component's face-down style
   */
  const placeholderCard = {
    id: 'deck-placeholder',
    name: 'Card Back',
    emoji: '🌊',
    color: 'blue',
    value: 0
  }

  /**
   * Determine card rarity for effect intensity
   * Special cards get legendary effects, multipliers get rare
   */
  const getCardRarity = (card) => {
    if (!card) return 'common'
    // Special cards (Mermaid, Collector, etc.) get legendary effects
    if (card.type === 'special' || card.name === 'Mermaid') return 'legendary'
    // Multipliers and high-value cards get rare effects
    if (card.type === 'multiplier' || card.value >= 4) return 'rare'
    return 'common'
  }

  /**
   * Handle deck click - triggers the draw action
   */
  const handleClick = useCallback(() => {
    console.log('[DrawDeck] Click detected:', { canDraw, isDrawing, cardCount, hasOnDrawClick: !!onDrawClick })

    if (!canDraw || isDrawing || cardCount === 0) {
      console.log('[DrawDeck] Click blocked:', { canDraw, isDrawing, cardCount })
      return
    }

    console.log('[DrawDeck] Triggering draw')
    onDrawClick?.()
  }, [canDraw, isDrawing, cardCount, onDrawClick])

  /**
   * Handle effect completion - called when animation finishes
   */
  const handleEffectComplete = useCallback(() => {
    console.log('[DrawDeck] Draw effect complete, calling parent callback')
    onDrawEffectComplete?.()
  }, [onDrawEffectComplete])

  /**
   * Handle keyboard interaction for accessibility
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick])

  // Empty deck state
  if (cardCount === 0) {
    return (
      <div className={`draw-deck draw-deck--empty ${className}`}>
        <div className="draw-deck__empty-message">
          <span className="draw-deck__empty-icon">~</span>
          <p className="draw-deck__empty-text">Deck Empty</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        ref={deckRef}
        className={`
          draw-deck
          ${canDraw ? 'draw-deck--can-draw' : ''}
          ${isDrawing ? 'draw-deck--drawing' : ''}
          ${isHovered ? 'draw-deck--hovered' : ''}
          ${showEffect ? 'draw-deck--effect-active' : ''}
          ${className}
        `}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={canDraw ? 0 : -1}
        aria-label={`Draw deck with ${cardCount} cards remaining`}
        aria-disabled={!canDraw || isDrawing}
      >
        {/* Card stack visual */}
        <div className="draw-deck__stack">
          {/* Ambient glow when can draw */}
          {canDraw && !isDrawing && (
            <div className="draw-deck__ambient-glow" />
          )}

          {/* Dynamic depth layers based on card count */}
          {Array.from({ length: depthLayers }).map((_, index) => {
            const layerIndex = depthLayers - index // Reverse order for proper stacking
            const isTopCard = index === depthLayers - 1

            return (
              <div
                key={`deck-layer-${index}`}
                className={`draw-deck__card-layer draw-deck__card-layer--${layerIndex}`}
                style={{
                  '--layer-index': index,
                  '--layer-offset': `${index * 3}px`,
                  '--layer-z': `${index * 2}px`,
                  zIndex: index + 1
                }}
              >
                <Card
                  cardData={placeholderCard}
                  faceDown={true}
                  disabled={true}
                  size="medium"
                  className={`draw-deck__card ${isTopCard ? 'draw-deck__card--top' : ''}`}
                  showTooltip={false}
                />
              </div>
            )
          })}

          {/* Shimmer effect overlay on top card */}
          {depthLayers > 0 && (
            <div className="draw-deck__shimmer" />
          )}
        </div>

        {/* Card count badge */}
        <div className="draw-deck__count-badge">
          <span className="draw-deck__count-number">{cardCount}</span>
        </div>

        {/* Hover prompt */}
        {canDraw && isHovered && !isDrawing && (
          <div className="draw-deck__prompt">
            <span>Click to draw</span>
          </div>
        )}
      </div>

      {/* Premium Card Draw Effect */}
      <CardDrawEffect
        cardData={drawnCard}
        isActive={showEffect}
        onComplete={handleEffectComplete}
        rarity={getCardRarity(drawnCard)}
        deckPosition={{ x: 50, y: 35 }}
        handPosition={{ x: 50, y: 85 }}
      />
    </>
  )
}

export default DrawDeck
