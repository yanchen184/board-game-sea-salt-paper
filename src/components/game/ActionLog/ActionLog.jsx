import { useEffect, useRef } from 'react'
import './ActionLog.css'

/**
 * ActionLog Component - Large & Clear Version
 *
 * Big icons, large text, concise messages
 */
function ActionLog({
  actions = [],
  autoScroll = true,
  maxHeight = 350,
  className = ''
}) {
  const logEndRef = useRef(null)

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [actions, autoScroll])

  /**
   * Get large action icon
   */
  const getActionIcon = (type) => {
    const icons = {
      draw: '🃏',
      draw_blind: '🎴',
      draw_discard: '♻️',
      play_pair: '✨',
      discard: '↩️',
      declare_stop: '🛑',
      declare_last_chance: '⚡',
      round_end: '🏁',
      round_start: '🎯',
      game_start: '🎮',
      game_end: '🏆',
      join: '👋',
      leave: '👋',
      extra_turn: '🔄',
      effect_steal: '🎯',
      effect_crab: '🦀',
      end_turn: '✓'
    }
    return icons[type] || '•'
  }

  /**
   * Get ultra-concise message (精簡版)
   */
  const getSimpleMessage = (action) => {
    const { type, playerName, details, message, cardData } = action
    const name = playerName || '系統'

    switch (type) {
      case 'game_start':
        return '遊戲開始'
      case 'round_start':
        return `第${details?.round || 1}回合`
      case 'draw':
      case 'draw_blind':
        return `${name} 抽牌`
      case 'draw_discard':
        // 顯示拿了什麼牌
        if (cardData?.name) {
          return `${name} 拿 ${cardData.name}`
        }
        return `${name} 拿棄牌`
      case 'play_pair':
        // 顯示打出的牌
        if (cardData?.card1 && cardData?.card2) {
          return `${name} 出 ${cardData.card1}+${cardData.card2}`
        }
        if (message) {
          return `${name} ${message.replace('打出了一對：', '出 ')}`
        }
        return `${name} 出牌`
      case 'discard':
        return `${name} 棄牌`
      case 'declare_stop':
        return `${name} 結束`
      case 'declare_last_chance':
        return `${name} 最後機會`
      case 'round_end':
        return '回合結束'
      case 'game_end':
        return '遊戲結束'
      case 'extra_turn':
        return `${name} 額外回合`
      case 'effect_steal':
        // 顯示偷牌訊息（不顯示具體卡片名稱，保密）
        if (cardData?.opponentName) {
          return `${name} 偷了 ${cardData.opponentName} 的一張牌`
        }
        if (message) {
          // 移除訊息中的卡片名稱（保密）
          return `${name} ${message.replace(/偷取了.*的.*/, '偷了一張牌')}`
        }
        return `${name} 偷了一張牌`
      case 'effect_crab':
        // 顯示螃蟹效果訊息
        if (cardData?.cardName && cardData?.side) {
          return `${name} 拿了 ${cardData.cardName}（${cardData.side === 'left' ? '左' : '右'}）`
        }
        if (message) {
          return `${name} ${message}`
        }
        return `${name} 拿棄牌`
      case 'end_turn':
        return `${name} 結束回合`
      case 'join':
        return `${name} 加入`
      case 'leave':
        return `${name} 離開`
      default:
        return `${name} 動作`
    }
  }

  /**
   * Get relative time (簡短)
   */
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return ''

    const now = Date.now()
    const diff = Math.floor((now - timestamp) / 1000)

    if (diff < 5) return '剛才'
    if (diff < 60) return `${diff}秒`
    if (diff < 3600) return `${Math.floor(diff / 60)}分`
    return `${Math.floor(diff / 3600)}時`
  }

  /**
   * Get item style class
   */
  const getItemClass = (type) => {
    if (type.includes('declare') || type === 'round_end') {
      return 'action-log__item--highlight'
    }
    if (type.includes('game') || type === 'round_start') {
      return 'action-log__item--system'
    }
    if (type === 'play_pair' || type === 'extra_turn' || type === 'effect_steal' || type === 'effect_crab') {
      return 'action-log__item--success'
    }
    return ''
  }

  // Empty state
  if (!actions || actions.length === 0) {
    return (
      <div className={`action-log action-log--empty ${className}`}>
        <div className="action-log__empty-state">
          📝 等待開始...
        </div>
      </div>
    )
  }

  return (
    <div className={`action-log ${className}`}>
      {/* Header */}
      <div className="action-log__header">
        <span>📋 紀錄</span>
        <span className="action-log__count">{actions.length}</span>
      </div>

      {/* Log list */}
      <div className="action-log__scroll" style={{ maxHeight: `${maxHeight}px` }}>
        {actions.map((action, index) => (
          <div
            key={action.timestamp || index}
            className={`action-log__item ${getItemClass(action.type)}`}
          >
            <span className="action-log__icon">{getActionIcon(action.type)}</span>
            <span className="action-log__msg">{getSimpleMessage(action)}</span>
            <span className="action-log__time">{getRelativeTime(action.timestamp)}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}

export default ActionLog
