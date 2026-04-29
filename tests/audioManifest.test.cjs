/**
 * Audio Manifest Tests for Made in Maghribal
 */

const { TRACKS, getTrackById, getHeroineThemeTrack } = require('../src/data/tracks');
const { HEROINES } = require('../src/data/heroines');

console.log("\n--- Made in Maghribal: Audio Manifest Tests ---");

function testCommonTracks() {
  const commonIds = ['MAIN-01', 'MAIN-02', 'MAIN-03'];
  commonIds.forEach(id => {
    if (!TRACKS[id]) {
      throw new Error(`Common track not found in manifest: ${id}`);
    }
  });
  console.log("✅ PASSED: Common tracks exist");
}

function testHeroineThemes() {
  const heroineThemeIds = ['HAKIMA-01', 'MIRA-01', 'DARIYA-01'];
  heroineThemeIds.forEach(id => {
    if (!TRACKS[id]) {
      throw new Error(`Heroine theme track not found in manifest: ${id}`);
    }
  });

  HEROINES.forEach(h => {
    if (!h.themeTrackId) {
      throw new Error(`Heroine ${h.id} is missing themeTrackId`);
    }
    const track = getHeroineThemeTrack(h);
    if (!track || track.id !== h.themeTrackId) {
      throw new Error(`Failed to retrieve theme track for heroine: ${h.id}`);
    }
  });
  console.log("✅ PASSED: Heroine theme track linkage");
}

function testHelpers() {
  // getTrackById
  if (getTrackById('invalid') !== null) {
    throw new Error("getTrackById should return null for invalid ID");
  }
  const title = getTrackById('MAIN-01');
  if (!title || title.id !== 'MAIN-01') {
    throw new Error("getTrackById failed to retrieve valid track");
  }

  console.log("✅ PASSED: Audio helper functions");
}

function testExtraTracks() {
  const extraPrefixes = ['extra_joy', 'extra_anger', 'extra_sorrow', 'extra_fun', 'extra_surprise'];
  extraPrefixes.forEach(prefix => {
    [1, 2].forEach(num => {
      const id = `${prefix}_${num}`;
      if (!TRACKS[id]) {
        throw new Error(`Extra track not found in manifest: ${id}`);
      }
      if (TRACKS[id].category !== "共通イベントBGM") {
        throw new Error(`Extra track ${id} has incorrect category: ${TRACKS[id].category}`);
      }
    });
  });
  console.log("✅ PASSED: Extra tracks exist and categorized");
}

try {
  testCommonTracks();
  testHeroineThemes();
  testExtraTracks();
  testHelpers();
  console.log("\n--- All audio manifest tests completed successfully! ---\n");
} catch (err) {
  console.error(`\n❌ TEST FAILED: ${err.message}\n`);
  process.exit(1);
}
