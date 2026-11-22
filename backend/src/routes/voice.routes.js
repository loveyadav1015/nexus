const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const {
  handleVoiceCommand,
  handleVoiceConfirm,
  handleVoiceTranscribe
} = require('../controllers/voice.controller');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed.'));
    }
  }
});

// 20 requests per minute per user rate limit
const voiceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id ? `user_${req.user.id}` : req.ip;
  },
  message: { error: 'Voice command rate limit exceeded. Please wait a minute.' }
});

router.use(requireAuth);
router.use(voiceLimiter);

router.post('/command', handleVoiceCommand);
router.post('/confirm', handleVoiceConfirm);
router.post('/transcribe', upload.single('audio'), handleVoiceTranscribe);

module.exports = router;
