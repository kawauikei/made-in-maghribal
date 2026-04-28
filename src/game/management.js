/**
 * Management Logic for Workshop Parameters
 */

/**
 * Calculates the temporary changes to workshop parameters based on quiz results.
 * Note: Currently these are not persistent across sessions.
 * 
 * @param {number} correctCount - Number of correct answers in a 5-question session
 * @returns {Object} { reputation, sales, satisfaction }
 */
export function getWorkshopResult(correctCount) {
  if (correctCount >= 5) {
    return { reputation: 3, sales: 120, satisfaction: 3 };
  }
  if (correctCount === 4) {
    return { reputation: 2, sales: 100, satisfaction: 2 };
  }
  if (correctCount === 3) {
    return { reputation: 1, sales: 80, satisfaction: 1 };
  }
  if (correctCount === 2) {
    return { reputation: 0, sales: 50, satisfaction: 0 };
  }
  // 0 or 1 correct
  return { reputation: -1, sales: 20, satisfaction: -1 };
}
