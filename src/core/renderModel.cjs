/**
 * Render Model logic for MadeInMaghribal project.
 */
const { CHARACTERS } = require('../data/characters.cjs');

const DEFAULT_TITLE = 'Made in Maghribal';

function getTitleRenderModel(state = {}) {
  const saveSummary = state.saveSummary || null;
  return {
    title: state.title || DEFAULT_TITLE,
    backgroundId: state.backgroundId || 'AS_BG_TITLE',
    canContinue: Boolean(saveSummary),
    lastHeroineId: saveSummary?.selectedHeroineId || null,
    saveSummary
  };
}

function findCharacter(characterId) {
  return CHARACTERS.find((character) => character.characterId === characterId) || null;
}

function buildSpeakerModel(step) {
  if (!step.speakerId) return null;
  const speakerChar = findCharacter(step.speakerId);
  if (!speakerChar) return null;
  return {
    name: speakerChar.name,
    iconAssetId: `AS_IC_${step.speakerId}_${step.speakerExpression || 'normal'}`
  };
}

function buildStandingModel(step) {
  if (!step.standingCharacterId) return null;
  return {
    characterId: step.standingCharacterId,
    expressionId: step.standingExpression
  };
}

function buildRhythmChoices(question) {
  return [
    { itemId: question.correctItemId, name: "Correct Option" },
    { itemId: question.wrongItemId, name: "Wrong Option" }
  ];
}

/**
 * Transforms VN scenario step and session state into a render model.
 * @param {object} session 
 * @param {object} step 
 * @returns {object}
 */
function getVnRenderModel(session, step) {
  return {
    backgroundId: step.backgroundId || 'AS_BG_SHOP',
    standing: buildStandingModel(step),
    speaker: buildSpeakerModel(step),
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
      choices: buildRhythmChoices(question)
    },
    progress: { current: session.turnProgress || 0, total: 10 },
    stats: session.scores
  };
}

module.exports = { getTitleRenderModel, getVnRenderModel, getRhythmRenderModel };
