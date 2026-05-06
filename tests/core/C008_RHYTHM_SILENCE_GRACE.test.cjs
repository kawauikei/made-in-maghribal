const test = require('node:test');
const assert = require('node:assert');
const {
  calculateSilenceGraceFromElapsedMs,
  getRhythmSilenceGraceMs
} = require('../../browser/utils/rhythmNoteMaps.js');

test('C008_RHYTHM_SILENCE_GRACE: no grace before two seconds without notes', () => {
  assert.strictEqual(calculateSilenceGraceFromElapsedMs(1999), 0);
});

test('C008_RHYTHM_SILENCE_GRACE: adds 1500ms after two seconds and caps at 3000ms', () => {
  assert.strictEqual(calculateSilenceGraceFromElapsedMs(2000), 1500);
  assert.strictEqual(calculateSilenceGraceFromElapsedMs(4200), 3000);
  assert.strictEqual(calculateSilenceGraceFromElapsedMs(9000), 3000);
});

test('C008_RHYTHM_SILENCE_GRACE: derives grace from current loop position in a silent gap', () => {
  const noteMap = {
    durationMs: 10000,
    playbackTrim: { enabled: true, startMs: 0, endMs: 10000 },
    notes: [{ timeMs: 0 }, { timeMs: 1000 }, { timeMs: 6000 }]
  };

  assert.strictEqual(getRhythmSilenceGraceMs(noteMap, 2500), 0);
  assert.strictEqual(getRhythmSilenceGraceMs(noteMap, 3000), 1500);
  assert.strictEqual(getRhythmSilenceGraceMs(noteMap, 5200), 3000);
});

test('C008_RHYTHM_SILENCE_GRACE: first delayed note receives grace at the note timing', () => {
  const noteMap = {
    durationMs: 12000,
    playbackTrim: { enabled: true, startMs: 0, endMs: 12000 },
    notes: [{ timeMs: 3500 }, { timeMs: 5000 }, { timeMs: 7000 }]
  };

  assert.strictEqual(getRhythmSilenceGraceMs(noteMap, 3490), 1500);
  assert.strictEqual(getRhythmSilenceGraceMs(noteMap, 3500), 1500);
});
