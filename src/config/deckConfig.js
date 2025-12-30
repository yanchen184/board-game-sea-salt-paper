/**
 * 牌庫配置檔案
 * Deck Configuration File
 *
 * 修改此檔案中的數量，即可改變遊戲中的牌庫組成
 * Edit the quantities in this file to change the deck composition
 *
 * 使用方法：
 * 1. 修改下方的 DECK_CONFIG 物件中的數量
 * 2. 儲存檔案
 * 3. 重新開始遊戲，新的牌庫配置就會生效
 */

/**
 * 牌庫配置
 * @type {Object}
 */
export const DECK_CONFIG = {
  // ===== 基礎配對效果卡 (Pair Effect Cards) =====

  /**
   * 🐟 魚 - 藍色
   * 配對效果：從牌庫抽 1 張牌（暗抽）
   * Pair Effect: Draw 1 card from deck (blind)
   */
  Fish: {
    count: 7,         // 數量 (基本配置: 7)
    value: 0,         // 點數 (單張不計分，只有配對時才+1)
    color: 'blue',    // 顏色
    emoji: '🐟',
    enabled: true     // 是否啟用 (false = 完全移除此卡)
  },

  /**
   * 🦀 螃蟹 - 紅色
   * 配對效果：從任一棄牌堆拿 1 張牌
   * Pair Effect: Take any card from either discard pile
   */
  Crab: {
    count: 9,         // 數量 (基本配置: 9)
    value: 0,         // 點數 (單張不計分，只有配對時才+1)
    color: 'red',
    emoji: '🦀',
    enabled: true
  },

  /**
   * ⛵ 帆船 - 綠色
   * 配對效果：額外一個回合
   * Pair Effect: Extra turn
   */
  Sailboat: {
    count: 8,         // 數量 (基本配置: 8)
    value: 0,         // 點數 (單張不計分，只有配對時才+1)
    color: 'green',
    emoji: '⛵',
    enabled: true
  },

  /**
   * 🦈 鯊魚 - 灰色
   * 配對卡：單張不計分，配對+1分 + 配對效果（與游泳者配對偷牌）
   * Pair card: 0pts alone, +1 when paired + Pair effect (steal with Swimmer)
   */
  Shark: {
    count: 5,         // 數量 (基本配置: 5)
    value: 0,         // 點數 (單張不計分，配對時才+1)
    color: 'gray',
    emoji: '🦈',
    enabled: true
  },

  /**
   * 🏊 游泳者 - 黃色
   * 配對卡：單張不計分，配對+1分 + 配對效果（與鯊魚配對偷牌）
   * Pair card: 0pts alone, +1 when paired + Pair effect (steal with Shark)
   */
  Swimmer: {
    count: 5,         // 數量 (基本配置: 5)
    value: 0,         // 點數 (單張不計分，配對時才+1)
    color: 'yellow',
    emoji: '🏊',
    enabled: true
  },

  /**
   * 👨‍🌾 水手 - 黃色
   * 收集卡，計分：1=0, 2=5
   * Collection card, scoring: 1=0, 2=5
   */
  Sailor: {
    count: 2,         // 數量 (基本配置: 2)
    value: 0,         // 點數 (特殊計分規則: 1=0, 2=5)
    color: 'yellow',
    emoji: '👨‍🌾',
    enabled: true
  },

  // ===== 收集卡 (Collection Cards) =====

  /**
   * 🐚 貝殼 - 紫色
   * 收集卡，配對計分：1=0, 2=2, 3=4, 4=6...
   * Collection card, pair scoring: 1=0, 2=2, 3=4, 4=6...
   */
  Shell: {
    count: 6,         // 數量 (預設: 6)
    value: 0,         // 點數 (需配對才計分)
    color: 'purple',
    emoji: '🐚',
    enabled: true
  },

  /**
   * ⭐ 海星 - 橘色 (已移除)
   * Starfish - disabled
   */
  Starfish: {
    count: 0,         // 數量 (已移除)
    value: 0,
    color: 'orange',
    emoji: '⭐',
    enabled: false
  },

  // ===== 倍數卡 (Multiplier Cards) =====

  /**
   * 🐙 章魚 - 紫色
   * 收集卡，配對計分：1=0, 2=3, 3=6, 4=9, 5=12...
   * Collection card, pair scoring: 1=0, 2=3, 3=6, 4=9, 5=12...
   */
  Octopus: {
    count: 5,         // 數量 (預設: 5)
    value: 0,         // 點數 (需配對才計分)
    color: 'purple',
    emoji: '🐙',
    enabled: true
  },

  /**
   * 🐧 企鵝 - 黑白
   * 收集卡，計分：1=1, 2=3, 3=5
   * Collection card, scoring: 1=1, 2=3, 3=5
   */
  Penguin: {
    count: 3,         // 數量 (預設: 3)
    value: 0,         // 點數 (特殊計分規則)
    color: 'black',
    emoji: '🐧',
    enabled: true
  },

  // ===== 倍增卡 (Multiplier Cards) =====

  /**
   * 🗼 燈塔 - 白色
   * 倍增卡：每張帆船額外獲得1分，本身不計分
   * Multiplier card: +1pt per Sailboat, card itself worth 0
   */
  Lighthouse: {
    count: 1,         // 數量
    value: 0,         // 點數 (本身不計分)
    color: 'white',
    emoji: '🗼',
    enabled: true
  },

  /**
   * 🐟🐟 魚群 - 藍色
   * 倍增卡：每張魚額外獲得1分，本身不計分
   * Multiplier card: +1pt per Fish, card itself worth 0
   */
  FishSchool: {
    count: 1,         // 數量
    value: 0,         // 點數 (本身不計分)
    color: 'blue',
    emoji: '🐟🐟',
    enabled: true
  },

  /**
   * 🐧👥 企鵝部落 - 黑白
   * 倍增卡：每張企鵝額外獲得2分，本身不計分
   * Multiplier card: +2pts per Penguin, card itself worth 0
   */
  PenguinColony: {
    count: 1,         // 數量
    value: 0,         // 點數 (本身不計分)
    color: 'black',
    emoji: '🐧👥',
    enabled: true
  },

  /**
   * 👨‍✈️ 船長 - 黃色
   * 倍增卡：每張水手額外獲得3分，本身不計分
   * Multiplier card: +3pts per Sailor, card itself worth 0
   */
  Captain: {
    count: 1,         // 數量
    value: 0,         // 點數 (本身不計分)
    color: 'yellow',
    emoji: '👨‍✈️',
    enabled: true
  },

  /**
   * 🦅 海鷗 - 白色 (移除或禁用)
   * Seagull - disabled
   */
  Seagull: {
    count: 0,         // 數量 (已移除)
    value: 0,
    color: 'white',
    emoji: '🦅',
    enabled: false
  },

  // ===== 特殊卡 (Special Cards) =====

  /**
   * 🧜 美人魚 - 多色
   * 特殊計分：
   * - 第 1 張 = 最多顏色的數量
   * - 第 2 張 = 第二多顏色的數量
   * - 第 3 張 = 第三多顏色的數量
   * - 4 張 = 直接獲勝！
   *
   * Special Scoring:
   * - 1st = most common color count
   * - 2nd = 2nd most common color count
   * - 3rd = 3rd most common color count
   * - 4 cards = Instant win!
   */
  Mermaid: {
    count: 4,         // 數量 (基本配置: 4)
    value: 0,
    color: 'multicolor',
    emoji: '🧜',
    enabled: true
  }
}

