import { expect, test } from '@playwright/test';

const assertNoHorizontalScroll = async (page) => {
  const hasHorizontalScroll = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return doc.scrollWidth > doc.clientWidth + 1 || body.scrollWidth > body.clientWidth + 1;
  });
  expect(hasHorizontalScroll).toBe(false);
};

const expectNoConsoleErrors = (page) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  return errors;
};

const checkMojibake = async (page) => {
  const forbidden = ['縺', '譏', '紱定', '笞', '莉', '螟', '讌', '邨', '驥', '繝'];
  const content = await page.textContent('body');
  for (const char of forbidden) {
    expect(content).not.toContain(char);
  }
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
});

test('Sound Test smoke flow', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  await expect(page.getByTestId('start-screen')).toBeVisible();
  await page.getByTestId('sound-test-open').click();
  await expect(page.getByTestId('sound-test-modal')).toBeVisible();
  
  // Check for correct title (no mojibake)
  await expect(page.getByText('サウンド設定 Test')).toBeVisible();
  await checkMojibake(page);

  // Check for sections
  await expect(page.getByText('BGM (Music)')).toBeVisible();
  await expect(page.getByText('SFX (サウンド設定 Effects)')).toBeVisible();

  // Close
  await page.getByTestId('sound-test-close').click();
  await expect(page.getByTestId('sound-test-modal')).toHaveCount(0);
  await expect(page.getByTestId('start-screen')).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test('Visual Test integrity flow', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  await expect(page.getByTestId('start-screen')).toBeVisible();
  await page.getByTestId('visual-test-open').click();
  await expect(page.getByTestId('visual-test-screen')).toBeVisible();
  
  await expect(page.getByTestId('visual-test-back')).toBeVisible();
  await assertNoHorizontalScroll(page);

  // Check image loading
  const images = page.locator('img');
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    // Basic visibility check
    await expect(images.nth(i)).toBeVisible();
  }

  await page.getByTestId('visual-test-back').click();
  await expect(page.getByTestId('start-screen')).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test('Backlog functional flow', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  await page.getByTestId('start-new-game').click();
  const vnBox = page.getByTestId('vn-box');
  
  // Click multiple times to finish prologue (3 pages)
  for (let i = 0; i < 6; i++) {
    await vnBox.click();
    await page.waitForTimeout(100);
  }
  
  // Progress to INTRO to ensure we have enough backlog
  await expect(page.getByTestId('prologue-next')).toBeVisible({ timeout: 15000 });
  await page.getByTestId('prologue-next').click();
  await page.getByTestId('heroine-tab-hakima').click();
  await page.getByTestId('heroine-start').click();

  await expect(page.getByTestId('intro-screen')).toBeVisible();
  await page.getByTestId('options-open').click();
  await page.getByTestId('backlog-open').click();
  
  await expect(page.getByTestId('backlog-modal')).toBeVisible();
  await expect(page.getByTestId('backlog-entry')).not.toHaveCount(0);
  await expect(page.getByTestId('backlog-modal')).toContainText('現在から育つ縁');
  
  // Check for content
  await expect(page.getByTestId('backlog-modal')).toContainText('砂漠の街マグリバル');
  await checkMojibake(page);

  await page.getByTestId('backlog-close').click();
  await page.getByTestId('options-close').click();
  await expect(page.getByTestId('intro-screen')).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test('Backlog opens at latest entry', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  await page.addInitScript(() => {
    localStorage.setItem('made_in_maghribal_save', JSON.stringify({
      version: '1.0',
      screen: 'INTRO',
      activeHeroineId: 'hakima',
      routeMode: 'normal',
      workshopState: { day: 1, sales: 0, reputation: 0, satisfaction: 0, activeHeroineId: 'hakima' },
      affection: { hakima: 10, mira: 0, dariya: 0 },
      seenEventIds: [],
      activeEvent: null,
      vnBacklog: Array.from({ length: 18 }, (_, i) => ({
        speaker: i % 2 === 0 ? 'Narration' : 'Hakima',
        text: `Log ${i + 1}`,
        screen: 'INTRO',
        heroineId: 'hakima',
        routeMode: i % 2 === 0 ? 'normal' : 'long_history',
        sequence: i + 1
      })),
      isAudioEnabled: false
    }));
  });

  await page.reload();
  await page.getByTestId('start-continue').click();
  await expect(page.getByTestId('intro-screen')).toBeVisible();
  await page.getByTestId('options-open').click();
  await page.getByTestId('backlog-open').click();

  await expect(page.getByTestId('backlog-modal')).toBeVisible();
  await expect(page.getByTestId('backlog-entry').first()).toContainText('#19');
  await expect(page.getByTestId('backlog-modal')).toContainText('過去から続く縁');

  const scrollTop = await page.getByTestId('backlog-scroll').evaluate(el => el.scrollTop);
  expect(scrollTop).toBeGreaterThan(0);
  expect(consoleErrors).toEqual([]);
});

test('Memories screen flow', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  // Test empty state
  await page.getByTestId('memories-open').click();
  await expect(page.getByTestId('memories-screen')).toBeVisible();
  await expect(page.getByText('まだ見返したい記憶はありません。')).toBeVisible();
  await checkMojibake(page);
  
  await page.getByTestId('memories-back').click();
  await expect(page.getByTestId('start-screen')).toBeVisible();

  // Test with injected data
  await page.evaluate(() => {
    localStorage.setItem('made_in_maghribal_save', JSON.stringify({
      seenEventIds: ['hakima_5'],
      screen: 'START',
      activeHeroineId: 'hakima',
      workshopState: { day: 1, reputation: 10, sales: 0, satisfaction: 10 },
      affection: { hakima: 20, mira: 0, dariya: 0 }
    }));
  });
  await page.reload();

  await page.getByTestId('memories-open').click();
  await expect(page.getByText('ハキマとの思い出')).toBeVisible();
  // In our data, hakima_5 title is "もう一度、隣に"
  await expect(page.getByTestId('memories-screen')).toContainText('もう一度、隣に');

  await page.getByTestId('memories-back').click();
  expect(consoleErrors).toEqual([]);
});

test('New assets smoke check', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);
  
  // Check all images in Visual Test (Stills)
  await page.getByTestId('visual-test-open').click();
  await page.getByTestId('visual-test-tab-still').click();
  
  const thumbnails = page.getByTestId('visual-test-thumbnail');
  const count = await thumbnails.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < Math.min(count, 3); i++) {
    await thumbnails.nth(i).click();
    // Check if main image is visible (it's the only large img in the view)
    const mainImg = page.locator('img[alt]').nth(0); 
    await expect(mainImg).toBeVisible();
  }

  expect(consoleErrors).toEqual([]);
});
