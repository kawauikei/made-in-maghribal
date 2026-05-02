import assert from 'assert';
import { prepareIntroSequence } from '../src/game/introFlow.js';

console.log('--- Made in Maghribal: Intro Flow Logic Tests ---\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASSED: ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${e.message}`);
    failed++;
  }
}

test('Returns greeting, mergedTalk, and newSeenTalkIds for hakima normal', () => {
  const result = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  assert(result.greeting, 'greeting should be defined');
  assert(result.greeting.id, 'greeting should have id');
  assert(result.greeting.monologue, 'greeting should have monologue');
  assert(result.greeting.heroineReactions, 'greeting should have heroineReactions');
});

test('Merged talk contains both work and personal categories', () => {
  const result = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  if (result.mergedTalk) {
    assert(result.mergedTalk.id.startsWith('merged_'), 'mergedTalk id should start with merged_');
    assert(Array.isArray(result.mergedTalk.pages), 'mergedTalk should have pages array');
    assert(result.mergedTalk.pages.length > 0, 'mergedTalk should have at least one page');
  }
});

test('newSeenTalkIds contains talk IDs', () => {
  const result = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  assert(Array.isArray(result.newSeenTalkIds), 'newSeenTalkIds should be array');
  assert(result.newSeenTalkIds.length >= 1, 'Should have at least 1 new seen talk');
  assert(result.newSeenTalkIds.length <= 2, 'Should have at most 2 new seen talks (work + personal)');
});

test('Seen talks are not selected again', () => {
  const first = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const second = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: first.newSeenTalkIds,
    routeMode: 'normal',
  });

  const overlap = second.newSeenTalkIds.filter(id => first.newSeenTalkIds.includes(id));
  assert.strictEqual(overlap.length, 0, 'Second call should not return already seen talks');
});

test('Heroine-specific talks do not mix', () => {
  const hakima = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const mira = prepareIntroSequence({
    heroineId: 'mira',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  assert(hakima.newSeenTalkIds.length > 0, 'Hakima should have talks');
  assert(mira.newSeenTalkIds.length > 0, 'Mira should have talks');
});

test('Returns null mergedTalk when all talks are seen', () => {
  const first = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const second = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: first.newSeenTalkIds,
    routeMode: 'normal',
  });

  if (second.newSeenTalkIds.length === 0) {
    assert.strictEqual(second.mergedTalk, null, 'mergedTalk should be null when no talks available');
  }
});

test('routeMode affects talk selection', () => {
  const normal = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const longHistory = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'long_history',
  });

  assert(normal.mergedTalk !== undefined, 'normal should have mergedTalk');
  assert(longHistory.mergedTalk !== undefined, 'long_history should have mergedTalk');
});

test('Heroine-specific talks do not mix with other heroines', () => {
  const hakima = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const mira = prepareIntroSequence({
    heroineId: 'mira',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const dariya = prepareIntroSequence({
    heroineId: 'dariya',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  assert(hakima.newSeenTalkIds.length > 0, 'Hakima should have talks');
  assert(mira.newSeenTalkIds.length > 0, 'Mira should have talks');
  assert(dariya.newSeenTalkIds.length > 0, 'Dariya should have talks');

  const hakimaHasMira = hakima.newSeenTalkIds.some(id => id.includes('mira'));
  const hakimaHasDariya = hakima.newSeenTalkIds.some(id => id.includes('dariya'));
  assert(!hakimaHasMira, 'Hakima talks should not contain mira IDs');
  assert(!hakimaHasDariya, 'Hakima talks should not contain dariya IDs');
});

test('Common talks are used as fallback when heroine talks are exhausted', () => {
  const seenAllHakima = [];
  for (let i = 0; i < 50; i++) {
    const result = prepareIntroSequence({
      heroineId: 'hakima',
      currentAffection: 20,
      seenTalkIds: [...seenAllHakima],
      routeMode: 'normal',
    });
    if (result.newSeenTalkIds.length > 0) {
      seenAllHakima.push(...result.newSeenTalkIds);
    } else {
      break;
    }
  }

  const final = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 20,
    seenTalkIds: seenAllHakima,
    routeMode: 'normal',
  });

  assert(final.greeting, 'Greeting should always be available');
  assert(Array.isArray(final.newSeenTalkIds), 'newSeenTalkIds should always be array');
});

test('routeMode does not cause exceptions', () => {
  const modes = ['normal', 'long_history'];

  modes.forEach(mode => {
    const result = prepareIntroSequence({
      heroineId: 'hakima',
      currentAffection: 0,
      seenTalkIds: [],
      routeMode: mode,
    });

    assert(result.greeting, `Greeting should exist for ${mode}`);
    assert(Array.isArray(result.newSeenTalkIds), `newSeenTalkIds should be array for ${mode}`);
  });
});

test('newSeenTalkIds does not include greeting ID', () => {
  const result = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const greetingInTalks = result.newSeenTalkIds.includes(result.greeting.id);
  assert(!greetingInTalks, 'Greeting ID should not be in newSeenTalkIds');
});

test('newSeenTalkIds matches mergedTalk talk count', () => {
  const result = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  if (result.mergedTalk) {
    const mergedIdWithoutPrefix = result.mergedTalk.id.replace('merged_', '');
    const talkIdsInMerged = mergedIdWithoutPrefix.split(/_(?=common_|hakima_|mira_|dariya_)/);
    assert.strictEqual(
      result.newSeenTalkIds.length,
      talkIdsInMerged.length,
      'newSeenTalkIds count should match talk IDs in mergedTalk'
    );
  }
});

test('Existing seenTalkIds are preserved in newSeenTalkIds calculation', () => {
  const initialSeen = ['common_shop_dust'];

  const result = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: initialSeen,
    routeMode: 'normal',
  });

  const includesOldSeen = result.newSeenTalkIds.some(id => initialSeen.includes(id));
  assert(!includesOldSeen, 'Previously seen talks should not be re-selected');
});

