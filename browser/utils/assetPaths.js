/**
 * Asset path utilities for MadeInMaghribal.
 * Verified against actual filesystem structure.
 */

function getCharacterStandingPath(id, expression = 'normal') {
  if (!id) return '';
  const charDir = id.toLowerCase();
  // Valid expressions from filesystem: normal, joy, fun, anger, cry, sorrow, surprise, etc.
  const expFile = expression.toLowerCase();
  return `characters/${charDir}/standing_proc/${expFile}.png`;
}

function getCharacterIconPath(id) {
  if (!id) return '';
  const charDir = id.toLowerCase();
  return `characters/${charDir}/standing_proc/normal.png`;
}

function getBackgroundPath(sceneId) {
  const backgrounds = {
    MARKET: 'images/background/bg_market_central.jpeg',
    TEA_ROOM: 'images/background/bg_shop_interior_service.jpeg',
    OASIS: 'images/background/bg_spot_oasis_view.jpeg'
  };
  return backgrounds[sceneId] || backgrounds.TEA_ROOM;
}

module.exports = {
  getCharacterStandingPath,
  getCharacterIconPath,
  getBackgroundPath
};
