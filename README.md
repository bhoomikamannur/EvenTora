# Eventora

A community platform built for **IIIT Dharwad** students to discover campus club activity — events, posts, discussions, and media — in one place. Clubs get a space to manage their community; students get a single feed to follow the clubs they care about.

## Features

- 🔐 **Auth** — email/password signup restricted to `@iiitdwd.ac.in`, plus Google Sign-In
- 🏛️ **Clubs** — join/leave clubs, browse by type (technical / cultural)
- 📸 **Posts** — feed with image uploads (via Cloudinary), likes, and comments
- 📅 **Events** — event listings with RSVP, per-club and academic events
- 💬 **Threads** — discussion forum with replies, likes, and a built-in report/moderation flow
- 🎬 **Media** — link out to club YouTube, Instagram, and GitHub content
- 👥 **Members** — club rosters with roles (Lead, Co-Lead, Team Lead, Member)
- ⚡ **Real-time** — live online-user counts and instant thread/reply updates via Socket.io
- 🛡️ **Admin controls** — club-scoped admin permissions for managing events, posts, media, members, and moderating reported threads
- 🚀 **Performance** — Redis caching (graceful degradation if unavailable), API rate limiting, structured logging

## Tech Stack

**Frontend**
- React 18 (Create React App)
- Tailwind CSS
- Axios
- Socket.io Client
- Google OAuth (`@react-oauth/google`)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Redis (caching)
- Socket.io (real-time)
- JWT + bcrypt (auth) + Google Auth Library
- Cloudinary + Multer (image uploads)

**Tooling**
- Docker
- Autocannon (load testing)

## Project Structure

```
Eventora
│
├── frontend/               # React client
│   └── src/
│       ├── components/     # UI components (posts, events, threads, media, members, common)
│       ├── screens/        # Top-level screens (Home, Communities, Calendar, Profile)
│       ├── context/        # AuthContext
│       ├── hooks/          # useClubs, useEvents, usePosts
│       └── services/       # API client
│
├── backend/                # Node.js API server
│   └── src/
│       ├── controllers/    # Route logic
│       ├── models/         # Mongoose schemas
│       ├── routes/         # Express routers
│       ├── middleware/     # Auth, rate limiting, logging, error handling
│       └── config/         # DB, Redis, Socket.io setup
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- Redis (optional — app runs without it)
- A Cloudinary account (for image uploads)
- A Google Cloud OAuth Client ID (for Google Sign-In)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/eventora.git
cd eventora
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000`, the backend on `http://localhost:5000`.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with IIIT Dharwad email |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/clubs` | List all clubs |
| POST | `/api/clubs/:id/join` | Join a club |
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create a post (image upload via Cloudinary) |
| POST | `/api/posts/:id/like` | Like a post |
| GET | `/api/events` | Get all events |
| POST | `/api/events/:id/rsvp` | RSVP to an event |
| GET | `/api/clubs/:clubId/threads` | Get club discussion threads |
| POST | `/api/threads/:id/reply` | Reply to a thread |
| POST | `/api/threads/:id/report` | Report a thread |
| GET | `/api/health` | Service health check |

Full route list lives in `backend/src/routes/`.

## Real-Time Events (Socket.io)

| Event | Direction | Description |
|---|---|---|
| `join-community` / `leave-community` | client → server | Join/leave a club's live room |
| `online-count` | server → client | Live count of users viewing a club's threads |
| `new-thread` / `thread-added` | both | Broadcast a newly created thread |
| `new-reply` / `reply-added` | both | Broadcast a new reply |
| `thread-liked` / `thread-like-updated` | both | Live like-count sync on threads |
| `reply-liked` / `reply-like-updated` | both | Live like-count sync on replies |

## Load Testing

```bash
npx autocannon -c 100 -d 10 http://localhost:5000/api/events
```

## Roadmap

- [ ] CI/CD pipeline (GitHub Actions)
- [ ] CDN integration for static assets
- [ ] Advanced search and filtering
- [ ] Event recommendation system
- [ ] Horizontal scaling with load balancers

## Author

**23BCS030 Bhoomika Mannur**
