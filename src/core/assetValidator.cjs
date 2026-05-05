/**
 * Asset Validator for MadeInMaghribal project.
 */
const { EXPRESSIONS, ASSET_MANIFEST } = require('../data/assets.cjs');

/**
 * Validates asset usage based on character and context.
 * @param {string} charId 
 * @param {string} exprId 
 * @param {string} context - 'scenario' or 'ui'
 * @returns {{ok: boolean, reason?: string}}
 */
function validateAssetUsage(charId, exprId, context) {
  const char = ASSET_MANIFEST.characters[charId];
  if (!char) return { ok: false, reason: "Unknown Character" };

  if (!char.expressions.includes(exprId)) {
    return { ok: false, reason: `Expression ${exprId} not found for character ${charId}` };
  }

  // Acceptance: scenario用参照とUI用参照のusage制限を検証できる
  // Acceptance: ui_only表情が通常シナリオに出た場合に警告またはエラーにできる
  if (context === 'scenario' && EXPRESSIONS.ui_only.includes(exprId)) {
    return { ok: false, reason: "Cannot use UI-only expression in scenario context" };
  }

  return { ok: true };
}

module.exports = { validateAssetUsage };
