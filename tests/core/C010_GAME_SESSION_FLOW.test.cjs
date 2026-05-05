const test = require('node:test');
const assert = require('node:assert');
const { GameSession } = require('../../src/core/gameSessionFlow.cjs');

test('C010_GAME_SESSION_FLOW: Initial state', () => {
  const session = new GameSession();
  assert.strictEqual(session.phase, 'TITLE');
  assert.strictEqual(session.turn, 1);
});

test('C010_GAME_SESSION_FLOW: Phase transitions', () => {
  const session = new GameSession();
  session.nextPhase();
  assert.strictEqual(session.phase, 'OPENING');
  session.nextPhase();
  assert.strictEqual(session.phase, 'HEROINE_SELECT');
  session.nextPhase();
  assert.strictEqual(session.phase, 'MAIN_GAME');
});

test('C010_GAME_SESSION_FLOW: Sub-phase transitions and turn advancement', () => {
  const session = new GameSession();
  session.phase = 'MAIN_GAME';
  session.subPhase = 'BEFORE_OPEN';
  
  session.nextSubPhase(); // -> QUIZ
  assert.strictEqual(session.subPhase, 'QUIZ');
  session.nextSubPhase(); // -> TURN_RESULT
  session.nextSubPhase(); // -> AFTER_CLOSE
  session.nextSubPhase(); // -> BEFORE_OPEN (Turn 2)
  
  assert.strictEqual(session.turn, 2);
  assert.strictEqual(session.subPhase, 'BEFORE_OPEN');
});

test('C010_GAME_SESSION_FLOW: Song scheduling', () => {
  const session = new GameSession();
  session.selectHeroine('HAKIMA', 'normal');
  
  assert.strictEqual(session.currentSong, 'main03_puzzle', "Turn 1 song should be main03_puzzle");
  
  session.turn = 2;
  assert.strictEqual(session.currentSong, 'BGM_GAME_HAKIMA_1', "Turn 2 normal song mismatch");
  
  session.routeMode = 'extra';
  assert.strictEqual(session.currentSong, 'BGM_GAME_HAKIMA_EXTRA', "Turn 2 extra song mismatch");
});
