const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding restaurant data...');

    // 1. Get first restaurant
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
        console.error('No restaurant found. Please create one first via Admin Panel.');
        return;
    }
    const rid = restaurant.id;
    console.log(`Seeding data for restaurant: ${restaurant.name} (${rid})`);

    // 2. Create Categories & Products
    const category = await prisma.category.create({
        data: {
            id: 'cat_' + Math.random().toString(36).substr(2, 9),
            restaurant_id: rid,
            name: 'Taomlar'
        }
    });

    const products = [];
    for (let i = 1; i <= 5; i++) {
        const product = await prisma.product.create({
            data: {
                id: 'prod_' + Math.random().toString(36).substr(2, 9),
                restaurant_id: rid,
                category_id: category.id,
                name: `Taom ${i}`,
                price: (i * 10000) + 5000, // 15000, 25000...
                stock: 100
            }
        });
        products.push(product);
    }

    // 3. Create Tables
    const hall = await prisma.hall.create({
        data: {
            id: 'hall_' + Math.random().toString(36).substr(2, 9),
            restaurant_id: rid,
            name: 'Asosiy Zal'
        }
    });

    const tables = [];
    for (let i = 1; i <= 10; i++) {
        const table = await prisma.table.create({
            data: {
                id: 'table_' + Math.random().toString(36).substr(2, 9),
                restaurant_id: rid,
                hall_id: hall.id,
                name: `Stol ${i}`,
                status: i <= 3 ? 'occupied' : 'active'
            }
        });
        tables.push(table);
    }

    // 4. Create Operations (Orders & Payments)
    // Create 20 orders for today
    const startOfDay = new Date();
    startOfDay.setHours(8, 0, 0, 0);

    for (let i = 0; i < 20; i++) {
        const orderId = 'ord_' + Math.random().toString(36).substr(2, 9);
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        const amount = randomProduct.price * qty;

        // Spread orders throughout the day
        const time = new Date(startOfDay.getTime() + (Math.random() * 1000 * 60 * 60 * 12)); // 12 hours window

        await prisma.order.create({
            data: {
                id: orderId,
                restaurant_id: rid,
                status: 'completed', // or paid
                total_amount: amount,
                created_at: time,
                items: {
                    create: {
                        id: 'item_' + Math.random().toString(36).substr(2, 9),
                        restaurant_id: rid,
                        product_id: randomProduct.id,
                        quantity: qty,
                        price: randomProduct.price,
                        total_price: amount
                    }
                }
            }
        });

        await prisma.payment.create({
            data: {
                restaurant_id: rid,
                amount: amount,
                status: 'completed',
                method: 'cash',
                created_at: time
            }
        });
    }

    console.log('Done! 20 orders created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
