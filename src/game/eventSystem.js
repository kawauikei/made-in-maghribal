import { getEventsByHeroine } from '../data/affectionEvents.js';
import { DAILY_TALKS } from '../data/dailyTalks.js';

/**
 * Checks for any new events that should be unlocked based on current affection.
 * 
 * @param {string} heroineId - The active heroine
 * @param {number} currentAffection - Current affection level
 * @param {string[]} seenEventIds - List of IDs already seen by the player
 * @param {string} [routeMode] - 'normal' or 'long_history' (optional, defaults to matching all)
 * @returns {Object|null} The first eligible event or null if none
 */
export function checkNewEventUnlock(heroineId, currentAffection, seenEventIds, routeMode) {
  const events = getEventsByHeroine(heroineId);
  
  // Find the highest threshold event that meets criteria and hasn't been seen
  // For MVP, we'll just return the first one found that is eligible.
  const eligibleEvents = events.filter(event => 
    event.kind !== 'flashback_intro' && 
    event.kind !== 'route_climax' && 
    currentAffection >= event.threshold && 
    !seenEventIds.includes(event.id) &&
    // routeMode filter: if event has routeMode, it must match
    // if event has no routeMode, it's treated as 'both' (matches any)
    (!event.routeMode || event.routeMode === 'both' || event.routeMode === routeMode)
  );

  if (eligibleEvents.length === 0) return null;

  // Return the one with the lowest threshold among eligible ones
  // to ensure sequential progression (5 first, then 10).
  return eligibleEvents.sort((a, b) => a.threshold - b.threshold)[0];
}

/**
 * Returns the appropriate pages for an event based on the current route mode.
 * 
 * @param {Object} event - The event object
 * @param {string} routeMode - 'normal' or 'long_history'
 * @returns {Array} Array of page objects { speaker, expression, text }
 */
export function getEventPages(event, routeMode) {
  if (!event) return [{ speaker: "", expression: "normal", text: "" }];
  
  let rawPages = [];
  
  // 1. Try route-specific pages
  if (routeMode === 'long_history' && event.routePages?.long_history) {
    rawPages = event.routePages.long_history;
  }
  // 2. Try default pages array
  else if (event.pages && Array.isArray(event.pages) && event.pages.length > 0) {
    rawPages = event.pages;
  }
  // 3. Fallback to single text property
  else {
    rawPages = [event.text || ""];
  }

  // Normalize array to handle both strings and objects
  return rawPages.map(page => {
    if (typeof page === 'string') {
      return {
        speaker: "",
        expression: "normal",
        text: page
      };
    }
    // Return object page, ensuring fallbacks
    return {
      speaker: page.speaker !== undefined ? page.speaker : "",
      expression: page.expression || "normal",
      text: page.text || ""
    };
  });
}

/**
 * Returns text based on route mode with fallback to baseText.
 * 
 * @param {string} baseText - Default text if no route-specific text exists
 * @param {Object} routeTexts - { normal?: string, long_history?: string }
 * @param {string} routeMode - 'normal' or 'long_history'
 * @returns {string}
 */
export function getRouteText(baseText, routeTexts, routeMode) {
  if (routeTexts && routeTexts[routeMode]) {
    return routeTexts[routeMode];
  }
  return baseText;
}

/**
 * Returns a set of talks for the morning (intro) sequence.
 * Should ideally return one 'work' talk and one 'personal' talk.
 * 
 * @param {string} heroineId 
 * @param {number} currentAffection 
 * @param {string[]} seenTalkIds 
 * @param {string} routeMode 
 * @returns {Object[]} Array of talk objects
 */
export function getIntroTalks(heroineId, currentAffection, seenTalkIds, routeMode) {
  const getEligible = (category) => {
    return DAILY_TALKS.filter(talk => {
      if (talk.timing !== 'intro') return false;
      if (talk.category !== category) return false;
      if (talk.scope === 'heroine' && talk.heroineId !== heroineId) return false;
      if (talk.routeMode !== 'both' && talk.routeMode !== routeMode) return false;
      if (talk.minAffection > currentAffection) return false;
      if (seenTalkIds.includes(talk.id)) return false;
      return true;
    }).sort((a, b) => (b.priority || 1) - (a.priority || 1));
  };

  const workTalks = getEligible('work');
  const personalTalks = getEligible('personal');

  const selected = [];
  if (workTalks.length > 0) selected.push(workTalks[0]);
  if (personalTalks.length > 0) selected.push(personalTalks[0]);

  return selected;
}

