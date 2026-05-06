/**
 * Rhythm Timing logic for MadeInMaghribal project.
 */

/**
 * Calculates judgement rating and bonus based on timing difference.
 * @param {number} answeredAt 
 * @param {number} nearestBeatMs 
 * @returns {{rating: string, bonus: number, diffMs: number}}
 */
function calculateJudgement(answeredAt, nearestBeatMs) {
  const diff = Math.abs(answeredAt - nearestBeatMs);
  let rating = 'MISS';
  let bonus = 0;

  // Acceptance: ±100ms -> PERFECT, ±200ms -> GOOD
  if (diff <= 100) {
    rating = 'PERFECT';
    bonus = 2;
  } else if (diff <= 200) {
    rating = 'GOOD';
    bonus = 1;
  }

  return { rating, bonus, diffMs: answeredAt - nearestBeatMs };
}

module.exports = { calculateJudgement };
