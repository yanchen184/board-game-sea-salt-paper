/**
 * Card Definitions
 * 卡片定義 - 從配置檔讀取
 *
 * Card Types:
 * - pair_effect: Cards with special effects when paired
 * - collection: Cards valuable for collecting
 * - multiplier: Cards that multiply other card values
 * - special: Cards with unique scoring (Mermaids)
 */

import { DECK_CONFIG } from '../config/deckConfig.js'

/**
 * Generate multiple card instances
 * @param {string} name - Card name
 * @param {number} count - Number of cards to generate
 * @param {Object} properties - Card properties
 * @returns {Array} Array of card objects
 */
function generateCards(name, count, properties) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${name.toLowerCase()}_${i + 1}`,
    name,
    ...properties
  }))
}

// 從配置檔讀取卡片數量並生成卡片
// Fish - 魚
const fishCards = DECK_CONFIG.Fish.enabled ? generateCards('Fish', DECK_CONFIG.Fish.count, {
  type: 'pair_effect',
  value: DECK_CONFIG.Fish.value,
  color: DECK_CONFIG.Fish.color,
  emoji: DECK_CONFIG.Fish.emoji,
  pairEffect: 'draw_blind',
  description: '配對時，從牌庫抽 1 張牌'
}) : []

// Crab - 螃蟹
const crabCards = DECK_CONFIG.Crab.enabled ? generateCards('Crab', DECK_CONFIG.Crab.count, {
  type: 'pair_effect',
  value: DECK_CONFIG.Crab.value,
  color: DECK_CONFIG.Crab.color,
  emoji: DECK_CONFIG.Crab.emoji,
  pairEffect: 'draw_discard',
  description: '配對時，從任一棄牌堆拿 1 張牌'
}) : []

// Shell - 貝殼
const shellCards = DECK_CONFIG.Shell.enabled ? generateCards('Shell', DECK_CONFIG.Shell.count, {
  type: 'collection',
  value: DECK_CONFIG.Shell.value,
  color: DECK_CONFIG.Shell.color,
  emoji: DECK_CONFIG.Shell.emoji,
  pairEffect: null,
  description: '收集卡，可被章魚加倍'
}) : []

// Starfish - 海星
const starfishCards = DECK_CONFIG.Starfish.enabled ? generateCards('Starfish', DECK_CONFIG.Starfish.count, {
  type: 'collection',
  value: DECK_CONFIG.Starfish.value,
  color: DECK_CONFIG.Starfish.color,
  emoji: DECK_CONFIG.Starfish.emoji,
  pairEffect: null,
  description: '收集卡，價值 2 分'
}) : []

// Sailboat - 帆船
const sailboatCards = DECK_CONFIG.Sailboat.enabled ? generateCards('Sailboat', DECK_CONFIG.Sailboat.count, {
  type: 'pair_effect',
  value: DECK_CONFIG.Sailboat.value,
  color: DECK_CONFIG.Sailboat.color,
  emoji: DECK_CONFIG.Sailboat.emoji,
  pairEffect: 'extra_turn',
  description: '配對時，獲得額外回合'
}) : []

// Shark - 鯊魚
const sharkCards = DECK_CONFIG.Shark.enabled ? generateCards('Shark', DECK_CONFIG.Shark.count, {
  type: 'pair_effect',
  value: DECK_CONFIG.Shark.value,
  color: DECK_CONFIG.Shark.color,
  emoji: DECK_CONFIG.Shark.emoji,
  pairEffect: 'steal_card',
  description: '可與游泳者配對，偷取對手一張牌'
}) : []

// Swimmer - 游泳者
const swimmerCards = DECK_CONFIG.Swimmer.enabled ? generateCards('Swimmer', DECK_CONFIG.Swimmer.count, {
  type: 'pair_effect',
  value: DECK_CONFIG.Swimmer.value,
  color: DECK_CONFIG.Swimmer.color,
  emoji: DECK_CONFIG.Swimmer.emoji,
  pairEffect: 'steal_card',
  description: '可與鯊魚配對，偷取對手一張牌'
}) : []

// Sailor - 水手
const sailorCards = DECK_CONFIG.Sailor.enabled ? generateCards('Sailor', DECK_CONFIG.Sailor.count, {
  type: 'collection',
  value: DECK_CONFIG.Sailor.value,
  color: DECK_CONFIG.Sailor.color,
  emoji: DECK_CONFIG.Sailor.emoji,
  pairEffect: null,
  description: '收集卡，1張=0分，2張=5分'
}) : []

// Octopus - 章魚
const octopusCards = DECK_CONFIG.Octopus.enabled ? generateCards('Octopus', DECK_CONFIG.Octopus.count, {
  type: 'multiplier',
  value: DECK_CONFIG.Octopus.value,
  color: DECK_CONFIG.Octopus.color,
  emoji: DECK_CONFIG.Octopus.emoji,
  pairEffect: null,
  description: '加成卡：讓貝殼分數×2（1分→2分）'
}) : []

// Penguin - 企鵝
const penguinCards = DECK_CONFIG.Penguin.enabled ? generateCards('Penguin', DECK_CONFIG.Penguin.count, {
  type: 'multiplier',
  value: DECK_CONFIG.Penguin.value,
  color: DECK_CONFIG.Penguin.color,
  emoji: DECK_CONFIG.Penguin.emoji,
  pairEffect: null,
  multiplierTarget: 'Pair',
  multiplierValue: 2,
  description: '每個配對獎勵加倍為 2 分'
}) : []

// Lighthouse - 燈塔
const lighthouseCards = DECK_CONFIG.Lighthouse.enabled ? generateCards('Lighthouse', DECK_CONFIG.Lighthouse.count, {
  type: 'multiplier',
  value: DECK_CONFIG.Lighthouse.value,
  color: DECK_CONFIG.Lighthouse.color,
  emoji: DECK_CONFIG.Lighthouse.emoji,
  pairEffect: null,
  multiplierTarget: 'Sailboat',
  multiplierValue: 1,
  description: '每張帆船額外獲得 1 分'
}) : []

// FishSchool - 魚群
const fishSchoolCards = DECK_CONFIG.FishSchool.enabled ? generateCards('FishSchool', DECK_CONFIG.FishSchool.count, {
  type: 'multiplier',
  value: DECK_CONFIG.FishSchool.value,
  color: DECK_CONFIG.FishSchool.color,
  emoji: DECK_CONFIG.FishSchool.emoji,
  pairEffect: null,
  multiplierTarget: 'Fish',
  multiplierValue: 1,
  description: '每張魚額外獲得 1 分'
}) : []

// PenguinColony - 企鵝部落
const penguinColonyCards = DECK_CONFIG.PenguinColony.enabled ? generateCards('PenguinColony', DECK_CONFIG.PenguinColony.count, {
  type: 'multiplier',
  value: DECK_CONFIG.PenguinColony.value,
  color: DECK_CONFIG.PenguinColony.color,
  emoji: DECK_CONFIG.PenguinColony.emoji,
  pairEffect: null,
  multiplierTarget: 'Penguin',
  multiplierValue: 2,
  description: '每張企鵝額外獲得 2 分'
}) : []

// Captain - 船長
const captainCards = DECK_CONFIG.Captain.enabled ? generateCards('Captain', DECK_CONFIG.Captain.count, {
  type: 'multiplier',
  value: DECK_CONFIG.Captain.value,
  color: DECK_CONFIG.Captain.color,
  emoji: DECK_CONFIG.Captain.emoji,
  pairEffect: null,
  multiplierTarget: 'Sailor',
  multiplierValue: 3,
  description: '每張水手額外獲得 3 分'
}) : []

// Seagull - 海鷗 (已禁用)
const seagullCards = DECK_CONFIG.Seagull.enabled ? generateCards('Seagull', DECK_CONFIG.Seagull.count, {
  type: 'multiplier',
  value: DECK_CONFIG.Seagull.value,
  color: DECK_CONFIG.Seagull.color,
  emoji: DECK_CONFIG.Seagull.emoji,
  pairEffect: null,
  multiplierTarget: ['Fish', 'Crab'],
  multiplierValue: 2,
  description: '每個魚和螃蟹價值加倍為 2 分'
}) : []

// Mermaid - 美人魚
const mermaidCards = DECK_CONFIG.Mermaid.enabled ? generateCards('Mermaid', DECK_CONFIG.Mermaid.count, {
  type: 'special',
  value: DECK_CONFIG.Mermaid.value,
  color: DECK_CONFIG.Mermaid.color,
  emoji: DECK_CONFIG.Mermaid.emoji,
  pairEffect: null,
  description: '特殊計分：第1張=最多顏色數量，第2張=次多，依此類推。4張直接獲勝！'
}) : []

/**
 * All cards in the game
 * @type {Array<Object>}
 */
export const ALL_CARDS = [
  ...fishCards,
  ...crabCards,
  ...shellCards,
  ...starfishCards,
  ...sailboatCards,
  ...sharkCards,
  ...swimmerCards,
  ...sailorCards,
  ...octopusCards,
  ...penguinCards,
  ...lighthouseCards,
  ...fishSchoolCards,
  ...penguinColonyCards,
  ...captainCards,
  ...seagullCards,
  ...mermaidCards
]

/**
 * Card counts by type (for reference and validation)
 */
export const CARD_COUNTS = {
  Fish: 10,
  Crab: 10,
  Shell: 8,
  Starfish: 8,
  Sailboat: 6,
  Shark: 6,
  Swimmer: 6,
  Octopus: 4,
  Penguin: 4,
  Seagull: 4,
  Mermaid: 6,
  TOTAL: 72
}

/**
 * Get a card by its ID
 * @param {string} cardId - Card ID
 * @returns {Object|undefined} Card object or undefined
 */
export function getCardById(cardId) {
  return ALL_CARDS.find(card => card.id === cardId)
}

/**
 * Get all cards of a specific name
 * @param {string} cardName - Card name
 * @returns {Array} Array of card objects
 */
export function getCardsByName(cardName) {
  return ALL_CARDS.filter(card => card.name === cardName)
}

export default ALL_CARDS
