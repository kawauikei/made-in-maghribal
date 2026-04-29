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

const expectStableBoxHeight = async (locator, expectedHeight) => {
  const box = await locator.boundingBox();
  expect(Math.round(box.height)).toBe(expectedHeight);
};

const setRangeValue = async (page, locator, value) => {
  await locator.focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < value; i++) {
    await page.keyboard.press('ArrowRight');
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

test('normal route smoke flow', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  await expect(page.getByTestId('start-screen')).toBeVisible();
  await assertNoHorizontalScroll(page);

  await page.getByTestId('start-new-game').click();
  await expect(page.getByTestId('prologue-screen')).toBeVisible();
  await assertNoHorizontalScroll(page);

  const vnBox = page.getByTestId('vn-box');
  await expect(vnBox).toBeVisible();
  await expect(page.getByTestId('prologue-next')).toHaveCount(0);
  const initialBox = await vnBox.boundingBox();
  const vnBoxHeight = Math.round(initialBox.height);
  expect(vnBoxHeight).toBeGreaterThan(0);

  await vnBox.click();
  await expectStableBoxHeight(vnBox, vnBoxHeight);

  await vnBox.click();
  await vnBox.click();
  await expectStableBoxHeight(vnBox, vnBoxHeight);

  await vnBox.click();
  await vnBox.click();
  await expectStableBoxHeight(vnBox, vnBoxHeight);

  await vnBox.click();
  await expect(page.getByTestId('prologue-next')).toBeVisible();
  await assertNoHorizontalScroll(page);

  await page.getByTestId('prologue-next').click();
  await expect(page.getByTestId('heroine-select-screen')).toBeVisible();
  await expect(page.getByTestId('heroine-tab-hakima')).toBeVisible();
  await expect(page.getByTestId('heroine-tab-mira')).toBeVisible();
  await expect(page.getByTestId('heroine-tab-dariya')).toBeVisible();
  await assertNoHorizontalScroll(page);

  await page.getByTestId('heroine-tab-hakima').click();
  await page.getByTestId('heroine-start').click();

  await expect(page.getByTestId('intro-screen')).toBeVisible();
  await page.getByTestId('vn-box').click();
  await page.getByTestId('options-open').click();
  await expect(page.getByTestId('options-modal')).toBeVisible();
  await page.getByTestId('backlog-open').click();
  await expect(page.getByTestId('backlog-modal')).toBeVisible();
  await expect(page.getByTestId('backlog-entry')).toHaveCount(4);
  await expect(page.getByTestId('backlog-modal')).toContainText('PROLOGUE');
  await expect(page.getByTestId('backlog-modal')).toContainText('INTRO');
  await page.getByTestId('backlog-back').click();
  await expect(page.getByTestId('options-modal')).toBeVisible();
  await page.getByTestId('options-close').click();
  await expect(page.getByTestId('options-modal')).toHaveCount(0);

  await page.getByTestId('intro-start').click();
  await expect(page.getByTestId('quiz-screen')).toBeVisible();
  await expect(page.getByTestId('quiz-choice')).toHaveCount(2);
  await assertNoHorizontalScroll(page);

  expect(consoleErrors).toEqual([]);
});

test('route mode selection and resume flow', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  await expect(page.getByTestId('start-screen')).toBeVisible();
  await expect(page.getByTestId('route-mode-normal')).toHaveAttribute('aria-pressed', 'true');

  await page.getByTestId('route-mode-long_history').click();
  await expect(page.getByTestId('route-mode-long_history')).toHaveAttribute('aria-pressed', 'true');

  await page.getByTestId('start-new-game').click();
  await expect(page.getByTestId('prologue-screen')).toBeVisible();
  await expect(page.getByTestId('route-mode-badge')).toHaveAttribute('data-route-mode', 'long_history');

  const vnBox = page.getByTestId('vn-box');
  for (let i = 0; i < 6; i++) {
    await vnBox.click();
    await page.waitForTimeout(100);
  }

  await expect(page.getByTestId('prologue-next')).toBeVisible({ timeout: 15000 });
  await page.getByTestId('prologue-next').click();
  await expect(page.getByTestId('heroine-select-screen')).toBeVisible();

  await page.getByTestId('options-open').click();
  await page.getByTestId('backlog-open').click();
  await expect(page.getByTestId('backlog-modal')).toBeVisible();
  await expect(page.getByTestId('backlog-entry').first()).toHaveAttribute('data-route-mode', 'long_history');
  await expect(page.getByTestId('backlog-modal')).toContainText('過去から続く縁');
  await page.getByTestId('backlog-back').click();
  await page.getByTestId('options-close').click();

  await page.reload();
  await expect(page.getByTestId('start-screen')).toBeVisible();
  await expect(page.getByTestId('route-mode-long_history')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('start-continue')).toBeVisible();

  await page.getByTestId('start-continue').click();
  await expect(page.getByTestId('heroine-select-screen')).toBeVisible();
  await expect(page.getByTestId('route-mode-badge')).toHaveAttribute('data-route-mode', 'long_history');

  expect(consoleErrors).toEqual([]);
});

