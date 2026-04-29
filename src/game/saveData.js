import { createInitialWorkshopState } from './management.js';
import { createInitialAffection, clampAffection } from './affection.js';
import { HEROINES } from '../data/heroines.js';

export const SAVE_DATA_VERSION = "1.0";
export const STORAGE_KEY = "made_in_maghribal_save";

/**
 * Creates the default save data structure
 * @returns {Object}
 */
export function createDefaultSaveData() {
  return {
    version: SAVE_DATA_VERSION,
    screen: 'START',
    activeHeroineId: 'hakima',
    routeMode: 'normal',
    workshopState: createInitialWorkshopState(),
    affection: createInitialAffection(HEROINES.map(h => h.id)),
    seenEventIds: [],
    activeEvent: null,
    vnBacklog: [],
    isAudioEnabled: false,
    timestamp: Date.now()
  };
}

/**
 * Validates and fixes save data to ensure it's safe to use.
 * Clamps values and filters unknown IDs.
 * @param {Object} raw 
 * @returns {Object}
 */
export function normalizeSaveData(raw) {
  if (!raw || typeof raw !== 'object') {
    return createDefaultSaveData();
  }

  const base = createDefaultSaveData();
  const normalized = { ...base, ...raw };

  // Version check (placeholder for future migrations)
  normalized.version = SAVE_DATA_VERSION;

  // Screen safety: If it's QUIZ, fallback to INTRO to avoid session restoration issues
  if (normalized.screen === 'QUIZ') {
    normalized.screen = 'INTRO';
  }

  // Heroine ID safety
  const validHeroineIds = HEROINES.map(h => h.id);
  if (!validHeroineIds.includes(normalized.activeHeroineId)) {
    normalized.activeHeroineId = base.activeHeroineId;
  }

  // Route mode safety
  normalized.routeMode = normalized.routeMode === 'long_history' ? 'long_history' : 'normal';

  // Affection safety
  const validatedAffection = {};
  validHeroineIds.forEach(id => {
    // If id exists in raw affection, clamp and use it. Otherwise use 0.
    const rawVal = (raw.affection && raw.affection[id]) || 0;
    validatedAffection[id] = clampAffection(Number(rawVal) || 0);
  });
  normalized.affection = validatedAffection;

  // Workshop state safety
  if (!normalized.workshopState || typeof normalized.workshopState !== 'object') {
    normalized.workshopState = base.workshopState;
  } else {
    normalized.workshopState = {
      ...base.workshopState,
      ...normalized.workshopState
    };
  }

  // Audio safety
  normalized.isAudioEnabled = Boolean(normalized.isAudioEnabled);

  if (!Array.isArray(normalized.seenEventIds)) {
    normalized.seenEventIds = [];
  }

  // Active event safety
  if (normalized.activeEvent && typeof normalized.activeEvent !== 'object') {
    normalized.activeEvent = null;
  }

  // Backlog safety: keep only valid entries and cap history size.
  if (!Array.isArray(normalized.vnBacklog)) {
    normalized.vnBacklog = [];
  } else {
    normalized.vnBacklog = normalized.vnBacklog
      .filter(entry => entry && typeof entry === 'object' && typeof entry.text === 'string')
      .slice(-100)
      .map((entry, index) => ({
        speaker: typeof entry.speaker === 'string' ? entry.speaker : '',
        text: entry.text,
        screen: typeof entry.screen === 'string' && entry.screen ? entry.screen : normalized.screen,
        heroineId: validHeroineIds.includes(entry.heroineId) ? entry.heroineId : normalized.activeHeroineId,
        routeMode: entry.routeMode === 'long_history' ? 'long_history' : 'normal',
        sequence: Number.isFinite(entry.sequence) ? entry.sequence : index + 1
      }));
  }

  return normalized;
}

/**
 * Safely checks if localStorage is available
 * @returns {boolean}
 */
function isStorageAvailable() {
  try {
    return typeof localStorage !== 'undefined';
  } catch (e) {
    return false;
  }
}

/**
 * Saves game data to localStorage
 * @param {Object} data 
 * @returns {boolean} Success
 */
export function saveGameData(data) {
  if (!isStorageAvailable()) return false;
  
  try {
    const serialized = JSON.stringify({
      ...data,
      timestamp: Date.now()
    });
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (e) {
    console.error("Failed to save game data:", e);
    return false;
  }
}

/**
 * Loads game data from localStorage
 * @returns {Object|null} Normalized data or null if not found
 */
export function loadSaveData() {
  if (!isStorageAvailable()) return null;

  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    
    const parsed = JSON.parse(serialized);
    return normalizeSaveData(parsed);
  } catch (e) {
    console.error("Failed to load or parse save data:", e);
    return null;
  }
}

/**
 * Checks if save data exists
 * @returns {boolean}
 */
export function hasSaveData() {
  if (!isStorageAvailable()) return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Clears save data from localStorage
 */
export function clearSaveData() {
  if (!isStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEY);
}
