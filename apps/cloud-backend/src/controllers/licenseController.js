const prisma = require('../config/db');

// --- Litsenziyani uzaytirish (Admin Panel uchun) ---
exports.extendLicense = async (req, res) => {
    try {
        const { restaurantId, months, days, amount, specificDate } = req.body;

        if (!restaurantId || (!months && !days && !specificDate)) {
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

        if (specificDate) {
            // Aniq sana belgilash
            newExpiresAt = new Date(specificDate);
            // Vaqtni kun o'rtasiga (12:00) qo'yamiz, timezone sakrashini oldini olish uchun
            newExpiresAt.setHours(12, 0, 0, 0);
        } else if (license) {
            // Agar muddati o'tib ketgan bo'lsa, bugundan boshlab qo'shamiz
            // Agar muddati hali bor bo'lsa, o'sha sanadan davom ettiramiz
            const currentExpireDate = new Date(license.expires_at);
            const baseDate = currentExpireDate > now ? currentExpireDate : now;

            newExpiresAt = new Date(baseDate);
            if (months) newExpiresAt.setMonth(newExpiresAt.getMonth() + parseInt(months));
            if (days) newExpiresAt.setDate(newExpiresAt.getDate() + parseInt(days));
        } else {
            // Create new
            newExpiresAt = new Date();
            if (months) newExpiresAt.setMonth(newExpiresAt.getMonth() + parseInt(months));
            if (days) newExpiresAt.setDate(newExpiresAt.getDate() + parseInt(days));
        }

        if (license) {
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
    const { key, hwid } = req.body;
    const jwt = require('jsonwebtoken'); // Ensure import

    // 1. Tokenni headerdan olish va dekodlash (Resursni topish uchun)
    const authHeader = req.headers.authorization;
    let userFromToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.decode(token);
            if (decoded && decoded.rid) {
                userFromToken = decoded;
            }
        } catch (e) {
            console.error("Token decode error:", e);
        }
    }

    try {
        let license;
        let restaurantBlocked = false;

        // A. Agar Key bo'lsa va u JWT bo'lmasa (Qisqa Key bo'lsa)
        if (key && !key.startsWith('eyJ')) {
            license = await prisma.license.findUnique({
                where: { key },
                include: { restaurant: true }
            });
        }

        // B. Agar Key topilmasa, Tokendagi Restaurant ID orqali izlaymiz (Fallback)
        // req.user ISHLAMAYDI chunki middleware yo'q. userFromToken dan foydalanamiz.
        if (!license && userFromToken && userFromToken.rid) {
            const rest = await prisma.restaurant.findUnique({
                where: { id: userFromToken.rid },
                include: { licenses: { orderBy: { created_at: 'desc' }, take: 1 } }
            });

            if (rest) {
                // Restoran statusini tekshirish
                if (rest.status !== 'active') {
                    restaurantBlocked = true;
                }

                // Eng oxirgi litsenziyani olamiz
                if (rest.licenses.length > 0) {
                    license = rest.licenses[0];
                    license.restaurant = rest;
                }
            }
        }

        // 0. BLOKLASHNI TEKSHIRISH (Eng muhimi)
        if (restaurantBlocked || (license && license.restaurant && license.restaurant.status !== 'active')) {
            return res.json({
                status: 'blocked',
                message: 'Restoran bloklangan',
                reason: 'Admin tomonidan bloklangan'
            });
        }

        if (!license) {
            return res.status(404).json({ status: 'error', message: 'Litsenziya topilmadi' });
        }

        // 1. HWID tekshirish
        if (license.hwid && license.hwid !== hwid) {
            // return res.status(403).json({ status: 'error', message: 'Ushbu litsenziya boshqa qurilmaga biriktirilgan' });
        }

        // 2. Muddat tugaganini tekshirish
        const expiresAt = new Date(license.expires_at);
        const now = new Date();
        const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

        if (expiresAt < now) {
            return res.json({
                status: 'expired',
                message: 'Litsenziya muddati tugagan',
                expires_at: license.expires_at
            });
        }

        // 3. Tokenni yangilash (Refresh Token Logic)
        // Agar litsenziya active bo'lsa, yangi token beramiz (ma'lumotlarni yangilash uchun)
        const authService = require('../services/authService');

        // Yangi payload
        const payload = {
            id: license.id, // License ID
            rid: license.restaurant_id,
            hwid: hwid,
            role: userFromToken?.role || 'admin', // userFromToken dan rol
            key: license.key, // Yangi tizimdagi kalit
            plan: license.restaurant.plan
        };

        // Muddat: Database dagi expires_at gacha
        // expiresIn ni hisoblash: 
        const diffInSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
        const duration = diffInSeconds > 0 ? diffInSeconds + 's' : '1h';

        // Agar muddat juda kam qolgan bo'lsa (masalan 1 kundan kam)
        if (diffInSeconds < 0) {
            // Already handled by expired check above
        }

        // Yangi tokenni authService orqali yasash qiyin bo'lishi mumkin agar u faqat user token uchun moslashgan bo'lsa
        // Lekin generateToken universal ishlaydi
        const newToken = authService.generateToken(payload, duration);

        // Update user stats or last seen? (Optional)

        return res.json({
            status: 'active',
            message: 'Litsenziya faol',
            days_left: daysLeft,
            expires_at: license.expires_at,
            newToken: newToken // Client buni saqlab oladi
        });

    } catch (error) {
        console.error('Verify License Error:', error);
        res.status(500).json({ status: 'error', message: 'Server xatosi: ' + error.message });
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
