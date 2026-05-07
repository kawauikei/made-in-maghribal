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
  return collectGalleryImagePaths((item) => {
    if (item.sourceType === 'background' || item.category === '背景') return true;
    if (item.heroineId && String(item.heroineId).toUpperCase() === id) return true;
    const key = `${item.id || ''} ${item.path || ''} ${item.title || ''}`.toLowerCase();
    return Boolean(lower && key.includes(lower));
  });
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
  const linkCache = new Set();
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

  function appendAudioPreloadLink(path) {
    if (!path || linkCache.has(path) || typeof document === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'audio';
    link.href = path;
    document.head.appendChild(link);
    linkCache.add(path);
  }

  function preloadAudio(path) {
    if (!path) return Promise.resolve(false);
    if (audioCache.has(path)) {
      const entry = audioCache.get(path);
      return entry instanceof Promise ? entry : Promise.resolve(true);
    }

    appendAudioPreloadLink(path);
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

    const heroineImagePaths = [
      ...collectHeroineEventGalleryPaths(id),
      ...HEROINE_EXPRESSIONS.flatMap((expression) => [
        getCharacterVisualImagePath(id, expression, 'standing'),
        getCharacterVisualImagePath(id, expression, 'face')
      ])
    ];
    
    return Promise.all([
      preloadAudioPaths(collectHeroineBgmPaths(id)),
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
      links: linkCache.size,
      openingStarted,
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
