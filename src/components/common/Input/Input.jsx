import './Input.css'

/**
 * Input component
 *
 * Reusable input field with validation support
 *
 * @param {Object} props - Component props
 * @param {string} [props.type='text'] - Input type
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {string} [props.error=''] - Error message to display
 * @param {number} [props.maxLength] - Maximum input length
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.label] - Label text
 * @param {boolean} [props.required=false] - Whether field is required
 * @param {string} [props.id] - Input ID
 * @returns {JSX.Element} Input component
 */
function Input({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  maxLength,
  disabled = false,
  className = '',
  label,
  required = false,
  id
}) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const hasError = Boolean(error)

  const inputClass = [
    'input',
    hasError && 'input--error',
    disabled && 'input--disabled',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={inputClass}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        required={required}
      />

      {hasError && (
        <span id={`${inputId}-error`} className="input__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default Input
