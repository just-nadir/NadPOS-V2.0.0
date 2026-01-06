
const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(__dirname, '../pos.db');
console.log("DB Path:", dbPath);

const db = new Database(dbPath);

try {
    const users = db.prepare("SELECT * FROM users").all();
    console.log("Users count:", users.length);
    console.log("Users:", users);
} catch (e) {
    console.error("Error reading users:", e);
}
