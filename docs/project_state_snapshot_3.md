# Made in Maghribal / P0007 Project State Snapshot

**Snapshot Date:** 2026-05-02  
**Snapshot ID:** M-DOCS-PROJECT-STATE-SNAPSHOT-3  
**Status:** ✅ STABLE

---

## Git State

| Repository | Commit | Status | Remote |
|------------|--------|--------|--------|
| **Root** | `2db6a0f` | ✅ clean | ✅ pushed |
| **Public** | `233aa7c` | ✅ clean | ✅ pushed |

---

## Build & Test Status

### Tests
```
✅ Quiz Engine: 8/8 PASSED
✅ Management Logic: 5/5 PASSED
✅ Data Integrity: 2/2 PASSED
✅ Audio Manifest: 4/4 PASSED
✅ SFX Manifest: 2/2 PASSED
✅ Save Logic: 29/29 PASSED
✅ Event System: 35/35 PASSED (including 6 new intro prioritization tests)
✅ Image Assets: 6/6 PASSED
✅ DailyTalk Audit: PASSED (119 entries)
✅ Result Comments: PASSED (24 entries)

TOTAL: 137/137 PASSED
```

### Build
```
✅ vite build: Success (276ms)
✅ main.js: 486.26 kB (gzip: 132.01 kB)
✅ Cache-busting: Updated (version 2db6a0f)
```

---

## Key Data Counts

### DailyTalk Registry
| Metric | Count |
|--------|-------|
| **Total entries** | 119 |
| By timing | intro: 65, after_result: 28, day_end: 26 |
| By scope | common: 39, heroine: 80 |
| By heroine | hakima: 26, mira: 26, dariya: 28 |
| routeMode | long_history: 29, both: 90 |

### Event System
| Event Type | Count | Notes |
|------------|-------|-------|
| flashback_intro | 3 | hakima_0, mira_0, dariya_0 |
| affection (_5) | 3 | Threshold 5 |
| affection (_10) | 3 | Threshold 10 |
| affection (_long_) | 6 | long_history route |
| route_climax | 3 | Route ending |

### Image Assets
| Type | Count |
|------|-------|
| Backgrounds | 10+ |
| Still images | 20+ |
| Heroine expressions | 10 × 3 heroines |

### Audio
| Type | Count |
|------|-------|
| BGM tracks | 20+ |
| SFX | 6 |

---

## Completed Tasks (2026-05-02)

### EVENT / MEMORIES Presentation
| Task | Status | Root Commit |
|------|--------|-------------|
| M-EVENT-PRESENTATION-FIX-5 | ✅ Complete | `d795f8e` |
| M-EVENT-PRESENTATION-FIX-6 | ✅ Complete | `8469e7a` |
| M-EVENT-PRESENTATION-FIX-7 | ✅ Complete | `8389149` |
| **M-EVENT-PRESENTATION-STABILIZE-1** | ✅ **Complete** | **`6ddeaad`** |

**Key Outcomes:**
- EVENT central standing = heroine fixed (no Nader)
- flashback_intro uses background-based visibility
- Curtain slide: 650ms/120ms/450ms = 1220ms
- Policy documented in `docs/event_presentation_stabilize.md`

### DailyTalk System
| Task | Status | Root Commit |
|------|--------|-------------|
| M-DAILYTALK-HEROINE-FILTER-1 | ✅ Complete | `4b45ce8` |
| M-DAILYTALK-NADIR-PRESENCE-2 | ✅ Complete | `cfbb270` |
| M-DAILYTALK-NADIR-EXPANSION-1 | ✅ Complete | `fe619f5` |
| M-SCENARIO-DAILYTALK-EXPAND-3 | ✅ Complete | `2b5b5eb` |
| M-SCENARIO-DAILYTALK-EXPAND-4 | ✅ Complete | `3d8f3ed` |
| **M-DAILYTALK-INTRO-RANDOMNESS-FIX-1** | ✅ **Complete** | **`ea04319`** |

**Key Outcomes:**
- getIntroTalks() prioritizes heroine-specific talks
- common/Nader intro only as fallback
- Nader standing display in DAILY_TALK fixed
- 119 total entries (from initial ~60)

### UI / Header
| Task | Status | Root Commit |
|------|--------|-------------|
| M-UI-HEADER-FORMAT-1 | ✅ Complete | `99962d4` |
| M-UI-HEADER-FORMAT-2 | ✅ Complete | `029f7a8` |
| M-QUIZ-HEADER-FORMAT-1 | ✅ Complete (survey only) | N/A |
| M-DAILYTALK-HEADER-SAFETY-REVIEW-1 | ✅ Complete (deferred) | N/A |

**Key Outcomes:**
- ScreenHeader applied to INTRO/EVENT/DAY_END
- QUIZ maintains separate QuizHeader
- DAILY_TALK header changes deferred (risk assessment)

