
import os
import cv2
import numpy as np
from pathlib import Path
import json
import sys
import time

# Import manifest utils
sys.path.append(str(Path(__file__).parent))
import manifest_utils

# Processor Version - V25 (Bustup + D2-Norm Face)
PROCESSOR_VERSION = "V25"

# Configuration
CONFIG_PATH = Path("tools/character_asset_pipeline/character_asset_config.json")
SOURCE_CLEAN_ROOT = Path("tools/character_asset_pipeline/source_clean")
BASE_DIR = Path("public/characters")
FACE_SUBDIR = "face_proc"
STANDING_PROC_SUBDIR = "standing_proc"
BUSTUP_PROC_SUBDIR = "bustup_proc"
FACE_SIZE = (256, 256)
STANDING_PROC_SIZE = (640, 640)
BUSTUP_PROC_SIZE = (480, 640)
STANDARDS_PATH = Path("tools/character_asset_pipeline/standing_normalization_config.json")

CHAR_FOLDER_MAP = {"hakima": "01_Hakima", "mira": "02_Mira", "dariya": "03_Dariya", "nader": "04_Nader", "common": "00_common"}
ALLOWED_EXTENSIONS = [".jpeg", ".jpg", ".png", ".webp"]

def remove_background_v16(img):
    h, w = img.shape[:2]
    # Sample background color profile from corners
    corners = np.concatenate([
        img[:10, :10], img[:10, -10:], 
        img[-10:, :10], img[-10:, -10:]
    ]).reshape(-1, 3)
    bg_median = np.median(corners, axis=0).astype(np.float32)
    
    # 1. Main Background Identification (Outer)
    # Seed fill from corners to find the obvious background
    diff = np.abs(img.astype(np.float32) - bg_median)
    dist = np.sqrt(np.sum(diff**2, axis=2))
    
    # Strict threshold for seeds
    seeds = (dist < 40).astype(np.uint8) * 255
    flood_mask = np.zeros((h + 2, w + 2), np.uint8)
    for sx, sy in [(0,0), (w-1,0), (0,h-1), (w-1,h-1)]:
        if seeds[sy, sx] > 0:
            cv2.floodFill(seeds, flood_mask, (sx, sy), 128)
    is_outer_bg = (seeds == 128)
    
    # 2. Island Detection
    # Potential background
    potential_bg_mask = (dist < 80).astype(np.uint8) * 255
    
    # Core Protection Mask (roughly center of character)
    core_mask = np.zeros((h, w), np.uint8)
    cv2.rectangle(core_mask, (int(w*0.25), int(h*0.15)), (int(w*0.75), int(h*0.85)), 1, -1)
    
    # Connectivity analysis on potential background
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(potential_bg_mask, connectivity=4)
    
    alpha = np.full((h, w), 255, dtype=np.uint8)
    alpha[is_outer_bg] = 0
    
    # For all other components, check if they are islands
    for i in range(1, num_labels):
        x, y, cw, ch, area = stats[i]
        if area < 10: continue
        
        mask_i = (labels == i)
        if np.any(is_outer_bg[mask_i]):
            alpha[mask_i] = 0
            continue
            
        # Median color profile
        comp_pixels = img[mask_i]
        comp_median = np.median(comp_pixels, axis=0).astype(np.float32)
        comp_dist = np.sqrt(np.sum((comp_median - bg_median)**2))
        
        # Check if component overlaps with core character area
        in_core = np.any(core_mask[mask_i])
        
        # Thresholding logic:
        # If in core, be VERY strict (must be almost perfect match or pure magenta)
        # If outside core, be a bit more relaxed to catch fringes
        b_c, g_c, r_c = comp_median
        is_pure_magenta = (r_c > 240) and (b_c > 230) and (g_c < 60)
        
        if in_core:
            if comp_dist < 20 or is_pure_magenta:
                alpha[mask_i] = 0
        else:
            if comp_dist < 55 or is_pure_magenta:
                alpha[mask_i] = 0
            
    # Final smoothing of alpha
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
    
    b, g, r = cv2.split(img)
    return cv2.merge([b, g, r, alpha])