/**
 * 預設配置模板
 * Default Configuration Presets
 */
export const DECK_PRESETS = {
  // 標準模式 (Standard - 72 cards)
  standard: {
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
    Mermaid: 6
  },

  // 新手模式 (Beginner - 38 cards, simpler)
  beginner: {
    Fish: 6,
    Crab: 6,
    Shell: 4,
    Starfish: 4,
    Sailboat: 3,
    Shark: 3,
    Swimmer: 3,
    Octopus: 2,
    Penguin: 2,
    Seagull: 2,
    Mermaid: 3
  },

  // 專家模式 (Expert - 80 cards, more strategy)
  expert: {
    Fish: 12,
    Crab: 12,
    Shell: 10,
    Starfish: 10,
    Sailboat: 6,
    Shark: 6,
    Swimmer: 6,
    Octopus: 4,
    Penguin: 4,
    Seagull: 4,
    Mermaid: 6
  },

  // 快速模式 (Quick - 40 cards, faster games)
  quick: {
    Fish: 6,
    Crab: 6,
    Shell: 5,
    Starfish: 5,
    Sailboat: 3,
    Shark: 3,
    Swimmer: 3,
    Octopus: 2,
    Penguin: 2,
    Seagull: 2,
    Mermaid: 3
  },

  // 純收集模式 (Collection Only - no special effects)
  collectionOnly: {
    Fish: 0,          // 移除配對效果卡
    Crab: 0,
    Shell: 15,
    Starfish: 15,
    Sailboat: 0,
    Shark: 0,
    Swimmer: 0,
    Octopus: 6,
    Penguin: 6,
    Seagull: 6,
    Mermaid: 6
  }
}

