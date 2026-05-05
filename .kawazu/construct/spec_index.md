# Spec Index

このファイルは KawazuConstructHub が生成した案内図です。手で編集しないでください。

## Project
- generated_at: `2026-05-05T23:24:27.083010+09:00`
- root: `c:/AI/projects/P0007_MadeInMaghribalt3`
- registry: `.kawazu\construct\contracts.json`

## Layout
- `.agent/`: OK
- `.kawazu/`: OK
- `.kawazu\construct/`: OK
- `.kawazu\construct\templates/`: OK
- `specs/`: OK
- `specs\modules/`: OK
- `src/`: OK
- `src\core/`: OK
- `tests/`: OK
- `tests\core/`: OK

## Contracts
### C001_DATA_ID_SCHEMA
- kind: `module`
- status: `active`
- spec: `specs/modules/C001_DATA_ID_SCHEMA.spec.md`
- testspec: `specs/modules/C001_DATA_ID_SCHEMA.testspec.md`
- sources:
  - `src/core/idSchema.cjs`
- tests:
  - `tests/core/C001_DATA_ID_SCHEMA.test.cjs`
- required_commands:
  - `node --test tests/core/C001_DATA_ID_SCHEMA.test.cjs`
- latest_run: `.kawazu/construct/runs/C001_DATA_ID_SCHEMA/20260505T201538+0900.json`
- latest_run_status: `passed`
- last_verified_run: `.kawazu/construct/runs/C001_DATA_ID_SCHEMA/20260505T201538+0900.json`
- last_verified_at: `2026-05-05T20:15:38.336192+09:00`

### C002_CHARACTER_AND_TONE_DATA
- kind: `module`
- status: `active`
- spec: `specs/modules/C002_CHARACTER_AND_TONE_DATA.spec.md`
- testspec: `specs/modules/C002_CHARACTER_AND_TONE_DATA.testspec.md`
- sources:
  - `src/data/characters.cjs`
  - `src/data/toneGuides.cjs`
  - `src/core/characterValidator.cjs`
  - `src/core/toneGuideValidator.cjs`
- tests:
  - `tests/core/C002_CHARACTER_AND_TONE_DATA.test.cjs`
- required_commands:
  - `node --test tests/core/C002_CHARACTER_AND_TONE_DATA.test.cjs`
- latest_run: `.kawazu/construct/runs/C002_CHARACTER_AND_TONE_DATA/20260505T210931+0900.json`
- latest_run_status: `passed`
- last_verified_run: `.kawazu/construct/runs/C002_CHARACTER_AND_TONE_DATA/20260505T210931+0900.json`
- last_verified_at: `2026-05-05T21:09:31.640442+09:00`

### C004_ITEM_MASTER_AND_TEXT
- kind: `module`
- status: `active`
- spec: `specs/modules/C004_ITEM_MASTER_AND_TEXT.spec.md`
- testspec: `specs/modules/C004_ITEM_MASTER_AND_TEXT.testspec.md`
- sources:
  - `src/data/itemTaxonomy.cjs`
  - `src/data/itemMaster.cjs`
  - `src/data/itemTexts.cjs`
  - `src/core/itemValidator.cjs`
- tests:
  - `tests/core/C004_ITEM_MASTER_AND_TEXT.test.cjs`
- required_commands:
  - `node --test tests/core/C004_ITEM_MASTER_AND_TEXT.test.cjs`
- latest_run: `.kawazu/construct/runs/C004_ITEM_MASTER_AND_TEXT/20260505T210931+0900.json`
- latest_run_status: `passed`
- last_verified_run: `.kawazu/construct/runs/C004_ITEM_MASTER_AND_TEXT/20260505T210931+0900.json`
- last_verified_at: `2026-05-05T21:09:31.865161+09:00`

### C003_ASSET_MANIFEST
- kind: `module`
- status: `active`
- spec: `specs/modules/C003_ASSET_MANIFEST.spec.md`
- testspec: `specs/modules/C003_ASSET_MANIFEST.testspec.md`
- sources:
  - `src/data/assets.cjs`
  - `src/core/assetValidator.cjs`
