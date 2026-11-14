# Nexus — AI Agent & Developer Guide (`agent.md`)

Welcome to the **Nexus** codebase. This guide is crafted for autonomous AI agents, LLM coding assistants, and human engineers to navigate, understand, and safely modify or extend the Nexus platform.

---

## 1. Project Overview

**Nexus** is an open-source, full-stack, real-time team messaging application modeled after modern collaboration tools like Slack. It features public channels, private direct messages (DMs), single-level threaded replies, emoji reactions, live presence/typing indicators, unread tracking, and trigram-based full-text message search.

### Core Stack
- **Backend:** Node.js, Express.js (REST API), Socket.io (WebSocket), `pg` (node-postgres), `bcryptjs`, `jsonwebtoken`
- **Frontend:** React 19, Vite, Tailwind CSS v3, Zustand (state management), Axios, Socket.io-client, Lucide icons
- **Database:** PostgreSQL 15+ (with `pg_trgm` extension for search)
- **Containerization:** Docker & Docker Compose

---

## 2. Repository Layout

```
nexus/
├── agent.md                      # AI agent reference guide & architecture handbook
├── README.md                     # High-level overview, setup guide, and documentation
├── docker-compose.yml            # Multi-container orchestration (db, backend, frontend)
├── artifacts/                    # Architecture blueprints, specs, and styling guidelines
│   ├── project.md
│   └── style.md
├── backend/
│   ├── Dockerfile & .dockerignore
│   ├── package.json
│   ├── migrations/               # Schema and seed scripts (001_schema.sql, 002_seed.sql, run.js)
│   └── src/
│       ├── server.js             # HTTP server setup, Socket.io initialization, graceful shutdown
│       ├── config/
│       │   ├── db.js             # PostgreSQL connection pool with error listener
│       │   └── env.js            # Centralized environment variable parser & validator
│       ├── middleware/
│       │   ├── auth.js           # JWT Bearer authentication guard
│       │   └── errorHandler.js   # Centralized express error handler
│       ├── controllers/          # Business logic: auth, channels, messages, dms, reactions, users, search
│       ├── routes/               # Express routers mapping HTTP endpoints to controllers
│       └── sockets/              # Socket.io authentication & real-time event handlers
└── frontend/
    ├── Dockerfile & nginx.conf
    ├── package.json & vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx & App.jsx    # Client entry point & routing configuration
        ├── api/                  # Axios HTTP client instances and API endpoint wrappers
        ├── services/
        │   └── socket.js         # Socket.io client manager (connect, disconnect, emit, on)
        ├── store/                # Zustand stores (authStore, channelStore, messageStore, dmStore, userStore)
        ├── hooks/                # Custom hooks (useAuth, useSocket, useMessages)
        ├── pages/                # High-level route views (Login, Register, Workspace, NotFound)
        └── components/
            ├── chat/             # ChatArea, MessageList, MessageItem, MessageInput, ThreadPanel, ReactionBar
            ├── dm/               # DMArea, DMDetailsPanel
            ├── sidebar/          # Sidebar, ChannelList, DMList, Modals (CreateChannel, UserPicker)
            ├── profile/          # UserProfileModal
            └── ui/               # Generic UI primitives (Modal, UserAvatar, SearchBar)
```

---

## 3. Database Architecture & Conventions

Nexus uses **PostgreSQL** with 8 core relational tables:

1. **`users`**: User identity, credential hash (`password_hash`), display name, avatar, bio, and status (`online`, `away`, `offline`).
2. **`channels`**: Public discussion channels with `name` (unique, lowercase), `description`, and `created_by`.
3. **`channel_members`**: Many-to-many relationship tracking channel membership with `joined_at`.
4. **`messages`**: Channel messages containing `channel_id`, `user_id`, `content`, `parent_id` (single-level self-referencing foreign key for threaded replies), and `is_edited`.
5. **`reactions`**: Emoji reactions unique across `(message_id, user_id, emoji)`.
6. **`dm_conversations`**: 1-on-1 private rooms enforced with `CHECK (user1_id < user2_id)` to prevent reciprocal duplicates.
7. **`dm_messages`**: Direct messages linked to `conversation_id`, `sender_id`, and `content`.
8. **`channel_reads`**: Tracks `last_read_at` timestamp per user per channel for efficient unread count calculations without counter contention.

