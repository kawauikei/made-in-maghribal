import { QUIZ_SCORE_TO_G } from './scoring.js';

/**
 * Management Logic for Workshop Parameters
 */

/**
 * Calculates the temporary changes to workshop parameters based on quiz results.
 * New balance:
 * - Sales follow session score
 * - Reputation is +2 per correct answer
 * - Satisfaction is +1 for rhythm timing and +1 for speed timing per answer
 * 
 * Backward compatibility:
 * - Passing a number keeps the legacy behavior for older tests or callers.
 *
 * @param {number|Object} input
 * @returns {Object} { reputation, sales, satisfaction }
 */
export function getWorkshopResult(input) {
  if (typeof input === 'number') {
    const correctCount = input;
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
    return { reputation: -1, sales: 20, satisfaction: -1 };
  }

  const correctCount = Number(input?.correctCount) || 0;
  const answers = Array.isArray(input?.answers) ? input.answers : [];
  const sales = answers.reduce((total, answer) => total + (Number(answer?.gainedScore) || 0), 0) * QUIZ_SCORE_TO_G;
  const reputation = correctCount * 2;
  const satisfaction = answers.reduce((total, answer) => {
    return total + (answer?.rhythmGood ? 1 : 0) + (answer?.fast ? 1 : 0);
  }, 0);

  return { reputation, sales, satisfaction };
}

/**
 * Creates the initial state for a new workshop session.
 */
export function createInitialWorkshopState() {
  return {
    day: 1,
    reputation: 0,
    sales: 0,
    satisfaction: 0
  };
}

/**
 * Accumulates a single service result into the overall workshop state.
 * Immutably returns a new state object.
 */
export function applyWorkshopResult(state, result) {
  return {
    day: state.day, // Day is usually incremented separately at the end of the day loop
    reputation: state.reputation + result.reputation,
    sales: state.sales + result.sales,
    satisfaction: state.satisfaction + result.satisfaction
  };
}
