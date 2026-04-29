
import os
import cv2
import numpy as np
from pathlib import Path
import json
import sys

# Import manifest utils from same directory
sys.path.append(str(Path(__file__).parent))
import manifest_utils

# Configuration
CONFIG_PATH = Path("tools/character_asset_pipeline/character_asset_config.json")
BASE_DIR = Path("public/characters")
FACE_SUBDIR = "face_proc"
STANDING_SUBDIR = "standing"
STANDING_PROC_SUBDIR = "standing_proc"
FACE_SIZE = (256, 256)
STANDING_PROC_SIZE = (640, 640)

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
    # Skin color protection (HSV)
    hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
    lower_skin = np.array([0, 15, 60], dtype=np.uint8)
    upper_skin = np.array([30, 255, 255], dtype=np.uint8)
    skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
    
    # Face zone circle
    face_zone = np.zeros((h, w), np.uint8)
    cv2.circle(face_zone, (fx, fy), face_protection_radius, 255, -1)
    
    # Final synthesis:
    # 1. Start with outer background
    final_mask = outer_mask.copy()
    # 2. Add safe holes
    final_mask = cv2.bitwise_or(final_mask, safe_holes_mask)
    # 3. SUBTRACT skin protection everywhere
    final_mask = cv2.bitwise_and(final_mask, cv2.bitwise_not(skin_mask))
    # 4. SUBTRACT face zone from "low confidence" areas (not edge-connected)
    # Actually, let's keep it simple: just don't cut skin or too deep into face.
    
    # Apply Alpha
    bgra[final_mask > 0, 3] = 0
    return bgra

def check_alpha_integrity(bgra_img):
    h, w = bgra_img.shape[:2]
    alpha = bgra_img[:, :, 3]
    center_alpha = alpha[h//3:2*h//3, w//3:2*w//3]
    return np.sum(center_alpha < 255) / center_alpha.size

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
    if alpha_loss > 0.001: print(f"  [WARN] {char_id}/{variant_name} center alpha loss: {alpha_loss:.2%}")

    out_dirs = {"face": BASE_DIR/char_id/FACE_SUBDIR, "standing": BASE_DIR/char_id/STANDING_PROC_SUBDIR}
    for d in out_dirs.values(): d.mkdir(parents=True, exist_ok=True)

    if char_id != "common":
        side = int(h * 0.35)
        fx_i, fy_i = int(max(0, cx-side/2)), int(max(0, cy-side/2))
        face_crop = transparent_full[fy_i:fy_i+side, fx_i:fx_i+side]
        cv2.imwrite(str(out_dirs["face"]/f"{variant_name}.png"), cv2.resize(face_crop, FACE_SIZE, interpolation=cv2.INTER_LANCZOS4))
    
    target_h = STANDING_PROC_SIZE[1]
    cv2.imwrite(str(out_dirs["standing"]/f"{variant_name}.png"), cv2.resize(transparent_full, (int(target_h*(w/h)), target_h), interpolation=cv2.INTER_LANCZOS4))
    return True

def main():
    force = "--force" in sys.argv
    if not CONFIG_PATH.exists(): return
    with open(CONFIG_PATH, "r", encoding="utf-8") as f: asset_config = json.load(f)
    manifest = manifest_utils.load_manifest()
    any_updated = False
    for char_id, config in asset_config.items():
        print(f"Processing character: {char_id}")
        for variant_name, v_config in config.get("variants", {}).items():
            src_path = Path(v_config.get("sourcePath", ""))
            if not src_path.exists(): continue
            key = f"{char_id}/{variant_name}"
            h = manifest_utils.get_file_hash(src_path)
            if not force and manifest["assets"].get(key, {}).get("hash") == h:
                print(f"  [SKIP] {variant_name}"); continue
            print(f"  [PROCESS] {variant_name}...")
            if process_character_asset(char_id, variant_name, src_path, v_config.get("faceCrop")):
                manifest["assets"][key] = {"hash": h, "source": str(src_path), "updated_at": os.path.getmtime(src_path)}
                any_updated = True
    if any_updated: manifest_utils.save_manifest(manifest)

if __name__ == "__main__": main()
