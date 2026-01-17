# 🎓 SkillSync

## Skill-Learning Platform

SkillSync is a modern, full-stack skill-learning platform designed to help users learn, practice, and master new skills through structured courses, progress tracking, and practice sessions.

---

## 🎯 Features

✅ **User Management** - Create accounts, manage profiles
✅ **Skill Tracking** - Track progress across different skills
✅ **Structured Courses** - Learn through organized courses
✅ **Practice Sessions** - Regular practice with performance tracking
✅ **Progress Monitoring** - Visual progress indicators and analytics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Backend | Express.js 5 |
| Database | PostgreSQL 14+ |
| Styling | Tailwind CSS |
| Runtime | Node.js |

---

## 📦 What's Included

### Frontend
- React components with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- ESLint for code quality

### Backend
- Express.js API server
- PostgreSQL connection pooling
- User management endpoints
- Health check monitoring
- Error handling middleware

### Database
- User management tables
- Skill and course data
- Progress tracking
- Practice session records

---

## 🚀 Quick Start

### One-Time Setup (15 minutes)

1. **Install PostgreSQL** - https://www.postgresql.org/download/
2. **Create Database**
   ```bash
   psql -U postgres
   CREATE DATABASE skillsync;
   ```

3. **Setup Environment**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your PostgreSQL password
   ```

4. **Initialize Database**
   ```bash
   psql -U postgres -d skillsync -f src/migrations/init.sql
   ```

### Running (5 minutes)

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

**Browser:**
Visit http://localhost:5173

---

## 📁 Project Structure

```
SkillSync/
├── client/                  React Frontend
│   ├── src/
│   │   ├── components/      Reusable components
│   │   ├── pages/           Page components
│   │   ├── hooks/           Custom hooks
│   │   ├── utils/           Helper functions
│   │   ├── services/        API calls
│   │   ├── constants/       App constants
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
│
├── server/                  Express Backend
│   ├── src/
│   │   ├── config/          Database config
│   │   ├── routes/          API routes
│   │   ├── controllers/     Business logic
│   │   ├── migrations/      Database schema
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── Documentation/           Comprehensive guides
    ├── RUN_PROJECT.md      How to run
    ├── SETUP_GUIDE.md      Detailed setup
    ├── ARCHITECTURE.md     System design
    ├── QUICK_START.md      Quick reference
    ├── INDEX.md            Documentation index
    └── SETUP_SUMMARY.md    Summary
```

---

## 📚 Documentation

- **[RUN_PROJECT.md](./RUN_PROJECT.md)** - Step-by-step how to run
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and data flow
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference guide
- **[INDEX.md](./INDEX.md)** - Documentation navigation
- **[SETUP_SUMMARY.md](./SETUP_SUMMARY.md)** - What's included summary

---

## 🔗 API Endpoints

```
GET    /api/health              Health check
GET    /api/users               List all users
POST   /api/users               Create user
GET    /api/users/:id           Get user details
PUT    /api/users/:id           Update user
DELETE /api/users/:id           Delete user
```

---

## 🗄️ Database Schema

### Tables
- **users** - User accounts and profiles
- **skills** - Available skills
- **user_skills** - User skill progress
- **courses** - Learning courses
- **practice_sessions** - Practice activity tracking

---

## 🔧 Environment Variables

### Server (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=skillsync
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret_key
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=SkillSync
VITE_APP_VERSION=1.0.0
```

---

## 💻 Development Commands

### Backend
```bash
npm install      # Install dependencies
npm run dev      # Start with auto-reload
npm start        # Production start
```

### Frontend
```bash
npm install      # Install dependencies
npm run dev      # Development server
npm run build    # Build for production
```

---

## 🧪 Testing the API

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

## 🎓 Learning Path

1. **Get it running** - Follow [RUN_PROJECT.md](./RUN_PROJECT.md)
2. **Understand structure** - Read [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Explore code** - Look at examples in components and routes
4. **Make changes** - Edit files and see auto-reload
5. **Add features** - Create new endpoints and components
6. **Deploy** - Follow deployment guides

---

## 📊 Project Features

- ✅ Professional folder structure
- ✅ PostgreSQL integration
- ✅ RESTful API design
- ✅ React best practices
- ✅ Auto-reload development
- ✅ Database migrations
- ✅ Error handling
- ✅ CORS configured
- ✅ JWT ready
- ✅ Comprehensive documentation

---

## 🐛 Troubleshooting

**PostgreSQL error?**
→ See [SETUP_GUIDE.md#Troubleshooting](./SETUP_GUIDE.md#troubleshooting-guide)

**How to run?**
→ See [RUN_PROJECT.md](./RUN_PROJECT.md)

**Want to understand architecture?**
→ Read [ARCHITECTURE.md](./ARCHITECTURE.md)

**Need quick reference?**
→ Check [QUICK_START.md](./QUICK_START.md)

---

## 🌐 Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |

---

## 📝 Environment Setup

### Windows
- Node.js: https://nodejs.org/
- PostgreSQL: https://www.postgresql.org/download/windows/

### macOS
```bash
brew install node postgresql
```

### Linux
```bash
sudo apt install nodejs npm postgresql
```

---

## 🚀 Deployment

### Frontend
- Build: `npm run build`
- Deploy to: Vercel, Netlify, or your hosting

### Backend
- Deploy to: Heroku, Railway, or your server
- Database: AWS RDS, DigitalOcean, or self-hosted

---

## 📄 License

This project is open source.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📞 Support

- 📖 Read the documentation in this folder
- 🐛 Check troubleshooting section
- 💬 Review the examples in the code

---

## ✨ Key Features

- **Fast Development** - Vite auto-reload, Nodemon auto-restart
- **Professional Structure** - Organized folders and clear separation
- **Database Ready** - PostgreSQL with migration system
- **API Examples** - User CRUD endpoints ready to extend
- **Documentation** - 6 comprehensive guides included

---

## 🎯 Next Steps

1. **Read** [RUN_PROJECT.md](./RUN_PROJECT.md) (5 min)
2. **Follow** setup steps (15 min)
3. **Start servers** (2 min)
4. **Start building!** 🚀

---

## 📈 Project Progress

- ✅ Project structure created
- ✅ Frontend configured
- ✅ Backend configured
- ✅ Database schema defined
- ✅ Example endpoints created
- ✅ Documentation completed
- 🚀 Ready to build!

---

**Welcome to SkillSync! Start building amazing features! 💪**

For detailed instructions, read [RUN_PROJECT.md](./RUN_PROJECT.md)
