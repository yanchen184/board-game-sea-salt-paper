#!/usr/bin/env node
/**
 * Integrate Trained AI
 *
 * Copies the best trained genome to the game data directory
 * and updates the AI service to use it.
 *
 * Usage:
 *   node scripts/integrateTrainedAI.js [genome-path]
 *
 * If no path specified, uses ./trained-ai/best-ai-final.json
 */

import fs from 'fs'
import path from 'path'

const DEFAULT_GENOME_PATH = './trained-ai/best-ai-final.json'
const TARGET_PATH = './src/data/trainedGenome.json'

function main() {
  const genomePath = process.argv[2] || DEFAULT_GENOME_PATH

  console.log('================================================================================')
  console.log('                  INTEGRATE TRAINED AI INTO GAME')
  console.log('================================================================================\n')

  // Check if genome file exists
  if (!fs.existsSync(genomePath)) {
    console.error(`ERROR: Genome file not found: ${genomePath}`)
    console.error('\nPlease run training first:')
    console.error('  npm run ai:train:quick')
    process.exit(1)
  }

  // Read and validate genome
  const genome = JSON.parse(fs.readFileSync(genomePath, 'utf-8'))

  console.log(`Source genome: ${genomePath}`)
  console.log(`Genome ID: ${genome.id}`)
  console.log(`Declaration Threshold: ${genome.declareThreshold?.toFixed(2) || 'N/A'}`)
  console.log(`Risk Tolerance: ${genome.riskTolerance?.toFixed(2) || 'N/A'}`)
  console.log(`Mermaid Priority: ${genome.mermaidPriority?.toFixed(2) || 'N/A'}`)
  console.log()

  // Ensure target directory exists
  const targetDir = path.dirname(TARGET_PATH)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // Copy genome
  fs.writeFileSync(TARGET_PATH, JSON.stringify(genome, null, 2))
  console.log(`Genome copied to: ${TARGET_PATH}`)
  console.log()

  // Generate integration code snippet
  console.log('================================================================================')
  console.log('INTEGRATION CODE:')
  console.log('================================================================================')
  console.log(`
// Add this to your aiService.js or create a new trainedAIService.js:

import trainedGenome from '../data/trainedGenome.json' assert { type: 'json' }

// Simple decision function using trained parameters
export function makeTrainedAIDecision(gameState, playerId) {
  const genome = trainedGenome
  const player = gameState.players[playerId]
  const phase = gameState.turnPhase

  // Draw phase
  if (phase === 'draw') {
    return evaluateDrawDecision(genome, gameState, playerId)
  }

  // Pair phase
  if (phase === 'pair') {
    return evaluatePairDecision(genome, gameState, playerId)
  }

  // Declare phase
  if (phase === 'declare') {
    return evaluateDeclareDecision(genome, gameState, playerId)
  }

  return { action: 'end_turn' }
}

// Or use the full ParametricAI module:
import { makeDecision } from '../scripts/ai-training/ParametricAI.js'

export function makeTrainedAIDecisionV2(gameState, playerId) {
  return makeDecision(trainedGenome, gameState, playerId)
}
`)

  console.log('================================================================================')
  console.log('DONE! The trained AI genome is now available in your game.')
  console.log('================================================================================\n')
}

main()
