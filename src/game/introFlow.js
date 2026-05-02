import { getRandomGreeting } from '../data/greetings.js';
import { getIntroTalks, getNextDailyTalk } from './eventSystem.js';

/**
 * Prepare intro sequence data for IntroScreen.
 * Pure function: no side effects, no React state.
 * 
 * @param {Object} params
 * @param {string} params.heroineId - Active heroine ID
 * @param {number} params.currentAffection - Current affection level
 * @param {string[]} params.seenTalkIds - Already seen talk IDs
 * @param {string} params.routeMode - 'normal' or 'long_history'
 * @returns {{ greeting: Object, mergedTalk: Object|null, newSeenTalkIds: string[] }}
 */
export function prepareIntroSequence({ heroineId, currentAffection, seenTalkIds, routeMode }) {
  const greeting = getRandomGreeting();

  const talks = getIntroTalks(heroineId, currentAffection, seenTalkIds, routeMode);

  const mergedTalk = talks.length > 0
    ? {
        id: `merged_${talks.map(t => t.id).join('_')}`,
        pages: talks.flatMap(t => t.pages)
      }
    : null;

  const newSeenTalkIds = talks.map(t => t.id);

  return { greeting, mergedTalk, newSeenTalkIds };
}

/**
 * Prepare after_result daily talk sequence.
 * Pure function: no side effects, no React state.
 * 
 * @param {Object} params
 * @param {string} params.heroineId - Active heroine ID
 * @param {number} params.currentAffection - Current affection level
 * @param {string[]} params.seenTalkIds - Already seen talk IDs
 * @param {string} params.routeMode - 'normal' or 'long_history'
 * @returns {{ talk: Object|null, newSeenTalkIds: string[] }}
 */
export function prepareResultTalkSequence({ heroineId, currentAffection, seenTalkIds, routeMode }) {
  const talk = getNextDailyTalk(heroineId, 'after_result', currentAffection, seenTalkIds, routeMode);

  const newSeenTalkIds = talk ? [talk.id] : [];

  return { talk, newSeenTalkIds };
}

/**
 * Prepare day_end daily talk sequence.
 * Pure function: no side effects, no React state.
 * 
 * @param {Object} params
 * @param {string} params.heroineId - Active heroine ID
 * @param {number} params.currentAffection - Current affection level
 * @param {string[]} params.seenTalkIds - Already seen talk IDs
 * @param {string} params.routeMode - 'normal' or 'long_history'
 * @returns {{ talk: Object|null, newSeenTalkIds: string[] }}
 */
export function prepareDayEndTalkSequence({ heroineId, currentAffection, seenTalkIds, routeMode }) {
  const talk = getNextDailyTalk(heroineId, 'day_end', currentAffection, seenTalkIds, routeMode);

  const newSeenTalkIds = talk ? [talk.id] : [];

  return { talk, newSeenTalkIds };
}
