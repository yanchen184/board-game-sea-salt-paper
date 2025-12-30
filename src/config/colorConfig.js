/**
 * 顏色配置檔案
 * Color Configuration File
 *
 * 定義遊戲中可用的顏色及其數量
 * 每局遊戲開始時，這些顏色會隨機分配給所有卡牌
 */

/**
 * 可用顏色定義
 * @type {Object}
 */
export const GAME_COLORS = {
  blue: {
    name: '藍色',
    nameEn: 'Blue',
    hex: '#3B82F6',
    borderColor: '#2563EB',
    lightBg: 'rgba(59, 130, 246, 0.15)',
    emoji: '🔵'
  },
  red: {
    name: '紅色',
    nameEn: 'Red',
    hex: '#EF4444',
    borderColor: '#DC2626',
    lightBg: 'rgba(239, 68, 68, 0.15)',
    emoji: '🔴'
  },
  green: {
    name: '綠色',
    nameEn: 'Green',
    hex: '#22C55E',
    borderColor: '#16A34A',
    lightBg: 'rgba(34, 197, 94, 0.15)',
    emoji: '🟢'
  },
  yellow: {
    name: '黃色',
    nameEn: 'Yellow',
    hex: '#EAB308',
    borderColor: '#CA8A04',
    lightBg: 'rgba(234, 179, 8, 0.15)',
    emoji: '🟡'
  },
  purple: {
    name: '紫色',
    nameEn: 'Purple',
    hex: '#A855F7',
    borderColor: '#9333EA',
    lightBg: 'rgba(168, 85, 247, 0.15)',
    emoji: '🟣'
  },
  black: {
    name: '黑色',
    nameEn: 'Black',
    hex: '#374151',
    borderColor: '#1F2937',
    lightBg: 'rgba(55, 65, 81, 0.15)',
    emoji: '⚫'
  },
  white: {
    name: '白色',
    nameEn: 'White',
    hex: '#F8FAFC',
    borderColor: '#CBD5E1',
    lightBg: 'rgba(248, 250, 252, 0.5)',
    emoji: '⚪',
    isMermaidOnly: true  // 標記此顏色專屬美人魚
  }
}

/**
 * 顏色分配配置
 * 總數應該等於或大於牌庫中的卡牌總數
 *
 * @type {Object}
 */
export const COLOR_DISTRIBUTION = {
  blue: 10,
  red: 10,
  green: 10,
  yellow: 10,
  purple: 10,
  black: 8
}

/**
 * 取得顏色池
 * 建立一個包含所有顏色的陣列，每個顏色出現的次數根據 COLOR_DISTRIBUTION
 *
 * @returns {Array<string>} 顏色池陣列
 */
export function createColorPool() {
  const pool = []

  Object.entries(COLOR_DISTRIBUTION).forEach(([color, count]) => {
    for (let i = 0; i < count; i++) {
      pool.push(color)
    }
  })

  return pool
}

/**
 * 洗亂顏色池
 * Fisher-Yates 洗牌演算法
 *
 * @param {Array<string>} pool - 顏色池
 * @returns {Array<string>} 洗亂後的顏色池
 */
export function shuffleColorPool(pool) {
  const shuffled = [...pool]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

/**
 * 為卡牌陣列分配隨機顏色
 * 特別規則：美人魚 (Mermaid) 固定為白色，不參與隨機分配
 *
 * @param {Array<Object>} cards - 卡牌陣列
 * @returns {Array<Object>} 帶有隨機顏色的卡牌陣列
 */
export function assignRandomColors(cards) {
  // 建立並洗亂顏色池
  let colorPool = shuffleColorPool(createColorPool())

  // 如果卡牌數量超過顏色池，重複顏色池
  while (colorPool.length < cards.length) {
    colorPool = [...colorPool, ...shuffleColorPool(createColorPool())]
  }

  let colorIndex = 0

  // 為每張卡牌分配顏色
  return cards.map((card) => {
    // 美人魚固定為白色
    if (card.name === 'Mermaid') {
      return {
        ...card,
        color: 'white'
      }
    }

    // 其他卡牌按順序從顏色池取色
    const color = colorPool[colorIndex]
    colorIndex++

    return {
      ...card,
      color
    }
  })
}

/**
 * 計算手牌中各顏色的數量
 *
 * @param {Array<Object>} cards - 卡牌陣列
 * @returns {Object} 各顏色的數量統計
 */
export function countColorsByHand(cards) {
  const counts = {}

  // 初始化所有顏色為 0
  Object.keys(GAME_COLORS).forEach(color => {
    counts[color] = 0
  })

  // 計算每個顏色的數量
  cards.forEach(card => {
    if (card.color && counts[card.color] !== undefined) {
      counts[card.color]++
    }
  })

  return counts
}

/**
 * 取得顏色統計（包含詳細資訊）
 *
 * @param {Array<Object>} cards - 卡牌陣列
 * @returns {Array<Object>} 顏色統計陣列，按數量排序
 */
export function getColorStats(cards) {
  const counts = countColorsByHand(cards)

  return Object.entries(counts)
    .map(([colorKey, count]) => ({
      key: colorKey,
      count,
      ...GAME_COLORS[colorKey]
    }))
    .sort((a, b) => b.count - a.count) // 按數量降序排列
}

/**
 * 取得總顏色數
 * @returns {number} 顏色池中的總顏色數量
 */
export function getTotalColorCount() {
  return Object.values(COLOR_DISTRIBUTION).reduce((sum, count) => sum + count, 0)
}

// 開發模式下顯示配置資訊
// Check for both Vite (import.meta.env.DEV) and Node.js (process.env.NODE_ENV) environments
const isDev = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
              process.env.NODE_ENV === 'development' ||
              process.env.NODE_ENV !== 'production'

if (isDev) {
  console.log('🎨 顏色配置載入')
  console.log('總顏色數:', getTotalColorCount())
  console.log('顏色分佈:', COLOR_DISTRIBUTION)
}