# Global FaceAnalysis singleton
FACE_APP = None
def get_face_app():
    global FACE_APP
    if FACE_APP is None:
        from insightface.app import FaceAnalysis
        FACE_APP = FaceAnalysis(providers=['CPUExecutionProvider'])
        FACE_APP.prepare(ctx_id=0, det_size=(640, 640))
    return FACE_APP

def generate_bustup_v25(bgra, char_id, variant, out_dir, standards):
    """
    Generates 3:4 bust-up using InsightFace + Manual Standards
    """
    if char_id not in standards["standards"]:
        return False
    
    std = standards["standards"][char_id]
    app = get_face_app()
    
    # Use BGR for detection (InsightFace likes it)
    b, g, r, a = cv2.split(bgra)
    bgr = cv2.merge([b, g, r])
    
    faces = app.get(bgr)
    if not faces:
        print(f"      [WARN] No face detected for {char_id}/{variant}. Skipping bustup.")
        return False
        
    faces = sorted(faces, key=lambda f: (f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]), reverse=True)
    f = faces[0]
    
    if f.det_score < 0.6:
        print(f"      [WARN] Low confidence ({f.det_score:.2f}) for {char_id}/{variant}. Audit needed.")
    
    bx, by, bw, bh = f.bbox[0], f.bbox[1], f.bbox[2]-f.bbox[0], f.bbox[3]-f.bbox[1]
    cx, cy = bx + bw/2, by + bh/2
    
    target_w, target_h = BUSTUP_PROC_SIZE
    scale = std["target_bbox_h"] / bh
    dx = std["target_face_x"] - (cx * scale)
    dy = std["target_face_y"] - (cy * scale)
    
    M = np.float32([[scale, 0, dx], [0, scale, dy]])
    bustup = cv2.warpAffine(bgra, M, (target_w, target_h), borderValue=(0,0,0,0))
    
    out_dir.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out_dir/f"{variant}.png"), bustup)
    return True

def process_v25(char_id, variant, src_p, v_config, is_clean, standards):
    img = cv2.imread(str(src_p))
    if img is None: return False
    h, w = img.shape[:2]
    
    # Background Removal
    bgra = remove_background_v16(img)
    
    # 1. Face Icon (Legacy/Config Based for now, but targeting V25)
    crop = v_config.get("faceCrop", {"x": 300, "y": 150, "w": 400, "h": 400})
    scale = 2.0 if is_clean else 1.0
    
    fx, fy = int(crop["x"] * scale), int(crop["y"] * scale)
    fw, fh = int(crop["w"] * scale), int(crop["h"] * scale)
    
    out_dirs = {
        "face": BASE_DIR/char_id/FACE_SUBDIR, 
        "standing": BASE_DIR/char_id/STANDING_PROC_SUBDIR,
        "bustup": BASE_DIR/char_id/BUSTUP_PROC_SUBDIR
    }
    for d in out_dirs.values(): d.mkdir(parents=True, exist_ok=True)
    
    if char_id != "common":
        # Face Crop
        tfx = max(0, min(w - 1, fx))
        tfy = max(0, min(h - 1, fy))
        tfw = min(fw, w - tfx)
        tfh = min(fh, h - tfy)
        
        face_img = bgra[tfy:tfy+tfh, tfx:tfx+tfw]
        if face_img.size > 0:
            cv2.imwrite(str(out_dirs["face"]/f"{variant}.png"), cv2.resize(face_img, FACE_SIZE, interpolation=cv2.INTER_LANCZOS4))
            
        # Bustup (InsightFace Based)
        generate_bustup_v25(bgra, char_id, variant, out_dirs["bustup"], standards)
    
    # 2. Standing (Maintain Legacy Aspect Ratio/Resize)
    th = STANDING_PROC_SIZE[1]
    cv2.imwrite(str(out_dirs["standing"]/f"{variant}.png"), cv2.resize(bgra, (int(th*(w/h)), th), interpolation=cv2.INTER_LANCZOS4))
    
    print(f"    [SUCCESS] Processed {variant} ({PROCESSOR_VERSION}) | is_clean={is_clean}")
    return True

