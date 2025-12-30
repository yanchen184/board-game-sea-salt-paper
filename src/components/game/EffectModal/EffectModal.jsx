import { useEffect } from 'react'
import './EffectModal.css'

/**
 * EffectModal Component
 *
 * Generic modal for displaying card effects
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {Function} onClose - Close callback
 * @param {string} title - Modal title
 * @param {string} description - Effect description
 * @param {ReactNode} children - Modal content
 * @param {string} className - Additional CSS classes
 */
function EffectModal({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  className = ''
}) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="effect-modal__overlay" onClick={onClose}>
      <div
        className={`effect-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="effect-modal-title"
        aria-describedby="effect-modal-description"
      >
        {/* Header */}
        <div className="effect-modal__header">
          <h2 id="effect-modal-title" className="effect-modal__title">
            {title}
          </h2>
          {description && (
            <p id="effect-modal-description" className="effect-modal__description">
              {description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="effect-modal__content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default EffectModal
