/**
 * Render Model logic for MadeInMaghribal project.
 */
const { CHARACTERS } = require('../data/characters.cjs');

/**
 * Transforms VN scenario step and session state into a render model.
 * @param {object} session 
 * @param {object} step 
 * @returns {object}
 */
function getVnRenderModel(session, step) {
  const speakerChar = step.speakerId ? CHARACTERS.find(c => c.characterId === step.speakerId) : null;
  
  return {
    backgroundId: step.backgroundId || 'AS_BG_SHOP',
    standing: step.standingCharacterId ? {
      characterId: step.standingCharacterId,
      expressionId: step.standingExpression
    } : null,
    speaker: speakerChar ? {
      name: speakerChar.name,
      iconAssetId: `AS_IC_${step.speakerId}_${step.speakerExpression || 'normal'}`
    } : null,
    text: step.text,
    choices: step.choice || []
  };
}

/**
 * Transforms quiz question and session state into a rhythm render model.
 * @param {object} session 
 * @param {object} question 
 * @returns {object}
 */
function getRhythmRenderModel(session, question) {
  return {
    songId: session.currentSong,
    question: {
      promptText: question.promptText,
      choices: [
        { itemId: question.correctItemId, name: "Correct Option" },
        { itemId: question.wrongItemId, name: "Wrong Option" }
      ]
    },
    progress: { current: session.turnProgress || 0, total: 10 },
    stats: session.scores
  };
}

module.exports = { getVnRenderModel, getRhythmRenderModel };
