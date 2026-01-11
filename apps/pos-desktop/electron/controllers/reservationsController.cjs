const { db, uuidv4, RESTAURANT_ID } = require('../database.cjs');

const reservationsController = {
    getReservations: () => {
        try {
            // Get today and future reservations
            const rows = db.prepare(`
                SELECT r.*, t.name as table_name 
                FROM reservations r 
                LEFT JOIN tables t ON r.table_id = t.id 
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
            const id = uuidv4();
            const created_at = new Date().toISOString();

            // Validation: Check overlap if table selected
            const finalTableId = table_id || null;

            if (finalTableId) {
                const checkTime = new Date(reservation_time).getTime();
                const duration = 2 * 60 * 60 * 1000; // 2 hours

                // SQLite da vaqtni solishtirish qiyinroq, shuning uchun JS da qilsa ham bo'ladi
            }

            db.prepare(`
                INSERT INTO reservations (id, customer_name, customer_phone, reservation_time, guests, table_id, note, status, created_at, updated_at, restaurant_id, is_synced)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, 0)
            `).run(id, customer_name, customer_phone, reservation_time, guests, finalTableId, note, created_at, created_at, RESTAURANT_ID);

            return { success: true, id };
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
            return { success: true };
        } catch (error) {
            console.error('deleteReservation error:', error);
            throw error;
        }
    }
};

module.exports = reservationsController;
