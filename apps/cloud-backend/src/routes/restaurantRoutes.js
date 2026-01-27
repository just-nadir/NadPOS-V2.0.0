const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Middleware to ensure user has a restaurant
const restaurantMiddleware = (req, res, next) => {
    if (!req.user.restaurantId) {
        return res.status(403).json({ error: 'Restoran taalluqli emas' });
    }
    next();
};

router.use(authMiddleware);
router.use(restaurantMiddleware);

router.get('/stats', restaurantController.getDashboardStats);

module.exports = router;
