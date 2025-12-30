# AI Battle Simulation System

Comprehensive AI battle simulation system for testing, training, and optimizing AI strategies in Sea Salt & Paper.

## Overview

This system provides:

- **Game Simulation** - Complete game flow simulation with all rules
- **Batch Battles** - Run hundreds of automated games
- **Bug Detection** - Invariant checking and infinite loop detection
- **Training Data Collection** - ML-ready feature extraction
- **Statistics Analysis** - Detailed win rates and performance metrics

## Quick Start

### Run a Single Test Game

```bash
npm run battle:single
```

This runs one game with verbose output for debugging.

### Run Quick Battles (10 games per matchup)

```bash
npm run battle:quick
```

### Run Full Battles (100 games per matchup)

```bash
npm run battle:full
```

### Run Extensive Battles (500 games per matchup)

```bash
npm run battle:extensive
```

### Collect Training Data

```bash
npm run battle:training
```

## Command Line Options

```bash
node scripts/runBattle.js [options]
```

### Available Options

| Option | Description | Default |
|--------|-------------|---------|
| `--games N` | Games per matchup | 10 |
| `--players N` | Players per game (2-4) | 2 |
| `--strategies S` | Comma-separated strategies | easy,medium,hard |
| `--matchup S` | Specific matchup (e.g., "hard,medium") | all |
| `--output DIR` | Output directory | ./scripts/output |
| `--verbose` | Enable verbose output | false |
| `--training` | Collect training data | false |
| `--single` | Run single game | false |
| `--help` | Show help | - |

### Examples

```bash
# Run 100 games for all matchups
node scripts/runBattle.js --games 100

# Run specific matchup with verbose output
node scripts/runBattle.js --matchup "hard,medium" --games 50 --verbose

# Run 3-player games
node scripts/runBattle.js --players 3 --games 20

# Single test game
node scripts/runBattle.js --single --matchup "easy,hard" --verbose

# Collect training data for ML
node scripts/runBattle.js --games 200 --training
```

## Architecture

### Core Components

```
scripts/
+-- runBattle.js              # Main entry point (CLI)
+-- gameSimulator.js          # Game simulation engine
+-- battleOrchestrator.js     # Batch battle management
+-- utils/
    +-- enhancedBattleLogger.js    # Comprehensive logging
    +-- bugDetector.js             # Invariant checking
    +-- trainingDataCollector.js   # ML data collection
    +-- statsAnalyzer.js           # Statistics analysis
    +-- nodeEnv.js                 # Node.js compatibility
```

### Data Flow

```
runBattle.js (CLI)
       |
       v
BattleOrchestrator (manages matchups)
       |
       v
GameSimulator (runs games)
       |
       +-- EnhancedBattleLogger (logs events)
       +-- BugDetector (checks invariants)
       +-- TrainingDataCollector (extracts features)
       |
       v
StatsAnalyzer (generates reports)
```

## Components

### 1. GameSimulator

Simulates complete games integrating:
- `gameService.js` - Game logic
- `aiService.js` - AI decision making
- `scoreService.js` - Score calculation

Features:
- Complete turn phases (draw, pair, declare)
- Pair effects (draw_blind, draw_discard, extra_turn, steal_card)
- Declare modes (STOP, LAST_CHANCE)
- Multi-round games

### 2. BattleOrchestrator

Manages batch battles:
- Generates all matchup combinations
- Runs multiple games per matchup
- Aggregates statistics
- Generates reports

### 3. EnhancedBattleLogger

Logs:
- Game start/end events
- Turn-by-turn actions
- AI decisions with reasoning
- Errors and anomalies

Export formats:
- JSON (full logs)
- Condensed JSON (summary only)

### 4. BugDetector

Checks:
- Hand size invariants
- Deck integrity (no duplicates)
- Turn order validity
- Total card count
- Score validity
- Phase validity

Detects:
- Infinite loops
- State corruption
- Logic errors

### 5. TrainingDataCollector

Extracts features:
- Basic features (hand size, deck size, score)
- Card composition (count by type)
- Pair potential
- Color distribution
- Opponent analysis
- Game progress

