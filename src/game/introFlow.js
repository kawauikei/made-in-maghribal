import { getIntroGreetingPages, getIntroTalksForHeroine, getAfterResultTalk, getDayEndTalk } from '../data/narrativeScript.js';

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
  const greeting = {
    id: `intro_greeting_${heroineId}_${routeMode}`,
    kind: 'opening',
    heroineId,
    routeMode,
    pages: getIntroGreetingPages({ heroineId, routeMode, seenTalkIds }),
  };

  const talks = getIntroTalksForHeroine(heroineId, currentAffection, routeMode, seenTalkIds);

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
export function prepareResultTalkSequence({ heroineId, score, seenTalkIds, routeMode }) {
  const talk = getAfterResultTalk(heroineId, score, routeMode, seenTalkIds);

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
  const talk = getDayEndTalk(heroineId, currentAffection, routeMode, seenTalkIds);

  const newSeenTalkIds = talk ? [talk.id] : [];

  return { talk, newSeenTalkIds };
}
