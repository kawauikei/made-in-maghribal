import fs from 'node:fs';
import path from 'node:path';
import { ITEM_TYPES, GENRES, ITEM_TYPE_BY_ID, GENRE_BY_ID } from '../src/data/itemTypes.js';
import { COLORS, COLOR_BY_ID } from '../src/data/principles.js';
import { REQUEST_TEMPLATES } from '../src/data/requestTemplates.js';
import itemsData from '../src/data/generated/items.json' with { type: 'json' };

// Map Master Data to engine format (same as quizEngine.js)
const MASTER_ITEMS = itemsData.items.map(item => ({
  id: item.id,
  typeId: `${item.category}_${item.index}`,
  colorId: item.principle,
  name: item.variants.normal.description.split("。")[0] || item.id,
  image: item.image,
  category: item.category,
  principle: item.principle,
  index: item.index,
  description: item.variants.normal.description
}));

const DOCS_DIR = './docs';
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR);
}

/**
 * 1. Item Classification Audit (CSV)
 */
function exportItemClassification() {
  const filePath = path.join(DOCS_DIR, 'quiz_item_classification_audit.csv');
  const headers = ['itemId', 'itemName', 'category', 'genreName', 'typeId', 'typeName', 'colorId', 'colorName', 'colorLabel', 'description'];
  
  const rows = MASTER_ITEMS.map(item => {
    const genre = GENRE_BY_ID[item.category];
    const type = ITEM_TYPE_BY_ID[item.typeId];
    const color = COLOR_BY_ID[item.colorId];
    
    return [
      item.id,
      item.name,
      item.category,
      genre ? genre.name : 'Unknown',
      item.typeId,
      type ? type.name : 'Unknown',
      item.colorId,
      color ? color.name : 'Unknown',
      color ? color.label : 'Unknown',
      `"${item.description.replace(/"/g, '""')}"`
    ].join(',');
  });
  
  fs.writeFileSync(filePath, [headers.join(','), ...rows].join('\n'), 'utf8');
  console.log(`Generated: ${filePath} (${rows.length} items)`);
}

/**
 * 2. Question Sample Audit
 */
function generateQuestionSamples() {
  const SAMPLES_PER_TEMPLATE = 5;
  const questions = [];
  
  REQUEST_TEMPLATES.forEach(template => {
    for (let i = 0; i < SAMPLES_PER_TEMPLATE; i++) {
      const q = simulateQuestionGeneration(template.id);
      if (q) questions.push(q);
    }
  });
  
  // Also simulate a realistic session of 20 questions
  for (let i = 0; i < 20; i++) {
    const q = simulateQuestionGeneration();
    if (q) questions.push({ ...q, note: 'Random Session Sample' });
  }

  // Export Markdown
  const mdPath = path.join(DOCS_DIR, 'quiz_prompt_audit.md');
  let mdContent = '# Quiz Prompt & Classification Audit Report\n\n';
  mdContent += `Generated at: ${new Date().toISOString()}\n\n`;
  
  mdContent += '## Summary\n';
  mdContent += `- Total items: ${MASTER_ITEMS.length}\n`;
  mdContent += `- Total genres: ${GENRES.length}\n`;
  mdContent += `- Total item types: ${ITEM_TYPES.length}\n`;
  mdContent += `- Total colors: ${COLORS.length}\n\n`;

  mdContent += '## Prompt Samples by Request Type\n\n';
  
  const grouped = {};
  questions.forEach(q => {
    if (!grouped[q.requestType]) grouped[q.requestType] = [];
    grouped[q.requestType].push(q);
  });

  for (const typeId in grouped) {
    mdContent += `### Request Type: ${typeId}\n\n`;
    mdContent += '| Prompt Text | Correct Item | Wrong Item | Logic |\n';
    mdContent += '| :--- | :--- | :--- | :--- |\n';
    grouped[typeId].forEach(q => {
      mdContent += `| ${q.promptText} | **${q.correctItem.name}** (${q.correctItem.colorName}/${q.correctItem.typeName}) | ${q.wrongItem.name} (${q.wrongItem.colorName}/${q.wrongItem.typeName}) | ${q.logic} |\n`;
    });
    mdContent += '\n';
  }

  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`Generated: ${mdPath}`);

  // Export CSV
  const csvPath = path.join(DOCS_DIR, 'quiz_question_sample_audit.csv');
  const headers = ['requestType', 'promptText', 'correctName', 'correctColor', 'correctType', 'wrongName', 'wrongColor', 'wrongType', 'logic'];
  const rows = questions.map(q => [
    q.requestType,
    `"${q.promptText}"`,
    q.correctItem.name,
    q.correctItem.colorName,
    q.correctItem.typeName,
    q.wrongItem.name,
    q.wrongItem.colorName,
    q.wrongItem.typeName,
    `"${q.logic}"`
  ].join(','));
  
  fs.writeFileSync(csvPath, [headers.join(','), ...rows].join('\n'), 'utf8');
  console.log(`Generated: ${csvPath}`);
}

