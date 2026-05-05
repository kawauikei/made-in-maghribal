/**
 * Unlock State logic for MadeInMaghribal project.
 */

/**
 * Returns the default initial unlock state.
 * @returns {object}
 */
function getInitialUnlockState() {
  return {
    goodEndingCleared: { HAKIMA: false, MIRA: false, DARIYA: false }
  };
}

module.exports = { getInitialUnlockState };