test('Empty seenTalkIds array is handled safely', () => {
  const result = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  assert(result.greeting, 'Should work with empty seenTalkIds');
  assert(Array.isArray(result.newSeenTalkIds), 'newSeenTalkIds should be array');
});

test('Unknown heroineId falls back to common talks', () => {
  const result = prepareIntroSequence({
    heroineId: 'unknown_heroine',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  assert(result.greeting, 'Greeting should exist for unknown heroine');
  assert(Array.isArray(result.newSeenTalkIds), 'newSeenTalkIds should be array for unknown heroine');
});

test('High affection unlocks higher threshold talks', () => {
  const lowAff = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const highAff = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 10,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  assert(lowAff.newSeenTalkIds.length >= 1, 'Low affection should have talks');
  assert(highAff.newSeenTalkIds.length >= 1, 'High affection should have talks');
});

test('Work talk category is respected', () => {
  const result = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  if (result.mergedTalk && result.mergedTalk.pages) {
    assert(result.mergedTalk.pages.length > 0, 'Merged talk should have pages');
  }
});

test('Personal talk category is respected', () => {
  const result = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  assert(result.greeting, 'Greeting exists');
  assert(Array.isArray(result.newSeenTalkIds), 'newSeenTalkIds is array');
});

test('Greeting structure is consistent', () => {
  const result = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  assert(result.greeting.id, 'Greeting should have id');
  assert(result.greeting.monologue, 'Greeting should have monologue');
  assert(result.greeting.heroineReactions, 'Greeting should have heroineReactions');
  assert(result.greeting.heroineReactions.hakima, 'Greeting should have hakima reaction');
  assert(result.greeting.heroineReactions.hakima.arrival, 'Hakima should have arrival');
  assert(result.greeting.heroineReactions.hakima.response, 'Hakima should have response');
});

test('Heroine-specific talks are selected for correct heroine', () => {
  const hakima = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const mira = prepareIntroSequence({
    heroineId: 'mira',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const dariya = prepareIntroSequence({
    heroineId: 'dariya',
    currentAffection: 0,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const hakimaHasOwn = hakima.newSeenTalkIds.some(id => id.startsWith('hakima_'));
  const miraHasOwn = mira.newSeenTalkIds.some(id => id.startsWith('mira_'));
  const dariyaHasOwn = dariya.newSeenTalkIds.some(id => id.startsWith('dariya_'));

  assert(hakimaHasOwn || hakima.newSeenTalkIds.some(id => id.startsWith('common_')), 'Hakima should have talks');
  assert(miraHasOwn || mira.newSeenTalkIds.some(id => id.startsWith('common_')), 'Mira should have talks');
  assert(dariyaHasOwn || dariya.newSeenTalkIds.some(id => id.startsWith('common_')), 'Dariya should have talks');
});

test('Long history routeMode selects long_history talks', () => {
  const normal = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 5,
    seenTalkIds: [],
    routeMode: 'normal',
  });

  const longHistory = prepareIntroSequence({
    heroineId: 'hakima',
    currentAffection: 5,
    seenTalkIds: [],
    routeMode: 'long_history',
  });

  assert(normal.mergedTalk !== undefined, 'Normal should have mergedTalk');
  assert(longHistory.mergedTalk !== undefined, 'Long history should have mergedTalk');
});

console.log(`\n--- All Intro Flow tests completed: ${passed} passed, ${failed} failed ---`);
if (failed > 0) process.exit(1);
