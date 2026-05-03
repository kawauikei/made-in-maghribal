import assert from 'node:assert';
import { createQuizSession, isItemMatchingCriteria } from '../src/game/quizEngine.js';
import { getRankInfo } from '../src/game/scoring.js';

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

console.log('--- Made in Maghribal: Quiz Engine Regression Tests ---\n');

runTest('Create session with default count (10)', () => {
  const session = createQuizSession();
  assert.strictEqual(session.questions.length, 10);
});

runTest('Create session with custom count (5)', () => {
  const session = createQuizSession({ questionCount: 5 });
  assert.strictEqual(session.questions.length, 5);
});

runTest('Each question has 2 choices and 1 correct answer', () => {
  const session = createQuizSession({ questionCount: 10 });
  session.questions.forEach((q, i) => {
    assert.strictEqual(q.choices.length, 2, `Q${i} should have 2 choices`);
    const correctChoices = q.choices.filter(c => c.id === q.correctItemId);
    assert.strictEqual(correctChoices.length, 1, `Q${i} should have exactly 1 correct choice`);
    const correctItem = q.choices.find(c => c.id === q.correctItemId);
    assert.ok(isItemMatchingCriteria(correctItem, q.criteria), `Q${i} correctItem must match criteria`);
  });
});

runTest('M7b-1: Variety guarantee for 5-question sessions (100 iterations)', () => {
  const ITERATIONS = 100;
  const firstTypes = new Set();
  const requiredTypes = ['color', 'genre', 'itemType', 'colorAndItemType'];

  for (let i = 0; i < ITERATIONS; i++) {
    const session = createQuizSession({ questionCount: 5 });
    const typesFound = new Set(session.questions.map(q => q.request.type));
    requiredTypes.forEach(type => {
      assert.ok(typesFound.has(type), `Iteration ${i}: Missing required type "${type}"`);
    });
    firstTypes.add(session.questions[0].request.type);
  }

  assert.ok(firstTypes.size > 1, 'First question type variety is too low (shuffle failure?)');
  console.log(`   (Variety stats: first question types seen: ${Array.from(firstTypes).join(', ')})`);
});

runTest('M7b-2: Correct item uniqueness in 5-question sessions (100 iterations)', () => {
  const ITERATIONS = 100;
  for (let i = 0; i < ITERATIONS; i++) {
    const session = createQuizSession({ questionCount: 5 });
    const correctIds = session.questions.map(q => q.correctItemId);
    const uniqueIds = new Set(correctIds);
    assert.strictEqual(uniqueIds.size, 5, `Iteration ${i}: Found duplicate correct items: ${correctIds.join(', ')}`);
  }
});

runTest('Boundary: count = 1', () => {
  const session = createQuizSession({ questionCount: 1 });
  assert.strictEqual(session.questions.length, 1);
});

runTest('Boundary: count = 0', () => {
  const session = createQuizSession({ questionCount: 0 });
  assert.strictEqual(session.questions.length, 0);
});

runTest('Scoring: Rank thresholds for 5-question sessions', () => {
  const top = getRankInfo(5, 5).title;
  const second = getRankInfo(4, 5).title;
  const third = getRankInfo(3, 5).title;
  const fourth = getRankInfo(2, 5).title;
  const fifth = getRankInfo(1, 5).title;
  const zero = getRankInfo(0, 5).title;

  assert.notStrictEqual(top, second);
  assert.notStrictEqual(second, third);
  assert.notStrictEqual(third, fourth);
  assert.notStrictEqual(fourth, fifth);
  assert.strictEqual(fifth, zero);
});

console.log('\n--- All tests completed successfully! ---');
