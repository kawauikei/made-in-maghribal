import { ITEM_TYPES, GENRES, ITEM_TYPE_BY_ID } from "../data/itemTypes.js";
import { COLORS } from "../data/principles.js";
import { REQUEST_TEMPLATES } from "../data/requestTemplates.js";
import { calculateScore } from "./scoring.js";
import itemsData from "../data/generated/items.json" with { type: "json" };

// Map Master Data to engine format
const MASTER_ITEMS = itemsData.items.map(item => {
  const typeId = `${item.category}_${item.index}`;
  const type = ITEM_TYPE_BY_ID[typeId];
  const colorId = item.principle;
  
  // M-QUIZ-PROMPT-TUNING-1: Shortened Name Logic
  const colorPrefixMap = {
    AS: "星明かりの",
    EL: "青緑の",
    LI: "生命の",
    SA: "黄金の",
    ME: "鋼鉄の"
  };
  
  const typeName = type ? type.name : "";
  const prefix = colorPrefixMap[colorId] || "";
  const displayName = `${prefix}${typeName}`;

  return {
    id: item.id,
    typeId,
    colorId,
    name: displayName, // Shortened name for quiz
    fullName: item.variants.normal.description.split("。")[0] || item.id,
    image: item.image,
    variants: item.variants
  };
});

const ITEMS_TO_USE = MASTER_ITEMS;

// M-QUIZ-PROMPT-TUNING-1: Customer Types
const CUSTOMER_TYPES = [
  { id: 'old_man', icon: '👴', tone: 'elder', color: '#ffcc66' },
  { id: 'woman', icon: '👩', tone: 'polite', color: '#ff99cc' },
  { id: 'man', icon: '🧔', tone: 'plain', color: '#d1d1d1' },
  { id: 'girl', icon: '👧', tone: 'casual', color: '#ffb3ba' },
];

/**
 * Applies customer tone to the prompt text.
 */
function applyCustomerTone(text, tone) {
  let result = text;
  if (tone === 'elder') {
    result = result.replace("見せてくれ。", "見せてくれんか。")
                 .replace("ある？", "あるかの？")
                 .replace("探している。", "探しておるんじゃ。");
  } else if (tone === 'polite') {
    result = result.replace("見せてくれ。", "見せていただけますか？")
                 .replace("ある？", "ありますか？")
                 .replace("探している。", "探しているんです。");
  } else if (tone === 'casual') {
    result = result.replace("見せてくれ。", "見せて！")
                 .replace("ある？", "あるかな？")
                 .replace("探している。", "探してるの。");
  }
  // 'plain' tone uses the default template
  return result;
}

/**
 * Checks if an item matches the given criteria.
 */
export function isItemMatchingCriteria(item, criteria) {
  if (!criteria || Object.keys(criteria).length === 0) return false;

  const itemType = ITEM_TYPE_BY_ID[item.typeId];
  if (!itemType) return false;

  if (criteria.colorId && item.colorId !== criteria.colorId) return false;
  if (criteria.genre && itemType.genre !== criteria.genre) return false;
  if (criteria.itemTypeId && item.typeId !== criteria.itemTypeId) return false;

  return true;
}

/**
 * Creates a new quiz session with the specified number of questions.
 */
export function createQuizSession({ questionCount = 20 } = {}) {
  const questions = [];
  const typePlan = buildRequestTypePlan(questionCount);

  const usedCorrectItemIds = new Set();
  for (let i = 0; i < questionCount; i++) {
    const forcedType = typePlan ? typePlan[i] : null;
    const question = generateRandomQuestion(`q_${(i + 1).toString().padStart(3, "0")}`, forcedType, usedCorrectItemIds);
    if (!question) {
      throw new Error(`Failed to generate enough unique questions. Generated: ${i}`);
    }
    questions.push(question);
    usedCorrectItemIds.add(question.correctItemId);
  }

  return {
    questions,
    currentIndex: 0,
    score: 0,
    answers: [],
    isFinished: questions.length === 0,
  };
}

