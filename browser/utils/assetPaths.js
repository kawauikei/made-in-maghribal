/**
 * Asset path utilities for MadeInMaghribal.
 * Verified against actual filesystem structure.
 */

function normalizeCharacterDir(id) {
  return String(id).replace(/^CH_/i, '').toLowerCase();
}

function getCharacterStandingPath(id, expression = 'normal') {
  if (!id) return '';
  const charDir = normalizeCharacterDir(id);
  // Valid expressions from filesystem: normal, joy, fun, anger, cry, sorrow, surprise, etc.
  const expFile = expression.toLowerCase();
  return `characters/${charDir}/standing_proc/${expFile}.png`;
}

function getCharacterIconPath(id, expression = 'normal') {
  if (!id) return '';
  const charDir = normalizeCharacterDir(id);
  const expFile = expression.toLowerCase();
  return `characters/${charDir}/face_proc/${expFile}.png`;
}


function getCharacterVisualImagePath(id, expression = 'normal', imageKind = 'standing') {
  if (imageKind === 'face') return getCharacterIconPath(id, expression);
  return getCharacterStandingPath(id, expression);
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
  normalizeCharacterDir,
  getCharacterStandingPath,
  getCharacterIconPath,
  getCharacterVisualImagePath,
  getBackgroundPath
};
