/**
 * Visual Novel (VN) interaction helpers for Made in Maghribal.
 * This module provides logic for handling click-to-advance and other VN-related UI interactions.
 */

/**
 * Determines if the current click event should be ignored for VN progression.
 * Returns true if a modal is open or if the click target is an interactive element.
 * 
 * @param {Object} e - React or DOM MouseEvent
 * @param {Object} modalStates - Visibility of blocking UI elements { showOptions, showLog, showHelp, showSoundTest }
 * @returns {boolean}
 */
export const shouldIgnoreVnAdvanceClick = (e, { showOptions, showLog, showHelp, showSoundTest }) => {
  if (showOptions || showLog || showHelp || showSoundTest) return true;
  
  // Ignore clicks on buttons, links, inputs, or elements marked with data-no-vn-advance
  const target = e.target;
  if (target.closest('button, a, input, select, textarea, [data-no-vn-advance]')) {
    return true;
  }
  
  return false;
};

/**
 * Safely triggers the advance method on a VNBox ref if it exists.
 * 
 * @param {Object} vnRef - React ref object for VNBox
 */
export const safeAdvanceVnBox = (vnRef) => {
  if (vnRef && vnRef.current && typeof vnRef.current.advance === 'function') {
    vnRef.current.advance();
  }
};

/**
 * Checks if the current screen ID supports click-to-advance interaction.
 * 
 * @param {string} screen - Screen name (e.g., 'PROLOGUE', 'INTRO')
 * @returns {boolean}
 */
export const isVnAdvanceScreen = (screen) => {
  return ['PROLOGUE', 'INTRO', 'EVENT', 'ENDING'].includes(screen);
};

/**
 * Utility to determine if VN text should skip typewriter animation.
 * 
 * @param {boolean} isInstantTextSpeed - Global setting for instant text
 * @param {boolean} isSeen - Whether the content has been seen before (optional)
 * @returns {boolean}
 */
export const shouldSkipTypewriter = (isInstantTextSpeed, isSeen = false) => {
  return isInstantTextSpeed || isSeen;
};
