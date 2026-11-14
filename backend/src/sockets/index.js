const jsonwebtoken = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET } = require('../config/env');

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jsonwebtoken.verify(token, JWT_SECRET);

      const { rows } = await pool.query(
        'SELECT id, username, avatar_url, status FROM users WHERE id = $1',
        [decoded.id]
      );

      if (rows.length === 0) {
        return next(new Error("User not found"));
      }

      socket.user = rows[0];
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on('connection', async (socket) => {
    socket.join('user:' + socket.user.id);

    await pool.query("UPDATE users SET status = 'online' WHERE id = $1", [socket.user.id]);

    socket.broadcast.emit('user_status_change', {
      userId: socket.user.id,
      status: 'online'
    });

    console.log(socket.user.username + ' connected');

    socket.on('join_channel', ({ channelId }) => {
      socket.join('channel:' + channelId);
      socket.to('channel:' + channelId).emit('user_joined_channel', {
        userId: socket.user.id,
        username: socket.user.username,
        channelId
      });
    });

    socket.on('leave_channel', ({ channelId }) => {
      socket.leave('channel:' + channelId);
    });

    socket.on('typing_start', ({ channelId }) => {
      socket.to('channel:' + channelId).emit('user_typing', {
        userId: socket.user.id,
        username: socket.user.username,
        channelId
      });
    });

    socket.on('typing_stop', ({ channelId }) => {
      socket.to('channel:' + channelId).emit('user_stop_typing', {
        userId: socket.user.id,
        channelId
      });
    });

    socket.on('mark_read', async ({ channelId }) => {
      try {
        await pool.query(`
          INSERT INTO channel_reads (channel_id, user_id, last_read_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (channel_id, user_id) DO UPDATE SET last_read_at = NOW()
        `, [channelId, socket.user.id]);
      } catch (err) {
        console.error("Error marking channel read via socket:", err);
      }
    });

    socket.on('disconnect', async () => {
      await pool.query("UPDATE users SET status = 'offline' WHERE id = $1", [socket.user.id]);
      
      socket.broadcast.emit('user_status_change', {
        userId: socket.user.id,
        status: 'offline'
      });
      
      console.log(socket.user.username + ' disconnected');
    });
  });
};

module.exports = initSocket;
