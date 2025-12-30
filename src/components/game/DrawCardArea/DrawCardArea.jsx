import { useState, useCallback } from 'react'
import Card from '../../common/Card/Card'
import './DrawCardArea.css'

/**
 * DrawCardArea Component
 *
 * Displays two drawn cards next to the deck
 * Players drag one card to a discard pile to choose which to keep
 *
 * @param {Array} cards - Two cards drawn from deck
 * @param {Function} onCardDragged - Callback when card drag starts (cardId)
 * @param {Function} onCardDragEnd - Callback when card drag ends
 * @param {boolean} isVisible - Whether area is visible
 * @param {boolean} showFaceDown - Whether to show cards face down (for other players)
 * @param {string} emptyPileSide - Which pile is empty and must be used ('left', 'right', or null)
 * @param {string} choosingPlayerName - Name of the player choosing cards
 * @param {string} className - Additional CSS classes
 */
function DrawCardArea({
  cards = [],
  onCardDragged,
  onCardDragEnd,
  isVisible = false,
  showFaceDown = false,
  emptyPileSide = null,
  choosingPlayerName = '玩家',
  className = ''
}) {
  const [draggedCardId, setDraggedCardId] = useState(null)

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((card, event) => {
    if (!event || !event.dataTransfer) {
      console.error('[DrawCardArea] Invalid drag event:', event)
      return
    }
    setDraggedCardId(card.id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('cardId', card.id)
    event.dataTransfer.setData('source', 'drawArea')
    onCardDragged?.(card.id)
  }, [onCardDragged])

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    setDraggedCardId(null)
    onCardDragEnd?.()
  }, [onCardDragEnd])

  if (!isVisible) {
    return null
  }

  // For face down view (other players), create placeholder cards
  const displayCards = showFaceDown
    ? [{ id: 'hidden-1' }, { id: 'hidden-2' }]
    : cards

  if (!displayCards || displayCards.length !== 2) {
    return null
  }

  // Get instruction text based on state
  const getInstructionText = () => {
    if (showFaceDown) {
      return `${choosingPlayerName}正在選擇卡片...`
    }
    if (emptyPileSide) {
      const pileName = emptyPileSide === 'left' ? '左側' : '右側'
      return `⚠️ ${pileName}棄牌堆是空的，必須棄到那邊！`
    }
    return '拖動一張卡片到棄牌堆'
  }

  return (
    <div className={`draw-card-area ${emptyPileSide ? 'draw-card-area--has-empty-pile' : ''} ${className}`}>
      <div className={`draw-card-area__instruction ${emptyPileSide ? 'draw-card-area__instruction--warning' : ''}`}>
        {getInstructionText()}
      </div>

      <div className="draw-card-area__cards">
        {displayCards.map((card, index) => {
          const isDragging = draggedCardId === card.id
          const cardData = showFaceDown
            ? { id: card.id, name: 'Hidden', emoji: '🌊', color: 'blue', value: 0 }
            : card

          return (
            <div
              key={card.id}
              className={`
                draw-card-area__card-wrapper
                ${isDragging ? 'draw-card-area__card-wrapper--dragging' : ''}
              `}
            >
              <Card
                cardData={cardData}
                size="medium"
                faceDown={showFaceDown}
                draggable={!showFaceDown}
                onDragStart={!showFaceDown ? (e) => handleDragStart(card, e) : undefined}
                onDragEnd={!showFaceDown ? handleDragEnd : undefined}
                className="draw-card-area__card"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DrawCardArea
