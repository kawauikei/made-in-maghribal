const test = require('node:test');
const assert = require('node:assert');
const { validateItems } = require('../../src/core/itemValidator.cjs');
const { ITEM_MASTER } = require('../../src/data/itemMaster.cjs');
const { GENRES, PRINCIPLES } = require('../../src/data/itemTaxonomy.cjs');

test('C004_ITEM_MASTER_AND_TEXT: Overall validation', () => {
  const result = validateItems();
  assert.strictEqual(result.ok, true, result.reason);
});

test('C004_ITEM_MASTER_AND_TEXT: Taxonomy check', () => {
  assert.strictEqual(GENRES.length, 10, "Should have 10 genres");
  assert.strictEqual(PRINCIPLES.length, 5, "Should have 5 principles");
});

test('C004_ITEM_MASTER_AND_TEXT: Item count check', () => {
  assert.strictEqual(ITEM_MASTER.length, 250, "Total items should be 250");
});

test('C004_ITEM_MASTER_AND_TEXT: ID format check', () => {
  const firstItem = ITEM_MASTER[0];
  assert.match(firstItem.itemId, /^IT_[A-Z]{3}_[A-Z]{2}_[0-9]{2}$/, "ID should match the specified format");
});
