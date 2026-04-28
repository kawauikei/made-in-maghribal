/**
 * Audio Manifest Tests for Made in Maghribal
 */

const { TRACKS, getTrackById, getHeroineThemeTrack } = require('../src/data/tracks');
const { HEROINES } = require('../src/data/heroines');

console.log("\n--- Made in Maghribal: Audio Manifest Tests ---");

function testCommonTracks() {
  const commonIds = ['titleTheme', 'workshopTheme', 'quizBasic01'];
  commonIds.forEach(id => {
    if (!TRACKS[id]) {
      throw new Error(`Common track not found in manifest: ${id}`);
    }
  });
  console.log("✅ PASSED: Common tracks exist");
}

function testHeroineThemes() {
  const heroineThemeIds = ['hakimaTheme', 'miraTheme', 'dariyaTheme'];
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
  const title = getTrackById('titleTheme');
  if (!title || title.id !== 'titleTheme') {
    throw new Error("getTrackById failed to retrieve valid track");
  }

  console.log("✅ PASSED: Audio helper functions");
}

try {
  testCommonTracks();
  testHeroineThemes();
  testHelpers();
  console.log("\n--- All audio manifest tests completed successfully! ---\n");
} catch (err) {
  console.error(`\n❌ TEST FAILED: ${err.message}\n`);
  process.exit(1);
}
