const { db } = require('../database.cjs');
const axios = require('axios');
const log = require('electron-log');
const licenseService = require('./licenseService.cjs');

// Cloud Backend URL (Production da o'zgartiriladi)
const CLOUD_URL = 'http://213.142.148.35:4000/api';

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
                console.log("✅ Sync success!");
            }

        } catch (error) {
            console.error("❌ Sync failed:", error.message);
            // Retry count oshirish mumkin
        } finally {
            this.isSyncing = false;
        }
    }
}

module.exports = new SyncService();
