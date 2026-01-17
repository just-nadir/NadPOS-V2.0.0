const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, superAdminMiddleware } = require('../middlewares/authMiddleware');

// Validatsiya (Admin Login - eski adminController.login ni bu yerda alohida qilish o'rniga authRoutes dagi login ishlatiladi)
// Lekin admin panel maxsus endpoint so'rashi mumkin (agar front o'zgarmagan bo'lsa).
// Eski admin paneli `/api/admin/login` ni ishlatgan. Buni to'g'irlash kerak.
// Hozircha yangi authRoutes login dan foydalanishni tavsiya qilaman, lekin compatibility uchun wrapper qo'shishim mumkin.

const authController = require('../controllers/authController');

// Compatibility route for Admin Login
router.post('/login', authController.login);

// Protected Routes (Super Admin Only)
router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get('/restaurants', adminController.getRestaurants);
router.post('/create-restaurant', adminController.createRestaurant);
router.put('/restaurants/:id/status', adminController.updateStatus);
router.get('/stats', adminController.getStats);

module.exports = router;
