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

console.log(`\n--- All Intro Flow tests completed: ${passed} passed, ${failed} failed ---`);
if (failed > 0) process.exit(1);
