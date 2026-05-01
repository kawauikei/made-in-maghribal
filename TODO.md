# Project Status & TODO List (2026-05-01)

## 🟩 Recently Completed (Narrative Fidelity & UI Polish)

### [UI/UX] Interaction Visuals
- [x] **RESULT UI Reconstruction (M-RESULT-UI-RECONSTRUCTION)**: Rebuilt result screen as a full-screen UI with large heroine standing images and centralized score panels.
- [x] **Still Event Face-Aware Centering (Infrastructure)**: Added `stillCrop` metadata support and audit tools. (Note: Infrastructure remains but expansion is superseded by 3:4 asset policy).
- [x] **Still Event UI Refine (C-1)**: Replaced cramped framed layout with cinematic full-screen presentation.
- [x] **Expression Cross-fade (B-2)**: 0.2s cross-fade for standing images and face icons.
- [x] **StillCrop Audit Report**: `tools/still_crop_audit.js` for visual verification.
- [x] **QUIZ Screen Redesign (B-1)**: Full-screen background and full-width rhythm lane band.
- [x] **Header Alignment (A-4)**: Headings anchored top-left.
- [x] **HUD Simplification (A-3)**: Removed "Current Bond" label; color-coded route indicators.

### [Data/Logic] Core Systems
- [x] **DailyTalk Registry & Pool**: Standardized narrative flow and implemented registry for randomized talks.
- [x] **Audio Start Gate**: Fixed BGM triggering to ensure user interaction before audio starts.
- [x] **VNBox Layout Stability**: Anchored hint icons and indicators to prevent layout shifts.

---

## 🟦 In Progress / Next Steps

1. **3:4 Asset Final Verification**
   - Verify BG / STILL / Gallery / Event displays after 3:4 asset replacement.
   - Maintain `audit:stills` reports to ensure no broken references.

2. **Narrative Edit Pack Operation**
   - Continue workflow with World-Building AI for script refinement.
   - Run integrity tests (`dailyTalks.test`) after imports.

3. **SaveData expected-error log cleanup**
   - Refactor `saveData.test.cjs` to suppress/clarify expected `SyntaxError` logs.

---

## 🟥 Superseded / Cancelled

### [UI/UX] Still Event Cropping (Wide-to-Tall)
- [ ] **Full Still Event Cropping**: CANCELLED.
- [ ] **Face Detection Assistant**: CANCELLED.
- **Reason**: The project has shifted to a **3:4 Asset Replacement Policy**. Instead of trying to crop wide 16:9 images for a 3:4 screen, we are replacing assets with native 3:4 compositions.
- **Status of Infrastructure**: `stillCrop` metadata, `heroine_pan` logic, and `audit:stills` tools remain in the codebase for maintenance and backward compatibility, but will not be expanded.

---

## 🟧 Future Goals
- [ ] **M-UI-VN-HEROINE-FADE**: Add heroine departure animations (Priority B).
- [ ] **M-QUIZ-PROMPT-TUNING**: Ongoing wording and difficulty balance.
- [ ] **Rhythm Game Implementation**: Visual prototype and core engine (Deferred).
- [ ] **Advanced Expression Library**: Nuanced expressions like `blush`.
- [ ] **Environmental Effects**: Subtle particles or lighting changes.
