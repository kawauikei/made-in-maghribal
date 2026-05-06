/**
 * Quiz Request Model logic for MadeInMaghribal project.
 */
const { ITEM_MASTER } = require('../data/itemMaster.cjs');
const { ITEM_DISPLAY_NAMES } = require('../data/itemDisplayNames.cjs');
const {
  CUSTOMER_PROFILES,
  DIFFICULTY_WEIGHTS,
  CONDITION_PATTERN_WEIGHTS,
  QUALITY_ALIASES,
  QUALITY_LEADS,
  SOCIAL_TARGET_GENRES,
  SOCIAL_QUALITY_ALIASES,
  SOCIAL_QUALITY_LEADS,
  REQUEST_GENRE_NAMES,
  REQUEST_SCENES,
  PRINCIPLE_REQUEST_HINTS,
  QUALITY_REQUEST_HINTS,
  DECOY_DIFFICULTY_WEIGHTS,
  PRINCIPLE_PHRASE_SUFFIX,
  SPEECH_PATTERNS
} = require('../data/quizRequestTemplates.cjs');

const QUALITY_VALUES = ['normal', 'success', 'great_success'];

function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function pickWeighted(weightMapOrList) {
  const entries = Array.isArray(weightMapOrList)
    ? weightMapOrList.map((entry) => ({ value: entry, weight: Math.max(0, entry.weight || 0) }))
    : Object.entries(weightMapOrList || {}).map(([value, weight]) => ({ value, weight: Math.max(0, weight || 0) }));

  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return entries[0]?.value || null;

  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.value;
  }
  return entries[entries.length - 1]?.value || null;
}

function getStageBucket(questionIndex = 0, totalQuestions = 10) {
  const progress = totalQuestions <= 1 ? 1 : questionIndex / Math.max(1, totalQuestions - 1);
  if (progress < 0.34) return 'early';
  if (progress < 0.67) return 'middle';
  return 'late';
}

function normalizeRouteMode(routeMode) {
  return routeMode === 'long_history' ? 'long_history' : 'normal';
}

function getItemMeta(item) {
  return ITEM_DISPLAY_NAMES[item.itemId] || {};
}

function getItemConditionValue(item, type) {
  if (!item) return undefined;
  if (type === 'genre') return item.genre;
  if (type === 'principle') return item.principle;
  if (type === 'itemType') return getItemMeta(item).itemType || `${item.genre}_${String(item.rank || '').padStart(2, '0')}`;
  return item[type];
}

function itemMatchesConditions(item, conditions) {
  return (conditions || []).every((condition) => {
    if (condition.type === 'quality') return true;
    return getItemConditionValue(item, condition.type) === condition.value;
  });
}

function getQualityCondition(conditions) {
  return (conditions || []).find((condition) => condition.type === 'quality')?.value || null;
}

function getConditionValuesForPattern(pattern, seedItem = null) {
  seedItem = seedItem || pickRandom(ITEM_MASTER);
  if (!seedItem) return [];
  const meta = getItemMeta(seedItem);
  return pattern.conditions.map((type) => {
    if (type === 'quality') return { type, value: pickRandom(QUALITY_VALUES) || 'normal' };
    if (type === 'genre') return { type, value: seedItem.genre };
    if (type === 'principle') return { type, value: seedItem.principle };
    if (type === 'itemType') return { type, value: meta.itemType || `${seedItem.genre}_${String(seedItem.rank || '').padStart(2, '0')}` };
    return { type, value: seedItem[type] };
  });
}

function pickAlias(map, key, fallback) {
  return pickRandom(map?.[key]) || fallback || key;
}

function isSocialTargetAllowed(customerProfile, genre) {
  const social = customerProfile?.social;
  const allowedGenres = SOCIAL_TARGET_GENRES?.[social];
  if (!social || !allowedGenres || !genre) return true;
  return allowedGenres.includes(genre);
}

function pickQualityAlias(quality, customerProfile = null, targetGenre = null) {
  const social = customerProfile?.social;
  const useSocial = isSocialTargetAllowed(customerProfile, targetGenre);
  return (useSocial ? pickRandom(SOCIAL_QUALITY_ALIASES?.[social]?.[quality]) : null)
    || pickRandom(QUALITY_ALIASES?.[quality])
    || 'よい';
}

function pickQualityLead(quality, customerProfile = null, targetGenre = null) {
  const social = customerProfile?.social;
  const useSocial = isSocialTargetAllowed(customerProfile, targetGenre);
  return (useSocial ? pickRandom(SOCIAL_QUALITY_LEADS?.[social]?.[quality]) : null)
    || pickRandom(QUALITY_LEADS?.[quality])
    || 'よい品を探しています';
}

function pickRequestScene(genre) {
  return pickRandom(REQUEST_SCENES?.[genre]) || '少し用があって品を探している';
}

function pickPrincipleHint(principle) {
  return pickRandom(PRINCIPLE_REQUEST_HINTS?.[principle]) || getDisplayPrincipleName(principle);
}

