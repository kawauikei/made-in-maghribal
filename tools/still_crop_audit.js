/**
 * Still Crop Audit Tool
 * 
 * Generates an HTML report to visually verify the framing and cropping
 * of all still images based on their metadata (focusX, focusY, stillCrop).
 */

import fs from 'node:fs';
import path from 'node:path';
import { STILL_IMAGES } from '../src/data/imageAssets.js';

console.log("--- Still Crop Audit Starting ---");

const reportPath = './docs/still_crop_audit_report.html';
const publicPrefix = '../public/';

let html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Still Crop Audit Report - Made in Maghribal</title>
    <style>
        body { font-family: sans-serif; background: #f0f0f0; margin: 0; padding: 20px; color: #333; }
        h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        .card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column; }
        .preview-container { height: 400px; background: #000; position: relative; }
        .preview-img { width: 100%; height: 100%; }
        .info { padding: 15px; font-size: 0.9em; }
        .id { font-weight: bold; font-size: 1.1em; margin-bottom: 5px; color: #d4af37; }
        .meta { margin-bottom: 10px; line-height: 1.4; }
        .tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-right: 5px; }
        .tag-proto { background: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
        .tag-default { background: #e2e3e5; color: #383d41; border: 1px solid #d6d8db; }
        .aspect-ratios { display: flex; gap: 10px; margin-top: 10px; }
        .aspect-preview { width: 60px; height: 120px; border: 1px solid #ccc; background: #000; overflow: hidden; }
        .aspect-img { width: 100%; height: 100%; object-fit: cover; }
    </style>
</head>
<body>
    <h1>Still Crop Audit Report</h1>
    <p>Total Stills: ${Object.keys(STILL_IMAGES).length}</p>
    
    <div class="grid">
`;

Object.values(STILL_IMAGES).forEach(still => {
    const isProto = !!still.stillCrop;
    const objectFit = still.stillCrop?.objectFit || 'cover';
    const objectPosition = still.stillCrop?.objectPosition || `${(still.focusX ?? 0.5) * 100}% ${(still.focusY ?? 0.5) * 100}%`;
    const imgSrc = still.src.startsWith('http') ? still.src : publicPrefix + still.src;

    html += `
        <div class="card">
            <div class="preview-container">
                <img src="${imgSrc}" class="preview-img" style="object-fit: ${objectFit}; object-position: ${objectPosition};" alt="${still.id}">
            </div>
            <div class="info">
                <div class="id">${still.title || still.id}</div>
                <div class="meta">
                    ID: <code>${still.id}</code><br>
                    Heroine: ${still.heroineId || 'Group'}<br>
                    ${isProto ? '<span class="tag tag-proto">stillCrop Defined</span>' : '<span class="tag tag-default">Default Focus</span>'}
                </div>
                <div class="meta">
                    <strong>Current Settings:</strong><br>
                    Object-Fit: <code>${objectFit}</code><br>
                    Object-Position: <code>${objectPosition}</code>
                </div>
                
                <div class="meta">
                    <strong>Mobile Aspect (9:18 approx):</strong>
                    <div class="aspect-ratios">
                        <div class="aspect-preview" title="390x780 logic">
                            <img src="${imgSrc}" class="aspect-img" style="object-fit: ${objectFit}; object-position: ${objectPosition};">
                        </div>
                        <div class="aspect-preview" style="width: 100px; height: 100px;" title="1:1 square">
                            <img src="${imgSrc}" class="aspect-img" style="object-fit: ${objectFit}; object-position: ${objectPosition};">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
});

html += `
    </div>
    <script>
        console.log("Audit Report Loaded");
    </script>
</body>
</html>
`;

fs.writeFileSync(reportPath, html);
console.log(`✅ Audit Report generated at: ${reportPath}`);
