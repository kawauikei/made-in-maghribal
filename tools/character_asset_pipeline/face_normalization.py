
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
    """
    V16.4 background removal.

    Fixes small enclosed magenta background islands that can appear around
    fingers / sleeves after tighter D2-Norm face crops, while keeping the
    original V16 outer-background behavior.
    """
    h, w = img.shape[:2]

    # Sample background color profile from corners.
    corners = np.concatenate([
        img[:10, :10], img[:10, -10:],
        img[-10:, :10], img[-10:, -10:]
    ]).reshape(-1, 3)
    bg_median = np.median(corners, axis=0).astype(np.float32)
    b_bg, g_bg, r_bg = bg_median

    diff = np.abs(img.astype(np.float32) - bg_median)
    dist = np.sqrt(np.sum(diff ** 2, axis=2))

    # 1. Main background identification.
    # The old version flooded only from four corners.  That misses thin edge
    # gaps when a character nearly touches a border, so seed from all edges.
    seeds = (dist < 45).astype(np.uint8) * 255
    flood_mask = np.zeros((h + 2, w + 2), np.uint8)

    edge_points = []
    step = 8
    for x in range(0, w, step):
        edge_points.append((x, 0))
        edge_points.append((x, h - 1))
    for y in range(0, h, step):
        edge_points.append((0, y))
        edge_points.append((w - 1, y))
    edge_points.extend([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])

    for sx, sy in edge_points:
        if seeds[sy, sx] == 255:
            cv2.floodFill(seeds, flood_mask, (sx, sy), 128)
    is_outer_bg = (seeds == 128)

    # 2. Island detection for enclosed background holes.
    # Use a relaxed mask for components, then decide component-by-component
    # using median color.  This catches magenta islands between fingers.
    potential_bg_mask = (dist < 105).astype(np.uint8) * 255
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
        potential_bg_mask, connectivity=4
    )

    alpha = np.full((h, w), 255, dtype=np.uint8)
    alpha[is_outer_bg] = 0

    # Keep the old "core" idea, but allow small/medium magenta-like islands
    # inside the core to be removed when they match the sampled background.
    core_mask = np.zeros((h, w), np.uint8)
    cv2.rectangle(core_mask, (int(w * 0.20), int(h * 0.10)),
                  (int(w * 0.80), int(h * 0.90)), 1, -1)

    img_area = h * w
    max_inner_island_area = max(1200, int(img_area * 0.035))

    for i in range(1, num_labels):
        x, y, cw, ch, area = stats[i]
        if area < 8:
            continue

        mask_i = (labels == i)

        # Any component connected to the already-flooded background is
        # definitely background.
        if np.any(is_outer_bg[mask_i]):
            alpha[mask_i] = 0
            continue

        comp_pixels = img[mask_i]
        comp_median = np.median(comp_pixels, axis=0).astype(np.float32)
        b_c, g_c, r_c = comp_median
        comp_dist = float(np.sqrt(np.sum((comp_median - bg_median) ** 2)))

        in_core = bool(np.any(core_mask[mask_i]))

        # Background in this project is intentionally vivid magenta.
        # JPEG compression / resizing can move it away from pure #ff00ff,
        # so use "magenta-like and close to corner background" rather than
        # the old very strict pure-magenta check.
        magenta_like = (
            r_c > 190 and b_c > 190 and g_c < 120 and
            abs(float(r_c - r_bg)) < 85 and
            abs(float(b_c - b_bg)) < 85 and
            abs(float(g_c - g_bg)) < 100
        )

        bg_like_strict = comp_dist < 35
        bg_like_relaxed = comp_dist < 75
        small_or_medium_island = area <= max_inner_island_area

        if in_core:
            # Avoid cutting real costume details, but remove enclosed
            # magenta holes between fingers / hands / sleeves.
            if bg_like_strict or (small_or_medium_island and (bg_like_relaxed or magenta_like)):
                alpha[mask_i] = 0
        else:
            if bg_like_relaxed or magenta_like:
                alpha[mask_i] = 0

    # Slightly expand transparent background, then soften the edge.
    # This reduces remaining one-pixel magenta fringes without touching
    # the character body aggressively.
    transparent = (alpha == 0).astype(np.uint8) * 255
    transparent = cv2.dilate(transparent, np.ones((2, 2), np.uint8), iterations=1)
    alpha[transparent > 0] = 0
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

