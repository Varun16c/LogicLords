# SkillSync Server

Node.js Express API server with PostgreSQL for SkillSync

## Setup

1. Install dependencies: `npm install`
2. Create `.env` file from `.env.example`
3. Setup PostgreSQL database
4. Run migrations

## Start Server

Development: `npm run dev`
Production: `npm start`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Database

PostgreSQL with these tables:
- users
- skills
- user_skills
- courses
- practice_sessions

## Configuration

Environment variables in `.env`:
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- PORT
- CLIENT_URL
- JWT_SECRET
