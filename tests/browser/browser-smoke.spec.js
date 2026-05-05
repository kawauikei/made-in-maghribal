const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('MadeInMaghribal Browser Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    // Open the local index.html with instant text speed for faster/reliable testing
    const filePath = 'file://' + path.resolve(__dirname, '../../public/index.html') + '?textSpeed=instant';
    await page.goto(filePath);
  });

  test('1. Title screen and navigation to main game', async ({ page }) => {
    // 1. Title Screen
    await expect(page.locator('h1')).toContainText('Made in Maghribal');
    
    // 2. To Opening
    await page.click('#game-viewport');
    await expect(page.locator('.opening-screen')).toBeVisible();
    await expect(page.locator('h2')).toContainText('プロローグ');

    // 3. To Heroine Select
    await page.click('#game-viewport');
    await expect(page.locator('.heroine-select')).toBeVisible();
    await expect(page.locator('h2')).toContainText('営業パートナーを選択');

    // 4. Select Heroine
    const hakimaCard = page.locator('.heroine-card[data-id="HAKIMA"]');
    await expect(hakimaCard).toBeVisible();
    await hakimaCard.click();

    // 5. Main Game / Before Open
    await expect(page.locator('.vn-screen')).toBeVisible();
    await expect(page.locator('.speaker-name')).toContainText('ハキマ');
    await expect(page.locator('.message-text')).toContainText('営業がもうすぐ始まるわ');
  });

  test('2. Quiz interaction and result stamp', async ({ page }) => {
    // Skip to Quiz
    await page.click('#game-viewport'); // Title -> Opening
    await page.click('#game-viewport'); // Opening -> Heroine Select
    await page.locator('.heroine-card[data-id="HAKIMA"]').click(); // Select
    await page.click('#game-viewport'); // Before Open -> Quiz
    
    // Check Quiz Screen
    await expect(page.locator('.quiz-screen')).toBeVisible();
    await expect(page.locator('.quiz-order-card')).toBeVisible();
    await expect(page.locator('.quiz-order-label')).toContainText('お客さんの要望');

    // Rhythm Lane
    await expect(page.locator('.rhythm-lane-placeholder')).toBeVisible();

    // Choice Cards
    const choices = page.locator('.choice-card');
    await expect(choices).toHaveCount(2);

    const firstChoice = choices.first();
    await expect(firstChoice.locator('.item-icon')).toBeVisible();
    const iconSrc = await firstChoice.locator('.item-icon').getAttribute('src');
    expect(iconSrc).toMatch(/^images\/items\/IT_.*\.png$/);
    await expect(firstChoice.locator('.choice-name')).not.toBeEmpty();

    const itemId = await firstChoice.getAttribute('data-item-id');
    expect(itemId).toMatch(/^IT_/);

    // Answer Quiz
    await firstChoice.click();

    // Check Stamp
    const stamp = page.locator('.result-stamp');
    await expect(stamp).toBeVisible();
    const stampText = await stamp.locator('.stamp-main').innerText();
    expect(['正解', '不正解']).toContain(stampText);
    await expect(stamp).toContainText('スピード');
    await expect(stamp).toContainText('テンポ');
  });

  test('3. Full turn advancement to Result', async ({ page }) => {
    // Navigate to Quiz
    await page.click('#game-viewport'); // Title
    await page.click('#game-viewport'); // Opening
    await page.locator('.heroine-card[data-id="HAKIMA"]').click(); // Select
    await page.click('#game-viewport'); // Before Open
    
    // Play 10 questions
    for (let i = 0; i < 10; i++) {
      await page.locator('.choice-card').first().click();
      // Wait for next question or transition
      if (i < 9) {
        // Wait for stamp to fade or next prompt
        await page.waitForTimeout(150); 
      }
    }

    // Result screen should appear
    await expect(page.locator('.result-screen')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.result-card h2')).toContainText('1日目の営業結果');
    await expect(page.locator('.result-card')).toContainText('評価:');
    await expect(page.locator('.btn-next')).toBeVisible();
  });
});
