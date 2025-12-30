/**
 * AI Genome Definition
 *
 * Defines the genetic structure of AI decision parameters.
 * Each gene controls a specific aspect of AI behavior.
 *
 * Gene Categories:
 * 1. Draw Strategy - How AI chooses between deck and discard piles
 * 2. Pair Strategy - When and how to play pairs
 * 3. Declaration Strategy - When to declare Stop or Last Chance
 * 4. Collection Strategy - Prioritization of collection cards
 * 5. Opponent Awareness - Blocking and defensive play
 */

/**
 * Default genome with balanced values
 * Used as baseline and for comparison
 */
export const DEFAULT_GENOME = {
  // === DRAW STRATEGY ===
  deckBaseValue: 3.0,           // Base expected value of drawing from deck (2-5)
  discardPairBonus: 3.0,        // Bonus value when discard card can form pair (1-5)
  discardCollectionBonus: 2.0,  // Bonus for collection cards (1-4)
  discardMultiplierBonus: 2.0,  // Bonus for multiplier synergy (1-4)
  discardColorBonus: 1.5,       // Bonus for matching dominant color (0.5-3)
  blockingWeight: 0.5,          // Weight for blocking opponents from good cards (0-1)

  // === PAIR STRATEGY ===
  minPairValue: 0,              // Minimum value to play a pair (-2 to 5)
  fishPairBonus: 2.0,           // Extra value for Fish pair (draw effect) (0-4)
  crabPairBonus: 3.0,           // Extra value for Crab pair (choose discard) (0-5)
  sailboatPairBonus: 4.0,       // Extra value for Sailboat pair (extra turn) (0-6)
  stealPairBonus: 3.0,          // Extra value for Shark+Swimmer pair (0-5)
  earlyGamePairThreshold: 5,    // Turn count considered "early game" (3-8)
  earlyGamePairBonus: 1.2,      // Multiplier for playing pairs early (0.8-1.5)
  lateGamePairBonus: 0.9,       // Multiplier for playing pairs late (0.6-1.2)

  // === DECLARATION STRATEGY ===
  declareThreshold: 7,          // Minimum score to consider declaring (5-12)
  stopVsLastChanceTurnThreshold: 10, // Turn count threshold for Stop vs Last Chance (5-15)
  scoreDifferenceForStop: 3,    // Score lead needed to prefer Stop (0-5)
  riskTolerance: 0.5,           // Willingness to take risks (0-1)
  opponentHandSizeWeight: 0.5,  // How much opponent hand size affects declaration (0-1)

  // === COLLECTION STRATEGY ===
  shellPriority: 1.3,           // Priority for shells (0.5-2.5)
  octopusPriority: 1.5,         // Priority for octopus (0.5-2.5)
  penguinPriority: 1.2,         // Priority for penguin (0.5-2.5)
  sailorPriority: 1.8,          // Priority for sailor (getting 2nd = 5 points!) (0.5-3)
  mermaidPriority: 2.0,         // Priority for mermaids (1-4)

  // === MULTIPLIER STRATEGY ===
  lighthousePriority: 1.5,      // Priority when we have sailboats (0.5-2.5)
  fishSchoolPriority: 1.5,      // Priority when we have fish (0.5-2.5)
  penguinColonyPriority: 1.8,   // Priority when we have penguins (0.5-3)
  captainPriority: 2.0,         // Priority when we have sailors (0.5-3)

  // === GAME PHASE AWARENESS ===
  earlyGameTurns: 4,            // Turns considered "early game" (2-6)
  midGameTurns: 8,              // Turns considered "mid game" (5-12)
  lateGameScoreBonus: 1.3,      // Multiplier for high-value cards in late game (1-2)

  // === OPPONENT MODELING ===
  opponentScoreAwareness: 0.7,  // Weight for considering opponent visible score (0-1)
  opponentHandAwareness: 0.5,   // Weight for considering opponent hand size (0-1)
  defensivePlayWeight: 0.3      // Weight for defensive vs aggressive play (0-1)
}

/**
 * Gene constraints (min/max values)
 * Used for mutation and initialization
 */
