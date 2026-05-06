# MadeInMaghribal Loading Plan

## Current preload policy

- Opening/title stage preloads only heroine `normal` images.
- Opening/title stage does not preload heroine-specific BGM.
- Heroine select stage preloads heroine expression images and heroine BGM files.
- Result screen preloads result expression images before the rank reveal so expression switching does not visibly flicker.

## Later work

- Add the actual BGM playback engine separately from this preload layer.
- Keep playback volume and trim settings outside the preload policy.
- Continue using visual profiles for standing / face / result expression display.
