const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // 1. Get first restaurant
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
        console.error('No restaurant found.');
        return;
    }

    const phone = '+998901234567';
    const password = 'dashboard_pass';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { phone: phone },
        update: {
            password: hashedPassword,
            role: 'admin',
            restaurant_id: restaurant.id
        },
        create: {
            phone: phone,
            password: hashedPassword,
            role: 'admin',
            restaurant_id: restaurant.id,
            email: 'dashboard@nadpos.uz'
        }
    });

    console.log('Dashboard User Created:');
    console.log(`Phone: ${phone}`);
    console.log(`Password: ${password}`);
    console.log(`Restaurant: ${restaurant.name}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
