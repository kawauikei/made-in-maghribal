import assert from 'node:assert';
import { resolveQuizCompletion, createPerfectQuizPayload } from '../src/game/quizFlow.js';

function runTest(name, fn) {
  try {
    fn();
    console.log(`PASSED: ${name}`);
  } catch (err) {
    console.error(`FAILED: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('--- Made in Maghribal: Quiz Flow Logic Tests ---\n');

const makeAnswer = (isCorrect, gainedScore = 20, rhythmGood = true, fast = true) => ({
  questionId: `q_${Math.random().toString(36).slice(2, 8)}`,
  selectedItemId: 'item',
  correctItemId: 'item',
  isCorrect,
  rhythmGood,
  fast,
  gainedScore,
});

runTest('Perfect score (10/10) rewards and rank', () => {
  const answers = Array.from({ length: 10 }, () => makeAnswer(true, 20, true, true));
  const result = resolveQuizCompletion({
    correctCount: 10,
    totalCount: 10,
    activeHeroineId: 'hakima',
    currentAffection: 10,
    seenEventIds: ['hakima_0', 'hakima_5', 'hakima_10'],
    answers
  });

  assert.strictEqual(result.isPerfect, true);
  assert.strictEqual(result.affectionGain, 10);
  assert.strictEqual(result.workshopResult.sales, 200);
  assert.strictEqual(result.workshopResult.reputation, 20);
  assert.ok(typeof result.rank.title === 'string' && result.rank.title.length > 0);
});

runTest('Partial score (8/10) rewards and rank', () => {
  const answers = [
    ...Array.from({ length: 8 }, () => makeAnswer(true, 20, true, false)),
    ...Array.from({ length: 2 }, () => makeAnswer(false, 0, false, false)),
  ];
  const result = resolveQuizCompletion({
    correctCount: 8,
    totalCount: 10,
    activeHeroineId: 'hakima',
    currentAffection: 10,
    seenEventIds: [],
    answers
  });

  assert.strictEqual(result.isPerfect, false);
  assert.strictEqual(result.affectionGain, 8);
  assert.strictEqual(result.workshopResult.sales, 160);
  assert.strictEqual(result.workshopResult.reputation, 16);
  assert.ok(typeof result.rank.title === 'string' && result.rank.title.length > 0);
});

runTest('Low score (2/10) penalties', () => {
  const answers = [
    ...Array.from({ length: 2 }, () => makeAnswer(true, 20, false, false)),
    ...Array.from({ length: 8 }, () => makeAnswer(false, 0, false, false)),
  ];
  const result = resolveQuizCompletion({
    correctCount: 2,
    totalCount: 10,
    activeHeroineId: 'hakima',
    currentAffection: 10,
    seenEventIds: [],
    answers
  });

  assert.strictEqual(result.affectionGain, 2);
  assert.strictEqual(result.workshopResult.sales, 40);
  assert.strictEqual(result.workshopResult.reputation, 4);
  assert.ok(typeof result.rank.title === 'string' && result.rank.title.length > 0);
});

runTest('Event unlock detection (threshold 5)', () => {
  const result = resolveQuizCompletion({
    correctCount: 10,
    totalCount: 10,
    activeHeroineId: 'hakima',
    currentAffection: 0,
    seenEventIds: ['hakima_0']
  });

  assert.ok(result.unlockedEvent, 'Should unlock an event');
  assert.strictEqual(result.unlockedEvent.id, 'hakima_5');
  assert.strictEqual(result.unlockedEvent.threshold, 5);
});

runTest('Event unlock detection (threshold 20)', () => {
  const result = resolveQuizCompletion({
    correctCount: 10,
    totalCount: 10,
    activeHeroineId: 'hakima',
    currentAffection: 10,
    seenEventIds: ['hakima_0', 'hakima_5', 'hakima_10']
  });

  assert.ok(result.unlockedEvent, 'Should unlock an event');
  assert.strictEqual(result.unlockedEvent.id, 'hakima_20');
  assert.strictEqual(result.unlockedEvent.threshold, 20);
});

runTest('Auto Skip (Perfect Payload) consistency with manual 10/10', () => {
  const answers = Array.from({ length: 10 }, () => makeAnswer(true, 20, true, true));
  const payload = createPerfectQuizPayload(10, 'hakima', 20, ['hakima_0', 'hakima_10', 'hakima_20']);
  const manual = resolveQuizCompletion({
    correctCount: 10,
    totalCount: 10,
    activeHeroineId: 'hakima',
    currentAffection: 20,
    seenEventIds: ['hakima_0', 'hakima_10', 'hakima_20'],
    answers
  });

  assert.deepStrictEqual(payload, manual, 'Perfect payload must be identical to manual 10/10 resolution');
});

console.log('\n--- All Quiz Flow tests completed successfully! ---');
