/**
 * Tests for save payload builder functions
 */
import assert from 'node:assert';
import {
  buildGameSavePayload,
  buildSettingsSavePayload,
  buildSettingsOnlySavePayload,
  resolveAutoSavePayload,
} from '../src/game/savePayload.js';

console.log("\n--- Made in Maghribal: Save Payload Builder Tests ---");

try {
  // Test: buildGameSavePayload returns all keys
  const fullPayload = buildGameSavePayload({
    screen: 'RESULT',
    activeHeroineId: 'hakima',
    routeMode: 'normal',
    workshopState: { day: 3, reputation: 10, sales: 50, satisfaction: 5 },
    affection: { hakima: 25, mira: 0, dariya: 0 },
    seenEventIds: ['hakima_5'],
    seenTalkIds: ['talk_1', 'talk_2'],
    activeEvent: null,
    vnBacklog: [{ speaker: 'Hakima', text: 'Hello', screen: 'INTRO' }],
    textSpeed: 'fast',
    instantUnreadText: true,
    bgmVolume: 0.5,
    seVolume: 0.7,
    isAudioEnabled: true,
  });

  assert.strictEqual(fullPayload.screen, 'RESULT');
  assert.strictEqual(fullPayload.activeHeroineId, 'hakima');
  assert.strictEqual(fullPayload.routeMode, 'normal');
  assert.deepStrictEqual(fullPayload.workshopState, { day: 3, reputation: 10, sales: 50, satisfaction: 5 });
  assert.deepStrictEqual(fullPayload.affection, { hakima: 25, mira: 0, dariya: 0 });
  assert.deepStrictEqual(fullPayload.seenEventIds, ['hakima_5']);
  assert.deepStrictEqual(fullPayload.seenTalkIds, ['talk_1', 'talk_2']);
  assert.strictEqual(fullPayload.activeEvent, null);
  assert.strictEqual(fullPayload.vnBacklog.length, 1);
  assert.strictEqual(fullPayload.vnBacklog[0].text, 'Hello');
  assert.strictEqual(fullPayload.textSpeed, 'fast');
  assert.strictEqual(fullPayload.instantUnreadText, true);
  assert.strictEqual(fullPayload.bgmVolume, 0.5);
  assert.strictEqual(fullPayload.seVolume, 0.7);
  assert.strictEqual(fullPayload.isAudioEnabled, true);
  console.log("PASSED: buildGameSavePayload returns all keys");

  // Test: buildGameSavePayload does not include Debug/Assist keys
  const payloadKeys = Object.keys(fullPayload);
  assert.ok(!payloadKeys.includes('debugMode'), 'Should not include debugMode');
  assert.ok(!payloadKeys.includes('autoSkipQuiz'), 'Should not include autoSkipQuiz');
  assert.ok(!payloadKeys.includes('unlockAll'), 'Should not include unlockAll');
  assert.ok(!payloadKeys.includes('made_in_maghribal_debug_mode'), 'Should not include debug storage key');
  console.log("PASSED: buildGameSavePayload does not include Debug/Assist keys");

  // Test: buildGameSavePayload does not transform undefined values
  const partialPayload = buildGameSavePayload({
    screen: 'INTRO',
    activeHeroineId: 'mira',
    routeMode: 'long_history',
    workshopState: { day: 1 },
    affection: {},
    seenEventIds: [],
    seenTalkIds: [],
    activeEvent: undefined,
    vnBacklog: [],
    textSpeed: 'normal',
    instantUnreadText: false,
    bgmVolume: 0.8,
    seVolume: 0.8,
    isAudioEnabled: false,
  });
  assert.strictEqual(partialPayload.activeEvent, undefined);
  console.log("PASSED: buildGameSavePayload does not transform undefined values");

  // Test: buildGameSavePayload preserves activeEvent object
  const eventPayload = buildGameSavePayload({
    screen: 'EVENT',
    activeHeroineId: 'hakima',
    routeMode: 'normal',
    workshopState: { day: 2 },
    affection: { hakima: 5 },
    seenEventIds: [],
    seenTalkIds: [],
    activeEvent: { id: 'hakima_5', kind: 'affection', threshold: 5 },
    vnBacklog: [],
    textSpeed: 'normal',
    instantUnreadText: false,
    bgmVolume: 0.8,
    seVolume: 0.8,
    isAudioEnabled: false,
  });
  assert.deepStrictEqual(eventPayload.activeEvent, { id: 'hakima_5', kind: 'affection', threshold: 5 });
  console.log("PASSED: buildGameSavePayload preserves activeEvent object");

  // Test: buildGameSavePayload preserves vnBacklog array
  const backlogPayload = buildGameSavePayload({
    screen: 'INTRO',
    activeHeroineId: 'dariya',
    routeMode: 'normal',
    workshopState: { day: 5 },
    affection: { dariya: 50 },
    seenEventIds: [],
    seenTalkIds: [],
    activeEvent: null,
    vnBacklog: [
      { speaker: 'Narrator', text: 'Day 1', screen: 'INTRO' },
      { speaker: 'Dariya', text: 'Hello', screen: 'INTRO' },
    ],
    textSpeed: 'normal',
    instantUnreadText: false,
    bgmVolume: 0.8,
    seVolume: 0.8,
    isAudioEnabled: false,
  });
  assert.strictEqual(backlogPayload.vnBacklog.length, 2);
  assert.strictEqual(backlogPayload.vnBacklog[0].speaker, 'Narrator');
  assert.strictEqual(backlogPayload.vnBacklog[1].speaker, 'Dariya');
  console.log("PASSED: buildGameSavePayload preserves vnBacklog array");

  // Test: buildSettingsSavePayload returns only settings keys
  const settingsPayload = buildSettingsSavePayload({
    routeMode: 'long_history',
    textSpeed: 'instant',
    instantUnreadText: true,
    bgmVolume: 0.3,
    seVolume: 0.4,
    isAudioEnabled: true,
  });

  assert.strictEqual(settingsPayload.routeMode, 'long_history');
  assert.strictEqual(settingsPayload.textSpeed, 'instant');
  assert.strictEqual(settingsPayload.instantUnreadText, true);
  assert.strictEqual(settingsPayload.bgmVolume, 0.3);
  assert.strictEqual(settingsPayload.seVolume, 0.4);
  assert.strictEqual(settingsPayload.isAudioEnabled, true);
  
  const settingsKeys = Object.keys(settingsPayload);
  assert.strictEqual(settingsKeys.length, 6, 'Should only have 6 settings keys');
  assert.ok(!settingsKeys.includes('screen'), 'Should not include screen');
  assert.ok(!settingsKeys.includes('activeHeroineId'), 'Should not include activeHeroineId');
  assert.ok(!settingsKeys.includes('workshopState'), 'Should not include workshopState');
  assert.ok(!settingsKeys.includes('affection'), 'Should not include affection');
  assert.ok(!settingsKeys.includes('vnBacklog'), 'Should not include vnBacklog');
  console.log("PASSED: buildSettingsSavePayload returns only settings keys");

  // Test: buildSettingsSavePayload does not include Debug/Assist keys
  assert.ok(!settingsKeys.includes('debugMode'), 'Should not include debugMode');
  assert.ok(!settingsKeys.includes('autoSkipQuiz'), 'Should not include autoSkipQuiz');
  console.log("PASSED: buildSettingsSavePayload does not include Debug/Assist keys");

  // Test: buildSettingsOnlySavePayload merges settings into existing save
  const existingSave = {
    screen: 'RESULT',
    activeHeroineId: 'hakima',
    workshopState: { day: 5, reputation: 20 },
    affection: { hakima: 50 },
    routeMode: 'normal',
    textSpeed: 'normal',
  };
  const merged = buildSettingsOnlySavePayload(existingSave, {
    routeMode: 'long_history',
    textSpeed: 'fast',
    instantUnreadText: true,
    bgmVolume: 0.5,
    seVolume: 0.6,
    isAudioEnabled: true,
  });
  assert.strictEqual(merged.screen, 'RESULT', 'Should preserve screen');
  assert.strictEqual(merged.activeHeroineId, 'hakima', 'Should preserve activeHeroineId');
  assert.strictEqual(merged.workshopState.day, 5, 'Should preserve workshopState');
  assert.strictEqual(merged.affection.hakima, 50, 'Should preserve affection');
  assert.strictEqual(merged.routeMode, 'long_history', 'Should override routeMode');
  assert.strictEqual(merged.textSpeed, 'fast', 'Should override textSpeed');
  assert.strictEqual(merged.instantUnreadText, true, 'Should set instantUnreadText');
  assert.strictEqual(merged.bgmVolume, 0.5, 'Should set bgmVolume');
  assert.strictEqual(merged.seVolume, 0.6, 'Should set seVolume');
  assert.strictEqual(merged.isAudioEnabled, true, 'Should set isAudioEnabled');
  console.log("PASSED: buildSettingsOnlySavePayload merges settings into existing save");

  // Test: buildSettingsOnlySavePayload with null existingSave
  const nullMerged = buildSettingsOnlySavePayload(null, {
    routeMode: 'normal',
    textSpeed: 'slow',
    instantUnreadText: false,
    bgmVolume: 0.7,
    seVolume: 0.8,
    isAudioEnabled: false,
  });
  assert.strictEqual(nullMerged.routeMode, 'normal', 'Should set routeMode');
  assert.strictEqual(nullMerged.textSpeed, 'slow', 'Should set textSpeed');
  assert.strictEqual(Object.keys(nullMerged).length, 6, 'Should only have 6 settings keys');
  console.log("PASSED: buildSettingsOnlySavePayload with null existingSave");

  // Test: buildSettingsOnlySavePayload does not include Debug/Assist keys
  const mergedKeys = Object.keys(merged);
  assert.ok(!mergedKeys.includes('debugMode'), 'Should not include debugMode');
  assert.ok(!mergedKeys.includes('autoSkipQuiz'), 'Should not include autoSkipQuiz');
  assert.ok(!mergedKeys.includes('unlockAll'), 'Should not include unlockAll');
  console.log("PASSED: buildSettingsOnlySavePayload does not include Debug/Assist keys");

  // Test: resolveAutoSavePayload with FULL policy
  const fullSaveState = {
    screen: 'RESULT',
    activeHeroineId: 'hakima',
    routeMode: 'normal',
    workshopState: { day: 3, reputation: 10 },
    affection: { hakima: 25 },
    seenEventIds: ['hakima_5'],
    seenTalkIds: ['talk_1'],
    activeEvent: null,
    vnBacklog: [{ speaker: 'Hakima', text: 'Hello', screen: 'INTRO' }],
    textSpeed: 'fast',
    instantUnreadText: true,
    bgmVolume: 0.5,
    seVolume: 0.6,
    isAudioEnabled: true,
  };
  const fullPolicy = { mode: "full", shouldSave: true, shouldSetHasSave: true };
  const fullResult = resolveAutoSavePayload({
    policy: fullPolicy,
    existingSave: null,
    fullSaveState,
    settingsState: {},
  });
  assert.deepStrictEqual(fullResult, buildGameSavePayload(fullSaveState));
  assert.strictEqual(fullResult.screen, 'RESULT');
  assert.strictEqual(fullResult.activeHeroineId, 'hakima');
  console.log("PASSED: resolveAutoSavePayload with FULL policy");

  // Test: resolveAutoSavePayload with SETTINGS_ONLY policy
  const existingSaveForSettings = {
    screen: 'RESULT',
    activeHeroineId: 'hakima',
    workshopState: { day: 5, reputation: 20 },
    affection: { hakima: 50 },
  };
  const settingsState = {
    routeMode: 'long_history',
    textSpeed: 'fast',
    instantUnreadText: true,
    bgmVolume: 0.5,
    seVolume: 0.6,
    isAudioEnabled: true,
  };
  const settingsPolicy = { mode: "settings_only", shouldSave: true, shouldSetHasSave: true };
  const settingsResult = resolveAutoSavePayload({
    policy: settingsPolicy,
    existingSave: existingSaveForSettings,
    fullSaveState: {},
    settingsState,
  });
  const expectedSettingsResult = buildSettingsOnlySavePayload(existingSaveForSettings, settingsState);
  assert.deepStrictEqual(settingsResult, expectedSettingsResult);
  assert.strictEqual(settingsResult.screen, 'RESULT', 'Should preserve screen from existingSave');
  assert.strictEqual(settingsResult.routeMode, 'long_history', 'Should override routeMode');
  console.log("PASSED: resolveAutoSavePayload with SETTINGS_ONLY policy");

  // Test: resolveAutoSavePayload with SETTINGS_ONLY policy and null existingSave
  const nullExistingPolicy = { mode: "settings_only", shouldSave: true, shouldSetHasSave: true };
  const nullExistingResult = resolveAutoSavePayload({
    policy: nullExistingPolicy,
    existingSave: null,
    fullSaveState: {},
    settingsState,
  });
  const expectedNullExistingResult = buildSettingsOnlySavePayload(null, settingsState);
  assert.deepStrictEqual(nullExistingResult, expectedNullExistingResult);
  assert.strictEqual(Object.keys(nullExistingResult).length, 6, 'Should only have 6 settings keys');
  console.log("PASSED: resolveAutoSavePayload with SETTINGS_ONLY policy and null existingSave");

  // Test: resolveAutoSavePayload with NONE policy
  const nonePolicy = { mode: "none", shouldSave: false, shouldSetHasSave: false };
  const noneResult = resolveAutoSavePayload({
    policy: nonePolicy,
    existingSave: null,
    fullSaveState: {},
    settingsState: {},
  });
  assert.strictEqual(noneResult, null);
  console.log("PASSED: resolveAutoSavePayload with NONE policy");

  // Test: resolveAutoSavePayload with unknown mode returns null
  const unknownPolicy = { mode: "unknown_mode" };
  const unknownResult = resolveAutoSavePayload({
    policy: unknownPolicy,
    existingSave: null,
    fullSaveState: {},
    settingsState: {},
  });
  assert.strictEqual(unknownResult, null);
  console.log("PASSED: resolveAutoSavePayload with unknown mode returns null");

  // Test: resolveAutoSavePayload with null/undefined policy returns null
  const nullPolicyResult = resolveAutoSavePayload({
    policy: null,
    existingSave: null,
    fullSaveState: {},
    settingsState: {},
  });
  assert.strictEqual(nullPolicyResult, null);
  console.log("PASSED: resolveAutoSavePayload with null policy returns null");

  const undefinedPolicyResult = resolveAutoSavePayload({
    policy: undefined,
    existingSave: null,
    fullSaveState: {},
    settingsState: {},
  });
  assert.strictEqual(undefinedPolicyResult, null);
  console.log("PASSED: resolveAutoSavePayload with undefined policy returns null");

  // Test: resolveAutoSavePayload does not include Debug/Assist keys in FULL mode
  const fullResultKeys = Object.keys(fullResult);
  assert.ok(!fullResultKeys.includes('debugMode'), 'Should not include debugMode');
  assert.ok(!fullResultKeys.includes('autoSkipQuiz'), 'Should not include autoSkipQuiz');
  assert.ok(!fullResultKeys.includes('unlockAll'), 'Should not include unlockAll');
  console.log("PASSED: resolveAutoSavePayload does not include Debug/Assist keys in FULL mode");

  // Test: resolveAutoSavePayload does not include Debug/Assist keys in SETTINGS_ONLY mode
  const settingsResultKeys = Object.keys(settingsResult);
  assert.ok(!settingsResultKeys.includes('debugMode'), 'Should not include debugMode');
  assert.ok(!settingsResultKeys.includes('autoSkipQuiz'), 'Should not include autoSkipQuiz');
  assert.ok(!settingsResultKeys.includes('unlockAll'), 'Should not include unlockAll');
  console.log("PASSED: resolveAutoSavePayload does not include Debug/Assist keys in SETTINGS_ONLY mode");

  console.log("\n--- All save payload builder tests completed successfully! ---");
} catch (err) {
  console.error("\nTEST FAILED:");
  console.error(err);
  process.exit(1);
}
