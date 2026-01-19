const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createSuperAdmin() {
    try {
        const email = 'owner@nadpos.com';
        const password = 'owner';
        const hashedPassword = await bcrypt.hash(password, 10);
        const adminEmail = 'system@nadpos.com';

        console.log('--- Super Admin Seeding ---');

        // 1. Find or Create Restaurant for Super Admin
        let adminRestaurant = await prisma.restaurant.findUnique({
            where: { email: adminEmail }
        });

        if (!adminRestaurant) {
            console.log('Creating System Admin HQ restaurant...');
            adminRestaurant = await prisma.restaurant.create({
                data: {
                    name: 'System Admin HQ',
                    email: adminEmail,
                    plan: 'premium',
                    status: 'active'
                }
            });
        } else {
            console.log('System Admin HQ restaurant found:', adminRestaurant.id);
        }

        // 2. Find or Create Super Admin User
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            console.log('Super Admin user exists. Updating role and password...');
            await prisma.user.update({
                where: { email },
                data: {
                    role: 'super_admin',
                    password: hashedPassword, // Reset password to safely known value
                    restaurant_id: adminRestaurant.id
                }
            });
        } else {
            console.log('Creating new Super Admin user...');
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'super_admin',
                    restaurant: {
                        connect: { id: adminRestaurant.id }
                    }
                }
            });
        }

        console.log('✅ Super Admin ready: owner@nadpos.com / owner');

    } catch (e) {
        console.error('Seeding Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperAdmin();
