import assert from 'node:assert';
import { createQuizSession, isItemMatchingCriteria } from '../src/game/quizEngine.js';
import { getRankInfo } from '../src/game/scoring.js';

/**
 * Quiz Engine Regression Tests
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

console.log('--- Made in Maghribal: Quiz Engine Regression Tests ---\n');

// 1. Basic Generation
runTest('Create session with default count (20)', () => {
  const session = createQuizSession();
  assert.strictEqual(session.questions.length, 20);
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
    
    // Logic verification: Is correctItemId actually matching criteria?
    const correctItem = q.choices.find(c => c.id === q.correctItemId);
    assert.ok(isItemMatchingCriteria(correctItem, q.criteria), `Q${i} correctItem must match criteria`);
  });
});

// 2. M7b-1: Request Type Variety (5 questions)
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
  
  // Shuffle check: 1st question should not always be the same type across 100 runs
  assert.ok(firstTypes.size > 1, 'First question type variety is too low (shuffle failure?)');
  console.log(`   (Variety stats: first question types seen: ${Array.from(firstTypes).join(', ')})`);
});

// M7b-2: Duplicate Prevention
runTest('M7b-2: Correct item uniqueness in 5-question sessions (100 iterations)', () => {
  const ITERATIONS = 100;
  for (let i = 0; i < ITERATIONS; i++) {
    const session = createQuizSession({ questionCount: 5 });
    const correctIds = session.questions.map(q => q.correctItemId);
    const uniqueIds = new Set(correctIds);
    
    assert.strictEqual(uniqueIds.size, 5, `Iteration ${i}: Found duplicate correct items: ${correctIds.join(', ')}`);
  }
});

// 3. Backward Compatibility / Boundaries
runTest('Boundary: count = 1', () => {
  const session = createQuizSession({ questionCount: 1 });
  assert.strictEqual(session.questions.length, 1);
});

runTest('Boundary: count = 0', () => {
  const session = createQuizSession({ questionCount: 0 });
  assert.strictEqual(session.questions.length, 0);
});

// 4. Scoring: Rank Info (M7a spec)
runTest('Scoring: Rank titles for 5-question sessions', () => {
  assert.strictEqual(getRankInfo(5).title, 'マグリバル一の目利き');
  assert.strictEqual(getRankInfo(4).title, '腕利き店主');
  assert.strictEqual(getRankInfo(3).title, '駆け出し店主');
  assert.strictEqual(getRankInfo(2).title, '新米鑑定士');
  assert.strictEqual(getRankInfo(1).title, '迷える見習い');
  assert.strictEqual(getRankInfo(0).title, '迷える見習い');
});

console.log('\n--- All tests completed successfully! ---');
