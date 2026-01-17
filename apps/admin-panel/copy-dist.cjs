const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'dist');
const dest = path.join(__dirname, '../cloud-backend/public');

console.log(`Copying from ${src} to ${dest}`);

if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
}
fs.mkdirSync(dest, { recursive: true });

function copy(source, target) {
    if (fs.lstatSync(source).isDirectory()) {
        if (!fs.existsSync(target)) fs.mkdirSync(target);
        fs.readdirSync(source).forEach(file => {
            copy(path.join(source, file), path.join(target, file));
        });
    } else {
        fs.copyFileSync(source, target);
    }
}

try {
    copy(src, dest);
    console.log('✅ Dist copied successfully!');
} catch (e) {
    console.error('❌ Copy failed:', e);
}
