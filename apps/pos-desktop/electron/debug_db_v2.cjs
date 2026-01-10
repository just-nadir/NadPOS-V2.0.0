const { db } = require('./database.cjs');
const log = require('electron-log');

console.log = log.log;

try {
    console.log("--- DEEP DB DIAGNOSTICS ---");

    // 1. Oxirgi 3 ta smena holati
    const shifts = db.prepare("SELECT id, start_time, end_time, status, cashier_name, total_sales FROM shifts ORDER BY start_time DESC LIMIT 3").all();
    console.log("\nLAST 3 SHIFTS:");
    shifts.forEach(s => console.log(s));

    // 2. Ochiq smena bormi?
    const openShift = db.prepare("SELECT * FROM shifts WHERE status = 'open'").get();
    console.log("\nOPEN SHIFT:", openShift ? `ID: ${openShift.id}, Start: ${openShift.start_time}` : "NONE");

    // 3. Agar ochiq smena bo'lsa, uning savdolari bormi?
    if (openShift) {
        const salesCount = db.prepare("SELECT COUNT(*) as count FROM sales WHERE shift_id = ?").get(openShift.id);
        console.log(`Sales in Open Shift: ${salesCount.count}`);
    }

    // 4. Settings tekshirish
    const printer = db.prepare("SELECT * FROM settings WHERE key = 'printerReceiptIP'").get();
    console.log("\nPrinter IP in DB:", printer ? printer.value : "NOT SET");

} catch (e) {
    console.error("DIAGNOSTICS ERROR:", e);
}
