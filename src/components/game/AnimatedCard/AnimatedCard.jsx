import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Card from '../../common/Card/Card'
import './AnimatedCard.css'

/**
 * AnimatedCard Component
 *
 * Displays a card with animation from source to destination
 * Used for visual feedback when drawing/taking cards
 *
 * @param {Object} cardData - Card data object
 * @param {Object} startPosition - Starting position {x, y} or 'deck'
 * @param {Object} endPosition - Ending position {x, y} or 'hand'
 * @param {number} delay - Animation delay in ms
 * @param {Function} onComplete - Callback when animation completes
 * @param {boolean} showFaceDown - Show card face down during animation
 */
function AnimatedCard({
  cardData,
  startPosition = 'deck',
  endPosition = 'hand',
  delay = 0,
  duration = 800,
  onComplete,
  showFaceDown = false
}) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Start animation after delay
    const timer = setTimeout(() => {
      setIsAnimating(true)
    }, delay)

    // Complete animation
    const completeTimer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, delay + duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(completeTimer)
    }
  }, [delay, duration, onComplete])

  if (!isVisible) return null

  // Calculate animation class based on positions
  const getAnimationClass = () => {
    if (startPosition === 'deck' && endPosition === 'hand') {
      return 'animated-card--deck-to-hand'
    }
    if (startPosition === 'discard' && endPosition === 'hand') {
      return 'animated-card--discard-to-hand'
    }
    return ''
  }

  return (
    <div
      className={`animated-card ${isAnimating ? getAnimationClass() : ''}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      <Card
        cardData={cardData}
        size="medium"
        showFaceDown={showFaceDown}
        disabled={true}
      />
    </div>
  )
}

AnimatedCard.propTypes = {
  cardData: PropTypes.object.isRequired,
  startPosition: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    })
  ]),
  endPosition: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    })
  ]),
  delay: PropTypes.number,
  duration: PropTypes.number,
  onComplete: PropTypes.func,
  showFaceDown: PropTypes.bool
}

export default AnimatedCard
