const pool = require('../config/db');

const getAllUsers = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, avatar_url, status, display_name, created_at FROM users ORDER BY username ASC'
    );
    res.status(200).json({ users: rows });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    const { rows } = await pool.query(
      'SELECT id, username, email, avatar_url, status, bio, display_name, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { display_name, bio, avatar_url } = req.body;

    const { rows } = await pool.query(
      `UPDATE users SET
        bio = COALESCE($1, bio),
        avatar_url = COALESCE($2, avatar_url),
        display_name = COALESCE($3, display_name)
      WHERE id = $4
      RETURNING id, username, email, avatar_url, status, bio, display_name`,
      [bio, avatar_url, display_name, userId]
    );

    res.status(200).json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { status } = req.body;

    if (!['online', 'away', 'offline'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { rows } = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
      [status, userId]
    );

    req.app.get('io').emit('user_status_change', {
      userId: req.user.id,
      status
    });

    res.status(200).json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, updateStatus };