function pickQualityHint(quality, customerProfile = null, targetGenre = null) {
  const social = customerProfile?.social;
  const useSocial = isSocialTargetAllowed(customerProfile, targetGenre);
  return (useSocial ? pickRandom(SOCIAL_QUALITY_ALIASES?.[social]?.[quality]) : null)
    || pickRandom(QUALITY_REQUEST_HINTS?.[quality])
    || pickQualityAlias(quality, customerProfile, targetGenre);
}

function joinTargetModifiers(modifiers, targetName) {
  const safeModifiers = modifiers.filter(Boolean);
  if (safeModifiers.length === 0) return targetName;
  if (safeModifiers.length === 1) return `${safeModifiers[0]}${targetName}`;
  return `${safeModifiers[0]}、${safeModifiers[1]}${targetName}`;
}

function buildRequestPhrase(conditions, customerProfile = null) {
  const quality = conditions.find((condition) => condition.type === 'quality')?.value;
  const principle = conditions.find((condition) => condition.type === 'principle')?.value;
  const itemType = conditions.find((condition) => condition.type === 'itemType')?.value;
  const genre = conditions.find((condition) => condition.type === 'genre')?.value;

  const targetGenre = genre || getGenreFromItemType(itemType);
  const targetName = itemType ? getDisplayItemTypeName(itemType) : getRequestGenreName(genre);
  const scene = pickRequestScene(targetGenre);
  const modifiers = [];

  if (principle) modifiers.push(pickPrincipleHint(principle));
  if (quality) modifiers.push(pickQualityHint(quality, customerProfile, targetGenre));

  const targetPhrase = joinTargetModifiers(modifiers, targetName);

  if (quality && principle) {
    return `${scene}。${targetPhrase}`;
  }

  if (quality || principle) {
    return `${scene}。${targetPhrase}`;
  }

  if (itemType) {
    return `${scene}。${targetName}`;
  }

  return `${scene}。${targetName}`;
}

function getDisplayGenreName(genre) {
  const item = ITEM_MASTER.find((candidate) => candidate.genre === genre);
  return item ? (getItemMeta(item).genreName || genre) : genre;
}

function getRequestGenreName(genre) {
  if (!genre) return '品';
  return pickRandom(REQUEST_GENRE_NAMES?.[genre]) || getDisplayGenreName(genre) || genre;
}

function getGenreFromItemType(itemType) {
  if (!itemType || typeof itemType !== 'string') return null;
  const prefix = itemType.split('_')[0];
  return prefix || null;
}

function getDisplayPrincipleName(principle) {
  const item = ITEM_MASTER.find((candidate) => candidate.principle === principle);
  return item ? (getItemMeta(item).principleName || principle) : principle;
}

function getDisplayItemTypeName(itemType) {
  const item = ITEM_MASTER.find((candidate) => getItemConditionValue(candidate, 'itemType') === itemType);
  return item ? (getItemMeta(item).itemTypeName || itemType) : itemType;
}

function renderPrompt(customerProfile, requestPhrase) {
  const patterns = SPEECH_PATTERNS[customerProfile.speechStyle] || SPEECH_PATTERNS.young_female;
  const pattern = pickRandom(patterns) || '{request}をお願いします。';
  return pattern.replace('{request}', requestPhrase);
}

function selectDifficulty(context = {}) {
  const route = normalizeRouteMode(context.routeMode);
  const bucket = getStageBucket(context.questionIndex || 0, context.totalQuestions || 10);
  return pickWeighted(DIFFICULTY_WEIGHTS[route]?.[bucket] || DIFFICULTY_WEIGHTS.normal.early) || 'easy';
}

function selectDecoyDifficulty(context = {}) {
  const route = normalizeRouteMode(context.routeMode);
  const bucket = getStageBucket(context.questionIndex || 0, context.totalQuestions || 10);
  return pickWeighted(DECOY_DIFFICULTY_WEIGHTS[route]?.[bucket] || DECOY_DIFFICULTY_WEIGHTS.normal.early) || 'loose';
}

function getItemTypeValue(item) {
  return getItemConditionValue(item, 'itemType');
}

function getDecoySimilarityScore(candidate, correctItem) {
  if (!candidate || !correctItem) return 0;
  let score = 0;
  if (candidate.genre === correctItem.genre) score += 4;
  if (candidate.principle === correctItem.principle) score += 3;
  if (candidate.rank === correctItem.rank) score += 2;
  if (Math.abs((candidate.rank || 0) - (correctItem.rank || 0)) === 1) score += 1;
  const candidateType = getItemTypeValue(candidate);
  const correctType = getItemTypeValue(correctItem);
  if (candidateType && candidateType === correctType) score += 5;
  return score;
}

