/**
 * Validator for Tone Guides in MadeInMaghribal project.
 */
const { TONE_GUIDES } = require('../data/toneGuides.cjs');

/**
 * Validates a single tone guide object.
 * @param {object} toneGuide 
 * @returns {{ok: boolean, reason?: string}}
 */
function validateToneGuide(toneGuide) {
  if (!toneGuide.toneGuideId || !toneGuide.toneGuideId.startsWith('TG_')) {
    return { ok: false, reason: "Invalid ToneGuide ID" };
  }
  if (!toneGuide.rules || !toneGuide.rules.normal) {
    return { ok: false, reason: "ToneGuide must have normal rules" };
  }
  return { ok: true };
}

/**
 * Gets all registered tone guide IDs.
 * @returns {string[]}
 */
function getAllToneGuideIds() {
  return TONE_GUIDES.map(tg => tg.toneGuideId);
}

module.exports = { validateToneGuide, getAllToneGuideIds };
