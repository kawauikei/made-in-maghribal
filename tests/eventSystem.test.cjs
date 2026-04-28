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
  assert.strictEqual(e3, null, "Should not re-trigger seen event");
  console.log("✅ PASSED: Do not re-trigger seen events");

  // Test Case 4: Multiple events (Hypothetical for future)
  // Even if we don't have them now, the logic should handle it.
  // We'll skip this unless we add more test data.

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
