/**
 * Genetic Algorithm Engine
 *
 * Implements selection, crossover, and mutation operations
 * for evolving AI genomes.
 *
 * Features:
 * - Roulette wheel selection
 * - Tournament selection
 * - Single-point and uniform crossover
 * - Gaussian mutation
 * - Elite preservation
 * - Adaptive mutation rate
 */

import {
  GENE_CONSTRAINTS,
  generateRandomGenome,
  clampGene,
  validateGenome
} from './AIGenome.js'

/**
 * Genetic Algorithm Class
 */
export class GeneticAlgorithm {
  constructor(options = {}) {
    this.populationSize = options.populationSize || 50
    this.eliteCount = options.eliteCount || 5
    this.mutationRate = options.mutationRate || 0.1
    this.mutationStrength = options.mutationStrength || 0.2
    this.crossoverRate = options.crossoverRate || 0.8
    this.tournamentSize = options.tournamentSize || 3
    this.selectionMethod = options.selectionMethod || 'tournament' // 'tournament' or 'roulette'
    this.crossoverMethod = options.crossoverMethod || 'uniform' // 'single' or 'uniform'
    this.adaptiveMutation = options.adaptiveMutation !== false
  }

  /**
   * Initialize a random population
   * @returns {Array} Array of genomes
   */
  initializePopulation() {
    const population = []
    for (let i = 0; i < this.populationSize; i++) {
      population.push(generateRandomGenome())
    }
    return population
  }

  /**
   * Select parents using tournament selection
   * @param {Array} population - Current population
   * @param {Array} fitnessScores - Fitness scores for each genome
   * @returns {Object} Selected parent genome
   */
  tournamentSelect(population, fitnessScores) {
    const candidates = []

    for (let i = 0; i < this.tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length)
      candidates.push({
        genome: population[randomIndex],
        fitness: fitnessScores[randomIndex]
      })
    }

