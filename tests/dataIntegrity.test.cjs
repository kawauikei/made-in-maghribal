/**
 * Data Integrity Tests for Made in Maghribal
 * 
 * Verifies that the world and character settings v1.1 are correctly integrated.
 */

const { HEROINES } = require('../src/data/heroines');
const { WORLD, SHOP, PROTAGONIST } = require('../src/data/world');

console.log("\n--- Made in Maghribal: Data Integrity Tests ---");

function testHeroines() {
  const requiredFields = [
    'id', 'fullName', 'name', 'age', 'role', 
    'relationship', 'personality', 'routeTheme', 
    'musicMood', 'assets', 'themeColor'
  ];
  const expectedIds = ['hakima', 'mira', 'dariya'];

  if (HEROINES.length !== 3) {
    throw new Error(`Expected 3 heroines, got ${HEROINES.length}`);
  }

  HEROINES.forEach(h => {
    console.log(`Checking heroine: ${h.id}`);
    requiredFields.forEach(field => {
      if (!h[field]) {
        throw new Error(`Heroine ${h.id} is missing required field: ${field}`);
      }
    });
    if (!expectedIds.includes(h.id)) {
      throw new Error(`Unexpected heroine ID: ${h.id}`);
    }
  });

  console.log("✅ PASSED: Heroine data integrity");
}

function testWorldSettings() {
  if (!WORLD.kingdomName || !SHOP.name || !PROTAGONIST.name) {
    throw new Error("Essential world/shop/protagonist data is missing");
  }
  console.log("✅ PASSED: World/Shop/Protagonist data integrity");
}

try {
  testHeroines();
  testWorldSettings();
  console.log("\n--- All data integrity tests completed successfully! ---\n");
} catch (err) {
  console.error(`\n❌ TEST FAILED: ${err.message}\n`);
  process.exit(1);
}
