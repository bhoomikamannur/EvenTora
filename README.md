# Eventora

A scalable community platform for college clubs to publish events, announcements, and updates. Eventora enables students to discover campus activities while providing clubs with tools to manage and moderate content.

## Architecture

Eventora follows a MERN-based architecture with separate frontend and backend services.

* **Frontend:** React application for user interaction
* **Backend:** Node.js + Express REST API
* **Database:** MongoDB
* **Caching:** Redis (for frequently accessed event data)

```
Eventora
│
├── frontend/      # React client
├── backend/       # Node.js API server
└── README.md
```

## Features

* User authentication and authorization
* Role-based access (admin, club, student)
* Event creation and management
* Event discovery for students
* RESTful API architecture
* Redis caching for improved response latency
* API rate limiting to prevent abuse
* Structured logging for observability
* Health check endpoint for monitoring

## Tech Stack

**Frontend**

* React
* JavaScript
* Axios

**Backend**

* Node.js
* Express
* MongoDB (Mongoose)
* Redis

**Tools**

* Git
* Postman
* Autocannon (load testing)

## Setup Instructions

### 1. Clone the Repository

```
git clone https://github.com/<your-username>/eventora.git
cd eventora
```

### 2. Backend Setup

```
cd backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret
```

Start the backend server:

```
npm start
```

### 3. Frontend Setup

```
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`.

## API Highlights

### Get All Events

```
GET /api/events
```

Returns a list of all available events. Frequently accessed results are cached using Redis.

### Health Check

```
GET /health
```

Returns the service status and timestamp.

## Performance Optimizations

* **Redis Caching:** Reduces database load for frequently requested event data
* **Rate Limiting:** Prevents API abuse and protects backend resources
* **Structured Logging:** Enables easier debugging and observability

## Load Testing

The backend APIs were tested using Autocannon to simulate concurrent traffic.

Example:

```
npx autocannon -c 100 -d 10 http://localhost:5000/api/events
```

## System Architecture

```
Client (Browser)
      │
      ▼
React Frontend (UI)
      │
      ▼
Node.js + Express API Layer
      │
 ┌────┴───────────┐
 ▼                ▼
MongoDB        Redis Cache
(Database)   (Fast in‑memory cache)
```

**Flow:**

1. User interacts with the React frontend.
2. Frontend sends requests to the Express backend via REST APIs.
3. Backend checks Redis cache for frequently requested data.
4. If cache miss occurs, data is retrieved from MongoDB.
5. Results are returned to the client and optionally cached for future requests.

This architecture helps reduce database load and improve response time for high‑traffic endpoints.

## API Overview

| Method | Endpoint        | Description            |
| ------ | --------------- | ---------------------- |
| GET    | /api/events     | Fetch all events       |
| GET    | /api/events/:id | Fetch a specific event |
| POST   | /api/events     | Create a new event     |
| PUT    | /api/events/:id | Update event details   |
| DELETE | /api/events/:id | Delete an event        |
| GET    | /health         | Service health check   |

## Performance & Scalability Features

* **Redis Caching:** Frequently requested event data is cached to reduce database queries.
* **Rate Limiting:** Protects the API from abuse by restricting excessive requests.
* **Structured Logging:** Logs request metadata for debugging and observability.
* **Load Testing:** Autocannon used to simulate concurrent traffic and analyze system behavior.

## Load Testing

Example command used to simulate concurrent requests:

```
npx autocannon -c 100 -d 10 http://localhost:5000/api/events
```

This simulates 100 concurrent users hitting the API for 10 seconds to evaluate system performance.

## Future Improvements

* Docker containerization for easier deployment
* CI/CD pipeline with GitHub Actions
* CDN integration for static assets
* Advanced search and filtering
* Event recommendation system
* Horizontal scaling with load balancers

## Author

**Bhoomika Mannur**
Computer Science Engineering Undergraduate