- tests:
  - `tests/core/C003_ASSET_MANIFEST.test.cjs`
- required_commands:
  - `node --test tests/core/C003_ASSET_MANIFEST.test.cjs`
- latest_run: `.kawazu/construct/runs/C003_ASSET_MANIFEST/20260505T210931+0900.json`
- latest_run_status: `passed`
- last_verified_run: `.kawazu/construct/runs/C003_ASSET_MANIFEST/20260505T210931+0900.json`
- last_verified_at: `2026-05-05T21:09:31.753091+09:00`

### C005_AUDIO_MANIFEST
- kind: `module`
- status: `active`
- spec: `specs/modules/C005_AUDIO_MANIFEST.spec.md`
- testspec: `specs/modules/C005_AUDIO_MANIFEST.testspec.md`
- sources:
  - `src/data/audioManifest.cjs`
  - `src/core/audioValidator.cjs`
- tests:
  - `tests/core/C005_AUDIO_MANIFEST.test.cjs`
- required_commands:
  - `node --test tests/core/C005_AUDIO_MANIFEST.test.cjs`
- latest_run: `.kawazu/construct/runs/C005_AUDIO_MANIFEST/20260505T210931+0900.json`
- latest_run_status: `passed`
- last_verified_run: `.kawazu/construct/runs/C005_AUDIO_MANIFEST/20260505T210931+0900.json`
- last_verified_at: `2026-05-05T21:09:31.973727+09:00`

### C006_SCENARIO_AND_TALK_SCHEMA
- kind: `module`
- status: `active`
- spec: `specs/modules/C006_SCENARIO_AND_TALK_SCHEMA.spec.md`
- testspec: `specs/modules/C006_SCENARIO_AND_TALK_SCHEMA.testspec.md`
- sources:
  - `src/data/scenarioSamples.cjs`
  - `src/data/dailyTalkSamples.cjs`
  - `src/core/scenarioSchema.cjs`
  - `src/core/scenarioValidator.cjs`
- tests:
  - `tests/core/C006_SCENARIO_AND_TALK_SCHEMA.test.cjs`
- required_commands:
  - `node --test tests/core/C006_SCENARIO_AND_TALK_SCHEMA.test.cjs`
- latest_run: `.kawazu/construct/runs/C006_SCENARIO_AND_TALK_SCHEMA/20260505T210932+0900.json`
- latest_run_status: `passed`
- last_verified_run: `.kawazu/construct/runs/C006_SCENARIO_AND_TALK_SCHEMA/20260505T210932+0900.json`
- last_verified_at: `2026-05-05T21:09:32.076876+09:00`

### C007_QUIZ_REQUEST_MODEL
- kind: `module`
- status: `active`
- spec: `specs/modules/C007_QUIZ_REQUEST_MODEL.spec.md`
- testspec: `specs/modules/C007_QUIZ_REQUEST_MODEL.testspec.md`
- sources:
  - `src/data/quizRequestTemplates.cjs`
  - `src/core/quizRequestModel.cjs`
  - `src/core/quizValidator.cjs`
- tests:
  - `tests/core/C007_QUIZ_REQUEST_MODEL.test.cjs`
- required_commands:
  - `node --test tests/core/C007_QUIZ_REQUEST_MODEL.test.cjs`
- latest_run: `.kawazu/construct/runs/C007_QUIZ_REQUEST_MODEL/20260505T210932+0900.json`
- latest_run_status: `passed`
- last_verified_run: `.kawazu/construct/runs/C007_QUIZ_REQUEST_MODEL/20260505T210932+0900.json`
- last_verified_at: `2026-05-05T21:09:32.190108+09:00`

