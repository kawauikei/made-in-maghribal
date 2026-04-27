import fs from 'fs';
import path from 'path';

// Paths (assuming run from project root)
const ITEM_TXT_PATH = './public/data/item.txt';
const ITEMS_DIR = './public/items';
const OUTPUT_DIR = './src/data/generated';
const OUTPUT_JSON_PATH = path.join(OUTPUT_DIR, 'items.json');

async function convert() {
  console.log("=== Master Data Conversion Start ===");

  if (!fs.existsSync(ITEM_TXT_PATH)) {
    console.error(`Error: ${ITEM_TXT_PATH} not found.`);
    process.exit(1);
  }

  // 1. Read and parse TSV
  const content = fs.readFileSync(ITEM_TXT_PATH, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t'); // id, quality, text

  const itemMap = new Map();

  for (let i = 1; i < lines.length; i++) {
    const [id, quality, text] = lines[i].split('\t');
    if (!id) continue;

    if (!itemMap.has(id)) {
      // 5. Decompose ID
      // IT_ARM_ME_01
      const parts = id.split('_');
      const category = parts[1];
      const principle = parts[2];
      const index = parts[3];

      // Verify image existence
      const imageName = `${id}.png`;
      const imagePath = path.join(ITEMS_DIR, imageName);
      const hasImage = fs.existsSync(imagePath);

      itemMap.set(id, {
        id,
        category,
        principle,
        index,
        image: `items/${imageName}`,
        hasImage,
        variants: {}
      });
    }

    const item = itemMap.get(id);

    // Extract effect: （効果：...）
    let description = text;
    let effect = "";
    const effectMatch = text.match(/（効果：(.*?)）/);
    if (effectMatch) {
      effect = effectMatch[1];
      description = text.replace(effectMatch[0], "").trim();
    }

    item.variants[quality] = {
      description,
      effect
    };
  }

  const items = Array.from(itemMap.values());

  // Verification
  console.log(`- Total unique IDs: ${items.length}`);
  
  let missingImages = 0;
  let missingVariants = 0;

  items.forEach(item => {
    if (!item.hasImage) {
      console.warn(`Warning: Missing image for ${item.id}`);
      missingImages++;
    }
    const qualities = ['normal', 'success', 'great_success'];
    qualities.forEach(q => {
      if (!item.variants[q]) {
        console.warn(`Warning: Missing variant ${q} for ${item.id}`);
        missingVariants++;
      }
    });
    // Remove temporary hasImage flag from output
    delete item.hasImage;
  });

  // 6. Generate JSON
  const output = {
    items,
    meta: {
      source: ITEM_TXT_PATH,
      itemCount: items.length,
      generatedAt: new Date().toISOString()
    }
  };

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(output, null, 2));
  console.log(`- Generated: ${OUTPUT_JSON_PATH}`);

  // Summary
  console.log("=== Conversion Summary ===");
  console.log(`- Success: ${items.length} items processed.`);
  console.log(`- Issues: ${missingImages} missing images, ${missingVariants} missing variants.`);
  
  if (missingImages === 0 && missingVariants === 0 && items.length === 250) {
    console.log("Result: ALL CLEAR (250 items, all variants and images present)");
  } else {
    console.log("Result: Completed with warnings.");
  }
}

convert();