function pickDecoyItem(candidates, correctItem, decoyDifficulty = 'same_family') {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const scored = candidates
    .map((item) => ({ item, score: getDecoySimilarityScore(item, correctItem) }))
    .sort((a, b) => a.score - b.score);

  if (decoyDifficulty === 'loose') {
    const loosePool = scored.filter((entry) => entry.score <= 3);
    return pickRandom((loosePool.length ? loosePool : scored.slice(0, Math.max(1, Math.ceil(scored.length / 3)))).map((entry) => entry.item));
  }

  if (decoyDifficulty === 'near_match') {
    const bestScore = scored[scored.length - 1]?.score ?? 0;
    const nearPool = scored.filter((entry) => entry.score >= bestScore);
    return pickRandom(nearPool.map((entry) => entry.item));
  }

  const familyPool = scored.filter((entry) => entry.score >= 3);
  if (familyPool.length) return pickRandom(familyPool.map((entry) => entry.item));

  const upperStart = Math.max(0, Math.floor(scored.length * 0.5));
  return pickRandom(scored.slice(upperStart).map((entry) => entry.item));
}

function createGeneratedTemplate(context = {}) {
  const customerProfile = pickRandom(CUSTOMER_PROFILES) || CUSTOMER_PROFILES[0];
  const difficulty = selectDifficulty(context);
  const decoyDifficulty = selectDecoyDifficulty(context);
  const pattern = pickWeighted(CONDITION_PATTERN_WEIGHTS[difficulty] || CONDITION_PATTERN_WEIGHTS.easy) || CONDITION_PATTERN_WEIGHTS.easy[0];
  const seedItem = pickRandom(ITEM_MASTER);
  const conditions = getConditionValuesForPattern(pattern, seedItem);
  const promptText = renderPrompt(customerProfile, buildRequestPhrase(conditions, customerProfile));

  return {
    templateId: `GEN_${difficulty}_${pattern.id}`,
    customerType: customerProfile.id,
    customerProfile,
    difficultyLevel: difficulty,
    decoyDifficulty,
    conditionPatternId: pattern.id,
    seedItemId: seedItem?.itemId || null,
    conditions,
    text: promptText
  };
}

function buildQuestionFromTemplate(template, context = {}) {
  const correctCandidates = ITEM_MASTER.filter((item) => itemMatchesConditions(item, template.conditions));
  if (correctCandidates.length === 0) return null;

  const seededCorrectItem = template.seedItemId
    ? correctCandidates.find((item) => item.itemId === template.seedItemId)
    : null;
  const correctItem = seededCorrectItem || pickRandom(correctCandidates);
  const qualityCondition = getQualityCondition(template.conditions);
  const correctQuality = qualityCondition || pickRandom(QUALITY_VALUES) || 'normal';

  const wrongCandidates = ITEM_MASTER.filter((item) => {
    if (item.itemId === correctItem.itemId) return false;
    return !itemMatchesConditions(item, template.conditions);
  });
  const fallbackWrongCandidates = ITEM_MASTER.filter((item) => item.itemId !== correctItem.itemId);
  const decoyDifficulty = template.decoyDifficulty || selectDecoyDifficulty(context);
  const wrongItem = pickDecoyItem(wrongCandidates.length ? wrongCandidates : fallbackWrongCandidates, correctItem, decoyDifficulty);
  if (!wrongItem) return null;

  const promptText = template.text || renderPrompt(
    template.customerProfile || CUSTOMER_PROFILES[0],
    buildRequestPhrase(template.conditions || [], template.customerProfile || CUSTOMER_PROFILES[0])
  );

  return {
    questionId: `Q_${template.templateId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    promptText,
    correctItemId: correctItem.itemId,
    wrongItemId: wrongItem.itemId,
    requiredQuality: qualityCondition,
    correctQuality,
    customerType: template.customerType,
    customerProfile: template.customerProfile || null,
    customerIconTone: template.customerProfile?.iconTone || 'amber',
    conditions: template.conditions,
    conditionPatternId: template.conditionPatternId || template.templateId,
    difficultyLevel: template.difficultyLevel || difficultyNameForCount(template.conditions.length),
    decoyDifficulty,
    decoySimilarityScore: getDecoySimilarityScore(wrongItem, correctItem),
    difficulty: (template.conditions || []).length
  };
}

function difficultyNameForCount(count) {
  if (count >= 3) return 'hard';
  if (count >= 2) return 'normal';
  return 'easy';
}

/**
 * Generates a quiz question (2 choices) from a generated or explicit template.
 * @param {object|null} template
 * @param {object} context
 * @returns {object|null}
 */
function generateQuestion(template = null, context = {}) {
  const effectiveTemplate = template && Array.isArray(template.conditions) && template.conditions.length
    ? template
    : createGeneratedTemplate(context);
  return buildQuestionFromTemplate(effectiveTemplate, context);
}

module.exports = {
  generateQuestion,
  createGeneratedTemplate,
  itemMatchesConditions,
  getItemConditionValue,
  selectDifficulty,
  selectDecoyDifficulty
};
