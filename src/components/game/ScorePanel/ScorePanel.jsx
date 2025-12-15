import { useState } from 'react'
import Modal from '../../common/Modal/Modal'
import Button from '../../common/Button/Button'
import './ScorePanel.css'

/**
 * ScorePanel Component
 *
 * Displays player's current score with breakdown
 * Shows declare buttons (Stop / Last Chance)
 * Opens modal with detailed score breakdown
 *
 * @param {Object} scoreBreakdown - Score breakdown object
 * @param {number} scoreBreakdown.base - Base card score
 * @param {number} scoreBreakdown.pairs - Pair bonus score
 * @param {number} scoreBreakdown.multipliers - Multiplier bonus score
 * @param {number} scoreBreakdown.mermaids - Mermaid score
 * @param {number} scoreBreakdown.colorBonus - Color bonus
 * @param {number} scoreBreakdown.total - Total score
 * @param {number} targetScore - Target score to win
 * @param {boolean} canDeclare - Whether player can declare
 * @param {Function} onDeclareStop - Callback for Stop declaration
 * @param {Function} onDeclareLastChance - Callback for Last Chance
 * @param {Function} onSkipDeclare - Callback for skipping declaration
 * @param {boolean} isDeclarePhase - Whether in declare phase
 * @param {string} className - Additional CSS classes
 */
