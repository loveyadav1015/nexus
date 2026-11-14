const express = require('express');
const router = express.Router();
const { getChannels, createChannel, getChannelMessages, markChannelRead } = require('../controllers/channels');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getChannels);
router.post('/', requireAuth, createChannel);
router.get('/:id/messages', requireAuth, getChannelMessages);
router.post('/:id/read', requireAuth, markChannelRead);

module.exports = router;
