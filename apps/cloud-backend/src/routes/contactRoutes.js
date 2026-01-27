const express = require('express');
const router = express.Router();
const { sendToTelegram } = require('../controllers/contactController');

router.post('/', sendToTelegram);

module.exports = router;
