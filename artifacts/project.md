# 1. Project Overview
"Nexus" is a self-hosted, lightweight team messaging application designed for real-time collaboration. It provides users with organized channels for team discussions, direct messages for private conversations, emoji reactions for quick feedback, and threaded replies for deep-dives without cluttering the main chat. The application ensures persistent conversations, tracks unread messages per user, and features a robust search mechanism to find past discussions instantly, all while maintaining a secure and modern user experience.

**Core User Flow:**
```text
[Login / Register] --> [Verify JWT Auth] --> [Connect to WebSockets]
                              |
                              v
                      [Main Dashboard]
                              |
       +----------------------+----------------------+
       |                      |                      |
[Select Channel]       [Select DM]             [Search]
       |                      |                      |
[View Message History]<->[View DM History]  [View Results]
       |                      |
[Send Message]         [Send Message]
       |
[Add Reaction / Reply Thread]
```

**Non-trivial technical challenges:**
- **WebSockets (Real-time events):** Managing live connections, distinguishing between channel-wide broadcasts and private DM events, and handling reconnection state without dropping messages is non-trivial compared to stateless REST APIs.
- **Threaded Replies:** Implementing a recursive or self-referential data model (e.g., `parent_id`) for messages requires careful database design and frontend recursive rendering while keeping query performance high.
- **Unread Tracking:** Maintaining accurate `last_read_at` timestamps for every user in every channel is a high-write-volume operation. It requires race-condition prevention when a user receives multiple messages simultaneously.
- **Full-Text Search:** Using Postgres `ILIKE` for searching across thousands of messages requires proper indexing (e.g., trigram/GIN indexes) to avoid full table scans that degrade performance.
- **Authentication (JWT + WebSockets):** Passing and verifying JWTs seamlessly over a continuous WebSocket connection (not just HTTP requests) is critical to prevent unauthorized event listening or broadcasting.

# 2. Tech Stack

- **Frontend:** React (via Vite), Tailwind CSS
  - *Reasoning:* React provides a robust component-based architecture for complex, stateful UIs like chat apps. Vite ensures blazing-fast builds and HMR. Tailwind CSS enables rapid, utility-first styling for a sleek, modern UI without writing separate CSS files.
- **Backend:** Express.js (Node.js)
  - *Reasoning:* Node.js is naturally suited for I/O heavy, real-time applications. Express.js is a proven, lightweight framework for building the REST APIs that support initial data loading and auth.
- **Database:** PostgreSQL
  - *Reasoning:* A relational database is perfect for the highly structured data of a chat app (users, channels, messages, relationships). Features like foreign key constraints ensure data integrity, and Postgres offers strong support for text search.
- **Real-time:** Socket.io
  - *Reasoning:* Socket.io provides automatic fallbacks, room management (crucial for channels/DMs), and easier broadcasting semantics compared to raw WebSockets.
- **Auth:** JWT (access token) + bcryptjs
  - *Reasoning:* Stateless JWTs reduce database lookups for session verification on every request. Bcryptjs is the industry standard for secure password hashing.

**Exact Packages (Backend):**
- `express` (VERIFY LATEST STABLE VERSION AT BUILD TIME)
- `pg` (VERIFY LATEST STABLE VERSION AT BUILD TIME) - PostgreSQL client
- `socket.io` (VERIFY LATEST STABLE VERSION AT BUILD TIME)
- `jsonwebtoken` (VERIFY LATEST STABLE VERSION AT BUILD TIME)
- `bcryptjs` (VERIFY LATEST STABLE VERSION AT BUILD TIME)
- `cors` (VERIFY LATEST STABLE VERSION AT BUILD TIME)
- `dotenv` (VERIFY LATEST STABLE VERSION AT BUILD TIME)

**Exact Packages (Frontend):**
- `react` / `react-dom` (VERIFY LATEST STABLE VERSION AT BUILD TIME)
- `react-router-dom` (VERIFY LATEST STABLE VERSION AT BUILD TIME)
- `socket.io-client` (VERIFY LATEST STABLE VERSION AT BUILD TIME)
- `zustand` (VERIFY LATEST STABLE VERSION AT BUILD TIME)
  - *Reasoning for Zustand:* We will use Zustand for global state management. It is much simpler and less boilerplate-heavy than Redux, and more performant than React Context for frequently updating state (like incoming real-time chat messages) because it avoids unnecessary re-renders of the entire provider tree.
