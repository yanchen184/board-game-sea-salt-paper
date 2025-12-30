/**
 * Score Service
 *
 * Handles all scoring calculations for Sea Salt & Paper
 * Including base scores, pairs, multipliers, mermaids, and color bonuses
 */

import { countCardsByColor, countCardsByName, filterCardsByName } from '../utils/cardHelpers.js'
import { PAIR_BONUS_VALUE, MULTIPLIERS } from '../data/gameRules.js'

/**
 * 配對牌類型列表
 * - 同名配對：Fish, Crab, Sailboat（每對獲得 1 分）
 * - 異名配對：Shark + Swimmer（必須各一張才算一對，每對 1 分）
 */
const SAME_NAME_PAIR_TYPES = ['Fish', 'Crab', 'Sailboat']  // 同名配對
const SPECIAL_PAIR = ['Shark', 'Swimmer']  // 異名配對（Shark + Swimmer）

/**
 * Calculate base score from cards
 *
 * Special rules:
 * - Shells: 2張=2分, 3張=4分, 4張=6分... (每對貝殼1分)
 * - Pair cards (Fish, Crab, Sailboat, Shark, Swimmer): 成對時每對 1 分
 *   例如：2張=1分, 3張=1分(第3張不計), 4張=2分
 * - Other cards: Sum of card values
 *
 * @param {Array} cards - Array of card objects
 * @returns {number} Base score
 */
export function calculateBaseScore(cards) {
  if (!cards || cards.length === 0) {
    return {
      total: 0,
      cardValues: 0,
      pairCardBonus: 0,
      collectionDetails: []
    }
  }

  // Count collection cards separately
  const shellCount = cards.filter(card => card.name === 'Shell').length
  const octopusCount = cards.filter(card => card.name === 'Octopus').length
  const penguinCount = cards.filter(card => card.name === 'Penguin').length
  const sailorCount = cards.filter(card => card.name === 'Sailor').length
  const otherCards = cards.filter(card =>
    card.name !== 'Shell' &&
    card.name !== 'Octopus' &&
    card.name !== 'Penguin' &&
    card.name !== 'Sailor'
  )

  // Calculate shell score: (count-1) * 2
  // 1=0, 2=2, 3=4, 4=6...
  const shellScore = shellCount > 0 ? (shellCount - 1) * 2 : 0

  // Calculate octopus score: (count-1) * 3
  // 1=0, 2=3, 3=6, 4=9, 5=12...
  const octopusScore = octopusCount > 0 ? (octopusCount - 1) * 3 : 0

  // Calculate penguin score: 1=1, 2=3, 3=5 (odd numbers)
  // Pattern: count * 2 - 1
  const penguinScore = penguinCount > 0 ? penguinCount * 2 - 1 : 0

  // Calculate sailor score: 1=0, 2=5
  const sailorScore = sailorCount >= 2 ? 5 : 0

  // Calculate other cards' score
  const cardValues = otherCards.reduce((sum, card) => {
    return sum + (card.value || 0)
  }, 0)

  // 計算配對牌獎勵分數
  // 1. 同名配對（Fish, Crab, Sailboat）：每對 1 分
  // 2. 異名配對（Shark + Swimmer）：必須各一張才算一對，每對 1 分
  const pairCardCounts = {}

  // 處理同名配對
  SAME_NAME_PAIR_TYPES.forEach(type => {
    const count = cards.filter(card => card.name === type).length
    if (count >= 2) {
      pairCardCounts[type] = Math.floor(count / 2) // 計算配對數
    }
  })

  // 處理 Shark + Swimmer 異名配對
  const sharkCount = cards.filter(card => card.name === 'Shark').length
  const swimmerCount = cards.filter(card => card.name === 'Swimmer').length
  const sharkSwimmerPairs = Math.min(sharkCount, swimmerCount) // Shark + Swimmer 配對數

  if (sharkSwimmerPairs > 0) {
    pairCardCounts['Shark-Swimmer'] = sharkSwimmerPairs
  }

  const totalPairs = Object.values(pairCardCounts).reduce((sum, pairs) => sum + pairs, 0)
  const pairCardBonus = totalPairs * 1  // 每對 1 分

  // Build collection details array
  const collectionDetails = []
  if (shellScore > 0) {
    collectionDetails.push({ name: 'Shell', emoji: '🐚', count: shellCount, score: shellScore, rule: `${shellCount}張=(${shellCount}-1)×2` })
  }
  if (octopusScore > 0) {
    collectionDetails.push({ name: 'Octopus', emoji: '🐙', count: octopusCount, score: octopusScore, rule: `${octopusCount}張=(${octopusCount}-1)×3` })
  }
  if (penguinScore > 0) {
    collectionDetails.push({ name: 'Penguin', emoji: '🐧', count: penguinCount, score: penguinScore, rule: `${penguinCount}張=${penguinCount}×2-1` })
  }
  if (sailorScore > 0) {
    collectionDetails.push({ name: 'Sailor', emoji: '🧑‍✈️', count: sailorCount, score: sailorScore, rule: '2張=5分' })
  }
  if (pairCardBonus > 0) {
    const pairCardEmojis = {
      Fish: '🐟',
      Crab: '🦀',
      Sailboat: '⛵',
      Shark: '🦈',
      Swimmer: '🏊',
      'Shark-Swimmer': '🦈🏊'
    }

    Object.entries(pairCardCounts).forEach(([type, pairs]) => {
      if (type === 'Shark-Swimmer') {
        // Shark + Swimmer 異名配對
        collectionDetails.push({
          name: type,
          emoji: pairCardEmojis[type],
          count: sharkCount + swimmerCount,
          score: pairs * 1,
          rule: `${sharkCount}🦈+${swimmerCount}🏊(${pairs}對)×1分`
        })
      } else {
        // 同名配對
        const totalCards = cards.filter(card => card.name === type).length
        collectionDetails.push({
          name: type,
          emoji: pairCardEmojis[type] || '🃏',
          count: totalCards,
          score: pairs * 1,
          rule: `${totalCards}張(${pairs}對)×1分`
        })
      }
    })
  }

  const total = shellScore + octopusScore + penguinScore + sailorScore + cardValues + pairCardBonus

  return {
    total,
    cardValues,
    pairCardBonus,
    collectionDetails
  }
}

