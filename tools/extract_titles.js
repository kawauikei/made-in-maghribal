const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffprobe = 'C:\\Program Files\\Krita (x64)\\bin\\ffprobe.exe';
const root = 'C:\\AI\\projects\\P0007_MadeInMaghribalt3\\public\\audio\\bgm';

function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else if (file.endsWith('.mp4')) {
            results.push(file);
        }
    });
    return results;
}

const files = getFiles(root);
const results = files.map(file => {
    try {
        const out = execSync(`"${ffprobe}" -v error -show_entries format_tags=title -of default=noprint_wrappers=1:nokey=1 "${file}"`, { encoding: 'utf8' }).trim();
        return {
            Dir: path.basename(path.dirname(file)),
            Filename: path.basename(file),
            Title: out || ''
        };
    } catch (e) {
        return {
            Dir: path.basename(path.dirname(file)),
            Filename: path.basename(file),
            Title: ''
        };
    }
});

fs.writeFileSync('full_titles_utf8.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Results written to full_titles_utf8.json');
