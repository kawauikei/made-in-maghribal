import { getEventsByHeroine } from '../data/affectionEvents.js';

/**
 * Checks for any new events that should be unlocked based on current affection.
 * 
 * @param {string} heroineId - The active heroine
 * @param {number} currentAffection - Current affection level
 * @param {string[]} seenEventIds - List of IDs already seen by the player
 * @returns {Object|null} The first eligible event or null if none
 */
export function checkNewEventUnlock(heroineId, currentAffection, seenEventIds) {
  const events = getEventsByHeroine(heroineId);
  
  // Find the highest threshold event that meets criteria and hasn't been seen
  // For MVP, we'll just return the first one found that is eligible.
  const eligibleEvents = events.filter(event => 
    currentAffection >= event.threshold && 
    !seenEventIds.includes(event.id)
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
 * @returns {string[]} Array of strings (pages)
 */
export function getEventPages(event, routeMode) {
  if (!event) return [""];
  
  // 1. Try route-specific pages
  if (routeMode === 'long_history' && event.routePages?.long_history) {
    return event.routePages.long_history;
  }
  
  // 2. Try default pages array
  if (event.pages && Array.isArray(event.pages) && event.pages.length > 0) {
    return event.pages;
  }
  
  // 3. Fallback to single text property
  return [event.text || ""];
}