test('visual asset test smoke flow', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  await expect(page.getByTestId('start-screen')).toBeVisible();
  await page.getByTestId('visual-test-open').click();
  await expect(page.getByTestId('visual-test-screen')).toBeVisible();

  await page.getByTestId('visual-test-tab-bg').click();
  await expect(page.getByTestId('visual-test-thumbnail').first()).toBeVisible();
  await assertNoHorizontalScroll(page);

  await page.getByTestId('visual-test-tab-still').click();
  await expect(page.getByTestId('visual-test-thumbnail')).toHaveCount(14);
  await page.getByTestId('visual-test-thumbnail').nth(13).click();
  await assertNoHorizontalScroll(page);

  expect(consoleErrors).toEqual([]);
});

test('text speed option persists and instant mode reveals VN text immediately', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  await page.getByTestId('start-new-game').click();
  await expect(page.getByTestId('prologue-screen')).toBeVisible();

  await page.getByTestId('options-open').click();
  await expect(page.getByTestId('options-modal')).toBeVisible();
  await page.getByTestId('text-speed-instant').click();
  await expect(page.getByTestId('text-speed-instant')).toHaveAttribute('aria-pressed', 'true');

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('made_in_maghribal_save')));
  expect(saved.textSpeed).toBe('instant');

  await page.getByTestId('options-close').click();
  await expect(page.getByTestId('options-modal')).toHaveCount(0);

  await page.reload();
  await expect(page.getByTestId('start-screen')).toBeVisible();
  await page.getByTestId('start-continue').click();
  await expect(page.getByTestId('prologue-screen')).toBeVisible();
  await expect(page.getByTestId('vn-box')).toContainText('NEXT', { timeout: 2000 });

  expect(consoleErrors).toEqual([]);
});

test('audio volume options persist and affect live audio objects', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  await page.getByTestId('start-new-game').click();
  await expect(page.getByTestId('prologue-screen')).toBeVisible();

  const prologueBox = page.getByTestId('vn-box');
  for (let i = 0; i < 6; i++) {
    await prologueBox.click();
    await page.waitForTimeout(100);
  }

  await expect(page.getByTestId('prologue-next')).toBeVisible({ timeout: 15000 });
  await page.getByTestId('prologue-next').click();
  await page.getByTestId('heroine-tab-hakima').click();
  await page.getByTestId('heroine-start').click();
  await expect(page.getByTestId('intro-screen')).toBeVisible();

  await expect(page.getByTestId('options-open')).toBeVisible();
  await page.getByTestId('options-open').click();
  await expect(page.getByTestId('options-modal')).toBeVisible();

  await setRangeValue(page, page.getByTestId('bgm-volume-slider'), 25);
  await setRangeValue(page, page.getByTestId('se-volume-slider'), 60);
  await expect(page.getByTestId('bgm-volume-slider')).toHaveValue('25');
  await expect(page.getByTestId('se-volume-slider')).toHaveValue('60');
  await page.waitForTimeout(150);

  const savedAfterAdjust = await page.evaluate(() => JSON.parse(localStorage.getItem('made_in_maghribal_save')));
  expect(savedAfterAdjust.bgmVolume).toBeCloseTo(0.25, 2);
  expect(savedAfterAdjust.seVolume).toBeCloseTo(0.6, 2);

  const liveBeforeToggle = await page.evaluate(() => ({
    bgmVolume: window.__madeInMaghribalAudioEngine?.audio?.volume,
    seVolume: window.__madeInMaghribalAudioEngine?.seVolume
  }));
  expect(liveBeforeToggle.bgmVolume).toBeCloseTo(0.25, 2);
  expect(liveBeforeToggle.seVolume).toBeCloseTo(0.6, 2);

  await page.getByTestId('options-modal').getByRole('button', { name: 'OFF' }).nth(1).click();
  await page.getByTestId('options-close').click();
  await expect(page.getByTestId('options-modal')).toHaveCount(0);

  const liveAfterSfx = await page.evaluate(() => ({
    bgmVolume: window.__madeInMaghribalAudioEngine?.audio?.volume,
    seVolume: window.__madeInMaghribalAudioEngine?.seVolume,
    lastSfxVolume: window.__madeInMaghribalAudioEngine?.lastSfx?.volume
  }));
  expect(liveAfterSfx.bgmVolume).toBeCloseTo(0.25, 2);
  expect(liveAfterSfx.seVolume).toBeCloseTo(0.6, 2);
  expect(liveAfterSfx.lastSfxVolume).toBeCloseTo(0.72, 2);

  await page.reload();
  await expect(page.getByTestId('start-screen')).toBeVisible();
  await page.getByTestId('start-continue').click();
  await expect(page.getByTestId('intro-screen')).toBeVisible();
  await page.getByTestId('options-open').click();
  await expect(page.getByTestId('options-modal')).toBeVisible();
  await expect(page.getByTestId('bgm-volume-slider')).toHaveValue('25');
  await expect(page.getByTestId('se-volume-slider')).toHaveValue('60');

  expect(consoleErrors).toEqual([]);
});

