/**
 * SFX Manifest Tests for Made in Maghribal
 */

const { SFX, getSfxById, getSfxByUsage } = require('../src/data/sfx');

console.log("\n--- Made in Maghribal: SFX Manifest Tests ---");

function testSfxDefinitions() {
  const ids = Object.keys(SFX);
  if (ids.length === 0) {
    throw new Error("SFX manifest is empty");
  }

  ids.forEach(id => {
    const sfx = SFX[id];
    
    // Check ID consistency
    if (sfx.id !== id) {
      throw new Error(`ID mismatch for SFX: ${id}`);
    }

    // Check src format
    if (!sfx.src.startsWith('audio/se/')) {
      throw new Error(`Invalid src path for SFX ${id}: ${sfx.src}. Must start with audio/se/`);
    }

    // Check volume range
    if (typeof sfx.volume !== 'number' || sfx.volume < 0 || sfx.volume > 1) {
      throw new Error(`Invalid volume for SFX ${id}: ${sfx.volume}. Must be between 0 and 1.`);
    }

    // Check usage presence
    if (!sfx.usage) {
      throw new Error(`Missing usage for SFX: ${id}`);
    }
  });

  console.log(`✅ PASSED: ${ids.length} SFX definitions verified`);
}

function testHelpers() {
  // getSfxById
  if (getSfxById('invalid') !== null) {
    throw new Error("getSfxById should return null for invalid ID");
  }
  const tap = getSfxById('uiTapBottle');
  if (!tap || tap.id !== 'uiTapBottle') {
    throw new Error("getSfxById failed to retrieve valid SFX");
  }

  // getSfxByUsage
  if (getSfxByUsage('non_existent') !== null) {
    throw new Error("getSfxByUsage should return null for invalid usage");
  }
  const confirm = getSfxByUsage('ui_confirm');
  if (!confirm || confirm.usage !== 'ui_confirm') {
    throw new Error("getSfxByUsage failed to retrieve valid usage");
  }

  console.log("✅ PASSED: SFX helper functions");
}

try {
  testSfxDefinitions();
  testHelpers();
  console.log("\n--- All SFX manifest tests completed successfully! ---\n");
} catch (err) {
  console.error(`\n❌ TEST FAILED: ${err.message}\n`);
  process.exit(1);
}
