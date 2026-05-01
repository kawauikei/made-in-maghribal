# Project Status & TODO List (2026-05-01)

## 🟩 Recently Completed (Narrative Fidelity & UI Polish)

### [UX] M-VN-SKIP-1: Narrative Skip Implementation (MVP)
- [x] **Instant Block Skip**: Implemented 0.3s black-fade skip logic with safety input guards.
- [x] **Header UI Standardization**: Symmetrical alignment of Nameplate and SKIP button with zero text overlap.
- [x] **Character Display Priority**: Fixed standing image switching to prioritize heroine presence during dialogue.
- [x] **Typewriter Completion**: Single tap/click reveals full text; second proceeds to next page.

### [Data] DailyTalk Expansion & Integrity
- [x] Expansion Phase 1-3 (55 talks total), Technical Audit Tool, Registry Sync.

---

## 🟥 Top Priority: Conversation Accessibility

### [UX] M-VN-HISTORY-1: Backlog / Log Implementation
- [ ] **Backlog Storage**: Capture and persist conversation history within the current session.
- [ ] **Log Modal UI**: Refine the "Log" view to show speaker names, icons, and text history clearly.
- [ ] **Accessibility**: Ensure the "Log" button is functional in all narrative-heavy screens (Prologue, Intro, Events).

## 🟦 In Progress / Next Steps

### [Maintenance] Technical Debt & Polish
- [x] **M-UI-TRANSITION-POLISH**: Implemented staggered entrance sequence for Quiz screen (Bubble -> Beat Lane -> Choices).
- [ ] **Asset Preloading**: Implement preloading for large character standing images to prevent transition flicker.

### [Rhythm] Game Foundation (M-RHYTHM-UI-1)
- [ ] **M-RHYTHM-UI-1**: Visual beat display (Pulse enhancements) and animated note-like markers in the lane.
- [ ] **M-RHYTHM-UI-CONT**: Layout/Margin adjustments for various aspect ratios.
- [ ] **Advanced Expression Library**: Adding more nuanced expressions (e.g., `blush`, `determined`).
- [ ] **Environmental Effects**: Subtle particles or lighting changes based on the time of day.
- [ ] **Protagonist Customization**: Visual cues or choices that impact Nadir's starting monologues.