def generate_face_v25(bgra, char_id, variant, v_config, is_clean):
    """
    Generates a 256x256 face icon from character_asset_config.json faceCrop.

    This function is intentionally limited to face_proc output. It does not touch
    standing_proc, bustup_proc, asset_manifest.json, or bustup_manifest.json.
    """
    if char_id == "common":
        return False

    h, w = bgra.shape[:2]
    crop = v_config.get("faceCrop")
    if not crop:
        print(f"      [WARN] Missing faceCrop for {char_id}/{variant}. Skipping face.")
        return False

    scale = 2.0 if is_clean else 1.0
    fx, fy = int(crop["x"] * scale), int(crop["y"] * scale)
    fw, fh = int(crop["w"] * scale), int(crop["h"] * scale)

    tfx = max(0, min(w - 1, fx))
    tfy = max(0, min(h - 1, fy))
    tfw = min(fw, w - tfx)
    tfh = min(fh, h - tfy)

    if tfw <= 0 or tfh <= 0:
        print(f"      [WARN] Invalid faceCrop for {char_id}/{variant}: {crop}. Skipping face.")
        return False

    face_img = bgra[tfy:tfy+tfh, tfx:tfx+tfw]
    if face_img.size == 0:
        print(f"      [WARN] Empty face crop for {char_id}/{variant}: {crop}. Skipping face.")
        return False

    out_dir = BASE_DIR / char_id / FACE_SUBDIR
    out_dir.mkdir(parents=True, exist_ok=True)
    face = cv2.resize(face_img, FACE_SIZE, interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite(str(out_dir / f"{variant}.png"), face)
    return True

def process_v25(char_id, variant, src_p, v_config, is_clean, standards):
    img = cv2.imread(str(src_p))
    if img is None: return False
    h, w = img.shape[:2]

    # Background Removal
    bgra = remove_background_v16(img)

    out_dirs = {
        "face": BASE_DIR/char_id/FACE_SUBDIR, 
        "standing": BASE_DIR/char_id/STANDING_PROC_SUBDIR,
        "bustup": BASE_DIR/char_id/BUSTUP_PROC_SUBDIR
    }
    for d in out_dirs.values(): d.mkdir(parents=True, exist_ok=True)

    if char_id != "common":
        # 1. Face Icon (Config Based for V25 D2-Norm)
        generate_face_v25(bgra, char_id, variant, v_config, is_clean)

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
    face_only = "--face-only" in sys.argv
    if bustup_only and face_only:
        print("[ERROR] --bustup-only and --face-only cannot be used together.")
        return
    
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
    if face_only:
        mode_label = "Face ONLY"
    elif bustup_only:
        mode_label = "Bustup ONLY"
    else:
        mode_label = "Full Update"
    print(f"\n--- Character Asset Pipeline ({PROCESSOR_VERSION}: {mode_label}) ---")
    
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
                if face_only:
                    pass
                elif bustup_only:
                    bustup_manifest["assets"][key] = entry
                else:
                    manifest["assets"][key] = entry
                    # In full mode, we assume bustup is also updated
                    bustup_manifest["assets"][key] = entry
                stats["regen"] += 1
            else: stats["fail"] += 1
            
    if stats["regen"] > 0:
        if face_only:
            print("    [INFO] --face-only: manifest files were not updated.")
        else:
            if not bustup_only:
                manifest_utils.save_manifest(manifest)
            with open(BUSTUP_MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(bustup_manifest, f, indent=2)
            
    print(f"\nFinal: skip={stats['skip']}, regen={stats['regen']}, fail={stats['fail']}")

if __name__ == "__main__": main()
