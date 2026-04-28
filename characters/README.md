# Character Asset Rules

## Directory Structure
Assets should be placed in subdirectories named after the heroine's `id`.

```
public/characters/
  └── [heroine_id]/
        ├── standing_default.webp   (Main standing image)
        ├── standing_smile.webp     (Variation)
        ├── face_default.webp       (Square icon for dialogue)
        └── face_smile.webp         (Variation)
```

## Image Specifications
- **Format**: `.webp` (preferred) or `.png`
- **Standing**: Transparent background, centered. Recommended height: 800px+
- **Face**: Square (1:1), centered. Recommended size: 256x256px

## Local Preprocessing
These assets are managed by the character asset pipeline tool in `tools/character_asset_pipeline/`. 
Manual modifications should be documented in `character_asset_config.json` if used, to avoid being overwritten by future automated processing.
