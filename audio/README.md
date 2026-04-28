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
- **SE**: `public/audio/se/<se_id>.mp3`

## Naming Conventions

- **Case**: Lower snake_case only.
- **Characters**: No spaces, no non-ASCII characters (No Japanese filenames).
- **Format**: `.mp3` is preferred for broad compatibility.

## Track Registration

After adding a new file, register it in `src/data/tracks.js` to make it accessible to the game engine.
