/**
 * Character Asset Preprocessing Script (V1: Copy)
 * 
 * This script processes character assets defined in character_asset_config.json.
 * V1 simply copies source images to target public directories.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'character_asset_config.json');
const PUBLIC_DIR = path.resolve(__dirname, '../../public/characters');

function processAssets() {
  console.log("--- Character Asset Preprocessing Tool (V1: Copy) ---");

  if (!fs.existsSync(CONFIG_PATH)) {
    console.warn(`[SKIP] Config not found: ${CONFIG_PATH}`);
    return;
  }

  try {
    const assetConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    
    for (const [id, config] of Object.entries(assetConfig)) {
      console.log(`\nProcessing heroine: [${id}]`);
      const sourcePath = path.resolve(__dirname, '../../', config.sourcePath);
      
      if (!fs.existsSync(sourcePath)) {
        console.warn(`  [WARN] Source not found for ${id}: ${sourcePath}`);
        continue;
      }

      const variants = config.variants || { default: {} };
      for (const [variantName, variantConfig] of Object.entries(variants)) {
        console.log(`  - Variant: ${variantName}`);
        
        // Output paths
        const standingDir = path.join(PUBLIC_DIR, id, 'standing');
        const faceDir = path.join(PUBLIC_DIR, id, 'face');

        if (!fs.existsSync(standingDir)) fs.mkdirSync(standingDir, { recursive: true });
        if (!fs.existsSync(faceDir)) fs.mkdirSync(faceDir, { recursive: true });

        const standingPath = path.join(standingDir, `${variantName}.png`);
        const facePath = path.join(faceDir, `${variantName}.png`);

        // V1: Simple copy
        // Note: Real cropping/resizing requires 'sharp' or 'jimp'
        try {
          fs.copyFileSync(sourcePath, standingPath);
          fs.copyFileSync(sourcePath, facePath);
          console.log(`  [SUCCESS] Copied to ${id}/${variantName}.png (standing & face)`);
        } catch (err) {
          console.error(`  [ERROR] Failed to copy for ${id}:`, err.message);
        }
      }
    }

    console.log("\n[COMPLETE] Asset processing finished.");

  } catch (err) {
    console.error("[ERROR] Failed to process assets:", err.message);
    process.exit(1);
  }
}

processAssets();
