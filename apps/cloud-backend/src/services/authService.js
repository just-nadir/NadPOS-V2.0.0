const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper: Sign Token
const generateToken = (payload, expiresIn = '7d') => {
    const fs = require('fs');
    const path = require('path');
    let privateKey;
    try {
        const keyPath = process.env.PRIVATE_KEY_PATH || path.join(__dirname, '../../private.pem');
        privateKey = fs.readFileSync(keyPath, 'utf8');
    } catch (e) {
        console.error('CRITICAL: Private Key not found! using secret for fallback (unsafe)');
        privateKey = process.env.JWT_SECRET;
    }
    return jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn });
};

const login = async (phone, password, hwid) => {
    // 1. Find User
    const user = await prisma.user.findUnique({
        where: { phone },
        include: { restaurant: true } // Include restaurant details (e.g. plan)
    });

    if (!user) {
        throw new Error('Foydalanuvchi topilmadi');
    }

    // 2. Validate Password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new Error('Parol noto\'g\'ri');
    }

    // 3. License/Status Check
    if (user.restaurant && user.restaurant.status !== 'active') {
        throw new Error('Restoran bloklangan yoki faol emas');
    }

    // 4. Update Token
    const payload = {
        uid: user.id,
        rid: user.restaurant_id,
        role: user.role,
        plan: user.restaurant?.plan || 'basic',
        hwid: hwid
    };

    const token = generateToken(payload, '7d'); // Default login duration

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            restaurant_id: user.restaurant_id,
            plan: user.restaurant?.plan,
            name: user.restaurant?.name
        }
    };
};

const registerAdmin = async (phone, password, restaurantName, email) => {
    // Used for Super Admin to create restaurant + admin
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction: Create Restaurant + User
    const result = await prisma.$transaction(async (prisma) => {
        const restaurant = await prisma.restaurant.create({
            data: {
                name: restaurantName,
                email: email || `${phone}@nadpos.uz`, // Fallback email
                phone: phone,
                plan: 'basic'
            }
        });

        const user = await prisma.user.create({
            data: {
                phone,
                email,
                password: hashedPassword,
                role: 'admin',
                restaurant_id: restaurant.id
            }
        });

        return { restaurant, user };
    });

    return result;
};

module.exports = {
    login,
    registerAdmin,
    generateToken
};
