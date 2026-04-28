/**
 * Character Asset Preprocessing Script (Dry-run / Validation)
 * 
 * This script validates character_asset_config.json and simulates the generation process.
 * Actual image processing (Sharp/Canvas) can be added here later.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'character_asset_config.json');
const EXAMPLE_PATH = path.join(__dirname, 'character_asset_config.example.json');

function validate() {
  console.log("--- Character Asset Preprocessing Tool ---");

  if (!fs.existsSync(CONFIG_PATH)) {
    console.warn(`[SKIP] Config not found: ${CONFIG_PATH}`);
    console.info(`[INFO] Copy ${path.basename(EXAMPLE_PATH)} to get started.`);
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    
    Object.keys(config).forEach(heroineId => {
      console.log(`\nChecking heroine: [${heroineId}]`);
      const heroine = config[heroineId];
      
      if (!heroine.variants) {
        console.error(`  Error: No variants defined for ${heroineId}`);
        return;
      }

      Object.keys(heroine.variants).forEach(variantName => {
        const variant = heroine.variants[variantName];
        console.log(`  - Variant: ${variantName}`);
        
        // Validation logic
        if (!variant.source) console.error("    Missing 'source' image path");
        if (!variant.faceCrop) console.warn("    No 'faceCrop' defined (will use default center)");
        
        // Simulated output paths
        const faceOut = `public/characters/${heroineId}/face_${variantName}.webp`;
        const standOut = `public/characters/${heroineId}/standing_${variantName}.webp`;
        
        console.log(`    Expected Face: ${faceOut}`);
        console.log(`    Expected Stand: ${standOut}`);
      });
    });

    console.log("\n[SUCCESS] Configuration validation completed.");
    console.info("[TODO] Image processing logic (Sharp/Jimp) will be implemented here.");

  } catch (err) {
    console.error("[ERROR] Failed to parse config JSON:", err.message);
    process.exit(1);
  }
}

validate();
