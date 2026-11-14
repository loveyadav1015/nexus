const pool = require('../config/db');

const addReaction = async (req, res, next) => {
  try {
    const { message_id, emoji } = req.body;

    if (!message_id || !emoji) {
      return res.status(400).json({ error: "message_id and emoji are required" });
    }

    const { rows: messages } = await pool.query('SELECT channel_id FROM messages WHERE id = $1', [message_id]);
    
    if (messages.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const channelId = messages[0].channel_id;

    const { rows } = await pool.query(
      'INSERT INTO reactions (message_id, user_id, emoji) VALUES ($1, $2, $3) ON CONFLICT (message_id, user_id, emoji) DO NOTHING RETURNING *',
      [message_id, req.user.id, emoji]
    );

    if (rows.length > 0) {
      req.app.get('io').to('channel:' + channelId).emit('reaction_added', {
        messageId: message_id,
        userId: req.user.id,
        emoji,
        channelId
      });
      return res.status(201).json({ reaction: rows[0] });
    }

    res.status(200).json({ success: true, message: "Reaction already exists" });
  } catch (error) {
    next(error);
  }
};

const removeReaction = async (req, res, next) => {
  try {
    const { message_id, emoji } = req.body;

    if (!message_id || !emoji) {
      return res.status(400).json({ error: "message_id and emoji are required" });
    }

    await pool.query(
      'DELETE FROM reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3',
      [message_id, req.user.id, emoji]
    );

    const { rows: messages } = await pool.query('SELECT channel_id FROM messages WHERE id = $1', [message_id]);
    
    if (messages.length > 0) {
      const channelId = messages[0].channel_id;
      req.app.get('io').to('channel:' + channelId).emit('reaction_removed', {
        messageId: message_id,
        userId: req.user.id,
        emoji,
        channelId
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { addReaction, removeReaction };
