/**
 * Ending Branch logic for MadeInMaghribal project.
 */

/**
 * Evaluates the ending type based on final affection.
 * @param {number} affection 
 * @param {boolean} isExtraRoute 
 * @returns {string} 'GOOD' | 'NORMAL'
 */
function evaluateEnding(affection, isExtraRoute) {
  // Acceptance: 通常ルートは好感度60以上でGood Ending
  // Acceptance: 追加ルートは好感度80以上でGood Ending
  const threshold = isExtraRoute ? 80 : 60;
  
  if (affection >= threshold) {
    return 'GOOD';
  }
  return 'NORMAL';
}

module.exports = { evaluateEnding };
