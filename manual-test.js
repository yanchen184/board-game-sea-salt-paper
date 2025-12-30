/**
 * 手動測試腳本 - 海鹽與紙牌遊戲
 *
 * 使用方法：
 * 1. 確保開發伺服器運行在 http://localhost:5173
 * 2. 運行: node manual-test.js
 * 3. 按照提示在兩個瀏覽器視窗中操作
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import process from 'process';

async function runManualTest() {
  console.log('🎮 開始手動測試遊戲...\n');

  // 啟動瀏覽器
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500  // 放慢操作速度以便觀察
  });

  // 創建兩個瀏覽器上下文（模擬兩個玩家）
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();

  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  try {
    console.log('📍 步驟 1: 玩家 A 創建房間');
    await pageA.goto('http://localhost:5173');
    await pageA.waitForLoadState('networkidle');

    // 截圖首頁
    await pageA.screenshot({ path: 'test-screenshots/01-homepage.png' });
    console.log('   ✅ 首頁載入成功');

    // 點擊創建房間
    await pageA.click('button:has-text("創建房間")');
    await pageA.waitForURL(/\/lobby\//);

    // 獲取房間代碼
    const roomCode = await pageA.locator('.room-lobby__code-value').textContent();
    console.log(`   ✅ 房間創建成功！房間代碼: ${roomCode}`);

    await pageA.screenshot({ path: 'test-screenshots/02-room-created.png' });

    console.log('\n📍 步驟 2: 玩家 B 加入房間');
    await pageB.goto('http://localhost:5173');
    await pageB.waitForLoadState('networkidle');

    // 輸入房間代碼並加入
    await pageB.fill('input[placeholder="輸入房間代碼"]', roomCode);
    await pageB.click('button:has-text("加入房間")');
    await pageB.waitForURL(/\/lobby\//);

    console.log('   ✅ 玩家 B 成功加入房間');
    await pageB.screenshot({ path: 'test-screenshots/03-player-joined.png' });

    // 等待一下讓 Firebase 同步
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: 'test-screenshots/04-two-players-lobby.png' });

    console.log('\n📍 步驟 3: 玩家 B 點擊準備');

    // 檢查玩家 B 是否看到準備按鈕
    const readyButton = pageB.locator('button:has-text("準備")');
    if (await readyButton.isVisible()) {
      await readyButton.click();
      console.log('   ✅ 玩家 B 已點擊準備');

      // 等待按鈕文字變更
      await pageB.waitForSelector('button:has-text("✓ 準備完成")', { timeout: 5000 });
      console.log('   ✅ 玩家 B 準備狀態已確認');

      await pageB.screenshot({ path: 'test-screenshots/05-player-ready.png' });
    } else {
      console.log('   ❌ 找不到準備按鈕');
      await pageB.screenshot({ path: 'test-screenshots/05-no-ready-button.png' });
    }

    // 檢查玩家 A 是否看到開始遊戲按鈕
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: 'test-screenshots/06-host-view-after-ready.png' });

    console.log('\n📍 步驟 4: 玩家 A（房主）開始遊戲');

    const startButton = pageA.locator('button:has-text("開始遊戲")');
    if (await startButton.isVisible()) {
      console.log('   ✅ 找到開始遊戲按鈕');

      // 檢查按鈕是否啟用
      const isDisabled = await startButton.isDisabled();
      if (isDisabled) {
        console.log('   ⚠️  開始遊戲按鈕是禁用狀態');
        const buttonText = await pageA.locator('.room-lobby__start-btn').textContent();
        console.log(`   📝 按鈕文字: "${buttonText}"`);
      } else {
        console.log('   ✅ 開始遊戲按鈕已啟用');
        await startButton.click();

        // 等待進入遊戲
        await pageA.waitForURL(/\/game\//, { timeout: 5000 });
        await pageB.waitForURL(/\/game\//, { timeout: 5000 });

        console.log('   ✅ 成功進入遊戲！');

        await pageA.screenshot({ path: 'test-screenshots/07-game-board-player-a.png' });
        await pageB.screenshot({ path: 'test-screenshots/08-game-board-player-b.png' });

        console.log('\n📍 步驟 5: 檢查遊戲界面元素');

        // 檢查玩家 A 的遊戲界面
        const elementsToCheck = [
          { selector: '.player-hand', name: '手牌區' },
          { selector: '.discard-pile', name: '棄牌堆' },
          { selector: '.draw-deck', name: '抽牌堆' },
          { selector: '.game-board__sidebar', name: '側邊欄' },
          { selector: 'text=操作紀錄', name: '操作紀錄標題' },
          { selector: 'text=計分面板', name: '計分面板標題' }
        ];

        for (const element of elementsToCheck) {
          const isVisible = await pageA.locator(element.selector).isVisible().catch(() => false);
          console.log(`   ${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible ? '顯示正常' : '未找到'}`);
        }

        // 檢查手牌數量
        const handCardsA = await pageA.locator('.player-hand__card').count();
        const handCardsB = await pageB.locator('.player-hand__card').count();
        console.log(`\n   📊 玩家 A 手牌數量: ${handCardsA} 張`);
        console.log(`   📊 玩家 B 手牌數量: ${handCardsB} 張`);

        // 檢查誰的回合
        const isPlayerATurn = await pageA.locator('text=你的回合').isVisible().catch(() => false);
        const isPlayerBTurn = await pageB.locator('text=你的回合').isVisible().catch(() => false);

        console.log(`\n   🎲 當前回合: ${isPlayerATurn ? '玩家 A' : isPlayerBTurn ? '玩家 B' : '未知'}`);

        console.log('\n📍 步驟 6: 測試抽牌功能');

        const activePlayer = isPlayerATurn ? pageA : pageB;
        const activePlayerName = isPlayerATurn ? '玩家 A' : '玩家 B';

        // 檢查是否有抽牌按鈕或抽牌堆可點擊
        const drawButton = activePlayer.locator('button:has-text("抽牌")');
        const drawDeck = activePlayer.locator('.draw-deck');

        const hasDrawButton = await drawButton.isVisible().catch(() => false);
        const hasDrawDeck = await drawDeck.isVisible().catch(() => false);

        if (hasDrawButton || hasDrawDeck) {
          console.log(`   ✅ ${activePlayerName} 可以抽牌`);

          // 點擊抽牌
          if (hasDrawButton) {
            await drawButton.click();
          } else {
            await drawDeck.click();
          }

          // 等待抽牌區域顯示
          await activePlayer.waitForSelector('.draw-card-area', { timeout: 5000 }).catch(() => {
            console.log('   ⚠️  未看到抽牌區域');
          });

          const drawnCards = await activePlayer.locator('.draw-card-area__card').count();
          console.log(`   📊 抽到了 ${drawnCards} 張牌`);

          await activePlayer.screenshot({ path: `test-screenshots/09-${activePlayerName}-drew-cards.png` });

          if (drawnCards === 2) {
            console.log('   ℹ️  現在需要選擇一張牌留下，一張牌棄掉');
            console.log('   ℹ️  可以拖曳卡片到左右兩個棄牌堆');
          }
        } else {
          console.log(`   ℹ️  當前不是抽牌階段或找不到抽牌按鈕`);
        }

      }
    } else {
      console.log('   ❌ 找不到開始遊戲按鈕');
      const buttonText = await pageA.locator('.room-lobby__start-btn').textContent();
      console.log(`   📝 實際按鈕文字: "${buttonText}"`);
    }

    console.log('\n✅ 測試完成！請查看 test-screenshots 文件夾中的截圖。');
    console.log('   按任意鍵關閉瀏覽器...');

    // 等待用戶按鍵
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

  } catch (error) {
    console.error('\n❌ 測試過程中發生錯誤:');
    console.error(error);

    // 錯誤截圖
    await pageA.screenshot({ path: 'test-screenshots/error-player-a.png' }).catch(() => {});
    await pageB.screenshot({ path: 'test-screenshots/error-player-b.png' }).catch(() => {});
  } finally {
    await browser.close();
    console.log('\n👋 瀏覽器已關閉');
  }
}

// 創建截圖目錄
if (!fs.existsSync('test-screenshots')) {
  fs.mkdirSync('test-screenshots');
}

// 運行測試
runManualTest().catch(console.error);
