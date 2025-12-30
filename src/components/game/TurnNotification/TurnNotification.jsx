import { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import './TurnNotification.css'

/**
 * TurnNotification Component
 *
 * Full-screen subtle notification when it's the player's turn
 * Features:
 * - Full screen semi-transparent overlay
 * - Large, subtle text "輪到你了"
 * - Click anywhere to dismiss
 * - Minimal, elegant design
 *
 * @param {boolean} show - Whether to show the notification
 * @param {Function} onComplete - Callback when animation completes
 */
function TurnNotification({ show, onComplete }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  /**
   * Dismiss the notification
   */
  const dismiss = useCallback(() => {
    if (isFadingOut) return // Already fading out
    setIsFadingOut(true)

    // Hide after fade animation
    setTimeout(() => {
      setIsVisible(false)
      setIsFadingOut(false)
      if (onComplete) {
        onComplete()
      }
    }, 500) // Shorter fade when clicking
  }, [isFadingOut, onComplete])

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setIsFadingOut(false)

      // Start fading out after 1.5 seconds
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true)
      }, 1500)

      // Hide completely after fade out (2.5 seconds total)
      const hideTimer = setTimeout(() => {
        setIsVisible(false)
        setIsFadingOut(false)
        if (onComplete) {
          onComplete()
        }
      }, 2500)

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [show, onComplete])

  /**
   * Handle click to dismiss
   */
  const handleClick = useCallback(() => {
    dismiss()
  }, [dismiss])

  if (!isVisible) return null

  return (
    <div
      className={`turn-notification ${isFadingOut ? 'turn-notification--fading-out' : ''}`}
      onClick={handleClick}
    >
      <span className="turn-notification__text">輪到你了</span>
    </div>
  )
}

TurnNotification.propTypes = {
  show: PropTypes.bool.isRequired,
  onComplete: PropTypes.func
}

export default TurnNotification
