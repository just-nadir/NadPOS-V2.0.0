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
router.get('/stats', superAdminController.getStats);
// router.post('/generate-license', superAdminController.generateLicense); // Deprecated use extend instead

// License Management
const licenseController = require('../controllers/licenseController');
router.post('/license/extend', licenseController.extendLicense);
router.get('/license/:restaurantId', licenseController.getRestaurantLicense);

router.get('/payments', superAdminController.getAllPayments);

module.exports = router;
