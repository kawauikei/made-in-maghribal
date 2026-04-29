
import json
import hashlib
import os
from pathlib import Path

MANIFEST_PATH = Path("tools/character_asset_pipeline/asset_manifest.json")

def get_file_hash(file_path):
    if not os.path.exists(file_path):
        return None
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hasher.update(chunk)
    return hasher.hexdigest()

def load_manifest():
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"assets": {}, "version": "1.0"}

def save_manifest(manifest):
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

def update_asset(heroine_id, variant_name, source_path):
    manifest = load_manifest()
    current_hash = get_file_hash(source_path)
    
    asset_key = f"{heroine_id}/{variant_name}"
    old_data = manifest["assets"].get(asset_key, {})
    
    if old_data.get("hash") == current_hash:
        return False, manifest # No change
    
    manifest["assets"][asset_key] = {
        "hash": current_hash,
        "source": str(source_path),
        "updated_at": os.path.getmtime(source_path)
    }
    return True, manifest
