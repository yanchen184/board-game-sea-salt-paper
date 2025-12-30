import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateBaseScore,
  calculatePairBonus,
  calculateMultipliers,
  calculateMermaidScore,
  calculateColorBonus,
  calculateScore
} from '../../src/services/scoreService'

describe('scoreService', () => {
  describe('calculateBaseScore', () => {
    it('should return 0 for empty array', () => {
      expect(calculateBaseScore([])).toBe(0)
    })

    it('should sum card values correctly', () => {
      const cards = [
        { id: 'fish_1', name: 'Fish', value: 1 },
        { id: 'crab_1', name: 'Crab', value: 1 },
        { id: 'starfish_1', name: 'Starfish', value: 2 }
      ]
      expect(calculateBaseScore(cards)).toBe(4)
    })

    it('should handle cards with zero value', () => {
      const cards = [
        { id: 'mermaid_1', name: 'Mermaid', value: 0 },
        { id: 'mermaid_2', name: 'Mermaid', value: 0 }
      ]
      expect(calculateBaseScore(cards)).toBe(0)
    })
  })

  describe('calculatePairBonus', () => {
    it('should return 0 for no pairs', () => {
      expect(calculatePairBonus([])).toBe(0)
    })

    it('should return 1 point per pair', () => {
      const pairs = [
        { cards: ['fish_1', 'fish_2'] },
        { cards: ['crab_1', 'crab_2'] }
      ]
      expect(calculatePairBonus(pairs)).toBe(2)
    })

    it('should double pair bonus with penguin multiplier', () => {
      const pairs = [
        { cards: ['fish_1', 'fish_2'] },
        { cards: ['crab_1', 'crab_2'] }
      ]
      expect(calculatePairBonus(pairs, true)).toBe(4)
    })
  })

  describe('calculateMultipliers', () => {
    it('should return zero multipliers for no special cards', () => {
      const hand = [
        { id: 'fish_1', name: 'Fish', value: 1 },
        { id: 'crab_1', name: 'Crab', value: 1 }
      ]
      const result = calculateMultipliers(hand, [])

      expect(result.octopus).toBe(0)
      expect(result.seagull).toBe(0)
      expect(result.penguin).toBe(false)
      expect(result.total).toBe(0)
    })

    it('should calculate octopus multiplier for shells', () => {
      const hand = [
        { id: 'octopus_1', name: 'Octopus', value: 3 },
        { id: 'shell_1', name: 'Shell', value: 1 },
        { id: 'shell_2', name: 'Shell', value: 1 }
      ]
      const result = calculateMultipliers(hand, [])

      expect(result.octopus).toBe(2) // 2 shells get +1 each
      expect(result.total).toBe(2)
    })

    it('should calculate seagull multiplier for fish and crabs', () => {
      const hand = [
        { id: 'seagull_1', name: 'Seagull', value: 4 },
        { id: 'fish_1', name: 'Fish', value: 1 },
        { id: 'crab_1', name: 'Crab', value: 1 }
      ]
      const result = calculateMultipliers(hand, [])

      expect(result.seagull).toBe(2) // 1 fish + 1 crab get +1 each
      expect(result.total).toBe(2)
    })

    it('should detect penguin for pair multiplier', () => {
      const hand = [
        { id: 'penguin_1', name: 'Penguin', value: 4 }
      ]
      const result = calculateMultipliers(hand, [])

      expect(result.penguin).toBe(true)
    })
  })

  describe('calculateMermaidScore', () => {
    it('should return 0 for no mermaids', () => {
      const hand = [
        { id: 'fish_1', name: 'Fish', value: 1, color: 'blue' }
      ]
      expect(calculateMermaidScore(hand, [])).toBe(0)
    })

    it('should count most common color for 1 mermaid', () => {
      const hand = [
        { id: 'mermaid_1', name: 'Mermaid', value: 0, color: 'multicolor' },
        { id: 'fish_1', name: 'Fish', value: 1, color: 'blue' },
        { id: 'fish_2', name: 'Fish', value: 1, color: 'blue' },
        { id: 'crab_1', name: 'Crab', value: 1, color: 'red' }
      ]
      expect(calculateMermaidScore(hand, [])).toBe(2) // 2 blue cards
    })

    it('should count top N colors for N mermaids', () => {
      const hand = [
        { id: 'mermaid_1', name: 'Mermaid', value: 0, color: 'multicolor' },
        { id: 'mermaid_2', name: 'Mermaid', value: 0, color: 'multicolor' },
        { id: 'fish_1', name: 'Fish', value: 1, color: 'blue' },
        { id: 'fish_2', name: 'Fish', value: 1, color: 'blue' },
        { id: 'fish_3', name: 'Fish', value: 1, color: 'blue' },
        { id: 'crab_1', name: 'Crab', value: 1, color: 'red' },
        { id: 'crab_2', name: 'Crab', value: 1, color: 'red' }
      ]
      expect(calculateMermaidScore(hand, [])).toBe(5) // 3 blue + 2 red
    })

    it('should not count mermaids themselves toward colors', () => {
      const hand = [
        { id: 'mermaid_1', name: 'Mermaid', value: 0, color: 'multicolor' },
        { id: 'fish_1', name: 'Fish', value: 1, color: 'blue' }
      ]
      expect(calculateMermaidScore(hand, [])).toBe(1) // Only 1 blue, mermaids don't count
    })
  })

  describe('calculateColorBonus', () => {
    it('should return count of most common color', () => {
      const hand = [
        { id: 'fish_1', name: 'Fish', value: 1, color: 'blue' },
        { id: 'fish_2', name: 'Fish', value: 1, color: 'blue' },
        { id: 'crab_1', name: 'Crab', value: 1, color: 'red' }
      ]
      expect(calculateColorBonus(hand, [])).toBe(2)
    })

    it('should not count mermaids', () => {
      const hand = [
        { id: 'mermaid_1', name: 'Mermaid', value: 0, color: 'multicolor' },
        { id: 'fish_1', name: 'Fish', value: 1, color: 'blue' }
      ]
      expect(calculateColorBonus(hand, [])).toBe(1)
    })

    it('should return 0 for only mermaids', () => {
      const hand = [
        { id: 'mermaid_1', name: 'Mermaid', value: 0, color: 'multicolor' },
        { id: 'mermaid_2', name: 'Mermaid', value: 0, color: 'multicolor' }
      ]
      expect(calculateColorBonus(hand, [])).toBe(0)
    })
  })

  describe('calculateScore', () => {
    it('should calculate total score correctly', () => {
      const hand = [
        { id: 'fish_1', name: 'Fish', value: 1, color: 'blue' },
        { id: 'fish_2', name: 'Fish', value: 1, color: 'blue' }
      ]
      const pairs = []

      const result = calculateScore(hand, pairs)

      expect(result.base).toBe(2)
      expect(result.pairs).toBe(0)
      expect(result.multipliers).toBe(0)
      expect(result.mermaids).toBe(0)
      expect(result.colorBonus).toBe(0) // Not included by default
      expect(result.total).toBe(2)
    })

    it('should include color bonus when requested', () => {
      const hand = [
        { id: 'fish_1', name: 'Fish', value: 1, color: 'blue' },
        { id: 'fish_2', name: 'Fish', value: 1, color: 'blue' }
      ]
      const pairs = []

      const result = calculateScore(hand, pairs, { includeColorBonus: true })

      expect(result.colorBonus).toBe(2)
      expect(result.total).toBe(4) // base 2 + color 2
    })

    it('should handle complex scoring with all components', () => {
      const hand = [
        { id: 'octopus_1', name: 'Octopus', value: 3, color: 'purple' },
        { id: 'shell_1', name: 'Shell', value: 1, color: 'purple' },
        { id: 'shell_2', name: 'Shell', value: 1, color: 'purple' }
      ]
      const pairs = [
        {
          cards: [
            { id: 'fish_1', name: 'Fish', value: 1, color: 'blue' },
            { id: 'fish_2', name: 'Fish', value: 1, color: 'blue' }
          ]
        }
      ]

      const result = calculateScore(hand, pairs)

      // Base: 3 + 1 + 1 + 1 + 1 = 7
      // Pairs: 1
      // Multipliers: 2 (octopus makes 2 shells count as 2 each)
      // Total: 7 + 1 + 2 = 10
      expect(result.base).toBe(7)
      expect(result.pairs).toBe(1)
      expect(result.multipliers).toBe(2)
      expect(result.total).toBe(10)
    })
  })
})
