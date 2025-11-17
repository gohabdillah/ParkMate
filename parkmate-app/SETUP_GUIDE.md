# 🚀 Quick Start Guide - ParkMate

This guide will help you get the ParkMate application running on your local machine in under 10 minutes.

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js 18+** installed ([Download here](https://nodejs.org/))
- [ ] **PostgreSQL 13+** installed ([Download here](https://www.postgresql.org/download/))
- [ ] **Redis** installed ([Download here](https://redis.io/download))
- [ ] **Git** installed
- [ ] A **Google Maps API key** ([Get one here](https://developers.google.com/maps/documentation/javascript/get-api-key))

**OR for Docker:**
- [ ] **Docker Desktop** installed and running ([Download here](https://www.docker.com/products/docker-desktop))

## 🎯 Option 1: Docker Quick Start (Easiest - Recommended)

**Note:** For Docker setup, see [DOCKER_README.md](DOCKER_README.md) for the complete guide.

### Quick Docker Steps:

```bash
cd parkmate-app

# Kill any local servers using the ports
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start all services
docker-compose up -d

# Watch logs
docker-compose logs -f
```

### Access the application

Wait for all services to be healthy (30-60 seconds), then open:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Docs**: http://localhost:5001/api-docs
- **Health Check**: http://localhost:5001/health

### Import Carpark Data (Optional)
```bash
./docker-import-carparks.sh
```

### Stop the application
```bash
docker-compose down
```

For troubleshooting and advanced Docker setup, see [DOCKER_README.md](DOCKER_README.md).

## 💻 Option 2: Manual Setup (For Development)

### Step 1: Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Create database:**
```bash
# Create database
createdb parkmate_db

# Create uuid extension (required)
psql parkmate_db -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

**Set up database user (if needed):**
```bash
# Create a user (optional, can use default postgres user)
psql postgres -c "CREATE USER your_username WITH PASSWORD 'your_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE parkmate_db TO your_username;"
```

### Step 2: Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

### Step 3: Set up Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Important fields to update:
#   DB_USER=your_username (or postgres)
#   DB_PASSWORD=your_password (leave empty if using default postgres user)
#   JWT_SECRET=change_this_to_a_random_string
#   JWT_REFRESH_SECRET=change_this_to_another_random_string
#   GOOGLE_MAPS_API_KEY=your_actual_api_key
#   EMAIL_USER=your_email@gmail.com (for password reset emails)
#   EMAIL_PASSWORD=your_app_password

# Run database schema
psql parkmate_db < src/database/schema_no_postgis.sql

# Start development server
npm run dev
```

Backend should now be running on **http://localhost:5001**

**Verify backend is running:**
```bash
curl http://localhost:5001/health
# Should return: {"success":true,"message":"Server is running",...}
```

### Step 4: Set up Frontend (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API key
# VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key
# VITE_API_BASE_URL=http://localhost:5001/api/v1

# Start development server
npm run dev
```

Frontend should now be running on **http://localhost:5173** (Vite default) or **http://localhost:3000**

**Note:** The port may vary. Check the terminal output for the actual URL.

## 🧪 Testing the Setup

### 1. Check Backend Health
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-15T..."
}
```

### 2. Test API Documentation
Open http://localhost:5001/api-docs in your browser

### 3. Test Database Connection
```bash
# Check if tables were created
psql parkmate_db -c "\dt"

# Should show: users, carparks, favorites, history, feedback, user_settings
```

### 4. Test Redis Connection
```bash
redis-cli ping
# Should return: PONG
```

### 5. Test User Registration (via API Docs or curl)
```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 6. Import Carpark Data (Optional but Recommended)
```bash
cd backend
npm run import-carparks
```

This will fetch and import ~2,000 carpark locations from Singapore's data.gov.sg API.

## 🔧 Common Issues & Solutions

### Issue: Port 5001 or 3000 already in use

**Solution:**
```bash
# Find and kill process using the port
lsof -ti :5001 | xargs kill -9  # Backend
lsof -ti :3000 | xargs kill -9  # Frontend (if applicable)
lsof -ti :5173 | xargs kill -9  # Vite dev server
```

### Issue: Database connection errors

**Solution:**
```bash
# Check PostgreSQL is running
brew services list

# Restart PostgreSQL
brew services restart postgresql@15

# Test connection
psql parkmate_db

# If connection still fails, check DB_USER and DB_PASSWORD in backend/.env
```

### Issue: Cannot connect to Redis

**Solution:**
```bash
# Check Redis is running
brew services list

# Restart Redis
brew services restart redis

# Test connection
redis-cli ping
# Should return: PONG

# If still failing, check REDIS_HOST=localhost in backend/.env
```

### Issue: "uuid-ossp" extension error

**Solution:**
```bash
# Install the extension manually
psql parkmate_db -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

### Issue: Backend builds but crashes on start

**Common causes:**
1. **Missing environment variables** - Check all required vars in `.env`
2. **Database not initialized** - Run the schema: `psql parkmate_db < src/database/schema_no_postgis.sql`
3. **Redis not running** - Start Redis: `brew services start redis`
4. **Port conflict** - Kill process using port 5001

**Check backend logs:**
```bash
# Backend outputs detailed error messages
# Look for lines starting with ❌
```

### Issue: Frontend can't connect to backend

**Solution:**
```bash
# 1. Verify backend is running
curl http://localhost:5001/health

# 2. Check CORS settings in backend/.env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# 3. Check frontend .env
VITE_API_BASE_URL=http://localhost:5001/api/v1

# 4. Clear browser cache and restart frontend
```

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

## 📝 Next Steps After Setup

1. **Import Carpark Data** (Recommended):
   ```bash
   cd backend
   npm run import-carparks
   # This imports ~2,000 Singapore carparks from data.gov.sg
   ```

2. **Explore the API Documentation**: http://localhost:5001/api-docs

3. **Test the Frontend**: 
   - Register a new user
   - Search for carparks
   - Save favorites
   - View carpark details on the map

4. **Check the project structure**: Familiarize yourself with the codebase
   - Backend: `backend/src/modules/` - Feature modules
   - Frontend: `frontend/src/features/` - Feature components

5. **Run tests** (Optional):
   ```bash
   # Backend
   cd backend && npm test
   
   # Frontend  
   cd frontend && npm test
   ```

## 🚀 Development Workflow

### Starting Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173 or http://localhost:3000
```

**Terminal 3 - Services (if running locally):**
```bash
# PostgreSQL
brew services start postgresql@15

# Redis
brew services start redis
```

### Stopping Development

```bash
# Press Ctrl+C in each terminal

# Or stop services
brew services stop postgresql@15
brew services stop redis
```

## 💡 Quick Reference

### Environment Variables

**Backend** (`backend/.env`):
- `PORT=5001` - Backend server port
- `DB_NAME=parkmate_db` - Database name
- `DB_USER` - Your database username
- `DB_PASSWORD` - Your database password
- `REDIS_HOST=localhost` - Redis host
- `GOOGLE_MAPS_API_KEY` - Your Google Maps API key
- `JWT_SECRET` - Secret for JWT tokens
- `CORS_ORIGIN` - Allowed frontend origins

**Frontend** (`frontend/.env`):
- `VITE_API_BASE_URL=http://localhost:5001/api/v1` - Backend API URL
- `VITE_GOOGLE_MAPS_API_KEY` - Your Google Maps API key

### Important URLs

- **Frontend**: http://localhost:5173 (or :3000)
- **Backend API**: http://localhost:5001
- **API Docs**: http://localhost:5001/api-docs
- **Health Check**: http://localhost:5001/health

### Database Access

```bash
# Connect to database
psql parkmate_db

# View tables
\dt

# View users
SELECT * FROM users;

# View carparks
SELECT COUNT(*) FROM carparks;

# Exit
\q
```

### Useful Commands

```bash
# Backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check code style
npm test             # Run tests

# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code style
npm test             # Run tests

# Database
npm run import-carparks  # Import carpark data (backend)
```

## 👥 Team Development Workflow

### 1. Pick a module to work on
- Authentication (already implemented as example)
- Carpark management
- Favorites
- History
- Settings

### 2. Create a feature branch
```bash
git checkout -b feature/your-module-name
```

### 3. Follow the existing patterns
- Look at `backend/src/modules/auth/` for backend examples
- Look at `frontend/src/features/auth/` for frontend examples

### 4. Run linting and tests
```bash
# Backend
npm run lint
npm test

# Frontend
npm run lint
npm test
```

### 5. Create a pull request
- Push your branch
- Create PR on GitHub
- Request review from team members

## 🆘 Need Help?

- **Backend errors**: Check `backend/logs/` folder
- **Frontend errors**: Check browser console (F12)
- **Database issues**: Check PostgreSQL logs
- **API testing**: Use the Swagger UI at http://localhost:5001/api-docs

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Material-UI Documentation](https://mui.com/)

---

**Happy Coding! 🎉**

If you encounter any issues not covered here, please create a GitHub issue or ask your team lead.
