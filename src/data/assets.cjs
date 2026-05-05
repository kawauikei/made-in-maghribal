/**
 * Asset Manifest for MadeInMaghribal project.
 */
const EXPRESSIONS = {
  scenario: ['normal', 'joy', 'fun', 'surprise', 'sorrow', 'cry', 'anger'],
  ui_only: ['maid', 'social', 'student']
};

const ASSET_MANIFEST = {
  backgrounds: ['AS_BG_SHOP', 'AS_BG_TOWN', 'AS_BG_FOREST'],
  characters: {
    CH_NADIR: {
      expressions: ['normal', 'joy', 'fun', 'surprise', 'sorrow', 'cry', 'anger']
    },
    CH_HAKIMA: {
      expressions: ['normal', 'joy', 'fun', 'surprise', 'sorrow', 'cry', 'anger', 'maid', 'social', 'student']
    },
    CH_MIRA: {
      expressions: ['normal', 'joy', 'fun', 'surprise', 'sorrow', 'cry', 'anger', 'maid', 'social', 'student']
    },
    CH_DARIYA: {
      expressions: ['normal', 'joy', 'fun', 'surprise', 'sorrow', 'cry', 'anger', 'maid', 'social', 'student']
    }
  },
  ui: ['AS_UI_BUTTON_OK', 'AS_UI_BUTTON_CANCEL', 'AS_UI_FRAME']
};

module.exports = { EXPRESSIONS, ASSET_MANIFEST };
