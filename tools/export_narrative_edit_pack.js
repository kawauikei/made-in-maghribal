import fs from 'fs';
import path from 'path';
import { DAILY_TALKS } from '../src/data/dailyTalks.js';

const OUTPUT_PATH = path.join('.temp', 'narrative_edit_pack.md');

function generateMarkdown() {
  let md = `# Made in Maghribal - Narrative Edit Pack (MVP)\n\n`;
  md += `このファイルは世界観担当AIが DailyTalk の本文を編集するためのパックです。\n`;
  md += `## 編集ガイドライン\n`;
  md += `- **編集可能**: \`text\`, \`speaker\`, \`expression\`\n`;
  md += `- **編集不可**: \`id\`, \`scope\`, \`heroineId\`, \`timing\`, \`routeMode\`, \`minAffection\`\n`;
  md += `- **注意**: IDを変更したり、新しいIDを追加したりしないでください（MVP範囲外）。\n`;
  md += `- **書式**: 各項目は \`key: value\` 形式を維持してください。\n\n`;

  DAILY_TALKS.forEach((talk) => {
    md += `## dailyTalk: ${talk.id}\n\n`;
    md += `id: ${talk.id}\n`;
    md += `scope: ${talk.scope}\n`;
    md += `heroineId: ${talk.heroineId || 'null'}\n`;
    md += `timing: ${talk.timing}\n`;
    md += `routeMode: ${talk.routeMode}\n`;
    md += `minAffection: ${talk.minAffection}\n\n`;

    md += `### pages\n\n`;
    talk.pages.forEach((page, index) => {
      md += `#### page ${index + 1}\n`;
      md += `speaker: ${page.speaker}\n`;
      md += `expression: ${page.expression}\n`;
      md += `text: ${page.text}\n\n`;
    });
    md += `---\n\n`;
  });

  return md;
}

async function run() {
  try {
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const content = generateMarkdown();
    fs.writeFileSync(OUTPUT_PATH, content, 'utf8');
    console.log(`Successfully exported Narrative Edit Pack to ${OUTPUT_PATH}`);
  } catch (err) {
    console.error('Export failed:', err);
    process.exit(1);
  }
}

run();
