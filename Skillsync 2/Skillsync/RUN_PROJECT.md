# 🚀 SkillSync - How to Run

## TL;DR (Quick Commands)

```bash
# Terminal 1 - Backend
cd server && npm install && npm run dev

# Terminal 2 - Frontend
cd client && npm install && npm run dev

# Browser
http://localhost:5173
```

**But first:** Install PostgreSQL, create database, setup .env file

---

## 📋 Step-by-Step Setup

### Step 1: Install PostgreSQL (10 min)
- Download: https://www.postgresql.org/download/
- Run installer
- Password: `postgres123` (or your choice)

### Step 2: Create Database (2 min)
```bash
psql -U postgres
CREATE DATABASE skillsync;
\q
```

### Step 3: Setup Server (5 min)
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
DB_PASSWORD=postgres123
DB_NAME=skillsync
```

### Step 4: Initialize Database (1 min)
```bash
psql -U postgres -d skillsync -f src/migrations/init.sql
```

### Step 5: Install Dependencies (5 min)
```bash
cd server && npm install
cd ../client && npm install
```

### Step 6: Run Servers

**Terminal 1:**
```bash
cd server && npm run dev
```

**Terminal 2:**
```bash
cd client && npm run dev
```

### Step 7: Open Browser
Visit: http://localhost:5173

---

## ✅ Success Checklist

- [ ] PostgreSQL installed and running
- [ ] `skillsync` database created
- [ ] `server/.env` exists with DB_PASSWORD
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can see SkillSync welcome page
- [ ] http://localhost:5000/api/health works

---

## 🔧 Key Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_USER | postgres | PostgreSQL user |
| DB_PASSWORD | postgres123 | Your password |
| DB_NAME | skillsync | Database name |
| PORT | 5000 | Backend port |

---

## 📱 Running the App

### Development Mode
Both servers auto-reload on file save:
- React: Vite auto-reloads
- Express: Nodemon auto-restarts

### Testing API
```bash
# Health check
curl http://localhost:5000/api/health

# Get users
curl http://localhost:5000/api/users

# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"test123","first_name":"John","last_name":"Doe"}'
```

---

## 🎯 Project Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |

---

## 🐛 Common Issues & Fixes

### "Connection refused"
→ Start PostgreSQL service

### "Database doesn't exist"
→ Run: `CREATE DATABASE skillsync;`

### "Wrong password"
→ Check DB_PASSWORD in .env

### "Port already in use"
→ Change PORT in server/.env

### "npm ERR!"
→ Delete node_modules, run npm install

---

## 📚 Documentation

- `QUICK_START.md` - This file
- `SETUP_GUIDE.md` - Detailed setup
- `ARCHITECTURE.md` - System design
- `INDEX.md` - Documentation index

---

## 🚀 Next Steps

1. **Get it running** (follow above)
2. **Explore code** (look at client/src and server/src)
3. **Make changes** (edit files, see auto-reload)
4. **Build features** (create new endpoints, components)

---

## 📞 Quick Help

**Still stuck?** 
→ Check SETUP_GUIDE.md for more details

**Want to understand architecture?**
→ Read ARCHITECTURE.md

**Confused about structure?**
→ Read INDEX.md

---

**Ready to build? Start the servers! 🎉**
