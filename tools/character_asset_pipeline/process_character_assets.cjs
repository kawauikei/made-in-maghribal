
/**
 * Character Asset Preprocessing Script (V1.2: source_clean Priority)
 * 
 * This script processes character assets defined in character_asset_config.json.
 * It prioritizes 'source_clean' directory if available, falling back to 'source'.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'character_asset_config.json');
const SOURCE_CLEAN_ROOT = path.join(__dirname, 'source_clean');
const PUBLIC_DIR = path.resolve(__dirname, '../../public/characters');

const CHAR_FOLDER_MAP = {
    "hakima": "01_Hakima",
    "mira": "02_Mira",
    "dariya": "03_Dariya",
    "nader": "04_Nader",
    "common": "00_common"
};
const ALLOWED_EXTENSIONS = [".jpeg", ".jpg", ".png", ".webp"];

function findBestSource(id, variantName, configSourcePath) {
  const folderName = CHAR_FOLDER_MAP[id];
  if (folderName) {
    const cleanDir = path.join(SOURCE_CLEAN_ROOT, folderName);
    for (const ext of ALLOWED_EXTENSIONS) {
      const cleanPath = path.join(cleanDir, variantName + ext);
      if (fs.existsSync(cleanPath)) return { path: cleanPath, isClean: true };
    }
  }
  const fallbackPath = path.resolve(__dirname, '../../', configSourcePath);
  return fs.existsSync(fallbackPath) ? { path: fallbackPath, isClean: false } : null;
}

function processAssets() {
  console.log("--- Character Asset Preprocessing Tool (V1.2: source_clean Priority) ---");

  if (!fs.existsSync(CONFIG_PATH)) {
    console.warn(`[SKIP] Config not found: ${CONFIG_PATH}`);
    return;
  }

  try {
    const assetConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    
    for (const [id, heroineConfig] of Object.entries(assetConfig)) {
      console.log(`\nProcessing heroine: [${id}]`);

      const variants = heroineConfig.variants || {};
      for (const [variantName, variantConfig] of Object.entries(variants)) {
        const configSourcePath = variantConfig.sourcePath;
        const result = findBestSource(id, variantName, configSourcePath);

        if (!result) {
          console.warn(`  [SKIP] No source found for ${id}/${variantName}`);
          continue;
        }

        const sourcePath = result.path;
        const sourceLabel = result.isClean ? "CLEAN" : "FALLBACK";

        // Output paths
        const standingDir = path.join(PUBLIC_DIR, id, 'standing');
        const faceDir = path.join(PUBLIC_DIR, id, 'face');

        if (!fs.existsSync(standingDir)) fs.mkdirSync(standingDir, { recursive: true });
        if (!fs.existsSync(faceDir)) fs.mkdirSync(faceDir, { recursive: true });

        const standingPath = path.join(standingDir, `${variantName}.png`);
        const facePath = path.join(faceDir, `${variantName}.png`);

        try {
          fs.copyFileSync(sourcePath, standingPath);
          fs.copyFileSync(sourcePath, facePath);
          console.log(`  [SUCCESS] Copied ${id}/${variantName}.png (${sourceLabel})`);

          if (variantName === 'normal') {
            fs.copyFileSync(sourcePath, path.join(standingDir, 'default.png'));
            fs.copyFileSync(sourcePath, path.join(faceDir, 'default.png'));
            console.log(`  [INFO] Created default.png alias for normal`);
          }
        } catch (err) {
          console.error(`  [ERROR] Failed to copy for ${id}/${variantName}:`, err.message);
        }
      }
    }

    console.log("\n[STEP 2] Running Face Normalization & Alpha Protection...");
    const { execSync } = require('child_process');
    const pythonPath = "C:\\Users\\khqv\\AppData\\Local\\Programs\\Python\\Python310\\python.exe";
    const scriptPath = path.join(__dirname, 'face_normalization.py');
    const args = process.argv.slice(2).join(' '); // Pass --force etc.
    
    try {
      execSync(`"${pythonPath}" "${scriptPath}" ${args}`, { stdio: 'inherit' });
      console.log("[SUCCESS] Normalization complete.");
    } catch (err) {
      console.error("[ERROR] Normalization failed:", err.message);
    }

    console.log("\n[COMPLETE] Asset processing finished.");

  } catch (err) {
    console.error("[ERROR] Failed to process assets:", err.message);
    process.exit(1);
  }
}

processAssets();
