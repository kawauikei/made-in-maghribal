/**
 * Presentation Logic for Made in Maghribal
 * 
 * Handles visual-only logic like selecting appropriate character expressions
 * based on gameplay results.
 */

/**
 * Returns the appropriate expression ID for the result screen based on quiz performance.
 * @param {number} correctCount - Number of correct answers
 * @param {number} totalQuestions - Total questions in the turn
 * @returns {string} Expression ID
 */
export function getResultExpression(correctCount, totalQuestions = 10) {
  const perfectThreshold = Math.max(1, totalQuestions);
  const joyThreshold = Math.max(1, Math.ceil(totalQuestions * 0.8));
  const normalThreshold = Math.max(1, Math.ceil(totalQuestions * 0.6));
  const sorrowThreshold = Math.max(1, Math.ceil(totalQuestions * 0.4));

  if (correctCount >= perfectThreshold) return 'fun';
  if (correctCount >= joyThreshold) return 'joy';
  if (correctCount >= normalThreshold) return 'normal';
  if (correctCount >= sorrowThreshold) return 'sorrow';
  return 'cry';
}

/**
 * Returns the appropriate expression ID for the day end screen based on daily performance.
 * @param {number} correctCount - Number of correct answers
 * @param {number} totalQuestions - Total questions in the turn
 * @returns {string} Expression ID
 */
export function getDayEndExpression(correctCount, totalQuestions = 10) {
  const joyThreshold = Math.max(1, Math.ceil(totalQuestions * 0.8));
  const normalThreshold = Math.max(1, Math.ceil(totalQuestions * 0.5));

  if (correctCount >= joyThreshold) return 'joy'; // Can also be 'fun'
  if (correctCount >= normalThreshold) return 'normal';
  return 'sorrow';
}
