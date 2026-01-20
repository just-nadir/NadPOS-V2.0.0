require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const syncRoutes = require('./routes/syncRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Super Admin
const superAdminRoutes = require('./routes/superAdminRoutes'); // New Dedicated Super Admin Routes

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Sync ma'lumotlari katta bo'lishi mumkin

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/license', require('./routes/licenseRoutes')); // Dedicated license routes
app.use('/api/sync', syncRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);

// --- SERVE ADMIN PANEL ---
// --- SERVE ADMIN PANEL ---
const publicPath = path.join(__dirname, '../public'); // Parent folder 'public'
app.use('/admin', express.static(publicPath));

// Handle exact /admin and /admin/*
app.get(['/admin', '/admin/*'], (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(publicPath, 'index.html'));
    }
});

// Redirect root to admin (Optional, but good UX)
app.get('/', (req, res) => {
    res.redirect('/admin');
});

// Debugging Handlers
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection:', reason);
});

app.listen(PORT, () => {
    console.log(`☁️ Cloud Backend (PostgreSQL) running on http://localhost:${PORT}`);
});
