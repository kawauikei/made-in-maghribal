/**
 * Extract Dariya Copy Pack
 * Outputs: docs/dariya-copy-pack.md
 * Format: Matches copy_pack_hakima.md structure
 */

import { DAILY_TALKS } from '../src/data/dailyTalks.js';
import { GREETING_VARIATIONS } from '../src/data/greetings.js';
import { AFFECTION_EVENTS } from '../src/data/affectionEvents.js';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const output = join(__dirname, '../.temp/copy_pack_dariya.md');

// ダリヤエントリーをフィルタ
const dariyaDailyTalks = DAILY_TALKS.filter(t => t.heroineId === 'dariya');
const dariyaGreetings = GREETING_VARIATIONS.filter(g => g.heroineReactions?.dariya);
const dariyaEvents = AFFECTION_EVENTS.dariya || [];

// Markdown 出力生成
let md = `# Dariya Character Pack (M-COPY-CHARACTER-PACK-EXPORT-1)\n\n`;
md += `**作成日**: 2026-05-02\n`;
md += `**対象**: ダリヤ関連の全本文\n`;
md += `**目的**: 世界観担当チャットへ渡し、口調・関係性の一貫性をレビュー\n\n`;

md += `---\n\n`;
md += `## メタ情報\n\n`;
md += `- **ヒロイン ID**: \`dariya\`\n`;
md += `- **種族**: 鬼族\n`;
md += `- **関係**: 王宮錬金術師・先輩・友人\n`;
md += `- **口調**: 知的・冷静・余裕 (時々皮肉)\n`;
md += `- **一人称**: 私\n`;
md += `- **ナーディル呼称**: 君 (後輩)\n`;
md += `- **BGM**: \`DARIYA-01\`\n\n`;

md += `---\n\n`;

// 1. Greetings
md += `## 1. Greetings\n\n`;
md += `**source**: \`src/data/greetings.js\`\n\n`;

dariyaGreetings.forEach(g => {
  md += `### ${g.id} (${g.theme})\n\n`;
  md += `\`\`\`yaml\n`;
  md += `id: ${g.id}\n`;
  md += `sourceFile: src/data/greetings.js\n`;
  md += `routeMode: both\n`;
  md += `speakerId: dariya\n`;
  md += `\`\`\`\n\n`;
  
  md += `**arrival**:\n`;
  md += `\`\`\`\n${g.heroineReactions.dariya.arrival}\n\`\`\`\n\n`;
  
  md += `**response**:\n`;
  md += `\`\`\`\n${g.heroineReactions.dariya.response}\n\`\`\`\n\n`;
  
  md += `---\n\n`;
});

// 2. DailyTalks - Intro
md += `## 2. DailyTalks - Intro\n\n`;

const introTalks = dariyaDailyTalks.filter(t => t.timing === 'intro' && t.routeMode !== 'long_history');
introTalks.forEach(t => {
  md += `### ${t.id}\n\n`;
  md += `\`\`\`yaml\n`;
  md += `id: ${t.id}\n`;
  md += `sourceFile: src/data/dailyTalks.js\n`;
  md += `routeMode: ${t.routeMode}\n`;
  md += `timing: ${t.timing}\n`;
  md += `category: ${t.category}\n`;
  md += `minAffection: ${t.minAffection}\n`;
  md += `\`\`\`\n\n`;
  
  md += `**pages**:\n`;
  md += `\`\`\`\n`;
  t.pages.forEach(p => {
    if (p.speaker) {
      md += `speaker: ${p.speaker}, expression: ${p.expression}\n`;
    }
    md += `${p.text}\n\n`;
  });
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
});

// 3. DailyTalks - After Result
md += `## 3. DailyTalks - After Result\n\n`;

const afterResultTalks = dariyaDailyTalks.filter(t => t.timing === 'after_result' && t.routeMode !== 'long_history');
afterResultTalks.forEach(t => {
  md += `### ${t.id}\n\n`;
  md += `\`\`\`yaml\n`;
  md += `id: ${t.id}\n`;
  md += `sourceFile: src/data/dailyTalks.js\n`;
  md += `routeMode: ${t.routeMode}\n`;
  md += `timing: ${t.timing}\n`;
  md += `category: ${t.category}\n`;
  md += `minAffection: ${t.minAffection}\n`;
  md += `\`\`\`\n\n`;
  
  md += `**pages**:\n`;
  md += `\`\`\`\n`;
  t.pages.forEach(p => {
    if (p.speaker) {
      md += `speaker: ${p.speaker}, expression: ${p.expression}\n`;
    }
    md += `${p.text}\n\n`;
  });
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
});

// 4. DailyTalks - Day End
md += `## 4. DailyTalks - Day End\n\n`;

const dayEndTalks = dariyaDailyTalks.filter(t => t.timing === 'day_end' && t.routeMode !== 'long_history');
dayEndTalks.forEach(t => {
  md += `### ${t.id}\n\n`;
  md += `\`\`\`yaml\n`;
  md += `id: ${t.id}\n`;
  md += `sourceFile: src/data/dailyTalks.js\n`;
  md += `routeMode: ${t.routeMode}\n`;
  md += `timing: ${t.timing}\n`;
  md += `category: ${t.category}\n`;
  md += `minAffection: ${t.minAffection}\n`;
  md += `\`\`\`\n\n`;
  
  md += `**pages**:\n`;
  md += `\`\`\`\n`;
  t.pages.forEach(p => {
    if (p.speaker) {
      md += `speaker: ${p.speaker}, expression: ${p.expression}\n`;
    }
    md += `${p.text}\n\n`;
  });
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
});

