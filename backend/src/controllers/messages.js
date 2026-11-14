const pool = require('../config/db');

const createMessage = async (req, res, next) => {
  try {
    const { channel_id, content, parent_id } = req.body;

    if (!channel_id || !content) {
      return res.status(400).json({ error: "channel_id and content are required" });
    }

    const { rows: inserted } = await pool.query(
      'INSERT INTO messages (channel_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [channel_id, req.user.id, content, parent_id || null]
    );

    const messageId = inserted[0].id;

    const { rows: messages } = await pool.query(`
      SELECT m.id, m.content, m.is_edited, m.is_deleted,
        m.parent_id, m.created_at, m.updated_at,
        m.channel_id,
        u.id AS user_id, u.username, u.display_name, u.avatar_url,
        (SELECT json_agg(json_build_object(
           'emoji', r.emoji,
           'user_id', r.user_id,
           'id', r.id
         )) FROM reactions r WHERE r.message_id = m.id
        ) AS reactions
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
    `, [messageId]);

    const fullMessage = messages[0];

    req.app.get('io').to('channel:' + channel_id).emit('new_message', fullMessage);

    res.status(201).json({ message: fullMessage });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.id, 10);

    const { rows } = await pool.query('SELECT channel_id, user_id FROM messages WHERE id = $1', [messageId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const message = rows[0];

    if (message.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await pool.query('UPDATE messages SET is_deleted = TRUE WHERE id = $1', [messageId]);

    req.app.get('io').to('channel:' + message.channel_id).emit('message_deleted', { messageId, channelId: message.channel_id });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

const editMessage = async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.id, 10);
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const { rows } = await pool.query('SELECT channel_id, user_id FROM messages WHERE id = $1', [messageId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const message = rows[0];

    if (message.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { rows: updatedRows } = await pool.query(
      'UPDATE messages SET content = $1, is_edited = TRUE WHERE id = $2 RETURNING *',
      [content, messageId]
    );

    req.app.get('io').to('channel:' + message.channel_id).emit('message_edited', updatedRows[0]);

    res.status(200).json({ message: updatedRows[0] });
  } catch (error) {
    next(error);
  }
};

const getReplies = async (req, res, next) => {
  try {
    const parentId = parseInt(req.params.id, 10);

    const { rows } = await pool.query(`
      SELECT m.id, m.content, m.is_edited, m.is_deleted,
        m.parent_id, m.created_at, m.updated_at,
        m.channel_id,
        u.id AS user_id, u.username, u.display_name, u.avatar_url,
        (SELECT json_agg(json_build_object(
           'emoji', r.emoji,
           'user_id', r.user_id,
           'id', r.id
         )) FROM reactions r WHERE r.message_id = m.id
        ) AS reactions
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.parent_id = $1
      ORDER BY m.created_at ASC
    `, [parentId]);

    res.status(200).json({ replies: rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMessage, deleteMessage, editMessage, getReplies };
