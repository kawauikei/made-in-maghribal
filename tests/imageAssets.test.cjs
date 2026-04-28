const assert = require('assert');
const { BACKGROUND_IMAGES, STILL_IMAGES, getBackgroundById, getStillById } = require('../src/data/imageAssets.js');

function testImageAssets() {
  console.log("--- Made in Maghribal: Image Asset Tests ---");

  // Test Case 1: Backgrounds exist
  assert.ok(BACKGROUND_IMAGES.shopExteriorDay, "shopExteriorDay should exist");
  assert.strictEqual(BACKGROUND_IMAGES.shopExteriorDay.id, "shopExteriorDay");
  assert.ok(BACKGROUND_IMAGES.shopExteriorDay.src.startsWith('images/background/'), "Background src path should be correct");
  console.log("✅ PASSED: Background shopExteriorDay integrity");

  // Test Case 2: Stills exist
  assert.ok(STILL_IMAGES.hakimaMorningVisit01, "hakimaMorningVisit01 should exist");
  assert.strictEqual(STILL_IMAGES.hakimaMorningVisit01.heroineId, "hakima");
  assert.ok(STILL_IMAGES.hakimaMorningVisit01.src.startsWith('images/still/'), "Still src path should be correct");
  console.log("✅ PASSED: Still hakimaMorningVisit01 integrity");

  // Test Case 3: Helper functions
  const bg = getBackgroundById('shopExteriorDay');
  assert.strictEqual(bg.id, 'shopExteriorDay');
  
  const still = getStillById('hakimaMorningVisit01');
  assert.strictEqual(still.id, 'hakimaMorningVisit01');
  
  const none = getBackgroundById('nonexistent');
  assert.strictEqual(none, null);
  console.log("✅ PASSED: Helper functions");

  // Test Case 4: Unique IDs
  const bgIds = Object.keys(BACKGROUND_IMAGES);
  const stillIds = Object.keys(STILL_IMAGES);
  const allIds = [...bgIds, ...stillIds];
  const uniqueIds = new Set(allIds);
  assert.strictEqual(allIds.length, uniqueIds.size, "All asset IDs should be unique");
  console.log("✅ PASSED: Unique Asset IDs");

  console.log("\n--- All image asset tests completed successfully! ---");
}

try {
  testImageAssets();
} catch (error) {
  console.error("❌ TEST FAILED:", error.message);
  process.exit(1);
}
