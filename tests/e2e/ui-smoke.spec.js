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

  await vnBox.click();
  await vnBox.click();
  await vnBox.click();
  await vnBox.click();
  await vnBox.click();
  await vnBox.click();
  await expect(page.getByTestId('prologue-next')).toBeVisible();

  await page.getByTestId('prologue-next').click();
  await expect(page.getByTestId('heroine-select-screen')).toBeVisible();
  await expect(page.getByTestId('heroine-tab-hakima')).toBeVisible();
  await assertNoHorizontalScroll(page);

  await expect(page.getByTestId('heroine-tab-hakima')).toBeVisible();
  await expect(page.getByTestId('heroine-tab-mira')).toBeVisible();
  await expect(page.getByTestId('heroine-tab-dariya')).toBeVisible();
  await page.getByTestId('heroine-tab-hakima').click();
  await page.getByTestId('heroine-start').click();

  await expect(page.getByTestId('intro-screen')).toBeVisible();
  await page.getByTestId('options-open').click();
  await expect(page.getByTestId('options-modal')).toBeVisible();
  await page.getByTestId('options-close').click();
  await expect(page.getByTestId('options-modal')).toHaveCount(0);

  await page.getByTestId('intro-start').click();
  await expect(page.getByTestId('quiz-screen')).toBeVisible();
  await expect(page.getByTestId('quiz-choice')).toHaveCount(2);
  await assertNoHorizontalScroll(page);

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
