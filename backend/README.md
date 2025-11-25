# Eventora Backend API

RESTful API for Eventora college communities platform.

## Quick Start
```bash
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication Required
Most endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Endpoints
See main README.md for complete API documentation.

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node src/utils/seedData.js` - Seed database with sample data