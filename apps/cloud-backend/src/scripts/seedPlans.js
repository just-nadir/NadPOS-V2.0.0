const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding plans...');

    const plans = [
        {
            name: 'Start',
            price: 0,
            currency: 'UZS',
            interval: 'month',
            features: ['1 ta Restoran', 'Cheklangan Mahsulotlar', '1 ta Ofitsiant'],
            is_active: true
        },
        {
            name: 'Standard',
            price: 150000,
            currency: 'UZS',
            interval: 'month',
            features: ['Cheksiz Mahsulotlar', '5 ta Xodim', 'Ombor Xisobi (Basic)'],
            is_active: true
        },
        {
            name: 'Premium',
            price: 300000,
            currency: 'UZS',
            interval: 'month',
            features: ['Barcha Imkoniyatlar', 'Cheksiz Xodimlar', 'To\'liq Statistika', 'Telegram Bot'],
            is_active: true
        }
    ];

    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { name: plan.name },
            update: plan,
            create: plan,
        });
        console.log(`Plan created/updated: ${plan.name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
