const test = require('node:test');
const assert = require('node:assert');
const { getVnRenderModel, getRhythmRenderModel } = require('../../src/core/renderModel.cjs');

test('C011_RENDER_MODEL: VN model with speaker and standing', () => {
  const session = {};
  const step = {
    speakerId: 'CH_HAKIMA',
    speakerExpression: 'joy',
    standingCharacterId: 'CH_HAKIMA',
    standingExpression: 'joy',
    backgroundId: 'AS_BG_SHOP',
    text: 'Hello!'
  };
  const model = getVnRenderModel(session, step);
  assert.strictEqual(model.speaker.name, 'ハキマ', "Speaker name mismatch");
  assert.strictEqual(model.speaker.iconAssetId, 'AS_IC_CH_HAKIMA_joy', "Icon asset ID mismatch");
  assert.strictEqual(model.standing.characterId, 'CH_HAKIMA', "Standing character ID mismatch");
  assert.strictEqual(model.text, 'Hello!', "Dialogue text mismatch");
});

test('C011_RENDER_MODEL: VN model supports narration without speaker or standing', () => {
  const session = {};
  const step = {
    backgroundId: 'AS_BG_SHOP',
    text: 'The shop is quiet.',
    choice: [{ id: 'NEXT', text: 'Continue' }]
  };
  const model = getVnRenderModel(session, step);
  assert.strictEqual(model.backgroundId, 'AS_BG_SHOP', "Background ID mismatch");
  assert.strictEqual(model.speaker, null, "Speaker should be null for narration");
  assert.strictEqual(model.standing, null, "Standing should be null when absent");
  assert.deepStrictEqual(model.choices, [{ id: 'NEXT', text: 'Continue' }], "Choices mismatch");
});

test('C011_RENDER_MODEL: Rhythm model', () => {
  const session = { currentSong: 'main03_puzzle', scores: { revenue: 100 }, turnProgress: 5 };
  const question = { promptText: 'Need armor', correctItemId: 'IT_ARM_AS_01', wrongItemId: 'IT_FOD_AS_01' };
  const model = getRhythmRenderModel(session, question);
  assert.strictEqual(model.songId, 'main03_puzzle', "Song ID mismatch");
  assert.strictEqual(model.question.promptText, 'Need armor', "Prompt text mismatch");
  assert.strictEqual(model.progress.current, 5, "Progress current mismatch");
  assert.deepStrictEqual(model.question.choices, [
    { itemId: 'IT_ARM_AS_01', name: 'Correct Option' },
    { itemId: 'IT_FOD_AS_01', name: 'Wrong Option' }
  ], "Rhythm choices mismatch");
  assert.deepStrictEqual(model.stats, { revenue: 100 }, "Stats mismatch");
});
