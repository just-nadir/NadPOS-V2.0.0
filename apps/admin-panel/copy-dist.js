const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'dist');
const dest = path.join(__dirname, '../cloud-backend/public');

// Empty dest
if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
}
fs.mkdirSync(dest, { recursive: true });

// Copy function
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

copy(src, dest);
console.log('✅ Dist copied to cloud-backend/public');
