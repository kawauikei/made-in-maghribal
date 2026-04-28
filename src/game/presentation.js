/**
 * Presentation Logic for Made in Maghribal
 * 
 * Handles visual-only logic like selecting appropriate character expressions
 * based on gameplay results.
 */

/**
 * Returns the appropriate expression ID for the result screen based on quiz performance.
 * @param {number} correctCount - Number of correct answers (out of 5)
 * @returns {string} Expression ID
 */
export function getResultExpression(correctCount) {
  if (correctCount >= 5) return 'fun';
  if (correctCount >= 4) return 'joy';
  if (correctCount >= 3) return 'normal';
  if (correctCount >= 2) return 'sorrow';
  return 'cry';
}

/**
 * Returns the appropriate expression ID for the day end screen based on daily performance.
 * @param {number} correctCount - Number of correct answers (out of 5)
 * @returns {string} Expression ID
 */
export function getDayEndExpression(correctCount) {
  if (correctCount >= 4) return 'joy'; // Can also be 'fun'
  if (correctCount >= 2) return 'normal';
  return 'sorrow';
}