/**
 * Simplified simulator based on quizEngine.js
 */
function simulateQuestionGeneration(forcedType = null) {
  const requestTemplate = forcedType 
    ? REQUEST_TEMPLATES.find(t => t.id === forcedType)
    : REQUEST_TEMPLATES[Math.floor(Math.random() * REQUEST_TEMPLATES.length)];
  
  const criteria = {};
  let promptText = "";
  let logic = "";

  if (requestTemplate.id === "color") {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    criteria.colorId = color.id;
    promptText = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace("{color}", color.name);
    logic = `Match Color: ${color.name}`;
  } else if (requestTemplate.id === "genre") {
    const genre = GENRES[Math.floor(Math.random() * GENRES.length)];
    criteria.genre = genre.id;
    promptText = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace("{genre}", genre.name);
    logic = `Match Genre: ${genre.name}`;
  } else if (requestTemplate.id === "itemType") {
    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    criteria.itemTypeId = type.id;
    promptText = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace("{type}", type.name);
    logic = `Match Type: ${type.name}`;
  } else if (requestTemplate.id === "colorAndItemType") {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    criteria.colorId = color.id;
    criteria.itemTypeId = type.id;
    promptText = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace("{color}", color.name)
      .replace("{type}", type.name);
    logic = `Match Color: ${color.name} AND Type: ${type.name}`;
  }

  const isMatching = (item, c) => {
    const itemType = ITEM_TYPE_BY_ID[item.typeId];
    if (!itemType) return false;
    if (c.colorId && item.colorId !== c.colorId) return false;
    if (c.genre && itemType.genre !== c.genre) return false;
    if (c.itemTypeId && item.typeId !== c.itemTypeId) return false;
    return true;
  };

  const correctItems = MASTER_ITEMS.filter(item => isMatching(item, criteria));
  if (correctItems.length === 0) return null;

  // Simple incorrect item selection logic (replicating strategies)
  let incorrectItems = [];
  if (requestTemplate.id === "color") {
    const genreId = ITEM_TYPE_BY_ID[correctItems[0].typeId].genre;
    incorrectItems = MASTER_ITEMS.filter(item => !isMatching(item, criteria) && ITEM_TYPE_BY_ID[item.typeId].genre === genreId);
  } else if (requestTemplate.id === "genre") {
    incorrectItems = MASTER_ITEMS.filter(item => !isMatching(item, criteria));
  } else if (requestTemplate.id === "itemType") {
    const targetGenre = criteria.itemTypeId.split("_")[0];
    incorrectItems = MASTER_ITEMS.filter(item => !isMatching(item, criteria) && item.typeId.startsWith(targetGenre));
  } else if (requestTemplate.id === "colorAndItemType") {
    incorrectItems = MASTER_ITEMS.filter(item => !isMatching(item, criteria) && item.typeId === criteria.itemTypeId);
  }

  if (incorrectItems.length === 0) {
    incorrectItems = MASTER_ITEMS.filter(item => !isMatching(item, criteria));
  }

  const correctItem = correctItems[Math.floor(Math.random() * correctItems.length)];
  const wrongItem = incorrectItems[Math.floor(Math.random() * incorrectItems.length)];

  const colorMap = id => COLOR_BY_ID[id]?.name || id;
  const typeMap = id => ITEM_TYPE_BY_ID[id]?.name || id;

  return {
    requestType: requestTemplate.id,
    promptText,
    logic,
    correctItem: {
      name: correctItem.name,
      colorName: colorMap(correctItem.colorId),
      typeName: typeMap(correctItem.typeId)
    },
    wrongItem: {
      name: wrongItem.name,
      colorName: colorMap(wrongItem.colorId),
      typeName: typeMap(wrongItem.typeId)
    }
  };
}

console.log('--- Made in Maghribal: Quiz Prompt Audit ---');
exportItemClassification();
generateQuestionSamples();
console.log('Audit completed successfully.');
