const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, superAdminMiddleware } = require('../middlewares/authMiddleware');

// Validatsiya (Admin Login - eski adminController.login ni bu yerda alohida qilish o'rniga authRoutes dagi login ishlatiladi)
// Lekin admin panel maxsus endpoint so'rashi mumkin (agar front o'zgarmagan bo'lsa).
// Eski admin paneli `/api/admin/login` ni ishlatgan. Buni to'g'irlash kerak.
// Hozircha yangi authRoutes login dan foydalanishni tavsiya qilaman, lekin compatibility uchun wrapper qo'shishim mumkin.

const authController = require('../controllers/authController');

// Public
router.post('/login', adminController.login);

// Protected
router.get('/stats', authMiddleware.verifySuperAdmin, adminController.getStats);
router.get('/restaurants', authMiddleware.verifySuperAdmin, adminController.getRestaurants);
router.post('/create-restaurant', authMiddleware.verifySuperAdmin, adminController.createRestaurant);

// New Routes
router.put('/restaurants/:id', authMiddleware.verifySuperAdmin, adminController.updateRestaurant);
router.patch('/restaurants/:id/status', authMiddleware.verifySuperAdmin, adminController.updateRestaurantStatus);
router.post('/restaurants/:id/reset-password', authMiddleware.verifySuperAdmin, adminController.resetRestaurantPassword);
router.post('/change-password', authMiddleware.verifySuperAdmin, adminController.changeAdminPassword);
router.get('/logs', authMiddleware.verifySuperAdmin, adminController.getLogs);
router.get('/payments', authMiddleware.verifySuperAdmin, adminController.getPayments);

module.exports = router;