/**
 * Calculate pair bonus
 * Each played pair gives +1 point
 *
 * @param {Array} playedPairs - Array of played pair objects
 * @returns {number} Pair bonus score
 */
export function calculatePairBonus(playedPairs) {
  if (!playedPairs || playedPairs.length === 0) return 0

  return playedPairs.length * PAIR_BONUS_VALUE
}

/**
 * Calculate multiplier bonuses
 *
 * Lighthouse: +1pt per Sailboat
 * Fish School: +1pt per Fish
 * Penguin Colony: +2pts per Penguin
 * Captain: +3pts per Sailor
 *
 * @param {Array} hand - Player's hand cards
 * @param {Array} playedPairs - Played pairs area
 * @returns {Object} Multiplier breakdown
 */
export function calculateMultipliers(hand, playedPairs) {
  // Add null-safety: playedPairs may be undefined in spectator mode
  const allCards = [...hand, ...(playedPairs || []).flatMap(p => p.cards || [])]

  // Count multiplier cards
  const penguinCount = filterCardsByName(allCards, 'Penguin').length
  const lighthouseCount = filterCardsByName(allCards, 'Lighthouse').length
  const fishSchoolCount = filterCardsByName(allCards, 'FishSchool').length
  const penguinColonyCount = filterCardsByName(allCards, 'PenguinColony').length
  const captainCount = filterCardsByName(allCards, 'Captain').length

  let lighthouseBonus = 0
  let fishSchoolBonus = 0
  let penguinColonyBonus = 0
  let captainBonus = 0

  // Lighthouse: +1pt per Sailboat
  if (lighthouseCount > 0) {
    const sailboatCount = filterCardsByName(allCards, 'Sailboat').length
    lighthouseBonus = sailboatCount * 1
  }

  // Fish School: +1pt per Fish
  if (fishSchoolCount > 0) {
    const fishCount = filterCardsByName(allCards, 'Fish').length
    fishSchoolBonus = fishCount * 1
  }

  // Penguin Colony: +2pts per Penguin
  if (penguinColonyCount > 0) {
    penguinColonyBonus = penguinCount * 2
  }

  // Captain: +3pts per Sailor
  if (captainCount > 0) {
    const sailorCount = filterCardsByName(allCards, 'Sailor').length
    captainBonus = sailorCount * 3
  }

  return {
    lighthouse: lighthouseBonus,
    fishSchool: fishSchoolBonus,
    penguinColony: penguinColonyBonus,
    captain: captainBonus,
    total: lighthouseBonus + fishSchoolBonus + penguinColonyBonus + captainBonus
  }
}

