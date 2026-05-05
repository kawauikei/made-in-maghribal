const test = require('node:test');
const assert = require('node:assert');
const { validateAssetUsage } = require('../../src/core/assetValidator.cjs');
const { ASSET_MANIFEST } = require('../../src/data/assets.cjs');

test('C003_ASSET_MANIFEST: Nadir expression check', () => {
  // Acceptance: 主人公ナーディルには maid/social/student が存在しないことを検証する
  assert.strictEqual(validateAssetUsage('CH_NADIR', 'normal', 'scenario').ok, true);
  
  const result = validateAssetUsage('CH_NADIR', 'maid', 'ui');
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, "Expression maid not found for character CH_NADIR");
});

test('C003_ASSET_MANIFEST: UI-only expression usage in scenario', () => {
  // Acceptance: scenario用参照とUI用参照のusage制限を検証できる
  assert.strictEqual(validateAssetUsage('CH_HAKIMA', 'maid', 'ui').ok, true);
  
  const result = validateAssetUsage('CH_HAKIMA', 'maid', 'scenario');
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, "Cannot use UI-only expression in scenario context");
});

test('C003_ASSET_MANIFEST: Character expression availability', () => {
  assert.strictEqual(validateAssetUsage('CH_HAKIMA', 'joy', 'scenario').ok, true);
  assert.strictEqual(validateAssetUsage('CH_MIRA', 'fun', 'scenario').ok, true);
});
