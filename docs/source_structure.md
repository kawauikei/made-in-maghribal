# Source Structure Notes

## Browser screen modules

- `browser/screens/turnResultScreen.js` owns the per-turn営業結果 screen, including result reveal timing, result comments, score graphs, displayed item log, and result-specific character expression switching.
- `browser/screens/endingScreen.js` owns the final ending screen only.

This split is organizational only. It should not change UI behavior, score logic, SFX/BGM behavior, or text content.

## Browser controller modules

- `browser/controllers/typewriterController.js` owns text reveal timers and finish/clear behavior.
- `browser/controllers/turnTransitionController.js` owns turn transition overlays, tick timers, and skip handling.
- `browser/controllers/inputController.js` owns document-level select/drag/click bindings and delegates actions back to `GameController`.

These controller splits are behavior-preserving extractions from `browser/app.js`.

## Generated and large data

- `src/data/generated/rhythmNoteMaps.cjs` is generated data and should not be hand-edited.
- Large item text/display-name data should be split or regenerated only with a clear source-of-truth plan.
- `public/bundle.js` and `public/style.css` are build outputs generated from `browser/` and `src/` sources.
