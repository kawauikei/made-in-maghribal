import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function getBuildVersion() {
    try {
        return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    } catch (err) {
        return String(Date.now());
    }
}

function updatePublicIndexHtml(buildVersion) {
    const publicIndexPath = path.join('public', 'index.html');
    if (!fs.existsSync(publicIndexPath)) {
        console.error('Error: Could not find public/index.html.');
        return;
    }

    const html = fs.readFileSync(publicIndexPath, 'utf-8');
    const updatedHtml = html.replace(
        /import\(\s*['"]\.\/main\.js(?:\?v=[^'"]*)?['"]\s*\)/,
        `import('./main.js?v=${buildVersion}')`
    );

    if (html === updatedHtml) {
        console.warn('Warning: public/index.html did not contain a main.js import to update.');
        return;
    }

    fs.writeFileSync(publicIndexPath, updatedHtml);
    console.log(`Successfully updated ${publicIndexPath} with cache-busting version ${buildVersion}`);
}

// 1. Copy main.js from dist to public
const distMainPath = path.join('dist', 'main.js');
const publicMainPath = path.join('public', 'main.js');
const buildVersion = getBuildVersion();
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

// 1.5 Update public/index.html cache-busting query for main.js
updatePublicIndexHtml(buildVersion);

// 2. Generate main.canvas.jsx (Single file JSX with React externalized)
try {
    let appCode = fs.readFileSync(path.join('src', 'App.jsx'), 'utf-8');
    const entryCode = fs.readFileSync(path.join('src', 'entry.canvas.jsx'), 'utf-8');

    // UIコンポーネントのインライン化処理
    // 名前付きインポート (import { THEME } ...) および名前なしインポート (import './ui/...') にも対応
    // 複数のインポート形式 (import A, { B } from './ui/C') をカバーできるよう調整
    const uiImportRegex = /import\s+([\w\s,{}]+)\s+from\s+['"]\.\/ui\/(\w+)['"];?\r?\n?|import\s+['"]\.\/ui\/(\w+)['"];?\r?\n?/g;
    let uiComponentsCode = '';
    const inlinedFiles = new Set();
    
    // 全てのマッチを先に取得
    const matches = [...appCode.matchAll(uiImportRegex)];
    
    for (const match of matches) {
        const fullImportLine = match[0];
        const importSpec = match[1]; // A, { B }
        const fromFileName = match[2]; // C
        const sideEffectFileName = match[3]; // Side effect only
        
        const fileName = fromFileName || sideEffectFileName;
        if (!fileName) continue;

        // App.jsx からこのインポート行を削除 (重複していても削除は必要)
        appCode = appCode.replace(fullImportLine, '');

        if (inlinedFiles.has(fileName)) {
            console.log(`Skipping duplicate inline for ${fileName}`);
            continue;
        }

        const filePath = path.join('src', 'ui', `${fileName}.js${fs.existsSync(path.join('src', 'ui', `${fileName}.jsx`)) ? 'x' : ''}`);
        
        if (fs.existsSync(filePath)) {
            console.log(`Inlining UI: ${fileName} from ${filePath}`);
            let compCode = fs.readFileSync(filePath, 'utf-8');
            
            // 不要なインポート/エクスポートを削除
            compCode = compCode.replace(/^import\s+[\s\S]*?from\s+['"].*?['"];?\r?\n?/gm, '');
            compCode = compCode.replace(/export\s+default\s+\w+;?\r?\n?$/, '');
            compCode = compCode.replace(/export\s+default\s+/, '');
            compCode = compCode.replace(/export\s+(const|function|class)/g, '$1'); // 名前付きエクスポートを通常定義に変換
            
            // 相対パスの修正 (../ -> ./)
            compCode = compCode.replace(/['"]\.\.\//g, "'./");
            
            uiComponentsCode += `\n// --- Inlined: ${fileName} ---\n${compCode}\n`;
            inlinedFiles.add(fileName);
        }
    }

    // App.jsx から不要な import/export を削除して内部関数化
    // ※ import React は entry.canvas.jsx 側で保持するので削除
    // 括弧付きインポート (import React, { ... } from 'react') は定数定義に変換
    let appBody = appCode
        .replace(/import\s+React,\s*(\{[\s\S]*?\})\s+from\s+['"]react['"];?\r?\n?/, 'const $1 = React;\n')
        .replace(/import\s+React\s+from\s+['"]react['"];?\r?\n?/, '')
        .replace(/export\s+default\s+function\s+App/, 'function App');

    // UIコンポーネントをApp関数の直前に挿入 (既存のimportの後になるように)
    appBody = appBody.replace('function App', uiComponentsCode + '\nfunction App');

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
