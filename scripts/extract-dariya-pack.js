/**
 * Extract Dariya Copy Pack
 * Outputs: docs/dariya-copy-pack.md
 */

import { DAILY_TALKS } from '../src/data/dailyTalks.js';
import { GREETING_VARIATIONS } from '../src/data/greetings.js';
import { AFFECTION_EVENTS } from '../src/data/affectionEvents.js';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const output = join(__dirname, '../docs/dariya-copy-pack.md');

// ダリヤエントリーをフィルタ
const dariyaDailyTalks = DAILY_TALKS.filter(t => 
  t.heroineId === 'dariya' || (t.scope === 'common' && t.pages?.some(p => p.speaker === 'ダリヤ'))
);
const dariyaGreetings = GREETING_VARIATIONS.filter(g => 
  g.heroineReactions?.dariya
);
const dariyaEvents = AFFECTION_EVENTS.dariya || [];

// Markdown 出力生成
let md = `# Dariya Copy Pack (Export)\n\n`;
md += `## Greetings (${dariyaGreetings.length} entries)\n\n`;
dariyaGreetings.forEach(g => {
  md += `### ${g.id} (${g.theme})\n`;
  md += `**Nader Monologue:** ${g.monologue}\n\n`;
  md += `**Dariya Arrival:** ${g.heroineReactions.dariya.arrival}\n\n`;
  md += `**Nader Response:** ${g.heroineReactions.dariya.response}\n\n`;
  md += `---\n\n`;
});

md += `\n## DailyTalks (${dariyaDailyTalks.length} entries)\n\n`;
dariyaDailyTalks.forEach(t => {
  md += `### ${t.id}\n`;
  md += `- Category: ${t.category}\n`;
  md += `- Timing: ${t.timing}\n`;
  md += `- RouteMode: ${t.routeMode}\n`;
  md += `- MinAffection: ${t.minAffection}\n`;
  md += `- Pages: ${t.pages.length}\n\n`;
  t.pages.forEach((p, i) => {
    md += `**Page ${i + 1}:** ${p.speaker || '(narration)'} - "${p.text.replace(/\n/g, '\\n')}"\n`;
  });
  md += `\n---\n\n`;
});

md += `\n## AffectionEvents (${dariyaEvents.length} entries)\n\n`;
dariyaEvents.forEach(e => {
  md += `### ${e.id} (threshold: ${e.threshold})\n`;
  md += `- Title: ${e.title}\n`;
  md += `- Kind: ${e.kind || 'normal'}\n`;
  md += `- StillImageId: ${e.stillImageId || '(none)'}\n`;
  md += `- BackgroundId: ${e.presentation?.backgroundId || '(none)'}\n`;
  md += `- BGM: ${e.presentation?.bgmId || '(none)'}\n\n`;
  
  md += `**Normal Pages:**\n`;
  e.pages.forEach((p, i) => {
    md += `- Page ${i + 1}: ${p.speaker || '(narration)'} - "${p.text.replace(/\n/g, '\\n')}"\n`;
  });
  
  if (e.routePages?.long_history) {
    md += `\n**Long History Pages:**\n`;
    e.routePages.long_history.forEach((p, i) => {
      md += `- Page ${i + 1}: ${p.speaker || '(narration)'} - "${p.text.replace(/\n/g, '\\n')}"\n`;
    });
  }
  md += `\n---\n\n`;
});

md += `\n## Summary\n\n`;
md += `- Greetings: ${dariyaGreetings.length}\n`;
md += `- DailyTalks: ${dariyaDailyTalks.length}\n`;
md += `- AffectionEvents: ${dariyaEvents.length}\n`;
md += `- Total: ${dariyaGreetings.length + dariyaDailyTalks.length + dariyaEvents.length} entries\n`;

writeFileSync(output, md, 'utf-8');
console.log(`Exported Dariya copy pack to ${output}`);
console.log(`- Greetings: ${dariyaGreetings.length}`);
console.log(`- DailyTalks: ${dariyaDailyTalks.length}`);
console.log(`- AffectionEvents: ${dariyaEvents.length}`);