/**
 * Generates a single random question.
 */
function generateRandomQuestion(id, forcedType = null, excludeItemIds = new Set(), retryCount = 0) {
  const MAX_RETRIES = 10;

  // Select request type
  const requestTemplate = forcedType 
    ? REQUEST_TEMPLATES.find(t => t.id === forcedType)
    : REQUEST_TEMPLATES[Math.floor(Math.random() * REQUEST_TEMPLATES.length)];
  const criteria = {};
  let text = "";

  // M-QUIZ-PROMPT-TUNING-1: Select Customer
  const customer = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];

  // Fill criteria based on template type
  if (requestTemplate.id === "color") {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    criteria.colorId = color.id;
    
    // M-QUIZ-PROMPT-TUNING-1: Metal/Purple Adjustment
    let colorName = color.name;
    let target = "{color}";
    if (color.id === "ME") {
      const metalPhrases = ["ずっしりとした", "重厚感のある", "鉄の術理を帯びた"];
      colorName = metalPhrases[Math.floor(Math.random() * metalPhrases.length)];
      target = "{color}の"; // Replace the whole "{color}の" with the adjective
    }
    
    text = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace(target, colorName);
  } else if (requestTemplate.id === "genre") {
    const genre = GENRES[Math.floor(Math.random() * GENRES.length)];
    criteria.genre = genre.id;
    
    // M-QUIZ-PROMPT-TUNING-1: Genre Prefix Adjustment
    let genreName = genre.name;
    if (genre.id === "DAY") genreName = "一般雑貨の品";
    if (genre.id === "TRD") genreName = "渡来品";
    if (genre.id === "RIT") genreName = "厳かな儀式具";
    
    text = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace("{genre}", genreName);
  } else if (requestTemplate.id === "itemType") {
    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    criteria.itemTypeId = type.id;
    text = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace("{type}", type.name);
  } else if (requestTemplate.id === "colorAndItemType") {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    criteria.colorId = color.id;
    criteria.itemTypeId = type.id;
    
    let colorName = color.name;
    let target = "{color}";
    if (color.id === "ME") {
      colorName = "鋼鉄の";
      target = "{color}の";
    }

    text = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace(target, colorName)
      .replace("{type}", type.name);
  }

  // Apply Customer Cues
  text = `${customer.icon} ${applyCustomerTone(text, customer.tone)}`;

  // Find valid correct items
  let correctItems = ITEMS_TO_USE.filter(item => isItemMatchingCriteria(item, criteria));
  
  // Duplicate prevention
  const nonDuplicateItems = correctItems.filter(item => !excludeItemIds.has(item.id));
  if (nonDuplicateItems.length === 0 && correctItems.length > 0 && retryCount < MAX_RETRIES) {
    return generateRandomQuestion(id, forcedType, excludeItemIds, retryCount + 1);
  }
  if (nonDuplicateItems.length > 0) {
    correctItems = nonDuplicateItems;
  }
  
  const correctItem = correctItems[Math.floor(Math.random() * correctItems.length)];

  // Strategy-based dummy selection
  let incorrectItems = [];
  
  if (requestTemplate.id === "color") {
    // Strategy: Same genre, different color
    // M-QUIZ-PROMPT-TUNING-1: Life/Red priority
    if (correctItem.colorId === 'LI') {
      // Prioritize same type for Red comparison
      incorrectItems = ITEMS_TO_USE.filter(item => 
        item.typeId === correctItem.typeId && item.colorId !== 'LI'
      );
    }
    
    if (incorrectItems.length === 0) {
      const genreId = ITEM_TYPE_BY_ID[correctItem.typeId].genre;
      incorrectItems = ITEMS_TO_USE.filter(item => 
        !isItemMatchingCriteria(item, criteria) && 
        ITEM_TYPE_BY_ID[item.typeId].genre === genreId
      );
    }
  } else if (requestTemplate.id === "genre") {
    const groups = {
      ARM: "gear", CLT: "gear", ADN: "gear", RIT: "gear",
      FOD: "cons", MED: "cons", WRK: "cons",
      DAY: "util", TRV: "util", TRD: "util"
    };
    const targetGroup = groups[criteria.genre];
    incorrectItems = ITEMS_TO_USE.filter(item => {
      if (isItemMatchingCriteria(item, criteria)) return false;
      const itemGenre = ITEM_TYPE_BY_ID[item.typeId].genre;
      return groups[itemGenre] === targetGroup;
    });
  } else if (requestTemplate.id === "itemType") {
    const typeId = criteria.itemTypeId || "";
    const targetGenre = typeId.includes("_") ? typeId.split("_")[0] : typeId;
    incorrectItems = ITEMS_TO_USE.filter(item => 
      !isItemMatchingCriteria(item, criteria) && 
      item.typeId.startsWith(targetGenre)
    );
  } else if (requestTemplate.id === "colorAndItemType") {
    incorrectItems = ITEMS_TO_USE.filter(item => 
      !isItemMatchingCriteria(item, criteria) && 
      item.typeId === criteria.itemTypeId
    );
    if (incorrectItems.length === 0) {
      const typeId = criteria.itemTypeId || "";
      const targetGenre = typeId.includes("_") ? typeId.split("_")[0] : typeId;
      incorrectItems = ITEMS_TO_USE.filter(item => 
        !isItemMatchingCriteria(item, criteria) && 
        item.typeId.startsWith(targetGenre)
      );
    }
  }

  if (incorrectItems.length === 0) {
    incorrectItems = ITEMS_TO_USE.filter(item => !isItemMatchingCriteria(item, criteria));
  }

  if (correctItems.length === 0 || incorrectItems.length === 0) {
    if (retryCount < MAX_RETRIES) {
      return generateRandomQuestion(id, null, excludeItemIds, retryCount + 1); 
    }
    return null;
  }

  const incorrectItem = incorrectItems[Math.floor(Math.random() * incorrectItems.length)];
  const choices = Math.random() > 0.5 ? [correctItem, incorrectItem] : [incorrectItem, correctItem];

  return {
    id,
    request: {
      id: requestTemplate.id,
      type: requestTemplate.id,
      text,
      customer,
      criteria: { ...criteria }
    },
    criteria: { ...criteria },
    choices,
    correctItemId: correctItem.id
  };
}

