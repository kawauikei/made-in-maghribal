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

function getHeroineSelectRenderModel(state = {}) {
  const heroines = Array.isArray(state.heroines) ? state.heroines : [];
  const progressSummary = state.progressSummary || {};
  return {
    heroines: heroines.map((heroine) => {
      const heroineId = heroine.heroineId || heroine.id;
      const routeUnlocks = progressSummary.heroineModeUnlocks?.[heroineId] || {};
      return {
        heroineId,
        name: heroine.name || '',
        title: heroine.title || '',
        description: heroine.description || heroine.desc || '',
        iconAssetId: heroine.iconAssetId || null,
        routeModes: {
          normal: true,
          long_history: Boolean(routeUnlocks.long_history)
        },
        carryover: heroine.carryover || null
      };
    }),
    canSelectExtra: heroines.some((heroine) => {
      const heroineId = heroine.heroineId || heroine.id;
      return Boolean(progressSummary.heroineModeUnlocks?.[heroineId]?.long_history);
    })
  };
}

function getTurnResultRenderModel(state = {}) {
  const scores = state.scores || {};
  const startScores = state.startScores || {};
  const delta = {
    revenue: (scores.revenue || 0) - (startScores.revenue || 0),
    satisfaction: (scores.satisfaction || 0) - (startScores.satisfaction || 0),
    reputation: (scores.reputation || 0) - (startScores.reputation || 0)
  };
  const totalScore = (scores.revenue || 0) + (scores.satisfaction || 0) + (scores.reputation || 0);
  return {
    turn: state.turn || 1,
    stats: {
      revenue: scores.revenue || 0,
      satisfaction: scores.satisfaction || 0,
      reputation: scores.reputation || 0,
      delta,
      totalScore,
      rank: state.rank || null
    },
    heroineComment: state.heroineComment || '',
    unlocks: Array.isArray(state.unlocks) ? state.unlocks : []
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

module.exports = {
  getTitleRenderModel,
  getHeroineSelectRenderModel,
  getVnRenderModel,
  getRhythmRenderModel,
  getTurnResultRenderModel
};
