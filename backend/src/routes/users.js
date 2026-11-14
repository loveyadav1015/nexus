const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, updateStatus } = require('../controllers/users');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getAllUsers);
router.get('/:id', requireAuth, getUserById);
router.put('/:id', requireAuth, updateUser);
router.patch('/:id/status', requireAuth, updateStatus);

module.exports = router;
