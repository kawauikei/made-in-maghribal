const test = require('node:test');
const assert = require('node:assert');
const { processQuestionResult } = require('../../src/core/rhythmQuizCore.cjs');

test('C008_RHYTHM_QUIZ_CORE: Perfect timing and fast response', () => {
  const state = {
    promptShownAt: 1000,
    answeredAt: 2000, // 1000ms response (<4000)
    selectedItemId: 'IT_ARM_AS_01',
    correctItemId: 'IT_ARM_AS_01',
    nearestBeatMs: 2020 // 20ms diff (<=100)
  };
  const result = processQuestionResult(state);
  assert.strictEqual(result.isCorrect, true);
  assert.strictEqual(result.rating, 'PERFECT');
  assert.strictEqual(result.reputationBonus, 2);
  assert.strictEqual(result.satisfactionBonus, 2);
});

test('C008_RHYTHM_QUIZ_CORE: Good timing and medium response', () => {
  const state = {
    promptShownAt: 1000,
    answeredAt: 5500, // 4500ms response (<6000)
    selectedItemId: 'IT_ARM_AS_01',
    correctItemId: 'IT_ARM_AS_01',
    nearestBeatMs: 5350 // 150ms diff (<=200)
  };
  const result = processQuestionResult(state);
  assert.strictEqual(result.rating, 'GOOD');
  assert.strictEqual(result.satisfactionBonus, 1);
});

test('C008_RHYTHM_QUIZ_CORE: Miss timing and slow response', () => {
  const state = {
    promptShownAt: 1000,
    answeredAt: 7000, // 6000ms response (>=6000)
    selectedItemId: 'IT_ARM_AS_01',
    correctItemId: 'IT_ARM_AS_01',
    nearestBeatMs: 6000 // 1000ms diff (>200)
  };
  const result = processQuestionResult(state);
  assert.strictEqual(result.rating, 'MISS');
  assert.strictEqual(result.reputationBonus, 0);
  assert.strictEqual(result.satisfactionBonus, 0);
});

test('C008_RHYTHM_QUIZ_CORE: Wrong item but perfect timing', () => {
  const state = {
    promptShownAt: 1000,
    answeredAt: 2000,
    selectedItemId: 'WRONG',
    correctItemId: 'CORRECT',
    nearestBeatMs: 2000
  };
  const result = processQuestionResult(state);
  assert.strictEqual(result.isCorrect, false, "Result should be incorrect");
  assert.strictEqual(result.rating, 'PERFECT', "Timing should still be PERFECT");
});
