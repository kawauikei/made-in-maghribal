/**
 * Display name and icon utilities for MadeInMaghribal.
 */

function getHeroineDisplayName(id) {
  const names = {
    HAKIMA: 'ハキマ',
    MIRA: 'ミラ',
    DARIYA: 'ダリヤ',
    CH_HAKIMA: 'ハキマ',
    CH_MIRA: 'ミラ',
    CH_DARIYA: 'ダリヤ',
    CH_NADIR: 'ナディール',
    NADER: 'ナディール'
  };
  return names[id] || id;
}

function getItemDisplayName(controller, itemId, quality = 'base') {
  const { getItemDisplayName: getRawName } = require('../data/itemDisplayNames.cjs');
  const { ITEM_MASTER } = require('../data/itemMaster.cjs');

  const name = getRawName(itemId, quality);
  if (name && name !== itemId) return name;

  const item = ITEM_MASTER.find(i => i.itemId === itemId);
  return item ? item.name : itemId;
}

function getItemIconPath(itemId) {
  return `images/items/${itemId}.webp`;
}

function getTurnRank(dR, dS, dRep) {
  const total = dR + dS + dRep;
  if (total >= 90) return '大成功';
  if (total >= 60) return '成功';
  if (total >= 30) return 'まずまず';
  return '要改善';
}

module.exports = {
  getHeroineDisplayName,
  getItemDisplayName,
  getItemIconPath,
  getTurnRank
};
