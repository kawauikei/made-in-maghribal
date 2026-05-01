/**
 * Result Comments Validation
 * Ensures heroine-specific RESULT comments follow world-building rules.
 */

import { RESULT_COMMENTS, getResultComment, getResultTier, validateResultComments } from '../src/data/resultComments.js';

console.log("--- Made in Maghribal: Result Comments Audit ---");

const VALID_HEROINES = ['hakima', 'mira', 'dariya'];
const VALID_TIERS = ['perfect', 'good', 'ok', 'bad'];
const PROHIBITED_WORDS = ['店番', '働く', '雇う', '再建', '一緒に営業'];

const errors = [];

// 1. Structure check
for (const heroineId of VALID_HEROINES) {
  if (!RESULT_COMMENTS[heroineId]) {
    errors.push(`Missing heroine: ${heroineId}`);
    continue;
  }
  for (const tier of VALID_TIERS) {
    const pool = RESULT_COMMENTS[heroineId][tier];
    if (!pool || pool.length === 0) {
      errors.push(`${heroineId}.${tier}: empty or missing`);
      continue;
    }
    for (let i = 0; i < pool.length; i++) {
      const comment = pool[i];
      if (!comment || comment.trim() === '') {
        errors.push(`${heroineId}.${tier}[${i}]: empty string`);
      }
      if (comment.length > 80) {
        errors.push(`${heroineId}.${tier}[${i}]: too long (${comment.length} chars)`);
      }
      for (const word of PROHIBITED_WORDS) {
        if (comment.includes(word)) {
          errors.push(`${heroineId}.${tier}[${i}]: contains forbidden word "${word}"`);
        }
      }
    }
  }
}

// 2. Function check: getResultComment returns non-empty for all heroines and counts
for (const heroineId of VALID_HEROINES) {
  for (let count = 0; count <= 5; count++) {
    const comment = getResultComment(heroineId, count, 5);
    if (!comment || comment.trim() === '') {
      errors.push(`getResultComment(${heroineId}, ${count}): returned empty`);
    }
  }
}

// 3. Tier mapping check
const tierChecks = [
  [5, 'perfect'], [4, 'good'], [3, 'good'], [2, 'ok'], [1, 'bad'], [0, 'bad']
];
for (const [count, expectedTier] of tierChecks) {
  const tier = getResultTier(count, 5);
  if (tier !== expectedTier) {
    errors.push(`getResultTier(${count}): expected ${expectedTier}, got ${tier}`);
  }
}

// 4. validateResultComments built-in check
const builtInErrors = validateResultComments();
if (builtInErrors.length > 0) {
  errors.push(...builtInErrors);
}

// Report
if (errors.length > 0) {
  console.error(`\n❌ AUDIT FAILED: ${errors.length} errors:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`\n✅ AUDIT PASSED: All result comments follow the rules.`);
  console.log(`   - ${VALID_HEROINES.length} heroines × ${VALID_TIERS.length} tiers`);
  console.log(`   - Total unique comments: ${Object.values(RESULT_COMMENTS).reduce((sum, h) => sum + Object.values(h).reduce((s, p) => s + p.length, 0), 0)}`);
  process.exit(0);
}
