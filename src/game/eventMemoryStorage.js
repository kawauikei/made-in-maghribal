/**
 * Persistent event memory for loop / repeat-play management.
 * This is separate from the main save slot so a fresh in-game save reset does
 * not automatically forget previously seen narrative events.
 */

export const EVENT_MEMORY_KEY = 'made_in_maghribal_event_memory';

function isStorageAvailable() {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function normalizeIdList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(id => typeof id === 'string' && id.length > 0))];
}

export function loadPersistentSeenEventIds() {
  if (!isStorageAvailable()) return [];

  try {
    const raw = localStorage.getItem(EVENT_MEMORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return normalizeIdList(parsed);
  } catch {
    return [];
  }
}

export function savePersistentSeenEventIds(seenEventIds) {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.setItem(EVENT_MEMORY_KEY, JSON.stringify(normalizeIdList(seenEventIds)));
    return true;
  } catch {
    return false;
  }
}

export function addPersistentSeenEventIds(nextIds) {
  const current = loadPersistentSeenEventIds();
  const merged = normalizeIdList([...current, ...(Array.isArray(nextIds) ? nextIds : [])]);
  savePersistentSeenEventIds(merged);
  return merged;
}

export function clearPersistentSeenEventIds() {
  if (!isStorageAvailable()) return;

  try {
    localStorage.removeItem(EVENT_MEMORY_KEY);
  } catch {
    // Ignore storage errors.
  }
}
