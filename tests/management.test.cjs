const assert = require('assert');
const { getWorkshopResult } = require('../src/game/management');

console.log("\n--- Made in Maghribal: Management Logic Tests ---");

try {
  // 5 Correct
  const res5 = getWorkshopResult(5);
  assert.strictEqual(res5.reputation, 3);
  assert.strictEqual(res5.sales, 120);
  assert.strictEqual(res5.satisfaction, 3);
  console.log("✅ PASSED: 5 correct results");

  // 4 Correct
  const res4 = getWorkshopResult(4);
  assert.strictEqual(res4.reputation, 2);
  assert.strictEqual(res4.sales, 100);
  assert.strictEqual(res4.satisfaction, 2);
  console.log("✅ PASSED: 4 correct results");

  // 3 Correct
  const res3 = getWorkshopResult(3);
  assert.strictEqual(res3.reputation, 1);
  assert.strictEqual(res3.sales, 80);
  assert.strictEqual(res3.satisfaction, 1);
  console.log("✅ PASSED: 3 correct results");

  // 2 Correct
  const res2 = getWorkshopResult(2);
  assert.strictEqual(res2.reputation, 0);
  assert.strictEqual(res2.sales, 50);
  assert.strictEqual(res2.satisfaction, 0);
  console.log("✅ PASSED: 2 correct results");

  // 1 Correct
  const res1 = getWorkshopResult(1);
  assert.strictEqual(res1.reputation, -1);
  assert.strictEqual(res1.sales, 20);
  assert.strictEqual(res1.satisfaction, -1);
  console.log("✅ PASSED: 1 correct results");

  // 0 Correct
  const res0 = getWorkshopResult(0);
  assert.strictEqual(res0.reputation, -1);
  assert.strictEqual(res0.sales, 20);
  assert.strictEqual(res0.satisfaction, -1);
  console.log("✅ PASSED: 0 correct results");

  console.log("\n--- All management tests completed successfully! ---");
} catch (err) {
  console.error("\n❌ TEST FAILED:");
  console.error(err);
  process.exit(1);
}
