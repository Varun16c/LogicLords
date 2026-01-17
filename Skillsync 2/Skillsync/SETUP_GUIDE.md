# 📌 SkillSync Setup Guide - Complete

## 🎉 What is SkillSync?

SkillSync is a modern, skill-learning platform built with:
- **Frontend**: React 19 + Vite
- **Backend**: Express.js + PostgreSQL
- **Database**: PostgreSQL 14+

Complete with structured folder organization and best practices!

---

## 📋 Prerequisites

- Node.js (v16+): https://nodejs.org/
- PostgreSQL (v14+): https://www.postgresql.org/download/
- Text Editor (VS Code recommended)

---

## 🔧 Installation Steps

### Step 1: Install PostgreSQL (15 min)

**Windows:**
1. Download: https://www.postgresql.org/download/windows/
2. Run installer
3. Set password: `postgres123` (or your choice)
4. Keep port: 5432
5. Finish

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

### Step 2: Create Database (2 min)

```bash
psql -U postgres
CREATE DATABASE skillsync;
\q
```

### Step 3: Setup Server Environment (5 min)

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres123        # Your PostgreSQL password
DB_NAME=skillsync
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret_key_here
```

### Step 4: Install Dependencies (5 min each)

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### Step 5: Initialize Database (2 min)

```bash
cd server
psql -U postgres -d skillsync -f src/migrations/init.sql
```

---

## 🚀 Running SkillSync

### Terminal 1: Start Backend

```bash
cd server
npm run dev
```

**Wait for:**
```
✅ PostgreSQL Connected
🚀 SkillSync Server running on http://localhost:5000
```

### Terminal 2: Start Frontend

```bash
cd client
npm run dev
```

**Wait for:**
```
➜ Local: http://localhost:5173/
```

### Step 3: Open Browser

Visit: **http://localhost:5173**

You should see the SkillSync welcome page!

---

## ✅ Verification Checklist

- [ ] PostgreSQL running
- [ ] `skillsync` database created
- [ ] `server/.env` file with correct password
- [ ] Backend shows: `✅ PostgreSQL Connected`
- [ ] Backend running on: http://localhost:5000
- [ ] Frontend running on: http://localhost:5173
- [ ] Browser shows welcome page
- [ ] Can access: http://localhost:5000/api/health

---

## 📁 Project Structure Explained

### Frontend (React)
```
client/
├── src/
│   ├── components/    ← Reusable UI components
│   ├── pages/         ← Full page views
│   ├── hooks/         ← Custom React hooks
│   ├── utils/         ← Helper functions
│   ├── services/      ← API calls
│   ├── constants/     ← App constants
│   ├── App.jsx        ← Main component
│   └── main.jsx       ← Entry point
├── vite.config.js     ← Vite configuration
└── package.json       ← Dependencies
```

### Backend (Express)
```
server/
├── src/
│   ├── config/
│   │   └── db.js      ← PostgreSQL connection
│   ├── routes/        ← API endpoint definitions
│   ├── controllers/   ← Business logic
│   ├── migrations/
│   │   └── init.sql   ← Database schema
│   ├── app.js         ← Express setup
│   └── server.js      ← Start point
├── .env.example       ← Configuration template
└── package.json       ← Dependencies
```

---

## 🗄️ Database Schema

### Tables Created:
- **users** - User accounts and profiles
- **skills** - Available skills to learn
- **user_skills** - Track user skill progress
- **courses** - Learning courses
- **practice_sessions** - Track practice activity

### Key Fields:
- users: id, email, password, first_name, last_name
- skills: id, name, category, difficulty_level
- user_skills: user_id, skill_id, progress_percentage
- courses: title, skill_id, instructor_id, duration
- practice_sessions: user_id, skill_id, performance_score

---

## 🔗 API Endpoints Available

### Users
```
GET    /api/users                Get all users
POST   /api/users                Create user
GET    /api/users/:id            Get user by ID
PUT    /api/users/:id            Update user
DELETE /api/users/:id            Delete user
```

### Health Check
```
GET    /api/health               Check API status
```

---

## 🧪 Testing the API

### Using curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Get users
curl http://localhost:5000/api/users

# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"test123",
    "first_name":"John",
    "last_name":"Doe"
  }'
```

