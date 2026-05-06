/**
 * Lightweight item collection state for the future item encyclopedia.
 *
 * Rule: an item is registered when it appears as a quiz candidate, even if the
 * player does not select it.
 */

const ITEM_COLLECTION_KEY = 'madeinmaghribal.collection.items';

function canUseStorage() {
  try {
    return typeof localStorage !== 'undefined';
  } catch (e) {
    return false;
  }
}

function loadItemCollection() {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(ITEM_COLLECTION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    console.warn('Failed to load item collection:', e);
    return {};
  }
}

function saveItemCollection(collection) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(ITEM_COLLECTION_KEY, JSON.stringify(collection));
  } catch (e) {
    console.warn('Failed to save item collection:', e);
  }
}

function registerSeenItems(itemIds, context = {}) {
  const collection = loadItemCollection();
  const now = new Date().toISOString();
  const results = [];

  itemIds.forEach((itemId) => {
    if (!itemId) return;
    const exists = Boolean(collection[itemId]?.seen);
    if (!exists) {
      collection[itemId] = {
        seen: true,
        firstSeenAt: now,
        firstSeenTurn: context.turn || null,
        firstSeenQuestionIndex: Number.isInteger(context.questionIndex) ? context.questionIndex : null
      };
    }
    results.push({ itemId, isNew: !exists });
  });

  saveItemCollection(collection);
  return results;
}

module.exports = {
  ITEM_COLLECTION_KEY,
  loadItemCollection,
  saveItemCollection,
  registerSeenItems
};
