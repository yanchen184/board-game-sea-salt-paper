import PropTypes from 'prop-types'
import './Button.css'

/**
 * Button component
 *
 * Reusable button with multiple variants and sizes
 *
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button variant: 'primary', 'secondary', 'danger'
 * @param {string} [props.size='medium'] - Button size: 'small', 'medium', 'large'
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.type='button'] - Button type attribute
 * @param {string} [props.ariaLabel] - Accessibility label
 * @returns {JSX.Element} Button component
 */
function Button({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ariaLabel
}) {
  const buttonClass = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    disabled && 'button--disabled',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled}
    >
      {children}
    </button>
  )
}

// PropTypes validation
Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'ghost', 'warning']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  ariaLabel: PropTypes.string
}

export default Button
