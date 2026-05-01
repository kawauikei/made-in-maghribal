/**
 * Debug / Assist storage helpers.
 * Isolates localStorage access for debug and assist flags,
 * keeping them separate from the main game save system.
 */

export const DEBUG_MODE_KEY = 'made_in_maghribal_debug_mode';
export const AUTO_SKIP_QUIZ_KEY = 'made_in_maghribal_auto_skip_quiz';
export const DEBUG_UNLOCK_ALL_KEY = 'made_in_maghribal_debug_unlock_all';

function isStorageAvailable() {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Reads a boolean flag from localStorage.
 * Falls back to defaultValue if key is missing, invalid, or storage is unavailable.
 */
export function loadBooleanFlag(key, defaultValue = false) {
  if (!isStorageAvailable()) return defaultValue;
  try {
    const val = localStorage.getItem(key);
    if (val === null) return defaultValue;
    return val === 'true';
  } catch {
    return defaultValue;
  }
}

/**
 * Writes a boolean flag to localStorage.
 * Silently ignores errors if storage is unavailable.
 */
export function saveBooleanFlag(key, value) {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(key, String(Boolean(value)));
  } catch {
    // Silently ignore storage errors
  }
}

export function loadDebugModeEnabled() {
  return loadBooleanFlag(DEBUG_MODE_KEY, false);
}

export function saveDebugModeEnabled(value) {
  saveBooleanFlag(DEBUG_MODE_KEY, value);
}

export function loadAutoSkipQuizEnabled() {
  return loadBooleanFlag(AUTO_SKIP_QUIZ_KEY, false);
}

export function saveAutoSkipQuizEnabled(value) {
  saveBooleanFlag(AUTO_SKIP_QUIZ_KEY, value);
}

export function loadDebugUnlockAllEnabled() {
  return loadBooleanFlag(DEBUG_UNLOCK_ALL_KEY, true);
}

export function saveDebugUnlockAllEnabled(value) {
  saveBooleanFlag(DEBUG_UNLOCK_ALL_KEY, value);
}
