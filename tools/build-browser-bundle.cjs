/**
 * Simple Browser Bundler for MadeInMaghribal
 * Wraps CJS modules into an IIFE for the browser.
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const outputFile = path.join(__dirname, '../public/bundle.js');

function bundle() {
    console.log('Bundling modules...');
    
    let output = `(function() {
    const modules = {};
    const cache = {};

    // Internal require function for the browser
    function require(name, fromPath) {
        // Normalize path resolution
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
            if (!resolvedName.endsWith('.cjs')) resolvedName += '.cjs';
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

    // Recursively collect all .cjs files from src/
    function addFiles(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                addFiles(fullPath);
            } else if (file.endsWith('.cjs')) {
                const relativePath = './' + path.relative(srcDir, fullPath).replace(/\\/g, '/');
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

    addFiles(srcDir);

    // Load and append the browser entry point
    const browserEntryPath = path.join(__dirname, '../browser/app.js');
    if (fs.existsSync(browserEntryPath)) {
        const browserEntry = fs.readFileSync(browserEntryPath, 'utf8');
        output += `
    // --- Entry Point (browser/app.js) ---
    (function() {
        const entry = function(require) {
${browserEntry}
        };
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
