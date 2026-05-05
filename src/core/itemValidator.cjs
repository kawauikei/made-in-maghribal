/**
 * Item Validator for MadeInMaghribal project.
 */
const { ITEM_MASTER } = require('../data/itemMaster.cjs');
const { ITEM_TEXTS } = require('../data/itemTexts.cjs');
const { GENRES, PRINCIPLES } = require('../data/itemTaxonomy.cjs');

/**
 * Validates the entire item master and text set.
 * @returns {{ok: boolean, reason?: string}}
 */
function validateItems() {
  // Acceptance: 250アイテムを生成または参照できる
  if (ITEM_MASTER.length !== 250) {
    return { ok: false, reason: `Item count mismatch: expected 250, got ${ITEM_MASTER.length}` };
  }

  // Acceptance: genre は 10種類, principle は 5種類
  if (GENRES.length !== 10) return { ok: false, reason: "Genre count mismatch" };
  if (PRINCIPLES.length !== 5) return { ok: false, reason: "Principle count mismatch" };

  for (const item of ITEM_MASTER) {
    // Acceptance: itemId は IT_{GENRE}_{PRINCIPLE}_{INDEX} 形式
    const parts = item.itemId.split('_');
    if (parts.length !== 4 || parts[0] !== 'IT') {
      return { ok: false, reason: `Invalid ID format for ${item.itemId}` };
    }

    // Acceptance: item masterとitem textを分離、かつ品質別テキスト保持
    if (!ITEM_TEXTS[item.itemId]) {
      return { ok: false, reason: `Missing text for item ${item.itemId}` };
    }
    const texts = ITEM_TEXTS[item.itemId];
    if (!texts.normal || !texts.success || !texts.great_success) {
      return { ok: false, reason: `Incomplete text quality for item ${item.itemId}` };
    }
  }
  return { ok: true };
}

module.exports = { validateItems };
