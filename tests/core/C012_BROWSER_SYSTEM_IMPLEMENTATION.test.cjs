const test = require('node:test');
const assert = require('node:assert');

const {
  PLAYER_PROGRESS_KEY,
  clearPlayerProgress,
  getPlayerProgressSummary,
  loadPlayerProgress,
  recordQuizHistory
} = require('../../browser/utils/playerProgress.js');

function installLocalStorage() {
  const store = new Map();
  global.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
  return store;
}

test('C012_BROWSER_SYSTEM_IMPLEMENTATION: quiz history is stored newest first and exposed in summary', () => {
  installLocalStorage();
  clearPlayerProgress();

  recordQuizHistory({ prompt: 'first', result: 'good' });
  recordQuizHistory({ prompt: 'second', result: 'miss' });

  const progress = loadPlayerProgress();
  const summary = getPlayerProgressSummary();

  assert.strictEqual(progress.quizHistory.length, 2);
  assert.strictEqual(progress.quizHistory[0].prompt, 'second');
  assert.strictEqual(progress.quizHistory[1].prompt, 'first');
  assert.strictEqual(summary.quizHistory[0].prompt, 'second');
  assert.ok(progress.quizHistory[0].recordedAt);

  delete global.localStorage;
});

test('C012_BROWSER_SYSTEM_IMPLEMENTATION: quiz history is capped at 200 entries', () => {
  const store = installLocalStorage();
  clearPlayerProgress();

  for (let index = 0; index < 205; index += 1) {
    recordQuizHistory({ prompt: `question-${index}`, result: 'good' });
  }

  const progress = JSON.parse(store.get(PLAYER_PROGRESS_KEY));
  assert.strictEqual(progress.quizHistory.length, 200);
  assert.strictEqual(progress.quizHistory[0].prompt, 'question-204');
  assert.strictEqual(progress.quizHistory[199].prompt, 'question-5');

  delete global.localStorage;
});
