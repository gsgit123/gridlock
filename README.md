# Gridlock — Real-Time Shared Grid

A multiplayer tile board where users claim tiles in real time. Open the site, click a tile, and everyone sees it instantly.

## Live Demo

- **App:** [your-vercel-url]
- **API:** [your-render-url]

## Features

- 50×50 grid (2,500 tiles) — click to claim
- Real-time sync via WebSockets — all users see changes instantly
- Auto-generated username + color per visitor (persisted in localStorage)
- 3-second server-enforced cooldown between claims
- Tiles are reclaimable — anyone can steal any tile
- Auto-reset when grid is 100% full
- Live leaderboard (top 10 by tile count)
- Zoom (scroll wheel / pinch) and pan (drag)
- Tile tooltips with owner name + claim time
- Claim animation (scale pulse)
- Online user count
- Mobile responsive with bottom drawer

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite | Fast HMR, optimized builds |
| Styling | Tailwind CSS v4 | Utility-first, rapid UI |
| Backend | Node.js + Express | Lightweight, pairs with Socket.IO |
| Real-time | Socket.IO | WebSocket with auto-reconnect + polling fallback |
| Database | SQLite (better-sqlite3) | Zero config, synchronous API, persistent |
| Deployment | Vercel + Render | Free tiers |

## How Real-Time Updates Work

```
User clicks tile → socket.emit("claim-tile", {row, col})
  → Server validates (bounds, cooldown, registration)
  → Server writes to SQLite (synchronous, atomic)
  → Server broadcasts io.emit("tile-update") to ALL clients
  → Every client updates local state → only that tile re-renders
```

**Conflict resolution:** Server-authoritative. Node.js single-threaded event loop processes claims sequentially — first to arrive wins. `better-sqlite3` is synchronous, so DB write + broadcast happen in the same tick. No race conditions.

**State sync:** New users get the full grid on connect. After that, only individual tile updates are pushed — keeps bandwidth minimal.

## Trade-offs

| Decision | Trade-off |
|----------|-----------|
| SQLite over PostgreSQL | Zero deps, easy local setup — but no horizontal scaling. Ephemeral on Render free tier. |
| In-memory cooldowns | O(1) lookups, lost on restart. Fine for this scope. |
| CSS Grid over Canvas | Easier interactivity — more DOM nodes but fine at 2,500 tiles. |
| Full grid on connect | Simple. ~50KB payload for 2,500 tiles — negligible. |
| No auth | Instant play, but identity is device-bound via localStorage. |

## Bonus Features

- Cooldown timer (server-enforced, 3s)
- Leaderboard (top 10, live)
- Tile tooltips (owner + relative time)
- Zoom and pan (wheel + drag + pinch on mobile)
- Claim animation (scale pulse)
- Online user count
- Auto-generated usernames + colors
- Mobile responsive (bottom drawer)
- Auto-reset when grid is full

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Server starts on `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens on `http://localhost:5173`

### Test Real-Time

Open two browser tabs at `http://localhost:5173`. Claim tiles in one tab — they appear instantly in the other.

## Project Structure

```
gridlock/
├── backend/
│   ├── src/
│   │   ├── config.js
│   │   ├── index.js
│   │   ├── db/
│   │   │   ├── setup.js
│   │   │   └── query.js
│   │   ├── socket/
│   │   │   └── handlers.js
│   │   └── utils/
│   │       └── identity.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   └── Grid.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   └── lib/
│   │       └── identity.js
│   └── package.json
└── README.md
```
