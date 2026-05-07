/**
 * Lightweight asset preloader for MadeInMaghribal.
 *
 * This does not play audio. It only asks the browser to warm image/audio data.
 * Policy:
 * - Opening/title: preload only heroine normal images. No heroine-specific BGM.
 * - Heroine select: preload heroine expression images and heroine BGM files.
 * - Result: preload expression images before rank reveal to avoid visible flicker.
 */

const { getCharacterVisualImagePath } = require('./assetPaths.js');
let AUDIO_MANIFEST;
try {
  ({ AUDIO_MANIFEST } = require('../data/audioManifest.cjs'));
} catch (error) {
  // Node tests load this browser module directly, while the browser bundler
  // aliases src/data as ./data. Keep both paths valid.
  ({ AUDIO_MANIFEST } = require('../../src/data/audioManifest.cjs'));
}
const { GALLERY_MANIFEST } = require('../data/galleryManifest.js');
let EVENT_MANIFEST, EVENT_SCRIPTS;
try {
  ({ EVENT_MANIFEST } = require('../data/generated/eventManifest.cjs'));
  ({ EVENT_SCRIPTS } = require('../data/generated/eventScripts.cjs'));
} catch (error) {
  try {
    ({ EVENT_MANIFEST } = require('../../src/data/generated/eventManifest.cjs'));
    ({ EVENT_SCRIPTS } = require('../../src/data/generated/eventScripts.cjs'));
  } catch (e) {
    EVENT_MANIFEST = [];
    EVENT_SCRIPTS = {};
  }
}

const HEROINE_IDS = ['HAKIMA', 'MIRA', 'DARIYA'];
const HEROINE_EXPRESSIONS = [
  'normal',
  'joy',
  'fun',
  'anger',
  'cry',
  'sorrow',
  'surprise',
  'maid',
  'social',
  'student'
];
const RESULT_EXPRESSIONS = ['normal', 'sorrow', 'fun', 'joy'];
const GAME_START_EXPRESSIONS = ['normal'];

function compactUnique(values) {
  return [...new Set(values.filter(Boolean))];
}


function getGalleryItems() {
  return Array.isArray(GALLERY_MANIFEST) ? GALLERY_MANIFEST : [];
}

function collectGalleryImagePaths(predicate) {
  return getGalleryItems()
    .filter((item) => item && item.path && (!predicate || predicate(item)))
    .map((item) => item.path);
}

function collectOpeningGalleryImagePaths() {
  // Common backgrounds are safe opening assets. Heroine-specific stills remain in Stage B.
  return collectGalleryImagePaths((item) => item.sourceType === 'background' || item.category === '背景');
}

function collectHeroineEventGalleryPaths(heroineId) {
  const id = String(heroineId || '').toUpperCase();
  const lower = id.toLowerCase();
  // We keep the old manual logic as a baseline, but the new collectHeroineEventAssetPaths
  // handles the DSL-driven collection.
  return collectGalleryImagePaths((item) => {
    return item.imageKind === 'still' && (item.heroineId === id || (item.id || '').includes(lower));
  });
}

/**
 * Finds audio path by ID in the multi-layered AUDIO_MANIFEST.
 */
function findAudioPathById(id, type) {
  if (!AUDIO_MANIFEST) return null;
  
  if (type === 'bgm') {
    // System
    if (AUDIO_MANIFEST.bgm.system) {
      const found = AUDIO_MANIFEST.bgm.system.find(b => b.id === id);
      if (found) return found.path;
    }
    // Heroines
    if (AUDIO_MANIFEST.bgm.heroines) {
      for (const heroine of Object.values(AUDIO_MANIFEST.bgm.heroines)) {
        if (heroine.theme && heroine.theme.id === id) return heroine.theme.path;
        if (heroine.game) {
          const found = heroine.game.find(b => b.id === id);
          if (found) return found.path;
        }
        if (heroine.ending) {
          for (const b of Object.values(heroine.ending)) {
            if (b.id === id) return b.path;
          }
        }
      }
    }
    // Extra
    if (AUDIO_MANIFEST.bgm.extra) {
      const found = AUDIO_MANIFEST.bgm.extra.find(b => b.id === id);
      if (found) return found.path;
    }
  } else if (type === 'se') {
    if (AUDIO_MANIFEST.se) {
      for (const category of Object.values(AUDIO_MANIFEST.se)) {
        const found = category.find(s => s.id === id);
        if (found) return found.path;
      }
    }
  }
  return null;
}

