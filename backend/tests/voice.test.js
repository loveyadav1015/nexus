process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const pool = require('../src/config/db');
const { executeTool, pendingConfirmations } = require('../src/services/voiceTools');
const { executeConfirmedAction } = require('../src/services/assistant.service');

describe('Voice Tools & Assistant Services', () => {
  const originalQuery = pool.query;

  beforeEach(() => {
    pendingConfirmations.clear();
  });

  test('search_messages handles empty or whitespace query gracefully', async () => {
    const res = await executeTool('search_messages', { query: '   ' }, { id: 1 });
    assert.deepStrictEqual(res.results, []);
    assert.strictEqual(res.message, 'Empty search query.');
  });

  test('summarize_channel checks channel membership and rejects non-members', async () => {
    pool.query = async (sql, params) => {
      if (sql.includes('FROM channels WHERE LOWER(name)')) {
        return { rows: [{ id: 42, name: 'engineering' }] };
      }
      if (sql.includes('FROM channel_members WHERE channel_id')) {
        // Return empty = user is not a member
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      const res = await executeTool('summarize_channel', { channel: 'engineering' }, { id: 99 });
      assert.ok(res.error);
      assert.match(res.error, /not a member/i);
    } finally {
      pool.query = originalQuery;
    }
  });

  test('open_channel handles ambiguous channel names', async () => {
    pool.query = async (sql, params) => {
      if (sql.includes('FROM channels c')) {
        return {
          rows: [
            { id: 1, name: 'general-dev' },
            { id: 2, name: 'general-chat' }
          ]
        };
      }
      return { rows: [] };
    };

    try {
      const res = await executeTool('open_channel', { name: 'general' }, { id: 1 });
      assert.strictEqual(res.ambiguous, true);
      assert.strictEqual(res.matches.length, 2);
      assert.match(res.message, /multiple channels match/i);
    } finally {
      pool.query = originalQuery;
    }
  });

  test('open_channel returns navigation uiAction on exact match', async () => {
    pool.query = async (sql) => {
      return { rows: [{ id: 5, name: 'announcements' }] };
    };

    try {
      const res = await executeTool('open_channel', { name: 'announcements' }, { id: 1 });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.uiAction?.type, 'navigate');
      assert.strictEqual(res.uiAction?.channelId, 5);
      assert.strictEqual(res.uiAction?.channelName, 'announcements');
    } finally {
      pool.query = originalQuery;
    }
  });

  test('send_message validates empty message content', async () => {
    const res = await executeTool('send_message', { target: '#general', text: '' }, { id: 1 });
    assert.strictEqual(res.error, 'Message content cannot be empty.');
  });

  test('send_message creates pending confirmation with 2-minute TTL and does not write immediately', async () => {
    pool.query = async (sql) => {
      if (sql.includes('FROM channels WHERE LOWER(name)')) {
        return { rows: [{ id: 1, name: 'general' }] };
      }
      if (sql.includes('FROM channel_members WHERE channel_id')) {
        return { rows: [{ channel_id: 1, user_id: 10 }] };
      }
      return { rows: [] };
    };

    try {
      const res = await executeTool('send_message', { target: '#general', text: 'Running late!' }, { id: 10 });
      assert.strictEqual(res.needsConfirmation, true);
      assert.ok(res.confirmationId);
      assert.match(res.preview, /Send message to #general/);

      const pending = pendingConfirmations.get(res.confirmationId);
      assert.ok(pending);
      assert.strictEqual(pending.userId, 10);
      assert.strictEqual(pending.content, 'Running late!');
      assert.ok(pending.expiresAt > Date.now());
    } finally {
      pool.query = originalQuery;
    }
  });

  test('executeConfirmedAction rejects confirmation after TTL expiration', async () => {
    const expiredId = 'expired-123';
    pendingConfirmations.set(expiredId, {
      confirmationId: expiredId,
      userId: 10,
      expiresAt: Date.now() - 1000 // expired
    });

    const result = await executeConfirmedAction({
      confirmationId: expiredId,
      approve: true,
      user: { id: 10 },
      io: null
    });

    assert.strictEqual(result.status, 410);
    assert.match(result.response.error, /expired/i);
    assert.strictEqual(pendingConfirmations.has(expiredId), false);
  });

  test('executeConfirmedAction rejects unauthorized user confirmation', async () => {
    const actionId = 'auth-test-456';
    pendingConfirmations.set(actionId, {
      confirmationId: actionId,
      userId: 10,
      expiresAt: Date.now() + 60000
    });

    const result = await executeConfirmedAction({
      confirmationId: actionId,
      approve: true,
      user: { id: 99 }, // different user
      io: null
    });

    assert.strictEqual(result.status, 403);
    assert.match(result.response.error, /unauthorized/i);
  });

  test('executeConfirmedAction cleanly handles cancellation when approve is false', async () => {
    const cancelId = 'cancel-test-789';
    pendingConfirmations.set(cancelId, {
      confirmationId: cancelId,
      userId: 10,
      type: 'channel',
      expiresAt: Date.now() + 60000
    });

    const result = await executeConfirmedAction({
      confirmationId: cancelId,
      approve: false,
      user: { id: 10 },
      io: null
    });

    assert.strictEqual(result.status, 200);
    assert.strictEqual(result.response.success, true);
    assert.match(result.response.message, /cancelled/i);
    assert.strictEqual(pendingConfirmations.has(cancelId), false);
  });
});
