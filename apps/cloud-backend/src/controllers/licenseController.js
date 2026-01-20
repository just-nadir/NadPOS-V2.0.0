const prisma = require('../config/db');

// --- Litsenziyani uzaytirish (Admin Panel uchun) ---
exports.extendLicense = async (req, res) => {
    try {
        const { restaurantId, months, days, amount } = req.body;

        if (!restaurantId || (!months && !days)) {
            return res.status(400).json({ error: 'Ma\'lumotlar yetarli emas' });
        }

        // 1. Restoranni topish
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: { licenses: true }
        });

        if (!restaurant) {
            return res.status(404).json({ error: 'Restoran topilmadi' });
        }

        // 2. Mavjud litsenziyani topish yoki yangisini yaratish
        let license = restaurant.licenses[0];
        let newExpiresAt;
        const now = new Date();

        if (license) {
            // Agar muddati o'tib ketgan bo'lsa, bugundan boshlab qo'shamiz
            // Agar muddati hali bor bo'lsa, o'sha sanadan davom ettiramiz
            const currentExpireDate = new Date(license.expires_at);
            const baseDate = currentExpireDate > now ? currentExpireDate : now;

            newExpiresAt = new Date(baseDate);
            if (months) newExpiresAt.setMonth(newExpiresAt.getMonth() + parseInt(months));
            if (days) newExpiresAt.setDate(newExpiresAt.getDate() + parseInt(days));

            // Update
            license = await prisma.license.update({
                where: { id: license.id },
                data: {
                    expires_at: newExpiresAt,
                    status: 'active'
                }
            });
        } else {
            // Create new
            newExpiresAt = new Date();
            if (months) newExpiresAt.setMonth(newExpiresAt.getMonth() + parseInt(months));
            if (days) newExpiresAt.setDate(newExpiresAt.getDate() + parseInt(days));

            // Generate random key
            const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            license = await prisma.license.create({
                data: {
                    key: key,
                    restaurant_id: restaurantId,
                    expires_at: newExpiresAt,
                    status: 'active'
                }
            });
        }

        // 3. To'lov tarixiga yozish (Agar summa bo'lsa)
        if (amount && amount > 0) {
            await prisma.payment.create({
                data: {
                    restaurant_id: restaurantId,
                    amount: parseFloat(amount),
                    status: 'completed',
                    method: 'manual_admin',
                    created_at: new Date()
                }
            });
        }

        res.json({
            success: true,
            message: 'Litsenziya uzaytirildi',
            license,
            expires_at: newExpiresAt
        });

    } catch (error) {
        console.error("Extend License Error:", error);
        res.status(500).json({ error: 'Server xatosi' });
    }
};

// --- Litsenziyani tekshirish (Desktop uchun) ---
exports.verifyLicense = async (req, res) => {
    try {
        const { key, hwid } = req.body; // Key restoran ID si ham bo'lishi mumkin yoki litsenziya kaliti

        // Bizda desktopda restoran ID si bormi yoki faqat Key?
        // Keling, desktop serverga so'rov yuborganda restaurantId ni headerda yoki body da yuboradi deb faraz qilaylik, 
        // Yoki Key orqali topamiz.

        // Agar Key bo'lsa:
        let license;
        if (key) {
            license = await prisma.license.findUnique({ where: { key } });
        }

        // Agar topilmasa headerdagi user -> restaurant dan topamiz (Desktopda login qilingan bo'lsa)
        if (!license && req.user && req.user.restaurantId) {
            const rest = await prisma.restaurant.findUnique({
                where: { id: req.user.restaurantId },
                include: { licenses: true }
            });
            if (rest && rest.licenses.length > 0) license = rest.licenses[0];
        }

        if (!license) {
            return res.status(404).json({ status: 'error', message: 'Litsenziya topilmadi' });
        }

        // MUDDATNI TEKSHIRISH
        const now = new Date();
        const expiresAt = new Date(license.expires_at);

        if (expiresAt < now) {
            return res.json({
                status: 'blocked',
                message: 'Litsenziya muddati tugagan',
                expires_at: license.expires_at
            });
        }

        // Agar litsenziya aktiv bo'lsa, yangi token generatsiya qilamiz
        let newToken = null;
        if (req.user) {
            const authService = require('../services/authService');
            const payload = {
                uid: req.user.id,
                rid: license.restaurant_id,
                role: req.user.role,
                plan: req.user.plan || 'basic',
                hwid: hwid
            };
            const durationMs = expiresAt - now;
            const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

            try {
                newToken = authService.generateToken(payload, `${durationDays}d`);
                await prisma.license.update({ where: { id: license.id }, data: { key: newToken } });
            } catch (e) { console.log('Token update skipped'); }
        }

        res.json({
            status: 'active',
            expires_at: license.expires_at,
            days_left: Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)),
            newToken
        });

    } catch (error) {
        console.error("Verify License Error:", error);
        res.status(500).json({ error: 'Server xatosi' });
    }
};

// --- Restoran litsenziyasini olish (Admin UI uchun) ---
exports.getRestaurantLicense = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const license = await prisma.license.findFirst({
            where: { restaurant_id: restaurantId }
        });
        res.json(license || null);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