- `axios` (VERIFY LATEST STABLE VERSION AT BUILD TIME)
- `tailwindcss` (VERIFY LATEST STABLE VERSION AT BUILD TIME)
- `lucide-react` (VERIFY LATEST STABLE VERSION AT BUILD TIME) - For icons

# 3. Folder Structure

```text
/rapid-relay
├── /backend
│   ├── /src
│   │   ├── /config          # DB connection, Socket.io initialization, env variables
│   │   ├── /controllers     # Request handlers (auth logic, fetching messages, etc.)
│   │   ├── /middlewares     # JWT verification, error handling validation rules
│   │   ├── /routes          # Express route definitions
│   │   ├── /sockets         # Socket.io event listeners and emitters (rooms, typing, sending)
│   │   ├── /db              # Raw SQL queries or lightweight wrapper methods
│   │   └── server.js        # Entry point, Express setup, HTTP server creation
│   ├── .env                 # Environment variables (DB URL, JWT secrets)
│   ├── package.json
│   └── /migrations          # SQL files for schema creation
└── /frontend
    ├── /src
    │   ├── /assets          # Static files (images, icons)
    │   ├── /components      # Reusable UI components (Button, Input, Avatar)
    │   ├── /features        # Domain-specific components (ChatBox, Sidebar, ThreadView)
    │   ├── /hooks           # Custom React hooks (useAuth, useSocket)
    │   ├── /pages           # Route-level components (Login, Dashboard)
    │   ├── /services        # API calls (axios wrappers) and Socket client setup
    │   ├── /store           # Zustand global state slices (authStore, chatStore)
    │   ├── App.jsx          # Main App component with Routing
    │   └── main.jsx         # React DOM render entry point
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

# 4. Database Schema (Phase 1)

**ER Diagram:**
```text
[users] 1 -- * [channel_members] * -- 1 [channels]
  | 1               |                     | 1
  |                 |                     |
  | *               |                     | *
[messages] <--------+                     [messages]
  | 1
  |
  | *
[reactions]

[users] 1 -- * [dm_conversations] (user1_id, user2_id)
[dm_conversations] 1 -- * [dm_messages]
[users] 1 -- * [channel_reads] * -- 1 [channels]
```

**Table Definitions & Reasoning:**
- `parent_id` in `messages` allows threading. If `parent_id` is null, it's a top-level message. If it holds an ID, it's a reply to that message.
- `channel_reads` tracks `last_read_at` for each user in each channel. Comparing this to the latest `created_at` in `messages` determines unread counts.

**SQL Migrations:**

```sql
-- 001_create_users.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'offline', -- online, offline, away
    bio TEXT,
    display_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 002_create_channels.sql
CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 003_create_channel_members.sql
CREATE TABLE channel_members (
    channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id)
);

-- 004_create_messages.sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    parent_id INTEGER REFERENCES messages(id) ON DELETE CASCADE, -- For threads
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
-- GIN index for ILIKE search (Requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_messages_content_trgm ON messages USING gin (content gin_trgm_ops);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 005_create_reactions.sql
CREATE TABLE reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (message_id, user_id, emoji)
);

-- 006_create_dm_conversations.sql
CREATE TABLE dm_conversations (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user1_id, user2_id),
    CHECK (user1_id < user2_id) -- Ensures a unique pair regardless of order
);

