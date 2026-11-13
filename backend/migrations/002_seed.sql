-- 3 users (password_hash is bcryptjs hash of 'password123')
INSERT INTO users (username, email, password_hash, status) VALUES
  ('alice', 'alice@example.com', '$2b$10$placeholder_hash_alice', 'online'),
  ('bob', 'bob@example.com', '$2b$10$placeholder_hash_bob', 'online'),
  ('charlie', 'charlie@example.com', '$2b$10$placeholder_hash_charlie', 'offline');

-- 4 default channels (created_by alice = id 1)
INSERT INTO channels (name, description, created_by) VALUES
  ('general', 'General team discussion', 1),
  ('engineering', 'Engineering topics', 1),
  ('random', 'Off-topic and fun', 1),
  ('design', 'Design discussions', 1);

-- Add all 3 users to all 4 channels
INSERT INTO channel_members (channel_id, user_id) VALUES
  (1,1),(1,2),(1,3),
  (2,1),(2,2),(2,3),
  (3,1),(3,2),(3,3),
  (4,1),(4,2),(4,3);

-- 2 messages per channel from different users
INSERT INTO messages (channel_id, user_id, content) VALUES
  (1, 1, 'Welcome to #general everyone!'),
  (1, 2, 'Hey team, glad to be here!'),
  (2, 2, 'Just pushed the new auth middleware.'),
  (2, 3, 'Looks good, will review shortly.'),
  (3, 3, 'Anyone else excited for the weekend?'),
  (3, 1, 'Always! What are your plans?'),
  (4, 1, 'Sharing the new color palette soon.'),
  (4, 2, 'Can not wait to see it!');

-- Initialize channel_reads for all users in all channels
INSERT INTO channel_reads (channel_id, user_id) VALUES
  (1,1),(1,2),(1,3),
  (2,1),(2,2),(2,3),
  (3,1),(3,2),(3,3),
  (4,1),(4,2),(4,3);
