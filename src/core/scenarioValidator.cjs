/**
 * Scenario Validator for MadeInMaghribal project.
 */
const { validateId } = require('./idSchema.cjs');
const { validateAssetUsage } = require('./assetValidator.cjs');

/**
 * Validates a single scenario step.
 * @param {object} step 
 * @returns {{ok: boolean, reason?: string}}
 */
function validateScenarioStep(step) {
  // Acceptance: speakerId, standingCharacterId, expressionId, jump先sceneId を検証できる
  if (step.speakerId) {
    const res = validateId('characterId', step.speakerId);
    if (!res.ok) return res;
    
    if (step.speakerExpression) {
      // 話者アイコンはUIコンテキスト
      const assetRes = validateAssetUsage(step.speakerId, step.speakerExpression, 'ui');
      if (!assetRes.ok) return assetRes;
    }
  }

  if (step.standingCharacterId) {
    const res = validateId('characterId', step.standingCharacterId);
    if (!res.ok) return res;

    if (step.standingExpression) {
      // 立ち絵はシナリオコンテキスト
      const assetRes = validateAssetUsage(step.standingCharacterId, step.standingExpression, 'scenario');
      if (!assetRes.ok) return assetRes;
    }
  }

  if (step.backgroundId) {
    const res = validateId('assetId', step.backgroundId);
    if (!res.ok) return res;
  }

  if (step.jump && typeof step.jump === 'string') {
    if (step.jump.startsWith('SC_')) {
      const res = validateId('sceneId', step.jump);
      if (!res.ok) return res;
    }
  }

  return { ok: true };
}

module.exports = { validateScenarioStep };
