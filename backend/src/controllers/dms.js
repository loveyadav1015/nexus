const pool = require('../config/db');

const getOrCreateConversation = async (req, res, next) => {
  try {
    const otherUserId = parseInt(req.params.userId, 10);
    const user1_id = Math.min(req.user.id, otherUserId);
    const user2_id = Math.max(req.user.id, otherUserId);

    const { rows: existing } = await pool.query(
      'SELECT * FROM dm_conversations WHERE user1_id = $1 AND user2_id = $2',
      [user1_id, user2_id]
    );

    if (existing.length > 0) {
      return res.status(200).json({ conversation: existing[0] });
    }

    const { rows: inserted } = await pool.query(
      'INSERT INTO dm_conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING *',
      [user1_id, user2_id]
    );

    res.status(200).json({ conversation: inserted[0] });
  } catch (error) {
    next(error);
  }
};

const getDMMessages = async (req, res, next) => {
  try {
    const conversationId = parseInt(req.params.id, 10);

    const { rows } = await pool.query(`
      SELECT dm.id, dm.content, dm.is_deleted, dm.created_at,
        u.id AS sender_id, u.username, u.avatar_url
      FROM dm_messages dm
      LEFT JOIN users u ON dm.sender_id = u.id
      WHERE dm.dm_conversation_id = $1
      ORDER BY dm.created_at ASC
    `, [conversationId]);

    res.status(200).json({ messages: rows });
  } catch (error) {
    next(error);
  }
};

const sendDMMessage = async (req, res, next) => {
  try {
    const { conversation_id, content, receiver_id } = req.body;

    if (!conversation_id || !content || !receiver_id) {
      return res.status(400).json({ error: "conversation_id, content, and receiver_id are required" });
    }

    const { rows: inserted } = await pool.query(
      'INSERT INTO dm_messages (dm_conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [conversation_id, req.user.id, content]
    );

    const messageId = inserted[0].id;

    const { rows: fullMessageRows } = await pool.query(`
      SELECT dm.id, dm.content, dm.is_deleted, dm.created_at,
        u.id AS sender_id, u.username, u.avatar_url
      FROM dm_messages dm
      LEFT JOIN users u ON dm.sender_id = u.id
      WHERE dm.id = $1
    `, [messageId]);

    const fullMessage = fullMessageRows[0];

    req.app.get('io').to('user:' + receiver_id).emit('new_dm', {
      conversationId: conversation_id,
      message: fullMessage
    });

    if (receiver_id !== req.user.id) {
      req.app.get('io').to('user:' + req.user.id).emit('new_dm', {
        conversationId: conversation_id,
        message: fullMessage
      });
    }

    res.status(201).json({ message: fullMessage });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrCreateConversation, getDMMessages, sendDMMessage };
