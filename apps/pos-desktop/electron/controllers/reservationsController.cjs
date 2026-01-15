const { db, uuidv4, notify, RESTAURANT_ID } = require('../database.cjs');

const RESERVATION_DURATION_MINUTES = 120; // Default 2 soat

const reservationsController = {
    getReservations: () => {
        try {
            // Get today and future reservations, excluding deleted ones
            const rows = db.prepare(`
                SELECT r.*, t.name as table_name, h.name as hall_name 
                FROM reservations r 
                LEFT JOIN tables t ON r.table_id = t.id 
                LEFT JOIN halls h ON t.hall_id = h.id
                WHERE r.deleted_at IS NULL
                ORDER BY r.reservation_time DESC
            `).all();
            return rows;
        } catch (error) {
            console.error('getReservations error:', error);
            throw error;
        }
    },

    createReservation: (data) => {
        try {
            const { customer_name, customer_phone, reservation_time, guests, table_id, note } = data;

            // 1. Vaqtga tekshiruv (O'tmishga bron qilmaslik)
            const checkTime = new Date(reservation_time);
            const now = new Date();
            // 5 daqiqa bag'rikenglik (client-server vaqt farqi uchun)
            if (checkTime < new Date(now.getTime() - 5 * 60 * 1000)) {
                throw new Error("O'tgan vaqtga bron qilish mumkin emas");
            }

            const id = uuidv4();
            const created_at = now.toISOString();

            let finalTableId = table_id || null;

            // 2. Avtomatik Stol Tanlash yoki Tanlanganni Tekshirish
            if (finalTableId) {
                // Aniq stol tanlangan -> Bandlikka tekshiramiz
                if (isTableBusy(finalTableId, reservation_time)) {
                    throw new Error("Tanlangan stol ushbu vaqtda band");
                }
            } else {
                // Avtomatik -> Bo'sh stol qidiramiz
                finalTableId = findBestAvailableTable(guests, reservation_time);
                if (!finalTableId) {
                    throw new Error("Afsuski, mos keluvchi bo'sh stol topilmadi");
                }
            }

            db.prepare(`
                INSERT INTO reservations (id, customer_name, customer_phone, reservation_time, guests, table_id, note, status, created_at, updated_at, restaurant_id, is_synced)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, 0)
            `).run(id, customer_name, customer_phone, reservation_time, guests, finalTableId, note, created_at, created_at, RESTAURANT_ID);

            // Notify clients
            notify('reservation-update', id);

            return { success: true, id, table_id: finalTableId };
        } catch (error) {
            console.error('createReservation error:', error);
            throw error;
        }
    },

    updateReservationStatus: (id, status) => {
        try {
            const updated_at = new Date().toISOString();
            db.prepare(`UPDATE reservations SET status = ?, updated_at = ?, is_synced = 0 WHERE id = ?`)
                .run(status, updated_at, id);

            notify('reservation-update', id);
            return { success: true };
        } catch (error) {
            console.error('updateReservationStatus error:', error);
            throw error;
        }
    },

    deleteReservation: (id) => {
        try {
            const updated_at = new Date().toISOString();
            // Soft delete
            db.prepare(`UPDATE reservations SET deleted_at = ?, updated_at = ?, is_synced = 0 WHERE id = ?`)
                .run(updated_at, updated_at, id);

            notify('reservation-update', id);
            return { success: true };
        } catch (error) {
            console.error('deleteReservation error:', error);
            throw error;
        }
    }
};

// --- HELPER FUNCTIONS ---

function isTableBusy(tableId, timeStr) {
    const checkTime = new Date(timeStr).getTime();
    const durationMs = RESERVATION_DURATION_MINUTES * 60 * 1000;
    const endTime = checkTime + durationMs;

    // Ushbu stol uchun barcha AKTIV bronlarni olamiz
    // Status: active bo'lishi kerak. Cancelled yoki completed xalaqit bermaydi (agar completed bo'lsa stol bo'shagan hisoblanadi deb faraz qilamiz, yoki completed ham vaqtni egallashi mumkin. Hozircha 'active' ni tekshiramiz)

    const reservations = db.prepare(`
        SELECT reservation_time FROM reservations 
        WHERE table_id = ? 
        AND status = 'active' 
        AND deleted_at IS NULL
    `).all(tableId);

    return reservations.some(res => {
        const existingStart = new Date(res.reservation_time).getTime();
        const existingEnd = existingStart + durationMs;

        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        return (checkTime < existingEnd && endTime > existingStart);
    });
}

function findBestAvailableTable(guests, timeStr) {
    // 1. Sig'imi yetadigan barcha stollarni olamiz
    // Kichik stollarni birinchi, kattalarini keyin (Optimallashtirish)
    const tables = db.prepare(`
        SELECT id, guests as capacity FROM tables 
        WHERE guests >= ? 
        ORDER BY guests ASC
    `).all(guests);

    // 2. Har birini tekshirib chiqamiz
    for (const table of tables) {
        if (!isTableBusy(table.id, timeStr)) {
            return table.id; // Birinchi topilgan bo'sh stol eng yaxshisi (chunki sorted ASC)
        }
    }

    return null;
}

module.exports = reservationsController;
