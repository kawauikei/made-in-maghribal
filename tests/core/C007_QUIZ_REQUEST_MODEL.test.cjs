const test = require('node:test');
const assert = require('node:assert');
const { QUIZ_REQUEST_TEMPLATES } = require('../../src/data/quizRequestTemplates.cjs');
const { generateQuestion } = require('../../src/core/quizRequestModel.cjs');
const { validateQuestion } = require('../../src/core/quizValidator.cjs');

test('C007_QUIZ_REQUEST_MODEL: Standard genre quiz generation', () => {
  const template = QUIZ_REQUEST_TEMPLATES.find(t => t.templateId === 'QT_STD_GENRE_ARM');
  const question = generateQuestion(template);
  assert.ok(question, "Question should be generated");
  const result = validateQuestion(question, template);
  assert.strictEqual(result.ok, true, result.reason);
});

test('C007_QUIZ_REQUEST_MODEL: Heroine principle quiz generation', () => {
  const template = QUIZ_REQUEST_TEMPLATES.find(t => t.templateId === 'QT_HAK_PRINCIPLE_LI');
  const question = generateQuestion(template);
  assert.ok(question, "Question should be generated");
  const result = validateQuestion(question, template);
  assert.strictEqual(result.ok, true, result.reason);
});

test('C007_QUIZ_REQUEST_MODEL: Extra difficulty (2 conditions) quiz generation', () => {
  const template = QUIZ_REQUEST_TEMPLATES.find(t => t.templateId === 'QT_EXTRA_GENRE_FOD_PRIN_SA');
  const question = generateQuestion(template);
  assert.ok(question, "Question should be generated");
  const result = validateQuestion(question, template);
  assert.strictEqual(result.ok, true, result.reason);
  assert.strictEqual(question.difficulty, 2, "Should have 2 conditions");
});

test('C007_QUIZ_REQUEST_MODEL: Incorrect choice must be different', () => {
  const template = QUIZ_REQUEST_TEMPLATES[0];
  for (let i = 0; i < 20; i++) {
    const question = generateQuestion(template);
    assert.notStrictEqual(question.correctItemId, question.wrongItemId, "Correct and wrong items must differ");
  }
});
