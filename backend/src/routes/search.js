const express = require('express');
const router = express.Router();
const { searchMessages } = require('../controllers/search');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, searchMessages);

module.exports = router;
