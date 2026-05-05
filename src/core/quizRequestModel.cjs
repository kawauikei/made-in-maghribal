/**
 * Quiz Request Model logic for MadeInMaghribal project.
 */
const { ITEM_MASTER } = require('../data/itemMaster.cjs');

/**
 * Generates a quiz question (2 choices) from a template.
 * @param {object} template 
 * @returns {object|null}
 */
function generateQuestion(template) {
  // Acceptance: 指定された全ての条件を満たすアイテムを C004 マスターから正解として選ぶ
  const correctCandidates = ITEM_MASTER.filter(item => {
    return template.conditions.every(cond => item[cond.type] === cond.value);
  });

  if (correctCandidates.length === 0) return null;
  const correctItem = correctCandidates[Math.floor(Math.random() * correctCandidates.length)];

  // Acceptance: 条件の少なくとも1つを満たさないアイテムを不正解として選ぶ
  const wrongCandidates = ITEM_MASTER.filter(item => {
    return !template.conditions.every(cond => item[cond.type] === cond.value);
  });

  if (wrongCandidates.length === 0) return null;
  const wrongItem = wrongCandidates[Math.floor(Math.random() * wrongCandidates.length)];

  return {
    questionId: `Q_${template.templateId}_${Date.now()}`,
    promptText: template.text,
    correctItemId: correctItem.itemId,
    wrongItemId: wrongItem.itemId,
    difficulty: template.conditions.length
  };
}

module.exports = { generateQuestion };
