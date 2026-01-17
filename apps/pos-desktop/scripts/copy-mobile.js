const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../pos-mobile/dist');
const destDir = path.join(__dirname, '../mobile-dist');

// Papkani tozalash
if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir);

// Nusxalash funksiyasi
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

try {
    console.log(`📂 Nusxalanmoqda: ${srcDir} -> ${destDir}`);
    copyRecursiveSync(srcDir, destDir);
    console.log("✅ Mobil ilova muvaffaqiyatli ko'chirildi!");
} catch (err) {
    console.error("❌ Xatolik yuz berdi:", err);
    process.exit(1);
}
