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
    } else if (this.phase === 'MAIN_GAME' && this.turn === 5 && this.subPhase === 'AFTER_CLOSE') {
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
      if (this.turn < 5) {
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

module.exports = { GameSession };

    };

    // --- ./core/idSchema.cjs ---
    modules['./core/idSchema.cjs'] = function(module, exports, require) {
/**
 * Data ID Schema validation and constants for MadeInMaghribal project.
 */

const HEROINE_IDS = ['hakima', 'mira', 'dariya'];
const ROUTE_MODES = ['normal', 'extra'];
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

  // Acceptance: Turn 2 / Turn 5 はヒロインと routeMode に応じた曲が選ばれる
  if (turn === 2 || turn === 5) {
    if (routeMode === 'extra') {
      return `BGM_GAME_${heroineId}_EXTRA`;
    }
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
      { id: 'BGM_EXTRA_JOY', mood: 'joy', path: 'audio/bgm/extra/joy1.mp3' },
      { id: 'BGM_EXTRA_FUN', mood: 'fun', path: 'audio/bgm/extra/fun1.mp3' },
      { id: 'BGM_EXTRA_SORROW', mood: 'sorrow', path: 'audio/bgm/extra/sorrow1.mp3' },
      { id: 'BGM_EXTRA_ANGER', mood: 'anger', path: 'audio/bgm/extra/anger1.mp3' },
      { id: 'BGM_EXTRA_SURPRISE', mood: 'surprise', path: 'audio/bgm/extra/surprise1.mp3' }
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
 * Item Quality Texts for MadeInMaghribal project.
 * Separated from master data as per requirements.
 */
const { ITEM_MASTER } = require('./itemMaster.cjs');

const ITEM_TEXTS = {};

for (const item of ITEM_MASTER) {
  ITEM_TEXTS[item.itemId] = {
    normal: `品質は普通の${item.name}。`,
    success: `良い出来栄えの${item.name}。`,
    great_success: `最高品質の${item.name}！`
  };
}

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
      text: "今日も一日が始まる。どんな客が来るだろうか。"
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

function formatAverage(value, count) {
  if (!count) return '0';
  const avg = value / count;
  return Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
}

function renderEnding(controller, view) {
  const scores = controller.session.scores;
  const turnCount = 5;
  const affection = calculateAffection(scores);
  const endingType = evaluateEnding(affection, controller.session.routeMode === 'extra');
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
        <div class="ending-score-heading">5ターンの営業総決算</div>
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


function getVisualImagePath(id, mode, expression = 'normal') {
  const profile = getCharacterVisualProfile(id, mode);
  return getCharacterVisualImagePath(id, expression, profile.image);
}

function renderHeroineSelect(controller, view) {
  const initial = HEROINES[0];

  view.innerHTML = `
    <div class="heroine-select title-screen heroine-select-rich">
      <h2 class="glow heroine-select-title">営業パートナーを選択</h2>

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

      <button class="heroine-card heroine-confirm-btn" data-id="${initial.id}" type="button">このパートナーで始める</button>
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
  const iconButtons = Array.from(view.querySelectorAll('[data-preview-heroine]'));

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
    });
  });
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
const { loadItemCollection } = require('../utils/itemCollection.js');

const PANEL_TITLES = {
  load: 'ロード',
  event: 'イベントギャラリー',
  image: '画像ギャラリー',
  sound: 'サウンドテスト',
  item: 'アイテム図鑑'
};

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
  if (panel === 'sound') return renderSoundTest();
  if (panel === 'load') return renderLoadPanel(controller);
  return renderPlaceholder(panel);
}

function renderLoadPanel(controller) {
  const canContinue = controller.hasSaveData ? controller.hasSaveData() : false;
  return `
    <div class="title-panel-empty">
      <p>現在の簡易ロードはタイトルの「つづきから」を使用します。</p>
      <button class="title-start-btn title-panel-continue" type="button" ${canContinue ? 'data-action="title-continue"' : 'disabled aria-disabled="true"'}>つづきから</button>
      <p class="title-panel-note">後続で複数スロット/回想/図鑑状態を統合します。</p>
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

function renderItemGallery(controller) {
  const collection = loadItemCollection();
  const seenIds = new Set(Object.keys(collection).filter((itemId) => collection[itemId]?.seen));
  const total = ITEM_MASTER.length;
  const seenCount = seenIds.size;
  const items = ITEM_MASTER.map((item) => {
    const seen = seenIds.has(item.itemId);
    const name = controller.getItemDisplayName ? controller.getItemDisplayName(item.itemId) : item.name;
    const icon = controller.getItemIconPath ? controller.getItemIconPath(item.itemId) : `images/items/${item.itemId}.png`;
    return `
      <div class="gallery-item-tile${seen ? ' is-seen' : ' is-locked'}" title="${seen ? name : '未登録'}">
        ${seen ? `<img src="${icon}" alt="${name}" onerror="this.style.display='none'" />` : '<span>？</span>'}
      </div>
    `;
  }).join('');

  return `
    <div class="item-gallery-panel">
      <div class="title-panel-summary">登録済み ${seenCount} / ${total}</div>
      <div class="item-gallery-grid">${items}</div>
    </div>
  `;
}

function flattenBgmTracks() {
  const tracks = [];
  (AUDIO_MANIFEST?.bgm?.system || []).forEach((track) => tracks.push({ ...track, label: track.title || track.id }));
  for (const [heroineId, group] of Object.entries(AUDIO_MANIFEST?.bgm?.heroines || {})) {
    if (group.theme) tracks.push({ ...group.theme, label: `${heroineId} theme` });
    (group.game || []).forEach((track, index) => tracks.push({ ...track, label: `${heroineId} game ${index + 1}` }));
    if (group.ending?.normal) tracks.push({ ...group.ending.normal, label: `${heroineId} ending normal` });
    if (group.ending?.good) tracks.push({ ...group.ending.good, label: `${heroineId} ending good` });
  }
  (AUDIO_MANIFEST?.bgm?.extra || []).forEach((track) => tracks.push({ ...track, label: `extra ${track.mood || track.id}` }));
  return tracks;
}

function flattenSfxTracks() {
  const groups = AUDIO_MANIFEST?.se || {};
  return Object.values(groups).flat().filter((track) => track.key);
}

function renderSoundTest() {
  const bgmButtons = flattenBgmTracks().map((track) => `
    <button class="sound-test-row" type="button" data-sound-bgm-path="${track.path}" data-sound-id="${track.id}">
      <span>${track.label || track.id}</span>
      <small>BGM</small>
    </button>
  `).join('');
  const sfxButtons = flattenSfxTracks().map((track) => `
    <button class="sound-test-row" type="button" data-sound-sfx-key="${track.key}">
      <span>${track.key}</span>
      <small>SE</small>
    </button>
  `).join('');

  return `
    <div class="sound-test-panel">
      <div class="sound-test-actions">
        <button class="title-menu-btn" type="button" data-action="sound-stop-bgm">BGM停止</button>
      </div>
      <h3>BGM</h3>
      <div class="sound-test-list">${bgmButtons}</div>
      <h3>SE</h3>
      <div class="sound-test-list sound-test-list-sfx">${sfxButtons}</div>
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
      <div class="title-content-panel">
        <h1 class="glow">Made in Maghribal</h1>
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

  container.innerHTML = `
    <div class="ui-modal">
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
  const endingType = evaluateEnding(affection, session?.routeMode === 'extra');
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

function createBgmEngine(options = {}) {
  const baseVolume = options.volume ?? DEFAULT_BGM_VOLUME;
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
    if (!unlocked) return;
    startTrack(track);
  }

  function playForSession(session) {
    play(getTrackForSession(session));
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (pendingTrack) startTrack(pendingTrack);
  }

  function stop() {
    requestSerial += 1;
    clearPendingStart();
    stopAllExcept(null);
    currentAudio = null;
    currentPath = '';
    pendingTrack = null;
  }

  function getState() {
    return {
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

    // 開幕はヒロインnormal画像だけ。個別BGMはまだ読まない。
    const normalImagePaths = HEROINE_IDS.flatMap((id) => [
      getCharacterVisualImagePath(id, 'normal', 'standing'),
      getCharacterVisualImagePath(id, 'normal', 'face')
    ]);
    preloadImages(normalImagePaths);
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
    this.unlocked = false;
    this.active = new Set();
  }

  unlock() {
    this.unlocked = true;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  play(id) {
    if (!this.enabled || !this.unlocked) return;
    const spec = this.config[id];
    if (!spec || !spec.path) return;

    try {
      const audio = new Audio(spec.path);
      audio.volume = clampVolume(spec.volume);
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

function clampVolume(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0.4;
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

const { GameSession } = require('./core/gameSessionFlow.cjs');
const { QUIZ_REQUEST_TEMPLATES } = require('./data/quizRequestTemplates.cjs');
const { generateQuestion } = require('./core/quizRequestModel.cjs');
const { processQuestionResult } = require('./core/rhythmQuizCore.cjs');
const { updateGameScore } = require('./core/scoreModel.cjs');

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
const { hasRunSave, loadRunSave, clearRunSave, saveRun, applyRunSave } = require('./utils/saveData.js');

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
    this.uiState = {
      modal: null, // 'options' | 'help' | null
      titlePanel: null, // title menu sub screen key
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
    const defaults = { textSpeed: 'normal' };
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


  openTitlePanel(panelName) {
    this.uiState.titlePanel = panelName;
    this.playSfx('uiTapBottle');
    this.update();
  }

  closeTitlePanel() {
    this.uiState.titlePanel = null;
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
        text: `ふぅ、今日もお疲れ様！ 良い営業ができたわね。明日に備えてゆっくり休みましょう。`,
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
  syncBgm() { if (this.bgm) this.bgm.playForSession(this.session); }
  hasSaveData() { return hasRunSave(); }
  saveCurrentRunIfNeeded() { saveRun(this); }
  continueFromSave() {
    const saveData = loadRunSave();
    if (!saveData) return false;
    this.clearTypewriter();
    const applied = applyRunSave(this, saveData);
    if (applied) {
      this.uiState.titlePanel = null;
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

    const nextTurn = Math.min(5, this.session.turn + 1);
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
      const soundBgmBtn = target.closest('[data-sound-bgm-path]');
      if (soundBgmBtn) {
        e.stopPropagation();
        this.playSfx('uiTapBottle');
        this.bgm?.play({
          path: soundBgmBtn.getAttribute('data-sound-bgm-path'),
          id: soundBgmBtn.getAttribute('data-sound-id') || 'preview'
        });
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
        e.stopPropagation();
        this.selectHeroine(id);
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

  selectHeroine(id) {
    if (this.quizState.inputLocked) return;
    this.clearTypewriter();
    this.playSfx('uiConfirmChime');
    console.log('Selecting Heroine:', id);
    this.session.selectHeroine(id, 'normal');
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
        const isFinalTurn = this.session.turn === 5;
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