/**
 * Regression tests for Event System Logic
 */
const assert = require('assert');
const { checkNewEventUnlock, getEventPages } = require('../src/game/eventSystem.js');

console.log('\n--- Made in Maghribal: Event System Tests ---');

try {
  // --- checkNewEventUnlock Tests ---
  const e1 = checkNewEventUnlock('hakima', 2, []);
  assert.strictEqual(e1, null, 'Should not unlock at affection 2');
  console.log('PASSED: No events below threshold');

  const e2 = checkNewEventUnlock('hakima', 5, []);
  assert.ok(e2 !== null);
  assert.strictEqual(e2.id, 'hakima_5');
  console.log('PASSED: Unlock at threshold 5');

  const e3 = checkNewEventUnlock('hakima', 10, ['hakima_5']);
  assert.ok(e3 !== null);
  assert.strictEqual(e3.id, 'hakima_10', 'Should unlock threshold 10 if 5 is seen');
  console.log('PASSED: Unlock threshold 10 after threshold 5 is seen');

  const e4a = checkNewEventUnlock('hakima', 12, []);
  assert.strictEqual(e4a.id, 'hakima_5', 'Should unlock lowest threshold first (5)');

  const e4b = checkNewEventUnlock('hakima', 12, ['hakima_5']);
  assert.strictEqual(e4b.id, 'hakima_10', 'Should unlock next threshold (10) after 5 is seen');

  const e4c = checkNewEventUnlock('hakima', 12, ['hakima_5', 'hakima_10']);
  assert.strictEqual(e4c, null, 'No more events left to unlock');
  console.log('PASSED: Sequential unlocking (4->12 jump)');

  const e5 = checkNewEventUnlock('unknown', 100, []);
  assert.strictEqual(e5, null);
  console.log('PASSED: Safety for unknown heroine');

  // --- getEventPages Tests ---
  console.log('\nTesting getEventPages...');

  const mockEvent = {
    text: 'Normal text',
    routePages: {
      long_history: ['IF page 1', 'IF page 2']
    }
  };

  const p1 = getEventPages(mockEvent, 'normal');
  assert.deepStrictEqual(p1, ['Normal text'], 'Normal route should return base text');
  console.log('PASSED: getEventPages normal route fallback');

  const p2 = getEventPages(mockEvent, 'long_history');
  assert.deepStrictEqual(p2, ['IF page 1', 'IF page 2'], 'long_history should return IF pages');
  console.log('PASSED: getEventPages long_history route selection');

  const mockEventSimple = { text: 'Simple text' };
  const p3 = getEventPages(mockEventSimple, 'long_history');
  assert.deepStrictEqual(p3, ['Simple text'], 'Should fallback if IF text is missing');
  console.log('PASSED: getEventPages fallback for missing IF text');

  const mockEventPages = { pages: ['Page 1', 'Page 2'] };
  const p4 = getEventPages(mockEventPages, 'normal');
  assert.deepStrictEqual(p4, ['Page 1', 'Page 2'], 'Should return pages if provided');
  console.log('PASSED: getEventPages using explicit pages');

  const p5 = getEventPages(mockEvent, undefined);
  assert.deepStrictEqual(p5, ['Normal text'], 'Missing routeMode should fallback to normal text');
  console.log('PASSED: getEventPages fallback for missing routeMode');

  console.log('\n--- All event system tests completed successfully! ---');
} catch (err) {
  console.error('\nTEST FAILED:');
  console.error(err);
  process.exit(1);
}