/**
 * Calculate mermaid score
 * COMPLEX SCORING:
 * 1st mermaid = count of most common color
 * 2nd mermaid = count of 2nd most common color
 * 3rd mermaid = count of 3rd most common color
 * etc.
 *
 * Mermaids themselves DON'T count toward color bonus
 *
 * @param {Array} hand - Player's hand cards
 * @param {Array} playedPairs - Played pairs area
 * @returns {Object} Mermaid score with details { total, details: [{color, count, score}] }
 */
export function calculateMermaidScore(hand, playedPairs) {
  // Add null-safety: playedPairs may be undefined in spectator mode
  const allCards = [...hand, ...(playedPairs || []).flatMap(p => p.cards || [])]

  const mermaidCount = filterCardsByName(allCards, 'Mermaid').length

  if (mermaidCount === 0) {
    return { total: 0, details: [] }
  }

  // Count colors (including mermaids' white color)
  // 美人魚的白色也算顏色，所以美人魚本身也計入統計
  const colorCounts = countCardsByColor(allCards)

  // Sort colors by count (descending) and create array with color names
  const sortedColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([color, count]) => ({ color, count }))

  // Build details array for each mermaid
  const details = []
  let total = 0

  for (let i = 0; i < mermaidCount; i++) {
    const colorData = sortedColors[i]
    const score = colorData?.count || 0
    const color = colorData?.color || 'none'

    total += score
    details.push({
      index: i + 1,
      color: color,
      colorName: getColorName(color),
      count: colorData?.count || 0,
      score: score
    })
  }

  return { total, details }
}

/**
 * Get color display name (Chinese)
 * @param {string} color - Color code
 * @returns {string} Color name in Chinese
 */
function getColorName(color) {
  const colorNames = {
    'blue': '藍色',
    'red': '紅色',
    'green': '綠色',
    'yellow': '黃色',
    'gray': '灰色',
    'purple': '紫色',
    'orange': '橙色',
    'none': '無'
  }
  return colorNames[color] || color
}

/**
 * Calculate color bonus
 * Count of most common color (including mermaids' white color)
 * 美人魚的白色也算顏色
 *
 * @param {Array} hand - Player's hand cards
 * @param {Array} playedPairs - Played pairs area
 * @returns {number} Color bonus
 */
export function calculateColorBonus(hand, playedPairs) {
  // Add null-safety: playedPairs may be undefined in spectator mode
  const allCards = [...hand, ...(playedPairs || []).flatMap(p => p.cards || [])]

  if (allCards.length === 0) return 0

  const colorCounts = countCardsByColor(allCards)
  const counts = Object.values(colorCounts)

  if (counts.length === 0) return 0

  // Return the highest color count
  return Math.max(...counts)
}

/**
 * Calculate total score for a player
 * Combines all scoring components
 *
 * @param {Array} hand - Player's hand cards
 * @param {Array} playedPairs - Played pairs with card objects
 * @param {Object} options - Scoring options
 * @param {boolean} [options.includeColorBonus=false] - Whether to include color bonus
 * @returns {Object} Score breakdown
 */
export function calculateScore(hand, playedPairs, options = {}) {
  const { includeColorBonus = false } = options

  // Flatten played pairs to get actual card objects
  // Add null-safety: playedPairs may be undefined in spectator mode
  const pairCards = (playedPairs || []).map(pair => pair.cards || []).flat()
  const allCards = [...hand, ...pairCards]

  // Calculate base score from HAND ONLY (not played pairs)
  // Reason: Played pairs are already counted separately in calculatePairBonus
  // If we use allCards here, pair cards (Fish, Crab, etc.) will be counted twice:
  // 1. In calculateBaseScore as pairCardBonus
  // 2. In calculatePairBonus as played pairs
  const baseResult = calculateBaseScore(hand)

  // Calculate multipliers using hand + played pairs
  // These functions will internally combine hand and playedPairs
  const multipliers = calculateMultipliers(hand, playedPairs)

  // Calculate pair bonus from played pairs
  const pairs = calculatePairBonus(playedPairs)

  // Calculate mermaid score using hand + played pairs
  const mermaidResult = calculateMermaidScore(hand, playedPairs)

  // Calculate color bonus using hand + played pairs
  const colorBonus = includeColorBonus ? calculateColorBonus(hand, playedPairs) : 0

  // Total score
  const total = baseResult.total + pairs + multipliers.total + mermaidResult.total + colorBonus

  return {
    base: baseResult.total,
    baseDetails: {
      cardValues: baseResult.cardValues,
      pairCardBonus: baseResult.pairCardBonus,
      collectionDetails: baseResult.collectionDetails
    },
    pairs,
    multipliers: multipliers.total,
    multiplierDetails: {
      lighthouse: multipliers.lighthouse,
      fishSchool: multipliers.fishSchool,
      penguinColony: multipliers.penguinColony,
      captain: multipliers.captain
    },
    mermaids: mermaidResult.total,
    mermaidDetails: mermaidResult.details,
    colorBonus,
    total
  }
}

