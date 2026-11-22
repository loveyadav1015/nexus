const pool = require('../config/db');

// In-memory pending confirmation store with 2-minute TTL
// Keyed by confirmationId
const pendingConfirmations = new Map();

const CLEANUP_INTERVAL = 30 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [id, item] of pendingConfirmations.entries()) {
    if (now > item.expiresAt) {
      pendingConfirmations.delete(id);
    }
  }
}, CLEANUP_INTERVAL).unref();

/**
 * Log tool calls to the database. Never logs raw audio.
 */
const logToolCall = async (userId, toolName, args, status = 'success') => {
  try {
    await pool.query(
      'INSERT INTO assistant_logs (user_id, tool_name, args, status) VALUES ($1, $2, $3, $4)',
      [userId, toolName, JSON.stringify(args || {}), status]
    );
  } catch (err) {
    console.error('Failed to write assistant log:', err.message);
  }
};

/**
 * Tool Schemas for Anthropic Tool Use
 */
const toolSchemas = [
  {
    name: 'search_messages',
    description: 'Searches for messages in channels or DMs that the user has access to, using text matching.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query or keyword to look for.'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'summarize_channel',
    description: 'Fetches recent messages from a channel that the user belongs to so they can be summarized.',
    input_schema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The name of the channel (with or without #).'
        },
        since: {
          type: 'string',
          description: 'Optional ISO timestamp or relative time (e.g. today) to filter messages.'
        }
      },
      required: ['channel']
    }
  },
  {
    name: 'get_unread_summary',
    description: 'Retrieves a list of channels with unread message counts for the authenticated user.',
    input_schema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'open_channel',
    description: 'Navigates the user interface to a specified channel by name.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the channel to open.'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'open_dm',
    description: 'Navigates the user interface to a 1-on-1 direct message conversation with a user.',
    input_schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'The username of the person to chat with (with or without @).'
        }
      },
      required: ['username']
    }
  },
  {
    name: 'send_message',
    description: 'Stages a new message to be sent to a channel or direct message user. This is a WRITE tool that requires user confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'The target channel (e.g. "#general" or "general") or user (e.g. "@alice" or "alice").'
        },
        text: {
          type: 'string',
          description: 'The content of the message to send.'
        }
      },
      required: ['target', 'text']
    }
  }
];

/**
 * 1. search_messages
 */
const handleSearchMessages = async ({ query }, user) => {
  if (!query || !query.trim()) {
    return { results: [], message: 'Empty search query.' };
  }
  const searchQuery = '%' + query.trim() + '%';

  const { rows } = await pool.query(`
    SELECT m.id, m.content, m.created_at, m.channel_id,
           c.name AS channel_name, u.username, u.display_name
    FROM messages m
    JOIN channels c ON m.channel_id = c.id
    JOIN channel_members cm ON cm.channel_id = c.id AND cm.user_id = $1
    JOIN users u ON m.user_id = u.id
    WHERE m.is_deleted = FALSE AND m.content ILIKE $2
    ORDER BY m.created_at DESC
    LIMIT 10
  `, [user.id, searchQuery]);

  return {
    count: rows.length,
    results: rows.map(r => ({
      channel: r.channel_name,
      sender: r.display_name || r.username,
      content: r.content,
      created_at: r.created_at
    }))
  };
};

/**
 * 2. summarize_channel
 */
