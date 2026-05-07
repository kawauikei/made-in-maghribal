/**
 * C014_EVENT_PLAYER: Event Player logic and progress integration test.
 */

const test = require('node:test');
const assert = require('node:assert');
const { markEventSeen, isEventSeen, setEventFlag, hasEventFlag, getDefaultPlayerProgress, normalizeProgress, clearPlayerProgress } = require('../../browser/utils/playerProgress.js');

// Mock localStorage for tests
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = val; },
  removeItem: (key) => { delete mockStorage[key]; }
};

test('C014_EVENT_PLAYER: track event seen status', () => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  const eventId = 'EV_TEST_01';
  assert.strictEqual(isEventSeen(eventId), false);
  
  markEventSeen(eventId);
  assert.strictEqual(isEventSeen(eventId), true);
});

test('C014_EVENT_PLAYER: track event flags', () => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  const flagId = 'FLG_HAKIMA_PROMISE';
  assert.strictEqual(hasEventFlag(flagId), false);
  
  setEventFlag(flagId, true);
  assert.strictEqual(hasEventFlag(flagId), true);
});

test('C014_EVENT_PLAYER: persist across loads', () => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  setEventFlag('PERSIST_TEST', 123);
  markEventSeen('EV_PERSIST');
  
  const progressRaw = mockStorage['madeinmaghribal.playerProgress.v1'];
  assert.ok(progressRaw, 'Storage should contain progress data');
  const normalized = normalizeProgress(JSON.parse(progressRaw));
  
  assert.strictEqual(normalized.eventSeen['EV_PERSIST'], true);
  assert.strictEqual(normalized.eventFlags['PERSIST_TEST'], 123);
});

test('C014_EVENT_PLAYER: reset on clear', () => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  markEventSeen('EV_BEFORE_CLEAR');
  clearPlayerProgress();
  
  assert.strictEqual(isEventSeen('EV_BEFORE_CLEAR'), false);
});