Export formats:
- JSON (with metadata)
- CSV (for ML tools)

## Output

### Directory Structure

```
scripts/output/
+-- logs/
|   +-- game_xxx_logs.json
+-- bugs/
|   +-- bug_report_xxx.json
+-- training/
|   +-- training_data_xxx.json
|   +-- training_data_xxx.csv
+-- battle_report_xxx.json
+-- battle_stats_xxx.txt
```

### Report Contents

#### Strategy Performance
```
MEDIUM:
  Win Rate: 55.50% (111W / 89L)
  Avg Score: 12.34
  Games: 200
```

#### Head-to-Head
```
hard vs medium:
  Games: 100
  hard Win Rate: 52.00%
  medium Win Rate: 48.00%
  Avg Score Difference: 3.21
```

#### Insights
```
Best Strategy: hard (Win Rate: 58.33%)
Worst Strategy: easy (Win Rate: 35.00%)
Highest Avg Score: hard (13.45 points)
Fastest Strategy: easy (15.23 avg turns)
```

## AI Strategies

### Easy
- Random decisions
- Basic declaration logic (score >= 7)

### Medium
- Pair awareness
- Collection card evaluation
- Color bonus consideration
- Turn-count based declaration

### Hard
- Deep analysis of all options
- Multiplier synergy awareness
- Opponent score tracking
- Optimized declaration timing

## Training Data Features

The training data collector extracts 50+ features:

### Basic Features
- `handSize`, `playedPairsCount`, `currentScore`
- `deckSize`, `turnCount`, `round`, `playerCount`

### Card Composition
- `fishCount`, `crabCount`, `sailboatCount`, ...
- `mermaidCount`, `shellCount`, `octopusCount`, ...

### Strategic Features
- `potentialPairs`, `hasPairAvailable`
- `canDeclare`, `isLeading`, `scoreDifferential`
- `isEarlyGame`, `isMidGame`, `isLateGame`

### Opponent Features
- `maxOpponentHandSize`, `avgOpponentPairs`

## Bug Detection

### Invariant Checks

1. **Hand Size** - No player exceeds maximum (20 cards)
2. **Deck Integrity** - No duplicate cards in deck
3. **Turn Order** - Current player index matches player ID
4. **Card Count** - Total cards equals expected (72)
5. **Player States** - All player data is valid
6. **Phase Validity** - Turn phase is recognized
7. **Score Validity** - No NaN or Infinity scores

### Infinite Loop Detection

- Turn count limit (default: 500)
- Repeated state detection
- Action pattern analysis

## Extending the System

### Adding New Strategies

1. Add decision function in `aiService.js`:

```javascript
export function makeCustomDecision(gameState, playerId) {
  // Your logic here
  return {
    action: 'draw',
    source: 'deck',
    reason: 'Custom reasoning'
  }
}
```

2. Register in `gameSimulator.js`:

```javascript
const STRATEGY_MAP = {
  easy: makeEasyDecision,
  medium: makeMediumDecision,
  hard: makeHardDecision,
  custom: makeCustomDecision  // Add this
}
```

3. Run battles:

```bash
node scripts/runBattle.js --matchup "custom,hard" --games 50
```

### Adding New Features

Edit `trainingDataCollector.js`:

```javascript
extractCustomFeatures(gameState, playerId) {
  return {
    myFeature: calculateMyFeature(gameState)
  }
}
```

## Troubleshooting

### Import Errors

Ensure you're using Node.js 18+ with ES modules support.

### Infinite Loop Detected

Check the bug report for state history and action patterns.

### Low Win Rates

Analyze the decision logs to understand AI behavior.

## Related Documentation

- [AI Service](../src/services/aiService.js) - AI decision logic
- [Game Service](../src/services/gameService.js) - Core game logic
- [Score Service](../src/services/scoreService.js) - Scoring rules
- [Card Helpers](../src/utils/cardHelpers.js) - Card utilities

## Legacy Scripts

The original batch battle script is still available:

```bash
npm run battle:legacy
```

This runs the older `batchBattle.js` implementation.
