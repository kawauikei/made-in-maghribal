/**
 * Autosave scaffold for MadeInMaghribal.
 *
 * Current scope:
 * - Stores the current run so the title can enable 「つづきから」.
 * - Does not clear long-term collection data.
 * - Long-term save targets to formalize later:
 *   heroine mode unlocks, heroine/mode score records, event replay state,
 *   item collection state, and optional current run position.
 */

const { GameSession } = require('../core/gameSessionFlow.cjs');

const RUN_SAVE_KEY = 'madeinmaghribal.autosave.run.v1';
const SAVE_VERSION = 1;

function safeLocalStorage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch (e) {
    return null;
  }
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasRunSave() {
  const storage = safeLocalStorage();
  if (!storage) return false;
  return Boolean(storage.getItem(RUN_SAVE_KEY));
}

function loadRunSave() {
  const storage = safeLocalStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(RUN_SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== SAVE_VERSION || !parsed.session) return null;
    return parsed;
  } catch (e) {
    console.warn('Failed to load run autosave:', e);
    return null;
  }
}

function clearRunSave() {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(RUN_SAVE_KEY);
  } catch (e) {
    console.warn('Failed to clear run autosave:', e);
  }
}

function shouldSaveCurrentRun(controller) {
  const session = controller?.session;
  if (!session?.selectedHeroineId) return false;
  if (session.phase === 'TITLE' || session.phase === 'OPENING' || session.phase === 'HEROINE_SELECT') return false;
  return true;
}

function buildRunSave(controller) {
  const session = controller.session;
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    session: {
      phase: session.phase,
      turn: session.turn,
      subPhase: session.subPhase,
      selectedHeroineId: session.selectedHeroineId,
      routeMode: session.routeMode,
      scores: cloneJson(session.scores || {}),
      affection: cloneJson(session.affection || {}),
      unlockState: cloneJson(session.unlockState || {})
    },
    quizState: {
      questionIndex: controller.quizState?.questionIndex || 0,
      totalQuestions: controller.quizState?.totalQuestions || 10,
      turnItemLog: cloneJson(controller.quizState?.turnItemLog || []),
      currentQuestion: cloneJson(controller.quizState?.currentQuestion || null),
      currentChoices: cloneJson(controller.quizState?.currentChoices || []),
      lastResult: cloneJson(controller.quizState?.lastResult || null),
      turnStartScore: cloneJson(controller.quizState?.turnStartScore || null)
    },
    longTermTargetsMemo: {
      heroineModeUnlocks: 'future',
      bestSatisfactionByHeroineMode: 'future',
      bestReputationByHeroineMode: 'future',
      eventReplayState: 'future',
      itemCollectionState: 'already stored separately'
    }
  };
}

function saveRun(controller) {
  const storage = safeLocalStorage();
  if (!storage || !shouldSaveCurrentRun(controller)) return false;
  try {
    storage.setItem(RUN_SAVE_KEY, JSON.stringify(buildRunSave(controller)));
    return true;
  } catch (e) {
    console.warn('Failed to save run autosave:', e);
    return false;
  }
}

function applyRunSave(controller, saveData) {
  if (!controller || !saveData?.session) return false;
  const session = new GameSession();
  Object.assign(session, saveData.session);
  session.scores = { revenue: 0, satisfaction: 0, reputation: 0, ...(saveData.session.scores || {}) };
  session.affection = { HAKIMA: 0, MIRA: 0, DARIYA: 0, ...(saveData.session.affection || {}) };
  controller.session = session;

  const nextQuizState = controller.createInitialQuizState();
  if (saveData.quizState) {
    nextQuizState.questionIndex = saveData.quizState.questionIndex || 0;
    nextQuizState.totalQuestions = saveData.quizState.totalQuestions || nextQuizState.totalQuestions;
    nextQuizState.turnItemLog = cloneJson(saveData.quizState.turnItemLog || []);
    nextQuizState.currentQuestion = cloneJson(saveData.quizState.currentQuestion || null);
    nextQuizState.currentChoices = cloneJson(saveData.quizState.currentChoices || []);
    nextQuizState.lastResult = cloneJson(saveData.quizState.lastResult || null);
    nextQuizState.turnStartScore = cloneJson(saveData.quizState.turnStartScore || null);
    nextQuizState.inputLocked = false;

    // If an older save has QUIZ phase without a restorable question, fall back
    // to BEFORE_OPEN instead of rendering an empty/broken quiz screen.
    if (session.phase === 'MAIN_GAME' && session.subPhase === 'QUIZ' && !nextQuizState.currentQuestion) {
      session.subPhase = 'BEFORE_OPEN';
      nextQuizState.questionIndex = 0;
      nextQuizState.currentChoices = [];
    }
  }
  controller.quizState = nextQuizState;
  return true;
}

module.exports = {
  RUN_SAVE_KEY,
  hasRunSave,
  loadRunSave,
  clearRunSave,
  saveRun,
  applyRunSave
};
