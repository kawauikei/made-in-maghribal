/**
 * Per-character visual profiles for MadeInMaghribal.
 *
 * The source image folders stay small:
 * - standing_proc: full character artwork
 * - face_proc: small UI / speaker icons
 *
 * Bust-up and close-up displays are not separate image assets. They are visual
 * modes that crop/scale the standing artwork through this profile.
 */

const DEFAULT_THEME = {
  primary: '#f6d36b',
  secondary: '#d68a35',
  textStroke: 'rgba(74, 42, 12, 0.45)',
  stampFont: '"Yu Mincho", "Hiragino Mincho ProN", serif'
};

const DEFAULT_VISUAL_MODE = {
  image: 'standing',
  scale: 1,
  x: 0,
  y: 0,
  bottom: 0,
  height: 520
};

const DEFAULT_ICON_MODE = {
  image: 'face',
  scale: 1,
  x: 50,
  y: 50
};

const DEFAULT_PROFILE = {
  theme: DEFAULT_THEME,
  standing: { ...DEFAULT_VISUAL_MODE, height: 980, bottom: 0 },
  heroineSelect: { ...DEFAULT_VISUAL_MODE, height: 520, bottom: -86 },
  bustup: { ...DEFAULT_VISUAL_MODE, height: 660, bottom: -260, scale: 1.45 },
  eventClose: { ...DEFAULT_VISUAL_MODE, height: 700, bottom: -300, scale: 1.62 },
  result: { ...DEFAULT_VISUAL_MODE, height: 900, bottom: -20, scale: 1.3, x: -80 },
  selectIcon: DEFAULT_ICON_MODE,
  speakerIcon: DEFAULT_ICON_MODE
};

const CHARACTER_VISUAL_PROFILES = {
  MIRA: {
    theme: { primary: '#6fd7ff', secondary: '#2d91d0', textStroke: 'rgba(16, 67, 105, 0.50)', stampFont: '"Klee", "Hannotate SC", "Hiragino Maru Gothic ProN", "Yu Gothic", cursive' },
    // All modes use default standardized values
  },
  HAKIMA: {
    theme: { primary: '#ffd86c', secondary: '#e58a2f', textStroke: 'rgba(98, 55, 12, 0.52)', stampFont: '"UD Digi Kyokasho N-R", "Yu Mincho", "Hiragino Mincho ProN", serif' },
    // All modes use default standardized values
  },
  DARIYA: {
    theme: { primary: '#ff6d9b', secondary: '#b83363', textStroke: 'rgba(85, 13, 45, 0.55)', stampFont: '"Yu Mincho", "Hiragino Mincho ProN", "HGS明朝E", serif' },
    // All modes use default standardized values
  },
  NADIR: {
    theme: { primary: '#f4c267', secondary: '#3d83c9', textStroke: 'rgba(35, 49, 84, 0.50)', stampFont: '"Yu Gothic", "Hiragino Sans", system-ui, sans-serif' },
    // All modes use default standardized values
  }
};

function normalizeCharacterId(id) {
  if (!id) return '';
  return String(id).replace(/^CH_/i, '').toUpperCase();
}

function mergeMode(base, override) {
  return { ...(base || {}), ...(override || {}) };
}

function getCharacterTheme(id) {
  const normalized = normalizeCharacterId(id);
  const profile = CHARACTER_VISUAL_PROFILES[normalized] || {};
  return { ...DEFAULT_THEME, ...(profile.theme || {}) };
}

function getCharacterVisualProfile(id, mode = 'standing') {
  const normalized = normalizeCharacterId(id);
  const profile = CHARACTER_VISUAL_PROFILES[normalized] || {};
  const defaultMode = DEFAULT_PROFILE[mode] || DEFAULT_PROFILE.standing;
  const characterMode = profile[mode] || profile.standing;
  
  // If the character object doesn't define the mode, it will naturally use fallback.
  // We check if the profile has the mode explicitly.
  if (profile[mode]) {
    return mergeMode(defaultMode, profile[mode]);
  }
  return defaultMode;
}

function applyCharacterVisualProfile(el, id, mode = 'standing') {
  if (!el) return;
  const profile = getCharacterVisualProfile(id, mode);

  el.dataset.visualMode = mode;
  el.dataset.visualImage = profile.image || 'standing';

  el.style.setProperty('--char-scale', String(profile.scale ?? 1));
  el.style.setProperty('--char-x', `${profile.x ?? 0}px`);
  el.style.setProperty('--char-y', `${profile.y ?? 0}px`);
  el.style.setProperty('--char-bottom', `${profile.bottom ?? 0}px`);
  el.style.setProperty('--char-height', `${profile.height ?? 520}px`);

  // Backward-compatible aliases for existing icon rules.
  el.style.setProperty('--char-face-scale', String(profile.scale ?? 1));
  el.style.setProperty('--icon-x', `${profile.x ?? 50}%`);
  el.style.setProperty('--icon-y', `${profile.y ?? 50}%`);
}

function applyCharacterTheme(el, id) {
  if (!el) return;
  const theme = getCharacterTheme(id);
  el.style.setProperty('--heroine-theme-primary', theme.primary);
  el.style.setProperty('--heroine-theme-secondary', theme.secondary);
  el.style.setProperty('--heroine-theme-stroke', theme.textStroke);
  el.style.setProperty('--heroine-stamp-font', theme.stampFont || DEFAULT_THEME.stampFont);
}

module.exports = {
  CHARACTER_VISUAL_PROFILES,
  getCharacterVisualProfile,
  getCharacterTheme,
  applyCharacterVisualProfile,
  applyCharacterTheme,
  normalizeCharacterId
};
