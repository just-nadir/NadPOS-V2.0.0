const prisma = require('../config/db');

// Map table names to Prisma Delegate names
const MODEL_MAP = {
    'halls': 'hall',
    'tables': 'table',
    'categories': 'category',
    'products': 'product',
    'orders': 'order',
    'order_items': 'orderItem',
    'customers': 'customer',
    'staff': 'staff'
};

const pushData = async (restaurantId, items) => {
    if (!items || items.length === 0) return { success: true, count: 0 };

    // Transaction ichida bajarish xavfsizroq
    try {
        await prisma.$transaction(async (tx) => {
            for (const item of items) {
                const modelName = MODEL_MAP[item.table_name];
                if (!modelName) {
                    console.warn(`Unknown table: ${item.table_name}`);
                    continue;
                }

                const model = tx[modelName];
                const cleanPayload = { ...item.payload };

                // Restaurant ID ni majburiy qo'shish (Xavfsizlik)
                cleanPayload.restaurant_id = restaurantId;

                // Aloqa o'rnatish uchun relation fieldlarni to'g'irlash kerak bo'lishi mumkin
                // Masalan desktopda 'hall_id' keladi, Prismada ham 'hall_id' bor. Mos tushadi.

                if (item.operation === 'INSERT' || item.operation === 'UPDATE') {
                    // Upsert (Create or Update)
                    // Prisma upsert requires 'where' with unique constraint.
                    // Bizning IDlarimiz UUID, shuning uchun 'id' bo'yicha unique.

                    // Lekin ba'zi jadvallarda (masalan Hall) composite unique (id + restaurant_id) bo'lishi mumkin.
                    // Desktopdan kelgan ID global unique bo'lsa, 'id' yetarli. 
                    // Agar desktop generatsiya qilgan ID bo'lsa, u UUID v4 bo'lishi kerak.

                    // Sana formatlarini to'g'irlash
                    if (cleanPayload.created_at) cleanPayload.created_at = new Date(cleanPayload.created_at);
                    if (cleanPayload.synced_at) cleanPayload.synced_at = new Date();

                    await model.upsert({
                        where: { id: cleanPayload.id },
                        create: cleanPayload,
                        update: cleanPayload
                    });

                } else if (item.operation === 'DELETE') {
                    // Delete if exists
                    try {
                        await model.delete({
                            where: { id: item.record_id }
                        });
                    } catch (e) {
                        // Record topilmasa, ignore qilamiz (allaqachon o'chgan bo'lishi mumkin)
                        if (e.code !== 'P2025') throw e;
                    }

                } else if (item.operation === 'DELETE_ALL_FOR_TABLE') {
                    // Maxsus holat: OrderItemlarni tozalash (masalan order o'zgarganda)
                    // Payload orqali filter qilish kerak
                    if (modelName === 'orderItem' && cleanPayload.order_id) {
                        await model.deleteMany({
                            where: {
                                order_id: cleanPayload.order_id
                            }
                        });
                    }
                }
            }
        });

        return { success: true, count: items.length };

    } catch (error) {
        console.error("Sync Transaction Error:", error);
        throw new Error(`Sync failed: ${error.message}`);
    }
};

module.exports = {
    pushData
};
