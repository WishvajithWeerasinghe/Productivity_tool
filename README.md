# DevFlow — MERN Productivity Tool for Developers

A productivity tool combining a real drag-and-drop Kanban board, a Pomodoro timer,
and a dev journal — all under one login. Built with MongoDB, Express, React, and
Node (all TypeScript).

## Structure

```
dev-productivity-tool/
├── client/   # React + Vite + Tailwind + React Query + dnd-kit
└── server/   # Express + Mongoose + JWT auth
```

## Getting started

### 1. Server

```bash
cd server
cp .env.example .env
# edit .env: set MONGO_URI (e.g. a free MongoDB Atlas cluster) and JWT_SECRET
npm install
npm run dev
```

Server runs at http://localhost:5000. Health check: `GET /api/health`.

### 2. Client

```bash
cd client
npm install
npm run dev
```

Client runs at http://localhost:5173 and proxies `/api` requests to the server.

### 3. Try it out

1. Go to http://localhost:5173/register and create an account.
2. You'll land on the dashboard with a working Kanban board.

## The Kanban board

The board now behaves like a real-world tool (Trello/Linear-style):

- **Drag and drop** tasks between columns, and reorder within a column, using
  `@dnd-kit`. Order and status are persisted to MongoDB via a single
  `PATCH /api/tasks/reorder` call after each drag, with an optimistic UI
  update so the board never flickers or snaps back while saving.
- **Click a card** to open an edit modal — update title, description,
  status, priority, or tags, or delete the task.
- **"+" on a column header** opens the same modal pre-set to that column's
  status, for quickly adding a task to a specific column.
- **Priority badges** (low/medium/high, color-coded) and **tag chips** on
  each card.
- **Per-column counts** and an empty-state hint ("Drop tasks here") when a
  column has nothing in it.

### How ordering works (backend)

Each `Task` document has an `order` field (a number, scoped per status
column). On drag-end, the client recomputes the `order` for every task in
the column(s) that changed and sends them in one batch to
`PATCH /api/tasks/reorder`, which updates them all via `Promise.all`. New
tasks are appended to the bottom of their column (`order = current count`).

## What's included

- **Auth**: JWT stored in an httpOnly cookie, register/login/logout/me endpoints.
- **Tasks**: full CRUD + drag-and-drop reordering across three columns.
- **Pomodoro**: client-side timer that logs completed sessions to the backend
  (`/api/pomodoro`), plus a `/api/pomodoro/stats` endpoint for weekly totals.
- **Journal**: freeform daily entries, optionally linkable to tasks (the
  `linkedTasks` field is modeled but not yet wired into the UI — a good next
  extension).

## Suggested next steps

1. Wire up the Pomodoro stats endpoint into a small chart on the dashboard.
2. Let journal entries link to specific tasks from the UI.
3. Add keyboard-accessible drag-and-drop (dnd-kit supports this via its
   keyboard sensor — currently only the pointer sensor is wired up).
4. Add a GitHub integration (OAuth + GitHub API) to pull in commits/PRs.
5. Deploy: client → Vercel/Netlify, server → Render/Railway, DB → MongoDB Atlas.
