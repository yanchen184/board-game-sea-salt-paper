import { test, expect } from '@playwright/test'

/**
 * 🎮 完整 AI 對戰測試
 *
 * 測試流程：
 * 1. 創建房間
 * 2. 添加 3 個 AI 玩家（人類玩家 + 3 AI）
 * 3. 開始遊戲
 * 4. 在關鍵時刻截圖：
 *    - 遊戲初始化
 *    - 首次宣告（Stop 或 Last Chance）
 *    - 回合結算
 *    - 遊戲結束
 * 5. 等待遊戲完整結束
 */

test.describe('完整 AI 對戰流程', () => {
  test('4 位玩家對戰直到遊戲結束', async ({ page }) => {
    test.setTimeout(600000) // 10 分鐘超時

    const screenshots = []
    let screenshotCounter = 0
    let declareScreenshotTaken = false
    let roundCount = 0

    // Helper: 截圖並記錄
    const takeScreenshot = async (name) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `${screenshotCounter.toString().padStart(3, '0')}_${name}_${timestamp}.png`
      await page.screenshot({
        path: `test-screenshots/ai-battle/${filename}`,
        fullPage: true
      })
      screenshots.push({ name, filename, time: timestamp })
      screenshotCounter++
      console.log(`📸 Screenshot: ${name}`)
    }

    // Helper: 等待並檢查文本
    const waitForText = async (text, timeout = 5000) => {
      try {
        await page.waitForSelector(`text=${text}`, { timeout })
        return true
      } catch {
        return false
      }
    }

    console.log('🎮 開始 AI 對戰測試...')

    // ==================== 步驟 1: 前往首頁 ====================
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('海鹽與紙牌')
    console.log('✅ 載入首頁')

    // ==================== 步驟 2: 創建房間 ====================
    await page.click('button:has-text("創建房間")')
    await page.waitForURL(/\/lobby\//)
    console.log('✅ 創建房間')

    // 取得房間代碼
    const roomCodeElement = await page.locator('[class*="room-code"]').first()
    const roomCode = await roomCodeElement.textContent()
    console.log(`📍 房間代碼: ${roomCode}`)

    await takeScreenshot('01-room-created')

    // ==================== 步驟 3: 添加 AI 玩家 ====================
    console.log('🤖 添加 AI 玩家...')

    // 添加 AI 小白
    await page.click('button:has-text("添加 AI")')
    await page.waitForTimeout(500)
    console.log('  ✅ AI 小白')

    // 添加 AI 小黑
    await page.click('button:has-text("添加 AI")')
    await page.waitForTimeout(500)
    console.log('  ✅ AI 小黑')

    // 添加 AI 小紅
    await page.click('button:has-text("添加 AI")')
    await page.waitForTimeout(500)
    console.log('  ✅ AI 小紅')

    await takeScreenshot('02-all-players-ready')

    // ==================== 步驟 4: 開始遊戲 ====================
    await page.click('button:has-text("開始遊戲")')
    await page.waitForURL(/\/game\//)
    console.log('✅ 遊戲開始')

    await page.waitForTimeout(2000)
    await takeScreenshot('03-game-started')

    // ==================== 步驟 5: 監控遊戲進行 ====================
    console.log('👀 監控遊戲進行...')

    // 設置 console 監聽
    page.on('console', async (msg) => {
      const text = msg.text()

      // 🔍 DEBUG: Log all AI-related console messages
      if (text.includes('[AI') || text.includes('shouldPlayMorePairs')) {
        console.log('🤖 [AI Debug]', text)
      }

      // 監控宣告事件
      if (text.includes('宣告') && !declareScreenshotTaken) {
        await page.waitForTimeout(1000)

        if (text.includes('Stop') || text.includes('到此為止')) {
          await takeScreenshot(`04-declare-stop`)
          console.log('🎯 捕獲宣告 STOP')
        } else if (text.includes('Last Chance') || text.includes('最後機會')) {
          await takeScreenshot(`05-declare-lastchance`)
          console.log('🎯 捕獲宣告 LAST CHANCE')
        }

        declareScreenshotTaken = true
      }

      // 監控回合結束
      if (text.includes('回合結束') || text.includes('Round End')) {
        roundCount++
        await page.waitForTimeout(2000)
        await takeScreenshot(`06-round${roundCount}-end`)
        console.log(`📊 回合 ${roundCount} 結束`)
        declareScreenshotTaken = false // 重置以捕獲下一次宣告
      }

      // 監控偷牌效果
      if (text.includes('偷了') && text.includes('的一張牌')) {
        await page.waitForTimeout(500)
        await takeScreenshot(`special-steal-card`)
        console.log('🎯 捕獲偷牌效果')
      }
    })

    // ==================== 步驟 6: 等待遊戲結束 ====================
    console.log('⏳ 等待遊戲結束...')

    // 🎮 處理人類玩家回合的函數
    async function handleHumanTurn() {
      try {
        // === 階段 1: 抽牌階段 (Draw Phase) ===
        const drawDeck = page.locator('.draw-deck--can-draw').first()
        const leftPile = page.locator('.discard-pile--left.discard-pile--can-take').first()
        const rightPile = page.locator('.discard-pile--right.discard-pile--can-take').first()

        const canDrawFromDeck = await drawDeck.isVisible().catch(() => false)
        const canDrawFromLeft = await leftPile.isVisible().catch(() => false)
        const canDrawFromRight = await rightPile.isVisible().catch(() => false)

        if (canDrawFromDeck || canDrawFromLeft || canDrawFromRight) {
          console.log('👤 [Human Turn] 偵測到抽牌階段')

          // 抽牌（優先從牌堆抽）
          if (canDrawFromDeck) {
            await drawDeck.click()
            console.log('👤 [Human Turn] 從牌堆抽牌')
          } else if (canDrawFromLeft) {
            await leftPile.click()
            console.log('👤 [Human Turn] 從左側棄牌堆抽牌')
          } else if (canDrawFromRight) {
            await rightPile.click()
            console.log('👤 [Human Turn] 從右側棄牌堆抽牌')
          }

          await page.waitForTimeout(1500)

          // === 階段 2: 選牌階段 (Card Choice Modal) ===
          const cardChoiceModal = page.locator('[class*="card-choice-modal"]').first()
          const hasChoiceModal = await cardChoiceModal.isVisible().catch(() => false)

          if (hasChoiceModal) {
            const firstChoiceCard = page.locator('[class*="card-choice-modal"] button').first()
            await firstChoiceCard.click()
            console.log('👤 [Human Turn] 選擇保留第一張牌')
            await page.waitForTimeout(800)
          }
        }

        // === 階段 3: 配對階段 (Pair Phase) - 點擊結束回合按鈕 ===
        await page.waitForTimeout(500)

        // 檢查是否有「結束回合」按鈕（表示在配對階段）
        const endTurnButton = page.locator('button:has-text("結束回合")').first()
        const hasEndTurnButton = await endTurnButton.isVisible().catch(() => false)

        if (hasEndTurnButton) {
          console.log('👤 [Human Turn] 偵測到配對階段，點擊「結束回合」按鈕')
          await endTurnButton.click()
          await page.waitForTimeout(800)
          console.log('👤 [Human Turn] 已跳過配對階段')
        }

        // === 階段 4: 棄牌階段 (Discard Phase) ===
        await page.waitForTimeout(300)

        const leftPileFinal = page.locator('.discard-pile--left.discard-pile--can-drop').first()
        const rightPileFinal = page.locator('.discard-pile--right.discard-pile--can-drop').first()

        const canDiscardLeftFinal = await leftPileFinal.isVisible().catch(() => false)
        const canDiscardRightFinal = await rightPileFinal.isVisible().catch(() => false)

        if (canDiscardLeftFinal || canDiscardRightFinal) {
          // 選擇手牌中的第一張牌
          const firstCard = page.locator('[class*="player-hand"] button').first()
          const hasCard = await firstCard.isVisible().catch(() => false)

          if (hasCard) {
            await firstCard.click()
            console.log('👤 [Human Turn] 選擇第一張手牌準備棄牌')
            await page.waitForTimeout(300)

            // 棄到左側棄牌堆（優先）
            if (canDiscardLeftFinal) {
              await leftPileFinal.click()
              console.log('👤 [Human Turn] 棄牌到左側')
            } else if (canDiscardRightFinal) {
              await rightPileFinal.click()
              console.log('👤 [Human Turn] 棄牌到右側')
            }

            await page.waitForTimeout(1000)
            console.log('👤 [Human Turn] ✅ 回合結束')
            return true
          }
        }

        return false
      } catch (error) {
        console.log('👤 [Human Turn] Error:', error.message)
        return false
      }
    }

    let gameEnded = false
    let checkCount = 0
    const maxChecks = 300 // 5 分鐘 (300 * 1秒)

    while (!gameEnded && checkCount < maxChecks) {
      checkCount++

      // 🎮 嘗試處理人類玩家回合
      await handleHumanTurn()

      // 檢查是否有"遊戲結束"或最終贏家顯示
      const hasGameOver = await page.locator('text=遊戲結束').isVisible().catch(() => false)
      const hasWinner = await page.locator('[class*="winner"]').isVisible().catch(() => false)
      const hasFinalScore = await page.locator('text=最終分數').isVisible().catch(() => false)

      if (hasGameOver || hasWinner || hasFinalScore) {
        console.log('🏆 遊戲結束！')
        gameEnded = true
        await page.waitForTimeout(2000)
        await takeScreenshot('99-game-over-final')
        break
      }

      // 每 10 秒截一張圖記錄進度
      if (checkCount % 10 === 0) {
        await takeScreenshot(`progress-${Math.floor(checkCount / 10)}`)
        console.log(`  ⏱️ 進行中... (${checkCount}秒)`)
      }

      await page.waitForTimeout(1000)
    }

    if (!gameEnded) {
      console.log('⚠️ 測試超時，但遊戲可能仍在進行')
      await takeScreenshot('timeout-final-state')
    }

    // ==================== 步驟 7: 生成測試報告 ====================
    console.log('\n📋 測試總結:')
    console.log(`  總截圖數: ${screenshots.length}`)
    console.log(`  回合數: ${roundCount}`)
    console.log(`  遊戲時長: ${checkCount} 秒`)
    console.log('\n📸 截圖清單:')
    screenshots.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} - ${s.filename}`)
    })

    // 驗證遊戲有正常進行
    expect(screenshots.length).toBeGreaterThan(5) // 至少應該有初始化 + 進行中的截圖
    expect(roundCount).toBeGreaterThan(0) // 至少完成一回合
  })
})

test.describe('AI 決策測試', () => {
  test('檢查 AI 宣告決策', async ({ page }) => {
    test.setTimeout(300000) // 5 分鐘

    await page.goto('/')
    await page.click('button:has-text("創建房間")')
    await page.waitForURL(/\/lobby\//)

    // 添加 3 個 AI
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("添加 AI")')
      await page.waitForTimeout(300)
    }

    await page.click('button:has-text("開始遊戲")')
    await page.waitForURL(/\/game\//)
    await page.waitForTimeout(2000)

    let declareEvents = []

    // 監聽宣告事件
    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('AI Turn') && text.includes('Declaring')) {
        console.log(`🎯 AI 宣告: ${text}`)
        declareEvents.push({
          time: new Date().toISOString(),
          message: text
        })
      }
    })

    // 等待至少出現一次宣告
    let waitTime = 0
    while (declareEvents.length === 0 && waitTime < 180000) {
      await page.waitForTimeout(5000)
      waitTime += 5000

      if (waitTime % 30000 === 0) {
        console.log(`⏱️ 等待 AI 宣告... (${waitTime / 1000}秒)`)
      }
    }

    console.log(`\n📊 宣告統計:`)
    console.log(`  總宣告次數: ${declareEvents.length}`)
    declareEvents.forEach((event, i) => {
      console.log(`  ${i + 1}. ${event.time}: ${event.message}`)
    })

    // 驗證至少有一次宣告
    expect(declareEvents.length).toBeGreaterThan(0)
  })
})
