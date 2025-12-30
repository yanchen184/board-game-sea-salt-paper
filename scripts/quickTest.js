#!/usr/bin/env node
/**
 * Quick Test Script
 *
 * Validates that the AI training system works correctly.
 * Runs a minimal training cycle and checks results.
 */

import { GameSimulator } from './ai-training/GameSimulator.js'
import { GeneticAlgorithm } from './ai-training/GeneticAlgorithm.js'
import { FitnessEvaluator } from './ai-training/FitnessEvaluator.js'
import { DEFAULT_GENOME, generateRandomGenome } from './ai-training/AIGenome.js'
import { makeDecision } from './ai-training/ParametricAI.js'

console.log('================================================================================')
console.log('           SEA SALT & PAPER - AI TRAINING SYSTEM VALIDATION')
console.log('================================================================================\n')

async function runTests() {
  let passed = 0
  let failed = 0

  // Test 1: Game Simulator
  console.log('Test 1: Game Simulator')
  try {
    const simulator = new GameSimulator({ maxTurns: 50 })
    const genome1 = DEFAULT_GENOME
    const genome2 = generateRandomGenome()

    const result = simulator.runGame([genome1, genome2], 2)

    if (result.winner && result.scores && result.turnCount > 0) {
      console.log(`  [PASS] Game completed in ${result.turnCount} turns`)
      console.log(`  Winner: ${result.winner}, Scores: ${JSON.stringify(result.scores)}`)
      passed++
    } else {
      console.log('  [FAIL] Invalid game result')
      failed++
    }
  } catch (error) {
    console.log(`  [FAIL] ${error.message}`)
    failed++
  }

  // Test 2: Batch Simulation
  console.log('\nTest 2: Batch Simulation (10 games)')
  try {
    const simulator = new GameSimulator({ maxTurns: 50 })
    const genome1 = DEFAULT_GENOME
    const genome2 = generateRandomGenome()

    const result = simulator.runBatch([genome1, genome2], 10, 2)

    if (result.gamesPlayed === 10 && result.avgTurns > 0) {
      console.log(`  [PASS] Completed ${result.gamesPlayed} games`)
      console.log(`  Avg Turns: ${result.avgTurns.toFixed(1)}`)
      console.log(`  Wins: player_0=${result.wins.player_0}, player_1=${result.wins.player_1}`)
      passed++
    } else {
      console.log('  [FAIL] Invalid batch result')
      failed++
    }
  } catch (error) {
    console.log(`  [FAIL] ${error.message}`)
    failed++
  }

  // Test 3: Genetic Algorithm
  console.log('\nTest 3: Genetic Algorithm')
  try {
    const ga = new GeneticAlgorithm({
      populationSize: 10,
      eliteCount: 2,
      mutationRate: 0.1
    })

    const population = ga.initializePopulation()
    const fitnessScores = population.map(() => Math.random() * 100)

    const nextGen = ga.evolve(population, fitnessScores)

    if (nextGen.length === 10) {
      console.log(`  [PASS] Evolved population of ${nextGen.length} genomes`)
      const diversity = ga.calculateDiversity(nextGen)
      console.log(`  Diversity: ${(diversity * 100).toFixed(1)}%`)
      passed++
    } else {
      console.log('  [FAIL] Invalid evolution result')
      failed++
    }
  } catch (error) {
    console.log(`  [FAIL] ${error.message}`)
    failed++
  }

  // Test 4: Fitness Evaluation
  console.log('\nTest 4: Fitness Evaluation')
  try {
    const evaluator = new FitnessEvaluator({
      matchesPerGenome: 3,
      gamesPerMatch: 2
    })

    const genome = DEFAULT_GENOME
    const opponents = [generateRandomGenome(), generateRandomGenome()]

    const results = evaluator.evaluateGenome(genome, opponents)
    const fitness = evaluator.calculateFitness(results)

    if (results.totalGames > 0 && !isNaN(fitness)) {
      console.log(`  [PASS] Evaluated genome: ${results.totalGames} games, fitness=${fitness.toFixed(2)}`)
      console.log(`  Win rate: ${(results.wins / results.totalGames * 100).toFixed(1)}%`)
      passed++
    } else {
      console.log('  [FAIL] Invalid evaluation result')
      failed++
    }
  } catch (error) {
    console.log(`  [FAIL] ${error.message}`)
    failed++
  }

  // Test 5: Mini Training (3 generations, 5 population)
  console.log('\nTest 5: Mini Training (3 generations, 5 population)')
  try {
    const ga = new GeneticAlgorithm({
      populationSize: 5,
      eliteCount: 1,
      mutationRate: 0.15
    })

    const evaluator = new FitnessEvaluator({
      matchesPerGenome: 2,
      gamesPerMatch: 2
    })

    let population = ga.initializePopulation()
    let bestFitness = -Infinity

    for (let gen = 0; gen < 3; gen++) {
      // Evaluate
      const results = evaluator.evaluatePopulation(population, {
        useBaseline: true,
        randomOpponentCount: 2
      })

      // Track best
      if (results.bestFitness > bestFitness) {
        bestFitness = results.bestFitness
      }

      // Evolve
      if (gen < 2) {
        population = ga.evolve(population, results.fitnessScores)
      }

      console.log(`  Generation ${gen + 1}: Best=${results.bestFitness.toFixed(2)}, Avg=${results.avgFitness.toFixed(2)}`)
    }

    console.log(`  [PASS] Training completed. Best fitness: ${bestFitness.toFixed(2)}`)
    passed++
  } catch (error) {
    console.log(`  [FAIL] ${error.message}`)
    console.error(error)
    failed++
  }

  // Summary
  console.log('\n================================================================================')
  console.log(`                         VALIDATION RESULTS: ${passed}/${passed + failed} PASSED`)
  console.log('================================================================================')

  if (failed === 0) {
    console.log('\nAll tests passed! The AI training system is ready to use.')
    console.log('\nTo start training, run:')
    console.log('  node scripts/trainAI.js --test    # Quick test (10 generations)')
    console.log('  node scripts/trainAI.js --quick   # Quick training (30 generations)')
    console.log('  node scripts/trainAI.js --full    # Full training (100 generations)')
  } else {
    console.log(`\n${failed} test(s) failed. Please check the errors above.`)
    process.exit(1)
  }
}

runTests().catch(error => {
  console.error('Test failed with error:', error)
  process.exit(1)
})
