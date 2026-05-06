const test = require('node:test');
const assert = require('node:assert');
const { generateQuestion, createGeneratedTemplate, selectDifficulty, itemMatchesConditions } = require('../../src/core/quizRequestModel.cjs');
const { ITEM_MASTER } = require('../../src/data/itemMaster.cjs');
const { validateQuestion } = require('../../src/core/quizValidator.cjs');

const RAW_ID_PATTERN = /\b(?:ARM|FOD|MED|ADN|CLT|DAY|WRK|TRV|RIT|TRD|AS|EL|LI|ME|SA)(?:[_\s]|\b)/;

test('C007_QUIZ_REQUEST_MODEL: generated quiz has natural prompt and valid choices', () => {
  for (let i = 0; i < 30; i++) {
    const question = generateQuestion(null, { questionIndex: i % 10, totalQuestions: 10, routeMode: 'normal' });
    assert.ok(question, 'Question should be generated');
    assert.ok(question.promptText, 'Prompt should exist');
    assert.strictEqual(RAW_ID_PATTERN.test(question.promptText), false, `Prompt should not expose raw IDs: ${question.promptText}`);
    const result = validateQuestion(question);
    assert.strictEqual(result.ok, true, result.reason);
  }
});

test('C007_QUIZ_REQUEST_MODEL: generated template carries customer profile and conditions', () => {
  const template = createGeneratedTemplate({ questionIndex: 7, totalQuestions: 10, routeMode: 'long_history' });
  assert.ok(template.customerProfile, 'Customer profile should exist');
  assert.ok(template.customerProfile.iconTone, 'Customer icon tone should exist');
  assert.ok(['easy', 'normal', 'hard'].includes(template.difficultyLevel));
  assert.ok(template.conditions.length >= 1, 'Conditions should exist');
});

test('C007_QUIZ_REQUEST_MODEL: difficulty selector accepts normal and long-history route', () => {
  assert.ok(['easy', 'normal', 'hard'].includes(selectDifficulty({ questionIndex: 0, totalQuestions: 10, routeMode: 'normal' })));
  assert.ok(['easy', 'normal', 'hard'].includes(selectDifficulty({ questionIndex: 9, totalQuestions: 10, routeMode: 'long_history' })));
});

test('C007_QUIZ_REQUEST_MODEL: incorrect choice must be different', () => {
  for (let i = 0; i < 20; i++) {
    const question = generateQuestion(null, { questionIndex: i, totalQuestions: 10, routeMode: 'normal' });
    assert.notStrictEqual(question.correctItemId, question.wrongItemId, 'Correct and wrong items must differ');
  }
});

test('C007_QUIZ_REQUEST_MODEL: quality condition is expressed as correct quality when present', () => {
  let found = false;
  for (let i = 0; i < 80; i++) {
    const question = generateQuestion(null, { questionIndex: 8, totalQuestions: 10, routeMode: 'long_history' });
    const quality = question.conditions.find((condition) => condition.type === 'quality')?.value;
    if (quality) {
      found = true;
      assert.strictEqual(question.correctQuality, quality);
      assert.strictEqual(validateQuestion(question).ok, true);
      break;
    }
  }
  assert.strictEqual(found, true, 'At least one generated late/long-history question should include quality');
});


test('C007_QUIZ_REQUEST_MODEL: generated prompt seed remains eligible as the correct item source', () => {
  for (let i = 0; i < 30; i++) {
    const template = createGeneratedTemplate({ questionIndex: i % 10, totalQuestions: 10, routeMode: 'long_history' });
    assert.ok(template.seedItemId, 'Generated template should keep the seed item used for request text');
    const seedItem = ITEM_MASTER.find((item) => item.itemId === template.seedItemId);
    assert.ok(seedItem, 'Seed item should exist');
    assert.strictEqual(itemMatchesConditions(seedItem, template.conditions), true, 'Seed item should match generated request conditions');
  }
});


test('C007_QUIZ_REQUEST_MODEL: generated prompts avoid known unnatural request fragments', () => {
  const badFragments = [
    /日用を/,
    /貿易を/,
    /儀式を/,
    /食糧を/,
    /アクセサリー/,
    /丈夫な王宮に納める/,
    /客に出せる日々使える/,
    /任務用の王宮に納める/,
    /(手頃な|普段使いの|日々使える)王宮/
  ];

  for (let i = 0; i < 120; i++) {
    const question = generateQuestion(null, {
      questionIndex: i % 10,
      totalQuestions: 10,
      routeMode: i % 2 === 0 ? 'normal' : 'long_history'
    });
    for (const pattern of badFragments) {
      assert.strictEqual(pattern.test(question.promptText), false, `Prompt contains unnatural fragment: ${question.promptText}`);
    }
  }
});

test('C007_QUIZ_REQUEST_MODEL: generated prompts include a situation for item-type requests', () => {
  const question = generateQuestion({
    templateId: 'TEST_RICH_ITEMTYPE',
    customerType: 'test',
    customerProfile: { id: 'test', speechStyle: 'young_male', iconTone: 'sky', label: '若い客' },
    difficultyLevel: 'easy',
    decoyDifficulty: 'near_match',
    seedItemId: 'IT_DAY_AS_01',
    conditionPatternId: 'itemType',
    conditions: [{ type: 'itemType', value: 'DAY_01' }],
    text: null
  });

  assert.ok(question.promptText.includes('。'), `Prompt should include situation text: ${question.promptText}`);
  assert.match(question.promptText, /(油灯|品|暮らし|用事|店先)/);
});

test('C007_QUIZ_REQUEST_MODEL: near-match decoy chooses a similar but incorrect item', () => {
  const question = generateQuestion({
    templateId: 'TEST_NEAR_DECOY',
    customerType: 'test',
    customerProfile: { id: 'test', speechStyle: 'young_male', iconTone: 'sky', label: '若い客' },
    difficultyLevel: 'easy',
    decoyDifficulty: 'near_match',
    seedItemId: 'IT_ARM_AS_01',
    conditionPatternId: 'itemType',
    conditions: [{ type: 'itemType', value: 'ARM_01' }],
    text: null
  });

  assert.notStrictEqual(question.correctItemId, question.wrongItemId);
  assert.ok(question.decoySimilarityScore >= 4, `Expected similar decoy, got score ${question.decoySimilarityScore}`);
  assert.strictEqual(validateQuestion(question).ok, true);
});
