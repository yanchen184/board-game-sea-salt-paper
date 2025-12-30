import { useState, useEffect } from 'react'
import Card from '../../common/Card/Card'
import './OpponentDrawAnimation.css'

/**
 * OpponentDrawAnimation Component
 *
 * 顯示對手抽牌/拿棄牌的動畫效果
 * 卡片會從中央飛到對手的位置
 *
 * @param {Object} animation - 動畫資料 { playerId, playerName, position, type, cardData }
 * @param {Function} onComplete - 動畫完成回調
 */
function OpponentDrawAnimation({ animation, onComplete }) {
  const [phase, setPhase] = useState('hidden') // hidden, showing, flying

  useEffect(() => {
    if (animation) {
      console.log('[OpponentDrawAnimation] Starting animation:', animation)

      // Phase 1: 顯示卡片（放大效果）
      setPhase('showing')

      // Phase 2: 飛向對手
      const flyTimer = setTimeout(() => {
        setPhase('flying')
      }, animation.type === 'draw_discard' ? 1200 : 600)

      // Phase 3: 結束動畫
      const endTimer = setTimeout(() => {
        setPhase('hidden')
        onComplete?.()
      }, animation.type === 'draw_discard' ? 2500 : 1200)

      return () => {
        clearTimeout(flyTimer)
        clearTimeout(endTimer)
      }
    }
  }, [animation, onComplete])

  if (phase === 'hidden' || !animation) return null

  // 是否為拿棄牌（顯示卡面）
  const isDiscardDraw = animation.type === 'draw_discard'

  // 根據對手位置和階段決定動畫類名
  const getAnimationClass = () => {
    const positionClass = `opponent-draw--${animation.position || 'top'}`
    const phaseClass = `opponent-draw--${phase}`
    const typeClass = isDiscardDraw ? 'opponent-draw--discard' : ''
    return `${positionClass} ${phaseClass} ${typeClass}`
  }

  return (
    <div className={`opponent-draw ${getAnimationClass()}`}>
      {/* 全屏半透明遮罩 - 只在拿棄牌時顯示 */}
      {isDiscardDraw && phase === 'showing' && (
        <div className="opponent-draw__overlay" />
      )}

      {/* 頂部公告橫幅 */}
      {isDiscardDraw && (
        <div className="opponent-draw__banner">
          <span className="opponent-draw__banner-icon">♻️</span>
          <span className="opponent-draw__banner-text">
            {animation.playerName} 拿了棄牌堆的牌！
          </span>
        </div>
      )}

      {/* 卡片容器 */}
      <div className="opponent-draw__card-wrapper">
        {/* 閃光效果 */}
        {isDiscardDraw && phase === 'showing' && (
          <div className="opponent-draw__glow" />
        )}

        <div className="opponent-draw__card">
          <Card
            cardData={animation.cardData || {
              id: 'draw-animation',
              name: 'Card Back',
              emoji: '🌊',
              color: 'blue',
              value: 0
            }}
            faceDown={!isDiscardDraw}
            disabled={true}
            size="large"
          />
        </div>

        {/* 卡片下方標籤 */}
        <div className={`opponent-draw__label ${isDiscardDraw ? 'opponent-draw__label--highlight' : ''}`}>
          {isDiscardDraw && <span className="opponent-draw__icon">♻️</span>}
          {animation.playerName} {isDiscardDraw ? '拿棄牌' : '抽牌'}
        </div>
      </div>

      {/* 飛行軌跡線（拿棄牌時顯示） */}
      {isDiscardDraw && phase === 'flying' && (
        <div className="opponent-draw__trail" />
      )}
    </div>
  )
}

export default OpponentDrawAnimation
