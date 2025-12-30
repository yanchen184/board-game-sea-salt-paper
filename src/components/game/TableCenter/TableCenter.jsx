import { useState, useEffect } from 'react'
import DrawDeck from '../DrawDeck/DrawDeck'
import DiscardPile from '../DiscardPile/DiscardPile'
import DrawCardArea from '../DrawCardArea/DrawCardArea'
import './TableCenter.css'

/**
 * TableCenter Component
 *
 * 牌桌中央區域：抽牌堆、棄牌堆、抽牌選擇區
 * 整合抽卡特效：當玩家抽牌時顯示翻牌動畫
 */
function TableCenter({
  gameState,
  players,
  onDrawDeck,
  onDiscardClick,
  onCardDropped,
  onCardDragged,
  onCardDragEnd,
  drawnCards,
  showDrawCardArea,
  canDraw,
  canTakeDiscard,
  myPlayerId,
  cardEnteringHand,
  onCardEffectComplete
}) {
  // 抽卡特效狀態
  const [isPlayingEffect, setIsPlayingEffect] = useState(false)

  const leftPile = gameState?.discardLeft || []
  const rightPile = gameState?.discardRight || []
  const deckCount = gameState?.deckCount || 0

  // 判斷是否顯示抽牌選擇區
  const shouldShowDrawArea = showDrawCardArea || !!gameState?.pendingCardChoice
  const isFaceDown = !showDrawCardArea &&
    !!gameState?.pendingCardChoice &&
    gameState.pendingCardChoice.playerId !== myPlayerId

  const cardsToShow = drawnCards || gameState?.pendingCardChoice?.cards || []

  // 取得正在選擇卡片的玩家名稱
  const choosingPlayerId = gameState?.pendingCardChoice?.playerId
  const choosingPlayerName = choosingPlayerId && players?.[choosingPlayerId]?.name || '未知玩家'

  // 允許拖放到棄牌堆的條件：正在選擇卡片
  const canDropToDiscard = shouldShowDrawArea && cardsToShow.length > 0

  // 判斷是否有空的棄牌堆（如有空堆，必須棄到空堆）
  const leftEmpty = leftPile.length === 0
  const rightEmpty = rightPile.length === 0
  const hasEmptyPile = leftEmpty || rightEmpty

  // 計算哪個棄牌堆可以接受拖放
  // 規則：如果有空的棄牌堆，只能棄到空的那一邊
  const canDropLeft = canDropToDiscard && (!hasEmptyPile || leftEmpty)
  const canDropRight = canDropToDiscard && (!hasEmptyPile || rightEmpty)

  // 是否需要強制棄到某一邊
  const mustDropLeft = canDropToDiscard && hasEmptyPile && leftEmpty
  const mustDropRight = canDropToDiscard && hasEmptyPile && rightEmpty

  // 監聽 cardEnteringHand 變化觸發特效
  // 當玩家選擇一張卡進入手牌時（從牌堆選擇或從棄牌堆拿取）
  useEffect(() => {
    if (cardEnteringHand) {
      console.log('[TableCenter] Card entering hand, triggering draw effect:', cardEnteringHand?.name)
      // 先重置狀態，然後再設置為 true（確保每次都能觸發）
      setIsPlayingEffect(false)
      const timer = setTimeout(() => {
        setIsPlayingEffect(true)
      }, 10)
      return () => clearTimeout(timer)
    } else {
      // 當 cardEnteringHand 清除時，也清除特效狀態
      setIsPlayingEffect(false)
    }
  }, [cardEnteringHand])

  // 特效完成處理
  const handleDrawEffectComplete = () => {
    console.log('[TableCenter] Draw effect completed')
    setIsPlayingEffect(false)
    // 通知上層組件清除狀態
    onCardEffectComplete?.()
  }

  return (
    <div className="table-center">
      {/* 左棄牌堆 */}
      <div className="table-center__pile table-center__pile--left">
        <DiscardPile
          cards={leftPile}
          onTakeCard={() => onDiscardClick && onDiscardClick('left')}
          onCardDropped={(cardId) => onCardDropped && onCardDropped(cardId, 'left')}
          canTake={canTakeDiscard && leftPile.length > 0}
          canDrop={canDropLeft}
          mustDrop={mustDropLeft}
          side="left"
        />
      </div>

      {/* 中央區域 */}
      <div className="table-center__main">
        {/* 抽牌堆 - 添加特效相關 props */}
        <DrawDeck
          cardCount={deckCount}
          onDrawClick={onDrawDeck}
          canDraw={canDraw && !isPlayingEffect}
          isDrawing={isPlayingEffect}
          drawnCard={cardEnteringHand}
          onDrawEffectComplete={handleDrawEffectComplete}
        />

        {/* 抽牌選擇區 - 只在特效完成後顯示 */}
        {shouldShowDrawArea && cardsToShow.length > 0 && !isPlayingEffect && (
          <DrawCardArea
            cards={cardsToShow}
            onCardDropped={onCardDropped}
            onCardDragged={onCardDragged}
            onCardDragEnd={onCardDragEnd}
            isVisible={true}
            showFaceDown={isFaceDown}
            emptyPileSide={hasEmptyPile ? (leftEmpty ? 'left' : 'right') : null}
            choosingPlayerName={choosingPlayerName}
          />
        )}
      </div>

      {/* 右棄牌堆 */}
      <div className="table-center__pile table-center__pile--right">
        <DiscardPile
          cards={rightPile}
          onTakeCard={() => onDiscardClick && onDiscardClick('right')}
          onCardDropped={(cardId) => onCardDropped && onCardDropped(cardId, 'right')}
          canTake={canTakeDiscard && rightPile.length > 0}
          canDrop={canDropRight}
          mustDrop={mustDropRight}
          side="right"
        />
      </div>
    </div>
  )
}

export default TableCenter
