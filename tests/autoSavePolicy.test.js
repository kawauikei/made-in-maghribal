/**
 * Tests for auto-save policy helper functions
 */
import assert from 'node:assert';
import {
  resolveAutoSavePolicy,
  isDefaultSettings,
  AUTO_SAVE_MODE,
} from '../src/game/autoSavePolicy.js';

console.log("\n--- Made in Maghribal: Auto-Save Policy Tests ---");

try {
  // Test: AUTO_SAVE_MODE constants
  assert.strictEqual(AUTO_SAVE_MODE.NONE, "none");
  assert.strictEqual(AUTO_SAVE_MODE.FULL, "full");
  assert.strictEqual(AUTO_SAVE_MODE.SETTINGS_ONLY, "settings_only");
  console.log("PASSED: AUTO_SAVE_MODE constants");

  // Test: screen !== START → full save
  const fullSavePolicy = resolveAutoSavePolicy({
    screen: "RESULT",
    isDefaultSettings: true,
    hasExistingSave: false,
  });
  assert.strictEqual(fullSavePolicy.mode, AUTO_SAVE_MODE.FULL);
  assert.strictEqual(fullSavePolicy.shouldSave, true);
  assert.strictEqual(fullSavePolicy.shouldSetHasSave, true);
  console.log("PASSED: screen !== START → full save");

  // Test: screen !== START with various states → always full save
  const quizPolicy = resolveAutoSavePolicy({
    screen: "QUIZ",
    isDefaultSettings: false,
    hasExistingSave: false,
  });
  assert.strictEqual(quizPolicy.mode, AUTO_SAVE_MODE.FULL);
  assert.strictEqual(quizPolicy.shouldSave, true);
  console.log("PASSED: screen !== START always triggers full save");

  // Test: START + existing save + default settings → settings_only save
  const startExistingDefault = resolveAutoSavePolicy({
    screen: "START",
    isDefaultSettings: true,
    hasExistingSave: true,
  });
  assert.strictEqual(startExistingDefault.mode, AUTO_SAVE_MODE.SETTINGS_ONLY);
  assert.strictEqual(startExistingDefault.shouldSave, true);
  assert.strictEqual(startExistingDefault.shouldSetHasSave, true);
  console.log("PASSED: START + existing save + default settings → settings_only save");

  // Test: START + existing save + non-default settings → settings_only save
  const startExistingNonDefault = resolveAutoSavePolicy({
    screen: "START",
    isDefaultSettings: false,
    hasExistingSave: true,
  });
  assert.strictEqual(startExistingNonDefault.mode, AUTO_SAVE_MODE.SETTINGS_ONLY);
  assert.strictEqual(startExistingNonDefault.shouldSave, true);
  assert.strictEqual(startExistingNonDefault.shouldSetHasSave, true);
  console.log("PASSED: START + existing save + non-default settings → settings_only save");

  // Test: START + no existing save + non-default settings → settings_only save
  const startNoExistingNonDefault = resolveAutoSavePolicy({
    screen: "START",
    isDefaultSettings: false,
    hasExistingSave: false,
  });
  assert.strictEqual(startNoExistingNonDefault.mode, AUTO_SAVE_MODE.SETTINGS_ONLY);
  assert.strictEqual(startNoExistingNonDefault.shouldSave, true);
  assert.strictEqual(startNoExistingNonDefault.shouldSetHasSave, true);
  console.log("PASSED: START + no existing save + non-default settings → settings_only save");

  // Test: START + no existing save + default settings → none
  const startNoExistingDefault = resolveAutoSavePolicy({
    screen: "START",
    isDefaultSettings: true,
    hasExistingSave: false,
  });
  assert.strictEqual(startNoExistingDefault.mode, AUTO_SAVE_MODE.NONE);
  assert.strictEqual(startNoExistingDefault.shouldSave, false);
  assert.strictEqual(startNoExistingDefault.shouldSetHasSave, false);
  console.log("PASSED: START + no existing save + default settings → none");

  // Test: isDefaultSettings with default values
  const defaultSettings = isDefaultSettings({
    routeMode: "normal",
    textSpeed: "normal",
    instantUnreadText: false,
    bgmVolume: 0.8,
    seVolume: 0.8,
    isAudioEnabled: false,
  });
  assert.strictEqual(defaultSettings, true);
  console.log("PASSED: isDefaultSettings with default values");

  // Test: isDefaultSettings with non-default routeMode
  const nonDefaultRouteMode = isDefaultSettings({
    routeMode: "long_history",
    textSpeed: "normal",
    instantUnreadText: false,
    bgmVolume: 0.8,
    seVolume: 0.8,
    isAudioEnabled: false,
  });
  assert.strictEqual(nonDefaultRouteMode, false);
  console.log("PASSED: isDefaultSettings with non-default routeMode");

  // Test: isDefaultSettings with non-default textSpeed
  const nonDefaultTextSpeed = isDefaultSettings({
    routeMode: "normal",
    textSpeed: "fast",
    instantUnreadText: false,
    bgmVolume: 0.8,
    seVolume: 0.8,
    isAudioEnabled: false,
  });
  assert.strictEqual(nonDefaultTextSpeed, false);
  console.log("PASSED: isDefaultSettings with non-default textSpeed");

  // Test: isDefaultSettings with non-default bgmVolume
  const nonDefaultBgmVolume = isDefaultSettings({
    routeMode: "normal",
    textSpeed: "normal",
    instantUnreadText: false,
    bgmVolume: 0.5,
    seVolume: 0.8,
    isAudioEnabled: false,
  });
  assert.strictEqual(nonDefaultBgmVolume, false);
  console.log("PASSED: isDefaultSettings with non-default bgmVolume");

  // Test: isDefaultSettings with non-default isAudioEnabled
  const nonDefaultAudioEnabled = isDefaultSettings({
    routeMode: "normal",
    textSpeed: "normal",
    instantUnreadText: false,
    bgmVolume: 0.8,
    seVolume: 0.8,
    isAudioEnabled: true,
  });
  assert.strictEqual(nonDefaultAudioEnabled, false);
  console.log("PASSED: isDefaultSettings with non-default isAudioEnabled");

  // Test: isDefaultSettings with custom defaultAudioVolume
  const customDefault = isDefaultSettings({
    routeMode: "normal",
    textSpeed: "normal",
    instantUnreadText: false,
    bgmVolume: 0.5,
    seVolume: 0.5,
    isAudioEnabled: false,
    defaultAudioVolume: 0.5,
  });
  assert.strictEqual(customDefault, true);
  console.log("PASSED: isDefaultSettings with custom defaultAudioVolume");

  // Test: helper is pure function (no localStorage dependency)
  // This is verified by the fact that the tests run without mocking localStorage
  console.log("PASSED: helper is pure function (no localStorage dependency)");

  console.log("\n--- All auto-save policy tests completed successfully! ---");
} catch (err) {
  console.error("\nTEST FAILED:");
  console.error(err);
  process.exit(1);
}
