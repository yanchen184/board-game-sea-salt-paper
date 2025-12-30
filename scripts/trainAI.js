#!/usr/bin/env node
/**
 * AI Training Script
 *
 * Train AI for Sea Salt & Paper using genetic algorithm.
 *
 * Usage:
 *   node scripts/trainAI.js [options]
 *
 * Options:
 *   --test              Run small test (10 generations, 20 population)
 *   --quick             Run quick training (30 generations, 30 population)
 *   --full              Run full training (100 generations, 50 population)
 *   --generations N     Number of generations
 *   --population N      Population size
 *   --resume PATH       Resume from checkpoint
 *   --output DIR        Output directory
 *   --verbose           Enable verbose logging
 *
 * Examples:
 *   node scripts/trainAI.js --test
 *   node scripts/trainAI.js --quick --verbose
 *   node scripts/trainAI.js --full --output ./my-trained-ai
 *   node scripts/trainAI.js --resume ./trained-ai/checkpoint-gen50.json
 */

import { TrainingManager } from './ai-training/TrainingManager.js'
import { FitnessEvaluator } from './ai-training/FitnessEvaluator.js'
import { DEFAULT_GENOME, serializeGenome } from './ai-training/AIGenome.js'
import fs from 'fs'
import path from 'path'

// Parse command line arguments
function parseArgs(args) {
  const options = {
    mode: 'quick', // test, quick, full, custom
    generations: null,
    populationSize: null,
    resume: null,
    outputDir: './trained-ai',
    verbose: false
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--test':
        options.mode = 'test'
        break
      case '--quick':
        options.mode = 'quick'
        break
      case '--full':
        options.mode = 'full'
        break
      case '--generations':
        options.generations = parseInt(args[++i], 10)
        options.mode = 'custom'
        break
      case '--population':
        options.populationSize = parseInt(args[++i], 10)
        options.mode = 'custom'
        break
      case '--resume':
        options.resume = args[++i]
        break
      case '--output':
        options.outputDir = args[++i]
        break
      case '--verbose':
        options.verbose = true
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
    }
  }

  // Set defaults based on mode
  switch (options.mode) {
    case 'test':
      options.generations = options.generations || 10
      options.populationSize = options.populationSize || 20
      break
    case 'quick':
      options.generations = options.generations || 30
      options.populationSize = options.populationSize || 30
      break
    case 'full':
      options.generations = options.generations || 100
      options.populationSize = options.populationSize || 50
      break
    case 'custom':
      options.generations = options.generations || 50
      options.populationSize = options.populationSize || 40
      break
  }

  return options
}

function printHelp() {
  console.log(`
AI Training Script for Sea Salt & Paper
========================================

Usage: node scripts/trainAI.js [options]

Options:
  --test              Run small test (10 generations, 20 population)
  --quick             Run quick training (30 generations, 30 population)
  --full              Run full training (100 generations, 50 population)
  --generations N     Number of generations
  --population N      Population size
  --resume PATH       Resume from checkpoint file
  --output DIR        Output directory (default: ./trained-ai)
  --verbose           Enable verbose logging
  --help, -h          Show this help message

Examples:
  node scripts/trainAI.js --test
  node scripts/trainAI.js --quick --verbose
  node scripts/trainAI.js --full --output ./my-trained-ai
  node scripts/trainAI.js --generations 50 --population 40
  node scripts/trainAI.js --resume ./trained-ai/checkpoint-gen25.json
`)
}

function printBanner() {
  console.log(`
================================================================================
                     SEA SALT & PAPER - AI TRAINING SYSTEM
================================================================================

      Using Genetic Algorithm to evolve optimal AI strategies
      through thousands of simulated games.

================================================================================
`)
}

