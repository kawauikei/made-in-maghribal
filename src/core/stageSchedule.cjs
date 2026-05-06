/**
 * Stage Schedule logic for MadeInMaghribal project.
 */

/**
 * Determines the song to be played based on the current turn and selected route.
 * @param {number} turn 
 * @param {string} heroineId 
 * @param {string} routeMode 
 * @returns {string} songId
 */
function getSongForTurn(turn, heroineId, routeMode) {
  // Acceptance: Turn 1 は全員 main03_puzzle 固定
  if (turn === 1) return 'main03_puzzle';

  // Long-history routes currently share the heroine game track set.
  // Route-specific song ids can be introduced when dedicated IF tracks exist.
  if (turn === 2 || turn === 5) {
    return `BGM_GAME_${heroineId}_1`;
  }

  // Turn 3, 4 placeholders
  return 'BGM_EXTRA_ROMANCE';
}

module.exports = { getSongForTurn };
