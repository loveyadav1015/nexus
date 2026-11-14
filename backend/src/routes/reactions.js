const express = require('express');
const router = express.Router();
const { addReaction, removeReaction } = require('../controllers/reactions');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, addReaction);
router.delete('/', requireAuth, removeReaction);

module.exports = router;
