import { useEffect, useState, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import Card from '../../common/Card/Card'
import './CardDrawEffect.css'

/**
 * CardDrawEffect Component
 *
 * Premium card draw animation system - Card First, Effects Second:
 * - Phase 1: Instant (0ms) - Card appears immediately at center, enlarged for viewing
 * - Phase 2: Showcase (0-2000ms) - Effects play around the card (glow, particles, shimmer)
 * - Phase 3: ToHand (2000-2600ms) - Card flies to hand position
 * - Click anywhere to skip animation
 *
 * @param {Object} cardData - The card being drawn
 * @param {boolean} isActive - Whether the effect is currently playing
 * @param {Function} onComplete - Callback when animation finishes
 * @param {string} rarity - Card rarity for effect intensity ('common', 'rare', 'legendary')
 * @param {Object} deckPosition - {x, y} position of the deck (percentage)
 * @param {Object} handPosition - {x, y} target position in hand (percentage)
 */
function CardDrawEffect({
  cardData,
  isActive = false,
  onComplete,
  rarity = 'common',
  deckPosition = { x: 50, y: 30 },
  handPosition = { x: 50, y: 85 }
}) {
  const [phase, setPhase] = useState('idle')
  const [particles, setParticles] = useState([])
  const [showCard, setShowCard] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const containerRef = useRef(null)
  const particleIdRef = useRef(0)
  const timersRef = useRef([])

  // Rarity configuration - affects visual intensity
  const rarityConfig = {
    common: {
      particleCount: 12,
      glowIntensity: 1,
      trailLength: 3,
      revealDuration: 600
    },
    rare: {
      particleCount: 24,
      glowIntensity: 1.5,
      trailLength: 5,
      revealDuration: 800
    },
    legendary: {
      particleCount: 40,
      glowIntensity: 2,
      trailLength: 8,
      revealDuration: 1000
    }
  }

  const config = rarityConfig[rarity] || rarityConfig.common

  /**
   * Generate particles for the effect
   */
  const generateParticles = useCallback((count, type) => {
    const newParticles = []
    for (let i = 0; i < count; i++) {
      particleIdRef.current += 1
      newParticles.push({
        id: particleIdRef.current,
        type,
        x: 35 + Math.random() * 30, // Centered around card at 50%
        y: 30 + Math.random() * 30, // Centered around card at 45%
        size: Math.random() * 8 + 4,
        delay: Math.random() * 300,
        duration: Math.random() * 1000 + 500,
        angle: Math.random() * 360
      })
    }
    return newParticles
  }, [])

  /**
   * Skip animation and complete immediately
   */
  const skipAnimation = useCallback(() => {
    if (isSkipping || phase === 'idle' || phase === 'complete') return

    console.log('[CardDrawEffect] Skipping animation')
    setIsSkipping(true)

    // Clear all pending timers
    timersRef.current.forEach(timer => clearTimeout(timer))
    timersRef.current = []

    // Quick fade out then complete
    setPhase('skipping')
    setTimeout(() => {
      setPhase('complete')
      setParticles([])
      setShowCard(false)
      setIsSkipping(false)
      onComplete?.()
    }, 300)
  }, [isSkipping, phase, onComplete])

  /**
   * Handle click to skip
   */
  const handleClick = useCallback(() => {
    skipAnimation()
  }, [skipAnimation])

  /**
   * Run the animation sequence - Card First, Effects Second
   * Timeline: instant -> showcase (with effects) -> toHand -> complete
   */
  useEffect(() => {
    if (!isActive) {
      setPhase('idle')
      setParticles([])
      setShowCard(false)
      setIsSkipping(false)
      // Clear timers
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current = []
      return
    }

    console.log('[CardDrawEffect] Starting animation - Card First!')

    // Phase 1: Instant (0ms) - Card appears immediately at center!
    setPhase('showcase')
    setShowCard(true) // Card is visible immediately

    // Add particles after a tiny delay for visual impact
    const particleTimer = setTimeout(() => {
      setParticles([
        ...generateParticles(config.particleCount / 2, 'sparkle'),
        ...generateParticles(config.particleCount / 2, 'bubble')
      ])
    }, 100)
    timersRef.current.push(particleTimer)

    // Add explosion particles for extra effect
    const explosionTimer = setTimeout(() => {
      setParticles(prev => [
        ...prev,
        ...generateParticles(config.particleCount, 'explosion')
      ])
    }, 300)
    timersRef.current.push(explosionTimer)

    // Phase 2: ToHand (2000ms) - Card flies to hand
    const toHandTimer = setTimeout(() => {
      console.log('[CardDrawEffect] ToHand - Flying to hand')
      setPhase('toHand')
    }, 2000)
    timersRef.current.push(toHandTimer)

    // Animation complete (2600ms)
    const completeTimer = setTimeout(() => {
      console.log('[CardDrawEffect] Animation complete')
      setPhase('complete')
      onComplete?.()
    }, 2600)
    timersRef.current.push(completeTimer)

    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current = []
    }
  }, [isActive, config.particleCount, generateParticles, onComplete])

  // Don't render anything when idle
  if (!isActive && phase === 'idle') {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`card-draw-effect card-draw-effect--${phase} card-draw-effect--${rarity}`}
      onClick={handleClick}
      aria-hidden="true"
    >
      {/* Background Overlay - dims the game board */}
      <div className="card-draw-effect__overlay" />

      {/* Energy Rings around card at center */}
      <div
        className="card-draw-effect__energy-ring"
        style={{
          left: '50%',
          top: '45%'
        }}
      >
        <div className="card-draw-effect__ring card-draw-effect__ring--1" />
        <div className="card-draw-effect__ring card-draw-effect__ring--2" />
        <div className="card-draw-effect__ring card-draw-effect__ring--3" />
      </div>

      {/* Light Rays emanating from card at center */}
      <div
        className="card-draw-effect__rays"
        style={{
          left: '50%',
          top: '45%'
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="card-draw-effect__ray"
            style={{ '--ray-index': i }}
          />
        ))}
      </div>

      {/* Particles (bubbles, sparkles, explosion) */}
      <div className="card-draw-effect__particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className={`card-draw-effect__particle card-draw-effect__particle--${particle.type}`}
            style={{
              '--particle-x': `${particle.x}%`,
              '--particle-y': `${particle.y}%`,
              '--particle-size': `${particle.size}px`,
              '--particle-delay': `${particle.delay}ms`,
              '--particle-duration': `${particle.duration}ms`,
              '--particle-angle': `${particle.angle}deg`
            }}
          />
        ))}
      </div>

      {/* Motion Trail behind card */}
      {showCard && (
        <div className="card-draw-effect__trail">
          {[...Array(config.trailLength)].map((_, i) => (
            <div
              key={i}
              className="card-draw-effect__trail-segment"
              style={{
                '--trail-index': i,
                '--trail-total': config.trailLength
              }}
            />
          ))}
        </div>
      )}

      {/* The Card with effects */}
      {showCard && cardData && (
        <div
          className="card-draw-effect__card-container"
          style={{
            '--start-x': `${deckPosition.x}%`,
            '--start-y': `${deckPosition.y}%`,
            '--end-x': `${handPosition.x}%`,
            '--end-y': `${handPosition.y}%`
          }}
        >
          <div className="card-draw-effect__card-wrapper">
            {/* Glow behind card */}
            <div
              className="card-draw-effect__card-glow"
              style={{ '--glow-intensity': config.glowIntensity }}
            />

            {/* Shimmer overlay */}
            <div className="card-draw-effect__shimmer" />

            {/* Actual Card Component */}
            <Card
              cardData={cardData}
              size="large"
              disabled={true}
            />
          </div>

          {/* Card Name Label - shown during showcase */}
          <div className="card-draw-effect__card-label">
            <span className="card-draw-effect__card-name">{cardData.name}</span>
            {cardData.value && (
              <span className="card-draw-effect__card-value">+{cardData.value}</span>
            )}
          </div>
        </div>
      )}

      {/* Shockwave from card at center */}
      <div
        className="card-draw-effect__shockwave"
        style={{
          left: '50%',
          top: '45%'
        }}
      />
    </div>
  )
}

CardDrawEffect.propTypes = {
  cardData: PropTypes.object,
  isActive: PropTypes.bool,
  onComplete: PropTypes.func,
  rarity: PropTypes.oneOf(['common', 'rare', 'legendary']),
  deckPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  handPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  })
}

export default CardDrawEffect
