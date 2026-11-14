const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');

const { PORT, CLIENT_URL } = require('./config/env');
const pool = require('./config/db');
const initSocket = require('./sockets/index');
const errorHandler = require('./middleware/errorHandler');

const authRouter = require('./routes/auth');
const channelsRouter = require('./routes/channels');
const messagesRouter = require('./routes/messages');
const reactionsRouter = require('./routes/reactions');
const usersRouter = require('./routes/users');
const dmsRouter = require('./routes/dms');
const searchRouter = require('./routes/search');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/channels', channelsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/reactions', reactionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/dms', dmsRouter);
app.use('/api/search', searchRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);

// Init sockets
initSocket(io);

httpServer.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
