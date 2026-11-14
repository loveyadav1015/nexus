const express = require('express');
const router = express.Router();
const { getOrCreateConversation, getDMMessages, sendDMMessage } = require('../controllers/dms');
const { requireAuth } = require('../middleware/auth');

router.get('/conversation/:userId', requireAuth, getOrCreateConversation);
router.get('/:id/messages', requireAuth, getDMMessages);
router.post('/', requireAuth, sendDMMessage);

module.exports = router;
