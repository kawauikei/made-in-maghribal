const test = require('node:test');
const assert = require('node:assert');
const {
  getTitleRenderModel,
  getHeroineSelectRenderModel,
  getVnRenderModel,
  getRhythmRenderModel,
  getTurnResultRenderModel
} = require('../../src/core/renderModel.cjs');

test('C011_RENDER_MODEL: Title model without save data', () => {
  const model = getTitleRenderModel();
  assert.strictEqual(model.title, 'Made in Maghribal', "Title mismatch");
  assert.strictEqual(model.backgroundId, 'AS_BG_TITLE', "Background ID mismatch");
  assert.strictEqual(model.canContinue, false, "canContinue should be false without save data");
  assert.strictEqual(model.lastHeroineId, null, "lastHeroineId should be null without save data");
});

test('C011_RENDER_MODEL: Title model with save summary', () => {
  const saveSummary = { selectedHeroineId: 'HAKIMA', turn: 2, phase: 'MAIN_GAME' };
  const model = getTitleRenderModel({ saveSummary });
  assert.strictEqual(model.canContinue, true, "canContinue should be true with save data");
  assert.strictEqual(model.lastHeroineId, 'HAKIMA', "lastHeroineId mismatch");
  assert.deepStrictEqual(model.saveSummary, saveSummary, "saveSummary mismatch");
});

test('C011_RENDER_MODEL: Heroine select model with route unlocks', () => {
  const model = getHeroineSelectRenderModel({
    heroines: [
      { id: 'HAKIMA', name: 'ハキマ', title: '錬金術師', desc: '相談相手' },
      { id: 'MIRA', name: 'ミラ', title: '案内役', desc: '協力者' }
    ],
    progressSummary: {
      heroineModeUnlocks: {
        HAKIMA: { long_history: true },
        MIRA: { long_history: false }
      }
    }
  });
  assert.strictEqual(model.canSelectExtra, true, "canSelectExtra mismatch");
  assert.deepStrictEqual(model.heroines.map((heroine) => heroine.heroineId), ['HAKIMA', 'MIRA'], "Heroine IDs mismatch");
  assert.strictEqual(model.heroines[0].routeModes.normal, true, "Normal route should always be selectable");
  assert.strictEqual(model.heroines[0].routeModes.long_history, true, "Hakima long history unlock mismatch");
  assert.strictEqual(model.heroines[1].routeModes.long_history, false, "Mira long history unlock mismatch");
});

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

test('C011_RENDER_MODEL: Turn result model includes totals and deltas', () => {
  const model = getTurnResultRenderModel({
    turn: 2,
    scores: { revenue: 150, satisfaction: 20, reputation: 9 },
    startScores: { revenue: 100, satisfaction: 5, reputation: 4 },
    rank: 'GOOD',
    heroineComment: 'いい営業だったわ。',
    unlocks: [{ type: 'route', id: 'long_history' }]
  });
  assert.strictEqual(model.turn, 2, "Turn mismatch");
  assert.strictEqual(model.stats.totalScore, 179, "Total score mismatch");
  assert.deepStrictEqual(model.stats.delta, { revenue: 50, satisfaction: 15, reputation: 5 }, "Delta mismatch");
  assert.strictEqual(model.stats.rank, 'GOOD', "Rank mismatch");
  assert.strictEqual(model.heroineComment, 'いい営業だったわ。', "Heroine comment mismatch");
  assert.deepStrictEqual(model.unlocks, [{ type: 'route', id: 'long_history' }], "Unlocks mismatch");
});
