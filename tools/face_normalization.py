import os
import cv2
import numpy as np
from PIL import Image
from pathlib import Path

# Configuration
CHARACTERS = ["hakima", "mira", "dariya", "nader"]
EXPRESSIONS = ["normal", "joy", "anger", "cry", "fun", "surprise", "sorrow"]
BASE_DIR = Path("public/characters")
FACE_SUBDIR = "face_proc"
STANDING_SUBDIR = "standing"
STANDING_PROC_SUBDIR = "standing_proc"
FACE_SIZE = (256, 256)
STANDING_PROC_SIZE = (640, 640)

FACE_CENTERS = {
    "hakima": (0.50, 0.24),
    "mira":   (0.46, 0.23),
    "dariya": (0.52, 0.20), # Moved down
    "nader":  (0.50, 0.19)
}

FACE_SCALE_FACTORS = {
    "hakima": 0.35,
    "mira":   0.35,
    "dariya": 0.24, # Zoomed in
    "nader":  0.35
}

# Color tolerance - Increased for better fringe removal
THRESHOLD = 60 

def remove_background(cv_img, bg_color, char_id, debug_prefix=None):
    """
    Advanced hybrid background removal.
    1. Finds outer connected background (SAFE BASE).
    2. Identifies enclosed holes and filters them by size/color/location.
    3. Protects character internal regions (skin/face).
    """
    h, w = cv_img.shape[:2]
    bgra = cv2.cvtColor(cv_img, cv2.COLOR_BGR2BGRA)
    
    # --- A. Outer Connected Background ---
    lower_wide = np.array([max(0, int(c) - THRESHOLD) for c in bg_color])
    upper_wide = np.array([min(255, int(c) + THRESHOLD) for c in bg_color])
    mask_wide = cv2.inRange(cv_img, lower_wide, upper_wide)
    
    flood_img = mask_wide.copy()
    temp_mask = np.zeros((h + 2, w + 2), np.uint8)
    
    # Dense perimeter seeds to catch background regions split by the character
    seeds = []
    # Every 10px along all four edges for maximum coverage
    for x in range(0, w, 10):
        seeds.append((x, 0))
        seeds.append((x, h-1))
    for y in range(0, h, 10):
        seeds.append((0, y))
        seeds.append((w-1, y))
    seeds += [(w-1, 0), (0, h-1), (w-1, h-1), (w//2, 0), (w//2, h-1), (0, h//2), (w-1, h//2)]

    for sx, sy in seeds:
        if flood_img[sy, sx] == 255:
            cv2.floodFill(flood_img, temp_mask, (sx, sy), 128)
    
    outer_mask = np.zeros((h, w), np.uint8)
    outer_mask[flood_img == 128] = 255
    
    # --- B. Enclosed Hole Identification ---
    enclosed_candidates = cv2.bitwise_and(mask_wide, cv2.bitwise_not(outer_mask))
    
    # Catching "Pure Magenta" variance (especially for JPEG sources)
    lower_magenta = np.array([100, 0, 120], dtype=np.uint8)
    upper_magenta = np.array([255, 140, 255], dtype=np.uint8)
    mask_pure_magenta = cv2.inRange(cv_img, lower_magenta, upper_magenta)
    enclosed_candidates = cv2.bitwise_or(enclosed_candidates, cv2.bitwise_and(mask_pure_magenta, cv2.bitwise_not(outer_mask)))

    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(enclosed_candidates, connectivity=8)
    safe_holes_mask = np.zeros((h, w), np.uint8)
    
    cx_pct, cy_pct = FACE_CENTERS.get(char_id, (0.5, 0.25))
    face_x, face_y = int(w * cx_pct), int(h * cy_pct)
    # Protection radius for the head/neck area
    face_protection_radius = int(min(h, w) * 0.22) 
    
    if debug_prefix:
        print(f"  Diagnosing holes for {char_id} ({debug_prefix}):")

    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        cx, cy = centroids[i]
        
        comp_mask = (labels == i).astype(np.uint8) * 255
        mean_val = cv2.mean(cv_img, mask=comp_mask)[:3]
        color_dist = np.sqrt(sum((c1 - c2)**2 for c1, c2 in zip(mean_val, bg_color)))
        
        dist_to_face = np.sqrt((cx - face_x)**2 + (cy - face_y)**2)
        
        # BGR: [B, G, R]
        is_pure_magenta = (mean_val[1] < 130) and (mean_val[2] > 120) and (mean_val[0] > 100)
        
        is_too_small = area < 8
        is_too_big = area > (h * w * 0.35)
        is_in_face_zone = dist_to_face < face_protection_radius
        
        # VERY RELAXED for background holes that are far from face and look like background
        # (Using 2.0x THRESHOLD if far from face)
        threshold_multiplier = 1.3 if is_in_face_zone else 2.5
        if is_pure_magenta and not is_in_face_zone:
             threshold_multiplier = 3.5 # Extreme relaxation for pure magenta background holes
             
        dist_threshold = THRESHOLD * threshold_multiplier
        is_color_mismatch = color_dist >= dist_threshold
        
        if not (is_too_small or is_too_big or (is_in_face_zone and is_color_mismatch)):
            # If it's in the face zone, we are strict. If it's outside, we are loose.
            if is_in_face_zone:
                 if not is_color_mismatch:
                     safe_holes_mask = cv2.bitwise_or(safe_holes_mask, comp_mask)
            else:
                 # Outside face zone, if it's reasonably background-like or pure magenta, take it
                 if not is_color_mismatch or is_pure_magenta:
                     safe_holes_mask = cv2.bitwise_or(safe_holes_mask, comp_mask)
                     
        elif area > 100:
            print(f"    Rejected {i}: area={area}, face_dist={dist_to_face:.1f}, dist={color_dist:.1f}, face_zone={is_in_face_zone}")
            
    # --- C. Character Protection ---
    hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
    # 1. Skin Mask
    lower_skin = np.array([0, 25, 50], dtype=np.uint8)
    upper_skin = np.array([35, 255, 255], dtype=np.uint8)
    skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
    
    # 2. Vibrant Color Protection (Protect saturated colors that aren't magenta background)
    # Magenta Background H is ~150. S is high.
    # We want to protect H in [0-140] and [160-180] if S is very high.
    vibrant_mask = cv2.inRange(hsv, np.array([0, 150, 50]), np.array([140, 255, 255]))
    vibrant_mask = cv2.bitwise_or(vibrant_mask, cv2.inRange(hsv, np.array([165, 150, 50]), np.array([180, 255, 255])))
    
    protection_mask = cv2.bitwise_or(skin_mask, vibrant_mask)
    
    # Final Background Mask
    final_mask = cv2.bitwise_or(outer_mask, safe_holes_mask)
    # Apply Protection
    final_mask = cv2.bitwise_and(final_mask, cv2.bitwise_not(protection_mask))


    
    # --- E. Edge Cleanup (Dilation) ---
    kernel = np.ones((3, 3), np.uint8)
    final_mask = cv2.dilate(final_mask, kernel, iterations=1)
    
    # Apply Alpha
    bgra[final_mask > 0, 3] = 0
    
    # --- F. Debug Output (Optional) ---
    if debug_prefix:
        debug_dir = Path("scratch/debug_masks")
        debug_dir.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(debug_dir / f"{debug_prefix}_outer.png"), outer_mask)
        cv2.imwrite(str(debug_dir / f"{debug_prefix}_holes.png"), safe_holes_mask)
        cv2.imwrite(str(debug_dir / f"{debug_prefix}_skin.png"), skin_mask)
        cv2.imwrite(str(debug_dir / f"{debug_prefix}_final.png"), final_mask)
        
    return bgra


def process_character(char_id):
    print(f"Processing character: {char_id}")
    src_dir = BASE_DIR / char_id / STANDING_SUBDIR
    face_out_dir = BASE_DIR / char_id / FACE_SUBDIR
    standing_out_dir = BASE_DIR / char_id / STANDING_PROC_SUBDIR
    
    face_out_dir.mkdir(parents=True, exist_ok=True)
    standing_out_dir.mkdir(parents=True, exist_ok=True)
    
    center_x_pct, center_y_pct = FACE_CENTERS.get(char_id, (0.5, 0.25))
    face_scale = FACE_SCALE_FACTORS.get(char_id, 0.35)
    
    for expr in EXPRESSIONS:
        src_path = src_dir / f"{expr}.png"
        if not src_path.exists():
            src_path = src_dir / "default.png"
            if not src_path.exists():
                src_path = src_dir / f"{expr}.webp"
                if not src_path.exists():
                    continue
        
        img = cv2.imread(str(src_path))
        if img is None: continue
            
        h, w = img.shape[:2]
        cx, cy = int(w * center_x_pct), int(h * center_y_pct)
        
        # Sample background from multiple corners for robustness
        bg_samples = [img[0, 0], img[0, w-1], img[h-1, 0], img[h-1, w-1]]
        bg_color = np.mean(bg_samples, axis=0).astype(np.uint8)
        
        # --- REMOVE BACKGROUND ---
        # Debug only for normal expression to avoid clutter
        debug_prefix = f"{char_id}_{expr}" if expr == "normal" else None
        transparent_full = remove_background(img, bg_color, char_id, debug_prefix)

        # --- FACE PROC ---
        face_side = int(h * face_scale)
        fx = max(0, cx - face_side//2)
        fy = max(0, cy - face_side//2)
        if fx + face_side > w: fx = w - face_side
        if fy + face_side > h: fy = h - face_side
        fx, fy = max(0, fx), max(0, fy)
        
        face_crop = transparent_full[fy:fy+face_side, fx:fx+face_side]
        final_face = cv2.resize(face_crop, FACE_SIZE, interpolation=cv2.INTER_LANCZOS4)
        cv2.imwrite(str(face_out_dir / f"{expr}.png"), final_face)
        
        # --- STANDING PROC ---
        standing_side = int(h * 0.75) 
        scx, scy = cx, cy + int(h * 0.18) 
        
        sx = max(0, scx - standing_side//2)
        sy = max(0, scy - standing_side//2)
        if sx + standing_side > w: sx = w - standing_side
        if sy + standing_side > h: sy = h - standing_side
        sx, sy = max(0, sx), max(0, sy)
        
        standing_crop = transparent_full[sy:sy+standing_side, sx:sx+standing_side]
        final_standing = cv2.resize(standing_crop, STANDING_PROC_SIZE, interpolation=cv2.INTER_LANCZOS4)
        cv2.imwrite(str(standing_out_dir / f"{expr}.png"), final_standing)
        
        print(f"  Processed: {expr}")



def main():
    for char in CHARACTERS:
        process_character(char)
    print("\nNormalization complete with improved fringe removal.")

if __name__ == "__main__":
    main()
