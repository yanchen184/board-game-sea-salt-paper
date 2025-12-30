import { useState, useEffect, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import Card from '../../common/Card/Card'
import Button from '../../common/Button/Button'
import './RoundSettlement.css'

/**
 * RoundSettlement Component
 *
 * Displays an immersive round settlement animation
 * Shows each player's cards being revealed and scored sequentially
 *
 * Animation Phases:
 * 0. Intro - Title and declarer announcement
 * 1-N. Player reveals - Each player's cards flip and score calculated
 * N+1. Ranking - Final ranking with podium display
 * N+2. Outro - Continue button
 */

// Animation phase constants
const PHASE = {
  INTRO: 'intro',
  PLAYER_REVEAL: 'player_reveal',
  SCORE_CALC: 'score_calc',
  RANKING: 'ranking',
  OUTRO: 'outro'
}

// Timing constants (ms)
const TIMING = {
  INTRO_DURATION: 2000,
  PLAYER_SPOTLIGHT: 500,
  CARD_FLIP_DURATION: 400,
  CARD_FLIP_STAGGER: 200,
  PAIRS_REVEAL: 800,
  SCORE_ITEM_DURATION: 1500, // Longer for card bouncing
  SCORE_ITEM_STAGGER: 1800,  // Give time for 5 bounces
  TOTAL_REVEAL: 800,
  PLAYER_TRANSITION: 1000,
  RANKING_DURATION: 3000,
  CELEBRATION_DURATION: 2000
}

// Card name to emoji mapping
const CARD_EMOJI = {
  'Shell': '🐚',
  'Octopus': '🐙',
  'Penguin': '🐧',
  'Sailor': '🧑‍✈️',
  'Fish': '🐟',
  'Crab': '🦀',
  'Sailboat': '⛵',
  'Shark': '🦈',
  'Swimmer': '🏊',
  'Lighthouse': '🗼',
  'FishSchool': '🐠',
  'PenguinColony': '🐧🐧',
  'Captain': '👨‍✈️',
  'Mermaid': '🧜‍♀️'
}

function RoundSettlement({
  isOpen,
  players,
  declarerId,
  declareMode,
  declarerHasHighest,  // Last Chance 模式：宣告者是否獲勝
  onComplete,
  onSkip
}) {
  // Current animation state
  const [phase, setPhase] = useState(PHASE.INTRO)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [revealedCards, setRevealedCards] = useState([])
  const [revealedPairs, setRevealedPairs] = useState([])
  const [visibleScoreItems, setVisibleScoreItems] = useState([])
  const [showTotal, setShowTotal] = useState(false)
  const [showRanking, setShowRanking] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [waitingForNext, setWaitingForNext] = useState(false) // Wait for user to click next
  const [playerAnimationDone, setPlayerAnimationDone] = useState(false) // Current player animation finished
  const [bouncingCardNames, setBouncingCardNames] = useState([]) // Cards currently bouncing for score animation

  // Sort players by score for ranking
  const sortedPlayers = useMemo(() => {
    if (!players || players.length === 0) return []
    return [...players].sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0))
  }, [players])

  // Get player order (declarer first)
  const playerOrder = useMemo(() => {
    if (!players || players.length === 0) return []
    const declarerIndex = players.findIndex(p => p.id === declarerId)
    if (declarerIndex === -1) return players

    const ordered = [...players]
    const declarer = ordered.splice(declarerIndex, 1)[0]
    return [declarer, ...ordered]
  }, [players, declarerId])

  // Current player being shown
  const currentPlayer = playerOrder[currentPlayerIndex]

  // Get all cards from hand and played pairs
  const allCards = useMemo(() => {
    if (!currentPlayer) return []
    const hand = currentPlayer.hand || []
    const pairCards = (currentPlayer.playedPairs || []).flatMap(p => p.cards || [])
    return [...hand, ...pairCards]
  }, [currentPlayer])

  // Score breakdown items for animation - now with detailed breakdown
  const scoreItems = useMemo(() => {
    if (!currentPlayer?.score) return []

    // 在 Last Chance 模式下，先顯示原始卡牌分數（不含顏色獎勵）
    // 然後顯示顏色獎勵（帶提示）
    const isLastChance = declareMode === 'last_chance'
    const isDeclarer = currentPlayer.id === declarerId
    const { score, cardScore } = currentPlayer

    // 使用原始分數或最終分數
    const displayScore = isLastChance ? (cardScore || score) : score
    const items = []
    const baseDetails = displayScore.baseDetails || {}

    // 1. Card values (基礎牌面分數) - 高亮所有非收集牌
    if (baseDetails.cardValues > 0) {
      // 收集牌類型（這些牌的分數不計入 cardValues）
      const collectionCardTypes = ['Shell', 'Octopus', 'Penguin', 'Sailor']
      // 找出所有有數值的非收集牌
      const valueCardNames = [...new Set(
        allCards
          .filter(c => !collectionCardTypes.includes(c.name) && c.value > 0)
          .map(c => c.name)
      )]

      items.push({
        label: '牌面分數',
        description: '所有牌的數字總和',
        value: baseDetails.cardValues,
        type: 'cardValues',
        emoji: '🎴',
        highlightCards: valueCardNames
      })
    }

    // 2. Collection bonuses - shown separately
    const collectionDetails = baseDetails.collectionDetails || []

    // 企鵝收集
    const penguinDetail = collectionDetails.find(d => d.name === 'Penguin')
    if (penguinDetail && penguinDetail.score > 0) {
      items.push({
        label: `企鵝收集 (${penguinDetail.count}張)`,
        description: penguinDetail.rule,
        value: penguinDetail.score,
        type: 'penguin',
        emoji: '🐧',
        highlightCards: ['Penguin']
      })
    }

    // 貝殼收集
    const shellDetail = collectionDetails.find(d => d.name === 'Shell')
    if (shellDetail && shellDetail.score > 0) {
      items.push({
        label: `貝殼收集 (${shellDetail.count}張)`,
        description: shellDetail.rule,
        value: shellDetail.score,
        type: 'shell',
        emoji: '🐚',
        highlightCards: ['Shell']
      })
    }

    // 章魚收集
    const octopusDetail = collectionDetails.find(d => d.name === 'Octopus')
    if (octopusDetail && octopusDetail.score > 0) {
      items.push({
        label: `章魚收集 (${octopusDetail.count}張)`,
        description: octopusDetail.rule,
        value: octopusDetail.score,
        type: 'octopus',
        emoji: '🐙',
        highlightCards: ['Octopus']
      })
    }

    // 水手獎勵
    const sailorDetail = collectionDetails.find(d => d.name === 'Sailor')
    if (sailorDetail && sailorDetail.score > 0) {
      items.push({
        label: `水手組合 (${sailorDetail.count}張)`,
        description: sailorDetail.rule,
        value: sailorDetail.score,
        type: 'sailor',
        emoji: '🧑‍✈️',
        highlightCards: ['Sailor']
      })
    }

    // 配對牌獎勵 (Fish, Crab, Sailboat, Shark-Swimmer)
    // 注意：這些牌在 collectionDetails 中是分別存儲的，不是叫 "PairCards"
    const pairCardTypes = ['Fish', 'Crab', 'Sailboat', 'Shark', 'Swimmer', 'Shark-Swimmer']
    const pairCardDetails = collectionDetails.filter(d => pairCardTypes.includes(d.name))

    pairCardDetails.forEach(detail => {
      if (detail && detail.score > 0) {
        // Shark-Swimmer 配對需要高亮兩種卡片
        const highlightCards = detail.name === 'Shark-Swimmer'
          ? ['Shark', 'Swimmer']
          : [detail.name]

        items.push({
          label: `${detail.emoji} ${detail.name === 'Shark-Swimmer' ? 'Shark+Swimmer' : detail.name} (${detail.count}張)`,
          description: detail.rule,
          value: detail.score,
          type: 'pairCards',
          emoji: detail.emoji,
          highlightCards: highlightCards
        })
      }
    })

    // 3. Pair bonuses (打出的對子)
    if (displayScore.pairs > 0) {
      // 取得所有已打出對子中的卡片名稱
      const playedPairCards = (currentPlayer.playedPairs || [])
        .flatMap(pair => pair.cards || [])
        .map(card => card.name)
      const uniquePairCardNames = [...new Set(playedPairCards)]

      items.push({
        label: `對子獎勵`,
        description: `${currentPlayer.playedPairs?.length || 0}對 × 1分`,
        value: displayScore.pairs,
        type: 'pairs',
        emoji: '🎯',
        highlightCards: uniquePairCardNames // 高亮已打出對子的卡片
      })
    }

    // 4. Multiplier bonuses - shown separately
    const multiplierDetails = displayScore.multiplierDetails || {}

    // 燈塔 (Lighthouse) - 每艘帆船+1
    if (multiplierDetails.lighthouse > 0) {
      const sailboatCount = allCards.filter(c => c.name === 'Sailboat').length
      items.push({
        label: `燈塔加成`,
        description: `${sailboatCount}艘帆船 × 1分`,
        value: multiplierDetails.lighthouse,
        type: 'lighthouse',
        emoji: '🗼',
        highlightCards: ['Lighthouse', 'Sailboat']
      })
    }

    // 魚群 (FishSchool) - 每條魚+1
    if (multiplierDetails.fishSchool > 0) {
      const fishCount = allCards.filter(c => c.name === 'Fish').length
      items.push({
        label: `魚群加成`,
        description: `${fishCount}條魚 × 1分`,
        value: multiplierDetails.fishSchool,
        type: 'fishSchool',
        emoji: '🐠',
        highlightCards: ['FishSchool', 'Fish']
      })
    }

    // 企鵝群 (PenguinColony) - 每隻企鵝+2
    if (multiplierDetails.penguinColony > 0) {
      const penguinCount = allCards.filter(c => c.name === 'Penguin').length
      items.push({
        label: `企鵝群加成`,
        description: `${penguinCount}隻企鵝 × 2分`,
        value: multiplierDetails.penguinColony,
        type: 'penguinColony',
        emoji: '🐧🐧',
        highlightCards: ['PenguinColony', 'Penguin']
      })
    }

    // 船長 (Captain) - 每個水手+3
    if (multiplierDetails.captain > 0) {
      const sailorCount = allCards.filter(c => c.name === 'Sailor').length
      items.push({
        label: `船長加成`,
        description: `${sailorCount}個水手 × 3分`,
        value: multiplierDetails.captain,
        type: 'captain',
        emoji: '👨‍✈️',
        highlightCards: ['Captain', 'Sailor']
      })
    }

    // 5. Mermaid score
    if (displayScore.mermaids > 0) {
      // 如果有詳細資料，顯示每隻美人魚
      if (displayScore.mermaidDetails && displayScore.mermaidDetails.length > 0) {
        displayScore.mermaidDetails.forEach((detail, index) => {
          // 獲取該顏色的所有卡牌名稱（從 hand 和 playedPairs）
          const allCards = [
            ...currentPlayer.hand,
            ...(currentPlayer.playedPairs || []).flatMap(p => p.cards || [])
          ]
          const cardsOfThisColor = allCards.filter(c => c.color === detail.color).map(c => c.name)
          const uniqueCardNames = [...new Set(cardsOfThisColor)] // 去重

          items.push({
            label: `美人魚 #${detail.index} (${detail.colorName})`,
            description: `第${detail.index}隻美人魚 = ${detail.count}張${detail.colorName}牌`,
            value: detail.score,
            type: 'mermaids',
            emoji: '🧜‍♀️',
            highlightCards: uniqueCardNames.length > 0 ? uniqueCardNames : ['Mermaid'], // 高亮對應顏色的牌
            mermaidColor: detail.color // 儲存顏色資訊用於除錯
          })
        })
      } else {
        // 備用顯示
        items.push({
          label: `美人魚分數`,
          description: '計算最多顏色數量',
          value: displayScore.mermaids,
          type: 'mermaids',
          emoji: '🧜‍♀️',
          highlightCards: ['Mermaid']
        })
      }
    }

    // 6. Color bonus - Last Chance 模式下加上特殊提示
    // 在 Last Chance 模式下，需要從原始 score 取得顏色獎勵值
    const actualColorBonus = isLastChance
      ? (currentPlayer.score?.colorBonus || 0)
      : (score.colorBonus || 0)

    // Last Chance 模式下，所有玩家都必須顯示顏色獎勵（即使是 0 分）
    // 一般模式下，只有有顏色獎勵才顯示
    if (isLastChance || actualColorBonus > 0) {
      let colorDescription = '最多同色牌數量'
      let colorWarning = null

      if (isLastChance) {
        if (isDeclarer) {
          colorWarning = '如果贏的話，額外加這個分數'
        } else {
          colorWarning = '如果輸宣告者，只加這個分數'
        }
      }

      // Last Chance 模式下，即使目前顯示的是 cardScore (colorBonus=0)，
      // 也要顯示實際的顏色獎勵值（從 currentPlayer.score 取得）
      const displayColorBonus = actualColorBonus

      items.push({
        label: `顏色獎勵`,
        description: colorDescription,
        warning: colorWarning,  // 新增：Last Chance 提示
        value: displayColorBonus,
        type: 'color',
        emoji: '🎨',
        highlightCards: [] // All cards of the dominant color
      })
    }

    return items
  }, [currentPlayer, allCards, declareMode, declarerId, declarerHasHighest])

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setPhase(PHASE.INTRO)
      setCurrentPlayerIndex(0)
      setRevealedCards([])
      setRevealedPairs([])
      setVisibleScoreItems([])
      setShowTotal(false)
      setShowRanking(false)
      setAnimationComplete(false)
      setWaitingForNext(false)
      setPlayerAnimationDone(false)
      setBouncingCardNames([])
    }
  }, [isOpen])

  // Main animation sequence
  useEffect(() => {
    if (!isOpen || !players || players.length === 0) return
    if (waitingForNext) return // Don't run animation while waiting for user input

    let timeoutId

    const runAnimation = async () => {
      // Phase: INTRO
      if (phase === PHASE.INTRO) {
        timeoutId = setTimeout(() => {
          setPhase(PHASE.PLAYER_REVEAL)
        }, TIMING.INTRO_DURATION)
        return
      }

      // Phase: PLAYER_REVEAL - Flip cards one by one
      if (phase === PHASE.PLAYER_REVEAL && currentPlayer) {
        setPlayerAnimationDone(false)
        const hand = currentPlayer.hand || []

        // Reveal cards with stagger
        for (let i = 0; i < hand.length; i++) {
          timeoutId = setTimeout(() => {
            setRevealedCards(prev => [...prev, i])
          }, TIMING.PLAYER_SPOTLIGHT + i * TIMING.CARD_FLIP_STAGGER)
        }

        // After all cards revealed, show pairs
        const cardsRevealTime = TIMING.PLAYER_SPOTLIGHT + hand.length * TIMING.CARD_FLIP_STAGGER
        timeoutId = setTimeout(() => {
          const pairs = currentPlayer.playedPairs || []
          setRevealedPairs(pairs.map((_, i) => i))

          // Move to score calculation
          setTimeout(() => {
            setPhase(PHASE.SCORE_CALC)
          }, TIMING.PAIRS_REVEAL)
        }, cardsRevealTime)

        return
      }

      // Phase: SCORE_CALC - Show score items one by one with card bouncing
      if (phase === PHASE.SCORE_CALC) {
        // Reveal score items with stagger and trigger card bouncing
        for (let i = 0; i < scoreItems.length; i++) {
          timeoutId = setTimeout(() => {
            setVisibleScoreItems(prev => [...prev, i])

            // Set bouncing cards for this score item
            const item = scoreItems[i]
            if (item.highlightCards && item.highlightCards.length > 0) {
              setBouncingCardNames(item.highlightCards)

              // Clear bouncing after animation completes (5 bounces = ~1.5s)
              setTimeout(() => {
                setBouncingCardNames([])
              }, 1500)
            }
          }, i * TIMING.SCORE_ITEM_STAGGER)
        }

        // After all items, show total and wait for user
        const totalTime = scoreItems.length * TIMING.SCORE_ITEM_STAGGER + TIMING.SCORE_ITEM_DURATION
        timeoutId = setTimeout(() => {
          setBouncingCardNames([]) // Clear any remaining bouncing
          setShowTotal(true)
          setPlayerAnimationDone(true)
          setWaitingForNext(true) // Wait for user to click next
        }, totalTime)

        return
      }

      // Phase: RANKING
      if (phase === PHASE.RANKING) {
        timeoutId = setTimeout(() => {
          setShowRanking(true)

          setTimeout(() => {
            setPhase(PHASE.OUTRO)
            setAnimationComplete(true)
          }, TIMING.RANKING_DURATION)
        }, 500)
        return
      }
    }

    runAnimation()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isOpen, phase, currentPlayerIndex, currentPlayer, playerOrder, players, scoreItems, waitingForNext])

  // Handle next player button
  const handleNextPlayer = useCallback(() => {
    setWaitingForNext(false)
    setPlayerAnimationDone(false)
    setBouncingCardNames([])

    if (currentPlayerIndex < playerOrder.length - 1) {
      // Move to next player
      setCurrentPlayerIndex(prev => prev + 1)
      setRevealedCards([])
      setRevealedPairs([])
      setVisibleScoreItems([])
      setShowTotal(false)
      setPhase(PHASE.PLAYER_REVEAL)
    } else {
      // All players done, show ranking
      setPhase(PHASE.RANKING)
    }
  }, [currentPlayerIndex, playerOrder.length])

  // Handle skip animation
  const handleSkip = useCallback(() => {
    setPhase(PHASE.OUTRO)
    setAnimationComplete(true)
    setShowRanking(true)
    if (onSkip) onSkip()
  }, [onSkip])

  // Handle continue
  const handleContinue = useCallback(() => {
    if (onComplete) onComplete()
  }, [onComplete])

  if (!isOpen) return null

  const declarerName = players.find(p => p.id === declarerId)?.name || '???'
  const declareText = declareMode === 'stop' ? '到此為止 (Stop)' : '最後機會 (Last Chance)'

  return (
    <div className="round-settlement">
      {/* Background overlay */}
      <div className="round-settlement__backdrop" />

      {/* Particles container */}
      <div className="round-settlement__particles" />

      {/* Main content */}
      <div className="round-settlement__content">

        {/* Header */}
        <header className={`round-settlement__header ${phase === PHASE.INTRO ? 'round-settlement__header--intro' : ''}`}>
          <h1 className="round-settlement__title">回合結算</h1>
          <p className="round-settlement__subtitle">
            <span className="round-settlement__declarer-name">{declarerName}</span>
            {' '}宣告了「{declareText}」
          </p>
        </header>

        {/* Player reveal section */}
        {(phase === PHASE.PLAYER_REVEAL || phase === PHASE.SCORE_CALC) && currentPlayer && (
          <div className="round-settlement__player-section">
            {/* Player info */}
            <div className="round-settlement__player-info">
              <div className={`round-settlement__player-spotlight ${currentPlayer.id === declarerId ? 'round-settlement__player-spotlight--declarer' : ''}`}>
                <h2 className="round-settlement__player-name">
                  {currentPlayer.name}
                  {currentPlayer.id === declarerId && <span className="round-settlement__declarer-badge">宣告者</span>}
                </h2>
                <div className="round-settlement__player-index">
                  玩家 {currentPlayerIndex + 1} / {playerOrder.length}
                </div>
              </div>
            </div>

            {/* Cards display */}
            <div className="round-settlement__cards-area">
              {/* Hand cards */}
              <div className="round-settlement__hand">
                <h3 className="round-settlement__section-title">手牌</h3>
                <div className="round-settlement__cards-row">
                  {(currentPlayer.hand || []).map((card, index) => {
                    const isBouncing = bouncingCardNames.includes(card.name)
                    return (
                      <div
                        key={card.id}
                        className={`
                          round-settlement__card-wrapper
                          ${revealedCards.includes(index) ? 'round-settlement__card-wrapper--revealed' : ''}
                          ${isBouncing ? 'round-settlement__card-wrapper--bouncing' : ''}
                        `}
                        style={{ '--card-index': index }}
                      >
                        <Card
                          cardData={card}
                          size="medium"
                          faceDown={!revealedCards.includes(index)}
                          disabled
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Played pairs */}
              {(currentPlayer.playedPairs || []).length > 0 && (
                <div className="round-settlement__pairs">
                  <h3 className="round-settlement__section-title">已打出對子</h3>
                  <div className="round-settlement__pairs-row">
                    {(currentPlayer.playedPairs || []).map((pair, pairIndex) => (
                      <div
                        key={pairIndex}
                        className={`round-settlement__pair ${revealedPairs.includes(pairIndex) ? 'round-settlement__pair--revealed' : ''}`}
                      >
                        {pair.cards?.map((card) => {
                          const isBouncing = bouncingCardNames.includes(card.name)
                          return (
                            <div
                              key={card.id}
                              className={isBouncing ? 'round-settlement__card-wrapper--bouncing' : ''}
                            >
                              <Card
                                cardData={card}
                                size="small"
                                disabled
                              />
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Score breakdown */}
            <div className="round-settlement__score-area">
              <h3 className="round-settlement__section-title">分數計算</h3>

              <div className="round-settlement__score-breakdown">
                {scoreItems.map((item, index) => (
                  <div
                    key={`${currentPlayer?.id}-${item.type}-${index}`}
                    className={`round-settlement__score-item round-settlement__score-item--${item.type} ${visibleScoreItems.includes(index) ? 'round-settlement__score-item--visible' : ''}`}
                    style={{ '--item-index': index }}
                  >
                    <div className="round-settlement__score-info">
                      <span className="round-settlement__score-emoji">{item.emoji}</span>
                      <div className="round-settlement__score-text">
                        <span className="round-settlement__score-label">{item.label}</span>
                        {item.description && (
                          <span className="round-settlement__score-description">{item.description}</span>
                        )}
                        {item.warning && (
                          <span className="round-settlement__score-warning">⚠️ {item.warning}</span>
                        )}
                      </div>
                    </div>
                    <span className="round-settlement__score-value">+{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Total score */}
              <div className={`round-settlement__total ${showTotal ? 'round-settlement__total--visible' : ''}`}>
                <span className="round-settlement__total-label">總分</span>
                <span className="round-settlement__total-value">
                  {(() => {
                    // Last Chance 模式下，顯示卡牌分數（不含顏色獎勵）
                    // 否則顯示最終分數
                    const isLastChance = declareMode === 'last_chance'
                    const displayScore = isLastChance
                      ? (currentPlayer.cardScore || currentPlayer.score)
                      : currentPlayer.score

                    return displayScore?.total || 0
                  })()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Ranking section */}
        {phase === PHASE.RANKING || phase === PHASE.OUTRO ? (
          <div className={`round-settlement__ranking ${showRanking ? 'round-settlement__ranking--visible' : ''}`}>
            <h2 className="round-settlement__ranking-title">最終排名</h2>

            <div className="round-settlement__podium">
              {sortedPlayers.slice(0, 3).map((player, index) => (
                <div
                  key={player.id}
                  className={`round-settlement__podium-place round-settlement__podium-place--${index + 1}`}
                  style={{ '--place': index + 1 }}
                >
                  <div className="round-settlement__podium-player">
                    <div className="round-settlement__podium-rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                    </div>
                    <div className="round-settlement__podium-name">
                      {player.name}
                      {player.id === declarerId && <span className="round-settlement__declarer-star">★</span>}
                    </div>
                    <div className="round-settlement__podium-score">{player.score?.total || 0} 分</div>
                  </div>
                  <div className="round-settlement__podium-stand" />
                </div>
              ))}
            </div>

            {/* Winner celebration */}
            {sortedPlayers[0] && (
              <div className="round-settlement__winner-announcement">
                <span className="round-settlement__winner-crown">👑</span>
                <span className="round-settlement__winner-text">
                  {sortedPlayers[0].name} 獲得本回合最高分！
                </span>
              </div>
            )}

            {/* All scores list */}
            {sortedPlayers.length > 3 && (
              <div className="round-settlement__other-players">
                {sortedPlayers.slice(3).map((player, index) => (
                  <div key={player.id} className="round-settlement__other-player">
                    <span className="round-settlement__other-rank">{index + 4}.</span>
                    <span className="round-settlement__other-name">{player.name}</span>
                    <span className="round-settlement__other-score">{player.score?.total || 0} 分</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Footer actions */}
        <footer className="round-settlement__footer">
          {/* Skip button - always available during animation */}
          {!animationComplete && (
            <Button
              variant="ghost"
              size="small"
              onClick={handleSkip}
              className="round-settlement__skip-btn"
            >
              跳過動畫
            </Button>
          )}

          {/* Next player button - shown after each player's score */}
          {waitingForNext && playerAnimationDone && !animationComplete && (
            <Button
              variant="primary"
              size="large"
              onClick={handleNextPlayer}
              className="round-settlement__next-btn"
            >
              {currentPlayerIndex < playerOrder.length - 1
                ? `下一位玩家 (${currentPlayerIndex + 2}/${playerOrder.length})`
                : '查看最終排名'
              }
            </Button>
          )}

          {/* Continue button - only after ranking is shown */}
          {animationComplete && (
            <Button
              variant="primary"
              size="large"
              onClick={handleContinue}
              className="round-settlement__continue-btn"
            >
              繼續遊戲
            </Button>
          )}
        </footer>
      </div>
    </div>
  )
}

RoundSettlement.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  players: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    hand: PropTypes.array,
    playedPairs: PropTypes.array,
    score: PropTypes.shape({
      base: PropTypes.number,
      pairs: PropTypes.number,
      multipliers: PropTypes.number,
      mermaids: PropTypes.number,
      colorBonus: PropTypes.number,
      total: PropTypes.number
    }),
    cardScore: PropTypes.shape({  // 新增：原始卡牌分數（Last Chance 用）
      base: PropTypes.number,
      pairs: PropTypes.number,
      multipliers: PropTypes.number,
      mermaids: PropTypes.number,
      colorBonus: PropTypes.number,
      total: PropTypes.number
    })
  })),
  declarerId: PropTypes.string,
  declareMode: PropTypes.oneOf(['stop', 'last_chance']),
  declarerHasHighest: PropTypes.bool,  // 新增：Last Chance 模式宣告者是否獲勝
  onComplete: PropTypes.func.isRequired,
  onSkip: PropTypes.func
}

export default RoundSettlement
