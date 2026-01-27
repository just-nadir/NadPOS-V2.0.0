const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { authMiddleware, superAdminMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get('/restaurants', superAdminController.getAllRestaurants);
router.post('/restaurants', superAdminController.createRestaurant); // Create
router.put('/restaurants/:id/status', superAdminController.toggleBlockRestaurant);
router.delete('/restaurants/:id', superAdminController.deleteRestaurant); // Delete
router.put('/restaurants/:id/plan', superAdminController.updateRestaurantPlan); // Change Plan
router.get('/stats', superAdminController.getStats);
// router.post('/generate-license', superAdminController.generateLicense); // Deprecated use extend instead

// License Management
const licenseController = require('../controllers/licenseController');
router.post('/license/extend', licenseController.extendLicense);
router.get('/license/:restaurantId', licenseController.getRestaurantLicense);

router.get('/payments', superAdminController.getAllPayments);

// User Management
router.get('/users', superAdminController.getAllUsers);
router.put('/users/:id/status', superAdminController.toggleBlockUser);
router.post('/users/:id/reset-password', superAdminController.resetPassword);

// --- SETTINGS ---
router.put('/profile', superAdminController.updateProfile); // Self update
router.get('/plans', superAdminController.getPlans);
router.post('/plans/:id', superAdminController.updatePlan); // ID or 'new'
router.get('/config', superAdminController.getConfig);
router.put('/config', superAdminController.updateConfig);

module.exports = router;