### Data Cleanup
| Task | Status | Root Commit |
|------|--------|-------------|
| M-COPY-OUTER-QUOTE-CLEANUP-1 | ✅ Complete | `1d1698b` |
| M-DAILYTALK-AUDIT-REVIEW-1 | ✅ Complete | `0172d41` |

---

## Design Principles (Active Constraints)

### Absolute Rules
- ❌ No image generation
- ❌ No new asset creation
- ❌ ResultScreen: Do not modify
- ❌ DailyTalk runtime: Do not modify lightly
- ❌ EVENT/Nader central standing: Do not reintroduce
- ❌ routeMode filter: Do not modify lightly
- ✅ `nader` is correct, `nadir` is incorrect

### Architectural Decisions

**EVENT / MEMORIES:**
- Central standing = activeHeroine (fixed)
- VNBox face icon = page speaker (Nader or heroine)
- flashback_intro: background-based visibility
  - Current day backgrounds = hide heroine
  - Memory backgrounds = show heroine

**DailyTalk:**
- Speaker-based standing display (Nader or heroine)
- intro: heroine-specific priority, common fallback
- after_result / day_end: unchanged

**Background System:**
- Fallback order: page → previous → event definition
- Curtain slide on background change only
- Still events: no curtain (still is background)

---

## Key Files

### Game Logic
| File | Purpose |
|------|---------|
| `src/App.jsx` | Main game loop, screen rendering, EVENT/DailyTalk display |
| `src/game/eventSystem.js` | Event unlock, getIntroTalks(), getNextDailyTalk() |
| `src/game/introFlow.js` | prepareIntroSequence(), talk sequence preparation |
| `src/game/affectionEvents.js` | Event definitions with backgroundId |
| `src/data/dailyTalks.js` | 119 DailyTalk entries |

### UI Components
| File | Purpose |
|------|---------|
| `src/ui/ScreenHeader.jsx` | Common header (INTRO/EVENT/DAY_END) |
| `src/ui/QuizHeader.jsx` | QUIZ-specific header |
| `src/ui/HeroineDisplay.jsx` | Standing/face image display |
| `src/ui/VNBox.jsx` | Visual novel text box |
| `src/ui/MemoriesScreen.jsx` | Event recall screen |

### Documentation
| File | Purpose |
|------|---------|
| `docs/event_presentation_stabilize.md` | EVENT/MEMORIES presentation policy |
| `docs/daily_talk_audit_report.html` | DailyTalk registry audit report |

---

## Known Issues / Technical Debt

### Deferred Decisions
1. **DAILY_TALK header unification** - Deferred due to risk assessment
2. **FINAL_RESULT screen header** - Maintains special h1 title format
3. **Nader central standing in EVENT** - Explicitly not implementing (complexity > benefit)

### Monitoring Points
1. **common intro fallback frequency** - Should be rare with 44 heroine-specific intros
2. **expression stability** - Only updates on heroine speech in EVENT
3. **background fallback chain** - prevEventBackgroundRef must be maintained

---

## Next Steps (Candidate Tasks)

### High Priority
- [ ] (To be defined based on user direction)

### Medium Priority
- [ ] (To be defined based on user direction)

### Low Priority / Exploratory
- [ ] (To be defined based on user direction)

---

## Verification Commands

```bash
# Git state
git status --short
git rev-parse --short HEAD
git -C public status --short
git -C public rev-parse --short HEAD

# Tests
npm test

# Build
npm run build

# DailyTalk audit
node tests/dailyTalks.test.js

# Event system
node tests/eventSystem.test.cjs
```

---

## Snapshot History

| ID | Date | Root Commit | Public Commit | Notes |
|----|------|-------------|---------------|-------|
| M-DOCS-PROJECT-STATE-SNAPSHOT-1 | (previous) | - | - | Initial snapshot |
| M-DOCS-PROJECT-STATE-SNAPSHOT-2 | (previous) | - | - | Mid-development |
| **M-DOCS-PROJECT-STATE-SNAPSHOT-3** | **2026-05-02** | **`2db6a0f`** | **`233aa7c`** | **Current stable** |

---

## Conclusion

**Project Status: STABLE**

- All tests passing (137/137)
- Build successful (~486KB)
- Git clean (root + public)
- Documentation up to date
- No blocking issues
- Ready for next development phase

**Key Achievements:**
1. EVENT/MEMORIES presentation stabilized (no Nader central standing)
2. DailyTalk intro prioritization (heroine-specific first)
3. 119 DailyTalk entries (comprehensive coverage)
4. Comprehensive documentation (`event_presentation_stabilize.md`)

---

*Generated by AG Task: M-DOCS-PROJECT-STATE-SNAPSHOT-3*  
*Snapshot Date: 2026-05-02*
