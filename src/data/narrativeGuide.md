# Narrative Guide

`src/data/narrativeScript.js` is the canonical narrative source for the game.
It is a normal ESM module under `src/`, not a static file under `public/`.
Use `public/` only for raw assets that must be fetched at runtime, not for data
that is imported by the app.

## What lives in `narrativeScript.js`

- Opening and heroine-selection recap pages
- Intro daily talks
- After-result daily talks
- Day-end daily talks
- Affection events
- Endings
- Result comments

## Event authoring rules

- Add new affection events under `NARRATIVE_SCRIPT.affectionEvents[heroineId]`.
- Use a stable `id`; the same ID is the uniqueness key.
- Put unlock conditions on the event object itself, usually `threshold` and
  `routeMode`.
- Keep `kind` explicit:
  - `flashback_intro`
  - `route_climax`
  - regular affection event kinds for normal unlocks
- Put presentation data on the event itself:
  - `presentation.backgroundId`
  - `presentation.bgmId`
  - `stillImageId` when the event uses a still instead of a standing scene
- Put page-level overrides in `pages`, and include `backgroundId` only when a
  specific page needs a different background from the event default.
- Use `bgmId` on the event or on a page when the music should switch.
  - Event-level `presentation.bgmId` is the default for the whole scene.
  - Page-level `bgmId` overrides it for a specific beat.
  - If a later page omits `bgmId`, the scene keeps the previous track rather
    than dropping to silence.
- If an event should not repeat within the same save, keep the same ID. The
  unlock flow already checks `seenEventIds`.

## Same-event suppression

- The app persists `seenEventIds` in save data.
- The app also keeps a separate loop-memory list for repeat-play suppression.
- `checkNewEventUnlock()` skips any event whose ID is already in either list.
- `resolveHeroineSelectionEvent()` does the same for `flashback_intro`.
- This prevents the same event from appearing again in the same playthrough,
  and also across fresh runs unless the reset path clears the loop memory.

## Background catalog

Use the IDs exported from `src/data/imageAssets.js`.

- `shopExteriorDay`
- `shopExteriorNight`
- `shopInteriorService`
- `marketCentral`
- `palaceCorridor`
- `palaceLab`
- `spotFountain`
- `spotFestivalStreet`
- `spotPortView`
- `spotOasisView`
- `spotRuins`
- `spotStarView`

For the cleanup pass, give the writer the background ID plus the intended
scene mood. The file name and actual art path are defined in
`src/data/imageAssets.js`.

## BGM catalog

Use the track IDs exported from `src/data/tracks.js`.

- Main / global
  - `MAIN-01`
  - `MAIN-02`
  - `MAIN-03`
- Hakima route
  - `HAKIMA-01`
  - `HAKIMA-02`
  - `HAKIMA-03`
  - `HAKIMA-04`
  - `HAKIMA-05`
  - `HAKIMA-06`
  - `HAKIMA-07`
- Mira route
  - `MIRA-01`
  - `MIRA-02`
  - `MIRA-03`
  - `MIRA-04`
  - `MIRA-05`
  - `MIRA-06`
  - `MIRA-07`
- Dariya route
  - `DARIYA-01`
  - `DARIYA-02`
  - `DARIYA-03`
  - `DARIYA-04`
  - `DARIYA-05`
  - `DARIYA-06`
  - `DARIYA-07`
- Common event BGM
  - `extra_joy_1`
  - `extra_joy_2`
  - `extra_fun_1`
  - `extra_fun_2`
  - `extra_surprise_1`
  - `extra_surprise_2`
  - `extra_anger_1`
  - `extra_anger_2`
  - `extra_sorrow_1`
  - `extra_sorrow_2`

Recommended usage:

- Use heroine BGM for intro, route-specific talk, and endings.
- Use `MAIN-02` for day-end / neutral story beats.
- Use the `extra_*` tracks for common event scenes that should feel distinct
  from heroine route music.
- If a scene has no deliberate music change, leave `bgmId` unset and let the
  current track continue.

## Page fields

Page objects can use:

- `speakerId`
- `speaker`
- `expression`
- `text`
- `backgroundId`
- `stillImageId`
- `bgmId`

If a page needs branching metadata, the event system also understands:

- `routeMode`
- `kind`
- `threshold`
- `minAffection`
- `scoreMin`
- `scoreMax`
