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
const { AUDIO_MANIFEST } = require('../data/audioManifest.cjs');

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

function compactUnique(values) {
  return [...new Set(values.filter(Boolean))];
}

function collectHeroineBgmPaths() {
  const heroines = AUDIO_MANIFEST?.bgm?.heroines || {};
  return Object.values(heroines).flatMap((entry) => {
    const paths = [];
    if (entry?.theme?.path) paths.push(entry.theme.path);
    if (Array.isArray(entry?.game)) {
      entry.game.forEach((track) => {
        if (track?.path) paths.push(track.path);
      });
    }
    if (entry?.ending?.normal?.path) paths.push(entry.ending.normal.path);
    if (entry?.ending?.good?.path) paths.push(entry.ending.good.path);
    return paths;
  });
}

function createAssetPreloader() {
  const imageCache = new Map();
  const audioCache = new Map();
  const linkCache = new Set();
  let openingStarted = false;
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
    if (!path) return;
    if (audioCache.has(path)) return;

    appendAudioPreloadLink(path);
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = path;
      audio.load();
      audioCache.set(path, audio);
    } catch (e) {
      audioCache.set(path, null);
    }
  }

  function preloadAudioPaths(paths) {
    compactUnique(paths).forEach(preloadAudio);
  }

  function preloadOpeningAssets() {
    if (openingStarted) return;
    openingStarted = true;

    // 開幕はヒロインnormal画像だけ。個別BGMはまだ読まない。
    const normalImagePaths = HEROINE_IDS.flatMap((id) => [
      getCharacterVisualImagePath(id, 'normal', 'standing'),
      getCharacterVisualImagePath(id, 'normal', 'face')
    ]);
    preloadImages(normalImagePaths);
  }

  function preloadHeroineSelectAssets() {
    if (heroineSelectStarted) return;
    heroineSelectStarted = true;

    const heroineImagePaths = HEROINE_IDS.flatMap((id) => (
      HEROINE_EXPRESSIONS.flatMap((expression) => [
        getCharacterVisualImagePath(id, expression, 'standing'),
        getCharacterVisualImagePath(id, expression, 'face')
      ])
    ));
    preloadImages(heroineImagePaths);
    preloadAudioPaths(collectHeroineBgmPaths());
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
      heroineSelectStarted
    };
  }

  return {
    preloadImage,
    preloadImages,
    preloadAudio,
    preloadAudioPaths,
    preloadOpeningAssets,
    preloadHeroineSelectAssets,
    preloadResultExpressions,
    getStats
  };
}

module.exports = {
  createAssetPreloader
};