/**
 * Checks if the selected item is correct for the given question.
 */
export function checkAnswer(question, selectedItemId) {
  const isCorrect = question.correctItemId === selectedItemId;
  const gainedScore = calculateScore({ isCorrect });

  return {
    questionId: question.id,
    selectedItemId,
    correctItemId: question.correctItemId,
    isCorrect,
    gainedScore
  };
}

/**
 * Processes an answer and returns a new session state.
 */
export function answerQuestion(session, selectedItemId) {
  if (session.isFinished) return session;

  const currentQuestion = session.questions[session.currentIndex];
  const result = checkAnswer(currentQuestion, selectedItemId);

  const nextIndex = session.currentIndex + 1;
  const isFinished = nextIndex >= session.questions.length;

  return {
    ...session,
    currentIndex: nextIndex,
    score: session.score + result.gainedScore,
    answers: [...session.answers, result],
    isFinished
  };
}

/**
 * Builds a plan of request types to ensure variety.
 */
function buildRequestTypePlan(count) {
  if (count < 4) return null;

  const baseTypes = ["color", "genre", "itemType", "colorAndItemType"];
  const plan = [];
  for (let i = 0; i < count; i++) {
    plan.push(baseTypes[i % baseTypes.length]);
  }
  
  return shuffleArray(plan);
}

/**
 * Shuffles an array using Fisher-Yates algorithm.
 */
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
