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
