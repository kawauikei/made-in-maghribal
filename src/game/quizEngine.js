import { ITEM_TYPES, GENRES, ITEM_TYPE_BY_ID } from "../data/itemTypes.js";
import { COLORS } from "../data/principles.js";
import { REQUEST_TEMPLATES } from "../data/requestTemplates.js";
import { calculateScore } from "./scoring.js";
import itemsData from "../data/generated/items.json" with { type: "json" };

// Map Master Data to engine format
const MASTER_ITEMS = itemsData.items.map(item => ({
  id: item.id,
  typeId: `${item.category}_${item.index}`,
  colorId: item.principle,
  name: item.variants.normal.description.split("。")[0] || item.id,
  image: item.image,
  variants: item.variants
}));

const ITEMS_TO_USE = MASTER_ITEMS;

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
 * @param {string} id - Question ID.
 * @param {string} [forcedType=null] - Optional forced request type ID.
 * @param {Set<string>} [excludeItemIds=new Set()] - Set of item IDs to avoid for correct answer.
 */
function generateRandomQuestion(id, forcedType = null, excludeItemIds = new Set(), retryCount = 0) {
  const MAX_RETRIES = 10;

  // Select request type
  const requestTemplate = forcedType 
    ? REQUEST_TEMPLATES.find(t => t.id === forcedType)
    : REQUEST_TEMPLATES[Math.floor(Math.random() * REQUEST_TEMPLATES.length)];
  const criteria = {};
  let text = "";

  // Fill criteria based on template type
  if (requestTemplate.id === "color") {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    criteria.colorId = color.id;
    text = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace("{color}", color.name);
  } else if (requestTemplate.id === "genre") {
    const genre = GENRES[Math.floor(Math.random() * GENRES.length)];
    criteria.genre = genre.id;
    text = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace("{genre}", genre.name);
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
    text = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace("{color}", color.name)
      .replace("{type}", type.name);
  }

  // Find valid correct items
  let correctItems = ITEMS_TO_USE.filter(item => isItemMatchingCriteria(item, criteria));
  
  // M7b-2: Duplicate prevention - try to find items not used yet
  const nonDuplicateItems = correctItems.filter(item => !excludeItemIds.has(item.id));

  // If no unused items for this criteria, but total items matching criteria > 0, 
  // and we haven't hit retry limit, retry with different random criteria.
  if (nonDuplicateItems.length === 0 && correctItems.length > 0 && retryCount < MAX_RETRIES) {
    return generateRandomQuestion(id, forcedType, excludeItemIds, retryCount + 1);
  }

  if (nonDuplicateItems.length > 0) {
    correctItems = nonDuplicateItems;
  }
  // Fallback: if all matching items were already used and retries exhausted, we accept duplicates.
  
  // Strategy-based dummy selection
  let incorrectItems = [];
  
  if (requestTemplate.id === "color") {
    // Strategy: Same genre, different color
    const correctSample = correctItems[0];
    if (correctSample) {
      const genreId = ITEM_TYPE_BY_ID[correctSample.typeId].genre;
      incorrectItems = ITEMS_TO_USE.filter(item => 
        !isItemMatchingCriteria(item, criteria) && 
        ITEM_TYPE_BY_ID[item.typeId].genre === genreId
      );
    }
  } else if (requestTemplate.id === "genre") {
    // Strategy: Different genre, but prefer similar group
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
    // Strategy: Same genre, different type
    const typeId = criteria.itemTypeId || "";
    const targetGenre = typeId.includes("_") ? typeId.split("_")[0] : typeId;
    incorrectItems = ITEMS_TO_USE.filter(item => 
      !isItemMatchingCriteria(item, criteria) && 
      item.typeId.startsWith(targetGenre)
    );
  } else if (requestTemplate.id === "colorAndItemType") {
    // Strategy: Same type different color, or same genre different type
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

  // Final fallback if strategy failed
  if (incorrectItems.length === 0) {
    incorrectItems = ITEMS_TO_USE.filter(item => !isItemMatchingCriteria(item, criteria));
  }

  if (correctItems.length === 0 || incorrectItems.length === 0) {
    if (retryCount < MAX_RETRIES) {
      return generateRandomQuestion(id, null, excludeItemIds, retryCount + 1); 
    }
    return null; // Should not happen with 250 items
  }

  const correctItem = correctItems[Math.floor(Math.random() * correctItems.length)];
  const incorrectItem = incorrectItems[Math.floor(Math.random() * incorrectItems.length)];

  // Shuffle choices
  const choices = Math.random() > 0.5 ? [correctItem, incorrectItem] : [incorrectItem, correctItem];

  return {
    id,
    request: {
      id: requestTemplate.id,
      type: requestTemplate.id,
      text,
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
 * Currently only implements a fixed plan for 5 questions.
 */
function buildRequestTypePlan(count) {
  if (count !== 5) return null;

  const baseTypes = ["color", "genre", "itemType", "colorAndItemType"];
  const randomExtra = baseTypes[Math.floor(Math.random() * baseTypes.length)];
  const plan = [...baseTypes, randomExtra];
  
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
