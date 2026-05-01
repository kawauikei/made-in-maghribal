/**
 * DailyTalk Registry Audit / Validation Script
 * 
 * Ensures all narrative data in dailyTalks.js follows world-building rules,
 * structural constraints, and prohibited word policies.
 */

import fs from 'node:fs';
import path from 'node:path';
import { DAILY_TALKS } from '../src/data/dailyTalks.js';

const PROHIBITED_WORDS = [
  "店番", "働く", "雇う", "再建", "一緒に営業する",
  "父が遺した", "遺品", "形見"
];

const VALID_SCOPES = ["common", "heroine"];
const VALID_HEROINES = ["hakima", "mira", "dariya"];
const VALID_TIMINGS = ["intro", "after_result", "day_end"];
const VALID_MODES = ["normal", "long_history", "both"];
const VALID_SPEAKERS = ["ナーディル", "ハキマ", "ミラ", "ダリヤ", ""];
const VALID_EXPRESSIONS = ["normal", "joy", "fun", "sorrow", "cry", "anger", "surprise", "blush", "student", "social", "maid"];

console.log("--- Made in Maghribal: DailyTalk Registry Audit ---");

/**
 * HTML Report Generator (Premium Visual)
 */
function generateHtmlReport(results, talks) {
  const DOCS_DIR = './docs';
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR);
  }
  const filePath = path.join(DOCS_DIR, 'daily_talk_audit_report.html');

  const heroineColors = {
    hakima: '#ffcc00',
    mira: '#3d5afe',
    dariya: '#f44336'
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Made in Maghribal - DailyTalk Audit Report</title>
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
            --accent: #f59e0b;
            --pass: #10b981;
            --fail: #ef4444;
            --border: #334155;
            --hakima: #ffcc00;
            --mira: #3d5afe;
            --dariya: #f44336;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Outfit', 'Inter', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 40px 20px;
        }

        .container { max-width: 1100px; margin: 0 auto; }

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
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
        .stat-card .label { color: var(--text-dim); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }

        .talk-card {
            background: var(--card-bg);
            border-radius: 20px;
            border: 1px solid var(--border);
            margin-bottom: 30px;
            overflow: hidden;
            transition: transform 0.2s;
        }
        .talk-card:hover { transform: translateY(-3px); }

        .talk-header {
            padding: 20px 24px;
            background: rgba(255,255,255,0.03);
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .talk-id { font-family: monospace; font-size: 1.1rem; font-weight: 700; }
        .talk-meta { display: flex; gap: 12px; margin-top: 8px; }
        .badge {
            font-size: 0.75rem;
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: 600;
            background: var(--border);
            color: var(--text-dim);
        }
        .badge.timing { background: rgba(245, 158, 11, 0.1); color: var(--accent); }
        .badge.mode { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }

        .talk-body { padding: 24px; }
        
        .page-list { display: flex; flex-direction: column; gap: 16px; }
        .page-item {
            background: rgba(0,0,0,0.2);
            padding: 16px;
            border-radius: 12px;
            border-left: 4px solid var(--border);
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 20px;
        }
        .speaker-info { font-weight: 700; color: var(--accent); font-size: 0.9rem; }
        .expression { font-size: 0.8rem; color: var(--text-dim); margin-top: 4px; }
        .page-text { font-size: 1rem; color: var(--text); line-height: 1.7; }

        .error-box {
            margin-top: 16px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid var(--fail);
            color: var(--fail);
            padding: 12px;
            border-radius: 8px;
            font-size: 0.9rem;
        }

        .audit-status {
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .status-pass { color: var(--pass); }
        .status-fail { color: var(--fail); }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>DailyTalk Audit Report</h1>
            <p class="subtitle">Made in Maghribal - Scenario Data Verification</p>
            <p style="font-size: 0.8rem; margin-top: 10px; opacity: 0.5;">Generated: ${new Date().toLocaleString()}</p>
        </header>

        <div class="stats">
            <div class="stat-card"><span class="value">${results.total}</span><span class="label">Total Talks</span></div>
            <div class="stat-card"><span class="value">${results.byScope.common}</span><span class="label">Common</span></div>
            <div class="stat-card"><span class="value">${results.byHeroine.hakima}</span><span class="label">Hakima</span></div>
            <div class="stat-card"><span class="value">${results.byHeroine.mira}</span><span class="label">Mira</span></div>
            <div class="stat-card"><span class="value">${results.byHeroine.dariya}</span><span class="label">Dariya</span></div>
            <div class="stat-card"><span class="value">${results.totalPages}</span><span class="label">Total Pages</span></div>
        </div>

        <section>
            ${talks.map(talk => {
              const talkErrors = results.errorMap[talk.id] || [];
              const statusClass = talkErrors.length === 0 ? 'status-pass' : 'status-fail';
              const statusIcon = talkErrors.length === 0 ? 'check-circle' : 'alert-circle';
              const statusText = talkErrors.length === 0 ? 'PASS' : 'FAIL';
              
              const hColor = talk.heroineId ? heroineColors[talk.heroineId] : 'var(--border)';

              return `
              <div class="talk-card">
                  <div class="talk-header">
                      <div>
                          <div class="talk-id">${talk.id}</div>
                          <div class="talk-meta">
                              <span class="badge">${talk.scope}</span>
                              ${talk.heroineId ? `<span class="badge" style="background: ${hColor}22; color: ${hColor};">${talk.heroineId}</span>` : ''}
                              <span class="badge timing">${talk.timing}</span>
                              <span class="badge mode">${talk.routeMode}</span>
                              <span class="badge">Affection: ${talk.minAffection}</span>
                          </div>
                      </div>
                      <div class="audit-status ${statusClass}">
                          <i data-lucide="${statusIcon}"></i>
                          ${statusText}
                      </div>
                  </div>
                  <div class="talk-body">
                      <div class="page-list">
                          ${talk.pages.map((p, idx) => `
                          <div class="page-item" style="border-left-color: ${hColor};">
                              <div>
                                  <div class="speaker-info">${p.speaker || '(Narration)'}</div>
                                  <div class="expression">${p.expression}</div>
                              </div>
                              <div class="page-text">${p.text}</div>
                          </div>
                          `).join('')}
                      </div>
                      ${talkErrors.length > 0 ? `
                      <div class="error-box">
                          <strong>Issues:</strong>
                          <ul style="margin-left: 20px; margin-top: 5px;">
                              ${talkErrors.map(e => `<li>${e}</li>`).join('')}
                          </ul>
                      </div>
                      ` : ''}
                  </div>
              </div>
              `;
            }).join('')}
        </section>
    </div>
    <script>lucide.createIcons();</script>
</body>
</html>`;

  fs.writeFileSync(filePath, htmlContent, 'utf8');
  console.log(`\nGenerated HTML Report: ${filePath}`);
}

const results = {
  total: 0,
  byScope: { common: 0, heroine: 0 },
  byHeroine: { hakima: 0, mira: 0, dariya: 0 },
  byTiming: { intro: 0, after_result: 0, day_end: 0 },
  byMode: { normal: 0, long_history: 0, both: 0 },
  byAffection: {},
  totalPages: 0,
  errors: [],
  errorMap: {} // talk.id -> [errors]
};

const seenIds = new Set();

DAILY_TALKS.forEach((talk, index) => {
  results.total++;
  const talkId = talk.id || `[Index ${index}]`;
  const talkErrors = [];

  // 1. Structural Checks
  if (!talk.id) talkErrors.push(`Missing ID`);
  if (seenIds.has(talk.id)) talkErrors.push(`Duplicate ID`);
  seenIds.add(talk.id);

  if (!VALID_SCOPES.includes(talk.scope)) {
    talkErrors.push(`Invalid scope "${talk.scope}"`);
  } else {
    results.byScope[talk.scope]++;
  }

  if (talk.scope === "common" && talk.heroineId !== null) {
    talkErrors.push(`Common talk must have heroineId: null`);
  }
  if (talk.scope === "heroine") {
    if (!VALID_HEROINES.includes(talk.heroineId)) {
      talkErrors.push(`Invalid heroineId "${talk.heroineId}"`);
    } else {
      results.byHeroine[talk.heroineId]++;
    }
  }

  if (!VALID_TIMINGS.includes(talk.timing)) {
    talkErrors.push(`Invalid timing "${talk.timing}"`);
  } else {
    results.byTiming[talk.timing]++;
  }

  if (!VALID_MODES.includes(talk.routeMode)) {
    talkErrors.push(`Invalid routeMode "${talk.routeMode}"`);
  } else {
    results.byMode[talk.routeMode]++;
  }

  if (typeof talk.minAffection !== 'number' || talk.minAffection < 0) {
    talkErrors.push(`Invalid minAffection "${talk.minAffection}"`);
  } else {
    results.byAffection[talk.minAffection] = (results.byAffection[talk.minAffection] || 0) + 1;
  }

  // 2. Content Checks
  if (!Array.isArray(talk.pages) || talk.pages.length === 0) {
    talkErrors.push(`Pages must be a non-empty array`);
  } else {
    results.totalPages += talk.pages.length;
    talk.pages.forEach((page, pIdx) => {
      if (!page.text || page.text.trim() === "") {
        talkErrors.push(`[Page ${pIdx}]: Empty text`);
      }
      if (!VALID_SPEAKERS.includes(page.speaker)) {
        talkErrors.push(`[Page ${pIdx}]: Unknown speaker "${page.speaker}"`);
      }
      if (!VALID_EXPRESSIONS.includes(page.expression)) {
        talkErrors.push(`[Page ${pIdx}]: Unknown expression "${page.expression}"`);
      }

      // Prohibited Word Check
      PROHIBITED_WORDS.forEach(word => {
        if (page.text.includes(word)) {
          talkErrors.push(`[Page ${pIdx}]: Prohibited word found: "${word}"`);
        }
      });
      
      // Length Check
      if (page.text.length < 5) {
        talkErrors.push(`[Page ${pIdx}]: Text might be too short (${page.text.length} chars)`);
      }
      if (page.text.length > 200) {
        talkErrors.push(`[Page ${pIdx}]: Text might be too long (${page.text.length} chars)`);
      }
    });
  }

  if (talkErrors.length > 0) {
    results.errorMap[talkId] = talkErrors;
    talkErrors.forEach(err => results.errors.push(`${talkId}: ${err}`));
  }
});

// Report Output
console.log(`\nSummary:`);
console.log(`- Total talks: ${results.total}`);
console.log(`- Common talks: ${results.byScope.common}`);
console.log(`- Heroine specific: ${results.byScope.heroine} (Hakima: ${results.byHeroine.hakima}, Mira: ${results.byHeroine.mira}, Dariya: ${results.byHeroine.dariya})`);
console.log(`- Timings: Intro(${results.byTiming.intro}), Result(${results.byTiming.after_result}), DayEnd(${results.byTiming.day_end})`);
console.log(`- RouteModes: Normal(${results.byMode.normal}), LongHistory(${results.byMode.long_history}), Both(${results.byMode.both})`);
console.log(`- Affection Distribution: ${JSON.stringify(results.byAffection)}`);
console.log(`- Total pages: ${results.totalPages}`);
console.log(`- Avg pages per talk: ${(results.totalPages / results.total).toFixed(2)}`);

generateHtmlReport(results, DAILY_TALKS);

if (results.errors.length > 0) {
  console.error(`\n❌ AUDIT FAILED: ${results.errors.length} errors found:`);
  results.errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`\n✅ AUDIT PASSED: All DailyTalks follow the rules.`);
  process.exit(0);
}
