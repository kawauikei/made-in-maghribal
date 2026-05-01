/**
 * DailyTalk Registry Audit / Validation Script
 * 
 * Ensures all narrative data in dailyTalks.js follows world-building rules,
 * structural constraints, and prohibited word policies.
 */

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
const VALID_EXPRESSIONS = ["normal", "joy", "fun", "sorrow", "cry", "angry", "surprised", "blush"];

console.log("--- Made in Maghribal: DailyTalk Registry Audit ---");

const results = {
  total: 0,
  byScope: { common: 0, heroine: 0 },
  byHeroine: { hakima: 0, mira: 0, dariya: 0 },
  byTiming: { intro: 0, after_result: 0, day_end: 0 },
  byMode: { normal: 0, long_history: 0, both: 0 },
  byAffection: {},
  totalPages: 0,
  errors: []
};

const seenIds = new Set();

DAILY_TALKS.forEach((talk, index) => {
  results.total++;
  const talkId = talk.id || `[Index ${index}]`;

  // 1. Structural Checks
  if (!talk.id) results.errors.push(`${talkId}: Missing ID`);
  if (seenIds.has(talk.id)) results.errors.push(`${talkId}: Duplicate ID`);
  seenIds.add(talk.id);

  if (!VALID_SCOPES.includes(talk.scope)) {
    results.errors.push(`${talkId}: Invalid scope "${talk.scope}"`);
  } else {
    results.byScope[talk.scope]++;
  }

  if (talk.scope === "common" && talk.heroineId !== null) {
    results.errors.push(`${talkId}: Common talk must have heroineId: null`);
  }
  if (talk.scope === "heroine") {
    if (!VALID_HEROINES.includes(talk.heroineId)) {
      results.errors.push(`${talkId}: Invalid heroineId "${talk.heroineId}"`);
    } else {
      results.byHeroine[talk.heroineId]++;
    }
  }

  if (!VALID_TIMINGS.includes(talk.timing)) {
    results.errors.push(`${talkId}: Invalid timing "${talk.timing}"`);
  } else {
    results.byTiming[talk.timing]++;
  }

  if (!VALID_MODES.includes(talk.routeMode)) {
    results.errors.push(`${talkId}: Invalid routeMode "${talk.routeMode}"`);
  } else {
    results.byMode[talk.routeMode]++;
  }

  if (typeof talk.minAffection !== 'number' || talk.minAffection < 0) {
    results.errors.push(`${talkId}: Invalid minAffection "${talk.minAffection}"`);
  } else {
    results.byAffection[talk.minAffection] = (results.byAffection[talk.minAffection] || 0) + 1;
  }

  // 2. Content Checks
  if (!Array.isArray(talk.pages) || talk.pages.length === 0) {
    results.errors.push(`${talkId}: Pages must be a non-empty array`);
  } else {
    results.totalPages += talk.pages.length;
    talk.pages.forEach((page, pIdx) => {
      if (!page.text || page.text.trim() === "") {
        results.errors.push(`${talkId} [Page ${pIdx}]: Empty text`);
      }
      if (!VALID_SPEAKERS.includes(page.speaker)) {
        results.errors.push(`${talkId} [Page ${pIdx}]: Unknown speaker "${page.speaker}"`);
      }
      if (!VALID_EXPRESSIONS.includes(page.expression)) {
        results.errors.push(`${talkId} [Page ${pIdx}]: Unknown expression "${page.expression}"`);
      }

      // Prohibited Word Check
      PROHIBITED_WORDS.forEach(word => {
        if (page.text.includes(word)) {
          results.errors.push(`${talkId} [Page ${pIdx}]: Prohibited word found: "${word}"`);
        }
      });
      
      // Length Check (Example: too short or too long)
      if (page.text.length < 5) {
        results.errors.push(`${talkId} [Page ${pIdx}]: Text might be too short (${page.text.length} chars)`);
      }
      if (page.text.length > 200) {
        results.errors.push(`${talkId} [Page ${pIdx}]: Text might be too long (${page.text.length} chars)`);
      }
    });
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

if (results.errors.length > 0) {
  console.error(`\n❌ AUDIT FAILED: ${results.errors.length} errors found:`);
  results.errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log(`\n✅ AUDIT PASSED: All DailyTalks follow the rules.`);
  process.exit(0);
}
