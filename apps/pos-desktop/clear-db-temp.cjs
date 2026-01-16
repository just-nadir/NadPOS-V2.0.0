const Database = require('better-sqlite3');
const path = require('path');

// Skript apps/pos-desktop ichida turibdi deb faraz qilamiz
const dbPath = path.join(__dirname, 'pos.db');
console.log('Opening DB:', dbPath);

const db = new Database(dbPath);

try {
    console.log('Cleaning products...');
    db.prepare('DELETE FROM products').run();

    console.log('Cleaning categories...');
    db.prepare('DELETE FROM categories').run();

    console.log('Cleaning order_items...');
    db.prepare('DELETE FROM order_items').run();

    // Reset sequences if needed (optional)

    console.log('✅ Database cleared (Products, Categories, Orders).');
} catch (err) {
    console.error('Error clearing DB:', err);
}
