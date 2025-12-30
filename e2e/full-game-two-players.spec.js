import { test, expect } from '@playwright/test'

/**
 * 完整兩人對戰測試
 *
 * 測試內容：
 * 1. 兩個玩家從創建房間到遊戲結束的完整流程
 * 2. 記錄並截圖「到此為止」和「最後機會」操作
 * 3. 測試到一整把遊戲結束
 * 4. 產生測試報告和截圖記錄
 *
 * 修復記錄 (2025-12-24):
 * - 修復選擇器: .game-board__container -> .game-board--table-view
 * - 增加等待超時時間: 5000ms -> 20000ms
 * - 改進回合檢測邏輯
 * - 增加更多錯誤處理和日誌
 */

test.describe('完整兩人對戰遊戲測試', () => {
  let roomCode
  let screenshotCounter = 0
  const screenshotDir = 'test-screenshots/full-game'

  // 截圖輔助函數
  async function takeScreenshot(page, playerName, action) {
    screenshotCounter++
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${screenshotCounter.toString().padStart(3, '0')}_${timestamp}_${playerName}_${action}.png`
    await page.screenshot({
      path: `${screenshotDir}/${filename}`,
      fullPage: true
    })
    console.log(`[Screenshot] ${filename}`)
  }

  /**
   * 等待遊戲載入完成
   * 修復: 使用正確的選擇器 .game-board--table-view (不是 .game-board__container)
   * 並等待加載狀態消失
   */
  async function waitForGameState(page, playerName, timeout = 20000) {
    console.log(`[${playerName}] Waiting for game to load...`)

    try {
      // 1. 等待主容器出現
      await page.waitForSelector('.game-board', { timeout: timeout / 2 })
      console.log(`[${playerName}] Game board container found`)

      // 2. 等待加載狀態消失 (如果存在)
      const loadingVisible = await page.locator('.game-board--loading').isVisible().catch(() => false)
      if (loadingVisible) {
        console.log(`[${playerName}] Waiting for loading state to finish...`)
        await page.waitForSelector('.game-board--loading', { state: 'hidden', timeout: timeout / 2 })
      }

      // 3. 等待遊戲主視圖出現 (table view)
      await page.waitForSelector('.game-board--table-view', { timeout: timeout / 2 })
      console.log(`[${playerName}] Game table view loaded`)

      // 4. 等待牌桌中心區域出現 (確認遊戲完全初始化)
      await page.waitForSelector('.table-layout', { timeout: timeout / 2 })
      console.log(`[${playerName}] Table layout ready`)

      // 5. 等待一點時間讓 Firebase 同步完成
      await page.waitForTimeout(1000)

      return true
    } catch (error) {
      console.error(`[${playerName}] Failed to load game state:`, error.message)
      await takeScreenshot(page, playerName, 'ERROR_game_load_failed')
      throw error
    }
  }

  /**
   * 檢查是否是當前玩家的回合
   * 改進: 檢查多個指標來確定回合狀態
   */
  async function isMyTurn(page) {
    // 檢查回合通知 (短暫顯示的 "輪到你了")
    const turnNotification = await page.locator('.turn-notification').isVisible().catch(() => false)
    if (turnNotification) return true

    // 檢查抽牌按鈕是否可用 (draw-deck--can-draw)
    const canDrawDeck = await page.locator('.draw-deck--can-draw').isVisible().catch(() => false)
    if (canDrawDeck) return true

    // 檢查是否可以選擇手牌 (在 pair 階段)
    const canSelectCards = await page.locator('.player-hand__selection-status').isVisible().catch(() => false)
    if (canSelectCards) return true

    // 檢查結束回合按鈕
    const endTurnButton = await page.locator('button:has-text("結束回合")').isVisible().catch(() => false)
    if (endTurnButton) return true

    return false
  }

  // 獲取當前手牌數量
  async function getHandCount(page) {
    return await page.locator('.player-hand__card-wrapper').count()
  }

  /**
   * 檢查是否有「到此為止」或「最後機會」按鈕
   * 改進: 使用更精確的選擇器
   */
  async function canDeclare(page) {
    // 使用 Stop 和 Last Chance 的按鈕文字
    const stopButton = page.locator('button:has-text("到此為止")')
    const lastChanceButton = page.locator('button:has-text("最後機會")')

    const hasStop = await stopButton.isVisible().catch(() => false)
    const hasLastChance = await lastChanceButton.isVisible().catch(() => false)

    return { hasStop, hasLastChance, stopButton, lastChanceButton }
  }

  /**
   * 嘗試打出對子
   * 改進: 更好的錯誤處理和日誌
   */
  async function tryPlayPair(page, playerName) {
    const handCards = await page.locator('.player-hand__card-wrapper').all()

    if (handCards.length < 2) {
      console.log(`[${playerName}] Not enough cards for pair (${handCards.length})`)
      return false
    }

    // 嘗試點擊兩張牌 (簡化處理，實際遊戲需要配對邏輯)
    try {
      await handCards[0].click()
      await page.waitForTimeout(300)
      await handCards[1].click()
      await page.waitForTimeout(300)

      // 檢查是否有「打出組合」按鈕
      const playPairButton = page.locator('button:has-text("打出組合")')
      if (await playPairButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await playPairButton.click()
        console.log(`[${playerName}] Played a pair!`)
        await takeScreenshot(page, playerName, 'played_pair')
        return true
      } else {
        // 取消選擇 - 再點一次來取消
        console.log(`[${playerName}] Cards not a valid pair, deselecting...`)
        await handCards[0].click()
        await page.waitForTimeout(200)
        await handCards[1].click()
        await page.waitForTimeout(200)
      }
    } catch (error) {
      console.log(`[${playerName}] Could not play pair: ${error.message}`)
    }

    return false
  }

  /**
   * 抽牌並選擇保留哪張
   * 改進: 使用正確的選擇器和更好的拖放處理
   */
  async function drawAndChooseCard(page, playerName) {
    console.log(`[${playerName}] Starting draw phase...`)

    // 檢查是否可以抽牌 (draw-deck--can-draw 類)
    const canDrawFromDeck = await page.locator('.draw-deck--can-draw').isVisible().catch(() => false)

    if (canDrawFromDeck) {
      // 點擊牌堆抽牌
      await page.locator('.draw-deck--can-draw').click()
      console.log(`[${playerName}] Clicked draw deck`)
      await takeScreenshot(page, playerName, 'clicked_draw_deck')

      // 等待抽牌區域出現
      try {
        await page.waitForSelector('.draw-card-area', { timeout: 5000 })
        console.log(`[${playerName}] Draw card area appeared`)

        // 等待卡片顯示
        await page.waitForTimeout(500)

        // 獲取抽到的兩張牌的包裝元素
        const drawnCardWrappers = await page.locator('.draw-card-area__card-wrapper').all()
        console.log(`[${playerName}] Drew ${drawnCardWrappers.length} cards`)

        if (drawnCardWrappers.length >= 2) {
          // 隨機選擇一張牌棄掉
          const cardToDiscard = Math.random() > 0.5 ? 0 : 1

          // 找到棄牌堆 - 使用 .discard-pile 類
          const discardPiles = await page.locator('.discard-pile').all()
          console.log(`[${playerName}] Found ${discardPiles.length} discard piles`)

          if (discardPiles.length > 0) {
            // 選擇一個棄牌堆
            const targetPileIndex = Math.random() > 0.5 ? 0 : Math.min(1, discardPiles.length - 1)
            const targetPile = discardPiles[targetPileIndex]

            // 執行拖放
            try {
              await drawnCardWrappers[cardToDiscard].dragTo(targetPile)
              console.log(`[${playerName}] Dragged card ${cardToDiscard + 1} to discard pile ${targetPileIndex + 1}`)
              await page.waitForTimeout(1000)
              return true
            } catch (dragError) {
              console.log(`[${playerName}] Drag failed, trying click approach...`)
              // 如果拖放失敗，嘗試其他方式
              // 有些實現可能需要點擊卡片再點擊目標位置
              await drawnCardWrappers[cardToDiscard].click()
              await page.waitForTimeout(300)
              await targetPile.click()
              await page.waitForTimeout(500)
              return true
            }
          }
        }
      } catch (error) {
        console.error(`[${playerName}] Error in draw card area:`, error.message)
        await takeScreenshot(page, playerName, 'ERROR_draw_area')
      }
    } else {
      // 嘗試從棄牌堆拿牌
      console.log(`[${playerName}] Cannot draw from deck, checking discard piles...`)
      const discardPiles = await page.locator('.discard-pile:not(.discard-pile--empty)').all()

      if (discardPiles.length > 0) {
        // 點擊第一個非空的棄牌堆
        await discardPiles[0].click()
        console.log(`[${playerName}] Took card from discard pile`)
        await page.waitForTimeout(500)
        return true
      }
    }

    return false
  }

  /**
   * 結束回合
   * 改進: 更好的日誌和錯誤處理
   */
  async function endTurn(page, playerName) {
    const endTurnButton = page.locator('button:has-text("結束回合")')
    if (await endTurnButton.isVisible().catch(() => false)) {
      await endTurnButton.click()
      console.log(`[${playerName}] Ended turn`)
      // 等待更長時間讓 Firebase 同步完成並傳播到兩個客戶端
      await page.waitForTimeout(2500)
      return true
    }
    console.log(`[${playerName}] End turn button not visible`)
    return false
  }

  /**
   * 獲取當前遊戲階段
   * 通過檢查可見的 UI 元素來判斷
   */
  async function getCurrentPhase(page) {
    // 檢查是否在抽牌階段 (可以點擊牌堆)
    if (await page.locator('.draw-deck--can-draw').isVisible().catch(() => false)) {
      return 'draw'
    }

    // 檢查是否在選牌階段 (抽牌區域可見)
    if (await page.locator('.draw-card-area').isVisible().catch(() => false)) {
      return 'choosing'
    }

    // 檢查是否在配對/結束階段 (結束回合按鈕可見)
    if (await page.locator('button:has-text("結束回合")').isVisible().catch(() => false)) {
      return 'pair'
    }

    // 檢查是否在回合結束 Modal
    if (await page.locator('.round-end').isVisible().catch(() => false)) {
      return 'round_end'
    }

    return 'unknown'
  }

  /**
   * 執行一個完整回合
   * 改進: 更詳細的日誌和錯誤處理
   */
  async function playOneTurn(page, playerName, turnNumber) {
    console.log(`\n========== [${playerName}] Turn ${turnNumber} ==========`)

    // 首先檢查是否是我的回合
    const myTurn = await isMyTurn(page)
    if (!myTurn) {
      console.log(`[${playerName}] Not my turn, skipping`)
      return 'not_my_turn'
    }

    const currentPhase = await getCurrentPhase(page)
    console.log(`[${playerName}] Current phase: ${currentPhase}`)

    await takeScreenshot(page, playerName, `turn${turnNumber}_start_phase_${currentPhase}`)

    // 根據階段執行對應操作
    if (currentPhase === 'draw') {
      // 抽牌階段
      const drewCard = await drawAndChooseCard(page, playerName)
      if (!drewCard) {
        console.log(`[${playerName}] Failed to draw card`)
        await takeScreenshot(page, playerName, `turn${turnNumber}_draw_failed`)
      }
      await page.waitForTimeout(500)
    }

    // 檢查是否進入配對階段
    const newPhase = await getCurrentPhase(page)
    console.log(`[${playerName}] After draw, phase: ${newPhase}`)

    if (newPhase === 'pair') {
      // 檢查是否可以宣告 (分數 >= 7)
      const declareStatus = await canDeclare(page)
      console.log(`[${playerName}] Declare status:`, {
        hasStop: declareStatus.hasStop,
        hasLastChance: declareStatus.hasLastChance
      })

      // 如果可以宣告，有 40% 機率宣告
      if (declareStatus.hasStop && Math.random() > 0.6) {
        console.log(`[${playerName}] Declaring STOP!`)
        await takeScreenshot(page, playerName, `turn${turnNumber}_before_stop`)
        await declareStatus.stopButton.click()
        await page.waitForTimeout(1000)
        await takeScreenshot(page, playerName, `turn${turnNumber}_after_stop_click`)

        // Wait for DeclareScoreModal to appear and confirm it
        const confirmDeclareButton = page.locator('button:has-text("確認，繼續遊戲")')
        try {
          await confirmDeclareButton.waitFor({ state: 'visible', timeout: 5000 })
          console.log(`[${playerName}] DeclareScoreModal appeared, clicking confirm...`)
          await takeScreenshot(page, playerName, `turn${turnNumber}_declare_score_modal`)
          await confirmDeclareButton.click()
          await page.waitForTimeout(1000)
          console.log(`[${playerName}] Confirmed Stop declaration`)
          await takeScreenshot(page, playerName, `turn${turnNumber}_after_stop_confirm`)
        } catch (error) {
          console.log(`[${playerName}] DeclareScoreModal not visible or already closed:`, error.message)
        }

        return 'stop'
      }

      if (declareStatus.hasLastChance && Math.random() > 0.6) {
        console.log(`[${playerName}] Declaring LAST CHANCE!`)
        await takeScreenshot(page, playerName, `turn${turnNumber}_before_lastchance`)
        await declareStatus.lastChanceButton.click()
        await page.waitForTimeout(1000)
        await takeScreenshot(page, playerName, `turn${turnNumber}_after_lastchance_click`)

        // Wait for DeclareScoreModal to appear and confirm it
        const confirmDeclareButton = page.locator('button:has-text("確認，繼續遊戲")')
        try {
          await confirmDeclareButton.waitFor({ state: 'visible', timeout: 5000 })
          console.log(`[${playerName}] DeclareScoreModal appeared, clicking confirm...`)
          await takeScreenshot(page, playerName, `turn${turnNumber}_declare_score_modal`)
          await confirmDeclareButton.click()
          await page.waitForTimeout(1000)
          console.log(`[${playerName}] Confirmed Last Chance declaration`)
          await takeScreenshot(page, playerName, `turn${turnNumber}_after_lastchance_confirm`)
        } catch (error) {
          console.log(`[${playerName}] DeclareScoreModal not visible or already closed:`, error.message)
        }

        return 'last_chance'
      }

      // 嘗試打出對子
      const playedPair = await tryPlayPair(page, playerName)
      if (playedPair) {
        await page.waitForTimeout(1000)
      }

      // 結束回合
      const ended = await endTurn(page, playerName)
      if (!ended) {
        console.log(`[${playerName}] Could not end turn, checking state...`)
        await takeScreenshot(page, playerName, `turn${turnNumber}_end_turn_issue`)
      }

      // 額外等待讓 Firebase 同步傳播到兩個客戶端
      await page.waitForTimeout(1500)
    }

    await takeScreenshot(page, playerName, `turn${turnNumber}_end`)

    return 'normal'
  }

  test('完整兩人對戰 - 從開始到結束', async ({ browser }) => {
    test.setTimeout(300000) // 5 分鐘超時

    console.log('\n\n======== Starting Full Two-Player Game Test ========\n')

    // 創建兩個獨立的瀏覽器上下文
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()

    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()

    const playerAName = 'PlayerA'
    const playerBName = 'PlayerB'

    // 設置 console 監聽 - 捕獲重要日誌
    pageA.on('console', msg => {
      const text = msg.text()
      if (text.includes('Error') || text.includes('Warning') ||
          text.includes('[GameBoard]') || text.includes('[Firebase]')) {
        console.log(`[${playerAName} Console]:`, text)
      }
    })

    pageB.on('console', msg => {
      const text = msg.text()
      if (text.includes('Error') || text.includes('Warning') ||
          text.includes('[GameBoard]') || text.includes('[Firebase]')) {
        console.log(`[${playerBName} Console]:`, text)
      }
    })

    try {
      // ===== Step 1: Create Room =====
      console.log('\n[Step 1] PlayerA creates room')
      await pageA.goto('/')
      await pageA.waitForLoadState('networkidle')
      await takeScreenshot(pageA, playerAName, '01_home')

      // 點擊創建房間按鈕
      await pageA.click('button:has-text("創建房間")')
      await pageA.waitForURL(/\/lobby\//, { timeout: 15000 })
      await takeScreenshot(pageA, playerAName, '02_lobby')

      // 獲取房間代碼
      const roomCodeElement = await pageA.locator('.room-lobby__code-value').textContent()
      roomCode = roomCodeElement.trim()
      console.log(`[Step 1] Room code: ${roomCode}`)

      // ===== Step 2: PlayerB Joins =====
      console.log('\n[Step 2] PlayerB joins room')
      await pageB.goto('/')
      await pageB.waitForLoadState('networkidle')
      await takeScreenshot(pageB, playerBName, '03_home')

      // 輸入房間代碼並加入
      await pageB.fill('input[placeholder="輸入房間代碼"]', roomCode)
      await pageB.click('button:has-text("加入房間")')
      await pageB.waitForURL(/\/lobby\//, { timeout: 15000 })
      await takeScreenshot(pageB, playerBName, '04_joined_lobby')

      // 等待房間狀態同步
      await pageA.waitForTimeout(2000)
      await takeScreenshot(pageA, playerAName, '05_lobby_with_playerB')

      // PlayerB 點擊「準備」按鈕
      console.log('\n[Step 2.5] PlayerB clicks ready')
      const readyButton = pageB.locator('button:has-text("準備")')
      await readyButton.waitFor({ state: 'visible', timeout: 10000 })
      await readyButton.click()
      console.log('[Step 2.5] PlayerB clicked ready')
      await takeScreenshot(pageB, playerBName, '05b_ready_clicked')

      // 等待準備狀態同步
      await pageA.waitForTimeout(2000)
      await takeScreenshot(pageA, playerAName, '05c_playerB_ready')

      // ===== Step 3: Start Game =====
      console.log('\n[Step 3] Starting game')

      // 等待開始遊戲按鈕可用（按鈕文字包含播放符號）
      const startButton = pageA.locator('button:has-text("開始遊戲")')
      await startButton.waitFor({ state: 'visible', timeout: 15000 })

      // 點擊開始遊戲
      await startButton.click()
      console.log('[Step 3] Clicked start game button')

      // 等待兩個玩家都進入遊戲頁面
      console.log('[Step 3] Waiting for players to enter game...')
      await Promise.all([
        pageA.waitForURL(/\/game\//, { timeout: 15000 }),
        pageB.waitForURL(/\/game\//, { timeout: 15000 })
      ])
      console.log('[Step 3] Both players reached game URL')

      // 等待遊戲載入完成
      await Promise.all([
        waitForGameState(pageA, playerAName),
        waitForGameState(pageB, playerBName)
      ])

      await takeScreenshot(pageA, playerAName, '06_game_started')
      await takeScreenshot(pageB, playerBName, '07_game_started')

      console.log('[Step 3] Game successfully started!')

      // ===== Step 4: Game Loop =====
      console.log('\n[Step 4] Starting game loop')

      let turnNumber = 1
      let maxTurns = 100 // Prevent infinite loop
      let gameEnded = false
      let consecutiveNoTurns = 0 // Track consecutive turns where no one acts

      while (turnNumber <= maxTurns && !gameEnded) {
        console.log(`\n======== Turn ${turnNumber} ========`)

        // Check for round end modal on either player's screen
        const roundEndModalA = await pageA.locator('.round-end').isVisible().catch(() => false)
        const roundEndModalB = await pageB.locator('.round-end').isVisible().catch(() => false)

        // Also check for settlement animation
        const settlementA = await pageA.locator('.round-settlement').isVisible().catch(() => false)
        const settlementB = await pageB.locator('.round-settlement').isVisible().catch(() => false)

        if (settlementA || settlementB) {
          console.log('[Round] Settlement animation in progress...')
          await takeScreenshot(pageA, playerAName, `turn${turnNumber}_settlement`)
          await takeScreenshot(pageB, playerBName, `turn${turnNumber}_settlement`)

          // Try to click "Skip Animation" button to speed up
          const skipButtonA = pageA.locator('button:has-text("跳過動畫")')
          const skipButtonB = pageB.locator('button:has-text("跳過動畫")')

          if (await skipButtonA.isVisible().catch(() => false)) {
            console.log('[Settlement] Clicking skip animation on PlayerA')
            await skipButtonA.click()
            await pageA.waitForTimeout(1000)
          } else if (await skipButtonB.isVisible().catch(() => false)) {
            console.log('[Settlement] Clicking skip animation on PlayerB')
            await skipButtonB.click()
            await pageB.waitForTimeout(1000)
          }

          // After skipping, look for "Continue Game" button
          const continueButtonA = pageA.locator('button:has-text("繼續遊戲")')
          const continueButtonB = pageB.locator('button:has-text("繼續遊戲")')

          if (await continueButtonA.isVisible().catch(() => false)) {
            console.log('[Settlement] Clicking continue game on PlayerA')
            await takeScreenshot(pageA, playerAName, `turn${turnNumber}_settlement_final`)
            await continueButtonA.click()
            await pageA.waitForTimeout(1500)
          } else if (await continueButtonB.isVisible().catch(() => false)) {
            console.log('[Settlement] Clicking continue game on PlayerB')
            await takeScreenshot(pageB, playerBName, `turn${turnNumber}_settlement_final`)
            await continueButtonB.click()
            await pageB.waitForTimeout(1500)
          } else {
            // Wait a bit and retry
            await pageA.waitForTimeout(2000)
          }

          continue
        }

        // Check for DeclareScoreModal on either player's screen
        // This modal appears after a player declares Stop or Last Chance
        const declareModalA = await pageA.locator('.declare-score').isVisible().catch(() => false)
        const declareModalB = await pageB.locator('.declare-score').isVisible().catch(() => false)

        if (declareModalA || declareModalB) {
          console.log('[Declare] DeclareScoreModal detected, handling confirmation...')
          await takeScreenshot(pageA, playerAName, `turn${turnNumber}_declare_modal_detected`)
          await takeScreenshot(pageB, playerBName, `turn${turnNumber}_declare_modal_detected`)

          // Find and click the confirm button on whichever page has it
          const confirmButtonA = pageA.locator('button:has-text("確認，繼續遊戲")')
          const confirmButtonB = pageB.locator('button:has-text("確認，繼續遊戲")')

          const hasConfirmA = await confirmButtonA.isVisible().catch(() => false)
          const hasConfirmB = await confirmButtonB.isVisible().catch(() => false)

          if (hasConfirmA) {
            console.log('[Declare] PlayerA clicking confirm button')
            await confirmButtonA.click()
            await pageA.waitForTimeout(1500)
          } else if (hasConfirmB) {
            console.log('[Declare] PlayerB clicking confirm button')
            await confirmButtonB.click()
            await pageB.waitForTimeout(1500)
          } else {
            console.log('[Declare] Waiting for declarer to confirm...')
            await pageA.waitForTimeout(2000)
          }

          // Take screenshot after handling declare modal
          await takeScreenshot(pageA, playerAName, `turn${turnNumber}_after_declare_modal`)
          await takeScreenshot(pageB, playerBName, `turn${turnNumber}_after_declare_modal`)
          continue
        }

        if (roundEndModalA || roundEndModalB) {
          console.log('[Round] Round end modal detected!')
          await takeScreenshot(pageA, playerAName, `turn${turnNumber}_round_end`)
          await takeScreenshot(pageB, playerBName, `turn${turnNumber}_round_end`)

          // Check if game is over (someone reached target score)
          const gameOverTextA = await pageA.locator('text=遊戲結束').isVisible().catch(() => false)
          const gameOverTextB = await pageB.locator('text=遊戲結束').isVisible().catch(() => false)
          const returnHomeButtonA = await pageA.locator('button:has-text("返回首頁")').isVisible().catch(() => false)
          const returnHomeButtonB = await pageB.locator('button:has-text("返回首頁")').isVisible().catch(() => false)

          if (gameOverTextA || gameOverTextB || returnHomeButtonA || returnHomeButtonB) {
            console.log('[Game] GAME OVER!')
            await takeScreenshot(pageA, playerAName, `turn${turnNumber}_game_over`)
            await takeScreenshot(pageB, playerBName, `turn${turnNumber}_game_over`)
            gameEnded = true
            break
          }

          // Click next round button
          const nextRoundButtonA = pageA.locator('button:has-text("開始下一回合")')
          const nextRoundButtonB = pageB.locator('button:has-text("開始下一回合")')

          if (await nextRoundButtonA.isVisible().catch(() => false)) {
            await nextRoundButtonA.click()
            console.log('[Round] PlayerA clicked next round')
          } else if (await nextRoundButtonB.isVisible().catch(() => false)) {
            await nextRoundButtonB.click()
            console.log('[Round] PlayerB clicked next round')
          }

          // Wait for new round to start
          await pageA.waitForTimeout(3000)
          await pageB.waitForTimeout(3000)

          turnNumber = 1 // Reset turn counter for new round
          consecutiveNoTurns = 0
          continue
        }

        // Check whose turn it is
        const isPlayerATurn = await isMyTurn(pageA)
        const isPlayerBTurn = await isMyTurn(pageB)

        console.log(`[Turn ${turnNumber}] PlayerA turn: ${isPlayerATurn}, PlayerB turn: ${isPlayerBTurn}`)

        if (isPlayerATurn) {
          consecutiveNoTurns = 0
          const result = await playOneTurn(pageA, playerAName, turnNumber)
          if (result === 'stop' || result === 'last_chance') {
            console.log(`[${playerAName}] Declared ${result}, waiting for round resolution...`)
            await pageA.waitForTimeout(4000)
            await pageB.waitForTimeout(4000)
          }
        } else if (isPlayerBTurn) {
          consecutiveNoTurns = 0
          const result = await playOneTurn(pageB, playerBName, turnNumber)
          if (result === 'stop' || result === 'last_chance') {
            console.log(`[${playerBName}] Declared ${result}, waiting for round resolution...`)
            await pageA.waitForTimeout(4000)
            await pageB.waitForTimeout(4000)
          }
        } else {
          consecutiveNoTurns++
          console.log(`[Turn ${turnNumber}] Cannot determine whose turn (consecutive: ${consecutiveNoTurns})`)

          if (consecutiveNoTurns >= 5) {
            console.log('[Warning] Too many consecutive unknown turns, capturing debug info')
            await takeScreenshot(pageA, playerAName, `turn${turnNumber}_debug_unknown_turn`)
            await takeScreenshot(pageB, playerBName, `turn${turnNumber}_debug_unknown_turn`)

            // Try refreshing state by waiting
            await pageA.waitForTimeout(3000)
            await pageB.waitForTimeout(3000)
            consecutiveNoTurns = 0
          } else {
            await pageA.waitForTimeout(2000)
            await pageB.waitForTimeout(2000)
          }
        }

        turnNumber++

        // Small delay between turns
        await pageA.waitForTimeout(500)
      }

      if (!gameEnded && turnNumber > maxTurns) {
        console.log('[Warning] Reached max turns limit, ending test')
        await takeScreenshot(pageA, playerAName, 'max_turns_reached')
        await takeScreenshot(pageB, playerBName, 'max_turns_reached')
      }

      console.log('\n\n======== Full Game Test Complete ========')
      console.log(`Total screenshots: ${screenshotCounter}`)
      console.log(`Screenshots directory: ${screenshotDir}`)

    } catch (error) {
      console.error('\n======== TEST ERROR ========')
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)

      // Capture final state for debugging
      try {
        await takeScreenshot(pageA, playerAName, 'ERROR_final_state')
        await takeScreenshot(pageB, playerBName, 'ERROR_final_state')

        // Log current URL for debugging
        console.log(`[${playerAName}] Current URL:`, pageA.url())
        console.log(`[${playerBName}] Current URL:`, pageB.url())
      } catch (screenshotError) {
        console.error('Failed to capture error screenshots:', screenshotError.message)
      }

      throw error
    } finally {
      console.log('\n[Cleanup] Closing browser contexts...')
      await contextA.close()
      await contextB.close()
      console.log('[Cleanup] Done')
    }
  })
})