// 5. DailyTalks - long_history Intro
md += `## 5. DailyTalks - long_history Intro\n\n`;

const longHistoryIntroTalks = dariyaDailyTalks.filter(t => t.timing === 'intro' && t.routeMode === 'long_history');
longHistoryIntroTalks.forEach(t => {
  md += `### ${t.id}\n\n`;
  md += `\`\`\`yaml\n`;
  md += `id: ${t.id}\n`;
  md += `sourceFile: src/data/dailyTalks.js\n`;
  md += `routeMode: ${t.routeMode}\n`;
  md += `timing: ${t.timing}\n`;
  md += `category: ${t.category}\n`;
  md += `minAffection: ${t.minAffection}\n`;
  md += `\`\`\`\n\n`;
  
  md += `**pages**:\n`;
  md += `\`\`\`\n`;
  t.pages.forEach(p => {
    if (p.speaker) {
      md += `speaker: ${p.speaker}, expression: ${p.expression}\n`;
    }
    md += `${p.text}\n\n`;
  });
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
});

// 6. Affection Events - Normal Route
md += `## 6. Affection Events - Normal Route\n\n`;

const normalEvents = dariyaEvents.filter(e => !e.routeMode || e.routeMode === 'both');
normalEvents.forEach(e => {
  md += `### ${e.id}`;
  if (e.kind) md += ` (${e.kind})`;
  md += `\n\n`;
  
  md += `\`\`\`yaml\n`;
  md += `id: ${e.id}\n`;
  md += `sourceFile: src/data/affectionEvents.js\n`;
  md += `routeMode: both\n`;
  md += `threshold: ${e.threshold}\n`;
  if (e.kind) md += `kind: ${e.kind}\n`;
  md += `title: ${e.title}\n`;
  if (e.stillImageId) md += `stillImageId: ${e.stillImageId}\n`;
  md += `\`\`\`\n\n`;
  
  md += `**summary**:\n`;
  md += `\`\`\`\n${e.summary}\n\`\`\`\n\n`;
  
  md += `**pages**:\n`;
  md += `\`\`\`\n`;
  e.pages.forEach(p => {
    let parts = [];
    if (p.speaker) parts.push(`speaker: ${p.speaker}`);
    if (p.expression) parts.push(`expression: ${p.expression}`);
    if (p.backgroundId) parts.push(`backgroundId: ${p.backgroundId}`);
    md += `${parts.join(', ')}\n`;
    md += `${p.text}\n\n`;
  });
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
});

// 7. Affection Events - long_history Route
md += `## 7. Affection Events - long_history Route\n\n`;

const longHistoryEvents = dariyaEvents.filter(e => e.routeMode === 'long_history' || e.routePages?.long_history);
longHistoryEvents.forEach(e => {
  md += `### ${e.id}\n\n`;
  
  md += `\`\`\`yaml\n`;
  md += `id: ${e.id}\n`;
  md += `sourceFile: src/data/affectionEvents.js\n`;
  md += `routeMode: long_history\n`;
  md += `threshold: ${e.threshold}\n`;
  if (e.kind) md += `kind: ${e.kind}\n`;
  md += `title: ${e.title}\n`;
  if (e.stillImageId) md += `stillImageId: ${e.stillImageId}\n`;
  md += `\`\`\`\n\n`;
  
  md += `**summary**:\n`;
  md += `\`\`\`\n${e.summary}\n\`\`\`\n\n`;
  
  if (e.routePages?.long_history) {
    md += `**pages**:\n`;
    md += `\`\`\`\n`;
    e.routePages.long_history.forEach(p => {
      let parts = [];
      if (p.speaker) parts.push(`speaker: ${p.speaker}`);
      if (p.expression) parts.push(`expression: ${p.expression}`);
      if (p.backgroundId) parts.push(`backgroundId: ${p.backgroundId}`);
      md += `${parts.join(', ')}\n`;
      md += `${p.text}\n\n`;
    });
    md += `\`\`\`\n\n`;
  }
  
  md += `---\n\n`;
});

// Summary
md += `## Summary\n\n`;
md += `- Greetings: ${dariyaGreetings.length}\n`;
md += `- DailyTalks: ${dariyaDailyTalks.length}\n`;
md += `- AffectionEvents: ${dariyaEvents.length}\n`;
md += `- Total: ${dariyaGreetings.length + dariyaDailyTalks.length + dariyaEvents.length} entries\n`;

writeFileSync(output, md, 'utf-8');
console.log(`Exported Dariya copy pack to ${output}`);
console.log(`- Greetings: ${dariyaGreetings.length}`);
console.log(`- DailyTalks: ${dariyaDailyTalks.length}`);
console.log(`- AffectionEvents: ${dariyaEvents.length}`);
