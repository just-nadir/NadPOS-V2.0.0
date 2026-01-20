const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/licenseController');

// Public route for desktop to verify status
router.post('/verify', licenseController.verifyLicense);

module.exports = router;
