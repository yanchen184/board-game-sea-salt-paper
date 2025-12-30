# AI Training System - Sea Salt & Paper

## Overview

This AI training system uses a **Genetic Algorithm** to evolve optimal AI strategies for the Sea Salt & Paper card game. Through thousands of simulated games, the system discovers effective decision-making parameters that outperform hand-crafted AI logic.

## Quick Start

```bash
# Run validation tests
npm run ai:test

# Quick training (30 generations, ~15 minutes)
npm run ai:train:quick

# Full training (100 generations, ~1-2 hours)
npm run ai:train:full

# Custom training
node scripts/trainAI.js --generations 50 --population 40
```

## System Architecture

```
scripts/ai-training/
  |-- AIGenome.js         # Genome definition and gene constraints
  |-- ParametricAI.js     # Decision-making based on genome parameters
  |-- GameSimulator.js    # Fast game simulation (no UI/Firebase)
  |-- GeneticAlgorithm.js # Selection, crossover, mutation operations
  |-- FitnessEvaluator.js # Evaluate genomes through competitive play
  |-- TrainingManager.js  # Orchestrates the training process
  |-- index.js            # Main exports

scripts/
  |-- trainAI.js          # Main training script (CLI)
  |-- quickTest.js        # Validation tests
```

## How It Works

### 1. Genome Representation

Each AI is represented by a **genome** - a set of numerical parameters that control decision-making:

```javascript
const genome = {
  // Draw Strategy
  deckBaseValue: 3.0,           // Expected value of drawing from deck
  discardPairBonus: 3.0,        // Bonus when discard card can form pair

  // Declaration Strategy
  declareThreshold: 7,          // Minimum score to consider declaring
  riskTolerance: 0.5,           // Willingness to take risks

  // Collection Strategy
  mermaidPriority: 2.0,         // Priority for mermaids
  sailorPriority: 1.8,          // Priority for sailors

  // ... 30+ parameters total
}
```

### 2. Evolutionary Process

```
1. Initialize random population (50 genomes)
2. For each generation:
   a. Each genome plays matches against others
   b. Calculate fitness (win rate, score, etc.)
   c. Select best performers (tournament selection)
   d. Create offspring (crossover + mutation)
   e. Replace population with new generation
3. Output best genome after N generations
```

### 3. Fitness Function

Fitness is calculated from:
- **Win Rate** (100 points per 100% win rate)
- **Average Score** (0.5 points per point)
- **Win Margin** (0.2 points per point difference)
- **Last Chance Wins** (5 points bonus each)
- **Mermaid Wins** (10 points bonus each)

## Training Options

### Command Line Arguments

```bash
node scripts/trainAI.js [options]

Options:
  --test              10 generations, 20 population (~2 min)
  --quick             30 generations, 30 population (~15 min)
  --full              100 generations, 50 population (~2 hours)
  --generations N     Custom generation count
  --population N      Custom population size
  --resume PATH       Resume from checkpoint
  --output DIR        Output directory
  --verbose           Enable verbose logging
```

### Example Training Runs

```bash
# Quick validation
npm run ai:train:test

# Overnight training
npm run ai:train:full -- --output ./my-trained-ai

# Resume interrupted training
node scripts/trainAI.js --resume ./trained-ai/checkpoint-gen50.json
```

## Output Files

After training, the following files are created in `./trained-ai/`:

```
trained-ai/
  |-- best-ai-final.json      # Best genome (use this!)
  |-- best-ai-gen50.json      # Best genome at generation 50
  |-- checkpoint-gen50.json   # Full training state for resuming
  |-- training-history.json   # Fitness history per generation
  |-- training-report.json    # Summary report with charts data
```

## Using the Trained AI

### Method 1: Direct Integration

```javascript
// In your game code
import trainedGenome from './trained-ai/best-ai-final.json'
import { makeDecision } from './scripts/ai-training/ParametricAI.js'

function aiTurn(gameState, playerId) {
  const decision = makeDecision(trainedGenome, gameState, playerId)
  return decision
}
```