const handleSummarizeChannel = async ({ channel, since }, user) => {
  const cleanName = channel.replace(/^#/, '').trim().toLowerCase();

  const { rows: channelRows } = await pool.query(
    'SELECT id, name, description FROM channels WHERE LOWER(name) = $1',
    [cleanName]
  );

  if (channelRows.length === 0) {
    return { error: `Channel #${cleanName} was not found.` };
  }

  const targetChannel = channelRows[0];

  // Authorization check: verify user is in channel_members
  const { rows: memberRows } = await pool.query(
    'SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2',
    [targetChannel.id, user.id]
  );

  if (memberRows.length === 0) {
    return { error: `You are not a member of #${targetChannel.name} and cannot view its messages.` };
  }

  let querySql = `
    SELECT m.content, m.created_at, u.username, u.display_name
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.channel_id = $1 AND m.is_deleted = FALSE
  `;
  const params = [targetChannel.id];

  if (since) {
    params.push(since);
    querySql += ' AND m.created_at >= $2';
  }

  querySql += ' ORDER BY m.created_at DESC LIMIT 30';

  const { rows: messages } = await pool.query(querySql, params);

  return {
    channel: targetChannel.name,
    messageCount: messages.length,
    messages: messages.reverse().map(m => ({
      sender: m.display_name || m.username,
      content: m.content,
      time: m.created_at
    }))
  };
};

/**
 * 3. get_unread_summary
 */
const handleGetUnreadSummary = async (args, user) => {
  const { rows } = await pool.query(`
    SELECT c.id, c.name,
      (SELECT COUNT(*) FROM messages m
       WHERE m.channel_id = c.id AND m.is_deleted = FALSE
       AND m.created_at > COALESCE(
         (SELECT cr.last_read_at FROM channel_reads cr
          WHERE cr.channel_id = c.id AND cr.user_id = $1), '1970-01-01'
       )
      ) AS unread_count
    FROM channels c
    JOIN channel_members cm ON cm.channel_id = c.id AND cm.user_id = $1
    ORDER BY unread_count DESC, c.name ASC
  `, [user.id]);

  const unreadChannels = rows
    .map(r => ({
      id: r.id,
      name: r.name,
      unreadCount: parseInt(r.unread_count, 10) || 0
    }))
    .filter(r => r.unreadCount > 0);

  return {
    totalUnreadChannels: unreadChannels.length,
    channels: unreadChannels
  };
};

/**
 * 4. open_channel & open_dm (Fuzzy matching and navigation uiActions)
 */
const handleOpenChannel = async ({ name }, user) => {
  const cleanName = name.replace(/^#/, '').trim().toLowerCase();

  // Search channels matching name
  const { rows } = await pool.query(`
    SELECT c.id, c.name,
           EXISTS(SELECT 1 FROM channel_members cm WHERE cm.channel_id = c.id AND cm.user_id = $2) as is_member
    FROM channels c
    WHERE LOWER(c.name) ILIKE '%' || $1 || '%'
    LIMIT 5
  `, [cleanName, user.id]);

  if (rows.length === 0) {
    return { error: `Could not find any channel matching "${name}".` };
  }

  // Exact match takes priority
  const exact = rows.find(r => r.name.toLowerCase() === cleanName);
  if (exact) {
    return {
      success: true,
      channel: exact.name,
      uiAction: {
        type: 'navigate',
        target: 'channel',
        channelId: exact.id,
        channelName: exact.name
      }
    };
  }

  if (rows.length === 1) {
    return {
      success: true,
      channel: rows[0].name,
      uiAction: {
        type: 'navigate',
        target: 'channel',
        channelId: rows[0].id,
        channelName: rows[0].name
      }
    };
  }

  // Ambiguous: ask user for clarification
  return {
    ambiguous: true,
    matches: rows.map(r => '#' + r.name),
    message: `Multiple channels match "${name}": ${rows.map(r => '#' + r.name).join(', ')}. Which one would you like to open?`
  };
};

const handleOpenDM = async ({ username }, user) => {
  const cleanUsername = username.replace(/^@/, '').trim().toLowerCase();

  const { rows } = await pool.query(`
    SELECT id, username, display_name
    FROM users
    WHERE LOWER(username) ILIKE '%' || $1 || '%'
       OR LOWER(COALESCE(display_name, '')) ILIKE '%' || $1 || '%'
    LIMIT 5
  `, [cleanUsername]);

  if (rows.length === 0) {
    return { error: `User "${username}" was not found.` };
  }

  // Exact match
  const exact = rows.find(r => r.username.toLowerCase() === cleanUsername);
  const targetUser = exact || (rows.length === 1 ? rows[0] : null);

  if (!targetUser) {
    return {
      ambiguous: true,
      matches: rows.map(r => '@' + r.username),
      message: `Multiple users match "${username}": ${rows.map(r => '@' + r.username).join(', ')}. Who would you like to message?`
    };
  }

  // Get or create conversation pair
  const user1_id = Math.min(user.id, targetUser.id);
  const user2_id = Math.max(user.id, targetUser.id);

  let convId;
  const { rows: convRows } = await pool.query(
    'SELECT id FROM dm_conversations WHERE user1_id = $1 AND user2_id = $2',
    [user1_id, user2_id]
  );

  if (convRows.length > 0) {
    convId = convRows[0].id;
  } else {
    const { rows: newConv } = await pool.query(
      'INSERT INTO dm_conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING id',
      [user1_id, user2_id]
    );
    convId = newConv[0].id;
  }

  return {
    success: true,
    user: targetUser.username,
    uiAction: {
      type: 'navigate',
      target: 'dm',
      conversationId: convId,
      otherUser: {
        id: targetUser.id,
        username: targetUser.username,
        display_name: targetUser.display_name
      }
    }
  };
};

/**
 * 5. send_message (WRITE tool - returns pending confirmation)
 */
const handleSendMessage = async ({ target, text }, user) => {
  if (!text || !text.trim()) {
    return { error: 'Message content cannot be empty.' };
  }

  const cleanTarget = target.trim();
  const confirmationId = require('crypto').randomUUID();
  const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes TTL

  if (cleanTarget.startsWith('@') || (!cleanTarget.startsWith('#') && !cleanTarget.includes(' '))) {
    // Attempt resolving as DM recipient
    const recipientName = cleanTarget.replace(/^@/, '').toLowerCase();
    const { rows: users } = await pool.query(
      'SELECT id, username, display_name FROM users WHERE LOWER(username) = $1',
      [recipientName]
    );

    if (users.length > 0) {
      const recipient = users[0];
      const user1_id = Math.min(user.id, recipient.id);
      const user2_id = Math.max(user.id, recipient.id);

      let convId;
      const { rows: convs } = await pool.query(
        'SELECT id FROM dm_conversations WHERE user1_id = $1 AND user2_id = $2',
        [user1_id, user2_id]
      );
      if (convs.length > 0) {
        convId = convs[0].id;
      } else {
        const { rows: newConv } = await pool.query(
          'INSERT INTO dm_conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING id',
          [user1_id, user2_id]
        );
        convId = newConv[0].id;
      }

      const pendingAction = {
        confirmationId,
        userId: user.id,
        type: 'dm',
        conversationId: convId,
        receiverId: recipient.id,
        recipientName: recipient.display_name || recipient.username,
        content: text.trim(),
        expiresAt
      };
      pendingConfirmations.set(confirmationId, pendingAction);

      const preview = `Send direct message to @${recipient.username}: "${text.trim()}"`;
      return {
        needsConfirmation: true,
        confirmationId,
        preview,
        message: `I have prepared your message. ${preview}. Please confirm to send.`
      };
    }
  }

  // Resolve as channel
  const channelName = cleanTarget.replace(/^#/, '').toLowerCase();
  const { rows: channels } = await pool.query(
    'SELECT id, name FROM channels WHERE LOWER(name) = $1',
    [channelName]
  );

  if (channels.length === 0) {
    return { error: `Target "${target}" could not be found as a channel or user.` };
  }

  const channel = channels[0];

  // Membership check
  const { rows: memberRows } = await pool.query(
    'SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2',
    [channel.id, user.id]
  );

  if (memberRows.length === 0) {
    return { error: `You are not a member of #${channel.name} and cannot send messages to it.` };
  }

  const pendingAction = {
    confirmationId,
    userId: user.id,
    type: 'channel',
    channelId: channel.id,
    channelName: channel.name,
    content: text.trim(),
    expiresAt
  };
  pendingConfirmations.set(confirmationId, pendingAction);

  const preview = `Send message to #${channel.name}: "${text.trim()}"`;
  return {
    needsConfirmation: true,
    confirmationId,
    preview,
    message: `I have prepared your message. ${preview}. Please confirm to send.`
  };
};

/**
 * Tool dispatcher
 */
const executeTool = async (name, args, user) => {
  let result;
  let status = 'success';

  try {
    switch (name) {
      case 'search_messages':
        result = await handleSearchMessages(args, user);
        break;
      case 'summarize_channel':
        result = await handleSummarizeChannel(args, user);
        break;
      case 'get_unread_summary':
        result = await handleGetUnreadSummary(args, user);
        break;
      case 'open_channel':
        result = await handleOpenChannel(args, user);
        break;
      case 'open_dm':
        result = await handleOpenDM(args, user);
        break;
      case 'send_message':
        result = await handleSendMessage(args, user);
        break;
      default:
        result = { error: `Unknown tool: ${name}` };
        status = 'error';
    }

    if (result && result.error) {
      status = 'error';
    }
  } catch (err) {
    console.error(`Tool ${name} failed:`, err);
    result = { error: err.message || 'Tool execution failed' };
    status = 'error';
  }

  await logToolCall(user.id, name, args, status);
  return result;
};

module.exports = {
  toolSchemas,
  executeTool,
  pendingConfirmations,
  logToolCall
};
