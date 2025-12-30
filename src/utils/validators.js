import { ROOM_CODE, PLAYER_NAME } from './constants'

/**
 * Validate room code format
 * Must be 6 alphanumeric uppercase characters
 *
 * @param {string} code - Room code to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateRoomCode(code) {
  if (!code) {
    return { valid: false, error: 'Room code is required' }
  }

  if (typeof code !== 'string') {
    return { valid: false, error: 'Room code must be a string' }
  }

  const trimmedCode = code.trim().toUpperCase()

  if (trimmedCode.length !== ROOM_CODE.LENGTH) {
    return { valid: false, error: `Room code must be ${ROOM_CODE.LENGTH} characters` }
  }

  if (!ROOM_CODE.PATTERN.test(trimmedCode)) {
    return { valid: false, error: 'Room code must contain only letters and numbers' }
  }

  return { valid: true, error: null }
}

/**
 * Validate player name
 * Must be 1-20 characters, alphanumeric with spaces, underscores, hyphens
 *
 * @param {string} name - Player name to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validatePlayerName(name) {
  if (!name) {
    return { valid: false, error: 'Player name is required' }
  }

  if (typeof name !== 'string') {
    return { valid: false, error: 'Player name must be a string' }
  }

  const trimmedName = name.trim()

  if (trimmedName.length < PLAYER_NAME.MIN_LENGTH) {
    return { valid: false, error: `Player name must be at least ${PLAYER_NAME.MIN_LENGTH} character` }
  }

  if (trimmedName.length > PLAYER_NAME.MAX_LENGTH) {
    return { valid: false, error: `Player name must be at most ${PLAYER_NAME.MAX_LENGTH} characters` }
  }

  if (!PLAYER_NAME.PATTERN.test(trimmedName)) {
    return { valid: false, error: 'Player name can only contain letters, numbers, spaces, underscores, and hyphens' }
  }

  return { valid: true, error: null }
}

/**
 * Validate game settings
 *
 * @param {Object} settings - Game settings object
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateGameSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    return { valid: false, error: 'Settings must be an object' }
  }

  // Validate maxPlayers
  if (settings.maxPlayers !== undefined) {
    if (typeof settings.maxPlayers !== 'number') {
      return { valid: false, error: 'maxPlayers must be a number' }
    }
    if (settings.maxPlayers < 2 || settings.maxPlayers > 4) {
      return { valid: false, error: 'maxPlayers must be between 2 and 4' }
    }
  }

  // Validate targetScore
  if (settings.targetScore !== undefined) {
    if (settings.targetScore !== 'auto' && typeof settings.targetScore !== 'number') {
      return { valid: false, error: 'targetScore must be "auto" or a number' }
    }
    if (typeof settings.targetScore === 'number' && settings.targetScore < 20) {
      return { valid: false, error: 'targetScore must be at least 20' }
    }
  }

  // Validate customScore
  if (settings.customScore !== undefined && settings.customScore !== null) {
    if (typeof settings.customScore !== 'number') {
      return { valid: false, error: 'customScore must be a number or null' }
    }
    if (settings.customScore < 20 || settings.customScore > 100) {
      return { valid: false, error: 'customScore must be between 20 and 100' }
    }
  }

  // Validate startingHandSize
  if (settings.startingHandSize !== undefined) {
    if (typeof settings.startingHandSize !== 'number') {
      return { valid: false, error: 'startingHandSize must be a number' }
    }
    if (settings.startingHandSize < 0 || settings.startingHandSize > 10) {
      return { valid: false, error: 'startingHandSize must be between 0 and 10' }
    }
  }

  // Validate boolean flags
  const booleanFields = ['mermaidsWin', 'colorBonus']
  for (const field of booleanFields) {
    if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
      return { valid: false, error: `${field} must be a boolean` }
    }
  }

  // Validate aiCount
  if (settings.aiCount !== undefined) {
    if (typeof settings.aiCount !== 'number') {
      return { valid: false, error: 'aiCount must be a number' }
    }
    if (settings.aiCount < 0 || settings.aiCount > 3) {
      return { valid: false, error: 'aiCount must be between 0 and 3' }
    }
  }

  // Validate aiDifficulty
  if (settings.aiDifficulty !== undefined) {
    const validDifficulties = ['easy', 'medium', 'hard']
    if (!validDifficulties.includes(settings.aiDifficulty)) {
      return { valid: false, error: 'aiDifficulty must be "easy", "medium", or "hard"' }
    }
  }

  return { valid: true, error: null }
}

/**
 * Generate a random room code
 * @returns {string} 6-character room code
 */
export function generateRoomCode() {
  const charset = ROOM_CODE.CHARSET
  let code = ''

  for (let i = 0; i < ROOM_CODE.LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    code += charset[randomIndex]
  }

  return code
}

/**
 * Generate a random player name
 * @returns {string} Random player name
 */
export function generatePlayerName() {
  const adjectives = [
    'Swift', 'Brave', 'Clever', 'Mighty', 'Noble', 'Silent', 'Wild', 'Fierce',
    'Gentle', 'Bold', 'Wise', 'Lucky', 'Happy', 'Sneaky', 'Royal', 'Ancient'
  ]

  const nouns = [
    'Sailor', 'Captain', 'Pirate', 'Admiral', 'Navigator', 'Explorer', 'Voyager', 'Mariner',
    'Dolphin', 'Whale', 'Shark', 'Turtle', 'Seagull', 'Octopus', 'Mermaid', 'Kraken'
  ]

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const randomNumber = Math.floor(Math.random() * 100)

  return `${randomAdjective}${randomNoun}${randomNumber}`
}

export default {
  validateRoomCode,
  validatePlayerName,
  validateGameSettings,
  generateRoomCode,
  generatePlayerName
}
