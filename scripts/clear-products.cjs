const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../apps/pos-desktop/pos.db');
console.log('Opening DB:', dbPath);

const db = new Database(dbPath);

try {
    console.log('Cleaning products...');
    db.prepare('DELETE FROM products').run();

    console.log('Cleaning categories...');
    db.prepare('DELETE FROM categories').run();

    console.log('Cleaning order_items (linked to products)...');
    db.prepare('DELETE FROM order_items').run();

    console.log('✅ Database cleared of seed data (Products, Categories, Orders).');
} catch (err) {
    console.error('Error clearing DB:', err);
}
