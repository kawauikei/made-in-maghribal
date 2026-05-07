const test = require('node:test');
const assert = require('node:assert');

const {
  collectOpeningGalleryImagePaths,
  collectHeroineEventGalleryPaths,
  collectGalleryViewerImagePaths,
  collectSoundTestAudioPaths,
  collectAllBgmPaths
} = require('../../browser/utils/preloadAssets.js');
const { AUDIO_MANIFEST } = require('../../src/data/audioManifest.cjs');


test('C012_PRELOAD_ASSET_POLICY: opening gallery preload is common backgrounds only', () => {
  const paths = collectOpeningGalleryImagePaths();
  assert.ok(paths.length > 0, 'opening should include common background images from gallery manifest');
  assert.ok(paths.every((path) => path.startsWith('images/background/')), 'opening gallery images must stay common/background scoped');
  assert.ok(!paths.some((path) => path.includes('/still/')), 'opening must not preload heroine stills');
});

test('C012_PRELOAD_ASSET_POLICY: heroine selection includes selected heroine event stills', () => {
  const hakima = collectHeroineEventGalleryPaths('HAKIMA');
  const mira = collectHeroineEventGalleryPaths('MIRA');
  assert.ok(hakima.some((path) => path.includes('still_hakima_')), 'HAKIMA selection should include HAKIMA stills');
  assert.ok(!hakima.some((path) => path.includes('still_mira_')), 'HAKIMA selection should not include MIRA stills');
  assert.ok(mira.some((path) => path.includes('still_mira_')), 'MIRA selection should include MIRA stills');
});

test('C012_PRELOAD_ASSET_POLICY: gallery viewer can preload the full image catalog separately', () => {
  const opening = collectOpeningGalleryImagePaths();
  const gallery = collectGalleryViewerImagePaths();
  assert.ok(gallery.length > opening.length, 'viewer preload is allowed to be larger than opening preload');
  assert.ok(gallery.some((path) => path.includes('/still/')), 'viewer preload should include still images');
});

test('C012_PRELOAD_ASSET_POLICY: sound test preload includes all BGM and SE separately from opening preload', () => {
  const paths = collectSoundTestAudioPaths();
  assert.ok(paths.includes('audio/bgm/hakima/hakima01_theme.mp3'), 'sound test should preload heroine BGM');
  assert.ok(paths.includes('audio/se/clock_ticking_4.mp3'), 'sound test should preload SE catalog');
  assert.ok(paths.length > collectAllBgmPaths().length, 'sound test should include BGM plus SE');
  assert.strictEqual(paths.length, new Set(paths).size, 'sound test preload paths should be unique');
  assert.ok(Object.keys(AUDIO_MANIFEST.bgm.heroines).length >= 3, 'test sanity: heroine BGM groups exist');
});
