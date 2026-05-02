/**
 * Tests for save payload builder functions
 */
import assert from 'node:assert';
import {
  buildGameSavePayload,
  buildSettingsSavePayload,
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

  console.log("\n--- All save payload builder tests completed successfully! ---");
} catch (err) {
  console.error("\nTEST FAILED:");
  console.error(err);
  process.exit(1);
}
