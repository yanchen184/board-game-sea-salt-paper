/**
 * Card Score Helpers
 *
 * 計算每張卡片的「實際得分」
 * Calculate the "actual score" for individual cards
 */

/**
 * 計算單張卡片在當前手牌中的實際得分
 *
 * @param {Object} card - 要計算的卡片
 * @param {Array} allCards - 所有卡片（手牌 + 已打出的對子）
 * @param {number} cardIndex - 該卡片在同名卡片中的索引（用於判斷是否能配對）
 * @returns {number} 該卡片的實際得分
 */
export function calculateCardActualScore(card, allCards, cardIndex = 0) {
  if (!card || !allCards) return 0

  const cardName = card.name

  // 統計同名卡片數量
  const sameCards = allCards.filter(c => c.name === cardName)
  const count = sameCards.length

  // 配對效果卡：Fish, Crab, Sailboat - 同名配對
  // Shark + Swimmer - 異名配對（各一張）
  if (['Fish', 'Crab', 'Sailboat'].includes(cardName)) {
    // 同名配對：每對 1 分（每張 0.5 分），單張 0 分
    const pairCount = Math.floor(count / 2)
    const pairedCardsCount = pairCount * 2

    if (cardIndex < pairedCardsCount) {
      return 0.5
    }
    return 0
  }

  // Shark + Swimmer 特殊配對：必須各一張
  if (cardName === 'Shark' || cardName === 'Swimmer') {
    const sharkCount = allCards.filter(c => c.name === 'Shark').length
    const swimmerCount = allCards.filter(c => c.name === 'Swimmer').length

    // 可以組成的 Shark-Swimmer 對數
    const pairCount = Math.min(sharkCount, swimmerCount)

    if (pairCount > 0) {
      // 有配對成功，每張配對的卡片得 0.5 分
      if (cardIndex < pairCount) {
        return 0.5
      }
    }

    // 沒有配對或超過配對數量的卡片，0 分
    return 0
  }

  // 貝殼：(count - 1) * 2 = 總分，然後平均分配
  // 1=0, 2=2, 3=4, 4=6
  if (cardName === 'Shell') {
    if (count === 1) return 0
    const totalScore = (count - 1) * 2
    return totalScore / count
  }

  // 章魚：(count - 1) * 3 = 總分，然後平均分配
  // 1=0, 2=3, 3=6, 4=9
  if (cardName === 'Octopus') {
    if (count === 1) return 0
    const totalScore = (count - 1) * 3
    return totalScore / count
  }

  // 企鵝：count * 2 - 1 = 總分，然後平均分配
  // 1=1, 2=3, 3=5
  if (cardName === 'Penguin') {
    const totalScore = count * 2 - 1
    return totalScore / count
  }

  // 水手：2張=5分，1張=0分
  if (cardName === 'Sailor') {
    if (count === 2) return 5 / 2 // 2.5 分
    return 0
  }

  // 倍增卡：需要計算它們對其他卡的加成
  // Lighthouse: 每張帆船 +1 分
  if (cardName === 'Lighthouse') {
    const sailboatCount = allCards.filter(c => c.name === 'Sailboat').length
    return sailboatCount // 燈塔本身顯示它提供的總加成
  }

  // Fish School: 每張魚 +1 分
  if (cardName === 'FishSchool') {
    const fishCount = allCards.filter(c => c.name === 'Fish').length
    return fishCount
  }

  // Penguin Colony: 每張企鵝 +2 分
  if (cardName === 'PenguinColony') {
    const penguinCount = allCards.filter(c => c.name === 'Penguin').length
    return penguinCount * 2
  }

  // Captain: 每張水手 +3 分
  if (cardName === 'Captain') {
    const sailorCount = allCards.filter(c => c.name === 'Sailor').length
    return sailorCount * 3
  }

  // 美人魚：複雜計分，根據顏色數量
  if (cardName === 'Mermaid') {
    const mermaidCount = allCards.filter(c => c.name === 'Mermaid').length

    // 統計非美人魚卡片的顏色分布
    const nonMermaidCards = allCards.filter(c => c.name !== 'Mermaid')
    const colorCounts = {}
    nonMermaidCards.forEach(c => {
      const color = c.color
      colorCounts[color] = (colorCounts[color] || 0) + 1
    })

    // 取得顏色數量的排序（從大到小）
    const sortedCounts = Object.values(colorCounts).sort((a, b) => b - a)

    // 計算美人魚的總分
    let totalMermaidScore = 0
    for (let i = 0; i < mermaidCount; i++) {
      totalMermaidScore += sortedCounts[i] || 0
    }

    // 平均分配給每張美人魚
    return mermaidCount > 0 ? totalMermaidScore / mermaidCount : 0
  }

  // 其他卡片返回 0
  return 0
}

/**
 * 計算手牌中每張卡片的實際得分（批次處理）
 *
 * @param {Array} handCards - 手牌
 * @param {Array} playedPairs - 已打出的對子
 * @returns {Map} 卡片 ID 對應實際得分的 Map
 */
export function calculateAllCardsActualScores(handCards, playedPairs = []) {
  // 合併手牌和已打出的對子卡片
  const pairCards = playedPairs.flatMap(pair => pair.cards || [])
  const allCards = [...handCards, ...pairCards]

  // 統計每種卡片的索引計數器
  const cardIndexCounters = new Map()

  // 計算每張卡片的實際得分
  const scoreMap = new Map()

  handCards.forEach(card => {
    const cardName = card.name

    // 取得該卡片在同名卡片中的索引
    const currentIndex = cardIndexCounters.get(cardName) || 0
    cardIndexCounters.set(cardName, currentIndex + 1)

    // 計算實際得分
    const actualScore = calculateCardActualScore(card, allCards, currentIndex)
    scoreMap.set(card.id, actualScore)
  })

  return scoreMap
}

/**
 * 格式化分數顯示（保留一位小數，整數則不顯示小數點）
 *
 * @param {number} score - 分數
 * @returns {string} 格式化後的分數字串
 */
export function formatScore(score) {
  if (score === 0) return '0'

  // 如果是整數，直接返回
  if (Number.isInteger(score)) return score.toString()

  // 保留一位小數
  return score.toFixed(1)
}
