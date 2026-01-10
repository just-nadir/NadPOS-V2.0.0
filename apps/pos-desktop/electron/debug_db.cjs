const { db } = require('./database.cjs');
const log = require('electron-log');

// console.log override for better visibility if needed
console.log = log.log;

try {
    console.log("--- DEBUGGING DATABASE ---");

    // Check all shifts
    const shifts = db.prepare("SELECT id, start_time, end_time, status, cashier_name FROM shifts ORDER BY start_time DESC LIMIT 5").all();
    console.log("LAST 5 SHIFTS:");
    console.table(shifts);

    // Check open shifts
    const openShift = db.prepare("SELECT * FROM shifts WHERE status = 'open'").get();
    console.log("OPEN SHIFT:", openShift || "None");

} catch (e) {
    console.error("DEBUG ERROR:", e);
}