export const GENE_CONSTRAINTS = {
  // Draw Strategy
  deckBaseValue: { min: 2, max: 5 },
  discardPairBonus: { min: 1, max: 5 },
  discardCollectionBonus: { min: 1, max: 4 },
  discardMultiplierBonus: { min: 1, max: 4 },
  discardColorBonus: { min: 0.5, max: 3 },
  blockingWeight: { min: 0, max: 1 },

  // Pair Strategy
  minPairValue: { min: -2, max: 5 },
  fishPairBonus: { min: 0, max: 4 },
  crabPairBonus: { min: 0, max: 5 },
  sailboatPairBonus: { min: 0, max: 6 },
  stealPairBonus: { min: 0, max: 5 },
  earlyGamePairThreshold: { min: 3, max: 8 },
  earlyGamePairBonus: { min: 0.8, max: 1.5 },
  lateGamePairBonus: { min: 0.6, max: 1.2 },

  // Declaration Strategy
  declareThreshold: { min: 5, max: 12 },
  stopVsLastChanceTurnThreshold: { min: 5, max: 15 },
  scoreDifferenceForStop: { min: 0, max: 5 },
  riskTolerance: { min: 0, max: 1 },
  opponentHandSizeWeight: { min: 0, max: 1 },

  // Collection Strategy
  shellPriority: { min: 0.5, max: 2.5 },
  octopusPriority: { min: 0.5, max: 2.5 },
  penguinPriority: { min: 0.5, max: 2.5 },
  sailorPriority: { min: 0.5, max: 3 },
  mermaidPriority: { min: 1, max: 4 },

  // Multiplier Strategy
  lighthousePriority: { min: 0.5, max: 2.5 },
  fishSchoolPriority: { min: 0.5, max: 2.5 },
  penguinColonyPriority: { min: 0.5, max: 3 },
  captainPriority: { min: 0.5, max: 3 },

  // Game Phase Awareness
  earlyGameTurns: { min: 2, max: 6 },
  midGameTurns: { min: 5, max: 12 },
  lateGameScoreBonus: { min: 1, max: 2 },

  // Opponent Modeling
  opponentScoreAwareness: { min: 0, max: 1 },
  opponentHandAwareness: { min: 0, max: 1 },
  defensivePlayWeight: { min: 0, max: 1 }
}

/**
 * Generate a random genome within constraints
 * @returns {Object} Random genome
 */
export function generateRandomGenome() {
  const genome = { id: generateGenomeId() }

  Object.keys(GENE_CONSTRAINTS).forEach(gene => {
    const { min, max } = GENE_CONSTRAINTS[gene]
    genome[gene] = min + Math.random() * (max - min)
  })

  return genome
}

/**
 * Generate unique genome ID
 * @returns {string} Unique ID
 */
export function generateGenomeId() {
  return `genome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Clamp a gene value within its constraints
 * @param {string} gene - Gene name
 * @param {number} value - Gene value
 * @returns {number} Clamped value
 */
export function clampGene(gene, value) {
  const constraint = GENE_CONSTRAINTS[gene]
  if (!constraint) return value
  return Math.max(constraint.min, Math.min(constraint.max, value))
}

/**
 * Validate genome (ensure all genes are within constraints)
 * @param {Object} genome - Genome to validate
 * @returns {Object} Validated genome
 */
export function validateGenome(genome) {
  const validated = { id: genome.id || generateGenomeId() }

  Object.keys(GENE_CONSTRAINTS).forEach(gene => {
    if (genome[gene] !== undefined) {
      validated[gene] = clampGene(gene, genome[gene])
    } else {
      validated[gene] = DEFAULT_GENOME[gene]
    }
  })

  return validated
}

/**
 * Create a genome from difficulty preset
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Object} Preset genome
 */
export function createPresetGenome(difficulty) {
  const genome = { ...DEFAULT_GENOME, id: `preset_${difficulty}` }

  switch (difficulty) {
    case 'easy':
      // Random behavior, low thresholds
      genome.declareThreshold = 6
      genome.riskTolerance = 0.7
      genome.opponentScoreAwareness = 0.2
      genome.defensivePlayWeight = 0.1
      break

    case 'medium':
      // Balanced play
      // Uses default values
      break

    case 'hard':
      // Optimized aggressive play
      genome.declareThreshold = 8
      genome.riskTolerance = 0.4
      genome.opponentScoreAwareness = 0.9
      genome.defensivePlayWeight = 0.5
      genome.sailorPriority = 2.5
      genome.mermaidPriority = 3
      break
  }

  return genome
}

/**
 * Serialize genome to JSON string
 * @param {Object} genome - Genome to serialize
 * @returns {string} JSON string
 */
export function serializeGenome(genome) {
  return JSON.stringify(genome, null, 2)
}

/**
 * Deserialize genome from JSON string
 * @param {string} json - JSON string
 * @returns {Object} Genome
 */
export function deserializeGenome(json) {
  try {
    const genome = JSON.parse(json)
    return validateGenome(genome)
  } catch (error) {
    console.error('Failed to deserialize genome:', error)
    return { ...DEFAULT_GENOME, id: generateGenomeId() }
  }
}

export default {
  DEFAULT_GENOME,
  GENE_CONSTRAINTS,
  generateRandomGenome,
  generateGenomeId,
  clampGene,
  validateGenome,
  createPresetGenome,
  serializeGenome,
  deserializeGenome
}
