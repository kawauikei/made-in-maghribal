/**
 * Item Sprite Sheet utilities for MadeInMaghribal.
 *
 * Sprite Specs:
 * - Single Icon: 256x256
 * - Sheet: 5 columns x 50 rows (1280x12800)
 * - Order: itemId alphabetical order
 */

const { ITEM_MASTER } = require('../data/itemMaster.cjs');

// Stable sorted list for index mapping
const SORTED_ITEM_IDS = [...ITEM_MASTER]
  .map(item => item.itemId)
  .sort((a, b) => a.localeCompare(b));

const SPRITE_MAP = new Map(SORTED_ITEM_IDS.map((id, index) => [id, index]));

/**
 * Returns sprite frame information for a given itemId.
 */
function getItemSpriteFrame(itemId) {
  const index = SPRITE_MAP.get(itemId);
  if (index === undefined) {
    console.warn(`[itemSprite] Missing item index for: ${itemId}`);
    return null;
  }

  const col = index % 5;
  const row = Math.floor(index / 5);
  
  return {
    src: 'images/ui/item.webp',
    index,
    col,
    row,
    x: col * 256,
    y: row * 256,
    w: 256,
    h: 256
  };
}

/**
 * Returns CSS variables for the sprite based on desired display size.
 * @param {string} itemId
 * @param {number} displaySize px
 */
function getItemSpriteStyle(itemId, displaySize = 96) {
  const frame = getItemSpriteFrame(itemId);
  if (!frame) return {};

  const scale = displaySize / 256;
  
  // background-size: 1280px * scale, 12800px * scale
  // background-position: -x * scale, -y * scale
  return {
    '--item-x': `-${frame.x * scale}px`,
    '--item-y': `-${frame.y * scale}px`,
    '--item-scale-w': `${1280 * scale}px`,
    '--item-scale-h': `${12800 * scale}px`
  };
}

module.exports = {
  getItemSpriteFrame,
  getItemSpriteStyle
};
