# DevFlow — MERN Productivity Tool for Developers

A starter MVP combining a Kanban task board, a Pomodoro timer, and a dev journal —
all under one login, built with MongoDB, Express, React, and Node (all TypeScript).

## Structure

```
dev-productivity-tool/
├── client/   # React + Vite + Tailwind + React Query
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
2. You'll land on the dashboard: add tasks to the board, run a Pomodoro session,
   and write a journal entry.

## What's included

- **Auth**: JWT stored in an httpOnly cookie, register/login/logout/me endpoints.
- **Tasks**: full CRUD, three-column board (To Do / In Progress / Done).
- **Pomodoro**: client-side timer that logs completed sessions to the backend
  (`/api/pomodoro`), plus a `/api/pomodoro/stats` endpoint for weekly totals.
- **Journal**: freeform daily entries, optionally linkable to tasks (`linkedTasks`
  field is modeled but not yet wired into the UI — good first extension).

## Suggested next steps

1. Wire up the Pomodoro stats endpoint into a small chart on the dashboard.
2. Let journal entries link to specific tasks from the UI (the data model
   already supports it).
3. Add drag-and-drop to the task board (e.g. `@dnd-kit/core`).
4. Add a GitHub integration (OAuth + GitHub API) to pull in commits/PRs.
5. Deploy: client → Vercel/Netlify, server → Render/Railway, DB → MongoDB Atlas.
