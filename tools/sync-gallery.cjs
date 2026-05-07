/**
 * Sync Gallery Assets
 * Scans public/images/background and public/images/still and generates a manifest.
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const bgDir = path.join(projectRoot, 'public/images/background');
const stillDir = path.join(projectRoot, 'public/images/still');
const charsDir = path.join(projectRoot, 'public/characters');
const outputFile = path.join(projectRoot, 'browser/data/galleryManifest.js');

function scan(dir, category, relativeBase) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file))
        .map(file => {
            const id = path.parse(file).name;
            return {
                id,
                path: `images/${relativeBase}/${file}`,
                title: id.replace(/_/g, ' '),
                category
            };
        });
}

function generate() {
    console.log('Scanning images for gallery...');
    
    const bgItems = scan(bgDir, '背景', 'background');
    const stillItems = scan(stillDir, 'スチル', 'still');
    
    const charItems = [];
    if (fs.existsSync(charsDir)) {
        const heroines = fs.readdirSync(charsDir);
        for (const heroineId of heroines) {
            const standingDir = path.join(charsDir, heroineId, 'standing_proc');
            if (fs.existsSync(standingDir)) {
                const expressions = fs.readdirSync(standingDir)
                    .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file));
                
                for (const file of expressions) {
                    const expressionName = path.parse(file).name;
                    charItems.push({
                        id: `${heroineId.toLowerCase()}_${expressionName.toLowerCase()}`,
                        path: `characters/${heroineId}/standing_proc/${file}`,
                        title: `${heroineId} (${expressionName})`,
                        category: 'ヒロイン立ち絵'
                    });
                }
            }
        }
    }
    
    const galleryItems = [...bgItems, ...stillItems, ...charItems];

    const content = `/**
 * Generated Gallery Manifest
 * Do not edit manually. Use tools/sync-gallery.cjs
 */
const GALLERY_MANIFEST = ${JSON.stringify(galleryItems, null, 2)};

if (typeof module !== 'undefined') {
    module.exports = { GALLERY_MANIFEST };
}
`;

    fs.writeFileSync(outputFile, content);
    console.log(`Gallery manifest generated with ${galleryItems.length} items at ${outputFile}`);
}

generate();
