# ChoreoLab

Rhythmic gymnastics choreography builder — elements database, rules engine, and GraphQL API.

## Stack

- **Server:** Node.js, TypeScript, Apollo Server, MongoDB, Mongoose
- **Client:** React, TypeScript, Vite, Apollo Client

## Getting started

### Prerequisites

- Node.js 20+
- MongoDB Atlas cluster (free tier is fine)

### MongoDB Atlas (one-time setup)

1. Sign up at https://www.mongodb.com/cloud/atlas/register
2. Create a **free M0 cluster** (any cloud/region is fine)
3. **Database Access** → Add user (username + password) → **Atlas admin** or **Read and write to any database**
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) for dev  
   *(tighten this later for production)*
5. **Database** → your cluster → **Connect** → **Drivers** → copy the connection string  
   It looks like: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/`
6. Paste into `server/.env` as `MONGODB_URI`, and append the database name `choreolab`:

```
MONGODB_URI=mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/choreolab?retryWrites=true&w=majority
```

If your password has special characters (`@`, `#`, `:`), [URL-encode](https://www.urlencoder.org/) them first.

**Compass:** use the same connection string (with `/choreolab` before the `?`) to browse the database visually.

### Server

```bash
cd server
cp .env.example .env   # then edit .env with your Atlas URI
npm install
npm run dev
```

GraphQL playground: http://localhost:4000

### Client

```bash
cd client
npm install
npm run dev
```

App: http://localhost:5173

## Project docs

Domain rules and element types will live in markdown files under `docs/` (coming soon).
