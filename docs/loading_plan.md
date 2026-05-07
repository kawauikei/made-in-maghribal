# MadeInMaghribal Loading Plan

## Current preload policy

- Opening/title stage preloads only heroine `normal` images.
- Opening/title stage preloads common BGM/SE, but does not preload heroine-specific BGM.
- Heroine-specific expression images and heroine BGM files are handled by the heroine preload path.
- Result screen preloads result expression images before the rank reveal so expression switching does not visibly flicker.
- **Loading Overlay**: Heavy transitions (e.g., starting a new game, resuming from save, starting free play) now trigger a blocking UI overlay (`browser/ui/loadingOverlay.js`) while assets are preloaded.

## Current playback policy

- `browser/utils/bgmEngine.js` owns BGM playback, session-based track selection, fade out/in, user-gesture unlock, volume, and playback trim.
- `browser/utils/sfxEngine.js` owns SFX playback and user-gesture unlock.
- `browser/utils/preloadAssets.js` does not play audio. It only warms image/audio resources.
- `browser/ui/loadingOverlay.js` manages the "Loading..." UI state during `await`ed preloads.

## Later work

- Keep monitoring perceived startup tempo after heroine-specific preload calls were connected to explicit heroine ids.
- Continue using visual profiles for standing / face / result expression display.
