const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { authMiddleware, superAdminMiddleware } = require('../middlewares/authMiddleware');

// router.use(authMiddleware);
// router.use(superAdminMiddleware);

router.get('/restaurants', superAdminController.getAllRestaurants);
router.post('/restaurants', superAdminController.createRestaurant); // Create
router.put('/restaurants/:id/status', superAdminController.toggleBlockRestaurant);
router.get('/stats', superAdminController.getStats);

module.exports = router;
