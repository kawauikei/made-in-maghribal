/**
 * Quiz Validator for MadeInMaghribal project.
 */
const { ITEM_MASTER } = require('../data/itemMaster.cjs');

/**
 * Validates a generated question against its template.
 * @param {object} question 
 * @param {object} template 
 * @returns {{ok: boolean, reason?: string}}
 */
function validateQuestion(question, template) {
  const correctItem = ITEM_MASTER.find(i => i.itemId === question.correctItemId);
  const wrongItem = ITEM_MASTER.find(i => i.itemId === question.wrongItemId);

  if (!correctItem || !wrongItem) return { ok: false, reason: "Invalid Item IDs" };
  
  // Acceptance: 不正解候補は正解候補と重複しない
  if (correctItem.itemId === wrongItem.itemId) {
    return { ok: false, reason: "Correct and wrong items must be different" };
  }

  // Acceptance: 正解アイテムの判定
  const correctMatch = template.conditions.every(cond => correctItem[cond.type] === cond.value);
  if (!correctMatch) {
    return { ok: false, reason: "Correct item does not match template conditions" };
  }

  // Acceptance: 不正解アイテムの判定
  const wrongMatch = template.conditions.every(cond => wrongItem[cond.type] === cond.value);
  if (wrongMatch) {
    return { ok: false, reason: "Wrong item matches template conditions" };
  }

  return { ok: true };
}

module.exports = { validateQuestion };
