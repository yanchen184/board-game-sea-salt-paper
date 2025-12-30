# Sea Salt & Paper - Database Design Document

> **Database Type**: Firebase Realtime Database
> **Last Updated**: 2025-11-14
> **Version**: 2.0.0

---

## 📋 Table of Contents

1. [Database Overview](#database-overview)
2. [Data Structure](#data-structure)
3. [Security Rules](#security-rules)
4. [Indexes & Performance](#indexes--performance)
5. [Data Lifecycle](#data-lifecycle)
6. [Backup & Recovery](#backup--recovery)

---

## 🗄️ Database Overview

### Database Choice

**Firebase Realtime Database** was chosen because:

- Real-time synchronization out of the box
- Simple JSON-based data structure
- Easy integration with React
- Handles concurrent connections well
- Free tier sufficient for MVP
- Built-in offline support

### Database URL Structure

```
https://[project-id].firebaseio.com/
├── /rooms
├── /players
├── /games
└── /leaderboard
```

---

## 📊 Data Structure

### 1. Rooms Collection

**Path**: `/rooms/{roomId}`

**Purpose**: Store active game rooms and their state

```javascript
{
  "rooms": {
    "ABC123": {
      // Basic room info
      "roomId": "ABC123",
      "hostId": "player-uuid-1",
      "status": "waiting",  // waiting | playing | finished
      "createdAt": 1699999999999,
      "startedAt": null,
      "finishedAt": null,

      // Players in this room
      "players": {
        "player-uuid-1": {
          "id": "player-uuid-1",
          "name": "Alice",
          "isHost": true,
          "isReady": false,
          "isAI": false,
          "difficulty": null,
          "score": 0,
          "connected": true,
          "lastActive": 1699999999999,

          // Game-specific player data
          "hand": ["fish_1", "crab_2", "shell_3"],
          "handCount": 3,  // Public count, actual cards hidden
          "playedPairs": [
            {
              "cards": ["fish_1", "fish_2"],
              "effect": "draw_blind",
              "timestamp": 1699999999999
            }
          ]
        },
        "player-uuid-2": {
          "id": "player-uuid-2",
          "name": "Bob",
          "isHost": false,
          "isReady": true,
          "isAI": false,
          "difficulty": null,
          "score": 0,
          "connected": true,
          "lastActive": 1699999999999,
          "hand": ["sailboat_1", "starfish_2"],
          "handCount": 2,
          "playedPairs": []
        },
        "ai-player-1": {
          "id": "ai-player-1",
          "name": "AI Bot",
          "isHost": false,
          "isReady": true,
          "isAI": true,
          "difficulty": "medium",
          "score": 0,
          "connected": true,
          "lastActive": 1699999999999,
          "hand": ["crab_1", "octopus_1"],
          "handCount": 2,
          "playedPairs": []
        }
      },

      // Game settings
      "settings": {
        "maxPlayers": 4,
        "targetScore": "auto",     // auto | 30 | 35 | 40 | custom
        "customScore": null,
        "startingHandSize": 0,
        "mermaidsWin": true,
        "colorBonus": true,
        "aiCount": 1,
        "aiDifficulty": "medium"   // easy | medium | hard
      },

      // Current game state
      "gameState": {
        // Deck
        "deck": [
          "card_id_1",
          "card_id_2",
          // ... more cards
        ],
        "deckCount": 52,

        // Discard piles
        "discardLeft": ["shell_5", "fish_3"],
        "discardRight": ["crab_1"],

        // Turn management
        "currentPlayerIndex": 0,
        "currentPlayerId": "player-uuid-1",
        "round": 1,
        "turnPhase": "draw",       // draw | pair | declare | round_end

        // Turn state
        "drawnCards": null,         // Temporary storage for drawn cards
        "selectedCard": null,       // Card chosen by player
        "discardedCard": null,      // Card to discard

        // Declare state
        "declareMode": null,        // null | stop | last_chance
        "declaringPlayerId": null,
        "remainingTurns": null,

        // Last action (for action log)
        "lastAction": {
          "playerId": "player-uuid-1",
          "playerName": "Alice",
          "action": "draw_deck",   // draw_deck | draw_discard | play_pair | declare_stop | declare_last | end_turn
          "details": {
            "cards": ["fish_1"],
            "pile": "left"
          },
          "timestamp": 1699999999999
        },

        // Action log history (last 20 actions)
        "actionLog": [
          {
            "playerId": "player-uuid-2",
            "playerName": "Bob",
            "action": "end_turn",
            "timestamp": 1699999999998
          },
          {
            "playerId": "player-uuid-1",
            "playerName": "Alice",
            "action": "draw_deck",
            "details": { "kept": "fish_1", "discarded": "crab_2" },
            "timestamp": 1699999999997
          }
          // ... more actions
        ]
      },

      // Round history (for score tracking)
      "rounds": [
        {
          "roundNumber": 1,
          "winner": "player-uuid-1",
          "declareMode": "last_chance",
          "scores": {
            "player-uuid-1": {
              "base": 8,
              "pairs": 2,
              "multipliers": 3,
              "mermaids": 5,
              "colorBonus": 5,
              "total": 23
            },
            "player-uuid-2": {
              "base": 5,
              "pairs": 1,
              "multipliers": 0,
              "mermaids": 0,
              "colorBonus": 3,
              "total": 9
            }
          },
          "completedAt": 1699999999999
        }
      ]
    }
  }
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| roomId | String | Yes | 6-character unique room code |
| hostId | String | Yes | UUID of room creator |
| status | Enum | Yes | Current room status |
| createdAt | Number | Yes | Unix timestamp (ms) |
| startedAt | Number | No | When game started |
| finishedAt | Number | No | When game ended |
| players | Object | Yes | Map of player IDs to player objects |
| settings | Object | Yes | Game configuration |
| gameState | Object | No | Present only when status is "playing" |
| rounds | Array | No | History of completed rounds |

---

### 2. Players Collection

**Path**: `/players/{playerId}`

**Purpose**: Store player profiles and statistics

```javascript
{
  "players": {
    "player-uuid-1": {
      "playerId": "player-uuid-1",
      "name": "Alice",
      "displayName": "Alice",
      "avatar": "🦊",              // Emoji avatar (optional)

      // Statistics
      "stats": {
        "gamesPlayed": 42,
        "gamesWon": 18,
        "totalScore": 1584,
        "highestScore": 65,
        "winRate": 0.429,          // Calculated: gamesWon / gamesPlayed
        "averageScore": 37.7,       // Calculated: totalScore / gamesPlayed

        // Achievement tracking
        "achievements": [
          "first_win",
          "mermaid_collector",
          "perfect_pairs"
        ],

        // Special stats
        "mermaidsCollected": 12,
        "pairsPlayed": 156,
        "cardsDrawn": 892
      },

      // Preferences
      "preferences": {
        "soundEnabled": true,
        "animationsEnabled": true,
        "autoSortHand": true
      },

      // Metadata
      "createdAt": 1699999999999,
      "lastActive": 1699999999999,
      "currentRoomId": "ABC123"    // null if not in a room
    }
  }
}
```

---

### 3. Games Collection (History)

**Path**: `/games/{gameId}`

**Purpose**: Store completed game records

```javascript
{
  "games": {
    "game-uuid-1": {
      "gameId": "game-uuid-1",
      "roomId": "ABC123",

      // Participants
      "players": [
        {
          "id": "player-uuid-1",
          "name": "Alice",
          "isAI": false
        },
        {
          "id": "player-uuid-2",
          "name": "Bob",
          "isAI": false
        }
      ],

      // Results
      "winner": {
        "id": "player-uuid-1",
        "name": "Alice",
        "finalScore": 42
      },

      "finalScores": {
        "player-uuid-1": 42,
        "player-uuid-2": 35
      },

      // Game details
      "settings": {
        "maxPlayers": 2,
        "targetScore": 40,
        "startingHandSize": 0,
        "mermaidsWin": true,
        "colorBonus": true
      },

      "rounds": 3,
      "duration": 1800000,          // milliseconds (30 minutes)
      "winCondition": "score",      // score | mermaids

      // Timestamps
      "startedAt": 1699999999999,
      "finishedAt": 1699999999999,
      "playedAt": 1699999999999     // Same as finishedAt, for sorting
    }
  }
}
```

---

### 4. Leaderboard Collection

**Path**: `/leaderboard`

**Purpose**: Rankings and top players

```javascript
{
  "leaderboard": {
    // All-time rankings
    "allTime": {
      "player-uuid-1": {
        "playerId": "player-uuid-1",
        "name": "Alice",
        "gamesWon": 18,
        "totalScore": 1584,
        "winRate": 0.429,
        "rank": 1,
        "lastUpdated": 1699999999999
      },
      "player-uuid-2": {
        "playerId": "player-uuid-2",
        "name": "Bob",
        "gamesWon": 15,
        "totalScore": 1420,
        "winRate": 0.375,
        "rank": 2,
        "lastUpdated": 1699999999999
      }
    },

    // Monthly rankings (resets each month)
    "monthly": {
      "2025-11": {
        "player-uuid-1": {
          "playerId": "player-uuid-1",
          "name": "Alice",
          "gamesWon": 5,
          "totalScore": 210,
          "rank": 1
        }
      }
    }
  }
}
```

---

## 🔒 Security Rules

### Firebase Realtime Database Rules

```json
{
  "rules": {
    // Rooms
    "rooms": {
      "$roomId": {
        // Anyone can read room data
        ".read": true,

        // Only players in the room can write
        ".write": "
          data.exists() &&
          data.child('players').hasChild(auth.uid)
        ",

        // Room creation (new rooms)
        ".write": "
          !data.exists() &&
          newData.child('hostId').val() === auth.uid
        ",

        // Validate room structure
        ".validate": "
          newData.hasChildren(['roomId', 'hostId', 'status', 'createdAt'])
        ",

        "players": {
          "$playerId": {
            // Players can only modify their own data
            ".write": "$playerId === auth.uid",

            // Validate player data
            ".validate": "
              newData.hasChildren(['id', 'name', 'isHost', 'isReady'])
            "
          }
        },

        "gameState": {
          // Game state can be modified by current player or host
          ".write": "
            data.parent().child('gameState/currentPlayerId').val() === auth.uid ||
            data.parent().child('hostId').val() === auth.uid
          "
        }
      }
    },

    // Players
    "players": {
      "$playerId": {
        // Anyone can read player profiles
        ".read": true,

        // Only the player can write their own profile
        ".write": "$playerId === auth.uid",

        // Validate player structure
        ".validate": "
          newData.hasChildren(['playerId', 'name', 'stats', 'createdAt'])
        "
      }
    },

    // Games history
    "games": {
      "$gameId": {
        // Anyone can read game history
        ".read": true,

        // Only system/host can create game records
        ".write": "auth.uid != null"
      }
    },

    // Leaderboard
    "leaderboard": {
      // Anyone can read leaderboard
      ".read": true,

      // Only system can write (via Cloud Functions ideally)
      ".write": "auth.uid != null"
    }
  }
}
```

### Security Considerations

1. **Authentication**: Currently allowing unauthenticated access for simplicity
   - For production, consider adding Firebase Authentication
   - Use anonymous auth or email/password

2. **Data Validation**:
   - Validate data types and required fields
   - Prevent malicious data injection
   - Limit string lengths

3. **Rate Limiting**:
   - Implement rate limiting for room creation
   - Prevent spam and abuse

4. **Data Privacy**:
   - Players should only see their own hand cards
   - Other players see only card count, not actual cards

---

## ⚡ Indexes & Performance

### Firebase Indexes

**Purpose**: Speed up queries and filtering

```json
{
  "rules": {
    "rooms": {
      ".indexOn": ["status", "createdAt"]
    },
    "games": {
      ".indexOn": ["playedAt", "winner/id"]
    },
    "leaderboard": {
      "allTime": {
        ".indexOn": ["rank", "gamesWon", "totalScore"]
      }
    }
  }
}
```

### Performance Optimization Strategies

1. **Denormalization**:
   - Store `handCount` separately from `hand` array
   - Duplicate player names in action log (avoid extra lookups)

2. **Data Limits**:
   - Limit action log to last 20 entries
   - Archive old games to separate collection

3. **Selective Listeners**:
   - Listen only to specific paths (e.g., `/rooms/{roomId}/gameState`)
   - Unsubscribe from listeners when component unmounts

4. **Batch Writes**:
   - Use Firebase transactions for atomic updates
   - Batch multiple changes together

5. **Caching**:
   - Cache static data (card definitions) in client
   - Use Firebase offline persistence

---

## 🔄 Data Lifecycle

### Room Lifecycle

```
CREATE ROOM
    ↓
  WAITING (players joining)
    ↓
  PLAYING (game in progress)
    ↓
  FINISHED (game completed)
    ↓
  ARCHIVED (after 24 hours)
    ↓
  DELETED (after 7 days)
```

### Cleanup Strategy

1. **Automatic Cleanup** (Cloud Functions):
   ```javascript
   // Clean up finished rooms after 24 hours
   exports.cleanupOldRooms = functions.pubsub
     .schedule('every 24 hours')
     .onRun(async (context) => {
       const cutoff = Date.now() - (24 * 60 * 60 * 1000);
       const oldRooms = await admin.database()
         .ref('rooms')
         .orderByChild('finishedAt')
         .endAt(cutoff)
         .once('value');

       const updates = {};
       oldRooms.forEach(snapshot => {
         updates[snapshot.key] = null; // Delete
       });

       return admin.database().ref('rooms').update(updates);
     });
   ```

2. **Manual Cleanup**:
   - Host can delete room
   - Players leaving empty room triggers deletion

3. **Data Archival**:
   - Move completed games to `/games` collection
   - Keep room data for 24 hours for review

---

## 💾 Backup & Recovery

### Backup Strategy

1. **Firebase Automatic Backups**:
   - Enable daily backups in Firebase Console
   - Retention period: 30 days

2. **Export to Cloud Storage**:
   - Weekly exports to Google Cloud Storage
   - JSON format for easy recovery

3. **Critical Data Priority**:
   - **High**: Player profiles, game history
   - **Medium**: Leaderboard data
   - **Low**: Active rooms (temporary data)

### Recovery Procedures

1. **Room Corruption**:
   - Detect via validation errors
   - Offer host option to restart game
   - Log errors for debugging

2. **Player Data Loss**:
   - Restore from last backup
   - Recalculate statistics from game history

3. **Database Failure**:
   - Firebase has built-in redundancy
   - Fall back to offline mode
   - Queue writes for when connection restored

---

## 📊 Data Size Estimates

### Storage Calculations

**Per Room**:
- Room metadata: ~1 KB
- Players (4 max): ~4 KB
- Game state: ~5 KB
- Action log (20 entries): ~2 KB
- **Total per room**: ~12 KB

**Per Player**:
- Profile: ~2 KB
- Stats: ~1 KB
- **Total per player**: ~3 KB

**Per Game History**:
- Game record: ~3 KB

### Scaling Estimates

| Metric | Amount | Storage |
|--------|--------|---------|
| 100 concurrent rooms | 100 | 1.2 MB |
| 1000 players | 1000 | 3 MB |
| 10000 game records | 10000 | 30 MB |
| **Total** | - | **~35 MB** |

Firebase Free Tier: **1 GB storage** → Can handle ~28,000 rooms or ~300,000 players

---

## 🔍 Query Patterns

### Common Queries

1. **Get room by code**:
   ```javascript
   firebase.database().ref(`rooms/${roomCode}`).once('value');
   ```

2. **Get active rooms**:
   ```javascript
   firebase.database().ref('rooms')
     .orderByChild('status')
     .equalTo('waiting')
     .limitToLast(10)
     .once('value');
   ```

3. **Get player stats**:
   ```javascript
   firebase.database().ref(`players/${playerId}/stats`).once('value');
   ```

4. **Get top 10 leaderboard**:
   ```javascript
   firebase.database().ref('leaderboard/allTime')
     .orderByChild('rank')
     .limitToFirst(10)
     .once('value');
   ```

5. **Get player's game history**:
   ```javascript
   firebase.database().ref('games')
     .orderByChild('players')
     .equalTo(playerId)
     .limitToLast(20)
     .once('value');
   ```

---

## 📝 Best Practices

1. **Keep data shallow** - Don't nest too deeply
2. **Denormalize when needed** - Duplicate data for performance
3. **Use push() for unique IDs** - Or UUID for client-generated IDs
4. **Listen to minimal data** - Only subscribe to what you need
5. **Use transactions** - For atomic updates (e.g., turn progression)
6. **Clean up listeners** - Unsubscribe when done
7. **Validate client-side** - Before writing to database
8. **Log all writes** - For debugging and audit trail

---

## 🔮 Future Enhancements

1. **Cloud Functions**:
   - Server-side game validation
   - Anti-cheat mechanisms
   - Automated cleanup
   - Statistics calculation

2. **Cloud Firestore Migration**:
   - Better querying capabilities
   - Automatic scaling
   - More complex data structures

3. **Analytics Integration**:
   - Track user behavior
   - Game balance analysis
   - Performance monitoring

---

**Last Updated**: 2025-11-14
**Version**: 2.0.0
**Maintained by**: Backend Team
