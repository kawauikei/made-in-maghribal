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
  await page.getByTestId('backlog-close').click();
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
  await page.getByTestId('backlog-close').click();
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
