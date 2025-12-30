/**
 * Training Manager
 *
 * Orchestrates the entire AI training process:
 * - Population management
 * - Generational evolution
 * - Progress tracking and checkpointing
 * - Result analysis and reporting
 *
 * Supports:
 * - Resuming from checkpoints
 * - Real-time progress monitoring
 * - Training history export
 */

import fs from 'fs'
import path from 'path'
import {
  DEFAULT_GENOME,
  generateRandomGenome,
  serializeGenome,
  deserializeGenome
} from './AIGenome.js'
import { GeneticAlgorithm, EarlyStopping } from './GeneticAlgorithm.js'
import { FitnessEvaluator, BatchEvaluator } from './FitnessEvaluator.js'

/**
 * Training Configuration Defaults
 */
const DEFAULT_CONFIG = {
  // Population
  populationSize: 50,
  generations: 100,

  // Genetic Algorithm
  eliteCount: 5,
  mutationRate: 0.1,
  mutationStrength: 0.2,
  crossoverRate: 0.8,
  tournamentSize: 3,

  // Evaluation
  matchesPerGenome: 10,
  gamesPerMatch: 3,

  // Training Control (改進：放寬早停限制)
  enableEarlyStopping: true,
  earlyStoppingPatience: 30, // 增加耐心值從 15 → 30
  earlyStoppingMinDelta: 0.1, // 降低最小改進閾值從 0.5 → 0.1

  // Checkpointing
  checkpointInterval: 10,
  outputDir: './trained-ai',

  // Diversity
  injectDiversityInterval: 20,
  diversityInjectionCount: 3
}

/**
 * Training Manager Class
 */
export class TrainingManager {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.population = []
    this.generation = 0
    this.history = []
    this.bestGenome = null
    this.bestFitness = -Infinity
    this.startTime = null
    this.isTraining = false

    // Initialize components
    this.ga = new GeneticAlgorithm({
      populationSize: this.config.populationSize,
      eliteCount: this.config.eliteCount,
      mutationRate: this.config.mutationRate,
      mutationStrength: this.config.mutationStrength,
      crossoverRate: this.config.crossoverRate,
      tournamentSize: this.config.tournamentSize
    })

    this.evaluator = new BatchEvaluator({
      matchesPerGenome: this.config.matchesPerGenome,
      gamesPerMatch: this.config.gamesPerMatch
    })

    this.earlyStopping = new EarlyStopping(
      this.config.earlyStoppingPatience,
      this.config.earlyStoppingMinDelta
    )

    // Ensure output directory exists
    this.ensureOutputDir()
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDir() {
    const outputDir = path.resolve(this.config.outputDir)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
  }

  /**
   * Initialize training with random population
   */
  initialize() {
    console.log('Initializing training...')
    console.log(`  Population size: ${this.config.populationSize}`)
    console.log(`  Generations: ${this.config.generations}`)
    console.log(`  Matches per genome: ${this.config.matchesPerGenome}`)

    this.population = this.ga.initializePopulation()
    this.generation = 0
    this.history = []
    this.bestGenome = null
    this.bestFitness = -Infinity
    this.startTime = Date.now()

    console.log(`  Initial population created: ${this.population.length} genomes`)
  }

  /**
   * Load training state from checkpoint
   * @param {string} checkpointPath - Path to checkpoint file
   */
  loadCheckpoint(checkpointPath) {
    console.log(`Loading checkpoint from: ${checkpointPath}`)

    try {
      const data = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'))

      this.population = data.population
      this.generation = data.generation
      this.history = data.history || []
      this.bestGenome = data.bestGenome
      this.bestFitness = data.bestFitness
      this.config = { ...this.config, ...data.config }

      console.log(`  Resumed from generation ${this.generation}`)
      console.log(`  Best fitness so far: ${this.bestFitness.toFixed(2)}`)

      return true
    } catch (error) {
      console.error(`Failed to load checkpoint: ${error.message}`)
      return false
    }
  }