-- 007_create_dm_messages.sql
CREATE TABLE dm_messages (
    id SERIAL PRIMARY KEY,
    dm_conversation_id INTEGER REFERENCES dm_conversations(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_dm_messages_conversation_id ON dm_messages(dm_conversation_id);

-- 008_create_channel_reads.sql
CREATE TABLE channel_reads (
    channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id)
);
```

# 5. Backend Plan (Phase 2)

**REST API Endpoints:**

| Method | Route | Purpose | Req Body | Res Shape | Auth Req | Logic Location |
|---|---|---|---|---|---|---|
| POST | `/api/auth/register` | Create user | `username`, `email`, `password` | `{ user, token }` | N | `controllers/auth.js` |
| POST | `/api/auth/login` | Login user | `email`, `password` | `{ user, token }` | N | `controllers/auth.js` |
| POST | `/api/auth/logout` | Clear token (client-side) | N/A | `{ message }` | Y | `controllers/auth.js` |
| GET | `/api/auth/me` | Get current user info | N/A | `{ user }` | Y | `controllers/auth.js` |
| GET | `/api/users` | List users for DMs | N/A | `[{ id, username, status, avatar_url, display_name }]` | Y | `controllers/users.js` |
| GET | `/api/channels` | List all channels | N/A | `[{ id, name, description }]` | Y | `controllers/channels.js` |
| POST | `/api/channels` | Create channel | `name`, `description` | `{ channel }` | Y | `controllers/channels.js` |
| GET | `/api/channels/:id/messages` | Get channel messages | N/A | `[{ id, content, user_id, ... }]` | Y | `controllers/messages.js` |
| POST | `/api/channels/:id/read` | Update `last_read_at` | N/A | `{ success: true }` | Y | `controllers/channels.js` |
| GET | `/api/search` | Search messages | `?q=term` | `[{ id, content, channel_id, ... }]` | Y | `controllers/search.js` |
| GET | `/api/dms` | List DM conversations | N/A | `[{ id, user2_info, ... }]` | Y | `controllers/dms.js` |
| GET | `/api/dms/:id/messages` | Get DM messages | N/A | `[{ id, content, sender_id, ... }]` | Y | `controllers/dms.js` |

**Socket.io Events:**

| Event Name | Direction | Payload Shape | Purpose | Location |
|---|---|---|---|---|
| `join_channel` | C → S | `{ channelId }` | Subscribe to channel room | `sockets/index.js` |
| `leave_channel` | C → S | `{ channelId }` | Unsubscribe from channel room | `sockets/index.js` |
| `send_message` | C → S | `{ channelId, content, parentId }` | Send a new message | `sockets/messages.js` |
| `new_message` | S → C | `{ id, channel_id, content, ... }` | Broadcast to channel room | `sockets/messages.js` |
| `delete_message` | C → S | `{ messageId, channelId }` | Delete own message | `sockets/messages.js` |
| `message_deleted` | S → C | `{ messageId, channelId }` | Broadcast deletion | `sockets/messages.js` |
| `add_reaction` | C → S | `{ messageId, channelId, emoji }` | Add emoji reaction | `sockets/messages.js` |
| `reaction_added` | S → C | `{ messageId, channelId, userId, emoji }`| Broadcast reaction | `sockets/messages.js` |
| `user_status` | S → C | `{ userId, status }` | Broadcast online/offline status | `sockets/users.js` |

**Middleware Needed:**
- `requireAuth`: Verifies access token from `Authorization: Bearer <token>` header.
- `errorHandler`: Catches global exceptions and formats consistent JSON error responses.

# 6. Auth Plan (Phase 3)

**Registration Flow:**
1. User submits username, email, password.
2. Backend checks if user/email exists.
3. Backend hashes password using bcryptjs with **10 salt rounds** (standard balance between security and performance).
4. Backend inserts user into DB.
5. Backend generates an Access Token (7d expiry).
6. Access Token is returned in JSON payload and stored in localStorage on the frontend.

**Login Flow:**
1. User submits email, password.
2. Backend queries user, compares password hash via bcryptjs.
3. On success, generates Access token as above.

**Token Storage Strategy:**
- **Access Token:** Stored in localStorage. *Justification:* Simplified auth flow for Phase 1.

**Socket.io Handshake Auth:**
- Clients must pass the JWT access token in the socket auth payload: `const socket = io({ auth: { token: 'ey...' } });`
- The socket server middleware `io.use()` verifies this token before allowing the connection. If invalid/expired, it rejects the connection and frontend must refresh the token and reconnect.

# 7. Frontend Plan (Phase 4)

**Routes:**
- `/login`
- `/register`
- `/` (Dashboard / General layout)
- `/channel/:channelId` (Channel view)
- `/dm/:dmId` (Direct message view)

**Component Tree:**
- `App` (Routing, Auth check wrapper)
  - `AuthLayout` (For login/register)
  - `MainLayout` (Sidebar + Content area)
    - `Sidebar` (Channel list, DM list, User Profile summary)
      - `ChannelItem` (Shows # name, unread dot if applicable)
      - `DMItem` (Shows user avatar, online status dot)
    - `ChatArea`
      - `ChatHeader` (Channel name / Search input)
      - `MessageList` (Scrollable area)
        - `MessageItem` (Avatar, Name, Time, Content, Reactions)
      - `MessageInput` (Textarea, Emoji picker toggle, Send button)
    - `ThreadSidebar` (Conditionally rendered when viewing replies)

**State Management (Zustand):**
- `useAuthStore`: Holds `user`, `accessToken`, `isAuthenticated`.
- `useChatStore`: Holds `channels`, `dms`, `activeChannel`, `messages` (keyed by channel ID to cache them), `unreadCounts`.
- `useSocketStore`: Holds the active `socket` connection instance.

**API Integration:**
- Axios interceptor: Automatically attaches the `Authorization: Bearer <accessToken>` to every request.

**Tailwind Design:**
- Slack-like Dark Theme layout.
- Colors: `bg-slate-900` for main chat, `bg-slate-800` for sidebar, `text-slate-100` for text.
- Accent: `text-indigo-400` / `bg-indigo-600` for primary buttons and mentions.

# 8. Build Order / Milestones

"ONE HOUR BUILD — Priority: Auth → Channels → Messages → Sockets → Frontend Shell → Real-time. DMs, reactions, search, and threads are Phase 3 stretch goals."

**Phase 1: Database & Foundation**
- [ ] Initialize Node/Express project and install dependencies.
- [ ] Configure `dotenv` and Postgres connection pool.
- [ ] Create and run SQL migrations in exact order listed in Section 4.
- [ ] Write seed script to populate mock users and a `#general` channel.

**Phase 2: Authentication (Backend)**
- [ ] Implement bcryptjs hashing and JWT generation.
- [ ] Create `/api/auth/register` and `/api/auth/login` routes.
- [ ] Implement `requireAuth` middleware.

**Phase 2 cont.: Core API & WebSockets (Backend)**
- [ ] Implement REST endpoints for fetching channels and messages.
- [ ] Set up Socket.io server and implement JWT auth middleware for sockets.
- [ ] Implement Socket events: `join_channel`, `send_message`, `new_message`.
- [ ] Implement message insertion into DB via REST/Socket.

**Phase 3: Frontend Foundation**
- [x] Initialize Vite/React/Tailwind project.
- [x] Setup React Router and basic page layouts.
- [x] Implement Zustand stores (`authStore`, `chatStore`).
- [x] Implement Axios instance with request/response interceptors.

**Phase 3 cont.: Frontend Auth & UI**
- [x] Build Login/Register pages and wire up to API.
- [x] Build Sidebar UI (static channels).
- [x] Build Chat Area UI (static messages).

**Phase 3 cont.: Real-time Integration**
- [x] Connect `socket.io-client` upon successful login.
- [x] Fetch and display channels from API.
- [x] Fetch and display messages for the active channel.
- [x] Wire up MessageInput to emit `send_message`.
- [x] Listen for `new_message` and append to Zustand state.

**Phase 3 cont.: Advanced Features**
- [x] Implement Threading (reply UI, parent_id logic).
- [x] Implement Emoji Reactions.
- [x] Implement Unread tracking (`last_read_at` updates).
- [x] Implement Search endpoint and UI.

# 9. Testing & Validation Strategy

- **Phase 1 (DB):** Verify table schemas and constraints manually via `psql` or pgAdmin using the seed script.
- **Phase 2 (Auth API):** Test registration and login exclusively via Postman/cURL to ensure JWTs behave correctly before frontend variables interfere.
- **Phase 2 cont. (Sockets):** Use Postman's WebSocket testing feature to connect, authenticate, and emit/listen to basic events.
- **Phase 3 (Frontend integration):** Open two different browsers (or incognito) logged in as two different users. Verify that sending a message in Browser A instantly appears in Browser B without a page refresh.
- **Phase 3 cont. (Advanced):** Manual QA against a checklist (e.g., "Deleting a message removes it for everyone", "Unread indicator disappears after clicking channel").

# 10. Known Risks / Things Not To Get Wrong

- **Race conditions in unread tracking:** If a user receives a message and reads it immediately, the `last_read_at` update might conflict with incoming socket events. Mitigation: Update `last_read_at` optimistically on frontend, debounce API calls to update the DB.
- **WebSocket reconnection:** If the server restarts or connection drops, the client might miss messages. Mitigation: On reconnect, fetch the latest messages via REST API to fill any gaps.
- **SQL Injection:** All DB queries must use `pg` parameterized queries (e.g., `SELECT * FROM users WHERE email = $1`). Never use string interpolation for queries.
- **Thread depth:** Keep threading to a single level (like Slack). A reply to a reply just goes into the same parent thread. This avoids infinite recursive queries.
- **Message ordering:** Always order by `created_at ASC` on the backend to ensure consistent chronological display on the frontend regardless of network latency.

# 11. Open Questions

- Should users be able to create new channels, or are they fixed? (Assuming yes, based on `/api/channels` POST endpoint, but needs confirmation).
- For unread indicators, do we want a strict unread count (requires complex DB counting per user) or just a binary "has unread messages" dot? (Assuming binary dot based on `last_read_at` for simplicity).
