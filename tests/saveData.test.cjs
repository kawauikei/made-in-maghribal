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
  const originalError = console.error;
  console.error = () => {}; // Silence expected error log for testing
  
  mockStorage.setItem(STORAGE_KEY, "invalid json {");
  const corrupted = loadSaveData();
  
  console.error = originalError; // Restore
  assert.strictEqual(corrupted, null);
  console.log("PASSED: Corrupted JSON handling");

  // Test: version mismatch - old version normalizes to current version
  const oldVersion = normalizeSaveData({
    version: "0.9",
    screen: 'START'
  });
  assert.strictEqual(oldVersion.version, "1.0", 'Old version should normalize to current version');
  console.log("PASSED: version mismatch - old version normalizes to current");

  // Test: version mismatch - future version normalizes to current version
  const futureVersion = normalizeSaveData({
    version: "2.0",
    screen: 'START'
  });
  assert.strictEqual(futureVersion.version, "1.0", 'Future version should normalize to current version');
  console.log("PASSED: version mismatch - future version normalizes to current");

  // Test: unknown screen - currently preserved as-is (only QUIZ is specifically handled)
  const unknownScreen = normalizeSaveData({
    screen: 'UNKNOWN_SCREEN'
  });
  assert.strictEqual(unknownScreen.screen, 'UNKNOWN_SCREEN', 'Unknown screen is currently preserved (only QUIZ is handled)');
  console.log("PASSED: unknown screen preserved (current behavior - only QUIZ handled)");

  // Test: EVENT restore safety - screen EVENT with null activeEvent falls back to INTRO
  const eventWithNullActive = normalizeSaveData({
    screen: 'EVENT',
    activeEvent: null
  });
  assert.strictEqual(eventWithNullActive.screen, 'INTRO', 'EVENT screen with null activeEvent falls back to INTRO');
  assert.strictEqual(eventWithNullActive.activeEvent, null, 'activeEvent remains null');
  console.log("PASSED: EVENT restore with null activeEvent falls back to INTRO");

  // Test: EVENT restore safety - screen EVENT with valid activeEvent is preserved
  const eventWithValidActive = normalizeSaveData({
    screen: 'EVENT',
    activeEvent: { eventId: 'hakima_1', title: 'Test Event' }
  });
  assert.strictEqual(eventWithValidActive.screen, 'EVENT', 'EVENT screen with valid activeEvent is preserved');
  assert.deepStrictEqual(eventWithValidActive.activeEvent, { eventId: 'hakima_1', title: 'Test Event' }, 'activeEvent is preserved');
  console.log("PASSED: EVENT restore with valid activeEvent is preserved");

  // Test: EVENT restore safety - screen EVENT with invalid activeEvent (string) falls back to INTRO
  const eventWithStringActive = normalizeSaveData({
    screen: 'EVENT',
    activeEvent: 'invalid_string'
  });
  assert.strictEqual(eventWithStringActive.screen, 'INTRO', 'EVENT screen with string activeEvent falls back to INTRO');
  assert.strictEqual(eventWithStringActive.activeEvent, null, 'activeEvent is normalized to null');
  console.log("PASSED: EVENT restore with invalid activeEvent (string) falls back to INTRO");

  // Test: unknown heroineId fallback
  const unknownHeroine = normalizeSaveData({
    activeHeroineId: 'deleted_heroine'
  });
  assert.strictEqual(unknownHeroine.activeHeroineId, 'hakima', 'Unknown heroineId should fallback to hakima');
  console.log("PASSED: unknown heroineId fallback to hakima");

  // Test: invalid routeMode fallback
  const invalidRouteMode = normalizeSaveData({
    routeMode: 'future_route'
  });
  assert.strictEqual(invalidRouteMode.routeMode, 'normal', 'Invalid routeMode should fallback to normal');
  console.log("PASSED: invalid routeMode fallback to normal");

  // Test: affection schema missing - all heroines are initialized
  const missingAffection = normalizeSaveData({
    affection: undefined
  });
  assert.ok(missingAffection.affection.hakima !== undefined, 'hakima affection should exist');
  assert.ok(missingAffection.affection.mira !== undefined, 'mira affection should exist');
  assert.ok(missingAffection.affection.dariya !== undefined, 'dariya affection should exist');
  assert.strictEqual(missingAffection.affection.hakima, 0, 'Missing affection should default to 0');
  console.log("PASSED: affection schema missing - all heroines initialized");

  // Test: affection schema partial - missing heroine is initialized
  const partialAffection = normalizeSaveData({
    affection: {
      hakima: 50
      // mira and dariya missing
    }
  });
  assert.strictEqual(partialAffection.affection.hakima, 50, 'Existing affection preserved');
  assert.strictEqual(partialAffection.affection.mira, 0, 'Missing affection defaults to 0');
  assert.strictEqual(partialAffection.affection.dariya, 0, 'Missing affection defaults to 0');
  console.log("PASSED: affection schema partial - missing heroines initialized");

  // Test: affection clamp - negative values clamped to 0
  const negativeAffection = normalizeSaveData({
    affection: {
      hakima: -50,
      mira: -1,
      dariya: 0
    }
  });
  assert.strictEqual(negativeAffection.affection.hakima, 0, 'Negative affection clamped to 0');
  assert.strictEqual(negativeAffection.affection.mira, 0, 'Negative affection clamped to 0');
  console.log("PASSED: affection clamp - negative values");

  // Test: affection clamp - values over 100 clamped to 100
  const overAffection = normalizeSaveData({
    affection: {
      hakima: 150,
      mira: 101,
      dariya: 100
    }
  });
  assert.strictEqual(overAffection.affection.hakima, 100, 'Affection over 100 clamped to 100');
  assert.strictEqual(overAffection.affection.mira, 100, 'Affection over 100 clamped to 100');
  assert.strictEqual(overAffection.affection.dariya, 100, 'Affection at 100 preserved');
  console.log("PASSED: affection clamp - values over 100");

  // Test: vnBacklog cap - exactly 100 entries preserved
  const exactly100Entries = Array.from({ length: 100 }, (_, i) => ({
    speaker: 'Test',
    text: `Entry ${i}`,
    screen: 'INTRO',
    heroineId: 'hakima',
    routeMode: 'normal',
    sequence: i + 1
  }));
  const exactly100 = normalizeSaveData({
    vnBacklog: exactly100Entries
  });
  assert.strictEqual(exactly100.vnBacklog.length, 100, 'Exactly 100 entries preserved');
  console.log("PASSED: vnBacklog cap - exactly 100 entries");

  // Test: vnBacklog cap - 101 entries trimmed to 100
  const exactly101Entries = Array.from({ length: 101 }, (_, i) => ({
    speaker: 'Test',
    text: `Entry ${i}`,
    screen: 'INTRO',
    heroineId: 'hakima',
    routeMode: 'normal',
    sequence: i + 1
  }));
  const exactly101 = normalizeSaveData({
    vnBacklog: exactly101Entries
  });
  assert.strictEqual(exactly101.vnBacklog.length, 100, '101 entries trimmed to 100');
  assert.strictEqual(exactly101.vnBacklog[0].text, 'Entry 1', 'Oldest entry removed');
  console.log("PASSED: vnBacklog cap - 101 entries trimmed");

  // Test: old save without seenTalkIds - defaults to empty array
  const oldSaveNoSeenTalks = normalizeSaveData({
    screen: 'RESULT',
    activeHeroineId: 'mira',
    workshopState: { day: 3 },
    affection: { hakima: 5, mira: 7, dariya: 9 }
  });
  assert.ok(Array.isArray(oldSaveNoSeenTalks.seenTalkIds), 'seenTalkIds should be array');
  assert.strictEqual(oldSaveNoSeenTalks.seenTalkIds.length, 0, 'Missing seenTalkIds defaults to empty array');
  console.log("PASSED: old save without seenTalkIds defaults to empty array");

  // Test: partial settings-only save normalization - routeMode only
  const settingsOnlyRoute = normalizeSaveData({
    routeMode: 'long_history'
  });
  assert.strictEqual(settingsOnlyRoute.routeMode, 'long_history', 'routeMode preserved');
  assert.strictEqual(settingsOnlyRoute.textSpeed, 'normal', 'textSpeed defaults to normal');
  assert.strictEqual(settingsOnlyRoute.bgmVolume, 0.8, 'bgmVolume defaults to 0.8');
  console.log("PASSED: partial settings-only save - routeMode only");

  // Test: partial settings-only save normalization - textSpeed only
  const settingsOnlyText = normalizeSaveData({
    textSpeed: 'fast'
  });
  assert.strictEqual(settingsOnlyText.textSpeed, 'fast', 'textSpeed preserved');
  assert.strictEqual(settingsOnlyText.routeMode, 'normal', 'routeMode defaults to normal');
  console.log("PASSED: partial settings-only save - textSpeed only");

  // Test: partial settings-only save normalization - volumes only
  const settingsOnlyVolumes = normalizeSaveData({
    bgmVolume: 0.5,
    seVolume: 0.3
  });
  assert.strictEqual(settingsOnlyVolumes.bgmVolume, 0.5, 'bgmVolume preserved');
  assert.strictEqual(settingsOnlyVolumes.seVolume, 0.3, 'seVolume preserved');
  assert.strictEqual(settingsOnlyVolumes.routeMode, 'normal', 'routeMode defaults to normal');
  console.log("PASSED: partial settings-only save - volumes only");

  console.log("\n--- All save logic tests completed successfully! ---");
} catch (err) {
  console.error("\nTEST FAILED:");
  console.error(err);
  process.exit(1);
}
