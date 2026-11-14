const pool = require('../config/db');

const getChannels = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.name, c.description, c.created_by, c.created_at,
        (SELECT COUNT(*) FROM messages m
         WHERE m.channel_id = c.id AND m.is_deleted = FALSE
         AND m.created_at > COALESCE(
           (SELECT cr.last_read_at FROM channel_reads cr
            WHERE cr.channel_id = c.id AND cr.user_id = $1), '1970-01-01'
         )
        ) AS unread_count
      FROM channels c
      ORDER BY c.name ASC
    `, [req.user.id]);

    res.status(200).json({ channels: rows });
  } catch (error) {
    next(error);
  }
};

const createChannel = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: "Channel name is required" });
    }

    const channelName = name.trim();

    const channelResult = await pool.query(
      'INSERT INTO channels (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [channelName, description, req.user.id]
    );

    const channel = channelResult.rows[0];

    await pool.query(
      'INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2)',
      [channel.id, req.user.id]
    );

    await pool.query(
      'INSERT INTO channel_reads (channel_id, user_id) VALUES ($1, $2)',
      [channel.id, req.user.id]
    );

    res.status(201).json({ channel });
  } catch (error) {
    next(error);
  }
};

const getChannelMessages = async (req, res, next) => {
  try {
    const channelId = parseInt(req.params.id, 10);
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;

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
      WHERE m.channel_id = $1 AND m.parent_id IS NULL
      ORDER BY m.created_at ASC
      LIMIT $2 OFFSET $3
    `, [channelId, limit, offset]);

    res.status(200).json({ messages: rows });
  } catch (error) {
    next(error);
  }
};

const markChannelRead = async (req, res, next) => {
  try {
    const channelId = parseInt(req.params.id, 10);

    await pool.query(`
      INSERT INTO channel_reads (channel_id, user_id, last_read_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (channel_id, user_id)
      DO UPDATE SET last_read_at = NOW()
    `, [channelId, req.user.id]);

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { getChannels, createChannel, getChannelMessages, markChannelRead };