### Using Postman:
1. Download: https://www.postman.com/downloads/
2. New Request → GET → http://localhost:5000/api/health
3. Send

---

## 🐛 Troubleshooting Guide

### Problem: "Connection refused" or PostgreSQL error
**Reason:** PostgreSQL not running

**Solution:**
- **Windows:** Check Services → postgresql
- **macOS:** `brew services start postgresql@15`
- **Linux:** `sudo service postgresql start`

### Problem: "Password authentication failed"
**Reason:** Wrong password in .env

**Solution:**
1. Check your PostgreSQL password
2. Update DB_PASSWORD in .env
3. Restart backend

### Problem: "Database skillsync does not exist"
**Reason:** Database not created

**Solution:**
```bash
psql -U postgres
CREATE DATABASE skillsync;
```

### Problem: "Port 5000 already in use"
**Reason:** Something else using port

**Solution:**
- Change PORT in .env (try 5001)
- Or kill process using port 5000

### Problem: "npm ERR! missing script"
**Reason:** Dependencies not installed

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Development Workflow

### Making Changes

#### React Components (Auto-reload)
1. Edit file in `client/src/`
2. Save
3. Browser auto-refreshes ✅

#### Express Routes (Auto-restart)
1. Edit file in `server/src/`
2. Save
3. Server auto-restarts ✅

#### Database Schema
1. Edit `server/src/migrations/init.sql`
2. Run: `psql -U postgres -d skillsync -f src/migrations/init.sql`
3. Restart backend

---

## 🔑 Key Files to Edit

| File | Edit For | Don't Forget |
|------|----------|-------------|
| `client/src/App.jsx` | UI changes | Save to auto-reload |
| `client/src/components/` | New components | Create proper folder structure |
| `server/src/routes/` | New API endpoints | Import routes in app.js |
| `server/src/controllers/` | Business logic | Use database pool |
| `server/src/migrations/init.sql` | Database schema | Run migration to apply |
| `server/.env` | Configuration | Never commit to git |

---

## 🎯 Next Steps After Setup

### 1. Explore the Code
- Look at existing components
- Understand the API structure
- Check database schema

### 2. Make a Small Change
- Edit App.jsx welcome message
- Change a style
- See it auto-reload

### 3. Create New Feature
- Create new API endpoint
- Create new database table
- Create React component
- Connect them together

### 4. Deploy
- Build frontend: `npm run build`
- Deploy to Vercel/Netlify
- Deploy backend to Heroku/Railway
- Setup PostgreSQL on cloud

---

## 📞 Resources

| Topic | Link |
|-------|------|
| PostgreSQL | https://www.postgresql.org/docs/ |
| Express.js | https://expressjs.com/ |
| React | https://react.dev/ |
| Vite | https://vitejs.dev/ |
| Node.js | https://nodejs.org/docs/ |

---

## ✨ Summary

You now have:
✅ Professional project structure
✅ PostgreSQL database setup
✅ Express API with examples
✅ React frontend ready
✅ Auto-reload development tools
✅ Database migration system

**Everything is configured and ready to go!**

---

## 🎉 Final Checklist

Before you start building:

- [ ] PostgreSQL installed and running
- [ ] `skillsync` database created
- [ ] `server/.env` file created with password
- [ ] `npm install` done in both folders
- [ ] Database tables initialized
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can see welcome page in browser
- [ ] Can access /api/health endpoint

**All checked? You're ready to build SkillSync! 🚀**

---

## 📖 Documentation Files

For more help, check:
- [RUN_PROJECT.md](./RUN_PROJECT.md) - Quick commands
- [QUICK_START.md](./QUICK_START.md) - Quick reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [INDEX.md](./INDEX.md) - Documentation index

---

**Happy building with SkillSync! 💪**
