/**
 * Long-term player progress save data.
 *
 * Scope:
 * - heroine route mode unlock state
 * - best satisfaction / reputation / revenue by heroine + route mode
 * - ending clear history
 * - event/image gallery placeholders for later connection
 *
 * Run autosave remains in saveData.js. Item encyclopedia remains in
 * itemCollection.js because items register when they appear in quiz choices.
 */

const PLAYER_PROGRESS_KEY = 'madeinmaghribal.playerProgress.v1';
const PLAYER_PROGRESS_VERSION = 1;

const HEROINE_IDS = ['HAKIMA', 'MIRA', 'DARIYA'];
const ROUTE_MODES = ['normal', 'long_history'];

function canUseStorage() {
  try {
    return typeof localStorage !== 'undefined';
  } catch (e) {
    return false;
  }
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}


function normalizeRouteMode(routeMode) {
  if (routeMode === 'extra') return 'long_history';
  if (ROUTE_MODES.includes(routeMode)) return routeMode;
  return 'normal';
}

function createRouteMap(defaultValueFactory) {
  return HEROINE_IDS.reduce((acc, heroineId) => {
    acc[heroineId] = ROUTE_MODES.reduce((routes, routeMode) => {
      routes[routeMode] = defaultValueFactory(heroineId, routeMode);
      return routes;
    }, {});
    return acc;
  }, {});
}

function getDefaultPlayerProgress() {
  return {
    version: PLAYER_PROGRESS_VERSION,
    updatedAt: null,
    heroineModeUnlocks: createRouteMap((_heroineId, routeMode) => routeMode === 'normal'),
    bestRecords: createRouteMap(() => ({
      satisfaction: 0,
      reputation: 0,
      revenue: 0,
      affection: 0,
      endingType: null,
      clearedAt: null
    })),
    endings: createRouteMap(() => ({
      normalCleared: false,
      goodCleared: false,
      lastEndingType: null,
      lastClearedAt: null
    })),
    eventSeen: {},
    imageSeen: {},
    quizHistory: []
  };
}

function normalizeProgress(progress) {
  const base = getDefaultPlayerProgress();
  const src = progress && typeof progress === 'object' ? progress : {};
  const next = {
    ...base,
    ...src,
    version: PLAYER_PROGRESS_VERSION,
    heroineModeUnlocks: { ...base.heroineModeUnlocks },
    bestRecords: { ...base.bestRecords },
    endings: { ...base.endings },
    eventSeen: src.eventSeen && typeof src.eventSeen === 'object' ? src.eventSeen : {},
    imageSeen: src.imageSeen && typeof src.imageSeen === 'object' ? src.imageSeen : {},
    quizHistory: Array.isArray(src.quizHistory) ? src.quizHistory : []
  };

  HEROINE_IDS.forEach((heroineId) => {
    next.heroineModeUnlocks[heroineId] = { ...base.heroineModeUnlocks[heroineId], ...(src.heroineModeUnlocks?.[heroineId] || {}) };
    next.bestRecords[heroineId] = { ...base.bestRecords[heroineId] };
    next.endings[heroineId] = { ...base.endings[heroineId] };
    ROUTE_MODES.forEach((routeMode) => {
      next.bestRecords[heroineId][routeMode] = {
        ...base.bestRecords[heroineId][routeMode],
        ...(src.bestRecords?.[heroineId]?.[routeMode] || {})
      };
      next.endings[heroineId][routeMode] = {
        ...base.endings[heroineId][routeMode],
        ...(src.endings?.[heroineId]?.[routeMode] || {})
      };
    });
  });

  return next;
}

function loadPlayerProgress() {
  if (!canUseStorage()) return getDefaultPlayerProgress();
  try {
    const raw = localStorage.getItem(PLAYER_PROGRESS_KEY);
    if (!raw) return getDefaultPlayerProgress();
    const parsed = JSON.parse(raw);
    return normalizeProgress(parsed);
  } catch (e) {
    console.warn('Failed to load player progress:', e);
    return getDefaultPlayerProgress();
  }
}

