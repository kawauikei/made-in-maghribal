# Audio Asset Guidelines

This directory contains all audio assets for "Made in Maghribal".

## Directory Structure

- `bgm/`: Background music files.
    - `common/`: General BGM used across scenes (Title, Workshop, Quiz).
    - `hakima/`: Theme and specific music for Hakima.
    - `mira/`: Theme and specific music for Mira.
    - `dariya/`: Theme and specific music for Dariya.
- `se/`: Sound effects (UI taps, result chimes, etc.).

## Placement Rules

- **BGM**: `public/audio/bgm/<scope>/<track_id>.mp3`
- **SE**: `public/audio/se/<sfx_id_snake_case>.mp3`

## Naming Conventions (General)

- **Case**: Lower snake_case only.
- **Characters**: No spaces, no non-ASCII characters (No Japanese filenames).
- **Format**: `.mp3` is preferred for broad compatibility.

## SE Specific Rules

SE should follow the pattern: `usage_texture_index.mp3`
Examples:
- `ui_tap_bottle_01.mp3`
- `quiz_correct_star_chime_01.mp3`
- `quiz_wrong_sand_tap_01.mp3`

## Registration

- Register BGM in `src/data/tracks.js`.
- Register SFX in `src/data/sfx.js`.