async function main() {
  printBanner()

  const args = process.argv.slice(2)
  const options = parseArgs(args)

  console.log('Training Configuration:')
  console.log(`  Mode: ${options.mode}`)
  console.log(`  Generations: ${options.generations}`)
  console.log(`  Population Size: ${options.populationSize}`)
  console.log(`  Output Directory: ${options.outputDir}`)
  console.log(`  Verbose: ${options.verbose}`)
  if (options.resume) {
    console.log(`  Resume From: ${options.resume}`)
  }
  console.log()

  // Calculate estimated time
  const estimatedGames = options.populationSize * 10 * 3 * options.generations
  const estimatedSeconds = estimatedGames * 0.05 // ~50ms per game
  const estimatedMinutes = Math.ceil(estimatedSeconds / 60)
  console.log(`Estimated Training:`)
  console.log(`  Total Games: ~${estimatedGames.toLocaleString()}`)
  console.log(`  Estimated Time: ~${estimatedMinutes} minutes`)
  console.log()

  // Create training manager
  const trainer = new TrainingManager({
    populationSize: options.populationSize,
    generations: options.generations,
    outputDir: options.outputDir,

    // Genetic Algorithm settings
    eliteCount: Math.max(2, Math.floor(options.populationSize * 0.1)),
    mutationRate: 0.1,
    crossoverRate: 0.8,

    // Evaluation settings
    matchesPerGenome: options.mode === 'test' ? 5 : 10,
    gamesPerMatch: 3,

    // Early stopping
    enableEarlyStopping: options.mode !== 'test',
    earlyStoppingPatience: 15,

    // Checkpointing
    checkpointInterval: options.mode === 'test' ? 5 : 10
  })

  // Resume from checkpoint if specified
  if (options.resume) {
    const loaded = trainer.loadCheckpoint(options.resume)
    if (!loaded) {
      console.error('Failed to load checkpoint. Starting fresh training.')
    }
  }

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n\nReceived SIGINT. Saving checkpoint and exiting...')
    trainer.stop()
    trainer.saveCheckpoint()
    trainer.saveBestGenome()
    trainer.saveTrainingHistory()
    process.exit(0)
  })

  // Start training with progress callback
  try {
    const result = await trainer.train((progress) => {
      if (options.verbose) {
        if (progress.type === 'evaluation') {
          process.stdout.write(`\r  Evaluating: ${progress.genomesEvaluated}/${options.populationSize}`)
        }
      }
    })

    console.log('\n\nTraining completed successfully!')
    console.log('\nBest Genome Parameters:')
    console.log('------------------------')

    // Print key parameters
    const genome = result.bestGenome
    console.log(`  Declaration Threshold: ${genome.declareThreshold.toFixed(2)}`)
    console.log(`  Risk Tolerance: ${genome.riskTolerance.toFixed(2)}`)
    console.log(`  Mermaid Priority: ${genome.mermaidPriority.toFixed(2)}`)
    console.log(`  Sailor Priority: ${genome.sailorPriority.toFixed(2)}`)
    console.log(`  Deck Base Value: ${genome.deckBaseValue.toFixed(2)}`)
    console.log(`  Sailboat Pair Bonus: ${genome.sailboatPairBonus.toFixed(2)}`)

    // Benchmark against baseline
    console.log('\nBenchmarking against baseline AI...')
    const evaluator = new FitnessEvaluator()
    const benchmark = evaluator.benchmark(result.bestGenome, 50)

    console.log('\nBenchmark Results (50 games):')
    console.log(`  Trained AI Wins: ${benchmark.genome1Wins} (${(benchmark.genome1WinRate * 100).toFixed(1)}%)`)
    console.log(`  Baseline AI Wins: ${benchmark.genome2Wins} (${(benchmark.genome2WinRate * 100).toFixed(1)}%)`)
    console.log(`  Draws: ${benchmark.draws}`)
    console.log(`  Trained AI Avg Score: ${benchmark.genome1AvgScore.toFixed(1)}`)
    console.log(`  Baseline AI Avg Score: ${benchmark.genome2AvgScore.toFixed(1)}`)

    // Save final best genome
    const finalPath = path.join(options.outputDir, 'best-ai-final.json')
    fs.writeFileSync(finalPath, serializeGenome(result.bestGenome))
    console.log(`\nFinal best genome saved to: ${finalPath}`)

    // Print usage instructions
    console.log('\n================================================================================')
    console.log('HOW TO USE THE TRAINED AI:')
    console.log('================================================================================')
    console.log(`
1. Copy the trained genome to your game:
   cp ${finalPath} src/data/trainedGenome.json

2. Import and use in your AI service:
   import trainedGenome from './data/trainedGenome.json'
   import { makeDecision } from './scripts/ai-training/ParametricAI.js'

   const decision = makeDecision(trainedGenome, gameState, playerId)

3. Or integrate with existing aiService.js (see documentation)
================================================================================
`)

  } catch (error) {
    console.error('Training failed:', error)
    process.exit(1)
  }
}

// Run main
main().catch(console.error)
