require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const syncRoutes = require('./routes/syncRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Super Admin

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Sync ma'lumotlari katta bo'lishi mumkin

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/license', authRoutes); // Verify endpoint ham auth ichida
app.use('/api/sync', syncRoutes);
app.use('/api/admin', adminRoutes);

// --- SERVE ADMIN PANEL ---
const publicPath = path.join(__dirname, '../public'); // Parent folder 'public'
app.use(express.static(publicPath));

app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(publicPath, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`☁️ Cloud Backend (PostgreSQL) running on http://localhost:${PORT}`);
});
