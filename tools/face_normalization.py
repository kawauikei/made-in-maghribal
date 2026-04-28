import os
import cv2
import numpy as np
from PIL import Image
from pathlib import Path

# Configuration
CHARACTERS = ["hakima", "mira", "dariya", "nader"]
EXPRESSIONS = ["normal", "joy", "anger", "cry", "fun", "surprise", "sorrow"]
BASE_DIR = Path("public/characters")
OUTPUT_SUBDIR = "face_proc"
SOURCE_SUBDIR = "standing"
TARGET_SIZE = (256, 256)

# Manually identified face centers (in percentage of 1024px)
FACE_CENTERS = {
    "hakima": (0.50, 0.24),
    "mira":   (0.46, 0.23),
    "dariya": (0.52, 0.17),
    "nader":  (0.50, 0.19)
}

# Color tolerance
THRESHOLD = 50

def remove_background_auto(cv_img):
    """
    Detects background color from corners and replaces it with transparency.
    """
    h, w = cv_img.shape[:2]
    # Sample corners (top-left, top-right, bottom-left, bottom-right)
    corners = [
        cv_img[0, 0],
        cv_img[0, w-1],
        cv_img[h-1, 0],
        cv_img[h-1, w-1]
    ]
    # Use the most frequent color or just top-left if they are similar
    bg_color = corners[0]
    
    # Convert to BGRA
    bgra = cv2.cvtColor(cv_img, cv2.COLOR_BGR2BGRA)
    
    # Define range based on sampled color
    lower = np.array([max(0, int(c) - THRESHOLD) for c in bg_color] + [255])
    upper = np.array([min(255, int(c) + THRESHOLD) for c in bg_color] + [255])
    
    # Create mask
    mask = cv2.inRange(bgra, lower, upper)
    
    # Set alpha to 0 where mask is active
    bgra[mask > 0, 3] = 0
    
    return bgra

def process_character(char_id):
    print(f"Processing character: {char_id}")
    src_dir = BASE_DIR / char_id / SOURCE_SUBDIR
    out_dir = BASE_DIR / char_id / OUTPUT_SUBDIR
    out_dir.mkdir(parents=True, exist_ok=True)
    
    center_x_pct, center_y_pct = FACE_CENTERS.get(char_id, (0.5, 0.25))
    
    for expr in EXPRESSIONS:
        src_path = src_dir / f"{expr}.png"
        if not src_path.exists():
            src_path = src_dir / "default.png"
            if not src_path.exists():
                src_path = src_dir / f"{expr}.webp"
                if not src_path.exists():
                    continue
        
        # Load image
        img = cv2.imread(str(src_path))
        if img is None:
            continue
            
        h, w = img.shape[:2]
        cx, cy = int(w * center_x_pct), int(h * center_y_pct)
        
        # Crop size (approx 35% of height for a good face-up)
        # For Dariya and Nader who are taller, we might need smaller side or lower cy
        side = int(h * 0.35) 
        
        nx = max(0, cx - side//2)
        ny = max(0, cy - side//2)
        
        if nx + side > w: nx = w - side
        if ny + side > h: ny = h - side
        nx = max(0, nx)
        ny = max(0, ny)
        
        # Crop
        crop = img[ny:ny+side, nx:nx+side]
        
        # Remove background (detecting color from original image corners first)
        # But for crop, we should use the color from the ORIGINAL image corners
        # because the crop might not contain corners.
        h_orig, w_orig = img.shape[:2]
        bg_color = img[0, 0] # Top-left of original
        
        # Convert crop to BGRA
        bgra_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2BGRA)
        lower = np.array([max(0, int(c) - THRESHOLD) for c in bg_color] + [255])
        upper = np.array([min(255, int(c) + THRESHOLD) for c in bg_color] + [255])
        mask = cv2.inRange(bgra_crop, lower, upper)
        bgra_crop[mask > 0, 3] = 0
        
        # Resize to 256x256
        final_img = cv2.resize(bgra_crop, TARGET_SIZE, interpolation=cv2.INTER_LANCZOS4)
        
        # Save
        out_path = out_dir / f"{expr}.png"
        cv2.imwrite(str(out_path), final_img)
        print(f"  Saved: {out_path}")

def main():
    for char in CHARACTERS:
        process_character(char)
    print("\nNormalization complete.")

if __name__ == "__main__":
    main()
