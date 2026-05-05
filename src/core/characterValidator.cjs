/**
 * Validator for Characters in MadeInMaghribal project.
 */
const { CHARACTERS } = require('../data/characters.cjs');
const { getAllToneGuideIds } = require('./toneGuideValidator.cjs');

/**
 * Validates the character master data against defined constraints.
 * @param {object[]} characters - Array of character objects.
 * @returns {{ok: boolean, reason?: string}}
 */
function validateCharacters(characters = CHARACTERS) {
  const toneGuideIds = getAllToneGuideIds();
  
  const protagonists = characters.filter(c => c.role === 'protagonist');
  const heroines = characters.filter(c => c.role === 'heroine');

  // Acceptance: protagonist は nadir 1人だけ定義される
  if (protagonists.length !== 1 || protagonists[0].characterId !== 'CH_NADIR') {
    return { ok: false, reason: "Must have exactly one protagonist: CH_NADIR" };
  }

  // Acceptance: heroine は hakima, mira, dariya の3人が定義される
  const expectedHeroineIds = ['CH_HAKIMA', 'CH_MIRA', 'CH_DARIYA'];
  const actualHeroineIds = heroines.map(h => h.characterId).sort();
  if (JSON.stringify(actualHeroineIds) !== JSON.stringify(expectedHeroineIds.sort())) {
    return { ok: false, reason: "Heroines must be exactly CH_HAKIMA, CH_MIRA, and CH_DARIYA" };
  }

  for (const char of characters) {
    // Acceptance: 全characterがtoneGuideIdを参照する
    if (!char.toneGuideId) {
      return { ok: false, reason: `Character ${char.characterId} is missing toneGuideId` };
    }
    if (!toneGuideIds.includes(char.toneGuideId)) {
      return { ok: false, reason: `Character ${char.characterId} refers to unknown ToneGuide ${char.toneGuideId}` };
    }

    // Acceptance: シナリオ本文をcharacter/tone guideに含めない
    // 簡易チェック：文字数制限
    for (const key in char) {
      if (typeof char[key] === 'string' && char[key].length > 200) {
        return { ok: false, reason: `Character ${char.characterId} field ${key} contains too much text (possibly scenario)` };
      }
    }
  }

  return { ok: true };
}

module.exports = { validateCharacters };
