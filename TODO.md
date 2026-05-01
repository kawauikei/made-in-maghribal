# Project Status & TODO List (2026-05-01)

## 🟩 Recently Completed (Narrative Fidelity & UI Polish)

### [UI/UX] Interaction Visuals
- [x] **Centered Character Standing**: Character assets are now perfectly centered for better cinematic focus.
- [x] **Speaker Priority System**: Implemented logic where Heroine takes priority over Nadir during interactions.
- [x] **Smooth Transitions**: 0.6s cross-fade implemented for character arrivals/departures in `IntroScreen`.
- [x] **Floating Face Icon**: Redesigned `VNBox` nameplate with a scaled-down (60px) floating icon at the top-left corner.
- [x] **SFX Integration**: Added volume-scaled SFX (`quiz_wrong_sand_tap_01`) for character transitions.

### [Data] DailyTalk Standardization
- [x] **Expression Asset Sync**: Standardized all expression keys (`anger`, `surprise`, etc.) to match manifest.
- [x] **Narrative Flow Fix**: Implemented 4-part structure: Monologue -> Greeting -> Conversation -> Farewell.
- [x] **Audit Registry Update**: Enhanced `dailyTalks.test.js` to support new metadata and types.
- [x] **HTML Audit Report**: Automated report generation for narrative quality control.
- [x] Master Narrative Audit tool implementation (`tools/narrative_audit.js`)
- [x] Technical specifications for writers (`docs/master_narrative_report.html`)
- [x] Standardization of character roles (Visitor vs Employee)
- [x] Refinement of System Greetings
- [x] Expansion Phase 1: Connective content (market snacks, resin, preservation bottles)
- [x] Expansion Phase 2: Affection 5/10 short dialogues
- [x] Expansion Phase 3: Parallel world IF (long_history) pilot dialogues
- [x] DailyTalk Registry Data Integrity: Resolved duplicate ID conflicts and synchronized with Expansion 3 draft.

---

## 🟦 In Progress / Next Steps

### [Maintenance] Technical Debt & Polish
- [x] **Test Output Cleanup**: Refactor `saveData.test.cjs` to clarify the `SyntaxError` logs (Done: added log note).
- [ ] **Asset Preloading**: Ensure large standing images are cached/preloaded before transitions to prevent flicker.

---

## 🟧 Future Goals
- [ ] **Rhythm Game Implementation**: Visual prototype and core engine based on `docs/rhythm_ui_plan.md`.
- [ ] **Advanced Expression Library**: Adding more nuanced expressions (e.g., `blush`, `determined`).
- [ ] **Environmental Effects**: Subtle particles or lighting changes based on the time of day in Intro/Result screens.
- [ ] **Protagonist Customization**: Minor visual cues or choices that impact Nadir's starting monologues.
