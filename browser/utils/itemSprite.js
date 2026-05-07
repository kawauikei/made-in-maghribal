/**
 * Utility for mapping itemId to sprite sheet coordinates.
 * Using percentage-based positioning for flexible scaling.
 */
const { ITEM_MASTER } = require('../data/itemMaster.cjs');

const COLUMNS = 5;
const ROWS = 50;

// Create a stable mapping of itemId to index.
const sortedItems = [...ITEM_MASTER].sort((a, b) => a.itemId.localeCompare(b.itemId));
const itemToIndexMap = new Map(sortedItems.map((item, index) => [item.itemId, index]));

/**
 * Returns the CSS variables for displaying an item from the sprite sheet.
 * @param {string} itemId 
 * @returns {Object}
 */
function getItemSpriteStyle(itemId) {
  const index = itemToIndexMap.get(itemId);
  if (index === undefined) return {};

  const col = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);

  // Percentage based background-position for 5x50 grid
  const xPercent = (col / (COLUMNS - 1)) * 100;
  const yPercent = (row / (ROWS - 1)) * 100;

  return {
    '--item-x': `${xPercent}%`,
    '--item-y': `${yPercent}%`
  };
}

module.exports = {
  getItemSpriteStyle,
  itemToIndexMap
};
