/**
 * Quiz Validator for MadeInMaghribal project.
 */
const { ITEM_MASTER } = require('../data/itemMaster.cjs');
const { itemMatchesConditions } = require('./quizRequestModel.cjs');

/**
 * Validates a generated question against its template or embedded conditions.
 * @param {object} question
 * @param {object} template
 * @returns {{ok: boolean, reason?: string}}
 */
function validateQuestion(question, template = null) {
  const correctItem = ITEM_MASTER.find(i => i.itemId === question.correctItemId);
  const wrongItem = ITEM_MASTER.find(i => i.itemId === question.wrongItemId);

  if (!correctItem || !wrongItem) return { ok: false, reason: 'Invalid Item IDs' };

  if (correctItem.itemId === wrongItem.itemId) {
    return { ok: false, reason: 'Correct and wrong items must be different' };
  }

  const conditions = template?.conditions?.length ? template.conditions : (question.conditions || []);
  const itemConditions = conditions.filter((condition) => condition.type !== 'quality');

  if (itemConditions.length) {
    const correctMatch = itemMatchesConditions(correctItem, itemConditions);
    if (!correctMatch) {
      return { ok: false, reason: 'Correct item does not match question conditions' };
    }

    const wrongMatch = itemMatchesConditions(wrongItem, itemConditions);
    if (wrongMatch) {
      return { ok: false, reason: 'Wrong item matches item conditions' };
    }
  }

  const qualityCondition = conditions.find((condition) => condition.type === 'quality')?.value;
  if (qualityCondition && question.correctQuality !== qualityCondition) {
    return { ok: false, reason: 'Correct quality does not match quality condition' };
  }

  return { ok: true };
}

module.exports = { validateQuestion };