### Method 2: Difficulty Levels

Create multiple genomes with varying training or parameters:

```javascript
const DIFFICULTY_GENOMES = {
  easy: require('./trained-ai/easy-genome.json'),
  medium: require('./trained-ai/medium-genome.json'),
  hard: require('./trained-ai/best-ai-final.json')
}

function makeAIDecision(difficulty, gameState, playerId) {
  const genome = DIFFICULTY_GENOMES[difficulty]
  return makeDecision(genome, gameState, playerId)
}
```

## Performance Tips

### Training Speed

1. **Reduce matches per genome** for faster (but noisier) training:
   ```javascript
   matchesPerGenome: 5  // Default is 10
   ```

2. **Use early stopping** to avoid wasted computation:
   ```javascript
   enableEarlyStopping: true,
   earlyStoppingPatience: 15
   ```

3. **Smaller population** for quick experiments:
   ```bash
   node scripts/trainAI.js --population 20
   ```

### Training Quality

1. **More games per match** for accurate evaluation:
   ```javascript
   gamesPerMatch: 5  // Default is 3
   ```

2. **Larger population** for better exploration:
   ```bash
   node scripts/trainAI.js --population 80
   ```

3. **More generations** for fine-tuning:
   ```bash
   node scripts/trainAI.js --generations 200
   ```

## Understanding Results

### Training History

```json
{
  "generation": 50,
  "maxFitness": 145.2,
  "avgFitness": 98.5,
  "diversity": 0.25,
  "bestWinRate": 0.72
}
```

- **maxFitness**: Best individual's score
- **avgFitness**: Population average (should increase)
- **diversity**: Genetic variety (0-1, higher = more varied)
- **bestWinRate**: Best individual's win rate

### Good Training Indicators

1. **Increasing fitness** over generations
2. **Diversity > 0.1** (avoiding premature convergence)
3. **Win rate > 55%** against baseline

### Troubleshooting

**Problem: Fitness plateau**
- Increase mutation rate
- Inject diversity (automatic after 20 generations)
- Try different selection method

**Problem: Low diversity**
- Decrease elite count
- Increase mutation strength
- Use larger population

**Problem: Inconsistent results**
- Increase games per match
- Increase matches per genome
- Use same seed for reproducibility

## Technical Details

### Gene Constraints

Each gene has defined min/max bounds:

| Gene | Min | Max | Description |
|------|-----|-----|-------------|
| declareThreshold | 5 | 12 | Score needed to declare |
| riskTolerance | 0 | 1 | Willingness to gamble |
| mermaidPriority | 1 | 4 | How much to prioritize mermaids |
| sailorPriority | 0.5 | 3 | How much to prioritize sailors |

### Mutation

Uses Gaussian mutation:
```javascript
newValue = oldValue + N(0, mutationStrength * range)
```

### Crossover

Uniform crossover with 50% gene swap probability.

### Selection

Tournament selection (default size 3).

## Extending the System

### Adding New Genes

1. Add to `GENE_CONSTRAINTS` in `AIGenome.js`
2. Add to `DEFAULT_GENOME`
3. Use in `ParametricAI.js` decision logic

### Custom Fitness Function

Modify `FitnessEvaluator.calculateFitness()`:

```javascript
calculateFitness(results) {
  // Custom scoring logic
  return winRate * 100 + avgScore * 0.5 + customMetric * 10
}
```

### Multi-Player Training

Set `playerCount: 4` in configuration for 4-player games.

## Version History

- **v1.0** - Initial release with genetic algorithm training
- Future: Neural network integration, online learning

## References

- [Genetic Algorithms Explained](https://en.wikipedia.org/wiki/Genetic_algorithm)
- [Game AI Tutorial](https://www.redblobgames.com/)
- [Sea Salt & Paper Rules](https://boardgamegeek.com/boardgame/367220/sea-salt-paper)
