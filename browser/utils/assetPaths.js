/**
 * Asset path utilities for MadeInMaghribal.
 * Verified against actual filesystem structure.
 */

function normalizeCharacterDir(id) {
  const normalized = String(id).replace(/^CH_/i, '').toUpperCase();
  const folderNames = {
    NADIR: 'nader',
    NADER: 'nader',
    HAKIMA: 'hakima',
    MIRA: 'mira',
    DARIYA: 'dariya'
  };
  return folderNames[normalized] || normalized.toLowerCase();
}

function getCharacterStandingPath(id, expression = 'normal') {
  if (!id) return '';
  const charDir = normalizeCharacterDir(id);
  // Valid expressions from filesystem: normal, joy, fun, anger, cry, sorrow, surprise, etc.
  const expFile = expression.toLowerCase();
  return `characters/${charDir}/standing_proc/${expFile}.webp`;
}

function getCharacterIconPath(id, expression = 'normal') {
  if (!id) return '';
  const charDir = normalizeCharacterDir(id);
  const expFile = expression.toLowerCase();
  return `characters/${charDir}/face_proc/${expFile}.webp`;
}


function getCharacterVisualImagePath(id, expression = 'normal', imageKind = 'standing') {
  if (imageKind === 'face') return getCharacterIconPath(id, expression);
  return getCharacterStandingPath(id, expression);
}

function getBackgroundPath(sceneId) {
  const backgrounds = {
    MARKET: 'images/background/bg_market_central.webp',
    TEA_ROOM: 'images/background/bg_shop_interior_service.webp',
    OASIS: 'images/background/bg_spot_oasis_view.webp'
  };
  return backgrounds[sceneId] || backgrounds.TEA_ROOM;
}

function getStillPath(stillId) {
  return `images/still/${stillId}.webp`;
}

function getGalleryImagePath(item) {
  if (!item) return '';
  return item.path;
}

module.exports = {
  normalizeCharacterDir,
  getCharacterStandingPath,
  getCharacterIconPath,
  getCharacterVisualImagePath,
  getBackgroundPath,
  getStillPath,
  getGalleryImagePath
};
