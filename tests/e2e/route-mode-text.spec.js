import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
});

test('verify normal route text in hakima_5', async ({ page }) => {
  const STORAGE_KEY = "made_in_maghribal_save";
  const data = {
    version: "1.0",
    screen: 'EVENT',
    activeHeroineId: 'hakima',
    routeMode: 'normal',
    workshopState: { day: 1, sales: 0, reputation: 0, satisfaction: 0, activeHeroineId: 'hakima' },
    affection: { hakima: 5, mira: 0, dariya: 0 },
    seenEventIds: [],
    activeEvent: {
        id: "hakima_5",
        heroineId: "hakima",
        threshold: 5,
        title: "もう一度、隣に",
        speaker: "ハキマ",
        expression: "joy",
        text: "ナーディル、さっきの品選び……なんだかあんたが店を継いだばかりの頃を思い出したよ。一人前になろうと必死なのは、見てればわかる。……あの時より、ずっと頼もしくなったね。",
        routePages: {
          long_history: [
            "ナーディル、さっきの品選び……あんたが店を継いだ日のことを思い出したよ。",
            "あの頃からずっと、あんたの隣にいるけど……今じゃ、立派な店主だね。あたしも鼻が高いよ。"
          ]
        },
        stillImageId: "hakimaMorningVisit01"
    },
    isAudioEnabled: false
  };

  await page.addInitScript((arg) => {
    localStorage.setItem(arg.key, JSON.stringify(arg.data));
  }, { key: STORAGE_KEY, data });

  await page.goto('/');
  await page.getByTestId('start-continue').click();
  
  await expect(page.getByTestId('vn-box')).toContainText('店を継いだばかりの頃を思い出したよ');
});

test('verify long_history route text in hakima_5', async ({ page }) => {
  const STORAGE_KEY = "made_in_maghribal_save";
  const data = {
    version: "1.0",
    screen: 'EVENT',
    activeHeroineId: 'hakima',
    routeMode: 'long_history',
    workshopState: { day: 1, sales: 0, reputation: 0, satisfaction: 0, activeHeroineId: 'hakima' },
    affection: { hakima: 5, mira: 0, dariya: 0 },
    seenEventIds: [],
    activeEvent: {
        id: "hakima_5",
        heroineId: "hakima",
        threshold: 5,
        title: "もう一度、隣に",
        speaker: "ハキマ",
        expression: "joy",
        text: "ナーディル、さっきの品選び……なんだかあんたが店を継いだばかりの頃を思い出したよ。一人前になろうと必死なのは、見てればわかる。……あの時より、ずっと頼もしくなったね。",
        routePages: {
          long_history: [
            "ナーディル、さっきの品選び……あんたが店を継いだ日のことを思い出したよ。",
            "あの頃からずっと、あんたの隣にいるけど……今じゃ、立派な店主だね。あたしも鼻が高いよ。"
          ]
        },
        stillImageId: "hakimaMorningVisit01"
    },
    isAudioEnabled: false
  };

  await page.addInitScript((arg) => {
    localStorage.setItem(arg.key, JSON.stringify(arg.data));
  }, { key: STORAGE_KEY, data });

  await page.goto('/');
  await page.getByTestId('start-continue').click();
  
  await expect(page.getByTestId('vn-box')).toContainText('あんたが店を継いだ日のことを思い出したよ');
  await page.getByTestId('vn-box').click();
  await expect(page.getByTestId('vn-box')).toContainText('あの頃からずっと、あんたの隣にいるけど');
});
