/**
 * Auto-save policy constants.
 */
export const AUTO_SAVE_MODE = {
  NONE: "none",
  FULL: "full",
  SETTINGS_ONLY: "settings_only",
};

/**
 * Resolve auto-save policy based on current state.
 * Pure function: no side effects, no localStorage access.
 * 
 * @param {Object} params
 * @param {string} params.screen - Current screen state
 * @param {boolean} params.isDefaultSettings - Whether settings are at default values
 * @param {boolean} params.hasExistingSave - Whether existing save data exists
 * @returns {{
 *   mode: "none" | "full" | "settings_only",
 *   shouldSave: boolean,
 *   shouldSetHasSave: boolean,
 * }}
 */
export function resolveAutoSavePolicy({
  screen,
  isDefaultSettings,
  hasExistingSave,
}) {
  // Non-START screen: always full save
  if (screen !== "START") {
    return {
      mode: AUTO_SAVE_MODE.FULL,
      shouldSave: true,
      shouldSetHasSave: true,
    };
  }

  // START screen: settings-only save or no save
  // Save if: existing save exists OR settings are non-default
  if (hasExistingSave || !isDefaultSettings) {
    return {
      mode: AUTO_SAVE_MODE.SETTINGS_ONLY,
      shouldSave: true,
      shouldSetHasSave: true,
    };
  }

  // No existing save and default settings: no save
  return {
    mode: AUTO_SAVE_MODE.NONE,
    shouldSave: false,
    shouldSetHasSave: false,
  };
}

/**
 * Check if settings are at default values.
 * Pure function: no side effects.
 * 
 * @param {Object} params
 * @param {string} params.routeMode
 * @param {string} params.textSpeed
 * @param {boolean} params.instantUnreadText
 * @param {number} params.bgmVolume
 * @param {number} params.seVolume
 * @param {boolean} params.isAudioEnabled
 * @param {number} [params.defaultAudioVolume=0.8]
 * @returns {boolean}
 */
export function isDefaultSettings({
  routeMode,
  textSpeed,
  instantUnreadText,
  bgmVolume,
  seVolume,
  isAudioEnabled,
  defaultAudioVolume = 0.8,
}) {
  return (
    routeMode === "normal" &&
    textSpeed === "normal" &&
    instantUnreadText === false &&
    Math.abs(bgmVolume - defaultAudioVolume) < 0.01 &&
    Math.abs(seVolume - defaultAudioVolume) < 0.01 &&
    isAudioEnabled === false
  );
}
