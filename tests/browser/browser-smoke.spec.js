const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('MadeInMaghribal Browser Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    // Open the local index.html with instant text speed for faster/reliable testing
    const filePath = 'file://' + path.resolve(__dirname, '../../public/index.html') + '?textSpeed=instant';
    await page.goto(filePath);
  });

  async function startFromTitle(page) {
    await page.locator('[data-action="title-start"]').click();
  }

  async function navigateToHeroineSelect(page) {
    await startFromTitle(page);
    await expect(page.locator('.opening-screen')).toBeVisible();
    await page.click('#game-viewport');
    await expect(page.locator('.heroine-select')).toBeVisible();
  }

  async function navigateToQuiz(page) {
    await navigateToHeroineSelect(page);
    await page.locator('.heroine-card[data-id="HAKIMA"]').click();
    await expect(page.locator('.vn-screen')).toBeVisible({ timeout: 10000 });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (await page.locator('.quiz-screen').count()) break;
      await page.click('#game-viewport');
      await page.waitForTimeout(100);
    }

    await expect(page.locator('.quiz-screen')).toBeVisible({ timeout: 5000 });
  }

  test('1. Title screen and navigation to main game', async ({ page }) => {
    // 1. Title Screen
    await expect(page.locator('.title-logo-image')).toHaveAttribute('alt', 'Made in Maghribal');
    
    // 2. To Opening
    await startFromTitle(page);
    await expect(page.locator('.opening-screen')).toBeVisible();
    await expect(page.locator('h2')).toContainText('プロローグ');

    // 3. To Heroine Select
    await page.click('#game-viewport');
    await expect(page.locator('.heroine-select')).toBeVisible();
    await expect(page.locator('h2')).toContainText('運命の相手は？');

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
    await navigateToQuiz(page);
    
    // Check Quiz Screen
    await expect(page.locator('.quiz-screen')).toBeVisible();
    await expect(page.locator('.quiz-order-card')).toBeVisible();
    await expect(page.locator('.quiz-order-label')).not.toBeEmpty();
    await expect(page.locator('[data-quiz-prompt]')).not.toBeEmpty();

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
    await navigateToQuiz(page);
    
    // Play 10 questions
    for (let i = 0; i < 10; i++) {
      await page.locator('.choice-card').first().click();
      // Wait for next question or transition
      if (i < 9) {
        // Wait for stamp to fade or next prompt
        await page.waitForTimeout(800); 
      }
    }

    // Result screen should appear
    await expect(page.locator('.result-screen')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.result-screen')).toContainText('第1期営業報告');
    await expect(page.locator('.result-screen')).toContainText('評価');
    await expect(page.locator('.btn-next')).toBeVisible();
  });

  test('4. Session persistence and resume after reload', async ({ page }) => {
    // 1. Navigate to Quiz
    await navigateToQuiz(page);
    
    // 2. Answer 3 questions
    for (let i = 0; i < 3; i++) {
      await page.locator('.choice-card').first().click();
      await page.waitForTimeout(800);
    }
    await expect(page.locator('[data-quiz-progress]')).toContainText('4 / 10');

    // 3. Reload page
    await page.reload();
    
    // 4. Resume from title continue.
    await expect(page.locator('[data-action="title-continue"]')).toBeVisible({ timeout: 5000 });
    await page.locator('[data-action="title-continue"]').click();
    await expect(page.locator('.quiz-screen')).toBeVisible({ timeout: 5000 });
    // Verify progress is maintained
    await expect(page.locator('[data-quiz-progress]')).toContainText('4 / 10');
  });
});
