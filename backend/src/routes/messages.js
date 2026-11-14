const express = require('express');
const router = express.Router();
const { createMessage, editMessage, deleteMessage, getReplies } = require('../controllers/messages');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, createMessage);
router.put('/:id', requireAuth, editMessage);
router.delete('/:id', requireAuth, deleteMessage);
router.get('/:id/replies', requireAuth, getReplies);

module.exports = router;
