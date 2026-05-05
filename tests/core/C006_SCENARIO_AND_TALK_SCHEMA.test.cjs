const test = require('node:test');
const assert = require('node:assert');
const { validateScenarioStep } = require('../../src/core/scenarioValidator.cjs');
const { SCENARIO_SAMPLES } = require('../../src/data/scenarioSamples.cjs');
const { DAILY_TALK_SAMPLES } = require('../../src/data/dailyTalkSamples.cjs');

test('C006_SCENARIO_AND_TALK_SCHEMA: Sample scenario validation', () => {
  for (const step of SCENARIO_SAMPLES.SC_OP_OPENING) {
    const result = validateScenarioStep(step);
    assert.strictEqual(result.ok, true, result.reason);
  }
});

test('C006_SCENARIO_AND_TALK_SCHEMA: UI-only expression in scenario standing', () => {
  const invalidStep = {
    standingCharacterId: 'CH_HAKIMA',
    standingExpression: 'maid' // UI-only
  };
  const result = validateScenarioStep(invalidStep);
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, "Cannot use UI-only expression in scenario context");
});

test('C006_SCENARIO_AND_TALK_SCHEMA: Daily Talk structure check', () => {
  for (const talk of DAILY_TALK_SAMPLES) {
    assert.ok(talk.topicId, "Should have topicId");
    assert.ok(talk.heroineId, "Should have heroineId");
    assert.ok(talk.lines.length > 0, "Should have dialogue lines");
  }
});
