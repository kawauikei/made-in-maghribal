
import os
import cv2
import numpy as np
from pathlib import Path
import json
import sys
import time

# Import manifest utils from same directory
sys.path.append(str(Path(__file__).parent))
import manifest_utils

# Configuration
CONFIG_PATH = Path("tools/character_asset_pipeline/character_asset_config.json")
SOURCE_CLEAN_ROOT = Path("tools/character_asset_pipeline/source_clean")
BASE_DIR = Path("public/characters")
FACE_SUBDIR = "face_proc"
STANDING_SUBDIR = "standing"
STANDING_PROC_SUBDIR = "standing_proc"
FACE_SIZE = (256, 256)
STANDING_PROC_SIZE = (640, 640)

# Mapping from config char_id to folder name in source_clean
CHAR_FOLDER_MAP = {
    "hakima": "01_Hakima",
    "mira": "02_Mira",
    "dariya": "03_Dariya",
    "nader": "04_Nader",
    "common": "00_common"
}
ALLOWED_EXTENSIONS = [".jpeg", ".jpg", ".png", ".webp"]

# Color tolerance
THRESHOLD = 60 

def remove_background(cv_img, bg_color, char_id, face_center):
    h, w = cv_img.shape[:2]
    bgra = cv2.cvtColor(cv_img, cv2.COLOR_BGR2BGRA)
    
    # --- A. Outer Connected Background ---
    lower_outer = np.array([max(0, int(c) - 55) for c in bg_color])
    upper_outer = np.array([min(255, int(c) + 55) for c in bg_color])
    mask_outer_raw = cv2.inRange(cv_img, lower_outer, upper_outer)
    
    # Flood fill from edges
    flood_img = mask_outer_raw.copy()
    temp_mask = np.zeros((h + 2, w + 2), np.uint8)
    seeds = [(0,0), (w-1,0), (0,h-1), (w-1,h-1), (w//2,0), (w//2,h-1), (0,h//2), (w-1,h//2)]
    for sx, sy in seeds:
        if flood_img[sy, sx] == 255:
            cv2.floodFill(flood_img, temp_mask, (sx, sy), 128)
    outer_mask = np.zeros((h, w), np.uint8)
    outer_mask[flood_img == 128] = 255
    
    # --- B. Internal Hole Identification ---
    lower_wide = np.array([max(0, int(c) - THRESHOLD) for c in bg_color])
    upper_wide = np.array([min(255, int(c) + THRESHOLD) for c in bg_color])
    mask_wide = cv2.inRange(cv_img, lower_wide, upper_wide)
    
    enclosed_candidates = cv2.bitwise_and(mask_wide, cv2.bitwise_not(outer_mask))
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(enclosed_candidates, connectivity=8)
    safe_holes_mask = np.zeros((h, w), np.uint8)
    
    cx_p, cy_p = face_center
    fx, fy = int(w * cx_p), int(h * cy_p)
    face_protection_radius = int(h * 0.30)
    
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        cx, cy = centroids[i]
        dist = np.sqrt((cx-fx)**2 + (cy-fy)**2)
        if dist < face_protection_radius:
            if area < 5: # Only tiny specks allowed in face zone
                safe_holes_mask[labels == i] = 255
        else:
            if area < (h*w*0.1): # No giant islands
                safe_holes_mask[labels == i] = 255

    # --- C. Protection Mask ---
    hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
    lower_skin = np.array([0, 15, 60], dtype=np.uint8)
    upper_skin = np.array([30, 255, 255], dtype=np.uint8)
    skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
    
    face_zone = np.zeros((h, w), np.uint8)
    cv2.circle(face_zone, (fx, fy), face_protection_radius, 255, -1)
    
    final_mask = outer_mask.copy()
    final_mask = cv2.bitwise_or(final_mask, safe_holes_mask)
    # 3. SUBTRACT skin protection AND face zone protection everywhere
    final_mask = cv2.bitwise_and(final_mask, cv2.bitwise_not(skin_mask))
    final_mask = cv2.bitwise_and(final_mask, cv2.bitwise_not(face_zone))
    
    bgra[final_mask > 0, 3] = 0
    return bgra

def check_alpha_integrity(bgra_img):
    h, w = bgra_img.shape[:2]
    alpha = bgra_img[:, :, 3]
    center_alpha = alpha[h//3:2*h//3, w//3:2*w//3]
    return np.sum(center_alpha < 255) / center_alpha.size

def find_best_source(char_id, variant_name, config_source_path):
    # 1. Try source_clean with various extensions
    folder_name = CHAR_FOLDER_MAP.get(char_id)
    if folder_name:
        clean_dir = SOURCE_CLEAN_ROOT / folder_name
        for ext in ALLOWED_EXTENSIONS:
            clean_path = clean_dir / f"{variant_name}{ext}"
            if clean_path.exists():
                return clean_path, True # True means it's from source_clean
    
    # 2. Fallback to config source path
    fallback_path = Path(config_source_path)
    if fallback_path.exists():
        return fallback_path, False # False means fallback to original source
        
    return None, False

def process_character_asset(char_id, variant_name, source_path, face_crop_config):
    img = cv2.imread(str(source_path))
    if img is None: return False
    h, w = img.shape[:2]
    if face_crop_config:
        cx, cy = (face_crop_config["x"]+face_crop_config["w"]/2), (face_crop_config["y"]+face_crop_config["h"]/2)
    else:
        fallbacks = {"hakima": (0.50,0.24), "mira": (0.48,0.30), "dariya": (0.52,0.20), "nader": (0.50,0.19)}
        cx_p, cy_p = fallbacks.get(char_id, (0.5,0.5))
        cx, cy = int(w*cx_p), int(h*cy_p)

    face_center = (cx/w, cy/h)
    bg_color = np.median(np.concatenate([img[0:10,0:10].reshape(-1,3), img[0:10,-10:].reshape(-1,3)]), axis=0).astype(np.uint8)
    
    transparent_full = remove_background(img, bg_color, char_id, face_center)
    alpha_loss = check_alpha_integrity(transparent_full)
    if alpha_loss > 0.001: print(f"    [WARN] center alpha loss: {alpha_loss:.2%}")

    out_dirs = {"face": BASE_DIR/char_id/FACE_SUBDIR, "standing": BASE_DIR/char_id/STANDING_PROC_SUBDIR}
    for d in out_dirs.values(): d.mkdir(parents=True, exist_ok=True)

    if char_id != "common":
        side = int(h * 0.35)
        fx_i, fy_i = int(max(0, cx-side/2)), int(max(0, cy-side/2))
        face_crop = transparent_full[fy_i:fy_i+side, fx_i:fx_i+side]
        cv2.imwrite(str(out_dirs["face"]/f"{variant_name}.png"), cv2.resize(face_crop, FACE_SIZE, interpolation=cv2.INTER_LANCZOS4))
    
    target_h = STANDING_PROC_SIZE[1]
    target_w = int(target_h * (w/h))
    cv2.imwrite(str(out_dirs["standing"]/f"{variant_name}.png"), cv2.resize(transparent_full, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4))
    return True

def main():
    force = "--force" in sys.argv
    if not CONFIG_PATH.exists(): 
        print(f"Config not found: {CONFIG_PATH}")
        return

    with open(CONFIG_PATH, "r", encoding="utf-8") as f: 
        asset_config = json.load(f)

    manifest = manifest_utils.load_manifest()
    any_updated = False
    
    # Stats
    stats = {
        "clean": 0,
        "fallback": 0,
        "skip": 0,
        "regenerate": 0,
        "per_char": {}
    }

    print("\n--- Starting Character Asset Pipeline (source_clean prioritized) ---")

    for char_id, config in asset_config.items():
        print(f"\nCharacter: [{char_id}]")
        char_stats = {"clean": 0, "fallback": 0, "skip": 0, "regenerate": 0}
        variants = config.get("variants", {})
        
        for variant_name, v_config in variants.items():
            config_src = v_config.get("sourcePath", "")
            src_path, is_clean = find_best_source(char_id, variant_name, config_src)
            
            if not src_path:
                print(f"  [ERROR] No source found for {variant_name}")
                continue
                
            if is_clean:
                char_stats["clean"] += 1
                stats["clean"] += 1
                src_label = "CLEAN"
            else:
                char_stats["fallback"] += 1
                stats["fallback"] += 1
                src_label = "FALLBACK"
                
            key = f"{char_id}/{variant_name}"
            h = manifest_utils.get_file_hash(src_path)
            
            if not force and manifest["assets"].get(key, {}).get("hash") == h:
                print(f"  [SKIP] {variant_name} ({src_label})")
                char_stats["skip"] += 1
                stats["skip"] += 1
                continue

            print(f"  [PROCESS] {variant_name} ({src_label}) -> {src_path.name}")
            if process_character_asset(char_id, variant_name, src_path, v_config.get("faceCrop")):
                manifest["assets"][key] = {
                    "hash": h, 
                    "source": str(src_path), 
                    "is_clean": is_clean,
                    "updated_at": os.path.getmtime(src_path)
                }
                char_stats["regenerate"] += 1
                stats["regenerate"] += 1
                any_updated = True
        
        stats["per_char"][char_id] = char_stats
        print(f"  Summary: clean={char_stats['clean']}, fallback={char_stats['fallback']}, skip={char_stats['skip']}, processed={char_stats['regenerate']}")

    if any_updated: 
        manifest_utils.save_manifest(manifest)
        print("\nManifest updated.")

    print("\n=== Final Asset Processing Report ===")
    print(f"Total Source Clean detected: {stats['clean']}")
    print(f"Total Source Fallback used:   {stats['fallback']}")
    print(f"Total Assets Skipped:         {stats['skip']}")
    print(f"Total Assets Regenerated:     {stats['regenerate']}")
    print("\nDetailed Per-Character Breakdown:")
    for cid, s in stats["per_char"].items():
        print(f" - {cid:8}: clean={s['clean']:2}, fallback={s['fallback']:2}, skip={s['skip']:2}, regen={s['regenerate']:2}")
    print("=====================================\n")

if __name__ == "__main__": 
    main()
