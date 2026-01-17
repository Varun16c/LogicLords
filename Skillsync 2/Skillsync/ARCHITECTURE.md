# 🏗️ SkillSync Architecture

## System Overview

```
┌─────────────────────────────────────┐
│      SkillSync Application           │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐   ┌────────────┐ │
│  │  Frontend    │   │  Backend   │ │
│  │  (React)     │◄─►│ (Express)  │ │
│  │  Port 5173   │   │ Port 5000  │ │
│  └──────────────┘   └────────────┘ │
│                          │          │
│                          │ SQL      │
│                    ┌─────▼────┐    │
│                    │PostgreSQL │    │
│                    │Port 5432  │    │
│                    └───────────┘    │
│                                     │
└─────────────────────────────────────┘
```

---

## Data Model

```
users
├── id (PK)
├── email (UNIQUE)
├── password
├── first_name
├── last_name
├── profile_image
├── bio
├── created_at
└── updated_at

skills
├── id (PK)
├── name
├── description
├── category
├── difficulty_level
└── created_at

user_skills (tracks user progress)
├── id (PK)
├── user_id (FK → users)
├── skill_id (FK → skills)
├── proficiency_level
├── progress_percentage
├── started_at
└── completed_at

courses
├── id (PK)
├── title
├── description
├── skill_id (FK → skills)
├── instructor_id (FK → users)
├── duration_hours
├── difficulty_level
├── created_at
└── updated_at

practice_sessions
├── id (PK)
├── user_id (FK → users)
├── skill_id (FK → skills)
├── duration_minutes
├── completed_at
└── performance_score
```

---

## Request Flow

```
Browser User
    ↓
React Component
    ↓ (axios/fetch)
Express Route
    ↓
Controller Function
    ↓
PostgreSQL Query
    ↓
Database
    ↓ (result)
Express Response (JSON)
    ↓
React Updates State
    ↓
Browser Re-renders
    ↓
User Sees Update
```

---

## Folder Structure

### Frontend (client/)
```
client/
├── src/
│   ├── components/    # Reusable UI pieces
│   ├── pages/         # Full page views
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Helper functions
│   ├── services/      # API calls
│   ├── constants/     # Constants & routes
│   ├── context/       # Global state
│   ├── layouts/       # Layout wrappers
│   ├── assets/        # Images, fonts
│   ├── App.jsx        # Root component
│   └── main.jsx       # Entry point
├── vite.config.js     # Vite configuration
├── package.json
└── index.html
```

### Backend (server/)
```
server/
├── src/
│   ├── config/db.js       # Database connection
│   ├── routes/            # API endpoint definitions
│   ├── controllers/       # Business logic
│   ├── migrations/        # Database schema
│   ├── app.js             # Express app setup
│   └── server.js          # Start server
├── .env.example           # Configuration template
├── package.json
└── README.md
```

---

## API Endpoints

### Users
```
GET    /api/users              Get all users
POST   /api/users              Create user
GET    /api/users/:id          Get user by ID
PUT    /api/users/:id          Update user
DELETE /api/users/:id          Delete user
```

### Health Check
```
GET    /api/health             Server health
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React | 19.1.1 | UI Framework |
| Build | Vite | 7.1.2 | Fast Build |
| Backend | Express | 5.1.0 | Web Framework |
| Database | PostgreSQL | 14+ | Data Storage |
| Driver | pg | 8.11.3 | Node.js → PostgreSQL |

---

## Development Workflow

### Hot Reload
- **React**: Save → Vite auto-refreshes browser
- **Express**: Save → Nodemon auto-restarts server
- **Database**: Edit migration → Re-run → Restart server

### Making Changes
1. **UI Changes** → Edit in `client/src/` → Auto-reload
2. **API Changes** → Edit in `server/src/` → Auto-restart
3. **Database** → Edit `init.sql` → Rerun → Restart

---

## Data Flow Example: Creating a User

```
1. User fills form in React
   ↓
2. Component calls: axios.post('/api/users', userData)
   ↓
3. Express receives POST /api/users
   ↓
4. Route calls: createUser(req, res)
   ↓
5. Controller validates & prepares data
   ↓
6. Executes SQL: INSERT INTO users (...)
   ↓
7. PostgreSQL creates new row
   ↓
8. Returns user object as JSON
   ↓
9. React receives response
   ↓
10. Component updates state
   ↓
11. Browser re-renders with new user
   ↓
12. User sees success message
```

---

## Key Features

✅ User Management
✅ Skill Tracking
✅ Course Structure
✅ Practice Sessions
✅ Progress Monitoring

---

## Security Features

✅ Environment variables for secrets
✅ CORS configured
✅ Input validation ready
✅ Error handling
✅ Password hashing support (bcryptjs)
✅ JWT ready

---

## Performance Features

✅ Database connection pooling
✅ Code splitting (Vite)
✅ Indexed database queries
✅ Component-based architecture
✅ Route separation

---

## Deployment Architecture

```
Production Setup
│
├─ Frontend (Vercel/Netlify)
│  └─ Static site with React
│
├─ Backend (Heroku/Railway)
│  └─ Node.js + Express
│
└─ Database (AWS RDS/DigitalOcean)
   └─ PostgreSQL
```

---

## Next Steps

1. **Get it running** → See RUN_PROJECT.md
2. **Explore code** → Look at examples
3. **Build features** → Add new endpoints
4. **Deploy** → Push to production

---

**Understand the architecture now?** Start building! 🚀
