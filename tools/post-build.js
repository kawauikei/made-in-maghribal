import fs from 'fs';
import path from 'path';

// 1. Copy main.js from dist to public
const distMainPath = path.join('dist', 'main.js');
const publicMainPath = path.join('public', 'main.js');
if (fs.existsSync(distMainPath)) {
    fs.copyFileSync(distMainPath, publicMainPath);
    console.log(`Successfully copied dist/main.js to ${publicMainPath}`);
} else {
    // Try .mjs or other common extensions if .js doesn't exist
    const mjsPath = path.join('dist', 'main.mjs');
    if (fs.existsSync(mjsPath)) {
        fs.copyFileSync(mjsPath, publicMainPath);
        console.log(`Successfully copied dist/main.mjs to ${publicMainPath}`);
    } else {
        console.error('Error: Could not find main.js or main.mjs in dist folder.');
    }
}

// 2. Generate main.canvas.jsx (Single file JSX with React externalized)
try {
    const appCode = fs.readFileSync(path.join('src', 'App.jsx'), 'utf-8');
    const entryCode = fs.readFileSync(path.join('src', 'entry.canvas.jsx'), 'utf-8');

    // App.jsx から不要な import/export を削除して内部関数化
    // ※ import React は entry.canvas.jsx 側で保持するので削除
    const appBody = appCode
        .replace(/import\s+React\s+from\s+['"]react['"];?\r?\n?/, '')
        .replace(/export\s+default\s+function\s+App/, 'function App');

    // entry.canvas.jsx の import App を App の実体に差し替え
    const bundledCanvasCode = entryCode.replace(
        /import\s+App\s+from\s+['"]\.\/App['"];?/,
        appBody
    );

    fs.writeFileSync('main.canvas.jsx', bundledCanvasCode);
    console.log('Successfully generated ./main.canvas.jsx (bundled source with JSX)');
} catch (err) {
    console.error('Error generating main.canvas.jsx:', err.message);
}
