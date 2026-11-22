const { processVoiceCommand, executeConfirmedAction } = require('../services/assistant.service');

const handleVoiceCommand = async (req, res, next) => {
  try {
    const { text, context, history } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text command is required.' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'Text command cannot exceed 1000 characters.' });
    }

    const result = await processVoiceCommand({
      text: text.trim(),
      context: context || {},
      history: history || [],
      user: req.user
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const handleVoiceConfirm = async (req, res, next) => {
  try {
    const { confirmationId, approve } = req.body;

    if (!confirmationId) {
      return res.status(400).json({ error: 'confirmationId is required.' });
    }

    const io = req.app.get('io');
    const { status, response } = await executeConfirmedAction({
      confirmationId,
      approve: Boolean(approve),
      user: req.user,
      io
    });

    return res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

const handleVoiceTranscribe = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    const { STT_PROVIDER, STT_API_KEY } = require('../config/env');

    if (!STT_PROVIDER || !STT_API_KEY) {
      return res.status(503).json({
        error: 'Cloud STT fallback is not enabled (missing STT_PROVIDER or STT_API_KEY).'
      });
    }

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname || 'audio.webm');
    formData.append('model', 'whisper-1');

    let endpoint = 'https://api.openai.com/v1/audio/transcriptions';
    if (STT_PROVIDER.toLowerCase() === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/audio/transcriptions';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STT_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: 'STT provider transcription failed.', details: errText });
    }

    const data = await response.json();
    return res.status(200).json({ text: data.text || '' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleVoiceCommand,
  handleVoiceConfirm,
  handleVoiceTranscribe
};
