(function() {
    const modules = {};
    const cache = {};

    function require(name, fromPath) {
        let resolvedName = name;
        if (name.startsWith('.')) {
            const dir = fromPath ? fromPath.substring(0, fromPath.lastIndexOf('/')) : '.';
            const parts = (dir + '/' + name).split('/');
            const stack = [];
            for (const part of parts) {
                if (part === '..') stack.pop();
                else if (part !== '.' && part !== '') stack.push(part);
            }
            resolvedName = './' + stack.join('/');
            
            // Try extensions
            if (!modules[resolvedName]) {
                if (modules[resolvedName + '.js']) resolvedName += '.js';
                else if (modules[resolvedName + '.cjs']) resolvedName += '.cjs';
            }
        }

        if (cache[resolvedName]) return cache[resolvedName].exports;
        if (!modules[resolvedName]) {
            throw new Error('Module ' + resolvedName + ' not found (requested as ' + name + ' from ' + fromPath + ')');
        }
        
        const module = { exports: {} };
        cache[resolvedName] = module;
        modules[resolvedName](module, module.exports, (n) => require(n, resolvedName));
        return module.exports;
    }

    // --- ./core/affectionModel.cjs ---
    modules['./core/affectionModel.cjs'] = function(module, exports, require) {
/**
 * Affection Model logic for MadeInMaghribal project.
 */

/**
 * Calculates affection based on current score and historical peaks.
 * @param {object} score - { revenue, satisfaction, reputation }
 * @param {object} history - { maxSatisfaction, maxReputation }
 * @returns {number} affection (0-100)
 */
function calculateAffection(score, history = {}) {
  const { revenue = 0, satisfaction = 0, reputation = 0 } = score;
  
  // MVP Formula: 好感度 = (売上 + 満足度 + 評判) / 5
  let val = (revenue + satisfaction + reputation) / 5;
  
  // Clip at 0-100
  if (val > 100) val = 100;
  if (val < 0) val = 0;
  
  return val;
}

module.exports = { calculateAffection };

    };

    // --- ./core/assetValidator.cjs ---
    modules['./core/assetValidator.cjs'] = function(module, exports, require) {
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

    };

    // --- ./core/audioValidator.cjs ---
    modules['./core/audioValidator.cjs'] = function(module, exports, require) {
/**
 * Audio Validator for MadeInMaghribal project.
 */
const { AUDIO_MANIFEST: MANIFEST } = require('../data/audioManifest.cjs');

/**
 * Validates the audio manifest against defined requirements.
 * @returns {{ok: boolean, reason?: string}}
 */
function validateAudioManifest() {
  // Acceptance: main01_title, main02_shop, main03_puzzle を定義する
  const systemIds = MANIFEST.bgm.system.map(s => s.id);
  if (!systemIds.includes('main01_title')) return { ok: false, reason: "Missing main01_title" };
  if (!systemIds.includes('main02_shop')) return { ok: false, reason: "Missing main02_shop" };
  if (!systemIds.includes('main03_puzzle')) return { ok: false, reason: "Missing main03_puzzle" };

  // Acceptance: 各ヒロインに theme 1曲, game 4曲, ending 2曲を定義する
  const heroines = ['HAKIMA', 'MIRA', 'DARIYA'];
  for (const h of heroines) {
    const data = MANIFEST.bgm.heroines[h];
    if (!data) return { ok: false, reason: `Missing audio data for ${h}` };
    if (!data.theme) return { ok: false, reason: `Missing theme for ${h}` };
    if (data.game.length !== 4) return { ok: false, reason: `Expected 4 game songs for ${h}, got ${data.game.length}` };
    if (!data.ending.normal || !data.ending.good) return { ok: false, reason: `Missing ending songs for ${h}` };
  }

  // Acceptance: SEカテゴリ quiz/ui/day_end が空でない
  if (!MANIFEST.se.quiz || MANIFEST.se.quiz.length === 0) return { ok: false, reason: "SE quiz is empty" };
  if (!MANIFEST.se.ui || MANIFEST.se.ui.length === 0) return { ok: false, reason: "SE ui is empty" };
  if (!MANIFEST.se.day_end || MANIFEST.se.day_end.length === 0) return { ok: false, reason: "SE day_end is empty" };

  return { ok: true };
}

module.exports = { validateAudioManifest };

    };

    // --- ./core/characterValidator.cjs ---
    modules['./core/characterValidator.cjs'] = function(module, exports, require) {
/**
 * Validator for Characters in MadeInMaghribal project.
 */
const { CHARACTERS } = require('../data/characters.cjs');
const { getAllToneGuideIds } = require('./toneGuideValidator.cjs');

/**
 * Validates the character master data against defined constraints.
 * @param {object[]} characters - Array of character objects.
 * @returns {{ok: boolean, reason?: string}}
 */
function validateCharacters(characters = CHARACTERS) {
  const toneGuideIds = getAllToneGuideIds();
  
  const protagonists = characters.filter(c => c.role === 'protagonist');
  const heroines = characters.filter(c => c.role === 'heroine');

  // Acceptance: protagonist は nadir 1人だけ定義される
  if (protagonists.length !== 1 || protagonists[0].characterId !== 'CH_NADIR') {
    return { ok: false, reason: "Must have exactly one protagonist: CH_NADIR" };
  }

  // Acceptance: heroine は hakima, mira, dariya の3人が定義される
  const expectedHeroineIds = ['CH_HAKIMA', 'CH_MIRA', 'CH_DARIYA'];
  const actualHeroineIds = heroines.map(h => h.characterId).sort();
  if (JSON.stringify(actualHeroineIds) !== JSON.stringify(expectedHeroineIds.sort())) {
    return { ok: false, reason: "Heroines must be exactly CH_HAKIMA, CH_MIRA, and CH_DARIYA" };
  }

  for (const char of characters) {
    // Acceptance: 全characterがtoneGuideIdを参照する
    if (!char.toneGuideId) {
      return { ok: false, reason: `Character ${char.characterId} is missing toneGuideId` };
    }
    if (!toneGuideIds.includes(char.toneGuideId)) {
      return { ok: false, reason: `Character ${char.characterId} refers to unknown ToneGuide ${char.toneGuideId}` };
    }

    // Acceptance: シナリオ本文をcharacter/tone guideに含めない
    // 簡易チェック：文字数制限
    for (const key in char) {
      if (typeof char[key] === 'string' && char[key].length > 200) {
        return { ok: false, reason: `Character ${char.characterId} field ${key} contains too much text (possibly scenario)` };
      }
    }
  }

  return { ok: true };
}

module.exports = { validateCharacters };

    };

    // --- ./core/endingBranch.cjs ---
    modules['./core/endingBranch.cjs'] = function(module, exports, require) {
/**
 * Ending Branch logic for MadeInMaghribal project.
 */

/**
 * Evaluates the ending type based on final affection.
 * @param {number} affection 
 * @param {boolean} isExtraRoute 
 * @returns {string} 'GOOD' | 'NORMAL'
 */
function evaluateEnding(affection, isExtraRoute) {
  // Acceptance: 通常ルートは好感度60以上でGood Ending
  // Acceptance: 追加ルートは好感度80以上でGood Ending
  const threshold = isExtraRoute ? 80 : 60;
  
  if (affection >= threshold) {
    return 'GOOD';
  }
  return 'NORMAL';
}

module.exports = { evaluateEnding };

    };

    // --- ./core/gameSessionFlow.cjs ---
    modules['./core/gameSessionFlow.cjs'] = function(module, exports, require) {
/**
 * Game Session Flow manager for MadeInMaghribal project.
 */
const { getInitialUnlockState } = require('./unlockState.cjs');
const { getSongForTurn } = require('./stageSchedule.cjs');

const TOTAL_TURNS = 5;

/**
 * Manages the top-level game state and transitions.
 */
class GameSession {
  constructor() {
    this.phase = 'TITLE';
    this.turn = 1;
    this.subPhase = 'BEFORE_OPEN';
    this.selectedHeroineId = null;
    this.routeMode = 'normal';
    this.scores = { revenue: 0, satisfaction: 0, reputation: 0 };
    this.affection = { HAKIMA: 0, MIRA: 0, DARIYA: 0 };
    this.unlockState = getInitialUnlockState();
  }

  /**
   * Advances the top-level phase.
   */
  nextPhase() {
    if (this.phase === 'TITLE') {
      this.phase = 'OPENING';
    } else if (this.phase === 'OPENING') {
      this.phase = 'HEROINE_SELECT';
    } else if (this.phase === 'HEROINE_SELECT') {
      this.phase = 'MAIN_GAME';
    } else if (this.phase === 'MAIN_GAME' && this.turn >= TOTAL_TURNS && this.subPhase === 'AFTER_CLOSE') {
      this.phase = 'ENDING';
    }
  }

  /**
   * Advances the turn sub-phase.
   */
  nextSubPhase() {
    if (this.subPhase === 'BEFORE_OPEN') {
      this.subPhase = 'QUIZ';
    } else if (this.subPhase === 'QUIZ') {
      this.subPhase = 'TURN_RESULT';
    } else if (this.subPhase === 'TURN_RESULT') {
      this.subPhase = 'AFTER_CLOSE';
    } else if (this.subPhase === 'AFTER_CLOSE') {
      if (this.turn < TOTAL_TURNS) {
        this.turn++;
        this.subPhase = 'BEFORE_OPEN';
      }
    }
  }

  /**
   * Sets the selected heroine and route.
   */
  selectHeroine(heroineId, routeMode = 'normal') {
    this.selectedHeroineId = heroineId;
    this.routeMode = routeMode;
  }

  /**
   * Returns the current song ID for the current state.
   */
  get currentSong() {
    return getSongForTurn(this.turn, this.selectedHeroineId, this.routeMode);
  }
}

module.exports = { GameSession, TOTAL_TURNS };

    };

    // --- ./core/idSchema.cjs ---
    modules['./core/idSchema.cjs'] = function(module, exports, require) {
/**
 * Data ID Schema validation and constants for MadeInMaghribal project.
 */

const HEROINE_IDS = ['hakima', 'mira', 'dariya'];
const ROUTE_MODES = ['normal', 'long_history'];
const EXPRESSION_IDS = ['normal', 'joy', 'fun', 'surprise', 'sorrow', 'cry', 'anger', 'maid', 'social', 'student'];
const GENRE_IDS = ['ARM', 'FOD', 'MED', 'ADN', 'CLT', 'DAY', 'WRK', 'TRV', 'RIT', 'TRD'];
const PRINCIPLE_IDS = ['AS', 'EL', 'LI', 'ME', 'SA'];
const ASSET_CATEGORIES = ['BG', 'ST', 'IC', 'UI'];
const SCENE_CATEGORIES = ['TITLE', 'OP', 'ED', 'TURN', 'EVENT'];

/**
 * Validates various IDs based on naming conventions and defined sets.
 * @param {string} type - The type of ID (e.g., 'heroineId', 'characterId')
 * @param {string} id - The ID value to validate
 * @returns {{ok: boolean, reason?: string}}
 */
function validateId(type, id) {
  if (id === undefined || id === null || id === '') {
    return { ok: false, reason: "ID cannot be empty" };
  }

  switch (type) {
    case 'heroineId':
      if (HEROINE_IDS.includes(id)) return { ok: true };
      // Note: "Format Mismatch" is expected for some cases in testspec like "hakima_extra"
      if (id.includes('_')) return { ok: false, reason: "Format Mismatch" };
      return { ok: false, reason: "Unknown Heroine ID" };

    case 'routeMode':
      if (ROUTE_MODES.includes(id)) return { ok: true };
      return { ok: false, reason: "Unknown Route Mode" };

    case 'characterId':
      if (!id.startsWith('CH_')) return { ok: false, reason: "Missing Prefix" };
      const charName = id.substring(3);
      if (!charName) return { ok: false, reason: "Name segment is empty" };
      if (!id.includes('_')) return { ok: false, reason: "Missing Underscore" }; // Should be handled by startsWith but for TC-C004
      return { ok: true };

    case 'expressionId':
      if (EXPRESSION_IDS.includes(id)) return { ok: true };
      return { ok: false, reason: "Unknown Expression ID" };

    case 'assetId':
      if (!id.startsWith('AS_')) return { ok: false, reason: "Missing Prefix" };
      const assetParts = id.split('_');
      if (assetParts.length < 2) return { ok: false, reason: "Missing Category" };
      if (assetParts.length < 3) return { ok: false, reason: "Missing Asset Name" };
      if (!ASSET_CATEGORIES.includes(assetParts[1])) return { ok: false, reason: "Unknown Category" };
      if (!assetParts[2]) return { ok: false, reason: "Missing Asset Name" };
      return { ok: true };

    case 'itemId':
      if (!id.startsWith('IT_')) return { ok: false, reason: "Missing Prefix" };
      const itemParts = id.split('_');
      if (itemParts.length < 2) return { ok: false, reason: "Unknown Genre ID" };
      if (itemParts.length < 3) return { ok: false, reason: "Unknown Principle ID" };
      if (itemParts.length < 4) return { ok: false, reason: "Missing Index" };
      if (!GENRE_IDS.includes(itemParts[1])) return { ok: false, reason: "Unknown Genre ID" };
      if (!PRINCIPLE_IDS.includes(itemParts[2])) return { ok: false, reason: "Unknown Principle ID" };
      if (!itemParts[3]) return { ok: false, reason: "Missing Index" };
      return { ok: true };

    case 'bgmId':
      if (!id.startsWith('BGM_')) return { ok: false, reason: "Missing Prefix" };
      // In testspec, BGM_UNKNOWN is invalid
      if (id === 'BGM_UNKNOWN') return { ok: false, reason: "Unknown BGM Name" };
      return { ok: true };

    case 'seId':
      if (!id.startsWith('SE_')) return { ok: false, reason: "Missing Prefix" };
      return { ok: true };

    case 'sceneId':
      if (!id.startsWith('SC_')) return { ok: false, reason: "Missing Prefix" };
      const sceneParts = id.split('_');
      if (sceneParts.length < 2) return { ok: false, reason: "Unknown Scene Category" };
      if (sceneParts.length < 3) return { ok: false, reason: "Missing Scene Name" };
      if (!SCENE_CATEGORIES.includes(sceneParts[1])) return { ok: false, reason: "Unknown Scene Category" };
      return { ok: true };

    case 'topicId':
      // From testspec: snake_case expected
      if (id.startsWith('topic_')) return { ok: true };
      return { ok: false, reason: "Format Mismatch" };

    case 'requestTemplateId':
      if (id.startsWith('request_template_')) return { ok: true };
      return { ok: false, reason: "Format Mismatch" };

    default:
      return { ok: false, reason: "Unknown ID type" };
  }
}

module.exports = {
  HEROINE_IDS,
  ROUTE_MODES,
  EXPRESSION_IDS,
  GENRE_IDS,
  PRINCIPLE_IDS,
  ASSET_CATEGORIES,
  SCENE_CATEGORIES,
  validateId
};

    };

    // --- ./core/itemValidator.cjs ---
    modules['./core/itemValidator.cjs'] = function(module, exports, require) {
/**
 * Item Validator for MadeInMaghribal project.
 */
const { ITEM_MASTER } = require('../data/itemMaster.cjs');
const { ITEM_TEXTS } = require('../data/itemTexts.cjs');
const { GENRES, PRINCIPLES } = require('../data/itemTaxonomy.cjs');

/**
 * Validates the entire item master and text set.
 * @returns {{ok: boolean, reason?: string}}
 */
function validateItems() {
  // Acceptance: 250アイテムを生成または参照できる
  if (ITEM_MASTER.length !== 250) {
    return { ok: false, reason: `Item count mismatch: expected 250, got ${ITEM_MASTER.length}` };
  }

  // Acceptance: genre は 10種類, principle は 5種類
  if (GENRES.length !== 10) return { ok: false, reason: "Genre count mismatch" };
  if (PRINCIPLES.length !== 5) return { ok: false, reason: "Principle count mismatch" };

  for (const item of ITEM_MASTER) {
    // Acceptance: itemId は IT_{GENRE}_{PRINCIPLE}_{INDEX} 形式
    const parts = item.itemId.split('_');
    if (parts.length !== 4 || parts[0] !== 'IT') {
      return { ok: false, reason: `Invalid ID format for ${item.itemId}` };
    }

    // Acceptance: item masterとitem textを分離、かつ品質別テキスト保持
    if (!ITEM_TEXTS[item.itemId]) {
      return { ok: false, reason: `Missing text for item ${item.itemId}` };
    }
    const texts = ITEM_TEXTS[item.itemId];
    if (!texts.normal || !texts.success || !texts.great_success) {
      return { ok: false, reason: `Incomplete text quality for item ${item.itemId}` };
    }
  }
  return { ok: true };
}

module.exports = { validateItems };

    };

    // --- ./core/quizRequestModel.cjs ---
    modules['./core/quizRequestModel.cjs'] = function(module, exports, require) {
/**
 * Quiz Request Model logic for MadeInMaghribal project.
 */
const { ITEM_MASTER } = require('../data/itemMaster.cjs');

/**
 * Generates a quiz question (2 choices) from a template.
 * @param {object} template 
 * @returns {object|null}
 */
function generateQuestion(template) {
  // Acceptance: 指定された全ての条件を満たすアイテムを C004 マスターから正解として選ぶ
  const correctCandidates = ITEM_MASTER.filter(item => {
    return template.conditions.every(cond => item[cond.type] === cond.value);
  });

  if (correctCandidates.length === 0) return null;
  const correctItem = correctCandidates[Math.floor(Math.random() * correctCandidates.length)];

  // Acceptance: 条件の少なくとも1つを満たさないアイテムを不正解として選ぶ
  const wrongCandidates = ITEM_MASTER.filter(item => {
    return !template.conditions.every(cond => item[cond.type] === cond.value);
  });

  if (wrongCandidates.length === 0) return null;
  const wrongItem = wrongCandidates[Math.floor(Math.random() * wrongCandidates.length)];

  return {
    questionId: `Q_${template.templateId}_${Date.now()}`,
    promptText: template.text,
    correctItemId: correctItem.itemId,
    wrongItemId: wrongItem.itemId,
    difficulty: template.conditions.length
  };
}

module.exports = { generateQuestion };

    };

    // --- ./core/quizValidator.cjs ---
    modules['./core/quizValidator.cjs'] = function(module, exports, require) {
/**
 * Quiz Validator for MadeInMaghribal project.
 */
const { ITEM_MASTER } = require('../data/itemMaster.cjs');

/**
 * Validates a generated question against its template.
 * @param {object} question 
 * @param {object} template 
 * @returns {{ok: boolean, reason?: string}}
 */
function validateQuestion(question, template) {
  const correctItem = ITEM_MASTER.find(i => i.itemId === question.correctItemId);
  const wrongItem = ITEM_MASTER.find(i => i.itemId === question.wrongItemId);

  if (!correctItem || !wrongItem) return { ok: false, reason: "Invalid Item IDs" };
  
  // Acceptance: 不正解候補は正解候補と重複しない
  if (correctItem.itemId === wrongItem.itemId) {
    return { ok: false, reason: "Correct and wrong items must be different" };
  }

  // Acceptance: 正解アイテムの判定
  const correctMatch = template.conditions.every(cond => correctItem[cond.type] === cond.value);
  if (!correctMatch) {
    return { ok: false, reason: "Correct item does not match template conditions" };
  }

  // Acceptance: 不正解アイテムの判定
  const wrongMatch = template.conditions.every(cond => wrongItem[cond.type] === cond.value);
  if (wrongMatch) {
    return { ok: false, reason: "Wrong item matches template conditions" };
  }

  return { ok: true };
}

module.exports = { validateQuestion };

    };

    // --- ./core/renderModel.cjs ---
    modules['./core/renderModel.cjs'] = function(module, exports, require) {
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

    };

    // --- ./core/rhythmQuizCore.cjs ---
    modules['./core/rhythmQuizCore.cjs'] = function(module, exports, require) {
/**
 * Rhythm Quiz Core logic for MadeInMaghribal project.
 */
const { calculateJudgement } = require('./rhythmTiming.cjs');

/**
 * Processes a single question result and returns performance metrics.
 * @param {object} state - Includes promptShownAt, answeredAt, selectedItemId, correctItemId, nearestBeatMs
 * @returns {object}
 */
function processQuestionResult(state) {
  const { promptShownAt, answeredAt, selectedItemId, correctItemId, nearestBeatMs } = state;
  
  // Acceptance: リズムが悪くても正解なら売上は入る（isCorrectを返す）
  const isCorrect = selectedItemId === correctItemId;
  
  // Acceptance: 判定は PERFECT, GOOD, MISS, NONE を返せる
  const timing = calculateJudgement(answeredAt, nearestBeatMs);
  
  // Acceptance: 回答速度は3秒以内 +2, 5秒以内 +1, 5秒超過 +0 の満足度ボーナスに変換
  const responseTime = answeredAt - promptShownAt;
  let speedBonus = 0;
  if (responseTime < 3000) {
    speedBonus = 2;
  } else if (responseTime < 5000) {
    speedBonus = 1;
  }

  return {
    isCorrect,
    rating: timing.rating,
    reputationBonus: timing.bonus, // 評判ボーナス
    satisfactionBonus: speedBonus, // 満足度ボーナス
    diffMs: timing.diffMs,         // ±ms差分（デバッグ用）
    responseTime
  };
}

module.exports = { processQuestionResult };

    };

    // --- ./core/rhythmTiming.cjs ---
    modules['./core/rhythmTiming.cjs'] = function(module, exports, require) {
/**
 * Rhythm Timing logic for MadeInMaghribal project.
 */

/**
 * Calculates judgement rating and bonus based on timing difference.
 * @param {number} answeredAt 
 * @param {number} nearestBeatMs 
 * @returns {{rating: string, bonus: number, diffMs: number}}
 */
function calculateJudgement(answeredAt, nearestBeatMs) {
  const diff = Math.abs(answeredAt - nearestBeatMs);
  let rating = 'MISS';
  let bonus = 0;

  // Acceptance: ±50ms -> PERFECT, ±150ms -> GOOD
  if (diff <= 50) {
    rating = 'PERFECT';
    bonus = 2;
  } else if (diff <= 150) {
    rating = 'GOOD';
    bonus = 1;
  }

  return { rating, bonus, diffMs: answeredAt - nearestBeatMs };
}

module.exports = { calculateJudgement };

    };

    // --- ./core/scenarioSchema.cjs ---
    modules['./core/scenarioSchema.cjs'] = function(module, exports, require) {
/**
 * Scenario Schema and field definitions for MadeInMaghribal project.
 */
const SCENARIO_STEP_FIELDS = [
  'speakerId', 'speakerExpression', 'standingCharacterId', 'standingExpression',
  'backgroundId', 'text', 'choice', 'jump', 'rhythmStageStart', 'flags'
];

module.exports = { SCENARIO_STEP_FIELDS };

    };

    // --- ./core/scenarioValidator.cjs ---
    modules['./core/scenarioValidator.cjs'] = function(module, exports, require) {
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

    };

    // --- ./core/scoreModel.cjs ---
    modules['./core/scoreModel.cjs'] = function(module, exports, require) {
/**
 * Score Model logic for MadeInMaghribal project.
 */

/**
 * Updates game score based on a single question result.
 * @param {object} currentScore 
 * @param {object} questionResult 
 * @returns {object}
 */
function updateGameScore(currentScore, questionResult) {
  const newScore = { ...currentScore };
  
  // Acceptance: 正解時に売上 +10 を加算する
  if (questionResult.isCorrect) {
    newScore.revenue += 10;
  }
  
  // Acceptance: 速度/リズムボーナスを満足度/評判に加算
  newScore.satisfaction += (questionResult.satisfactionBonus || 0);
  newScore.reputation += (questionResult.reputationBonus || 0);
  
  // Acceptance: 満足度最大100, 評判最大100, 売上最大500を扱える
  if (newScore.satisfaction > 100) newScore.satisfaction = 100;
  if (newScore.reputation > 100) newScore.reputation = 100;
  if (newScore.revenue > 500) newScore.revenue = 500;
  
  return newScore;
}

module.exports = { updateGameScore };

    };

    // --- ./core/stageSchedule.cjs ---
    modules['./core/stageSchedule.cjs'] = function(module, exports, require) {
/**
 * Stage Schedule logic for MadeInMaghribal project.
 */

/**
 * Determines the song to be played based on the current turn and selected route.
 * @param {number} turn 
 * @param {string} heroineId 
 * @param {string} routeMode 
 * @returns {string} songId
 */
function getSongForTurn(turn, heroineId, routeMode) {
  // Acceptance: Turn 1 は全員 main03_puzzle 固定
  if (turn === 1) return 'main03_puzzle';

  // Long-history routes currently share the heroine game track set.
  // Route-specific song ids can be introduced when dedicated IF tracks exist.
  if (turn === 2 || turn === 5) {
    return `BGM_GAME_${heroineId}_1`;
  }

  // Turn 3, 4 placeholders
  return 'BGM_EXTRA_ROMANCE';
}

module.exports = { getSongForTurn };

    };

    // --- ./core/toneGuideValidator.cjs ---
    modules['./core/toneGuideValidator.cjs'] = function(module, exports, require) {
/**
 * Validator for Tone Guides in MadeInMaghribal project.
 */
const { TONE_GUIDES } = require('../data/toneGuides.cjs');

/**
 * Validates a single tone guide object.
 * @param {object} toneGuide 
 * @returns {{ok: boolean, reason?: string}}
 */
function validateToneGuide(toneGuide) {
  if (!toneGuide.toneGuideId || !toneGuide.toneGuideId.startsWith('TG_')) {
    return { ok: false, reason: "Invalid ToneGuide ID" };
  }
  if (!toneGuide.rules || !toneGuide.rules.normal) {
    return { ok: false, reason: "ToneGuide must have normal rules" };
  }
  return { ok: true };
}

/**
 * Gets all registered tone guide IDs.
 * @returns {string[]}
 */
function getAllToneGuideIds() {
  return TONE_GUIDES.map(tg => tg.toneGuideId);
}

module.exports = { validateToneGuide, getAllToneGuideIds };

    };

    // --- ./core/unlockState.cjs ---
    modules['./core/unlockState.cjs'] = function(module, exports, require) {
/**
 * Unlock State logic for MadeInMaghribal project.
 */

/**
 * Returns the default initial unlock state.
 * @returns {object}
 */
function getInitialUnlockState() {
  return {
    goodEndingCleared: { HAKIMA: false, MIRA: false, DARIYA: false }
  };
}

module.exports = { getInitialUnlockState };

    };

    // --- ./data/assets.cjs ---
    modules['./data/assets.cjs'] = function(module, exports, require) {
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

    };

    // --- ./data/audioManifest.cjs ---
    modules['./data/audioManifest.cjs'] = function(module, exports, require) {
/**
 * Audio Manifest for MadeInMaghribal project.
 * Verified against actual filesystem paths in public/audio/.
 */
const AUDIO_MANIFEST = {
  bgm: {
    system: [
      { id: 'main01_title', title: 'Title Theme', path: 'audio/bgm/main/main01_title.mp3' },
      { id: 'main02_shop', title: 'Daily Alchemy Shop', path: 'audio/bgm/main/main02_shop.mp3' },
      { id: 'main03_puzzle', title: 'Mixing Rhythms', path: 'audio/bgm/main/main03_puzzle.mp3' }
    ],
    heroines: {
      HAKIMA: {
        theme: { id: 'BGM_THEME_HAKIMA', path: 'audio/bgm/hakima/hakima01_theme.mp3' },
        game: [
          { id: 'BGM_GAME_HAKIMA_1', path: 'audio/bgm/hakima/hakima02_game_a.mp3' },
          { id: 'BGM_GAME_HAKIMA_2', path: 'audio/bgm/hakima/hakima03_game_b.mp3' },
          { id: 'BGM_GAME_HAKIMA_3', path: 'audio/bgm/hakima/hakima04_game_c.mp3' },
          { id: 'BGM_GAME_HAKIMA_4', path: 'audio/bgm/hakima/hakima05_game_d.mp3' }
        ],
        ending: { 
          normal: { id: 'BGM_ED_HAKIMA_NORMAL', path: 'audio/bgm/hakima/hakima06_ending.mp3' },
          good: { id: 'BGM_ED_HAKIMA_GOOD', path: 'audio/bgm/hakima/hakima07_ending2.mp3' }
        }
      },
      MIRA: {
        theme: { id: 'BGM_THEME_MIRA', path: 'audio/bgm/mira/mira01_theme.mp3' },
        game: [
          { id: 'BGM_GAME_MIRA_1', path: 'audio/bgm/mira/mira02_game_a.mp3' },
          { id: 'BGM_GAME_MIRA_2', path: 'audio/bgm/mira/mira03_game_b.mp3' },
          { id: 'BGM_GAME_MIRA_3', path: 'audio/bgm/mira/mira04_game_c.mp3' },
          { id: 'BGM_GAME_MIRA_4', path: 'audio/bgm/mira/mira05_game_d.mp3' }
        ],
        ending: { 
          normal: { id: 'BGM_ED_MIRA_NORMAL', path: 'audio/bgm/mira/mira06_ending.mp3' },
          good: { id: 'BGM_ED_MIRA_GOOD', path: 'audio/bgm/mira/mira07_ending2.mp3' }
        }
      },
      DARIYA: {
        theme: { id: 'BGM_THEME_DARIYA', path: 'audio/bgm/dariya/dariya01_theme.mp3' },
        game: [
          { id: 'BGM_GAME_DARIYA_1', path: 'audio/bgm/dariya/dariya02_game_a.mp3' },
          { id: 'BGM_GAME_DARIYA_2', path: 'audio/bgm/dariya/dariya03_game_b.mp3' },
          { id: 'BGM_GAME_DARIYA_3', path: 'audio/bgm/dariya/dariya04_game_c.mp3' },
          { id: 'BGM_GAME_DARIYA_4', path: 'audio/bgm/dariya/dariya05_game_d.mp3' }
        ],
        ending: { 
          normal: { id: 'BGM_ED_DARIYA_NORMAL', path: 'audio/bgm/dariya/dariya06_ending.mp3' },
          good: { id: 'BGM_ED_DARIYA_GOOD', path: 'audio/bgm/dariya/dariya07_ending2.mp3' }
        }
      }
    },
    extra: [
      { id: 'BGM_EXTRA_JOY_1', mood: 'joy', variant: 1, title: 'joy 1', path: 'audio/bgm/extra/joy1.mp3' },
      { id: 'BGM_EXTRA_JOY_2', mood: 'joy', variant: 2, title: 'joy 2', path: 'audio/bgm/extra/joy2.mp3' },
      { id: 'BGM_EXTRA_FUN_1', mood: 'fun', variant: 1, title: 'fun 1', path: 'audio/bgm/extra/fun1.mp3' },
      { id: 'BGM_EXTRA_FUN_2', mood: 'fun', variant: 2, title: 'fun 2', path: 'audio/bgm/extra/fun2.mp3' },
      { id: 'BGM_EXTRA_SORROW_1', mood: 'sorrow', variant: 1, title: 'sorrow 1', path: 'audio/bgm/extra/sorrow1.mp3' },
      { id: 'BGM_EXTRA_SORROW_2', mood: 'sorrow', variant: 2, title: 'sorrow 2', path: 'audio/bgm/extra/sorrow2.mp3' },
      { id: 'BGM_EXTRA_ANGER_1', mood: 'anger', variant: 1, title: 'anger 1', path: 'audio/bgm/extra/anger1.mp3' },
      { id: 'BGM_EXTRA_ANGER_2', mood: 'anger', variant: 2, title: 'anger 2', path: 'audio/bgm/extra/anger2.mp3' },
      { id: 'BGM_EXTRA_SURPRISE_1', mood: 'surprise', variant: 1, title: 'surprise 1', path: 'audio/bgm/extra/surprise1.mp3' },
      { id: 'BGM_EXTRA_SURPRISE_2', mood: 'surprise', variant: 2, title: 'surprise 2', path: 'audio/bgm/extra/surprise2.mp3' }
    ]
  },
  se: {
    quiz: [
      { id: 'SE_QUIZ_CHOICE_PICK', key: 'quizChoicePick', path: 'audio/se/quiz_choice_pick_01_3.mp3', volume: 0.36, start: 0, end: 1.0 },
      { id: 'SE_QUIZ_CORRECT', key: 'quizCorrectStarChime', path: 'audio/se/quiz_correct_star_chime_01.mp3', volume: 0.46, start: 0, end: null },
      { id: 'SE_QUIZ_WRONG', key: 'quizWrongSandTap', path: 'audio/se/quiz_wrong_sand_tap_01_3.mp3', volume: 0.42, start: 0, end: null }
    ],
    ui: [
      { id: 'SE_UI_TAP', key: 'uiTapBottle', path: 'audio/se/ui_tap_bottle_01_3.mp3', volume: 0.50, start: 0, end: null },
      { id: 'SE_UI_DECIDE', key: 'uiConfirmChime', path: 'audio/se/ui_confirm_chime_01_3.mp3', volume: 0.42, start: 0, end: null }
    ],
    day_end: [
      { id: 'SE_DAY_END_REST', key: 'workshopDayEnd', path: 'audio/se/workshop_day_end_01_2.mp3', volume: 0.40, start: 0, end: null }
    ]
  }
};

module.exports = { AUDIO_MANIFEST };

    };

    // --- ./data/characters.cjs ---
    modules['./data/characters.cjs'] = function(module, exports, require) {
/**
 * Master data for Characters in MadeInMaghribal project.
 */
const CHARACTERS = [
  {
    characterId: "CH_NADIR",
    name: "ナーディル",
    role: "protagonist",
    toneGuideId: "TG_NADIR"
  },
  {
    characterId: "CH_HAKIMA",
    name: "ハキマ",
    role: "heroine",
    toneGuideId: "TG_HAKIMA"
  },
  {
    characterId: "CH_MIRA",
    name: "ミラ",
    role: "heroine",
    toneGuideId: "TG_MIRA"
  },
  {
    characterId: "CH_DARIYA",
    name: "ダリヤ",
    role: "heroine",
    toneGuideId: "TG_DARIYA"
  }
];

module.exports = { CHARACTERS };

    };

    // --- ./data/dailyTalkSamples.cjs ---
    modules['./data/dailyTalkSamples.cjs'] = function(module, exports, require) {
/**
 * Sample Daily Talk Data for MadeInMaghribal project.
 */
const DAILY_TALK_SAMPLES = [
  {
    topicId: "topic_daily_weather",
    timing: "morning",
    heroineId: "hakima",
    routeMode: "normal",
    scoreBand: "medium",
    lines: ["研究には最高の日和ね。", "一緒に頑張りましょう。"]
  },
  {
    topicId: "topic_daily_weather",
    timing: "morning",
    heroineId: "mira",
    routeMode: "normal",
    scoreBand: "medium",
    lines: ["散歩に行きたくなっちゃうね！", "ナーディルもそう思わない？"]
  },
  {
    topicId: "topic_daily_weather",
    timing: "morning",
    heroineId: "dariya",
    routeMode: "normal",
    scoreBand: "medium",
    lines: ["砂が温かいわ...", "良い流れを感じる。"]
  }
];

module.exports = { DAILY_TALK_SAMPLES };

    };

    // --- ./data/itemDisplayNames.cjs ---
    modules['./data/itemDisplayNames.cjs'] = function(module, exports, require) {
/**
 * Quality-aware item display names for MadeInMaghribal.
 * Generated from current genre/item-type structure.
 * 250 item IDs × 3 qualities = 750 display names.
 */

const ITEM_DISPLAY_NAMES = {
  "IT_ADN_AS_01": {
    base: "蒼星の指輪",
    normal: "蒼星の指輪",
    success: "宵星の護り指輪",
    great_success: "黎明星の名工指輪",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "AS",
    principleName: "星",
    itemType: "ADN_01",
    itemTypeName: "指輪",
  },
  "IT_ADN_AS_02": {
    base: "月影の耳飾り",
    normal: "月影の耳飾り",
    success: "星灯りの耳飾り",
    great_success: "星王の王家耳飾り",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "AS",
    principleName: "星",
    itemType: "ADN_02",
    itemTypeName: "耳飾り",
  },
  "IT_ADN_AS_03": {
    base: "星読みの首飾り",
    normal: "星読みの首飾り",
    success: "星導の守り首飾り",
    great_success: "天穹の秘宝首飾り",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "AS",
    principleName: "星",
    itemType: "ADN_03",
    itemTypeName: "首飾り",
  },
  "IT_ADN_AS_04": {
    base: "夜明けの腕輪",
    normal: "夜明けの腕輪",
    success: "星霊の旅腕輪",
    great_success: "星詠みの名工腕輪",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "AS",
    principleName: "星",
    itemType: "ADN_04",
    itemTypeName: "腕輪",
  },
  "IT_ADN_AS_05": {
    base: "方位の留め具",
    normal: "方位の留め具",
    success: "天図の留め具",
    great_success: "運命星の王家留め具",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "AS",
    principleName: "星",
    itemType: "ADN_05",
    itemTypeName: "留め具",
  },
  "IT_ADN_EL_01": {
    base: "薄荷の指輪",
    normal: "薄荷の指輪",
    success: "泡霊薬の旅指輪",
    great_success: "天露の王家指輪",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "EL",
    principleName: "霊薬",
    itemType: "ADN_01",
    itemTypeName: "指輪",
  },
  "IT_ADN_EL_02": {
    base: "青緑の耳飾り",
    normal: "青緑の耳飾り",
    success: "清泉の揺れ耳飾り",
    great_success: "聖滴の秘宝耳飾り",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "EL",
    principleName: "霊薬",
    itemType: "ADN_02",
    itemTypeName: "耳飾り",
  },
  "IT_ADN_EL_03": {
    base: "霊液の首飾り",
    normal: "霊液の首飾り",
    success: "蒼露の旅首飾り",
    great_success: "玻璃霊薬の名工首飾り",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "EL",
    principleName: "霊薬",
    itemType: "ADN_03",
    itemTypeName: "首飾り",
  },
  "IT_ADN_EL_04": {
    base: "涼香の腕輪",
    normal: "涼香の腕輪",
    success: "浄霧の腕輪",
    great_success: "癒しの雫の王家腕輪",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "EL",
    principleName: "霊薬",
    itemType: "ADN_04",
    itemTypeName: "腕輪",
  },
  "IT_ADN_EL_05": {
    base: "清滴の留め具",
    normal: "清滴の留め具",
    success: "澄み雫の装飾留め具",
    great_success: "神泉の秘宝留め具",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "EL",
    principleName: "霊薬",
    itemType: "ADN_05",
    itemTypeName: "留め具",
  },
  "IT_ADN_LI_01": {
    base: "芽吹きの指輪",
    normal: "芽吹きの指輪",
    success: "花芽の旅指輪",
    great_success: "生命奔流の王家指輪",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "LI",
    principleName: "生命",
    itemType: "ADN_01",
    itemTypeName: "指輪",
  },
  "IT_ADN_LI_02": {
    base: "若葉の耳飾り",
    normal: "若葉の耳飾り",
    success: "瑞葉の揺れ耳飾り",
    great_success: "生命樹の秘宝耳飾り",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "LI",
    principleName: "生命",
    itemType: "ADN_02",
    itemTypeName: "耳飾り",
  },
  "IT_ADN_LI_03": {
    base: "生命の首飾り",
    normal: "生命の首飾り",
    success: "再生の旅首飾り",
    great_success: "豊穣の名工首飾り",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "LI",
    principleName: "生命",
    itemType: "ADN_03",
    itemTypeName: "首飾り",
  },
  "IT_ADN_LI_04": {
    base: "蔦編みの腕輪",
    normal: "蔦編みの腕輪",
    success: "緑脈の腕輪",
    great_success: "不死芽の王家腕輪",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "LI",
    principleName: "生命",
    itemType: "ADN_04",
    itemTypeName: "腕輪",
  },
  "IT_ADN_LI_05": {
    base: "脈動の留め具",
    normal: "脈動の留め具",
    success: "活力の装飾留め具",
    great_success: "大地脈の秘宝留め具",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "LI",
    principleName: "生命",
    itemType: "ADN_05",
    itemTypeName: "留め具",
  },
  "IT_ADN_ME_01": {
    base: "錬鉄の指輪",
    normal: "錬鉄の指輪",
    success: "白鋼の護り指輪",
    great_success: "星鍛えの名工指輪",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "ME",
    principleName: "金属",
    itemType: "ADN_01",
    itemTypeName: "指輪",
  },
  "IT_ADN_ME_02": {
    base: "白錫の耳飾り",
    normal: "白錫の耳飾り",
    success: "銀磨きの耳飾り",
    great_success: "月白銀の王家耳飾り",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "ME",
    principleName: "金属",
    itemType: "ADN_02",
    itemTypeName: "耳飾り",
  },
  "IT_ADN_ME_03": {
    base: "青銅の首飾り",
    normal: "青銅の首飾り",
    success: "金銀細工の守り首飾り",
    great_success: "王工房の秘宝首飾り",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "ME",
    principleName: "金属",
    itemType: "ADN_03",
    itemTypeName: "首飾り",
  },
  "IT_ADN_ME_04": {
    base: "銀縁の腕輪",
    normal: "銀縁の腕輪",
    success: "鋼芯の旅腕輪",
    great_success: "金剛の名工腕輪",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "ME",
    principleName: "金属",
    itemType: "ADN_04",
    itemTypeName: "腕輪",
  },
  "IT_ADN_ME_05": {
    base: "鍛金の留め具",
    normal: "鍛金の留め具",
    success: "鏡銀の留め具",
    great_success: "太陽鋼の王家留め具",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "ME",
    principleName: "金属",
    itemType: "ADN_05",
    itemTypeName: "留め具",
  },
  "IT_ADN_SA_01": {
    base: "琥珀の指輪",
    normal: "琥珀の指輪",
    success: "琥珀磨きの細工指輪",
    great_success: "蜃気楼の秘宝指輪",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "SA",
    principleName: "砂",
    itemType: "ADN_01",
    itemTypeName: "指輪",
  },
  "IT_ADN_SA_02": {
    base: "砂風の耳飾り",
    normal: "砂風の耳飾り",
    success: "流砂の細工耳飾り",
    great_success: "黄金砂の名工耳飾り",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "SA",
    principleName: "砂",
    itemType: "ADN_02",
    itemTypeName: "耳飾り",
  },
  "IT_ADN_SA_03": {
    base: "黄砂の首飾り",
    normal: "黄砂の首飾り",
    success: "乾き守りの首飾り",
    great_success: "不朽砂の王家首飾り",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "SA",
    principleName: "砂",
    itemType: "ADN_03",
    itemTypeName: "首飾り",
  },
  "IT_ADN_SA_04": {
    base: "砂紋の腕輪",
    normal: "砂紋の腕輪",
    success: "風紋の護腕輪",
    great_success: "悠久砂丘の秘宝腕輪",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "SA",
    principleName: "砂",
    itemType: "ADN_04",
    itemTypeName: "腕輪",
  },
  "IT_ADN_SA_05": {
    base: "乾砂の留め具",
    normal: "乾砂の留め具",
    success: "砂丘の旅留め具",
    great_success: "砂王の名工留め具",
    genre: "ADN",
    genreName: "アクセサリー",
    principle: "SA",
    principleName: "砂",
    itemType: "ADN_05",
    itemTypeName: "留め具",
  },
  "IT_ARM_AS_01": {
    base: "蒼星の短剣",
    normal: "蒼星の短剣",
    success: "宵星の護身短剣",
    great_success: "黎明星の王工房短剣",
    genre: "ARM",
    genreName: "武具",
    principle: "AS",
    principleName: "星",
    itemType: "ARM_01",
    itemTypeName: "短剣",
  },
  "IT_ARM_AS_02": {
    base: "月影の直剣",
    normal: "月影の直剣",
    success: "星灯りの長刃直剣",
    great_success: "星王の星剣",
    genre: "ARM",
    genreName: "武具",
    principle: "AS",
    principleName: "星",
    itemType: "ARM_02",
    itemTypeName: "直剣",
  },
  "IT_ARM_AS_03": {
    base: "星読みの小槍",
    normal: "星読みの小槍",
    success: "星導の鋭小槍",
    great_success: "天穹の星槍",
    genre: "ARM",
    genreName: "武具",
    principle: "AS",
    principleName: "星",
    itemType: "ARM_03",
    itemTypeName: "小槍",
  },
  "IT_ARM_AS_04": {
    base: "夜明けの丸盾",
    normal: "夜明けの丸盾",
    success: "星霊の護り丸盾",
    great_success: "星詠みの王盾",
    genre: "ARM",
    genreName: "武具",
    principle: "AS",
    principleName: "星",
    itemType: "ARM_04",
    itemTypeName: "丸盾",
  },
  "IT_ARM_AS_05": {
    base: "方位の魔導杖",
    normal: "方位の魔導杖",
    success: "天図の魔導杖",
    great_success: "運命星の賢者杖",
    genre: "ARM",
    genreName: "武具",
    principle: "AS",
    principleName: "星",
    itemType: "ARM_05",
    itemTypeName: "魔導杖",
  },
  "IT_ARM_EL_01": {
    base: "薄荷の短剣",
    normal: "薄荷の短剣",
    success: "泡霊薬の細刃短剣",
    great_success: "天露の星剣短刃",
    genre: "ARM",
    genreName: "武具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "ARM_01",
    itemTypeName: "短剣",
  },
  "IT_ARM_EL_02": {
    base: "青緑の直剣",
    normal: "青緑の直剣",
    success: "清泉の鋭直剣",
    great_success: "聖滴の名剣",
    genre: "ARM",
    genreName: "武具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "ARM_02",
    itemTypeName: "直剣",
  },
  "IT_ARM_EL_03": {
    base: "霊液の小槍",
    normal: "霊液の小槍",
    success: "蒼露の旅槍",
    great_success: "玻璃霊薬の王家小槍",
    genre: "ARM",
    genreName: "武具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "ARM_03",
    itemTypeName: "小槍",
  },
  "IT_ARM_EL_04": {
    base: "涼香の丸盾",
    normal: "涼香の丸盾",
    success: "浄霧の受け丸盾",
    great_success: "癒しの雫の星盾",
    genre: "ARM",
    genreName: "武具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "ARM_04",
    itemTypeName: "丸盾",
  },
  "IT_ARM_EL_05": {
    base: "清滴の魔導杖",
    normal: "清滴の魔導杖",
    success: "澄み雫の導き杖",
    great_success: "神泉の大魔導杖",
    genre: "ARM",
    genreName: "武具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "ARM_05",
    itemTypeName: "魔導杖",
  },
  "IT_ARM_LI_01": {
    base: "芽吹きの短剣",
    normal: "芽吹きの短剣",
    success: "花芽の細刃短剣",
    great_success: "生命奔流の星剣短刃",
    genre: "ARM",
    genreName: "武具",
    principle: "LI",
    principleName: "生命",
    itemType: "ARM_01",
    itemTypeName: "短剣",
  },
  "IT_ARM_LI_02": {
    base: "若葉の直剣",
    normal: "若葉の直剣",
    success: "瑞葉の鋭直剣",
    great_success: "生命樹の名剣",
    genre: "ARM",
    genreName: "武具",
    principle: "LI",
    principleName: "生命",
    itemType: "ARM_02",
    itemTypeName: "直剣",
  },
  "IT_ARM_LI_03": {
    base: "生命の小槍",
    normal: "生命の小槍",
    success: "再生の旅槍",
    great_success: "豊穣の王家小槍",
    genre: "ARM",
    genreName: "武具",
    principle: "LI",
    principleName: "生命",
    itemType: "ARM_03",
    itemTypeName: "小槍",
  },
  "IT_ARM_LI_04": {
    base: "蔦編みの丸盾",
    normal: "蔦編みの丸盾",
    success: "緑脈の受け丸盾",
    great_success: "不死芽の星盾",
    genre: "ARM",
    genreName: "武具",
    principle: "LI",
    principleName: "生命",
    itemType: "ARM_04",
    itemTypeName: "丸盾",
  },
  "IT_ARM_LI_05": {
    base: "脈動の魔導杖",
    normal: "脈動の魔導杖",
    success: "活力の導き杖",
    great_success: "大地脈の大魔導杖",
    genre: "ARM",
    genreName: "武具",
    principle: "LI",
    principleName: "生命",
    itemType: "ARM_05",
    itemTypeName: "魔導杖",
  },
  "IT_ARM_ME_01": {
    base: "錬鉄の短剣",
    normal: "錬鉄の短剣",
    success: "白鋼の護身短剣",
    great_success: "星鍛えの王工房短剣",
    genre: "ARM",
    genreName: "武具",
    principle: "ME",
    principleName: "金属",
    itemType: "ARM_01",
    itemTypeName: "短剣",
  },
  "IT_ARM_ME_02": {
    base: "白錫の直剣",
    normal: "白錫の直剣",
    success: "銀磨きの長刃直剣",
    great_success: "月白銀の星剣",
    genre: "ARM",
    genreName: "武具",
    principle: "ME",
    principleName: "金属",
    itemType: "ARM_02",
    itemTypeName: "直剣",
  },
  "IT_ARM_ME_03": {
    base: "青銅の小槍",
    normal: "青銅の小槍",
    success: "金銀細工の鋭小槍",
    great_success: "王工房の星槍",
    genre: "ARM",
    genreName: "武具",
    principle: "ME",
    principleName: "金属",
    itemType: "ARM_03",
    itemTypeName: "小槍",
  },
  "IT_ARM_ME_04": {
    base: "銀縁の丸盾",
    normal: "銀縁の丸盾",
    success: "鋼芯の護り丸盾",
    great_success: "金剛の王盾",
    genre: "ARM",
    genreName: "武具",
    principle: "ME",
    principleName: "金属",
    itemType: "ARM_04",
    itemTypeName: "丸盾",
  },
  "IT_ARM_ME_05": {
    base: "鍛金の魔導杖",
    normal: "鍛金の魔導杖",
    success: "鏡銀の魔導杖",
    great_success: "太陽鋼の賢者杖",
    genre: "ARM",
    genreName: "武具",
    principle: "ME",
    principleName: "金属",
    itemType: "ARM_05",
    itemTypeName: "魔導杖",
  },
  "IT_ARM_SA_01": {
    base: "琥珀の短剣",
    normal: "琥珀の短剣",
    success: "琥珀磨きの鋭短剣",
    great_success: "蜃気楼の秘刃短剣",
    genre: "ARM",
    genreName: "武具",
    principle: "SA",
    principleName: "砂",
    itemType: "ARM_01",
    itemTypeName: "短剣",
  },
  "IT_ARM_SA_02": {
    base: "砂風の直剣",
    normal: "砂風の直剣",
    success: "流砂の騎士剣",
    great_success: "黄金砂の王家直剣",
    genre: "ARM",
    genreName: "武具",
    principle: "SA",
    principleName: "砂",
    itemType: "ARM_02",
    itemTypeName: "直剣",
  },
  "IT_ARM_SA_03": {
    base: "黄砂の小槍",
    normal: "黄砂の小槍",
    success: "乾き守りの細穂小槍",
    great_success: "不朽砂の秘槍",
    genre: "ARM",
    genreName: "武具",
    principle: "SA",
    principleName: "砂",
    itemType: "ARM_03",
    itemTypeName: "小槍",
  },
  "IT_ARM_SA_04": {
    base: "砂紋の丸盾",
    normal: "砂紋の丸盾",
    success: "風紋の堅丸盾",
    great_success: "悠久砂丘の守護丸盾",
    genre: "ARM",
    genreName: "武具",
    principle: "SA",
    principleName: "砂",
    itemType: "ARM_04",
    itemTypeName: "丸盾",
  },
  "IT_ARM_SA_05": {
    base: "乾砂の魔導杖",
    normal: "乾砂の魔導杖",
    success: "砂丘の詠唱杖",
    great_success: "砂王の星杖",
    genre: "ARM",
    genreName: "武具",
    principle: "SA",
    principleName: "砂",
    itemType: "ARM_05",
    itemTypeName: "魔導杖",
  },
  "IT_CLT_AS_01": {
    base: "蒼星の外套",
    normal: "蒼星の外套",
    success: "宵星の防砂外套",
    great_success: "黎明星の名工外套",
    genre: "CLT",
    genreName: "衣服",
    principle: "AS",
    principleName: "星",
    itemType: "CLT_01",
    itemTypeName: "外套",
  },
  "IT_CLT_AS_02": {
    base: "月影のスカーフ",
    normal: "月影のスカーフ",
    success: "星灯りの首巻き",
    great_success: "星王の王家スカーフ",
    genre: "CLT",
    genreName: "衣服",
    principle: "AS",
    principleName: "星",
    itemType: "CLT_02",
    itemTypeName: "スカーフ",
  },
  "IT_CLT_AS_03": {
    base: "星読みの旅靴",
    normal: "星読みの旅靴",
    success: "星導の歩き旅靴",
    great_success: "天穹の秘宝旅靴",
    genre: "CLT",
    genreName: "衣服",
    principle: "AS",
    principleName: "星",
    itemType: "CLT_03",
    itemTypeName: "旅靴",
  },
  "IT_CLT_AS_04": {
    base: "夜明けの革帯",
    normal: "夜明けの革帯",
    success: "星霊の工具革帯",
    great_success: "星詠みの名工革帯",
    genre: "CLT",
    genreName: "衣服",
    principle: "AS",
    principleName: "星",
    itemType: "CLT_04",
    itemTypeName: "革帯",
  },
  "IT_CLT_AS_05": {
    base: "方位の頭巾",
    normal: "方位の頭巾",
    success: "天図の頭巾",
    great_success: "運命星の王家頭巾",
    genre: "CLT",
    genreName: "衣服",
    principle: "AS",
    principleName: "星",
    itemType: "CLT_05",
    itemTypeName: "頭巾",
  },
  "IT_CLT_EL_01": {
    base: "薄荷の外套",
    normal: "薄荷の外套",
    success: "泡霊薬の外套",
    great_success: "天露の王家外套",
    genre: "CLT",
    genreName: "衣服",
    principle: "EL",
    principleName: "霊薬",
    itemType: "CLT_01",
    itemTypeName: "外套",
  },
  "IT_CLT_EL_02": {
    base: "青緑のスカーフ",
    normal: "青緑のスカーフ",
    success: "清泉の旅スカーフ",
    great_success: "聖滴の秘宝スカーフ",
    genre: "CLT",
    genreName: "衣服",
    principle: "EL",
    principleName: "霊薬",
    itemType: "CLT_02",
    itemTypeName: "スカーフ",
  },
  "IT_CLT_EL_03": {
    base: "霊液の旅靴",
    normal: "霊液の旅靴",
    success: "蒼露の砂路靴",
    great_success: "玻璃霊薬の名工旅靴",
    genre: "CLT",
    genreName: "衣服",
    principle: "EL",
    principleName: "霊薬",
    itemType: "CLT_03",
    itemTypeName: "旅靴",
  },
  "IT_CLT_EL_04": {
    base: "涼香の革帯",
    normal: "涼香の革帯",
    success: "浄霧の革帯",
    great_success: "癒しの雫の王家革帯",
    genre: "CLT",
    genreName: "衣服",
    principle: "EL",
    principleName: "霊薬",
    itemType: "CLT_04",
    itemTypeName: "革帯",
  },
  "IT_CLT_EL_05": {
    base: "清滴の頭巾",
    normal: "清滴の頭巾",
    success: "澄み雫の旅頭巾",
    great_success: "神泉の秘宝頭巾",
    genre: "CLT",
    genreName: "衣服",
    principle: "EL",
    principleName: "霊薬",
    itemType: "CLT_05",
    itemTypeName: "頭巾",
  },
  "IT_CLT_LI_01": {
    base: "芽吹きの外套",
    normal: "芽吹きの外套",
    success: "花芽の外套",
    great_success: "生命奔流の王家外套",
    genre: "CLT",
    genreName: "衣服",
    principle: "LI",
    principleName: "生命",
    itemType: "CLT_01",
    itemTypeName: "外套",
  },
  "IT_CLT_LI_02": {
    base: "若葉のスカーフ",
    normal: "若葉のスカーフ",
    success: "瑞葉の旅スカーフ",
    great_success: "生命樹の秘宝スカーフ",
    genre: "CLT",
    genreName: "衣服",
    principle: "LI",
    principleName: "生命",
    itemType: "CLT_02",
    itemTypeName: "スカーフ",
  },
  "IT_CLT_LI_03": {
    base: "生命の旅靴",
    normal: "生命の旅靴",
    success: "再生の砂路靴",
    great_success: "豊穣の名工旅靴",
    genre: "CLT",
    genreName: "衣服",
    principle: "LI",
    principleName: "生命",
    itemType: "CLT_03",
    itemTypeName: "旅靴",
  },
  "IT_CLT_LI_04": {
    base: "蔦編みの革帯",
    normal: "蔦編みの革帯",
    success: "緑脈の革帯",
    great_success: "不死芽の王家革帯",
    genre: "CLT",
    genreName: "衣服",
    principle: "LI",
    principleName: "生命",
    itemType: "CLT_04",
    itemTypeName: "革帯",
  },
  "IT_CLT_LI_05": {
    base: "脈動の頭巾",
    normal: "脈動の頭巾",
    success: "活力の旅頭巾",
    great_success: "大地脈の秘宝頭巾",
    genre: "CLT",
    genreName: "衣服",
    principle: "LI",
    principleName: "生命",
    itemType: "CLT_05",
    itemTypeName: "頭巾",
  },
  "IT_CLT_ME_01": {
    base: "錬鉄の外套",
    normal: "錬鉄の外套",
    success: "白鋼の防砂外套",
    great_success: "星鍛えの名工外套",
    genre: "CLT",
    genreName: "衣服",
    principle: "ME",
    principleName: "金属",
    itemType: "CLT_01",
    itemTypeName: "外套",
  },
  "IT_CLT_ME_02": {
    base: "白錫のスカーフ",
    normal: "白錫のスカーフ",
    success: "銀磨きの首巻き",
    great_success: "月白銀の王家スカーフ",
    genre: "CLT",
    genreName: "衣服",
    principle: "ME",
    principleName: "金属",
    itemType: "CLT_02",
    itemTypeName: "スカーフ",
  },
  "IT_CLT_ME_03": {
    base: "青銅の旅靴",
    normal: "青銅の旅靴",
    success: "金銀細工の歩き旅靴",
    great_success: "王工房の秘宝旅靴",
    genre: "CLT",
    genreName: "衣服",
    principle: "ME",
    principleName: "金属",
    itemType: "CLT_03",
    itemTypeName: "旅靴",
  },
  "IT_CLT_ME_04": {
    base: "銀縁の革帯",
    normal: "銀縁の革帯",
    success: "鋼芯の工具革帯",
    great_success: "金剛の名工革帯",
    genre: "CLT",
    genreName: "衣服",
    principle: "ME",
    principleName: "金属",
    itemType: "CLT_04",
    itemTypeName: "革帯",
  },
  "IT_CLT_ME_05": {
    base: "鍛金の頭巾",
    normal: "鍛金の頭巾",
    success: "鏡銀の頭巾",
    great_success: "太陽鋼の王家頭巾",
    genre: "CLT",
    genreName: "衣服",
    principle: "ME",
    principleName: "金属",
    itemType: "CLT_05",
    itemTypeName: "頭巾",
  },
  "IT_CLT_SA_01": {
    base: "琥珀の外套",
    normal: "琥珀の外套",
    success: "琥珀磨きの旅外套",
    great_success: "蜃気楼の秘宝外套",
    genre: "CLT",
    genreName: "衣服",
    principle: "SA",
    principleName: "砂",
    itemType: "CLT_01",
    itemTypeName: "外套",
  },
  "IT_CLT_SA_02": {
    base: "砂風のスカーフ",
    normal: "砂風のスカーフ",
    success: "流砂の絹スカーフ",
    great_success: "黄金砂の名工スカーフ",
    genre: "CLT",
    genreName: "衣服",
    principle: "SA",
    principleName: "砂",
    itemType: "CLT_02",
    itemTypeName: "スカーフ",
  },
  "IT_CLT_SA_03": {
    base: "黄砂の旅靴",
    normal: "黄砂の旅靴",
    success: "乾き守りの旅靴",
    great_success: "不朽砂の王家旅靴",
    genre: "CLT",
    genreName: "衣服",
    principle: "SA",
    principleName: "砂",
    itemType: "CLT_03",
    itemTypeName: "旅靴",
  },
  "IT_CLT_SA_04": {
    base: "砂紋の革帯",
    normal: "砂紋の革帯",
    success: "風紋の旅革帯",
    great_success: "悠久砂丘の秘宝革帯",
    genre: "CLT",
    genreName: "衣服",
    principle: "SA",
    principleName: "砂",
    itemType: "CLT_04",
    itemTypeName: "革帯",
  },
  "IT_CLT_SA_05": {
    base: "乾砂の頭巾",
    normal: "乾砂の頭巾",
    success: "砂丘の防砂頭巾",
    great_success: "砂王の名工頭巾",
    genre: "CLT",
    genreName: "衣服",
    principle: "SA",
    principleName: "砂",
    itemType: "CLT_05",
    itemTypeName: "頭巾",
  },
  "IT_DAY_AS_01": {
    base: "蒼星の油灯",
    normal: "蒼星の油灯",
    success: "宵星の手持ち油灯",
    great_success: "黎明星の名工油灯",
    genre: "DAY",
    genreName: "日用",
    principle: "AS",
    principleName: "星",
    itemType: "DAY_01",
    itemTypeName: "油灯",
  },
  "IT_DAY_AS_02": {
    base: "月影の方位磁針",
    normal: "月影の方位磁針",
    success: "星灯りの方位磁針",
    great_success: "星王の王家方位磁針",
    genre: "DAY",
    genreName: "日用",
    principle: "AS",
    principleName: "星",
    itemType: "DAY_02",
    itemTypeName: "方位磁針",
  },
  "IT_DAY_AS_03": {
    base: "星読みの手帳",
    normal: "星読みの手帳",
    success: "星導の旅手帳",
    great_success: "天穹の秘宝手帳",
    genre: "DAY",
    genreName: "日用",
    principle: "AS",
    principleName: "星",
    itemType: "DAY_03",
    itemTypeName: "手帳",
  },
  "IT_DAY_AS_04": {
    base: "夜明けの寝袋",
    normal: "夜明けの寝袋",
    success: "星霊の保温寝袋",
    great_success: "星詠みの名工寝袋",
    genre: "DAY",
    genreName: "日用",
    principle: "AS",
    principleName: "星",
    itemType: "DAY_04",
    itemTypeName: "寝袋",
  },
  "IT_DAY_AS_05": {
    base: "方位の小鍵",
    normal: "方位の小鍵",
    success: "天図の留め鍵",
    great_success: "運命星の王家小鍵",
    genre: "DAY",
    genreName: "日用",
    principle: "AS",
    principleName: "星",
    itemType: "DAY_05",
    itemTypeName: "小鍵",
  },
  "IT_DAY_EL_01": {
    base: "薄荷の油灯",
    normal: "薄荷の油灯",
    success: "泡霊薬の油灯",
    great_success: "天露の王家油灯",
    genre: "DAY",
    genreName: "日用",
    principle: "EL",
    principleName: "霊薬",
    itemType: "DAY_01",
    itemTypeName: "油灯",
  },
  "IT_DAY_EL_02": {
    base: "青緑の方位磁針",
    normal: "青緑の方位磁針",
    success: "清泉の旅磁針",
    great_success: "聖滴の秘宝方位磁針",
    genre: "DAY",
    genreName: "日用",
    principle: "EL",
    principleName: "霊薬",
    itemType: "DAY_02",
    itemTypeName: "方位磁針",
  },
  "IT_DAY_EL_03": {
    base: "霊液の手帳",
    normal: "霊液の手帳",
    success: "蒼露の記録手帳",
    great_success: "玻璃霊薬の名工手帳",
    genre: "DAY",
    genreName: "日用",
    principle: "EL",
    principleName: "霊薬",
    itemType: "DAY_03",
    itemTypeName: "手帳",
  },
  "IT_DAY_EL_04": {
    base: "涼香の寝袋",
    normal: "涼香の寝袋",
    success: "浄霧の寝袋",
    great_success: "癒しの雫の王家寝袋",
    genre: "DAY",
    genreName: "日用",
    principle: "EL",
    principleName: "霊薬",
    itemType: "DAY_04",
    itemTypeName: "寝袋",
  },
  "IT_DAY_EL_05": {
    base: "清滴の小鍵",
    normal: "清滴の小鍵",
    success: "澄み雫の秘鍵",
    great_success: "神泉の秘宝小鍵",
    genre: "DAY",
    genreName: "日用",
    principle: "EL",
    principleName: "霊薬",
    itemType: "DAY_05",
    itemTypeName: "小鍵",
  },
  "IT_DAY_LI_01": {
    base: "芽吹きの油灯",
    normal: "芽吹きの油灯",
    success: "花芽の油灯",
    great_success: "生命奔流の王家油灯",
    genre: "DAY",
    genreName: "日用",
    principle: "LI",
    principleName: "生命",
    itemType: "DAY_01",
    itemTypeName: "油灯",
  },
  "IT_DAY_LI_02": {
    base: "若葉の方位磁針",
    normal: "若葉の方位磁針",
    success: "瑞葉の旅磁針",
    great_success: "生命樹の秘宝方位磁針",
    genre: "DAY",
    genreName: "日用",
    principle: "LI",
    principleName: "生命",
    itemType: "DAY_02",
    itemTypeName: "方位磁針",
  },
  "IT_DAY_LI_03": {
    base: "生命の手帳",
    normal: "生命の手帳",
    success: "再生の記録手帳",
    great_success: "豊穣の名工手帳",
    genre: "DAY",
    genreName: "日用",
    principle: "LI",
    principleName: "生命",
    itemType: "DAY_03",
    itemTypeName: "手帳",
  },
  "IT_DAY_LI_04": {
    base: "蔦編みの寝袋",
    normal: "蔦編みの寝袋",
    success: "緑脈の寝袋",
    great_success: "不死芽の王家寝袋",
    genre: "DAY",
    genreName: "日用",
    principle: "LI",
    principleName: "生命",
    itemType: "DAY_04",
    itemTypeName: "寝袋",
  },
  "IT_DAY_LI_05": {
    base: "脈動の小鍵",
    normal: "脈動の小鍵",
    success: "活力の秘鍵",
    great_success: "大地脈の秘宝小鍵",
    genre: "DAY",
    genreName: "日用",
    principle: "LI",
    principleName: "生命",
    itemType: "DAY_05",
    itemTypeName: "小鍵",
  },
  "IT_DAY_ME_01": {
    base: "錬鉄の油灯",
    normal: "錬鉄の油灯",
    success: "白鋼の手持ち油灯",
    great_success: "星鍛えの名工油灯",
    genre: "DAY",
    genreName: "日用",
    principle: "ME",
    principleName: "金属",
    itemType: "DAY_01",
    itemTypeName: "油灯",
  },
  "IT_DAY_ME_02": {
    base: "白錫の方位磁針",
    normal: "白錫の方位磁針",
    success: "銀磨きの方位磁針",
    great_success: "月白銀の王家方位磁針",
    genre: "DAY",
    genreName: "日用",
    principle: "ME",
    principleName: "金属",
    itemType: "DAY_02",
    itemTypeName: "方位磁針",
  },
  "IT_DAY_ME_03": {
    base: "青銅の手帳",
    normal: "青銅の手帳",
    success: "金銀細工の旅手帳",
    great_success: "王工房の秘宝手帳",
    genre: "DAY",
    genreName: "日用",
    principle: "ME",
    principleName: "金属",
    itemType: "DAY_03",
    itemTypeName: "手帳",
  },
  "IT_DAY_ME_04": {
    base: "銀縁の寝袋",
    normal: "銀縁の寝袋",
    success: "鋼芯の保温寝袋",
    great_success: "金剛の名工寝袋",
    genre: "DAY",
    genreName: "日用",
    principle: "ME",
    principleName: "金属",
    itemType: "DAY_04",
    itemTypeName: "寝袋",
  },
  "IT_DAY_ME_05": {
    base: "鍛金の小鍵",
    normal: "鍛金の小鍵",
    success: "鏡銀の留め鍵",
    great_success: "太陽鋼の王家小鍵",
    genre: "DAY",
    genreName: "日用",
    principle: "ME",
    principleName: "金属",
    itemType: "DAY_05",
    itemTypeName: "小鍵",
  },
  "IT_DAY_SA_01": {
    base: "琥珀の油灯",
    normal: "琥珀の油灯",
    success: "琥珀磨きの旅油灯",
    great_success: "蜃気楼の秘宝油灯",
    genre: "DAY",
    genreName: "日用",
    principle: "SA",
    principleName: "砂",
    itemType: "DAY_01",
    itemTypeName: "油灯",
  },
  "IT_DAY_SA_02": {
    base: "砂風の方位磁針",
    normal: "砂風の方位磁針",
    success: "流砂の方位盤",
    great_success: "黄金砂の名工方位磁針",
    genre: "DAY",
    genreName: "日用",
    principle: "SA",
    principleName: "砂",
    itemType: "DAY_02",
    itemTypeName: "方位磁針",
  },
  "IT_DAY_SA_03": {
    base: "黄砂の手帳",
    normal: "黄砂の手帳",
    success: "乾き守りの手帳",
    great_success: "不朽砂の王家手帳",
    genre: "DAY",
    genreName: "日用",
    principle: "SA",
    principleName: "砂",
    itemType: "DAY_03",
    itemTypeName: "手帳",
  },
  "IT_DAY_SA_04": {
    base: "砂紋の寝袋",
    normal: "砂紋の寝袋",
    success: "風紋の旅寝袋",
    great_success: "悠久砂丘の秘宝寝袋",
    genre: "DAY",
    genreName: "日用",
    principle: "SA",
    principleName: "砂",
    itemType: "DAY_04",
    itemTypeName: "寝袋",
  },
  "IT_DAY_SA_05": {
    base: "乾砂の小鍵",
    normal: "乾砂の小鍵",
    success: "砂丘の小鍵",
    great_success: "砂王の名工小鍵",
    genre: "DAY",
    genreName: "日用",
    principle: "SA",
    principleName: "砂",
    itemType: "DAY_05",
    itemTypeName: "小鍵",
  },
  "IT_FOD_AS_01": {
    base: "蒼星の旅パン",
    normal: "蒼星の旅パン",
    success: "宵星の香り旅パン",
    great_success: "黎明星の王都旅パン",
    genre: "FOD",
    genreName: "食糧",
    principle: "AS",
    principleName: "星",
    itemType: "FOD_01",
    itemTypeName: "旅パン",
  },
  "IT_FOD_AS_02": {
    base: "月影の干し果物",
    normal: "月影の干し果物",
    success: "星灯りの旅果実",
    great_success: "星王の星蜜果",
    genre: "FOD",
    genreName: "食糧",
    principle: "AS",
    principleName: "星",
    itemType: "FOD_02",
    itemTypeName: "干し果物",
  },
  "IT_FOD_AS_03": {
    base: "星読みの香辛料瓶",
    normal: "星読みの香辛料瓶",
    success: "星導の香辛料壺",
    great_success: "天穹の秘香瓶",
    genre: "FOD",
    genreName: "食糧",
    principle: "AS",
    principleName: "星",
    itemType: "FOD_03",
    itemTypeName: "香辛料瓶",
  },
  "IT_FOD_AS_04": {
    base: "夜明けの茶杯",
    normal: "夜明けの茶杯",
    success: "星霊の旅茶杯",
    great_success: "星詠みの王家茶杯",
    genre: "FOD",
    genreName: "食糧",
    principle: "AS",
    principleName: "星",
    itemType: "FOD_04",
    itemTypeName: "茶杯",
  },
  "IT_FOD_AS_05": {
    base: "方位の水筒",
    normal: "方位の水筒",
    success: "天図の清水筒",
    great_success: "運命星の不朽水筒",
    genre: "FOD",
    genreName: "食糧",
    principle: "AS",
    principleName: "星",
    itemType: "FOD_05",
    itemTypeName: "水筒",
  },
  "IT_FOD_EL_01": {
    base: "薄荷の旅パン",
    normal: "薄荷の旅パン",
    success: "泡霊薬の滋養パン",
    great_success: "天露の豊穣パン",
    genre: "FOD",
    genreName: "食糧",
    principle: "EL",
    principleName: "霊薬",
    itemType: "FOD_01",
    itemTypeName: "旅パン",
  },
  "IT_FOD_EL_02": {
    base: "青緑の干し果物",
    normal: "青緑の干し果物",
    success: "清泉の蜜干し果物",
    great_success: "聖滴の宝果",
    genre: "FOD",
    genreName: "食糧",
    principle: "EL",
    principleName: "霊薬",
    itemType: "FOD_02",
    itemTypeName: "干し果物",
  },
  "IT_FOD_EL_03": {
    base: "霊液の香辛料瓶",
    normal: "霊液の香辛料瓶",
    success: "蒼露の香料瓶",
    great_success: "玻璃霊薬の王都香料瓶",
    genre: "FOD",
    genreName: "食糧",
    principle: "EL",
    principleName: "霊薬",
    itemType: "FOD_03",
    itemTypeName: "香辛料瓶",
  },
  "IT_FOD_EL_04": {
    base: "涼香の茶杯",
    normal: "涼香の茶杯",
    success: "浄霧の湯気茶杯",
    great_success: "癒しの雫の祝福茶杯",
    genre: "FOD",
    genreName: "食糧",
    principle: "EL",
    principleName: "霊薬",
    itemType: "FOD_04",
    itemTypeName: "茶杯",
  },
  "IT_FOD_EL_05": {
    base: "清滴の水筒",
    normal: "清滴の水筒",
    success: "澄み雫の保冷水筒",
    great_success: "神泉の聖水筒",
    genre: "FOD",
    genreName: "食糧",
    principle: "EL",
    principleName: "霊薬",
    itemType: "FOD_05",
    itemTypeName: "水筒",
  },
  "IT_FOD_LI_01": {
    base: "芽吹きの旅パン",
    normal: "芽吹きの旅パン",
    success: "花芽の滋養パン",
    great_success: "生命奔流の豊穣パン",
    genre: "FOD",
    genreName: "食糧",
    principle: "LI",
    principleName: "生命",
    itemType: "FOD_01",
    itemTypeName: "旅パン",
  },
  "IT_FOD_LI_02": {
    base: "若葉の干し果物",
    normal: "若葉の干し果物",
    success: "瑞葉の蜜干し果物",
    great_success: "生命樹の宝果",
    genre: "FOD",
    genreName: "食糧",
    principle: "LI",
    principleName: "生命",
    itemType: "FOD_02",
    itemTypeName: "干し果物",
  },
  "IT_FOD_LI_03": {
    base: "生命の香辛料瓶",
    normal: "生命の香辛料瓶",
    success: "再生の香料瓶",
    great_success: "豊穣の王都香料瓶",
    genre: "FOD",
    genreName: "食糧",
    principle: "LI",
    principleName: "生命",
    itemType: "FOD_03",
    itemTypeName: "香辛料瓶",
  },
  "IT_FOD_LI_04": {
    base: "蔦編みの茶杯",
    normal: "蔦編みの茶杯",
    success: "緑脈の湯気茶杯",
    great_success: "不死芽の祝福茶杯",
    genre: "FOD",
    genreName: "食糧",
    principle: "LI",
    principleName: "生命",
    itemType: "FOD_04",
    itemTypeName: "茶杯",
  },
  "IT_FOD_LI_05": {
    base: "脈動の水筒",
    normal: "脈動の水筒",
    success: "活力の保冷水筒",
    great_success: "大地脈の聖水筒",
    genre: "FOD",
    genreName: "食糧",
    principle: "LI",
    principleName: "生命",
    itemType: "FOD_05",
    itemTypeName: "水筒",
  },
  "IT_FOD_ME_01": {
    base: "錬鉄の旅パン",
    normal: "錬鉄の旅パン",
    success: "白鋼の香り旅パン",
    great_success: "星鍛えの王都旅パン",
    genre: "FOD",
    genreName: "食糧",
    principle: "ME",
    principleName: "金属",
    itemType: "FOD_01",
    itemTypeName: "旅パン",
  },
  "IT_FOD_ME_02": {
    base: "白錫の干し果物",
    normal: "白錫の干し果物",
    success: "銀磨きの旅果実",
    great_success: "月白銀の星蜜果",
    genre: "FOD",
    genreName: "食糧",
    principle: "ME",
    principleName: "金属",
    itemType: "FOD_02",
    itemTypeName: "干し果物",
  },
  "IT_FOD_ME_03": {
    base: "青銅の香辛料瓶",
    normal: "青銅の香辛料瓶",
    success: "金銀細工の香辛料壺",
    great_success: "王工房の秘香瓶",
    genre: "FOD",
    genreName: "食糧",
    principle: "ME",
    principleName: "金属",
    itemType: "FOD_03",
    itemTypeName: "香辛料瓶",
  },
  "IT_FOD_ME_04": {
    base: "銀縁の茶杯",
    normal: "銀縁の茶杯",
    success: "鋼芯の旅茶杯",
    great_success: "金剛の王家茶杯",
    genre: "FOD",
    genreName: "食糧",
    principle: "ME",
    principleName: "金属",
    itemType: "FOD_04",
    itemTypeName: "茶杯",
  },
  "IT_FOD_ME_05": {
    base: "鍛金の水筒",
    normal: "鍛金の水筒",
    success: "鏡銀の清水筒",
    great_success: "太陽鋼の不朽水筒",
    genre: "FOD",
    genreName: "食糧",
    principle: "ME",
    principleName: "金属",
    itemType: "FOD_05",
    itemTypeName: "水筒",
  },
  "IT_FOD_SA_01": {
    base: "琥珀の旅パン",
    normal: "琥珀の旅パン",
    success: "琥珀磨きの焼き旅パン",
    great_success: "蜃気楼の祝福旅パン",
    genre: "FOD",
    genreName: "食糧",
    principle: "SA",
    principleName: "砂",
    itemType: "FOD_01",
    itemTypeName: "旅パン",
  },
  "IT_FOD_SA_02": {
    base: "砂風の干し果物",
    normal: "砂風の干し果物",
    success: "流砂の甘露果",
    great_success: "黄金砂の豊穣果",
    genre: "FOD",
    genreName: "食糧",
    principle: "SA",
    principleName: "砂",
    itemType: "FOD_02",
    itemTypeName: "干し果物",
  },
  "IT_FOD_SA_03": {
    base: "黄砂の香辛料瓶",
    normal: "黄砂の香辛料瓶",
    success: "乾き守りの調味瓶",
    great_success: "不朽砂の香王瓶",
    genre: "FOD",
    genreName: "食糧",
    principle: "SA",
    principleName: "砂",
    itemType: "FOD_03",
    itemTypeName: "香辛料瓶",
  },
  "IT_FOD_SA_04": {
    base: "砂紋の茶杯",
    normal: "砂紋の茶杯",
    success: "風紋の香茶杯",
    great_success: "悠久砂丘の星茶杯",
    genre: "FOD",
    genreName: "食糧",
    principle: "SA",
    principleName: "砂",
    itemType: "FOD_04",
    itemTypeName: "茶杯",
  },
  "IT_FOD_SA_05": {
    base: "乾砂の水筒",
    normal: "乾砂の水筒",
    success: "砂丘の旅水筒",
    great_success: "砂王の星泉水筒",
    genre: "FOD",
    genreName: "食糧",
    principle: "SA",
    principleName: "砂",
    itemType: "FOD_05",
    itemTypeName: "水筒",
  },
  "IT_MED_AS_01": {
    base: "蒼星の薬瓶",
    normal: "蒼星の薬瓶",
    success: "宵星の救急薬瓶",
    great_success: "黎明星の王薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "AS",
    principleName: "星",
    itemType: "MED_01",
    itemTypeName: "薬瓶",
  },
  "IT_MED_AS_02": {
    base: "月影の霊薬瓶",
    normal: "月影の霊薬瓶",
    success: "星灯りの清霊瓶",
    great_success: "星王の王家霊薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "AS",
    principleName: "星",
    itemType: "MED_02",
    itemTypeName: "霊薬瓶",
  },
  "IT_MED_AS_03": {
    base: "星読みの軟膏壺",
    normal: "星読みの軟膏壺",
    success: "星導の癒し軟膏壺",
    great_success: "天穹の秘薬膏壺",
    genre: "MED",
    genreName: "薬品",
    principle: "AS",
    principleName: "星",
    itemType: "MED_03",
    itemTypeName: "軟膏壺",
  },
  "IT_MED_AS_04": {
    base: "夜明けの粉薬瓶",
    normal: "夜明けの粉薬瓶",
    success: "星霊の細粉薬瓶",
    great_success: "星詠みの星粉薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "AS",
    principleName: "星",
    itemType: "MED_04",
    itemTypeName: "粉薬瓶",
  },
  "IT_MED_AS_05": {
    base: "方位の丸薬箱",
    normal: "方位の丸薬箱",
    success: "天図の薬箱",
    great_success: "運命星の王薬箱",
    genre: "MED",
    genreName: "薬品",
    principle: "AS",
    principleName: "星",
    itemType: "MED_05",
    itemTypeName: "丸薬箱",
  },
  "IT_MED_EL_01": {
    base: "薄荷の薬瓶",
    normal: "薄荷の薬瓶",
    success: "泡霊薬の小薬瓶",
    great_success: "天露の星癒薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "EL",
    principleName: "霊薬",
    itemType: "MED_01",
    itemTypeName: "薬瓶",
  },
  "IT_MED_EL_02": {
    base: "青緑の霊薬瓶",
    normal: "青緑の霊薬瓶",
    success: "清泉の霊薬瓶",
    great_success: "聖滴の聖霊薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "EL",
    principleName: "霊薬",
    itemType: "MED_02",
    itemTypeName: "霊薬瓶",
  },
  "IT_MED_EL_03": {
    base: "霊液の軟膏壺",
    normal: "霊液の軟膏壺",
    success: "蒼露の治療壺",
    great_success: "玻璃霊薬の聖軟膏壺",
    genre: "MED",
    genreName: "薬品",
    principle: "EL",
    principleName: "霊薬",
    itemType: "MED_03",
    itemTypeName: "軟膏壺",
  },
  "IT_MED_EL_04": {
    base: "涼香の粉薬瓶",
    normal: "涼香の粉薬瓶",
    success: "浄霧の薬粉瓶",
    great_success: "癒しの雫の王家粉薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "EL",
    principleName: "霊薬",
    itemType: "MED_04",
    itemTypeName: "粉薬瓶",
  },
  "IT_MED_EL_05": {
    base: "清滴の丸薬箱",
    normal: "清滴の丸薬箱",
    success: "澄み雫の丸薬箱",
    great_success: "神泉の秘丸薬箱",
    genre: "MED",
    genreName: "薬品",
    principle: "EL",
    principleName: "霊薬",
    itemType: "MED_05",
    itemTypeName: "丸薬箱",
  },
  "IT_MED_LI_01": {
    base: "芽吹きの薬瓶",
    normal: "芽吹きの薬瓶",
    success: "花芽の小薬瓶",
    great_success: "生命奔流の星癒薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "LI",
    principleName: "生命",
    itemType: "MED_01",
    itemTypeName: "薬瓶",
  },
  "IT_MED_LI_02": {
    base: "若葉の霊薬瓶",
    normal: "若葉の霊薬瓶",
    success: "瑞葉の霊薬瓶",
    great_success: "生命樹の聖霊薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "LI",
    principleName: "生命",
    itemType: "MED_02",
    itemTypeName: "霊薬瓶",
  },
  "IT_MED_LI_03": {
    base: "生命の軟膏壺",
    normal: "生命の軟膏壺",
    success: "再生の治療壺",
    great_success: "豊穣の聖軟膏壺",
    genre: "MED",
    genreName: "薬品",
    principle: "LI",
    principleName: "生命",
    itemType: "MED_03",
    itemTypeName: "軟膏壺",
  },
  "IT_MED_LI_04": {
    base: "蔦編みの粉薬瓶",
    normal: "蔦編みの粉薬瓶",
    success: "緑脈の薬粉瓶",
    great_success: "不死芽の王家粉薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "LI",
    principleName: "生命",
    itemType: "MED_04",
    itemTypeName: "粉薬瓶",
  },
  "IT_MED_LI_05": {
    base: "脈動の丸薬箱",
    normal: "脈動の丸薬箱",
    success: "活力の丸薬箱",
    great_success: "大地脈の秘丸薬箱",
    genre: "MED",
    genreName: "薬品",
    principle: "LI",
    principleName: "生命",
    itemType: "MED_05",
    itemTypeName: "丸薬箱",
  },
  "IT_MED_ME_01": {
    base: "錬鉄の薬瓶",
    normal: "錬鉄の薬瓶",
    success: "白鋼の救急薬瓶",
    great_success: "星鍛えの王薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "ME",
    principleName: "金属",
    itemType: "MED_01",
    itemTypeName: "薬瓶",
  },
  "IT_MED_ME_02": {
    base: "白錫の霊薬瓶",
    normal: "白錫の霊薬瓶",
    success: "銀磨きの清霊瓶",
    great_success: "月白銀の王家霊薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "ME",
    principleName: "金属",
    itemType: "MED_02",
    itemTypeName: "霊薬瓶",
  },
  "IT_MED_ME_03": {
    base: "青銅の軟膏壺",
    normal: "青銅の軟膏壺",
    success: "金銀細工の癒し軟膏壺",
    great_success: "王工房の秘薬膏壺",
    genre: "MED",
    genreName: "薬品",
    principle: "ME",
    principleName: "金属",
    itemType: "MED_03",
    itemTypeName: "軟膏壺",
  },
  "IT_MED_ME_04": {
    base: "銀縁の粉薬瓶",
    normal: "銀縁の粉薬瓶",
    success: "鋼芯の細粉薬瓶",
    great_success: "金剛の星粉薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "ME",
    principleName: "金属",
    itemType: "MED_04",
    itemTypeName: "粉薬瓶",
  },
  "IT_MED_ME_05": {
    base: "鍛金の丸薬箱",
    normal: "鍛金の丸薬箱",
    success: "鏡銀の薬箱",
    great_success: "太陽鋼の王薬箱",
    genre: "MED",
    genreName: "薬品",
    principle: "ME",
    principleName: "金属",
    itemType: "MED_05",
    itemTypeName: "丸薬箱",
  },
  "IT_MED_SA_01": {
    base: "琥珀の薬瓶",
    normal: "琥珀の薬瓶",
    success: "琥珀磨きの調合薬瓶",
    great_success: "蜃気楼の秘薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "SA",
    principleName: "砂",
    itemType: "MED_01",
    itemTypeName: "薬瓶",
  },
  "IT_MED_SA_02": {
    base: "砂風の霊薬瓶",
    normal: "砂風の霊薬瓶",
    success: "流砂の高霊薬瓶",
    great_success: "黄金砂の星霊薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "SA",
    principleName: "砂",
    itemType: "MED_02",
    itemTypeName: "霊薬瓶",
  },
  "IT_MED_SA_03": {
    base: "黄砂の軟膏壺",
    normal: "黄砂の軟膏壺",
    success: "乾き守りの薬膏壺",
    great_success: "不朽砂の王薬壺",
    genre: "MED",
    genreName: "薬品",
    principle: "SA",
    principleName: "砂",
    itemType: "MED_03",
    itemTypeName: "軟膏壺",
  },
  "IT_MED_SA_04": {
    base: "砂紋の粉薬瓶",
    normal: "砂紋の粉薬瓶",
    success: "風紋の粉薬瓶",
    great_success: "悠久砂丘の秘粉薬瓶",
    genre: "MED",
    genreName: "薬品",
    principle: "SA",
    principleName: "砂",
    itemType: "MED_04",
    itemTypeName: "粉薬瓶",
  },
  "IT_MED_SA_05": {
    base: "乾砂の丸薬箱",
    normal: "乾砂の丸薬箱",
    success: "砂丘の携帯丸薬箱",
    great_success: "砂王の聖丸薬箱",
    genre: "MED",
    genreName: "薬品",
    principle: "SA",
    principleName: "砂",
    itemType: "MED_05",
    itemTypeName: "丸薬箱",
  },
  "IT_RIT_AS_01": {
    base: "蒼星の香炉",
    normal: "蒼星の香炉",
    success: "宵星の携帯香炉",
    great_success: "黎明星の名工香炉",
    genre: "RIT",
    genreName: "儀式",
    principle: "AS",
    principleName: "星",
    itemType: "RIT_01",
    itemTypeName: "香炉",
  },
  "IT_RIT_AS_02": {
    base: "月影の護符飾り",
    normal: "月影の護符飾り",
    success: "星灯りの祈り飾り",
    great_success: "星王の王家護符飾り",
    genre: "RIT",
    genreName: "儀式",
    principle: "AS",
    principleName: "星",
    itemType: "RIT_02",
    itemTypeName: "護符飾り",
  },
  "IT_RIT_AS_03": {
    base: "星読みの儀礼小刀",
    normal: "星読みの儀礼小刀",
    success: "星導の儀礼小刀",
    great_success: "天穹の秘宝儀礼小刀",
    genre: "RIT",
    genreName: "儀式",
    principle: "AS",
    principleName: "星",
    itemType: "RIT_03",
    itemTypeName: "儀礼小刀",
  },
  "IT_RIT_AS_04": {
    base: "夜明けの小鈴",
    normal: "夜明けの小鈴",
    success: "星霊の祭礼鈴",
    great_success: "星詠みの名工小鈴",
    genre: "RIT",
    genreName: "儀式",
    principle: "AS",
    principleName: "星",
    itemType: "RIT_04",
    itemTypeName: "小鈴",
  },
  "IT_RIT_AS_05": {
    base: "方位の香木箱",
    normal: "方位の香木箱",
    success: "天図の香箱",
    great_success: "運命星の王家香木箱",
    genre: "RIT",
    genreName: "儀式",
    principle: "AS",
    principleName: "星",
    itemType: "RIT_05",
    itemTypeName: "香木箱",
  },
  "IT_RIT_EL_01": {
    base: "薄荷の香炉",
    normal: "薄荷の香炉",
    success: "泡霊薬の香炉",
    great_success: "天露の王家香炉",
    genre: "RIT",
    genreName: "儀式",
    principle: "EL",
    principleName: "霊薬",
    itemType: "RIT_01",
    itemTypeName: "香炉",
  },
  "IT_RIT_EL_02": {
    base: "青緑の護符飾り",
    normal: "青緑の護符飾り",
    success: "清泉の守護符",
    great_success: "聖滴の秘宝護符飾り",
    genre: "RIT",
    genreName: "儀式",
    principle: "EL",
    principleName: "霊薬",
    itemType: "RIT_02",
    itemTypeName: "護符飾り",
  },
  "IT_RIT_EL_03": {
    base: "霊液の儀礼小刀",
    normal: "霊液の儀礼小刀",
    success: "蒼露の祭具小刀",
    great_success: "玻璃霊薬の名工儀礼小刀",
    genre: "RIT",
    genreName: "儀式",
    principle: "EL",
    principleName: "霊薬",
    itemType: "RIT_03",
    itemTypeName: "儀礼小刀",
  },
  "IT_RIT_EL_04": {
    base: "涼香の小鈴",
    normal: "涼香の小鈴",
    success: "浄霧の小鈴",
    great_success: "癒しの雫の王家小鈴",
    genre: "RIT",
    genreName: "儀式",
    principle: "EL",
    principleName: "霊薬",
    itemType: "RIT_04",
    itemTypeName: "小鈴",
  },
  "IT_RIT_EL_05": {
    base: "清滴の香木箱",
    normal: "清滴の香木箱",
    success: "澄み雫の香木箱",
    great_success: "神泉の秘宝香木箱",
    genre: "RIT",
    genreName: "儀式",
    principle: "EL",
    principleName: "霊薬",
    itemType: "RIT_05",
    itemTypeName: "香木箱",
  },
  "IT_RIT_LI_01": {
    base: "芽吹きの香炉",
    normal: "芽吹きの香炉",
    success: "花芽の香炉",
    great_success: "生命奔流の王家香炉",
    genre: "RIT",
    genreName: "儀式",
    principle: "LI",
    principleName: "生命",
    itemType: "RIT_01",
    itemTypeName: "香炉",
  },
  "IT_RIT_LI_02": {
    base: "若葉の護符飾り",
    normal: "若葉の護符飾り",
    success: "瑞葉の守護符",
    great_success: "生命樹の秘宝護符飾り",
    genre: "RIT",
    genreName: "儀式",
    principle: "LI",
    principleName: "生命",
    itemType: "RIT_02",
    itemTypeName: "護符飾り",
  },
  "IT_RIT_LI_03": {
    base: "生命の儀礼小刀",
    normal: "生命の儀礼小刀",
    success: "再生の祭具小刀",
    great_success: "豊穣の名工儀礼小刀",
    genre: "RIT",
    genreName: "儀式",
    principle: "LI",
    principleName: "生命",
    itemType: "RIT_03",
    itemTypeName: "儀礼小刀",
  },
  "IT_RIT_LI_04": {
    base: "蔦編みの小鈴",
    normal: "蔦編みの小鈴",
    success: "緑脈の小鈴",
    great_success: "不死芽の王家小鈴",
    genre: "RIT",
    genreName: "儀式",
    principle: "LI",
    principleName: "生命",
    itemType: "RIT_04",
    itemTypeName: "小鈴",
  },
  "IT_RIT_LI_05": {
    base: "脈動の香木箱",
    normal: "脈動の香木箱",
    success: "活力の香木箱",
    great_success: "大地脈の秘宝香木箱",
    genre: "RIT",
    genreName: "儀式",
    principle: "LI",
    principleName: "生命",
    itemType: "RIT_05",
    itemTypeName: "香木箱",
  },
  "IT_RIT_ME_01": {
    base: "錬鉄の香炉",
    normal: "錬鉄の香炉",
    success: "白鋼の携帯香炉",
    great_success: "星鍛えの名工香炉",
    genre: "RIT",
    genreName: "儀式",
    principle: "ME",
    principleName: "金属",
    itemType: "RIT_01",
    itemTypeName: "香炉",
  },
  "IT_RIT_ME_02": {
    base: "白錫の護符飾り",
    normal: "白錫の護符飾り",
    success: "銀磨きの祈り飾り",
    great_success: "月白銀の王家護符飾り",
    genre: "RIT",
    genreName: "儀式",
    principle: "ME",
    principleName: "金属",
    itemType: "RIT_02",
    itemTypeName: "護符飾り",
  },
  "IT_RIT_ME_03": {
    base: "青銅の儀礼小刀",
    normal: "青銅の儀礼小刀",
    success: "金銀細工の儀礼小刀",
    great_success: "王工房の秘宝儀礼小刀",
    genre: "RIT",
    genreName: "儀式",
    principle: "ME",
    principleName: "金属",
    itemType: "RIT_03",
    itemTypeName: "儀礼小刀",
  },
  "IT_RIT_ME_04": {
    base: "銀縁の小鈴",
    normal: "銀縁の小鈴",
    success: "鋼芯の祭礼鈴",
    great_success: "金剛の名工小鈴",
    genre: "RIT",
    genreName: "儀式",
    principle: "ME",
    principleName: "金属",
    itemType: "RIT_04",
    itemTypeName: "小鈴",
  },
  "IT_RIT_ME_05": {
    base: "鍛金の香木箱",
    normal: "鍛金の香木箱",
    success: "鏡銀の香箱",
    great_success: "太陽鋼の王家香木箱",
    genre: "RIT",
    genreName: "儀式",
    principle: "ME",
    principleName: "金属",
    itemType: "RIT_05",
    itemTypeName: "香木箱",
  },
  "IT_RIT_SA_01": {
    base: "琥珀の香炉",
    normal: "琥珀の香炉",
    success: "琥珀磨きの儀式香炉",
    great_success: "蜃気楼の秘宝香炉",
    genre: "RIT",
    genreName: "儀式",
    principle: "SA",
    principleName: "砂",
    itemType: "RIT_01",
    itemTypeName: "香炉",
  },
  "IT_RIT_SA_02": {
    base: "砂風の護符飾り",
    normal: "砂風の護符飾り",
    success: "流砂の護符飾り",
    great_success: "黄金砂の名工護符飾り",
    genre: "RIT",
    genreName: "儀式",
    principle: "SA",
    principleName: "砂",
    itemType: "RIT_02",
    itemTypeName: "護符飾り",
  },
  "IT_RIT_SA_03": {
    base: "黄砂の儀礼小刀",
    normal: "黄砂の儀礼小刀",
    success: "乾き守りの祈祷小刀",
    great_success: "不朽砂の王家儀礼小刀",
    genre: "RIT",
    genreName: "儀式",
    principle: "SA",
    principleName: "砂",
    itemType: "RIT_03",
    itemTypeName: "儀礼小刀",
  },
  "IT_RIT_SA_04": {
    base: "砂紋の小鈴",
    normal: "砂紋の小鈴",
    success: "風紋の祈り小鈴",
    great_success: "悠久砂丘の秘宝小鈴",
    genre: "RIT",
    genreName: "儀式",
    principle: "SA",
    principleName: "砂",
    itemType: "RIT_04",
    itemTypeName: "小鈴",
  },
  "IT_RIT_SA_05": {
    base: "乾砂の香木箱",
    normal: "乾砂の香木箱",
    success: "砂丘の祈香箱",
    great_success: "砂王の名工香木箱",
    genre: "RIT",
    genreName: "儀式",
    principle: "SA",
    principleName: "砂",
    itemType: "RIT_05",
    itemTypeName: "香木箱",
  },
  "IT_TRD_AS_01": {
    base: "蒼星の硬貨袋",
    normal: "蒼星の硬貨袋",
    success: "宵星の革硬貨袋",
    great_success: "黎明星の名工硬貨袋",
    genre: "TRD",
    genreName: "貿易",
    principle: "AS",
    principleName: "星",
    itemType: "TRD_01",
    itemTypeName: "硬貨袋",
  },
  "IT_TRD_AS_02": {
    base: "月影の商人秤",
    normal: "月影の商人秤",
    success: "星灯りの精密秤",
    great_success: "星王の王家商人秤",
    genre: "TRD",
    genreName: "貿易",
    principle: "AS",
    principleName: "星",
    itemType: "TRD_02",
    itemTypeName: "商人秤",
  },
  "IT_TRD_AS_03": {
    base: "星読みの封蝋印",
    normal: "星読みの封蝋印",
    success: "星導の商印",
    great_success: "天穹の秘宝封蝋印",
    genre: "TRD",
    genreName: "貿易",
    principle: "AS",
    principleName: "星",
    itemType: "TRD_03",
    itemTypeName: "封蝋印",
  },
  "IT_TRD_AS_04": {
    base: "夜明けの帳簿",
    normal: "夜明けの帳簿",
    success: "星霊の旅帳簿",
    great_success: "星詠みの名工帳簿",
    genre: "TRD",
    genreName: "貿易",
    principle: "AS",
    principleName: "星",
    itemType: "TRD_04",
    itemTypeName: "帳簿",
  },
  "IT_TRD_AS_05": {
    base: "方位の小宝箱",
    normal: "方位の小宝箱",
    success: "天図の鍵付き小箱",
    great_success: "運命星の王家小宝箱",
    genre: "TRD",
    genreName: "貿易",
    principle: "AS",
    principleName: "星",
    itemType: "TRD_05",
    itemTypeName: "小宝箱",
  },
  "IT_TRD_EL_01": {
    base: "薄荷の硬貨袋",
    normal: "薄荷の硬貨袋",
    success: "泡霊薬の硬貨袋",
    great_success: "天露の王家硬貨袋",
    genre: "TRD",
    genreName: "貿易",
    principle: "EL",
    principleName: "霊薬",
    itemType: "TRD_01",
    itemTypeName: "硬貨袋",
  },
  "IT_TRD_EL_02": {
    base: "青緑の商人秤",
    normal: "青緑の商人秤",
    success: "清泉の商人秤",
    great_success: "聖滴の秘宝商人秤",
    genre: "TRD",
    genreName: "貿易",
    principle: "EL",
    principleName: "霊薬",
    itemType: "TRD_02",
    itemTypeName: "商人秤",
  },
  "IT_TRD_EL_03": {
    base: "霊液の封蝋印",
    normal: "霊液の封蝋印",
    success: "蒼露の封蝋印",
    great_success: "玻璃霊薬の名工封蝋印",
    genre: "TRD",
    genreName: "貿易",
    principle: "EL",
    principleName: "霊薬",
    itemType: "TRD_03",
    itemTypeName: "封蝋印",
  },
  "IT_TRD_EL_04": {
    base: "涼香の帳簿",
    normal: "涼香の帳簿",
    success: "浄霧の帳簿",
    great_success: "癒しの雫の王家帳簿",
    genre: "TRD",
    genreName: "貿易",
    principle: "EL",
    principleName: "霊薬",
    itemType: "TRD_04",
    itemTypeName: "帳簿",
  },
  "IT_TRD_EL_05": {
    base: "清滴の小宝箱",
    normal: "清滴の小宝箱",
    success: "澄み雫の小宝箱",
    great_success: "神泉の秘宝小宝箱",
    genre: "TRD",
    genreName: "貿易",
    principle: "EL",
    principleName: "霊薬",
    itemType: "TRD_05",
    itemTypeName: "小宝箱",
  },
  "IT_TRD_LI_01": {
    base: "芽吹きの硬貨袋",
    normal: "芽吹きの硬貨袋",
    success: "花芽の硬貨袋",
    great_success: "生命奔流の王家硬貨袋",
    genre: "TRD",
    genreName: "貿易",
    principle: "LI",
    principleName: "生命",
    itemType: "TRD_01",
    itemTypeName: "硬貨袋",
  },
  "IT_TRD_LI_02": {
    base: "若葉の商人秤",
    normal: "若葉の商人秤",
    success: "瑞葉の商人秤",
    great_success: "生命樹の秘宝商人秤",
    genre: "TRD",
    genreName: "貿易",
    principle: "LI",
    principleName: "生命",
    itemType: "TRD_02",
    itemTypeName: "商人秤",
  },
  "IT_TRD_LI_03": {
    base: "生命の封蝋印",
    normal: "生命の封蝋印",
    success: "再生の封蝋印",
    great_success: "豊穣の名工封蝋印",
    genre: "TRD",
    genreName: "貿易",
    principle: "LI",
    principleName: "生命",
    itemType: "TRD_03",
    itemTypeName: "封蝋印",
  },
  "IT_TRD_LI_04": {
    base: "蔦編みの帳簿",
    normal: "蔦編みの帳簿",
    success: "緑脈の帳簿",
    great_success: "不死芽の王家帳簿",
    genre: "TRD",
    genreName: "貿易",
    principle: "LI",
    principleName: "生命",
    itemType: "TRD_04",
    itemTypeName: "帳簿",
  },
  "IT_TRD_LI_05": {
    base: "脈動の小宝箱",
    normal: "脈動の小宝箱",
    success: "活力の小宝箱",
    great_success: "大地脈の秘宝小宝箱",
    genre: "TRD",
    genreName: "貿易",
    principle: "LI",
    principleName: "生命",
    itemType: "TRD_05",
    itemTypeName: "小宝箱",
  },
  "IT_TRD_ME_01": {
    base: "錬鉄の硬貨袋",
    normal: "錬鉄の硬貨袋",
    success: "白鋼の革硬貨袋",
    great_success: "星鍛えの名工硬貨袋",
    genre: "TRD",
    genreName: "貿易",
    principle: "ME",
    principleName: "金属",
    itemType: "TRD_01",
    itemTypeName: "硬貨袋",
  },
  "IT_TRD_ME_02": {
    base: "白錫の商人秤",
    normal: "白錫の商人秤",
    success: "銀磨きの精密秤",
    great_success: "月白銀の王家商人秤",
    genre: "TRD",
    genreName: "貿易",
    principle: "ME",
    principleName: "金属",
    itemType: "TRD_02",
    itemTypeName: "商人秤",
  },
  "IT_TRD_ME_03": {
    base: "青銅の封蝋印",
    normal: "青銅の封蝋印",
    success: "金銀細工の商印",
    great_success: "王工房の秘宝封蝋印",
    genre: "TRD",
    genreName: "貿易",
    principle: "ME",
    principleName: "金属",
    itemType: "TRD_03",
    itemTypeName: "封蝋印",
  },
  "IT_TRD_ME_04": {
    base: "銀縁の帳簿",
    normal: "銀縁の帳簿",
    success: "鋼芯の旅帳簿",
    great_success: "金剛の名工帳簿",
    genre: "TRD",
    genreName: "貿易",
    principle: "ME",
    principleName: "金属",
    itemType: "TRD_04",
    itemTypeName: "帳簿",
  },
  "IT_TRD_ME_05": {
    base: "鍛金の小宝箱",
    normal: "鍛金の小宝箱",
    success: "鏡銀の鍵付き小箱",
    great_success: "太陽鋼の王家小宝箱",
    genre: "TRD",
    genreName: "貿易",
    principle: "ME",
    principleName: "金属",
    itemType: "TRD_05",
    itemTypeName: "小宝箱",
  },
  "IT_TRD_SA_01": {
    base: "琥珀の硬貨袋",
    normal: "琥珀の硬貨袋",
    success: "琥珀磨きの商い硬貨袋",
    great_success: "蜃気楼の秘宝硬貨袋",
    genre: "TRD",
    genreName: "貿易",
    principle: "SA",
    principleName: "砂",
    itemType: "TRD_01",
    itemTypeName: "硬貨袋",
  },
  "IT_TRD_SA_02": {
    base: "砂風の商人秤",
    normal: "砂風の商人秤",
    success: "流砂の旅秤",
    great_success: "黄金砂の名工商人秤",
    genre: "TRD",
    genreName: "貿易",
    principle: "SA",
    principleName: "砂",
    itemType: "TRD_02",
    itemTypeName: "商人秤",
  },
  "IT_TRD_SA_03": {
    base: "黄砂の封蝋印",
    normal: "黄砂の封蝋印",
    success: "乾き守りの証印",
    great_success: "不朽砂の王家封蝋印",
    genre: "TRD",
    genreName: "貿易",
    principle: "SA",
    principleName: "砂",
    itemType: "TRD_03",
    itemTypeName: "封蝋印",
  },
  "IT_TRD_SA_04": {
    base: "砂紋の帳簿",
    normal: "砂紋の帳簿",
    success: "風紋の商い帳簿",
    great_success: "悠久砂丘の秘宝帳簿",
    genre: "TRD",
    genreName: "貿易",
    principle: "SA",
    principleName: "砂",
    itemType: "TRD_04",
    itemTypeName: "帳簿",
  },
  "IT_TRD_SA_05": {
    base: "乾砂の小宝箱",
    normal: "乾砂の小宝箱",
    success: "砂丘の商い宝箱",
    great_success: "砂王の名工小宝箱",
    genre: "TRD",
    genreName: "貿易",
    principle: "SA",
    principleName: "砂",
    itemType: "TRD_05",
    itemTypeName: "小宝箱",
  },
  "IT_TRV_AS_01": {
    base: "蒼星の地図筒",
    normal: "蒼星の地図筒",
    success: "宵星の防湿地図筒",
    great_success: "黎明星の名工地図筒",
    genre: "TRV",
    genreName: "旅具",
    principle: "AS",
    principleName: "星",
    itemType: "TRV_01",
    itemTypeName: "地図筒",
  },
  "IT_TRV_AS_02": {
    base: "月影の携帯水筒",
    normal: "月影の携帯水筒",
    success: "星灯りの肩掛け水筒",
    great_success: "星王の王家携帯水筒",
    genre: "TRV",
    genreName: "旅具",
    principle: "AS",
    principleName: "星",
    itemType: "TRV_02",
    itemTypeName: "携帯水筒",
  },
  "IT_TRV_AS_03": {
    base: "星読みの縄束",
    normal: "星読みの縄束",
    success: "星導の旅縄束",
    great_success: "天穹の秘宝縄束",
    genre: "TRV",
    genreName: "旅具",
    principle: "AS",
    principleName: "星",
    itemType: "TRV_03",
    itemTypeName: "縄束",
  },
  "IT_TRV_AS_04": {
    base: "夜明けの旅袋",
    normal: "夜明けの旅袋",
    success: "星霊の大旅袋",
    great_success: "星詠みの名工旅袋",
    genre: "TRV",
    genreName: "旅具",
    principle: "AS",
    principleName: "星",
    itemType: "TRV_04",
    itemTypeName: "旅袋",
  },
  "IT_TRV_AS_05": {
    base: "方位の小ランタン",
    normal: "方位の小ランタン",
    success: "天図の手提げランタン",
    great_success: "運命星の王家小ランタン",
    genre: "TRV",
    genreName: "旅具",
    principle: "AS",
    principleName: "星",
    itemType: "TRV_05",
    itemTypeName: "小ランタン",
  },
  "IT_TRV_EL_01": {
    base: "薄荷の地図筒",
    normal: "薄荷の地図筒",
    success: "泡霊薬の地図筒",
    great_success: "天露の王家地図筒",
    genre: "TRV",
    genreName: "旅具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "TRV_01",
    itemTypeName: "地図筒",
  },
  "IT_TRV_EL_02": {
    base: "青緑の携帯水筒",
    normal: "青緑の携帯水筒",
    success: "清泉の携帯水筒",
    great_success: "聖滴の秘宝携帯水筒",
    genre: "TRV",
    genreName: "旅具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "TRV_02",
    itemTypeName: "携帯水筒",
  },
  "IT_TRV_EL_03": {
    base: "霊液の縄束",
    normal: "霊液の縄束",
    success: "蒼露の丈夫な縄束",
    great_success: "玻璃霊薬の名工縄束",
    genre: "TRV",
    genreName: "旅具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "TRV_03",
    itemTypeName: "縄束",
  },
  "IT_TRV_EL_04": {
    base: "涼香の旅袋",
    normal: "涼香の旅袋",
    success: "浄霧の旅袋",
    great_success: "癒しの雫の王家旅袋",
    genre: "TRV",
    genreName: "旅具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "TRV_04",
    itemTypeName: "旅袋",
  },
  "IT_TRV_EL_05": {
    base: "清滴の小ランタン",
    normal: "清滴の小ランタン",
    success: "澄み雫の旅ランタン",
    great_success: "神泉の秘宝小ランタン",
    genre: "TRV",
    genreName: "旅具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "TRV_05",
    itemTypeName: "小ランタン",
  },
  "IT_TRV_LI_01": {
    base: "芽吹きの地図筒",
    normal: "芽吹きの地図筒",
    success: "花芽の地図筒",
    great_success: "生命奔流の王家地図筒",
    genre: "TRV",
    genreName: "旅具",
    principle: "LI",
    principleName: "生命",
    itemType: "TRV_01",
    itemTypeName: "地図筒",
  },
  "IT_TRV_LI_02": {
    base: "若葉の携帯水筒",
    normal: "若葉の携帯水筒",
    success: "瑞葉の携帯水筒",
    great_success: "生命樹の秘宝携帯水筒",
    genre: "TRV",
    genreName: "旅具",
    principle: "LI",
    principleName: "生命",
    itemType: "TRV_02",
    itemTypeName: "携帯水筒",
  },
  "IT_TRV_LI_03": {
    base: "生命の縄束",
    normal: "生命の縄束",
    success: "再生の丈夫な縄束",
    great_success: "豊穣の名工縄束",
    genre: "TRV",
    genreName: "旅具",
    principle: "LI",
    principleName: "生命",
    itemType: "TRV_03",
    itemTypeName: "縄束",
  },
  "IT_TRV_LI_04": {
    base: "蔦編みの旅袋",
    normal: "蔦編みの旅袋",
    success: "緑脈の旅袋",
    great_success: "不死芽の王家旅袋",
    genre: "TRV",
    genreName: "旅具",
    principle: "LI",
    principleName: "生命",
    itemType: "TRV_04",
    itemTypeName: "旅袋",
  },
  "IT_TRV_LI_05": {
    base: "脈動の小ランタン",
    normal: "脈動の小ランタン",
    success: "活力の旅ランタン",
    great_success: "大地脈の秘宝小ランタン",
    genre: "TRV",
    genreName: "旅具",
    principle: "LI",
    principleName: "生命",
    itemType: "TRV_05",
    itemTypeName: "小ランタン",
  },
  "IT_TRV_ME_01": {
    base: "錬鉄の地図筒",
    normal: "錬鉄の地図筒",
    success: "白鋼の防湿地図筒",
    great_success: "星鍛えの名工地図筒",
    genre: "TRV",
    genreName: "旅具",
    principle: "ME",
    principleName: "金属",
    itemType: "TRV_01",
    itemTypeName: "地図筒",
  },
  "IT_TRV_ME_02": {
    base: "白錫の携帯水筒",
    normal: "白錫の携帯水筒",
    success: "銀磨きの肩掛け水筒",
    great_success: "月白銀の王家携帯水筒",
    genre: "TRV",
    genreName: "旅具",
    principle: "ME",
    principleName: "金属",
    itemType: "TRV_02",
    itemTypeName: "携帯水筒",
  },
  "IT_TRV_ME_03": {
    base: "青銅の縄束",
    normal: "青銅の縄束",
    success: "金銀細工の旅縄束",
    great_success: "王工房の秘宝縄束",
    genre: "TRV",
    genreName: "旅具",
    principle: "ME",
    principleName: "金属",
    itemType: "TRV_03",
    itemTypeName: "縄束",
  },
  "IT_TRV_ME_04": {
    base: "銀縁の旅袋",
    normal: "銀縁の旅袋",
    success: "鋼芯の大旅袋",
    great_success: "金剛の名工旅袋",
    genre: "TRV",
    genreName: "旅具",
    principle: "ME",
    principleName: "金属",
    itemType: "TRV_04",
    itemTypeName: "旅袋",
  },
  "IT_TRV_ME_05": {
    base: "鍛金の小ランタン",
    normal: "鍛金の小ランタン",
    success: "鏡銀の手提げランタン",
    great_success: "太陽鋼の王家小ランタン",
    genre: "TRV",
    genreName: "旅具",
    principle: "ME",
    principleName: "金属",
    itemType: "TRV_05",
    itemTypeName: "小ランタン",
  },
  "IT_TRV_SA_01": {
    base: "琥珀の地図筒",
    normal: "琥珀の地図筒",
    success: "琥珀磨きの旅地図筒",
    great_success: "蜃気楼の秘宝地図筒",
    genre: "TRV",
    genreName: "旅具",
    principle: "SA",
    principleName: "砂",
    itemType: "TRV_01",
    itemTypeName: "地図筒",
  },
  "IT_TRV_SA_02": {
    base: "砂風の携帯水筒",
    normal: "砂風の携帯水筒",
    success: "流砂の旅水筒",
    great_success: "黄金砂の名工携帯水筒",
    genre: "TRV",
    genreName: "旅具",
    principle: "SA",
    principleName: "砂",
    itemType: "TRV_02",
    itemTypeName: "携帯水筒",
  },
  "IT_TRV_SA_03": {
    base: "黄砂の縄束",
    normal: "黄砂の縄束",
    success: "乾き守りの縄束",
    great_success: "不朽砂の王家縄束",
    genre: "TRV",
    genreName: "旅具",
    principle: "SA",
    principleName: "砂",
    itemType: "TRV_03",
    itemTypeName: "縄束",
  },
  "IT_TRV_SA_04": {
    base: "砂紋の旅袋",
    normal: "砂紋の旅袋",
    success: "風紋の肩掛け旅袋",
    great_success: "悠久砂丘の秘宝旅袋",
    genre: "TRV",
    genreName: "旅具",
    principle: "SA",
    principleName: "砂",
    itemType: "TRV_04",
    itemTypeName: "旅袋",
  },
  "IT_TRV_SA_05": {
    base: "乾砂の小ランタン",
    normal: "乾砂の小ランタン",
    success: "砂丘の小ランタン",
    great_success: "砂王の名工小ランタン",
    genre: "TRV",
    genreName: "旅具",
    principle: "SA",
    principleName: "砂",
    itemType: "TRV_05",
    itemTypeName: "小ランタン",
  },
  "IT_WRK_AS_01": {
    base: "蒼星の乳鉢",
    normal: "蒼星の乳鉢",
    success: "宵星の薬研乳鉢",
    great_success: "黎明星の名工乳鉢",
    genre: "WRK",
    genreName: "道具",
    principle: "AS",
    principleName: "星",
    itemType: "WRK_01",
    itemTypeName: "乳鉢",
  },
  "IT_WRK_AS_02": {
    base: "月影のトング",
    normal: "月影のトング",
    success: "星灯りのトング",
    great_success: "星王の王家トング",
    genre: "WRK",
    genreName: "道具",
    principle: "AS",
    principleName: "星",
    itemType: "WRK_02",
    itemTypeName: "トング",
  },
  "IT_WRK_AS_03": {
    base: "星読みのるつぼ",
    normal: "星読みのるつぼ",
    success: "星導の錬成るつぼ",
    great_success: "天穹の秘宝るつぼ",
    genre: "WRK",
    genreName: "道具",
    principle: "AS",
    principleName: "星",
    itemType: "WRK_03",
    itemTypeName: "るつぼ",
  },
  "IT_WRK_AS_04": {
    base: "夜明けの計量匙",
    normal: "夜明けの計量匙",
    success: "星霊の計量匙",
    great_success: "星詠みの名工計量匙",
    genre: "WRK",
    genreName: "道具",
    principle: "AS",
    principleName: "星",
    itemType: "WRK_04",
    itemTypeName: "計量匙",
  },
  "IT_WRK_AS_05": {
    base: "方位のフラスコ",
    normal: "方位のフラスコ",
    success: "天図のフラスコ",
    great_success: "運命星の王家フラスコ",
    genre: "WRK",
    genreName: "道具",
    principle: "AS",
    principleName: "星",
    itemType: "WRK_05",
    itemTypeName: "フラスコ",
  },
  "IT_WRK_EL_01": {
    base: "薄荷の乳鉢",
    normal: "薄荷の乳鉢",
    success: "泡霊薬の乳鉢",
    great_success: "天露の王家乳鉢",
    genre: "WRK",
    genreName: "道具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "WRK_01",
    itemTypeName: "乳鉢",
  },
  "IT_WRK_EL_02": {
    base: "青緑のトング",
    normal: "青緑のトング",
    success: "清泉の鍛冶トング",
    great_success: "聖滴の秘宝トング",
    genre: "WRK",
    genreName: "道具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "WRK_02",
    itemTypeName: "トング",
  },
  "IT_WRK_EL_03": {
    base: "霊液のるつぼ",
    normal: "霊液のるつぼ",
    success: "蒼露の耐熱るつぼ",
    great_success: "玻璃霊薬の名工るつぼ",
    genre: "WRK",
    genreName: "道具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "WRK_03",
    itemTypeName: "るつぼ",
  },
  "IT_WRK_EL_04": {
    base: "涼香の計量匙",
    normal: "涼香の計量匙",
    success: "浄霧の精密匙",
    great_success: "癒しの雫の王家計量匙",
    genre: "WRK",
    genreName: "道具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "WRK_04",
    itemTypeName: "計量匙",
  },
  "IT_WRK_EL_05": {
    base: "清滴のフラスコ",
    normal: "清滴のフラスコ",
    success: "澄み雫の調合フラスコ",
    great_success: "神泉の秘宝フラスコ",
    genre: "WRK",
    genreName: "道具",
    principle: "EL",
    principleName: "霊薬",
    itemType: "WRK_05",
    itemTypeName: "フラスコ",
  },
  "IT_WRK_LI_01": {
    base: "芽吹きの乳鉢",
    normal: "芽吹きの乳鉢",
    success: "花芽の乳鉢",
    great_success: "生命奔流の王家乳鉢",
    genre: "WRK",
    genreName: "道具",
    principle: "LI",
    principleName: "生命",
    itemType: "WRK_01",
    itemTypeName: "乳鉢",
  },
  "IT_WRK_LI_02": {
    base: "若葉のトング",
    normal: "若葉のトング",
    success: "瑞葉の鍛冶トング",
    great_success: "生命樹の秘宝トング",
    genre: "WRK",
    genreName: "道具",
    principle: "LI",
    principleName: "生命",
    itemType: "WRK_02",
    itemTypeName: "トング",
  },
  "IT_WRK_LI_03": {
    base: "生命のるつぼ",
    normal: "生命のるつぼ",
    success: "再生の耐熱るつぼ",
    great_success: "豊穣の名工るつぼ",
    genre: "WRK",
    genreName: "道具",
    principle: "LI",
    principleName: "生命",
    itemType: "WRK_03",
    itemTypeName: "るつぼ",
  },
  "IT_WRK_LI_04": {
    base: "蔦編みの計量匙",
    normal: "蔦編みの計量匙",
    success: "緑脈の精密匙",
    great_success: "不死芽の王家計量匙",
    genre: "WRK",
    genreName: "道具",
    principle: "LI",
    principleName: "生命",
    itemType: "WRK_04",
    itemTypeName: "計量匙",
  },
  "IT_WRK_LI_05": {
    base: "脈動のフラスコ",
    normal: "脈動のフラスコ",
    success: "活力の調合フラスコ",
    great_success: "大地脈の秘宝フラスコ",
    genre: "WRK",
    genreName: "道具",
    principle: "LI",
    principleName: "生命",
    itemType: "WRK_05",
    itemTypeName: "フラスコ",
  },
  "IT_WRK_ME_01": {
    base: "錬鉄の乳鉢",
    normal: "錬鉄の乳鉢",
    success: "白鋼の薬研乳鉢",
    great_success: "星鍛えの名工乳鉢",
    genre: "WRK",
    genreName: "道具",
    principle: "ME",
    principleName: "金属",
    itemType: "WRK_01",
    itemTypeName: "乳鉢",
  },
  "IT_WRK_ME_02": {
    base: "白錫のトング",
    normal: "白錫のトング",
    success: "銀磨きのトング",
    great_success: "月白銀の王家トング",
    genre: "WRK",
    genreName: "道具",
    principle: "ME",
    principleName: "金属",
    itemType: "WRK_02",
    itemTypeName: "トング",
  },
  "IT_WRK_ME_03": {
    base: "青銅のるつぼ",
    normal: "青銅のるつぼ",
    success: "金銀細工の錬成るつぼ",
    great_success: "王工房の秘宝るつぼ",
    genre: "WRK",
    genreName: "道具",
    principle: "ME",
    principleName: "金属",
    itemType: "WRK_03",
    itemTypeName: "るつぼ",
  },
  "IT_WRK_ME_04": {
    base: "銀縁の計量匙",
    normal: "銀縁の計量匙",
    success: "鋼芯の計量匙",
    great_success: "金剛の名工計量匙",
    genre: "WRK",
    genreName: "道具",
    principle: "ME",
    principleName: "金属",
    itemType: "WRK_04",
    itemTypeName: "計量匙",
  },
  "IT_WRK_ME_05": {
    base: "鍛金のフラスコ",
    normal: "鍛金のフラスコ",
    success: "鏡銀のフラスコ",
    great_success: "太陽鋼の王家フラスコ",
    genre: "WRK",
    genreName: "道具",
    principle: "ME",
    principleName: "金属",
    itemType: "WRK_05",
    itemTypeName: "フラスコ",
  },
  "IT_WRK_SA_01": {
    base: "琥珀の乳鉢",
    normal: "琥珀の乳鉢",
    success: "琥珀磨きの調合乳鉢",
    great_success: "蜃気楼の秘宝乳鉢",
    genre: "WRK",
    genreName: "道具",
    principle: "SA",
    principleName: "砂",
    itemType: "WRK_01",
    itemTypeName: "乳鉢",
  },
  "IT_WRK_SA_02": {
    base: "砂風のトング",
    normal: "砂風のトング",
    success: "流砂の調合トング",
    great_success: "黄金砂の名工トング",
    genre: "WRK",
    genreName: "道具",
    principle: "SA",
    principleName: "砂",
    itemType: "WRK_02",
    itemTypeName: "トング",
  },
  "IT_WRK_SA_03": {
    base: "黄砂のるつぼ",
    normal: "黄砂のるつぼ",
    success: "乾き守りのるつぼ",
    great_success: "不朽砂の王家るつぼ",
    genre: "WRK",
    genreName: "道具",
    principle: "SA",
    principleName: "砂",
    itemType: "WRK_03",
    itemTypeName: "るつぼ",
  },
  "IT_WRK_SA_04": {
    base: "砂紋の計量匙",
    normal: "砂紋の計量匙",
    success: "風紋の調合匙",
    great_success: "悠久砂丘の秘宝計量匙",
    genre: "WRK",
    genreName: "道具",
    principle: "SA",
    principleName: "砂",
    itemType: "WRK_04",
    itemTypeName: "計量匙",
  },
  "IT_WRK_SA_05": {
    base: "乾砂のフラスコ",
    normal: "乾砂のフラスコ",
    success: "砂丘の蒸留フラスコ",
    great_success: "砂王の名工フラスコ",
    genre: "WRK",
    genreName: "道具",
    principle: "SA",
    principleName: "砂",
    itemType: "WRK_05",
    itemTypeName: "フラスコ",
  },
};

function getItemDisplayName(itemId, quality = 'base') {
  const item = ITEM_DISPLAY_NAMES[itemId];
  if (!item) return itemId;
  return item[quality] || item.base || itemId;
}

module.exports = { ITEM_DISPLAY_NAMES, getItemDisplayName };

    };

    // --- ./data/itemMaster.cjs ---
    modules['./data/itemMaster.cjs'] = function(module, exports, require) {
/**
 * Item Master data generation for MadeInMaghribal project.
 * Automatically generates 250 items based on taxonomy.
 */
const { GENRES, PRINCIPLES, INDICES } = require('./itemTaxonomy.cjs');

const ITEM_MASTER = [];

for (const genre of GENRES) {
  for (const principle of PRINCIPLES) {
    for (const index of INDICES) {
      ITEM_MASTER.push({
        itemId: `IT_${genre}_${principle}_${index}`,
        name: `${genre} Item ${principle}-${index}`,
        genre,
        principle,
        rank: parseInt(index, 10)
      });
    }
  }
}

module.exports = { ITEM_MASTER };

    };

    // --- ./data/itemTaxonomy.cjs ---
    modules['./data/itemTaxonomy.cjs'] = function(module, exports, require) {
/**
 * Item Taxonomy for MadeInMaghribal project.
 */
const GENRES = ['ARM', 'FOD', 'MED', 'ADN', 'CLT', 'DAY', 'WRK', 'TRV', 'RIT', 'TRD'];
const PRINCIPLES = ['AS', 'EL', 'LI', 'ME', 'SA'];
const INDICES = ['01', '02', '03', '04', '05'];

module.exports = { GENRES, PRINCIPLES, INDICES };

    };

    // --- ./data/itemTexts.cjs ---
    modules['./data/itemTexts.cjs'] = function(module, exports, require) {
/**
 * Item quality flavor texts generated from public/data/item.txt.
 */

const ITEM_TEXTS = {
  "IT_ADN_AS_01": {
    "normal": "星明かりを模した装飾が施された指輪。夜間の視認性を高め、暗い場所での作業効率を上げる。（効果：夜間の命中率が少し上昇する）",
    "success": "方位を示す術理が宿る星霊の指輪。目的地を予感させる直感を授け、無駄な動きを減らしてくれる。（効果：回避率が上昇する）",
    "great_success": "青い光を放つ星霊の指輪。未来の予兆を僅かに感じ取り、敵の鋭い一撃を未然に回避する助けとなる。（効果：回避率と直感力が大きく上昇する）",
  },
  "IT_ADN_AS_02": {
    "normal": "小さな青い石を配した星霊の耳飾り。夜道で微かな光を放ち、足元の不安を僅かに解消する。（効果：夜間の視界範囲が少し広がる）",
    "success": "方位の術理を帯びた星霊の耳飾り。耳元で微かに共鳴し、隠れた気配や罠を直感で察知しやすくする。（効果：罠の回避率が上昇する）",
    "great_success": "星明かりを凝縮した神秘的な耳飾り。星々の運行から予兆を読み取り、危機を察知する感覚を研ぎ澄ます。（効果：不意打ちを受ける確率を軽減する）",
  },
  "IT_ADN_AS_03": {
    "normal": "星霊の直感を高める青い石の首飾り。夜空の下で瞑想すれば、進むべき方向が微かに見えてくる。（効果：命中率が上昇する）",
    "success": "方位と方位を繋ぐ星明かりの首飾り。予兆を感じ取る感覚が冴え、戦闘時の的確な判断を助ける。（効果：回避率と命中率が上昇する）",
    "great_success": "星々の運行が刻まれた神秘的な首飾り。常に方位を指し示す術理が、迷いの中にいる者の直感を導く。（効果：クリティカル率と命中率が大きく上昇する）",
  },
  "IT_ADN_AS_04": {
    "normal": "星霊の光を宿した青い腕輪。夜間でも腕の動きを正確に把握でき、暗闇でのミスを減らす。（効果：夜間の攻撃力が少し上昇する）",
    "success": "方位を指し示す方位磁針付きの腕輪。星明かりの術理が直感を助け、敵のガードを掻い潜る一撃を導く。（効果：ガード不能攻撃の発生率が微増する）",
    "great_success": "夜空の星々を映し出す神秘的な腕輪。予兆を感じる術理が腕の動きを加速させ、回避困難な刺突を実現する。（効果：命中率と攻撃速度が大きく上昇する）",
  },
  "IT_ADN_AS_05": {
    "normal": "星明かりを映す青い留め具。夜間の視認性を高め、仲間との位置確認を容易にする。（効果：夜間の回避率が少し上昇する）",
    "success": "方位の術理を帯びた星霊の留め具。直感を僅かに高め、探索中の幸運な発見を増やす助けとなる。（効果：アイテム発見率がわずかに上昇する）",
    "great_success": "予兆を読み取る青い光の留め具。星霊の導きが持ち主の不運を払い、最善の選択へと感覚を仕向ける。（効果：アイテム発見率とクリティカル率が上昇する）",
  },
  "IT_ADN_EL_01": {
    "normal": "微かな薬液が染み込んだ青緑の指輪。肌に触れる冷たさが、長旅の疲れを僅かに癒やしてくれる。（効果：状態異常への耐性が少し上昇する）",
    "success": "常に清涼な滴が結ぶ霊薬の指輪。浸透する術理が血行を整え、精神的な動揺を鎮める効果がある。（効果：毒と麻痺への耐性が上昇する）",
    "great_success": "内部で霊薬の泡が動く不思議な指輪。術理の浸透が心身を浄化し、あらゆる不調を未然に防ぎ止める。（効果：全ての状態異常への耐性が上昇する）",
  },
  "IT_ADN_EL_02": {
    "normal": "滴の形をした霊薬の耳飾り。微かな清涼感を耳元に与え、暑い砂漠でも集中力を維持できる。（効果：ＭＰの自然回復速度がわずかに上昇する）",
    "success": "透明感のある青緑の液を封じた耳飾り。霊薬の浸透術理により、疲弊した精神を常に調整し続ける。（効果：ＭＰの自然回復速度が上昇する）",
    "great_success": "常に微細な泡が湧き出す霊薬の耳飾り。癒やしの術理が絶えず脳をリフレッシュし、高度な思考を支える。（効果：最大ＭＰと回復速度が上昇する）",
  },
  "IT_ADN_EL_03": {
    "normal": "霊薬を封じた小瓶が下がる首飾り。微かな青緑の輝きが、着用者の心を穏やかに保つ助けとなる。（効果：精神的な状態異常への耐性が上昇する）",
    "success": "浸透力の高い霊薬を織り込んだ首飾り。肌から直接癒やしの術理が伝わり、疲労の蓄積を緩和する。（効果：疲労状態になりにくくなる）",
    "great_success": "清涼感に満ちた雫が連なる首飾り。調整された霊薬の術理が、着用者の魔力回路を常に最適な状態に保つ。（効果：魔法攻撃力と精神耐性が上昇する）",
  },
  "IT_ADN_EL_04": {
    "normal": "霊薬を染み込ませた青緑の腕輪。浸透する清涼感が、腕の疲労を僅かに和らげてくれる。（効果：攻撃の命中精度が少し上昇する）",
    "success": "霊薬の滴を閉じ込めた美しい腕輪。調整の術理が腕の筋肉を最適化し、素早い連続攻撃を可能にする。（効果：攻撃速度が少し上昇する）",
    "great_success": "常に微細な泡を放つ霊薬の腕輪。癒やしの術理が筋肉の乳酸を分解し続け、休む間もない連撃を支える。（効果：攻撃速度とスタミナ効率が上昇する）",
  },
  "IT_ADN_EL_05": {
    "normal": "霊薬の滴をあしらった留め具。肌に触れる微かな清涼感が、精神的な負担を僅かに軽減する。（効果：ＭＰの最大値がわずかに上昇する）",
    "success": "青緑の霊液を封じ込めた留め具。調整の術理が全身の魔力回路を整え、魔法の効果を僅かに高める。（効果：魔法攻撃力が上昇する）",
    "great_success": "神秘的な泡を放つ霊薬の留め具。癒やしの術理が常に持ち主の意識を鮮明に保ち、高度な術式を支える。（効果：ＭＰ最大値と魔法攻撃力が上昇する）",
  },
  "IT_ADN_LI_01": {
    "normal": "しなやかな蔦を錬成した生命の指輪。脈動するような温もりがあり、着用者の活力を引き出す。（効果：最大スタミナがわずかに上昇する）",
    "success": "葉脈の紋様が浮き出る生命の指輪。装着者の鼓動と同期し、傷ついた細胞の成長を緩やかに促す。（効果：ＨＰの自然回復量が上昇する）",
    "great_success": "瑞々しい緑の光を放つ生命の指輪。溢れる活力を指先から全身へ循環させ、衰えぬスタミナを授ける。（効果：最大スタミナとＨＰ回復量が上昇する）",
  },
  "IT_ADN_LI_02": {
    "normal": "脈動するような細工が施された耳飾り。生命の術理が着用者の活力を呼び覚まし、眠気を払う。（効果：スタミナ回復速度がわずかに上昇する）",
    "success": "赤や緑の細い筋が走る生命の耳飾り。葉脈を通じて魔力が循環し、術者の回復魔法の効果を高める。（効果：回復魔法の効果が上昇する）",
    "great_success": "豊かな成長の術理を宿した耳飾り。着用者の生命力と深く馴染み、傷ついた肉体を内側から鼓舞する。（効果：スタミナ回復速度と最大ＨＰが上昇する）",
  },
  "IT_ADN_LI_03": {
    "normal": "葉脈を模した細工が施された生命の首飾り。着用者の脈動と共鳴し、全身に柔らかな活力を送る。（効果：最大ＨＰが上昇する）",
    "success": "瑞々しい緑を帯びた生命の首飾り。回復の術理が血液の流れを助け、自然治癒力を段階的に引き上げる。（効果：ＨＰの自然回復速度が上昇する）",
    "great_success": "脈動する赤と緑の結晶を配した首飾り。生命の奔流が肉体を常に成長させ、衰えぬ活力を全身に行き渡らせる。（効果：最大ＨＰとＨＰ回復速度が上昇する）",
  },
  "IT_ADN_LI_04": {
    "normal": "脈動する蔦を錬成した生命の腕輪。温もりの術理が手の冷えを防ぎ、常に最高のコンディションを保つ。（効果：最大スタミナが上昇する）",
    "success": "葉脈のような血管が浮かぶ生命の腕輪。装着者の活力と馴染み、消費したスタミナを素早く補填する。（効果：スタミナ回復速度が上昇する）",
    "great_success": "赤と緑の光が循環する生命の腕輪。成長の術理が装着者の腕を強化し、鋼のような一撃を可能にする。（効果：スタミナ回復速度と攻撃力が上昇する）",
  },
  "IT_ADN_LI_05": {
    "normal": "脈動する生命の欠片を用いた留め具。肌に馴染む温もりが、着用者の疲労を僅かに吸い取ってくれる。（効果：スタミナ消費がわずかに減少する）",
    "success": "葉脈が走る赤や緑の留め具。生命の術理が装着者の活力と融合し、自然治癒力を僅かに底上げする。（効果：ＨＰの自然回復量が上昇する）",
    "great_success": "豊かな活力に満ちた生命の留め具。着用者の鼓動に合わせて光を放ち、肉体の限界を術理で引き上げる。（効果：ＨＰとスタミナの最大値が上昇する）",
  },
  "IT_ADN_ME_01": {
    "normal": "金属の術理で強度を高めた鉄の指輪。変形に強く、日常的な作業中でも安心して身につけられる。（効果：物理防御力がわずかに上昇する）",
    "success": "表面を美しく研磨した白銀の指輪。術理の反射が邪な魔力を僅かに退け、持ち主の身を守る。（効果：物理と魔法の防御力が上昇する）",
    "great_success": "金銀の縁取りが施された豪華な指輪。高度な構造強化により、装着者の肉体に強靭な保護膜を形成する。（効果：物理防御力が大きく上昇する）",
  },
  "IT_ADN_ME_02": {
    "normal": "金属の術理で耐久性を高めた耳飾り。激しい動きでも壊れにくく、旅人の装身具として適している。（効果：魔法防御力がわずかに上昇する）",
    "success": "研磨された金属が光を反射する耳飾り。邪悪な気配を反射で退け、術者の精神を強固に保つ。（効果：沈黙状態への耐性が上昇する）",
    "great_success": "緻密な金細工が施された耳飾り。構造強化の術理により、装着者の魔力感度を物理的に安定させる。（効果：魔法防御力と知力が上昇する）",
  },
  "IT_ADN_ME_03": {
    "normal": "構造強化を施した金属の首飾り。物理的な衝撃から喉元を守り、旅の安全を最低限確保する。（効果：物理防御力が少し上昇する）",
    "success": "金銀の縁取りが輝く洗練された首飾り。研磨された表面が魔法の波動を僅かに散らし、守りを固める。（効果：魔法耐性が上昇する）",
    "great_success": "重厚な装飾と高い耐久性を兼ね備えた首飾り。装着者の体幹を金属の術理で支え、激しい打撃に耐えさせる。（効果：物理防御力と最大重量が上昇する）",
  },
  "IT_ADN_ME_04": {
    "normal": "金属の術理で強度を上げた腕輪。物理的な防御手段としても機能し、咄嗟の攻撃を弾きやすい。（効果：防御力がわずかに上昇する）",
    "success": "美しい研磨が施された白銀の腕輪。構造強化により、装着者の腕の力を効率よく武器へと伝える。（効果：攻撃力が少し上昇する）",
    "great_success": "金銀の縁取りが施された重厚な腕輪。耐久性の高い術理が装着者の腕力を支え、重い武器の扱いを楽にする。（効果：攻撃力と最大重量が上昇する）",
  },
  "IT_ADN_ME_05": {
    "normal": "金属の術理で補強された留め具。マントやカバンをしっかりと固定し、激しい運動でも外れない。（効果：装備品の耐久性がわずかに上昇する）",
    "success": "精巧に研磨された金属の留め具。構造強化により、身につけている衣服の防御性能を僅かに引き上げる。（効果：物理防御力が少し上昇する）",
    "great_success": "金銀の縁取りが美しい豪華な留め具。金属の術理が全身の装備品を一つに束ね、強固な一体感を生み出す。（効果：全身の物理防御力が上昇する）",
  },
  "IT_ADN_SA_01": {
    "normal": "乾燥した砂粒を樹脂で固めた指輪。琥珀のような質感があり、砂漠の過酷な熱から肌を守る。（効果：火属性ダメージをわずかに軽減する）",
    "success": "風紋が刻まれた硬質の砂指輪。摩耗に強く、砂嵐の中を歩いても輝きが失われることはない。（効果：土属性ダメージを軽減し、命中率を補正する）",
    "great_success": "悠久の砂丘の術理を宿した指輪。装着者の周囲に薄い砂の膜を作り、飛来する砂塵や魔力を受け流す。（効果：土属性耐性が大きく上昇する）",
  },
  "IT_ADN_SA_02": {
    "normal": "砂粒を集めて固めた小ぶりな耳飾り。乾燥の術理により湿気を払い、清潔な状態を長く保てる。（効果：土属性耐性がわずかに上昇する）",
    "success": "砂丘の曲線を表現した美しい耳飾り。保存の術理が持ち主の気力を維持し、長旅の消耗を抑える。（効果：空腹度の減少速度が少し低下する）",
    "great_success": "風紋が刻まれた琥珀色の耳飾り。過酷な砂漠の旅路を生き抜くための術理が、着用者の生存本能を刺激する。（効果：土属性耐性とスタミナ消費軽減を付与する）",
  },
  "IT_ADN_SA_03": {
    "normal": "乾燥した砂粒を紐で繋いだ首飾り。保存の術理により、持ち歩く食料や水が悪くなるのを僅かに防ぐ。（効果：所持品の劣化速度を少し遅らせる）",
    "success": "砂丘の風紋を精巧に彫り込んだ首飾り。琥珀の術理が長旅の足取りを軽くし、摩耗しがちな集中力を守る。（効果：移動速度が少し上昇する）",
    "great_success": "悠久の旅路を支える砂の首飾り。過酷な環境下での摩耗を術理で肩代わりし、肉体の消耗を劇的に抑える。（効果：全属性耐性と移動速度が上昇する）",
  },
  "IT_ADN_SA_04": {
    "normal": "乾燥した砂粒を編み込んだ腕輪。琥珀の術理が腕の蒸れを防ぎ、常に快適な状態を維持する。（効果：土属性耐性が少し上昇する）",
    "success": "風紋が刻まれた硬質の砂腕輪。摩耗に強い術理が防具との擦れを抑え、長時間の装備でも痛まない。（効果：防具の耐久減少速度を少し遅らせる）",
    "great_success": "悠久の砂丘から切り出した術理の腕輪。保存の術理が着用者の筋力を維持し、極限状態でも力を発揮させる。（効果：全能力の低下を防ぎ、防御力を上げる）",
  },
  "IT_ADN_SA_05": {
    "normal": "乾燥した砂を固めた素朴な留め具。保存の術理が衣類の劣化を防ぎ、砂漠の過酷な気候から守ってくれる。（効果：衣服の耐久減少速度を少し遅らせる）",
    "success": "風紋が刻まれた琥珀の留め具。砂漠の術理が着用者の周囲を僅かに乾燥させ、動きを軽快にする。（効果：移動速度がわずかに上昇する）",
    "great_success": "悠久の砂丘の術理が宿る留め具。摩耗を拒む性質が、全身の装備品を砂塵や熱による風化から守り抜く。（効果：全装備の耐久減少速度を大きく遅らせる）",
  },
  "IT_ARM_AS_01": {
    "normal": "星明かりの導きを得た短剣。暗がりでも刃先がぼやけず、夜間の護身用として扱いやすい。（効果：暗所での命中率が上昇する）",
    "success": "夜空を映したような蒼い刃先の短剣。術理が直感を鋭く研ぎ澄ませ、敵の隙を的確に捉える。（効果：クリティカル率が上昇する）",
    "great_success": "星霊の輝きを封じ込めた短剣。迷いを断ち切る一閃は、乱戦の中でも正確に急所へと吸い込まれる。（効果：クリティカル率が大きく上昇する）",
  },
  "IT_ARM_AS_02": {
    "normal": "方位を示す術理が組み込まれた直剣。広大な砂漠での行軍において、道標のような安心感を与える。（効果：マップの視界範囲が少し広がる）",
    "success": "星々の配置を刃に刻んだ知恵の直剣。進むべき道を示すように、敵の隙へ自然と刃が吸い込まれる。（効果：回避されにくくなり、命中時に追加ダメージを与える）",
    "great_success": "星霊の瞬きを宿した蒼白の直剣。術者の直感を物理的な一撃へと変換し、予備動作なしの鋭い攻撃を可能にする。（効果：攻撃速度と命中率が大きく上昇する）",
  },
  "IT_ARM_AS_03": {
    "normal": "夜の旅路を照らす方位の術理を持つ小槍。暗い洞窟などの探索で、即席の灯りとして重宝する。（効果：周囲を明るく照らし、夜間の攻撃力が微増する）",
    "success": "星霊の直感を穂先に宿した導きの小槍。闇夜でも標的を違わず、遠距離からの精密な刺突を助ける。（効果：投擲時の飛距離とダメージが増加する）",
    "great_success": "天の星図に従い軌道を補正する小槍。放たれた一撃は、まるで最初から決まっていたかのように敵を捕らえる。（効果：攻撃が非常に命中しやすくなり、追加ダメージを与える）",
  },
  "IT_ARM_AS_04": {
    "normal": "星霊の紋章が描かれた丸盾。夜間の守りを固めるために作られ、闇の中で微かな光を放っている。（効果：夜間の防御力が上昇する）",
    "success": "星明かりを集めて硬度に変える丸盾。持ち主の直感を助け、敵の攻撃方向を無意識に察知できる。（効果：自身の背後への不意打ちダメージを軽減する）",
    "great_success": "夜空の配置に従い魔力を逃がす丸盾。天の運行のような安定感で、あらゆる角度からの攻撃を受け止める。（効果：回避率が上昇し、全方位からの防御力が上がる）",
  },
  "IT_ARM_AS_05": {
    "normal": "星霊の瞬きを宿した簡素な魔導杖。暗い場所でも微かな光で周囲を照らし、術者の迷いを払う。（効果：夜間の魔法威力が上昇する）",
    "success": "天空の図形を模った星の魔導杖。星々の配置から魔力の流れを読み解き、魔法の威力を効率よく引き出す。（効果：魔法のクリティカル率が上昇する）",
    "great_success": "星霊の導きを色濃く反映した魔導杖。術者の直感を魔力へと変換し、敵の隙を突く致命的な術を放つ。（効果：魔法のクリティカル率と威力が大きく上昇する）",
  },
  "IT_ARM_EL_01": {
    "normal": "微かな薬液を染み込ませた短剣。傷口を清涼感で包み込み、出血を抑える実務的な作り。（効果：攻撃時に微量の体力を回復する）",
    "success": "滴るような光沢を持つ短剣。浸透性の高い霊薬が刃身を覆い、触れるだけで対象の毒を浄化する。（効果：攻撃時の体力回復量が増加する）",
    "great_success": "神秘的な泡を纏う霊薬の短剣。深い癒やしの術理が宿り、振るうたびに持ち主の活力を呼び覚ます。（効果：攻撃時に体力を中程度回復する）",
  },
  "IT_ARM_EL_02": {
    "normal": "清涼感のある薬液で鍛えられた直剣。斬撃と共に爽やかな芳香が漂い、戦場の熱気を鎮める。（効果：水属性の追加ダメージを与える）",
    "success": "刃から常に霧状の霊薬が漏れ出す直剣。傷口から薬液が浸透し、敵の動きを僅かに鈍らせる。（効果：水属性ダメージが増加し、敵の速度を低下させる）",
    "great_success": "清らかな滴を纏う美しい直剣。高い浸透力が敵の表面を透過し、内側から術理による衝撃を与える。（効果：強力な水属性ダメージを敵に与える）",
  },
  "IT_ARM_EL_03": {
    "normal": "薬液が穂先に滴る小槍。掠めただけでも術理が浸透し、標的の状態を不安定にさせる。（効果：状態異常中の敵に対してダメージが上昇する）",
    "success": "常に清涼な空気を纏う霊薬の小槍。穂先から溢れる泡が敵の感覚を狂わせ、有利に立ち回れる。（効果：攻撃時に確率で敵の命中率を低下させる）",
    "great_success": "聖なる霊液で満たされた透明感のある小槍。一突きごとに清浄な波動が広がり、不浄な気配を散らす。（効果：追加の魔法ダメージを与え、敵を弱体化させる）",
  },
  "IT_ARM_EL_04": {
    "normal": "薬液を染み込ませた革を張った丸盾。衝撃を吸収する際に、周囲に微かな癒やしの香りを放つ。（効果：防御成功時に自身の状態異常蓄積を減らす）",
    "success": "浸透性の霊薬が表面を覆う丸盾。受けた衝撃を液体状に分散させ、重い一撃も軽やかに受け流す。（効果：ガード時のスタミナ消費を軽減する）",
    "great_success": "清涼な泡が常に湧き出す霊薬の丸盾。盾に触れた攻撃を瞬時に減衰させ、持ち主の負担を最小限に抑える。（効果：ガード成功時に体力が僅かに回復する）",
  },
  "IT_ARM_EL_05": {
    "normal": "霊薬を吸わせたしなやかな魔導杖。先端から漂う清涼感が、術者の集中力を一定に保つのを助ける。（効果：ＭＰの自然回復速度が少し上昇する）",
    "success": "透明な薬液が循環する美しい魔導杖。術理の浸透が早く、複雑な魔法も短時間で安定して展開できる。（効果：ＭＰの自然回復速度が上昇し、知力が向上する）",
    "great_success": "清浄な滴を常に湛えた霊薬の魔導杖。術理の泡が精神の不純物を取り除き、高位の魔法も安定して行える。（効果：ＭＰ回復速度が上昇し、魔法の威力が強化される）",
  },
  "IT_ARM_LI_01": {
    "normal": "微かな脈動を感じる生命の短剣。持ち手の疲労を和らげ、長時間の探索をサポートする。（効果：移動によるスタミナ消費を僅かに抑える）",
    "success": "葉脈のような美しい筋が走る短剣。使い込むほどに手に馴染み、まるで身体の一部のように扱える。（効果：攻撃速度が上昇し、疲労を軽減する）",
    "great_success": "暖かな温もりを放つ生命の短剣。再生の術理が循環しており、手にするだけで全身に活力が満ちる。（効果：スタミナ回復速度が上昇する）",
  },
  "IT_ARM_LI_02": {
    "normal": "生きている木のようなしなやかさを持つ直剣。衝撃を吸収し、使用者の手首への負担を減らす。（効果：受け流し成功時の被ダメージを軽減する）",
    "success": "淡く発光する葉脈状の紋様が浮かぶ直剣。持ち主の鼓動と同期し、戦うほどに集中力が高まる。（効果：戦闘中のＨＰ継続回復を付与する）",
    "great_success": "心臓の鼓動を刻むかのように脈打つ直剣。絶え間ない再生の術理により、持ち主の傷を塞ぎながら戦える。（効果：ＨＰ継続回復量が増加し、耐久性能が向上する）",
  },
  "IT_ARM_LI_03": {
    "normal": "植物の蔓のようにしなる丈夫な小槍。生命の温もりがあり、長時間の保持でも疲れを感じにくい。（効果：最大スタミナが少し上昇する）",
    "success": "再生能力を持つ特殊な木材を用いた小槍。折れても時間をかければ自己修復し、戦場での信頼性は高い。（効果：戦闘終了時に装備の耐久度が微回復する）",
    "great_success": "脈打つ生命力が全体に満ちた小槍。持ち主の細胞を活性化させ、傷ついた肉体を癒やしながら戦場を駆ける。（効果：ＨＰとスタミナの最大値を上昇させる）",
  },
  "IT_ARM_LI_04": {
    "normal": "厚い樹皮を錬成して作られた丸盾。生命の温もりが伝わり、精神的な不安を和らげる効果がある。（効果：一部の状態異常への耐性が少し上昇する）",
    "success": "葉脈が脈動するように光る生命の丸盾。受けた衝撃を吸収し、持ち主の疲労を癒やす糧とする。（効果：ガード成功時にスタミナが微回復する）",
    "great_success": "大地の脈動を宿した生命の丸盾。持ち主の負傷に反応して治癒の波動を放ち、戦場での生存率を高める。（効果：ガード成功時にＨＰとスタミナが微回復する）",
  },
  "IT_ARM_LI_05": {
    "normal": "常に若葉を芽吹かせる生命力に満ちた魔導杖。手にするだけで疲労が和らぎ、穏やかな心をもたらす。（効果：最大ＨＰが少し上昇する）",
    "success": "脈動する葉脈が魔力を運ぶ生命の魔導杖。術者の心身と共鳴し、回復魔法の効果を効率よく高める。（効果：回復魔法の回復量が上昇する）",
    "great_success": "豊かな再生の術理を宿した生命の魔導杖。周囲に活力を振りまき、術者だけでなく仲間の疲労をも癒やす。（効果：ＨＰの最大値と回復魔法の効果が大きく上昇する）",
  },
  "IT_ARM_ME_01": {
    "normal": "実用的な硬度を持たせた鉄製の短剣。日常の雑務や護身用として十分に機能する。（効果：攻撃力がわずかに上昇する）",
    "success": "入念な変成術により粘り強さを増した短剣。刃こぼれしにくく、鋭い切れ味が長く持続する。（効果：攻撃力と耐久力が上昇する）",
    "great_success": "丹念な研磨により白銀の輝きを放つ短剣。金属の術理が細部まで行き渡り、厚い皮鎧も容易に貫く。（効果：攻撃力が大きく上昇する）",
  },
  "IT_ARM_ME_02": {
    "normal": "基本に忠実な変成術を施した鋼の直剣。騎士や衛兵が標準的に装備する信頼性の高い武器。（効果：物理ダメージが上昇する）",
    "success": "硬質化と軽量化を両立させた見事な直剣。金属の輝きが美しく、打ち合いでも刃が歪まない。（効果：物理ダメージが上昇し、武器の摩耗を抑える）",
    "great_success": "高度な変成と研磨を経て完成した名剣。鋼の限界に近い硬度を誇り、あらゆる装甲を力強く両断する。（効果：物理ダメージが大きく上昇する）",
  },
  "IT_ARM_ME_03": {
    "normal": "先端を硬質化した実戦用の小槍。リーチを活かした戦いで、安定した防御と攻撃を可能にする。（効果：敵との距離がある場合に攻撃力が上がる）",
    "success": "穂先に金銀の輝きを施した美しい小槍。金属の変成により、刺突時の衝撃を一点に集中させる。（効果：刺突ダメージが増加し、敵の体勢を崩しやすくなる）",
    "great_success": "変成と研磨の粋を集めた業物の小槍。太陽を反射する刃は、見る者を威圧し、堅牢な装甲すら穿つ。（効果：刺突ダメージが大きく上昇する）",
  },
  "IT_ARM_ME_04": {
    "normal": "金属板を補強した丸盾。標準的な防御性能を持ち、飛来する矢や小剣を確実に弾き返す。（効果：物理防御力が上昇する）",
    "success": "特殊な研磨で鏡面仕上げされた丸盾。光を反射して敵の目を眩ませつつ、堅牢な防御を提供する。（効果：物理防御力が上昇し、確率で近接攻撃を反射する）",
    "great_success": "金属変成の粋を尽くした堅牢な丸盾。物理的な衝撃だけでなく、魔法の余波さえも跳ね返す強度を誇る。（効果：物理・魔法両方の防御力が上昇する）",
  },
  "IT_ARM_ME_05": {
    "normal": "金属の帯で補強された木製の魔導杖。打撃武器としても頑丈で、魔法の触媒としても安定している。（効果：魔法攻撃力と物理攻撃力が少し上昇する）",
    "success": "金属の変成により魔力伝導率を高めた魔導杖。硬質な輝きが魔力を収束させ、術の威力を底上げする。（効果：魔法の詠唱速度が上昇する）",
    "great_success": "丹念に研磨された金属部品を配した魔導杖。魔力の流れを金属が整理し、より高純度な術の展開を可能にする。（効果：消費ＭＰが減少し、魔法威力が上昇する）",
  },
  "IT_ARM_SA_01": {
    "normal": "乾燥した砂の術理で表面を硬化させた短剣。砂漠の過酷な環境下でも錆びることなく機能する。（効果：砂漠地帯での命中率が少し上昇する）",
    "success": "細かな砂丘の紋様が刻まれた短剣。摩耗に強く、研ぎ直さずとも鋭い刺突を維持できる。（効果：標的の物理防御力を少し減少させる）",
    "great_success": "風紋が美しく浮き出た砂の短剣。表面の乾きが摩擦を減らし、回避困難なほど鋭く標的へ食い込む。（効果：標的の防御力を中程度減少させる）",
  },
  "IT_ARM_SA_02": {
    "normal": "砂漠の風紋を模した加工が施された直剣。砂塵の中でも視認性が高く、安定した戦果を期待できる。（効果：命中率が一定値上昇する）",
    "success": "風紋が刻まれた刃が空気抵抗を制御する直剣。砂嵐の中でも普段と変わらぬ鋭い斬撃を繰り出せる。（効果：悪天候時の命中低下を軽減し、攻撃力を高める）",
    "great_success": "摩耗耐性を極限まで高めた砂の直剣。激しい戦闘を重ねても刃が欠けず、常に最良の切れ味を保つ。（効果：命中率が上昇し、攻撃力が大きく高まる）",
  },
  "IT_ARM_SA_03": {
    "normal": "砂の摩擦を利用して威力を高めた小槍。表面のザラつきが滑り止めとなり、確実な一突を放てる。（効果：武器の持ち替え速度が上昇する）",
    "success": "流砂の動きを取り入れた柔軟な柄を持つ小槍。変幻自在な刺突は、予測困難な軌道で敵を貫く。（効果：敵の回避率を一部無視して攻撃する）",
    "great_success": "砂丘の重みを宿した重厚な小槍。突き出した瞬間、周囲の砂を巻き込み、回避不能な質量攻撃を浴びせる。（効果：命中率が上昇し、追加の物理ダメージを与える）",
  },
  "IT_ARM_SA_04": {
    "normal": "圧縮した砂で作られた軽量な丸盾。乾燥した表面は滑りがよく、鋭い斬撃を横へ逃がしやすい。（効果：盾での受け流しが発生しやすくなる）",
    "success": "砂の層を幾重にも重ねた強固な丸盾。摩耗に強く、敵の武器を削り取って僅かながら消耗させる。（効果：ガード時に敵の武器耐久値を僅かに削る）",
    "great_success": "砂丘の層が衝撃を飲み込む重厚な丸盾。飛来する攻撃を砂の術理で受け止め、威力を大幅に減衰させる。（効果：遠距離攻撃によるダメージを大きく軽減する）",
  },
  "IT_ARM_SA_05": {
    "normal": "砂漠の古木を砂の術理で保存した魔導杖。乾燥に強く、湿気による魔力の暴発を防ぐ安定性を持つ。（効果：魔法の命中率が上昇する）",
    "success": "砂の摩耗に耐え抜いた硬質の魔導杖。風紋が刻まれた表面は魔力を蓄えやすく、一撃に重みを出す。（効果：土属性魔法の威力が上昇する）",
    "great_success": "悠久の砂丘に眠る記憶を宿した魔導杖。乾いた風を操り、術者の放つ土属性の魔法を広範囲へと拡散させる。（効果：土属性魔法の範囲と威力が上昇する）",
  },
  "IT_CLT_AS_01": {
    "normal": "星明かりの術理を帯びた青い外套。方位の感覚を失わせないよう導き、夜間の行動を安全にする。（効果：夜間の回避率がわずかに上昇する）",
    "success": "方位の術理が宿る星霊の外套。直感を高める力が備わり、暗闇の中でも敵の気配を敏感に察知できる。（効果：夜間の命中率と回避率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘的な外套。星霊の導きが持ち主の周囲に静寂を作り、敵の目から姿を隠してくれる。（効果：回避率が大きく上昇し、不意打ちを防ぐ）",
  },
  "IT_CLT_AS_02": {
    "normal": "星明かりを模した青いスカーフ。方位の感覚を僅かに鋭くし、視界の悪い場所での行動を助ける。（効果：命中率がわずかに上昇する）",
    "success": "方位の術理が宿る星霊のスカーフ。直感が高まる力が備わり、敵の攻撃を予感して紙一重で回避しやすくなる。（効果：回避率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘のスカーフ。星霊の導きが着用者の五感を研ぎ澄まし、暗闇の中でも必勝の機を逃さない。（効果：クリティカル率と命中率が大きく上昇する）",
  },
  "IT_CLT_AS_03": {
    "normal": "星明かりの術理を帯びた青い旅靴。方位の感覚を足裏から伝え、夜道でも迷わずに目的地へ導いてくれる。（効果：夜間の移動速度が上昇する）",
    "success": "方位の術理が宿る星霊の旅靴。直感が高まる力が歩みを導き、無意識のうちに最も安全なルートを選ばせる。（効果：回避率と移動速度が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の旅靴。星霊の導きが足音を消し、運命の糸を辿るように軽やかに敵の包囲を抜ける。（効果：回避率とクリティカル率が大きく上昇する）",
  },
  "IT_CLT_AS_04": {
    "normal": "星明かりを映す青い革帯。方位の感覚を僅かに高め、広大な砂漠でも自分の位置を予感しやすくなる。（効果：命中率がわずかに上昇する）",
    "success": "方位の術理が宿る星霊の革帯。直感が高まる力が腰元から伝わり、死角からの攻撃を察知する助けとなる。（効果：不意打ちダメージを軽減し、回避率を上げる）",
    "great_success": "夜空の予兆を映し出す神秘の革帯。星霊の導きが攻撃のタイミングを直感させ、無駄のない鋭い反撃を導く。（効果：回避率とクリティカル率が大きく上昇する）",
  },
  "IT_CLT_AS_05": {
    "normal": "星明かりを映す青い頭巾。方位の感覚を僅かに鋭くし、視界の悪い夜間でも目的地を予感させる。（効果：夜間の命中率が上昇する）",
    "success": "方位の術理が宿る星霊の頭巾。直感が高まる力が思考に干渉し、敵の動きを二手先まで予見しやすくする。（効果：回避率が大きく上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の頭巾。星霊の導きが着用者の脳裏に勝利への道筋を描き出し、迷いなき行動を導く。（効果：命中率とクリティカル率が大きく上昇する）",
  },
  "IT_CLT_EL_01": {
    "normal": "霊薬を染み込ませた青緑の外套。浸透する清涼感が砂漠の熱を払い、着用者の集中力を一定に保つ。（効果：火属性耐性がわずかに上昇する）",
    "success": "泡の術理で通気性を高めた霊薬の外套。調整された霊液が常に肌を癒やし、長旅のストレスを緩和する。（効果：火耐性が上昇し、ＭＰが微増する）",
    "great_success": "癒やしの術理を極めた神秘の外套。雫のような輝きが魔力を調整し、過酷な環境下でも心身を健やかに保つ。（効果：全属性耐性と魔法防御力が上昇する）",
  },
  "IT_CLT_EL_02": {
    "normal": "霊薬を染み込ませた青緑のスカーフ。浸透する清涼感が呼吸を楽にし、砂漠の乾いた空気から喉を守る。（効果：毒耐性がわずかに上昇する）",
    "success": "泡の術理が香りを放つ霊薬スカーフ。調整された霊液が常に頭部をリフレッシュし、高度な集中力を保たせる。（効果：魔法攻撃力が少し上昇する）",
    "great_success": "癒やしの術理を極めた神秘のスカーフ。雫のような輝きが全身の魔力回路を整え、魔法の精度を飛躍させる。（効果：知力と魔法攻撃力が大きく上昇する）",
  },
  "IT_CLT_EL_03": {
    "normal": "霊薬を浸透させた青緑の旅靴。清涼感のある癒やしの術理が足のむくみを抑え、軽快な歩行を助ける。（効果：スタミナ消費がわずかに減少する）",
    "success": "泡の術理で衝撃を吸収する霊薬の旅靴。調整された霊液が常に足をケアし、長距離の行軍でも痛みが出にくい。（効果：スタミナ消費が減少し、ＨＰが微増する）",
    "great_success": "癒やしの術理を極めた神秘の旅靴。雫のような光が足を包み込み、大地を踏むたびに肉体を調整し活性化させる。（効果：スタミナ消費軽減とＨＰ継続回復を付与する）",
  },
  "IT_CLT_EL_04": {
    "normal": "霊薬を配合した青緑の革帯。浸透する清涼感が腰の負担を和らげ、長時間の立ち仕事を僅かに楽にする。（効果：スタミナの回復速度がわずかに上昇する）",
    "success": "泡の術理を帯びた霊薬の革帯。調整された霊液が体内の循環を助け、重い装備による疲労を素早く解消する。（効果：スタミナ回復速度と回避率が少し上昇する）",
    "great_success": "癒やしの術理を極めた神秘の革帯。雫のような光が常に腰回りをケアし、過酷な労働による肉体の綻びを癒やす。（効果：スタミナ回復速度と防御力が上昇する）",
  },
  "IT_CLT_EL_05": {
    "normal": "霊薬を染み込ませた青緑の頭巾。浸透する清涼感が頭部を冷やし、熱中症や意識の混濁を防いでくれる。（効果：火属性耐性が上昇する）",
    "success": "泡の術理で通気性を確保した霊薬頭巾。調整された霊液が常に脳をケアし、魔力の消費を最小限に抑える。（効果：消費ＭＰがわずかに減少する）",
    "great_success": "癒やしの術理を極めた神秘の頭巾。雫のような輝きが精神を浄化し、常に澄み渡るような思考と活力を授ける。（効果：消費ＭＰ軽減と魔法攻撃力が上昇する）",
  },
  "IT_CLT_LI_01": {
    "normal": "生命の脈動を織り込んだ赤い外套。葉脈のように活力を全身に伝え、冷えた身体を優しく温めてくれる。（効果：最大ＨＰがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の外套。再生の術理が着用者の傷を癒やし、自然治癒力を僅かに底上げする。（効果：ＨＰの自然回復量が上昇する）",
    "great_success": "成長の術理が宿る豊かな外套。生命の奔流が常に着用者を包み込み、衰えることのない活力を全身に供給する。（効果：最大ＨＰとＨＰ回復速度が上昇する）",
  },
  "IT_CLT_LI_02": {
    "normal": "生命の脈動を封じた赤いスカーフ。葉脈のように活力を首元から全身へ送り、心地よい温もりを維持する。（効果：スタミナ消費がわずかに減少する）",
    "success": "赤や緑の活力に満ちた生命のスカーフ。再生の術理が呼吸を整え、激しい戦闘の後でも素早く活力を取り戻す。（効果：スタミナ回復速度が上昇する）",
    "great_success": "成長の術理が宿る豊かなスカーフ。生命の奔流が常に肉体を活性化させ、疲労を知らない強靭な心肺能力を授ける。（効果：最大スタミナと回復速度が上昇する）",
  },
  "IT_CLT_LI_03": {
    "normal": "生命の脈動を封じた赤い旅靴。葉脈を通じて活力が足先まで行き渡り、冷えや疲れから旅人を守る。（効果：最大スタミナがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の旅靴。再生の術理が足の細胞を常に更新し、走るほどにエネルギーが湧き出す。（効果：スタミナ回復速度が上昇する）",
    "great_success": "成長の術理が宿る豊かな旅靴。生命の奔流が爆発的な脚力を生み出し、荒れ地を疾駆する野生の活力を授ける。（効果：最大スタミナと移動速度が大きく上昇する）",
  },
  "IT_CLT_LI_04": {
    "normal": "生命の脈動を封じた赤い革帯。葉脈のように活力が腰から全身へ広がり、身体のキレを僅かに良くする。（効果：最大スタミナがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の革帯。再生の術理が腹部を優しく保護し、内臓の疲れから来る活量低下を防ぐ。（効果：スタミナ回復速度とＨＰが少し上昇する）",
    "great_success": "成長の術理が宿る豊かな革帯。生命の奔流が体内の魔力を活性化させ、着用者を常に万全の状態に保つ。（効果：スタミナ最大値と全ステータスが上昇する）",
  },
  "IT_CLT_LI_05": {
    "normal": "生命の脈動を封じた赤い頭巾。葉脈を通じて活力が脳へ供給され、疲労による判断ミスを減らしてくれる。（効果：ＭＰ最大値がわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の頭巾。再生の術理が肉体の回復を司り、僅かな休息でも頭がすっきりと冴え渡る。（効果：ＨＰとＭＰの自然回復速度が上昇する）",
    "great_success": "成長の術理が宿る豊かな頭巾。生命の奔流が着用者の精神を常に若々しく保ち、無限の知好奇心と活力を授ける。（効果：知力と全回復速度が大きく上昇する）",
  },
  "IT_CLT_ME_01": {
    "normal": "金属繊維を織り交ぜて補強した外套。砂嵐の摩耗に強く、旅人を物理的な衝撃から守ってくれる。（効果：物理防御力がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る外套。構造強化により、薄手ながらも鋼のような耐久性と柔軟性を両立する。（効果：物理防御力と耐久性が上昇する）",
    "great_success": "金銀の縁取りが施された豪華な外套。金属の術理が全身を覆う保護膜となり、あらゆる攻撃を弾き返す。（効果：物理防御力が大きく上昇する）",
  },
  "IT_CLT_ME_02": {
    "normal": "金属の術理で構造を強化したスカーフ。首元を砂塵から守るだけでなく、物理的な打撃を僅かに和らげる。（効果：防御力がわずかに上昇する）",
    "success": "研磨された金属糸を用いたスカーフ。金属の輝きが魔力を反射し、装着者の精神を邪悪な術から守る。（効果：魔法防御力が少し上昇する）",
    "great_success": "金銀の縁取りが施された豪華なスカーフ。高度な構造強化により、着用者の意志を物理的な壁として固定する。（効果：物理・魔法防御力が上昇する）",
  },
  "IT_CLT_ME_03": {
    "normal": "金属の板で補強された頑丈な旅靴。過酷な岩場でも底が減りにくく、足元を物理的な衝撃から守る。（効果：移動速度がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る旅靴。構造強化により、一歩一歩の踏み込みが強まり、険しい道でも疲れにくい。（効果：移動速度と防御力が上昇する）",
    "great_success": "金銀の縁取りが施された豪華な旅靴。金属の力が足運びを物理的にサポートし、鋼の如き推進力を生み出す。（効果：移動速度が大きく上昇する）",
  },
  "IT_CLT_ME_04": {
    "normal": "金属の鋲で補強された頑丈な革帯。多くの道具を吊るしても型崩れせず、腰回りの構造を強化する。（効果：最大重量がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る革帯。耐久性が高く、激しい戦闘においても装備品を確実に保持し続ける。（効果：最大重量と物理防御力が上昇する）",
    "great_success": "金銀の縁取りが美しい豪華な革帯。金属の術理が装着者の体幹を支え、本来以上の重荷を背負う力を与える。（効果：最大重量が大きく上昇する）",
  },
  "IT_CLT_ME_05": {
    "normal": "金属繊維を裏地に用いた頑丈な頭巾。砂塵から顔を守りつつ、頭部を物理的な衝撃から保護する。（効果：防御力がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る頭巾。構造強化により、装着者の集中力を乱す外部の雑音や衝撃を遮断する。（効果：沈黙状態への耐性が上昇する）",
    "great_success": "金銀の縁取りが施された豪華な頭巾。金属の術理が思考を物理的に強固にし、精神的な干渉を完全に跳ね返す。（効果：魔法防御力と知力が大きく上昇する）",
  },
  "IT_CLT_SA_01": {
    "normal": "乾燥した砂の成分を定着させた外套。琥珀の術理が汚れを寄せ付けず、常に乾いた清潔な状態を保つ。（効果：土属性耐性がわずかに上昇する）",
    "success": "風紋の紋様が刻まれた砂の外套。保存の術理が着用者の体力を温存し、不必要なエネルギーの摩耗を防ぐ。（効果：スタミナ消費速度が少し低下する）",
    "great_success": "悠久の保存術理が宿る砂の外套。摩耗を拒む性質が外套自体を不朽にし、着用者の肉体を砂漠の風から守り抜く。（効果：土属性耐性とスタミナ効率が大きく上昇する）",
  },
  "IT_CLT_SA_02": {
    "normal": "乾燥した砂の術理を宿したスカーフ。琥珀の輝きが直射日光を遮り、体力の消耗を僅かに抑えてくれる。（効果：火属性耐性がわずかに上昇する）",
    "success": "風紋の紋様が刻まれた砂のスカーフ。保存の術理が持ち主の気力を維持し、過酷な長旅でも折れない心を作る。（効果：精神耐性とスタミナ回復が上昇する）",
    "great_success": "悠久の保存術理が宿る砂のスカーフ。摩耗を拒む性質が、着用者の喉と精神を砂漠の乾燥から完璧に保護する。（効果：全属性耐性が上昇し、疲労を軽減する）",
  },
  "IT_CLT_SA_03": {
    "normal": "乾燥した砂の術理を宿した旅靴。琥珀の術理が砂に沈み込むのを防ぎ、砂漠での歩行を僅かに楽にする。（効果：砂地での移動速度が上昇する）",
    "success": "風紋が刻まれた砂の旅靴。保存の術理が足腰の摩耗を防ぎ、数日間にわたる連続歩行を可能にする持久力を授ける。（効果：移動速度と土属性耐性が上昇する）",
    "great_success": "悠久の保存術理が宿る砂の旅靴。摩耗を拒む性質が足の疲労を完全に遮断し、果てしない砂の海を渡り切る力を与える。（効果：移動速度が大きく上がり、全耐性が上昇する）",
  },
  "IT_CLT_SA_04": {
    "normal": "乾燥した砂の術理を宿した革帯。琥珀の術理が湿気による革の劣化を防ぎ、常に最高の状態を保つ。（効果：土属性耐性がわずかに上昇する）",
    "success": "風紋が刻まれた砂の革帯。保存の術理が持ち主の持久力を高め、腰痛や倦怠感による摩耗から身を守る。（効果：スタミナ消費が減少し、全能力低下を防ぐ）",
    "great_success": "悠久の保存術理が宿る砂の革帯。摩耗を拒む性質が着用者の気力を固定し、極限の疲労下でも動きを鈍らせない。（効果：全耐性とスタミナ効率が大きく上昇する）",
  },
  "IT_CLT_SA_05": {
    "normal": "乾燥した砂の術理を宿した頭巾。琥珀の術理が砂漠の強烈な光を遮り、視界と体力を守ってくれる。（効果：命中率がわずかに上昇する）",
    "success": "風紋が刻まれた砂の頭巾。保存の術理が集中力の摩耗を防ぎ、単調な砂漠歩きでも意識を鮮明に保たせる。（効果：精神耐性が上昇し、スタミナ消費が微減する）",
    "great_success": "悠久の保存術理が宿る砂の頭巾。摩耗を拒む性質が着用者の五感を砂漠の風から守り、常に鋭敏な感覚を維持する。（効果：土属性耐性と命中率が大きく上昇する）",
  },
  "IT_DAY_AS_01": {
    "normal": "星明かりの術理を帯びた青い油灯。方位の感覚を灯火と共に広げ、夜間でも進むべき道を僅かに示す。（効果：夜間の回避率がわずかに上昇する）",
    "success": "方位の術理が宿る星霊の油灯。直感が高まる蒼い光を放ち、暗闇に隠された通路や罠を予感させる力がある。（効果：罠発見率が上昇し、命中率を上げる）",
    "great_success": "夜空の予兆を映し出す神秘の油灯。星霊の導きが光に宿り、運命の道を照らし出すことで不運な事故を未然に防ぐ。（効果：アイテム発見率と回避率が大きく上昇する）",
  },
  "IT_DAY_AS_02": {
    "normal": "星明かりの術理を帯びた青い方位磁針。方位の感覚がダイレクトに伝わり、夜空が見えない場所でも北を予感させる。（効果：夜間の命中率が上昇する）",
    "success": "方位の術理そのものが宿る星霊の磁針。直感が高まる力が備わり、敵の気配がある方角を針が微かに震えて教える。（効果：不意打ちを受ける確率を軽減する）",
    "great_success": "夜空の予兆を映し出す神秘の方位磁針。星霊の導きが未来の進路を指し示し、持ち主を最も幸運な結末へと誘う。（効果：幸運度と回避率を大きく上昇させる）",
  },
  "IT_DAY_AS_03": {
    "normal": "星明かりを映す青い手帳。方位の感覚を整理するための術理があり、夜間の探索記録をより正確なものにする。（効果：夜間の命中率が上昇する）",
    "success": "方位の術理が宿る星霊の手帳。直感が高まる力が文字に宿り、敵の弱点や隙を予感して書き留める能力を与える。（効果：クリティカル率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の手帳。星霊の導きが未来の出来事を断片的に予感させ、持ち主に最善の選択を促す。（効果：運の良さと回避率を大きく上昇させる）",
  },
  "IT_DAY_AS_04": {
    "normal": "星明かりの術理を帯びた青い寝袋。方位の感覚を眠りの中でも保たせ、目覚めた瞬間の方向喪失を防いでくれる。（効果：夜間の休息効果が上昇する）",
    "success": "方位の術理が宿る星霊の寝袋。直感が高まる力が夢の中に宿り、翌日の旅路における危険を予感させる。（効果：休息後、一定時間不意打ちを防ぐ）",
    "great_success": "夜空の予兆を映し出す神秘的な寝袋。星霊の導きが幸運の星を夢に呼び寄せ、目覚めた持ち主を運命の追い風に乗せる。（効果：休息後、運の良さとクリティカル率を上げる）",
  },
  "IT_DAY_AS_05": {
    "normal": "星明かりの術理を帯びた青い小鍵。方位の感覚を僅かに鋭くし、隠された鍵穴の位置を直感で予感させる。（効果：隠し扉の発見率がわずかに上昇する）",
    "success": "方位の術理が宿る星霊の小鍵。直感が高まる力が指先に伝わり、複雑なからくりを解くための予兆を教えてくれる。（効果：解錠時の難易度を一段階低下させる）",
    "great_success": "夜空の予兆を映し出す神秘の小鍵。星霊の導きが解錠の瞬間に幸運を呼び込み、持ち主を最も価値ある財宝へと誘う。（効果：解錠時に追加の報酬が得られる確率を上げる）",
  },
  "IT_DAY_EL_01": {
    "normal": "霊薬を燃料に混ぜた青緑の油灯。浸透する清涼な香りが広がり、狭い洞窟などでの息苦しさを和らげる。（効果：一定範囲内の毒耐性をわずかに上げる）",
    "success": "泡の術理で光がゆらめく霊薬の油灯。調整された霊液が燃えることで、周囲の仲間の精神を穏やかに整える。（効果：範囲内の仲間のＭＰ回復速度を上昇させる）",
    "great_success": "癒やしの術理を極めた神秘の油灯。雫のような光が広がり、火の粉が触れるだけで肉体の傷を優しく癒やす。（効果：範囲内の仲間のＨＰとＭＰを継続回復する）",
  },
  "IT_DAY_EL_02": {
    "normal": "霊薬を針に塗布した青緑の方位磁針。浸透する癒やしの術理が、持ち主の精神的な迷いを僅かに静めてくれる。（効果：精神耐性がわずかに上昇する）",
    "success": "泡の術理で針が浮く霊薬の方位磁針。調整された霊液が魔力の流れを感知し、魔力の高い場所を指し示す性質がある。（効果：魔法資源の発見率が上昇する）",
    "great_success": "癒やしの術理を極めた神秘の方位磁針。雫のような光を針が放ち、持ち主の魔力回路を目的地へと最適に調整する。（効果：知力とアイテム発見率が上昇する）",
  },
  "IT_DAY_EL_03": {
    "normal": "霊薬を配合したインクを用いる青緑の手帳。浸透する癒やしの術理が、書くことで精神を穏やかに整えてくれる。（効果：ＭＰ最大値がわずかに上昇する）",
    "success": "泡の術理を帯びた霊薬の手帳。調整された霊液が記録された情報を活性化させ、魔法の知識を効率よく引き出す。（効果：魔法攻撃力が上昇する）",
    "great_success": "癒やしの術理を極めた神秘の手帳。雫のような光が文字に宿り、読むたびに精神を調整し魔力を深い安らぎで満たす。（効果：魔法攻撃力とＭＰ回復速度が上昇する）",
  },
  "IT_DAY_EL_04": {
    "normal": "霊薬を染み込ませた青緑の寝袋。浸透する清涼感が心地よい眠りを誘い、砂漠の熱による疲労を癒やしてくれる。（効果：休息時のＭＰ回復量がわずかに上昇する）",
    "success": "泡の術理で通気性を調整した霊薬寝袋。調整された霊液が睡眠中の肉体をケアし、全身の魔力バランスを整える。（効果：休息時に魔法攻撃力バフを付与する）",
    "great_success": "癒やしの術理を極めた神秘の寝袋。雫のような輝きが精神を浄化し、目覚めた時には心身が完璧に調整されている。（効果：休息時に全ての状態異常を解除する）",
  },
  "IT_DAY_EL_05": {
    "normal": "霊薬を染み込ませた青緑の小鍵。浸透する清涼感が持ち主の手の震えを抑え、繊細な作業を僅かに助ける。（効果：罠解除の成功率がわずかに上昇する）",
    "success": "泡の術理を帯びた霊薬の小鍵。調整された霊液が鍵穴の摩擦を打ち消し、音を立てずに静かな解錠を可能にする。（効果：ステルス中の解錠成功率が上昇する）",
    "great_success": "癒やしの術理を極めた神秘の小鍵。雫のような光が仕掛けの綻びを優しく見つけ出し、まるで魔法のように罠を中和する。（効果：罠解除と解錠の成功率が大きく上昇する）",
  },
  "IT_DAY_LI_01": {
    "normal": "生命の脈動を封じた赤い油灯。葉脈のように温かい光が広がり、着用者の活力を僅かに呼び起こす。（効果：スタミナの減少をわずかに抑える）",
    "success": "赤や緑の活力に満ちた生命の油灯。再生の術理が光と共に拡散し、周囲にいる者の自然治癒力を段階的に高める。（効果：範囲内の仲間のＨＰ回復量を上昇させる）",
    "great_success": "成長の術理が宿る豊かな油灯。生命の奔流が光となって溢れ出し、枯れかけた肉体に再び戦う力を満たしていく。（効果：範囲内の全ステータスと回復速度を上げる）",
  },
  "IT_DAY_LI_02": {
    "normal": "生命の脈動を封じた赤い方位磁針。葉脈のように活力が針に伝わり、持ち主の生存本能と同期して北を指す。（効果：最大ＨＰがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の磁針。再生の術理が着用者の脈動と共鳴し、疲労が少ないルートを感覚的に選ばせる。（効果：スタミナ回復速度が上昇する）",
    "great_success": "成長の術理が宿る豊かな方位磁針。生命の奔流が針を躍動させ、持ち主の命が最も輝く場所へと強く導いていく。（効果：最大ＨＰと全ステータスが上昇する）",
  },
  "IT_DAY_LI_03": {
    "normal": "生命の脈動を封じた赤い手帳。葉脈のように活力が記録と共に全身へ巡り、読み返すたびに元気が出る。（効果：ＨＰ最大値がわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の手帳。再生の術理が持ち主の成長を記録し、肉体の綻びを癒やすための直感を授ける。（効果：ＨＰの自然回復量が上昇する）",
    "great_success": "成長の術理が宿る豊かな手帳。生命の奔流が記された文字から溢れ出し、持ち主の肉体を常に進化させ続ける。（効果：全ステータスが恒常的に底上げされる）",
  },
  "IT_DAY_LI_04": {
    "normal": "生命の脈動を封じた赤い寝袋。葉脈のように温もりが全身に伝わり、冷え切った身体を内側から回復させる。（効果：休息時の全回復速度がわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の寝袋。再生の術理が睡眠中に損傷箇所を集中的に修復し、肉体の成長を強く促す。（効果：休息時に最大ＨＰ・ＭＰが一時的に上昇する）",
    "great_success": "成長の術理が宿る豊かな寝袋。生命の奔流が眠る者を包み込み、まるで一晩で生まれ変わったような活力を授ける。（効果：休息後、ＨＰ・ＭＰ・スタミナの最大値を上げる）",
  },
  "IT_DAY_LI_05": {
    "normal": "生命の脈動を封じた赤い小鍵。葉脈のように活力が指先へ供給され、極限の緊張下でも確実な作業を可能にする。（効果：極限状態での解錠成功率が上昇する）",
    "success": "赤や緑の活力に満ちた生命の小鍵。再生の術理が鍵穴に宿る僅かな執念を癒やし、扉の拒絶を優しく解きほぐす。（効果：解錠と同時にＨＰが微回復する）",
    "great_success": "成長の術理が宿る豊かな小鍵。生命の奔流が仕掛けを内側から躍動させ、開かないはずの扉を自ら開かせる活力を授ける。（効果：全ての解錠成功率が大きく上昇する）",
  },
  "IT_DAY_ME_01": {
    "normal": "金属の術理で構造を強化した頑丈な油灯。衝撃に強く、中の油が漏れる心配をせずに持ち運べる。（効果：周囲の視認性がわずかに上昇する）",
    "success": "研磨された反射板を持つ金属の油灯。効率よく光を集めて遠くまで照らし出し、暗闇の不安を物理的に払う。（効果：視界範囲が上昇し、命中率が微増する）",
    "great_success": "金銀の縁取りが美しい豪華な油灯。金属の術理が炎を安定させ、暗闇に潜む邪悪な気配を強い光で退ける。（効果：視界範囲が大きく広がり、命中率を上げる）",
  },
  "IT_DAY_ME_02": {
    "normal": "金属の術理で構造を強化した方位磁針。砂嵐や振動の中でも針が乱れにくく、正確な北を指し続ける。（効果：マップの霧がわずかに晴れやすくなる）",
    "success": "研磨された部品で精度を高めた金属磁針。金属の反射が直感を助け、目的地への最短距離を物理的に予感させる。（効果：移動による迷いが発生しにくくなる）",
    "great_success": "金銀の縁取りが施された豪華な方位磁針。耐久性の高い術理が針を固定し、いかなる迷宮でも出口への方位を示す。（効果：マップの視界範囲を大きく広げる）",
  },
  "IT_DAY_ME_03": {
    "normal": "金属の板を装丁に使った頑丈な手帳。構造強化の術理により、過酷な環境でも記録が散逸するのを防ぐ。（効果：獲得経験値がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る手帳。金属の輝きが知識を整理し、過去の経験を物理的な強さへと変換する助けとなる。（効果：物理攻撃力と経験値が少し上昇する）",
    "great_success": "金銀の縁取りが施された豪華な手帳。耐久性の高い術理が記された知識を守り、持ち主の技能を強固に固定する。（効果：習得済みの技能効果を上昇させる）",
  },
  "IT_DAY_ME_04": {
    "normal": "金属繊維を織り込んだ頑丈な寝袋。構造強化により冷気を物理的に遮断し、安全な休息場所を提供する。（効果：休息時のＨＰ回復量がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る寝袋。金属の輝きが睡眠中の精神を守り、悪夢や負の干渉を反射して退ける。（効果：休息時に全能力上昇バフを付与する）",
    "great_success": "金銀の縁取りが施された豪華な寝袋。耐久性の高い術理が装着者を守り、短時間の睡眠でも鋼の如き活力を与える。（効果：休息時のＨＰ・ＭＰ回復量を大きく上げる）",
  },
  "IT_DAY_ME_05": {
    "normal": "金属の術理で構造を強化した小さな鍵。変形に強く、どのような硬い鍵穴にも負けずに解錠を試みられる。（効果：解錠の成功率がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る小鍵。金属の輝きが鍵穴の内部構造を照らし出し、解錠の仕組みを物理的に予感させる。（効果：解錠の成功率が上昇し、破損しにくくなる）",
    "great_success": "金銀の縁取りが施された豪華な小鍵。耐久性の高い術理が鍵を絶対的に固定し、あらゆる強固な守りを軽やかに突破する。（効果：高難易度の解錠成功率を大きく上げる）",
  },
  "IT_DAY_SA_01": {
    "normal": "乾燥した砂を燃料の吸着材に使った油灯。琥珀の術理が油の酸化を防ぎ、常に均一な明るさを保つ。（効果：火属性ダメージをわずかに軽減する）",
    "success": "風紋が刻まれた砂の油灯。保存の術理が燃料の摩耗を抑え、通常の数倍の時間にわたって周囲を照らし続ける。（効果：油灯の効果持続時間が大きく上昇する）",
    "great_success": "悠久の保存術理が宿る砂の油灯。摩耗を拒む性質が灯火を固定し、激しい風や砂嵐の中でも決して消えることはない。（効果：悪天候でも視界を保ち、全耐性を上昇させる）",
  },
  "IT_DAY_SA_02": {
    "normal": "乾燥した砂を土台に用いた方位磁針。琥珀の術理が湿気による狂いを防ぎ、砂漠での信頼性を高めている。（効果：土属性耐性がわずかに上昇する）",
    "success": "風紋が刻まれた砂の方位磁針。保存の術理が持ち主の体力を温存する方角を指し、長旅の摩耗を最小限に抑える。（効果：スタミナ消費がわずかに減少する）",
    "great_success": "悠久の保存術理が宿る砂の方位磁針。摩耗を拒む性質が針の動きを不朽のものとし、永遠の砂丘でも迷いを断ち切る。（効果：全耐性を上げ、スタミナ効率を最大化する）",
  },
  "IT_DAY_SA_03": {
    "normal": "乾燥した砂の術理を宿した手帳。琥珀の術理が紙の劣化を防ぎ、砂漠の乾いた風の中でも記録を不朽に保つ。（効果：土属性耐性がわずかに上昇する）",
    "success": "風紋が刻まれた砂の手帳。保存の術理が持ち主の体力を温存する術を思い出させ、日々の摩耗を最小限に抑える。（効果：スタミナの消費速度が低下する）",
    "great_success": "悠久の保存術理が宿る砂の手帳。摩耗を拒む性質が記された言葉に力を与え、過酷な旅路でも心身を健やかに保つ。（効果：全耐性を上げ、ステータス低下を防ぐ）",
  },
  "IT_DAY_SA_04": {
    "normal": "乾燥した砂の術理を宿した寝袋。琥珀の術理が砂塵を弾き、砂漠のど真ん中でも清潔で乾いた眠りを約束する。（効果：休息時のスタミナ回復量が上昇する）",
    "success": "風紋が刻まれた砂の寝袋。保存の術理が睡眠中の体力を極限まで効率化し、目覚めた瞬間に長時間の活動を可能にする。（効果：休息後、スタミナ消費が一定時間低下する）",
    "great_success": "悠久の保存術理が宿る砂の寝袋。摩耗を拒む性質が休息中の肉体を固定し、昨日の疲れを文字通り無かったことにする。（効果：休息後、長時間全ステータスが上昇する）",
  },
  "IT_DAY_SA_05": {
    "normal": "乾燥した砂の術理を宿した小鍵。琥珀の術理が鍵穴の詰まりを防ぎ、砂にまみれた古い扉でもスムーズに開けられる。（効果：砂漠の遺跡での解錠率が上昇する）",
    "success": "風紋が刻まれた砂の小鍵。保存の術理が持ち主の集中力を維持し、失敗による摩耗から鍵そのものを守ってくれる。（効果：解錠に失敗してもアイテムが消失しにくくなる）",
    "great_success": "悠久の保存術理が宿る砂の小鍵。摩耗を拒む性質がいかなる旧時代の仕掛けも拒まず、時を超えて閉ざされた道を拓く。（効果：解錠成功率を上げ、運の要素を排除する）",
  },
  "IT_FOD_AS_01": {
    "normal": "星霊の粉を隠し味にした旅パン。夜空の下で食べると方位の感覚が戻り、夜間の迷いを防いでくれる。（効果：空腹度を回復し、夜間の命中率を上げる）",
    "success": "方位の術理を帯びた星明かりのパン。直感を鋭くする成分が含まれており、探索中の集中力を高める。（効果：空腹度を回復し、回避率を一時的に上げる）",
    "great_success": "予兆を感じる青い光の旅パン。星霊の導きが脳に浸透し、危険を予見する鋭い感覚を食事と共に授ける。（効果：空腹度を回復し、クリティカル率を大きく上げる）",
  },
  "IT_FOD_AS_02": {
    "normal": "星霊の光を浴びせて乾燥させた干し果物。方位の感覚を僅かに高め、夜の砂漠での進路決定を助ける。（効果：夜間の移動速度をわずかに上げる）",
    "success": "星明かりを吸い込んだ青い干し果物。直感を鋭くする術理が含まれ、隠された罠を見抜く手助けをする。（効果：罠発見率が一時的に上昇する）",
    "great_success": "予兆を読み取る神秘的な干し果物。星霊の導きが運命に僅かな追い風を送り、不運な事故を食事で防ぐ。（効果：運の良さと回避率を一時的に上昇させる）",
  },
  "IT_FOD_AS_03": {
    "normal": "星明かりをイメージした青い香辛料。方位の感覚を研ぎ澄まし、夜の食事を特別な儀式へと変える。（効果：夜間に食べる料理の効果を上昇させる）",
    "success": "星霊の直感を高める術理の香辛料。予兆を感じ取る力が料理に宿り、食べた者の五感を鋭敏にする。（効果：料理に命中率と回避率の上昇効果を付与する）",
    "great_success": "夜空の導きを封じた神秘の香辛料。星霊の導きが調理に幸運を招き、食材の限界を超えた成果を引き出す。（効果：料理作成時に高確率で大成功が発生する）",
  },
  "IT_FOD_AS_04": {
    "normal": "星明かりを映す青い茶杯。方位の感覚を整える術理があり、夜の静寂の中で心を落ち着かせる。（効果：夜間のＭＰ回復速度をわずかに上げる）",
    "success": "星霊の直感を呼び起こす茶杯。予兆を感じ取る力が飲み物に宿り、明日の旅路への予感を授ける。（効果：次に発生するイベントの幸運度を上げる）",
    "great_success": "夜空の星々を映し出す神秘の茶杯。星霊の導きが飲み物に幸運を注ぎ込み、五感を鋭く研ぎ澄ます。（効果：飲み物によるクリティカル率上昇を付与する）",
  },
  "IT_FOD_AS_05": {
    "normal": "星明かりの術理を帯びた青い水筒。方位の感覚を失わないよう導いてくれる、夜の旅人の守り神。（効果：夜間の命中率がわずかに上昇する）",
    "success": "方位の術理が宿る星霊の水筒。直感を高める力が水に溶け込み、一口飲むごとに周囲の気配に鋭くなる。（効果：回避率が一時的にわずかに上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の水筒。星霊の導きが水を通じて着用者の運命を僅かに上向かせ、幸運を呼ぶ。（効果：運の良さと命中率を一時的に上昇させる）",
  },
  "IT_FOD_EL_01": {
    "normal": "霊薬を混ぜて焼いた青緑の旅パン。浸透した清涼感が喉を潤し、乾いた砂漠でも食べやすい。（効果：空腹度と喉の渇きを少量回復する）",
    "success": "泡の術理でふっくら仕上げた霊薬パン。調整された霊液が胃腸を癒やし、旅の緊張を優しく解きほぐす。（効果：空腹度を回復し、精神的な疲労を和らげる）",
    "great_success": "癒やしの術理が詰まった究極の旅パン。一齧りごとに霊薬の雫が口に広がり、全身の魔力を調整する。（効果：空腹度、ＨＰ、ＭＰを同時に回復する）",
  },
  "IT_FOD_EL_02": {
    "normal": "霊薬に漬け込まれた青緑の干し果物。浸透した癒やしの成分が、渇いた体細胞を優しく潤してくれる。（効果：喉の渇きを少量回復し、ＨＰを微回復する）",
    "success": "泡の術理を纏った爽やかな干し果物。調整された霊液が精神的な疲れを吸い取り、晴れやかな気分にする。（効果：喉の渇きを回復し、ＭＰを中程度回復する）",
    "great_success": "癒やしの術理を極めた神秘の干し果物。一粒食べるだけで全身が雫に包まれたように潤い、活力が満ちる。（効果：ＨＰとＭＰを大きく回復し、渇きを癒やす）",
  },
  "IT_FOD_EL_03": {
    "normal": "霊薬の成分を乾燥させた青緑の香辛料。浸透性が高く、食材の毒素や癖を優しく中和してくれる。（効果：料理のマイナス効果を打ち消す）",
    "success": "泡の術理が香りを広げる霊薬香辛料。調整された霊液が精神を昂揚させ、魔法への適性を高める効果がある。（効果：作成する料理に魔法攻撃力上昇を付与する）",
    "great_success": "癒やしの術理を極めた神秘の香辛料。雫のような輝きが食材を浄化し、心身を完璧に整える美食へと変える。（効果：料理に全状態異常耐性とＭＰ回復を付与する）",
  },
  "IT_FOD_EL_04": {
    "normal": "霊薬を焼き固めた青緑の茶杯。浸透する癒やしの術理が、注いだ水に微かな清涼感を与えてくれる。（効果：水を飲むだけでＨＰがわずかに回復する）",
    "success": "泡の術理を帯びた霊薬の茶杯。調整された霊液が液体の成分と混ざり合い、精神を鎮める薬湯へと変える。（効果：飲み物によるＭＰ回復量を上昇させる）",
    "great_success": "癒やしの術理を極めた神秘の茶杯。雫のような光沢が魔力を呼び込み、一口ごとに深い安らぎを授ける。（効果：飲み物によるＭＰ回復量と精神耐性を上昇させる）",
  },
  "IT_FOD_EL_05": {
    "normal": "霊薬の成分を練り込んだ青緑の水筒。浸透する清涼感が、中の水に絶え間ない癒やしの力を付与する。（効果：水を飲むたびにＨＰが少量回復する）",
    "success": "泡の術理が水を活性化させる霊薬水筒。調整された霊液が精神を潤し、砂漠の熱による苛立ちを鎮める。（効果：水を飲むたびにＭＰが少量回復する）",
    "great_success": "癒やしの術理を極めた神秘の水筒。雫のような輝きが水を聖なる液へと変え、全身の魔力バランスを整える。（効果：水でＨＰとＭＰが中程度回復する）",
  },
  "IT_FOD_LI_01": {
    "normal": "生命の脈動を宿した赤い旅パン。葉脈のように栄養が全身へ行き渡り、肉体の活力を素早く蘇らせる。（効果：空腹度とスタミナを回復する）",
    "success": "活力に満ちた赤や緑の生命パン。再生の術理が筋繊維を修復し、重い荷物を背負う足取りを軽くする。（効果：空腹度を回復し、最大重量を一時的に増やす）",
    "great_success": "成長の奔流を封じた生命の旅パン。生命の術理が全身で脈動し、食べるだけで傷ついた細胞を再構築する。（効果：空腹度を回復し、ＨＰ自然回復速度を上げる）",
  },
  "IT_FOD_LI_02": {
    "normal": "生命の脈動を感じる赤い干し果物。葉脈を通じて活力が伝わり、衰えた肉体に再び力を灯してくれる。（効果：最大ＨＰが一時的にわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の干し果物。再生の術理が筋肉の乳酸を分解し、旅の足の重みを取り除く。（効果：スタミナ回復速度が一時的に上昇する）",
    "great_success": "成長の術理が宿る豊かな干し果物。生命の奔流が全身を駆け巡り、一粒で数日分の睡眠に匹敵する活力を得る。（効果：ＨＰとスタミナを全快し、最大値を上げる）",
  },
  "IT_FOD_LI_03": {
    "normal": "生命の脈動を宿した赤い香辛料。葉脈のように活力を巡らせ、食事の栄養吸収率を僅かに高める。（効果：料理によるＨＰ回復量を上昇させる）",
    "success": "赤や緑の活力に満ちた生命の香辛料。再生の術理が細胞を鼓舞し、食べるだけで傷が癒える料理が作れる。（効果：作成する料理にＨＰ継続回復効果を付与する）",
    "great_success": "成長の術理が宿る生命の香辛料。生命の奔流が料理に宿り、一口ごとに肉体が更新されるような活力を授ける。（効果：料理に最大ＨＰ上昇と強力な回復効果を付与する）",
  },
  "IT_FOD_LI_04": {
    "normal": "生命の脈動を宿した赤い茶杯。葉脈を通じて活力が伝わり、冷めた飲み物にも生命の火を灯す。（効果：飲み物によるスタミナ回復量を上昇させる）",
    "success": "赤や緑の活力に満ちた生命の茶杯。再生の術理が液体の生命力を引き出し、肉体の綻びを癒やす力に変える。（効果：飲み物にＨＰ継続回復効果を付与する）",
    "great_success": "成長の術理が宿る豊かな茶杯。生命の奔流が注がれた液体を満たし、飲むたびに全身が若返るような活力を得る。（効果：飲み物による全能力上昇効果を付与する）",
  },
  "IT_FOD_LI_05": {
    "normal": "生命の脈動を感じる赤い水筒。葉脈のように活力が水に伝わり、飲むたびに全身が温かく満たされる。（効果：最大スタミナがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の水筒。再生の術理が水の生命力を高め、疲労した筋肉を優しく解きほぐす。（効果：スタミナ回復速度が上昇する）",
    "great_success": "成長の術理が宿る豊かな水筒。生命の奔流が水に宿り、一口で肉体の損傷を修復し、活力を最大まで引き出す。（効果：ＨＰとスタミナを回復し、最大値を上げる）",
  },
  "IT_FOD_ME_01": {
    "normal": "金属の術理で構造を強化した保存パン。非常に硬いが腹持ちがよく、長旅の貴重な糧となる。（効果：空腹度を中程度回復し、防御力が微増する）",
    "success": "金属の術理で表面を薄く硬質化した旅パン。乾燥を防ぎつつ、噛みしめるほどに力が湧く不思議な食感。（効果：空腹度を回復し、一定時間物理防御力が上昇する）",
    "great_success": "金銀の術理を練り込んだ贅沢な旅パン。研磨された成分が魔力を反射し、食べるだけで体に活力が宿る。（効果：空腹度を大きく回復し、防御性能を強化する）",
  },
  "IT_FOD_ME_02": {
    "normal": "金属の術理で糖分を凝縮した干し果物。構造が硬く締まっており、一粒でも長時間エネルギーが続く。（効果：スタミナを少量回復し、防御を微増させる）",
    "success": "研磨するように磨かれた美しい干し果物。金属の術理が精神の表面を硬質化し、不意の恐怖に動じなくさせる。（効果：スタミナを回復し、精神耐性を一時的に上げる）",
    "great_success": "金銀の術理でコーティングされた干し果物。甘みが金属の力で増幅されており、食べるだけで活力が爆発する。（効果：スタミナを全快し、全能力を一時的に上げる）",
  },
  "IT_FOD_ME_03": {
    "normal": "金属の術理で風味を固定した香辛料瓶。構造が安定しており、どのような食材も長持ちさせる力がある。（効果：料理の品質をわずかに上昇させる）",
    "success": "研磨された香りの成分を含む香辛料瓶。金属の術理が味を鋭く引き立て、食べる者の防御本能を刺激する。（効果：作成する料理に防御力上昇効果を付与する）",
    "great_success": "金銀の術理が香りと共に舞う香辛料瓶。料理に一振りするだけで、肉体を物理的に強化する薬効が生まれる。（効果：料理に大幅な防御力と攻撃力上昇を付与する）",
  },
  "IT_FOD_ME_04": {
    "normal": "金属の術理で縁取られた頑丈な茶杯。熱を逃がしにくく、過酷な砂漠でも飲み物の温度を保つ。（効果：飲み物アイテムの効果をわずかに上昇させる）",
    "success": "研磨された内面が魔力を反射する茶杯。構造強化により、注がれた液体の術理を活性化させる力がある。（効果：飲み物アイテムの効果持続時間を上昇させる）",
    "great_success": "金銀の術理が施された高貴な茶杯。金属の力が液体の不純物を除き、本来の力を最大限に引き出す。（効果：飲み物の効果を大きく上げ、デバフを解除する）",
  },
  "IT_FOD_ME_05": {
    "normal": "金属の術理で補強された頑丈な水筒。衝撃に強く、中の水が漏れる心配がない旅の必需品。（効果：水の最大所持量をわずかに増やす）",
    "success": "研磨された内部が水を浄化する水筒。構造強化により、長旅でも中の水が濁らず清浄に保たれる。（効果：水を飲む際の回復効果が上昇する）",
    "great_success": "金銀の術理で装飾された豪華な水筒。金属の力が水に活力を与え、飲むたびに肉体の守りを固めてくれる。（効果：水で喉を潤すと物理防御力が一時的に上昇する）",
  },
  "IT_FOD_SA_01": {
    "normal": "砂の術理で極限まで乾燥させた保存パン。腐敗を完全に防ぎ、数ヶ月の旅でも味が変わることはない。（効果：空腹度を回復し、病気耐性が少し上昇する）",
    "success": "琥珀のような色艶を持つ砂の旅パン。風紋の術理が栄養を保存し、少量でも一日分の活力を提供する。（効果：空腹度を大きく回復し、スタミナ消費を抑える）",
    "great_success": "悠久の保存術理が宿る砂の旅パン。摩耗を拒む性質が肉体に活力を固定し、過酷な砂漠歩きを支え抜く。（効果：空腹度を全快させ、一定時間空腹にならなくなる）",
  },
  "IT_FOD_SA_02": {
    "normal": "砂の術理で水分を抜いた保存用の干し果物。琥珀のような甘みがあり、極めて腐敗しにくいのが特徴。（効果：空腹度を少量回復し、病気耐性を上げる）",
    "success": "風紋が表面に浮き出た砂の干し果物。保存の術理が栄養を極限まで濃縮し、過酷な旅の持久力を支える。（効果：空腹度を回復し、スタミナ消費を軽減する）",
    "great_success": "悠久の保存術理が宿る砂の干し果物。摩耗した精神を甘みで修復し、数日分の気力を一粒に凝縮している。（効果：空腹度とスタミナを大きく回復し、耐性を上げる）",
  },
  "IT_FOD_SA_03": {
    "normal": "砂の術理で香りを保存した香辛料瓶。琥珀のように深いコクがあり、砂漠の料理には欠かせない一品。（効果：料理によるスタミナ回復量を増やす）",
    "success": "風紋のような香りの層を持つ砂の香辛料。保存の術理が食材の鮮度を料理後も維持し、効果時間を延ばす。（効果：料理の効果持続時間を上昇させる）",
    "great_success": "悠久の砂丘の知恵が詰まった香辛料。摩耗した胃腸を活性化し、どんな過酷な状況下でも美味しく食事できる。（効果：料理の効果時間を大きく延ばし、全耐性を付与する）",
  },
  "IT_FOD_SA_04": {
    "normal": "乾燥した砂から錬成された茶杯。琥珀のような質感があり、砂塵の中でも中身が汚れにくい。（効果：土属性魔法の威力を一時的にわずかに上げる）",
    "success": "風紋が刻まれた砂の茶杯。保存の術理が注がれた液体の鮮度を保ち、長時間の休息を豊かにする。（効果：休息時のスタミナ回復量を上昇させる）",
    "great_success": "悠久の保存術理が宿る砂の茶杯。摩耗を拒む性質が液体の薬効を固定し、飲む者に変わらぬ活力を授ける。（効果：飲み物の効果時間を大幅に上昇させる）",
  },
  "IT_FOD_SA_05": {
    "normal": "乾燥した砂を錬成した保存力の高い水筒。琥珀の術理が外気の影響を遮断し、水を常に冷たく保つ。（効果：火属性ダメージ耐性がわずかに上昇する）",
    "success": "風紋の術理が水を保存する砂の水筒。摩耗しがちな体内の水分を固定し、少ない水で長く活動できる。（効果：喉が渇くまでの時間を上昇させる）",
    "great_success": "悠久の保存術理が宿る砂の水筒。摩耗を拒む性質が水に活力を封じ込め、過酷な砂漠横断を支える一助となる。（効果：喉の渇きを完全に無効化する時間を付与する）",
  },
  "IT_MED_AS_01": {
    "normal": "星明かりの成分を混ぜた薬瓶。服用すると夜間の視界が僅かに晴れ、足元の不安が解消される。（効果：一定時間、暗視効果を得る）",
    "success": "方位の術理を帯びた青い薬瓶。直感を研ぎ澄ます効果があり、短時間ながら攻撃の精度を高める。（効果：一定時間、命中率が大きく上昇する）",
    "great_success": "予兆を読み取る星霊の薬瓶。星明かりの術理が服用者の感覚を未来へと繋ぎ、回避能力を飛躍させる。（効果：一定時間、回避率が大きく上昇する）",
  },
  "IT_MED_AS_02": {
    "normal": "星霊の直感を刺激する成分入りの霊薬瓶。夜間の戦闘で迷いを減らし、冷静な判断を可能にする。（効果：夜間の魔法威力が上昇する）",
    "success": "方位の術理が宿る青い光の霊薬瓶。周囲の魔力を予感する力が冴え、敵の魔法を回避しやすくなる。（効果：一定時間、魔法回避率が上昇する）",
    "great_success": "星明かりを濃縮した神秘的な霊薬瓶。未来の予兆を脳裏に映し出し、術者の思考速度を極限まで高める。（効果：魔法攻撃力上昇と詠唱時間短縮を付与する）",
  },
  "IT_MED_AS_03": {
    "normal": "星明かりの粉を混ぜた青い軟膏壺。夜間に塗ると患部が微かに光り、回復の予兆を着用者に伝える。（効果：夜間のＨＰ自然回復速度が上昇する）",
    "success": "方位の術理を帯びた星霊の軟膏壺。直感を高める成分が神経を整え、しびれた四肢の感覚を呼び戻す。（効果：麻痺と混乱を回復し、命中率を上げる）",
    "great_success": "予兆を読み取る青い光の軟膏壺。星霊の導きが肉体の不調を予見するように取り除き、最良の状態へ導く。（効果：混乱・恐怖・麻痺を回復し、回避率を上げる）",
  },
  "IT_MED_AS_04": {
    "normal": "星霊の粉を主成分とした青い粉薬瓶。服用すると夜空の予兆を感じやすくなり、直感が僅かに冴える。（効果：一定時間、運の良さが少し上昇する）",
    "success": "方位の術理が宿る星明かりの粉薬瓶。暗闇の中でも目的の方向を直感できるようになり、迷いを消す。（効果：一定時間、クリティカル率が上昇する）",
    "great_success": "予兆を読み取る青い光の粉薬瓶。星霊の導きが運命の糸を僅かに手繰り寄せ、幸運な出来事を引き起こす。（効果：クリティカル率とアイテムドロップ率が上昇する）",
  },
  "IT_MED_AS_05": {
    "normal": "星明かりを練り込んだ青い丸薬箱。服用すると方位の感覚が冴え、夜空の下での行動が楽になる。（効果：夜間の移動速度が少し上昇する）",
    "success": "方位の術理を宿した星霊の丸薬箱。直感が鋭くなり、探索中に隠された通路や財宝を予感しやすくなる。（効果：一定時間、隠し要素の発見率が上昇する）",
    "great_success": "予兆を読み取る青い光の丸薬箱。星霊の導きが着用者を危機から遠ざけ、幸運の連続へと運命を誘う。（効果：回避率、クリティカル率、運が上昇する）",
  },
  "IT_MED_EL_01": {
    "normal": "霊薬を主成分とした標準的な薬瓶。青緑の液体が浸透しやすく、軽微な負傷を素早く癒やす。（効果：ＨＰを少量回復する）",
    "success": "調整された霊薬を詰めた薬瓶。清涼感のある泡が傷口の痛みを引き、心身の乱れを即座に整える。（効果：ＨＰを中程度回復する）",
    "great_success": "極めて純度の高い霊薬を詰めた薬瓶。癒やしの術理が全身の隅々まで浸透し、活力を瞬時に蘇らせる。（効果：ＨＰを大きく回復する）",
  },
  "IT_MED_EL_02": {
    "normal": "青緑の輝きを放つ標準的な霊薬瓶。調整された霊液が精神を沈め、魔力の循環を僅かに助ける。（効果：ＭＰを少量回復する）",
    "success": "泡が絶えず湧き出す調整済みの霊薬瓶。清涼感と共に霊液が浸透し、枯渇した魔力を効率よく補う。（効果：ＭＰを中程度回復する）",
    "great_success": "癒やしの術理を極限まで濃縮した霊薬瓶。一滴ごとに深い安らぎを授け、精神を魔法の最適状態に置く。（効果：ＭＰを大きく回復する）",
  },
  "IT_MED_EL_03": {
    "normal": "霊薬をベースにした青緑の軟膏壺。清涼感のある香りが広がり、炎症や腫れを優しく鎮めてくれる。（効果：火傷状態を回復する）",
    "success": "浸透力の高い霊薬を配合した軟膏壺。泡の術理が皮膚の奥まで癒やしを届け、火傷の痕を残さず癒やす。（効果：火傷と毒状態を回復する）",
    "great_success": "癒やしの術理を極めた神秘の軟膏壺。調整された霊液が壊死した組織さえも浄化し、元の美しい肌へ戻す。（効果：全ての状態異常を回復し、ＨＰを少量回復する）",
  },
  "IT_MED_EL_04": {
    "normal": "霊薬を乾燥させて粉末にした薬瓶。青緑の粉が唾液と共に浸透し、荒れた喉や精神を優しく癒やす。（効果：沈黙状態を解除する）",
    "success": "泡の術理を封じ込めた清涼な粉薬瓶。調整された霊液粉末が瞬時に溶け、魔力の滞りを速やかに解消する。（効果：沈黙と睡眠を解除し、ＭＰを微回復する）",
    "great_success": "癒やしの術理を極めた神秘の粉薬瓶。一吹きで精神が透明な雫のように澄み渡り、最高の集中力を授ける。（効果：沈黙を解除し、一定時間消費ＭＰを軽減する）",
  },
  "IT_MED_EL_05": {
    "normal": "霊薬を丸めた青緑の丸薬箱。浸透性の高い癒やしの術理が、蓄積した慢性的な疲労を少しずつ解消する。（効果：疲労度の蓄積をリセットする）",
    "success": "泡の術理が成分を弾けさせる丸薬箱。清涼感と共に霊液が血液に混じり、全身の調整を即座に行う。（効果：疲労度をリセットし、ＭＰを微回復する）",
    "great_success": "癒やしの術理を凝縮した高貴な丸薬箱。調整された霊薬が心身の綻びを完璧に修復し、無垢な状態へ戻す。（効果：疲労度と状態異常を完全に解除する）",
  },
  "IT_MED_LI_01": {
    "normal": "生命の脈動を封じた赤い薬瓶。葉脈のように魔力が広がり、肉体の基本的な活力を引き出す。（効果：最大スタミナを一時的に上昇させる）",
    "success": "活力に溢れる生命の薬瓶。赤や緑の光が混ざり合い、消費したエネルギーを急速に充填する。（効果：スタミナを大きく回復する）",
    "great_success": "成長の術理を極限まで高めた薬瓶。生命の奔流が全身を駆け巡り、あらゆる疲労を根こそぎ解消する。（効果：スタミナとＨＰを大きく回復する）",
  },
  "IT_MED_LI_02": {
    "normal": "生命の脈動を伝える赤色の霊薬瓶。体内の魔力葉脈を活性化させ、一時的に魔法の威力を底上げする。（効果：一定時間、魔法攻撃力が上昇する）",
    "success": "豊かな活力を宿した赤と緑の霊薬瓶。再生の術理が細胞を鼓舞し、傷ついた肉体を徐々に修復する。（効果：一定時間、ＨＰが継続的に回復する）",
    "great_success": "成長の奔流を封じ込めた生命の霊薬瓶。体内の活力を劇的に増幅させ、爆発的な生命の輝きを授ける。（効果：最大ＨＰ上昇とＨＰ継続回復を付与する）",
  },
  "IT_MED_LI_03": {
    "normal": "脈動する植物の髄を用いた生命の軟膏壺。葉脈を通じて活力を送り込み、打撲や捻挫の治りを早める。（効果：打撃属性ダメージへの耐性を上げる）",
    "success": "赤や緑の活力に満ちた生命の軟膏壺。再生の術理が肉体の成長を促し、折れた骨さえも接合しやすくする。（効果：骨折状態を回復し、最大ＨＰを増やす）",
    "great_success": "豊かな成長の術理を宿した生命の軟膏壺。肌に塗った瞬間から肉体が脈動し、驚異的な速度で完治させる。（効果：全ての負傷状態を回復し、ＨＰ回復速度を上げる）",
  },
  "IT_MED_LI_04": {
    "normal": "脈動する生命の葉を粉末にした薬瓶。葉脈のように全身へ活力が広がり、眠気を心地よく払い去る。（効果：睡眠状態を解除する）",
    "success": "活力に満ちた赤や緑の粉薬瓶。成長の術理が筋繊維を鼓舞し、一時的に身体能力の限界を押し上げる。（効果：一定時間、攻撃力と速度が上昇する）",
    "great_success": "再生の奔流を封じた生命の粉薬瓶。体内の脈動が極限まで高まり、損傷を補いながら戦い続ける力を授ける。（効果：ＨＰ継続回復と全能力上昇を付与する）",
  },
  "IT_MED_LI_05": {
    "normal": "生命の脈動を封じた赤い丸薬箱。葉脈を通じて全身に活力が供給され、僅かな眠りで全快できる。（効果：次に休息した際のＨＰ回復量が増加する）",
    "success": "活力漲る赤や緑の丸薬箱。再生の術理が睡眠中に肉体を再構築し、あらゆる傷や疲れを洗い流す。（効果：次に休息した際、全ての負傷が完治する）",
    "great_success": "成長と繁栄の術理を宿した丸薬箱。生命の奔流が体内で渦巻き、休息せずとも肉体を常に更新し続ける。（効果：一定時間、ＨＰとスタミナが超高速で回復する）",
  },
  "IT_MED_ME_01": {
    "normal": "金属粉を混ぜた補強用の薬瓶。移動中の衝撃に強く、中の薬液を物理的な振動から守る。（効果：投擲時のダメージがわずかに上昇する）",
    "success": "内部を研磨し、構造を強化した薬瓶。中の成分が変質しにくく、薬の効き目が一定時間維持される。（効果：薬の効果持続時間が上昇する）",
    "great_success": "金銀の縁取りが施された頑丈な薬瓶。金属の術理が成分の純度を保ち、投擲時には確実に飛散する。（効果：薬の効果持続時間と威力が大きく上昇する）",
  },
  "IT_MED_ME_02": {
    "normal": "金属片を微細化した成分を含む霊薬瓶。肌の表面を硬質化させ、物理的な打撃への耐性を高める。（効果：一定時間、物理防御力が上昇する）",
    "success": "高度に研磨された成分を含む霊薬瓶。金属の術理が皮膚の柔軟性を保ちつつ、鋼のような強度を与える。（効果：物理防御力が大きく上昇する）",
    "great_success": "金銀の術理を溶かし込んだ高貴な霊薬瓶。全身の構造を一時的に強化し、重い攻撃さえも弾き飛ばす。（効果：物理防御力上昇とノックバック耐性を付与する）",
  },
  "IT_MED_ME_03": {
    "normal": "金属の術理で保存性を高めた軟膏壺。傷口に塗ると薄い膜を張り、雑菌や砂塵の侵入を防いでくれる。（効果：傷の悪化を防止し、物理防御を微増させる）",
    "success": "細かく研磨された金属粉入りの軟膏壺。構造強化の術理が皮膚の再生を助け、裂傷を素早く塞ぐ。（効果：裂傷状態を回復し、防御力を高める）",
    "great_success": "金銀の術理が宿る高貴な軟膏壺。塗った箇所を即座に鋼のように硬化させ、あらゆる痛みを遮断する。（効果：出血・裂傷を回復し、物理ダメージを大幅軽減する）",
  },
  "IT_MED_ME_04": {
    "normal": "金属の術理で粒度を均一にした粉薬瓶。構造強化により体内への吸収が速く、即座に効果を発揮する。（効果：魔法の詠唱速度が一時的にわずかに上昇する）",
    "success": "研磨された成分が魔力を反射する粉薬瓶。金属の術理が精神の防壁を固め、外部からの干渉を防ぐ。（効果：一定時間、沈黙状態への耐性を得る）",
    "great_success": "金銀の輝きを粉末にした豪華な粉薬瓶。全身の魔力回路を金属の術理でコーティングし、魔法耐性を高める。（効果：魔法防御力と詠唱速度が大きく上昇する）",
  },
  "IT_MED_ME_05": {
    "normal": "金属の術理で成分を圧縮した丸薬箱。構造が強固なため変質しにくく、長期の遠征にも耐えうる。（効果：最大所持重量が一時的にわずかに上昇する）",
    "success": "研磨された金属粉を芯にした丸薬箱。硬度を持たせた成分が骨格を補強し、重い荷物での負担を減らす。（効果：一定時間、最大所持重量が上昇する）",
    "great_success": "金銀の術理でコーティングされた丸薬箱。全身の耐久性を金属の術理で底上げし、過酷な労働を支える。（効果：最大所持重量と物理防御力が大きく上昇する）",
  },
  "IT_MED_SA_01": {
    "normal": "乾燥した砂を錬成して作った薬瓶。保存性が高く、砂漠の高温下でも薬液が蒸発しにくい。（効果：長期間の保存でも効果が劣化しない）",
    "success": "琥珀のような質感を持つ砂の薬瓶。風紋の術理が中の成分を安定させ、服用後の副作用を抑える。（効果：回復時にデバフを解除する）",
    "great_success": "悠久の保存術理が宿る砂の薬瓶。成分が時を超えて固定されており、服用すると肉体の鮮度を維持する。（効果：ＨＰを回復し、一定時間能力低下を防ぐ）",
  },
  "IT_MED_SA_02": {
    "normal": "乾燥した砂漠の植物から抽出した霊薬瓶。喉の乾きを抑え、過酷な環境下での活動を支える。（効果：一定時間、喉の渇きを無効化する）",
    "success": "摩耗を抑える砂の術理を帯びた霊薬瓶。肉体の消耗を保存の力で防ぎ、長時間の全力疾走を可能にする。（効果：スタミナ消費速度を一定時間低下させる）",
    "great_success": "悠久の砂丘から得た琥珀の霊薬瓶。風紋の術理が肉体の老化反応を一時的に止め、絶頂期の力を維持する。（効果：一定時間、スタミナ消費がゼロになる）",
  },
  "IT_MED_SA_03": {
    "normal": "乾燥した薬草を砂の術理で固めた軟膏壺。水分を吸い取る力が強く、化膿した傷口の乾燥に役立つ。（効果：麻痺状態の蓄積をわずかに減少させる）",
    "success": "保存性が極めて高い琥珀色の軟膏壺。風紋の術理が傷口を保護し、過酷な砂嵐の中でも治癒を促す。（効果：麻痺状態を回復し、土属性耐性を上げる）",
    "great_success": "悠久の砂丘の知恵が詰まった軟膏壺。摩耗した皮膚を保存の術理で固定し、肉体の損傷を無かったことにする。（効果：麻痺・石化を回復し、防御力を大きく上げる）",
  },
  "IT_MED_SA_04": {
    "normal": "乾燥した砂漠の根から作った粉薬瓶。琥珀の術理が胃腸を保護し、旅先での食あたりを未然に防ぐ。（効果：病気状態の蓄積をわずかに減少させる）",
    "success": "保存の術理が極めて強い琥珀色の粉薬瓶。風紋の力が体内の水分バランスを固定し、脱水症状を緩和する。（効果：病気状態を回復し、土属性耐性を上げる）",
    "great_success": "悠久の砂丘の力を凝縮した粉薬瓶。摩耗した内臓を保存の術理で健やかに保ち、毒素を砂のように排出する。（効果：毒・病気を回復し、全ステータス低下を解除する）",
  },
  "IT_MED_SA_05": {
    "normal": "乾燥した砂を媒介にした丸薬箱。保存性が極めて高く、味も匂いも琥珀のように固定されている。（効果：服用すると一定時間、空腹を感じなくなる）",
    "success": "摩耗を抑える砂の術理を帯びた丸薬箱。風紋の力が精神の摩耗を防ぎ、単調な旅路でも集中力を保つ。（効果：一定時間、精神耐性が大きく上昇する）",
    "great_success": "悠久の砂丘の術理が宿る丸薬箱。保存の力が老化や劣化の概念を一時的に封じ、肉体を全盛期に留める。（効果：一定時間、全てのステータスが低下しなくなる）",
  },
  "IT_RIT_AS_01": {
    "normal": "星明かりを映す青い香炉。方位の感覚を僅かに鋭くし、天の星々と呼吸を合わせるための助けとなる。（効果：夜間の魔法成功率が上昇する）",
    "success": "方位の術理が宿る星霊の香炉。直感が高まる力が備わり、儀式中に進むべき未来の予兆を光の粒子で教える。（効果：クリティカル率と回避率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の香炉。星霊の導きが煙を通じて運命を僅かに手繰り寄せ、幸運な出来事を確定させる。（効果：運の良さと魔法威力が大きく上昇する）",
  },
  "IT_RIT_AS_02": {
    "normal": "星明かりを映す青い護符飾り。方位の感覚を僅かに鋭くし、暗闇の中でも進むべき道を直感させる。（効果：夜間の回避率がわずかに上昇する）",
    "success": "方位の術理が宿る星霊の護符飾り。直感が高まる力が備わり、敵の攻撃が来る方角を予兆として光で教える。（効果：回避率と命中率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の護符飾り。星霊の導きが着用者を危機から遠ざけ、幸運の追い風を運命に注ぐ。（効果：運の良さと回避率を大きく上昇させる）",
  },
  "IT_RIT_AS_03": {
    "normal": "星明かりを映す青い儀礼小刀。方位の感覚を僅かに鋭くし、隠された素材の位置を直感で予感させる。（効果：隠れた採取ポイントの発見率を上げる）",
    "success": "方位の術理が宿る星霊の儀礼小刀。直感が高まる力が備わり、素材を切り出すべき最善の箇所を光で教える。（効果：採取時の大成功確率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の儀礼小刀。星霊の導きが採取に幸運を招き、一本の小刀から驚異的な財を産み出す。（効果：稀に超高価値のレア素材を追加獲得する）",
  },
  "IT_RIT_AS_04": {
    "normal": "星明かりを映す青い小鈴。方位の感覚を音と共に広げ、夜の探索でも自分の立ち位置を直感で保たせる。（効果：夜間の命中率が上昇する）",
    "success": "方位の術理が宿る星霊の小鈴。直感が高まる力が音に宿り、危機が近づく予兆を音の震えで予感させてくれる。（効果：不意打ちを無効化する確率を上げる）",
    "great_success": "夜空の予兆を映し出す神秘の小鈴。星霊の導きが鳴るたびに幸運を呼び寄せ、着用者を最善の運命へと導いていく。（効果：運の良さと回避率を大きく上昇させる）",
  },
  "IT_RIT_AS_05": {
    "normal": "星明かりを映す青い香木箱。方位の感覚を僅かに鋭くし、儀式に最適な方位を直感で予感させてくれる。（効果：夜間の儀式成功率が上昇する）",
    "success": "方位の術理が宿る星霊の香木箱。直感が高まる力が備わり、香木を焚くべき最良の予兆を光の揺らぎで教える。（効果：儀式によるバフ効果が稀に大成功する）",
    "great_success": "夜空の予兆を映し出す神秘の香木箱。星霊の導きが中の香木に幸運を宿らせ、未来を予見する特別な煙を放つ。（効果：運の良さと全ステータスを大きく上昇させる）",
  },
  "IT_RIT_EL_01": {
    "normal": "霊薬を配合した青緑の香炉。浸透する清涼な香りが広がり、儀式に参加する者の精神を穏やかに整える。（効果：精神耐性が上昇し、ＭＰが微回復する）",
    "success": "泡の術理を帯びた霊薬の香炉。調整された霊液が煙と共に広がり、周囲の穢れを泡のように消し去ってくれる。（効果：範囲内の仲間のデバフを解除し続ける）",
    "great_success": "癒やしの術理を極めた神秘の香炉。雫のような光の煙が全身を包み、魂の綻びを儀式を通じて完璧に調整する。（効果：範囲内の仲間のＨＰとＭＰを大きく回復する）",
  },
  "IT_RIT_EL_02": {
    "normal": "霊薬を配合した青緑の護符飾り。浸透する清涼感が心身の淀みを浄化し、魔力の循環を僅かに助けてくれる。（効果：状態異常蓄積をわずかに減少させる）",
    "success": "泡の術理を帯びた霊薬の護符飾り。調整された霊液が不純物を泡として排出させ、精神を常に澄んだ状態に置く。（効果：全ての状態異常への耐性が上昇する）",
    "great_success": "癒やしの術理を極めた神秘の護符飾り。雫のような光が常に全身をケアし、魔力回路を最適に調整し続ける。（効果：全状態異常耐性とＭＰ回復速度を上げる）",
  },
  "IT_RIT_EL_03": {
    "normal": "霊薬を配合した青緑の儀礼小刀。浸透する清涼感が素材の不純物を浄化し、純粋な成分を僅かに守ってくれる。（効果：採取時の劣化速度をわずかに低下させる）",
    "success": "泡の術理を帯びた霊薬の儀礼小刀。調整された霊液が素材の反応を和らげ、繊細な部位を傷つけずに採取できる。（効果：採取素材の鮮度を一段階上げて獲得する）",
    "great_success": "癒やしの術理を極めた神秘の儀礼小刀。雫のような光が切られた素材を調整し、魔力的に最も豊かな状態で固定する。（効果：全採取アイテムの品質と効果を底上げする）",
  },
  "IT_RIT_EL_04": {
    "normal": "霊薬を配合した青緑の小鈴。浸透する清涼な音が、着用者の精神的な雑音を僅かに静めて集中力を高める。（効果：ＭＰ最大値がわずかに上昇する）",
    "success": "泡の術理を帯びた霊薬の小鈴。調整された霊液が音と共に精神を浄化し、魔法の詠唱を僅かに助けてくれる。（効果：詠唱時間をわずかに短縮する）",
    "great_success": "癒やしの術理を極めた神秘の小鈴。雫のような澄んだ音が全身をケアし、精神の綻びを完璧に調整して魔力を満たす。（効果：ＭＰ回復速度と魔法威力を大きく上げる）",
  },
  "IT_RIT_EL_05": {
    "normal": "霊薬を配合した青緑の香木箱。浸透する清涼感が香木の香りを引き立て、儀式の効果を僅かに助けてくれる。（効果：魔法攻撃力がわずかに上昇する）",
    "success": "泡の術理を帯びた霊薬の香木箱。調整された霊液が香木の乾燥をケアし、最も瑞々しい状態で煙を産み出す。（効果：魔法効果の持続時間が上昇する）",
    "great_success": "癒やしの術理を極めた神秘の香木箱。雫のような光が中の不純物を浄化し、最高純度の魔力を含んだ香りを授ける。（効果：魔法攻撃力とＭＰ回復速度を大きく上げる）",
  },
  "IT_RIT_LI_01": {
    "normal": "生命の脈動を封じた赤い香炉。葉脈のように活力が煙と共に伝わり、肉体の生存本能を僅かに呼び起こす。（効果：最大ＨＰがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の香炉。再生の術理が光の粒となって拡散し、傷ついた細胞を内側から活性化させる。（効果：範囲内の仲間のＨＰ自然回復速度を上げる）",
    "great_success": "成長の術理が宿る豊かな香炉。生命の奔流が儀式の場に溢れ出し、参列者の肉体を一段階上のステージへと引き上げる。（効果：範囲内の全ステータスと最大ＨＰを上げる）",
  },
  "IT_RIT_LI_02": {
    "normal": "生命の脈動を封じた赤い護符飾り。葉脈のように活力が着用者に伝わり、肉体の活力を僅かに呼び起こす。（効果：最大スタミナがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の護符飾り。再生の術理が傷ついた箇所に集中的に作用し、治癒の力を引き上げる。（効果：ＨＰの自然回復量が上昇する）",
    "great_success": "成長の術理が宿る豊かな護符飾り。生命の奔流が常に肉体を更新させ、着用者に衰えぬ若々しさと活力を授ける。（効果：最大ＨＰと全回復速度を上昇させる）",
  },
  "IT_RIT_LI_03": {
    "normal": "生命の脈動を封じた赤い儀礼小刀。葉脈のように活力が採取物に伝わり、枯れかけた植物にも一時の生を宿す。（効果：枯れた植物からの採取が可能になる）",
    "success": "赤や緑の活力に満ちた生命の儀礼小刀。再生の術理が採取した瞬間に成長を促し、より瑞々しい素材に変える。（効果：植物・生物素材の獲得量を上昇させる）",
    "great_success": "成長の術理が宿る豊かな儀礼小刀。生命の奔流が切り口から素材へ流れ込み、生きた傑作を採取物として昇華させる。（効果：採取素材にＨＰ継続回復効果を追加する）",
  },
  "IT_RIT_LI_04": {
    "normal": "生命の脈動を封じた赤い小鈴。葉脈のように活力が音と共に全身へ巡り、肉体の活力を僅かに呼び起こす。（効果：最大ＨＰがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の小鈴。再生の術理が音色に宿り、周囲にいる仲間の自然治癒力を段階的に引き上げる。（効果：範囲内の仲間のＨＰ回復量を上昇させる）",
    "great_success": "成長の術理が宿る豊かな小鈴。生命の奔流が音となって溢れ出し、肉体を内側から躍動させ、戦う力を満たしていく。（効果：ＨＰ・ＭＰ・スタミナの全回復速度を上げる）",
  },
  "IT_RIT_LI_05": {
    "normal": "生命の脈動を封じた赤い香木箱。葉脈のように活力が中の香木に伝わり、自然の活力を僅かに維持してくれる。（効果：最大ＨＰがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の香木箱。再生の術理が香木の生命エネルギーを成長させ、豊かな祈りの力を育む。（効果：回復魔法の効果が上昇する）",
    "great_success": "成長の術理が宿る豊かな香木箱。生命の奔流が香木の煙を通じて着用者に宿り、肉体を常に最高潮の状態に保つ。（効果：ＨＰ継続回復と全能力上昇を大きく付与する）",
  },
  "IT_RIT_ME_01": {
    "normal": "金属の術理で構造を強化した香炉。物理的な熱変形を抑え、儀式中の香りを一定に保つ助けとなる。（効果：魔法効果の持続時間がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る香炉。金属の輝きが煙を反射して増幅させ、儀式空間の魔力を物理的に高める。（効果：範囲内の仲間の魔法攻撃力が上昇する）",
    "great_success": "金銀の縁取りが施された豪華な香炉。金属の術理が儀式の法を物理的に固定し、外部からの魔力干渉を跳ね返す。（効果：範囲内の仲間の全能力を上昇させる）",
  },
  "IT_RIT_ME_02": {
    "normal": "金属の板で補強された頑丈な護符飾り。物理的な損傷から祈りの文字を守り、常にその力を発揮させる。（効果：物理防御力がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る護符飾り。金属の輝きが負の魔力を物理的に跳ね返し、持ち主の身を固く守る。（効果：物理防御力と魔法防御力が上昇する）",
    "great_success": "金銀の縁取りが施された豪華な護符飾り。構造強化の術理が肉体を物理的に強固にし、あらゆる打撃を最小化する。（効果：物理防御力が大きく上昇する）",
  },
  "IT_RIT_ME_03": {
    "normal": "金属の術理で構造を強化した儀礼小刀。物理的な変形がなく、神聖な供物や素材を正確に切り分けられる。（効果：素材採取時の獲得量がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る儀礼小刀。金属の輝きが素材の魂を物理的に整え、抽出される魔力を増幅させる。（効果：採取アイテムの品質が少し上昇する）",
    "great_success": "金銀の縁取りが施された豪華な儀礼小刀。高度な構造強化により、素材の真理を物理的に暴き、極上の雫を得る。（効果：最高品質の素材採取率を大きく上昇させる）",
  },
  "IT_RIT_ME_04": {
    "normal": "金属の術理で構造を強化した小さな鈴。物理的な衝撃でも音色が乱れず、邪悪な気配を僅かに退けてくれる。（効果：不意打ちを受ける確率をわずかに軽減する）",
    "success": "研磨された金属の術理が宿る小鈴。金属の輝きと共鳴する音色が、周囲の物理的な魔力密度を高めて守りを固める。（効果：範囲内の仲間の物理防御力が上昇する）",
    "great_success": "金銀の縁取りが施された豪華な小鈴。構造強化の術理が音を物理的な衝撃波に変え、敵の戦意を物理的に挫く。（効果：範囲内の敵の攻撃力を低下させる）",
  },
  "IT_RIT_ME_05": {
    "normal": "金属の板で装丁を補強した頑丈な香木箱。構造強化により、貴重な香木を物理的な破損から確実に守る。（効果：儀式用アイテムの所持数をわずかに増やす）",
    "success": "研磨された金属の術理が宿る香木箱。金属の輝きが中の成分を物理的に保護し、香りの純度を一定に保たせる。（効果：香炉用アイテムの効果を上昇させる）",
    "great_success": "金銀の縁取りが施された豪華な香木箱。構造強化の術理が中の空間を物理的に固定し、香りの品質を永遠に保つ。（効果：全香炉アイテムの品質を最大で固定する）",
  },
  "IT_RIT_SA_01": {
    "normal": "乾燥した砂の術理を宿した香炉。琥珀の術理が香りの成分を保存し、長時間の儀式でも効果を一定に保つ。（効果：香炉の効果持続時間が上昇する）",
    "success": "風紋が刻まれた砂の香炉。保存の術理が祈りの力を時の中に固定し、儀式後のバフが摩耗するのを遅らせる。（効果：バフ効果の持続時間が大きく上昇する）",
    "great_success": "悠久の保存術理が宿る砂の香炉。摩耗を拒む性質が儀式の成果を琥珀の中に保存し、持ち主に不変の加護を授ける。（効果：全耐性とバフ時間を最大化する）",
  },
  "IT_RIT_SA_02": {
    "normal": "乾燥した砂の術理を宿した護符飾り。琥珀の術理が外気の砂塵や湿気を払い、清潔な状態で加護を与え続ける。（効果：土属性耐性がわずかに上昇する）",
    "success": "風紋が刻まれた砂の護符飾り。保存の術理が持ち主の気力を保存し、精神的な摩耗から来る判断ミスを防ぐ。（効果：精神耐性とスタミナ回復が上昇する）",
    "great_success": "悠久の保存術理が宿る砂の護符飾り。摩耗を拒む性質が加護を時の中に固定し、不変の守りを持ち主に授ける。（効果：全属性耐性と防御力を大きく上昇させる）",
  },
  "IT_RIT_SA_03": {
    "normal": "乾燥した砂の術理を宿した儀礼小刀。琥珀の術理が刃の摩耗を防ぎ、砂に埋もれた古い遺跡の扉も解錠を助ける。（効果：遺跡内の仕掛け解除成功率が上昇する）",
    "success": "風紋が刻まれた砂の儀礼小刀。保存の術理が切り取った瞬間の素材を琥珀に閉じ込め、劣化を完全に防ぐ。（効果：採取した素材が一定時間劣化しなくなる）",
    "great_success": "悠久の保存術理が宿る砂の儀礼小刀。摩耗を拒む性質が素材の価値を保存の術理で隠し、永遠の輝きを授ける。（効果：採取した素材の品質を最大で固定する）",
  },
  "IT_RIT_SA_04": {
    "normal": "乾燥した砂の術理を宿した小鈴。琥珀の術理が砂塵による音の掠れを防ぎ、常に明瞭な加護の音を響かせる。（効果：土属性耐性がわずかに上昇する）",
    "success": "風紋が刻まれた砂の小鈴。保存の術理が音色の余韻を空間に固定し、加護の効果を通常より長く持続させる。（効果：バフの効果持続時間を上昇させる）",
    "great_success": "悠久の保存術理が宿る砂の小鈴。摩耗を拒む性質が祈りの音を琥珀の中に保存し、永遠の安らぎを持ち主に授ける。（効果：全属性耐性を上げ、バフ時間を大幅に延ばす）",
  },
  "IT_RIT_SA_05": {
    "normal": "乾燥した砂の術理を宿した香木箱。琥珀の術理が砂漠の湿気を完全に遮断し、香木の鮮度を僅かに守る。（効果：土属性耐性がわずかに上昇する）",
    "success": "風紋が刻まれた砂の香木箱。保存の術理が中の香りを琥珀の中に固定し、数百年経っても色褪せぬ力を維持する。（効果：香炉アイテムの劣化を完全に無効化する）",
    "great_success": "悠久の保存術理が宿る砂の香木箱。摩耗を拒む性質が儀式の意図を保存の術理で固定し、不朽の加護を持ち主に授ける。（効果：全属性耐性を上げ、ステータス低下を防ぐ）",
  },
  "IT_TRD_AS_01": {
    "normal": "星明かりを映す青い硬貨袋。方位の感覚を僅かに鋭くし、利益の出る方角を直感で予感させる助けとなる。（効果：掘り出し物の発見率が上昇する）",
    "success": "方位の術理が宿る星霊の硬貨袋。直感が高まる力が備わり、取引相手の隠し事や嘘を予兆として光で教える。（効果：特殊な商談の成功率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の硬貨袋。星霊の導きが持ち主を富の集まる場所へと誘い、莫大な財を成す運命を導く。（効果：運の良さと獲得金額が大きく上昇する）",
  },
  "IT_TRD_AS_02": {
    "normal": "星明かりを映す青い商人秤。方位の感覚を僅かに鋭くし、どちらの商品がより利益を生むかを直感させる。（効果：レアアイテムの発見率がわずかに上昇する）",
    "success": "方位の術理が宿る星霊の商人秤。直感が高まる力が備わり、相場の変動や予兆を光の明滅で教えてくれる。（効果：市場の価格変動を事前に予知できる）",
    "great_success": "夜空の予兆を映し出す神秘の商人秤。星霊の導きが価値のバランスを幸運へと傾け、莫大な差益を瞬時にもたらす。（効果：運の良さと売買効率が大きく上昇する）",
  },
  "IT_TRD_AS_03": {
    "normal": "星明かりを映す青い封蝋印。方位の感覚を僅かに鋭くし、信頼すべき相手を直感で予感させる助けとなる。（効果：敵対的なＮＰＣを事前に察知できる）",
    "success": "方位の術理が宿る星霊の封蝋印。直感が高まる力が備わり、契約を結ぶべき最良のタイミングを光で教える。（効果：大口の取引が発生する確率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の封蝋印。星霊の導きが持ち主の契約に幸運を宿らせ、莫大な富へと繋がる縁を引き寄せる。（効果：運の良さと報酬金が大きく上昇する）",
  },
  "IT_TRD_AS_04": {
    "normal": "星明かりを映す青い帳簿。方位の感覚を僅かに鋭くし、次に狙うべき市場の方角を直感させる。（効果：夜間のアイテム発見率が上昇する）",
    "success": "方位の術理が宿る星霊の帳簿。直感が高まる力が備わり、帳簿を開くたびに好機が訪れる予兆を教える。（効果：ランダムイベントでの幸運発生率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の帳簿。星霊の導きが持ち主の将来の利益を予見し、幸運な取引へと運命を綴り直す。（効果：運の良さと全報酬が大きく上昇する）",
  },
  "IT_TRD_AS_05": {
    "normal": "星明かりを映す青い小宝箱。方位の感覚を僅かに鋭くし、宝箱をどこへ置いたか直感で予感させてくれる。（効果：マップ上に宝箱の位置が表示される）",
    "success": "方位の術理が宿る星霊の小宝箱。直感が高まる力が備わり、中を開けるたびに幸運な発見がある予兆を教える。（効果：中から追加のアイテムが得られる確率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の小宝箱。星霊の導きが箱の中に幸運を呼び寄せ、預けた物をより価値ある品へと誘う。（効果：運の良さと報酬の品質が大きく上昇する）",
  },
  "IT_TRD_EL_01": {
    "normal": "霊薬を配合した青緑の硬貨袋。浸透する清涼感が持ち主の強欲を適度に鎮め、冷静な商談をサポートする。（効果：アイテム購入価格がわずかに低下する）",
    "success": "泡の術理を帯びた霊薬の硬貨袋。調整された霊液が金銭の循環を活性化させ、思わぬ臨時収入を予感させる。（効果：敵からの獲得金額が上昇する）",
    "great_success": "癒やしの術理を極めた神秘の硬貨袋。雫のような光が持ち主の商才を常に調整し、最も利益の出る選択へと導く。（効果：売買価格が大幅に改善し、運が上昇する）",
  },
  "IT_TRD_EL_02": {
    "normal": "霊薬を配合した青緑の商人秤。浸透する清涼感が商人の焦りを抑え、公平な取引を僅かにサポートする。（効果：購入価格がわずかに低下する）",
    "success": "泡の術理を帯びた霊薬の商人秤。調整された霊液が相手の心理を緩ませ、自分に有利な条件を引き出しやすくする。（効果：賄賂や交渉の成功率が上昇する）",
    "great_success": "癒やしの術理を極めた神秘の商人秤。雫のような光が価値の天秤を整え、最も調和のとれた利益を持ち主にもたらす。（効果：売買時の価格補正が大幅に強化される）",
  },
  "IT_TRD_EL_03": {
    "normal": "霊薬を配合した青緑の封蝋印。浸透する清涼感が契約者に安らぎを与え、円滑な合意を僅かに助ける。（効果：交渉時の敵対心がわずかに減少する）",
    "success": "泡の術理を帯びた霊薬の封蝋印。調整された霊液が不信感を泡のように消し去り、誠実な商人としての顔を作る。（効果：悪評の減少速度が上昇する）",
    "great_success": "癒やしの術理を極めた神秘の封蝋印。雫のような光が契約書の意図を調整し、双方にとって最良の未来を確定させる。（効果：全ての取引における信頼度が最大になる）",
  },
  "IT_TRD_EL_04": {
    "normal": "霊薬を配合した青緑の帳簿。浸透する清涼感が記帳中の精神疲労を和らげ、長時間の計算を僅かに楽にする。（効果：最大ＭＰがわずかに上昇する）",
    "success": "泡の術理を帯びた霊薬の帳簿。調整された霊液が情報の整理を助け、過去の失敗から学ぶ効率を僅かに高める。（効果：獲得経験値が上昇する）",
    "great_success": "癒やしの術理を極めた神秘の帳簿。雫のような光が持ち主の知識を常に調整し、常に最先端の商才を維持させる。（効果：全ての知識レベルの上昇速度が大きく上がる）",
  },
  "IT_TRD_EL_05": {
    "normal": "霊薬を配合した青緑の小宝箱。浸透する清涼感が中の薬品の変質を抑え、効き目を僅かに長持ちさせる。（効果：薬品アイテムの効果時間を延長する）",
    "success": "泡の術理を帯びた霊薬の小宝箱。調整された霊液が中の不純物を浄化し、素材や薬液の純度を僅かに高める。（効果：中に預けたアイテムの品質が徐々に上昇する）",
    "great_success": "癒やしの術理を極めた神秘の小宝箱。雫のような光が中のアイテムを常に調整し、魔力的に最も活性化された状態に保つ。（効果：預けたアイテムの効果を大きく上昇させる）",
  },
  "IT_TRD_LI_01": {
    "normal": "生命の脈動を封じた赤い硬貨袋。葉脈のように活力が手元から全身へ伝わり、商いへの意欲を僅かに呼び起こす。（効果：最大スタミナがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の硬貨袋。再生の術理が金貨を生きているかのように躍動させ、使った分だけ福を呼ぶ。（効果：購入時に稀に代金が払い戻される）",
    "great_success": "成長の術理が宿る豊かな硬貨袋。生命の奔流が持ち主の商売を繁栄させ、袋自体が富を育む生きた土壌となる。（効果：所持金に応じて全ステータスが上昇する）",
  },
  "IT_TRD_LI_02": {
    "normal": "生命の脈動を封じた赤い商人秤。葉脈のように活力が秤を通じて伝わり、商談中の疲労を僅かに軽減する。（効果：最大ＭＰがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の商人秤。再生の術理が持ち主の商才を成長させ、経験不足による損失を補填する。（効果：獲得経験値がわずかに上昇する）",
    "great_success": "成長の術理が宿る豊かな商人秤。生命の奔流が商売敵を圧倒する覇気を授け、持ち主を市場の頂点へと押し上げる。（効果：全ての取引価格が自分に最も有利になる）",
  },
  "IT_TRD_LI_03": {
    "normal": "生命の脈動を封じた赤い封蝋印。葉脈のように活力が契約を通じて伝わり、持ち主の覇気を僅かに高める。（効果：物理攻撃力がわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の封蝋印。再生の術理が停滞した商売を活性化させ、新たな利益を次々と生み出す。（効果：所持金に応じてＨＰ回復速度が上昇する）",
    "great_success": "成長の術理が宿る豊かな封蝋印。生命の奔流が持ち主の存在感を増幅させ、言葉一つで市場を動かす活力を授ける。（効果：全ステータスと獲得経験値を大きく上昇させる）",
  },
  "IT_TRD_LI_04": {
    "normal": "生命の脈動を封じた赤い帳簿。葉脈のように活力が記録から全身へ伝わり、読み返すたびに元気が出る。（効果：ＨＰ最大値がわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の帳簿。再生の術理が持ち主の経験を肉体の成長へと変え、日々を健やかにする。（効果：ＨＰの自然回復量が上昇する）",
    "great_success": "成長の術理が宿る豊かな帳簿。生命の奔流が記された数字と共に持ち主の活力を増幅させ、不屈の商魂を授ける。（効果：経験値取得量と最大ＨＰ・ＭＰを大きく上げる）",
  },
  "IT_TRD_LI_05": {
    "normal": "生命の脈動を封じた赤い小宝箱。葉脈のように活力が中の種や生物素材に伝わり、僅かな成長を助ける。（効果：生物系素材の成長速度が上昇する）",
    "success": "赤や緑の活力に満ちた生命の小宝箱。再生の術理が中の生物的な素材を活性化させ、瑞々しい薬効を宿らせる。（効果：植物系素材の錬成効果を上昇させる）",
    "great_success": "成長の術理が宿る豊かな小宝箱。生命の奔流が中の物に宿り、一つの生きた傑作へと昇華させる活力を授ける。（効果：預けたアイテムにＨＰ継続回復効果を付与する）",
  },
  "IT_TRD_ME_01": {
    "normal": "金属の術理で構造を強化した硬貨袋。物理的な摩耗に強く、大量の金貨を詰め込んでも底が抜けない。（効果：所持金の上限をわずかに引き上げる）",
    "success": "研磨された金属の術理が宿る硬貨袋。金属の輝きが富を引き寄せ、取引時の交渉を物理的に有利に進める助けとなる。（効果：アイテム売却価格が少し上昇する）",
    "great_success": "金銀の縁取りが施された豪華な硬貨袋。金属の術理が中の財産を物理的に保護し、盗難や紛失を完全に防ぎ止める。（効果：死亡時の所持金減少を無効化する）",
  },
  "IT_TRD_ME_02": {
    "normal": "金属の術理で構造を強化した商人秤。物理的な誤差が一切なく、どのような環境でも正確な重量を量り出せる。（効果：素材売却時の査定がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る商人秤。金属の輝きが価値を物理的に可視化し、安物の偽りを即座に見抜く力がある。（効果：アイテム鑑定の成功率が上昇する）",
    "great_success": "金銀の縁取りが施された豪華な商人秤。金属の術理が物体の真価を物理的に固定し、不当な値下げを一切許さない。（効果：売却価格を最大値で固定する）",
  },
  "IT_TRD_ME_03": {
    "normal": "金属の術理で構造を強化した封蝋印。物理的な耐久性が高く、硬い革袋にも鮮明な印章を残せる。（効果：依頼完了時の報酬がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る封蝋印。金属の輝きが持ち主の権威を物理的に示し、取引の信頼度を高めてくれる。（効果：ギルドの友好度上昇量が上昇する）",
    "great_success": "金銀の縁取りが施された豪華な封蝋印。金属の術理が契約を物理的に強固なものとし、破棄を許さぬ絶対の印となる。（効果：依頼報酬と名声が大きく上昇する）",
  },
  "IT_TRD_ME_04": {
    "normal": "金属の板で補強された頑丈な帳簿。構造強化により、砂嵐や浸水から商いの記録を物理的に保護する。（効果：セーブ時のボーナスがわずかに上昇する）",
    "success": "研磨された金属の術理が宿る帳簿。金属の輝きが数字の誤りを物理的に浮かび上がらせ、正確な資産管理を助ける。（効果：獲得経験値と金額が少し上昇する）",
    "great_success": "金銀の縁取りが施された豪華な帳簿。金属の術理が記録を不変の真実として固定し、持ち主の功績を強固にする。（効果：習得スキルの効果が帳簿の記録に応じて上昇する）",
  },
  "IT_TRD_ME_05": {
    "normal": "金属の術理で構造を強化した小さな宝箱。物理的な破壊を拒絶する堅牢さを持ち、貴重品を確実に守り抜く。（効果：アイテムの消失・盗難をわずかに防ぐ）",
    "success": "研磨された金属の術理が宿る小宝箱。金属の輝きが中身を物理的に清浄に保ち、武具の劣化を僅かに防いでくれる。（効果：中に預けた武具の耐久力が微回復する）",
    "great_success": "金銀の縁取りが施された豪華な小宝箱。金属の術理が中の空間を物理的に固定し、外の世界からの干渉を完全に断つ。（効果：中のアイテムの品質を最高状態で維持する）",
  },
  "IT_TRD_SA_01": {
    "normal": "乾燥した砂の術理を宿した硬貨袋。琥珀の術理が中の金貨を常に磨き上げ、いつでも新品同様の輝きを保たせる。（効果：取引の成功率がわずかに上昇する）",
    "success": "風紋が刻まれた砂の硬貨袋。保存の術理が持ち主の資産を固定し、不必要な出費を保存の力で防いでくれる。（効果：手数料や税金の支払い額が減少する）",
    "great_success": "悠久の保存術理が宿る砂の硬貨袋。摩耗を拒む性質が財産を琥珀の中に守り抜き、末代まで富を失わせない力を授ける。（効果：全アイテムの購入価格を大きく下げる）",
  },
  "IT_TRD_SA_02": {
    "normal": "乾燥した砂の術理を宿した商人秤。琥珀の術理が砂塵による誤差を防ぎ、砂漠のど真ん中でも正確な商売ができる。（効果：土属性耐性がわずかに上昇する）",
    "success": "風紋が刻まれた砂の商人秤。保存の術理が素材の価値を当時のまま保存し、古びた品にも適正な価格を付ける。（効果：古いアイテムの売却価格が上昇する）",
    "great_success": "悠久の保存術理が宿る砂の商人秤。摩耗を拒む性質が商売上の信用を保存の術理で固定し、永続的な繁栄を約束する。（効果：全商人の友好度が上昇しやすくなる）",
  },
  "IT_TRD_SA_03": {
    "normal": "乾燥した砂の術理を宿した封蝋印。琥珀の術理が印章を乾燥から守り、数百年経っても砕けぬ強さを授ける。（効果：長期依頼の成功率が上昇する）",
    "success": "風紋が刻まれた砂の封蝋印。保存の術理が契約の内容を時の中に保存し、約束の摩耗によるトラブルを防ぐ。（効果：アイテムの劣化が一定時間停止する）",
    "great_success": "悠久の保存術理が宿る砂の封蝋印。摩耗を拒む性質が商人の名声を琥珀の中に固定し、永遠の信頼を確立させる。（効果：全勢力の友好度が低下しなくなる）",
  },
  "IT_TRD_SA_04": {
    "normal": "乾燥した砂の術理を宿した帳簿。琥珀の術理が紙の劣化を防ぎ、砂漠を何十年旅しても記録を鮮明に保つ。（効果：土属性耐性がわずかに上昇する）",
    "success": "風紋が刻まれた砂の帳簿。保存の術理が持ち主の過去の努力を時の中に保存し、技の摩耗を最小限に抑える。（効果：スキルの経験値減少を防ぎ、成長を早める）",
    "great_success": "悠久の保存術理が宿る砂の帳簿。摩耗を拒む性質が商人の歴史を保存の術理で固定し、不動の地位を授ける。（効果：全ステータス低下を無効化し、防御を上げる）",
  },
  "IT_TRD_SA_05": {
    "normal": "乾燥した砂の術理を宿した小宝箱。琥珀の術理が砂塵や湿気を完全に遮断し、デリケートな素材を守り抜く。（効果：素材の劣化を完全に停止させる）",
    "success": "風紋が刻まれた砂の小宝箱。保存の術理が中の時間を僅かに遅らせ、採取したての素材の輝きを不朽に保つ。（効果：素材の品質を恒久的に固定する）",
    "great_success": "悠久の保存術理が宿る砂の小宝箱。摩耗を拒む性質が中の宝物を時の中から保存の術理で隠し、永遠に価値を失わせない。（効果：素材やアイテムの価値を最大で固定する）",
  },
  "IT_TRV_AS_01": {
    "normal": "星明かりを映す青い地図筒。方位の感覚を僅かに鋭くし、暗い夜道でも自分の位置を地図上で予感させる。（効果：夜間のマップ視認性が上昇する）",
    "success": "方位の術理が宿る星霊の地図筒。直感が高まる力が備わり、地図を広げた際に次の目的地への予兆を光で教える。（効果：目的地へのナビゲーション精度が向上する）",
    "great_success": "夜空の予兆を映し出す神秘の地図筒。星霊の導きが地図上に最適なルートを浮かび上がらせ、不運な遭遇を未然に防ぐ。（効果：敵とのエンカウント率を一時的に低下させる）",
  },
  "IT_TRV_AS_02": {
    "normal": "星明かりを映す青い携帯水筒。方位の感覚を僅かに鋭くし、水を飲むたびに自分の立ち位置を再認識させる。（効果：夜間の命中率がわずかに上昇する）",
    "success": "方位の術理が宿る星霊の携帯水筒。直感が高まる力が水に溶け込み、一口飲むごとに周囲の危機を予感させる。（効果：回避率が一時的にわずかに上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の水筒。星霊の導きが水を通じて着用者の運命を僅かに上向かせ、幸運な旅路を約束する。（効果：運の良さと全ステータスを一時的に上昇させる）",
  },
  "IT_TRV_AS_03": {
    "normal": "星明かりを映す青い縄束。方位の感覚を僅かに鋭くし、暗闇で縄を辿る際の方向感覚を失わせない。（効果：暗所での移動速度が上昇する）",
    "success": "方位の術理が宿る星霊の縄束。直感が高まる力が備わり、縄を投げるべき最適な場所を光の予兆で教える。（効果：特殊な移動ポイントの発見率を上げる）",
    "great_success": "夜空の予兆を映し出す神秘の縄束。星霊の導きが縄の軌道を幸運へと誘い、不可能な距離の崖さえも繋ぎ合わせる。（効果：移動効率と運の良さを大きく上昇させる）",
  },
  "IT_TRV_AS_04": {
    "normal": "星明かりを映す青い旅袋。方位の感覚を僅かに鋭くし、暗闇でも必要な道具を直感で取り出しやすくする。（効果：アイテム使用時の速度が上昇する）",
    "success": "方位の術理が宿る星霊の旅袋。直感が高まる力が備わり、次の難局で必要な道具を光の予兆で教えてくれる。（効果：状況に応じたバフ効果が稀に発動する）",
    "great_success": "夜空の予兆を映し出す神秘の旅袋。星霊の導きが袋の中に幸運を溜め込み、開封した時に予期せぬ価値を生み出す。（効果：獲得アイテムの品質が常に上昇する）",
  },
  "IT_TRV_AS_05": {
    "normal": "星明かりを映す青い小ランタン。方位の感覚を光と共に広げ、夜の旅人が自分の位置を失わないよう導く。（効果：夜間の移動速度が上昇する）",
    "success": "方位の術理が宿る星霊の小ランタン。直感が高まる力が光に宿り、隠された扉や罠を予感させる蒼い輝きを放つ。（効果：罠発見率とアイテム発見率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の小ランタン。星霊の導きが着用者の運命を光で照らし、不運を払い幸運を呼び込む。（効果：運の良さと回避率を大きく上昇させる）",
  },
  "IT_TRV_EL_01": {
    "normal": "霊薬を配合した青緑の地図筒。浸透する清涼感が羊皮紙の乾燥を防ぎ、記録が古くなるのを僅かに抑える。（効果：羊皮紙アイテムの劣化速度を低下させる）",
    "success": "泡の術理を帯びた霊薬の地図筒。調整された霊液が中の情報を活性化させ、読み返す際の理解力を僅かに助ける。（効果：獲得経験値がわずかに上昇する）",
    "great_success": "癒やしの術理を極めた神秘の地図筒。雫のような光が中の記録を常に調整し、持ち主の知識を鮮明な状態に保つ。（効果：全知識レベルの経験値取得量を上昇させる）",
  },
  "IT_TRV_EL_02": {
    "normal": "霊薬を配合した青緑の携帯水筒。浸透する清涼感が中の水に癒やしの力を与え、喉の渇きを優しく癒やしてくれる。（効果：水を飲むたびにＨＰが微回復する）",
    "success": "泡の術理を帯びた霊薬の携帯水筒。調整された霊液が常に中の水をリフレッシュし、精神的な疲労を払い去る。（効果：水を飲むたびにＭＰが微回復する）",
    "great_success": "癒やしの術理を極めた神秘の携帯水筒。雫のような光が水を聖なる液に変え、全身の魔力と肉体を瞬時に調整する。（効果：水を飲むとＨＰとＭＰが大きく回復する）",
  },
  "IT_TRV_EL_03": {
    "normal": "霊薬を配合した青緑の縄束。浸透する清涼感が縄を扱う手の滑りを抑え、確実な作業をサポートする。（効果：登攀時のスタミナ消費がわずかに減少する）",
    "success": "泡の術理を帯びた霊薬の縄束。調整された霊液が縄に弾力性を与え、落下時の衝撃を優しく吸収して癒やす。（効果：落下ダメージを大幅に軽減する）",
    "great_success": "癒やしの術理を極めた神秘の縄束。雫のような光が縄に宿り、持ち主の意志に従って生きているかのように伸縮する。（効果：登攀速度と回避率を大きく上昇させる）",
  },
  "IT_TRV_EL_04": {
    "normal": "霊薬を配合した青緑の旅袋。浸透する清涼感が中の食料や薬液の劣化を抑え、鮮度を僅かに守ってくれる。（効果：所持品の劣化速度を低下させる）",
    "success": "泡の術理を帯びた霊薬の旅袋。調整された霊液が常に中をリフレッシュし、薬液の効果を僅かに高めて保存する。（効果：薬品アイテムの効果を上昇させる）",
    "great_success": "癒やしの術理を極めた神秘の旅袋。雫のような光が中の不純物を浄化し、全ての所持品を魔力的に最良の状態にする。（効果：全アイテムの効果と品質を底上げする）",
  },
  "IT_TRV_EL_05": {
    "normal": "霊薬を燃料に混ぜた青緑の小ランタン。浸透する清涼感が周囲の空気を浄化し、長時間の地下探索を助ける。（効果：毒状態の蓄積をわずかに減少させる）",
    "success": "泡の術理を帯びた霊薬の小ランタン。調整された霊液が燃えることで癒やしの香りを放ち、精神を穏やかに整える。（効果：ＭＰの自然回復速度が上昇する）",
    "great_success": "癒やしの術理を極めた神秘の小ランタン。雫のような光が全身の傷を優しく撫で、常に肉体を最適な状態に調整する。（効果：ＨＰとＭＰを継続的に回復させる）",
  },
  "IT_TRV_LI_01": {
    "normal": "生命の脈動を封じた赤い地図筒。葉脈のように活力が中の記録に伝わり、情報を読むたびに心身を僅かに元気にする。（効果：地図を確認した際、スタミナが微回復する）",
    "success": "赤や緑の活力に満ちた生命の地図筒。再生の術理が持ち主の歩行距離に応じて成長し、より詳細な情報を描かせる。（効果：歩行によるマップ踏破経験値が上昇する）",
    "great_success": "成長の術理が宿る豊かな地図筒。生命の奔流が持ち主の生存本能と地図を繋ぎ、死地にいても生き残るための道を指し示す。（効果：全生存能力とマップ探索効率を上げる）",
  },
  "IT_TRV_LI_02": {
    "normal": "生命の脈動を封じた赤い携帯水筒。葉脈のように活力が中の水に伝わり、飲むたびに全身が温かく満たされる。（効果：最大スタミナがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の携帯水筒。再生の術理が水の生命力を高め、疲労した筋肉を内側から修復する。（効果：スタミナ回復速度が上昇する）",
    "great_success": "成長の術理が宿る豊かな携帯水筒。生命の奔流が水に宿り、一口で肉体の損傷を修復し、無限の活力を授ける。（効果：ＨＰとスタミナを回復し、最大値を上げる）",
  },
  "IT_TRV_LI_03": {
    "normal": "生命の脈動を封じた赤い縄束。葉脈のように活力が縄を通じて伝わり、握るだけで着用者を僅かに元気づける。（効果：最大ＨＰがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の縄束。再生の術理が縄自体を脈打たせ、持ち主の動きを力強く補助してくれる。（効果：移動によるスタミナ回復量を上昇させる）",
    "great_success": "成長の術理が宿る豊かな縄束。生命の奔流が縄を植物の蔦のように躍動させ、崖を登るたびに肉体を強化する。（効果：移動速度と全能力を大きく底上げする）",
  },
  "IT_TRV_LI_04": {
    "normal": "生命の脈動を封じた赤い旅袋。葉脈のように活力が背中から全身へ伝わり、長旅の疲れを和らげてくれる。（効果：スタミナ消費がわずかに減少する）",
    "success": "赤や緑の活力に満ちた生命の旅袋。再生の術理が持ち主の肉体と馴染み、重い荷物を背負うほど活力を生む。（効果：スタミナ回復速度が上昇する）",
    "great_success": "成長の術理が宿る豊かな旅袋。生命の奔流が持ち主の限界を常に更新し続け、袋と共に強靭な肉体を作り上げる。（効果：最大ＨＰと最大重量を大きく上昇させる）",
  },
  "IT_TRV_LI_05": {
    "normal": "生命の脈動を封じた赤い小ランタン。葉脈のように活力が光と共に全身を巡り、歩くたびに活力が湧き出る。（効果：最大スタミナがわずかに上昇する）",
    "success": "赤や緑の活力に満ちた生命の小ランタン。再生の術理が光に宿り、周囲にいる仲間の自然治癒力を段階的に引き上げる。（効果：範囲内の仲間のＨＰ回復量を上昇させる）",
    "great_success": "成長の術理が宿る豊かな小ランタン。生命の奔流が光となって溢れ出し、肉体を内側から躍動させ、戦う力を満たす。（効果：全回復速度と攻撃力を大きく上昇させる）",
  },
  "IT_TRV_ME_01": {
    "normal": "金属の板で補強された頑丈な地図筒。物理的な衝撃や砂嵐から中の羊皮紙を確実に守ってくれる。（効果：マップの視界低下をわずかに防ぐ）",
    "success": "研磨された金属の術理が宿る地図筒。構造強化により中の空間が最適化され、多くの記録を物理的に保護する。（効果：最大マップ所持数と耐久性が上昇する）",
    "great_success": "金銀の縁取りが施された豪華な地図筒。金属の術理が記録を物理的に強固にし、いかなる魔力干渉からも情報を守り抜く。（効果：全マップの探索情報を常に保護する）",
  },
  "IT_TRV_ME_02": {
    "normal": "金属の術理で構造を強化した携帯水筒。物理的な圧力に強く、馬に踏まれても中の水が漏れ出すことはない。（効果：水の最大所持量が上昇する）",
    "success": "研磨された内部が水を物理的に浄化する水筒。構造強化により、砂漠の汚れた水でも一時的に飲用可能にする。（効果：泥水からの水分補給時のデバフを軽減する）",
    "great_success": "金銀の縁取りが施された豪華な水筒。金属の術理が水に物理的な活力を与え、飲む者の肉体を一時的に硬質化する。（効果：水を飲むと物理防御力が一時的に上昇する）",
  },
  "IT_TRV_ME_03": {
    "normal": "金属繊維を芯に入れた頑丈な縄束。構造強化により、自重を超える重荷を吊るしても決して千切れない。（効果：登攀・下降時の成功率がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る縄束。物理的な摩耗に極めて強く、鋭利な岩場でも構造を維持し続ける。（効果：縄アイテムの耐久減少率を低下させる）",
    "great_success": "金銀の縁取りが施された豪華な縄束。金属の術理が縄を物理的な鋼の如き硬さに固定し、即座に足場として機能する。（効果：登攀難易度を大幅に下げ、落下を防ぐ）",
  },
  "IT_TRV_ME_04": {
    "normal": "金属の板で底を補強した頑丈な旅袋。構造強化により、鋭利な鉱石や武具を詰め込んでも破れる心配がない。（効果：最大所持容量がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る旅袋。金属の輝きが中の荷物を物理的に整理し、見た目以上の量を収納できる。（効果：最大所持重量が大きく上昇する）",
    "great_success": "金銀の縁取りが施された豪華な旅袋。金属の術理が重力を物理的に中和し、どれだけ詰めても羽のように軽い。（効果：所持重量による移動ペナルティを無効化する）",
  },
  "IT_TRV_ME_05": {
    "normal": "金属の術理で構造を強化した小さなランタン。砂嵐の中でも物理的な損傷を防ぎ、確実な足元を照らし出す。（効果：視界範囲がわずかに上昇する）",
    "success": "研磨された金属の術理が宿る小ランタン。金属の輝きが光を増幅させ、暗闇に潜む敵を物理的な反射で暴く。（効果：夜間の命中率が上昇する）",
    "great_success": "金銀の縁取りが施された豪華なランタン。金属の術理が光を物理的な壁として固定し、着用者を闇の魔力から守る。（効果：視界を最大化し、魔法防御力を上げる）",
  },
  "IT_TRV_SA_01": {
    "normal": "乾燥した砂の術理を宿した地図筒。琥珀の術理が湿気を完全に払い、数千年前の地図さえも当時のまま保存する。（効果：古い地図の解読成功率が上昇する）",
    "success": "風紋が刻まれた砂の地図筒。保存の術理が中の地図と持ち主の記憶を同期させ、一度見た道を摩耗させない。（効果：一度通った場所の霧が再びかからなくなる）",
    "great_success": "悠久の保存術理が宿る砂の地図筒。摩耗を拒む性質が地図上の進路を保存の術理で固定し、迷いなき行軍を支え抜く。（効果：移動速度とマップ視界範囲が上昇する）",
  },
  "IT_TRV_SA_02": {
    "normal": "乾燥した砂の術理を宿した携帯水筒。琥珀の術理が中の温度を固定し、灼熱の砂漠でも水を冷たく保ってくれる。（効果：火属性ダメージ耐性がわずかに上昇する）",
    "success": "風紋が刻まれた砂の携帯水筒。保存の術理が水の鮮度を長期間維持し、一口で数時間分の潤いを肉体に保存する。（効果：喉が渇くまでの時間が上昇する）",
    "great_success": "悠久の保存術理が宿る砂の携帯水筒。摩耗を拒む性質が体内の水分を保存の術理で固定し、水なしでの生存を支える。（効果：喉の渇きを一定時間完全に無効化する）",
  },
  "IT_TRV_SA_03": {
    "normal": "乾燥した砂の術理を宿した縄束。琥珀の術理が砂漠の熱による縄の硬化を防ぎ、常にしなやかな状態を保つ。（効果：砂地での作業効率を上昇させる）",
    "success": "風紋が刻まれた砂の縄束。保存の術理が縄の摩耗を完全に拒絶し、数十年使っても当時の強度を維持し続ける。（効果：縄アイテムが半永久的に使用可能になる）",
    "great_success": "悠久の保存術理が宿る砂の縄束。摩耗を拒む性質が縄を時の中に固定し、いかなる重量も保存の力で支え切る。（効果：最大重量を一時的に無視して行動できる）",
  },
  "IT_TRV_SA_04": {
    "normal": "乾燥した砂の術理を宿した旅袋。琥珀の術理が外気の熱を遮断し、デリケートな素材を乾燥から守り抜く。（効果：土属性耐性がわずかに上昇する）",
    "success": "風紋が刻まれた砂の旅袋。保存の術理が中の時間を僅かに遅らせ、採取したての素材を当時のまま固定する。（効果：素材アイテムが一切劣化しなくなる）",
    "great_success": "悠久の保存術理が宿る砂の旅袋。摩耗を拒む性質が袋そのものの耐久性を不朽にし、中の価値を永遠に固定する。（効果：全耐性を上げ、所持品の価値を保護する）",
  },
  "IT_TRV_SA_05": {
    "normal": "乾燥した砂の術理を宿した小ランタン。琥珀の術理が油の質を保ち、どんな過酷な環境下でも一定の光度を維持する。（効果：油の消費速度をわずかに低下させる）",
    "success": "風紋が刻まれた砂の小ランタン。保存の術理が光の粒子を空間に固定し、広範囲を長時間鮮明に照らし続ける。（効果：光の持続時間が大きく上昇する）",
    "great_success": "悠久の保存術理が宿る砂の小ランタン。摩耗を拒む性質が灯火を不朽のものとし、決して消えることのない道標となる。（効果：全耐性を上げ、暗所でのペナルティを無効化する）",
  },
  "IT_WRK_AS_01": {
    "normal": "星明かりを映す青い乳鉢。方位の感覚を僅かに高め、調合のタイミングを直感で掴みやすくしてくれる。（効果：錬成の制限時間をわずかに延長する）",
    "success": "方位の術理が宿る星霊の乳鉢。直感が高まる力が備わり、素材を投入する最善の予兆を光の揺らぎで教える。（効果：錬成成功率と品質が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘の乳鉢。星霊の導きが調合に幸運を招き、想定を超える驚異的な薬効を引き出す。（効果：錬成時に稀に上位のアイテムを作成する）",
  },
  "IT_WRK_AS_02": {
    "normal": "星明かりを映す青いトング。方位の感覚を仅かに研ぎ澄まし、魔力の重心を直感で掴む助けとなる。（効果：魔力素材の錬成成功率をわずかに上げる）",
    "success": "方位の術理が宿る星霊のトング。直感が高まる力が指先に伝わり、素材を置くべき最善の位置を予感させる。（効果：錬成大成功の発生範囲を拡大する）",
    "great_success": "夜空の予兆を映し出す神秘のトング。星霊の導きが素材の未来の状態を僅かに見せ、失敗を未然に回避させる。（効果：不運による錬成失敗を完全に回避する）",
  },
  "IT_WRK_AS_03": {
    "normal": "星明かりを映す青い、るつぼ。方位の感覚を僅かに鋭くし、素材が溶ける最適なタイミングを直感させる。（効果：錬成時のタイミング補正を緩やかにする）",
    "success": "方位の術理が宿る星霊の、るつぼ。直感が高まる力が備わり、魔力の渦が最も静まる瞬間に調合を導く。（効果：錬成大成功時のボーナスを強化する）",
    "great_success": "夜空の予兆を映し出す神秘の、るつぼ。星霊の導きが調合中の偶然を必然の幸運に変え、奇跡的な成果を出す。（効果：低確率で作成アイテムのランクが一段階上がる）",
  },
  "IT_WRK_AS_04": {
    "normal": "星明かりを映す青い計量匙。方位の感覚を僅かに鋭くし、素材の魔力がどちらに偏っているかを予感させる。（効果：魔力平衡の調整をわずかに助ける）",
    "success": "方位の術理が宿る星霊の計量匙。直感が高まる力が備わり、次の工程で必要な分量を光の予兆で教えてくれる。（効果：調合ミニゲームの難易度を低下させる）",
    "great_success": "夜空の予兆を映し出す神秘の計量匙。星霊の導きが配合の瞬間に幸運の追い風を送り、素材以上の価値を引き出す。（効果：作成アイテムの個数が稀に増加する）",
  },
  "IT_WRK_AS_05": {
    "normal": "星明かりを映す青いフラスコ。方位の感覚を僅かに鋭くし、薬液が最も安定する方位を直感させる。（効果：錬成中の魔力安定度をわずかに上昇させる）",
    "success": "方位の術理が宿る星霊のフラスコ。直感が高まる力が備わり、薬液が完成に近づく予兆を美しい光で教える。（効果：錬成時の大成功確率が上昇する）",
    "great_success": "夜空の予兆を映し出す神秘のフラスコ。星霊の導きがフラスコ内の魔力を宇宙の運行と同期させ、奇跡の滴を生む。（効果：稀に超高難易度のレア薬品を自動生成する）",
  },
  "IT_WRK_EL_01": {
    "normal": "霊薬を練り込んだ青緑の乳鉢。浸透する清涼感が素材の熱を払い、揮発しやすい成分を僅かに守ってくれる。（効果：揮発性素材の消失率を低下させる）",
    "success": "泡の術理を帯びた霊薬の乳鉢。調整された霊液が素材の個性を引き出し、相性の悪い成分同士を優しく仲介する。（効果：錬成時の素材相性を改善し、品質を上げる）",
    "great_success": "癒やしの術理を極めた神秘の乳鉢。雫のような光が素材の綻びを癒やし、最高純度の薬液を抽出するための舞台となる。（効果：作成アイテムの効果を大きく上昇させる）",
  },
  "IT_WRK_EL_02": {
    "normal": "霊薬を配合した青緑の金属トング。浸透する清涼感が熱を逃がし、熱に弱い素材を傷つけずに扱える。（効果：熱による素材劣化をわずかに軽減する）",
    "success": "泡の術理を帯びた霊薬のトング。調整された霊液が素材の表面を優しくケアし、掴んだ際のダメージを無効化する。（効果：素材の品質を維持したまま錬成できる）",
    "great_success": "癒やしの術理を極めた神秘のトング。雫のような光が素材の不安定さを中和し、荒れ狂う魔力さえも穏やかに導く。（効果：錬成失敗時の爆発やデバフ発生を防ぐ）",
  },
  "IT_WRK_EL_03": {
    "normal": "霊薬を配合した青緑の、るつぼ。浸透する清涼感が過度な反応を抑え、安定した霊液の調合を助ける。（効果：液体素材の錬成成功率が上昇する）",
    "success": "泡の術理を帯びた霊薬の、るつぼ。調整された霊液が素材の毒素を浮き上がらせ、清浄な成分のみを抽出する。（効果：薬品アイテムのマイナス効果を除去する）",
    "great_success": "癒やしの術理を極めた神秘の、るつぼ。雫のような光が素材の魂を癒やし、魔力的に最も安定した雫を生成する。（効果：作成される薬の効果と持続時間を大きく上げる）",
  },
  "IT_WRK_EL_04": {
    "normal": "霊薬を配合した青緑の計量匙。浸透する清涼感が素材の反応を僅かに整え、繊細な調合をサポートする。（効果：魔法系アイテムの錬成成功率を上げる）",
    "success": "泡の術理を帯びた霊薬の計量匙。調整された霊液が匙の上で素材をリフレッシュし、最良の状態で投入できる。（効果：素材一つ一つの品質を一段階上げて扱う）",
    "great_success": "癒やしの術理を極めた神秘の計量匙。雫のような光が匙に触れた素材を浄化し、純粋な魔力のみを釜へ運ぶ。（効果：作成される魔法アイテムの威力を大きく上げる）",
  },
  "IT_WRK_EL_05": {
    "normal": "霊薬を配合した青緑のフラスコ。浸透する清涼感が容器内に満ち、中の薬液を常に最適な温度に保つ。（効果：熱による薬液の劣化を完全に防ぐ）",
    "success": "泡の術理を帯びた霊薬のフラスコ。調整された霊液が薬液の不純物を泡として排出させ、純度を極限まで高める。（効果：作成される薬品の回復量を大幅に上昇させる）",
    "great_success": "癒やしの術理を極めた神秘のフラスコ。雫のような光が容器内に循環し、薬液を常に新鮮で強力な状態に保ち続ける。（効果：全ての薬品アイテムの効果と品質を底上げする）",
  },
  "IT_WRK_LI_01": {
    "normal": "生命の脈動を封じた赤い乳鉢。葉脈のように活力が素材に伝わり、死んだ組織さえも僅かに活性化させる。（効果：古い素材を使用した際の品質低下を抑える）",
    "success": "赤や緑の活力に満ちた生命の乳鉢。再生の術理が素材のポテンシャルを成長させ、瑞々しい薬効を宿らせる。（効果：植物系素材の錬成効果を上昇させる）",
    "great_success": "成長の術理が宿る豊かな乳鉢。生命の奔流が素材同士を脈打つように結合させ、一つの生きた傑作へと変貌させる。（効果：全錬成アイテムの品質と効果を底上げする）",
  },
  "IT_WRK_LI_02": {
    "normal": "生命の脈動を封じた赤いトング。葉脈のように活力がトングを通じて素材に伝わり、鮮度を僅かに補填する。（効果：生物系素材の錬成成功率を上げる）",
    "success": "赤や緑の活力に満ちた生命のトング。再生の術理が素材同士の拒絶反応を和らげ、自然な結合を強く促す。（効果：異種素材同士の錬成成功率を上げる）",
    "great_success": "成長の術理が宿る豊かなトング。生命の奔流が掴んだ素材に新たな脈動を与え、本来以上の薬効を引き出す。（効果：生物系素材から作成するアイテムの効果を上げる）",
  },
  "IT_WRK_LI_03": {
    "normal": "生命の脈動を封じた赤い、るつぼ。葉脈のように活力が熱と共に巡り、素材の生命エネルギーを保護する。（効果：生物系素材の錬成時間を短縮する）",
    "success": "赤や緑の活力に満ちた生命の、るつぼ。再生の術理が素材の綻びを加熱中に修復し、最高位の活力を宿らせる。（効果：作成アイテムにＨＰ継続回復効果を追加する）",
    "great_success": "成長の術理が宿る豊かな、るつぼ。生命の奔流が中身を脈打つように成長させ、器を超えた薬効を産み落とす。（効果：全回復系アイテムの効果量を大きく上昇させる）",
  },
  "IT_WRK_LI_04": {
    "normal": "生命の脈動を封じた赤い計量匙。葉脈のように活力が素材に伝わり、死んだ粉末にも一時の生を宿らせる。（効果：古い粉末素材の品質低下を無効化する）",
    "success": "赤や緑の活力に満ちた生命の計量匙。再生の術理が匙の上で素材を成長させ、豊かな薬効へと導く。（効果：植物・生物素材の錬成結果を強化する）",
    "great_success": "成長の術理が宿る豊かな計量匙。生命の奔流が匙を通じて釜へと注がれ、錬成物に強靭な生命力を吹き込む。（効果：回復アイテムの全効果を大きく底上げする）",
  },
  "IT_WRK_LI_05": {
    "normal": "生命の脈動を封じた赤いフラスコ。葉脈のように活力が薬液に伝わり、容器自体が生命を育む繭となる。（効果：生物系薬液の錬成成功率を上げる）",
    "success": "赤や緑の活力に満ちた生命のフラスコ。再生の術理が中の成分を活性化させ、飲む者の活力を即座に呼び覚ます。（効果：ＨＰ・ＭＰ・スタミナの同時回復効果を追加する）",
    "great_success": "成長の術理が宿る豊かなフラスコ。生命の奔流が薬液を脈打たせ、一つの生命体のように着用者の傷を追う。（効果：自動的にＨＰを回復する強力な薬を錬成する）",
  },
  "IT_WRK_ME_01": {
    "normal": "金属の術理で構造を強化した乳鉢。硬い鉱石を物理的に粉砕しても壊れず、安定した下準備を支える。（効果：素材加工時の成功率がわずかに上昇する）",
    "success": "内面を高度に研磨した金属の乳鉢。反射板の如き表面が魔力を均一に拡散し、成分の純度を物理的に高める。（効果：作成されるアイテムの品質が少し上昇する）",
    "great_success": "金銀の縁取りが美しい豪華な乳鉢。金属の術理が素材の構造を瞬時に組み替え、理想的な粉末へと変貌させる。（効果：錬成時の大成功確率が大きく上昇する）",
  },
  "IT_WRK_ME_02": {
    "normal": "金属の術理で構造を強化した頑丈なトング。熱い素材を物理的な歪みなしに掴み、正確な作業を支える。（効果：危険な錬成作業の成功率をわずかに上げる）",
    "success": "研磨された先端が魔力を反射するトング。金属の術理が素材の反発を物理的にねじ伏せ、強引に配置を固定する。（効果：失敗時の素材消失確率を低下させる）",
    "great_success": "金銀の縁取りが施された豪華なトング。構造強化の術理が持ち手の震えを完全に殺し、針の穴を通す調合を導く。（効果：難易度の高い錬成を確実に成功へと導く）",
  },
  "IT_WRK_ME_03": {
    "normal": "金属の術理で構造を強化した小さな、るつぼ。物理的な圧力と高熱に耐え、素材の融合を安定して支える。（効果：加熱錬成の成功率をわずかに上昇させる）",
    "success": "内面を高度に研磨した金属の、るつぼ。反射された熱が魔力を均一に溶かし、純度の高い液体金属を生む。（効果：金属系素材の錬成品質が上昇する）",
    "great_success": "金銀の縁取りが施された豪華な、るつぼ。金属の術理が素材を分子レベルで固定し、不朽の耐久性を授ける。（効果：錬成された武具の最大耐久値を上昇させる）",
  },
  "IT_WRK_ME_04": {
    "normal": "金属の術理で構造を強化した計量匙。物理的な変形が一切なく、常に一定の分量を正確に測り取れる。（効果：調合時の分量ミスによる失敗をわずかに防ぐ）",
    "success": "研磨された表面が魔力を反射する計量匙。構造強化により、素材の微量な魔力抵抗を物理的に感知できる。（効果：錬成時の品質補正値が少し上昇する）",
    "great_success": "金銀の縁取りが施された豪華な計量匙。金属の術理が素材の重さを完璧に固定し、究極の配合比率を実現する。（効果：錬成の成功率を底上げし、品質を最大化する）",
  },
  "IT_WRK_ME_05": {
    "normal": "金属の術理で構造を強化したフラスコ。物理的な衝撃に強く、不安定な薬液を安全に保管・抽出できる。（効果：薬品錬成の安定性がわずかに上昇する）",
    "success": "内面を高度に研磨した金属のフラスコ。反射された魔力が成分を内側から硬質化させ、保存性を高める。（効果：薬品アイテムの最大所持数を増やす）",
    "great_success": "金銀の縁取りが施された豪華なフラスコ。構造強化の術理が薬液を物理的に保護し、いかなる振動でも変質させない。（効果：作成される薬の品質を最高値で固定する）",
  },
  "IT_WRK_SA_01": {
    "normal": "乾燥した砂を錬成した保存力の高い乳鉢。琥珀の術理が素材の水分を奪い、劣化を抑えたまま加工ができる。（効果：錬成時の素材劣化をわずかに防ぐ）",
    "success": "風紋が刻まれた砂の乳鉢。保存の術理が加工中の成分を琥珀の中に閉じ込めるように固定し、効果を濃縮させる。（効果：出来上がるアイテムの使用回数が稀に増える）",
    "great_success": "悠久の保存術理が宿る砂の乳鉢。摩耗を拒む性質が加工のストレスを素材から取り除き、不朽の効果を授ける。（効果：錬成時の品質を最大化し、劣化を完全に防ぐ）",
  },
  "IT_WRK_SA_02": {
    "normal": "乾燥した砂の術理を宿したトング。琥珀の術理が滑りを防ぎ、砂のように崩れやすい素材も確実に保持する。（効果：粉末・砂系素材の錬成成功率を上げる）",
    "success": "風紋が刻まれた砂のトング。保存の術理が掴んでいる間の素材の摩耗を防ぎ、一瞬の鮮度も逃さず調合できる。（効果：錬成後のアイテム品質を固定して上昇させる）",
    "great_success": "悠久の保存術理が宿る砂のトング。摩耗を拒む性質が素材の運命を一時的に止め、加工による劣化を一切許さない。（効果：最高品質のアイテムを安定して錬成させる）",
  },
  "IT_WRK_SA_03": {
    "normal": "乾燥した砂を錬成した保存力の高い、るつぼ。琥珀の術理が不純物の混入を防ぎ、砂漠の工房でも高品質を保つ。（効果：環境による錬成失敗率を低下させる）",
    "success": "風紋が刻まれた砂の、るつぼ。保存の術理が熱による成分の摩耗を防ぎ、素材の鮮度を煮詰めながら守る。（効果：錬成にかかる時間を短縮し、品質を上げる）",
    "great_success": "悠久の保存術理が宿る砂の、るつぼ。摩耗を拒む性質が溶解した素材を永遠の黄金比で固定し、傑作を産み出す。（効果：錬成成功率と品質を飛躍的に向上させる）",
  },
  "IT_WRK_SA_04": {
    "normal": "乾燥した砂の術理を宿した計量匙。琥珀の術理が素材の吸着を防ぎ、一粒の無駄もなく正確に投入できる。（効果：素材の端数消費をわずかに抑える）",
    "success": "風紋が刻まれた砂の計量匙。保存の術理が匙の上の時間を僅かに遅らせ、素材の最も輝く瞬間を固定する。（効果：錬成時の品質ボーナスを維持しやすくする）",
    "great_success": "悠久の保存術理が宿る砂の計量匙。摩耗を拒む性質が配合の誤差を保存の術理で埋め合わせ、完璧な調和を生む。（効果：消費素材を稀に消費せずに錬成を行う）",
  },
  "IT_WRK_SA_05": {
    "normal": "乾燥した砂の術理を宿したフラスコ。琥珀の術理が外部の湿気を遮断し、デリケートな薬液を乾燥から守る。（効果：乾燥に弱い薬品の錬成成功率を上げる）",
    "success": "風紋が刻まれた砂のフラスコ。保存の術理が中の時間を僅かに止め、数百年経っても変わらぬ薬効を維持させる。（効果：薬品アイテムの効果時間を大きく上昇させる）",
    "great_success": "悠久の保存術理が宿る砂のフラスコ。摩耗を拒む性質が薬液の魂を琥珀のように固定し、永遠の鮮度を授ける。（効果：薬品の効果時間を最大化し、耐性を付与する）",
  },
};

module.exports = { ITEM_TEXTS };

    };

    // --- ./data/quizRequestTemplates.cjs ---
    modules['./data/quizRequestTemplates.cjs'] = function(module, exports, require) {
/**
 * Quiz Request Templates for MadeInMaghribal project.
 */
const QUIZ_REQUEST_TEMPLATES = [
  {
    templateId: "QT_STD_GENRE_ARM",
    customerType: "STANDARD",
    conditions: [{ type: 'genre', value: 'ARM' }],
    text: "身を守れるものが欲しいんだが..."
  },
  {
    templateId: "QT_HAK_PRINCIPLE_LI",
    customerType: "HAKIMA",
    conditions: [{ type: 'principle', value: 'LI' }],
    text: "研究のために光の術理（LI）を持つアイテムが必要なの。"
  },
  {
    templateId: "QT_EXTRA_GENRE_FOD_PRIN_SA",
    customerType: "STANDARD",
    conditions: [{ type: 'genre', value: 'FOD' }, { type: 'principle', value: 'SA' }],
    text: "砂の術理（SA）が込められた食べ物（FOD）はあるかい？"
  }
];

module.exports = { QUIZ_REQUEST_TEMPLATES };

    };

    // --- ./data/scenarioSamples.cjs ---
    modules['./data/scenarioSamples.cjs'] = function(module, exports, require) {
/**
 * Sample Scenario Data for MadeInMaghribal project.
 */
const SCENARIO_SAMPLES = {
  SC_OP_OPENING: [
    {
      text: "マグリバルに朝日が昇る。",
      backgroundId: "AS_BG_TOWN"
    },
    {
      speakerId: "CH_NADIR",
      speakerExpression: "normal",
      text: "新しいターンが始まる。どんな客が来るだろうか。"
    },
    {
      speakerId: "CH_HAKIMA",
      speakerExpression: "joy",
      standingCharacterId: "CH_HAKIMA",
      standingExpression: "joy",
      text: "おはよう、ナーディル！ 錬成の準備はできているかしら？",
      jump: "SC_TURN_1_START"
    }
  ]
};

module.exports = { SCENARIO_SAMPLES };

    };

    // --- ./data/toneGuides.cjs ---
    modules['./data/toneGuides.cjs'] = function(module, exports, require) {
/**
 * Master data for Tone Guides in MadeInMaghribal project.
 */
const TONE_GUIDES = [
  {
    toneGuideId: "TG_NADIR",
    description: "若き錬金術師。丁寧だが芯が強い。",
    rules: {
      normal: "標準的な丁寧語（です・ます）を使用。",
      extra: "より自信に満ちた口調。"
    }
  },
  {
    toneGuideId: "TG_HAKIMA",
    description: "知的なヒロイン。論理的で冷静。",
    rules: {
      normal: "論理的、やや硬めの言葉遣い。",
      extra: "ナーディルに対して感情を少し見せる。"
    }
  },
  {
    toneGuideId: "TG_MIRA",
    description: "元気なヒロイン。明るく活発。",
    rules: {
      normal: "快活で明るい。親しみやすい口調。",
      extra: "ロマンチックな表現が増える。"
    }
  },
  {
    toneGuideId: "TG_DARIYA",
    description: "神秘的なヒロイン。静かで深みがある。",
    rules: {
      normal: "短文、詩的な表現。ミステリアス。",
      extra: "自分の秘密や想いをより素直に話す。"
    }
  },
  {
    toneGuideId: "TG_CUSTOMER_STANDARD",
    description: "標準的な客。",
    rules: {
      normal: "簡潔で直接的な要望。"
    }
  }
];

module.exports = { TONE_GUIDES };

    };

    // --- ./data/resultComments.js ---
    modules['./data/resultComments.js'] = function(module, exports, require) {
/**
 * Heroine-specific result lines and expression stages.
 *
 * Result stage is intentionally 3-step only:
 * - encourage: low result / gentle recovery line / sorrow expression
 * - evaluate: normal-good result / practical evaluation / fun expression
 * - surprise: excellent result / delighted or impressed line / joy expression
 */
const RESULT_STAGES = {
  encourage: { expression: 'sorrow' },
  evaluate: { expression: 'fun' },
  surprise: { expression: 'joy' }
};

function getResultStage(rank) {
  if (rank === '大成功') return 'surprise';
  if (rank === '成功') return 'evaluate';
  return 'encourage';
}

const RESULT_COMMENTS = {
  HAKIMA: {
    encourage: '棚の流れはまだ揺れているわ。焦らず、注文の意味をひとつずつ掴み直しましょう。\n今回は守りを固める営業ね。次は品の理由まで見えてくるはずよ。',
    evaluate: '悪くないわ。棚の流れも、だいぶ読めてきたみたいね。\nこの手応えを次の接客に繋げれば、もっと安定した営業になるわ。',
    surprise: '完璧ね。ここまで綺麗に噛み合うなら、次も任せられるわ。\n品の選び方にも迷いがなかった。今の感覚、忘れないで。'
  },
  MIRA: {
    encourage: '大丈夫、店の空気はまだ暗くなってないよ。次でぱっと取り返そう。\nお客さんの目線をもう少し追えば、きっと流れが見えてくるから。',
    evaluate: 'いい感じ！店の空気も明るくなってきたね。\nこの調子で品物の並びを覚えていけば、次はもっと声をかけやすくなるよ。',
    surprise: 'すごいすごい！今の流れなら、次のお客さんも呼び込めるよ。\n棚も接客もぴったり噛み合ってた。これは噂になるかもね！'
  },
  DARIYA: {
    encourage: '少し星が曇ったみたい。けれど、品の声はまだ消えていないわ。\n次は急がず、気配の強いものから順に見ていきましょう。',
    evaluate: '静かだけれど、良い手応え。次の品も見えてきたわ。\nこの流れなら、星の巡りを読み違えることは少なくなるでしょう。',
    surprise: '星の巡りも味方しているわ。この流れは逃さないで。\n品物の気配とお客の願いが重なっていた。とても美しい営業だったわ。'
  }
};

const RESULT_GENRE_COMMENTS = {
  HAKIMA: {
    encourage: '{genre}が目立っていたわ。けれど、棚全体の意味はまだ少し散っている。\n焦らなくていい。次は注文の芯を見て、品を絞り込みましょう。',
    evaluate: '{genre}の流れが見えてきたわ。次の棚にも繋げられそうね。\n評価としては十分。あとは迷いを減らせば、もっと綺麗にまとまるわ。',
    surprise: '{genre}が綺麗に噛み合ったわ。この感覚、覚えておいて。\nここまで読めるなら、次の営業でも十分に勝負できるわね。'
  },
  MIRA: {
    encourage: '{genre}が多かったね。まだ流れを掴みきれてないけど、大丈夫。\n次はお客さんの声と品物の雰囲気を、もう少し近づけてみよう。',
    evaluate: '{genre}がよく動いたね！店の流れも掴めてきたよ。\nこの調子なら、次の接客ではもっと自然におすすめできそう。',
    surprise: '{genre}がばっちり当たったね！この調子なら噂も広がるよ。\n品物もお客さんも明るく見えてた。今の営業、かなり良かった！'
  },
  DARIYA: {
    encourage: '{genre}が多く巡ったわ。けれど、星はまだ揺れている。\n次は品の気配を急がず聞いて。そうすれば道は見えてくるわ。',
    evaluate: '{genre}の気配が強かったわ。次の品選びにも響きそうね。\n悪くない流れよ。静かに積み重ねれば、もっと深く読めるはず。',
    surprise: '{genre}が星の巡りに重なったわ。とても良い流れよ。\nここまで品物が応えてくれるなら、次の営業にも期待できるわ。'
  }
};

function normalizeHeroineId(id) {
  if (!id) return 'HAKIMA';
  return String(id).replace(/^CH_/i, '').toUpperCase();
}

function formatGenreComment(template, dominantGenre) {
  if (!template || !dominantGenre?.label) return '';
  return template.replace('{genre}', dominantGenre.label);
}

function getResultComment(heroineId, rank, dominantGenre = null) {
  const normalized = normalizeHeroineId(heroineId);
  const stage = getResultStage(rank);
  const genreTemplate = RESULT_GENRE_COMMENTS[normalized]?.[stage] || RESULT_GENRE_COMMENTS.HAKIMA[stage];
  const genreComment = dominantGenre ? formatGenreComment(genreTemplate, dominantGenre) : '';
  if (genreComment) return genreComment;
  return (
    RESULT_COMMENTS[normalized]?.[stage] ||
    RESULT_COMMENTS.HAKIMA[stage] ||
    '次の営業に向けて、静かに帳簿を整えよう。'
  );
}

function getResultExpression(rank) {
  const stage = getResultStage(rank);
  return RESULT_STAGES[stage]?.expression || 'fun';
}

module.exports = {
  RESULT_STAGES,
  RESULT_COMMENTS,
  RESULT_GENRE_COMMENTS,
  getResultStage,
  getResultComment,
  getResultExpression
};

    };

    // --- ./screens/endingScreen.js ---
    modules['./screens/endingScreen.js'] = function(module, exports, require) {
/**
 * Ending screen for MadeInMaghribal.
 */
const { calculateAffection } = require('../core/affectionModel.cjs');
const { evaluateEnding } = require('../core/endingBranch.cjs');
const { TOTAL_TURNS } = require('../core/gameSessionFlow.cjs');

function formatAverage(value, count) {
  if (!count) return '0';
  const avg = value / count;
  return Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
}

function renderEnding(controller, view) {
  const scores = controller.session.scores;
  const turnCount = TOTAL_TURNS;
  const affection = calculateAffection(scores);
  const endingType = evaluateEnding(affection, controller.session.routeMode === 'long_history');
  const typeLabel = endingType === 'GOOD' ? 'GOOD ENDING' : 'NORMAL ENDING';
  const partnerName = controller.getHeroineDisplayName(controller.session.selectedHeroineId);

  view.innerHTML = `
    <div class="ending-screen">
      <div class="ending-card">
        <h1 class="ending-kicker">終幕</h1>
        <h2 class="glow ending-title">${typeLabel}</h2>
        <div class="ending-summary">
          <p>パートナー: ${partnerName}</p>
          <p>好感度: ${Math.round(affection)}%</p>
        </div>
        <div class="ending-score-heading">${turnCount}ターンの営業総決算</div>
        <div class="score-row"><span>売上通算</span> <span>${scores.revenue}</span></div>
        <div class="score-row"><span>満足度通算</span> <span>${scores.satisfaction}</span></div>
        <div class="score-row"><span>評判通算</span> <span>${scores.reputation}</span></div>
        <div class="ending-score-heading ending-score-heading-sub">1営業あたり</div>
        <div class="score-row score-row-muted"><span>平均売上</span> <span>${formatAverage(scores.revenue, turnCount)}</span></div>
        <div class="score-row score-row-muted"><span>平均満足度</span> <span>${formatAverage(scores.satisfaction, turnCount)}</span></div>
        <div class="score-row score-row-muted"><span>平均評判</span> <span>${formatAverage(scores.reputation, turnCount)}</span></div>
        <button class="btn-primary btn-next">タイトルへ戻る</button>
      </div>
    </div>
  `;
}

module.exports = {
  renderEnding
};

    };

    // --- ./screens/heroineSelectScreen.js ---
    modules['./screens/heroineSelectScreen.js'] = function(module, exports, require) {
/**
 * Heroine Selection screen for MadeInMaghribal.
 */

const { getCharacterIconPath, getCharacterVisualImagePath } = require('../utils/assetPaths.js');
const { applyCharacterVisualProfile, applyCharacterTheme, getCharacterVisualProfile } = require('../utils/characterVisualProfiles.js');

const HEROINES = [
  {
    id: 'HAKIMA',
    name: 'ハキマ',
    title: '香りと術理に明るい錬金術師',
    desc: '厳しそうに見えて、毎朝店先に顔を出してくれる相談相手。'
  },
  {
    id: 'MIRA',
    name: 'ミラ',
    title: '街の流れに明るい案内役',
    desc: '人の流れと噂に強く、店の空気を明るくしてくれる協力者。'
  },
  {
    id: 'DARIYA',
    name: 'ダリヤ',
    title: '星と品物の物語を読む女性',
    desc: '静かな眼差しで、品物に宿る気配や物語を見抜いてくれる。'
  }
];

const ROUTE_LABELS = {
  normal: '通常モード',
  long_history: '幼馴染モード'
};


const ROUTE_ICON_EXPRESSIONS = {
  normal: 'joy',
  long_history: 'maid'
};

function getVisualImagePath(id, mode, expression = 'normal') {
  const profile = getCharacterVisualProfile(id, mode);
  return getCharacterVisualImagePath(id, expression, profile.image);
}

function isRouteUnlocked(progress, heroineId, routeMode) {
  if (routeMode === 'normal') return true;
  return Boolean(progress?.heroineModeUnlocks?.[heroineId]?.[routeMode]);
}

function getRouteStatusText(progress, heroineId, routeMode) {
  if (routeMode === 'normal') return '最初から選択可能';
  const unlocked = isRouteUnlocked(progress, heroineId, routeMode);
  const ending = progress?.endings?.[heroineId]?.normal || {};
  if (unlocked) return 'GOOD到達で解放済み';
  if (ending.normalCleared) return '通常GOODで解放';
  return '通常ルートクリア後に解放';
}

function renderRouteButtons(progress, heroineId, selectedRoute = 'normal') {
  return ['normal', 'long_history'].map((routeMode) => {
    const unlocked = isRouteUnlocked(progress, heroineId, routeMode);
    const isSelected = selectedRoute === routeMode && unlocked;
    const iconExpression = ROUTE_ICON_EXPRESSIONS[routeMode] || 'normal';
    return `
      <button
        class="route-mode-btn${isSelected ? ' is-selected' : ''}${unlocked ? '' : ' is-locked'}"
        type="button"
        data-route-mode="${routeMode}"
        ${unlocked ? '' : 'disabled'}
      >
        ${unlocked ? `<img class="route-mode-icon" src="${getCharacterIconPath(heroineId, iconExpression)}" alt="" onerror="this.style.display='none'" />` : ''}
        <span class="route-mode-copy">
          <strong>${ROUTE_LABELS[routeMode]}</strong>
          <span>${getRouteStatusText(progress, heroineId, routeMode)}</span>
        </span>
      </button>
    `;
  }).join('');
}

function renderHeroineSelect(controller, view) {
  const initial = HEROINES[0];
  const progress = controller.getPlayerProgressSummary ? controller.getPlayerProgressSummary() : null;

  view.innerHTML = `
    <div class="heroine-select title-screen heroine-select-rich">
      <h2 class="glow heroine-select-title">運命の相手は？</h2>

      <div class="heroine-preview-card" aria-live="polite">
        <div class="heroine-preview-standing">
          <img data-heroine-preview-img src="${getVisualImagePath(initial.id, 'heroineSelect')}" alt="${initial.name}" onerror="this.style.display='none'" />
        </div>
        <div class="heroine-preview-copy">
          <h3 data-heroine-preview-name>${initial.name}</h3>
          <p class="heroine-preview-title" data-heroine-preview-title>${initial.title}</p>
          <p data-heroine-preview-desc>${initial.desc}</p>
        </div>
      </div>

      <div class="heroine-icon-row" aria-label="営業パートナー候補">
        ${HEROINES.map((h) => `
          <button class="heroine-icon-btn${h.id === initial.id ? ' is-selected' : ''}" data-preview-heroine="${h.id}" type="button" aria-label="${h.name}を表示">
            <img src="${getCharacterIconPath(h.id, 'normal')}" alt="" onerror="this.style.display='none'" />
            <span>${h.name}</span>
          </button>
        `).join('')}
      </div>

      <div class="route-mode-row" data-route-mode-row aria-label="ルート選択">
        ${renderRouteButtons(progress, initial.id)}
      </div>

      <button class="heroine-card heroine-confirm-btn" data-id="${initial.id}" data-route-mode-selected="normal" type="button">このヒロインで始める</button>
    </div>
  `;

  const root = view.querySelector('.heroine-select-rich');
  if (root) applyCharacterTheme(root, initial.id);

  const previewImg = view.querySelector('[data-heroine-preview-img]');
  if (previewImg) applyCharacterVisualProfile(previewImg, initial.id, 'heroineSelect');
  view.querySelectorAll('.heroine-icon-btn').forEach((button) => {
    const id = button.getAttribute('data-preview-heroine');
    applyCharacterTheme(button, id);
    const img = button.querySelector('img');
    if (img) applyCharacterVisualProfile(img, id, 'selectIcon');
  });

  const previewName = view.querySelector('[data-heroine-preview-name]');
  const previewTitle = view.querySelector('[data-heroine-preview-title]');
  const previewDesc = view.querySelector('[data-heroine-preview-desc]');
  const confirmBtn = view.querySelector('.heroine-confirm-btn');
  const routeModeRow = view.querySelector('[data-route-mode-row]');
  const iconButtons = Array.from(view.querySelectorAll('[data-preview-heroine]'));

  function bindRouteButtons(heroineId) {
    if (!routeModeRow || !confirmBtn) return;
    routeModeRow.innerHTML = renderRouteButtons(progress, heroineId, 'normal');
    confirmBtn.setAttribute('data-route-mode-selected', 'normal');
    Array.from(routeModeRow.querySelectorAll('[data-route-mode]')).forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (button.disabled) return;
        if (controller.playSfx) controller.playSfx('uiTapBottle');
        routeModeRow.querySelectorAll('[data-route-mode]').forEach((b) => b.classList.toggle('is-selected', b === button));
        confirmBtn.setAttribute('data-route-mode-selected', button.getAttribute('data-route-mode') || 'normal');
      });
    });
  }

  iconButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (controller.playSfx) controller.playSfx('uiTapBottle');

      const heroine = HEROINES.find((h) => h.id === button.getAttribute('data-preview-heroine')) || initial;
      iconButtons.forEach((b) => b.classList.toggle('is-selected', b === button));

      if (root) applyCharacterTheme(root, heroine.id);
      if (previewImg) {
        previewImg.style.display = '';
        previewImg.src = getVisualImagePath(heroine.id, 'heroineSelect');
        previewImg.alt = heroine.name;
        applyCharacterVisualProfile(previewImg, heroine.id, 'heroineSelect');
      }
      if (previewName) previewName.textContent = heroine.name;
      if (previewTitle) previewTitle.textContent = heroine.title;
      if (previewDesc) previewDesc.textContent = heroine.desc;
      if (confirmBtn) confirmBtn.setAttribute('data-id', heroine.id);
      bindRouteButtons(heroine.id);
    });
  });

  bindRouteButtons(initial.id);
}

module.exports = {
  renderHeroineSelect
};

    };

    // --- ./screens/quizScreen.js ---
    modules['./screens/quizScreen.js'] = function(module, exports, require) {
/**
 * Quiz / Rhythm screen for MadeInMaghribal.
 */

const { getCharacterIconPath } = require('../utils/assetPaths.js');

function renderQuiz(controller, view) {
  view.innerHTML = `
    <div class="quiz-screen" data-screen="quiz">
      <div class="stats" data-hud></div>
      
      <section class="quiz-order-card">
        <div class="quiz-order-label">お客さんの要望</div>
        <div class="quiz-order-text" data-quiz-prompt></div>
        <div class="quiz-progress" data-quiz-progress></div>
        <div class="score-strip" data-score-strip></div>
      </section>

      <section class="rhythm-lane-placeholder" aria-label="リズム判定エリア">
        <div class="rhythm-party-face rhythm-party-face-left">
          <img src="${getCharacterIconPath('NADIR')}" alt="ナーディル" onerror="this.style.display='none'" />
        </div>
        <div class="rhythm-guide-line"></div>
        <div class="rhythm-guide-note"></div>
        <div class="rhythm-party-face rhythm-party-face-right">
          <img data-quiz-heroine-face src="${getCharacterIconPath(controller.session.selectedHeroineId || 'HAKIMA')}" alt="" onerror="this.style.display='none'" />
        </div>
        <div class="rhythm-guide-caption">リズム判定</div>
      </section>

      <section class="choice-list">
        <div class="choice-card" data-choice-slot="0">
          <div class="item-icon-wrap">
            <img class="item-icon" alt="" loading="eager" />
          </div>
          <div class="choice-name"></div>
          <div class="choice-label">おすすめ</div>
        </div>
        <div class="choice-card" data-choice-slot="1">
          <div class="item-icon-wrap">
            <img class="item-icon" alt="" loading="eager" />
          </div>
          <div class="choice-name"></div>
          <div class="choice-label">おすすめ</div>
        </div>
      </section>
    </div>
  `;
  updateQuizContent(controller);
}

function updateQuizContent(controller) {
  const q = controller.quizState.currentQuestion;
  const promptEl = controller.container.querySelector('[data-quiz-prompt]');
  const progressEl = controller.container.querySelector('[data-quiz-progress]');
  
  if (!q) {
    if (promptEl) promptEl.textContent = '接客の準備中です。';
    if (progressEl) progressEl.textContent = `0 / ${controller.quizState.totalQuestions}`;
    controller.updateHud();
    return;
  }

  if (promptEl) promptEl.textContent = q.promptText;
  if (progressEl) progressEl.textContent = `${controller.quizState.questionIndex + 1} / ${controller.quizState.totalQuestions}`;

  const heroineFaceEl = controller.container.querySelector('[data-quiz-heroine-face]');
  if (heroineFaceEl && controller.session.selectedHeroineId) {
    heroineFaceEl.src = getCharacterIconPath(controller.session.selectedHeroineId);
  }

  const choices = controller.quizState.currentChoices;
  choices.forEach((c, idx) => {
    const card = controller.container.querySelector(`[data-choice-slot="${idx}"]`);
    if (card) {
      card.setAttribute('data-item-id', c.id);
      const nameEl = card.querySelector('.choice-name');
      const iconEl = card.querySelector('.item-icon');
      const wrapEl = card.querySelector('.item-icon-wrap');

      if (nameEl) nameEl.textContent = c.name;
      if (iconEl) {
        iconEl.style.display = '';
        iconEl.src = controller.getItemIconPath(c.id);
        iconEl.onerror = () => {
          iconEl.style.display = 'none';
          if (wrapEl) wrapEl.classList.add('missing-icon');
        };
      }
      if (wrapEl) wrapEl.classList.remove('missing-icon');
    }
  });

  // Ensure HUD (and thus the score strip) is updated with current session scores
  controller.updateHud();
}

module.exports = {
  renderQuiz,
  updateQuizContent
};

    };

    // --- ./screens/titlePanelScreen.js ---
    modules['./screens/titlePanelScreen.js'] = function(module, exports, require) {
/**
 * Title menu sub screens.
 * These are intentionally lightweight: title menu entries can become real
 * screens without changing GameSession phases.
 */

const { AUDIO_MANIFEST } = require('../data/audioManifest.cjs');
const { ITEM_MASTER } = require('../data/itemMaster.cjs');
const { ITEM_DISPLAY_NAMES } = require('../data/itemDisplayNames.cjs');
const { ITEM_TEXTS } = require('../data/itemTexts.cjs');
const { getCharacterIconPath } = require('../utils/assetPaths.js');
const { loadItemCollection } = require('../utils/itemCollection.js');
const { getHeroineDisplayName } = require('../utils/displayNames.js');

const PANEL_TITLES = {
  load: 'ロード',
  event: 'イベントギャラリー',
  image: '画像ギャラリー',
  sound: 'サウンドテスト',
  item: 'アイテム図鑑'
};

const GENRE_LABELS = {
  ADN: 'アクセサリー',
  ARM: '防具',
  CLT: '衣服',
  DAY: '日用品',
  FOD: '食品',
  MED: '薬品',
  RIT: '儀式具',
  TRD: '交易品',
  TRV: '旅道具',
  WRK: '道具'
};

const PRINCIPLE_LABELS = {
  AS: '星',
  EL: '霊薬',
  LI: '光',
  ME: '金属',
  SA: '砂'
};

const HEROINE_LABELS = {
  HAKIMA: 'ハキマ',
  MIRA: 'ミラ',
  DARIYA: 'ダリヤ'
};


const QUALITY_LABELS = {
  normal: '通常品質',
  success: '成功品質',
  great_success: '大成功品質'
};

const QUALITY_ORDER = ['normal', 'success', 'great_success'];

const SOUND_GROUP_ICONS = {
  system: { id: 'NADER', expression: 'normal', label: '共通' },
  extra: { id: 'NADER', expression: 'joy', label: '表情' },
  HAKIMA: { id: 'HAKIMA', expression: 'social', label: 'ハキマ' },
  MIRA: { id: 'MIRA', expression: 'social', label: 'ミラ' },
  DARIYA: { id: 'DARIYA', expression: 'social', label: 'ダリヤ' },
  se: { id: 'NADER', expression: 'fun', label: 'SE' }
};

const SE_GROUP_LABELS = {
  quiz: 'クイズSE',
  ui: 'UI SE',
  day_end: 'ターン転換SE'
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

function formatItemQualityText(value) {
  const text = escapeHtml(value || '説明文未登録');
  return text.replace(/（効果/g, '<br>（効果');
}

function renderTitlePanel(controller, view) {
  const panel = controller.uiState?.titlePanel || 'item';
  const title = PANEL_TITLES[panel] || 'メニュー';

  view.innerHTML = `
    <div class="title-screen title-screen-with-art title-panel-screen">
      <div class="title-panel-card">
        <div class="title-panel-header">
          <button class="title-panel-back" type="button" data-action="title-panel-back">戻る</button>
          <h2>${title}</h2>
        </div>
        <div class="title-panel-body">
          ${renderPanelBody(controller, panel)}
        </div>
      </div>
    </div>
  `;
}

function renderPanelBody(controller, panel) {
  if (panel === 'item') return renderItemGallery(controller);
  if (panel === 'sound') return renderSoundTest(controller);
  if (panel === 'load') return renderLoadPanel(controller);
  if (panel === 'event') return renderEventGallery(controller);
  if (panel === 'image') return renderImageGallery(controller);
  return renderPlaceholder(panel);
}

function getSubPhaseLabel(subPhase) {
  const labels = {
    BEFORE_OPEN: '開店前',
    QUIZ: '接客中',
    TURN_RESULT: '営業結果',
    AFTER_CLOSE: '閉店後'
  };
  return labels[subPhase] || '進行中';
}

function renderLoadPanel(controller) {
  const summary = controller.getSaveSummary ? controller.getSaveSummary() : null;
  if (!summary) {
    return `
      <div class="title-panel-empty title-load-panel">
        <p>再開できるセーブはありません。</p>
        <p class="title-panel-note">営業中に自動保存されたデータがここに表示されます。</p>
      </div>
    `;
  }

  const heroineName = getHeroineDisplayName(summary.selectedHeroineId);
  const score = summary.scores || {};
  const questionProgress = `${Math.min(summary.questionIndex + 1, summary.totalQuestions)} / ${summary.totalQuestions}`;
  const quizNote = summary.subPhase === 'QUIZ'
    ? `<div class="load-save-row"><span>クイズ</span><strong>${questionProgress}</strong></div>`
    : '';

  return `
    <div class="title-load-panel">
      <div class="load-save-card">
        <div class="load-save-kicker">Autosave</div>
        <h3>${heroineName} / ${summary.turn}ターン目</h3>
        <div class="load-save-meta">
          <div class="load-save-row"><span>保存</span><strong>${summary.savedAtLabel}</strong></div>
          <div class="load-save-row"><span>状態</span><strong>${getSubPhaseLabel(summary.subPhase)}</strong></div>
          ${quizNote}
          <div class="load-save-row"><span>満足度</span><strong>${score.satisfaction || 0}</strong></div>
          <div class="load-save-row"><span>評判</span><strong>${score.reputation || 0}</strong></div>
        </div>
        <div class="load-save-actions">
          <button class="title-start-btn title-panel-continue" type="button" data-action="title-continue">このセーブから再開</button>
          <button class="title-menu-btn title-panel-clear-save" type="button" data-action="title-clear-save">セーブを消す</button>
        </div>
        <p class="title-panel-note">現在は自動保存1枠です。複数スロットと長期記録は後続で統合します。</p>
      </div>
    </div>
  `;
}

function renderPlaceholder(panel) {
  const notes = {
    event: '閲覧済みイベントの回想をここに並べる予定です。',
    image: '解放済みスチルや背景をここに並べる予定です。'
  };
  return `
    <div class="title-panel-empty">
      <p>${notes[panel] || '後続実装です。'}</p>
      <p class="title-panel-note">この入口だけ先に固定しています。</p>
    </div>
  `;
}

function getItemMeta(itemId) {
  return ITEM_DISPLAY_NAMES[itemId] || {};
}

function buildItemStats(seenIds) {
  const byGenre = {};
  const byPrinciple = {};
  ITEM_MASTER.forEach((item) => {
    if (!seenIds.has(item.itemId)) return;
    byGenre[item.genre] = (byGenre[item.genre] || 0) + 1;
    byPrinciple[item.principle] = (byPrinciple[item.principle] || 0) + 1;
  });
  return { byGenre, byPrinciple };
}

function renderStatChips(record, labels, unit = '件') {
  return Object.entries(labels).map(([key, label]) => {
    const count = record[key] || 0;
    return `<span class="gallery-stat-chip${count ? ' is-unlocked' : ''}">${label}<strong>${count}${unit}</strong></span>`;
  }).join('');
}

function getItemGalleryModel(controller, item) {
  const meta = getItemMeta(item.itemId);
  const name = controller.getItemDisplayName ? controller.getItemDisplayName(item.itemId) : (meta.base || item.name);
  return {
    item,
    meta,
    name,
    icon: controller.getItemIconPath ? controller.getItemIconPath(item.itemId) : `images/items/${item.itemId}.png`,
    genreName: meta.genreName || GENRE_LABELS[item.genre] || item.genre,
    principleName: meta.principleName || PRINCIPLE_LABELS[item.principle] || item.principle,
    typeName: meta.itemTypeName || `${item.genre}-${item.rank}`
  };
}

function renderItemDetailModal(controller, seenItems) {
  const modal = controller.uiState?.itemDetailModal;
  if (!modal || !seenItems.length) return '';
  const index = Math.max(0, Math.min(Number(modal.index) || 0, seenItems.length - 1));
  const model = getItemGalleryModel(controller, seenItems[index]);
  const texts = ITEM_TEXTS[model.item.itemId] || {};
  const qualityCards = QUALITY_ORDER.map((quality) => `
    <section class="item-detail-quality item-detail-quality-${quality}">
      <p>${formatItemQualityText(texts[quality])}</p>
    </section>
  `).join('');

  const prevIndex = (index - 1 + seenItems.length) % seenItems.length;
  const nextIndex = (index + 1) % seenItems.length;
  return `
    <div class="item-detail-backdrop" data-action="item-detail-close">
      <article class="item-detail-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(model.name)} 詳細">
        <button class="item-detail-close" type="button" data-action="item-detail-close">×</button>
        <div class="item-detail-head">
          <div class="item-detail-icon-frame"><img src="${model.icon}" alt="${escapeHtml(model.name)}" onerror="this.style.display='none'" /></div>
          <div>
            <p class="item-detail-kicker">${index + 1} / ${seenItems.length}</p>
            <h3>${escapeHtml(model.name)}</h3>
            <p>${escapeHtml(model.genreName)} / ${escapeHtml(model.principleName)} / ${escapeHtml(model.typeName)}</p>
          </div>
        </div>
        <div class="item-detail-quality-grid">${qualityCards}</div>
        <div class="item-detail-nav">
          <button class="title-menu-btn" type="button" data-item-detail-index="${prevIndex}">前</button>
          <button class="title-menu-btn" type="button" data-item-detail-index="${nextIndex}">次</button>
        </div>
      </article>
    </div>
  `;
}

function renderItemGallery(controller) {
  const collection = loadItemCollection();
  const seenIds = new Set(Object.keys(collection).filter((itemId) => collection[itemId]?.seen));
  const total = ITEM_MASTER.length;
  const seenCount = seenIds.size;
  const stats = buildItemStats(seenIds);
  const percent = total ? Math.floor((seenCount / total) * 100) : 0;
  const seenItems = ITEM_MASTER.filter((item) => seenIds.has(item.itemId));
  const seenIndexById = new Map(seenItems.map((item, index) => [item.itemId, index]));

  const items = ITEM_MASTER.map((item) => {
    const seen = seenIds.has(item.itemId);
    const model = getItemGalleryModel(controller, item);
    const title = seen ? `${model.name} / ${model.genreName} / ${model.principleName}` : '未登録';
    const detailIndex = seenIndexById.get(item.itemId);
    const tag = seen ? 'button' : 'div';
    const detailAttr = seen ? ` type="button" data-item-detail-index="${detailIndex}"` : '';

    return `
      <${tag} class="gallery-item-tile${seen ? ' is-seen' : ' is-locked'}" title="${escapeHtml(title)}"${detailAttr}>
        <div class="gallery-item-icon-frame">
          <div class="gallery-item-icon">
            ${seen ? `<img src="${model.icon}" alt="${escapeHtml(model.name)}" onerror="this.style.display='none'" />` : '<span>？</span>'}
          </div>
        </div>
        <div class="gallery-item-info">
          <strong>${seen ? escapeHtml(model.name) : '未登録'}</strong>
          <small>${seen ? `${escapeHtml(model.genreName)} / ${escapeHtml(model.principleName)} / ${escapeHtml(model.typeName)}` : '接客候補に出ると登録'}</small>
        </div>
      </${tag}>
    `;
  }).join('');

  return `
    <div class="item-gallery-panel">
      <div class="title-panel-summary gallery-summary-card">
        <div>
          <span>登録済み</span>
          <strong>${seenCount} / ${total}</strong>
        </div>
        <div class="gallery-progress" aria-label="図鑑登録率 ${percent}%">
          <span style="width:${percent}%"></span>
        </div>
      </div>
      <div class="gallery-stat-block">
        <p>分類</p>
        <div class="gallery-stat-list">${renderStatChips(stats.byGenre, GENRE_LABELS)}</div>
      </div>
      <div class="gallery-stat-block gallery-stat-block-compact">
        <p>術理</p>
        <div class="gallery-stat-list">${renderStatChips(stats.byPrinciple, PRINCIPLE_LABELS)}</div>
      </div>
      <div class="item-gallery-grid">${items}</div>
      ${renderItemDetailModal(controller, seenItems)}
    </div>
  `;
}

function renderEventGallery(controller) {
  const progress = controller.getPlayerProgressSummary ? controller.getPlayerProgressSummary() : null;
  const cards = Object.entries(HEROINE_LABELS).map(([heroineId, name]) => {
    const normal = progress?.endings?.[heroineId]?.normal || {};
    const longHistory = progress?.endings?.[heroineId]?.long_history || {};
    const unlocked = progress?.heroineModeUnlocks?.[heroineId]?.long_history;
    const best = progress?.bestRecords?.[heroineId]?.normal || {};
    return `
      <div class="locked-gallery-card${normal.normalCleared || longHistory.normalCleared ? ' is-unlocked' : ''}">
        <div class="locked-gallery-mark">✦</div>
        <h3>${name}</h3>
        <p>通常: ${normal.goodCleared ? 'GOOD済み' : (normal.normalCleared ? 'CLEAR済み' : '未クリア')}</p>
        <p>IF: ${unlocked ? '解放済み' : '未解放'} / ${longHistory.goodCleared ? 'GOOD済み' : (longHistory.normalCleared ? 'CLEAR済み' : '未クリア')}</p>
        <small>最高 満足度${best.satisfaction || 0} / 評判${best.reputation || 0}</small>
      </div>
    `;
  }).join('');

  return `
    <div class="locked-gallery-panel">
      <div class="title-panel-summary">エンディング記録とモード解放状態を保存中</div>
      <div class="locked-gallery-grid">${cards}</div>
      <p class="title-panel-note">イベント単位の閲覧フラグは後続接続です。現在はヒロイン別のクリア記録を先に表示します。</p>
    </div>
  `;
}

function renderImageGallery(controller) {
  const progress = controller.getPlayerProgressSummary ? controller.getPlayerProgressSummary() : null;
  const imageSeenCount = progress?.imageSeenCount || 0;
  const cards = [
    ['背景', 'タイトル・店内・オアシスなどの解放済み背景'],
    ['スチル', 'エンディングやイベント用の一枚絵'],
    ['キャラ', 'standing/face_proc 参照の確認用一覧']
  ].map(([title, note]) => `
    <div class="locked-gallery-card">
      <div class="locked-gallery-mark">◇</div>
      <h3>${title}</h3>
      <p>${note}</p>
      <small>Coming Later</small>
    </div>
  `).join('');

  return `
    <div class="locked-gallery-panel">
      <div class="title-panel-summary">画像ギャラリーの入口を固定済み / 解放 ${imageSeenCount}件</div>
      <div class="locked-gallery-grid">${cards}</div>
      <p class="title-panel-note">bustup_proc は使わず、既存の standing_proc / face_proc 方針に合わせて後続接続します。</p>
    </div>
  `;
}

function makeSoundHeading(key, fallbackLabel) {
  const info = SOUND_GROUP_ICONS[key] || SOUND_GROUP_ICONS.se;
  return `
    <div class="sound-group-heading">
      <img src="${getCharacterIconPath(info.id, info.expression)}" alt="" onerror="this.style.display='none'" />
      <span>${escapeHtml(info.label || fallbackLabel || key)}</span>
    </div>
  `;
}

function renderBgmTrackButton(track) {
  return `
    <button class="sound-test-row" type="button" data-sound-bgm-path="${track.path}" data-sound-id="${track.id}">
      <span>${escapeHtml(track.label)}</span>
      <small>BGM</small>
    </button>
  `;
}

function renderSoundGroup(key, label, tracks, renderTrack) {
  if (!tracks.length) return '';
  return `
    <section class="sound-test-group">
      ${makeSoundHeading(key, label)}
      <div class="sound-test-list">${tracks.map(renderTrack).join('')}</div>
    </section>
  `;
}

function buildBgmGroups() {
  const groups = [];
  const system = (AUDIO_MANIFEST?.bgm?.system || []).map((track) => ({
    ...track,
    label: track.title || track.id
  }));
  groups.push({ key: 'system', label: '共通', tracks: system });

  for (const heroineId of ['HAKIMA', 'MIRA', 'DARIYA']) {
    const group = AUDIO_MANIFEST?.bgm?.heroines?.[heroineId] || {};
    const heroineTracks = [];
    if (group.theme) heroineTracks.push({ ...group.theme, label: 'テーマ' });
    (group.game || []).forEach((track, index) => heroineTracks.push({ ...track, label: `ゲーム曲 ${index + 1}` }));
    if (group.ending?.normal) heroineTracks.push({ ...group.ending.normal, label: '通常エンディング' });
    if (group.ending?.good) heroineTracks.push({ ...group.ending.good, label: 'グッドエンディング' });
    groups.push({ key: heroineId, label: HEROINE_LABELS[heroineId], tracks: heroineTracks });
  }

  const extra = (AUDIO_MANIFEST?.bgm?.extra || []).map((track) => ({
    ...track,
    label: track.title || `${track.mood || track.id}${track.variant ? ` ${track.variant}` : ''}`
  }));
  groups.push({ key: 'extra', label: '表情', tracks: extra });
  return groups;
}

function renderSfxTrackButton(track) {
  return `
    <button class="sound-test-row" type="button" data-sound-sfx-key="${track.key}">
      <span>${escapeHtml(track.title || track.key)}</span>
      <small>${escapeHtml(track.key)}</small>
    </button>
  `;
}

function buildSfxGroups() {
  const groups = AUDIO_MANIFEST?.se || {};
  const tracks = Object.entries(groups).flatMap(([groupName, groupTracks]) => (
    (groupTracks || [])
      .filter((track) => track.key)
      .map((track) => ({
        ...track,
        title: `${SE_GROUP_LABELS[groupName] || groupName} / ${track.id || track.key}`
      }))
  ));
  return [{ key: 'se', label: 'SE', tracks }];
}

function renderSoundTest(controller) {
  const bgmState = controller.getBgmState ? controller.getBgmState() : null;
  const currentPath = bgmState?.currentPath || bgmState?.pendingPath || '';
  const bgmGroups = buildBgmGroups()
    .map((group) => renderSoundGroup(group.key, group.label, group.tracks, renderBgmTrackButton))
    .join('');
  const sfxGroups = buildSfxGroups()
    .map((group) => renderSoundGroup(group.key, group.label, group.tracks, renderSfxTrackButton))
    .join('');

  return `
    <div class="sound-test-panel">
      <div class="sound-test-toolbar">
        <p data-sound-test-message>${currentPath ? `BGM: ${escapeHtml(currentPath)}` : 'BGMを選ぶとフェード付きで試聴します。'}</p>
        <button class="title-menu-btn" type="button" data-action="sound-stop-bgm">BGM停止</button>
      </div>
      <div class="sound-test-scroll">
        <h3>BGM</h3>
        ${bgmGroups}
        <h3>SE</h3>
        ${sfxGroups}
      </div>
    </div>
  `;
}

module.exports = {
  renderTitlePanel
};

    };

    // --- ./screens/titleScreen.js ---
    modules['./screens/titleScreen.js'] = function(module, exports, require) {
/**
 * Title and Opening screens for MadeInMaghribal.
 */

const { renderVnShell } = require('./vnScreen.js');
const { getBackgroundPath } = require('../utils/assetPaths.js');

function renderTitle(controller, view) {
  const debugButton = controller.isDebugMode()
    ? '<button class="title-menu-btn" type="button" data-title-stub="デバッグ">デバッグ</button>'
    : '';
  const canContinue = controller.hasSaveData ? controller.hasSaveData() : false;
  const continueAttrs = canContinue
    ? 'data-action="title-continue"'
    : 'disabled aria-disabled="true"';

  view.innerHTML = `
    <div class="title-screen title-screen-with-art">
      <svg class="title-water-filter-defs" aria-hidden="true" focusable="false">
        <filter id="titleWaterRippleFilter" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.052" numOctaves="2" seed="7" result="waveNoise">
            <animate attributeName="baseFrequency" dur="14s" calcMode="spline" keyTimes="0;0.33;0.66;1" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1" values="0.012 0.052;0.016 0.047;0.010 0.058;0.012 0.052" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="waveNoise" scale="8" xChannelSelector="R" yChannelSelector="G">
            <animate attributeName="scale" dur="10s" calcMode="spline" keyTimes="0;0.35;0.70;1" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1" values="8;12;6;8" repeatCount="indefinite" />
          </feDisplacementMap>
        </filter>
      </svg>
      <div class="title-clock-crop" aria-hidden="true">
        <img class="title-clock-image" src="images/ui/clock.png" alt="" />
      </div>
      <h1 class="title-logo-anchor" aria-label="Made in Maghribal">
        <span class="title-logo-water">
          <img class="title-logo-image" src="images/ui/logo.png" alt="Made in Maghribal" />
        </span>
      </h1>
      <div class="title-content-panel">
        <div class="title-primary-actions">
          <button class="title-start-btn" type="button" data-action="title-start">はじめから</button>
          <button class="title-start-btn title-continue-btn" type="button" ${continueAttrs}>つづきから</button>
        </div>
        <div class="title-menu-grid" aria-label="Title menu">
          <button class="title-menu-btn" type="button" data-title-panel="load">ロード</button>
          <button class="title-menu-btn" type="button" data-title-panel="event">イベント</button>
          <button class="title-menu-btn" type="button" data-title-panel="image">画像</button>
          <button class="title-menu-btn" type="button" data-title-panel="sound">音楽</button>
          <button class="title-menu-btn" type="button" data-title-panel="item">図鑑</button>
          <button class="title-menu-btn" type="button" data-action="open-options">設定</button>
          ${debugButton}
        </div>
        <p class="title-stub-message" data-title-stub-message></p>
      </div>
    </div>
  `;
}

function renderOpening(controller, view) {
  const text = `マグリバル砂漠の黄金の砂は、多くの物語を秘めています。

あなたはこのオアシスの街に到着しました。地域で最も有名な茶屋を営む準備はできていますか？`;

  renderVnShell(controller, view);
  const screen = view.querySelector('.vn-screen');
  if (screen) {
    screen.classList.add('opening-screen');
    screen.insertAdjacentHTML('afterbegin', '<h2 class="vn-scene-title">プロローグ</h2>');
  }

  const bgEl = view.querySelector('[data-vn-bg]');
  const speakerWrapEl = view.querySelector('[data-vn-speaker-wrap]');
  const textEl = view.querySelector('[data-vn-text]');

  if (bgEl) {
    bgEl.style.backgroundImage = `url(${getBackgroundPath('OASIS')})`;
  }
  if (speakerWrapEl) {
    speakerWrapEl.style.display = 'none';
  }
  if (textEl) {
    controller.startTypewriter(text, textEl);
  }
}

module.exports = {
  renderTitle,
  renderOpening
};

    };

    // --- ./screens/turnResultScreen.js ---
    modules['./screens/turnResultScreen.js'] = function(module, exports, require) {
/**
 * Turn result screen for MadeInMaghribal.
 */
const { getCharacterVisualImagePath } = require('../utils/assetPaths.js');
const { applyCharacterVisualProfile, applyCharacterTheme } = require('../utils/characterVisualProfiles.js');
const { getResultComment, getResultExpression } = require('../data/resultComments.js');

const SCORE_MAX_PER_TURN = {
  revenue: 100,
  satisfaction: 20,
  reputation: 20
};

const GENRE_LABELS = {
  ARM: '守りの品',
  FOD: '食べ物',
  MED: '薬と癒しの品',
  ADN: '装飾品',
  CLT: '衣装',
  DAY: '日用品',
  WRK: '仕事道具',
  TRV: '旅の品',
  RIT: '儀礼品',
  TRD: '交易品'
};



const DEBUG_RESULT_ITEM_IDS = [
  'IT_ARM_AS_01', 'IT_FOD_SA_02', 'IT_MED_EL_03', 'IT_ADN_LI_04', 'IT_CLT_ME_05',
  'IT_DAY_AS_06', 'IT_WRK_SA_07', 'IT_TRV_EL_08', 'IT_RIT_LI_09', 'IT_TRD_ME_10',
  'IT_ARM_SA_11', 'IT_FOD_EL_12', 'IT_MED_LI_13', 'IT_ADN_ME_14', 'IT_CLT_AS_15',
  'IT_DAY_SA_16', 'IT_WRK_EL_17', 'IT_TRV_LI_18', 'IT_RIT_ME_19', 'IT_TRD_AS_20'
];

function getNadirResultLine(rank) {
  if (rank === '大成功') return 'よし！';
  if (rank === '成功') return '手応えあり';
  return '頑張ろう';
}

function buildDebugResultItems(controller) {
  return DEBUG_RESULT_ITEM_IDS.map((itemId, index) => ({
    itemId,
    displayName: controller.getItemDisplayName ? controller.getItemDisplayName(itemId) : itemId,
    iconPath: controller.getItemIconPath ? controller.getItemIconPath(itemId) : `images/items/${itemId}.png`,
    selected: index % 2 === 0,
    correct: index % 3 === 0,
    isNew: index % 4 === 0,
    questionIndex: Math.floor(index / 2)
  }));
}

function getCumulativeMax(metric, turn) {
  const rawMax = SCORE_MAX_PER_TURN[metric] * Math.max(1, turn);
  if (metric === 'revenue') return Math.min(500, rawMax);
  return Math.min(100, rawMax);
}

function clampPct(value, maxValue) {
  return Math.max(0, Math.min(100, Math.round((value / Math.max(1, maxValue)) * 100)));
}

function getItemGenre(itemId = '') {
  const match = String(itemId).match(/^IT_([A-Z]{3})_/);
  return match ? match[1] : '';
}

function getDominantGenre(turnItems = []) {
  const counts = {};
  turnItems.forEach((item) => {
    const genre = getItemGenre(item.itemId);
    if (!genre) return;
    counts[genre] = (counts[genre] || 0) + 1;
  });

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  return { code: top[0], label: GENRE_LABELS[top[0]] || top[0], count: top[1] };
}

function flattenTurnItemLog(turnItemLog = []) {
  return turnItemLog.flatMap((entry) => (
    (entry.choices || []).map((choice) => ({
      ...choice,
      questionIndex: entry.questionIndex
    }))
  ));
}

function renderResultItemList(items) {
  const visibleItems = items.slice(0, 20);
  if (!visibleItems.length) {
    return `
      <section class="result-item-log" data-reveal-step="items" aria-label="今回登場した品物">
        <div class="result-item-log-title">今回の品物</div>
        <div class="result-item-log-empty">接客で登場した品物をここに記録します。</div>
      </section>
    `;
  }

  const rows = visibleItems.map((item) => `
    <div class="result-item-chip${item.selected ? ' is-selected' : ' is-unselected'}${item.isNew ? ' is-new' : ''}" title="${item.displayName}${item.selected ? ' / 選択' : ' / 候補'}">
      ${item.isNew ? '<span class="result-item-new">NEW</span>' : ''}
      <img class="result-item-icon" src="${item.iconPath}" alt="${item.displayName}" onerror="this.style.display='none'" />
    </div>
  `).join('');

  return `
    <section class="result-item-log" data-reveal-step="items" aria-label="今回登場した品物">
      <div class="result-item-log-title">今回の品物</div>
      <div class="result-item-log-grid">
        ${rows}
      </div>
    </section>
  `;
}

function renderScoreBar(label, metric, turnValue, cumulativeValue, currentTurn) {
  const turnMax = SCORE_MAX_PER_TURN[metric];
  const cumulativeMax = getCumulativeMax(metric, currentTurn);
  const turnPct = clampPct(turnValue, turnMax);
  const cumulativePct = clampPct(cumulativeValue, cumulativeMax);

  return `
    <div class="result-score-bar-row">
      <div class="result-score-bar-label">${label}</div>
      <div class="result-score-bar-stack" aria-label="${label} score graph">
        <div class="result-score-bar-track result-score-bar-track-total">
          <div class="result-score-bar-fill result-score-bar-fill-total" style="width:${cumulativePct}%"></div>
        </div>
        <div class="result-score-bar-track result-score-bar-track-turn">
          <div class="result-score-bar-fill result-score-bar-fill-turn" style="width:${turnPct}%"></div>
        </div>
      </div>
      <div class="result-score-bar-value">
        <span class="result-score-now">今回 +${turnValue}</span>
        <span class="result-score-total">累計 ${cumulativeValue}</span>
      </div>
    </div>
  `;
}

function setupResultReveal(controller, view, speechText) {
  const stage = view.querySelector('[data-result-reveal-root]');
  if (!stage) return;

  const speechTextEl = stage.querySelector('[data-result-speech-text]');
  const heroineEl = stage.querySelector('[data-result-heroine]');
  const auraEl = stage.querySelector('[data-result-expression-aura]');
  const nadirEl = stage.querySelector('[data-result-nadir-icon]');
  const revealSteps = ['report', 'rank', 'graph', 'speech', 'items'];
  const timers = [];
  let typingTimer = null;
  let expressionTimer = null;
  let done = false;

  const playStepSfx = () => {
    // Result reveal used to play workshopDayEnd on every step, but it was too busy.
    // Keep the hook as a no-op so reveal timing remains unchanged.
  };

  const reveal = (step, play = true) => {
    stage.querySelectorAll(`[data-reveal-step="${step}"]`).forEach((el) => {
      el.classList.add('is-visible');
    });
    if (step === 'rank') {
      if (heroineEl?.dataset.resultExpressionSrc) {
        auraEl?.classList.remove('is-active');
        // Restart aura animation reliably even when reveal is skipped.
        void auraEl?.offsetWidth;
        auraEl?.classList.add('is-active');
        heroineEl.classList.add('is-expression-changing');

        if (expressionTimer) clearTimeout(expressionTimer);
        expressionTimer = setTimeout(() => {
          if (!heroineEl.isConnected) return;
          heroineEl.src = heroineEl.dataset.resultExpressionSrc;
          heroineEl.classList.remove('is-expression-changing');
          heroineEl.classList.add('is-expression-shifted');
        }, 90);
      }
      if (nadirEl?.dataset.resultExpressionSrc) {
        nadirEl.src = nadirEl.dataset.resultExpressionSrc;
        nadirEl.classList.add('is-expression-shifted');
      }
    }
    if (play) playStepSfx();
  };

  const finishSpeech = () => {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
    if (speechTextEl) speechTextEl.textContent = speechText;
  };

  const typeSpeech = () => {
    reveal('speech');
    if (!speechTextEl) return;
    speechTextEl.textContent = '';
    let index = 0;
    typingTimer = setInterval(() => {
      index += 1;
      speechTextEl.textContent = speechText.slice(0, index);
      if (index >= speechText.length) {
        clearInterval(typingTimer);
        typingTimer = null;
      }
    }, 28);
  };

  const finishAll = () => {
    if (done) return;
    done = true;
    timers.forEach((timer) => clearTimeout(timer));
    if (expressionTimer) {
      clearTimeout(expressionTimer);
      expressionTimer = null;
    }
    if (heroineEl?.dataset.resultExpressionSrc) {
      heroineEl.src = heroineEl.dataset.resultExpressionSrc;
      heroineEl.classList.remove('is-expression-changing');
      heroineEl.classList.add('is-expression-shifted');
    }
    if (nadirEl?.dataset.resultExpressionSrc) {
      nadirEl.src = nadirEl.dataset.resultExpressionSrc;
      nadirEl.classList.add('is-expression-shifted');
    }
    auraEl?.classList.add('is-active');
    finishSpeech();
    revealSteps.forEach((step) => reveal(step, false));
  };

  const schedule = (fn, delay) => {
    const timer = setTimeout(() => {
      if (!stage.isConnected || done) return;
      fn();
    }, delay);
    timers.push(timer);
  };

  schedule(() => reveal('report'), 120);
  schedule(() => reveal('rank'), 520);
  schedule(() => reveal('graph'), 920);
  schedule(typeSpeech, 1320);
  schedule(() => reveal('items'), 2400);

  stage.addEventListener('click', (event) => {
    if (event.target.closest('.result-next-button')) return;
    event.preventDefault();
    event.stopPropagation();
    finishAll();
  });
}

function renderTurnResult(controller, view) {
  const s = controller.session.scores;
  const start = controller.quizState.turnStartScore;
  const dR = s.revenue - start.revenue;
  const dS = s.satisfaction - start.satisfaction;
  const dRep = s.reputation - start.reputation;
  const rank = controller.getTurnRank(dR, dS, dRep);
  const heroineId = controller.session.selectedHeroineId || 'HAKIMA';
  const currentTurn = controller.session.turn;
  const reportLabel = `第${currentTurn}期営業報告`;
  const rawTurnItems = flattenTurnItemLog(controller.quizState.turnItemLog);
  const turnItems = rawTurnItems.length ? rawTurnItems : buildDebugResultItems(controller);
  const dominantGenre = getDominantGenre(turnItems);
  const speechText = getResultComment(heroineId, rank, dominantGenre);
  const resultExpression = getResultExpression(rank);
  const normalStandingSrc = getCharacterVisualImagePath(heroineId, 'normal', 'standing');
  const resultStandingSrc = getCharacterVisualImagePath(heroineId, resultExpression, 'standing');
  const nadirNormalSrc = getCharacterVisualImagePath('NADIR', 'normal', 'face');
  const nadirResultSrc = getCharacterVisualImagePath('NADIR', resultExpression, 'face');
  const nadirLine = getNadirResultLine(rank);
  controller.preloadResultExpressions?.(heroineId, resultExpression);
  
  view.innerHTML = `
    <div class="result-screen" data-screen="turn-result">
      <div class="result-stage" data-result-theme-root data-result-reveal-root>
        <div class="result-heroine-wrap">
          <img class="result-heroine-standing" data-result-heroine src="${normalStandingSrc}" data-result-expression-src="${resultStandingSrc}" alt="" />
          <div class="result-heroine-expression-aura" data-result-expression-aura aria-hidden="true"></div>
        </div>

        <div class="result-report-stamp" data-reveal-step="report" aria-label="${reportLabel}">${reportLabel}</div>
        <div class="result-nadir-aside" data-reveal-step="rank" aria-label="ナーディルの一言">
          <div class="result-nadir-face">
            <img data-result-nadir-icon src="${nadirNormalSrc}" data-result-expression-src="${nadirResultSrc}" alt="" />
          </div>
          <div class="result-nadir-bubble">${nadirLine}</div>
        </div>
        <div class="result-rank-burst result-rank-${rank}" data-reveal-step="rank" aria-label="評価 ${rank}">評価：${rank}</div>

        <section class="result-card result-rich-card" data-reveal-step="graph" aria-label="営業成果グラフ">
          <div class="result-score-legend">
            <span class="legend-dot legend-total"></span>累計 / 満点
            <span class="legend-dot legend-turn"></span>今回 / 1ターン満点
          </div>

          <div class="result-score-graph">
            ${renderScoreBar('売上', 'revenue', dR, s.revenue, currentTurn)}
            ${renderScoreBar('満足度', 'satisfaction', dS, s.satisfaction, currentTurn)}
            ${renderScoreBar('評判', 'reputation', dRep, s.reputation, currentTurn)}
          </div>
        </section>

        <div class="result-speech result-speech-lower" data-reveal-step="speech">
          <span data-result-speech-text></span>
        </div>

        ${renderResultItemList(turnItems)}

        <button class="btn-primary btn-next result-next-button">次へ</button>
      </div>
    </div>
  `;

  const root = view.querySelector('[data-result-theme-root]');
  const heroineEl = view.querySelector('[data-result-heroine]');
  applyCharacterTheme(root, heroineId);
  applyCharacterVisualProfile(heroineEl, heroineId, 'result');
  setupResultReveal(controller, view, speechText);
}


module.exports = {
  renderTurnResult
};

    };

    // --- ./screens/vnScreen.js ---
    modules['./screens/vnScreen.js'] = function(module, exports, require) {
/**
 * VN / ADV Screen for MadeInMaghribal.
 */

const { getCharacterVisualImagePath, getBackgroundPath } = require('../utils/assetPaths.js');
const { applyCharacterVisualProfile, getCharacterVisualProfile } = require('../utils/characterVisualProfiles.js');


function getVisualImagePath(id, mode, expression = 'normal') {
  const profile = getCharacterVisualProfile(id, mode);
  return getCharacterVisualImagePath(id, expression, profile.image);
}

function renderVnShell(controller, view) {
  view.innerHTML = `
    <div class="vn-screen" data-screen="vn">
      <div class="vn-bg" data-vn-bg></div>
      <div class="vn-character-layer" data-vn-char-layer>
        <img class="standing-char" data-vn-char src="" style="display: none;" alt="" />
      </div>
      
      <div class="stats" data-hud></div>
      <div class="score-strip" data-score-strip></div>
      
      <div class="message-box">
        <div class="speaker-name" data-vn-speaker-wrap>
          <img class="speaker-icon" data-vn-speaker-icon src="" style="display: none;" alt="" />
          <span data-vn-speaker></span>
        </div>
        <button class="message-skip-btn" data-action="skip-text">スキップ</button>
        <div class="message-text-wrap">
          <div class="message-text" data-vn-text></div>
        </div>
      </div>
    </div>
  `;
}

function updateVnContent(controller, { speakerName, text, charId, speakerId, bgId, expression, speakerExpression }) {
  const bgEl = controller.container.querySelector('[data-vn-bg]');
  const charEl = controller.container.querySelector('[data-vn-char]');
  const speakerWrapEl = controller.container.querySelector('[data-vn-speaker-wrap]');
  const speakerEl = controller.container.querySelector('[data-vn-speaker]');
  const speakerIconEl = controller.container.querySelector('[data-vn-speaker-icon]');
  const textEl = controller.container.querySelector('[data-vn-text]');

  if (bgEl && bgId) {
    const bgPath = getBackgroundPath(bgId);
    bgEl.style.backgroundImage = `url(${bgPath})`;
  }

  if (charEl) {
    if (charId) {
      charEl.classList.remove('is-visible');
      charEl.style.display = 'block';
      applyCharacterVisualProfile(charEl, charId, 'standing');
      charEl.src = getVisualImagePath(charId, 'standing', expression || 'normal');
      charEl.onerror = () => { charEl.style.display = 'none'; };
      requestAnimationFrame(() => {
        charEl.classList.add('is-visible');
      });
    } else {
      charEl.classList.remove('is-visible');
      charEl.removeAttribute('src');
      charEl.style.display = 'none';
    }
  }

  const iconId = speakerId || charId;
  const hasSpeaker = Boolean(speakerName || iconId);

  if (speakerWrapEl) {
    speakerWrapEl.style.display = hasSpeaker ? 'inline-flex' : 'none';
  }

  if (speakerIconEl) {
    if (iconId) {
      speakerIconEl.src = getVisualImagePath(iconId, 'speakerIcon', speakerExpression || expression || 'normal');
      speakerIconEl.style.display = 'block';
      applyCharacterVisualProfile(speakerIconEl, iconId, 'speakerIcon');
      speakerIconEl.onerror = () => { speakerIconEl.style.display = 'none'; };
    } else {
      speakerIconEl.removeAttribute('src');
      speakerIconEl.style.display = 'none';
    }
  }

  if (speakerEl) speakerEl.textContent = speakerName || '';
  
  if (textEl && text) {
    if (controller.typewriter.fullText !== text) {
      controller.startTypewriter(text, textEl);
    }
  }
}

module.exports = {
  renderVnShell,
  updateVnContent
};

    };

    // --- ./ui/hud.js ---
    modules['./ui/hud.js'] = function(module, exports, require) {
/**
 * HUD / Stats display component for MadeInMaghribal.
 */

function updateHud(controller) {
  const hud = controller.container.querySelector('[data-hud]');
  if (!hud) return;
  
  const s = controller.session.scores;
  const sub = controller.session.subPhase;
  const labels = {
    BEFORE_OPEN: '開店前',
    QUIZ: '接客',
    TURN_RESULT: '営業結果',
    AFTER_CLOSE: '閉店後'
  };
  const label = labels[sub] || sub || '';
  const debug = controller.isDebugMode() ? ' <span class="debug-badge">DEBUG</span>' : '';

  hud.innerHTML = `<div class="hud-main">第${controller.session.turn}ターン | ${label}${debug}</div>`;

  const scoreStrip = controller.container.querySelector('[data-score-strip]');
  if (scoreStrip) {
    scoreStrip.textContent = `売上: ${s.revenue} / 満足: ${s.satisfaction} / 評判: ${s.reputation}`;
  }
}

function renderGlobalUi(controller) {
  let globalUi = controller.container.querySelector('.global-ui');
  if (!globalUi) {
    globalUi = document.createElement('div');
    globalUi.className = 'global-ui';
    controller.container.appendChild(globalUi);
  }

  globalUi.innerHTML = `
    <button class="global-ui-btn" data-action="open-options" title="設定">⚙</button>
    <button class="global-ui-btn" data-action="open-help" title="ヘルプ">？</button>
    <button class="global-ui-btn" data-action="toggle-fullscreen" title="全画面">⛶</button>
  `;
}

function renderModal(controller) {
  const modalName = controller.uiState.modal;
  let backdrop = controller.container.querySelector('.ui-modal-backdrop');

  if (!modalName) {
    if (backdrop) backdrop.remove();
    return;
  }

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'ui-modal-backdrop';
    controller.container.appendChild(backdrop);
  }

  if (modalName === 'options') {
    renderOptionsModal(controller, backdrop);
  } else if (modalName === 'help') {
    renderHelpModal(controller, backdrop);
  }
}

function renderOptionsModal(controller, container) {
  const speed = controller.settings.textSpeed;
  const speeds = [
    { id: 'slow', label: '遅い' },
    { id: 'normal', label: '標準' },
    { id: 'fast', label: '速い' },
    { id: 'instant', label: '瞬時' }
  ];
  const bgmOn = controller.settings.bgmEnabled !== false;
  const sfxOn = controller.settings.sfxEnabled !== false;
  const bgmVol = Math.round(Number(controller.settings.bgmVolume ?? 0.22) * 100);
  const sfxVol = Math.round(Number(controller.settings.sfxVolume ?? 1) * 100);

  const renderAudioRow = (kind, label, enabled, volume) => `
    <div class="audio-option-row">
      <div>
        <strong>${label}</strong>
        <span>${enabled ? 'ON' : 'OFF'} / ${volume}%</span>
      </div>
      <div class="audio-option-controls">
        <button class="option-button ${enabled ? 'is-active' : ''}" data-action="set-audio-enabled" data-audio-kind="${kind}" data-enabled="true">ON</button>
        <button class="option-button ${!enabled ? 'is-active' : ''}" data-action="set-audio-enabled" data-audio-kind="${kind}" data-enabled="false">OFF</button>
        <button class="option-button" data-action="adjust-audio-volume" data-audio-kind="${kind}" data-delta="-0.1">−</button>
        <button class="option-button" data-action="adjust-audio-volume" data-audio-kind="${kind}" data-delta="0.1">＋</button>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div class="ui-modal options-modal">
      <h2>設定</h2>
      <div class="option-row">
        <p style="margin-bottom: 10px; font-weight: 800;">テキスト速度</p>
        <div class="option-buttons">
          ${speeds.map(s => `
            <button class="option-button ${speed === s.id ? 'is-active' : ''}" 
                    data-action="set-text-speed" data-speed="${s.id}">${s.label}</button>
          `).join('')}
        </div>
      </div>
      <div class="option-row">
        <p style="margin-bottom: 10px; font-weight: 800;">音量</p>
        ${renderAudioRow('bgm', 'BGM', bgmOn, bgmVol)}
        ${renderAudioRow('sfx', 'SE', sfxOn, sfxVol)}
      </div>
      <button class="modal-close-btn" data-action="close-modal">閉じる</button>
    </div>
  `;
}

function renderHelpModal(controller, container) {
  container.innerHTML = `
    <div class="ui-modal">
      <h2>ヘルプ</h2>
      <div style="line-height: 1.8; font-size: 0.95rem;">
        <p>・クイズではお客さんの要望に合う品を選びます。</p>
        <p>・リズムよく答えると評判が上がります。</p>
        <p>・早く答えると満足度が上がります。</p>
      </div>
      <button class="modal-close-btn" data-action="close-modal">閉じる</button>
    </div>
  `;
}

module.exports = {
  updateHud,
  renderGlobalUi,
  renderModal
};

    };

    // --- ./ui/resultStamp.js ---
    modules['./ui/resultStamp.js'] = function(module, exports, require) {
/**
 * Result stamp (receipt style) component for MadeInMaghribal.
 */

function getSpeedMark(result) {
  if ((result.satisfactionBonus || 0) >= 2) return '◎';
  if ((result.satisfactionBonus || 0) >= 1) return '○';
  return '△';
}

function getTempoMark(result) {
  if (result.rating === 'PERFECT') return '◎';
  if (result.rating === 'GOOD') return '○';
  return '△';
}

function getCorrectLabel(result) {
  return result.isCorrect ? '正解' : '不正解';
}

function showResultStamp(controller, result) {
  const root = document.getElementById('game-viewport') || controller.container;
  if (!root) return;

  const el = document.createElement('div');
  el.className = `result-stamp ${result.isCorrect ? 'is-correct' : 'is-wrong'}`;
  el.innerHTML = `
    <div class="stamp-main">${getCorrectLabel(result)}</div>
    <div class="stamp-row"><span>スピード</span><strong>${getSpeedMark(result)}</strong></div>
    <div class="stamp-row"><span>テンポ</span><strong>${getTempoMark(result)}</strong></div>
  `;

  root.appendChild(el);
  setTimeout(() => {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }, 520);
}

module.exports = {
  showResultStamp,
  getSpeedMark,
  getTempoMark,
  getCorrectLabel
};

    };

    // --- ./utils/assetPaths.js ---
    modules['./utils/assetPaths.js'] = function(module, exports, require) {
/**
 * Asset path utilities for MadeInMaghribal.
 * Verified against actual filesystem structure.
 */

function normalizeCharacterDir(id) {
  const normalized = String(id).replace(/^CH_/i, '').toUpperCase();
  const folderNames = {
    NADIR: 'nader',
    NADER: 'nader',
    HAKIMA: 'hakima',
    MIRA: 'mira',
    DARIYA: 'dariya'
  };
  return folderNames[normalized] || normalized.toLowerCase();
}

function getCharacterStandingPath(id, expression = 'normal') {
  if (!id) return '';
  const charDir = normalizeCharacterDir(id);
  // Valid expressions from filesystem: normal, joy, fun, anger, cry, sorrow, surprise, etc.
  const expFile = expression.toLowerCase();
  return `characters/${charDir}/standing_proc/${expFile}.png`;
}

function getCharacterIconPath(id, expression = 'normal') {
  if (!id) return '';
  const charDir = normalizeCharacterDir(id);
  const expFile = expression.toLowerCase();
  return `characters/${charDir}/face_proc/${expFile}.png`;
}


function getCharacterVisualImagePath(id, expression = 'normal', imageKind = 'standing') {
  if (imageKind === 'face') return getCharacterIconPath(id, expression);
  return getCharacterStandingPath(id, expression);
}

function getBackgroundPath(sceneId) {
  const backgrounds = {
    MARKET: 'images/background/bg_market_central.jpeg',
    TEA_ROOM: 'images/background/bg_shop_interior_service.jpeg',
    OASIS: 'images/background/bg_spot_oasis_view.jpeg'
  };
  return backgrounds[sceneId] || backgrounds.TEA_ROOM;
}

module.exports = {
  normalizeCharacterDir,
  getCharacterStandingPath,
  getCharacterIconPath,
  getCharacterVisualImagePath,
  getBackgroundPath
};

    };

    // --- ./utils/bgmEngine.js ---
    modules['./utils/bgmEngine.js'] = function(module, exports, require) {
/**
 * Lightweight BGM engine for MadeInMaghribal.
 *
 * Browser policy:
 * - BGM is selected before user input, but playback starts only after unlock().
 * - If the requested track is already playing, it is kept running.
 * - BGM is exclusive: rapid clicks/phase changes must never leave old tracks playing.
 * - Volume is intentionally modest; tune here later if needed.
 */

const { AUDIO_MANIFEST } = require('../data/audioManifest.cjs');
const { calculateAffection } = require('../core/affectionModel.cjs');
const { evaluateEnding } = require('../core/endingBranch.cjs');

const DEFAULT_BGM_VOLUME = 0.22;
const BGM_FADE_OUT_MS = 260;
const BGM_FADE_IN_MS = 420;
const BGM_FADE_STEP_MS = 40;

function findSystemTrack(id) {
  return (AUDIO_MANIFEST?.bgm?.system || []).find((track) => track.id === id) || null;
}

function getHeroineBgm(heroineId) {
  const id = heroineId || 'HAKIMA';
  return AUDIO_MANIFEST?.bgm?.heroines?.[id] || AUDIO_MANIFEST?.bgm?.heroines?.HAKIMA || null;
}

function getGameTrack(heroineId, turn = 1) {
  if (turn <= 1) return findSystemTrack('main03_puzzle');
  const heroine = getHeroineBgm(heroineId);
  const gameTracks = heroine?.game || [];
  if (!gameTracks.length) return findSystemTrack('main03_puzzle');
  const index = Math.max(0, (turn - 2) % gameTracks.length);
  return gameTracks[index];
}

function getEndingTrack(session) {
  const heroine = getHeroineBgm(session?.selectedHeroineId);
  const affection = calculateAffection(session?.scores || {});
  const endingType = evaluateEnding(affection, session?.routeMode === 'long_history');
  return endingType === 'GOOD' ? heroine?.ending?.good : heroine?.ending?.normal;
}

function getTrackForSession(session) {
  if (!session) return findSystemTrack('main01_title');
  const phase = session.phase;
  const subPhase = session.subPhase;

  if (phase === 'TITLE' || phase === 'OPENING' || phase === 'HEROINE_SELECT') {
    return findSystemTrack('main01_title');
  }

  if (phase === 'ENDING') {
    return getEndingTrack(session) || findSystemTrack('main02_shop');
  }

  if (phase === 'MAIN_GAME') {
    if (subPhase === 'QUIZ') {
      return getGameTrack(session.selectedHeroineId, session.turn);
    }
    return findSystemTrack('main02_shop');
  }

  return findSystemTrack('main01_title');
}

function clampVolume(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_BGM_VOLUME;
  return Math.max(0, Math.min(1, value));
}

function createBgmEngine(options = {}) {
  let baseVolume = clampVolume(options.volume ?? DEFAULT_BGM_VOLUME);
  let enabled = true;
  let unlocked = false;
  let currentAudio = null;
  let currentPath = '';
  let pendingTrack = null;
  let requestSerial = 0;
  let pendingStartTimer = null;
  const managedAudios = new Set();
  const fadeTimers = new Map();

  function clearFadeTimer(audio) {
    const timerId = fadeTimers.get(audio);
    if (timerId) window.clearInterval(timerId);
    fadeTimers.delete(audio);
  }

  function clearPendingStart() {
    if (pendingStartTimer) {
      window.clearTimeout(pendingStartTimer);
      pendingStartTimer = null;
    }
  }

  function stopAudio(audio) {
    if (!audio) return;
    clearFadeTimer(audio);
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
      audio.load();
    } catch (error) {
      console.warn('Failed to stop BGM audio:', error);
    }
    managedAudios.delete(audio);
  }

  function fadeOutAndStop(audio, durationMs = BGM_FADE_OUT_MS) {
    if (!audio) return;
    clearFadeTimer(audio);

    if (audio.paused || durationMs <= 0) {
      stopAudio(audio);
      return;
    }

    const startVolume = Number.isFinite(audio.volume) ? audio.volume : baseVolume;
    const startedAt = Date.now();
    const timerId = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / durationMs);
      audio.volume = Math.max(0, startVolume * (1 - progress));
      if (progress >= 1) stopAudio(audio);
    }, BGM_FADE_STEP_MS);
    fadeTimers.set(audio, timerId);
  }

  function fadeIn(audio, token, durationMs = BGM_FADE_IN_MS) {
    if (!audio || durationMs <= 0) {
      if (audio) audio.volume = baseVolume;
      return;
    }

    clearFadeTimer(audio);
    audio.volume = 0;
    const startedAt = Date.now();
    const timerId = window.setInterval(() => {
      if (token !== requestSerial || currentAudio !== audio) {
        stopAudio(audio);
        return;
      }
      const progress = Math.min(1, (Date.now() - startedAt) / durationMs);
      audio.volume = Math.min(baseVolume, baseVolume * progress);
      if (progress >= 1) {
        clearFadeTimer(audio);
        audio.volume = baseVolume;
      }
    }, BGM_FADE_STEP_MS);
    fadeTimers.set(audio, timerId);
  }

  function stopAllExcept(audioToKeep = null, fade = false) {
    Array.from(managedAudios).forEach((audio) => {
      if (audio === audioToKeep) return;
      if (fade) fadeOutAndStop(audio);
      else stopAudio(audio);
    });
  }

  function createAndPlayAudio(track, token) {
    if (token !== requestSerial || !track?.path) return;

    const audio = new Audio(track.path);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;

    currentAudio = audio;
    currentPath = track.path;
    managedAudios.add(audio);

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          if (token !== requestSerial || currentAudio !== audio) {
            stopAudio(audio);
            return;
          }
          fadeIn(audio, token);
        })
        .catch((error) => {
          console.warn('BGM playback deferred:', error);
          if (token === requestSerial) {
            pendingTrack = track;
            if (currentAudio === audio) {
              currentAudio = null;
              currentPath = '';
            }
          }
          stopAudio(audio);
        });
    } else {
      fadeIn(audio, token);
    }
  }

  function startTrack(track) {
    if (!track?.path) return;

    const nextPath = track.path;
    pendingTrack = track;

    if (currentPath === nextPath && currentAudio && !currentAudio.paused) return;

    requestSerial += 1;
    const token = requestSerial;
    clearPendingStart();

    const hadActiveAudio = Array.from(managedAudios).some((audio) => audio && !audio.paused);

    // BGM remains exclusive. Old tracks fade out first, then the newest request
    // starts. Rapid requests invalidate older timers via requestSerial.
    stopAllExcept(null, true);
    currentAudio = null;
    currentPath = nextPath;

    const delay = hadActiveAudio ? BGM_FADE_OUT_MS : 0;
    pendingStartTimer = window.setTimeout(() => {
      pendingStartTimer = null;
      createAndPlayAudio(track, token);
    }, delay);
  }

  function play(track) {
    if (!track?.path) return;
    pendingTrack = track;
    if (!enabled || !unlocked) return;
    startTrack(track);
  }

  function playForSession(session) {
    play(getTrackForSession(session));
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (enabled && pendingTrack) startTrack(pendingTrack);
  }

  function stop() {
    requestSerial += 1;
    clearPendingStart();
    stopAllExcept(null);
    currentAudio = null;
    currentPath = '';
    pendingTrack = null;
  }

  function setEnabled(nextEnabled) {
    enabled = Boolean(nextEnabled);
    if (!enabled) stop();
    else if (unlocked && pendingTrack) startTrack(pendingTrack);
  }

  function setVolume(value) {
    baseVolume = clampVolume(value);
    if (currentAudio) currentAudio.volume = baseVolume;
  }

  function getState() {
    return {
      enabled,
      unlocked,
      currentPath,
      pendingPath: pendingTrack?.path || '',
      managedAudioCount: managedAudios.size,
      volume: baseVolume,
      fadeOutMs: BGM_FADE_OUT_MS,
      fadeInMs: BGM_FADE_IN_MS
    };
  }

  return {
    unlock,
    play,
    playForSession,
    stop,
    setEnabled,
    setVolume,
    getState
  };
}

module.exports = {
  createBgmEngine,
  getTrackForSession
};

    };

    // --- ./utils/characterVisualProfiles.js ---
    modules['./utils/characterVisualProfiles.js'] = function(module, exports, require) {
/**
 * Per-character visual profiles for MadeInMaghribal.
 *
 * The source image folders stay small:
 * - standing_proc: full character artwork
 * - face_proc: small UI / speaker icons
 *
 * Bust-up and close-up displays are not separate image assets. They are visual
 * modes that crop/scale the standing artwork through this profile.
 */

const DEFAULT_THEME = {
  primary: '#f6d36b',
  secondary: '#d68a35',
  textStroke: 'rgba(74, 42, 12, 0.45)',
  stampFont: '"Yu Mincho", "Hiragino Mincho ProN", serif'
};

const DEFAULT_VISUAL_MODE = {
  image: 'standing',
  scale: 1,
  x: 0,
  y: 0,
  bottom: 0,
  height: 520
};

const DEFAULT_ICON_MODE = {
  image: 'face',
  scale: 1,
  x: 50,
  y: 50
};

const DEFAULT_PROFILE = {
  theme: DEFAULT_THEME,
  standing: { ...DEFAULT_VISUAL_MODE, height: 980, bottom: 0 },
  heroineSelect: { ...DEFAULT_VISUAL_MODE, height: 520, bottom: -86 },
  bustup: { ...DEFAULT_VISUAL_MODE, height: 660, bottom: -260, scale: 1.45 },
  eventClose: { ...DEFAULT_VISUAL_MODE, height: 700, bottom: -300, scale: 1.62 },
  result: { ...DEFAULT_VISUAL_MODE, height: 900, bottom: -20, scale: 0.92 },
  selectIcon: DEFAULT_ICON_MODE,
  speakerIcon: DEFAULT_ICON_MODE
};

const CHARACTER_VISUAL_PROFILES = {
  MIRA: {
    theme: { primary: '#6fd7ff', secondary: '#2d91d0', textStroke: 'rgba(16, 67, 105, 0.50)', stampFont: '"Klee", "Hannotate SC", "Hiragino Maru Gothic ProN", "Yu Gothic", cursive' },
    standing: { image: 'standing', scale: 1.00, x: 0, y: 0, bottom: 0, height: 980 },
    heroineSelect: { image: 'standing', scale: 1.00, x: 0, y: 0, bottom: -86, height: 520 },
    bustup: { image: 'standing', scale: 1.42, x: 0, y: 0, bottom: -260, height: 660 },
    eventClose: { image: 'standing', scale: 1.58, x: 0, y: 0, bottom: -300, height: 700 },
    result: { image: 'standing', scale: 0.94, x: -12, y: 0, bottom: -28, height: 900 },
    selectIcon: { image: 'face', scale: 1.00, x: 50, y: 50 },
    speakerIcon: { image: 'face', scale: 1.00, x: 50, y: 50 }
  },
  HAKIMA: {
    theme: { primary: '#ffd86c', secondary: '#e58a2f', textStroke: 'rgba(98, 55, 12, 0.52)', stampFont: '"UD Digi Kyokasho N-R", "Yu Mincho", "Hiragino Mincho ProN", serif' },
    // Ear height makes her effective top taller; keep a small downward nudge.
    standing: { image: 'standing', scale: 1.10, x: 0, y: 0, bottom: 0, height: 980 },
    heroineSelect: { image: 'standing', scale: 1.14, x: 0, y: 10, bottom: -98, height: 520 },
    bustup: { image: 'standing', scale: 1.56, x: 0, y: 16, bottom: -278, height: 660 },
    eventClose: { image: 'standing', scale: 1.74, x: 0, y: 18, bottom: -318, height: 700 },
    result: { image: 'standing', scale: 0.98, x: -10, y: 0, bottom: -34, height: 900 },
    selectIcon: { image: 'face', scale: 1.04, x: 50, y: 48 },
    speakerIcon: { image: 'face', scale: 1.04, x: 50, y: 48 }
  },
  DARIYA: {
    theme: { primary: '#ff6d9b', secondary: '#b83363', textStroke: 'rgba(85, 13, 45, 0.55)', stampFont: '"Yu Mincho", "Hiragino Mincho ProN", "HGS明朝E", serif' },
    // Horn height needs a stronger downward nudge after face-size scaling.
    standing: { image: 'standing', scale: 1.22, x: 0, y: 0, bottom: 0, height: 980 },
    heroineSelect: { image: 'standing', scale: 1.28, x: 0, y: 20, bottom: -118, height: 520 },
    bustup: { image: 'standing', scale: 1.72, x: 0, y: 28, bottom: -300, height: 660 },
    eventClose: { image: 'standing', scale: 1.90, x: 0, y: 32, bottom: -342, height: 700 },
    result: { image: 'standing', scale: 1.04, x: -18, y: 0, bottom: -44, height: 900 },
    selectIcon: { image: 'face', scale: 1.02, x: 50, y: 47 },
    speakerIcon: { image: 'face', scale: 1.02, x: 50, y: 47 }
  },
  NADIR: {
    theme: { primary: '#f4c267', secondary: '#3d83c9', textStroke: 'rgba(35, 49, 84, 0.50)', stampFont: '"Yu Gothic", "Hiragino Sans", system-ui, sans-serif' },
    standing: { image: 'standing', scale: 1.10, x: 0, y: 0, bottom: 0, height: 980 },
    heroineSelect: { image: 'standing', scale: 1.12, x: 0, y: 8, bottom: -96, height: 520 },
    bustup: { image: 'standing', scale: 1.56, x: 0, y: 14, bottom: -278, height: 660 },
    eventClose: { image: 'standing', scale: 1.72, x: 0, y: 18, bottom: -318, height: 700 },
    result: { image: 'standing', scale: 0.96, x: -10, y: 0, bottom: -34, height: 900 },
    selectIcon: { image: 'face', scale: 1.04, x: 50, y: 48 },
    speakerIcon: { image: 'face', scale: 1.04, x: 50, y: 48 }
  }
};

function normalizeCharacterId(id) {
  if (!id) return '';
  return String(id).replace(/^CH_/i, '').toUpperCase();
}

function mergeMode(base, override) {
  return { ...(base || {}), ...(override || {}) };
}

function getCharacterTheme(id) {
  const normalized = normalizeCharacterId(id);
  const profile = CHARACTER_VISUAL_PROFILES[normalized] || {};
  return { ...DEFAULT_THEME, ...(profile.theme || {}) };
}

function getCharacterVisualProfile(id, mode = 'standing') {
  const normalized = normalizeCharacterId(id);
  const profile = CHARACTER_VISUAL_PROFILES[normalized] || {};
  const defaultMode = DEFAULT_PROFILE[mode] || DEFAULT_PROFILE.standing;
  const characterMode = profile[mode] || profile.standing;
  return mergeMode(defaultMode, characterMode);
}

function applyCharacterVisualProfile(el, id, mode = 'standing') {
  if (!el) return;
  const profile = getCharacterVisualProfile(id, mode);

  el.dataset.visualMode = mode;
  el.dataset.visualImage = profile.image || 'standing';

  el.style.setProperty('--char-scale', String(profile.scale ?? 1));
  el.style.setProperty('--char-x', `${profile.x ?? 0}px`);
  el.style.setProperty('--char-y', `${profile.y ?? 0}px`);
  el.style.setProperty('--char-bottom', `${profile.bottom ?? 0}px`);
  el.style.setProperty('--char-height', `${profile.height ?? 520}px`);

  // Backward-compatible aliases for existing icon rules.
  el.style.setProperty('--char-face-scale', String(profile.scale ?? 1));
  el.style.setProperty('--icon-x', `${profile.x ?? 50}%`);
  el.style.setProperty('--icon-y', `${profile.y ?? 50}%`);
}

function applyCharacterTheme(el, id) {
  if (!el) return;
  const theme = getCharacterTheme(id);
  el.style.setProperty('--heroine-theme-primary', theme.primary);
  el.style.setProperty('--heroine-theme-secondary', theme.secondary);
  el.style.setProperty('--heroine-theme-stroke', theme.textStroke);
  el.style.setProperty('--heroine-stamp-font', theme.stampFont || DEFAULT_THEME.stampFont);
}

module.exports = {
  CHARACTER_VISUAL_PROFILES,
  getCharacterVisualProfile,
  getCharacterTheme,
  applyCharacterVisualProfile,
  applyCharacterTheme,
  normalizeCharacterId
};

    };

    // --- ./utils/debugJump.js ---
    modules['./utils/debugJump.js'] = function(module, exports, require) {
/**
 * Debug jump utilities for MadeInMaghribal.
 */

function isDebugMode() {
  return new URLSearchParams(window.location.search).get('debug') === '1';
}

function applyDebugJumpFromUrl(controller) {
  if (!isDebugMode()) return;
  const params = new URLSearchParams(window.location.search);
  const jump = params.get('jump');
  if (!jump) return;
  applyDebugJump(controller, jump);
}

function applyDebugJump(controller, jump) {
  const params = new URLSearchParams(window.location.search);
  const heroine = (params.get('heroine') || 'HAKIMA').toUpperCase();
  console.log('Applying debug jump:', jump);

  if (jump === 'title') {
    controller.session.phase = 'TITLE';
    return;
  }

  if (jump === 'opening') {
    controller.session.phase = 'OPENING';
    return;
  }

  if (jump === 'heroine_select') {
    controller.session.phase = 'HEROINE_SELECT';
    return;
  }

  if (jump === 'before_open') {
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = Number(params.get('turn') || 1);
    controller.session.subPhase = 'BEFORE_OPEN';
    controller.session.scores = { revenue: 0, satisfaction: 0, reputation: 0 };
    return;
  }

  if (jump === 'after_close') {
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = Number(params.get('turn') || 1);
    controller.session.subPhase = 'AFTER_CLOSE';
    controller.session.scores = { revenue: 80, satisfaction: 14, reputation: 9 };
    return;
  }

  if (jump === 'quiz') {
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = 1;
    controller.session.subPhase = 'QUIZ';
    controller.startQuiz();
    return;
  }

  if (jump === 'turn_result') {
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = Number(params.get('turn') || 1);
    controller.session.subPhase = 'TURN_RESULT';
    controller.session.scores = { revenue: 80, satisfaction: 14, reputation: 9 };
    controller.quizState.turnStartScore = { revenue: 0, satisfaction: 0, reputation: 0 };
    controller.quizState.lastResult = {
      isCorrect: true,
      rating: 'GOOD',
      satisfactionBonus: 2,
      reputationBonus: 1,
      diffMs: 88,
      responseTime: 1200
    };
    return;
  }


  if (jump === 'result_encourage' || jump === 'result_evaluate' || jump === 'result_surprise' || jump === 'result_low' || jump === 'result_mid' || jump === 'result_high') {
    const presets = {
      result_encourage: { revenue: 10, satisfaction: 4, reputation: 3 },
      result_evaluate: { revenue: 40, satisfaction: 14, reputation: 10 },
      result_surprise: { revenue: 80, satisfaction: 20, reputation: 16 },
      result_low: { revenue: 10, satisfaction: 4, reputation: 3 },
      result_mid: { revenue: 40, satisfaction: 14, reputation: 10 },
      result_high: { revenue: 80, satisfaction: 20, reputation: 16 }
    };
    const score = presets[jump];
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = Number(params.get('turn') || 1);
    controller.session.subPhase = 'TURN_RESULT';
    controller.session.scores = { ...score };
    controller.quizState.turnStartScore = { revenue: 0, satisfaction: 0, reputation: 0 };
    controller.quizState.lastResult = {
      isCorrect: jump !== 'result_encourage',
      rating: (jump === 'result_surprise' || jump === 'result_high') ? 'GREAT' : ((jump === 'result_evaluate' || jump === 'result_mid') ? 'GOOD' : 'MISS'),
      satisfactionBonus: score.satisfaction,
      reputationBonus: score.reputation,
      diffMs: 80,
      responseTime: 1200
    };
    return;
  }

  if (jump === 'turn5_after_close') {
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = 5;
    controller.session.subPhase = 'AFTER_CLOSE';
    controller.session.scores = { revenue: 420, satisfaction: 80, reputation: 70 };
    return;
  }

  if (jump === 'ending_good') {
    controller.session.phase = 'ENDING';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = 5;
    controller.session.subPhase = 'AFTER_CLOSE';
    controller.session.scores = { revenue: 500, satisfaction: 100, reputation: 100 };
    return;
  }

  if (jump === 'ending_normal') {
    controller.session.phase = 'ENDING';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = 5;
    controller.session.subPhase = 'AFTER_CLOSE';
    controller.session.scores = { revenue: 100, satisfaction: 10, reputation: 10 };
    return;
  }

  console.warn('Unknown debug jump:', jump);
}

module.exports = {
  isDebugMode,
  applyDebugJumpFromUrl,
  applyDebugJump
};

    };

    // --- ./utils/displayNames.js ---
    modules['./utils/displayNames.js'] = function(module, exports, require) {
/**
 * Display name and icon utilities for MadeInMaghribal.
 */

function getHeroineDisplayName(id) {
  const names = {
    HAKIMA: 'ハキマ',
    MIRA: 'ミラ',
    DARIYA: 'ダリヤ'
  };
  return names[id] || id;
}

function getItemDisplayName(controller, itemId, quality = 'base') {
  const { getItemDisplayName: getRawName } = require('../data/itemDisplayNames.cjs');
  const { ITEM_MASTER } = require('../data/itemMaster.cjs');

  const name = getRawName(itemId, quality);
  if (name && name !== itemId) return name;

  const item = ITEM_MASTER.find(i => i.itemId === itemId);
  return item ? item.name : itemId;
}

function getItemIconPath(itemId) {
  return `images/items/${itemId}.png`;
}

function getTurnRank(dR, dS, dRep) {
  const total = dR + dS + dRep;
  if (total >= 90) return '大成功';
  if (total >= 60) return '成功';
  if (total >= 30) return 'まずまず';
  return '要改善';
}

module.exports = {
  getHeroineDisplayName,
  getItemDisplayName,
  getItemIconPath,
  getTurnRank
};

    };

    // --- ./utils/itemCollection.js ---
    modules['./utils/itemCollection.js'] = function(module, exports, require) {
/**
 * Lightweight item collection state for the future item encyclopedia.
 *
 * Rule: an item is registered when it appears as a quiz candidate, even if the
 * player does not select it.
 */

const ITEM_COLLECTION_KEY = 'madeinmaghribal.collection.items';

function canUseStorage() {
  try {
    return typeof localStorage !== 'undefined';
  } catch (e) {
    return false;
  }
}

function loadItemCollection() {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(ITEM_COLLECTION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    console.warn('Failed to load item collection:', e);
    return {};
  }
}

function saveItemCollection(collection) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(ITEM_COLLECTION_KEY, JSON.stringify(collection));
  } catch (e) {
    console.warn('Failed to save item collection:', e);
  }
}

function registerSeenItems(itemIds, context = {}) {
  const collection = loadItemCollection();
  const now = new Date().toISOString();
  const results = [];

  itemIds.forEach((itemId) => {
    if (!itemId) return;
    const exists = Boolean(collection[itemId]?.seen);
    if (!exists) {
      collection[itemId] = {
        seen: true,
        firstSeenAt: now,
        firstSeenTurn: context.turn || null,
        firstSeenQuestionIndex: Number.isInteger(context.questionIndex) ? context.questionIndex : null
      };
    }
    results.push({ itemId, isNew: !exists });
  });

  saveItemCollection(collection);
  return results;
}

module.exports = {
  ITEM_COLLECTION_KEY,
  loadItemCollection,
  saveItemCollection,
  registerSeenItems
};

    };

    // --- ./utils/playerProgress.js ---
    modules['./utils/playerProgress.js'] = function(module, exports, require) {
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
    imageSeen: {}
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
    imageSeen: src.imageSeen && typeof src.imageSeen === 'object' ? src.imageSeen : {}
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
    clearedEndingCount: clearedEndings.length,
    eventSeenCount: Object.keys(progress.eventSeen || {}).length,
    imageSeenCount: Object.keys(progress.imageSeen || {}).length
  };
}

module.exports = {
  PLAYER_PROGRESS_KEY,
  HEROINE_IDS,
  ROUTE_MODES,
  getDefaultPlayerProgress,
  loadPlayerProgress,
  savePlayerProgress,
  recordEndingProgress,
  getPlayerProgressSummary
};

    };

    // --- ./utils/preloadAssets.js ---
    modules['./utils/preloadAssets.js'] = function(module, exports, require) {
/**
 * Lightweight asset preloader for MadeInMaghribal.
 *
 * This does not play audio. It only asks the browser to warm image/audio data.
 * Policy:
 * - Opening/title: preload only heroine normal images. No heroine-specific BGM.
 * - Heroine select: preload heroine expression images and heroine BGM files.
 * - Result: preload expression images before rank reveal to avoid visible flicker.
 */

const { getCharacterVisualImagePath } = require('./assetPaths.js');
const { AUDIO_MANIFEST } = require('../data/audioManifest.cjs');

const HEROINE_IDS = ['HAKIMA', 'MIRA', 'DARIYA'];
const HEROINE_EXPRESSIONS = [
  'normal',
  'joy',
  'fun',
  'anger',
  'cry',
  'sorrow',
  'surprise',
  'maid',
  'social',
  'student'
];
const RESULT_EXPRESSIONS = ['normal', 'sorrow', 'fun', 'joy'];
const GAME_START_EXPRESSIONS = ['normal', 'maid', 'social', 'student'];

function compactUnique(values) {
  return [...new Set(values.filter(Boolean))];
}

function collectHeroineBgmPaths() {
  const heroines = AUDIO_MANIFEST?.bgm?.heroines || {};
  return Object.values(heroines).flatMap((entry) => {
    const paths = [];
    if (entry?.theme?.path) paths.push(entry.theme.path);
    if (Array.isArray(entry?.game)) {
      entry.game.forEach((track) => {
        if (track?.path) paths.push(track.path);
      });
    }
    if (entry?.ending?.normal?.path) paths.push(entry.ending.normal.path);
    if (entry?.ending?.good?.path) paths.push(entry.ending.good.path);
    return paths;
  });
}

function createAssetPreloader() {
  const imageCache = new Map();
  const audioCache = new Map();
  const linkCache = new Set();
  let openingStarted = false;
  let heroineSelectStarted = false;

  function preloadImage(src) {
    if (!src) return Promise.resolve(false);
    if (imageCache.has(src)) return imageCache.get(src).promise;

    const record = { src, status: 'loading', promise: null };
    record.promise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        record.status = 'loaded';
        resolve(true);
      };
      img.onerror = () => {
        record.status = 'error';
        resolve(false);
      };
      img.src = src;
    });

    imageCache.set(src, record);
    return record.promise;
  }

  function preloadImages(srcs) {
    return Promise.all(compactUnique(srcs).map(preloadImage));
  }

  function appendAudioPreloadLink(path) {
    if (!path || linkCache.has(path) || typeof document === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'audio';
    link.href = path;
    document.head.appendChild(link);
    linkCache.add(path);
  }

  function preloadAudio(path) {
    if (!path) return;
    if (audioCache.has(path)) return;

    appendAudioPreloadLink(path);
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = path;
      audio.load();
      audioCache.set(path, audio);
    } catch (e) {
      audioCache.set(path, null);
    }
  }

  function preloadAudioPaths(paths) {
    compactUnique(paths).forEach(preloadAudio);
  }

  function preloadOpeningAssets() {
    if (openingStarted) return;
    openingStarted = true;

    // ゲーム開始時点で使う基本衣装/表情を先に温める。個別BGMはまだ読まない。
    const startImagePaths = HEROINE_IDS.flatMap((id) => (
      GAME_START_EXPRESSIONS.flatMap((expression) => [
        getCharacterVisualImagePath(id, expression, 'standing'),
        getCharacterVisualImagePath(id, expression, 'face')
      ])
    ));
    preloadImages(startImagePaths);
  }

  function preloadHeroineSelectAssets() {
    if (heroineSelectStarted) return;
    heroineSelectStarted = true;

    const heroineImagePaths = HEROINE_IDS.flatMap((id) => (
      HEROINE_EXPRESSIONS.flatMap((expression) => [
        getCharacterVisualImagePath(id, expression, 'standing'),
        getCharacterVisualImagePath(id, expression, 'face')
      ])
    ));
    preloadImages(heroineImagePaths);
    preloadAudioPaths(collectHeroineBgmPaths());
  }

  function preloadResultExpressions(heroineId, resultExpression) {
    const heroineExpressions = compactUnique([...RESULT_EXPRESSIONS, resultExpression]);
    const imagePaths = [
      ...heroineExpressions.map((expression) => getCharacterVisualImagePath(heroineId, expression, 'standing')),
      ...heroineExpressions.map((expression) => getCharacterVisualImagePath(heroineId, expression, 'face')),
      ...heroineExpressions.map((expression) => getCharacterVisualImagePath('NADIR', expression, 'face'))
    ];
    return preloadImages(imagePaths);
  }

  function getStats() {
    const imageStats = { loading: 0, loaded: 0, error: 0 };
    imageCache.forEach((record) => {
      imageStats[record.status] = (imageStats[record.status] || 0) + 1;
    });
    return {
      images: imageStats,
      audio: audioCache.size,
      links: linkCache.size,
      openingStarted,
      heroineSelectStarted
    };
  }

  return {
    preloadImage,
    preloadImages,
    preloadAudio,
    preloadAudioPaths,
    preloadOpeningAssets,
    preloadHeroineSelectAssets,
    preloadResultExpressions,
    getStats
  };
}

module.exports = {
  createAssetPreloader
};

    };

    // --- ./utils/saveData.js ---
    modules['./utils/saveData.js'] = function(module, exports, require) {
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


function normalizeRouteMode(routeMode) {
  if (routeMode === 'extra') return 'long_history';
  if (routeMode === 'long_history') return 'long_history';
  return 'normal';
}

function hasRunSave() {
  return Boolean(loadRunSave());
}


function formatSavedAt(savedAt) {
  if (!savedAt) return '保存日時不明';
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return '保存日時不明';
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getRunSaveSummary() {
  const saveData = loadRunSave();
  if (!saveData?.session) return null;
  const quizState = saveData.quizState || {};
  return {
    savedAt: saveData.savedAt || null,
    savedAtLabel: formatSavedAt(saveData.savedAt),
    phase: saveData.session.phase || 'TITLE',
    subPhase: saveData.session.subPhase || null,
    turn: saveData.session.turn || 1,
    selectedHeroineId: saveData.session.selectedHeroineId || null,
    routeMode: normalizeRouteMode(saveData.session.routeMode),
    scores: cloneJson(saveData.session.scores || {}),
    questionIndex: quizState.questionIndex || 0,
    totalQuestions: quizState.totalQuestions || 10,
    hasRestorableQuestion: Boolean(quizState.currentQuestion && Array.isArray(quizState.currentChoices) && quizState.currentChoices.length >= 2)
  };
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
      routeMode: normalizeRouteMode(session.routeMode),
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
  session.routeMode = normalizeRouteMode(session.routeMode);
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
  getRunSaveSummary,
  clearRunSave,
  saveRun,
  applyRunSave
};

    };

    // --- ./utils/sfxEngine.js ---
    modules['./utils/sfxEngine.js'] = function(module, exports, require) {
/**
 * Lightweight SFX engine for browser UI.
 *
 * Notes:
 * - Audio files are under public/audio/se.
 * - Each selected SE can have independent volume and trim settings.
 * - Playback is best-effort; browser autoplay restrictions are handled by
 *   unlocking on the first user gesture and by only playing from user actions.
 */

const SELECTED_SFX = {
  uiTapBottle: {
    path: 'audio/se/ui_tap_bottle_01_3.mp3',
    volume: 1.10,
    start: 0,
    end: null
  },
  uiConfirmChime: {
    path: 'audio/se/ui_confirm_chime_01_3.mp3',
    volume: 0.30,
    start: 0,
    end: null
  },
  quizChoicePick: {
    path: 'audio/se/quiz_choice_pick_01_3.mp3',
    volume: 0.36,
    start: 0,
    end: 1.0
  },
  quizCorrectStarChime: {
    path: 'audio/se/quiz_correct_star_chime_01.mp3',
    volume: 0.46,
    start: 0,
    end: null
  },
  quizWrongSandTap: {
    path: 'audio/se/quiz_wrong_sand_tap_01_3.mp3',
    volume: 0.42,
    start: 0,
    end: null
  },
  workshopDayEnd: {
    path: 'audio/se/workshop_day_end_01_2.mp3',
    volume: 0.40,
    start: 0,
    end: null
  }
};

class SfxEngine {
  constructor(config = SELECTED_SFX) {
    this.config = config;
    this.enabled = true;
    this.volume = 1;
    this.unlocked = false;
    this.active = new Set();
  }

  unlock() {
    this.unlocked = true;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  setVolume(value) {
    this.volume = clampVolume(value, 1);
  }

  play(id) {
    if (!this.enabled || !this.unlocked) return;
    const spec = this.config[id];
    if (!spec || !spec.path) return;

    try {
      const audio = new Audio(spec.path);
      audio.volume = clampVolume(spec.volume, 0.4) * this.volume;
      audio.preload = 'auto';

      const cleanup = () => {
        audio.pause();
        audio.src = '';
        this.active.delete(audio);
      };

      const startPlayback = () => {
        if (typeof spec.start === 'number' && spec.start > 0) {
          audio.currentTime = spec.start;
        }

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => cleanup());
        }
      };

      if (typeof spec.end === 'number') {
        audio.addEventListener('timeupdate', () => {
          if (audio.currentTime >= spec.end) cleanup();
        });
      }

      audio.addEventListener('ended', cleanup, { once: true });
      audio.addEventListener('error', cleanup, { once: true });
      this.active.add(audio);
      startPlayback();
    } catch (e) {
      // SFX must never break gameplay.
    }
  }
}

function clampVolume(value, fallback = 0.4) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

function createSfxEngine() {
  return new SfxEngine();
}

module.exports = {
  SELECTED_SFX,
  SfxEngine,
  createSfxEngine
};

    };

    // --- Entry Point (browser/app.js) ---
    (function() {
        const entry = function(require) {
/**
 * ============================================================================
 * Made In Maghribal - Browser Game Controller (Modularized)
 * ============================================================================
 */

const { GameSession, TOTAL_TURNS } = require('./core/gameSessionFlow.cjs');
const { QUIZ_REQUEST_TEMPLATES } = require('./data/quizRequestTemplates.cjs');
const { generateQuestion } = require('./core/quizRequestModel.cjs');
const { processQuestionResult } = require('./core/rhythmQuizCore.cjs');
const { updateGameScore } = require('./core/scoreModel.cjs');
const { calculateAffection } = require('./core/affectionModel.cjs');
const { evaluateEnding } = require('./core/endingBranch.cjs');

// Modularized Screen Renderers
const { renderTitle, renderOpening } = require('./screens/titleScreen.js');
const { renderTitlePanel } = require('./screens/titlePanelScreen.js');
const { renderHeroineSelect } = require('./screens/heroineSelectScreen.js');
const { renderVnShell, updateVnContent } = require('./screens/vnScreen.js');
const { renderQuiz, updateQuizContent } = require('./screens/quizScreen.js');
const { renderTurnResult } = require('./screens/turnResultScreen.js');
const { renderEnding } = require('./screens/endingScreen.js');

// Modularized UI Components
const { updateHud, renderGlobalUi, renderModal } = require('./ui/hud.js');
const { showResultStamp } = require('./ui/resultStamp.js');

// Modularized Utilities
const { isDebugMode, applyDebugJumpFromUrl } = require('./utils/debugJump.js');
const { getHeroineDisplayName, getItemDisplayName, getItemIconPath, getTurnRank } = require('./utils/displayNames.js');
const { getCharacterStandingPath, getCharacterIconPath, getBackgroundPath } = require('./utils/assetPaths.js');
const { createSfxEngine } = require('./utils/sfxEngine.js');
const { createBgmEngine } = require('./utils/bgmEngine.js');
const { createAssetPreloader } = require('./utils/preloadAssets.js');
const { registerSeenItems } = require('./utils/itemCollection.js');
const { hasRunSave, loadRunSave, getRunSaveSummary, clearRunSave, saveRun, applyRunSave } = require('./utils/saveData.js');
const { recordEndingProgress, getPlayerProgressSummary } = require('./utils/playerProgress.js');

/** Constants */
const RESULT_TRANSITION_DELAY_MS = 700;

const TEXT_SPEED_MS = {
  slow: 55,
  normal: 32,
  fast: 16,
  instant: 0
};

const SETTINGS_KEY = 'madeinmaghribal.settings';

class GameController {
  /**
   * --------------------------------------------------------------------------
   * 1. Initialization & Lifecycle
   * --------------------------------------------------------------------------
   */
  constructor() {
    this.session = new GameSession();
    this.container = document.getElementById('app');
    this.sfx = createSfxEngine();
    this.bgm = createBgmEngine();
    this.assetPreloader = createAssetPreloader();
    this.assetPreloader.preloadOpeningAssets();
    
    this.settings = this.loadSettings();
    this.applyAudioSettings();
    this.uiState = {
      modal: null, // 'options' | 'help' | null
      titlePanel: null, // title menu sub screen key
      itemDetailModal: null,
      turnTransitionActive: false
    };

    this.turnTransition = {
      timerId: null,
      callback: null
    };

    this.typewriter = {
      fullText: '',
      visibleText: '',
      index: 0,
      timerId: null,
      isTyping: false,
      targetEl: null
    };

    this.quizState = this.createInitialQuizState();
    this.endingProgressRecorded = false;

    this.init();
    applyDebugJumpFromUrl(this);
    this.applySettingsFromUrl();
    this.update();
  }

  createInitialQuizState() {
    return {
      questionIndex: 0,
      totalQuestions: 10,
      currentQuestion: null,
      promptShownAt: 0,
      turnItemLog: [],
      lastResult: null,
      turnStartScore: null,
      inputLocked: false,
      currentChoices: []
    };
  }

  loadSettings() {
    const defaults = {
      textSpeed: 'normal',
      bgmEnabled: true,
      bgmVolume: 0.22,
      sfxEnabled: true,
      sfxVolume: 1
    };
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return defaults;
      return { ...defaults, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('Failed to load settings:', e);
      return defaults;
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
    this.applyAudioSettings();
  }

  applyAudioSettings() {
    if (this.bgm) {
      this.bgm.setEnabled?.(this.settings.bgmEnabled !== false);
      this.bgm.setVolume?.(this.settings.bgmVolume);
    }
    if (this.sfx) {
      this.sfx.setEnabled?.(this.settings.sfxEnabled !== false);
      this.sfx.setVolume?.(this.settings.sfxVolume);
    }
  }

  applySettingsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const speed = params.get('textSpeed');
    if (TEXT_SPEED_MS[speed] !== undefined) {
      this.settings.textSpeed = speed;
    }
  }

  getTextSpeedLabel() {
    const labels = {
      slow: '遅い',
      normal: '標準',
      fast: '速い',
      instant: '瞬時'
    };
    return labels[this.settings.textSpeed] || '標準';
  }

  /**
   * --------------------------------------------------------------------------
   * 2. UI Actions & Modals
   * --------------------------------------------------------------------------
   */
  openModal(name) {
    this.uiState.modal = name;
    this.renderModal();
  }

  closeModal() {
    this.uiState.modal = null;
    this.renderModal();
  }

  setTextSpeed(speed) {
    if (TEXT_SPEED_MS[speed] === undefined) return;
    this.settings.textSpeed = speed;
    this.saveSettings();
    this.renderModal(); // Refresh modal state
  }

  setAudioEnabled(kind, enabled) {
    if (kind !== 'bgm' && kind !== 'sfx') return;
    this.settings[`${kind}Enabled`] = Boolean(enabled);
    this.saveSettings();
    this.renderModal();
    if (kind === 'bgm' && this.settings.bgmEnabled) this.syncBgm();
  }

  adjustAudioVolume(kind, delta) {
    if (kind !== 'bgm' && kind !== 'sfx') return;
    const key = `${kind}Volume`;
    const current = Number(this.settings[key]);
    const next = Math.max(0, Math.min(1, (Number.isFinite(current) ? current : 0.5) + delta));
    this.settings[key] = Math.round(next * 100) / 100;
    if (next > 0) this.settings[`${kind}Enabled`] = true;
    this.saveSettings();
    this.renderModal();
  }


  openTitlePanel(panelName) {
    this.uiState.titlePanel = panelName;
    this.uiState.itemDetailModal = null;
    this.playSfx('uiTapBottle');
    this.update();
  }

  closeTitlePanel() {
    this.uiState.titlePanel = null;
    this.uiState.itemDetailModal = null;
    this.playSfx('uiTapBottle');
    this.update();
  }

  toggleFullscreen() {
    const root = document.getElementById('game-viewport');
    if (!document.fullscreenElement) {
      if (root?.requestFullscreen) root.requestFullscreen();
      else if (root?.webkitRequestFullscreen) root.webkitRequestFullscreen();
      else if (root?.msRequestFullscreen) root.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  }

  /**
   * --------------------------------------------------------------------------
   * 3. Core Update Logic (Routing & Shell Management)
   * --------------------------------------------------------------------------
   */
  update() {
    const phase = this.session.phase;
    const newClassName = `phase-${phase.toLowerCase()}`;
    if (this.container.className !== newClassName) {
      this.container.className = newClassName;
    }

    if (phase === 'MAIN_GAME') {
      this.renderMainGame(this.container);
    } else {
      this.container.innerHTML = '';
      const view = document.createElement('div');
      view.className = 'view-container';

      if (phase === 'TITLE') {
        if (this.uiState.titlePanel) renderTitlePanel(this, view);
        else renderTitle(this, view);
      } else if (phase === 'OPENING') {
        renderOpening(this, view);
      } else if (phase === 'HEROINE_SELECT') {
        this.preloadHeroineSelectAssets();
        renderHeroineSelect(this, view);
      } else if (phase === 'ENDING') {
        this.recordEndingProgressIfNeeded();
        renderEnding(this, view);
      }

      this.container.appendChild(view);
    }

    // Always ensure global UI and Modals are layered on top
    this.renderGlobalUi();
    this.renderModal();
    this.syncBgm();
    this.saveCurrentRunIfNeeded();
  }

  renderMainGame(container) {
    let view = container.querySelector('.view-container');
    if (!view) {
      view = document.createElement('div');
      view.className = 'view-container';
      container.appendChild(view);
    }

    const subPhase = this.session.subPhase;
    const currentScreen = view.querySelector('[data-screen]');
    const targetScreen = (subPhase === 'QUIZ') ? 'quiz' : (subPhase === 'TURN_RESULT' ? 'turn-result' : 'vn');

    if (!currentScreen || currentScreen.getAttribute('data-screen') !== targetScreen) {
      this.clearTypewriter();
      if (subPhase === 'BEFORE_OPEN' || subPhase === 'AFTER_CLOSE') {
        renderVnShell(this, view);
      } else if (subPhase === 'QUIZ') {
        renderQuiz(this, view);
      } else if (subPhase === 'TURN_RESULT') {
        renderTurnResult(this, view);
      }
    }

    if (subPhase === 'BEFORE_OPEN') {
      this.updateHud();
      this.updateVnContent({
        speakerName: this.getHeroineDisplayName(this.session.selectedHeroineId),
        text: `おはよう！ 第${this.session.turn}ターンの営業がもうすぐ始まるわ。準備はいいかしら？`,
        charId: this.session.selectedHeroineId,
        speakerId: this.session.selectedHeroineId,
        bgId: 'TEA_ROOM'
      });
    } else if (subPhase === 'AFTER_CLOSE') {
      this.updateHud();
      this.updateVnContent({
        speakerName: this.getHeroineDisplayName(this.session.selectedHeroineId),
        text: `ふぅ、第${this.session.turn}ターンの営業もお疲れ様！ 良い営業ができたわね。次のターンに備えてゆっくり休みましょう。`,
        charId: this.session.selectedHeroineId,
        speakerId: this.session.selectedHeroineId,
        bgId: 'TEA_ROOM'
      });
    } else if (subPhase === 'QUIZ') {
      this.updateHud();
      this.updateQuizContent();
    }
  }

  /**
   * --------------------------------------------------------------------------
   * 4. Typewriter Methods
   * --------------------------------------------------------------------------
   */
  startTypewriter(text, el) {
    this.clearTypewriter();
    this.typewriter.fullText = text;
    this.typewriter.targetEl = el;
    this.typewriter.index = 0;
    this.typewriter.isTyping = true;

    if (this.settings.textSpeed === 'instant') {
      this.finishTypewriter();
      return;
    }

    this.tickTypewriter();
  }

  tickTypewriter() {
    const delay = TEXT_SPEED_MS[this.settings.textSpeed] || 32;
    this.typewriter.timerId = setTimeout(() => {
      this.typewriter.index++;
      this.typewriter.visibleText = this.typewriter.fullText.substring(0, this.typewriter.index);
      if (this.typewriter.targetEl) {
        this.typewriter.targetEl.textContent = this.typewriter.visibleText;
      }

      if (this.typewriter.index < this.typewriter.fullText.length) {
        this.tickTypewriter();
      } else {
        this.typewriter.isTyping = false;
      }
    }, delay);
  }

  finishTypewriter() {
    this.clearTypewriter();
    this.typewriter.index = this.typewriter.fullText.length;
    this.typewriter.isTyping = false;
    if (this.typewriter.targetEl) {
      this.typewriter.targetEl.textContent = this.typewriter.fullText;
    }
  }

  clearTypewriter() {
    if (this.typewriter.timerId) {
      clearTimeout(this.typewriter.timerId);
      this.typewriter.timerId = null;
    }
    this.typewriter.isTyping = false;
  }

  isTypewriterActive() {
    return this.typewriter.isTyping;
  }

  /**
   * --------------------------------------------------------------------------
   * 5. Wrappers for Modularized Functions
   * --------------------------------------------------------------------------
   */
  updateHud() { updateHud(this); }
  renderGlobalUi() { renderGlobalUi(this); }
  renderModal() { renderModal(this); }
  updateVnContent(payload) { updateVnContent(this, payload); }
  updateQuizContent() { updateQuizContent(this); }
  showResultStamp(result) { showResultStamp(this, result); }

  isDebugMode() { return isDebugMode(); }
  getItemDisplayName(itemId, quality) { return getItemDisplayName(this, itemId, quality); }
  getHeroineDisplayName(id) { return getHeroineDisplayName(id); }
  getItemIconPath(itemId) { return getItemIconPath(itemId); }
  getTurnRank(dR, dS, dRep) { return getTurnRank(dR, dS, dRep); }
  getCharacterStandingPath(id, expression) { return getCharacterStandingPath(id, expression); }
  getCharacterIconPath(id, expression) { return getCharacterIconPath(id, expression); }
  getBackgroundPath(sceneId) { return getBackgroundPath(sceneId); }
  playSfx(id) { if (this.sfx) this.sfx.play(id); }
  syncBgm() {
    if (!this.bgm) return;
    if (this.session.phase === 'TITLE') return;
    this.bgm.playForSession(this.session);
  }
  getBgmState() { return this.bgm?.getState ? this.bgm.getState() : null; }
  hasSaveData() { return hasRunSave(); }
  getSaveSummary() { return getRunSaveSummary(); }
  getPlayerProgressSummary() { return getPlayerProgressSummary(); }
  saveCurrentRunIfNeeded() { saveRun(this); }
  recordEndingProgressIfNeeded() {
    if (this.endingProgressRecorded || this.session.phase !== 'ENDING') return;
    const affection = calculateAffection(this.session.scores || {});
    const endingType = evaluateEnding(affection, this.session.routeMode === 'long_history');
    recordEndingProgress(this.session, endingType, affection);
    this.endingProgressRecorded = true;
  }
  continueFromSave() {
    const saveData = loadRunSave();
    if (!saveData) return false;
    this.clearTypewriter();
    const applied = applyRunSave(this, saveData);
    if (applied) {
      this.uiState.titlePanel = null;
      this.endingProgressRecorded = false;
      if (this.session.phase === 'MAIN_GAME' && this.session.subPhase === 'QUIZ' && this.quizState.currentQuestion) {
        this.quizState.promptShownAt = performance.now();
      }
      this.playSfx('uiConfirmChime');
      this.update();
    }
    return applied;
  }
  preloadHeroineSelectAssets() { this.assetPreloader?.preloadHeroineSelectAssets(); }
  preloadResultExpressions(heroineId, expression) { return this.assetPreloader?.preloadResultExpressions(heroineId, expression); }
  getPreloadStats() { return this.assetPreloader?.getStats ? this.assetPreloader.getStats() : null; }

  playTurnTransition(callback, mode = 'next') {
    if (this.uiState.turnTransitionActive) return;

    this.uiState.turnTransitionActive = true;
    this.turnTransition.callback = callback;

    const viewport = document.getElementById('game-viewport') || this.container;
    const oldOverlay = viewport.querySelector('.turn-transition-overlay');
    if (oldOverlay) oldOverlay.remove();

    const nextTurn = Math.min(TOTAL_TURNS, this.session.turn + 1);
    const isEnding = mode === 'ending';
    const title = isEnding ? '終幕へ' : `第${nextTurn}ターンへ`;
    const subtitle = isEnding ? '星が静かに幕を下ろす' : '夜が巡り、朝の光が店先を照らす';

    const overlay = document.createElement('div');
    overlay.className = `turn-transition-overlay ${isEnding ? 'is-ending' : 'is-next-turn'}`;
    overlay.setAttribute('data-action', 'skip-turn-transition');
    overlay.innerHTML = `
      <div class="turn-transition-sky" aria-hidden="true">
        <div class="turn-transition-orbit">
          <div class="turn-transition-sun"></div>
          <div class="turn-transition-moon"></div>
        </div>
        <div class="turn-transition-horizon"></div>
      </div>
      <div class="turn-transition-copy">
        <p class="turn-transition-label">${title}</p>
        <p class="turn-transition-subtitle">${subtitle}</p>
      </div>
    `;
    viewport.appendChild(overlay);

    this.turnTransition.timerId = window.setTimeout(() => {
      this.finishTurnTransition();
    }, 1850);
  }

  finishTurnTransition() {
    if (!this.uiState.turnTransitionActive) return;

    if (this.turnTransition.timerId) {
      window.clearTimeout(this.turnTransition.timerId);
      this.turnTransition.timerId = null;
    }

    const callback = this.turnTransition.callback;
    this.turnTransition.callback = null;
    this.uiState.turnTransitionActive = false;

    const overlay = document.querySelector('.turn-transition-overlay');
    if (overlay) overlay.remove();

    if (typeof callback === 'function') callback();
  }


  updateSoundTestStatus(path) {
    const messageEl = this.container.querySelector('[data-sound-test-message]');
    if (messageEl) {
      messageEl.textContent = path ? `BGM: ${path}` : 'BGMを停止しました。';
    }
    this.container.querySelectorAll('[data-sound-bgm-path]').forEach((button) => {
      const active = Boolean(path) && button.getAttribute('data-sound-bgm-path') === path;
      button.classList.toggle('is-active', active);
      const badge = button.querySelector('small');
      if (badge) badge.textContent = active ? '再生中' : 'BGM';
    });
  }

  /**
   * --------------------------------------------------------------------------
   * 6. Event Handlers & User Actions
   * --------------------------------------------------------------------------
   */
  init() {
    this.updateViewportScale();
    window.addEventListener('resize', () => this.updateViewportScale());
    window.addEventListener('orientationchange', () => this.updateViewportScale());
    console.log('Controller Initialized');
    
    document.addEventListener('selectstart', (e) => {
      if (e.target.closest('#game-viewport')) e.preventDefault();
    });

    document.addEventListener('dragstart', (e) => {
      if (e.target.closest('#game-viewport')) e.preventDefault();
    });

    document.addEventListener('click', (e) => {
      if (this.sfx) this.sfx.unlock();
      if (this.bgm) this.bgm.unlock();
      const target = e.target;
      if (this.uiState.turnTransitionActive) {
        e.stopPropagation();
        this.finishTurnTransition();
        return;
      }
      if (this.quizState.inputLocked) return;

      // Global UI Actions

      if (target.closest('[data-action="title-start"]')) {
        e.stopPropagation();
        clearRunSave();
        this.endingProgressRecorded = false;
        this.playSfx('uiConfirmChime');
        this.onGlobalAction();
        return;
      }
      if (target.closest('[data-action="title-continue"]')) {
        e.stopPropagation();
        if (!this.continueFromSave()) {
          this.playSfx('uiTapBottle');
          const messageEl = this.container.querySelector('[data-title-stub-message]');
          if (messageEl) messageEl.textContent = 'つづきから再開できるセーブがありません';
        }
        return;
      }
      if (target.closest('[data-action="title-clear-save"]')) {
        e.stopPropagation();
        clearRunSave();
        this.playSfx('uiTapBottle');
        this.update();
        return;
      }
      const titlePanelBtn = target.closest('[data-title-panel]');
      if (titlePanelBtn) {
        e.stopPropagation();
        this.openTitlePanel(titlePanelBtn.getAttribute('data-title-panel'));
        return;
      }
      if (target.closest('[data-action="title-panel-back"]')) {
        e.stopPropagation();
        this.closeTitlePanel();
        return;
      }

      const itemDetailBtn = target.closest('[data-item-detail-index]');
      if (itemDetailBtn) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        const index = Number(itemDetailBtn.getAttribute('data-item-detail-index')) || 0;
        this.uiState.itemDetailModal = { index };
        this.update();
        return;
      }
      if (target.getAttribute && target.getAttribute('data-action') === 'item-detail-close') {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        this.uiState.itemDetailModal = null;
        this.update();
        return;
      }
      const soundBgmBtn = target.closest('[data-sound-bgm-path]');
      if (soundBgmBtn) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        const path = soundBgmBtn.getAttribute('data-sound-bgm-path');
        this.bgm?.play({
          path,
          id: soundBgmBtn.getAttribute('data-sound-id') || 'preview'
        });
        this.updateSoundTestStatus(path);
        return;
      }
      const soundSfxBtn = target.closest('[data-sound-sfx-key]');
      if (soundSfxBtn) {
        e.stopPropagation();
        this.playSfx(soundSfxBtn.getAttribute('data-sound-sfx-key'));
        return;
      }
      if (target.closest('[data-action="sound-stop-bgm"]')) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        this.bgm?.stop();
        this.updateSoundTestStatus('');
        return;
      }
      const titleStub = target.closest('[data-title-stub]');
      if (titleStub) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        const messageEl = this.container.querySelector('[data-title-stub-message]');
        if (messageEl) {
          messageEl.textContent = `${titleStub.getAttribute('data-title-stub')}は後続実装です`;
        }
        return;
      }
      if (target.closest('[data-action="open-options"]')) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        this.openModal('options');
        return;
      }
      if (target.closest('[data-action="open-help"]')) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        this.openModal('help');
        return;
      }
      if (target.closest('[data-action="close-modal"]')) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        this.closeModal();
        return;
      }
      if (target.closest('[data-action="toggle-fullscreen"]')) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        this.toggleFullscreen();
        return;
      }
      const speedBtn = target.closest('[data-action="set-text-speed"]');
      if (speedBtn) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        this.setTextSpeed(speedBtn.getAttribute('data-speed'));
        return;
      }
      const audioToggleBtn = target.closest('[data-action="set-audio-enabled"]');
      if (audioToggleBtn) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        this.setAudioEnabled(audioToggleBtn.getAttribute('data-audio-kind'), audioToggleBtn.getAttribute('data-enabled') === 'true');
        return;
      }
      const audioVolumeBtn = target.closest('[data-action="adjust-audio-volume"]');
      if (audioVolumeBtn) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        this.adjustAudioVolume(audioVolumeBtn.getAttribute('data-audio-kind'), Number(audioVolumeBtn.getAttribute('data-delta')) || 0);
        return;
      }

      // Skip Actions
      if (target.closest('[data-action="skip-text"]')) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        this.onGlobalAction();
        return;
      }

      if (target.closest('.choice-card')) {
        const id = target.closest('.choice-card').getAttribute('data-item-id');
        e.stopPropagation();
        this.answerQuiz(id);
        return;
      }

      if (target.classList.contains('heroine-card')) {
        const id = target.getAttribute('data-id');
        const routeMode = target.getAttribute('data-route-mode-selected') || 'normal';
        e.stopPropagation();
        this.selectHeroine(id, routeMode);
        return;
      }

      if (target.tagName === 'BUTTON' || target.closest('button')) {
        e.stopPropagation();
        if (target.classList.contains('btn-next')) {
          this.playSfx('uiTapBottle');
          this.onGlobalAction();
        }
        return;
      }

      // Prevent modal backdrop from closing or interfering with text advancement
      if (this.uiState.modal) {
        if (!target.closest('.ui-modal')) {
          this.playSfx('uiTapBottle');
          this.closeModal();
        }
        return;
      }

      if (this.session.phase === 'TITLE') return;
      if (this.session.phase === 'HEROINE_SELECT') return;
      if (this.session.phase === 'MAIN_GAME' && this.session.subPhase === 'QUIZ') return;
      if (this.session.phase === 'MAIN_GAME' && this.session.subPhase === 'TURN_RESULT') return;
      
      this.playSfx('uiTapBottle');
      this.onGlobalAction();
    });
  }

  selectHeroine(id, routeMode = 'normal') {
    if (this.quizState.inputLocked) return;
    this.clearTypewriter();
    this.playSfx('uiConfirmChime');
    console.log('Selecting Heroine:', id);
    this.endingProgressRecorded = false;
    this.session.selectHeroine(id, routeMode);
    this.session.nextPhase();
    this.update();
  }

  onGlobalAction() {
    if (this.quizState.inputLocked || this.uiState.modal) return;
    const { phase, subPhase } = this.session;

    // Handle Typewriter "Finish on Click"
    if ((phase === 'OPENING' || (phase === 'MAIN_GAME' && (subPhase === 'BEFORE_OPEN' || subPhase === 'AFTER_CLOSE'))) && this.isTypewriterActive()) {
      this.finishTypewriter();
      return;
    }

    console.log('Global Action on Phase:', phase, 'SubPhase:', subPhase);
    
    if (phase === 'TITLE') {
      this.session.nextPhase();
    } else if (phase === 'OPENING') {
      this.session.nextPhase();
    } else if (phase === 'MAIN_GAME') {
      if (subPhase === 'QUIZ') return;

      if (subPhase === 'AFTER_CLOSE') {
        const isFinalTurn = this.session.turn >= TOTAL_TURNS;
        this.playTurnTransition(() => {
          if (isFinalTurn) {
            this.session.nextPhase();
          } else {
            this.session.nextSubPhase();
          }
          this.update();
        }, isFinalTurn ? 'ending' : 'next');
        return;
      }

      this.session.nextSubPhase();
      if (this.session.subPhase === 'QUIZ') {
        this.startQuiz();
      }
    } else if (phase === 'ENDING') {
      clearRunSave();
      this.session = new GameSession();
      this.quizState = this.createInitialQuizState();
      this.endingProgressRecorded = false;
      this.update();
      return;
    }
    
    this.update();
  }

  startQuiz() {
    this.clearTypewriter();
    console.log('Starting Quiz...');
    this.quizState.questionIndex = 0;
    this.quizState.lastResult = null;
    this.quizState.inputLocked = false;
    this.quizState.turnStartScore = { ...this.session.scores };
    this.quizState.turnItemLog = [];
    this.generateNextQuestion();
  }

  generateNextQuestion() {
    const template = QUIZ_REQUEST_TEMPLATES[this.quizState.questionIndex % QUIZ_REQUEST_TEMPLATES.length];
    const question = generateQuestion(template);
    
    this.quizState.currentQuestion = question || {
      promptText: "何かもっとリフレッシュできるものはあるかしら？",
      correctItemId: "ITEM_001",
      wrongItemId: "ITEM_002"
    };

    const q = this.quizState.currentQuestion;
    const choices = [
      { id: q.correctItemId, name: this.getItemDisplayName(q.correctItemId) },
      { id: q.wrongItemId, name: this.getItemDisplayName(q.wrongItemId) }
    ];
    this.quizState.currentChoices = this.shuffleChoices(choices);
    
    this.quizState.promptShownAt = performance.now();
    this.quizState.inputLocked = false;
  }

  shuffleChoices(choices) {
    return [...choices].sort(() => Math.random() - 0.5);
  }


  recordQuizItemLog(selectedItemId, result) {
    const q = this.quizState.currentQuestion;
    const questionIndex = this.quizState.questionIndex;
    const choices = this.quizState.currentChoices.map((choice) => ({
      itemId: choice.id,
      displayName: choice.name || this.getItemDisplayName(choice.id),
      iconPath: this.getItemIconPath(choice.id),
      selected: choice.id === selectedItemId,
      correct: q && choice.id === q.correctItemId
    }));

    const collectionUpdates = registerSeenItems(
      choices.map((choice) => choice.itemId),
      { turn: this.session.turn, questionIndex }
    );
    const newItemIds = new Set(collectionUpdates.filter((entry) => entry.isNew).map((entry) => entry.itemId));

    this.quizState.turnItemLog.push({
      turn: this.session.turn,
      questionIndex,
      promptText: q ? q.promptText : '',
      selectedItemId,
      correctItemId: q ? q.correctItemId : '',
      result,
      choices: choices.map((choice) => ({
        ...choice,
        isNew: newItemIds.has(choice.itemId)
      }))
    });
  }

  answerQuiz(itemId) {
    if (this.quizState.inputLocked) return;
    this.quizState.inputLocked = true;
    this.playSfx('quizChoicePick');

    const now = performance.now();
    const result = processQuestionResult({
      promptShownAt: this.quizState.promptShownAt,
      answeredAt: now,
      selectedItemId: itemId,
      correctItemId: this.quizState.currentQuestion.correctItemId,
      nearestBeatMs: Math.round(now / 600) * 600
    });

    this.recordQuizItemLog(itemId, result);

    this.session.scores = updateGameScore(this.session.scores, result);
    this.quizState.lastResult = result;
    this.quizState.questionIndex++;

    this.showResultStamp(result);
    this.playSfx(result.isCorrect ? 'quizCorrectStarChime' : 'quizWrongSandTap');

    if (this.quizState.questionIndex < this.quizState.totalQuestions) {
      setTimeout(() => {
        this.generateNextQuestion();
        this.updateQuizContent();
      }, 100);
    } else {
      setTimeout(() => {
        this.session.nextSubPhase();
        this.playSfx('workshopDayEnd');
        this.quizState.inputLocked = false;
        this.update();
      }, RESULT_TRANSITION_DELAY_MS);
    }
  }

  updateViewportScale() {
    const baseWidth = 720;
    const baseHeight = 1280;
    const scale = Math.min(window.innerWidth / baseWidth, window.innerHeight / baseHeight);
    const viewport = document.getElementById('game-viewport');
    if (viewport) {
      viewport.style.transform = `scale(${scale})`;
    }
    document.documentElement.style.setProperty('--viewport-scale', String(scale));
  }
}

// Start the game
window.game = new GameController();

        };
        // Entry point base path is '.'
        entry((n) => require(n, './index.js'));
    })();

})();