import { HEROINES } from '../data/heroines.js';

export const CAREER_PROGRESS_KEY = 'made_in_maghribal_career_progress';

const ROUTE_KEYS = ['normal', 'long_history'];

function isStorageAvailable() {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function createDefaultHeroineProgress() {
  const routeStats = {};
  ROUTE_KEYS.forEach(routeMode => {
    routeStats[routeMode] = {
      weeklySales: 0,
      weeklyReputation: 0,
      weeklySatisfaction: 0,
    };
  });

  return {
    routeStats,
    unlockedRoutes: {
      long_history: false,
    },
  };
}

export function createDefaultCareerProgress() {
  const heroines = {};
  HEROINES.forEach(heroine => {
    heroines[heroine.id] = createDefaultHeroineProgress();
  });

  return { heroines };
}

function normalizeStatNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, numeric);
}

function normalizeHeroineProgress(rawHeroineProgress) {
  const base = createDefaultHeroineProgress();
  const normalized = { ...base, ...(rawHeroineProgress || {}) };

  normalized.routeStats = { ...base.routeStats, ...(rawHeroineProgress?.routeStats || {}) };
  ROUTE_KEYS.forEach(routeMode => {
    const source = normalized.routeStats[routeMode] || {};
    normalized.routeStats[routeMode] = {
      weeklySales: normalizeStatNumber(source.weeklySales),
      weeklyReputation: normalizeStatNumber(source.weeklyReputation),
      weeklySatisfaction: normalizeStatNumber(source.weeklySatisfaction),
    };
  });

  normalized.unlockedRoutes = {
    ...base.unlockedRoutes,
    ...(rawHeroineProgress?.unlockedRoutes || {}),
  };
  normalized.unlockedRoutes.long_history = Boolean(normalized.unlockedRoutes.long_history);

  return normalized;
}

export function normalizeCareerProgress(raw) {
  const base = createDefaultCareerProgress();
  const normalized = { ...base, ...(raw || {}) };
  const rawHeroines = raw?.heroines || {};

  normalized.heroines = {};
  HEROINES.forEach(heroine => {
    normalized.heroines[heroine.id] = normalizeHeroineProgress(rawHeroines[heroine.id]);
  });

  return normalized;
}

export function loadCareerProgress() {
  if (!isStorageAvailable()) {
    return createDefaultCareerProgress();
  }

  try {
    const raw = localStorage.getItem(CAREER_PROGRESS_KEY);
    if (!raw) return createDefaultCareerProgress();
    return normalizeCareerProgress(JSON.parse(raw));
  } catch {
    return createDefaultCareerProgress();
  }
}

export function saveCareerProgress(progress) {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.setItem(CAREER_PROGRESS_KEY, JSON.stringify(normalizeCareerProgress(progress)));
    return true;
  } catch {
    return false;
  }
}

export function clearCareerProgress() {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(CAREER_PROGRESS_KEY);
  } catch {
    // Ignore storage errors.
  }
}

export function getHeroineProgress(progress, heroineId) {
  const normalized = normalizeCareerProgress(progress);
  return normalized.heroines[heroineId] || createDefaultHeroineProgress();
}

export function getHeroineRouteStats(progress, heroineId, routeMode) {
  const heroineProgress = getHeroineProgress(progress, heroineId);
  return heroineProgress.routeStats[routeMode] || heroineProgress.routeStats.normal;
}

export function isLongHistoryUnlocked(progress, heroineId) {
  return Boolean(getHeroineProgress(progress, heroineId).unlockedRoutes.long_history);
}

export function unlockLongHistory(progress, heroineId) {
  const normalized = normalizeCareerProgress(progress);
  if (!normalized.heroines[heroineId]) return normalized;

  normalized.heroines[heroineId].unlockedRoutes.long_history = true;
  return normalized;
}

export function updateHeroineWeeklyStats(progress, heroineId, routeMode, { sales = 0, reputation = 0, satisfaction = 0 } = {}) {
  const normalized = normalizeCareerProgress(progress);
  const heroineProgress = normalized.heroines[heroineId];
  if (!heroineProgress) return normalized;

  const routeStats = heroineProgress.routeStats[routeMode] || heroineProgress.routeStats.normal;
  routeStats.weeklySales = Math.max(routeStats.weeklySales, normalizeStatNumber(sales));
  routeStats.weeklyReputation = Math.max(routeStats.weeklyReputation, normalizeStatNumber(reputation));
  routeStats.weeklySatisfaction = Math.max(routeStats.weeklySatisfaction, normalizeStatNumber(satisfaction));

  heroineProgress.routeStats[routeMode] = routeStats;
  return normalized;
}

export function getHeroineProgressScore(progress, heroineId, routeMode, currentSales = 0) {
  const stats = getHeroineRouteStats(progress, heroineId, routeMode);
  const sales = normalizeStatNumber(currentSales);
  const total = sales + stats.weeklyReputation + stats.weeklySatisfaction;
  return Math.min(100, Math.floor(total / 10));
}
