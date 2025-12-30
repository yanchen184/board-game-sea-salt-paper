/**
 * Quick Test: Verify baseline tracking works
 */

import { FitnessEvaluator } from './FitnessEvaluator.js'
import { DEFAULT_GENOME, generateRandomGenome } from './AIGenome.js'

console.log('Testing baseline AI tracking...\n')

const evaluator = new FitnessEvaluator({
  matchesPerGenome: 3,
  gamesPerMatch: 10 // 增加每場比賽的遊戲數
})

// Test 1: Random genome vs baseline
const randomGenome = generateRandomGenome()
const baselineWithId = { ...DEFAULT_GENOME, id: 'baseline' }

const result = evaluator.evaluateGenome(
  randomGenome,
  [baselineWithId],
  { trackBaselinePerformance: true }
)

console.log('Random AI vs Baseline AI:')
console.log(`  Total Games: ${result.totalGames}`)
console.log(`  Baseline Games: ${result.baselineTotalGames}`)
console.log(`  Wins vs Baseline: ${result.baselineWins}`)
console.log(`  Losses vs Baseline: ${result.baselineLosses}`)
console.log(`  Draws vs Baseline: ${result.baselineDraws}`)

const baselineWinRate = result.baselineTotalGames > 0
  ? result.baselineWins / result.baselineTotalGames
  : 0

console.log(`  Win Rate vs Baseline: ${(baselineWinRate * 100).toFixed(1)}%`)

const fitness = evaluator.calculateFitness(result)
console.log(`  Fitness: ${fitness.toFixed(2)}`)