  /**
   * Save training checkpoint
   */
  saveCheckpoint() {
    const checkpointPath = path.join(
      this.config.outputDir,
      `checkpoint-gen${this.generation}.json`
    )

    const checkpoint = {
      generation: this.generation,
      population: this.population,
      bestGenome: this.bestGenome,
      bestFitness: this.bestFitness,
      history: this.history,
      config: this.config,
      timestamp: new Date().toISOString()
    }

    fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2))
    console.log(`  Checkpoint saved: ${checkpointPath}`)
  }

  /**
   * Save best genome
   */
  saveBestGenome() {
    if (!this.bestGenome) return

    const genomePath = path.join(
      this.config.outputDir,
      `best-ai-gen${this.generation}.json`
    )

    fs.writeFileSync(genomePath, serializeGenome(this.bestGenome))
    console.log(`  Best genome saved: ${genomePath}`)
  }

  /**
   * Run training for specified generations
   * @param {Function} progressCallback - Optional callback for progress updates
   */
  async train(progressCallback = null) {
    if (this.population.length === 0) {
      this.initialize()
    }

    this.isTraining = true
    console.log('\n========================================')
    console.log('Starting AI Training')
    console.log('========================================\n')

    const startGen = this.generation

    for (this.generation = startGen; this.generation < this.config.generations; this.generation++) {
      if (!this.isTraining) {
        console.log('\nTraining stopped by user')
        break
      }

      console.log(`\n--- Generation ${this.generation + 1}/${this.config.generations} ---`)

      // Evaluate population
      const evalStart = Date.now()
      const evalResult = await this.evaluator.evaluatePopulation(
        this.population,
        (progress) => {
          if (progressCallback) {
            progressCallback({
              type: 'evaluation',
              generation: this.generation + 1,
              ...progress
            })
          }
        }
      )
      const evalTime = ((Date.now() - evalStart) / 1000).toFixed(1)

      // Get population statistics
      const stats = this.ga.getPopulationStats(this.population, evalResult.fitnessScores)

      // Update best genome
      if (evalResult.bestFitness > this.bestFitness) {
        this.bestFitness = evalResult.bestFitness
        this.bestGenome = { ...evalResult.bestGenome }
        console.log(`  NEW BEST! Fitness: ${this.bestFitness.toFixed(2)}`)
      }

      // Record history
      const historyEntry = {
        generation: this.generation + 1,
        maxFitness: stats.maxFitness,
        avgFitness: stats.avgFitness,
        minFitness: stats.minFitness,
        diversity: stats.diversity,
        bestWinRate: evalResult.bestWinRate,
        bestBaselineWinRate: evalResult.bestBaselineWinRate || 0, // 新增：對基線的勝率
        evaluationTime: evalTime,
        timestamp: new Date().toISOString()
      }
      this.history.push(historyEntry)

      // Print progress
      console.log(`  Max Fitness: ${stats.maxFitness.toFixed(2)}`)
      console.log(`  Avg Fitness: ${stats.avgFitness.toFixed(2)}`)
      console.log(`  Best Win Rate: ${(evalResult.bestWinRate * 100).toFixed(1)}%`)
      console.log(`  Best vs Baseline: ${((evalResult.bestBaselineWinRate || 0) * 100).toFixed(1)}%`) // 新增
      console.log(`  Diversity: ${(stats.diversity * 100).toFixed(1)}%`)
      console.log(`  Eval Time: ${evalTime}s`)

      // Progress callback
      if (progressCallback) {
        progressCallback({
          type: 'generation_complete',
          generation: this.generation + 1,
          totalGenerations: this.config.generations,
          stats: historyEntry,
          bestFitness: this.bestFitness
        })
      }

      // Save checkpoint periodically
      if ((this.generation + 1) % this.config.checkpointInterval === 0) {
        this.saveCheckpoint()
        this.saveBestGenome()
      }

      // Early stopping check
      if (this.config.enableEarlyStopping) {
        if (this.earlyStopping.shouldStop(stats.maxFitness, evalResult.bestGenome)) {
          console.log(`\nEarly stopping triggered at generation ${this.generation + 1}`)
          console.log(`No improvement for ${this.config.earlyStoppingPatience} generations`)
          break
        }
      }

      // Inject diversity periodically
      if (this.config.injectDiversityInterval > 0 &&
          (this.generation + 1) % this.config.injectDiversityInterval === 0 &&
          stats.diversity < 0.2) {
        console.log(`  Injecting diversity (current: ${(stats.diversity * 100).toFixed(1)}%)`)
        // Sort by fitness to remove worst
        const sortedPopulation = this.population
          .map((g, i) => ({ genome: g, fitness: evalResult.fitnessScores[i] }))
          .sort((a, b) => b.fitness - a.fitness)
          .map(e => e.genome)
        this.population = this.ga.injectDiversity(
          sortedPopulation,
          this.config.diversityInjectionCount
        )
      }

      // Evolve to next generation
      if (this.generation < this.config.generations - 1) {
        const adaptiveMutationRate = this.ga.getAdaptiveMutationRate(
          stats.maxFitness,
          this.history.length > 1 ? this.history[this.history.length - 2].maxFitness : 0,
          this.generation,
          this.config.generations
        )

        this.population = this.ga.evolve(this.population, evalResult.fitnessScores, {
          mutationRate: adaptiveMutationRate
        })

        console.log(`  Evolved to next generation (mutation rate: ${(adaptiveMutationRate * 100).toFixed(1)}%)`)
      }
    }

    this.isTraining = false

    // Final save
    this.saveCheckpoint()
    this.saveBestGenome()
    this.saveTrainingHistory()
    this.saveFinalReport()

    console.log('\n========================================')
    console.log('Training Complete!')
    console.log('========================================')
    console.log(`  Total generations: ${this.generation}`)
    console.log(`  Best fitness: ${this.bestFitness.toFixed(2)}`)
    console.log(`  Training time: ${this.getTrainingTime()}`)
    console.log(`  Output directory: ${this.config.outputDir}`)
    console.log('========================================\n')

    return {
      bestGenome: this.bestGenome,
      bestFitness: this.bestFitness,
      generations: this.generation,
      history: this.history
    }
  }

  /**
   * Stop training gracefully
   */
  stop() {
    console.log('Stopping training...')
    this.isTraining = false
  }

  /**
   * Save training history
   */
  saveTrainingHistory() {
    const historyPath = path.join(this.config.outputDir, 'training-history.json')
    fs.writeFileSync(historyPath, JSON.stringify(this.history, null, 2))
    console.log(`  Training history saved: ${historyPath}`)
  }

  /**
   * Save final training report
   */
  saveFinalReport() {
    const report = {
      summary: {
        totalGenerations: this.generation,
        bestFitness: this.bestFitness,
        trainingTime: this.getTrainingTime(),
        completedAt: new Date().toISOString()
      },
      config: this.config,
      bestGenome: this.bestGenome,
      evolutionStats: {
        fitnessImprovement: this.history.length > 0
          ? this.history[this.history.length - 1].maxFitness - this.history[0].maxFitness
          : 0,
        avgFitnessImprovement: this.history.length > 0
          ? this.history[this.history.length - 1].avgFitness - this.history[0].avgFitness
          : 0,
        finalDiversity: this.history.length > 0
          ? this.history[this.history.length - 1].diversity
          : 0
      },
      chartData: {
        generations: this.history.map(h => h.generation),
        maxFitness: this.history.map(h => h.maxFitness),
        avgFitness: this.history.map(h => h.avgFitness),
        diversity: this.history.map(h => h.diversity),
        bestWinRate: this.history.map(h => h.bestWinRate)
      }
    }

    const reportPath = path.join(this.config.outputDir, 'training-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`  Training report saved: ${reportPath}`)
  }

  /**
   * Get formatted training time
   */
  getTrainingTime() {
    if (!this.startTime) return 'N/A'

    const elapsed = Date.now() - this.startTime
    const hours = Math.floor(elapsed / 3600000)
    const minutes = Math.floor((elapsed % 3600000) / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  /**
   * Get current training status
   */
  getStatus() {
    return {
      isTraining: this.isTraining,
      generation: this.generation,
      totalGenerations: this.config.generations,
      progress: this.generation / this.config.generations,
      bestFitness: this.bestFitness,
      populationSize: this.population.length,
      trainingTime: this.getTrainingTime()
    }
  }
}

export default TrainingManager
