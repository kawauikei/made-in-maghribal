# Audio Asset Guidelines

This directory contains all audio assets for "Made in Maghribal".

## Directory Structure (Scope)

- `common/`: General BGM and SE used across the game (Title, Workshop, Quiz).
- `hakima/`: Theme and specific sounds for Hakima.
- `mira/`: Theme and specific sounds for Mira.
- `dariya/`: Theme and specific sounds for Dariya.

## Placement Rules

All tracks should be placed in `public/audio/<scope>/<track_id>.mp3`.

## Naming Conventions

- **Case**: Lower snake_case only.
- **Characters**: No spaces, no non-ASCII characters (No Japanese filenames).
- **Format**: `.mp3` is the standard for BGM.

## Track Registration

After adding a new file, register it in `src/data/tracks.js` to make it accessible to the game engine.
