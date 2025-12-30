import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { getCardDescription, getCardRuleHint, CARD_TYPE_LABELS } from '../../../data/cardDescriptions'
import { GAME_COLORS } from '../../../config/colorConfig'
import { formatScore } from '../../../utils/cardScoreHelpers'
import { getCardImage, hasCardImage } from '../../../utils/cardImageHelper'
import './Card.css'

/**
 * Card component
 *
 * Displays a game card with its properties
 * Supports selection, dragging, and various states
 *
 * @param {Object} props - Component props
 * @param {Object} props.cardData - Card data object
 * @param {string} props.cardData.id - Card unique ID
 * @param {string} props.cardData.name - Card name
 * @param {string} props.cardData.emoji - Card emoji/icon
 * @param {string} props.cardData.color - Card color
 * @param {number} props.cardData.value - Card point value
 * @param {boolean} [props.selected=false] - Whether card is selected
 * @param {boolean} [props.disabled=false] - Whether card is disabled
 * @param {boolean} [props.faceDown=false] - Whether to show card back
 * @param {boolean} [props.draggable] - Whether card can be dragged
 * @param {boolean} [props.enableLift=false] - Whether card can be lifted on click
 * @param {Function} [props.onClick] - Click handler
 * @param {Function} [props.onDragStart] - Drag start handler
 * @param {Function} [props.onDragEnd] - Drag end handler
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.size='medium'] - Card size: 'small', 'medium', 'large'
 * @returns {JSX.Element} Card component
 */
function Card({
  cardData,
  selected = false,
  disabled = false,
  faceDown = false,
  draggable,
  enableLift = false,  // 是否啟用拿起效果（預設關閉）
  onClick,
  onDragStart,
  onDragEnd,
  className = '',
  size = 'medium',
  showRuleHint = true,
  showTooltip = true,
  actualScore = null  // 實際得分（如果提供則顯示，否則顯示 value）
}) {
  const { id, name, emoji, color, value, type } = cardData || {}
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [isLifted, setIsLifted] = useState(false)  // 拿起狀態
  const hoverTimerRef = useRef(null)
  const cardRef = useRef(null)

  // Get card description data
  const cardDesc = name ? getCardDescription(name) : null
  const ruleHint = name ? getCardRuleHint(name) : ''
  const typeLabel = type ? CARD_TYPE_LABELS[type] : ''

  // Get color info
  const colorInfo = color && GAME_COLORS[color] ? GAME_COLORS[color] : null

  // Calculate tooltip position relative to viewport
  const updateTooltipPosition = () => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const tooltipWidth = 220 // matches CSS width
    const tooltipHeight = 150 // approximate height

    // Position above the card, centered horizontally
    let left = rect.left + rect.width / 2 - tooltipWidth / 2
    let top = rect.top - tooltipHeight - 12 // 12px gap

    // Keep tooltip within viewport bounds
    if (left < 10) left = 10
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10
    }
    // If no space above, show below
    if (top < 10) {
      top = rect.bottom + 12
    }

    setTooltipPosition({ top, left })
  }

  // Handle hover for tooltip (3 second delay)
  const handleMouseEnter = () => {
    if (faceDown || !showTooltip) return
    hoverTimerRef.current = setTimeout(() => {
      updateTooltipPosition()
      setIsTooltipVisible(true)
    }, 3000) // 3 seconds
  }

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    // Small delay to prevent tooltip flicker during CSS transform animations
    setTimeout(() => {
      setIsTooltipVisible(false)
    }, 100)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  const cardClass = [
    'card',
    `card--${size}`,
    selected && 'card--selected',
    enableLift && isLifted && 'card--lifted',  // 只有啟用 enableLift 時才顯示拿起狀態
    disabled && 'card--disabled',
    faceDown && 'card--face-down',
    !disabled && !faceDown && 'card-hover',
    className
  ].filter(Boolean).join(' ')

  // Dynamic border and background style based on color
  const cardColorStyle = colorInfo && !faceDown ? {
    borderColor: colorInfo.borderColor,
    background: `linear-gradient(135deg, var(--bg-primary) 0%, ${colorInfo.lightBg} 100%)`,
    '--card-color': colorInfo.hex,
    '--card-border-color': colorInfo.borderColor
  } : {}

  const handleClick = () => {
    if (!disabled && !faceDown) {
      // 只在啟用 enableLift 時切換拿起/放下狀態
      if (enableLift) {
        setIsLifted(prev => !prev)
      }

      // 調用父組件的 onClick（如果有）
      if (onClick) {
        onClick(cardData)
      }
    }
  }

  const handleDragStart = (event) => {
    if (!disabled && onDragStart && event && event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('cardId', id)
      onDragStart(cardData, event)
    }
  }

  const handleDragEnd = (event) => {
    if (onDragEnd) {
      onDragEnd(cardData, event)
    }
  }

  // Determine if card should be draggable
  const isDraggable = draggable !== undefined
    ? (draggable && !disabled && !faceDown)
    : (!disabled && !faceDown)

  return (
    <div
      ref={cardRef}
      className={cardClass}
      style={cardColorStyle}
      onClick={handleClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={faceDown ? 'Card face down' : `${name} card, value ${value}${ruleHint ? `, ${ruleHint}` : ''}`}
      aria-pressed={selected || (enableLift && isLifted)}
      aria-disabled={disabled}
    >
      {faceDown ? (
        <div className="card__back">
          <div className="card__back-pattern">🌊</div>
        </div>
      ) : (
        <div className="card__front">
          {/* Color marker - top left corner */}
          {colorInfo && (
            <div
              className="card__color-marker"
              style={{ backgroundColor: colorInfo.hex }}
              title={colorInfo.name}
            >
              <span className="card__color-marker-text">{colorInfo.name}</span>
            </div>
          )}

          {/* Value - top right (顯示實際得分或預設點數) */}
          <div className="card__value">
            {actualScore !== null ? formatScore(actualScore) : value}
          </div>

          {/* Emoji or Origami Image - center */}
          <div className="card__emoji">
            {hasCardImage(name) ? (
              <img
                src={getCardImage(name)}
                alt={name}
                className="card__origami-image"
              />
            ) : (
              emoji
            )}
          </div>

          {/* Name */}
          <div className="card__name">{name}</div>

          {/* Rule hint - bottom */}
          {showRuleHint && ruleHint && size !== 'small' && (
            <div className="card__rule-hint">{ruleHint}</div>
          )}
        </div>
      )}

      {/* Tooltip - appears after 3 second hover */}
      {isTooltipVisible && cardDesc && (
        <div
          className="card__tooltip card__tooltip--fixed"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`
          }}
        >
          <div className="card__tooltip-header">
            <span className="card__tooltip-emoji">
              {hasCardImage(name) ? (
                <img
                  src={getCardImage(name)}
                  alt={name}
                  className="card__tooltip-origami-image"
                />
              ) : (
                emoji
              )}
            </span>
            <span className="card__tooltip-name">{cardDesc.name || name}</span>
          </div>
          <div className="card__tooltip-body">
            <p className="card__tooltip-desc">{cardDesc.fullDescription}</p>
            <p className="card__tooltip-score">{cardDesc.scoringRule}</p>
            {cardDesc.tips && (
              <p className="card__tooltip-tips">💡 {cardDesc.tips}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// PropTypes validation
Card.propTypes = {
  cardData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
  }),
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  faceDown: PropTypes.bool,
  draggable: PropTypes.bool,
  onClick: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large'])
}

export default Card
