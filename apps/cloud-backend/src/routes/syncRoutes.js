const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Protect all sync routes
router.use(authMiddleware);

router.post('/push', syncController.push);
router.get('/pull', syncController.pull);

module.exports = router;
