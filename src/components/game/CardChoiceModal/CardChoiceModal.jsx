import { useState, useEffect } from 'react'
import Card from '../../common/Card/Card'
import Button from '../../common/Button/Button'
import './CardChoiceModal.css'

/**
 * CardChoiceModal Component
 *
 * Shows 2 drawn cards and lets player choose 1 to keep,
 * the other goes to a discard pile
 *
 * RULE: If one discard pile is empty, player MUST discard to the empty pile
 *
 * @param {Array} cards - Two cards to choose from
 * @param {Function} onChoice - Callback when choice is made (card, discardSide)
 * @param {boolean} isOpen - Whether modal is open
 * @param {number} leftPileCount - Number of cards in left discard pile
 * @param {number} rightPileCount - Number of cards in right discard pile
 */
function CardChoiceModal({ cards, onChoice, isOpen, leftPileCount = 0, rightPileCount = 0 }) {
  const [selectedCard, setSelectedCard] = useState(null)
  const [discardSide, setDiscardSide] = useState('left')

  // Determine if either pile is empty (force discard to empty pile)
  const leftEmpty = leftPileCount === 0
  const rightEmpty = rightPileCount === 0
  const hasEmptyPile = leftEmpty || rightEmpty
  const forcedSide = leftEmpty ? 'left' : rightEmpty ? 'right' : null

  // Auto-select empty pile if one exists
  useEffect(() => {
    if (forcedSide) {
      setDiscardSide(forcedSide)
    }
  }, [forcedSide])

  if (!isOpen || !cards || cards.length !== 2) {
    return null
  }

  const handleConfirm = () => {
    if (!selectedCard) return
    // If there's a forced side, use it; otherwise use selected side
    const finalDiscardSide = forcedSide || discardSide
    onChoice(selectedCard, finalDiscardSide)
    setSelectedCard(null)
  }

  const otherCard = cards.find(c => c.id !== selectedCard?.id)

  return (
    <div className="card-choice-modal">
      <div className="card-choice-modal__overlay" />
      <div className="card-choice-modal__content">
        <h2 className="card-choice-modal__title">選擇保留的牌</h2>
        <p className="card-choice-modal__subtitle">
          另一張牌將被棄置
        </p>

        <div className="card-choice-modal__cards">
          {cards.map(card => (
            <div
              key={card.id}
              className={`card-choice-modal__card ${
                selectedCard?.id === card.id ? 'card-choice-modal__card--selected' : ''
              }`}
              onClick={() => setSelectedCard(card)}
            >
              <Card
                cardData={card}
                size="large"
                selected={selectedCard?.id === card.id}
              />
              <div className="card-choice-modal__card-label">
                {selectedCard?.id === card.id ? '✓ 保留此牌' : '點擊選擇'}
              </div>
            </div>
          ))}
        </div>

        {selectedCard && (
          <div className="card-choice-modal__discard-choice">
            <p className="card-choice-modal__discard-label">
              將 <strong>{otherCard?.name}</strong> 棄置到：
            </p>

            {/* Warning message when forced to empty pile */}
            {hasEmptyPile && (
              <div className="card-choice-modal__force-warning">
                ⚠️ 有空的棄牌堆，必須棄到空的那一邊
              </div>
            )}

            <div className="card-choice-modal__discard-buttons">
              <button
                className={`card-choice-modal__discard-btn ${
                  discardSide === 'left' ? 'card-choice-modal__discard-btn--active' : ''
                } ${!leftEmpty && forcedSide === 'right' ? 'card-choice-modal__discard-btn--disabled' : ''}
                ${leftEmpty ? 'card-choice-modal__discard-btn--forced' : ''}`}
                onClick={() => !forcedSide || forcedSide === 'left' ? setDiscardSide('left') : null}
                disabled={forcedSide === 'right'}
              >
                ← 左側棄牌堆
                {leftEmpty && <span className="card-choice-modal__pile-status">（空）</span>}
                {!leftEmpty && <span className="card-choice-modal__pile-count">({leftPileCount}張)</span>}
              </button>
              <button
                className={`card-choice-modal__discard-btn ${
                  discardSide === 'right' ? 'card-choice-modal__discard-btn--active' : ''
                } ${!rightEmpty && forcedSide === 'left' ? 'card-choice-modal__discard-btn--disabled' : ''}
                ${rightEmpty ? 'card-choice-modal__discard-btn--forced' : ''}`}
                onClick={() => !forcedSide || forcedSide === 'right' ? setDiscardSide('right') : null}
                disabled={forcedSide === 'left'}
              >
                右側棄牌堆 →
                {rightEmpty && <span className="card-choice-modal__pile-status">（空）</span>}
                {!rightEmpty && <span className="card-choice-modal__pile-count">({rightPileCount}張)</span>}
              </button>
            </div>
          </div>
        )}

        <div className="card-choice-modal__actions">
          <Button
            variant="primary"
            size="large"
            onClick={handleConfirm}
            disabled={!selectedCard}
          >
            確認選擇
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CardChoiceModal
