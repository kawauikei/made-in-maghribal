import fs from 'node:fs';
import path from 'node:path';
import { ITEM_TYPES, GENRES, ITEM_TYPE_BY_ID, GENRE_BY_ID } from '../src/data/itemTypes.js';
import { COLORS, COLOR_BY_ID } from '../src/data/principles.js';
import { REQUEST_TEMPLATES } from '../src/data/requestTemplates.js';
import itemsData from '../src/data/generated/items.json' with { type: 'json' };

// Map Master Data to engine format (same as quizEngine.js)
const MASTER_ITEMS = itemsData.items.map(item => {
  const typeId = `${item.category}_${item.index}`;
  const type = ITEM_TYPE_BY_ID[typeId];
  const colorId = item.principle;
  
  const colorPrefixMap = {
    AS: "星明かり",
    EL: "青緑",
    LI: "生命",
    SA: "黄金",
    ME: "鋼鉄"
  };
  
  const typeName = type ? type.name : "";
  const prefix = colorPrefixMap[colorId] || "";
  const displayName = `${prefix}${typeName}`;

  return {
    id: item.id,
    typeId,
    colorId,
    name: displayName,
    fullName: item.variants.normal.description.split("。")[0] || item.id,
    image: item.image,
    category: item.category,
    principle: item.principle,
    index: item.index,
    description: item.variants.normal.description
  };
});

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
  let mdContent = '# Quiz Prompt & Classification Audit Report (Human Review Required)\n\n';
  mdContent += `Generated at: ${new Date().toISOString()}\n\n`;
  mdContent += '> [!IMPORTANT]\n';
  mdContent += '> このレポートは開発者およびユーザーによる人力確認用です。\n';
  mdContent += '> クイズの問題文、客の口調、アイテム名の短縮が自然かどうかを確認してください。\n\n';
  
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
      let correctName = q.correctItem.name;
      let wrongName = q.wrongItem.name;
      if (q.requestType === 'genre') {
        const cat = q.correctItem.id.split('_')[1];
        if (cat === 'DAY') correctName = `一般雑貨の${correctName}`;
        if (cat === 'TRD') correctName = `貿易品の${correctName}`;
        if (cat === 'RIT') correctName = `厳かな${correctName}`;
        if (cat === 'ADN') correctName = `アクセサリーの${correctName}`;
        
        const wCat = q.wrongItem.id.split('_')[1];
        if (wCat === 'DAY') wrongName = `一般雑貨の${wrongName}`;
        if (wCat === 'TRD') wrongName = `貿易品の${wrongName}`;
        if (wCat === 'RIT') wrongName = `厳かな${wrongName}`;
        if (wCat === 'ADN') wrongName = `アクセサリーの${wrongName}`;
      }
      mdContent += `| ${q.promptText} | **${correctName}** (${q.correctItem.colorName}/${q.correctItem.typeName}) | ${wrongName} (${q.wrongItem.colorName}/${q.wrongItem.typeName}) | ${q.logic} |\n`;
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
  
  generateHtmlReport(MASTER_ITEMS, questions);
}

/**
 * 3. HTML Report (Premium Visual)
 */
