const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_nadpos_cloud';

app.use(cors());
app.use(express.json());

// --- MOCK DATABASE (MVP uchun) ---
// Keyinchalik PostgreSQL bo'ladi.
const users = [
    {
        id: '1',
        email: 'admin@test.com',
        passwordHash: bcrypt.hashSync('123456', 10),
        restaurant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        role: 'admin',
        plan: 'premium',
        expires_at: '2026-12-31T23:59:59.999Z'
    }
];

// --- AUTH API ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, hwid } = req.body;

        console.log(`🔐 Login attempt: ${email} (HWID: ${hwid})`);

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
        }

        const validPassword = bcrypt.compareSync(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Noto\'g\'ri parol' });
        }

        // Litsenziya Tokenini yaratish (Uzoq muddatli)
        // Bu token Desktop ilovada saqlanadi va Offline ishlaydi.
        const licensePayload = {
            uid: user.id,
            rid: user.restaurant_id,
            role: user.role,
            plan: user.plan,
            hwid: hwid, // Hardware ID ga bog'laymiz
            expires_at: user.expires_at
        };

        const token = jwt.sign(licensePayload, JWT_SECRET); // `expiresIn` qo'shmadik, chunki payload ichida `expires_at` bor.

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                restaurant_id: user.restaurant_id,
                plan: user.plan,
                expires_at: user.expires_at
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// --- LICENSE VERIFICATION API (Online Check) ---
app.post('/api/license/verify', (req, res) => {
    const { token, hwid } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // 1. HWID tekshirish
        if (decoded.hwid && decoded.hwid !== hwid) {
            return res.status(403).json({ valid: false, reason: 'HWID_MISMATCH' });
        }

        // 2. Muddatni tekshirish
        if (new Date(decoded.expires_at) < new Date()) {
            return res.status(403).json({ valid: false, reason: 'EXPIRED' });
        }

        res.json({ valid: true, plan: decoded.plan });
    } catch (e) {
        res.status(401).json({ valid: false, reason: 'INVALID_TOKEN' });
    }
});

// --- SYNC API (Data Push) ---
app.post('/api/sync/push', (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ error: 'Auth token missing' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const { rid } = decoded;

        // MOCK: Ma'lumotlarni qabul qilish va saqlash (ISOLATION)
        const { items } = req.body;
        console.log(`📥 Sync Received from ${rid}: ${items.length} items`);

        // Data directory for this restaurant
        const dataDir = path.join(__dirname, 'data', rid);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        items.forEach(item => {
            console.log(`   - ${item.operation} ${item.table_name}:${item.record_id}`);

            // Save each table to a separate JSON file
            const tableFile = path.join(dataDir, `${item.table_name}.json`);
            let tableData = [];
            if (fs.existsSync(tableFile)) {
                tableData = JSON.parse(fs.readFileSync(tableFile, 'utf8'));
            }

            // Simple merging logic (Upsert)
            // Note: This is a MOCK DB using JSON files.
            // In real PostgreSql, we would use INSERT ON CONFLICT or UPDATE.

            if (item.operation === 'INSERT' || item.operation === 'UPDATE') {
                const existingIndex = tableData.findIndex(r => r.id === item.record_id);
                if (existingIndex >= 0) {
                    tableData[existingIndex] = { ...tableData[existingIndex], ...item.payload };
                } else {
                    tableData.push(item.payload);
                }
            } else if (item.operation === 'DELETE') {
                tableData = tableData.filter(r => r.id !== item.record_id);
            } else if (item.operation === 'DELETE_ALL_FOR_TABLE') {
                // Special case for clearing order_items
                // Assuming payload has filtering criteria. 
                // Creating a simplified robust logic for JSON is hard.
                // For 'order_items', we can filter out by table_id if payload has it.
                if (item.payload && item.payload.tableId) {
                    tableData = tableData.filter(r => r.table_id !== item.payload.tableId);
                }
            }

            fs.writeFileSync(tableFile, JSON.stringify(tableData, null, 2));
        });

        res.json({ success: true });

    } catch (error) {
        console.error("Sync Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`☁️ Cloud Backend running on http://localhost:${PORT}`);
});
