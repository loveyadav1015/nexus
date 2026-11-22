-- Migration 003: Assistant Logs Table
-- Logs assistant tool calls for auditing and observability. Raw audio is never logged.

CREATE TABLE IF NOT EXISTS assistant_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    args JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assistant_logs_user_id ON assistant_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_created_at ON assistant_logs(created_at);
