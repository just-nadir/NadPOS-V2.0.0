const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token topilmadi' });

    // Read Public Key
    let publicKey;
    try {
        // Try to load /app/public.pem (Docker) or local relative path
        const keyPath = process.env.PUBLIC_KEY_PATH || path.join(__dirname, '../../public.pem');
        publicKey = fs.readFileSync(keyPath, 'utf8');
    } catch (e) {
        console.error('CRITICAL: Public Key not found in middleware! Fallback to secret (will fail for RS256).', e.message);
        publicKey = process.env.JWT_SECRET;
    }

    // Verify with RS256
    // Note: If token is HS256 (old), this might fail if we enforce RS256. 
    // But all new tokens are RS256.
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, user) => {
        if (err) {
            console.error('JWT Verify Error:', err.message);
            return res.status(401).json({ error: 'Token yaroqsiz' });
        }
        req.user = user;
        next();
    });
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }
    next();
};

const superAdminMiddleware = (req, res, next) => {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Ruxsat yo\'q (Super Admin required)' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware, superAdminMiddleware };
