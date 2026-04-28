const assert = require('assert');
const { getWorkshopResult, createInitialWorkshopState, applyWorkshopResult } = require('../src/game/management');

console.log("\n--- Made in Maghribal: Management Logic Tests ---");

try {
  // Existing tests...
  assert.strictEqual(getWorkshopResult(5).sales, 120);
  console.log("✅ PASSED: getWorkshopResult core check");

  // State Initialization
  const initialState = createInitialWorkshopState();
  assert.strictEqual(initialState.day, 1);
  assert.strictEqual(initialState.reputation, 0);
  assert.strictEqual(initialState.sales, 0);
  console.log("✅ PASSED: createInitialWorkshopState");

  // State Accumulation
  let state = createInitialWorkshopState();
  
  // Day 1: 5 correct (+120 sales, +3 rep)
  const res1 = getWorkshopResult(5);
  state = applyWorkshopResult(state, res1);
  assert.strictEqual(state.sales, 120);
  assert.strictEqual(state.reputation, 3);
  console.log("✅ PASSED: applyWorkshopResult (Day 1)");

  // Day 2: 2 correct (+50 sales, +0 rep)
  const res2 = getWorkshopResult(2);
  state = applyWorkshopResult(state, res2);
  assert.strictEqual(state.sales, 170); // 120 + 50
  assert.strictEqual(state.reputation, 3); // 3 + 0
  console.log("✅ PASSED: applyWorkshopResult (Day 2)");

  // Day 3: 0 correct (+20 sales, -1 rep)
  const res3 = getWorkshopResult(0);
  state = applyWorkshopResult(state, res3);
  assert.strictEqual(state.sales, 190); // 170 + 20
  assert.strictEqual(state.reputation, 2); // 3 - 1
  console.log("✅ PASSED: applyWorkshopResult (Day 3)");

  console.log("\n--- All management tests completed successfully! ---");
} catch (err) {
  console.error("\n❌ TEST FAILED:");
  console.error(err);
  process.exit(1);
}