/**
 * Traverses event scripts for a specific heroine to find all required assets.
 */
function collectHeroineEventAssetPaths(heroineId) {
  const images = [];
  const audio = [];
  
  if (!EVENT_MANIFEST || !EVENT_SCRIPTS) return { images, audio };

  // Find events for this heroine
  const heroineEvents = EVENT_MANIFEST.filter(ev => ev.heroineId === heroineId);
  
  heroineEvents.forEach(ev => {
    const script = EVENT_SCRIPTS[ev.id];
    if (!script) return;
    
    script.forEach(step => {
      if (step.type === 'bg' || step.type === 'still') {
        const item = GALLERY_MANIFEST.find(i => i.id === step.id);
        if (item && item.path) images.push(item.path);
      } else if (step.type === 'bgm') {
        const path = findAudioPathById(step.id, 'bgm');
        if (path) audio.push(path);
      } else if (step.type === 'sfx') {
        const path = findAudioPathById(step.id, 'se');
        if (path) audio.push(path);
      }
    });
  });
  
  return { images: compactUnique(images), audio: compactUnique(audio) };
}

function collectGalleryViewerImagePaths() {
  return collectGalleryImagePaths();
}


function collectCommonBgmPaths() {
  const bgm = AUDIO_MANIFEST?.bgm || {};
  const paths = [];
  (bgm.system || []).forEach((track) => { if (track?.path) paths.push(track.path); });
  (bgm.extra || []).forEach((track) => { if (track?.path) paths.push(track.path); });
  return paths;
}

function collectSePaths() {
  const se = AUDIO_MANIFEST?.se || {};
  const paths = [];
  Object.values(se).forEach((group) => {
    if (Array.isArray(group)) group.forEach((track) => { if (track?.path) paths.push(track.path); });
  });
  return paths;
}


function collectAllBgmPaths() {
  const bgm = AUDIO_MANIFEST?.bgm || {};
  const paths = [...collectCommonBgmPaths()];
  Object.values(bgm.heroines || {}).forEach((entry) => {
    if (entry?.theme?.path) paths.push(entry.theme.path);
    if (Array.isArray(entry?.game)) entry.game.forEach((track) => { if (track?.path) paths.push(track.path); });
    Object.values(entry?.ending || {}).forEach((track) => { if (track?.path) paths.push(track.path); });
  });
  return compactUnique(paths);
}

function collectSoundTestAudioPaths() {
  return compactUnique([...collectAllBgmPaths(), ...collectSePaths()]);
}

function collectHeroineBgmPaths(heroineId) {
  const entry = AUDIO_MANIFEST?.bgm?.heroines?.[heroineId] || null;
  if (!entry) return [];
  const paths = [];
  if (entry?.theme?.path) paths.push(entry.theme.path);
  if (Array.isArray(entry?.game)) {
    entry.game.forEach((track) => { if (track?.path) paths.push(track.path); });
  }
  if (entry?.ending?.normal?.path) paths.push(entry.ending.normal.path);
  if (entry?.ending?.good?.path) paths.push(entry.ending.good.path);
  if (entry?.ending?.secret?.path) paths.push(entry.ending.secret.path);
  return paths;
}

