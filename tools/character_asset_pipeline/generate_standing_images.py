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

# Canvas size defined in HTML tool
CANVAS_W = 1195
CANVAS_H = 1600

def process_standing_images_final_sync():
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
        
        print(f"Processing Standing (Final Tool Sync) {char_id}")

        for exp_id, exp_data in char_data['standing']['expressions'].items():
            src_path = os.path.join(SOURCE_DIR, char_dir, f"{exp_id}.webp")
            if not os.path.exists(src_path):
                continue

            # Exact math as in tool
            x = standing_master['x'] + exp_data['x']
            y = standing_master['y'] + exp_data['y']
            scale = standing_master['scale'] * exp_data['scale']
            
            with Image.open(src_path) as img:
                # Create a blank transparent canvas
                canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
                
                # Rescale source image
                sw = int(img.width * scale)
                sh = int(img.height * scale)
                scaled_img = img.resize((sw, sh), resample=Image.LANCZOS)
                
                # HTML tool math:
                # ctx.translate(canvas.width / 2 + x, y);
                # ctx.scale(scale, scale);
                # ctx.drawImage(img, -img.width / 2, 0);
                
                # This results in:
                # Top edge of drawing is at Y
                # Center of drawing is at (CANVAS_W / 2 + x)
                
                px = int(CANVAS_W / 2 + x - sw / 2)
                py = int(y)
                
                # Paste onto canvas
                canvas.paste(scaled_img, (px, py), scaled_img if scaled_img.mode == 'RGBA' else None)
                
                # Save as 1195x1600
                out_path = os.path.join(target_dir, f"{exp_id}.webp")
                canvas.save(out_path, 'WEBP', quality=95, lossless=False)

if __name__ == "__main__":
    process_standing_images_final_sync()
