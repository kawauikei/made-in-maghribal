const test = require('node:test');
const assert = require('node:assert');
const { validateAudioManifest } = require('../../src/core/audioValidator.cjs');
const { AUDIO_MANIFEST } = require('../../src/data/audioManifest.cjs');

test('C005_AUDIO_MANIFEST: Overall validation', () => {
  const result = validateAudioManifest();
  assert.strictEqual(result.ok, true, result.reason);
});

test('C005_AUDIO_MANIFEST: System songs check', () => {
  const systemIds = AUDIO_MANIFEST.bgm.system.map(s => s.id);
  assert.ok(systemIds.includes('main03_puzzle'), "Turn 1 fixed song main03_puzzle must exist");
});

test('C005_AUDIO_MANIFEST: Heroine song count check', () => {
  for (const h in AUDIO_MANIFEST.bgm.heroines) {
    const data = AUDIO_MANIFEST.bgm.heroines[h];
    assert.strictEqual(data.game.length, 4, `Heroine ${h} should have 4 game songs`);
    assert.ok(data.ending.normal, `Heroine ${h} should have a normal ending song`);
    assert.ok(data.ending.good, `Heroine ${h} should have a good ending song`);
  }
});

test('C005_AUDIO_MANIFEST: SE categories check', () => {
  assert.ok(AUDIO_MANIFEST.se.quiz.length > 0, "Quiz SE category should not be empty");
  assert.ok(AUDIO_MANIFEST.se.ui.length > 0, "UI SE category should not be empty");
  assert.ok(AUDIO_MANIFEST.se.day_end.length > 0, "Day end SE category should not be empty");
});