/**
 * Returns the next available daily talk for the given parameters.
 * MVP Version: Returns the first eligible unread talk by definition order.
 * 
 * @param {string} heroineId - The active heroine
 * @param {string} timing - 'intro', 'after_result', or 'day_end'
 * @param {number} currentAffection - Current affection level
 * @param {string[]} seenTalkIds - List of talk IDs already seen
 * @param {string} routeMode - 'normal' or 'long_history'
 * @returns {Object|null} The eligible daily talk or null
 */
export function getNextDailyTalk(heroineId, timing, currentAffection, seenTalkIds, routeMode) {
  const eligible = DAILY_TALKS.filter(talk => {
    // 1. Timing match
    if (talk.timing !== timing) return false;

    // 2. Scope/Heroine match
    if (talk.scope === 'heroine') {
      // Heroine-scoped talks must match the active heroine
      if (talk.heroineId !== heroineId) return false;
    } else if (talk.scope === 'common') {
      // Common talks are always candidates if they match other criteria
      // But nader solo talks should not filter by heroine
    } else {
      // Unknown scope - skip for safety
      return false;
    }

    // 3. RouteMode match
    if (talk.routeMode !== 'both' && talk.routeMode !== routeMode) return false;

    // 4. Affection requirement
    if (talk.minAffection > currentAffection) return false;

    // 5. Unread only
    if (seenTalkIds.includes(talk.id)) return false;

    return true;
  });

  // MVP: Return the first one found in definition order
  return eligible.length > 0 ? eligible[0] : null;
}

/**
 * Resolves whether a flashback_intro event should be triggered when selecting a heroine.
 * Pure function: no side effects.
 * 
 * @param {Object} params
 * @param {string} params.heroineId - The selected heroine ID
 * @param {string[]} params.seenEventIds - List of event IDs already seen
 * @returns {Object|null} The flashback_intro event object, or null if not eligible
 */
export function resolveHeroineSelectionEvent({ heroineId, seenEventIds }) {
  const introEventId = `${heroineId}_0`;
  const events = getEventsByHeroine(heroineId);
  const introEvent = events.find(e => e.id === introEventId);

  if (introEvent && !seenEventIds.includes(introEventId)) {
    return introEvent;
  }
  return null;
}

/**
 * Resolves the screen to return to after an event closes.
 * Pure function: no side effects.
 * 
 * @param {Object} params
 * @param {string} params.eventKind - The kind of the finished event ('flashback_intro', etc.)
 * @param {boolean} params.isRecallMode - Whether the event was viewed in recall/memories mode
 * @returns {string} The target screen ID ('MEMORIES', 'INTRO', or 'DAY_END')
 */
export function resolveEventReturnScreen({ eventKind, isRecallMode }) {
  if (isRecallMode) {
    return 'MEMORIES';
  }
  if (eventKind === 'flashback_intro') {
    return 'INTRO';
  }
  return 'DAY_END';
}

/**
 * Resolves all actions that should occur when an event closes.
 * Pure function: no side effects.
 * 
 * @param {Object} params
 * @param {Object|null} params.event - The event object that just finished
 * @param {boolean} params.isRecallMode - Whether the event was viewed in recall/memories mode
 * @returns {{
 *   shouldMarkSeen: boolean,
 *   nextScreen: string,
 *   shouldClearBackgroundOverride: boolean,
 *   shouldPlayDayEndSfx: boolean
 * }}
 */
export function resolveEventCloseActions({ event, isRecallMode }) {
  // Default safe behavior for null/undefined event
  if (!event) {
    return {
      shouldMarkSeen: false,
      nextScreen: isRecallMode ? 'MEMORIES' : 'DAY_END',
      shouldClearBackgroundOverride: true,
      shouldPlayDayEndSfx: false,
    };
  }

  // Recall mode: never mark seen, always return to MEMORIES
  if (isRecallMode) {
    return {
      shouldMarkSeen: false,
      nextScreen: 'MEMORIES',
      shouldClearBackgroundOverride: true,
      shouldPlayDayEndSfx: false,
    };
  }

  // flashback_intro: mark seen, return to INTRO, no day-end SFX
  if (event.kind === 'flashback_intro') {
    return {
      shouldMarkSeen: true,
      nextScreen: 'INTRO',
      shouldClearBackgroundOverride: true,
      shouldPlayDayEndSfx: false,
    };
  }

  // Normal affection events (_5, _10, _20) and route_climax:
  // mark seen, return to DAY_END, play day-end SFX
  return {
    shouldMarkSeen: true,
    nextScreen: 'DAY_END',
    shouldClearBackgroundOverride: true,
    shouldPlayDayEndSfx: true,
  };
}
