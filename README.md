# Eventora

**A campus community & events platform built for IIIT Dharwad students.**

Eventora brings clubs, events, announcements, and student discussions into a single connected space. Students discover and RSVP to events, follow club activity, and participate in discussion threads — while club organizers get dedicated tools to manage their communities in real time.

🔗 **Live App:** [https://eventora-f.onrender.com](https://eventora-f.onrender.com)
📦 **Repository:** [github.com/bhoomikamannur/EvenTora](https://github.com/bhoomikamannur/EvenTora)

> **Note:** The backend is hosted on Render's free tier, so the first request after inactivity may take 30–60 seconds to wake the server.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Roles & Permissions](#roles--permissions)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Real-Time Events (Socket.IO)](#real-time-events-socketio)
- [Design System](#design-system)
- [Known Limitations / Roadmap](#known-limitations--roadmap)
- [Author](#author)
- [License](#license)

---

## Overview

Eventora restricts registration to verified IIIT Dharwad student accounts and organizes the campus experience around three core surfaces:

- **Feed** — posts, media, and announcements from clubs a student follows
- **Communities** — club pages with events, discussion threads, and member rosters
- **Calendar** — a unified view of campus and club events with RSVP support

Clubs are represented as first-class entities with their own admins (organizers), who get scoped tools to manage membership, moderate discussions, and post events — without needing platform-wide admin access.

## Features

### For Students
- 🔐 Secure auth restricted to verified student accounts, with role-locked public registration (students only — roles cannot be self-assigned at signup)
- 🏛️ Browse and join clubs by category (technical / cultural)
- 📸 Media feed with image uploads (Cloudinary), likes, and comments
- 📅 Campus and club event listings with **RSVP**, synced live via Socket.IO
- 💬 Threaded discussions with replies, likes, and a report/moderation flow
- 👥 Club rosters with role labels (Lead, Co-Lead, Team Lead, Member)

### For Organizers (Club Admins)
- 🧭 Dedicated organizer login and scoped admin controls, visible only within owned communities
- 🏗️ Atomic club creation flow (club + organizer account created together, with rollback on failure)
- 🖼️ Club branding via Cloudinary logo uploads (`ClubLogo` component shared across the app)
- 📜 Member history tracking with point-in-time snapshots
- 🗑️ Cascade-safe club deletion (removes dependent events, posts, threads, and memberships)
- 🛡️ Ownership-scoped access — organizers can only manage their own club's content

### For Platform Admins
- 📊 Live analytics dashboard (active users, engagement stats)
- 🚦 Thread/reply moderation via a dedicated **View Reports** modal
- ⚡ Real-time online-user counts and instant thread/reply updates via Socket.IO

## Tech Stack

**Frontend**
- React 18 (Create React App)
- Tailwind CSS with a custom design token system
- Axios
- Socket.IO Client
- Google OAuth (`@react-oauth/google`)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (real-time layer)
- JWT + bcrypt (auth) + Google Auth Library
- Cloudinary + Multer (media uploads)
- Redis (optional caching layer — degrades gracefully if unavailable)

**Tooling & Ops**
- Docker
- GitHub Actions (CI)
- Autocannon (load testing)

## Architecture

```
┌─────────────┐        REST + WebSocket        ┌──────────────┐
│   React     │ ─────────────────────────────► │  Express API │
│  (Frontend) │ ◄───────────────────────────── │   + Socket.IO│
└─────────────┘                                 └──────┬───────┘
                                                         │
                                        ┌────────────────┼────────────────┐
                                        ▼                ▼                ▼
                                    MongoDB          Cloudinary        Redis
                                  (Mongoose)       (media storage)   (optional cache)
```

## Project Structure

```
EvenTora/
│
├── frontend/                  # React client
│   └── src/
│       ├── components/        # UI components (posts, events, threads, media, members, common)
│       ├── screens/           # Top-level screens (Home, Communities, Calendar, Profile)
│       ├── context/           # AuthContext
│       ├── hooks/             # useClubs, useEvents, usePosts
│       └── services/          # API client
│
├── backend/                   # Node.js API server
│   └── src/
│       ├── controllers/       # Route logic
│       ├── models/            # Mongoose schemas
│       ├── routes/            # Express routers
│       ├── middleware/        # Auth, rate limiting, logging, error handling
│       ├── scripts/           # e.g. seedOrganizer.js — bootstraps organizer accounts
│       └── config/            # DB, Redis, Socket.IO setup
│
├── .github/workflows/         # CI configuration
└── README.md
```

## Roles & Permissions

| Role | Scope |
|---|---|
| **Student** | Default role on registration. Can join clubs, RSVP, post in threads, react/comment. |
| **Organizer** | Club-scoped admin. Manages their own club's events, members, media, and moderation. Created only via atomic club-creation flow or `seedOrganizer.js`. |
| **Admin** | Platform-wide. Access to analytics dashboard and cross-club moderation tools. |

> Registration is locked to student accounts at the API level — role elevation only happens through controlled, atomic flows, never via user-supplied input on public endpoints.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- Redis (optional — app runs without it)
- A Cloudinary account (for image uploads)
- A Google Cloud OAuth Client ID (for Google Sign-In)

### 1. Clone the repository

```bash
git clone https://github.com/bhoomikamannur/EvenTora.git
cd EvenTora
```

### 2. Backend setup

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

## Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

Create a `.env` file inside `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

> A `.env.example` is planned but not yet committed — see [Known Limitations](#known-limitations--roadmap).

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with verified student email |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/clubs` | List all clubs |
| POST | `/api/clubs` | Create a club (organizer + club, atomic) |
| POST | `/api/clubs/:id/join` | Join a club |
| DELETE | `/api/clubs/:id` | Delete a club (cascade delete) |
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create a post (Cloudinary image upload) |
| POST | `/api/posts/:id/like` | Like a post |
| GET | `/api/events` | Get all events |
| POST | `/api/events/:id/rsvp` | RSVP to an event |
| GET | `/api/clubs/:clubId/threads` | Get club discussion threads |
| POST | `/api/threads/:id/reply` | Reply to a thread |
| POST | `/api/threads/:id/report` | Report a thread |
| GET | `/api/admin/analytics` | Platform analytics (admin only) |
| GET | `/api/health` | Service health check |

Full route list lives in `backend/src/routes/`.

## Real-Time Events (Socket.IO)

| Event | Direction | Description |
|---|---|---|
| `join-community` / `leave-community` | client → server | Join/leave a club's live room |
| `online-count` | server → client | Live count of users viewing a club's threads |
| `new-thread` / `thread-added` | both | Broadcast a newly created thread |
| `new-reply` / `reply-added` | both | Broadcast a new reply |
| `thread-liked` / `thread-like-updated` | both | Live like-count sync on threads |
| `reply-liked` / `reply-like-updated` | both | Live like-count sync on replies |
| `rsvp-updated` | both | Live RSVP count sync on events |

## Design System

Eventora uses a warm, editorial visual identity:

| Token | Value | Usage |
|---|---|---|
| Canvas | `#FAF3EA` | Background (warm ivory) |
| Brand | `#6B4A63` | Primary brand color (deep plum) |
| Highlight | `#E8A33D` | Accents, highlights (amber) |
| Confirmed | `#7A9B76` | Success / confirmed states (sage green) |

**Typography:** [Fraunces](https://fonts.google.com/specimen/Fraunces) for headings, [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) for body text — both via Google Fonts.

## Author

**23BCS030 — Bhoomika Mannur**
IIIT Dharwad

## License

No license currently specified. All rights reserved by the author unless stated otherwise.
