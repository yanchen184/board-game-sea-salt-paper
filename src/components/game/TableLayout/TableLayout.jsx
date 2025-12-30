import TableSeat from '../TableSeat/TableSeat'
import TableCenter from '../TableCenter/TableCenter'
import './TableLayout.css'

/**
 * TableLayout Component
 *
 * 桌遊風格的遊戲佈局，四個玩家圍著牌桌
 * 每個玩家從自己的視角看牌桌（自己永遠在下方）
 */
function TableLayout({
  players,
  currentPlayerId,
  myPlayerId,
  gameState,
  myHand,
  selectedCards,
  onCardSelect,
  onCardDeselect,
  onDrawDeck,
  onDiscardClick,
  onCardDropped,
  onCardDragged,
  onCardDragEnd,
  drawnCards,
  showDrawCardArea,
  turnPhase,
  isMyTurn,
  cardEnteringHand,
  onCardEffectComplete,
  startingPlayerId
}) {
  /**
   * 計算玩家在牌桌上的相對位置
   * 自己永遠在下方 (bottom)，其他玩家依序在右、上、左
   */
  const getPlayersInTableOrder = () => {
    const playerIds = Object.keys(players || {})
    const myIndex = playerIds.indexOf(myPlayerId)

    if (myIndex === -1) return []

    const positions = ['bottom', 'right', 'top', 'left']
    const result = []

    for (let i = 0; i < 4; i++) {
      if (i < playerIds.length) {
        const actualIndex = (myIndex + i) % playerIds.length
        const playerId = playerIds[actualIndex]
        result.push({
          position: positions[i],
          player: players[playerId],
          playerId: playerId,
          isMe: i === 0
        })
      } else {
        // 空位
        result.push({
          position: positions[i],
          player: null,
          playerId: null,
          isMe: false
        })
      }
    }
    return result
  }

  const seatsData = getPlayersInTableOrder()

  return (
    <div className="table-layout">
      {/* 上方玩家 */}
      {seatsData.find(s => s.position === 'top') && (
        <TableSeat
          {...seatsData.find(s => s.position === 'top')}
          isCurrentTurn={seatsData.find(s => s.position === 'top')?.playerId === currentPlayerId}
          isStartingPlayer={seatsData.find(s => s.position === 'top')?.playerId === startingPlayerId}
          gameState={gameState}
        />
      )}

      {/* 左側玩家 */}
      {seatsData.find(s => s.position === 'left') && (
        <TableSeat
          {...seatsData.find(s => s.position === 'left')}
          isCurrentTurn={seatsData.find(s => s.position === 'left')?.playerId === currentPlayerId}
          isStartingPlayer={seatsData.find(s => s.position === 'left')?.playerId === startingPlayerId}
          gameState={gameState}
        />
      )}

      {/* 中央牌桌 */}
      <TableCenter
        gameState={gameState}
        players={players}
        onDrawDeck={onDrawDeck}
        onDiscardClick={onDiscardClick}
        onCardDropped={onCardDropped}
        onCardDragged={onCardDragged}
        onCardDragEnd={onCardDragEnd}
        drawnCards={drawnCards}
        showDrawCardArea={showDrawCardArea}
        canDraw={isMyTurn && turnPhase === 'draw' && !showDrawCardArea}
        canTakeDiscard={isMyTurn && turnPhase === 'draw' && !showDrawCardArea}
        myPlayerId={myPlayerId}
        cardEnteringHand={cardEnteringHand}
        onCardEffectComplete={onCardEffectComplete}
      />

      {/* 右側玩家 */}
      {seatsData.find(s => s.position === 'right') && (
        <TableSeat
          {...seatsData.find(s => s.position === 'right')}
          isCurrentTurn={seatsData.find(s => s.position === 'right')?.playerId === currentPlayerId}
          isStartingPlayer={seatsData.find(s => s.position === 'right')?.playerId === startingPlayerId}
          gameState={gameState}
        />
      )}

      {/* 下方 (自己) */}
      {seatsData.find(s => s.position === 'bottom') && (
        <TableSeat
          {...seatsData.find(s => s.position === 'bottom')}
          isCurrentTurn={isMyTurn}
          isStartingPlayer={seatsData.find(s => s.position === 'bottom')?.playerId === startingPlayerId}
          gameState={gameState}
          myHand={myHand}
          selectedCards={selectedCards}
          onCardSelect={onCardSelect}
          onCardDeselect={onCardDeselect}
          canSelect={isMyTurn && turnPhase === 'pair'}
        />
      )}
    </div>
  )
}

export default TableLayout
