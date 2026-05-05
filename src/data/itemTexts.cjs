/**
 * Item Quality Texts for MadeInMaghribal project.
 * Separated from master data as per requirements.
 */
const { ITEM_MASTER } = require('./itemMaster.cjs');

const ITEM_TEXTS = {};

for (const item of ITEM_MASTER) {
  ITEM_TEXTS[item.itemId] = {
    normal: `品質は普通の${item.name}。`,
    success: `良い出来栄えの${item.name}。`,
    great_success: `最高品質の${item.name}！`
  };
}

module.exports = { ITEM_TEXTS };
