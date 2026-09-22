# Smart Insurance Claim Processing and Settlement Management System

College project — full-stack MERN application for managing the insurance claim lifecycle.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + React Router + Axios
- Backend: Node.js + Express.js (REST API)
- Database: MongoDB Atlas + Mongoose
- Auth: JWT + bcrypt

## Project Structure
```
insurance-claim-system/
├── backend/
├── frontend/
└── README.md
```

## Setup

### 1. Backend
```
cd backend
npm install
cp .env.example .env   # then fill in MONGODB_URI and JWT_SECRET
npm run dev
```
Backend runs at http://localhost:5000

### 2. Frontend
```
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173

The Vite dev server proxies `/api` requests to the backend, so no CORS setup is needed during development.

## Milestone 1 Status
- [x] Root project structure created
- [x] Backend Express server with health check route
- [x] Frontend React + Vite + Tailwind configured
- [x] Landing page pings backend `/api/health`
- [ ] MongoDB connection (Milestone 2)
- [ ] Authentication (Milestone 3)

## Note on this environment
Files were generated in an environment without internet access, so `npm install` was not run here. You'll need to run `npm install` in both `backend/` and `frontend/` on your own machine before starting either server.