### C008_RHYTHM_QUIZ_CORE
- kind: `module`
- status: `active`
- spec: `specs/modules/C008_RHYTHM_QUIZ_CORE.spec.md`
- testspec: `specs/modules/C008_RHYTHM_QUIZ_CORE.testspec.md`
- sources:
  - `src/core/rhythmTiming.cjs`
  - `src/core/rhythmQuizCore.cjs`
- tests:
  - `tests/core/C008_RHYTHM_QUIZ_CORE.test.cjs`
- required_commands:
  - `node --test tests/core/C008_RHYTHM_QUIZ_CORE.test.cjs`
- latest_run: `.kawazu/construct/runs/C008_RHYTHM_QUIZ_CORE/20260505T210932+0900.json`
- latest_run_status: `passed`
- last_verified_run: `.kawazu/construct/runs/C008_RHYTHM_QUIZ_CORE/20260505T210932+0900.json`
- last_verified_at: `2026-05-05T21:09:32.287247+09:00`

### C009_SCORE_AFFECTION_ENDING
- kind: `module`
- status: `active`
- spec: `specs/modules/C009_SCORE_AFFECTION_ENDING.spec.md`
- testspec: `specs/modules/C009_SCORE_AFFECTION_ENDING.testspec.md`
- sources:
  - `src/core/scoreModel.cjs`
  - `src/core/affectionModel.cjs`
  - `src/core/endingBranch.cjs`
- tests:
  - `tests/core/C009_SCORE_AFFECTION_ENDING.test.cjs`
- required_commands:
  - `node --test tests/core/C009_SCORE_AFFECTION_ENDING.test.cjs`
- latest_run: `.kawazu/construct/runs/C009_SCORE_AFFECTION_ENDING/20260505T232420+0900.json`
- latest_run_status: `passed`
- last_verified_run: `.kawazu/construct/runs/C009_SCORE_AFFECTION_ENDING/20260505T232420+0900.json`
- last_verified_at: `2026-05-05T23:24:20.530081+09:00`

### C010_GAME_SESSION_FLOW
- kind: `module`
- status: `active`
- spec: `specs/modules/C010_GAME_SESSION_FLOW.spec.md`
- testspec: `specs/modules/C010_GAME_SESSION_FLOW.testspec.md`
- sources:
  - `src/core/gameSessionFlow.cjs`
  - `src/core/stageSchedule.cjs`
  - `src/core/unlockState.cjs`
- tests:
  - `tests/core/C010_GAME_SESSION_FLOW.test.cjs`
- required_commands:
  - `node --test tests/core/C010_GAME_SESSION_FLOW.test.cjs`
- latest_run: `.kawazu/construct/runs/C010_GAME_SESSION_FLOW/20260505T210932+0900.json`
- latest_run_status: `passed`
- last_verified_run: `.kawazu/construct/runs/C010_GAME_SESSION_FLOW/20260505T210932+0900.json`
- last_verified_at: `2026-05-05T21:09:32.484154+09:00`

### C011_RENDER_MODEL
- kind: `module`
- status: `active`
- spec: `specs/modules/C011_RENDER_MODEL.spec.md`
- testspec: `specs/modules/C011_RENDER_MODEL.testspec.md`
- sources:
  - `src/core/renderModel.cjs`
- tests:
  - `tests/core/C011_RENDER_MODEL.test.cjs`
- required_commands:
  - `node --test tests/core/C011_RENDER_MODEL.test.cjs`
- latest_run: `.kawazu/construct/runs/C011_RENDER_MODEL/20260505T210932+0900.json`
- latest_run_status: `passed`
- last_verified_run: `.kawazu/construct/runs/C011_RENDER_MODEL/20260505T210932+0900.json`
- last_verified_at: `2026-05-05T21:09:32.588775+09:00`

