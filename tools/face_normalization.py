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

def remove_background(cv_img, bg_color):
    """
    Advanced background removal with fringe cleanup.
    """
    # Convert to BGRA
    bgra = cv2.cvtColor(cv_img, cv2.COLOR_BGR2BGRA)
    
    # Range-based mask
    lower = np.array([max(0, int(c) - THRESHOLD) for c in bg_color] + [255])
    upper = np.array([min(255, int(c) + THRESHOLD) for c in bg_color] + [255])
    mask = cv2.inRange(bgra, lower, upper)
    
    # Post-process mask: Erode to pull the transparency "into" the character slightly
    # This helps remove the colored fringe.
    kernel = np.ones((3, 3), np.uint8)
    # Actually, we want to expand the 'background' area, so we Dilate the mask
    mask = cv2.dilate(mask, kernel, iterations=1)
    
    # Set alpha
    bgra[mask > 0, 3] = 0
    
    # Optional: Color Decontamination
    # For pixels that are still somewhat opaque, if they are very close to bg_color, 
    # we can try to desaturate them or shift them.
    # But for now, dilation should catch most of it.
    
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
        
        # --- FACE PROC ---
        face_side = int(h * face_scale)
        fx = max(0, cx - face_side//2)
        fy = max(0, cy - face_side//2)
        if fx + face_side > w: fx = w - face_side
        if fy + face_side > h: fy = h - face_side
        fx, fy = max(0, fx), max(0, fy)
        
        face_crop = img[fy:fy+face_side, fx:fx+face_side]
        transparent_face = remove_background(face_crop, bg_color)
        final_face = cv2.resize(transparent_face, FACE_SIZE, interpolation=cv2.INTER_LANCZOS4)
        cv2.imwrite(str(face_out_dir / f"{expr}.png"), final_face)
        
        # --- STANDING PROC ---
        standing_side = int(h * 0.75) # Slightly larger for better bust-up
        scx, scy = cx, cy + int(h * 0.18) # Shift down more
        
        sx = max(0, scx - standing_side//2)
        sy = max(0, scy - standing_side//2)
        if sx + standing_side > w: sx = w - standing_side
        if sy + standing_side > h: sy = h - standing_side
        sx, sy = max(0, sx), max(0, sy)
        
        standing_crop = img[sy:sy+standing_side, sx:sx+standing_side]
        transparent_standing = remove_background(standing_crop, bg_color)
        final_standing = cv2.resize(transparent_standing, STANDING_PROC_SIZE, interpolation=cv2.INTER_LANCZOS4)
        cv2.imwrite(str(standing_out_dir / f"{expr}.png"), final_standing)
        
        print(f"  Processed: {expr}")

def main():
    for char in CHARACTERS:
        process_character(char)
    print("\nNormalization complete with improved fringe removal.")

if __name__ == "__main__":
    main()
