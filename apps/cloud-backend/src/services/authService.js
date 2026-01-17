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

    // 3. License/Status Check (Optional logic here or in controller)
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

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }); // 7 days token

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
