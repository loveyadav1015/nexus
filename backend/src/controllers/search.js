const pool = require('../config/db');

const searchMessages = async (req, res, next) => {
  try {
    const { q, channel_id } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: "Query required" });
    }

    const searchQuery = '%' + q + '%';

    if (channel_id) {
      const channelId = parseInt(channel_id, 10);
      const { rows } = await pool.query(`
        SELECT m.id, m.content, m.channel_id, m.created_at, m.is_deleted,
          u.username, u.avatar_url,
          c.name AS channel_name
        FROM messages m
        LEFT JOIN users u ON m.user_id = u.id
        LEFT JOIN channels c ON m.channel_id = c.id
        WHERE m.channel_id = $1
          AND m.is_deleted = FALSE
          AND m.content ILIKE $2
        ORDER BY m.created_at DESC LIMIT 20
      `, [channelId, searchQuery]);

      return res.status(200).json({ results: rows });
    } else {
      const { rows } = await pool.query(`
        SELECT m.id, m.content, m.channel_id, m.created_at, m.is_deleted,
          u.username, u.avatar_url,
          c.name AS channel_name
        FROM messages m
        LEFT JOIN users u ON m.user_id = u.id
        LEFT JOIN channels c ON m.channel_id = c.id
        WHERE m.is_deleted = FALSE
          AND m.content ILIKE $1
        ORDER BY m.created_at DESC LIMIT 20
      `, [searchQuery]);

      return res.status(200).json({ results: rows });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { searchMessages };
