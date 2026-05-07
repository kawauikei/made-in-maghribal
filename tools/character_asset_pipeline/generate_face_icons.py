import json
import os
from PIL import Image

# Path configuration
PROJECT_ROOT = r'c:\AI\projects\P0007_MadeInMaghribalt3'
JSON_PATH = os.path.join(PROJECT_ROOT, 'tools', 'character_asset_pipeline', 'source_webp', 'character_alignment_2026-05-07.json')
SOURCE_DIR = os.path.join(PROJECT_ROOT, 'tools', 'character_asset_pipeline', 'source_webp')
TARGET_BASE_DIR = os.path.join(PROJECT_ROOT, 'public', 'characters')

# Folder mapping
CHAR_MAP = {
    'NADIR': 'nader',
    'HAKIMA': 'hakima',
    'MIRA': 'mira',
    'DARIYA': 'dariya'
}

def process_face_icons():
    if not os.path.exists(JSON_PATH):
        print(f"Error: JSON not found at {JSON_PATH}")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for char_id, char_data in data['characters'].items():
        char_dir = CHAR_MAP.get(char_id, char_id.lower())
        face_master = char_data['face']['master']
        
        target_dir = os.path.join(TARGET_BASE_DIR, char_dir, 'face_proc')
        os.makedirs(target_dir, exist_ok=True)
        
        print(f"Processing {char_id} -> {target_dir}")

        for exp_id, exp_data in char_data['face']['expressions'].items():
            # Source image path
            src_path = os.path.join(SOURCE_DIR, char_dir, f"{exp_id}.webp")
            if not os.path.exists(src_path):
                # Try with case sensitivity if needed, but typically all lower
                continue

            # Calculate actual crop values
            # cropX/Y are offsets from the "master" crop box defined in the tool
            # In the tool logic: cropX_total = master.cropX + exp.cropX
            total_crop_x = face_master['cropX'] + exp_data['cropX']
            total_crop_y = face_master['cropY'] + exp_data['cropY']
            total_crop_w = face_master['cropW'] + exp_data.get('cropW', 0)
            total_crop_h = face_master['cropH'] + exp_data.get('cropH', 0)
            total_scale = face_master['cropScale'] * exp_data['cropScale']

            # Open source
            with Image.open(src_path) as img:
                # The tool assumes the crop is relative to the source image (1195x1600)
                # But wait, in the tool 'cropX' was relative to the source image.
                # Center of crop:
                cx = total_crop_x + total_crop_w / 2
                cy = total_crop_y + total_crop_h / 2
                
                # Desired width/height on source to achieve zoom
                # If total_scale = 1.0, we crop exactly total_crop_w
                cw = total_crop_w / total_scale
                ch = total_crop_h / total_scale
                
                left = cx - cw / 2
                top = cy - ch / 2
                right = cx + cw / 2
                bottom = cy + ch / 2
                
                # Crop and Resize
                # Use Lanczos for high quality
                cropped = img.crop((left, top, right, bottom))
                icon = cropped.resize((256, 256), resample=Image.LANCZOS)
                
                # Save
                out_path = os.path.join(target_dir, f"{exp_id}.webp")
                # Use high quality to satisfy user requirement
                icon.save(out_path, 'WEBP', quality=95, lossless=False)
                print(f"  Generated: {exp_id}.webp (Crop: {int(cw)}x{int(ch)} at {int(left)},{int(top)})")

if __name__ == "__main__":
    process_face_icons()
