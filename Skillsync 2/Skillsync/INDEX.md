# 📖 SkillSync Documentation Index

## 🎯 Getting Started

### Choose Your Learning Style:

**"Just give me commands"**
→ [RUN_PROJECT.md](./RUN_PROJECT.md) (5 min)

**"I want step-by-step details"**
→ [SETUP_GUIDE.md](./SETUP_GUIDE.md) (20 min)

**"I like diagrams and visuals"**
→ [ARCHITECTURE.md](./ARCHITECTURE.md) (15 min)

**"I need quick reference"**
→ [QUICK_START.md](./QUICK_START.md) (10 min)

---

## 📚 All Documentation Files

| File | Purpose | Best For | Time |
|------|---------|----------|------|
| **RUN_PROJECT.md** | How to run everything | Quick setup | 5 min |
| **SETUP_GUIDE.md** | Detailed setup steps | Understanding | 20 min |
| **ARCHITECTURE.md** | System design & flow | Learning | 15 min |
| **QUICK_START.md** | Quick reference | Beginners | 10 min |
| **server/README.md** | Server documentation | Backend devs | 5 min |
| **client/README.md** | Client documentation | Frontend devs | 5 min |

---

## 🚀 Quick Start (3 Steps)

### 1. Install PostgreSQL
Download from: https://www.postgresql.org/download/

### 2. Create Database
```bash
psql -U postgres
CREATE DATABASE skillsync;
\q
```

### 3. Run Servers
```bash
# Terminal 1
cd server && npm install && npm run dev

# Terminal 2
cd client && npm install && npm run dev

# Browser: http://localhost:5173
```

---

## 📁 Project Structure

```
SkillSync/
├── client/          React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── ...
│   └── package.json
├── server/          Express Backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── config/
│   │   └── ...
│   └── package.json
└── Documentation/
    ├── RUN_PROJECT.md
    ├── SETUP_GUIDE.md
    └── ARCHITECTURE.md
```

---

## ✅ Checklist

Before running, ensure:
- [ ] PostgreSQL installed
- [ ] `skillsync` database created
- [ ] Node.js installed
- [ ] Choose a documentation guide above

---

## 🎓 Learning Path

### Beginner
1. Read [QUICK_START.md](./QUICK_START.md)
2. Get it running
3. Explore the code

### Intermediate
1. Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Understand each component
3. Create new features

### Advanced
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Understand data flow
3. Deploy to production

---

## 🔧 Key Commands

### Backend
```bash
npm install     # Install dependencies
npm run dev     # Start with auto-reload
npm start       # Production start
```

### Frontend
```bash
npm install     # Install dependencies
npm run dev     # Start dev server
npm run build   # Build for production
```

### Database
```bash
psql -U postgres -d skillsync
\dt             # List tables
\q              # Exit
```

---

## 🌐 Ports & URLs

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 5000 | http://localhost:5000 |
| API Health | 5000 | http://localhost:5000/api/health |
| PostgreSQL | 5432 | localhost:5432 |

---

## 🐛 Troubleshooting

### PostgreSQL Issues
→ See [SETUP_GUIDE.md](./SETUP_GUIDE.md#Troubleshooting)

### Running Issues
→ See [RUN_PROJECT.md](./RUN_PROJECT.md#Common-Issues)

### Architecture Questions
→ See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 📞 Quick Help

**"I'm stuck"**
→ Start with [QUICK_START.md](./QUICK_START.md)

**"I want details"**
→ Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)

**"I want to understand"**
→ Read [ARCHITECTURE.md](./ARCHITECTURE.md)

**"I need quick reference"**
→ Bookmark this file!

---

## 🎉 Next Steps

1. **Pick a guide** from above
2. **Follow the steps** in your chosen guide
3. **Get it running** (takes 30 minutes)
4. **Start building!**

---

**Ready? Choose a guide above and start! 🚀**
