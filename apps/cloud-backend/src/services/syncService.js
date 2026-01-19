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

const pullData = async (restaurantId, lastSync) => {
    const changes = [];
    // Agar lastSync 1970 yil bo'lsa (yoki null), hammasini olib beramiz.
    // Aks holda faqat o'zgarganlarni.
    const since = lastSync ? new Date(lastSync) : new Date(0);

    try {
        // Har bir model bo'yicha loop qilamiz
        for (const [tableName, modelName] of Object.entries(MODEL_MAP)) {
            const model = prisma[modelName];
            if (!model) continue;

            // Find records for this restaurant updated after 'since'
            // Deleted records?
            // Hozirgi prisma schemada 'deleted_at' yoki soft delete yo'q (schema.prisma da ko'rmadim).
            // Agar record fizik o'chirilgan bo'lsa, pull da uni 'DELETE' deb jo'nata olmaymiz (chunki record yo'q).
            // Shuning uchun bu faqat CREATE/UPDATE ni sync qiladi.
            // DELETE sync uchun "DeletedRecords" jadvali yoki Soft Delete kerak.
            // MVP uchun: Faqat bor ma'lumotlarni tortib olish (Recovery).

            // Modelda 'restaurant_id' va 'updated_at' borligiga ishonch hosil qilishimiz kerak.
            // Schema bo'yicha hamma modellarda 'updated_at' bormi?
            // Restaurant -> updated_at (BOR) -> lekin bu 'halls' emas.
            // Hall -> Schema: hall_id, restaurant_id... (updated_at bormi?)
            // Keling assumption qilamiz: Agar updated_at bo'lmasa, created_at ishlatamiz.
            // Yoki shunchaki hamma datani olamiz (kichik hajm).

            // To be safe, let's look at schema again later. For now assume updated_at exists or we fetch all.
            // Realistically, database.cjs defines updated_at on Desktop.
            // Does Backend schema have updated_at?
            // Step 1160: Hall doesn't show updated_at explicitly.
            // Let's check schema via Prisma introspection or just try to fetch.
            // If field doesn't exist, Prisma will throw.

            // Wait, schema.prisma showed models:
            /*
            model Hall {
                id String @id
                restaurant_id String
                name String
                restaurant Restaurant ...
                @@map("halls")
            }
            */
            // NO updated_at or created_at in Hall model in Backend Schema!
            // This is a problem. We cannot filter by date.
            // We must fetch ALL records for the restaurant. (Snapshot Sync)
            // For MVP this is acceptable if data is small.

            // Safe query: findMany where restaurant_id = ...

            const records = await model.findMany({
                where: { restaurant_id: restaurantId }
            });

            for (const record of records) {
                // Check if we strictly need date filtering
                // If backend has no timestamps, we send everything.
                // Desktop handles deduplication (INSERT OR REPLACE).

                changes.push({
                    table: tableName,
                    operation: 'INSERT', // 'INSERT' is effectively 'UPSERT' on desktop
                    data: record
                });
            }
        }

        return { success: true, items: changes };

    } catch (error) {
        console.error("Sync Pull Error:", error);
        throw new Error(`Pull failed: ${error.message}`);
    }
};

module.exports = {
    pushData,
    pullData
};
