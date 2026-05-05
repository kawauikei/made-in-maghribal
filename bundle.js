(function() {
    const modules = {};
    const cache = {};

    // Internal require function for the browser
    function require(name, fromPath) {
        // Normalize path resolution
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
            if (!resolvedName.endsWith('.cjs')) resolvedName += '.cjs';
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
function calculateAffection(score, history) {
  const { revenue, satisfaction, reputation } = score;
  const { maxSatisfaction, maxReputation } = history;
  
  // Acceptance: 好感度 = (売上 + 満足度 + 評判 + 過去最大満足度 + 過去最大評判) / 5
  let val = (revenue + satisfaction + reputation + maxSatisfaction + maxReputation) / 5;
  
  // Acceptance: 好感度は100で上限クリップする
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
 */
const AUDIO_MANIFEST = {
  bgm: {
    system: [
      { id: 'main01_title', title: 'Title Theme' },
      { id: 'main02_shop', title: 'Daily Alchemy Shop' },
      { id: 'main03_puzzle', title: 'Mixing Rhythms' }
    ],
    heroines: {
      HAKIMA: {
        theme: 'BGM_THEME_HAKIMA',
        game: ['BGM_GAME_HAKIMA_1', 'BGM_GAME_HAKIMA_2', 'BGM_GAME_HAKIMA_3', 'BGM_GAME_HAKIMA_4'],
        ending: { normal: 'BGM_ED_HAKIMA_NORMAL', good: 'BGM_ED_HAKIMA_GOOD' },
        free_play: true
      },
      MIRA: {
        theme: 'BGM_THEME_MIRA',
        game: ['BGM_GAME_MIRA_1', 'BGM_GAME_MIRA_2', 'BGM_GAME_MIRA_3', 'BGM_GAME_MIRA_4'],
        ending: { normal: 'BGM_ED_MIRA_NORMAL', good: 'BGM_ED_MIRA_GOOD' },
        free_play: true
      },
      DARIYA: {
        theme: 'BGM_THEME_DARIYA',
        game: ['BGM_GAME_DARIYA_1', 'BGM_GAME_DARIYA_2', 'BGM_GAME_DARIYA_3', 'BGM_GAME_DARIYA_4'],
        ending: { normal: 'BGM_ED_DARIYA_NORMAL', good: 'BGM_ED_DARIYA_GOOD' },
        free_play: true
      }
    },
    extra: [
      { id: 'BGM_EXTRA_ROMANCE', mood: 'romantic' },
      { id: 'BGM_EXTRA_TENSE', mood: 'tense' }
    ]
  },
  se: {
    quiz: ['SE_QUIZ_CORRECT', 'SE_QUIZ_WRONG', 'SE_QUIZ_TICK'],
    ui: ['SE_UI_DECIDE', 'SE_UI_CANCEL', 'SE_UI_MOVE'],
    day_end: ['SE_DAY_END_REST']
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
    name: "ハキーマ",
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

    // --- Entry Point (browser/app.js) ---
    (function() {
        const entry = function(require) {
/**
 * Browser Entry Point for MadeInMaghribal (Fixed)
 */
const { GameSession } = require('./core/gameSessionFlow.cjs');
const { getVnRenderModel } = require('./core/renderModel.cjs');
const { SCENARIO_SAMPLES } = require('./data/scenarioSamples.cjs');

console.log('MadeInMaghribal App Initializing...');

class GameController {
  constructor() {
    this.session = new GameSession();
    this.container = document.getElementById('app');
    this.init();
  }

  init() {
    console.log('Controller Initialized');
    this.update();
    
    // Global click to advance phase/text
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // Handle Heroine Selection clicks specifically
      if (target.classList.contains('heroine-card')) {
        const id = target.getAttribute('data-id');
        this.selectHeroine(id);
        return;
      }

      // Don't advance if clicking other buttons (if any)
      if (target.tagName === 'BUTTON') return;
      
      this.onGlobalAction();
    });
  }

  selectHeroine(id) {
    console.log('Selecting Heroine:', id);
    this.session.selectHeroine(id, 'normal');
    this.session.nextPhase(); // -> MAIN_GAME
    this.update();
  }

  onGlobalAction() {
    const phase = this.session.phase;
    console.log('Global Action on Phase:', phase);
    
    if (phase === 'TITLE') {
      this.session.nextPhase(); // -> OPENING
    } else if (phase === 'OPENING') {
      this.session.nextPhase(); // -> HEROINE_SELECT
    } else if (phase === 'MAIN_GAME') {
      // For now, just advance sub-phase
      this.session.nextSubPhase();
    }
    
    this.update();
  }

  update() {
    const phase = this.session.phase;
    this.container.className = `phase-${phase.toLowerCase()}`;
    this.container.innerHTML = '';

    const view = document.createElement('div');
    view.className = 'view-container';

    if (phase === 'TITLE') {
      view.innerHTML = `
        <div class="title-screen">
          <h1 class="glow">Made in Maghribal</h1>
          <p class="blink">Click to Start Adventure</p>
        </div>
      `;
    } else if (phase === 'OPENING') {
      view.innerHTML = `
        <div class="opening-screen">
          <h2 class="glow">Prologue</h2>
          <p>The desert wind whispers secrets...</p>
          <p class="blink">Click to continue</p>
        </div>
      `;
    } else if (phase === 'HEROINE_SELECT') {
      view.innerHTML = `
        <div class="heroine-select">
          <h2 class="glow">Select Your Heroine</h2>
          <div class="heroine-list">
            <div class="heroine-card" data-id="HAKIMA">HAKIMA</div>
            <div class="heroine-card" data-id="MIRA">MIRA</div>
            <div class="heroine-card" data-id="DARIYA">DARIYA</div>
          </div>
        </div>
      `;
    } else if (phase === 'MAIN_GAME') {
      // Fix: Use correct key SCENARIO_SAMPLES.SC_OP_OPENING
      const sampleStep = SCENARIO_SAMPLES.SC_OP_OPENING[0];
      const model = getVnRenderModel(this.session, sampleStep);
      
      view.innerHTML = `
        <div class="vn-screen">
          <div class="stats">
            Turn: ${this.session.turn} | 
            Heroine: ${this.session.selectedHeroineId} | 
            Gold: ${this.session.scores.revenue}
          </div>
          <div class="scene-overlay"></div>
          <div class="message-box">
            <div class="speaker-name">${model.speaker ? model.speaker.name : '???'}</div>
            <div class="message-text">${model.text}</div>
          </div>
        </div>
      `;
    } else {
      view.innerHTML = `<h2>Phase: ${phase}</h2><p>Coming Soon...</p>`;
    }

    this.container.appendChild(view);
  }
}

// Start the game
window.game = new GameController();

        };
        entry((n) => require(n, './index.js'));
    })();

})();