function generateHtmlReport(items, questions) {
  const filePath = path.join(DOCS_DIR, 'quiz_audit_report.html');
  
  const iconMap = {
    ARM: 'sword',
    ADN: 'gem',
    MED: 'flask-conical',
    FOD: 'utensils',
    CLT: 'shirt',
    DAY: 'lamp',
    WRK: 'hammer',
    TRV: 'map',
    TRD: 'coins',
    RIT: 'flame'
  };

  const colorMap = {
    ME: '#9b59b6', // Purple
    EL: '#1abc9c', // Cyan/Teal
    SA: '#f1c40f', // Gold/Yellow
    AS: '#3498db', // Blue
    LI: '#e74c3c'  // Red
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Made in Maghribal - Quiz Audit Report</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Outfit:wght@300;400;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        :root {
            --bg: #0f172a;
            --card-bg: #1e293b;
            --text: #f8fafc;
            --text-dim: #94a3b8;
            --accent: #38bdf8;
            --correct: #10b981;
            --wrong: #ef4444;
            --border: #334155;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Outfit', 'Inter', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 40px 20px;
        }

        .container { max-width: 1200px; margin: 0 auto; }

        header {
            text-align: center;
            margin-bottom: 60px;
            padding: 40px;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-radius: 24px;
            border: 1px solid var(--border);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        h1 { font-size: 3rem; font-weight: 800; margin-bottom: 10px; color: var(--accent); }
        .subtitle { color: var(--text-dim); font-size: 1.1rem; }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 16px;
            border: 1px solid var(--border);
            text-align: center;
        }

        .stat-card .value { display: block; font-size: 2rem; font-weight: 700; color: var(--accent); }
        .stat-card .label { color: var(--text-dim); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }

        section { margin-bottom: 60px; }
        h2 { font-size: 2rem; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        h2 i { color: var(--accent); }

        /* Items Grid */
        .items-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }

        .item-card {
            background: var(--card-bg);
            border-radius: 16px;
            border: 1px solid var(--border);
            padding: 20px;
            transition: transform 0.2s, border-color 0.2s;
            position: relative;
            overflow: hidden;
        }

        .item-card:hover { transform: translateY(-5px); border-color: var(--accent); }

        .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .item-title { font-weight: 700; font-size: 1.1rem; }
        .item-meta { font-size: 0.8rem; color: var(--text-dim); display: flex; gap: 8px; align-items: center; }

        .category-icon {
            background: var(--border);
            padding: 8px;
            border-radius: 10px;
            color: var(--accent);
        }

        .color-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-top: 10px;
        }

        .description { font-size: 0.85rem; color: var(--text-dim); margin-top: 12px; }

        /* Sample Questions */
        .samples {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .sample-card {
            background: var(--card-bg);
            border-radius: 16px;
            border: 1px solid var(--border);
            padding: 24px;
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 24px;
        }

        .sample-prompt { 
            font-size: 1.1rem; 
            font-weight: 600; 
            color: var(--text); 
            line-height: 1.6;
        }

        .sample-customer {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
            font-size: 0.85rem;
            opacity: 0.8;
        }

        .choices { display: flex; gap: 12px; margin-top: 16px; }
        .choice {
            flex: 1;
            padding: 12px;
            border-radius: 10px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .choice.correct { background: rgba(16, 185, 129, 0.1); border: 1px solid var(--correct); color: var(--correct); }
        .choice.wrong { background: rgba(239, 68, 68, 0.1); border: 1px solid var(--wrong); color: var(--wrong); }

        .item-img {
            width: 48px;
            height: 48px;
            background: #000;
            border-radius: 8px;
            object-fit: contain;
            border: 1px solid var(--border);
        }

        .sample-item-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logic-tag {
            font-size: 0.75rem;
            background: rgba(56, 189, 248, 0.1);
            color: var(--accent);
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 12px;
        }

        .controls {
            margin-bottom: 30px;
            display: flex;
            gap: 12px;
        }

        input[type="text"] {
            background: var(--card-bg);
            border: 1px solid var(--border);
            color: var(--text);
            padding: 12px 20px;
            border-radius: 12px;
            width: 300px;
            outline: none;
        }

        input[type="text"]:focus { border-color: var(--accent); }

        @media (max-width: 768px) {
            .sample-card { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Made in Maghribal</h1>
            <p class="subtitle">Quiz Prompt & Classification Audit Report</p>
            <div style="margin-top: 20px; padding: 10px; background: rgba(56, 189, 248, 0.1); border-radius: 8px; color: var(--accent); font-weight: 700;">
                ⚠️ HUMAN REVIEW REQUIRED / 人力確認対象
            </div>
            <p style="font-size: 0.8rem; margin-top: 10px; opacity: 0.5;">Generated: ${new Date().toLocaleString()}</p>
        </header>

        <div class="stats">
            <div class="stat-card"><span class="value">${MASTER_ITEMS.length}</span><span class="label">Total Items</span></div>
            <div class="stat-card"><span class="value">${GENRES.length}</span><span class="label">Genres</span></div>
            <div class="stat-card"><span class="value">${ITEM_TYPES.length}</span><span class="label">Item Types</span></div>
            <div class="stat-card"><span class="value">${COLORS.length}</span><span class="label">Colors</span></div>
        </div>

        <section>
            <h2><i data-lucide="help-circle"></i> Prompt Samples</h2>
            <div class="samples">
                ${questions.map(q => {
                  const getPrefixedName = (item, reqType) => {
                    let name = item.name;
                    if (reqType === 'genre') {
                      const cat = item.id.split('_')[1];
                      if (cat === 'DAY') name = `一般雑貨の${name}`;
                      if (cat === 'TRD') name = `貿易品の${name}`;
                      if (cat === 'RIT') name = `厳かな${name}`;
                      if (cat === 'ADN') name = `アクセサリーの${name}`;
                    }
                    return name;
                  };

                  return `
                  <div class="sample-card">
                      <div>
                          <div class="sample-type">${q.requestType}</div>
                          <div class="sample-customer" style="color: ${q.customer?.color || 'inherit'};">
                              <span>${q.customer?.id || 'Unknown'}</span>
                          </div>
                          <div class="sample-prompt" style="border-left: 4px solid ${q.customer?.color || 'transparent'}; padding-left: 12px;">
                              ${q.promptText}
                          </div>
                          <div class="logic-tag">Logic: ${q.logic}</div>
                      </div>
                      <div class="choices">
                          <div class="choice correct">
                              <i data-lucide="check-circle"></i>
                              <div class="sample-item-info">
                                  <img src="../public/${q.correctItem.image}" class="item-img" alt="">
                                  <div>
                                      <strong>${getPrefixedName(q.correctItem, q.requestType)}</strong><br>
                                      <span style="font-size: 0.8rem; opacity: 0.8;">${q.correctItem.colorName} / ${q.correctItem.typeName}</span>
                                  </div>
                              </div>
                          </div>
                          <div class="choice wrong">
                              <i data-lucide="x-circle"></i>
                              <div class="sample-item-info">
                                  <img src="../public/${q.wrongItem.image}" class="item-img" alt="">
                                  <div>
                                      <strong>${getPrefixedName(q.wrongItem, q.requestType)}</strong><br>
                                      <span style="font-size: 0.8rem; opacity: 0.8;">${q.wrongItem.colorName} / ${q.wrongItem.typeName}</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  `;
                }).join('')}
            </div>
        </section>

        <section id="items-section">
            <h2><i data-lucide="package"></i> Item Classification</h2>
            <div class="controls">
                <input type="text" id="itemSearch" placeholder="Search items by name or type..." onkeyup="filterItems()">
            </div>
            <div class="items-grid" id="itemsGrid">
                ${items.map(item => {
                    const genre = GENRE_BY_ID[item.category];
                    const type = ITEM_TYPE_BY_ID[item.typeId];
                    const color = COLOR_BY_ID[item.colorId];
                    const icon = iconMap[item.category] || 'box';
                    const colorHex = colorMap[item.colorId] || '#ccc';

                    return `
                    <div class="item-card" data-search="${item.name.toLowerCase()} ${type?.name.toLowerCase() || ''}">
                        <div class="item-header">
                            <div style="display: flex; gap: 12px; align-items: center;">
                                <img src="../public/${item.image}" class="item-img" alt="">
                                <div>
                                    <div class="item-title">${item.name}</div>
                                    <div class="item-meta">
                                        <span>${item.id}</span>
                                        <span>•</span>
                                        <span>${genre?.name || item.category}</span>
                                    </div>
                                    <div style="font-size: 0.7rem; opacity: 0.5; margin-top: 2px;">${item.fullName}</div>
                                </div>
                            </div>
                            <div class="category-icon">
                                <i data-lucide="${icon}"></i>
                            </div>
                        </div>
                        <div style="font-size: 0.85rem; font-weight: 600; margin-left: 60px;">${type?.name || item.typeId}</div>
                        <div class="color-badge" style="margin-left: 60px; background: ${colorHex}22; color: ${colorHex}; border: 1px solid ${colorHex}55;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${colorHex};"></span>
                            ${color?.name || item.colorId} (${color?.label || ''})
                        </div>
                        <div class="description" style="margin-left: 60px;">${item.description}</div>
                    </div>
                    `;
                }).join('')}
            </div>
        </section>
    </div>

    <script>
        lucide.createIcons();

        function filterItems() {
            const query = document.getElementById('itemSearch').value.toLowerCase();
            const cards = document.querySelectorAll('.item-card');
            cards.forEach(card => {
                const searchData = card.getAttribute('data-search');
                if (searchData.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>`;

  fs.writeFileSync(filePath, htmlContent, 'utf8');
  console.log(`Generated: ${filePath}`);
}

/**
 * Simplified simulator based on quizEngine.js
 */
const CUSTOMER_TYPES = [
  { id: 'old_man', icon: '👴', tone: 'elder', color: '#ffcc66' },
  { id: 'woman', icon: '👩', tone: 'polite', color: '#ff99cc' },
  { id: 'man', icon: '🧔', tone: 'plain', color: '#d1d1d1' },
  { id: 'girl', icon: '👧', tone: 'casual', color: '#ffb3ba' },
];

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
  return result;
}

function simulateQuestionGeneration(forcedType = null) {
  const requestTemplate = forcedType 
    ? REQUEST_TEMPLATES.find(t => t.id === forcedType)
    : REQUEST_TEMPLATES[Math.floor(Math.random() * REQUEST_TEMPLATES.length)];
  
  const customer = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];
  const criteria = {};
  let promptText = "";
  let logic = "default";

  if (requestTemplate.id === "color") {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    criteria.colorId = color.id;
    let colorName = color.name;
    let target = "{color}";
    if (color.id === "ME") {
      const metalPhrases = ["ずっしりとした", "重厚感のある", "鉄の術理を帯びた"];
      colorName = metalPhrases[Math.floor(Math.random() * metalPhrases.length)];
      target = "{color}の";
      logic = "ME special phrasing";
    }
    promptText = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace(target, colorName);
  } else if (requestTemplate.id === "genre") {
    const genre = GENRES[Math.floor(Math.random() * GENRES.length)];
    criteria.genre = genre.id;
    let genreName = genre.name;
    if (genre.id === "DAY") {
      const dayPhrases = ["日用品", "普段使いの品"];
      genreName = dayPhrases[Math.floor(Math.random() * dayPhrases.length)];
    }
    if (genre.id === "TRD") {
      const trdPhrases = ["渡来品", "遠方から入った品"];
      genreName = trdPhrases[Math.floor(Math.random() * trdPhrases.length)];
    }
    if (genre.id === "RIT") {
      const ritPhrases = ["儀式用の品", "儀礼の品"];
      genreName = ritPhrases[Math.floor(Math.random() * ritPhrases.length)];
    }
    if (genre.id === "ADN") {
      genreName = "アクセサリー";
    }
    promptText = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace("{genre}", genreName);
  } else if (requestTemplate.id === "itemType") {
    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    criteria.itemTypeId = type.id;
    promptText = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
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

    promptText = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)]
      .replace(target, colorName)
      .replace("{type}", type.name);
  }

  promptText = `${customer.icon} ${applyCustomerTone(promptText, customer.tone)}`;

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
  const correctItem = correctItems[Math.floor(Math.random() * correctItems.length)];

  let incorrectItems = [];
  if (correctItem.colorId === 'LI' && requestTemplate.id === "color") {
    incorrectItems = MASTER_ITEMS.filter(item => item.typeId === correctItem.typeId && item.colorId !== 'LI');
    logic = "LI same-type priority";
  }

  if (incorrectItems.length === 0) {
    incorrectItems = MASTER_ITEMS.filter(item => !isMatching(item, criteria));
  }

  const wrongItem = incorrectItems[Math.floor(Math.random() * incorrectItems.length)];

  const colorMap = id => COLOR_BY_ID[id]?.name || id;
  const typeMap = id => ITEM_TYPE_BY_ID[id]?.name || id;

  return {
    requestType: requestTemplate.id,
    promptText,
    logic,
    customer,
    correctItem: {
      id: correctItem.id,
      name: correctItem.name,
      image: correctItem.image,
      colorName: colorMap(correctItem.colorId),
      typeName: typeMap(correctItem.typeId)
    },
    wrongItem: {
      id: wrongItem.id,
      name: wrongItem.name,
      image: wrongItem.image,
      colorName: colorMap(wrongItem.colorId),
      typeName: typeMap(wrongItem.typeId)
    }
  };
}

console.log('--- Made in Maghribal: Quiz Prompt Audit ---');
exportItemClassification();
generateQuestionSamples();
console.log('Audit completed successfully.');
