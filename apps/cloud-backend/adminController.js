const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_nadpos_cloud';
const DATA_DIR = path.join(__dirname, 'data');

// Hardcoded Super Admin
const ADMIN_EMAIL = 'admin@nadpos.com';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10); // Parol: admin123

module.exports = {
    // 1. Admin Login
    login: (req, res) => {
        const { email, password } = req.body;
        if (email !== ADMIN_EMAIL) return res.status(401).json({ error: 'Admin topilmadi' });

        if (!bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
            return res.status(401).json({ error: 'Parol noto\'g\'ri' });
        }

        const token = jwt.sign({ role: 'super_admin' }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, user: { email: ADMIN_EMAIL, role: 'super_admin' } });
    },

    // 2. Get All Restaurants (Folders in DATA_DIR)
    getRestaurants: (req, res) => {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
            return res.json([]);
        }

        const restaurants = [];
        const items = fs.readdirSync(DATA_DIR, { withFileTypes: true });

        items.forEach(item => {
            if (item.isDirectory()) {
                const rid = item.name;
                // Papka ichidan config.json yoki license.json o'qishga harakat qilamiz
                // Agar yo'q bo'lsa, defolt info qaytaramiz
                const configPath = path.join(DATA_DIR, rid, 'config.json');
                let info = { id: rid, name: `Restaurant ${rid.substring(0, 6)}`, status: 'active' };

                if (fs.existsSync(configPath)) {
                    try {
                        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                        info = { ...info, ...config };
                    } catch (e) { }
                }

                restaurants.push(info);
            }
        });

        res.json(restaurants);
    },

    // 3. Create New Restaurant
    createRestaurant: (req, res) => {
        /*
        Body: {
            name: "My Restaurant",
            email: "owner@gmail.com",
            phone: "+998901234567",
            plan: "premium"
        }
        */
        const { name, email, phone, plan } = req.body;

        const rid = uuidv4();
        const restaurantDir = path.join(DATA_DIR, rid);

        if (!fs.existsSync(restaurantDir)) {
            fs.mkdirSync(restaurantDir, { recursive: true });
        }

        // Basic Config fayl
        const config = {
            id: rid,
            name,
            email,
            phone,
            plan,
            created_at: new Date().toISOString(),
            status: 'active'
        };
        fs.writeFileSync(path.join(restaurantDir, 'config.json'), JSON.stringify(config, null, 2));

        // Create Default Admin User for this restaurant (to allow login from Desktop)
        // We need to add this user to the GLOBAL users array in server.js (but server.js uses in-memory array)
        // For PRODUCTION: We should save users to a DB or a file.
        // Let's create `users.json` in the restaurant folder.
        // BUT server.js reads from `users` const variable.
        // UPGRADE: Let server.js read users from file system dynamically.

        const adminUser = {
            id: uuidv4(),
            email,
            password: '123456', // Default password
            restaurant_id: rid,
            role: 'admin',
            plan,
            expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
        };

        const usersFile = path.join(restaurantDir, 'users.json');
        fs.writeFileSync(usersFile, JSON.stringify([adminUser], null, 2));

        res.json({ success: true, restaurant: config, adminUser });
    },

    // 4. Update Status (Block/Unblock)
    updateStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body; // 'active' | 'blocked'

        const configPath = path.join(DATA_DIR, id, 'config.json');
        if (!fs.existsSync(configPath)) return res.status(404).json({ error: 'Topilmadi' });

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config.status = status;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        res.json({ success: true, status });
    },

    // 5. Get Statistics
    getStats: (req, res) => {
        const total = fs.existsSync(DATA_DIR) ? fs.readdirSync(DATA_DIR).length : 0;
        // Mock stats
        res.json({
            total_restaurants: total,
            active_today: Math.floor(total * 0.8),
            mrr: total * 200000 // UZS mock
        });
    }
};