### Database Design Rules for Agents
- Always use **parameterized queries** (`$1, $2, ...`) in `db.query()` to prevent SQL injection.
- Trigram search queries leverage `pg_trgm` via `content ILIKE '%' || $1 || '%'` supported by a GIN index.
- Never alter primary key strategy without team review: all IDs are integer `SERIAL`.
- Respect foreign key `ON DELETE CASCADE` behaviors when cleaning up related records.

---

## 4. Real-Time WebSocket Protocol (Socket.io)

### Authentication
Sockets authenticate during the initial handshake via query or auth payload containing `{ token: "Bearer <jwt>" }`. Unauthenticated connections are rejected with an `Unauthorized` error.

### Socket Rooms
- Channel rooms: `channel:<channelId>`
- DM conversation rooms: `dm:<conversationId>`
- User-specific rooms: `user:<userId>` (for personal notifications, unread updates, and direct alerts)

### Key Real-Time Events
| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `channel:join` | Client $\rightarrow$ Server | `{ channelId }` | Joins socket to channel room |
| `channel:leave` | Client $\rightarrow$ Server | `{ channelId }` | Leaves channel room |
| `message:send` | Client $\rightarrow$ Server | `{ channelId, content, parentId }` | Sends a message/thread reply |
| `message:new` | Server $\rightarrow$ Client | Message object | Broadcasts newly created message |
| `message:edit` | Server $\rightarrow$ Client | `{ messageId, content, is_edited }` | Broadcasts edited message |
| `message:delete` | Server $\rightarrow$ Client | `{ messageId }` | Broadcasts deleted message |
| `typing:start` | Client $\rightarrow$ Server | `{ channelId, username }` | Notifies room that user is typing |
| `typing:stop` | Client $\rightarrow$ Server | `{ channelId, username }` | Clears typing indicator |
| `reaction:add` | Server $\rightarrow$ Client | `{ reactionId, messageId, emoji, user }` | Broadcasts emoji reaction |
| `user:status` | Server $\rightarrow$ Client | `{ userId, status }` | Broadcasts online/away/offline state |

---

## 5. Development & Testing Commands

### Local Development (Host Node)
```bash
# Backend setup & run
cd backend
npm install
npm run dev

# Run migrations
npm run migrate

# Frontend setup & run
cd ../frontend
npm install
npm run dev
```

### Docker Compose
```bash
# Start all services (PostgreSQL db, backend API, frontend web app)
docker compose up -d

# View service logs
docker compose logs -f backend

# Rebuild containers after Dockerfile or dependency updates
docker compose up --build -d
```

---

## 6. Guidelines for Autonomous Agents

When introducing features or resolving issues in Nexus:

1. **State Management:**
   - Keep Zustand store actions idempotent and optimistic where appropriate.
   - Separate socket event listeners from UI rendering: let stores receive socket events and update reactive state.
2. **Security & Validation:**
   - Never expose `password_hash` in user responses (explicitly exclude in SQL `SELECT` or remove before serialization).
   - Verify ownership before `UPDATE` or `DELETE` on messages and user profiles (`req.user.id === target.user_id`).
3. **Resilience & Fallbacks:**
   - REST endpoints serve as the authoritative fallback if Socket.io disconnects. When the socket reconnects, invalidate and refresh the current channel/DM cache.
4. **Code Consistency:**
   - Use ES modules throughout backend and frontend (`import`/`export`).
   - Use standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).
   - Log actionable error messages in backend controllers without leaking raw database stack traces to the client.
