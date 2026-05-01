# Project Status & TODO List (2026-05-01)

## 🟩 Recently Completed (Narrative Fidelity & UI Polish)

### [UX] M-VN-SKIP-1: Narrative Skip Implementation (MVP)
- [x] **Instant Block Skip**: Implemented 0.3s black-fade skip logic with safety input guards.
- [x] **Header UI Standardization**: Symmetrical alignment of Nameplate and SKIP button.
- [x] **Character Display Priority**: Prioritize heroine presence during dialogue.
- [x] **Typewriter Completion**: Single tap reveals full text; second proceeds.

### [Data] Narrative Edit Pack (M-NARRATIVE-EDIT-PACK-1)
- [x] **Export/Import MVP**: CLI tools for safe narrative editing via Markdown.
- [x] **Validation Layer**: Guard against ID/Metadata breakage during import.

### [Maintenance] Technical Debt & Polish
- [x] **M-UI-TRANSITION-POLISH**: Staggered entrance sequence for Quiz screen.

---

## 🟥 Top Priority: UI Polish & Accessibility (Phase A)

### [UX] M-VN-HISTORY-1: Backlog / Log Implementation
- [ ] **Backlog Storage**: Capture and persist conversation history.
- [ ] **Log Modal UI**: Show speaker names, icons, and text history.
- [ ] **Accessibility**: Ensure "Log" button is functional in all narrative screens.

### [Polish] UI Consistency & Cleanup (Priority A)
- [ ] **[RESULT] Clean UI**: Remove SKIP / FINISH buttons from score screens.
- [ ] **[EVENT] Standardize UI**: Use Standing Image + VNBox for regular events (consistent with Intro).
- [ ] **[UI] Route Indicator**: Remove text "Current Bond" label; use button background colors (Normal: White, Long: Pink).
- [ ] **[UI] Top-Left Alignment**: Align all screen headers (INTRO, EVENT, RESULT, QUIZ, ENDING) to top-left.

---

## 🟦 Next Steps: Visual & Experience Depth (Phase B)

### [Polish] Layout & Animation (Priority B)
- [ ] **[QUIZ] Background Expansion**: Shop background to full screen (Rhythm lane as horizontal band).
- [ ] **[RESULT] UI Overhaul**: Full-screen layout, Nadir/Heroine on flanks, center-aligned stats.
- [ ] **[VN] Expression Fade**: Implement 0.2s cross-fade for expression changes.

### [Maintenance]
- [ ] **Asset Preloading**: Preload large character images to prevent transition flicker.

---

## ⬛ Later / Future (Phase C+)

### [Still] Still Event Improvements (Priority C)
- [ ] **Larger Display**: Maximize still image area.
- [ ] **Optimal Cropping**: Use CSS object-position/fit or manual metadata for better framing.

### [Rhythm] Game Foundation
- [ ] **M-RHYTHM-UI-1**: Visual beat pulse and animated note markers.
- [ ] **Advanced Expressions**: Blush, determined, etc.
- [ ] **Environmental Effects**: Lighting/particles based on time of day.
