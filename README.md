# Nexus

A real-time team messaging application — channels, direct messages, threaded replies, emoji reactions, typing indicators, and full-text search — built with React, Express, PostgreSQL, and Socket.io, secured with JWT-based authentication.

> A self-hosted, lightweight real-time team messaging platform built as a full-stack, spec-driven project across three phases: Database → Backend → Frontend.


## Features

-  JWT-based authentication (register/login) with bcryptjs password hashing
-  Real-time messaging — instant delivery via WebSockets (Socket.io)
-  Public channels for team collaboration + private 1-on-1 direct messages
-  Threaded replies (single-level, like Slack)
-  Emoji reactions on messages
-  Fast, real-time message search with keyword highlighting (Postgres `pg_trgm` + GIN index)
-  Typing indicators — see when others are typing, in real time
-  Unread message badges, tracked per user per channel
-  Rich user profiles — customizable avatar, display name, bio, and online/away/offline status
-  Message editing with an "(edited)" indicator
-  Soft-deletable messages (own messages only)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v3, Zustand, React Router, Axios, Socket.io-client |
| Backend | Node.js, Express, PostgreSQL (`pg`), Socket.io, bcryptjs, jsonwebtoken |
| Database | PostgreSQL |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |

**Why these choices:**
- **Zustand** over Redux/Context — minimal boilerplate and avoids re-rendering the entire provider tree on every incoming real-time message.
- **Socket.io** over raw WebSockets — built-in room management (channels/DMs) and automatic reconnection handling.
- **PostgreSQL** — relational integrity for structured chat data (users, channels, messages, memberships) plus solid built-in text search via `pg_trgm`.
- **SERIAL primary keys** over UUIDs — simpler joins and smaller indexes; not a distributed/multi-tenant system, so globally unique IDs aren't necessary.

---

## Architecture

```
┌─────────────┐        REST (Axios)        ┌──────────────┐
│   React     │ ─────────────────────────▶ │   Express    │
│  Frontend   │ ◀───────────────────────── │   Backend    │
│  (Zustand)  │       Socket.io (WS)        │  (Socket.io) │
└─────────────┘ ◀═══════════════════════▶  └──────┬───────┘
                                                    │
                                                    ▼
                                           ┌─────────────────┐
                                           │   PostgreSQL    │
                                           └─────────────────┘
```

- REST handles initial data loads (auth, fetching channels/messages/history).
- Socket.io handles everything that needs to happen live: new messages, deletions, reactions, and presence.
- On socket reconnect, the client re-fetches recent messages via REST to fill any gap from messages missed while disconnected.

---

## Database Schema

8 core tables, all using `SERIAL` primary keys:

| Table | Purpose |
|---|---|
| `users` | Accounts — username, email, password_hash, avatar_url, status, display_name, bio |
| `channels` | Topic-based chat rooms |
| `channel_members` | Many-to-many join table between users and channels |
| `messages` | Channel messages; `parent_id` self-references `messages.id` for threading |
| `reactions` | Emoji reactions, unique per (message, user, emoji) |
| `dm_conversations` | 1-on-1 conversation pairs (`CHECK (user1_id < user2_id)` prevents duplicate reversed pairs) |
| `dm_messages` | Messages inside a DM conversation |
| `channel_reads` | Tracks `last_read_at` per user per channel — powers unread indicators |

**Notable design decisions:**
- **Threading**: single-level only (a reply-to-a-reply lands in the same parent thread) to avoid unbounded recursive queries.
- **Unread tracking**: stores just a `last_read_at` timestamp instead of a running unread counter — avoids race conditions and constant counter writes.
- **Search**: `ILIKE` queries backed by a GIN index using the `pg_trgm` extension, avoiding full table scans.
- **Auto-updated timestamps**: a Postgres trigger (`update_updated_at_column`) bumps `messages.updated_at` on every `UPDATE`, which pairs with the `is_edited` flag.
- **Referential integrity**: `ON DELETE CASCADE` on dependent tables (messages, reactions, channel_members) prevents orphaned rows.

---

## API Reference

All authenticated routes require an `Authorization: Bearer <token>` header.

| Method | Route | Purpose | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create a new account | No |
| POST | `/api/auth/login` | Log in, receive a token | No |
| POST | `/api/auth/logout` | Clear token (client-side) | Yes |
| GET | `/api/auth/me` | Get current user info | Yes |
| GET | `/api/users` | List users (for starting DMs) | Yes |
| GET | `/api/channels` | List all channels | Yes |
| POST | `/api/channels` | Create a channel | Yes |
| GET | `/api/channels/:id/messages` | Get messages for a channel | Yes |
| POST | `/api/channels/:id/read` | Mark channel as read | Yes |
| GET | `/api/search?q=` | Search messages | Yes |
| GET | `/api/dms` | List DM conversations | Yes |
| GET | `/api/dms/:id/messages` | Get messages in a DM conversation | Yes |

