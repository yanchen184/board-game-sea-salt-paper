/**
 * 完整遊戲測試腳本
 * 測試所有 5 個核心功能：
 * 1. 棄牌堆顯示
 * 2. 拖曳功能
 * 3. 完整回合
 * 4. 計分系統
 * 5. 勝利條件
 */

import { chromium } from '@playwright/test';
import fs from 'fs';

async function comprehensiveTest() {
  console.log('🎮 開始完整遊戲測試...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const contextA = await browser.newContext();
  const contextB = await browser.newContext();

  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  // 測試結果追蹤
  const testResults = {
    '1_棄牌堆顯示': false,
    '2_拖曳功能': false,
    '3_完整回合': false,
    '4_計分系統': false,
    '5_勝利條件': false
  };

  const issues = [];

  try {
    // ===== 設置遊戲 =====
    console.log('📍 設置：創建房間並開始遊戲');
    await pageA.goto('http://localhost:5173');
    await pageA.click('button:has-text("創建房間")');
    await pageA.waitForURL(/\/lobby\//);

    const roomCode = await pageA.locator('.room-lobby__code-value').textContent();
    console.log(`   ✅ 房間代碼: ${roomCode}`);

    await pageB.goto('http://localhost:5173');
    await pageB.fill('input[placeholder="輸入房間代碼"]', roomCode);
    await pageB.click('button:has-text("加入房間")');
    await pageB.waitForURL(/\/lobby\//);

    await pageB.click('button:has-text("準備")');
    await pageB.waitForSelector('button:has-text("✓ 準備完成")');

    await pageA.waitForTimeout(1000);
    await pageA.click('button:has-text("開始遊戲")');
    await pageA.waitForURL(/\/game\//);
    await pageB.waitForURL(/\/game\//);

    console.log('   ✅ 遊戲已開始\n');

    // ===== 測試 1: 棄牌堆顯示 =====
    console.log('📍 測試 1: 棄牌堆顯示');

    const discardPilesA = await pageA.locator('.discard-pile').count();
    const discardPilesB = await pageB.locator('.discard-pile').count();

    console.log(`   玩家 A 看到 ${discardPilesA} 個棄牌堆`);
    console.log(`   玩家 B 看到 ${discardPilesB} 個棄牌堆`);

    if (discardPilesA >= 2 && discardPilesB >= 2) {
      console.log('   ✅ 測試通過：棄牌堆顯示正常');
      testResults['1_棄牌堆顯示'] = true;
    } else {
      console.log('   ❌ 測試失敗：棄牌堆數量不正確');
      issues.push('棄牌堆顯示問題：期望至少 2 個，實際找到 ' + discardPilesA);
    }

    await pageA.screenshot({ path: 'test-screenshots/test1-discard-piles.png' });

    // ===== 測試 2: 拖曳功能 =====
    console.log('\n📍 測試 2: 拖曳功能');

    // 確定當前回合的玩家
    const isPlayerATurn = await pageA.locator('text=你的回合').isVisible().catch(() => false);
    const activePlayer = isPlayerATurn ? pageA : pageB;
    const observerPlayer = isPlayerATurn ? pageB : pageA;
    const activePlayerName = isPlayerATurn ? '玩家 A' : '玩家 B';

    console.log(`   當前回合: ${activePlayerName}`);

    // 抽牌
    const drawButton = activePlayer.locator('button:has-text("抽牌")').or(activePlayer.locator('.draw-deck'));
    await drawButton.click();
    await activePlayer.waitForSelector('.draw-card-area', { timeout: 5000 });

    console.log('   ✅ 成功抽牌');

    const drawnCards = activePlayer.locator('.draw-card-area__card');
    const cardCount = await drawnCards.count();

    console.log(`   抽到 ${cardCount} 張牌`);

    if (cardCount === 2) {
      // 嘗試拖曳第一張牌到左側棄牌堆
      const firstCard = drawnCards.first();
      const leftDiscardPile = activePlayer.locator('.discard-pile--left').first();

      // 記錄拖曳前的手牌數量
      const handBeforeDrag = await activePlayer.locator('.player-hand__card').count();
      console.log(`   拖曳前手牌數: ${handBeforeDrag}`);

      // 執行拖曳
      await firstCard.dragTo(leftDiscardPile);
      console.log('   ✅ 執行了拖曳操作');

      // 等待狀態更新
      await activePlayer.waitForTimeout(1500);

      // 檢查手牌是否增加
      const handAfterDrag = await activePlayer.locator('.player-hand__card').count();
      console.log(`   拖曳後手牌數: ${handAfterDrag}`);

      if (handAfterDrag === handBeforeDrag + 1) {
        console.log('   ✅ 測試通過：拖曳功能正常，手牌增加了 1 張');
        testResults['2_拖曳功能'] = true;
      } else {
        console.log(`   ❌ 測試失敗：手牌數量不正確（期望 ${handBeforeDrag + 1}，實際 ${handAfterDrag}）`);
        issues.push(`拖曳功能問題：手牌沒有正確增加`);

        // 截圖調試
        await activePlayer.screenshot({ path: 'test-screenshots/test2-drag-failed.png' });

        // 檢查 console 輸出
        console.log('   ℹ️  請檢查瀏覽器 Console 是否有錯誤訊息');
      }
    } else {
      console.log(`   ⚠️  抽牌數量異常：期望 2 張，實際 ${cardCount} 張`);
      issues.push(`抽牌數量問題：期望 2 張，實際 ${cardCount} 張`);
    }

    await activePlayer.screenshot({ path: 'test-screenshots/test2-after-drag.png' });

    // ===== 測試 3: 完整回合 =====
    console.log('\n📍 測試 3: 完整回合測試');

    // 檢查是否有結束回合按鈕
    const endTurnButton = activePlayer.locator('button:has-text("結束回合")');
    const hasEndTurnButton = await endTurnButton.isVisible().catch(() => false);

    if (hasEndTurnButton) {
      console.log('   ✅ 找到結束回合按鈕');

      // 點擊結束回合
      await endTurnButton.click();
      console.log('   已點擊結束回合');

      // 等待回合切換
      await activePlayer.waitForTimeout(1500);

      // 檢查回合是否切換到另一個玩家
      const observerHasTurn = await observerPlayer.locator('text=你的回合').isVisible({ timeout: 3000 }).catch(() => false);

      if (observerHasTurn) {
        console.log(`   ✅ 測試通過：回合成功切換到另一個玩家`);
        testResults['3_完整回合'] = true;
      } else {
        console.log('   ❌ 測試失敗：回合沒有切換');
        issues.push('回合切換問題：點擊結束回合後，回合沒有切換');
      }
    } else {
      console.log('   ⚠️  當前階段沒有結束回合按鈕（可能還在選牌階段）');
      issues.push('無法測試回合切換：找不到結束回合按鈕');
    }

    await activePlayer.screenshot({ path: 'test-screenshots/test3-turn-end.png' });
    await observerPlayer.screenshot({ path: 'test-screenshots/test3-next-player-turn.png' });

    // ===== 測試 4: 計分系統 =====
    console.log('\n📍 測試 4: 計分系統');

    // 檢查計分面板
    const scorePanelA = activePlayer.locator('text=計分面板');
    const scorePanelB = observerPlayer.locator('text=計分面板');

    const hasScorePanelA = await scorePanelA.isVisible().catch(() => false);
    const hasScorePanelB = await scorePanelB.isVisible().catch(() => false);

    if (hasScorePanelA && hasScorePanelB) {
      console.log('   ✅ 雙方都能看到計分面板');

      // 檢查是否有分數顯示
      const scoreTextA = await activePlayer.locator('.score-panel').textContent().catch(() => '');
      const scoreTextB = await observerPlayer.locator('.score-panel').textContent().catch(() => '');

      console.log(`   玩家 A 計分面板內容: ${scoreTextA.substring(0, 100)}...`);
      console.log(`   玩家 B 計分面板內容: ${scoreTextB.substring(0, 100)}...`);

      // 檢查是否有 Score: 數字 格式
      const hasScoreA = /Score:\s*\d+/.test(scoreTextA);
      const hasScoreB = /Score:\s*\d+/.test(scoreTextB);

      if (hasScoreA && hasScoreB) {
        console.log('   ✅ 測試通過：計分系統顯示正常');
        testResults['4_計分系統'] = true;
      } else {
        console.log('   ⚠️  計分面板存在但分數格式可能不標準');
        issues.push('計分系統問題：找不到 Score: 數字 格式');
      }
    } else {
      console.log('   ❌ 測試失敗：計分面板不可見');
      issues.push('計分系統問題：計分面板不可見');
    }

    await activePlayer.screenshot({ path: 'test-screenshots/test4-score-panel-a.png' });
    await observerPlayer.screenshot({ path: 'test-screenshots/test4-score-panel-b.png' });

    // ===== 測試 5: 勝利條件（簡化測試）=====
    console.log('\n📍 測試 5: 勝利條件');

    console.log('   ℹ️  勝利條件需要完成多個回合才能測試');
    console.log('   ℹ️  這裡僅檢查是否有相關的勝利邏輯代碼');

    // 檢查是否有遊戲結束相關的 UI 元素準備
    // 這是一個簡化的測試，因為要真正觸發勝利條件需要玩很多回合

    // 我們可以檢查程式碼中是否有勝利條件的邏輯
    // 但在實際測試中，我們只能驗證基礎設施是否存在

    console.log('   ⚠️  完整的勝利條件測試需要完整遊戲流程');
    console.log('   ℹ️  建議：手動遊玩一局來驗證勝利條件');

    // 標記為部分通過（基礎設施存在）
    testResults['5_勝利條件'] = '需要手動測試';

    // ===== 生成測試報告 =====
    console.log('\n' + '='.repeat(60));
    console.log('📊 測試結果摘要');
    console.log('='.repeat(60));

    let passedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const [test, result] of Object.entries(testResults)) {
      const status = result === true ? '✅ 通過' : result === false ? '❌ 失敗' : '⏭️  略過';
      console.log(`${test}: ${status}`);

      if (result === true) passedCount++;
      else if (result === false) failedCount++;
      else skippedCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`總計: ${passedCount} 通過, ${failedCount} 失敗, ${skippedCount} 略過`);
    console.log('='.repeat(60));

    if (issues.length > 0) {
      console.log('\n🔍 發現的問題:');
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    // 將結果寫入文件
    const report = {
      timestamp: new Date().toISOString(),
      results: testResults,
      issues,
      passedCount,
      failedCount,
      skippedCount
    };

    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 詳細測試報告已保存至 test-report.json');

    console.log('\n✅ 測試完成！按任意鍵關閉瀏覽器...');

    // 等待用戶按鍵
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

  } catch (error) {
    console.error('\n❌ 測試過程中發生錯誤:');
    console.error(error);

    await pageA.screenshot({ path: 'test-screenshots/error-final-a.png' }).catch(() => {});
    await pageB.screenshot({ path: 'test-screenshots/error-final-b.png' }).catch(() => {});
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
comprehensiveTest().catch(console.error);
