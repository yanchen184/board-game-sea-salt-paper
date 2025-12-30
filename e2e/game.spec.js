import { test, expect } from '@playwright/test'

test.describe('海鹽與紙牌遊戲 - 雙人測試', () => {
  let roomCode

  test('應該能創建房間並開始遊戲', async ({ browser }) => {
    // 創建兩個瀏覽器上下文（模擬兩個玩家）
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()

    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()

    // 玩家 A 創建房間（使用自動生成的名字）
    await pageA.goto('/')
    await pageA.click('button:has-text("創建房間")')

    // 等待進入大廳
    await pageA.waitForURL(/\/lobby\//)

    // 獲取房間代碼
    const roomCodeElement = await pageA.locator('.room-lobby__code-value').textContent()
    roomCode = roomCodeElement.trim()

    console.log('房間代碼:', roomCode)

    // 玩家 B 加入房間（使用自動生成的名字）
    await pageB.goto('/')
    await pageB.fill('input[placeholder="輸入房間代碼"]', roomCode)
    await pageB.click('button:has-text("加入房間")')

    // 等待玩家 B 進入大廳
    await pageB.waitForURL(/\/lobby\//)

    // 玩家 A 開始遊戲
    await pageA.click('button:has-text("開始遊戲")')

    // 等待兩個玩家都進入遊戲
    await pageA.waitForURL(/\/game\//)
    await pageB.waitForURL(/\/game\//)

    // 驗證遊戲介面元素存在
    await expect(pageA.locator('text=你的手牌')).toBeVisible()
    await expect(pageB.locator('text=你的手牌')).toBeVisible()

    // 驗證 Action Log 在右側
    await expect(pageA.locator('.game-board__sidebar')).toBeVisible()
    await expect(pageB.locator('.game-board__sidebar')).toBeVisible()

    // 驗證中文化
    await expect(pageA.locator('text=操作紀錄')).toBeVisible()
    await expect(pageA.locator('text=計分面板')).toBeVisible()

    console.log('✅ 遊戲成功啟動，UI 中文化正常')

    await contextA.close()
    await contextB.close()
  })

  test('應該能正常抽牌和選擇卡片', async ({ browser }) => {
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()

    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()

    // 設置 console 監聽
    const consoleLogsA = []
    pageA.on('console', msg => {
      const text = msg.text()
      if (text.includes('[drawCard]') || text.includes('[confirmCardChoice]') || text.includes('[handleCardDropped]')) {
        consoleLogsA.push(text)
        console.log('玩家A Console:', text)
      }
    })

    const consoleLogsB = []
    pageB.on('console', msg => {
      const text = msg.text()
      if (text.includes('[GameBoard] Rendering DrawCardArea')) {
        consoleLogsB.push(text)
        console.log('玩家B Console:', text)
      }
    })

    // 玩家 A 創建並開始遊戲
    await pageA.goto('/')
    await pageA.click('button:has-text("創建房間")')
    await pageA.waitForURL(/\/lobby\//)

    const roomCodeElement = await pageA.locator('.room-lobby__code-value').textContent()
    roomCode = roomCodeElement.trim()

    // 玩家 B 加入
    await pageB.goto('/')
    await pageB.fill('input[placeholder="輸入房間代碼"]', roomCode)
    await pageB.click('button:has-text("加入房間")')
    await pageB.waitForURL(/\/lobby\//)

    // 開始遊戲
    await pageA.click('button:has-text("開始遊戲")')
    await pageA.waitForURL(/\/game\//)
    await pageB.waitForURL(/\/game\//)

    // 等待遊戲完全載入
    await pageA.waitForSelector('.game-board__container', { timeout: 5000 })

    // 檢查誰的回合
    const isPlayerATurn = await pageA.locator('text=你的回合').isVisible().catch(() => false)

    let activePlayer = isPlayerATurn ? pageA : pageB
    let observerPlayer = isPlayerATurn ? pageB : pageA
    let activePlayerName = isPlayerATurn ? '玩家A' : '玩家B'

    console.log(`當前回合：${activePlayerName}`)

    // 記錄抽牌前的手牌數量
    const handCardsBefore = await activePlayer.locator('.player-hand__card').count()
    console.log(`抽牌前手牌數量: ${handCardsBefore}`)

    // 當前玩家抽牌
    const drawButton = activePlayer.locator('button:has-text("抽牌")').or(activePlayer.locator('.draw-deck'))
    if (await drawButton.isVisible()) {
      await drawButton.click()
      console.log('✅ 點擊了抽牌按鈕')

      // 等待抽到的牌顯示
      await activePlayer.waitForSelector('.draw-card-area', { timeout: 5000 })
      console.log('✅ 抽牌區域已顯示')

      // 檢查觀察者是否看到牌背
      const observerSeesCards = await observerPlayer.locator('.draw-card-area').isVisible({ timeout: 2000 }).catch(() => false)
      if (observerSeesCards) {
        console.log('✅ 對手看到了抽牌動作')
      } else {
        console.log('❌ 對手沒有看到抽牌動作')
      }

      // 獲取抽到的兩張牌
      const drawnCards = await activePlayer.locator('.draw-card-area__card').all()
      console.log(`抽到了 ${drawnCards.length} 張牌`)

      if (drawnCards.length === 2) {
        // 嘗試拖曳第一張牌到左側棄牌堆
        const firstCard = drawnCards[0]
        const leftDiscardPile = activePlayer.locator('.discard-pile').first()

        // 使用 dragTo 來模擬拖曳
        await firstCard.dragTo(leftDiscardPile)
        console.log('✅ 拖曳卡片到棄牌堆')

        // 等待一下讓狀態更新
        await activePlayer.waitForTimeout(1000)

        // 檢查手牌數量是否增加
        const handCardsAfter = await activePlayer.locator('.player-hand__card').count()
        console.log(`抽牌後手牌數量: ${handCardsAfter}`)

        // 驗證手牌增加了 1 張
        if (handCardsAfter === handCardsBefore + 1) {
          console.log('✅ 手牌正確增加了 1 張')
        } else {
          console.log(`❌ 手牌數量不正確。期望: ${handCardsBefore + 1}, 實際: ${handCardsAfter}`)

          // 輸出所有 console 日誌以便調試
          console.log('\n=== 玩家A Console 日誌 ===')
          consoleLogsA.forEach(log => console.log(log))
          console.log('\n=== 玩家B Console 日誌 ===')
          consoleLogsB.forEach(log => console.log(log))
        }

        expect(handCardsAfter).toBe(handCardsBefore + 1)
      }
    } else {
      console.log('❌ 找不到抽牌按鈕，可能不是抽牌階段')
    }

    await contextA.close()
    await contextB.close()
  })

  test('應該能正常結束回合', async ({ browser }) => {
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()

    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()

    // 設置 console 監聽
    pageA.on('console', msg => {
      const text = msg.text()
      if (text.includes('[endTurn]')) {
        console.log('玩家A Console:', text)
      }
    })

    // 創建並開始遊戲
    await pageA.goto('/')
    await pageA.click('button:has-text("創建房間")')
    await pageA.waitForURL(/\/lobby\//)

    const roomCodeElement = await pageA.locator('.room-lobby__code-value').textContent()
    roomCode = roomCodeElement.trim()

    await pageB.goto('/')
    await pageB.fill('input[placeholder="輸入房間代碼"]', roomCode)
    await pageB.click('button:has-text("加入房間")')
    await pageB.waitForURL(/\/lobby\//)

    await pageA.click('button:has-text("開始遊戲")')
    await pageA.waitForURL(/\/game\//)
    await pageB.waitForURL(/\/game\//)

    await pageA.waitForSelector('.game-board__container', { timeout: 5000 })

    // 檢查誰的回合
    const isPlayerATurn = await pageA.locator('text=你的回合').isVisible().catch(() => false)
    const isPlayerBTurn = await pageB.locator('text=你的回合').isVisible().catch(() => false)

    let activePlayer = isPlayerATurn ? pageA : pageB
    let observerPlayer = isPlayerATurn ? pageB : pageA
    let activePlayerName = isPlayerATurn ? '玩家A' : '玩家B'
    let observerPlayerName = isPlayerATurn ? '玩家B' : '玩家A'

    console.log(`當前回合：${activePlayerName}`)

    // 點擊結束回合
    const endTurnButton = activePlayer.locator('button:has-text("結束回合")')
    if (await endTurnButton.isVisible()) {
      await endTurnButton.click()
      console.log('✅ 點擊了結束回合按鈕')

      // 等待回合切換
      await activePlayer.waitForTimeout(1000)

      // 檢查是否切換到另一個玩家
      const observerHasTurn = await observerPlayer.locator('text=你的回合').isVisible({ timeout: 3000 }).catch(() => false)

      if (observerHasTurn) {
        console.log(`✅ 回合正確切換到 ${observerPlayerName}`)
      } else {
        console.log(`❌ 回合沒有切換到 ${observerPlayerName}`)
      }

      expect(observerHasTurn).toBe(true)
    }

    await contextA.close()
    await contextB.close()
  })
})
