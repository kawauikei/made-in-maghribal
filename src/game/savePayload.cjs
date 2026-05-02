/**
 * Build game save payload from current state.
 * Pure function: no side effects, no localStorage access.
 * 
 * @param {Object} params
 * @param {string} params.screen
 * @param {string} params.activeHeroineId
 * @param {string} params.routeMode
 * @param {Object} params.workshopState
 * @param {Object} params.affection
 * @param {string[]} params.seenEventIds
 * @param {string[]} params.seenTalkIds
 * @param {Object|null} params.activeEvent
 * @param {Object[]} params.vnBacklog
 * @param {string} params.textSpeed
 * @param {boolean} params.instantUnreadText
 * @param {number} params.bgmVolume
 * @param {number} params.seVolume
 * @param {boolean} params.isAudioEnabled
 * @returns {Object} Save payload object
 */
function buildGameSavePayload({
  screen,
  activeHeroineId,
  routeMode,
  workshopState,
  affection,
  seenEventIds,
  seenTalkIds,
  activeEvent,
  vnBacklog,
  textSpeed,
  instantUnreadText,
  bgmVolume,
  seVolume,
  isAudioEnabled,
}) {
  return {
    screen,
    activeHeroineId,
    routeMode,
    workshopState,
    affection,
    seenEventIds,
    seenTalkIds,
    activeEvent,
    vnBacklog,
    textSpeed,
    instantUnreadText,
    bgmVolume,
    seVolume,
    isAudioEnabled,
  };
}

/**
 * Build settings-only save payload for START screen.
 * Pure function: no side effects, no localStorage access.
 * 
 * @param {Object} params
 * @param {string} params.routeMode
 * @param {string} params.textSpeed
 * @param {boolean} params.instantUnreadText
 * @param {number} params.bgmVolume
 * @param {number} params.seVolume
 * @param {boolean} params.isAudioEnabled
 * @returns {Object} Settings payload object
 */
function buildSettingsSavePayload({
  routeMode,
  textSpeed,
  instantUnreadText,
  bgmVolume,
  seVolume,
  isAudioEnabled,
}) {
  return {
    routeMode,
    textSpeed,
    instantUnreadText,
    bgmVolume,
    seVolume,
    isAudioEnabled,
  };
}

module.exports = {
  buildGameSavePayload,
  buildSettingsSavePayload,
};
