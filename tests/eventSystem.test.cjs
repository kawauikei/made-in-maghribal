/**
 * Regression tests for Event System Logic
 */
const assert = require('assert');
const { checkNewEventUnlock } = require('../src/game/eventSystem.js');

console.log("\n--- Made in Maghribal: Event System Tests ---");

try {
  // Test Case 1: No events met threshold
  const e1 = checkNewEventUnlock('hakima', 2, []);
  assert.strictEqual(e1, null, "Should not unlock at affection 2");
  console.log("✅ PASSED: No events below threshold");

  // Test Case 2: Meet threshold 5
  const e2 = checkNewEventUnlock('hakima', 5, []);
  assert.ok(e2 !== null);
  assert.strictEqual(e2.id, 'hakima_5');
  console.log("✅ PASSED: Unlock at threshold 5");

  // Test Case 3: Already seen
  const e3 = checkNewEventUnlock('hakima', 10, ['hakima_5']);
  assert.ok(e3 !== null);
  assert.strictEqual(e3.id, 'hakima_10', "Should unlock threshold 10 if 5 is seen");
  console.log("✅ PASSED: Unlock threshold 10 after threshold 5 is seen");

  // Test Case 4: Sequential check (Jump to 12)
  const e4a = checkNewEventUnlock('hakima', 12, []);
  assert.strictEqual(e4a.id, 'hakima_5', "Should unlock lowest threshold first (5)");
  
  const e4b = checkNewEventUnlock('hakima', 12, ['hakima_5']);
  assert.strictEqual(e4b.id, 'hakima_10', "Should unlock next threshold (10) after 5 is seen");
  
  const e4c = checkNewEventUnlock('hakima', 12, ['hakima_5', 'hakima_10']);
  assert.strictEqual(e4c, null, "No more events left to unlock");
  console.log("✅ PASSED: Sequential unlocking (4->12 jump)");

  // Test Case 5: Unknown heroine
  const e5 = checkNewEventUnlock('unknown', 100, []);
  assert.strictEqual(e5, null);
  console.log("✅ PASSED: Safety for unknown heroine");

  console.log("\n--- All event system tests completed successfully! ---");
} catch (err) {
  console.error("\n❌ TEST FAILED:");
  console.error(err);
  process.exit(1);
}
