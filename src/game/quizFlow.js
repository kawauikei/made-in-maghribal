import { getRankInfo } from './scoring.js';
import { calculateQuizAffectionGain } from './affection.js';
import { getWorkshopResult } from './management.js';
import { checkNewEventUnlock } from './eventSystem.js';

/**
 * Calculates all logical outcomes of a quiz session.
 * This is a pure logic function designed to be used by App.jsx or tests.
 * It encapsulates scoring, affection calculation, and event unlock checking.
 * 
 * @param {Object} params
 * @param {number} params.correctCount - How many questions were answered correctly.
 * @param {number} params.totalCount - Total number of questions in the session.
 * @param {string} params.activeHeroineId - The ID of the currently active heroine.
 * @param {number} params.currentAffection - The current affection level of the active heroine (before gain).
 * @param {string[]} params.seenEventIds - List of event IDs already seen by the player.
 * @returns {Object} Consolidated results including rank, gains, and potential unlocks.
 */
export function resolveQuizCompletion({
  correctCount,
  totalCount,
  activeHeroineId,
  currentAffection,
  seenEventIds
}) {
  // 1. Get Rank Info (Title and Message)
  const rank = getRankInfo(correctCount);

  // 2. Calculate Affection Gain
  const affectionGain = calculateQuizAffectionGain(correctCount, totalCount);

  // 3. Calculate Workshop/Management Result (Sales, Reputation, Satisfaction)
  const workshopResult = getWorkshopResult(correctCount);
  
  // 4. Check for New Event Unlock
  const nextAffectionValue = currentAffection + affectionGain;
  const unlockedEvent = checkNewEventUnlock(activeHeroineId, nextAffectionValue, seenEventIds);

  return {
    correctCount,
    totalCount,
    rank,
    affectionGain,
    workshopResult, // { sales, reputation, satisfaction }
    unlockedEvent,  // Event object or null
    isPerfect: correctCount === totalCount
  };
}

/**
 * Creates a perfect result payload, typically used for the "Auto Skip Quiz" debug feature.
 * 
 * @param {number} totalCount 
 * @param {string} activeHeroineId 
 * @param {number} currentAffection 
 * @param {string[]} seenEventIds 
 * @returns {Object} A perfect result payload.
 */
export function createPerfectQuizPayload(totalCount, activeHeroineId, currentAffection, seenEventIds) {
  return resolveQuizCompletion({
    correctCount: totalCount,
    totalCount,
    activeHeroineId,
    currentAffection,
    seenEventIds
  });
}