/**
 * 套用預設配置
 * Apply a preset configuration
 *
 * 使用方法：
 * 1. 在此檔案中取消註解你想要的預設模式
 * 2. 儲存檔案
 * 3. 重新開始遊戲
 *
 * Example:
 * applyPreset('beginner')  // 套用新手模式
 * applyPreset('expert')    // 套用專家模式
 */
export function applyPreset(presetName) {
  const preset = DECK_PRESETS[presetName]
  if (!preset) {
    console.error(`找不到預設配置: ${presetName}`)
    return
  }

  Object.keys(preset).forEach(cardType => {
    if (DECK_CONFIG[cardType]) {
      DECK_CONFIG[cardType].count = preset[cardType]
      DECK_CONFIG[cardType].enabled = preset[cardType] > 0
    }
  })

  console.log(`✅ 已套用預設配置: ${presetName}`)
  console.log('總卡片數:', getTotalCardCount())
}

/**
 * 取得總卡片數
 * Get total card count
 */
export function getTotalCardCount() {
  return Object.values(DECK_CONFIG)
    .filter(card => card.enabled)
    .reduce((sum, card) => sum + card.count, 0)
}

/**
 * 驗證配置是否有效
 * Validate configuration
 */
export function validateDeckConfig() {
  const total = getTotalCardCount()
  const warnings = []

  // 檢查總數是否為偶數
  if (total % 2 !== 0) {
    warnings.push(`⚠️  總卡片數是奇數 (${total})，建議改為偶數`)
  }

  // 檢查是否太少牌
  if (total < 20) {
    warnings.push(`⚠️  總卡片數太少 (${total})，建議至少 20 張`)
  }

  // 檢查倍數卡是否有對應目標
  if (DECK_CONFIG.Octopus.enabled && DECK_CONFIG.Octopus.count > 0) {
    if (!DECK_CONFIG.Shell.enabled || DECK_CONFIG.Shell.count === 0) {
      warnings.push('⚠️  章魚需要貝殼才有用，但貝殼數量為 0')
    }
  }

  if (DECK_CONFIG.Seagull.enabled && DECK_CONFIG.Seagull.count > 0) {
    if ((!DECK_CONFIG.Fish.enabled || DECK_CONFIG.Fish.count === 0) &&
        (!DECK_CONFIG.Crab.enabled || DECK_CONFIG.Crab.count === 0)) {
      warnings.push('⚠️  海鷗需要魚或螃蟹才有用，但兩者數量都為 0')
    }
  }

  // 檢查偷牌效果
  if ((DECK_CONFIG.Shark.enabled && DECK_CONFIG.Shark.count > 0) ||
      (DECK_CONFIG.Swimmer.enabled && DECK_CONFIG.Swimmer.count > 0)) {
    if (!DECK_CONFIG.Shark.enabled || DECK_CONFIG.Shark.count === 0 ||
        !DECK_CONFIG.Swimmer.enabled || DECK_CONFIG.Swimmer.count === 0) {
      warnings.push('⚠️  鯊魚和游泳者需要配對才有偷牌效果')
    }
  }

  return {
    valid: warnings.length === 0,
    total,
    warnings
  }
}

// 在開發模式下顯示配置資訊
// Check for both Vite (import.meta.env.DEV) and Node.js (process.env.NODE_ENV) environments
const isDev = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
              process.env.NODE_ENV === 'development' ||
              process.env.NODE_ENV !== 'production'

if (isDev) {
  console.log('🎴 牌庫配置載入')
  console.log('總卡片數:', getTotalCardCount())

  const validation = validateDeckConfig()
  if (!validation.valid) {
    console.warn('配置警告:')
    validation.warnings.forEach(w => console.warn(w))
  }
}

// 取消註解以套用預設配置
// Uncomment to apply a preset
// applyPreset('standard')   // 標準模式
// applyPreset('beginner')   // 新手模式
// applyPreset('expert')     // 專家模式
// applyPreset('quick')      // 快速模式
