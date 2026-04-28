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
  console.log("✅ PASSED: createDefaultSaveData");

  // Test: normalizeSaveData (Clamping affection)
  const messy = {
    affection: {
      hakima: 150,
      mira: -10,
      nader: 50 // unknown/protagonist
    },
    screen: 'QUIZ' // Should fallback to INTRO
  };
  const norm = normalizeSaveData(messy);
  assert.strictEqual(norm.affection.hakima, 100);
  assert.strictEqual(norm.affection.mira, 0);
  assert.strictEqual(norm.affection.nader, undefined);
  assert.strictEqual(norm.screen, 'INTRO');
  console.log("✅ PASSED: normalizeSaveData (Clamping & Filtering)");

  // Test: save / has / load / clear
  mockStorage.clear();
  assert.strictEqual(hasSaveData(), false);
  
  const myData = createDefaultSaveData();
  myData.workshopState.day = 5;
  myData.affection.hakima = 10;
  
  saveGameData(myData);
  assert.strictEqual(hasSaveData(), true);
  
  const loaded = loadSaveData();
  assert.strictEqual(loaded.workshopState.day, 5);
  assert.strictEqual(loaded.affection.hakima, 10);
  console.log("✅ PASSED: save/load/has cycle");
  
  clearSaveData();
  assert.strictEqual(hasSaveData(), false);
  assert.strictEqual(loadSaveData(), null);
  console.log("✅ PASSED: clearSaveData");

  // Test: Corrupted JSON
  mockStorage.setItem(STORAGE_KEY, "invalid json {");
  const corrupted = loadSaveData();
  assert.strictEqual(corrupted, null);
  console.log("✅ PASSED: Corrupted JSON handling");

  console.log("\n--- All save logic tests completed successfully! ---");
} catch (err) {
  console.error("\n❌ TEST FAILED:");
  console.error(err);
  process.exit(1);
}