function ScorePanel({
  scoreBreakdown = { total: 0 },
  targetScore = 30,
  canDeclare = false,
  onDeclareStop,
  onDeclareLastChance,
  onSkipDeclare,
  isDeclarePhase = false,
  className = ''
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    base = 0,
    baseDetails = { cardValues: 0, collectionDetails: [] },
    pairs = 0,
    multipliers = 0,
    multiplierDetails = {},
    mermaids = 0,
    mermaidDetails = [],
    colorBonus = 0,
    total = 0
  } = scoreBreakdown

  const { cardValues = 0, collectionDetails = [] } = baseDetails

  const progressPercent = Math.min((total / targetScore) * 100, 100)

  /**
   * Handle declare Stop
   */
  const handleDeclareStop = () => {
    onDeclareStop?.()
  }

  /**
   * Handle declare Last Chance
   */
  const handleDeclareLastChance = () => {
    onDeclareLastChance?.()
  }

  /**
   * Handle skip declaration
   */
  const handleSkipDeclare = () => {
    onSkipDeclare?.()
  }

  return (
    <>
      <div className={`score-panel ${className}`}>
        {/* Score display */}
        <div className="score-panel__display">
          <div className="score-panel__current">
            <span className="score-panel__label">Score:</span>
            <span className="score-panel__value">{total}</span>
          </div>
          <div className="score-panel__target">
            / {targetScore}
          </div>
        </div>

        {/* Progress bar */}
        <div className="score-panel__progress">
          <div
            className="score-panel__progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Score breakdown summary (簡要分數來源) */}
        <div className="score-panel__summary">
          {base > 0 && (
            <div className="score-panel__summary-item">
              <span className="score-panel__summary-label">基礎</span>
              <span className="score-panel__summary-value">{base}</span>
            </div>
          )}
          {pairs > 0 && (
            <div className="score-panel__summary-item">
              <span className="score-panel__summary-label">配對</span>
              <span className="score-panel__summary-value">{pairs}</span>
            </div>
          )}
          {multipliers > 0 && (
            <div className="score-panel__summary-item">
              <span className="score-panel__summary-label">倍數</span>
              <span className="score-panel__summary-value">{multipliers}</span>
            </div>
          )}
          {mermaids > 0 && (
            <div className="score-panel__summary-item">
              <span className="score-panel__summary-label">🧜美人魚</span>
              <span className="score-panel__summary-value">{mermaids}</span>
            </div>
          )}
          {colorBonus > 0 && (
            <div className="score-panel__summary-item">
              <span className="score-panel__summary-label">🎨顏色</span>
              <span className="score-panel__summary-value">{colorBonus}</span>
            </div>
          )}
        </div>

        {/* Breakdown button */}
        <button
          className="score-panel__breakdown-btn"
          onClick={() => setIsModalOpen(true)}
          aria-label="查看分數明細"
        >
          查看明細
        </button>

        {/* Declare buttons */}
        {canDeclare && isDeclarePhase && (
          <div className="score-panel__declare">
            <p className="score-panel__declare-hint">
              你可以宣告結束回合！
            </p>
            <div className="score-panel__declare-buttons">
              <Button
                variant="primary"
                size="small"
                onClick={handleDeclareStop}
                className="score-panel__declare-btn"
              >
                到此為止 (Stop)
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={handleDeclareLastChance}
                className="score-panel__declare-btn"
              >
                最後機會 (Last Chance)
              </Button>
              <Button
                variant="tertiary"
                size="small"
                onClick={handleSkipDeclare}
                className="score-panel__declare-btn"
              >
                不宣告
              </Button>
            </div>
          </div>
        )}

        {/* Declare phase indicator */}
        {!canDeclare && isDeclarePhase && (
          <div className="score-panel__cannot-declare">
            <p className="score-panel__cannot-declare-text">
              需要 7 分以上才能宣告
            </p>
            <Button
              variant="tertiary"
              size="small"
              onClick={handleSkipDeclare}
              className="score-panel__skip-btn"
            >
              跳過宣告
            </Button>
          </div>
        )}
      </div>

      {/* Score breakdown modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="分數明細"
        size="medium"
      >
        <div className="score-breakdown">
          {/* Base score */}
          <div className="score-breakdown__row">
            <span className="score-breakdown__label">
              基礎分數
            </span>
            <span className="score-breakdown__value">{base}</span>
          </div>

          {/* Card values detail */}
          {cardValues > 0 && (
            <div className="score-breakdown__row score-breakdown__row--indent">
              <span className="score-breakdown__label">
                📋 卡片數值總和
              </span>
              <span className="score-breakdown__value">+{cardValues}</span>
            </div>
          )}

          {/* Collection card details */}
          {collectionDetails.length > 0 && collectionDetails.map((item, index) => (
            <div key={index} className="score-breakdown__row score-breakdown__row--indent">
              <span className="score-breakdown__label">
                {item.emoji} {item.name} ({item.rule})
              </span>
              <span className="score-breakdown__value">+{item.score}</span>
            </div>
          ))}

          {/* Pair bonus */}
          {pairs > 0 && (
            <div className="score-breakdown__row">
              <span className="score-breakdown__label">
                配對獎勵
              </span>
              <span className="score-breakdown__value">{pairs}</span>
            </div>
          )}

          {/* Multipliers */}
          {multipliers > 0 && (
            <>
              <div className="score-breakdown__section-title">
                倍數獎勵
              </div>

              {multiplierDetails.octopus > 0 && (
                <div className="score-breakdown__row score-breakdown__row--indent">
                  <span className="score-breakdown__label">
                    🐙 章魚 (貝殼 ×2)
                  </span>
                  <span className="score-breakdown__value">
                    +{multiplierDetails.octopus}
                  </span>
                </div>
              )}

              {multiplierDetails.lighthouse > 0 && (
                <div className="score-breakdown__row score-breakdown__row--indent">
                  <span className="score-breakdown__label">
                    🏠 燈塔 (+1/帆船)
                  </span>
                  <span className="score-breakdown__value">
                    +{multiplierDetails.lighthouse}
                  </span>
                </div>
              )}

              {multiplierDetails.fishSchool > 0 && (
                <div className="score-breakdown__row score-breakdown__row--indent">
                  <span className="score-breakdown__label">
                    🐟 魚群 (+1/魚)
                  </span>
                  <span className="score-breakdown__value">
                    +{multiplierDetails.fishSchool}
                  </span>
                </div>
              )}

              {multiplierDetails.penguinColony > 0 && (
                <div className="score-breakdown__row score-breakdown__row--indent">
                  <span className="score-breakdown__label">
                    🐧 企鵝部落 (+2/企鵝)
                  </span>
                  <span className="score-breakdown__value">
                    +{multiplierDetails.penguinColony}
                  </span>
                </div>
              )}

              {multiplierDetails.captain > 0 && (
                <div className="score-breakdown__row score-breakdown__row--indent">
                  <span className="score-breakdown__label">
                    👨‍✈️ 船長 (+3/水手)
                  </span>
                  <span className="score-breakdown__value">
                    +{multiplierDetails.captain}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Mermaids */}
          {mermaids > 0 && (
            <>
              {mermaidDetails.length > 0 ? (
                // 顯示每隻美人魚的詳細分數
                mermaidDetails.map((detail, index) => (
                  <div key={index} className="score-breakdown__row">
                    <span className="score-breakdown__label">
                      🧜 美人魚分數 ({detail.colorName})
                    </span>
                    <span className="score-breakdown__value">{detail.score}</span>
                  </div>
                ))
              ) : (
                // 備用顯示（如果沒有詳細資料）
                <div className="score-breakdown__row">
                  <span className="score-breakdown__label">
                    🧜 美人魚分數
                  </span>
                  <span className="score-breakdown__value">{mermaids}</span>
                </div>
              )}
            </>
          )}

          {/* Color bonus */}
          {colorBonus > 0 && (
            <div className="score-breakdown__row">
              <span className="score-breakdown__label">
                顏色獎勵
              </span>
              <span className="score-breakdown__value">{colorBonus}</span>
            </div>
          )}

          {/* Total */}
          <div className="score-breakdown__total">
            <span className="score-breakdown__total-label">總分</span>
            <span className="score-breakdown__total-value">{total}</span>
          </div>

          {/* Progress to target */}
          <div className="score-breakdown__progress">
            <div className="score-breakdown__progress-label">
              目標分數進度 {targetScore}
            </div>
            <div className="score-breakdown__progress-bar-container">
              <div
                className="score-breakdown__progress-bar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="score-breakdown__progress-text">
              {total} / {targetScore} ({Math.round(progressPercent)}%)
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ScorePanel