function createAssetPreloader() {
  const imageCache = new Map();
  const audioCache = new Map();
  let openingPromise = null;
  let heroineSelectStarted = false;

  function preloadImage(src) {
    if (!src) return Promise.resolve(false);
    if (imageCache.has(src)) return imageCache.get(src).promise;

    const record = { src, status: 'loading', promise: null };
    record.promise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        record.status = 'loaded';
        resolve(true);
      };
      img.onerror = () => {
        record.status = 'error';
        resolve(false);
      };
      img.src = src;
    });

    imageCache.set(src, record);
    return record.promise;
  }

  function preloadImages(srcs) {
    return Promise.all(compactUnique(srcs).map(preloadImage));
  }


  function preloadAudio(path) {
    if (!path) return Promise.resolve(false);
    if (audioCache.has(path)) {
      const entry = audioCache.get(path);
      return entry instanceof Promise ? entry : Promise.resolve(true);
    }

    const promise = new Promise((resolve) => {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        // Resolve on canplaythrough or error to avoid blocking forever on network issues
        const onReady = () => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('error', onError);
          resolve(true);
        };
        const onError = () => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('error', onError);
          resolve(false);
        };
        audio.addEventListener('canplaythrough', onReady);
        audio.addEventListener('error', onError);
        audio.src = path;
        audio.load();
        // We store the audio object to keep it warmed, but return the promise for the caller
        audioCache.set(path, audio);
      } catch (e) {
        resolve(false);
      }
    });

    // We can also store the promise to avoid duplicate loads
    // For simplicity in this implementation, we'll just return it.
    return promise;
  }

  function preloadAudioPaths(paths) {
    return Promise.all(compactUnique(paths).map(preloadAudio));
  }

  function preloadOpeningAssets() {
    if (openingPromise) return openingPromise;

    // 初期ロードは全ヒロインの顔アイコン全量とnormal立ち絵だけに限定する。
    // 個別ヒロインBGMとnormal以外の立ち絵は、ヒロイン選択後まで読まない。
    const startImagePaths = [
      'images/ui/item.webp',
      ...collectOpeningGalleryImagePaths(),
      ...HEROINE_IDS.flatMap((id) => ([
        ...HEROINE_EXPRESSIONS.map((expression) => getCharacterVisualImagePath(id, expression, 'face')),
        ...GAME_START_EXPRESSIONS.map((expression) => getCharacterVisualImagePath(id, expression, 'standing'))
      ]))
    ];
    
    // 開幕に必要なシステムBGMと全SEを確実に待つ
    openingPromise = Promise.all([
      preloadAudioPaths([...collectCommonBgmPaths(), ...collectSePaths()]),
      preloadImages(startImagePaths)
    ]);
    return openingPromise;
  }

  function preloadHeroineSelectAssets(heroineId) {
    const id = HEROINE_IDS.includes(heroineId) ? heroineId : null;
    if (!id) return Promise.resolve([]);
    heroineSelectStarted = true;

    const eventAssets = collectHeroineEventAssetPaths(id);

    const heroineImagePaths = [
      ...collectHeroineEventGalleryPaths(id),
      ...eventAssets.images,
      ...HEROINE_EXPRESSIONS.flatMap((expression) => [
        getCharacterVisualImagePath(id, expression, 'standing'),
        getCharacterVisualImagePath(id, expression, 'face')
      ])
    ];
    
    return Promise.all([
      preloadAudioPaths([...collectHeroineBgmPaths(id), ...eventAssets.audio]),
      preloadImages(heroineImagePaths)
    ]);
  }

  function preloadResultExpressions(heroineId, resultExpression) {
    const heroineExpressions = compactUnique([...RESULT_EXPRESSIONS, resultExpression]);
    const imagePaths = [
      ...heroineExpressions.map((expression) => getCharacterVisualImagePath(heroineId, expression, 'standing')),
      ...heroineExpressions.map((expression) => getCharacterVisualImagePath(heroineId, expression, 'face')),
      ...heroineExpressions.map((expression) => getCharacterVisualImagePath('NADIR', expression, 'face'))
    ];
    return preloadImages(imagePaths);
  }


  function preloadGalleryViewerAssets() {
    return preloadImages(collectGalleryViewerImagePaths());
  }

  function preloadSoundTestAssets() {
    return preloadAudioPaths(collectSoundTestAudioPaths());
  }

  function getStats() {
    const imageStats = { loading: 0, loaded: 0, error: 0 };
    imageCache.forEach((record) => {
      imageStats[record.status] = (imageStats[record.status] || 0) + 1;
    });
    return {
      images: imageStats,
      audio: audioCache.size,
      links: 0,
      openingStarted: Boolean(openingPromise),
      heroineSelectStarted,
      galleryItems: getGalleryItems().length
    };
  }

  return {
    preloadImage,
    preloadImages,
    preloadAudio,
    preloadAudioPaths,
    preloadOpeningAssets,
    preloadHeroineSelectAssets,
    preloadGalleryViewerAssets,
    preloadSoundTestAssets,
    preloadResultExpressions,
    getStats
  };
}

module.exports = {
  createAssetPreloader,
  collectOpeningGalleryImagePaths,
  collectHeroineEventGalleryPaths,
  collectGalleryViewerImagePaths,
  collectSoundTestAudioPaths,
  collectAllBgmPaths
};
