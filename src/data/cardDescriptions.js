/**
 * Card Descriptions and Scoring Rules
 * 卡片描述與計分規則
 *
 * Used for card tooltips and rule hints
 */

/**
 * Card type labels in Chinese
 */
export const CARD_TYPE_LABELS = {
  pair_effect: '配對效果',
  collection: '收集',
  multiplier: '加成',
  special: '特殊'
}

/**
 * Short rule hints shown on card face
 * Maximum 10 characters
 */
export const CARD_RULE_HINTS = {
  Fish: '配對抽1張',
  Crab: '配對拿棄牌',
  Shell: '可被加倍',
  Starfish: '2分',
  Sailboat: '配對再行動',
  Shark: '+游泳者偷牌',
  Swimmer: '+鯊魚偷牌',
  Sailor: '2張=5分',
  Octopus: '貝殼×2',
  Penguin: '配對獎勵×2',
  Lighthouse: '帆船+1',
  FishSchool: '魚+1',
  PenguinColony: '企鵝+2',
  Captain: '水手+3',
  Seagull: '魚蟹×2',
  Mermaid: '顏色計分'
}

/**
 * Detailed card descriptions for tooltips
 */
export const CARD_DESCRIPTIONS = {
  Fish: {
    name: '魚',
    shortRule: '配對抽1張',
    fullDescription: '當兩張魚配對時，從牌庫抽取1張牌加入手牌。這是最基本的抽牌配對效果。',
    scoringRule: '基礎分數：1分',
    tips: '配對後可以快速增加手牌數量'
  },
  Crab: {
    name: '螃蟹',
    shortRule: '配對拿棄牌',
    fullDescription: '當兩張螃蟹配對時，從任一棄牌堆的頂端拿取1張牌。可以選擇左側或右側棄牌堆。',
    scoringRule: '基礎分數：1分',
    tips: '可以撿回有價值的棄牌'
  },
  Shell: {
    name: '貝殼',
    shortRule: '可被加倍',
    fullDescription: '收集用卡片。當你擁有章魚時，每張貝殼的分數會加倍為2分。',
    scoringRule: '基礎分數：1分（有章魚時2分）',
    tips: '搭配章魚可以獲得高分'
  },
  Starfish: {
    name: '海星',
    shortRule: '2分',
    fullDescription: '高分值的收集卡片，沒有特殊效果但分數較高。',
    scoringRule: '基礎分數：2分',
    tips: '穩定的分數來源'
  },
  Sailboat: {
    name: '帆船',
    shortRule: '配對再行動',
    fullDescription: '當兩張帆船配對時，獲得一個額外回合！可以再次抽牌並進行配對。',
    scoringRule: '基礎分數：0分（配合燈塔+1分）',
    tips: '額外回合可以加速遊戲進度'
  },
  Shark: {
    name: '鯊魚',
    shortRule: '+游泳者偷牌',
    fullDescription: '特殊配對：鯊魚可以與游泳者配對。配對成功時，從任一對手手中隨機偷取1張牌。',
    scoringRule: '基礎分數：0分',
    tips: '偷牌可以削弱對手並增強自己'
  },
  Swimmer: {
    name: '游泳者',
    shortRule: '+鯊魚偷牌',
    fullDescription: '特殊配對：游泳者可以與鯊魚配對。配對成功時，從任一對手手中隨機偷取1張牌。',
    scoringRule: '基礎分數：0分',
    tips: '注意保護自己的高價值牌'
  },
  Sailor: {
    name: '水手',
    shortRule: '2張=5分',
    fullDescription: '收集用卡片。單張水手不值分，但集齊2張水手時值5分！',
    scoringRule: '1張=0分，2張=5分',
    tips: '全有全無，需要策略收集'
  },
  Octopus: {
    name: '章魚',
    shortRule: '貝殼×2',
    fullDescription: '加成卡。擁有章魚時，你手中每張貝殼的分數從1分變為2分。',
    scoringRule: '基礎分數：0分（貝殼加成效果）',
    tips: '貝殼越多效果越好'
  },
  Penguin: {
    name: '企鵝',
    shortRule: '配對獎勵×2',
    fullDescription: '加成卡。擁有企鵝時，每個已打出的配對獎勵從1分變為2分。',
    scoringRule: '基礎分數：0分（配對獎勵加成）',
    tips: '配對越多效果越明顯'
  },
  Lighthouse: {
    name: '燈塔',
    shortRule: '帆船+1',
    fullDescription: '加成卡。擁有燈塔時，你手中每張帆船額外獲得1分。',
    scoringRule: '基礎分數：2分',
    tips: '搭配帆船使用效果最佳'
  },
  FishSchool: {
    name: '魚群',
    shortRule: '魚+1',
    fullDescription: '加成卡。擁有魚群時，你手中每張魚額外獲得1分。',
    scoringRule: '基礎分數：0分（魚加成效果）',
    tips: '魚越多效果越好'
  },
  PenguinColony: {
    name: '企鵝部落',
    shortRule: '企鵝+2',
    fullDescription: '加成卡。擁有企鵝部落時，你手中每張企鵝額外獲得2分。',
    scoringRule: '基礎分數：0分（企鵝加成效果）',
    tips: '搭配多張企鵝效果倍增'
  },
  Captain: {
    name: '船長',
    shortRule: '水手+3',
    fullDescription: '加成卡。擁有船長時，你手中每張水手額外獲得3分。',
    scoringRule: '基礎分數：3分',
    tips: '水手配對+船長=超高分組合'
  },
  Seagull: {
    name: '海鷗',
    shortRule: '魚蟹×2',
    fullDescription: '加成卡。擁有海鷗時，每張魚和螃蟹的分數加倍為2分。',
    scoringRule: '基礎分數：0分（魚蟹加成效果）',
    tips: '魚和螃蟹數量多時效果顯著'
  },
  Mermaid: {
    name: '美人魚',
    shortRule: '顏色計分',
    fullDescription: '特殊計分卡！第1張美人魚=你最多顏色的數量，第2張=次多顏色數量，以此類推。收集4張美人魚直接獲勝！',
    scoringRule: '特殊：按顏色數量計分，4張直接獲勝',
    tips: '收集單一顏色可以最大化第一張美人魚的分數'
  }
}

/**
 * Get card description by name
 * @param {string} cardName - Card name
 * @returns {Object} Card description object
 */
export function getCardDescription(cardName) {
  return CARD_DESCRIPTIONS[cardName] || {
    name: cardName,
    shortRule: '',
    fullDescription: '暫無描述',
    scoringRule: '',
    tips: ''
  }
}

/**
 * Get short rule hint for card
 * @param {string} cardName - Card name
 * @returns {string} Short rule hint
 */
export function getCardRuleHint(cardName) {
  return CARD_RULE_HINTS[cardName] || ''
}

export default CARD_DESCRIPTIONS
