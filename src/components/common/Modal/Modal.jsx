import { useEffect } from 'react'
import './Modal.css'

/**
 * Modal component
 *
 * Reusable modal dialog with backdrop and keyboard support
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.closeOnBackdrop=true] - Close when clicking backdrop
 * @param {boolean} [props.closeOnEscape=true] - Close when pressing Escape
 * @param {string} [props.size='medium'] - Modal size: 'small', 'medium', 'large'
 * @returns {JSX.Element|null} Modal component or null if closed
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  closeOnBackdrop = true,
  closeOnEscape = true,
  size = 'medium'
}) {
  // Handle Escape key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose()
    }
  }

  const modalClass = [
    'modal__content',
    `modal__content--${size}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <div
      className="modal"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className="modal__backdrop animate-fade-in" />

      <div className={modalClass + ' animate-scale-in'}>
        <div className="modal__header">
          {title && (
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
          )}
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
