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
    seeds = [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1), (w//2, 0), (w//2, h-1), (0, h//2), (w-1, h//2)]
    for sx, sy in seeds:
        if flood_img[sy, sx] == 255:
            cv2.floodFill(flood_img, temp_mask, (sx, sy), 128)
    
    outer_mask = np.zeros((h, w), np.uint8)
    outer_mask[flood_img == 128] = 255
    
    # --- B. Enclosed Hole Identification ---
    # Background-like pixels that were NOT connected to the border
    enclosed_candidates = cv2.bitwise_and(mask_wide, cv2.bitwise_not(outer_mask))
    
    # Filter enclosed holes using Connected Components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(enclosed_candidates, connectivity=8)
    safe_holes_mask = np.zeros((h, w), np.uint8)
    
    # Face Protection Zone (No holes allowed here)
    cx_pct, cy_pct = FACE_CENTERS.get(char_id, (0.5, 0.25))
    face_x, face_y = int(w * cx_pct), int(h * cy_pct)
    # Radius depends on whether it's a crop or full image
    face_protection_radius = int(min(h, w) * 0.15) 
    
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        
        # Filter 1: Size
        if area < 15: continue # Ignore noise
        if area > (h * w * 0.05): continue # Too big for an enclosed hole (max 5%)
        
        # Filter 2: Position (Avoid face center)
        dist_to_face = np.sqrt((centroids[i][0] - face_x)**2 + (centroids[i][1] - face_y)**2)
        if dist_to_face < face_protection_radius:
            continue
            
        # Filter 3: Color Similarity (Mean color of the hole component)
        comp_mask = (labels == i).astype(np.uint8) * 255
        mean_val = cv2.mean(cv_img, mask=comp_mask)[:3]
        color_dist = np.sqrt(sum((c1 - c2)**2 for c1, c2 in zip(mean_val, bg_color)))
        
        if color_dist < THRESHOLD * 0.7: # Tighter for internal holes
            safe_holes_mask = cv2.bitwise_or(safe_holes_mask, comp_mask)
            
    # --- C. Character Protection Mask (Skin) ---
    hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
    lower_skin = np.array([0, 20, 70], dtype=np.uint8)
    upper_skin = np.array([25, 255, 255], dtype=np.uint8)
    skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
    
    # --- D. Final Background Mask Assembly ---
    final_mask = cv2.bitwise_or(outer_mask, safe_holes_mask)
    # Remove protected skin areas from transparency
    final_mask = cv2.bitwise_and(final_mask, cv2.bitwise_not(skin_mask))
    
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
