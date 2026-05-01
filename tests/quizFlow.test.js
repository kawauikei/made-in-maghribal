import assert from 'node:assert';
import { resolveQuizCompletion, createPerfectQuizPayload } from '../src/game/quizFlow.js';

/**
 * Quiz Flow Logic Regression Tests
 */

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ PASSED: ${name}`);
  } catch (err) {
    console.error(`❌ FAILED: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('--- Made in Maghribal: Quiz Flow Logic Tests ---\n');

runTest('Perfect score (5/5) rewards and rank', () => {
  const result = resolveQuizCompletion({
    correctCount: 5,
    totalCount: 5,
    activeHeroineId: 'hakima',
    currentAffection: 10,
    seenEventIds: ['hakima_0', 'hakima_5', 'hakima_10']
  });

  assert.strictEqual(result.isPerfect, true);
  assert.strictEqual(result.affectionGain, 5);
  assert.strictEqual(result.workshopResult.sales, 120);
  assert.strictEqual(result.workshopResult.reputation, 3);
  assert.strictEqual(result.rank.title, '星瓶堂の若店主');
});

runTest('Partial score (3/5) rewards and rank', () => {
  const result = resolveQuizCompletion({
    correctCount: 3,
    totalCount: 5,
    activeHeroineId: 'hakima',
    currentAffection: 10,
    seenEventIds: []
  });

  assert.strictEqual(result.isPerfect, false);
  assert.strictEqual(result.affectionGain, 3);
  assert.strictEqual(result.workshopResult.sales, 80);
  assert.strictEqual(result.workshopResult.reputation, 1);
  assert.strictEqual(result.rank.title, 'かけだし店主');
});

runTest('Low score (1/5) penalties', () => {
  const result = resolveQuizCompletion({
    correctCount: 1,
    totalCount: 5,
    activeHeroineId: 'hakima',
    currentAffection: 10,
    seenEventIds: []
  });

  assert.strictEqual(result.affectionGain, 1);
  assert.strictEqual(result.workshopResult.sales, 20);
  assert.strictEqual(result.workshopResult.reputation, -1);
});

runTest('Event unlock detection (threshold 5)', () => {
  const result = resolveQuizCompletion({
    correctCount: 5,
    totalCount: 5,
    activeHeroineId: 'hakima',
    currentAffection: 0, // 0 + 5 = 5 (Target: hakima_5)
    seenEventIds: ['hakima_0']
  });

  assert.ok(result.unlockedEvent, 'Should unlock an event');
  assert.strictEqual(result.unlockedEvent.id, 'hakima_5');
  assert.strictEqual(result.unlockedEvent.threshold, 5);
});

runTest('Event unlock detection (threshold 10)', () => {
  const result = resolveQuizCompletion({
    correctCount: 5,
    totalCount: 5,
    activeHeroineId: 'hakima',
    currentAffection: 5, // 5 + 5 = 10 (Target: hakima_10)
    seenEventIds: ['hakima_0', 'hakima_5']
  });

  assert.ok(result.unlockedEvent, 'Should unlock an event');
  assert.strictEqual(result.unlockedEvent.id, 'hakima_10');
  assert.strictEqual(result.unlockedEvent.threshold, 10);
});

runTest('Auto Skip (Perfect Payload) consistency with manual 5/5', () => {
  const payload = createPerfectQuizPayload(5, 'hakima', 20, ['hakima_0', 'hakima_5', 'hakima_10']);
  const manual = resolveQuizCompletion({
    correctCount: 5,
    totalCount: 5,
    activeHeroineId: 'hakima',
    currentAffection: 20,
    seenEventIds: ['hakima_0', 'hakima_5', 'hakima_10']
  });

  assert.deepStrictEqual(payload, manual, 'Perfect payload must be identical to manual 5/5 resolution');
});

console.log('\n--- All Quiz Flow tests completed successfully! ---');