def find_best_source(char_id, variant, config_path):
    f_name = CHAR_FOLDER_MAP.get(char_id)
    if f_name:
        for ext in ALLOWED_EXTENSIONS:
            p = SOURCE_CLEAN_ROOT / f_name / f"{variant}{ext}"
            if p.exists(): return p, True
    p = Path(config_path); return (p, False) if p.exists() else (None, False)

BUSTUP_MANIFEST_PATH = Path("tools/character_asset_pipeline/bustup_manifest.json")

def main():
    force = "--force" in sys.argv
    bustup_only = "--bustup-only" in sys.argv
    
    config_file = CONFIG_PATH
    if "--config" in sys.argv:
        idx = sys.argv.index("--config")
        if idx + 1 < len(sys.argv):
            config_file = Path(sys.argv[idx + 1])
            
    if not config_file.exists(): return
    with open(config_file, "r", encoding="utf-8") as f: asset_config = json.load(f)
    
    standards = {}
    if STANDARDS_PATH.exists():
        with open(STANDARDS_PATH, "r", encoding="utf-8") as f: standards = json.load(f)
    
    manifest = manifest_utils.load_manifest()
    
    # Load bustup manifest
    bustup_manifest = {"assets": {}}
    if BUSTUP_MANIFEST_PATH.exists():
        with open(BUSTUP_MANIFEST_PATH, "r", encoding="utf-8") as f:
            bustup_manifest = json.load(f)

    stats = {"skip": 0, "regen": 0, "fail": 0}
    print(f"\n--- Character Asset Pipeline ({PROCESSOR_VERSION}: {'Bustup ONLY' if bustup_only else 'Full Update'}) ---")
    
    for char_id, config in asset_config.items():
        print(f"\nCharacter: [{char_id}]")
        for variant, v_config in config.get("variants", {}).items():
            src_p, is_clean = find_best_source(char_id, variant, v_config.get("sourcePath", ""))
            if not src_p: stats["fail"] += 1; continue
            
            key = f"{char_id}/{variant}"
            h = manifest_utils.get_file_hash(src_p)
            
            # Skip logic
            if bustup_only:
                m_entry = bustup_manifest["assets"].get(key, {})
                if not force and m_entry.get("hash") == h and m_entry.get("processor_version") == PROCESSOR_VERSION:
                    stats["skip"] += 1; continue
            else:
                m_entry = manifest["assets"].get(key, {})
                if not force and m_entry.get("hash") == h and m_entry.get("processor_version") == PROCESSOR_VERSION:
                    stats["skip"] += 1; continue
                
            print(f"  [PROCESS] {variant} (source_clean={is_clean})")
            
            if bustup_only:
                img = cv2.imread(str(src_p))
                if img is None: stats["fail"] += 1; continue
                bgra = remove_background_v16(img)
                out_dir = BASE_DIR / char_id / BUSTUP_PROC_SUBDIR
                success = generate_bustup_v25(bgra, char_id, variant, out_dir, standards)
            else:
                success = process_v25(char_id, variant, src_p, v_config, is_clean, standards)
                
            if success:
                entry = {
                    "hash": h, 
                    "processor_version": PROCESSOR_VERSION,
                    "source": str(src_p), 
                    "is_clean": is_clean, 
                    "updated_at": time.time()
                }
                if bustup_only:
                    bustup_manifest["assets"][key] = entry
                else:
                    manifest["assets"][key] = entry
                    # In full mode, we assume bustup is also updated
                    bustup_manifest["assets"][key] = entry
                stats["regen"] += 1
            else: stats["fail"] += 1
            
    if stats["regen"] > 0:
        if not bustup_only:
            manifest_utils.save_manifest(manifest)
        with open(BUSTUP_MANIFEST_PATH, "w", encoding="utf-8") as f:
            json.dump(bustup_manifest, f, indent=2)
            
    print(f"\nFinal: skip={stats['skip']}, regen={stats['regen']}, fail={stats['fail']}")

if __name__ == "__main__": main()