test('help opens from options and returns to settings', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  await page.getByTestId('start-new-game').click();
  await expect(page.getByTestId('prologue-screen')).toBeVisible();

  await page.getByTestId('options-open').click();
  await expect(page.getByTestId('options-modal')).toBeVisible();
  await expect(page.getByTestId('help-open')).toBeVisible();

  await page.getByTestId('help-open').click();
  await expect(page.getByTestId('help-modal')).toBeVisible();
  await expect(page.getByTestId('help-modal')).toContainText('遊び方');
  await expect(page.getByTestId('help-modal')).toContainText('お客さんの依頼を読み');

  await page.getByTestId('help-back').click();
  await expect(page.getByTestId('options-modal')).toBeVisible();
  await expect(page.getByTestId('text-speed-normal')).toBeVisible();
  await expect(page.getByTestId('bgm-volume-slider')).toBeVisible();
  await expect(page.getByTestId('se-volume-slider')).toBeVisible();
  await expect(page.getByTestId('instant-unread-toggle')).toBeVisible();

  await page.getByTestId('options-close').click();
  await expect(page.getByTestId('options-modal')).toHaveCount(0);

  expect(consoleErrors).toEqual([]);
});

test('instant unread toggle shows VN text immediately', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);

  await page.getByTestId('start-new-game').click();
  await expect(page.getByTestId('prologue-screen')).toBeVisible();

  await page.getByTestId('options-open').click();
  await expect(page.getByTestId('options-modal')).toBeVisible();
  await page.getByTestId('instant-unread-toggle').click();
  await expect(page.getByTestId('instant-unread-toggle')).toHaveAttribute('aria-pressed', 'true');

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('made_in_maghribal_save')));
  expect(saved.instantUnreadText).toBe(true);

  await page.getByTestId('options-close').click();
  await expect(page.getByTestId('options-modal')).toHaveCount(0);

  await page.waitForTimeout(200);
  await expect(page.getByTestId('vn-box')).toContainText('NEXT');

  await page.reload();
  await expect(page.getByTestId('start-screen')).toBeVisible();
  await page.getByTestId('start-continue').click();
  await expect(page.getByTestId('prologue-screen')).toBeVisible();
  await page.getByTestId('options-open').click();
  await expect(page.getByTestId('options-modal')).toBeVisible();
  await expect(page.getByTestId('instant-unread-toggle')).toHaveAttribute('aria-pressed', 'true');

  expect(consoleErrors).toEqual([]);
});

test('options open from start screen', async ({ page }) => {
  const consoleErrors = expectNoConsoleErrors(page);
  await expect(page.getByTestId('start-screen')).toBeVisible();
  await page.getByTestId('start-options').click();
  await expect(page.getByTestId('options-modal')).toBeVisible();
  await page.getByTestId('modal-x-close').click();
  await expect(page.getByTestId('options-modal')).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
});

test('backlog opens from hud and start screen', async ({ page }) => {
  await expect(page.getByTestId('start-screen')).toBeVisible();
  await page.getByTestId('backlog-hud-open').click();
  await expect(page.getByTestId('backlog-modal')).toBeVisible();
  await page.getByTestId('backlog-close').click();
  await expect(page.getByTestId('backlog-modal')).toHaveCount(0);
});

test('sound test sound toggle works', async ({ page }) => {
  await page.getByTestId('sound-test-open').click();
  await expect(page.getByTestId('sound-test-modal')).toBeVisible();
  
  // Force audio OFF via options
  await page.getByTestId('sound-test-close').click();
  await page.getByTestId('start-options').click();
  await page.getByTestId('audio-enabled-toggle').click();
  await page.getByTestId('options-close').click();
  
  await page.getByTestId('sound-test-open').click();
  await expect(page.getByText('音声がOFFのため、再生されません。')).toBeVisible();
  await page.getByRole('button', { name: '音をONにする' }).click();
  await expect(page.getByText('音声がOFFのため、再生されません。')).toHaveCount(0);
  
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('made_in_maghribal_save')));
  expect(saved.audioEnabled).toBe(true);
});
