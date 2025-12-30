/**
 * Application Constants
 * Enums and constant values used throughout the application
 */

/**
 * Game status values
 */
export const GAME_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished'
}

/**
 * Turn phase values
 */
export const TURN_PHASE = {
  DRAW: 'draw',
  PAIR: 'pair',
  DECLARE: 'declare',
  DECLARE_SHOWING: 'declare_showing', // Show declarer's score before proceeding
  ROUND_END: 'round_end'
}

/**
 * Declare modes
 */
export const DECLARE_MODE = {
  STOP: 'stop',
  LAST_CHANCE: 'last_chance'
}

/**
 * Action types for action log
 */
export const ACTION_TYPE = {
  DRAW_DECK: 'draw_deck',
  DRAW_DISCARD_LEFT: 'draw_discard_left',
  DRAW_DISCARD_RIGHT: 'draw_discard_right',
  PLAY_PAIR: 'play_pair',
  PAIR_EFFECT: 'pair_effect',
  DECLARE_STOP: 'declare_stop',
  DECLARE_LAST_CHANCE: 'declare_last_chance',
  DECLARE_CONFIRMED: 'declare_confirmed', // After viewing declarer's score
  END_TURN: 'end_turn',
  END_ROUND: 'end_round',
  GAME_OVER: 'game_over'
}

/**
 * Player types
 */
export const PLAYER_TYPE = {
  HUMAN: 'human',
  AI: 'ai'
}

/**
 * AI difficulty levels
 */
export const AI_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
}

/**
 * Room code constraints
 */
export const ROOM_CODE = {
  LENGTH: 6,
  PATTERN: /^[A-Z0-9]{6}$/,
  CHARSET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
}

/**
 * Player name constraints
 */
export const PLAYER_NAME = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 20,
  PATTERN: /^[a-zA-Z0-9\s_-]+$/
}

/**
 * Action log constraints
 */
export const ACTION_LOG = {
  MAX_ENTRIES: 20
}

/**
 * Card animation durations (milliseconds)
 */
export const ANIMATION_DURATION = {
  CARD_DRAW: 500,
  CARD_DISCARD: 400,
  CARD_FLIP: 600,
  SCORE_UPDATE: 400
}

/**
 * AI timing (milliseconds)
 */
export const AI_TIMING = {
  MIN_DELAY: 1000,
  MAX_DELAY: 2000,
  THINK_TIME: 500
}

/**
 * Firebase paths
 */
export const FIREBASE_PATHS = {
  ROOMS: 'rooms',
  PLAYERS: 'players',
  GAMES: 'games',
  LEADERBOARD: 'leaderboard'
}

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  PLAYER_ID: 'sea_salt_paper_player_id',
  PLAYER_NAME: 'sea_salt_paper_player_name',
  CURRENT_ROOM: 'sea_salt_paper_current_room'
}

/**
 * Room types
 */
export const ROOM_TYPE = {
  NORMAL: 'normal',
  SPECTATOR: 'spectator'
}

/**
 * Game speed multipliers for spectator mode
 * Lower value = slower, higher value = faster
 */
export const GAME_SPEED = {
  SLOW: 0.5,
  NORMAL: 1.0,
  FAST: 2.0,
  TURBO: 4.0
}

/**
 * Spectator mode default settings
 */
export const SPECTATOR_DEFAULTS = {
  AI_DIFFICULTIES: ['hard', 'medium', 'medium', 'easy'],
  AI_NAMES: ['Captain Chen', 'Sailor Sam', 'Fisher Finn', 'Lucky Lucy'],
  AI_COLORS: ['blue', 'green', 'orange', 'pink'],
  GAME_SPEED: 1.0,
  AUTO_START: true,
  SHOW_AI_THINKING: false,
  SHOW_ALL_HANDS: true
}

/**
 * AI action base delays (milliseconds)
 * Actual delays are divided by game speed
 */
export const SPECTATOR_AI_TIMING = {
  DRAW_DELAY: 1500,
  PAIR_DELAY: 1200,
  DECLARE_DELAY: 2000,
  CARD_CHOICE_DELAY: 1500,
  EFFECT_DELAY: 1000,
  TURN_TRANSITION_DELAY: 800
}

export default {
  GAME_STATUS,
  TURN_PHASE,
  DECLARE_MODE,
  ACTION_TYPE,
  PLAYER_TYPE,
  AI_DIFFICULTY,
  ROOM_CODE,
  PLAYER_NAME,
  ACTION_LOG,
  ANIMATION_DURATION,
  AI_TIMING,
  FIREBASE_PATHS,
  STORAGE_KEYS,
  ROOM_TYPE,
  GAME_SPEED,
  SPECTATOR_DEFAULTS,
  SPECTATOR_AI_TIMING
}
