import { useState, useCallback, useMemo } from 'react'
import Card from '../../common/Card/Card'
import { isValidPair } from '../../../utils/cardHelpers'
import { calculateAllCardsActualScores } from '../../../utils/cardScoreHelpers'
import './PlayerHand.css'

/**
 * PlayerHand Component
 *
 * Displays player's hand in a fanned layout
 * Supports card selection and drag & drop
 *
 * @param {Array} cards - Array of card objects in hand
 * @param {Array} selectedCardIds - Array of selected card IDs
 * @param {Function} onCardSelect - Callback when card is selected
 * @param {Function} onCardDeselect - Callback when card is deselected
 * @param {boolean} canSelect - Whether cards can be selected
 * @param {boolean} canDrag - Whether cards can be dragged
 * @param {number} maxSelection - Maximum cards that can be selected
 * @param {string} className - Additional CSS classes
 */
function PlayerHand({
  cards = [],
  selectedCardIds = [],
  onCardSelect,
  onCardDeselect,
  canSelect = false,
  canDrag = false,
  maxSelection = 2,
  className = '',
  horizontal = false,
  playedPairs = []  // 已打出的對子，用於計算實際得分
}) {
  const [draggedCardId, setDraggedCardId] = useState(null)

  // Calculate actual scores for each card
  const cardScoresMap = useMemo(() => {
    return calculateAllCardsActualScores(cards, playedPairs)
  }, [cards, playedPairs])

  /**
   * Get the first selected card for pair validation
   */
  const firstSelectedCard = useMemo(() => {
    if (selectedCardIds.length === 0) return null
    return cards.find(c => c.id === selectedCardIds[0])
  }, [cards, selectedCardIds])

  /**
   * Check if a card can be selected based on pair validation
   */
  const canSelectCard = useCallback((card) => {
    if (!canSelect) return false

    // Already selected cards can always be deselected
    if (selectedCardIds.includes(card.id)) return true

    // If max selection reached, can't select more
    if (selectedCardIds.length >= maxSelection) return false

    // If no cards selected yet, can select any card
    if (selectedCardIds.length === 0) return true

    // If one card selected, check if this card can pair with it
    if (selectedCardIds.length === 1 && firstSelectedCard) {
      return isValidPair(firstSelectedCard, card)
    }

    return false
  }, [canSelect, selectedCardIds, maxSelection, firstSelectedCard])

  /**
   * Handle card click for selection
   */
  const handleCardClick = useCallback((card) => {
    if (!canSelect) return

    const isSelected = selectedCardIds.includes(card.id)

    if (isSelected) {
      onCardDeselect?.(card)
    } else {
      // Check if can select this card
      if (!canSelectCard(card)) {
        return
      }
      onCardSelect?.(card)
    }
  }, [canSelect, selectedCardIds, onCardSelect, onCardDeselect, canSelectCard])

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((card, event) => {
    if (!canDrag) {
      event.preventDefault()
      return
    }

    setDraggedCardId(card.id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('cardId', card.id)
  }, [canDrag])

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    setDraggedCardId(null)
  }, [])

  // Empty hand state
  if (!cards || cards.length === 0) {
    return (
      <div className={`player-hand player-hand--empty ${horizontal ? 'player-hand--horizontal' : ''} ${className}`}>
        <div className="player-hand__empty-message">
          <span className="player-hand__empty-icon">🌊</span>
          <p>No cards in hand</p>
        </div>
      </div>
    )
  }

  // Determine spacing mode based on card count
  // Increased thresholds to allow more cards before overlap
  const getSpacingClass = () => {
    if (cards.length <= 5) return 'player-hand--sparse'
    if (cards.length <= 8) return 'player-hand--normal'
    if (cards.length <= 10) return 'player-hand--compact'
    return 'player-hand--dense'
  }

  return (
    <div
      className={`player-hand ${horizontal ? 'player-hand--horizontal' : ''} ${getSpacingClass()} ${className}`}
      data-card-count={cards.length}
    >
      <div className="player-hand__cards">
        {cards.map((card, index) => {
          const isSelected = selectedCardIds.includes(card.id)
          const isDragging = draggedCardId === card.id
          const cardCanBeSelected = canSelectCard(card)

          return (
            <div
              key={card.id}
              className={`player-hand__card-wrapper ${isDragging ? 'player-hand__card-wrapper--dragging' : ''}`}
              style={{
                '--card-index': index,
                '--total-cards': cards.length
              }}
            >
              <Card
                cardData={card}
                selected={isSelected}
                disabled={!cardCanBeSelected}
                enableLift={true}  // 啟用手牌拿起效果
                onClick={() => handleCardClick(card)}
                onDragStart={(e) => handleDragStart(card, e)}
                onDragEnd={handleDragEnd}
                className="player-hand__card"
                size="medium"
                actualScore={cardScoresMap.get(card.id)}  // 傳遞實際得分
              />
            </div>
          )
        })}
      </div>

      {/* Selection status */}
      {canSelect && selectedCardIds.length > 0 && (
        <div className="player-hand__selection-status">
          <span className="player-hand__selection-count">
            {selectedCardIds.length} / {maxSelection} selected
          </span>
        </div>
      )}
    </div>
  )
}

export default PlayerHand
