/**
 * Regression tests for Event System Logic
 */
const assert = require('assert');
const path = require('path');
const { pathToFileURL } = require('url');
const { checkNewEventUnlock, getEventPages, resolveHeroineSelectionEvent, resolveEventReturnScreen, resolveEventCloseActions } = require('../src/game/eventSystem.js');

console.log('\n--- Made in Maghribal: Event System Tests ---');

async function main() {
  const affectionModule = await import(pathToFileURL(path.resolve(__dirname, '../src/data/affectionEvents.js')).href);
  const { AFFECTION_EVENTS, getEventsByHeroine } = affectionModule;

  // --- checkNewEventUnlock Tests ---
  const e1 = checkNewEventUnlock('hakima', 2, []);
  assert.strictEqual(e1, null, 'Should not unlock at affection 2');
  console.log('PASSED: No events below threshold');

  const e2 = checkNewEventUnlock('hakima', 5, []);
  assert.ok(e2 !== null);
  assert.strictEqual(e2.id, 'hakima_5');
  console.log('PASSED: Unlock at threshold 5');

  const e3 = checkNewEventUnlock('hakima', 10, ['hakima_5']);
  assert.ok(e3 !== null);
  assert.strictEqual(e3.id, 'hakima_10', 'Should unlock threshold 10 if 5 is seen');
  console.log('PASSED: Unlock threshold 10 after threshold 5 is seen');

  const e4a = checkNewEventUnlock('hakima', 12, []);
  assert.strictEqual(e4a.id, 'hakima_5', 'Should unlock lowest threshold first (5)');

  const e4b = checkNewEventUnlock('hakima', 12, ['hakima_5']);
  assert.strictEqual(e4b.id, 'hakima_10', 'Should unlock next threshold (10) after 5 is seen');

  const e4c = checkNewEventUnlock('hakima', 12, ['hakima_5', 'hakima_10']);
  assert.strictEqual(e4c, null, 'No more events left to unlock');
  console.log('PASSED: Sequential unlocking (4->12 jump)');

  const e5 = checkNewEventUnlock('unknown', 100, []);
  assert.strictEqual(e5, null);
  console.log('PASSED: Safety for unknown heroine');

  // --- getEventPages Tests ---
  console.log('\nTesting getEventPages...');

  const mockEvent = {
    text: 'Normal text',
    routePages: {
      long_history: ['IF page 1', 'IF page 2']
    }
  };

  const p1 = getEventPages(mockEvent, 'normal');
  assert.deepStrictEqual(p1, [{ speaker: "", expression: "normal", text: 'Normal text' }], 'Normal route should return base text');
  console.log('PASSED: getEventPages normal route fallback');

  const p2 = getEventPages(mockEvent, 'long_history');
  assert.deepStrictEqual(p2, [
    { speaker: "", expression: "normal", text: 'IF page 1' },
    { speaker: "", expression: "normal", text: 'IF page 2' }
  ], 'long_history should return IF pages');
  console.log('PASSED: getEventPages long_history route selection');

  const mockEventSimple = { text: 'Simple text' };
  const p3 = getEventPages(mockEventSimple, 'long_history');
  assert.deepStrictEqual(p3, [{ speaker: "", expression: "normal", text: 'Simple text' }], 'Should fallback if IF text is missing');
  console.log('PASSED: getEventPages fallback for missing IF text');

  const mockEventPages = { pages: ['Page 1', 'Page 2'] };
  const p4 = getEventPages(mockEventPages, 'normal');
  assert.deepStrictEqual(p4, [
    { speaker: "", expression: "normal", text: 'Page 1' },
    { speaker: "", expression: "normal", text: 'Page 2' }
  ], 'Should return pages if provided');
  console.log('PASSED: getEventPages using explicit pages');

  const p5 = getEventPages(mockEvent, undefined);
  assert.deepStrictEqual(p5, [{ speaker: "", expression: "normal", text: 'Normal text' }], 'Missing routeMode should fallback to normal text');
  console.log('PASSED: getEventPages fallback for missing routeMode');

  // --- Story Definition Structure Checks ---
  const allEvents = Object.values(AFFECTION_EVENTS).flat();
  const seenIds = new Set();

  for (const heroineId of ['hakima', 'mira', 'dariya']) {
    const heroineEvents = getEventsByHeroine(heroineId);
    // Now 6 events per heroine (5 original + 1 long_history)
    assert.strictEqual(heroineEvents.length, 6, `Expected exactly six events for ${heroineId}`);
    
    // Ensure climax is NOT auto-unlocked by threshold
    const climax = checkNewEventUnlock(heroineId, 100, []);
    assert.ok(climax.id !== `${heroineId}_climax`, `Climax event ${heroineId}_climax should not be unlocked by threshold`);
  }

  for (const event of allEvents) {
    assert.ok(event.id, 'Event id is required');
    assert.ok(event.heroineId, `Event ${event.id} requires heroineId`);
    assert.ok(Number.isFinite(event.threshold), `Event ${event.id} requires threshold`);
    assert.ok(event.title, `Event ${event.id} requires title`);
    assert.ok(event.pages || event.text, `Event ${event.id} requires text or pages`);

    if (event.routePages?.long_history) {
      assert.ok(Array.isArray(event.routePages.long_history), `Event ${event.id} long_history must be an array`);
      assert.ok(event.routePages.long_history.length > 0, `Event ${event.id} long_history cannot be empty`);
    }

    assert.ok(!seenIds.has(event.id), `Duplicate event id found: ${event.id}`);
    seenIds.add(event.id);
  }

  assert.ok(seenIds.has('hakima_0'));
  assert.ok(seenIds.has('hakima_5'));
  assert.ok(seenIds.has('hakima_10'));
  assert.ok(seenIds.has('hakima_20'));
  assert.ok(seenIds.has('hakima_climax'));
  assert.ok(seenIds.has('mira_0'));
  assert.ok(seenIds.has('mira_5'));
  assert.ok(seenIds.has('mira_10'));
  assert.ok(seenIds.has('mira_20'));
  assert.ok(seenIds.has('mira_climax'));
  assert.ok(seenIds.has('dariya_0'));
  assert.ok(seenIds.has('dariya_5'));
  assert.ok(seenIds.has('dariya_10'));
  assert.ok(seenIds.has('dariya_20'));
  assert.ok(seenIds.has('dariya_climax'));

  // --- resolveHeroineSelectionEvent Tests ---
  console.log('\nTesting resolveHeroineSelectionEvent...');

  const fb1 = resolveHeroineSelectionEvent({ heroineId: 'hakima', seenEventIds: [] });
  assert.ok(fb1 !== null, 'Should return flashback_intro for hakima when not seen');
  assert.strictEqual(fb1.id, 'hakima_0');
  assert.strictEqual(fb1.kind, 'flashback_intro');
  console.log('PASSED: resolveHeroineSelectionEvent returns _0 for unread hakima');

  const fb2 = resolveHeroineSelectionEvent({ heroineId: 'hakima', seenEventIds: ['hakima_0'] });
  assert.strictEqual(fb2, null, 'Should return null when _0 is already seen');
  console.log('PASSED: resolveHeroineSelectionEvent returns null for seen _0');

  const fb3 = resolveHeroineSelectionEvent({ heroineId: 'unknown', seenEventIds: [] });
  assert.strictEqual(fb3, null, 'Should return null for unknown heroine');
  console.log('PASSED: resolveHeroineSelectionEvent returns null for unknown heroine');

  for (const hId of ['hakima', 'mira', 'dariya']) {
    const fb = resolveHeroineSelectionEvent({ heroineId: hId, seenEventIds: [] });
    assert.ok(fb !== null, `Should return flashback_intro for ${hId}`);
    assert.strictEqual(fb.id, `${hId}_0`);
  }
  console.log('PASSED: resolveHeroineSelectionEvent works for all heroines');

  // --- resolveEventReturnScreen Tests ---
  console.log('\nTesting resolveEventReturnScreen...');

  const r1 = resolveEventReturnScreen({ eventKind: 'flashback_intro', isRecallMode: false });
  assert.strictEqual(r1, 'INTRO', 'flashback_intro should return to INTRO');
  console.log('PASSED: resolveEventReturnScreen returns INTRO for flashback_intro');

  const r2 = resolveEventReturnScreen({ eventKind: 'hakima_5', isRecallMode: false });
  assert.strictEqual(r2, 'DAY_END', 'Normal event should return to DAY_END');
  console.log('PASSED: resolveEventReturnScreen returns DAY_END for normal event');

  const r3 = resolveEventReturnScreen({ eventKind: 'hakima_5', isRecallMode: true });
  assert.strictEqual(r3, 'MEMORIES', 'Recall mode should return to MEMORIES');
  console.log('PASSED: resolveEventReturnScreen returns MEMORIES for recall mode');

  const r4 = resolveEventReturnScreen({ eventKind: 'flashback_intro', isRecallMode: true });
  assert.strictEqual(r4, 'MEMORIES', 'Recall mode takes priority over flashback_intro');
  console.log('PASSED: resolveEventReturnScreen recall mode takes priority');

  // --- resolveEventCloseActions Tests ---
  console.log('\nTesting resolveEventCloseActions...');

  // Normal event close
  const normalEvent = { id: 'hakima_5', kind: 'affection_event', threshold: 5 };
  const n1 = resolveEventCloseActions({ event: normalEvent, isRecallMode: false });
  assert.strictEqual(n1.shouldMarkSeen, true, 'Normal event should mark seen');
  assert.strictEqual(n1.nextScreen, 'DAY_END', 'Normal event should go to DAY_END');
  assert.strictEqual(n1.shouldClearBackgroundOverride, true, 'Normal event should clear background');
  assert.strictEqual(n1.shouldPlayDayEndSfx, true, 'Normal event should play day-end SFX');
  console.log('PASSED: resolveEventCloseActions for normal event');

  // flashback_intro close
  const fbEvent = { id: 'hakima_0', kind: 'flashback_intro', threshold: 0 };
  const f1 = resolveEventCloseActions({ event: fbEvent, isRecallMode: false });
  assert.strictEqual(f1.shouldMarkSeen, true, 'flashback_intro should mark seen');
  assert.strictEqual(f1.nextScreen, 'INTRO', 'flashback_intro should go to INTRO');
  assert.strictEqual(f1.shouldClearBackgroundOverride, true, 'flashback_intro should clear background');
  assert.strictEqual(f1.shouldPlayDayEndSfx, false, 'flashback_intro should NOT play day-end SFX');
  console.log('PASSED: resolveEventCloseActions for flashback_intro');

  // Recall mode close
  const r1a = resolveEventCloseActions({ event: normalEvent, isRecallMode: true });
  assert.strictEqual(r1a.shouldMarkSeen, false, 'Recall mode should NOT mark seen');
  assert.strictEqual(r1a.nextScreen, 'MEMORIES', 'Recall mode should go to MEMORIES');
  assert.strictEqual(r1a.shouldClearBackgroundOverride, true, 'Recall mode should clear background');
  assert.strictEqual(r1a.shouldPlayDayEndSfx, false, 'Recall mode should NOT play day-end SFX');
  console.log('PASSED: resolveEventCloseActions for recall mode');

  // route_climax close (same as normal event)
  const climaxEvent = { id: 'hakima_climax', kind: 'route_climax', threshold: 100 };
  const c1 = resolveEventCloseActions({ event: climaxEvent, isRecallMode: false });
  assert.strictEqual(c1.shouldMarkSeen, true, 'route_climax should mark seen');
  assert.strictEqual(c1.nextScreen, 'DAY_END', 'route_climax should go to DAY_END');
  assert.strictEqual(c1.shouldPlayDayEndSfx, true, 'route_climax should play day-end SFX');
  console.log('PASSED: resolveEventCloseActions for route_climax');

  // Null event close
  const n2 = resolveEventCloseActions({ event: null, isRecallMode: false });
  assert.strictEqual(n2.shouldMarkSeen, false, 'Null event should NOT mark seen');
  assert.strictEqual(n2.nextScreen, 'DAY_END', 'Null event should go to DAY_END');
  assert.strictEqual(n2.shouldClearBackgroundOverride, true, 'Null event should clear background');
  assert.strictEqual(n2.shouldPlayDayEndSfx, false, 'Null event should NOT play day-end SFX');
  console.log('PASSED: resolveEventCloseActions for null event');

  // Null event in recall mode
  const n3 = resolveEventCloseActions({ event: null, isRecallMode: true });
  assert.strictEqual(n3.nextScreen, 'MEMORIES', 'Null event in recall should go to MEMORIES');
  console.log('PASSED: resolveEventCloseActions for null event in recall mode');

  // Consistency check: resolveEventCloseActions nextScreen should match resolveEventReturnScreen
  for (const kind of ['flashback_intro', 'affection_event', 'route_climax']) {
    const evt = { id: `test_${kind}`, kind };
    const actions = resolveEventCloseActions({ event: evt, isRecallMode: false });
    const screen = resolveEventReturnScreen({ eventKind: kind, isRecallMode: false });
    assert.strictEqual(actions.nextScreen, screen, `nextScreen should match resolveEventReturnScreen for ${kind}`);
  }
  console.log('PASSED: resolveEventCloseActions nextScreen consistency with resolveEventReturnScreen');

  console.log('\n--- All event system tests completed successfully! ---');
}

main().catch((err) => {
  console.error('\nTEST FAILED:');
  console.error(err);
  process.exit(1);
});
