/**
 * Affection Model logic for MadeInMaghribal project.
 */

/**
 * Calculates affection based on current score and historical peaks.
 * @param {object} score - { revenue, satisfaction, reputation }
 * @param {object} history - { maxSatisfaction, maxReputation }
 * @returns {number} affection (0-100)
 */
function calculateAffection(score, history) {
  const { revenue, satisfaction, reputation } = score;
  const { maxSatisfaction, maxReputation } = history;
  
  // Acceptance: 好感度 = (売上 + 満足度 + 評判 + 過去最大満足度 + 過去最大評判) / 5
  let val = (revenue + satisfaction + reputation + maxSatisfaction + maxReputation) / 5;
  
  // Acceptance: 好感度は100で上限クリップする
  if (val > 100) val = 100;
  if (val < 0) val = 0;
  
  return val;
}

module.exports = { calculateAffection };
