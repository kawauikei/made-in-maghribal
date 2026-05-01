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
- [x] **Master Narrative Audit**: Consolidated audit tool (`tools/narrative_audit.js`) covering Greetings, Events, and Endings.
- [x] **Writer Technical Specs**: Integrated system constraints (expression keys, narrative flow, display rules) into the audit report.

---

## 🟦 In Progress / Next Steps

### [Content] DailyTalk Phase 1 Expansion
- [ ] **Affection 5/10 Short Exchanges**: Add 1-2 short exchanges per heroine to bridge the relationship gap.
- [ ] **Long History Introduction**: Add 1 parallel-world dialogue per heroine as a pilot for the IF route.
- [ ] **Transition Dialogues**: Refine "monologue" and "response" variations to improve daily flavor.

### [Maintenance] Technical Debt & Polish
- [ ] **Test Output Cleanup**: Refactor `saveData.test.cjs` to suppress/clarify the `SyntaxError` logs during corrupted JSON test cases (currently PASSING, but confusing).
- [ ] **Asset Preloading**: Ensure large standing images are cached/preloaded before transitions to prevent flicker.

---

## 🟧 Future Goals
- [ ] **Rhythm Game Implementation**: Visual prototype and core engine based on `docs/rhythm_ui_plan.md`.
- [ ] **Advanced Expression Library**: Adding more nuanced expressions (e.g., `blush`, `determined`).
- [ ] **Environmental Effects**: Subtle particles or lighting changes based on the time of day in Intro/Result screens.
- [ ] **Protagonist Customization**: Minor visual cues or choices that impact Nadir's starting monologues.
