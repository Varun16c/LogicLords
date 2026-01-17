# 🎯 SkillSync - Quick Start Guide

## What is SkillSync?

SkillSync is a modern skill-learning platform where users can:
- Learn new skills through structured courses
- Track their progress
- Practice regularly
- Achieve proficiency in various domains

---

## 📋 One-Time Setup

### 1️⃣ Install PostgreSQL
- Download: https://www.postgresql.org/download/
- Install and remember your password

### 2️⃣ Create Database
```bash
psql -U postgres
CREATE DATABASE skillsync;
\q
```

### 3️⃣ Create .env File
```bash
cd server
cp .env.example .env
# Edit .env and set DB_PASSWORD = your_postgresql_password
```

### 4️⃣ Initialize Database
```bash
psql -U postgres -d skillsync -f src/migrations/init.sql
```

---

## 🚀 Running SkillSync

### Terminal 1: Backend
```bash
cd server
npm install
npm run dev
```

**Expected:** `✅ PostgreSQL Connected`

### Terminal 2: Frontend
```bash
cd client
npm install
npm run dev
```

**Expected:** `➜ Local: http://localhost:5173/`

### Open Browser
Visit: http://localhost:5173

---

## ✅ Verify Setup

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] Database connected (check terminal)
- [ ] Can see welcome page

---

## 📁 Project Structure

```
SkillSync/
├── client/                React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── server/                Express Backend
│   ├── src/
│   │   ├── config/db.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── Documentation Files
```

---

## 🔗 API Endpoints

### Health Check
```
GET http://localhost:5000/api/health
```

### Users
```
GET /api/users              - Get all users
POST /api/users             - Create user
GET /api/users/:id          - Get user by ID
PUT /api/users/:id          - Update user
DELETE /api/users/:id       - Delete user
```

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| PostgreSQL connection error | Check DB_PASSWORD in .env |
| Port 5000 in use | Change PORT in .env |
| npm install error | Delete node_modules, reinstall |
| Database doesn't exist | Run: CREATE DATABASE skillsync; |

---

## 📚 Next Steps

1. Explore the code
2. Read about the database schema
3. Create new API endpoints
4. Build React components
5. Start building features!

**Ready? Start the servers and open your browser!** 🎉
