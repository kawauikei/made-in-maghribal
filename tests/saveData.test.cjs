/**
 * Regression tests for Save / Continue System
 */
const assert = require('assert');

// Mock localStorage
const mockStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};
global.localStorage = mockStorage;

const {
  createDefaultSaveData,
  normalizeSaveData,
  loadSaveData,
  saveGameData,
  hasSaveData,
  clearSaveData,
  STORAGE_KEY
} = require('../src/game/saveData.js');

console.log("\n--- Made in Maghribal: Save Logic Tests ---");

try {
  // Test: createDefaultSaveData
  const def = createDefaultSaveData();
  assert.strictEqual(def.screen, 'START');
  assert.strictEqual(def.workshopState.day, 1);
  assert.ok(def.affection.hakima === 0);
  assert.strictEqual(def.routeMode, 'normal');
  assert.strictEqual(def.textSpeed, 'normal');
  assert.strictEqual(def.instantUnreadText, false);
  assert.strictEqual(def.bgmVolume, 0.8);
  assert.strictEqual(def.seVolume, 0.8);
  assert.deepStrictEqual(def.vnBacklog, []);
  console.log("PASSED: createDefaultSaveData");

  // Test: normalizeSaveData (Clamping affection + routeMode fallback)
  const messy = {
    affection: {
      hakima: 150,
      mira: -10,
      nader: 50
    },
    screen: 'QUIZ',
    routeMode: 'invalid-mode',
    textSpeed: 'warp',
    instantUnreadText: 'yes',
    bgmVolume: 1.2,
    seVolume: -0.1
  };
  const norm = normalizeSaveData(messy);
  assert.strictEqual(norm.affection.hakima, 100);
  assert.strictEqual(norm.affection.mira, 0);
  assert.strictEqual(norm.affection.nader, undefined);
  assert.strictEqual(norm.screen, 'INTRO');
  assert.strictEqual(norm.routeMode, 'normal');
  assert.strictEqual(norm.textSpeed, 'normal');
  assert.strictEqual(norm.instantUnreadText, false);
  assert.strictEqual(norm.bgmVolume, 1);
  assert.strictEqual(norm.seVolume, 0);
  console.log("PASSED: normalizeSaveData (Clamping & Filtering)");

  const validTextSpeed = normalizeSaveData({
    textSpeed: 'instant'
  });
  assert.strictEqual(validTextSpeed.textSpeed, 'instant');
  console.log("PASSED: textSpeed normalization");

  const validInstantUnread = normalizeSaveData({
    instantUnreadText: true
  });
  assert.strictEqual(validInstantUnread.instantUnreadText, true);
  console.log("PASSED: instantUnreadText normalization");

  // Test: vnBacklog normalization keeps valid entries and rejects invalid values
  const invalidBacklog = normalizeSaveData({
    vnBacklog: 'broken'
  });
  assert.deepStrictEqual(invalidBacklog.vnBacklog, []);

  const backlogEntries = Array.from({ length: 120 }, (_, i) => ({
    speaker: i % 2 === 0 ? 'Narrator' : 'Hakima',
    text: `Text ${i}`,
    screen: 'INTRO',
    heroineId: 'hakima',
    routeMode: i % 2 === 0 ? 'normal' : 'long_history',
    sequence: i + 1
  }));
  backlogEntries.splice(12, 0, { speaker: 'Broken', text: null });
  const backlogNorm = normalizeSaveData({
    vnBacklog: backlogEntries
  });
  assert.strictEqual(backlogNorm.vnBacklog.length, 100);
  assert.strictEqual(backlogNorm.vnBacklog[0].text, 'Text 20');
  assert.strictEqual(backlogNorm.vnBacklog[99].text, 'Text 119');
  assert.strictEqual(backlogNorm.vnBacklog[1].routeMode, 'long_history');
  console.log("PASSED: vnBacklog normalization, invalid handling, and 100-entry cap");

  // Test: legacy save without routeMode defaults to normal
  const legacy = normalizeSaveData({
    screen: 'RESULT',
    activeHeroineId: 'mira',
    workshopState: { day: 3, reputation: 12, sales: 5, satisfaction: 8 },
    affection: { hakima: 5, mira: 7, dariya: 9 },
    seenEventIds: ['mira_1']
  });
  assert.strictEqual(legacy.routeMode, 'normal');
  assert.strictEqual(legacy.activeHeroineId, 'mira');
  console.log("PASSED: legacy save compatibility");

  // Test: save / has / load / clear
  mockStorage.clear();
  assert.strictEqual(hasSaveData(), false);

  const myData = createDefaultSaveData();
  myData.workshopState.day = 5;
  myData.affection.hakima = 10;
  myData.routeMode = 'long_history';
  myData.textSpeed = 'fast';
  myData.instantUnreadText = true;
  myData.bgmVolume = 0.35;
  myData.seVolume = 0.62;
  myData.vnBacklog = [{
    speaker: 'Hakima',
    text: 'Saved backlog entry',
    screen: 'INTRO',
    heroineId: 'hakima',
    routeMode: 'long_history',
    sequence: 1
  }];

  saveGameData(myData);
  assert.strictEqual(hasSaveData(), true);

  const loaded = loadSaveData();
  assert.strictEqual(loaded.workshopState.day, 5);
  assert.strictEqual(loaded.affection.hakima, 10);
  assert.strictEqual(loaded.routeMode, 'long_history');
  assert.strictEqual(loaded.textSpeed, 'fast');
  assert.strictEqual(loaded.instantUnreadText, true);
  assert.strictEqual(loaded.bgmVolume, 0.35);
  assert.strictEqual(loaded.seVolume, 0.62);
  assert.strictEqual(loaded.vnBacklog.length, 1);
  assert.strictEqual(loaded.vnBacklog[0].routeMode, 'long_history');
  assert.strictEqual(loaded.vnBacklog[0].text, 'Saved backlog entry');
  console.log("PASSED: save/load/has cycle");

  // Test: old saves without vnBacklog default to an empty array
  const legacyBacklog = normalizeSaveData({
    screen: 'RESULT',
    activeHeroineId: 'mira',
    workshopState: { day: 3, reputation: 12, sales: 5, satisfaction: 8 },
    affection: { hakima: 5, mira: 7, dariya: 9 },
    seenEventIds: ['mira_1']
  });
  assert.deepStrictEqual(legacyBacklog.vnBacklog, []);
  assert.strictEqual(legacyBacklog.instantUnreadText, false);
  assert.strictEqual(legacyBacklog.bgmVolume, 0.8);
  assert.strictEqual(legacyBacklog.seVolume, 0.8);
  console.log("PASSED: legacy save vnBacklog default");

  clearSaveData();
  assert.strictEqual(hasSaveData(), false);
  assert.strictEqual(loadSaveData(), null);
  console.log("PASSED: clearSaveData");

  // Test: Corrupted JSON
  console.log("(Note: The following SyntaxError is expected for the negative test case)");
  mockStorage.setItem(STORAGE_KEY, "invalid json {");
  const corrupted = loadSaveData();
  assert.strictEqual(corrupted, null);
  console.log("PASSED: Corrupted JSON handling");

  console.log("\n--- All save logic tests completed successfully! ---");
} catch (err) {
  console.error("\nTEST FAILED:");
  console.error(err);
  process.exit(1);
}
