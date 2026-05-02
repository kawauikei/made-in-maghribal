# M-COPY-DARIYA-PACK-EXPORT-1: ダリヤ用 Copy Pack 作成

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ダリヤの既存 DailyTalk / Greeting / AffectionEvent データを整理し、清書用 copy pack として出力する

**Architecture:** 
- 既存のハキマ・ミラ清書フォーマットに合わせる
- データファイルからダリヤエントリーを抽出
- Markdown または JSON 形式で出力
- 本文変更なし、整理のみ

**Tech Stack:** 
- Node.js (既存テスト環境)
- 既存データファイル: `src/data/dailyTalks.js`, `src/data/greetings.js`, `src/data/affectionEvents.js`

---

### Task 1: ダリヤ用データ抽出スクリプト作成

**Files:**
- Create: `scripts/extract-dariya-pack.js`
- Test: 手動実行で確認

- [ ] **Step 1: 抽出スクリプトを作成**

```javascript
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
```

- [ ] **Step 2: スクリプトを実行して出力確認**

Run: `node scripts/extract-dariya-pack.js`
Expected: `docs/dariya-copy-pack.md` が生成され、エントリー数が表示される

- [ ] **Step 3: 出力ファイルを確認**

Read: `docs/dariya-copy-pack.md`
Expected: ダリヤの全エントリーが Markdown 形式で整理されている

- [ ] **Step 4: Commit**

```bash
git add scripts/extract-dariya-pack.js docs/dariya-copy-pack.md
git commit -m "M-COPY-DARIYA-PACK-EXPORT-1: Export dariya copy pack for rewrite"
```

---

## 完了基準

- [ ] `scripts/extract-dariya-pack.js` が作成され、実行可能
- [ ] `docs/dariya-copy-pack.md` が生成され、以下のデータを含む:
  - Greetings: 4 entries (dariya 反応)
  - DailyTalks: ~28-30 entries (dariya 関連)
  - AffectionEvents: 9 entries (dariya_0, _5, _10, _20, climax, long_×4)
- [ ] 出力内容に本文の変更がない（整理のみ）
- [ ] git commit 済み

---

## 参考：ハキマ・ミラ清書との整合性

- ハキマ清書：43 entries (greetings 4 + DailyTalks 26 + affectionEvents 9 + long_history 4)
- ミラ清書：43 entries (同構成)
- ダリヤも同構成を想定
