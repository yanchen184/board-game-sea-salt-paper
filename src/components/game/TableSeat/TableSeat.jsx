import Card from '../../common/Card/Card'
import PlayerHand from '../PlayerHand/PlayerHand'
import './TableSeat.css'

function TableSeat({
  player,
  playerId,
  position,
  isCurrentTurn,
  isStartingPlayer,
  isMe,
  gameState,
  myHand,
  selectedCards,
  onCardSelect,
  onCardDeselect,
  canSelect
}) {
  const rotationMap = {
    bottom: 0,
    right: -90,
    top: 180,
    left: 90
  }
  const rotation = rotationMap[position] || 0

  if (!player) {
    return (
      <div className={`table-seat table-seat--${position} table-seat--empty`}>
        <div className="table-seat__empty-placeholder">
          <span className="table-seat__empty-text">空位</span>
        </div>
      </div>
    )
  }

  const playerName = player.name || 'Unknown'
  const playerScore = player.score || 0
  const playerConnected = player.connected !== false
  const playerIsAI = player.isAI || false
  const handCount = player.handCount || (player.hand ? player.hand.length : 0)
  const playedPairs = player.playedPairs || []

  // Debug: 檢查對子資料
  if (playedPairs.length > 0) {
    console.log(`[TableSeat] ${playerName} (${playerId}) playedPairs:`, playedPairs.length, 'pairs')
  }

  if (isMe) {
    return (
      <div className={`table-seat table-seat--${position} table-seat--me ${isCurrentTurn ? 'table-seat--active' : ''} ${isStartingPlayer ? 'table-seat--starting' : ''}`}>
        {/* 打出的對子 - 放在牌桌上（超出框框） */}
        {playedPairs.length > 0 && (
          <div className="table-seat__played-pairs-area table-seat__played-pairs-area--me">
            {playedPairs.map((pair, idx) => (
              <div key={idx} className="table-seat__pair-group">
                {pair.cards && pair.cards.map((card, cardIdx) => (
                  <Card
                    key={card.id || cardIdx}
                    cardData={card}
                    size="small"
                    disabled
                    showRuleHint={false}
                    showTooltip={false}
                  />
                ))}
                {pair.stolenFrom && (
                  <span className="table-seat__stolen-badge" title={`偷了 ${pair.stolenFrom.playerName} 的 ${pair.stolenFrom.cardName}`}>
                    🎯
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 起始玩家標記 */}
        {isStartingPlayer && (
          <div className="table-seat__starting-marker table-seat__starting-marker--me" title="本回合起始玩家">
            <span className="table-seat__starting-icon">🐚</span>
            <span className="table-seat__starting-text">起始</span>
          </div>
        )}
        <div className="table-seat__info table-seat__info--me">
          <span className="table-seat__name">
            {playerName}
            {playerIsAI && <span className="table-seat__ai-badge">🤖</span>}
          </span>
          <span className="table-seat__score">分數: {playerScore}</span>
        </div>
        <div className="table-seat__hand-area">
          <PlayerHand
            cards={myHand || []}
            selectedCards={selectedCards || []}
            onCardSelect={onCardSelect}
            onCardDeselect={onCardDeselect}
            canSelect={canSelect}
            horizontal={true}
            playedPairs={playedPairs}  // 傳遞已打出的對子用於計算實際得分
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`table-seat table-seat--${position} table-seat--opponent ${isCurrentTurn ? 'table-seat--active' : ''} ${!playerConnected ? 'table-seat--disconnected' : ''} ${isStartingPlayer ? 'table-seat--starting' : ''}`}>
      {/* 打出的對子 - 放在牌桌上（超出框框） */}
      {playedPairs.length > 0 && (
        <div className={`table-seat__played-pairs-area table-seat__played-pairs-area--opponent table-seat__played-pairs-area--${position}`}>
          {playedPairs.map((pair, idx) => (
            <div key={idx} className="table-seat__pair-group">
              {pair.cards && pair.cards.map((card, cardIdx) => (
                <Card
                  key={card.id || cardIdx}
                  cardData={card}
                  size="small"
                  disabled
                  showRuleHint={false}
                  showTooltip={false}
                />
              ))}
              {pair.stolenFrom && (
                <span className="table-seat__stolen-badge" title={`偷了 ${pair.stolenFrom.playerName} 的 ${pair.stolenFrom.cardName}`}>
                  🎯
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 起始玩家標記 */}
      {isStartingPlayer && (
        <div className="table-seat__starting-marker" title="本回合起始玩家">
          <span className="table-seat__starting-icon">🐚</span>
        </div>
      )}
      <div className="table-seat__content" style={{ transform: `rotate(${rotation}deg)` }}>
        <div className="table-seat__info">
          <span className="table-seat__name">
            {playerName}
            {playerIsAI && <span className="table-seat__ai-badge">🤖</span>}
          </span>
          <span className="table-seat__score">{playerScore}分</span>
          {!playerConnected && <span className="table-seat__disconnected-badge">離線</span>}
        </div>
        <div className="table-seat__hand">
          {Array.from({ length: Math.min(handCount, 6) }).map((_, index) => (
            <div key={index} className="table-seat__card-back">
              <Card
                cardData={{
                  id: `back-${index}`,
                  name: 'Card Back',
                  emoji: '🌊',
                  color: 'blue',
                  value: 0
                }}
                faceDown={true}
                disabled={true}
                size="small"
              />
            </div>
          ))}
          {handCount > 6 && <span className="table-seat__hand-count">+{handCount - 6}</span>}
          {handCount === 0 && <span className="table-seat__no-cards">無牌</span>}
        </div>
        {isCurrentTurn && (
          <div className="table-seat__turn-indicator">
            <span className="table-seat__turn-icon">▶</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TableSeat
