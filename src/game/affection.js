/**
 * Affection / Intimacy Logic for Made in Maghribal
 */

export const AFFECTION_LIMITS = {
  MIN: 0,
  MAX: 100
};

/**
 * Creates initial affection state for given heroine IDs
 * @param {string[]} heroineIds 
 * @returns {Object} { heroineId: 0, ... }
 */
export function createInitialAffection(heroineIds) {
  const state = {};
  heroineIds.forEach(id => {
    state[id] = 0;
  });
  return state;
}

/**
 * Clamps affection value between defined limits
 * @param {number} value 
 * @returns {number}
 */
export function clampAffection(value) {
  return Math.max(AFFECTION_LIMITS.MIN, Math.min(AFFECTION_LIMITS.MAX, value));
}

/**
 * Adds affection to a specific heroine and returns a new state object
 * @param {Object} affectionState 
 * @param {string} heroineId 
 * @param {number} amount 
 * @returns {Object} New affection state
 */
export function addAffection(affectionState, heroineId, amount) {
  if (!(heroineId in affectionState)) {
    console.warn(`Attempted to add affection to unknown heroineId: ${heroineId}`);
    return affectionState;
  }

  return {
    ...affectionState,
    [heroineId]: clampAffection(affectionState[heroineId] + amount)
  };
}

/**
 * Calculates affection gain based on quiz results
 * @param {number} correctCount 
 * @param {number} totalQuestions (unused in current linear logic, but kept for future scale)
 * @returns {number}
 */
export function calculateQuizAffectionGain(correctCount, totalQuestions = 5) {
  // Current specification: gain is equal to correct count
  // 5 correct -> +5
  // 0 correct -> +0
  return Math.max(0, correctCount);
}
