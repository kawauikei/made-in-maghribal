/**
 * Character Asset Preprocessing Script (V1.1: Multi-Variant Copy)
 * 
 * This script processes character assets defined in character_asset_config.json.
 * V1.1 supports multiple variants per heroine, each with its own sourcePath.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'character_asset_config.json');
const PUBLIC_DIR = path.resolve(__dirname, '../../public/characters');

function processAssets() {
  console.log("--- Character Asset Preprocessing Tool (V1.1: Multi-Variant Copy) ---");

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
        const rawSourcePath = variantConfig.sourcePath;
        if (!rawSourcePath) {
          console.warn(`  [SKIP] No sourcePath defined for ${id}/${variantName}`);
          continue;
        }

        const sourcePath = path.resolve(__dirname, '../../', rawSourcePath);
        if (!fs.existsSync(sourcePath)) {
          console.warn(`  [WARN] Source not found for ${id}/${variantName}: ${sourcePath}`);
          continue;
        }

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
          console.log(`  [SUCCESS] Generated ${id}/${variantName}.png`);

          // Compatibility: If this is 'normal', also copy to 'default.png'
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
    
    try {
      execSync(`"${pythonPath}" "${scriptPath}"`, { stdio: 'inherit' });
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