function clearPlayerProgress() {
  if (!canUseStorage()) return false;
  try {
    localStorage.removeItem(PLAYER_PROGRESS_KEY);
    return true;
  } catch (e) {
    console.warn('Failed to clear player progress:', e);
    return false;
  }
}

function savePlayerProgress(progress) {
  if (!canUseStorage()) return false;
  try {
    localStorage.setItem(PLAYER_PROGRESS_KEY, JSON.stringify(normalizeProgress(progress)));
    return true;
  } catch (e) {
    console.warn('Failed to save player progress:', e);
    return false;
  }
}

function recordEndingProgress(session, endingType, affection) {
  if (!session?.selectedHeroineId) return null;
  const heroineId = session.selectedHeroineId;
  const routeMode = normalizeRouteMode(session.routeMode);
  const progress = loadPlayerProgress();
  const now = new Date().toISOString();
  const scores = session.scores || {};
  const currentBest = progress.bestRecords[heroineId][routeMode];
  const nextRecord = {
    satisfaction: Math.max(currentBest.satisfaction || 0, scores.satisfaction || 0),
    reputation: Math.max(currentBest.reputation || 0, scores.reputation || 0),
    revenue: Math.max(currentBest.revenue || 0, scores.revenue || 0),
    affection: Math.max(currentBest.affection || 0, Math.round(affection || 0)),
    endingType: endingType || currentBest.endingType,
    clearedAt: now
  };

  progress.bestRecords[heroineId][routeMode] = nextRecord;
  progress.endings[heroineId][routeMode] = {
    ...progress.endings[heroineId][routeMode],
    normalCleared: true,
    goodCleared: Boolean(progress.endings[heroineId][routeMode].goodCleared || endingType === 'GOOD'),
    lastEndingType: endingType || null,
    lastClearedAt: now
  };

  if (endingType === 'GOOD') {
    progress.heroineModeUnlocks[heroineId].long_history = true;
  }

  progress.updatedAt = now;
  savePlayerProgress(progress);
  return cloneJson(progress);
}

function getPlayerProgressSummary() {
  const progress = loadPlayerProgress();
  const clearedEndings = [];
  HEROINE_IDS.forEach((heroineId) => {
    ROUTE_MODES.forEach((routeMode) => {
      const ending = progress.endings[heroineId][routeMode];
      if (ending.normalCleared || ending.goodCleared) {
        clearedEndings.push({ heroineId, routeMode, ...ending });
      }
    });
  });
  return {
    updatedAt: progress.updatedAt,
    heroineModeUnlocks: cloneJson(progress.heroineModeUnlocks),
    bestRecords: cloneJson(progress.bestRecords),
    endings: cloneJson(progress.endings),
    imageSeen: cloneJson(progress.imageSeen),
    clearedEndingCount: clearedEndings.length,
    eventSeenCount: Object.keys(progress.eventSeen || {}).length,
    imageSeenCount: Object.keys(progress.imageSeen || {}).length
  };
}

function markImageSeen(imageId) {
  if (!imageId) return;
  const progress = loadPlayerProgress();
  if (progress.imageSeen[imageId]) return;
  
  progress.imageSeen[imageId] = true;
  progress.updatedAt = new Date().toISOString();
  savePlayerProgress(progress);
}

function recordQuizHistory(entry) {
  if (!entry) return;
  const progress = loadPlayerProgress();
  if (!progress.quizHistory) progress.quizHistory = [];
  
  progress.quizHistory.unshift({
    ...entry,
    recordedAt: new Date().toISOString()
  });
  
  if (progress.quizHistory.length > 200) {
    progress.quizHistory = progress.quizHistory.slice(0, 200);
  }
  
  progress.updatedAt = new Date().toISOString();
  savePlayerProgress(progress);
  return progress.quizHistory;
}

module.exports = {
  PLAYER_PROGRESS_KEY,
  HEROINE_IDS,
  ROUTE_MODES,
  getDefaultPlayerProgress,
  loadPlayerProgress,
  savePlayerProgress,
  clearPlayerProgress,
  recordEndingProgress,
  getPlayerProgressSummary,
  markImageSeen,
  recordQuizHistory
};
