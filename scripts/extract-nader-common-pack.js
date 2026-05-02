/**
 * Extract Nader/Common Copy Pack
 * Outputs: .temp/copy_pack_nader_common.md
 * Format: Matches copy_pack_hakima.md structure
 */

import { DAILY_TALKS } from '../src/data/dailyTalks.js';
import { GREETING_VARIATIONS } from '../src/data/greetings.js';
import { AFFECTION_EVENTS } from '../src/data/affectionEvents.js';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const output = join(__dirname, '../.temp/copy_pack_nader_common.md');

// Nader/Common エントリーをフィルタ
// Common: scope === 'common'
// Nader: speaker が 'ナーディル' のみ、または heroineId が null
const commonDailyTalks = DAILY_TALKS.filter(t => t.scope === 'common');
const naderGreetings = GREETING_VARIATIONS; // greetings は全員分 nerder monologue + heroine reactions
const commonEvents = []; // common events は現状存在しない

// Markdown 出力生成
let md = `# Nader/Common Character Pack (M-COPY-NADER-COMMON-PACK-EXPORT-1)\n\n`;
md += `**作成日**: 2026-05-02\n`;
md += `**対象**: ナーディル独白・共通シナリオ\n`;
md += `**目的**: 世界観担当チャットへ渡し、口調・関係性の一貫性をレビュー\n\n`;

md += `---\n\n`;
md += `## メタ情報\n\n`;
md += `- **主人公**: ナーディル (Nadir)\n`;
md += `- **種族**: 人間\n`;
md += `- **立場**: 星瓶堂若店主\n`;
md += `- **口調**: 丁寧・温和・内省的\n`;
md += `- **一人称**: 俺\n`;
md += `- **ヒロイン呼称**: 君 (タメ口: ハキマ「あんた」、ミラ「先輩」、ダリヤ「ダリヤさん」)\n\n`;

md += `---\n\n`;

// 1. Greetings - Nader Monologue
md += `## 1. Greetings - Nader Monologue\n\n`;
md += `**source**: \`src/data/greetings.js\`\n\n`;

naderGreetings.forEach(g => {
  md += `### ${g.id} (${g.theme})\n\n`;
  md += `\`\`\`yaml\n`;
  md += `id: ${g.id}\n`;
  md += `sourceFile: src/data/greetings.js\n`;
  md += `routeMode: both\n`;
  md += `type: monologue\n`;
  md += `\`\`\`\n\n`;
  
  md += `**monologue**:\n`;
  md += `\`\`\`\n${g.monologue}\n\`\`\`\n\n`;
  
  md += `---\n\n`;
});

// 2. DailyTalks - Common Intro
md += `## 2. DailyTalks - Common Intro\n\n`;

const introCommon = commonDailyTalks.filter(t => t.timing === 'intro' && t.routeMode !== 'long_history');
introCommon.forEach(t => {
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

// 3. DailyTalks - Common After Result
md += `## 3. DailyTalks - Common After Result\n\n`;

const afterResultCommon = commonDailyTalks.filter(t => t.timing === 'after_result' && t.routeMode !== 'long_history');
afterResultCommon.forEach(t => {
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

// 4. DailyTalks - Common Day End
md += `## 4. DailyTalks - Common Day End\n\n`;

const dayEndCommon = commonDailyTalks.filter(t => t.timing === 'day_end' && t.routeMode !== 'long_history');
dayEndCommon.forEach(t => {
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

// 5. DailyTalks - Common long_history
md += `## 5. DailyTalks - Common long_history\n\n`;

const longHistoryCommon = commonDailyTalks.filter(t => t.routeMode === 'long_history');
longHistoryCommon.forEach(t => {
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

// Summary
md += `## Summary\n\n`;
md += `- Greetings (monologues): ${naderGreetings.length}\n`;
md += `- DailyTalks (common): ${commonDailyTalks.length}\n`;
md += `- AffectionEvents (common): ${commonEvents.length}\n`;
md += `- Total: ${naderGreetings.length + commonDailyTalks.length + commonEvents.length} entries\n`;

writeFileSync(output, md, 'utf-8');
console.log(`Exported Nader/Common copy pack to ${output}`);
console.log(`- Greetings (monologues): ${naderGreetings.length}`);
console.log(`- DailyTalks (common): ${commonDailyTalks.length}`);
console.log(`- AffectionEvents (common): ${commonEvents.length}`);
