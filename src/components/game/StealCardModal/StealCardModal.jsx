import { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from '../../common/Modal/Modal'
import Button from '../../common/Button/Button'
import './StealCardModal.css'

/**
 * StealCardModal Component
 *
 * Modal for stealing a card from opponent
 * Player chooses an opponent, then sees their cards (face-down) and picks one
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {Array} opponents - Array of opponent player objects
 * @param {Function} onStealCard - Callback when card is stolen (playerId, cardIndex)
 * @param {Function} onClose - Callback when modal closes
 */
function StealCardModal({
  isOpen,
  opponents = [],
  onStealCard,
  onClose
}) {
  const [selectedOpponent, setSelectedOpponent] = useState(null)

  /**
   * Handle opponent selection
   */
  const handleSelectOpponent = (opponent) => {
    setSelectedOpponent(opponent)
  }

  /**
   * Handle card selection (by index, since we don't see the actual card)
   */
  const handleSelectCard = (cardIndex) => {
    if (!selectedOpponent) return

    onStealCard(selectedOpponent.id, cardIndex)
    setSelectedOpponent(null) // Reset for next time
  }

  /**
   * Handle back to opponent selection
   */
  const handleBack = () => {
    setSelectedOpponent(null)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedOpponent ? `從 ${selectedOpponent.name} 偷一張牌` : '選擇要偷牌的對手'}
      size="medium"
    >
      <div className="steal-card-modal">
        {!selectedOpponent ? (
          /* Step 1: Select opponent */
          <div className="steal-card-modal__opponents">
            <p className="steal-card-modal__instruction">
              選擇一位對手來偷取他的手牌
            </p>

            <div className="steal-card-modal__opponent-list">
              {opponents.map(opponent => (
                <button
                  key={opponent.id}
                  className="steal-card-modal__opponent-card"
                  onClick={() => handleSelectOpponent(opponent)}
                >
                  <div className="steal-card-modal__opponent-name">
                    {opponent.name}
                  </div>
                  <div className="steal-card-modal__opponent-hand-count">
                    手牌數量：{opponent.handCount || 0} 張
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Step 2: Select card from opponent's hand (face-down) */
          <div className="steal-card-modal__cards">
            <p className="steal-card-modal__instruction">
              選擇一張牌（你看不到對手的牌）
            </p>

            <div className="steal-card-modal__card-list">
              {Array.from({ length: selectedOpponent.handCount || 0 }).map((_, index) => (
                <button
                  key={index}
                  className="steal-card-modal__card-back"
                  onClick={() => handleSelectCard(index)}
                  aria-label={`選擇第 ${index + 1} 張牌`}
                >
                  <div className="steal-card-modal__card-number">
                    {index + 1}
                  </div>
                  <div className="steal-card-modal__card-icon">
                    🎴
                  </div>
                </button>
              ))}
            </div>

            <div className="steal-card-modal__actions">
              <Button
                variant="secondary"
                onClick={handleBack}
              >
                ← 返回選擇對手
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

StealCardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  opponents: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    handCount: PropTypes.number
  })),
  onStealCard: PropTypes.func.isRequired,
  onClose: PropTypes.func
}

export default StealCardModal
