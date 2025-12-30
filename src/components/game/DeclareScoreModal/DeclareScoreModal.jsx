import PropTypes from 'prop-types'
import Modal from '../../common/Modal/Modal'
import Button from '../../common/Button/Button'
import './DeclareScoreModal.css'

/**
 * DeclareScoreModal Component
 *
 * Displays the declarer's score when they declare "Stop" or "Last Chance"
 * All players see this modal and can confirm to dismiss it
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {string} declareMode - 'stop' or 'last_chance'
 * @param {string} declarerName - Name of the player who declared
 * @param {Object} declarerScore - Score breakdown for the declarer
 * @param {boolean} isCurrentPlayer - Whether viewing player is the declarer
 * @param {Function} onConfirm - Callback when any player confirms
 */
function DeclareScoreModal({
  isOpen,
  declareMode,
  declarerName,
  declarerScore,
  isCurrentPlayer,
  onConfirm
}) {
  if (!declarerScore) return null

  const getDeclareTypeText = () => {
    if (declareMode === 'stop') return '到此為止 (Stop)'
    if (declareMode === 'last_chance') return '最後機會 (Last Chance)'
    return ''
  }

  const getDeclareIcon = () => {
    if (declareMode === 'stop') return '🛑'
    if (declareMode === 'last_chance') return '⏰'
    return '📢'
  }

  const getNextStepText = () => {
    if (declareMode === 'stop') {
      return '確認後將直接結算本回合分數'
    }
    return '確認後其他玩家各有一次回合機會'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="宣告分數"
      size="medium"
      showCloseButton={false}
    >
      <div className="declare-score">
        {/* Declare header */}
        <div className="declare-score__header">
          <div className="declare-score__icon">{getDeclareIcon()}</div>
          <div className="declare-score__type">{getDeclareTypeText()}</div>
          <div className="declare-score__declarer">
            {declarerName} 宣告了「{getDeclareTypeText()}」！
          </div>
        </div>

        {/* Score display */}
        <div className="declare-score__content">
          <h3 className="declare-score__title">
            {declarerName} 目前的分數
          </h3>

          <div className="declare-score__total">
            <span className="declare-score__total-label">總分</span>
            <span className="declare-score__total-value">{declarerScore.total || 0}</span>
          </div>

          {/* Score breakdown */}
          <div className="declare-score__breakdown">
            {declarerScore.base > 0 && (
              <div className="declare-score__breakdown-row">
                <span>基礎分數（手牌）</span>
                <span>+{declarerScore.base}</span>
              </div>
            )}
            {declarerScore.pairs > 0 && (
              <div className="declare-score__breakdown-row">
                <span>配對獎勵</span>
                <span>+{declarerScore.pairs}</span>
              </div>
            )}
            {declarerScore.multipliers > 0 && (
              <div className="declare-score__breakdown-row">
                <span>倍數獎勵</span>
                <span>+{declarerScore.multipliers}</span>
              </div>
            )}
            {declarerScore.mermaids > 0 && (
              <>
                {declarerScore.mermaidDetails && declarerScore.mermaidDetails.length > 0 ? (
                  declarerScore.mermaidDetails.map((detail, index) => (
                    <div key={index} className="declare-score__breakdown-row">
                      <span>美人魚分數 ({detail.colorName})</span>
                      <span>+{detail.score}</span>
                    </div>
                  ))
                ) : (
                  <div className="declare-score__breakdown-row">
                    <span>美人魚分數</span>
                    <span>+{declarerScore.mermaids}</span>
                  </div>
                )}
              </>
            )}
            {declarerScore.colorBonus > 0 && (
              <div className="declare-score__breakdown-row">
                <span>顏色獎勵</span>
                <span>+{declarerScore.colorBonus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Next step hint */}
        <div className="declare-score__hint">
          <p>{getNextStepText()}</p>
        </div>

        {/* Action button - all players can confirm */}
        <div className="declare-score__actions">
          <Button variant="primary" size="large" onClick={onConfirm}>
            {isCurrentPlayer ? '確認，繼續遊戲' : '知道了'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

DeclareScoreModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  declareMode: PropTypes.oneOf(['stop', 'last_chance']),
  declarerName: PropTypes.string,
  declarerScore: PropTypes.shape({
    base: PropTypes.number,
    pairs: PropTypes.number,
    multipliers: PropTypes.number,
    mermaids: PropTypes.number,
    colorBonus: PropTypes.number,
    total: PropTypes.number
  }),
  isCurrentPlayer: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired
}

export default DeclareScoreModal
