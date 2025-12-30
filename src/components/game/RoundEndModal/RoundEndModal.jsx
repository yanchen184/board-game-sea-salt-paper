import { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from '../../common/Modal/Modal'
import Button from '../../common/Button/Button'
import './RoundEndModal.css'

/**
 * RoundEndModal Component
 *
 * Displays the round end results including:
 * - Who declared and what type (Stop/Last Chance)
 * - Final scores for all players
 * - Who won the round
 * - Option to start next round or end game
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {Object} roundResults - Round results data
 * @param {Function} onNextRound - Callback to start next round
 * @param {Function} onEndGame - Callback to end game
 * @param {number} targetScore - Target score to win the game
 */
function RoundEndModal({
  isOpen,
  roundResults,
  onNextRound,
  onEndGame,
  targetScore: propTargetScore = 30
}) {
  const [expandedPlayerId, setExpandedPlayerId] = useState(null)

  if (!roundResults) return null

  const {
    declareMode,
    declarerName,
    declarerHasHighest,
    scores,
    winner,
    gameOver,
    totalScores,
    targetScore: resultTargetScore
  } = roundResults

  // Use targetScore from roundResults, fallback to prop
  const targetScore = resultTargetScore || propTargetScore

  // Sort players by round score
  const sortedPlayers = Object.entries(scores || {})
    .sort(([, a], [, b]) => (b.total || 0) - (a.total || 0))

  // Check if anyone reached target score
  const reachedTarget = Object.entries(totalScores || {})
    .some(([, score]) => score >= targetScore)

  const getDeclareTypeText = () => {
    if (declareMode === 'stop') return '到此為止'
    if (declareMode === 'last_chance') return '最後機會'
    return ''
  }

  const getDeclareResultText = () => {
    if (declareMode === 'last_chance') {
      if (declarerHasHighest) {
        return `${declarerName} 宣告成功！擁有最高分，獲得卡牌分數 + 顏色獎勵`
      } else {
        return `${declarerName} 宣告失敗！其他玩家獲得卡牌分數 + 顏色獎勵`
      }
    }
    return `${declarerName} 宣告「到此為止」，回合立即結束`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="回合結束"
      size="large"
      showCloseButton={false}
    >
      <div className="round-end">
        {/* Declare info */}
        <div className="round-end__declare">
          <div className="round-end__declare-type">
            {declareMode === 'stop' ? '🛑' : '⏰'} {getDeclareTypeText()}
          </div>
          <p className="round-end__declare-result">
            {getDeclareResultText()}
          </p>
        </div>

        {/* Scores table */}
        <div className="round-end__scores">
          <h3 className="round-end__scores-title">本回合分數</h3>

          <div className="round-end__scores-list">
            {sortedPlayers.map(([playerId, playerScore], index) => {
              const isWinner = winner?.id === playerId
              const playerTotalScore = totalScores?.[playerId] || 0
              const isExpanded = expandedPlayerId === playerId

              return (
                <div key={playerId} className="round-end__player-container">
                  <div
                    className={`round-end__player ${isWinner ? 'round-end__player--winner' : ''} ${isExpanded ? 'round-end__player--expanded' : ''}`}
                    onClick={() => setExpandedPlayerId(isExpanded ? null : playerId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setExpandedPlayerId(isExpanded ? null : playerId)
                      }
                    }}
                  >
                    <div className="round-end__player-rank">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="round-end__player-info">
                      <span className="round-end__player-name">
                        {playerScore.playerName || `玩家 ${index + 1}`}
                        {isWinner && <span className="round-end__winner-badge">勝利!</span>}
                      </span>
                      <span className="round-end__player-total">
                        累計: {playerTotalScore} / {targetScore}
                      </span>
                    </div>
                    <div className="round-end__player-score">
                      <span className="round-end__round-score">+{playerScore.total || 0}</span>
                    </div>
                    <div className="round-end__player-expand">
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>

                  {/* Score breakdown for this player */}
                  {isExpanded && scores[playerId] && (
                    <div className="round-end__breakdown">
                      <h4 className="round-end__breakdown-title">
                        {playerScore.playerName || `玩家 ${index + 1}`} 的分數明細
                      </h4>
                      <div className="round-end__breakdown-rows">
                        {scores[playerId].base > 0 && (
                          <div className="round-end__breakdown-row">
                            <span>基礎分數</span>
                            <span>{scores[playerId].base}</span>
                          </div>
                        )}
                        {scores[playerId].pairs > 0 && (
                          <div className="round-end__breakdown-row">
                            <span>配對獎勵</span>
                            <span>{scores[playerId].pairs}</span>
                          </div>
                        )}
                        {scores[playerId].multipliers > 0 && (
                          <div className="round-end__breakdown-row">
                            <span>倍數獎勵</span>
                            <span>{scores[playerId].multipliers}</span>
                          </div>
                        )}
                        {scores[playerId].mermaids > 0 && (
                          <>
                            {scores[playerId].mermaidDetails && scores[playerId].mermaidDetails.length > 0 ? (
                              scores[playerId].mermaidDetails.map((detail, idx) => (
                                <div key={idx} className="round-end__breakdown-row">
                                  <span>美人魚分數 ({detail.colorName})</span>
                                  <span>{detail.score}</span>
                                </div>
                              ))
                            ) : (
                              <div className="round-end__breakdown-row">
                                <span>美人魚分數</span>
                                <span>{scores[playerId].mermaids}</span>
                              </div>
                            )}
                          </>
                        )}
                        {scores[playerId].colorBonus > 0 && (
                          <div className="round-end__breakdown-row">
                            <span>顏色獎勵</span>
                            <span>{scores[playerId].colorBonus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Game over check */}
        {(reachedTarget || gameOver) && (
          <div className="round-end__game-over">
            <h3 className="round-end__game-over-title">遊戲結束!</h3>
            <p className="round-end__game-over-text">
              {winner?.name} 達到 {targetScore} 分，贏得遊戲！
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="round-end__actions">
          {reachedTarget || gameOver ? (
            <Button variant="primary" size="large" onClick={onEndGame}>
              返回大廳
            </Button>
          ) : (
            <Button variant="primary" size="large" onClick={onNextRound}>
              開始下一回合
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

RoundEndModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  roundResults: PropTypes.shape({
    declareMode: PropTypes.string,
    declarerName: PropTypes.string,
    declarerHasHighest: PropTypes.bool,
    scores: PropTypes.object,
    winner: PropTypes.object,
    gameOver: PropTypes.bool,
    totalScores: PropTypes.object
  }),
  onNextRound: PropTypes.func.isRequired,
  onEndGame: PropTypes.func.isRequired,
  targetScore: PropTypes.number
}

export default RoundEndModal