/**
 * Check if player can declare (score >= 7)
 *
 * @param {Object} scoreBreakdown - Score breakdown from calculateScore
 * @returns {boolean} Whether player can declare
 */
export function canDeclare(scoreBreakdown) {
  return scoreBreakdown.total >= 7
}

/**
 * Calculate scores for "Last Chance" declare mode
 *
 * Rules:
 * - If declarer wins (has highest score):
 *   - Declarer gets card score + color bonus
 *   - Others get 0
 * - If declarer loses (doesn't have highest score):
 *   - Declarer gets 0
 *   - Others get card score only (NO color bonus)
 *
 * @param {Object} players - Map of player IDs to player objects
 * @param {string} declaringPlayerId - ID of player who declared
 * @returns {Object} Score results for each player
 */
export function calculateLastChanceScores(players, declaringPlayerId) {
  const playerIds = Object.keys(players)
  const scores = {}

  // Calculate card scores for all players (without color bonus)
  // 同時計算每個玩家的顏色獎勵（用於顯示）
  playerIds.forEach(playerId => {
    const player = players[playerId]
    scores[playerId] = calculateScore(
      player.hand || [],
      player.playedPairs || [],
      { includeColorBonus: true }  // 改為 true，計算包含顏色獎勵的完整分數
    )
  })

  // Find highest score (比較卡牌分數，不含顏色獎勵)
  const cardScoreOnly = {}
  playerIds.forEach(playerId => {
    const player = players[playerId]
    cardScoreOnly[playerId] = calculateScore(
      player.hand || [],
      player.playedPairs || [],
      { includeColorBonus: false }
    )
  })

  const declarerScore = cardScoreOnly[declaringPlayerId].total
  const highestScore = Math.max(...Object.values(cardScoreOnly).map(s => s.total))
  const declarerHasHighest = declarerScore >= highestScore

  // Calculate final scores based on rules
  const finalScores = {}

  playerIds.forEach(playerId => {
    const player = players[playerId]
    const isDeclarer = playerId === declaringPlayerId
    const colorBonus = scores[playerId].colorBonus  // 從已計算的分數中取得

    if (declarerHasHighest) {
      // 宣告者獲勝：宣告者得到卡牌分數 + 顏色獎勵，其他玩家只得顏色獎勵
      if (isDeclarer) {
        // Declarer wins: gets card score + color bonus
        finalScores[playerId] = {
          ...scores[playerId],
          total: cardScoreOnly[playerId].total + colorBonus
        }
      } else {
        // Other players get color bonus only
        finalScores[playerId] = {
          ...scores[playerId],
          base: 0,
          pairs: 0,
          multipliers: 0,
          mermaids: 0,
          colorBonus: colorBonus,  // 保留 colorBonus 用於顯示
          total: colorBonus  // 最終分數只有顏色獎勵
        }
      }
    } else {
      // 宣告者失敗：宣告者只得顏色獎勵，其他玩家得到卡牌分數 + 顏色獎勵
      if (isDeclarer) {
        // Declarer loses: gets color bonus only
        finalScores[playerId] = {
          ...scores[playerId],
          base: 0,
          pairs: 0,
          multipliers: 0,
          mermaids: 0,
          colorBonus: colorBonus,
          total: colorBonus  // 只得顏色獎勵
        }
      } else {
        // Other players get card score + color bonus
        finalScores[playerId] = {
          ...scores[playerId],
          total: cardScoreOnly[playerId].total + colorBonus
        }
      }
    }
  })

  return {
    scores: finalScores,      // 最終分數（根據規則分配）
    cardScores: cardScoreOnly,        // 原始卡牌分數（不含顏色獎勵）
    declarerHasHighest,
    highestScore
  }
}

export default {
  calculateBaseScore,
  calculatePairBonus,
  calculateMultipliers,
  calculateMermaidScore,
  calculateColorBonus,
  calculateScore,
  canDeclare,
  calculateLastChanceScores
}
