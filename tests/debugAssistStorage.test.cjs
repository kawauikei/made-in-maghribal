/**
 * Tests for Debug / Assist Storage helpers
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
  loadBooleanFlag,
  saveBooleanFlag,
  loadDebugModeEnabled,
  saveDebugModeEnabled,
  loadAutoSkipQuizEnabled,
  saveAutoSkipQuizEnabled,
  loadDebugUnlockAllEnabled,
  saveDebugUnlockAllEnabled,
  DEBUG_MODE_KEY,
  AUTO_SKIP_QUIZ_KEY,
  DEBUG_UNLOCK_ALL_KEY
} = require('../src/game/debugAssistStorage.js');

console.log("\n--- Made in Maghribal: Debug Assist Storage Tests ---");

try {
  // Test: loadBooleanFlag with no storage
  const originalLocalStorage = global.localStorage;
  delete global.localStorage;
  assert.strictEqual(loadBooleanFlag('test_key', false), false, 'Should return false when localStorage unavailable');
  assert.strictEqual(loadBooleanFlag('test_key', true), true, 'Should return default true when localStorage unavailable');
  global.localStorage = originalLocalStorage;
  console.log("PASSED: loadBooleanFlag without localStorage");

  // Test: saveBooleanFlag with no storage
  delete global.localStorage;
  saveBooleanFlag('test_key', true); // should not throw
  global.localStorage = originalLocalStorage;
  console.log("PASSED: saveBooleanFlag without localStorage");

  // Test: loadBooleanFlag read/write cycle
  mockStorage.clear();
  saveBooleanFlag('test_flag', true);
  assert.strictEqual(loadBooleanFlag('test_flag', false), true, 'Should read true after saving true');
  saveBooleanFlag('test_flag', false);
  assert.strictEqual(loadBooleanFlag('test_flag', true), false, 'Should read false after saving false');
  console.log("PASSED: loadBooleanFlag read/write cycle");

  // Test: loadBooleanFlag with invalid values
  mockStorage.clear();
  mockStorage.store['invalid_key'] = 'not_a_boolean';
  assert.strictEqual(loadBooleanFlag('invalid_key', false), false, 'Should return false for non-"true" string');
  mockStorage.store['invalid_key'] = 'TRUE';
  assert.strictEqual(loadBooleanFlag('invalid_key', false), false, 'Should return false for "TRUE" (case sensitive)');
  mockStorage.store['invalid_key'] = '1';
  assert.strictEqual(loadBooleanFlag('invalid_key', false), false, 'Should return false for "1"');
  console.log("PASSED: loadBooleanFlag with invalid values");

  // Test: loadBooleanFlag with missing key
  mockStorage.clear();
  assert.strictEqual(loadBooleanFlag('missing_key', false), false, 'Should return default for missing key');
  assert.strictEqual(loadBooleanFlag('missing_key', true), true, 'Should return default true for missing key');
  console.log("PASSED: loadBooleanFlag with missing key");

  // Test: Debug Mode key and functions
  mockStorage.clear();
  assert.strictEqual(loadDebugModeEnabled(), false, 'Default debug mode should be false');
  saveDebugModeEnabled(true);
  assert.strictEqual(mockStorage.store[DEBUG_MODE_KEY], 'true', 'Should use correct key');
  assert.strictEqual(loadDebugModeEnabled(), true, 'Should read debug mode after saving');
  console.log("PASSED: Debug Mode key and functions");

  // Test: Auto Skip Quiz key and functions
  mockStorage.clear();
  assert.strictEqual(loadAutoSkipQuizEnabled(), false, 'Default auto skip should be false');
  saveAutoSkipQuizEnabled(true);
  assert.strictEqual(mockStorage.store[AUTO_SKIP_QUIZ_KEY], 'true', 'Should use correct key');
  assert.strictEqual(loadAutoSkipQuizEnabled(), true, 'Should read auto skip after saving');
  console.log("PASSED: Auto Skip Quiz key and functions");

  // Test: Unlock All key and functions
  mockStorage.clear();
  assert.strictEqual(loadDebugUnlockAllEnabled(), true, 'Default unlock all should be true');
  saveDebugUnlockAllEnabled(false);
  assert.strictEqual(mockStorage.store[DEBUG_UNLOCK_ALL_KEY], 'false', 'Should use correct key');
  assert.strictEqual(loadDebugUnlockAllEnabled(), false, 'Should read unlock all after saving');
  console.log("PASSED: Unlock All key and functions");

  // Test: Keys are distinct
  assert.notStrictEqual(DEBUG_MODE_KEY, AUTO_SKIP_QUIZ_KEY, 'Debug mode and auto skip keys should be different');
  assert.notStrictEqual(DEBUG_MODE_KEY, DEBUG_UNLOCK_ALL_KEY, 'Debug mode and unlock all keys should be different');
  assert.notStrictEqual(AUTO_SKIP_QUIZ_KEY, DEBUG_UNLOCK_ALL_KEY, 'Auto skip and unlock all keys should be different');
  console.log("PASSED: Keys are distinct");

  console.log("\n--- All Debug Assist Storage tests completed successfully! ---");
} catch (err) {
  console.error("\nTEST FAILED:");
  console.error(err);
  process.exit(1);
}
