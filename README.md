# ChoreoLab

A production-quality web platform for rhythmic gymnastics coaches to build FIG Code of Points compliant routines with live DB/DA scoring and validation.

**Repository:** https://github.com/Shugi2424/ChoreoLab

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Apollo Client, React Router, Material UI |
| Backend | Node.js, TypeScript, Apollo Server, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT, bcrypt |
| Deployment | Vercel (client) + Render (server) + Atlas (DB) |

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB Atlas cluster

### Server

```bash
cd server
cp .env.example .env   # add your Atlas URI and secrets
npm install
npm run dev            # http://localhost:4000/graphql  (health: /health)
```

### Client

```bash
cd client
cp .env.example .env   # VITE_GRAPHQL_URL=http://localhost:4000/graphql
npm install
npm run dev            # http://localhost:5173
```

### Access from another device (same Wi-Fi)

1. On this PC, run `ipconfig` and note the **Wi-Fi IPv4 address** (e.g. `192.168.1.42`).
2. In `client/.env`, set `VITE_GRAPHQL_URL=http://<your-ip>:4000/graphql`.
3. In `server/.env`, set `CORS_ORIGIN=http://<your-ip>:5173`.
4. Restart both dev servers.
5. On the other device, open the **Network** URL Vite prints (e.g. `http://192.168.1.42:5173/dashboard`).

If the other device cannot connect, allow Node.js through Windows Firewall for ports **5173** and **4000**.

## Documentation

All project documentation lives in [`docs/`](./docs/) and is the source of truth.

Start with [`docs/README.md`](./docs/README.md) for the index and editing workflow.

| Document | Description |
|----------|-------------|
| [PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) | Purpose, audience, user flow |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, layers, deployment |
| [DATABASE.md](./docs/DATABASE.md) | Collections, schemas, relationships |
| [API.md](./docs/API.md) | GraphQL schema and operations |
| [CODE_OF_POINTS.md](./docs/CODE_OF_POINTS.md) | CoP overview |
| [domains/](./docs/domains/) | Detailed CoP data (collaborative) |
| [UI_UX.md](./docs/UI_UX.md) | Design system, layouts |
| [ROADMAP.md](./docs/ROADMAP.md) | Milestone plan |
| [AI_RULES.md](./docs/AI_RULES.md) | Development guidelines |

## Project Structure

```
ChoreoLab/
├── client/              React SPA
│   └── src/
│       ├── apollo/      Apollo Client config
│       ├── components/  Reusable UI (planned)
│       ├── pages/       Route pages (planned)
│       ├── graphql/     Queries & mutations (planned)
│       └── theme/       MUI theme (planned)
├── server/              GraphQL API
│   └── src/
│       ├── models/      Mongoose schemas
│       ├── resolvers/   Thin GraphQL resolvers
│       ├── services/    Business logic (planned)
│       └── schema/      GraphQL typeDefs (planned)
├── docs/                Documentation
└── .cursor/rules/       AI assistant rules
```

## Current Status

**Phase 0 — Documentation.** Domain docs in `docs/domains/` are being filled in collaboratively. Milestone 0 (code foundation) follows.

Early scaffold: Apollo GraphQL + MongoDB Atlas connected. See [ROADMAP.md](./docs/ROADMAP.md).

## License

Private — all rights reserved.
