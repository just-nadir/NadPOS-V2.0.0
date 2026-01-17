const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        const { email, password, hwid } = req.body;
        const result = await authService.login(email, password, hwid);
        res.json(result);
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(401).json({ error: error.message });
    }
};

const verifyLicense = async (req, res) => {
    try {
        const { token, hwid } = req.body;
        // Verify JWT locally (fast check)
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.hwid && decoded.hwid !== hwid) {
            return res.status(403).json({ valid: false, reason: 'HWID_MISMATCH' });
        }

        // Optional: Check DB if user/license is explicitly revoked (heavier check)
        // const user = await prisma.user.findUnique(...) 

        res.json({ valid: true, plan: decoded.plan });
    } catch (e) {
        res.status(401).json({ valid: false, reason: 'INVALID_TOKEN' });
    }
};

module.exports = {
    login,
    verifyLicense
};
