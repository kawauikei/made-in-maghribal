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

# Target frame size
FRAME_W = 1195
FRAME_H = 1600
# Final output size (High Quality: 1195x1600)
OUT_W = 1195
OUT_H = 1600

def process_standing_images():
    if not os.path.exists(JSON_PATH):
        print(f"Error: JSON not found at {JSON_PATH}")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for char_id, char_data in data['characters'].items():
        char_dir = CHAR_MAP.get(char_id, char_id.lower())
        standing_master = char_data['standing']['master']
        
        target_dir = os.path.join(TARGET_BASE_DIR, char_dir, 'standing_proc')
        os.makedirs(target_dir, exist_ok=True)
        
        print(f"Processing Standing {char_id} -> {target_dir}")

        for exp_id, exp_data in char_data['standing']['expressions'].items():
            src_path = os.path.join(SOURCE_DIR, char_dir, f"{exp_id}.webp")
            if not os.path.exists(src_path):
                continue

            # Calculate actual transform values
            total_x = standing_master['x'] + exp_data['x']
            total_y = standing_master['y'] + exp_data['y']
            total_scale = standing_master['scale'] * exp_data['scale']

            # Open source
            with Image.open(src_path) as img:
                # Create a transparent frame
                frame = Image.new('RGBA', (FRAME_W, FRAME_H), (0, 0, 0, 0))
                
                # Resize source image according to scale
                scaled_w = int(img.width * total_scale)
                scaled_h = int(img.height * total_scale)
                scaled_img = img.resize((scaled_w, scaled_h), resample=Image.LANCZOS)
                
                # Calculate paste position (horizontal center + x, top + y)
                # Note: In the tool, drawImage(img, -img.width/2, 0) was used after translate(IMG_W/2 + x, y)
                paste_x = int(FRAME_W / 2 + total_x - scaled_w / 2)
                paste_y = int(total_y)
                
                frame.paste(scaled_img, (paste_x, paste_y), scaled_img if scaled_img.mode == 'RGBA' else None)
                
                # Resize frame to target proc size
                proc_img = frame.resize((OUT_W, OUT_H), resample=Image.LANCZOS)
                
                # Save as WebP with high quality
                out_path = os.path.join(target_dir, f"{exp_id}.webp")
                proc_img.save(out_path, 'WEBP', quality=95, lossless=False)
                print(f"  Generated: {exp_id}.webp (Pos: {paste_x},{paste_y} Scale: {total_scale:.2f})")

if __name__ == "__main__":
    process_standing_images()