## Source Lookup
| Source | Contract | Spec | TestSpec |
|---|---|---|---|
| `src/core/idSchema.cjs` | `C001_DATA_ID_SCHEMA` | `specs/modules/C001_DATA_ID_SCHEMA.spec.md` | `specs/modules/C001_DATA_ID_SCHEMA.testspec.md` |
| `src/data/characters.cjs` | `C002_CHARACTER_AND_TONE_DATA` | `specs/modules/C002_CHARACTER_AND_TONE_DATA.spec.md` | `specs/modules/C002_CHARACTER_AND_TONE_DATA.testspec.md` |
| `src/data/toneGuides.cjs` | `C002_CHARACTER_AND_TONE_DATA` | `specs/modules/C002_CHARACTER_AND_TONE_DATA.spec.md` | `specs/modules/C002_CHARACTER_AND_TONE_DATA.testspec.md` |
| `src/core/characterValidator.cjs` | `C002_CHARACTER_AND_TONE_DATA` | `specs/modules/C002_CHARACTER_AND_TONE_DATA.spec.md` | `specs/modules/C002_CHARACTER_AND_TONE_DATA.testspec.md` |
| `src/core/toneGuideValidator.cjs` | `C002_CHARACTER_AND_TONE_DATA` | `specs/modules/C002_CHARACTER_AND_TONE_DATA.spec.md` | `specs/modules/C002_CHARACTER_AND_TONE_DATA.testspec.md` |
| `src/data/itemTaxonomy.cjs` | `C004_ITEM_MASTER_AND_TEXT` | `specs/modules/C004_ITEM_MASTER_AND_TEXT.spec.md` | `specs/modules/C004_ITEM_MASTER_AND_TEXT.testspec.md` |
| `src/data/itemMaster.cjs` | `C004_ITEM_MASTER_AND_TEXT` | `specs/modules/C004_ITEM_MASTER_AND_TEXT.spec.md` | `specs/modules/C004_ITEM_MASTER_AND_TEXT.testspec.md` |
| `src/data/itemTexts.cjs` | `C004_ITEM_MASTER_AND_TEXT` | `specs/modules/C004_ITEM_MASTER_AND_TEXT.spec.md` | `specs/modules/C004_ITEM_MASTER_AND_TEXT.testspec.md` |
| `src/core/itemValidator.cjs` | `C004_ITEM_MASTER_AND_TEXT` | `specs/modules/C004_ITEM_MASTER_AND_TEXT.spec.md` | `specs/modules/C004_ITEM_MASTER_AND_TEXT.testspec.md` |
| `src/data/assets.cjs` | `C003_ASSET_MANIFEST` | `specs/modules/C003_ASSET_MANIFEST.spec.md` | `specs/modules/C003_ASSET_MANIFEST.testspec.md` |
| `src/core/assetValidator.cjs` | `C003_ASSET_MANIFEST` | `specs/modules/C003_ASSET_MANIFEST.spec.md` | `specs/modules/C003_ASSET_MANIFEST.testspec.md` |
| `src/data/audioManifest.cjs` | `C005_AUDIO_MANIFEST` | `specs/modules/C005_AUDIO_MANIFEST.spec.md` | `specs/modules/C005_AUDIO_MANIFEST.testspec.md` |
| `src/core/audioValidator.cjs` | `C005_AUDIO_MANIFEST` | `specs/modules/C005_AUDIO_MANIFEST.spec.md` | `specs/modules/C005_AUDIO_MANIFEST.testspec.md` |
| `src/data/scenarioSamples.cjs` | `C006_SCENARIO_AND_TALK_SCHEMA` | `specs/modules/C006_SCENARIO_AND_TALK_SCHEMA.spec.md` | `specs/modules/C006_SCENARIO_AND_TALK_SCHEMA.testspec.md` |
| `src/data/dailyTalkSamples.cjs` | `C006_SCENARIO_AND_TALK_SCHEMA` | `specs/modules/C006_SCENARIO_AND_TALK_SCHEMA.spec.md` | `specs/modules/C006_SCENARIO_AND_TALK_SCHEMA.testspec.md` |
| `src/core/scenarioSchema.cjs` | `C006_SCENARIO_AND_TALK_SCHEMA` | `specs/modules/C006_SCENARIO_AND_TALK_SCHEMA.spec.md` | `specs/modules/C006_SCENARIO_AND_TALK_SCHEMA.testspec.md` |
| `src/core/scenarioValidator.cjs` | `C006_SCENARIO_AND_TALK_SCHEMA` | `specs/modules/C006_SCENARIO_AND_TALK_SCHEMA.spec.md` | `specs/modules/C006_SCENARIO_AND_TALK_SCHEMA.testspec.md` |
| `src/data/quizRequestTemplates.cjs` | `C007_QUIZ_REQUEST_MODEL` | `specs/modules/C007_QUIZ_REQUEST_MODEL.spec.md` | `specs/modules/C007_QUIZ_REQUEST_MODEL.testspec.md` |
| `src/core/quizRequestModel.cjs` | `C007_QUIZ_REQUEST_MODEL` | `specs/modules/C007_QUIZ_REQUEST_MODEL.spec.md` | `specs/modules/C007_QUIZ_REQUEST_MODEL.testspec.md` |
| `src/core/quizValidator.cjs` | `C007_QUIZ_REQUEST_MODEL` | `specs/modules/C007_QUIZ_REQUEST_MODEL.spec.md` | `specs/modules/C007_QUIZ_REQUEST_MODEL.testspec.md` |
| `src/core/rhythmTiming.cjs` | `C008_RHYTHM_QUIZ_CORE` | `specs/modules/C008_RHYTHM_QUIZ_CORE.spec.md` | `specs/modules/C008_RHYTHM_QUIZ_CORE.testspec.md` |
| `src/core/rhythmQuizCore.cjs` | `C008_RHYTHM_QUIZ_CORE` | `specs/modules/C008_RHYTHM_QUIZ_CORE.spec.md` | `specs/modules/C008_RHYTHM_QUIZ_CORE.testspec.md` |
| `src/core/scoreModel.cjs` | `C009_SCORE_AFFECTION_ENDING` | `specs/modules/C009_SCORE_AFFECTION_ENDING.spec.md` | `specs/modules/C009_SCORE_AFFECTION_ENDING.testspec.md` |
| `src/core/affectionModel.cjs` | `C009_SCORE_AFFECTION_ENDING` | `specs/modules/C009_SCORE_AFFECTION_ENDING.spec.md` | `specs/modules/C009_SCORE_AFFECTION_ENDING.testspec.md` |
| `src/core/endingBranch.cjs` | `C009_SCORE_AFFECTION_ENDING` | `specs/modules/C009_SCORE_AFFECTION_ENDING.spec.md` | `specs/modules/C009_SCORE_AFFECTION_ENDING.testspec.md` |
| `src/core/gameSessionFlow.cjs` | `C010_GAME_SESSION_FLOW` | `specs/modules/C010_GAME_SESSION_FLOW.spec.md` | `specs/modules/C010_GAME_SESSION_FLOW.testspec.md` |
| `src/core/stageSchedule.cjs` | `C010_GAME_SESSION_FLOW` | `specs/modules/C010_GAME_SESSION_FLOW.spec.md` | `specs/modules/C010_GAME_SESSION_FLOW.testspec.md` |
| `src/core/unlockState.cjs` | `C010_GAME_SESSION_FLOW` | `specs/modules/C010_GAME_SESSION_FLOW.spec.md` | `specs/modules/C010_GAME_SESSION_FLOW.testspec.md` |
| `src/core/renderModel.cjs` | `C011_RENDER_MODEL` | `specs/modules/C011_RENDER_MODEL.spec.md` | `specs/modules/C011_RENDER_MODEL.testspec.md` |

## Gaps
- layout_missing_count: 0
- registry_error_count: 0
- registry_warning_count: 0

## Chat Context Order
1. `.kawazu/construct/spec_index.md`
2. 今回対象contractのspec
3. 今回対象contractのtestspec
4. 必要な依存contractのspec/testspec
5. ソース本文は必要な場合のみ
