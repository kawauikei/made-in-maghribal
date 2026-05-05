/**
 * Robust Browser Bundler for MadeInMaghribal
 * Collects CJS modules from src/ and browser/ into an IIFE.
 */
const fs = require('fs');
const path = require('path');
const { buildStyle } = require('./build-style.cjs');

const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const browserDir = path.join(projectRoot, 'browser');
const outputFile = path.join(projectRoot, 'public/bundle.js');

function bundle() {
    buildStyle();
    console.log('Bundling modules...');
    
    let output = `(function() {
    const modules = {};
    const cache = {};

    function require(name, fromPath) {
        let resolvedName = name;
        if (name.startsWith('.')) {
            const dir = fromPath ? fromPath.substring(0, fromPath.lastIndexOf('/')) : '.';
            const parts = (dir + '/' + name).split('/');
            const stack = [];
            for (const part of parts) {
                if (part === '..') stack.pop();
                else if (part !== '.' && part !== '') stack.push(part);
            }
            resolvedName = './' + stack.join('/');
            
            // Try extensions
            if (!modules[resolvedName]) {
                if (modules[resolvedName + '.js']) resolvedName += '.js';
                else if (modules[resolvedName + '.cjs']) resolvedName += '.cjs';
            }
        }

        if (cache[resolvedName]) return cache[resolvedName].exports;
        if (!modules[resolvedName]) {
            throw new Error('Module ' + resolvedName + ' not found (requested as ' + name + ' from ' + fromPath + ')');
        }
        
        const module = { exports: {} };
        cache[resolvedName] = module;
        modules[resolvedName](module, module.exports, (n) => require(n, resolvedName));
        return module.exports;
    }
`;

    function addFiles(dir, baseDir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                addFiles(fullPath, baseDir);
            } else if (file.endsWith('.cjs') || (file.endsWith('.js') && file !== 'app.js')) {
                // Register everything relative to the project root's implied structure
                // src/core/x.cjs -> ./core/x.cjs
                // browser/screens/y.js -> ./screens/y.js
                // This matches how app.js was already requiring things.
                const relativePath = './' + path.relative(baseDir, fullPath).replace(/\\/g, '/');
                const content = fs.readFileSync(fullPath, 'utf8');
                output += `
    // --- ${relativePath} ---
    modules['${relativePath}'] = function(module, exports, require) {
${content}
    };
`;
            }
        }
    }

    // Both src and browser are scanned, and files are registered relative to their respective directories
    // This allows require('./core/...') from app.js (targeting src/core)
    // and require('./screens/...') from app.js (targeting browser/screens)
    addFiles(srcDir, srcDir);
    addFiles(browserDir, browserDir);

    // Load and append the browser entry point
    const browserEntryPath = path.join(browserDir, 'app.js');
    if (fs.existsSync(browserEntryPath)) {
        const browserEntry = fs.readFileSync(browserEntryPath, 'utf8');
        output += `
    // --- Entry Point (browser/app.js) ---
    (function() {
        const entry = function(require) {
${browserEntry}
        };
        // Entry point base path is '.'
        entry((n) => require(n, './index.js'));
    })();
`;
    } else {
        output += `\n    console.warn('browser/app.js not found. Entry point execution skipped.');\n`;
    }

    output += `\n})();`;

    fs.writeFileSync(outputFile, output);
    console.log('Bundle created successfully at ' + outputFile);
}

bundle();
