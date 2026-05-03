const assert = require('assert');
const { getWorkshopResult, createInitialWorkshopState, applyWorkshopResult } = require('../src/game/management');

console.log('\n--- Made in Maghribal: Management Logic Tests ---');

try {
  // Legacy compatibility
  assert.strictEqual(getWorkshopResult(5).sales, 120);
  console.log('PASSED: getWorkshopResult core check');

  // New balance object input
  const objectResult = getWorkshopResult({
    correctCount: 5,
    answers: Array.from({ length: 5 }, () => ({
      gainedScore: 20,
      rhythmGood: true,
      fast: true
    }))
  });
  assert.strictEqual(objectResult.sales, 100);
  assert.strictEqual(objectResult.reputation, 10);
  assert.strictEqual(objectResult.satisfaction, 10);
  console.log('PASSED: getWorkshopResult object input');

  // State Initialization
  const initialState = createInitialWorkshopState();
  assert.strictEqual(initialState.day, 1);
  assert.strictEqual(initialState.reputation, 0);
  assert.strictEqual(initialState.sales, 0);
  console.log('PASSED: createInitialWorkshopState');

  // State Accumulation
  let state = createInitialWorkshopState();

  const res1 = getWorkshopResult({
    correctCount: 5,
    answers: Array.from({ length: 5 }, () => ({ gainedScore: 20, rhythmGood: true, fast: true }))
  });
  state = applyWorkshopResult(state, res1);
  assert.strictEqual(state.sales, 100);
  assert.strictEqual(state.reputation, 10);
  console.log('PASSED: applyWorkshopResult (Day 1)');

  const res2 = getWorkshopResult({
    correctCount: 2,
    answers: [
      { gainedScore: 20, rhythmGood: true, fast: false },
      { gainedScore: 20, rhythmGood: false, fast: true },
      { gainedScore: 0, rhythmGood: false, fast: false },
      { gainedScore: 0, rhythmGood: false, fast: false },
      { gainedScore: 0, rhythmGood: false, fast: false }
    ]
  });
  state = applyWorkshopResult(state, res2);
  assert.strictEqual(state.sales, 140);
  assert.strictEqual(state.reputation, 14);
  console.log('PASSED: applyWorkshopResult (Day 2)');

  const res3 = getWorkshopResult({
    correctCount: 0,
    answers: Array.from({ length: 5 }, () => ({ gainedScore: 0, rhythmGood: false, fast: false }))
  });
  state = applyWorkshopResult(state, res3);
  assert.strictEqual(state.sales, 140);
  assert.strictEqual(state.reputation, 14);
  console.log('PASSED: applyWorkshopResult (Day 3)');

  console.log('\n--- All management tests completed successfully! ---');
} catch (err) {
  console.error('\nTEST FAILED:');
  console.error(err);
  process.exit(1);
}
