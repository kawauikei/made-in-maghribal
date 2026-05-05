/**
 * Item Master data generation for MadeInMaghribal project.
 * Automatically generates 250 items based on taxonomy.
 */
const { GENRES, PRINCIPLES, INDICES } = require('./itemTaxonomy.cjs');

const ITEM_MASTER = [];

for (const genre of GENRES) {
  for (const principle of PRINCIPLES) {
    for (const index of INDICES) {
      ITEM_MASTER.push({
        itemId: `IT_${genre}_${principle}_${index}`,
        name: `${genre} Item ${principle}-${index}`,
        genre,
        principle,
        rank: parseInt(index, 10)
      });
    }
  }
}

module.exports = { ITEM_MASTER };
