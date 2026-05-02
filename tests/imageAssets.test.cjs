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

  // Test Case 5: Still crop metadata
  Object.values(STILL_IMAGES).forEach(still => {
    if (!still.stillCrop) return;

    const crop = still.stillCrop;
    assert.ok(!crop.objectFit || ['cover', 'contain'].includes(crop.objectFit), `Still ${still.id} should use a supported objectFit`);

    if (crop.mode === 'heroine_pan') {
      assert.ok(crop.startPosition, `Still ${still.id} heroine_pan should define startPosition`);
      assert.ok(crop.endPosition, `Still ${still.id} heroine_pan should define endPosition`);
      assert.ok(Number.isFinite(crop.durationMs) && crop.durationMs > 0, `Still ${still.id} heroine_pan should define a positive durationMs`);
    } else {
      assert.ok(!crop.mode, `Still ${still.id} has unsupported stillCrop mode: ${crop.mode}`);
    }
  });
  console.log("✅ PASSED: Still crop metadata");

  // Test Case 6: Event Linkage (M8-18)
  const { AFFECTION_EVENTS } = require('../src/data/affectionEvents.js');
  
  Object.keys(AFFECTION_EVENTS).forEach(heroineId => {
    const events = AFFECTION_EVENTS[heroineId];
    events.forEach(event => {
      // Check threshold 5 events have stillImageId (except long_history background events)
      if (event.threshold === 5 && event.routeMode !== 'long_history') {
        assert.ok(event.stillImageId, `Event ${event.id} (threshold 5) should have stillImageId`);
        const still = STILL_IMAGES[event.stillImageId];
        assert.ok(still, `stillImageId ${event.stillImageId} for event ${event.id} should exist in STILL_IMAGES`);
        assert.strictEqual(still.heroineId, heroineId, `Still ${event.stillImageId} should belong to ${heroineId}`);
      }
      
      // Safety check: if stillImageId exists, it must be valid
      if (event.stillImageId) {
        assert.ok(STILL_IMAGES[event.stillImageId], `stillImageId ${event.stillImageId} for event ${event.id} must be valid`);
      }
    });
  });
  console.log("✅ PASSED: Event-Still linkage (threshold 5)");

  console.log("\n--- All image asset tests completed successfully! ---");
}

try {
  testImageAssets();
} catch (error) {
  console.error("❌ TEST FAILED:", error.message);
  process.exit(1);
}
