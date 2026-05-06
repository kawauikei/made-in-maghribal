# Source Structure Notes

## Browser screen modules

- `browser/screens/turnResultScreen.js` owns the per-turn営業結果 screen, including result reveal timing, result comments, score graphs, displayed item log, and result-specific character expression switching.
- `browser/screens/endingScreen.js` owns the final ending screen only.

This split is organizational only. It should not change UI behavior, score logic, SFX/BGM behavior, or text content.
