/**
 * Affection Model logic for MadeInMaghribal project.
 */

/**
 * Calculates affection based on current score and historical peaks.
 * @param {object} score - { revenue, satisfaction, reputation }
 * @param {object} history - { maxSatisfaction, maxReputation }
 * @returns {number} affection (0-100)
 */
function calculateAffection(score, history = {}) {
  const { revenue = 0, satisfaction = 0, reputation = 0 } = score;
  
  // MVP Formula: 好感度 = (売上 + 満足度 + 評判) / 5
  let val = (revenue + satisfaction + reputation) / 5;
  
  // Clip at 0-100
  if (val > 100) val = 100;
  if (val < 0) val = 0;
  
  return val;
}

module.exports = { calculateAffection };
