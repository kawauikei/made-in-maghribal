/**
 * Audio Validator for MadeInMaghribal project.
 */
const { AUDIO_MANIFEST: MANIFEST } = require('../data/audioManifest.cjs');

/**
 * Validates the audio manifest against defined requirements.
 * @returns {{ok: boolean, reason?: string}}
 */
function validateAudioManifest() {
  // Acceptance: main01_title, main02_shop, main03_puzzle を定義する
  const systemIds = MANIFEST.bgm.system.map(s => s.id);
  if (!systemIds.includes('main01_title')) return { ok: false, reason: "Missing main01_title" };
  if (!systemIds.includes('main02_shop')) return { ok: false, reason: "Missing main02_shop" };
  if (!systemIds.includes('main03_puzzle')) return { ok: false, reason: "Missing main03_puzzle" };

  // Acceptance: 各ヒロインに theme 1曲, game 4曲, ending 2曲を定義する
  const heroines = ['HAKIMA', 'MIRA', 'DARIYA'];
  for (const h of heroines) {
    const data = MANIFEST.bgm.heroines[h];
    if (!data) return { ok: false, reason: `Missing audio data for ${h}` };
    if (!data.theme) return { ok: false, reason: `Missing theme for ${h}` };
    if (data.game.length !== 4) return { ok: false, reason: `Expected 4 game songs for ${h}, got ${data.game.length}` };
    if (!data.ending.normal || !data.ending.good) return { ok: false, reason: `Missing ending songs for ${h}` };
  }

  // Acceptance: SEカテゴリ quiz/ui/day_end が空でない
  if (!MANIFEST.se.quiz || MANIFEST.se.quiz.length === 0) return { ok: false, reason: "SE quiz is empty" };
  if (!MANIFEST.se.ui || MANIFEST.se.ui.length === 0) return { ok: false, reason: "SE ui is empty" };
  if (!MANIFEST.se.day_end || MANIFEST.se.day_end.length === 0) return { ok: false, reason: "SE day_end is empty" };

  return { ok: true };
}

module.exports = { validateAudioManifest };