---

## Socket.io Events

| Event | Direction | Purpose |
|---|---|---|
| `join_channel` | Client → Server | Subscribe to a channel's room |
| `leave_channel` | Client → Server | Unsubscribe from a channel's room |
| `send_message` | Client → Server | Send a new message |
| `new_message` | Server → Client | Broadcast a new message to the room |
| `delete_message` | Client → Server | Delete own message |
| `message_deleted` | Server → Client | Broadcast a deletion |
| `add_reaction` | Client → Server | Add an emoji reaction |
| `reaction_added` | Server → Client | Broadcast a new reaction |
| `user_status` | Server → Client | Broadcast online/offline presence |
| `typing` | Client → Server | Notify the room a user started typing |
| `stop_typing` | Client → Server | Notify the room a user stopped typing |
| `user_typing` | Server → Client | Broadcast typing state to other room members |

The socket handshake is authenticated via `auth: { token }`, verified server-side in `io.use()` middleware before the connection is accepted.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url> nexus
   cd nexus
   ```

2. **Set up the database**

   Create a PostgreSQL database, then run the schema setup/migrations to create the tables (see [Database Schema](#database-schema) below).

3. **Backend setup**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file with:
   ```
   PORT=5000
   DB_USER=your_db_user
   DB_HOST=localhost
   DB_NAME=nexus
   DB_PASSWORD=your_db_password
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   ```

   Then start the server:
   ```bash
   npm run dev
   ```

4. **Frontend setup**

   ```bash
   cd ../frontend
   npm install
   ```

   The frontend proxy is configured in `vite.config.js` to point to the backend (default `http://localhost:5000`) — no separate `.env` is required unless you're pointing to a non-default backend URL.

   ```bash
   npm run dev
   ```

5. **Access the application**

   Open `http://localhost:5173` in your browser. Open a second browser (or incognito window) logged in as a different user to test real-time messaging.

---

## Environment Variables

**Backend (`backend/.env`)**

| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on |
| `DB_USER` | PostgreSQL username |
| `DB_HOST` | PostgreSQL host (e.g. `localhost`) |
| `DB_NAME` | Database name |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_PORT` | PostgreSQL port (default `5432`) |
| `JWT_SECRET` | Secret used to sign JWTs |
| `CLIENT_URL` | Frontend origin, for CORS |

**Frontend**

No `.env` file is required by default — `vite.config.js` proxies `/api` and `/socket.io` requests to the backend (`http://localhost:5000`). If your backend runs on a different host/port, update the proxy target in `vite.config.js` accordingly.

---

## Project Structure

```
/nexus
├── /backend
│   ├── /src
│   │   ├── /config        # DB connection, Socket.io init, env vars
│   │   ├── /controllers   # Request handlers
│   │   ├── /middlewares   # Auth verification, error handling
│   │   ├── /routes        # Express route definitions
│   │   ├── /sockets       # Socket.io event listeners/emitters
│   │   ├── /db            # Query wrapper functions
│   │   └── server.js      # Entry point
│   ├── /migrations        # SQL migration files
│   └── package.json
└── /frontend
    ├── /src
    │   ├── /api            # Axios wrapper functions per resource
    │   ├── /services       # Socket client setup
    │   ├── /store          # Zustand global state slices
    │   ├── /hooks           # Custom hooks (useAuth, useSocket, useMessages)
    │   ├── /pages           # Route-level components
    │   ├── /components      # Sidebar, chat, DM, and UI components
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## Known Limitations & Tradeoffs

- **Auth model**: a single 7-day access token stored in `localStorage`, with no refresh token or httpOnly cookie rotation. Simpler to build and reason about, at the cost of some XSS exposure compared to a cookie-based approach.
- **Unread tracking race conditions**: if a user receives and reads a message near-simultaneously, `last_read_at` updates could race against incoming socket events. Mitigated by debouncing read updates client-side, but not fully eliminated.
- **Single-server real-time**: Socket.io rooms are in-memory per server instance. Scaling to multiple backend instances would require a Redis adapter for cross-instance pub/sub.
- **Message editing**: last-write-wins via the `updated_at` trigger — no optimistic locking or conflict resolution for concurrent edits.
- **Thread depth**: capped at one level by design, matching Slack's own threading model.

---

## Roadmap

- [ ] Message reaction removal
- [ ] File/image attachments
- [ ] Multi-instance Socket.io scaling via Redis adapter
- [ ] Push notifications for mentions

---

## License

MIT
