import { useState } from 'react'
import EffectModal from '../EffectModal/EffectModal'
import Card from '../../common/Card/Card'
import './CrabEffectModal.css'

/**
 * CrabEffectModal Component
 *
 * Modal for Crab pair effect: Choose a card from either discard pile
 * IMPORTANT: Once a pile is expanded (viewed), the other pile becomes locked
 * and cannot be viewed. Player can only select from the pile they chose to view.
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {Array} leftPile - Cards in left discard pile
 * @param {Array} rightPile - Cards in right discard pile
 * @param {Function} onSelectCard - Callback when card is selected (cardIndex: number, side: 'left' or 'right')
 * @param {Function} onClose - Close callback
 */
function CrabEffectModal({
  isOpen = false,
  leftPile = [],
  rightPile = [],
  onSelectCard,
  onClose
}) {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [expandedPile, setExpandedPile] = useState(null)
  const [lockedPile, setLockedPile] = useState(null) // Once set, player can only pick from this pile
  const [isSelecting, setIsSelecting] = useState(false)

  const handleCardClick = async (cardIndex, side) => {
    if (isSelecting) return
    // Can only select from the locked pile
    if (lockedPile && lockedPile !== side) return

    setIsSelecting(true)

    try {
      await onSelectCard?.(cardIndex, side)
    } catch (error) {
      console.error('Failed to select card:', error)
      setIsSelecting(false)
    }
  }

  const handlePileClick = (side) => {
    // If already locked to the other pile, cannot switch
    if (lockedPile && lockedPile !== side) return

    if (expandedPile === side) {
      // Allow collapse but keep locked
      setExpandedPile(null)
    } else {
      // Expand and lock to this pile
      setExpandedPile(side)
      if (!lockedPile) {
        setLockedPile(side) // Lock to this pile once viewed
      }
    }
  }

  const renderPile = (pile, side) => {
    const sideLabel = side === 'left' ? '左側棄牌堆' : '右側棄牌堆'
    const isExpanded = expandedPile === side
    const isEmpty = pile.length === 0
    const isLocked = lockedPile && lockedPile !== side // This pile is locked out (other pile was chosen)
    const isChosen = lockedPile === side // This pile was chosen to view

    return (
      <div className={`crab-effect__pile ${isEmpty ? 'crab-effect__pile--empty' : ''} ${isExpanded ? 'crab-effect__pile--expanded' : ''} ${isLocked ? 'crab-effect__pile--locked' : ''} ${isChosen ? 'crab-effect__pile--chosen' : ''}`}>
        <div
          className={`crab-effect__pile-header ${isLocked ? 'crab-effect__pile-header--locked' : ''}`}
          onClick={() => !isEmpty && !isLocked && handlePileClick(side)}
          role="button"
          tabIndex={!isEmpty && !isLocked ? 0 : -1}
          aria-disabled={isLocked}
        >
          <div className="crab-effect__pile-label">{sideLabel}</div>
          <div className="crab-effect__pile-count">{pile.length} 張牌</div>
          {!isEmpty && !isLocked && (
            <div className="crab-effect__pile-expand-hint">
              {isExpanded ? '▼ 點擊收起' : '▶ 點擊展開'}
            </div>
          )}
          {isLocked && (
            <div className="crab-effect__pile-locked-hint">
              🔒 已鎖定
            </div>
          )}
        </div>

        {isEmpty ? (
          <div className="crab-effect__empty">
            <span className="crab-effect__empty-icon">🗑️</span>
            <span className="crab-effect__empty-text">空的</span>
          </div>
        ) : isLocked ? (
          <div className="crab-effect__locked-message">
            <span className="crab-effect__locked-icon">🔒</span>
            <span className="crab-effect__locked-text">你已選擇查看另一邊的牌堆</span>
            <span className="crab-effect__locked-subtext">無法查看此牌堆</span>
          </div>
        ) : isExpanded ? (
          <div className="crab-effect__cards-grid">
            {pile.map((card, index) => (
              <div
                key={`${side}-${index}`}
                className={`crab-effect__card-item ${hoveredCard === `${side}-${index}` ? 'crab-effect__card-item--hovered' : ''} ${isSelecting ? 'crab-effect__card-item--disabled' : ''}`}
                onClick={() => handleCardClick(index, side)}
                onMouseEnter={() => setHoveredCard(`${side}-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
                role="button"
                tabIndex={!isSelecting ? 0 : -1}
                aria-label={`選擇 ${card.name}`}
              >
                <Card
                  cardData={card}
                  size="small"
                  className="crab-effect__card"
                />
                <div className="crab-effect__card-info">
                  <span className="crab-effect__card-name">{card.name}</span>
                  <span className="crab-effect__card-value">{card.value} 分</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="crab-effect__card-preview" onClick={() => handlePileClick(side)}>
            <Card
              cardData={pile[pile.length - 1]}
              size="medium"
              className="crab-effect__card"
              faceDown={true}
            />
            <div className="crab-effect__pile-hint">點擊查看此牌堆（⚠️ 一旦查看將無法切換）</div>
          </div>
        )}
      </div>
    )
  }

  // Get description text based on current state
  const getDescription = () => {
    if (lockedPile) {
      const pileName = lockedPile === 'left' ? '左側' : '右側'
      return `你已選擇查看${pileName}棄牌堆，請從中選擇一張牌`
    }
    return '選擇一邊的棄牌堆查看（⚠️ 只能看一邊，看了就不能切換！）'
  }

  return (
    <EffectModal
      isOpen={isOpen}
      onClose={onClose}
      title="🦀 螃蟹效果啟動！"
      description={getDescription()}
      className="crab-effect-modal"
    >
      {/* Warning banner when not yet locked */}
      {!lockedPile && leftPile.length > 0 && rightPile.length > 0 && (
        <div className="crab-effect__warning">
          ⚠️ 注意：你只能查看其中一邊的棄牌堆，一旦選擇查看就無法切換到另一邊！
        </div>
      )}

      <div className="crab-effect__piles">
        {renderPile(leftPile, 'left')}
        {renderPile(rightPile, 'right')}
      </div>

      {/* Loading state */}
      {isSelecting && (
        <div className="crab-effect__loading">
          處理中...
        </div>
      )}

      {/* Both piles empty */}
      {leftPile.length === 0 && rightPile.length === 0 && (
        <div className="crab-effect__all-empty">
          兩個棄牌堆都是空的，效果跳過。
        </div>
      )}
    </EffectModal>
  )
}

export default CrabEffectModal
