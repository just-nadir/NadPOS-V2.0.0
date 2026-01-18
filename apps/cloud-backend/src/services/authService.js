const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (email, password, hwid) => {
    // 1. Find User
    const user = await prisma.user.findUnique({
        where: { email },
        include: { restaurant: true } // Include restaurant details (e.g. plan)
    });

    if (!user) {
        throw new Error('User not found');
    }

    // 2. Validate Password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new Error('Invalid password');
    }

    // 3. License/Status Check
    if (user.restaurant && user.restaurant.status !== 'active') {
        throw new Error('Restaurant is blocked or inactive');
    }

    // 4. Update Token
    const payload = {
        uid: user.id,
        rid: user.restaurant_id,
        role: user.role,
        plan: user.restaurant?.plan || 'basic',
        hwid: hwid
    };

    // Sign with RSA Private Key
    // Read key locally or from env
    const fs = require('fs');
    const path = require('path');
    let privateKey;
    try {
        // Try to load /app/private.pem (Docker) or local
        const keyPath = process.env.PRIVATE_KEY_PATH || path.join(__dirname, '../../private.pem');
        privateKey = fs.readFileSync(keyPath, 'utf8');
    } catch (e) {
        console.error('CRITICAL: Private Key not found! using secret for fallback (unsafe)');
        privateKey = process.env.JWT_SECRET; // Fallback only for dev
    }

    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '7d' });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            restaurant_id: user.restaurant_id,
            plan: user.restaurant?.plan,
            name: user.restaurant?.name
        }
    };
};

const registerAdmin = async (email, password, restaurantName) => {
    // Used for Super Admin to create restaurant + admin
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction: Create Restaurant + User
    const result = await prisma.$transaction(async (prisma) => {
        const restaurant = await prisma.restaurant.create({
            data: {
                name: restaurantName,
                email: email, // Restaurant email same as admin email initially
                plan: 'basic'
            }
        });

        const user = await prisma.user.create({
            data: {
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
    registerAdmin
};
