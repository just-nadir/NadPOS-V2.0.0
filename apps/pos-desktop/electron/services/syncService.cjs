const { db } = require('../database.cjs');
const axios = require('axios');
const log = require('electron-log');
const licenseService = require('./licenseService.cjs');
const config = require('../config.cjs');

// Cloud Backend URL
const CLOUD_URL = config.CLOUD_URL;

class SyncService {
    constructor() {
        this.isSyncing = false;
        this.timer = null;
        this.start();
    }

    start() {
        // Har 10 soniyada sinxronizatsiya
        this.timer = setInterval(() => this.sync(), 10000);
        log.info("🔄 SyncService started");
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
    }

    async sync() {
        if (this.isSyncing) return;

        // 1. Litsenziya va Tokenni tekshirish
        const license = licenseService.getLicense();
        if (license.status !== 'ACTIVE' && license.status !== 'GRACE_PERIOD') {
            return; // Obuna tugagan bo'lsa, sync qilmaymiz
        }

        // Tokenni file dan o'qib olish (chunki licenseService faqat decoded datani qaytaradi)
        // Yoki licenseService ga getToken() metodini qo'shish kerak.
        // Hozircha oddiy yechim:
        const fs = require('fs');
        const path = require('path');
        const { app } = require('electron');
        const tokenPath = path.join(app.getPath('userData'), 'license.key');
        if (!fs.existsSync(tokenPath)) return;
        const token = fs.readFileSync(tokenPath, 'utf8').trim();

        this.isSyncing = true;

        try {
            // 2. Navbatdagi ma'lumotlarni olish (LIMIT 50)
            const items = db.prepare(`
                SELECT * FROM sync_queue 
                WHERE status = 'pending' 
                ORDER BY created_at ASC 
                LIMIT 50
            `).all();

            if (items.length === 0) {
                this.isSyncing = false;
                return;
            }

            console.log(`📤 Syncing ${items.length} items...`);

            // 3. Cloudga yuborish
            const response = await axios.post(`${CLOUD_URL}/sync/push`, {
                items: items.map(item => ({
                    ...item,
                    payload: JSON.parse(item.payload)
                }))
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                // 4. Muvaffaqiyatli bo'lsa, navbatdan o'chirish (yoki status=synced)
                // Transaction ishlatamiz
                const updateStmt = db.prepare("UPDATE sync_queue SET status = 'synced' WHERE id = ?");
                const deleteStmt = db.prepare("DELETE FROM sync_queue WHERE id = ?");

                const processTransaction = db.transaction((syncedItems) => {
                    for (const item of syncedItems) {
                        // deleteStmt.run(item.id); // Yoki o'chirib tashlash
                        updateStmt.run(item.id); // Tarix uchun saqlab qo'yish
                    }
                });

                processTransaction(items);
                console.log("✅ Push Sync success!");
            }
        } catch (error) {
            console.error("❌ Push Sync failed:", error.message);
        }
    }

    async pull(token) {
        try {
            // 1. Oxirgi sync vaqtini olish (settingsdan yoki local var dan)
            // Hozircha oddiy: har safar so'rash (lekin server diff berishi kerak)
            // Yaxshisi, settings jadvalidan 'last_pull_date' ni olamiz.
            let lastPullDate = '1970-01-01T00:00:00.000Z';
            const setting = db.prepare("SELECT value FROM settings WHERE key = 'last_pull_date'").get();
            if (setting) lastPullDate = setting.value;

            // 2. Cloud dan o'zgarishlarni so'rash
            const response = await axios.get(`${CLOUD_URL}/sync/pull`, {
                params: { last_sync: lastPullDate },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success && response.data.items && response.data.items.length > 0) {
                const items = response.data.items;
                console.log(`📥 Pull Sync: ${items.length} updates received.`);

                // 3. Lokal bazaga qo'llash
                const applyTransaction = db.transaction((updates) => {
                    for (const update of updates) {
                        this.applyUpdate(update);
                    }
                    // Yangi vaqtni saqlash
                    const newSyncTime = new Date().toISOString();
                    db.prepare("INSERT OR REPLACE INTO settings (key, value, is_synced) VALUES ('last_pull_date', ?, 0)").run(newSyncTime);
                });

                applyTransaction(items);
                console.log("✅ Pull Sync applied successfully.");
            }

        } catch (error) {
            console.error("❌ Pull Sync failed:", error.message);
        }
    }

    applyUpdate(update) {
        // update: { table: 'products', operation: 'INSERT', data: { id: '...', name: '...' } }
        const { table, operation, data } = update;

        // Security check: faqat ruxsat berilgan jadvallar
        const allowedTables = ['products', 'categories', 'users', 'settings', 'kitchens', 'halls', 'tables', 'sms_templates'];
        if (!allowedTables.includes(table)) return;

        try {
            if (operation === 'INSERT' || operation === 'UPDATE') {
                const columns = Object.keys(data);
                const values = Object.values(data);
                const placeholders = columns.map(() => '?').join(',');
                const updates = columns.map(c => `${c}=?`).join(',');

                // INSERT OR REPLACE
                const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`;
                db.prepare(sql).run(...values);

                // Maxsus holat: Settings o'zgarsa, notify qilish kerak
                // Bu yerda DB change ni chaqirishimiz mumkin, lekin loop bo'lmasligi uchun is_synced=1 qilishimiz kerak (serverdan keldi).
                // Lekin better-sqlite3 da triggerlar yo'q, shunchaki yozamiz.

            } else if (operation === 'DELETE') {
                const id = data.id;
                if (id) {
                    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
                }
            }
        } catch (e) {
            console.error(`Apply Update Error (${table}):`, e.message);
        }
    }

    async sync() {
        if (this.isSyncing) return;

        const license = licenseService.getLicense();
        if (license.status !== 'ACTIVE' && license.status !== 'GRACE_PERIOD') return;

        const fs = require('fs');
        const path = require('path');
        const { app } = require('electron');
        const tokenPath = path.join(app.getPath('userData'), 'license.key');
        if (!fs.existsSync(tokenPath)) return;
        const token = fs.readFileSync(tokenPath, 'utf8').trim();

        this.isSyncing = true;
        try {
            await this.push(token); // Oldingi logic -> push metodiga o'tkazildi deb faraz qilamiz yoki shu yerda qoladi
            await this.pull(token); // Yangi pull logic
        } finally {
            this.isSyncing = false;
        }
    }

    // Eski sync ichidagi mantiqni push ga ajratamiz
    async push(token) {
        try {
            const items = db.prepare(`
                SELECT * FROM sync_queue 
                WHERE status = 'pending' 
                ORDER BY created_at ASC 
                LIMIT 50
            `).all();

            if (items.length === 0) return;

            console.log(`📤 Pushing ${items.length} items...`);

            const response = await axios.post(`${CLOUD_URL}/sync/push`, {
                items: items.map(item => ({
                    ...item,
                    payload: JSON.parse(item.payload)
                }))
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                const updateStmt = db.prepare("UPDATE sync_queue SET status = 'synced' WHERE id = ?");
                const processTransaction = db.transaction((syncedItems) => {
                    for (const item of syncedItems) {
                        updateStmt.run(item.id);
                    }
                });
                processTransaction(items);
                console.log("✅ Push Sync success!");
            }
        } catch (error) {
            console.error("❌ Push Sync failed:", error.message);
        }
    }
}

module.exports = new SyncService();
