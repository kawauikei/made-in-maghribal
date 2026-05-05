const test = require('node:test');
const assert = require('node:assert');
const { CHARACTERS } = require('../../src/data/characters.cjs');
const { TONE_GUIDES } = require('../../src/data/toneGuides.cjs');
const { validateCharacters } = require('../../src/core/characterValidator.cjs');
const { validateToneGuide } = require('../../src/core/toneGuideValidator.cjs');

test('C002_CHARACTER_AND_TONE_DATA: Character master data validation', () => {
  const result = validateCharacters();
  assert.strictEqual(result.ok, true, result.reason);
});

test('C002_CHARACTER_AND_TONE_DATA: Protagonist constraint', () => {
  const invalid = [
    { characterId: 'CH_NADIR', role: 'protagonist', toneGuideId: 'TG_NADIR' },
    { characterId: 'CH_ALEX', role: 'protagonist', toneGuideId: 'TG_NADIR' }
  ];
  const result = validateCharacters(invalid);
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, "Must have exactly one protagonist: CH_NADIR");
});

test('C002_CHARACTER_AND_TONE_DATA: Heroine constraint', () => {
  const invalid = [
    { characterId: 'CH_NADIR', role: 'protagonist', toneGuideId: 'TG_NADIR' },
    { characterId: 'CH_HAKIMA', role: 'heroine', toneGuideId: 'TG_HAKIMA' }
    // missing mira and dariya
  ];
  const result = validateCharacters(invalid);
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, "Heroines must be exactly CH_HAKIMA, CH_MIRA, and CH_DARIYA");
});

test('C002_CHARACTER_AND_TONE_DATA: Tone Guide validation', () => {
  for (const tg of TONE_GUIDES) {
    const result = validateToneGuide(tg);
    assert.strictEqual(result.ok, true, result.reason);
  }
  
  assert.strictEqual(validateToneGuide({ toneGuideId: 'INVALID' }).ok, false);
  assert.strictEqual(validateToneGuide({ toneGuideId: 'TG_TEST', rules: {} }).ok, false);
});

test('C002_CHARACTER_AND_TONE_DATA: Tone Guide route diff', () => {
  const hakimaTG = TONE_GUIDES.find(tg => tg.toneGuideId === 'TG_HAKIMA');
  assert.ok(hakimaTG.rules.normal);
  assert.ok(hakimaTG.rules.extra);
});

test('C002_CHARACTER_AND_TONE_DATA: Customer type tone guide reference', () => {
  const customerTG = TONE_GUIDES.find(tg => tg.toneGuideId === 'TG_CUSTOMER_STANDARD');
  assert.ok(customerTG, "Should have standard customer tone guide");
});