    // Select the best candidate
    candidates.sort((a, b) => b.fitness - a.fitness)
    return candidates[0].genome
  }

  /**
   * Select parents using roulette wheel selection
   * @param {Array} population - Current population
   * @param {Array} fitnessScores - Fitness scores for each genome
   * @returns {Object} Selected parent genome
   */
  rouletteSelect(population, fitnessScores) {
    // Normalize fitness scores (handle negative values)
    const minFitness = Math.min(...fitnessScores)
    const adjustedScores = fitnessScores.map(f => f - minFitness + 1)
    const totalFitness = adjustedScores.reduce((sum, f) => sum + f, 0)

    const randomValue = Math.random() * totalFitness
    let cumulative = 0

    for (let i = 0; i < population.length; i++) {
      cumulative += adjustedScores[i]
      if (cumulative >= randomValue) {
        return population[i]
      }
    }

    // Fallback to last genome
    return population[population.length - 1]
  }

  /**
   * Select a parent based on configured selection method
   * @param {Array} population - Current population
   * @param {Array} fitnessScores - Fitness scores
   * @returns {Object} Selected parent genome
   */
  selectParent(population, fitnessScores) {
    if (this.selectionMethod === 'tournament') {
      return this.tournamentSelect(population, fitnessScores)
    } else {
      return this.rouletteSelect(population, fitnessScores)
    }
  }

  /**
   * Single-point crossover
   * @param {Object} parent1 - First parent genome
   * @param {Object} parent2 - Second parent genome
   * @returns {Object} Child genome
   */
  singlePointCrossover(parent1, parent2) {
    const geneNames = Object.keys(GENE_CONSTRAINTS)
    const crossoverPoint = Math.floor(Math.random() * geneNames.length)

    const child = { id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }

    geneNames.forEach((gene, index) => {
      if (index < crossoverPoint) {
        child[gene] = parent1[gene]
      } else {
        child[gene] = parent2[gene]
      }
    })

    return child
  }

  /**
   * Uniform crossover
   * @param {Object} parent1 - First parent genome
   * @param {Object} parent2 - Second parent genome
   * @returns {Object} Child genome
   */
  uniformCrossover(parent1, parent2) {
    const geneNames = Object.keys(GENE_CONSTRAINTS)
    const child = { id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }

    geneNames.forEach(gene => {
      // 50% chance of inheriting from each parent
      if (Math.random() < 0.5) {
        child[gene] = parent1[gene]
      } else {
        child[gene] = parent2[gene]
      }
    })

    return child
  }

  /**
   * Perform crossover between two parents
   * @param {Object} parent1 - First parent genome
   * @param {Object} parent2 - Second parent genome
   * @returns {Object} Child genome
   */
  crossover(parent1, parent2) {
    // Check if crossover should happen
    if (Math.random() > this.crossoverRate) {
      // Return a copy of one parent
      return { ...parent1, id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
    }

    if (this.crossoverMethod === 'single') {
      return this.singlePointCrossover(parent1, parent2)
    } else {
      return this.uniformCrossover(parent1, parent2)
    }
  }

  /**
   * Mutate a genome using Gaussian noise
   * @param {Object} genome - Genome to mutate
   * @param {number} mutationRate - Optional override mutation rate
   * @returns {Object} Mutated genome
   */
  mutate(genome, mutationRate = null) {
    const rate = mutationRate !== null ? mutationRate : this.mutationRate
    const mutated = { ...genome }

    Object.keys(GENE_CONSTRAINTS).forEach(gene => {
      if (Math.random() < rate) {
        const constraint = GENE_CONSTRAINTS[gene]
        const range = constraint.max - constraint.min

        // Gaussian noise
        const u1 = Math.random()
        const u2 = Math.random()
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

        // Apply mutation
        const noise = z * this.mutationStrength * range
        mutated[gene] = clampGene(gene, mutated[gene] + noise)
      }
    })

    return mutated
  }

  /**
   * Get adaptive mutation rate based on fitness progress
   * @param {number} currentBestFitness - Current best fitness
   * @param {number} previousBestFitness - Previous best fitness
   * @param {number} generation - Current generation
   * @param {number} maxGenerations - Maximum generations
   * @returns {number} Adjusted mutation rate
   */
  getAdaptiveMutationRate(currentBestFitness, previousBestFitness, generation, maxGenerations) {
    if (!this.adaptiveMutation) {
      return this.mutationRate
    }

    const progress = (currentBestFitness - previousBestFitness) / Math.max(1, previousBestFitness)
    const generationRatio = generation / maxGenerations

    // If progress is stalling, increase mutation rate
    if (progress < 0.01) {
      return Math.min(this.mutationRate * 1.5, 0.3)
    }

    // In late generations, decrease mutation rate for fine-tuning
    if (generationRatio > 0.7) {
      return Math.max(this.mutationRate * 0.5, 0.01)
    }

    return this.mutationRate
  }

  /**
   * Evolve population to next generation
   * @param {Array} population - Current population of genomes
   * @param {Array} fitnessScores - Fitness scores for each genome
   * @param {Object} options - Evolution options
   * @returns {Array} Next generation population
   */
  evolve(population, fitnessScores, options = {}) {
    const {
      mutationRate = this.mutationRate,
      preserveElites = true
    } = options

    // Pair genomes with fitness scores and sort
    const ranked = population.map((genome, index) => ({
      genome,
      fitness: fitnessScores[index]
    })).sort((a, b) => b.fitness - a.fitness)

    const nextGeneration = []

    // Elite preservation
    if (preserveElites && this.eliteCount > 0) {
      for (let i = 0; i < this.eliteCount && i < ranked.length; i++) {
        nextGeneration.push({ ...ranked[i].genome })
      }
    }

    // Generate rest of population through selection, crossover, and mutation
    while (nextGeneration.length < this.populationSize) {
      const parent1 = this.selectParent(population, fitnessScores)
      const parent2 = this.selectParent(population, fitnessScores)

      let child = this.crossover(parent1, parent2)
      child = this.mutate(child, mutationRate)

      nextGeneration.push(child)
    }

    return nextGeneration
  }

  /**
   * Calculate diversity of population
   * Higher diversity = more varied genomes
   * @param {Array} population - Population of genomes
   * @returns {number} Diversity score (0-1)
   */
  calculateDiversity(population) {
    if (population.length < 2) return 0

    const geneNames = Object.keys(GENE_CONSTRAINTS)
    let totalVariance = 0

    geneNames.forEach(gene => {
      const constraint = GENE_CONSTRAINTS[gene]
      const range = constraint.max - constraint.min
      const values = population.map(g => g[gene])

      // Calculate variance
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length

      // Normalize by gene range
      totalVariance += variance / (range * range)
    })

    // Average and scale to 0-1
    return Math.min(1, totalVariance / geneNames.length * 4)
  }

  /**
   * Get statistics about the current population
   * @param {Array} population - Population of genomes
   * @param {Array} fitnessScores - Fitness scores
   * @returns {Object} Population statistics
   */
  getPopulationStats(population, fitnessScores) {
    const sortedFitness = [...fitnessScores].sort((a, b) => b - a)

    return {
      size: population.length,
      maxFitness: sortedFitness[0] || 0,
      minFitness: sortedFitness[sortedFitness.length - 1] || 0,
      avgFitness: fitnessScores.reduce((a, b) => a + b, 0) / fitnessScores.length,
      medianFitness: sortedFitness[Math.floor(sortedFitness.length / 2)] || 0,
      diversity: this.calculateDiversity(population),
      topQuartileFitness: sortedFitness[Math.floor(sortedFitness.length * 0.25)] || 0
    }
  }

  /**
   * Inject fresh genetic material (to maintain diversity)
   * @param {Array} population - Current population
   * @param {number} count - Number of new genomes to inject
   * @returns {Array} Population with injected genomes
   */
  injectDiversity(population, count = 5) {
    const newPopulation = [...population]

    // Remove worst performers
    newPopulation.splice(-count)

    // Add new random genomes
    for (let i = 0; i < count; i++) {
      newPopulation.push(generateRandomGenome())
    }

    return newPopulation
  }
}

/**
 * Early stopping checker
 * Stops training if no improvement for N generations
 */
export class EarlyStopping {
  constructor(patience = 10, minDelta = 0.01) {
    this.patience = patience
    this.minDelta = minDelta
    this.bestFitness = -Infinity
    this.counter = 0
    this.bestGenome = null
  }

  /**
   * Check if training should stop
   * @param {number} currentFitness - Current best fitness
   * @param {Object} currentBestGenome - Current best genome
   * @returns {boolean} Whether to stop training
   */
  shouldStop(currentFitness, currentBestGenome) {
    if (currentFitness > this.bestFitness + this.minDelta) {
      this.bestFitness = currentFitness
      this.bestGenome = { ...currentBestGenome }
      this.counter = 0
      return false
    }

    this.counter++
    return this.counter >= this.patience
  }

  /**
   * Get the best genome seen so far
   * @returns {Object} Best genome
   */
  getBestGenome() {
    return this.bestGenome
  }

  /**
   * Reset the early stopping state
   */
  reset() {
    this.bestFitness = -Infinity
    this.counter = 0
    this.bestGenome = null
  }
}

export default { GeneticAlgorithm, EarlyStopping }
