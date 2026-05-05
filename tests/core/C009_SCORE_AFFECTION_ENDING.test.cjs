const test = require('node:test');
const assert = require('node:assert');
const { updateGameScore } = require('../../src/core/scoreModel.cjs');
const { calculateAffection } = require('../../src/core/affectionModel.cjs');
const { evaluateEnding } = require('../../src/core/endingBranch.cjs');

test('C009_SCORE_AFFECTION_ENDING: Score accumulation and clamping', () => {
  const current = { revenue: 495, satisfaction: 99, reputation: 99 };
  const res = { isCorrect: true, satisfactionBonus: 2, reputationBonus: 2 };
  const updated = updateGameScore(current, res);
  
  assert.strictEqual(updated.revenue, 500, "Revenue should be capped at 500");
  assert.strictEqual(updated.satisfaction, 100, "Satisfaction should be capped at 100");
  assert.strictEqual(updated.reputation, 100, "Reputation should be capped at 100");
});

test('C009_SCORE_AFFECTION_ENDING: Affection calculation', () => {
  const score = { revenue: 500, satisfaction: 100, reputation: 100 };
  const history = { maxSatisfaction: 100, maxReputation: 100 };
  
  // (500 + 100 + 100 + 100 + 100) / 5 = 900 / 5 = 180 -> clipped to 100
  assert.strictEqual(calculateAffection(score, history), 100);

  const lowScore = { revenue: 100, satisfaction: 50, reputation: 50 };
  const lowHistory = { maxSatisfaction: 50, maxReputation: 50 };
  // (100 + 50 + 50 + 50 + 50) / 5 = 300 / 5 = 60
  assert.strictEqual(calculateAffection(lowScore, lowHistory), 60);
});

test('C009_SCORE_AFFECTION_ENDING: Ending evaluation', () => {
  assert.strictEqual(evaluateEnding(60, false), 'GOOD', "Normal route Good ending >= 60");
  assert.strictEqual(evaluateEnding(59, false), 'NORMAL', "Normal route Normal ending < 60");
  
  assert.strictEqual(evaluateEnding(80, true), 'GOOD', "Extra route Good ending >= 80");
  assert.strictEqual(evaluateEnding(79, true), 'NORMAL', "Extra route Normal ending < 80");
});
