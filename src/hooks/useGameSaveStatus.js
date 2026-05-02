import { useState, useCallback } from 'react';
import { loadSaveData, hasSaveData, clearSaveData } from '../game/saveData.js';

/**
 * Game save status hook.
 * Manages hasSave state and provides methods to check/clear save status.
 * hasSave is true only when save data exists AND screen is not 'START'.
 * 
 * @returns {{
 *   hasSave: boolean,
 *   setHasSave: (value: boolean) => void,
 *   refreshHasSave: () => boolean,
 *   clearSaveAndRefresh: () => void,
 * }}
 */
export function useGameSaveStatus() {
  const [hasSave, setHasSaveState] = useState(() => {
    const data = loadSaveData();
    return !!(data && data.screen !== 'START');
  });

  const refreshHasSave = useCallback(() => {
    const data = loadSaveData();
    const exists = !!(data && data.screen !== 'START');
    setHasSaveState(exists);
    return exists;
  }, []);

  const clearSaveAndRefresh = useCallback(() => {
    clearSaveData();
    setHasSaveState(false);
  }, []);

  const setHasSave = useCallback((value) => {
    setHasSaveState(Boolean(value));
  }, []);

  return {
    hasSave,
    setHasSave,
    refreshHasSave,
    clearSaveAndRefresh,
  };
}
