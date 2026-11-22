# CLAUDE.md

@agent.md

The file above (`agent.md`) is the source of truth for Nexus architecture, database rules, the Socket.io protocol, and coding conventions. Do not duplicate its content here. If something in this file conflicts with `agent.md`, `agent.md` wins, unless I say otherwise in the conversation.

This file only adds guidance specific to working with Claude Code.

---

## Where to look first

- **Architecture and conventions:** `agent.md` (imported above)
- **Product specs and blueprints:** `artifacts/project.md`. Read it before building or changing a feature.
- **Styling and UI rules:** `artifacts/style.md`. Read it before touching any frontend component or Tailwind classes.
- **Setup and usage:** `README.md`

Read the `artifacts/` files on demand rather than loading them for every task.

---

## Working agreements

### Before you change code
1. Locate the existing pattern. For example, look at a similar controller, store, or component and follow it rather than inventing a new structure.
2. For anything touching more than 2–3 files, a schema change, or a socket event, outline your plan first and wait for my go-ahead.
3. Do not introduce new dependencies without asking.

### While you change code
- Make the smallest change that solves the problem. Do not refactor unrelated code in the same change.
- Use ES modules (`import`/`export`) everywhere. No `require`.
- Always use parameterized queries (`$1, $2, ...`). Never interpolate user input into SQL.
- Never return `password_hash` in any response.
- Check ownership (`req.user.id === target.user_id`) before any `UPDATE` or `DELETE` on messages or profiles.
- Return standard HTTP status codes, and never leak raw database errors or stack traces to the client.
- Keep socket listeners in the stores or hooks, not inside UI components.

### After you change code
- Run the relevant commands from the table below and report what you ran and what happened.
- If you could not run or verify something, say so plainly. Do not claim it works.
- Summarize what changed and why, and list any files touched.

---

## Commands

| Task | Command | Directory |
|---|---|---|
| Install backend deps | `npm install` | `backend/` |
| Run backend (dev) | `npm run dev` | `backend/` |
| Run migrations | `npm run migrate` | `backend/` |
| Install frontend deps | `npm install` | `frontend/` |
| Run frontend (dev) | `npm run dev` | `frontend/` |
| Start everything | `docker compose up -d` | repo root |
| Backend logs | `docker compose logs -f backend` | repo root |
| Rebuild after dependency changes | `docker compose up --build -d` | repo root |

`agent.md` does not document a test or lint command. Check each `package.json` for `test` and `lint` scripts before assuming they exist, and do not invent them.

---

## Task-specific checklists

### Adding or changing a database table or column
- Add a new numbered migration in `backend/migrations/`. Never edit an already-applied migration.
- Keep integer `SERIAL` primary keys and respect `ON DELETE CASCADE` behavior.
- Update `002_seed.sql` only if seed data needs to reflect the change.
- Run `npm run migrate` to verify.

### Adding or changing a REST endpoint
- Add or update the controller in `backend/src/controllers/` and wire it in `backend/src/routes/`.
- Protect it with the JWT guard in `middleware/auth.js` unless it is intentionally public.
- Add the matching wrapper in `frontend/src/api/`.

### Adding or changing a real-time event
- Update the handler in `backend/src/sockets/`.
- Use the existing room naming: `channel:<id>`, `dm:<id>`, `user:<id>`.
- Update the matching Zustand store and `frontend/src/services/socket.js` listener.
- Update the event table in `agent.md` so it stays accurate.
- Make sure the REST path still works as the fallback if the socket disconnects.

### Adding or changing a UI component
- Read `artifacts/style.md` first.
- Place it in the matching folder under `frontend/src/components/` (`chat/`, `dm/`, `sidebar/`, `profile/`, `ui/`).
- Reuse primitives from `components/ui/` before creating new ones.
- Keep Tailwind v3 syntax, and do not use v4-only features.

### Voice Assistant & Tool Extensions
- Voice tools reside in `backend/src/services/voiceTools.js` and `assistant.service.js`.
- Always enforce verified JWT authorization (`user.id`) and membership checks.
- Any write operations must require explicit confirmation and never write immediately.
- Never log raw audio; only log tool name and sanitized arguments in `assistant_logs`.

---

## Things to avoid

- Do not commit secrets, `.env` files, or JWT secrets. Environment variables are parsed in `backend/src/config/env.js`, so add new ones there.
- Do not change the primary key strategy or the `CHECK (user1_id < user2_id)` constraint on `dm_conversations`.
- Do not add multi-level threading. Threads are intentionally single-level via `parent_id`.
- Do not run destructive commands (`docker compose down -v`, dropping tables, deleting migrations) without asking.

---

## Keeping docs in sync

When your change alters architecture, the database schema, socket events, or commands, update `agent.md` in the same change. Keep this `CLAUDE.md` limited to Claude Code workflow guidance, and put project facts in `agent.md` so both files do not drift apart.