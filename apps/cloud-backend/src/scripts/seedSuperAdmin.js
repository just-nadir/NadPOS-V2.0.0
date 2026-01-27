const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const phone = '+998942332112';
    const password = 'Nodir1998';

    console.log(`Creating Super Admin with phone: ${phone}...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { phone: phone },
        update: {
            password: hashedPassword, // Update password if exists
            role: 'super_admin'
        },
        create: {
            phone: phone,
            password: hashedPassword,
            role: 'super_admin',
            email: 'admin@nadpos.uz' // Optional fallback
        },
    });

    console.log('Super Admin successfully created/updated:');
    console.log(`ID: ${user.id}`);
    console.log(`Phone: ${user.phone}`);
    console.log(`Role: ${user.role}`);
}

main()
    .catch((e) => {
        console.error('Error creating super admin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
